Meteor.startup(function () {

});

Meteor.methods({
	dropNodes: function(){
		Nodes.remove({});
	}
});