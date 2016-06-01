'use strict';

function register(callback) {
  if (typeof callback !== 'function') {
      postOutgoingMessage(messageId, new Error(
        'Please pass a function into register().'));}

  function postOutgoingMessage(messageId, error, result) {
    if (error && self.console && console.error) {
      // This is to make errors easier to debug. I think it's important
      // enough to just leave here without giving the user an option
      // to silence it.
      console.error('Worker caught an error:', error);
    } 
    self.postMessage(JSON.stringify([messageId, error, result]))
  }

  function handleIncomingMessage(callback, messageId, message) {
    Promise.resolve().then(() => callback(message))
      .catch(error => {
        postOutgoingMessage(messageId, error);
      })
      .then(finalResult => {
        postOutgoingMessage(messageId, null, finalResult);
      }).catch(finalError => {
        postOutgoingMessage(messageId, finalError);
      })
  }
  
  self.addEventListener('message', e => {
    let [messageId, message] = JSON.parse(e.data);
    handleIncomingMessage(callback, messageId, message);
  });
}

export default { register };