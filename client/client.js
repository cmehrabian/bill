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

// FIXME - don't do a query per field.  Either have Session selected
// be the node itself or figure out how to set template variables
// ... or does meteor take care of this?
Template.nodeviewer.username = function () {
  // FIXME This check shouldn't be necessary.
  // and should be working.
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
  'click #submit-node': function () {
    var username = document.getElementById("username-submit").value;
    var nodeBody = document.getElementById("body-submit").value;
    Session.set('username', username);

    var node = {
      username: username,
      body: nodeBody,
      type: "statement"
    }

    Meteor.call('newNode', node);
    document.getElementById("body-submit").value = "";
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

  // if the user is trying to add an edge, this variable keeps track 
  // of the node it's coming from so we can recalculate the arrow's 
  // base coordinates.  
  var potentialSource = null;

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

    // 'name' + d._id is because the id field isn't allowed to begin with numbers.
    DOMnodes.enter()
      .append("circle")
      .attr("class", "node")
      .attr("r", 12)
      .attr("id", function(d){ return 'name' + d._id;})
      .on("mouseover", mouseover)
      .on("dblclick", doubleclick)
      .call(force.drag());

    DOMnodes.exit()
      .remove()

    force
      .nodes(nodes)
      .links(links)
      .start()

    self.DOMnodes = DOMnodes;
  })

  function getOffsetCoordinates(source, target){
      var s2 = target;
      var s1 = source;

      var slope = (s2.y - s1.y) / (s2.x - s1.x);
      var radius = 20;

      var tanx = radius / Math.sqrt(Math.pow(slope,2) + 1);
      var arrowLength = 10;
      var arrowWidth = 2;

      if(s2.x > s1.x)
        tanx = -tanx;

      var tany = slope * tanx;

      tanx += s2.x;
      tany += s2.y;

      return {x: tanx, y: tany};
  }

  function tick() {
    var node = self.graphElem.selectAll('.node');
    var link = self.graphElem.selectAll('.link');
    var potentialLink = self.graphElem.select('.potential-link');

    link.attr("d", function(d) {
      var offsets = getOffsetCoordinates(d.source, d.target);

      return "M " + d.source.x + " " + d.source.y + " L " + offsets.x + " " +
      offsets.y;
    })
    
    node.attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });

    if(!potentialSource)
      return;

    potentialLink.attr("x1", potentialSource.x)
      .attr("x2", potentialSource.y);
  }

  function mouseover(d) {
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

  function doubleclick(d){
    potentialSource = d;

    var newLink = self.graphElem.append('line')
      .attr('class', 'potential-link')
      .attr('x1', d.x)
      .attr('y1', d.y)
      .attr('x2', d.x)
      .attr('y2', d.y)
      .attr("marker-end", "url(#Triangle)")

    self.graphElem.on('mousemove', function() {
      var mouse = d3.mouse(this);
      var offsets = getOffsetCoordinates({x: d.x, y: d.y}, {x: mouse[0], y: mouse[1]});
      newLink.attr("x2", offsets.x);
      newLink.attr("y2", offsets.y);
    });

    self.graphElem.on('click', function() {
      newLink.remove();
      potentialSource = null;

      var clickedElem_id = d3.select(d3.event.target).attr('id');
      // HAHAH THIS COULD BREAK PHILOSOPHICAL CRISIS
      if(clickedElem_id){
        if (clickedElem_id.indexOf("name") != -1){
          var target_id = clickedElem_id.replace("name", "");
          Meteor.call('newLink', d._id, target_id);
        }
      }

      // clean up the event handlers.
      self.graphElem.on('click', null);
      self.graphElem.on('mousemove', null);
    });
  }
}
