'use strict';

var messageIds = 0; //incrementor for IDs

/**
 * A Web Worker that returns a promise when calling postMessage.
 * Additionally stringifies messages for performance
 */
export default class PromiseWorker {
  /**
   * @param {DOMString|Worker} file - url to worker script
   */
  constructor(file) {
    if (file instanceof Worker) {
      this._worker = file;
    } else {
      this._worker = new Worker(file);
    }
    
    this._callbacks = new Map();

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
  
  /**
   * Stringifies and sends a given message, returning a promise that
   * resolves when the worker finishes.
   * @param {Object} userMessage - object to deliver to the worker.
   * @returns {Promise<Object>}
   */
  postMessage(userMessage) {
    let messageId = messageIds++;
    return new Promise((resolve, reject) => {
      this._callbacks.set(messageId, (error, result) => {
        if (error) return reject(new Error(error));
        resolve(result);
      })
      this._worker.postMessage(JSON.stringify([messageId, userMessage]));
    });
  }
}