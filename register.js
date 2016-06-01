'use strict';

/**
 * Calls the function passed whenever a message is posted to 
 * the web worker. 
 * @param {function} callback - handles the message
 * @listens Worker~message 
 */
function register(callback) {
	function postOutgoingMessage(messageId, error, result) {
		if (error && self.console && console.error) {
			// This is to make errors easier to debug. I think it's important
			// enough to just leave here without giving the user an option
			// to silence it.
			console.error('Worker caught an error:', error);
		}
		self.postMessage(JSON.stringify([messageId, error, result]))
	}

	self.addEventListener('message', e => {
		let [messageId, message] = JSON.parse(e.data);
		
		if (typeof callback !== 'function') {
			postOutgoingMessage(messageId, 'Please pass a function into register().');
		}
		
		Promise.resolve().then(() => callback(message))
			.catch(error => {
				postOutgoingMessage(messageId, error.message);
			})
			.then(finalResult => {
				postOutgoingMessage(messageId, null, finalResult);
			}).catch(finalError => {
				postOutgoingMessage(messageId, finalError.message);
			})
	});
}

export default { register };