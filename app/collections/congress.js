Congress = new Mongo.Collection("congress");

Congress.allow({
  insert: function(){
    return true;
  },
  update: function(){
    return true;
  },
  remove: function(){
    return true;
  }
});
