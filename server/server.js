Meteor.startup(function () {

});

Meteor.methods({
	dropNodes: function(){
		Nodes.remove({});
		Links.remove({});
	},
	deleteNode: function(id){
		Nodes.remove({_id: id});
    	Links.remove({$or: [{source: id}, {target: id}]});
	},
	newNode: function(node){
		// Note: if ever done RESTfully, add a data quality check. 
		node._id = Nodes.insert(node);
		if(!node.root_id){
			Nodes.update(node._id, {$set: {root_id: node._id}});
		}
	},
	newEdge: function(edge){
		var source_id = edge.source;
		var target_id = edge.target;
		var link = Links.findOne({source: source_id, target: target_id})
		if (link || source_id == target_id){
			return;
		}

		if (target_id && source_id){
			Links.insert({
				source: source_id,
				target: target_id,
				type: edge.type
			});
		}
	}
});