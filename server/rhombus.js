

/*

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

*/