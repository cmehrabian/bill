Template.topics.topic = function (){
  return Nodes.find({$where: "this.root_id == this._id"});
}

Template.topics.events({
  'click .graphlink': function(){
    Session.set("target_id", this._id)
  }
})
