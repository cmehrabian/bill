
Template.user.user = function () {
	return Meteor.users.findOne({username: Router.current().params._username});
}

Template.user.isViewingOwnPage = function () {
	return Meteor.user() && Meteor.user().username == Router.current().params._username;
}

Template.user.email = function () {
	var emails = Template.user.user().emails;
	if (emails)
		return emails[0].address;
	else
		return "email address not registered!";
}

Template.user.posts = function () {
	return Nodes.find({username: Router.current().params._username},
	 {sort:{timestamp:-1}}
	 );
}