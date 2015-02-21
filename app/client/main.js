Meteor.subscribe('nodes');
Meteor.subscribe('edges');
Meteor.subscribe("allUserData");

Meteor.startup(function(){
  width = 960;
  height = 500;
})

Template.layout.user = function () {
  return Meteor.user()
}

Template.layout.events({
  'click #logout': function(){
    Meteor.logout();
  }
})

Template.dropper.events({
  'click #drop': function(){
    Meteor.call('dropNodes', Session.get("target_id"));
  }
});

// FIXME: THIS IS NOT SECURE
Template.dropper.isUserAdmin = function(){
  if(Meteor.user() && Meteor.user().emails){
    var adminEmail = Meteor.user().emails[0].address;
    if( adminEmail === "tylsmith@gmail.com"){
      return true;
    } else {
      return false;
      //add some logic for displaying error template.
    }
  }
}

Accounts.ui.config({
  passwordSignupFields: "USERNAME_AND_OPTIONAL_EMAIL"
})

// Trello

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