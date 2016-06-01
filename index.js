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
    let messageId = messageIds++;
    return new Promise((resolve, reject) => {
      this._callbacks.set(messageId, (error, result) => {
        if (error) return reject(new Error(error));
        resolve(result);
      })
      super.postMessage(JSON.stringify([messageId, userMessage]));
    });
  }
}