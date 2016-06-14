'use strict';

/**
 * Calls the function passed whenever a message is posted to the web worker. 
 * @param {function} callback - handles the message
 * @listens Worker~message 
 */
export default function register(callback) {
	self.addEventListener('message', e => {
		let [messageId, message] = JSON.parse(e.data);
		
		if (typeof callback !== 'function') {
			postOutgoingMessage(messageId, 'Please pass a function into register().');
		}
		
		Promise.resolve(callback(message))
			.catch(error => {
				self.postMessage(JSON.stringify([messageId, error.message]))
			}).then(finalResult => {
				self.postMessage(JSON.stringify([messageId, null, finalResult]))
			}).catch(postError => {
				self.postMessage(JSON.stringify([messageId, postError.message]))
			})
	});
}