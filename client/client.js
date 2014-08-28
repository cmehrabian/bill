Meteor.subscribe('nodes');
Meteor.subscribe('edges');

Meteor.startup(function(){
  width = 960;
  height = 500;
})

Template.hello.greeting = function () {
  return "Welcome to d3test.";
};

Template.hello.events({
  'click #add': function () {
    var id = Nodes.insert({text:'hello'});
    var selected = Session.get('selected');
    if(!selected)
      return;

    Links.insert(
      {
        source:Session.get('selected'),
        target:id 
      });
  },
  'click #remove': function(){
    var id = Session.get('selected');

    if (id)
      Meteor.call('deleteNode', id);

    Session.set('selected', undefined);
  },
  'click #drop': function(){
    Meteor.call('dropNodes');
  }
});

Template.hello.nodes = function () {
  return Nodes.find();
};

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
      links.push({source: sourceNode, target: targetNode});

    });

    var DOMLinks = self.graphElem.selectAll('.link')
      .data(links)

    DOMLinks.enter()
          .append("line")
          .attr("class", "link")

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

    link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

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
