
Nodes = new Meteor.Collection("nodes");
Links = new Meteor.Collection("links");
Chatter = new Meteor.Collection("Chatter");

Meteor.users.initEasySearch('username');

if (Meteor.is_server){
	Nodes.allow({
	    'update': function (userId,doc) {
	      /* user and doc checks ,
	      return true to allow insert */
	      return true;
    }
  });
}