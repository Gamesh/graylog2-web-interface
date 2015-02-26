/// <reference path="../../../declarations/jquery/jquery.d.ts" />

'use strict';

import UserNotification = require("../../util/UserNotification");
import URLUtils = require("../../util/URLUtils");

var VisualizationsStore = {
    loadWorldMap(): JQueryPromise<string[]> {
        var url = URLUtils.appPrefixed('/assets/javascripts/geo/world-countries.json');
        var promise = $.getJSON(url);
        promise.fail((jqXHR, textStatus, errorThrown) => {
            UserNotification.error("Loading world map failed with status: " + errorThrown,
                "Could not load world map");
        });
        return promise;
    },
    loadCities(): JQueryPromise<string[]> {
        var url = URLUtils.appPrefixed('/assets/javascripts/geo/world-cities.json');
        var promise = $.getJSON(url);
        promise.fail((jqXHR, textStatus, errorThrown) => {
            UserNotification.warning("Loading cities failed with status: " + errorThrown,
                "Could not load cities");
        });
        return promise;
    },
    loadData(): JQueryPromise<string[]> {
        var url = URLUtils.appPrefixed('/assets/javascripts/geo/locations.json');
        var promise = $.getJSON(url);
        promise.fail((jqXHR, textStatus, errorThrown) => {
            UserNotification.error("Loading location information failed with status: " + errorThrown,
                "Could not load location information");
        });
        return promise;
    }
};

export = VisualizationsStore;