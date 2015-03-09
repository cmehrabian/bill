Template.newtopic.events({
  'click #submit-node': function () {
    if(! Meteor.user())
      return;

    var nodeBody = document.getElementById("body-submit").value;

    var node = {
      user: Meteor.user(),
      username: Meteor.user().username,
      body: nodeBody,
      type: "original"
    }

    Meteor.call('newNode', node, {});
    document.getElementById("body-submit").value = "";
    Router.go('/');
    //Session.set('route', 'topics');
  }
})
