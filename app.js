var elasticsearch = require('elasticsearch');
var request = require('request');
var parseString = require('xml2js').parseString;
var uuidV4 = require('uuid/v4');
const intervalTime = 30 * 60 * 1000; // check every 30 minutes
const fandangoURL = 'http://www.fandango.com/rss/top10boxoffice.rss'

var client = new elasticsearch.Client({
    host: 'https://search-connorahaskins-qnhleamuu6w7343qqcrpoixu3q.us-west-1.es.amazonaws.com/',
    log: 'info'
});

client.ping({
    // ping usually has a 3000ms timeout
    requestTimeout: 5000
}, function (error) {
    if (error) {
        console.trace('elasticsearch cluster is down!');
    } else {
        console.log('All is well');
    }
});

setInterval(function() {
    fetchUpdate()
}, intervalTime)

function uploadUpdate(items) {
    for(var i = 0; i < items.length; ++i) {
        client.create({
            index: 'cs499a4',
            type: 'top10movies',
            id: uuidV4(),
            body: items[i]
        }, function (error, response) {
            if (error) {
                console.error(error);
            }
        });
    }
}

function fetchUpdate() {
    request(fandangoURL, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // console.log(body);
            parseString(body, function (err, result) {
                // console.dir(result.rss.channel[0].item);
                console.log("Parsing update data...");
                var data = result.rss.channel[0].item;
                var items = [];
                for(var i = 0; i < 10; ++i) {
                    var periodSplit = data[i].title[0].split(".");
                    var dollarSplit = periodSplit[1].split("$");
                    var title = dollarSplit[0];
                    var revenue = parseFloat(dollarSplit[1] + '.' + periodSplit[2]);
                    var rating = parseFloat(data[i]['fan:fanRating'][0]);
                    var rank = i + 1
                    items.push({
                        'rank' : rank,
                        'title' : title,
                        'revenue' : revenue,
                        'rating' : rating,
                        'timestamp' : Date.now()
                    })
                    console.log(rank, title, revenue, rating);
                }
                uploadUpdate(items);
            });
        } else {
            console.log("Error in acquiring update");
        }
    })
}