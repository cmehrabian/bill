
Template.topics.helpers({
  formatBody: function(body){
    if (body.length < 200)
      return body;
    return body.substring(0, 197) + "...";
  },
  topicList: function(){
    return Nodes.find({$where:"this.root_id == this._id"}, {sort:{timestamp:-1}});
  },
  lastPost: function(root_id){
    return getTimeString(Nodes.findOne({root_id:root_id}, {sort:{timestamp:-1}}).timestamp);
  }
});
