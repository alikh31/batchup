'use strict'

require('should')
const Batchup = require('..')

describe('initial class and', function() {
  it('batch up 1000 simple messages', function(done) {
    const batchup = new Batchup({
      callback: console.log,
      context: this
    })

    const msgs = []
    let count = 0

    for (let i = 0; i < 100; i++) {
      msgs.push('iteration ' + count)
      count += 1
    }

    msgs.reduce((cur, next) =>
      cur.then(() =>
        new Promise((resolve, reject) => setTimeout(() => {
          batchup.add(next)
          resolve()
        }, 10))
      )
    , Promise.resolve())
    .then(() => batchup.stop())
    .then(() => done())
  })

  it('through error on callback', function(done) {
    let bool = true
    const batchup = new Batchup({
      callback: (batch) => {
        return new Promise((accept, reject) => {
          if(bool) {
            bool = false
            return reject('asd')
          }
          console.log(batchup.unPatch(batch))
          return accept()
        })
      },
      context: this
    })

    batchup.on('error', (e)=> console.log(e))

    const msgs = []
    let count = 0

    for (let i = 0; i < 15; i++) {
      msgs.push('iteration ' + count)
      count += 1
    }

    msgs.reduce((cur, next) =>
      cur.then(() =>
        new Promise((resolve, reject) => setTimeout(() => {
          batchup.add(next)
          resolve()
        }, 50))
      )
    , Promise.resolve())
    .then(() => batchup.stop())
    .then(() => done())
  })

  it('call back takes long', function(done) {
    this.timeout(10000);
    let bool = true
    const batchup = new Batchup({
      callback: (batch) => {
        return new Promise((accept, reject) => {
          console.log(batch)
          console.log(batchup.unPatch(batch))
          setTimeout(() => accept(), 2000)
        })
      },
      context: this
    })

    batchup.on('error', (e)=> console.log(e))

    const msgs = []
    let count = 0

    for (let i = 0; i < 100; i++) {
      msgs.push('iteration ' + count)
      count += 1
    }

    msgs.reduce((cur, next) =>
      cur.then(() =>
        new Promise((resolve, reject) => setTimeout(() => {
          batchup.add(next)
          resolve()
        }, 50))
      )
    , Promise.resolve())
    .then(() => batchup.stop())
    .then(() => done())
  })
})
