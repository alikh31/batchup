'use strict'
const EventEmitter = require('events')

class batchup extends EventEmitter {
  constructor(options) {
    super()
    this._cb = options.callback
    this.context = options.context || this
    this._intervalCycle = options.intervalCycle || 500
    this.currentBatch = []
    this.flushed = true
    this.stashLimit = options.stashLimit || 10000
    this.overflow = options.overflow ||
      ((data) => {
        this.emit('error', 'stash overflow happened for message: ' + data, data)
        setTimeout(() => this.flushed = true, this._intervalCycle * 10)
      })

    this.interval = setInterval(() => this._worker(), this._intervalCycle)
  }

  _worker() {
    if(!this.flushed || this.currentBatch.length === 0) return

    this.flushed = false
    const p = this._cb.call(this.context, this.currentBatch)
    this.currentBatch = []

    if(!p || typeof p.then !== 'function') return this.flushed = true
    p.then(() => this.flushed = true)
    .catch((e) => {
      this.emit('error', 'fail to flush batch, ' + e, e)
      this.flushed = true
    })
  }

  add(data) {
    if(this.currentBatch.length > this.stashLimit && !this.flushed)
      return this.overflow.call(this.context, data)

    this.currentBatch.push(data)
  }

  stop(waitToFlush) {
    return new Promise((resolve, reject) => {
      const t = setInterval(() => {
        if(this.currentBatch.length !== 0 || !this.flushed)
          return

        clearInterval(this.interval)
        clearInterval(t)
        resolve()
      }, 100)

      setTimeout(() => clearInterval(t), waitToFlush || 10000)
    })
  }
}


module.exports = batchup
