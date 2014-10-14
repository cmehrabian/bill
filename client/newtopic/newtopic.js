Template.newtopic.events({
  'click #submit-node': function () {
    var username = document.getElementById("username-submit").value;
    var nodeBody = document.getElementById("body-submit").value;
    Session.set('username', username);

    var node = {
      username: username,
      body: nodeBody,
      type: "statement",
    }

    Meteor.call('newNode', node);
    document.getElementById("body-submit").value = "";
    Router.go('/');
    //Session.set('route', 'topics');
  }
})
