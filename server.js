var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var request = require("request");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
// var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/dmscrapermongo";

mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {
  useMongoClient: true
});

// Routes

// HOME ROUTE - DISPLAY ALL ARTICLES
app.get('/', function (req, res) {
  db.Article.find({}).then(function(articles) {
    console.log(articles);
    res.render('index', { articles : articles });
  })
});

// SCRAPE FOR NEW ARTICLES
app.get("/scrape", function(req, res) {
  // Make a request for the news section of ycombinator
  request("https://www.gizmodo.com/", function(error, response, html) {
    // Load the html body from request into cheerio
    var $ = cheerio.load(html);
    var count = 0;
    db.Article.remove({}, function() {
      // For each element with a "title" class
    $(".js_entry-title").each(function(i, element) {
      count++;
      // Save the text and href of each link enclosed in the current element
      var title = $(element).first().text();
      var link = $(element).first().children("a").attr("href");

      // If this found element had both a title and a link
      if (title && link) {
        // Insert the data in the scrapedData db
        db.Article.create({title: title, link: link},
        function(err, inserted) {
          if (err) {
            // Log the error if one is encountered during the query
            console.log(err);
          }
          else {
            // Otherwise, log the inserted data
            console.log(inserted);
          }
        });
      }
    });
      // Send a "Scrape Complete" message to the browser
      res.json({ count: count });
    });
  });
});

// GET ALL SAVED ARTICLES
app.get("/saved", function (req, res) {
  db.Article.find({isSaved: true}).then(function(articles) {
    console.log(articles);
    res.render('saved', { articles : articles });
  })
});


//ARTICLE YOU'RE SAVING, SETS BOOLEAN = TRUE
app.post("/saveArticle/:id", function (req, res){
  db.Article.findOneAndUpdate({_id: req.params.id}, {isSaved:true})
  .then(function(yes) {
    // If we were able to successfully update an Article, send it back to the client
    res.json(yes);
  })
  .catch(function(err) {
    // If an error occurred, send it to the client
    res.json(err);
  });
})




// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article
    .find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article
    .findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note
    .create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});




// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
