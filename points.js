
var app = require('./app')
var _ = require('lodash');

var points = []
var last_point_id = -1

exports.getTree = function(point_id){
  //data.point_id = 
  //get from database
  console.log('starting getTree')
  console.log(points)
  console.log('finding ' + point_id)
  var a = []
  return getConnected(point_id, a)
}

exports.setLastId = function(point_id){
  if(point_id === undefined){
    return -1
    console.log('gave me a bum point_id')
  }
  last_point_id = point_id
  console.log('point_id set: ' + point_id)
}

exports.getLastId = function(){
  return last_point_id
}

//will have to do database queries later 
//also have to modify to follow links
//and maybe modify to have limited range?
var getConnected = function(point_id, a){
  if(point_id === undefined || _.find(a, {point_id:point_id}) !== undefined)
    return a

  //Object.prototype.toString.call(point_id)
  //Object.prototype.toString.call(points[0].point_id)
  var elem = _.find(points, {'point_id':point_id})
  if(elem === undefined){
    console.log('elem undefined')
    console.log(point_id)
    //console.log(points[0].point_id)
    //console.log(point_id == points[0].point_id)
    return a
  }

  console.log('inside getConnected:')
  console.log(a)
  a.push(elem)
  _.forEach(elem.children, function(child){
    a = getConnected(child, a)
  })
  return getConnected(elem.parent, a)
}

exports.removeRefs = function(socket){
  a = []
  _.forEach(points, function(point){
    point.watchers = _.pull(point.watchers, socket)
    if(point.watchers.length == 0){
      console.log('point ' + point.point_id + ' is no longer being watched.')
      //save to database
      points = _.pull(points, point)
      a.push(point)
    }
  })
  return a
}

exports.respond_point_id = function(){
  return ++last_point_id
}

exports.new_node = function(socket, data){
  data.point_id = ++last_point_id

  points.push(data)
  console.log('pushed')
  console.log(data)
  var delta = 1

  if(data.flavor == 'quote')
    delta = 0

  a = []
  a = propogate(data, a, delta)


  var notify = []

  data.watchers = []

  if(points[data.parent] !== undefined){
    points[data.parent].children.push(data.point_id)
    data.watchers = points[data.parent].watchers
  }
  else{
    data.watchers.push(socket)
  }

  _.forEach(a, function(point){
    _.forEach(point.watchers, function(w){
      var not = _.find(notify, {watcher:w})
      if(not === undefined){
        not = {}
        not.watcher = w
        not.points = []
        notify.push(not)
      }
      not.points.push(point)
    })
    delete point.watchers
  })


  _.forEach(notify, function(chain){
    chain.watcher.emit('update', chain.points)
    _.forEach(chain, function(not){
      if(not.watchers === undefined)
        not.watchers = []
      not.watchers.push(chain.watcher)

    })
  })

  console.log('after node processed')
  console.log(points)

}

var propogate = function(n, a, delta){
  if (n == undefined || _.find(a, n) !== undefined || delta == 0)
    return a

  a.push(n)

  //the amount of change above 0
  var newdelta = pos(n.value + delta) - pos(n.value)

  n.value += delta
  n.modified = true

  if(n.flavor == 'dissent')
    newdelta = -newdelta
  if(n.flavor == 'comment')
    newdelta = 0
  if(n.flavor == 'quote')
    newdelta = delta

  a = propogate(points[n.parent], a, newdelta)

  return a

}

var pos = function(value){
  if(value > 0)
    return value;
  else
    return 0

}

