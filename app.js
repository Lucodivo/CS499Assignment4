var elasticsearch = require('elasticsearch');

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