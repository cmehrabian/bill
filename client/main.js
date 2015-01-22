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

Router.route('/', function () {
  this.render('topics');
});

Router.route('/view/:_id', function () {
  var target = Nodes.findOne({_id: this.params._id}) || Links.findOne({_id: this.params._id});
  if(target)
    this.render('graphview', {target_id: target});
  else
  	this.render('notfound');
});

Router.route("new", function () {
	this.render("newtopic");
});

Router.route("what", function () {
	this.render("what");
});

Router.route("how", function () { 
	this.render("how");
});

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