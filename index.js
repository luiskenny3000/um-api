// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var ParseDashboard = require('parse-dashboard');
var path = require('path');

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://heroku_kvq2tv5d:39p6l2ff469nkkk35aperhb7e5@ds143340.mlab.com:43340/heroku_kvq2tv5d',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
  masterKey: process.env.MASTER_KEY || '', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',  // Don't forget to change to https if needed
  liveQuery: {
    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
  }
});

var dashboard = new ParseDashboard({
    "apps": [
        {
            "serverURL": process.env.SERVER_URL || 'https://um-api.herokuapp.com:1337/parse',
            "appId": process.env.APP_ID || 'myAppId',
            "masterKey": process.env.MASTER_KEY || '',
            "appName": "um-api"
        }
    ]
    /*"users": [
        {
            "user": "r.jackson@msn.com",
            "pass": "$2y$10$hl5JbSOE8uZ6mx0Av8wXG.LXNaIje/i.dPeCTDc4uZG3UgnxVFXs2"
        },
        {
            "user": "develop@clinpays.com",
            "password": "$2y$10$0ThyXquTXBxsaJ27QCM.v.exlFXNmiASVBBCX8emnny3F5SWm59gq"
        }
    ],
    "useEncryptedPasswords": true*/
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);
app.use('/dashboard', dashboard);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('Make sure to star the parse-server repo on GitHub!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
