Template.edgeSubmitter.events({
  'click #submit-edge': function () {
    var newEdge = Session.get('state').data;
    if(!newEdge)
      return;

    var edgeTypeBox = document.getElementById("edge-type");
    var edgeType = edgeTypeBox.options[edgeTypeBox.selectedIndex].value;
    newEdge.type = edgeType;
    newEdge.root_id = Session.get("target_id");

    Meteor.call('newEdge', newEdge);
    Session.set("state", new State("view"));
  },
  'click #cancel-submit-edge': function () {
    Session.set('state', new State("view"));
  }
})

function State(name, data){
  this.name = name;
  this.data = data;
}
