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
  'click input': function () {
    Nodes.insert({text:'hello'});
    //Meteor.call('newNode', 'hello');
  }
});

Template.hello.nodes = function () {
  return Nodes.find();
};

Template.graph.rendered = function(){
  var self = this;
  //self.node = self.find('svg');
  if(self.graphElem === undefined){
    self.graphElem = d3.select('#graph');
  } 

  force = d3.layout.force()
    .linkDistance(80)
    .charge(-120)
    .gravity(.05)
    .size([400, 400])
    .on("tick", tick)

  Deps.autorun(function(){
    var nodes = Nodes.find().fetch()
    var links = []
    if (nodes.length > 1){
      links = [ {"source":  0, "target":  1} ]
    }

    self.graphElem.selectAll('.node')
      .data(nodes)
        .enter()
          .append("circle")
          .attr("class", "node")
          .attr("r", 12)
          .attr("id", function(d){ return d._id;})
          .attr("cx", function() { return Math.random() * 400; })
          .attr("cy", function() { return Math.random() * 400; })
          .on("click", click);

    self.graphElem.selectAll('.link')
      .data(links)
        .enter()
          .append("link")
          .attr("class", "link");

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

    // FIXME, store previous selected DOM node so we don't have to 
    // reselect
    console.log(self.graphElem.select('#' + d._id)
      .classed('selected', true));

    var selected_id = Session.get('selected');
    self.graphElem.select('#' + selected_id)
      .classed('selected', false);

    Session.set('selected', d._id);
  }
}
