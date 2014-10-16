
// FIXME - don't do a query per field.  Either have Session selected
// be the node itself or figure out how to set template variables
// ... or does meteor take care of this?
Template.nodeviewer.username = function () {
  var node = Nodes.findOne({_id: Session.get('selected')});
  if(node)
    return node.username;
  else
    return "";
}

Template.nodeviewer.body = function () {
  var node = Nodes.findOne({_id: Session.get('selected')});
  if(node)
    return node.body;
  else
    return "";
}

Template.nodeviewer._id = function() {
  var node = Nodes.findOne({_id: Session.get('selected')});
  if(node)
    return node._id;
  else
    return "";

}