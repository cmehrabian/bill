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
	}
});