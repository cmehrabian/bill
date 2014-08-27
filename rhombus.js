var _ = require('lodash');

// All server-side logic for handling requests and keeping track of the points is here.
// There is a lot of legacy code involving links.  Don't mind that.  

var points = [] ;
var last_point_id = 0; 


exports.reset = function(){
  points = [];
  last_point_id = 0;
}

exports.points = points;
exports.last_point_id = last_point_id;

// If the amount of watchers becomes nonzero, this function is called.
// It gets all of the points from the database and the last id the server
// handed out, and stores them in program memory. It also destroys the old
// records.

exports.init = function(callback){
}

//gets all the original posts
exports.getOriginals = function(callback){
  callback(_.where(points, {original:true}))
}

//gets a point and all connected points
exports.request = function(request_id, callback){
  console.log('points:')
  console.log(points)
  var point = _.find(points, {point_id:request_id})
  if(point === undefined){
    callback([])
  }
  else{
    callback(_.where(points, {root:point.root}))
  }
  
}

exports.download = function(callback){
  callback(points);
}


exports.requestTopics = function(callback){
  callback(_.where(points, {original:true}));
}

exports.new_point = function(data, callback){
  data.point_id = ++last_point_id;

  data.root = data.point_id;

  points.push(data);

  var delta = 1;

  if(data.flavor == 'quote')
    delta = 0;

  a = [];
  a = propagate(data, a, delta);

  var parent = _.find(points, {point_id: data.parent})
  if(parent !== undefined){
    data.root = parent.root;
    parent.children.push(data.point_id);
  }
    
  var modifiedparent = _.find(a, {point_id:data.parent});

  if(modifiedparent === undefined && parent !== undefined)
    a.push(parent);

  callback(a);
}

//called if amount of watchers becomes 0.  Saves everything to database.
exports.cleanup = function(callback){
  callback();
}


// Recursive. Takes a point (n), an array (a), the value to be propagated (delta),
// and a list of nodes that shouldn't be visited (blacklist).  
// All points that have already been visited are added to a.  a is returned at the 
// end of the function and sent to all users (currently)

var propagate = function(n, a, delta, blacklist){
  if (n === undefined || _.find(a, n) !== undefined || (blacklist !== undefined && _.find(n, blacklist) !== undefined))
    return a;

  a.push(n);

  if (delta == 0)
    return a;

  n.propagated++;

  
  // There are six conditions to consider when propagating a value. They are:
  // -the value and delta are positive
  // -the value is positive and delta is negative, but the absolute value of the value is larger
  // -the value is positive and delta is negative, but the absolute value of the value is smaller
  // and the three opposite cases

  // In all cases the amount of value to propagate can be defined as the amount of change above 0, 
  // and I'M PRETTY SURE this function will return that value.  
  
  var newdelta = pos(n.value + delta) - pos(n.value);

  n.value += delta;

  // blacklist is also a stand-in boolean for letting propagate know if this value increase counts
  // for the node WITHOUT the link in addition to with it.  
  if (blacklist === undefined)
    n.shadow += delta;

  n.modified = true;

  if(n.flavor == 'dissent')
    newdelta = -newdelta;
  if(n.flavor == 'comment')
    newdelta = 0;
  if(n.flavor == 'quote' || n.flavor == 'link')
    newdelta = delta;

  _.forEach(n.links, function(link){
    var node = _.find(points, {point_id:link}); 
    a = propagate(_.find(node, a, delta, blacklist || []));
  })

  var parent = _.find(points, {point_id:n.parent});
  a = propagate(parent, a, newdelta, blacklist)

  return a;
}


var pos = function(value){
  if(value > 0)
    return value;
  else
    return 0;

}

// Links are tricky.  The first thing to do when a link is made is check to 
// see if a cycle has been created.  This basically means following all parents
// and links and seeing if you end up where you started.  If so, remove the most recent
// of the two linked points and propagate its inverse value through the graph.

// If it's not linked, then after that we need to consider the situation in which they have
// a common parent.  Consider this graph

// A1 -> B
//         > D
// A2 -> C

// And say A1 has a value of 10 and A2 has a value of 4.  When they are linked, the total value
// of both A1 and A2 goes to 14.  This means that B gets +4 propagated to it and C gets +10.  D,
// however, already had both the values of A1 and A2 affecting it, and so logically its value 
// shouldn't increase.  

// So, the solution to this problem for now is to get all the potential recipient of new values 
// from both of the newly linked nodes, and remove all the recipient that have duplicates.  
// We can optimize this later.

function addLink(n){
  //check if link already exists
  var left = _.find(points, {point_id:links[0]});
  var right = _.find(points, {point_id:links[1]});
  if(_.intersection(left.linkhelpers, right.linkhelpers).length != 0){
    console.log('link exists!');
    return;
  }

  //check for a cycle
  if(hasCycle(n.links[0], null, n.point_id) || hasCycle(n.links[1], null, n.point_id)){
    console.log('cycle found!');
    //fixcycle
    return;
  }

  //update new-linked nodes to link each other
  left.links.push(right.point_id);
  right.links.push(left.point_id);

  //obtain the blacklist of non-unique recipients
  var nonUnique = getNonUniqueRecipients(n);

  //propogate the values
  var a = [n];
  a = propagate(left, a, right.value, nonUnique);
  a = propagate(right, a, left.value, nonUnique);
  return a;
}

function hasCycle(current_id, last_id, origin_id){
  if(current_id == origin_id)
    return true;
  if(current_id == null)
    return false;

  for(var i = 0; i < points[current_id].links.length; ++i){
    if(points[current_id].links[i] != last_id)
      if(hasCycle(points[current_id].links[i], current_id, link_id))
        return true;
  }

  return hasCycle(points[current_id].parent, current_id, link_id);
}

// fix this at some point.  Jeez.  
function getNonUniqueRecipients(n){
  a = [];
  var recipients = getAllRecipients(n, a);

  var min = recipients[0];
  _.forEach(recipients, function(n){
    if (min > n)
      min = n;
  });

  var bucket = []
  _.forEach(recipients, function(n){
    if (bucket[n-min] === undefined)
      bucket[n-min] = 1;
    else
      bucket[n-min]++;
  })

  var nonUnique = [];
  _.forEach(bucket, function(n){
    if(n !== undefined && n != 1)
      nonUnique.push(n);
  })

  return nonUnique;
}

function getAllRecipients(point_id, a){
  if (point_id === null)
    return a;

  a.push(point_id);

  var node = __.find(points, {point_id: point_id});

  a = getAllRecipients(node.links[0], a);
  a = getAllRecipients(node.links[1], a);

  a = getAllRecipients(node.parent, a);

  return a;
}