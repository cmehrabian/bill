
# Rhombus 

If you don't know what's going on here, I strongly recommend you start with the wiki.

A current working iteration of Rhombus is currently up at 

This was all built primarily with nodejs, angularjs, socketio, mongodb, and springyjs (a force-directed
graph library.)

## Getting started
Install the following packages:  
	* nodejs  
	* mongodb
For OS X using Homebrew do:  
```sh
$ brew install nodejs mongodb
```  
For Ubuntu and derivatives do:  
```sh
$ sudo apt-get install nodejs mongodb
```

For Arch do:  
```sh
$ sudo pacman -S nodejs mongodb
```
Next install node package dependencies:  
```sh
$ npm install
```
To run the app do:  
```sh
$ node app.js
```

## Use model

Relevant clients send a request for a node, and the response is the node and some amount of adjacent graph. Graphs (posts and their conversations) may or may not be connected to other graphs.  Users may have full, partial, or no overlap with other users in terms of the graphs they are looking at.  Users might disconnect at any time without warning.  

Things I considered architectural necessities:
- Clients must be able to talk in real-time
- Every node should be http linkable
- The server does not do database writes for every node added to the graph (If a single node is added it is possible that a large amount of nodes need to be changed.)

Things I considered worthy of future consideration for scalability:
- Clients might want to only be looking at part of a graph at any given time.

## Fantasy design

When a user requests a node, the server queries the database for the node, the adjacent graph, and everything that any modifications to the adjacent graph would affect.  The server gives the client the node and adjacent graph but keeps all of the results of the request in memory.  When a new node is created, the client sends the new node to the server, and the server propagates the new value through the graph.  Then, if a modified node has a "watcher" listed on it (it should have at least one e.g. the client that submitted the new node), then that newly modified node is sent to the watcher.  Note that it's important that all the updates to each individual client per modification should be done in one chunk to save time.  

If socket.io senses a user disconnect then all references on any nodes that that user is watching is cleaned up.  If a node no longer has any watchers then it is written to the database and removed from program memory.  

## Actual implementation

This is what I actually built to get it to work:

If the amount of clients connected to the entire website becomes nonzero, the database is queried for ALL nodes, and they are loaded into program memory.  All changes are made to the local versions of the nodes, and when the amount of clients becomes 0 again, everything is written back.  

Also, I never implemented the "link" response style because it's harder than all the other ones combined and I wanted to think more about them.  

## Details

Ostensibly, the net assent of a node is the sum of the values of all of its agreeing children subtracted by all the sum of the values of all the disagreeing children.  However, because it would be wasteful to recompute the tree every time a new node is added, the new node instead "propagates" its value upward, so that non-affected nodes don't have to be visited. 

The only real nodejs based request handler is for index.html.  All of the actual data transfer and state 
changes are done in socket.io, in the file sockets.js.  I did this because angular templates allow client-side
state to change independent of the server, so using traditional async seemed unnecessarily restricting.

## Closing

There are a lot of interdependent ideas in here so the layout of this document is a bit haphazard.  Feedback on what I can do to improve this would be very appreciated.  Feedback in general is very appreciated.  

Also, the site is up at rhombus-forum.herokuapp.com
