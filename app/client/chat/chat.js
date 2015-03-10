Template.chat.helpers({
  chatLog:function(){
    return Chatter.find({}, {sort:{timestamp: -1}});
  }
});

Template.chat.events({
    'keypress input': function(e) {
      if(e.keyCode != 13)
        return;

      var message = document.getElementById("chat-box").value;

      if(message.length == 0)
        return;

      Meteor.call("newMessage", message);
      document.getElementById("chat-box").value = "";
    }
});
