
Template.user.user = function () {
	return Meteor.users.findOne({username: Router.current().params._username});
}

Template.user.posts = function () {
	return Nodes.find({username: Router.current().params._username},
	 {sort:{timestamp:-1}}
	 );
}