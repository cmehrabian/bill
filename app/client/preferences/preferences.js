
Template.preferences.created = function() {
	this.editing_email = new ReactiveVar;
	this.editing_email.set(false);
}

Template.preferences.helpers({
	email: function() {
		var emails;
		if(Meteor.user())
			emails = Meteor.user().emails;

		if (emails)
			return emails[0].address;
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
	'valid.fndtn.abide': function () {
		var email = document.getElementById("new-email").value;
		var user = Meteor.user();
		if (user.emails)
			emails[0].address = email;
		else{
			Meteor.users.update({username:user.username}, {$addToSet:{'emails':{
				address:email,
				verified:false
			}}});
			console.log("done!");
		}
	}

})