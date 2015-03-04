
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
        return interval + " years ago";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return interval + " months ago";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + " days ago";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " hours ago";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return interval + " minutes ago";
    }
    return Math.floor(seconds) + " seconds ago";
  },
  isCommenting: function(_id){
    return !! _.find(Session.get("isCommenting"), function(c){
      return c == _id;
    });
  }
});

// For some reason, these event callbacks are called multiple times per click.
// Maybe a FIXME eventually.
Template.forumviewPost.events({
  'click .post-replybutton':function(event){
    var clicked_id = event.target.id.replace("replybutton-", "");
    var commenting = Session.get("isCommenting");
    if(! _.find(commenting, function(c){return clicked_id == c;})){
      commenting.push(clicked_id);
      Session.set("isCommenting", commenting);
    }
  },
  'click .post-closebutton':function(event){
    var clicked_id = event.target.id.replace("closebutton-", "");
    var commenting = Session.get("isCommenting");

    // lodash pull doesn't work for some reason.
    //_.pull(commenting,clicked_id);

    var index = commenting.indexOf(clicked_id)
    if (index > -1) {
      commenting.splice(index, 1)
    }

    Session.set("isCommenting", commenting);
  }
});

Template.forumviewPost.rendered = function(){
  if(!Session.get("isCommenting")){
    Session.set("isCommenting", []);
  }
}