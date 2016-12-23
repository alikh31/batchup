'use strict'

const should = require('should')
const Batchup = require('..')

describe('initial class and', function() {
  let patched
  let msgs
  let count

  beforeEach(function() {
    patched = ''
    msgs = []
    count = 0

    for (let i = 0; i < 200; i++) {
      msgs.push('iteration ' + count)
      count += 1
    }
  })

  it('batch up 1000 simple messages', function(done) {
    const batchup = new Batchup({
      callback: (batched) => {
        patched += batched.reduce((a, b) => a += b, '')
      },
      intervalCycle: 10,
    })

    const Original = msgs.reduce((a, b) => a += b, '')

    msgs.reduce((cur, next) =>
      cur.then(() =>
        new Promise((resolve, reject) => setTimeout(() => {
          batchup.add(next)
          resolve()
        }, 4))
      )
    , Promise.resolve())
    .then(() => batchup.stop())
    .then(() => {
      Original.should.eql(patched)
      done()
    })
  })

  it('through error on callback', function(done) {
    let bool = true
    const batchup = new Batchup({
      callback: (batch) => {
        return new Promise((accept, reject) => {
          if(bool) {
            bool = false
            return reject('some reason')
          }
          return accept()
        })
      },
    })
    let error
    batchup.on('error', (e) => error = e)

    msgs.reduce((cur, next) =>
      cur.then(() =>
        new Promise((resolve, reject) => setTimeout(() => {
          batchup.add(next)
          resolve()
        }, 4))
      )
    , Promise.resolve())
    .then(() => batchup.stop())
    .then(() => {
      should.exist(error)
      done()
    })
  })

  it('call back takes long', function(done) {
    this.timeout(4000)
    const batchup = new Batchup({
      callback: (batch) => {
        return new Promise((accept, reject) => {
          patched += batch.reduce((a, b) => a += b, '')
          setTimeout(() => accept(), 500)
        })
      },
    })

    batchup.on('error', (e)=> console.log(e))

    const Original = msgs.reduce((a, b) => a += b, '')

    msgs.reduce((cur, next) =>
      cur.then(() =>
        new Promise((resolve, reject) => setTimeout(() => {
          batchup.add(next)
          resolve()
        }, 10))
      )
    , Promise.resolve())
    .then(() => batchup.stop())
    .then(() => {
      Original.should.eql(patched)
      done()
    })
  })
})


describe('load test', function() {
  let patched
  let msgs
  let count

  beforeEach(function() {
    patched = ''
    msgs = []
    count = 0

    for (let i = 0; i < 200000; i++) {
      msgs.push('iteration ' + count)
      count += 1
    }
  })
})
