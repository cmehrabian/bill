Template.edgeSubmitter.events({
  'click #submit-edge': function () {
    var newEdge = Session.get('state').data;
    if(!newEdge)
      return;

    var edgeTypeBox = document.getElementById("edge-type");
    var edgeType = edgeTypeBox.options[edgeTypeBox.selectedIndex].value;
    newEdge.type = edgeType;

    Meteor.call('newEdge', newEdge);
    Session.set("state", new State("view"));
  },
  'click #cancel-submit-edge': function () {
    Session.set('state', new State("view"));
  }
})
