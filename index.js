var fs = require('fs');
var path = require('path');

module.exports = function(robot) {
  var scripts_path = path.resolve(__dirname, 'src');
  return [
    robot.loadFile(scripts_path, 'robin.js')
  ];
};
