/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const Store = require('./helpers/store')
const CRDT = require('../')
const gCounter = require('./helpers/g-counter-type')

describe('CRDT', () => {
  let myCRDT
  let crdt
  let instance

  before(() => CRDT.define('g-counter-compose', gCounter))

  before(() => {
    myCRDT = CRDT.defaults({
      store: (id) => new Store(id),
      authenticate: (entry, parents) => 'authentication for ' + entry
    })
  })

  it('can compose type from an object with one CRDT', () => {
    crdt = myCRDT.compose({
      a: 'g-counter-compose',
      b: 'g-counter-compose',
      c: {
        d: 'g-counter-compose'
      }
    })
  })

  it('can create instance from type', () => {
    instance = crdt.create('composed-id')
  })

  it('can mutate instance from root', (done) => {
    instance.once('change', () => {
      expect(instance.value()).to.deep.equal({
        a: 0,
        b: 1,
        c: {
          d: 0
        }
      })
      done()
    })

    instance.b.increment()
  })

  it('can mutate instance from deep', (done) => {
    instance.once('change', () => {
      expect(instance.value()).to.deep.equal({
        a: 0,
        b: 1,
        c: {
          d: 1
        }
      })
      done()
    })

    instance.c.d.increment()
  })
})
