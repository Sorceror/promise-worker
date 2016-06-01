'use strict';

var messageIds = 0;

class PromiseWorker extends Worker {
  constructor(file) {
    var self = this;
    super(file)
    self._callbacks = {};

    this.addEventListener('message', function onIncomingMessage(e) {
      let [messageId, error, result] = JSON.parse(e.data);

      var callback = self._callbacks[messageId];

      if (!callback) {
        // Ignore - user might have created multiple PromiseWorkers.
        // This message is not for us.
        return;
      }

      delete self._callbacks[messageId];
      callback(error, result);
    }); 
  }
}

PromiseWorker.prototype.postMessage = function (userMessage) {
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