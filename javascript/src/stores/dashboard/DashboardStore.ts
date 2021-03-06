/// <reference path='../../../node_modules/immutable/dist/immutable.d.ts'/>
/// <reference path='../../routing/jsRoutes.d.ts' />

import Immutable = require('immutable');
import UserNotification = require("util/UserNotification");
import jsRoutes = require('routing/jsRoutes');
import URLUtils = require("../../util/URLUtils");
const fetch = require('logic/rest/FetchProvider').default;

interface Dashboard {
  id: string;
  description: string;
  title: string;
  content_pack: string;
}

class DashboardStore {
  private _writableDashboards: Immutable.Map<string, Dashboard>;
  private _dashboards: Immutable.List<Dashboard>;
  private _onWritableDashboardsChanged: {(dashboards: Immutable.Map<string, Dashboard>): void; }[] = [];
  private _onDashboardsChanged: {(dashboards: Immutable.List<Dashboard>): void; }[] = [];

  constructor() {
    this._dashboards = Immutable.List<Dashboard>();
    this._writableDashboards = Immutable.Map<string, Dashboard>();
  }

  get dashboards(): Immutable.List<Dashboard> {
    return this._dashboards;
  }

  set dashboards(newDashboards: Immutable.List<Dashboard>) {
    this._dashboards = newDashboards;
    this._emitDashboardsChange();
  }

  _emitDashboardsChange() {
    this._onDashboardsChanged.forEach((callback) => callback(this.dashboards));
  }

  get writableDashboards(): Immutable.Map<string, Dashboard> {
    return this._writableDashboards;
  }

  set writableDashboards(newDashboards: Immutable.Map<string, Dashboard>) {
    this._writableDashboards = newDashboards;
    this._emitWritableDashboardsChange();
  }

  _emitWritableDashboardsChange() {
    this._onWritableDashboardsChanged.forEach((callback) => callback(this.writableDashboards));
  }

  addOnWritableDashboardsChangedCallback(dashboardChangeCallback: (dashboards: Immutable.Map<string, Dashboard>) => void) {
    this._onWritableDashboardsChanged.push(dashboardChangeCallback);
  }

  addOnDashboardsChangedCallback(dashboardChangeCallback: (dashboards: Immutable.List<Dashboard>) => void) {
    this._onDashboardsChanged.push(dashboardChangeCallback);
  }

  updateWritableDashboards() {
    const promise = this.getWritableDashboardList();
    promise.done((dashboards) => this.writableDashboards = Immutable.Map<string, Dashboard>(dashboards));
  }

  updateDashboards() {
    this.listDashboards()
      .then((dashboardList) => {
        this.dashboards = dashboardList;

        return dashboardList;
      });
  }

  listDashboards(): JQueryPromise<Immutable.List<Dashboard>> {
    const url = URLUtils.qualifyUrl(jsRoutes.controllers.api.DashboardsApiController.index().url);
    const promise = fetch('GET', url)
      .then((response) => {
        const dashboardList = Immutable.List<Dashboard>(response.dashboards);

        return dashboardList;
      }, (jqXHR, textStatus, errorThrown) => {
        if (jqXHR.status !== 404) {
          UserNotification.error("Loading dashboard list failed with status: " + errorThrown,
            "Could not load dashboards");
        }
      });
    return promise;
  }

  getWritableDashboardList(): JQueryPromise<string[]> {
    const url = URLUtils.qualifyUrl(jsRoutes.controllers.api.DashboardsApiController.listWritable().url);
    const promise = fetch('GET', url);
    promise.catch((jqXHR, textStatus, errorThrown) => {
      if (jqXHR.status !== 404) {
        UserNotification.error("Loading your dashboard list failed with status: " + errorThrown,
          "Could not load your dashboard list");
      }
    });
    return promise;
  }

  get(id : string): JQueryPromise<Dashboard> {
    const url = URLUtils.qualifyUrl(jsRoutes.controllers.api.DashboardsApiController.get(id).url);
    const promise = fetch('GET', url);

    promise.catch((jqXHR, textStatus, errorThrown) => {
      if (jqXHR.status !== 404) {
        UserNotification.error("Loading your dashboard failed with status: " + errorThrown,
          "Could not load your dashboard");
      }
    });

    return promise;
  }

  createDashboard(title: string, description: string): JQueryPromise<string[]> {
    const url = URLUtils.qualifyUrl(jsRoutes.controllers.api.DashboardsApiController.create().url);
    const promise = fetch('POST', url, {title: title, description: description})

    promise.then(() => {
      UserNotification.success("Dashboard successfully created");

      if (this._onDashboardsChanged.length > 0) {
        this.updateDashboards();
      } else if (this._onWritableDashboardsChanged.length > 0) {
        this.updateWritableDashboards();
      }
    }, (jqXHR, textStatus, errorThrown) => {
      UserNotification.error("Creating dashboard \"" + title + "\" failed with status: " + errorThrown,
        "Could not create dashboard");
    });

    return promise;
  }

  saveDashboard(dashboard: Dashboard): JQueryPromise<string[]> {
    const url = URLUtils.qualifyUrl(jsRoutes.controllers.api.DashboardsApiController.update(dashboard.id).url);
    const promise = fetch('PUT', url, {title: dashboard.title, description: dashboard.description});

    promise.then(() => {
      UserNotification.success("Dashboard successfully updated");

      if (this._onDashboardsChanged.length > 0) {
        this.updateDashboards();
      } else if (this._onWritableDashboardsChanged.length > 0) {
        this.updateWritableDashboards();
      }
    }, (jqXHR, textStatus, errorThrown) => {
      UserNotification.error("Saving dashboard \"" + dashboard.title + "\" failed with status: " + errorThrown,
        "Could not save dashboard");
    });

    return promise;
  }

  remove(dashboard: Dashboard): JQueryPromise<string[]> {
    const url = URLUtils.qualifyUrl(jsRoutes.controllers.api.DashboardsApiController.delete(dashboard.id).url);
    const promise = fetch('DELETE', url)

    promise.then(() => {
      UserNotification.success("Dashboard successfully deleted");

      if (this._onDashboardsChanged.length > 0) {
        this.updateDashboards();
      } else if (this._onWritableDashboardsChanged.length > 0) {
        this.updateWritableDashboards();
      }
    }, (jqXHR, textStatus, errorThrown) => {
      UserNotification.error("Deleting dashboard \"" + dashboard.title + "\" failed with status: " + errorThrown,
        "Could not delete dashboard");
    });

    return promise;
  }
}

const dashboardStore = new DashboardStore();
export = dashboardStore;
