import UserNotification = require('util/UserNotification');
import URLUtils = require('util/URLUtils');
import jsRoutes = require('routing/jsRoutes');
const fetch = require('logic/rest/FetchProvider').default;

interface Stream {
  id: string;
  title: string;
  description: string;
  creatorUser: string;
  createdAt: number;
}

interface TestMatchResponse {
  matches: boolean;
  rules: any;
}

interface Callback {
  (): void;
}

interface StreamSummaryResponse {
  total: number;
  streams: Array<Stream>;
}

class StreamsStore {
  private callbacks: Array<Callback> = [];

  listStreams() {
    const url = "/streams";
    const promise = fetch('GET', URLUtils.qualifyUrl(url))
        .then((result: StreamSummaryResponse) => result.streams)
        .catch((errorThrown) => {
          UserNotification.error("Loading streams failed with status: " + errorThrown,
              "Could not load streams");
        });
    return promise;
  }
  load(callback: ((streams: Array<Stream>) => void)) {
    this.listStreams().then(streams => {
      callback(streams);
    });
  }
  get(streamId: string, callback: ((stream: Stream) => void)) {
    const failCallback = (jqXHR, textStatus, errorThrown) => {
      UserNotification.error("Loading Stream failed with status: " + errorThrown,
        "Could not retrieve Stream");
    };

    const url = jsRoutes.controllers.api.StreamsApiController.get(streamId).url;
    fetch('GET', URLUtils.qualifyUrl(url)).then(callback, failCallback);
  }
  remove(streamId: string, callback: (() => void)) {
    const failCallback = (jqXHR, textStatus, errorThrown) => {
      UserNotification.error("Removing Stream failed with status: " + errorThrown,
        "Could not remove Stream");
    };

    const url = URLUtils.qualifyUrl(jsRoutes.controllers.api.StreamsApiController.delete(streamId).url);
    fetch('DELETE', url).then(callback, failCallback).then(this._emitChange.bind(this));
  }
  pause(streamId: string, callback: (() => void)) {
    const failCallback = (jqXHR, textStatus, errorThrown) => {
      UserNotification.error("Pausing Stream failed with status: " + errorThrown,
        "Could not pause Stream");
    };

    const url = URLUtils.qualifyUrl(jsRoutes.controllers.api.StreamsApiController.pause(streamId).url);
    fetch('POST', url).then(callback, failCallback).then(this._emitChange.bind(this));
  }
  resume(streamId: string, callback: (() => void)) {
    const failCallback = (jqXHR, textStatus, errorThrown) => {
      UserNotification.error("Resuming Stream failed with status: " + errorThrown,
        "Could not resume Stream");
    };

    const url = URLUtils.qualifyUrl(jsRoutes.controllers.api.StreamsApiController.resume(streamId).url);
    fetch('POST', url)
      .then(callback, failCallback).then(this._emitChange.bind(this));
  }
  save(stream: any, callback: ((streamId: string) => void)) {
    const failCallback = (jqXHR, textStatus, errorThrown) => {
      UserNotification.error("Saving Stream failed with status: " + errorThrown,
        "Could not save Stream");
    };

    const url = URLUtils.qualifyUrl(jsRoutes.controllers.api.StreamsApiController.create().url);
    fetch('POST', url, stream)
      .then(callback, failCallback).then(this._emitChange.bind(this));
  }
  update(streamId: string, data: any, callback: (() => void)) {
    const failCallback = (jqXHR, textStatus, errorThrown) => {
      UserNotification.error("Updating Stream failed with status: " + errorThrown,
        "Could not update Stream");
    };

    const url = URLUtils.qualifyUrl(jsRoutes.controllers.api.StreamsApiController.update(streamId).url);
    fetch('PUT', url, data)
      .then(callback, failCallback).then(this._emitChange.bind(this));
  }
  cloneStream(streamId: string, data: any, callback: (() => void)) {
    const failCallback = (jqXHR, textStatus, errorThrown) => {
      UserNotification.error("Cloning Stream failed with status: " + errorThrown,
        "Could not clone Stream");
    };

    const url = URLUtils.qualifyUrl(jsRoutes.controllers.api.StreamsApiController.cloneStream(streamId).url);
    fetch('POST', url, data)
      .then(callback, failCallback).then(this._emitChange.bind(this));
  }
  removeOutput(streamId: string, outputId: string, callback: (jqXHR, textStatus, errorThrown) => void) {
    const url = URLUtils.qualifyUrl(jsRoutes.controllers.api.StreamOutputsApiController.delete(streamId, outputId).url);

    fetch('DELETE', url).then(callback, (jqXHR, textStatus, errorThrown) => {
      UserNotification.error("Removing output from stream failed with status: " + errorThrown,
        "Could not remove output from stream");
    }).then(this._emitChange.bind(this));
  }
  addOutput(streamId: string, outputId: string, callback: (jqXHR, textStatus, errorThrown) => void) {
    const url = URLUtils.qualifyUrl(jsRoutes.controllers.api.StreamOutputsApiController.add(streamId, outputId).url);
    fetch('POST', url, {outputs: [outputId]}).then(callback, (jqXHR, textStatus, errorThrown) => {
      UserNotification.error("Adding output to stream failed with status: " + errorThrown,
        "Could not add output to stream");
    }).then(this._emitChange.bind(this));
  }
  testMatch(streamId: string, message: any, callback: (response: TestMatchResponse) => void) {
    const config = {
      url: jsRoutes.controllers.api.StreamsApiController.testMatch(streamId).url,
      type: 'POST',
      contentType: "application/json",
      data: JSON.stringify(message),
      error: (jqXHR, textStatus, errorThrown) => {
        UserNotification.error("Testing stream rules of stream failed with status: " + errorThrown,
          "Could not test stream rules of stream");
      },
      success: callback
    };
    $.ajax(config);
  }
  onChange(callback: Callback) {
    this.callbacks.push(callback);
  }
  _emitChange() {
    this.callbacks.forEach((callback) => callback());
  }
}

const streamsStore = new StreamsStore();
export = streamsStore;

