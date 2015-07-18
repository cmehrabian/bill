Template.bill.onRendered(function () {
  var url = "https://www.govtrack.us/api/v2/role?current=true&format=json&fields=title_long,person__firstname,person__lastname&limit=6000";
  // $.get(url, function(data){
  //   console.log(data)
  console.log("test");
  congress.insert(url);
});
