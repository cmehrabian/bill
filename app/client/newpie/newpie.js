Template.newpie.helpers({
  isLoggedIn: function() {
    return !!Meteor.user();
  },
  loggedInUsername: function() {
    return Meteor.user().username;
  },
  userList: function () {
    return Meteor.users.find().fetch();
  }
});
