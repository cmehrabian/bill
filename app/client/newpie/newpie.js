Template.newpie.helpers({
  isLoggedIn: function() {
    console.log("test")
    return !!Meteor.user();
  },
  loggedInUsername: function() {
    return Meteor.user().username;
  },
  userList: function () {
    console.log("asdfasdf")
    console.log( Meteor.users.find().fetch());
    return [];
  }
});
