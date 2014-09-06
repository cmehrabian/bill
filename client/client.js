Meteor.subscribe('nodes');
Meteor.subscribe('edges');

Meteor.startup(function(){
  width = 960;
  height = 500;
  var one = Nodes.findOne({});
  Session.set('selected', one);
})

Template.dropper.events({
  'click #drop': function(){
    Meteor.call('dropNodes');
  }
});

// FIXME - don't do a query per field.  Either have Session selected
// be the node itself or figure out how to set template variables
// ... or does meteor take care of this?
Template.nodeviewer.username = function () {
  // FIXME This check shouldn't be necessary.  
  if (! Session.get('selected'))
    return undefined;
  return Nodes.findOne({_id: Session.get('selected')}).username;
}

Template.nodeviewer.body = function () {
  // FIXME This check shouldn't be necessary.  
  if (! Session.get('selected'))
    return undefined;
  return Nodes.findOne({_id: Session.get('selected')}).body;
}

Template.submitbox.events({
  'click #submit': function () {
    var username = document.getElementById("username-submit").value;
    var nodeBody = document.getElementById("body-submit").value;
    Session.set('username', username);

    var id = Nodes.insert({
      username: username,
      body: nodeBody
    });

    var selected = Session.get('selected');
    if(!selected)
      return;

    Links.insert(
      {
        target:Session.get('selected'),
        source:id 
      });

    document.getElementById("body-submit").value;
  }
})

Template.submitbox.username = function () {
  return Session.get('username');
}

Template.graph.rendered = function(){
  var self = this;

  if(self.graphElem === undefined){
    self.graphElem = d3.select('#graph');
  } 

  force = d3.layout.force()
    .linkDistance(80)
    .charge(-120)
    .gravity(.05)
    .size([1600, 500])
    .on("tick", tick)

  //FIXME figure out how to optimize this
  Deps.autorun(function(){
    var nodes = Nodes.find().fetch();
    var meteorLinks = Links.find().fetch();

    var DOMnodes = self.graphElem.selectAll('.node')
      .data(nodes, function(d){ return d._id});

    var links = []
    meteorLinks.forEach(function(e){
      // Get the source and target nodes
      var sourceNode = nodes.filter(function(n) { return n._id === e.source; })[0],
          targetNode = nodes.filter(function(n) { return n._id === e.target; })[0];

      // Add the edge to the array
      if(sourceNode && targetNode)
        links.push({source: sourceNode, target: targetNode});

    });

    var DOMLinks = self.graphElem.selectAll('.link')
      .data(links)

    DOMLinks.enter()
          .append("path")
          .attr("class", "link")
          .attr("marker-end", "url(#Triangle)")

    DOMLinks.exit()
      .remove();

    DOMnodes.enter()
      .append("circle")
      .attr("class", "node")
      .attr("r", 12)
      .attr("id", function(d){ return 'name' + d._id;})
      .on("click", click)
      .call(force.drag);

    DOMnodes.exit()
      .remove()

    force
      .nodes(nodes)
      .links(links)
      .start()
  })

  function tick() {
    var node = self.graphElem.selectAll('.node');
    var link = self.graphElem.selectAll('.link');
    var leftjoin = self.graphElem.selectAll('.leftjoin');
    var rightjoin = self.graphElem.selectAll('.rightjoin');

    link.attr("d", function(d) {
      var s2 = d.target;
      var s1 = d.source;

      var slope = (s2.y - s1.y) / (s2.x - s1.x)
      var radius = 20;

      var tanx = radius / Math.sqrt(Math.pow(slope,2) + 1)
      var arrowLength = 10
      var arrowWidth = 2

      if(s2.x > s1.x)
        tanx = -tanx

      var tany = slope * tanx

      tanx += s2.x
      tany += s2.y

      return "M " + d.source.x + " " + d.source.y + " L " + tanx + " " +
      tany; 
    })
    
    node.attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
  }

  function click(d) {
    if (d3.event.defaultPrevented)
      return;

    //FIXME, keep track of last selectedDOMNode (globals vs same template)
    var selected_id = Session.get('selected');
    self.graphElem.select('#name' + selected_id)
      .classed('selected', false);

    self.graphElem.select('#name' + d._id)
      .classed('selected', true);

    Session.set('selected', d._id);
  }
}
