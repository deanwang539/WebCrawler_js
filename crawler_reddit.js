var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');

var START_PAGE = "https://www.reddit.com/r/MyCastleFE/";
var MAX_PAGES_TO_VISIT = 10;
var SEARCH_WORDS = ['orochi', 'hoshido'];
var url = new URL(START_URL);
var baseUrl = url.protocol + "//" + url.hostname;
var numPageVisited = 0;
var resRank = [];

visitPage(START_PAGE);

function visitPage(url) {
  request(url, function (error, response, body) {
    console.log("Status code: " + response.statusCode);
    // Handle errors
    if (error) {
      console.log("Error: " + error);
    }else if (!error && response.statusCode == 200) {
      // Parse the document body
      var $ = cheerio.load(body);
      $('div#siteTable > div.link').each(function(index) {
        var rank = $(this).find('span.rank').text().trim();
        var title = $(this).find('div.entry > p.title > a.title').text().trim();
        var user = $(this).find('div.entry > p.tagline > a.author').text().trim();
        // Search matches
        for(word in SEARCH_WORDS) {
          if(title.toLowerCase().indexOf(SEARCH_WORDS[word])!==-1)
            resRank.push(rank);
        }
        console.log("Rank: " + rank);
        console.log("Title: " + title);
        console.log("User: " + user);
        fs.appendFileSync('reddit.txt', rank + '. ' + title + '\n' + user + '\n\n');
      });
      // Visit next page
      numPageVisited++;
      if(numPageVisited<MAX_PAGES_TO_VISIT)
        visitPage($('span.next-button > a').attr('href'));
      else
        console.log(resRank);
    }
  });
}
