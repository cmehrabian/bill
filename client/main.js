Meteor.subscribe('nodes');
Meteor.subscribe('edges');

Meteor.startup(function(){
  width = 960;
  height = 500;
})

Template.dropper.events({
  'click #drop': function(){
    Meteor.call('dropNodes');
  }
});

Router.route("", {template:"topics"});
Router.route("view", {template:"graphview"});
Router.route("new", {template:"newtopic"});