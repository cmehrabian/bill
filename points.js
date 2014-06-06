
var app = require('./app')
/*
var points = [
{ 
  username: 'tyler',
  parent_id: null,
  flavor: 'comment',
  text: 'hello',
  children: [],
  links: [],
  point_id: 0,
  value: 1 }
]
*/
var points = []


exports.getTree = function(socket){
	for (var i = 0; i < points.length; ++i){
    socket.emit('update', points[i])
    console.log(points[i])
  }
  socket.emit('update_finished')
}

exports.new_point = function(socket, data){
	      //data.point_id = ++lastpoint_id
  data.point_id = points.length

  if(data.parent_id == data.point_id ||
   (data.parent_id != null && points[data.parent_id] === undefined)){
    console.log("client-side error")
    return
  }

  if(data.flavor == 'link')
    data.parent_id = null


  if(data.parent_id != null)
  { 
    points[data.parent_id].children.push(data.point_id)
  }

  if(data.flavor =='quote')
    data.value = 0
  else
    data.value = 1
  


  points[data.point_id] = data

  socket.emit('update',points[data.point_id]);
  socket.broadcast.emit('update', points[data.point_id])
  //console.log(points[data.point_id])

  if(data.flavor == 'link'){
    addLink(data.point_id, socket)
  }
  else{

    a = []
    //var current_id = data.point_id 
    if(data.flavor == 'assent'){
      propogate(data.parent_id, 1, a, socket)
    }
    if(data.flavor == 'dissent'){
      propogate(data.parent_id, -1, a, socket)
    }

  }
    socket.emit('update_finished');
    socket.broadcast.emit('update_finished');

}


exports.reset = function(){
	points = []
}


function propogate(current_id, delta, a, socket, CommonParent){
  if(current_id == null || current_id == CommonParent || delta == 0 ||  a[current_id] !== undefined) 
    return a

  var newdelta = 0


  if(points[current_id].flavor == 'quote'){
    newdelta = delta
  }
  else{

    //if they are the same sign.
    if (Math.abs(points[current_id].value + delta) == Math.abs(points[current_id].value) + Math.abs(delta)){
      if (delta > 0)
        newdelta = delta;
      if (delta < 0)
        newdelta = 0
    }
    else {
      //if the change will result in passing over 0
      if(Math.abs(delta) > Math.abs(points[current_id].value)){
        if(points[current_id].value > 0)
          newdelta = points[current_id].value
        else 
          newdelta = points[current_id].value + delta
      }
      else{
        newdelta = delta
      }

    }
    
  }

  points[current_id].value += delta


  
  if(points[current_id].flavor == 'dissent')
    newdelta = - newdelta

  //console.log(points[current_id])
  socket.emit('update',points[current_id]);
  socket.broadcast.emit('update', points[current_id]);

  //current_id = points[current_id].parent_id
  a[current_id] = current_id;


  if(points[current_id].flavor != 'link'){
    //b = a
    //points[current_id].shadow += delta
    for(var i = 0; i < points[current_id].links.length; ++i){
      a = chaseLink(points[current_id].links[i], delta, a, socket)
    }

  }

  return propogate(points[current_id].parent_id, newdelta, a, socket, CommonParent)

}

function addLink(link_id, socket){
  //console.log("=======addLink called!")
  //console.log(link_id)
  points[points[link_id].links[0]].links.push(link_id)
  points[points[link_id].links[1]].links.push(link_id)

  if(hasCycle(points[link_id].links[0], link_id, link_id) || hasCycle(points[link_id].links[1], link_id, link_id)){
    console.log("cycle found!")

    var most_recent, least_recent;

    if(points[link_id].links[0].point_id > points[link_id].links[1].point_id){
      most_recent = points[link_id].links[0]
      least_recent = points[link_id].links[1]
    }
    else{
      least_recent = points[link_id].links[0]
      most_recent = points[link_id].links[1]
    }

    points[most_recent].origin_id = points[most_recent].parent_id
    points[most_recent].parent_id = points[least_recent].parent_id


  }

  points[link_id].CommonParent = findCommonParent(points[link_id].links[0], points[link_id].links[1])

  syncLinks(link_id, socket);

}

function syncLinks(link_id, socket){
  var total = points[points[link_id].links[0]].value + points[points[link_id].links[1]].value
  points[points[link_id].links[0]].shadow = points[points[link_id].links[0]].value
  points[points[link_id].links[1]].shadow = points[points[link_id].links[1]].value

  console.log("total = ", total)
  //points[points[link_id].links[0]].value = points[points[link_id].links[1]].value = total


  //var parent = points[points[link_id].links[0]].parent_id
  var delta1 = points[points[link_id].links[1]].value
  var delta2 = points[points[link_id].links[0]].value


  a = []
  a[link_id] = link_id
  a = propogate(points[link_id].links[0], delta1, a, socket, points[link_id].CommonParent)

  //var parent = points[points[link_id].links[1]].parent_id

  propogate(points[link_id].links[1], delta2, a, socket, points[link_id].CommonParent) 

}

function chaseLink(link_id, delta, a, socket){
  if(a[link_id] !== undefined)
    return a

  a[link_id] = link_id
  a = propogate(points[link_id].links[1], delta, a, socket)
  return propogate(points[link_id].links[0], delta, a, socket)

}

//returns the common parent node or null if it doesn't exist.  
function findCommonParent(first_id, second_id){
  a = []
  findCommonParentHelper(first_id, a)
  return findCommonParentHelper(second_id, a)
}

function findCommonParentHelper(point_id, a){

  if(point_id == null || a[point_id] !== undefined) 
    return point_id

  a[point_id] = point_id
  return findCommonParentHelper(points[point_id].parent_id, a)
}

function hasCycle(current_id, last_id, link_id){
  if(current_id == link_id)
    return true
  if(current_id == null)
    return false

  for(var i = 0; i < points[current_id].links.length; ++i){
    if(points[current_id].links[i] != last_id)
      if(hasCycle(points[current_id].links[i], current_id, link_id))
        return true
  }

  return hasCycle(points[current_id].parent_id, current_id, link_id)
}
