
Template.topics.helpers({
  formatBody: function(body){
    if (body.length < 200)
      return body;
    return body.substring(0, 197) + "...";
  },
  topicList: function(){
    return Nodes.find({$where:"this.root_id == this._id"}, {sort:{timestamp:-11}});
  },
  getTime: function(timestamp){
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

  }
})
