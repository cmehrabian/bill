
//var app = require('./app')
var _ = require('lodash');
var schemata = require('./schemata')



var points = undefined 
var last_point_id = undefined //such a paradox

exports.init = function(callback){

  var done = _.after (2, callback)

  schemata.lastid.find(function(err, id){
    if (err) return console.error(err)

    if(last_point_id === undefined){
      last_point_id = 0
    }
    else{
      last_point_id = id[0].last_point_id
    }
    console.log('returned from query:')
    console.log(id)

    var query = schemata.lastid.remove()
    query.exec()

    done()
  })

  schemata.point.find(function(err, p){
    if(err) return console.error(err)
    points = p

    var query = schemata.point.remove()
    query.exec()

    done()
  })

}

exports.getOriginals = function(callback){
  callback(_.where(points, {original:true}))
}


exports.request = function(request_id, callback){
  //console.log('data:')
  //console.log(data)
  var point = _.find(points, {point_id:request_id})
  if(point === undefined){
    callback([])
  }
  else{
    callback(_.where(points, {root:point.root}))
  }
  
}

exports.new_point = function(data, callback){
  data.point_id = ++last_point_id

  data.root = data.point_id

  points.push(data)

  var delta = 1

  if(data.flavor == 'quote')
    delta = 0

  a = []
  a = propogate(data, a, delta)

  var parent = _.find(points, {point_id: data.parent})
  if(parent !== undefined){
    data.root = parent.root
    parent.children.push(data.point_id)
  }
    /*
    var modifiedparent = _.find(a, {point_id:data.parent})
    if(modifiedparent === undefined)
      a.push(parent)
  }
*/
  var notify = []


  callback(a)
}

exports.cleanup = function(callback){
  _.forEach(points, function(point){
    var p = new schemata.point({ 
      username:point.username,
      value:point.value,
      time:point.time,
      flavor:point.flavor,
      text:point.text,
      parent:point.parent,
      children:point.children,
      links:point.links, 
      original:point.original,
    })
    p.save(function(err, p){
      if (err) return console.error(err)
    })
  })

  var id = new schemata.lastid({
    last_point_id:last_point_id
  })

  id.save(function(err, id){
    if (err) return console.error(err)
  })
}

var propogate = function(n, a, delta){
  if (n === undefined || _.find(a, n) !== undefined || delta == 0)
    return a

  n.propogated++
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

  var parent = _.find(points, {point_id:n.parent})
  a = propogate(parent, a, newdelta)

  return a

}

var pos = function(value){
  if(value > 0)
    return value;
  else
    return 0

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

//archive
/*
      if(num_watchers == 0){
        var lastpoint_id = new mid({
          lastpoint_id:points.getLastId()
        })


      lastpoint_id.save(function(err, lastpoint_id){
          if (err) return console.err(err)
          console.log('saved last point as:')
          console.log(lastpoint_id)
        })
      }


*/


/*
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
*/


/*
  var query_recur = function(err, n, a){
    if(point_id === undefined || _.find(a, {point_id:point_id}) !== undefined)
      return

    mNode.find({point_id:point_id}, function(err, o){
      if (err) return console.error(err);
      console.log('database lookup for id ' + point_id + ' found:')
      console.log(o)
      a.push(o)
      found = o
      _.forEach(found.children, function(child){
        query_recur(child, a)
      })

      query_recur(found.parent, a)

    })
    //console.log('query_recur so far:')
    //console.log(a)
  }


});


*/
