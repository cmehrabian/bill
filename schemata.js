
var mongoose = require('mongoose')
, Schema = mongoose.Schema;

  var pointSchema = mongoose.Schema({
      username:String,
      value:Number,
      time:Number,
      flavor:String,
      text:String,
      point_id:Number,
      parent:Number,
      children:Array,
      links:Array, 
      original:Boolean,
      propogated:Number,
      root:Number

  })

  var lastidSchema = mongoose.Schema({
    last_point_id: Number
  })

exports.point = mongoose.model('point', pointSchema);
exports.lastid = mongoose.model('lastid', lastidSchema);