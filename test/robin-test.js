/* eslint-env mocha */
process.env.EXPRESS_PORT = process.env.PORT = 0;
process.env.ROBIN_TOKEN = 'FAKE FAKE TOKEN';
process.env.ROBIN_ORGANIZATION = 'fake_org';
let chai = require('chai');
let nock = require('nock');
let BotHelper = require('hubot-test-helper');

let { expect } = chai;

function setupNock() {
  nock('https://api.robinpowered.com:443', {'encodedQueryParams':true})
    .get('/v1.0/organizations/fake_org/locations')
    .reply(200, {
      'meta':{
        'status_code':200,'status':'OK','message':'','more_info':{}
      },
      'data':[
        {'id':2117,'account_id':2672,'name':'UK','description':'','address':'1 London Bridge Street, London, United Kingdom','image':'','latitude':51.5051679,'longitude':-0.0873985,'updated_at':'2016-03-04T21:00:57+0000','created_at':'2016-03-04T21:00:57+0000'},
        {'id':2033,'account_id':2672,'name':'Vancouver','description':'','address':'','image':'','latitude':0,'longitude':0,'updated_at':'2016-02-24T21:42:25+0000','created_at':'2016-02-24T21:42:25+0000'},
        {'id':576,'account_id':2672,'name':'HQ','description':'','address':'538 Bryant St, San Francisco, 94107, California, United States','image':'','latitude':37.7807998,'longitude':-122.3969095,'updated_at':'2015-07-20T18:24:07+0000','created_at':'2015-05-26T19:59:38+0000'}
      ],
      'paging':{'page':1,'per_page':10}
    });
  nock('https://api.robinpowered.com:443', {'encodedQueryParams':true})
    .get(/\/v1.0\/locations\/(\d+)\/spaces/)
    .times(3)
    .reply(function(uri) {
      const roomId = uri.match(/\/v1.0\/locations\/(\d+)\/spaces/)[1];
      return [
        200,
        {
          'meta':{'status_code':200,'status':'OK','message':'','more_info':{}},
          'data':[
            {
              'id':roomId*3000,
              'location_id':2117,
              'name':'Room ' + roomId,
              'description':'',
              'image':'https://static.robinpowered.com/reimagine/images/ab5c501eb41e92b579eaad253df17b045800e756.png',
              'discovery_radius':3.5,
              'capacity':null,
              'type':null,
              'is_accessible':false,
              'is_disabled':false,
              'is_dibsed':false,
              'updated_at':'2016-03-04T21:02:17+0000',
              'created_at':'2016-03-04T21:02:17+0000',
              'current_event':null,
              'next_event':null
            }
          ],
          'paging':{'page':1,'per_page':10}
        }
      ];
    });
}

let scriptHelper = new BotHelper('../src/robin.js');
describe('robin', function() {
  let room;
  beforeEach(() => {
    setupNock();
    room = scriptHelper.createRoom();
    nock.disableNetConnect();
  });
  afterEach(() => {
    room.destroy();
    nock.cleanAll();
  });

  describe('help', () => {
    it('lists help', () => {
      expect(room.robot.helpCommands()).to.eql([
        'hubot rooms - get all free rooms in the office'
      ]);
    });
  });

  describe('responds rooms command', function() {
    beforeEach(function(done) {
      room.user.say('santi', '@hubot rooms');
      setTimeout(done, 100);
    });

    it('multiple rooms exist', function() {
      expect(room.messages).to.eql([
        ['santi', '@hubot rooms'],
        ['hubot', '@santi \nRoom 2117 is free\nRoom 2033 is free\nRoom 576 is free']
      ]);
    });
  });
  describe('responds rooms command', function() {
    beforeEach(function(done) {
      room.user.say('santi', '@hubot rooms');
      setTimeout(done, 100);
    });

    it('rooms across all locations is returned', function() {
      expect(room.messages).to.eql([
        ['santi', '@hubot rooms'],
        ['hubot', '@santi \nRoom 2117 is free\nRoom 2033 is free\nRoom 576 is free']
      ]);
    });
  });
  describe('responds to single location', function() {
    beforeEach(function(done) {
      room.user.say('santi', '@hubot rooms couver');
      setTimeout(done, 100);
    });

    it('single room is responded', function() {
      expect(room.messages).to.eql([
        ['santi', '@hubot rooms couver'],
        ['hubot', '@santi \nRoom 2033 is free']
      ]);
    });
  });
});
