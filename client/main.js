Meteor.subscribe('nodes');
Meteor.subscribe('edges');

var newLink;

Meteor.startup(function(){
  width = 960;
  height = 500;
  Session.setDefault('route', 'topics')
})

Template.router.contextIsNewtopic = function() {
  return Session.get('route') == 'newtopic';
}

Template.router.contextIsTopics = function() {
  return Session.get('route') == 'topics';
}

Template.router.contextIsGraphview = function() {
  return Session.get('route') == 'graphview';
}

Template.dropper.events({
  'click #drop': function(){
    Meteor.call('dropNodes');
  }
});
