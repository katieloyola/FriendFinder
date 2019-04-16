var path = require("path");
var express = require('express')
var app = express();
var friends = require("./app/data/friends.json")

app.use(express.json());
app.use(express.urlencoded({extended: true}));

var PORT = process.env.PORT || 3000;

app.get("/",function (request, response) {
  console.log("home path is being hit");
  response.sendFile(path.join(__dirname, "./app/public/home.html"))
})
app.get("/survey", function (request, response) {
  console.log("survey path is being hit");
  response.sendFile(path.join(__dirname, "./app/public/survey.html"))
})
app.post("/api/friends", function (request, response) {
  console.log(request.body);
  console.log(friends);
  // Note the code here. Our "server" will respond to a user"s survey result
    // Then compare those results against every user in the database.
    // It will then calculate the difference between each of the numbers and the user"s numbers.
    // It will then choose the user with the least differences as the "best friend match."
    // In the case of multiple users with the same result it will choose the first match.
    // After the test, it will push the user to the database.

    // We will use this object to hold the "best match". We will constantly update it as we
    // loop through all of the options
    var bestMatch = {
      name: "",
      photo: "",
      friendDifference: Infinity
    };

    // Here we take the result of the user"s survey POST and parse it.
    var userData = request.body;
    var userScores = userData.scores;

    // This variable will calculate the difference between the user"s scores and the scores of
    // each user in the database
    var totalDifference;

    // Here we loop through all the friend possibilities in the database.
    for (var i = 0; i < friends.length; i++) {
      var currentFriend = friends[i];
      totalDifference = 0;

      console.log(currentFriend.name);

      // Then loop through all the scores of each friend
      for (var j = 0; j < currentFriend.scores.length; j++) {
        var currentFriendScore = currentFriend.scores[j];
        var currentUserScore = userScores[j];

        // We calculate the difference between the scores and sum them into the totalDifference
        totalDifference += Math.abs(parseInt(currentUserScore) - parseInt(currentFriendScore));
      }

      // If the sum of differences is less then the differences of the current "best match"
      if (totalDifference <= bestMatch.friendDifference) {
        // Reset the bestMatch to be the new friend.
        bestMatch.name = currentFriend.name;
        bestMatch.photo = currentFriend.photo;
        bestMatch.friendDifference = totalDifference;
      }
    }

    //lNOTES

    // Finally save the user's data to the database (this has to happen AFTER the check. otherwise,
    // the database will always return that the user is the user's best friend).
    friends.push(userData);

    // Return a JSON with the user's bestMatch. This will be used by the HTML in the next page
    response.json(bestMatch);
})

app.listen(PORT, function(){
  console.log("hey your server is up and running on Port: " + PORT);
})