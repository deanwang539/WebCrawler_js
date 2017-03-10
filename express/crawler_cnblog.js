var _ = require('lodash');
var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var app = express();

var pages, results, pageNum, cntVisits;

function start() {
  app.get('/', function(req, res){
    init();
    collectLinksOnPages(res);
  });
  app.listen('8080');
}

function init() {
  pages = [];
  results = [];
  pageNum = 200;
  cntVisits = 0;
  for(var i=1; i<=pageNum; i++) {
    pages.push("http://www.cnblogs.com/?CategoryId=808&CategoryType=%22SiteHome%22&ItemListActionName=%22PostList%22&PageIndex=" + i + "&ParentCategoryId=0");
  }
}

function collectLinksOnPages(res) {
  pages.forEach(function(page) {
    request(page, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var $ = cheerio.load(body);
        var articleUrls = $('.titlelnk');
        for(var i=0; i<articleUrls.length; i++) {
          results.push(articleUrls.eq(i).attr('href'));
          cntVisits++;
        }
        if(cntVisits==pages.length*20) {
          printLinksOnPages(res);
        }
      }
    });
  });
}

function printLinksOnPages(res) {
  if(_.uniq(results).length==results.length) {
    res.write("Total article length is " + results.length + "\n");
    res.write("---Start---\n");
    for(var j=0; j<results.length; j++) {
      res.write("article url is " + results[j] + "\n");
    }
    res.write("---End---\n");
    res.end();
  } else {
    res.write("Duplicates in results");
    res.end();
  }
}

module.exports.start = start;
