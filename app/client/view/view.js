Template.view.events({
  'click #forumview-link': function(){
    Session.set("viewMode", "standard");
  },
  'click #graphview-link': function(){
    Session.set("viewMode", "graph");
  }
});

Template.view.rendered = function(){
  Session.set("viewMode", "graph");
}

Template.view.helpers({
  isStandard: function(){
    return Session.get("viewMode") == "standard"; 
  }
})