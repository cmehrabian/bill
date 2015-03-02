Template.forumview.helpers({
  posts: function(){
    var linked_id = Router.current().params._id;
    var linked_node = Nodes.findOne({_id:linked_id});

    var nodes = Nodes.find({root_id:linked_node.root_id}).fetch();
    console.log(nodes);
    return nodes;
  },
  time: function(timestamp){
    var now = Date.now();
    var seconds = Math.floor((now - timestamp) / 1000);

    var interval = Math.floor(seconds / 31536000);

    if (interval > 1) {
        return interval + " years ago.";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return interval + " months ago.";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + " days ago.";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " hours ago.";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return interval + " minutes ago.";
    }
    return Math.floor(seconds) + " seconds ago.";
  },
  color: function(value){
    if(value > 0)
      return "green";
    if(value < 0)
      return "red";
    return "black";
  }
})