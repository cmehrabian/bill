Meteor.subscribe('nodes');
Meteor.subscribe('edges');

Meteor.startup(function(){
  width = 960;
  height = 500;
})

Template.dropper.events({
  'click #drop': function(){
    Meteor.call('dropNodes', Session.get("target_id"));
  }
});

Router.route("", {template:"topics"});
Router.route("view", {template:"graphview"});
Router.route("new", {template:"newtopic"});
Router.route("what", {template:"what"});
Router.route("how", {template:"how"});

// If target is node:
// 	if root is self:
// 		find all nodes and edges with root as target root 
// 	else if root is not self
// 		find all nodes and edges with root as target root

// If target is edge:
// 	find all nodes and edges with root as target

// Cleanup: selected to selected_id
// In general, specify xxx_id with things that are IDs
// make edge/link stuff consistent
// use consistent "box" name scheme