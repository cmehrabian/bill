

var points = require('/.points');


//for debugging/presentation purposes only.  Resets all local information
//(which de facto resets all database entries)
module.exports.get('/reset', function(req, res){
  points.reset()
  res.send('reset')
});

exports.get('/requestTopics', function(req, res){

})

