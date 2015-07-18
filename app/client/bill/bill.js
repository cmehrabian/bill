// Template.bill.created(function () {
//   // var listofcongress = {};
//
// });

Template.bill.rendered = function(){
  var congress = []
  $.getJSON('https://www.govtrack.us/api/v2/role?current=true&format=json&fields=title_long,person__firstname,person__lastname&limit=6000', function(data) {
    Congress.insert(data.objects);
  });

}
