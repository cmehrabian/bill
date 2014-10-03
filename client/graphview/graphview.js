
Template.graphview.newEdge = function () {
  var state = Session.get('state');
  return state && state.name == "submittingEdge";
}
