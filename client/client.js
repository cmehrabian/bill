Meteor.subscribe('nodes');
Meteor.subscribe('edges');

var newLink;

Meteor.startup(function(){
  width = 960;
  height = 500;
})

Template.dropper.events({
  'click #drop': function(){
    Meteor.call('dropNodes');
  }
});

Template.container.creatingEdge = function () {
  return !!Session.get('creatingEdge');
}

Template.edgeSubmitter.events({
  'click #submit-edge': function () {
    var newEdge = Session.get('creatingEdge');
    if(!newEdge)
      return;

    var edgeTypeBox = document.getElementById("edge-type");
    var edgeType = edgeTypeBox.options[edgeTypeBox.selectedIndex].value;
    newEdge.type = edgeType;

    Meteor.call('newEdge', newEdge);
    newLink.remove();
    Session.set('creatingEdge', null);
  },
  'click #cancel-submit-edge': function () {
    newLink.remove();
    Session.set('creatingEdge', null);
  }
})

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

  self.graphElem = d3.select('#graph');
  self.edges = self.graphElem.select('#edges');
  self.nodes = self.graphElem.select('#nodes');

  var nodes = []
  var links = []

  force = d3.layout.force()
    .linkDistance(80)
    .charge(-160)
    .gravity(.05)
    .size([1200, 500])
    .on("tick", tick)

  // Calculating node changes
  Deps.autorun(function(){

    var meteorNodes = Nodes.find().fetch();

    var newNodes = _.difference(meteorNodes, nodes);
    newNodes.forEach(function(n){
      nodes.push(n);
    });

    // LOOKINTO, does the selection change dynamically when elements are added?
    var DOMnodes = self.nodes.selectAll("*")
      .data(nodes, function(d){ return d._id});

    // 'node' + d._id is because the id field isn't allowed to begin with numbers.
    DOMnodes.enter()
      .append("circle")
      .attr("class", "node")
      .attr("r", 12)
      .attr("id", function(d){ return 'node' + d._id; })
      .on("mouseover", mouseover)
      .on("dblclick", doubleclick)
      .call(force.drag());

    // FIXME- This won't work as expected, get it to run like data selection.
    DOMnodes.exit()
      .remove()

    force
      .nodes(nodes)
      .start()
  })

  // Calculates link changes.
  Deps.autorun(function(){
    var meteorLinks = Links.find().fetch();

    var newLinks = _.difference(meteorLinks, links);

    newLinks.forEach(function(e){
      var sourceNode = nodes.filter(function(n) { return n._id === e.source; })[0],
          targetNode = nodes.filter(function(n) { return n._id === e.target; })[0];

      // Add the edge to the array
      if(sourceNode && targetNode)
        links.push({source: sourceNode, target: targetNode, type:e.type});
    });

    var DOMLinks = self.edges.selectAll("*")
      .data(links)

    DOMLinks.enter()
      .append("path")
      .attr("class", function(e) { return "edge " + e.type + "-edge"})
      .attr("marker-end", "url(#Triangle)")

    DOMLinks.exit()
      .remove();

    force
      .links(links)
      .start()
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
    var link = self.graphElem.selectAll('.edge');
    var potentialLink = self.graphElem.select('#potential-edge');

    link.attr("d", function(d) {
      var offsets = getOffsetCoordinates(d.source, d.target);

      return "M " + d.source.x + " " + d.source.y + " L " + offsets.x + " " +
      offsets.y;
    })
    
    node.attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
  }

  function mouseover(d) {
    if (d3.event.defaultPrevented)
      return;

    //FIXME, keep track of last selectedDOMNode (globals vs same template)
    var selected_id = Session.get('selected');
    self.graphElem.select('#node' + selected_id)
      .classed('selected', false);

    self.graphElem.select('#node' + d._id)
      .classed('selected', true);

    Session.set('selected', d._id);
  }

  function doubleclick(d){

    if(newLink)
      newLink.remove();

    newLink = self.graphElem.append('line')
      .attr('id', 'potential-edge')
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

      var clickedElem_id = d3.select(d3.event.target).attr('id');
      if(clickedElem_id){

        // HAHAH THIS COULD BREAK /me PHILOSOPHICAL CRISIS
        if (clickedElem_id.indexOf("node") != -1){
          var target_id = clickedElem_id.replace("node", "");
          var newEdge = {
            source: d._id,
            target: target_id
          }
          Session.set('creatingEdge', newEdge);
        }
        else{
          newLink.remove();
        }
      }

      // clean up the event handlers.
      self.graphElem.on('click', null);
      self.graphElem.on('mousemove', null);
    });
  }
}
