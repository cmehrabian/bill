Template.topics.topic = function (){
  return Nodes.find({root:undefined});
}

Template.topics.events({
  'click .graphview': function(){
    console.log(this);
    //Session.set('route', 'graphview')
  }
})
