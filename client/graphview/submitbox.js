
Template.submitbox.username = function () {
  return Session.get('username');
}


Template.submitbox.events({
  'click #submit-node': function () {
    var username = document.getElementById("username-submit").value;
    var nodeBody = document.getElementById("body-submit").value;
    Session.set('username', username);

    var target_id = Session.get("target_id");
    var selected_id = Session.get("selected");
    if(!selected_id)
    	return;

    var node = {
      username: username,
      body: nodeBody,
      type: "statement",
      root_id: target_id
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
