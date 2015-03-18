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

// The helper and function are separate so that the function can be called within
// other helpers, but we don't need to redefine the helper every time we want to use
// it.
UI.registerHelper("getTimeString", function (time_in_ms) {
  return getTimeString(time_in_ms);
});

getTimeString = function(time_in_ms){
  var now = Date.now();
  var seconds = Math.floor((now - time_in_ms) / 1000);

  var interval = Math.floor(seconds / 31536000);

  if (interval > 1) {
      return interval + " years ago";
  }
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) {
      return interval + " months ago";
  }
  interval = Math.floor(seconds / 86400);
  if (interval > 1) {
      return interval + " days ago";
  }
  interval = Math.floor(seconds / 3600);
  if (interval > 1) {
      return interval + " hours ago";
  }
  interval = Math.floor(seconds / 60);
  if (interval > 1) {
      return interval + " minutes ago";
  }
  return Math.floor(seconds) + " seconds ago";
}

Accounts.ui.config({
  passwordSignupFields: "USERNAME_AND_OPTIONAL_EMAIL"
});

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