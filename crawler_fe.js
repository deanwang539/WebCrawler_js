var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');

var START_URL = "https://www.playstation.com/en-us/";
var SEARCH_WORDS = ["uncharted4", "uncharted 4"];
var MAX_PAGES_TO_VISIT = 100;
var pagesVisited = {};
var numPagesVisited = 0;
var pagesToVisit = [START_URL];
var url = new URL(START_URL);
var baseUrl = url.protocol + "//" + url.hostname;

crawl();

function crawl() {
  if(numPagesVisited>=MAX_PAGES_TO_VISIT) {
    console.log("Reached max limit of number of pages to visit.");
    return;
  }

  var nextPage = pagesToVisit.pop();
  if(nextPage in pagesVisited) {
    crawl();
  }else {
    visitPage(nextPage, crawl);
  }
}

function visitPage(url, callback) {
  pagesVisited[url] = true;
  numPagesVisited++;

  // Make the request
  console.log("\nVisiting page " + url);
  request(url, function (error, response, body) {
    console.log("Status code: " + response.statusCode);
    // Handle errors
    if (error || response.statusCode != 200) {
      callback();
      return;
    }else if (!error && response.statusCode == 200) {
      // Parse the document body
      var $ = cheerio.load(body);
      var isWordFound = searchForWord($, SEARCH_WORDS);
      if(isWordFound) {
        console.log('Word ' + SEARCH_WORDS + ' found at page ' + url);
      }else {
        // Word not found on current page
        // Then push all relative links to the pagesToVisit queue
        collectInternalLinks($);
        callback();
      }
    }
  });
}

function searchForWord($, words) {
  var bodyText = $('html>body').text().toLowerCase();
  for(i in words) {
      if(bodyText.indexOf(words[i].toLowerCase())!=-1) return true;
  }
  return false;
}

function collectInternalLinks($) {
  var relativeLinks = $("a[href^='/en-us']");
  console.log("Found " + relativeLinks.length + " relative links on page");
  relativeLinks.each(function() {
        pagesToVisit.push(baseUrl + $(this).attr('href'));
  });
}
