// Description:
//   A hubot robinpowered integration for getting room occupancy and other data
//   about your office
//
// Configuration:
//   ROBIN_TOKEN
//   ROBIN_ORGANIZATION
//
// Commands:
//   hubot rooms - get all free rooms in the office
//
// Notes:
//   This integration assumes your organization has only one office (location)
//   and less than 100 rooms (spaces) in it
//
// Author:
//   Santiago Suarez Ordoñez <santiycr@gmail.com>

const once = require('lodash.once');
const Robin = require('robin-js-sdk');

const robinToken = process.env.ROBIN_TOKEN;
const robinOrg = process.env.ROBIN_ORGANIZATION;

module.exports = function(robot) {
  let robin = new Robin(robinToken);
  let location = null;

  const getLocations = once(function getLocations() {
    return robin.api.organizations.locations.get(robinOrg).then(function(response) {
      return response.getData();
    });
  });
  robot.respond(/rooms/, function(res) {
    robin = new Robin(robinToken);
    return getLocations().then(locations => {
      return Promise.all(locations.map(l => robin.api.locations.spaces.get(l.id)))
        .then(locations => {
          let final_response = "";
          locations.forEach(location => {
            for (let space of location.getData()) {
              let { name } = space;
              if (!space.current_event) {
                let time_notice = "";
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
      return res.reply(final_response ? final_response : "no rooms available :(");
    }).catch(function(err) {
      console.error('robin err', err)
      throw err;
    });
  });
};

