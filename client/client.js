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
  //var self = this;
  //self.node = self.find('svg');
  var graphElem = d3.select('#graph-container')
    .append('svg')
    .attr('id', 'graph')
    .attr("width", 400)
    .attr("height", 400)


  force = d3.layout.force()
    .linkDistance(80)
    .charge(-120)
    .gravity(.05)
    .size([400, 400])
    .on("tick", tick);

  //link = graphElem.selectAll(".link");
  //node = graphElem.selectAll(".node");

  //var data = [];
  //var datalinks = [];


  Deps.autorun(function(){
    var nodes = Nodes.find().fetch()
    var links = []
    if (nodes.length > 1){
      links = [ {"source":  0, "target":  1} ]
    }

    graphElem.selectAll('.node')
      .data(nodes)
        .enter()
          .append("circle")
          .attr("class", "node")
          .attr("r", 12)
          .attr("cx", function() { return Math.random() * 400; })
          .attr("cy", function() { return Math.random() * 400; })
          //.on("click", click);

    graphElem.selectAll('.link')
      .data(links)
        .enter()
          .append("link")
          .attr("class", "link");
    // link = link.data(datalinks)
    //   .enter().append("line")
    //     .attr("class", "link");


    force
      .nodes(nodes)
      .links(links)
      .start()
  })

  Deps.autorun(function(){

  })

  function tick() {

    var node = d3.selectAll('.node');
    var link = d3.selectAll('.link');

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

  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  update();
  
  }
}
