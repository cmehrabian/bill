Template.topics.correct = function (){
	return Nodes.find({$and: [{$where: "this.root_id == this._id"}, {$where:"this.value > 0"}]});
}

Template.topics.incorrect = function(){
	return Nodes.find({$and: [{$where: "this.root_id == this._id"}, {$where:"this.value <= 0"}]});
}

Template.topics.helpers({
  formatBody: function(body){
    if (body.length < 200)
      return body;
    return body.substring(0, 197) + "...";
  }
})
