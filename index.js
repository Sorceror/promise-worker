'use strict';

var messageIds = 0;

class PromiseWorker extends Worker {
  constructor(file) {
    this._callbacks = new Map();
    super(file);

    this.addEventListener('message', e => {
      let [messageId, error, result] = JSON.parse(e.data);

      let callback = this._callbacks.get(messageId);
      if (!callback) {
        // Ignore - user might have created multiple PromiseWorkers.
        // This message is not for us.
        return;
      }

      this._callbacks.delete(messageId);
      callback(error, result);
    }); 
  }
  
  postMessage(userMessage) {
    var self = this;
    var messageId = messageIds++;

    var messageToSend = [messageId, userMessage];

    return new MyPromise(function (resolve, reject) {
      self._callbacks[messageId] = function (error, result) {
        if (error) {
          return reject(new Error(error.message));
        }
        resolve(result);
      };
      self._worker.postMessage(JSON.stringify(messageToSend));
    });
    }
}