Meteor.startup(function () {

});

Meteor.publish("allUserData", function () {
    return Meteor.users.find({}, {fields: {
      'posts': 1,
      'value': 1,
      'emails': 1,
      'notifications': 1
    }});
});

Meteor.methods({
	dropNodes: function(target_id){
		Nodes.remove({root_id:target_id});
		Links.remove({root_id:target_id});
	},
	deleteNode: function(id){
		var node = Nodes.findOne({_id:id});
		propagate(id, - node.value);
		Nodes.remove({_id: id});
    	Links.remove({$or: [{source: id}, {target: id}]});
	},
	newNode: function(node, edge){
		// Note: if ever done RESTfully, add a data quality check. 
		node.datatype = "node";
		node.value = 0;
    node.timestamp = new Date().getTime();
		node._id = Nodes.insert(node);

    if(node.user){
      Meteor.users.update({_id: node.user._id}, {$addToSet: {posts: node._id}});
    }

		if(!node.root_id){
			Nodes.update(node._id, {$set: {root_id: node._id}});
		}
		if(edge)
			newlink_id = Links.insert({
				source: node._id,
				target: edge.target_id,
				type: edge.type
			})

		if(edge.type != "quote")
			newNode(node._id);
	},
  checkNotification: function(user_id, selected_id){
    Meteor.users.update({_id: Meteor.user()._id}, {$pull:{notifications:{modifier_id:selected_id}}});
  }
});

var newNode = function(node_id){

  var delta = 1;

  var notifications = []

  propagate(node_id, delta, node_id, notifications);

  _.forEach(notifications, function(n){
    n.modifier_id = node_id;
    Meteor.users.update({_id:n.user_id},
      {
        $addToSet:{notifications:n}
      }
    );
  });
  // var modifiedparent = _.find(a, {point_id:data.parent});

  // if(modifiedparent === undefined && parent !== undefined)
  //   a.push(parent);

}

// Recursive. Takes a point (n), an array (a), the value to be propagated (delta),
// and a list of nodes that shouldn't be visited (blacklist).  
// All points that have already been visited are added to a.  a is returned at the 
// end of the function and sent to all users (currently)
var propagate = function(node_id, delta, original_id, notifications){
  if (node_id === undefined)
    return;
  if (delta == 0)
    return;

  var node = Nodes.findOne({_id:node_id});
  if(!node)
  	return

  // n.propagated++;

  // There are six conditions to consider when propagating a value. They are:
  // -the value and delta are positive
  // -the value is positive and delta is negative, but the absolute value of the value is larger
  // -the value is positive and delta is negative, but the absolute value of the value is smaller
  // and the three opposite cases

  // In all cases the amount of value to propagate can be defined as the amount of change above 0, 
  // and I'M PRETTY SURE this function will return that value.  
  var newdelta = pos(node.value + delta) - pos(node.value);

  Nodes.update(node_id, {$inc: {value:delta}});
  if(node.user && node_id != original_id){

    var u = _.find(notifications, function(n){
      return n.user_id == node.user._id;
    })

    if(!u){
      u = {
        user_id:node.user._id,
        modified:[]
      };
      notifications.push(u);
    }

    u.modified.push(
      {
        _id:node._id,
        value:delta
      });
  }

  // n.modified = true;

  // Note: this is a bit more robust than it needs to be.   
  var outedges = Links.find({source:node._id}).fetch();
  _.forEach(outedges, function(edge){
    if(edge.type == 'disagreement')
      newdelta = -newdelta;
    if(edge.type == 'comment')
      newdelta = 0;
    if(edge.type == 'quote')
      newdelta = delta;

    propagate(edge.target, newdelta, original_id, notifications);
  });
}

var pos = function(value){
  if(value > 0)
    return value;
  else
    return 0;
}
