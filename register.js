'use strict';

function register(callback) {
  if (typeof callback !== 'function') {
      postOutgoingMessage(messageId, new Error(
        'Please pass a function into register().'));}

  function postOutgoingMessage(messageId, error, result) {
    if (error) {
      /* istanbul ignore else */
      if (typeof console !== 'undefined' && 'error' in console) {
        // This is to make errors easier to debug. I think it's important
        // enough to just leave here without giving the user an option
        // to silence it.
        console.error('Worker caught an error:', error);
      }
      self.postMessage(JSON.stringify([messageId, {
        message: error.message
      }]));
    } else {
      self.postMessage(JSON.stringify([messageId, null, result]));
    }
  }

  function tryCatchFunc(callback, message) {
    try {
      return {res: callback(message)};
    } catch (e) {
      return {err: e};
    }
  }

  function handleIncomingMessage(callback, messageId, message) {

    var result = tryCatchFunc(callback, message);

    if (result.err) {
      postOutgoingMessage(messageId, result.err);
    } else if (!isPromise(result.res)) {
      postOutgoingMessage(messageId, null, result.res);
    } else {
      result.res.then(function (finalResult) {
        postOutgoingMessage(messageId, null, finalResult);
      }, function (finalError) {
        postOutgoingMessage(messageId, finalError);
      });
    }
  }
  
  self.addEventListener('message', e => {
    let [messageId, message] = JSON.parse(e.data);
    handleIncomingMessage(callback, messageId, message);
  });
}

export default { register };