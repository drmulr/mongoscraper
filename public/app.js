// Grab the articles as a json
// $.getJSON("/articles", function(data) {
//     // For each one
//     for (var i = 0; i < data.length; i++) {
//       // Display the apropos information on the page
//       var articleTitle = "<h4 class='mb-1' data-id='" + data[i]._id + "'>" + data[i].title + "</h4>";
//       var articlelink = "<a href=" + data[i].link + ">" + data[i].link + "</a>";
//       var saveButton = '<button type="button" class="btn btn-secondary btn-sm saveButton">' + 'Save Article' + '</button>';
//       // $("#articles").append(articleTitle);
//       // $("#articles").append(articlelink);
//       // $("#articles").append(saveButton);
//       $("#articles").append('<div class="list-group"><a href="' + data[i].link + '" class="list-group-item list-group-item-action flex-column align-items-start"><div class="d-flex w-100 justify-content-between"><h5 class="mb-1">' + articleTitle + '</h5><small>3 days ago</small></div><p class="mb-1">Sample text...possible to insert blurb regarding article, but traversing gizmodo is taking a bit longer than anticipated.</p><small>' +  data[i].link + '</small></a>' + saveButton + '</div>');
//     }
//   });

$("#getArticles").on("click", function () {
  $.ajax({
    method: "GET",
    url: "/scrape"
  }).done(function (data) {
      console.log(data);
      // window.location.href = "/";
      // location.reload();
      $(".modal-body").append("<h6 class='text-center'>You've added " + data.count + " articles!</h6><br><p class='text-center'>Refresh page to see them.</p>");
      $("#addedArticlesModal").modal("show");
    });
});


$(".saveButton").on("click", function () {
  var thisId = $(this).attr("data-id");

  $.ajax({
    method: "POST",
    url: "/saveArticle/" + thisId
  }).done(function (data) {
      console.log(data);
      
      // if ( thisID === ) {
      //   $(this thing).removeClass("btn-outline-primary").addClass("btn-secondary");
      // }

      // $(".saveButton").removeClass("btn-outline-primary").addClass("btn-secondary");
      //HOW TO UPDATE BUTTON TO SAY "SAVED" AFTER CLICK
      // window.redirect("/");

  });
});

// Whenever someone clicks a p tag
// $(document).on("click", "p", function() {
//   // Empty the notes from the note section
//   $("#notes").empty();
//   // Save the id from the p tag
//   var thisId = $(this).attr("data-id");

//   // Now make an ajax call for the Article
//   $.ajax({
//     method: "GET",
//     url: "/articles/" + thisId
//   })
//     // With that done, add the note information to the page
//     .done(function(data) {
//       console.log(data);
//       // The title of the article
//       $("#notes").append("<h2>" + data.title + "</h2>");
//       // An input to enter a new title
//       $("#notes").append("<input id='titleinput' name='title' >");
//       // A textarea to add a new note body
//       $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
//       // A button to submit a new note, with the id of the article saved to it
//       $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

//       // If there's a note in the article
//       if (data.note) {
//         // Place the title of the note in the title input
//         $("#titleinput").val(data.note.title);
//         // Place the body of the note in the body textarea
//         $("#bodyinput").val(data.note.body);
//       }
//     });
// });

// When you click the savenote button
$(document).on("click", "#savenote", function () {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .done(function (data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});
