Router.configure({
   layoutTemplate: 'layout'
 });

Router.route('/', function () {
  this.render('topics');
});

Router.route('/view/:_id', function () {
  var target = Nodes.findOne({_id: this.params._id}) || Links.findOne({_id: this.params._id});
  if(target)
    this.render('view', {target_id: target});
  else
  	this.render('notfound');
});

Router.route("/user/:_username", function () {
  var user = Meteor.users.findOne({username:this.params._username});
  if(user)
    this.render('user');
  else
    this.render('notfound');
});

Router.route("new", function () {
	this.render("newtopic");
});

Router.route("what", function () {
	this.render("what");
});

Router.route("how", function () { 
	this.render("how");
});

Router.route("prefs", function () {
  this.render("preferences");
});

Router.route("newpie", function () {
  this.render("newpie");
})

Router.route("shame", function () {
  this.render("shame");
});

Router.route("chat", function () {
  this.render("chat");
});
