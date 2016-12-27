// Description:
//   A hubot robinpowered integration for getting room occupancy and other data
//   about your office
//
// Configuration:
//   ROBIN_TOKEN
//   ROBIN_ORGANIZATION
//
// Commands:
//   hubot rooms - get all free rooms in all offices/locations
//   hubot rooms <location> - get all free rooms at the giving location
//
// Notes:
//   This integration assumes your organization has less than 100 rooms (spaces) in it
//
// Author:
//   Santiago Suarez Ordoñez <santiycr@gmail.com>
//   Gavin Mogan <gavin@gavinmogan.com>

const once = require('lodash.once');
const Robin = require('robin-js-sdk');
const fuzzy = require('fuzzy');

const robinToken = process.env.ROBIN_TOKEN;
const robinOrg = process.env.ROBIN_ORGANIZATION;

module.exports = function(robot) {
  let robin = new Robin(robinToken);

  const getLocations = once(function getLocations() {
    return robin.api.organizations.locations.get(robinOrg).then(function(response) {
      return response.getData();
    });
  });

  function filter(locations, filter) {
    if (!filter) { return locations; }
    const options = {
      extract: l => l.name
    };
    return fuzzy.filter(filter, locations, options).map(i => i.original).slice(0);
  }

  function handler(res) {
    robin = new Robin(robinToken);
    return getLocations()
      .then(locations => filter(locations, res.match[1]))
      .then(locations => {
        return Promise.all(locations.map(l => robin.api.locations.spaces.get(l.id)))
          .then(locations => {
            let final_response = '';
            locations.forEach(location => {
              for (let space of location.getData()) {
                let { name } = space;
                if (!space.current_event) {
                  let time_notice = '';
                  if (space.next_event) {
                    var next_event_date = new Date(space.next_event.started_at);
                  }
                  let time_diff = next_event_date ? (next_event_date.getTime() - Date.now()) / 1000 : 0;
                  if (time_diff && time_diff < (60 * 60)) { // 1 hour
                    time_notice = ` for ${Math.round(time_diff / 60)} minutes`;
                  }
                  final_response += `\n${name} is free${time_notice}`;
                }
              }
            });
            return final_response;
          });
      }).then(final_response => {
        return res.reply(final_response ? final_response : 'no rooms available :(');
      }).catch(function(err) {
        console.error('robin err', err); // eslint-disable-line no-console
        throw err;
      });
  }

  robot.respond(/rooms$/, handler);
  robot.respond(/rooms (.*)$/, handler);
};

