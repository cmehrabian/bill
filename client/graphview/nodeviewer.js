

Template.nodeviewer.selected = function () {
  var selected_id = Session.get("selected");
  return Nodes.findOne({_id: selected_id}) || Links.findOne({_id: selected_id});
}

Template.nodeviewer.events({
	'click #delete-node': function () {
		Meteor.call("deleteNode", Session.get("selected"));
		Session.set("selected", undefined);
	}

})