promise-worker
====

Small and performant API for communicating with Web Workers using Promises. 

This fork simplfies the code a little by using ES6 (arrow functions, destructing), and also allows you to pass a url string instead of a worker if desired. It also assumes that Promise and Worker are already present.

Usage
---

Inside your main bundle:

```js
// main.js
import PromiseWorker from 'promise-worker';
let promiseWorker = new PromiseWorker('worker.js');

promiseWorker.postMessage('ping').then(response => {
  // handle response
}).catch(error => {
  // handle error
});
```

Inside your `worker.js` bundle:

```js
// worker.js
import {register} from 'promise-worker';
//OR import register from 'promise-worker/register';

register(message => {
  return 'pong';
});
```

You can also choose to pass in an existing worker instead

```js
// main.js
import PromiseWorker from 'promise-worker';
let worker = new Worker('worker.js');
let promiseWorker = new PromiseWorker(worker);
```

Note that you `import` two separate APIs, so the library is split
between the `worker.js` and main file. This keeps the total bundle size smaller.

### Message format

The message you send can be any object, array, string, number, etc.:

```js
// main.js
promiseWorker.postMessage({
  hello: 'world',
  answer: 42,
  "this is fun": true
}).then(/* ... */);
```

```js
// worker.js
register(message => {
  console.log(message); // { hello: 'world', answer: 42, 'this is fun': true }
});
```
 
Note that the message will be `JSON.stringify`d, so you 
can't send functions, `Date`s, custom classes, etc.

### Promises

Inside of the worker, the registered handler can return either a Promise or a normal value:

```js
// worker.js
register(() => {
  return Promise.resolve().then(() => 'much async, very promise'});
});
```

```js
// main.js
promiseWorker.postMessage(null).then(message => {
  console.log(message): // 'much async, very promise'
});
```

Ultimately, the value that is sent from the worker to the main thread is also
`stringify`d, so the same format rules apply.

### Error handling

Any thrown errors or asynchronous rejections from the worker will
be propagated to the main thread as a rejected Promise. For instance:

```js
// worker.js
register(message => {
  throw new Error('naughty!');
});
```

```js
// main.js
promiseWorker.postMessage('whoops').catch(err => {
  console.log(err); // 'naughty!'
});
```

Note that stacktraces cannot be sent from the worker to the main thread, so you
will have to debug those errors yourself. 

### Multi-type messages

If you need to send messages of multiple types to the worker, just add
some type information to the message you send:

```js
// main.js
promiseWorker.postMessage({
  type: 'en'
}).then(/* ... */);

promiseWorker.postMessage({
  type: 'fr'
}).then(/* ... */);
```

```js
// worker.js
register(message => {
  if (message.type === 'en') {
    return 'Hello!';
  } else if (message.type === 'fr') {
    return 'Bonjour!';
  }
});
```

API
---

### Main bundle

#### `new PromiseWorker(url)`

Create a new `PromiseWorker`, using the given URL or Worker.

#### `PromiseWorker.postMessage(message)`

Send a message to the worker and return a Promise.

* `message` - object - required
  * The message to send.
* returns a Promise

### Worker bundle

Register a message handler inside of the worker. Your handler consumes a message
and returns a Promise or value.

#### `register(function)`

* `function`
  * Takes a message, returns a Promise or a value.


Testing the library
---

First:

    npm install

Then to test in Node (using an XHR/PseudoWorker shim):

    npm test

Or to test manually in your browser of choice:

    npm run test-local

Or to test in a browser using SauceLabs:

    npm run test-browser

Or to test in PhantomJS:

    npm run test-phantom

Or to test with coverage reports:

    npm run coverage
