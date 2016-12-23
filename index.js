'use strict'
const EventEmitter = require('events')

class batchup extends EventEmitter {
  constructor(options) {
    super()
    this._cb = options.callback
    this.context = options.context
    this._intervalCycle = options._intervalCycle || 500
    this.curBatch = []
    this.flushed = Promise.accept()

    this.interval = setInterval(() => {
      if(this.curBatch.length === 0) return

      this.flushed = new Promise((resolve, reject) => {
        const p = this._cb.call(this.context || this, this.curBatch)
        this.curBatch = []

        if(!p) return resolve()

        p.then(() => resolve())
        .catch((e) => {
          this.emit('error', 'fail to flush batch, ' + e, e)
          resolve()
        })
      })
    }, this._intervalCycle)
  }

  add(data) {
    this.flushed.then(() => this.curBatch.push(data))
  }

  stop(waitToFlush) {
    return new Promise((resolve, reject) => {
      const t = setInterval(() => {
        if(this.curBatch.length !== 0) return

        this.flushed.then(() => {
          if(this.curBatch.length !== 0) return

          clearInterval(this.interval)
          clearInterval(t)
          resolve()
        })
      }, 100)

      setTimeout(() => clearInterval(t), waitToFlush || 10000)
    })
  }
}


module.exports = batchup
