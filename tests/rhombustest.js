
// Currently the tests are used for keeping track of all 
// the Rhombus logic.  

var should = require('should');
var rhombus = require('../rhombus');
var _ = require('lodash');

describe('rhombus', function(){


	var one = {
		username:'Nancy',
		value:0,
		ghostvalue:0,
		time:_.now(),
		flavor:'comment',
		text:'Hello!',
		parent:null,
		children:[],
		links:[],
		linkhelpers:[],
		original:true,
		propagated:0
	}

	var two = {
		username:'Jeff',
		value:0,
		ghostvalue:0,
		time:_.now(),
		flavor:'assent',
		text:'yee',
		parent:1,
		children:[],
		links:[],
		linkhelpers:[],
		original:false,
		propagated:0
	}

	var three = {
		username:'Marshall',
		value:0,
		ghostvalue:0,
		time:_.now(),
		flavor:'dissent',
		text:'fuckoff, m8',
		parent:2,
		children:[],
		links:[],
		linkhelpers:[],
		original:false,
		propagated:0

	}

	var four = {
		username:'Sawdust',
		value:0,
		ghostvalue:0,
		time:_.now(),
		flavor:'assent',
		text:'oy',
		parent:1,
		children:[],
		links:[],
		linkhelpers:[],
		original:false,
		propagated:0
	}

	var five = {
		username:'Lies',
		value:0,
		ghostvalue:0,
		time:_.now(),
		flavor:'link',
		text:'',
		parent:1,
		children:[],
		links:[],
		linkhelpers:[2, 4],
		original:false,
		propagated:0
	}


	before(function(){
		rhombus.reset();
		//rhombus.init();
	});

	it('should submit one point accurately', function(){
		rhombus.new_point(one, function(modified){
			modified.should.be.ok;
			modified.length.should.be.equal(1);
			modified[0].value.should.be.equal(1);
			modified[0].flavor.should.be.equal('comment');
			modified[0].original.should.be.true;
		});
	});

	it('should propagate an agreement appropriately', function(){
		rhombus.new_point(two, function(modified){
			modified.should.be.ok;
			modified.length.should.be.equal(2);

			modified[0].value.should.be.equal(1);
			modified[0].flavor.should.be.equal('assent');

			modified[1].value.should.be.equal(2);
			modified[1].children.length.should.equal(1);
			modified[1].children.should.containEql(modified[0].point_id);

		});
	});

	it('should propagate a chained disagreement appropriately', function(){
		rhombus.new_point(three, function(modified){
			modified.should.be.ok;
			modified.length.should.be.equal(3);

			//three
			modified[0].point_id.should.equal(3);
			modified[0].value.should.be.equal(1);
			modified[0].flavor.should.be.equal('dissent');

			//two
			modified[1].point_id.should.equal(2);
			modified[1].value.should.be.equal(0);
			modified[1].children.length.should.equal(1);
			modified[1].children.should.containEql(modified[0].point_id);

			//one
			modified[2].point_id.should.equal(1);
			modified[2].value.should.be.equal(1);
			modified[2].children.length.should.equal(1);
			modified[2].children.should.containEql(modified[1].point_id);
		});
	});

	it('should handle a new agreement appropriately', function(){
		rhombus.new_point(four, function(modified){
			modified.should.be.ok;
			modified.length.should.be.equal(2);

			//four
			modified[0].point_id.should.equal(4);
			modified[0].value.should.be.equal(1);
			modified[0].flavor.should.be.equal('assent');

			//one
			modified[1].point_id.should.equal(1);
			modified[1].value.should.be.equal(2);
			modified[1].children.length.should.equal(2);
			modified[1].children.should.containEql(modified[0].point_id);

		})
	});

	it('should link the two agreements appropriately', function(){
		rhombus.new_point(five, function(modified){
			modified.should.be.ok;
			modified.length.should.be.equal(3);

			//four
			modified[0].point_id.should.equal(4);
			modified[0].value.should.be.equal(1);
			modified[0].flavor.should.be.equal('assent');

			//one
			modified[1].point_id.should.equal(1);
			modified[1].value.should.be.equal(2);
			modified[1].children.length.should.equal(2);
			modified[1].children.should.containEql(modified[0].point_id);

		})
	})
});