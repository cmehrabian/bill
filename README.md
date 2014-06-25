# Rhombus 

A quick word about the overall design- The code right now was made with the intention of getting things 
working but also as a tentative design map.  What I mean by that is that I generally put a lot of thought
into how the thing is designed architecturally but a lot of the implementation details are rushed.  This document has the reasoning I used for all of the architectural choices I could think of, and everything is of course open
to debate.

This is mostly a document on how Rhombus was designed architecturally.  For how Rhombus works, see rhombus.txt.  For what Rhombus is, talk to me.  

This was all built primarily with nodejs, angularjs, socketio, mongodb, and springyjs (a force-directed
graph library.)

## Use model

Here's what I think the use model is in terms of client-server architecture:

Relevant clients send a request for a node, and the response is the node and some amount of adjacent graph. Graphs (posts and their conversations) may or may not be connected to other graphs.  Users may have full, partial, or no overlap with other users in terms of the graphs they are looking at.  Users might disconnect at any time without warning.  

Things I considered architectural necessities:
- Clients must be able to talk in real-time
- Every node should be http linkable
- The server does not do database writes for every node added to the graph (If a single node is added it is possible that a large amount of nodes need to be changed.)

Things I considered worthy of future consideration for scalability:
- Clients might want to only be looking at part of a graph at any given time.


## Fantasy design

This is currently what I believe to be the optimal design given the use model (I would love feedback on this):

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

### Links

Links are tricky.  The first thing to do when a link is made is check to see if a cycle has been created.  This basically means following all parents and links and seeing if you end up where you started.  If so, remove the most recent of the two linked points and propagate its inverse value through the graph.  

If it's not linked, then there are two possibilities.  Either the linked nodes share a common ancestor or they don't.  If they do, it needs to be found.  Consider this graph

A1 -> B
		> D
A2 -> C

And say A1 has a value of 10 and A2 has a value of 4.  When they are linked, the total value of both A1 and A2 goes to 14.  This means that B gets +4 propagated to it and C gets +10.  D, however, already had both the values of A1 and A2 affecting it, and so logically its value shouldn't increase.  So the reason the common parent needs to be found is so we can figure out where to cut off the propagation.  

## todo

Switch databases-
I used mongodb (a relational database) in this version because I was familiar with it and I was confident I could get it to work quickly, but in any sort of final version we're probably going to need some sort of graph-based database.  Neo4j was the candidate I was looking at, but it's up in the air.  

Phase out springy- 
It seems like there are cooler graph libraries out there to use, D3 looked really sexy, but some more research needs to be done

Use a graph library-
I don't mean springy.  Right now graph isn't really a graph at all, it's just a list of objects which contain references to the id field of other objects.  Using a graph library might make things cleaner or faster and better integrate it with the graph database.  

Everything else-
There is quite a lot.  

##closing

There are a lot of interdependent ideas in here so the layout of this document is a bit haphazard.  Feedback on what I can do to improve this would be very appreciated.  Feedback in general is very appreciated.  
