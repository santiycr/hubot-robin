# Description
#   A hubot robinpowered integration for getting room occupancy and other data
#   about your office
#
# Configuration:
#   ROBIN_TOKEN
#   ROBIN_ORGANIZATION
#
# Commands:
#   hubot rooms - get all free rooms in the office
#
# Notes:
#   This integration assumes your organization has only one office (location)
#   and less than 100 rooms (spaces) in it
#
# Author:
#   Santiago Suarez Ordoñez <santiycr@gmail.com>

Robin = require('robin-js-sdk')

robinToken = process.env.ROBIN_TOKEN
robinOrg = process.env.ROBIN_ORGANIZATION

module.exports = (robot) ->
  robin = new Robin(robinToken)
  location = null
  robin.api.organizations.locations.get('saucelabs').then( (response) ->
    resp = response.getData()
    location = resp[0].id
  ).then( () ->
    robot.respond /rooms/, (res) ->
      robin = new Robin(robinToken)
      robin.api.locations.spaces.get(location, null, {per_page: 100}).then( (response) ->
        for space in response.getData()
          name = space.name
          if not space.current_event
            time_notice = ""
            if space.next_event
              next_event_date = new Date(space.next_event.started_at)
            time_diff = if next_event_date then (next_event_date.getTime() - Date.now()) / 1000 else 0
            if time_diff and time_diff < (60 * 60) # 1 hour
              time_notice = " for #{Math.round(time_diff / 60)} minutes"
            res.reply "#{name} is free#{time_notice}"
      )
  )

