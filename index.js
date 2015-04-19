var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require("fs");
var twitterAPI = require('node-twitter-api');
var Chrome = require('chrome-remote-interface');
Chrome.listTabs(function (err, tabs) {
    if (!err) {
        console.log(tabs);
    }
    console.log(err);
});

var twitter = new twitterAPI({
    consumerKey: 'l9JEJLEOmBylUggIoc3twSBiJ',
    consumerSecret: 'b3PFVQo2srPbpenfiDoN6ZONZe6z2rnst9RYaVuWrpzLTwC2IR',
    callback: 'http://a611467e.ngrok.io/callback'
});

var tok;
var tokSec;
var oauthV;
var accTok;
var accTokSec;

var numKnocks = 0;

app.get("/callback", function(req, res) {
  console.log("callback");
  console.log(req.query.oauth_verifier);
  oauthV = req.query.oauth_verifier;
});

app.get("/status", function(req, res) {
  twitter.getAccessToken(tok, tokSec, oauthV, function(error, accessToken, accessTokenSecret, results) {
    if (error) {
        console.log(error);
    } else {
        //store accessToken and accessTokenSecret somewhere (associated to the user)
        //Step 4: Verify Credentials belongs here
        console.log(accessToken);
        accTok = accessToken;
        console.log(accessTokenSecret);
        accTokSec = accessTokenSecret;
    }
});

});

app.get("/dostatus", function(req, res) {
twitter.statuses("update", {
        status: "HackRU TEST 1!"
    },
    accTok,
    accTokSec,
    function(error, data, response) {
        if (error) {
            // something went wrong
            console.log(error);
        } else {
            // data contains the data sent by twitter
        }
    }
);
});

app.get("/", function(req, res) {
  twitter.getRequestToken(function(error, requestToken, requestTokenSecret, results){
    if (error) {
        console.log("Error getting OAuth request token : " + error);
    } else {
        //store token and tokenSecret somewhere, you'll need them later; redirect user
        tok = requestToken;
        tokSec = requestTokenSecret;
        console.log(tok);
        console.log(tokSec);
        res.redirect('https://api.twitter.com/oauth/authenticate?oauth_token=' + tok);
    }



});
});

var whereTweet;

io.on("connection", function(socket){
  socket.on("url", function(theURL) {
    console.log(theURL);
  });
  socket.on("where", function(where){
    console.log(where);
    whereTweet = "Hey, I am tweeting from " + where;
  });
  socket.on("data", function(stuff){
    //console.log(stuff);
  });
  socket.on("knock", function() {
    numKnocks += 1;
    if(numKnocks >= 4) {
      console.log("Knock");
      numKnocks = 0;
      twitter.statuses("update", {
              status: whereTweet
          },
          accTok,
          accTokSec,
          function(error, data, response) {
              if (error) {
                  // something went wrong
                  console.log(error);
              } else {
                  // data contains the data sent by twitter
              }
          }
      );
      var exec = require('child_process').exec;
var child = exec('twLogin.vbs', function( error, stdout, stderr)
   {
       if ( error != null ) {
            console.log(stderr);
       }
   });

    }
    setTimeout(function() { numKnocks = 0; }, 1200);
  })
});

http.listen(80, function(){
  console.log("Listening on *:80");
});
