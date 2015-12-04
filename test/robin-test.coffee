chai = require 'chai'
sinon = require 'sinon'
chai.use require 'sinon-chai'
bot_helper = require 'hubot-test-helper'
robin = new bot_helper('../src/robin.coffee')

expect = chai.expect

describe 'robin', ->
  beforeEach ->
    @robot =
      respond: sinon.spy()
      hear: sinon.spy()
    @room = robin.createRoom()

    require('../src/robin')(@robot)

  afterEach ->
    @room.destroy()

  it 'registers a respond listener', ->
    expect(@robot.respond).to.have.been.calledWith(/rooms/)

  it 'responds to help and includes rooms command', (done) ->
    @room.user.say 'santi', '@hubot rooms'
    r = @room
    setTimeout(->
      console.log r.messages
      expect(r.messages[1][1]).to.include "free"
      done()
    , 1500)