exports.new_point = function(socket, data){
	      //data.point_point_id = ++lastpoint_point_id
  data.point_point_id = points.length

  if(data.parent_point_id == data.point_point_id ||
   (data.parent_point_id != null && points[data.parent_point_id] === undefined)){
    console.log("client-spoint_ide error")
    return
  }

  if(data.flavor == 'link')
    data.parent_point_id = null


  if(data.parent_point_id != null)
  { 
    points[data.parent_point_id].children.push(data)
  }

  if(data.flavor =='quote')
    data.value = 0
  else
    data.value = 1
  


  points[data.point_point_id] = data

  socket.emit('update',points[data.point_point_id]);
  socket.broadcast.emit('update', points[data.point_point_id])
  //console.log(points[data.point_point_id])

  if(data.flavor == 'link'){
    addLink(data.point_point_id, socket)
  }
  else{

    a = []
    //var current_point_id = data.point_point_id 
    if(data.flavor == 'assent'){
      propogate(data.parent_point_id, 1, a, socket)
    }
    if(data.flavor == 'dissent'){
      propogate(data.parent_point_id, -1, a, socket)
    }

  }
    socket.emit('update_finished');
    socket.broadcast.emit('update_finished');

}


exports.reset = function(){
	points = []
}

function addLink(link_point_id, socket){
  //console.log("=======addLink called!")
  //console.log(link_point_id)
  points[points[link_point_id].links[0]].links.push(link_point_id)
  points[points[link_point_id].links[1]].links.push(link_point_id)

  if(hasCycle(points[link_point_id].links[0], link_point_id, link_point_id) || hasCycle(points[link_point_id].links[1], link_point_id, link_point_id)){
    console.log("cycle found!")

    var most_recent, least_recent;

    if(points[link_point_id].links[0].point_point_id > points[link_point_id].links[1].point_point_id){
      most_recent = points[link_point_id].links[0]
      least_recent = points[link_point_id].links[1]
    }
    else{
      least_recent = points[link_point_id].links[0]
      most_recent = points[link_point_id].links[1]
    }

    points[most_recent].origin_point_id = points[most_recent].parent_point_id
    points[most_recent].parent_point_id = points[least_recent].parent_point_id


  }

  points[link_point_id].CommonParent = findCommonParent(points[link_point_id].links[0], points[link_point_id].links[1])

  syncLinks(link_point_id, socket);

}

function syncLinks(link_point_id, socket){
  var total = points[points[link_point_id].links[0]].value + points[points[link_point_id].links[1]].value
  points[points[link_point_id].links[0]].shadow = points[points[link_point_id].links[0]].value
  points[points[link_point_id].links[1]].shadow = points[points[link_point_id].links[1]].value

  console.log("total = ", total)
  //points[points[link_point_id].links[0]].value = points[points[link_point_id].links[1]].value = total


  //var parent = points[points[link_point_id].links[0]].parent_point_id
  var delta1 = points[points[link_point_id].links[1]].value
  var delta2 = points[points[link_point_id].links[0]].value


  a = []
  a[link_point_id] = link_point_id
  a = propogate(points[link_point_id].links[0], delta1, a, socket, points[link_point_id].CommonParent)

  //var parent = points[points[link_point_id].links[1]].parent_point_id

  propogate(points[link_point_id].links[1], delta2, a, socket, points[link_point_id].CommonParent) 

}

function chaseLink(link_point_id, delta, a, socket){
  if(a[link_point_id] !== undefined)
    return a

  a[link_point_id] = link_point_id
  a = propogate(points[link_point_id].links[1], delta, a, socket)
  return propogate(points[link_point_id].links[0], delta, a, socket)

}

//returns the common parent node or null if it doesn't exist.  
function findCommonParent(first_point_id, second_point_id){
  a = []
  findCommonParentHelper(first_point_id, a)
  return findCommonParentHelper(second_point_id, a)
}

function findCommonParentHelper(point_point_id, a){

  if(point_point_id == null || a[point_point_id] !== undefined) 
    return point_point_id

  a[point_point_id] = point_point_id
  return findCommonParentHelper(points[point_point_id].parent_point_id, a)
}

function hasCycle(current_point_id, last_point_id, link_point_id){
  if(current_point_id == link_point_id)
    return true
  if(current_point_id == null)
    return false

  for(var i = 0; i < points[current_point_id].links.length; ++i){
    if(points[current_point_id].links[i] != last_point_id)
      if(hasCycle(points[current_point_id].links[i], current_point_id, link_point_id))
        return true
  }

  return hasCycle(points[current_point_id].parent_point_id, current_point_id, link_point_id)
}
