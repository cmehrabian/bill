var requests = require('./requests')

//for debugging/presentation purposes only.  Resets all local information
//(which de facto resets all database entries)
exports.get('/reset', function(req, res){
  points.reset()
  res.send('reset')
});

