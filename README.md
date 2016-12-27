# Batchup

Batching for node.js.

## Install

`npm install --save batchup`

## Simple usage

For using Batchup you need to require it and create an instance of the library, you can pass set of options which will be explained later in this document but for now you only need to provide a call back function that receives the patched data as an array.

Then the next thing to do is to add your data (can be object variable or what ever) to batchup instance and wait for then to get batched together.

``` javascript
var Batchup = require('batchup')

var options = {
  callback: function(batchedArray) {
    console.log(batchedArray)
    // batchedArray is and array of string 'new data' with length of 1000
  }
}

var batchup = new Batchup(options)

for(var i = 0; i < 1000; i++)
  batchup.add('new data')
```


## Advance usage

Batchup is using an interval to batch the input data together, to use it better it's better to have all the options explained:


### options

- callback: the call back function that will handle the batched data. callback function can return a **promise** that will tell the batcher to wait and not send any more batch until the promise is ether accepted or rejected.
- context: context in which the call back should be called by default its the batchup context itself.
- intervalCycle: interval cycle in millisecond, specifies how often the data needs to be patched. default to 500 millisecond
- stashLimit: the maximum number of data needs to be stored in case the callback's returned promise is **not getting resolved**.
- overflow: function that will be called in case the stash limit has exceed the maximum level and the provided callback function has not responded. by default will emit an error with the data that has overflowed and will continue sending batched to callback function after ten time of interval cycle time to avoid being locked by dead promises. **note that the data meanwhile added to batchup will discarded if not handled manually**


### stoping the cycle

You can stop the batching cycle by calling `stop` function. in case there is a pending batching this function will 10 second by default to stop the interval but you can specify this value by the input of the function: `batchup.stop(5000) // wait to finish for 5 second`
