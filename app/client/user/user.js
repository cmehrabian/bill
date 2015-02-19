
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
	var posts = Nodes.find({username: Router.current().params._username}, {sort:{timestamp:-1}}).fetch();
	return _.map(posts, function(p){
		p.ftime = (new Date(p.timestamp)).toLocaleString();
		p.froot = Nodes.findOne({_id:p.root_id});
		return p;
	});
}

Template.user.notifications = function () {
	if(!Template.user.isViewingOwnPage())
		return;

	var notifications = Meteor.user().notifications;
	var temp = _.map(notifications, function(n){
		var node = Nodes.findOne(n.modifier_id);
		node.modified = _.map(n.modified, function(nm){
			return {
				node: Nodes.findOne({_id: nm._id}),
				value: nm.value
			}
		});
		return node;
	});
	return temp;
}