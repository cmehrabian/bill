
Template.submitbox.username = function () {
  return Session.get('username');
}

Template.submitbox.isLoggedIn = function (){
  return !!Meteor.user()
}

Template.submitbox.loggedInUsername = function (){
  return Meteor.user().username
}

Template.submitbox.events({
  'click #submit-node': function () {
    if(!!Meteor.user()){
      var username = Meteor.user().username;
      var user = Meteor.user();
    }
    else {
      var username = document.getElementById("username-submit").value;
      var user = null;
    }
    var nodeBody = document.getElementById("body-submit").value;
    Session.set('username', username);

    var target_id = Nodes.findOne({_id:Session.get("target_id")}).root_id
    var selected_id = Session.get("selected");
    if(!selected_id)
    	return;

    var node = {
      username: username,
      body: nodeBody,
      type: "statement",
      root_id: target_id,
      user: user
    }

    var edgeTypeBox = document.getElementById("edge-type");
    var edgeType = edgeTypeBox.options[edgeTypeBox.selectedIndex].value;

    var edge = {};
    edge.type = edgeType;
    edge.root_id = target_id
    edge.target_id = selected_id;

    Meteor.call('newNode', node, edge);
    document.getElementById("body-submit").value = "";

  }
})
