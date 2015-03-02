Template.forumview.helpers({
  post: function(_id){
    return _.find(Session.get("nodes"), function(n){
      return n._id == _id;
    });
  },
  root: function(){
    return _.find(Session.get("nodes"), function(n){
      return n._id == Router.current().params._id;
    });
  }
});

/* The purpose of this function is mainly to translate the Links/Nodes
 * mashup into something a little more sane.  If we end up phasing out 
 * links as a separate entity then we might be able to get rid of some
 * of this.
 */
Template.forumview.rendered = function(){
  var linked_id = Router.current().params._id;
  var linked_node = Nodes.findOne({_id:linked_id});

  var nodes = Nodes.find({root_id:linked_node.root_id}).fetch();
  // FIXME: Gets all links?
  var links = Links.find().fetch();

  // *vomits on keyboard*
  _.forEach(nodes, function(n1){
    n1.children = [];
    _.forEach(nodes, function(n2){
      if(_.find(links, function(l){
        return (l.target == n1._id && l.source == n2._id);
      })){
          n1.children.push(n2);
        }
    });
  }); 

  Session.set("nodes", nodes);
}

Template.forumviewPost.helpers({
  color: function(value){
    if(value > 0)
      return "green";
    if(value < 0)
      return "red";
    return "black";
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
  }

});