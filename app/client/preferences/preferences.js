
Template.preferences.created = function() {
	this.editing_email = new ReactiveVar;
	this.editing_email.set(false);
}

Template.preferences.rendered = function(){
	var user = Meteor.user();
	if(!user)
		return;

	// Unfortunately, this doesn't work, which seems like a problem with Meteor.
	document.getElementById("email-notifications").checked = user.preferences.emailNotifications;
	document.getElementById("mailing-list").checked = user.preferences.mailingList;
}

Template.preferences.helpers({
	email: function() {
		var email;
		if(Meteor.user())
			email = Meteor.user().email;

		if (email)
			return email.address;
		else
			return "email address not registered!";
	},
	isEditingEmail: function () {
		return Template.instance().editing_email.get();
	}
})

Template.preferences.events({
	'click #edit-email': function () {
		Template.instance().editing_email.set(!Template.instance().editing_email.get());
	},
	'submit #change-email': function () {
		var email = document.getElementById("new-email").value;
		Meteor.call("editEmail", email);
	},
	'change #email-notifications': function (event){
		Meteor.call("editPreferences", {emailNotifications:event.target.checked});
	},
	'change #mailing-list': function (event){
		Meteor.call("editPreferences", {mailingList:event.target.checked});
	}
})