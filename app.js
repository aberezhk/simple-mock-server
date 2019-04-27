var express = require("express");
var mockRouter = require('./routes/mock');
var appRouter = require('./routes/index');
var app = express();

app.set('port', process.env.PORT || 3000); // get port from environment or use 3000 by default

app.use('/mock', mockRouter); // redirect all requests starting with /mock to mock-router
app.use('/', appRouter); // use app router for all other requests

/*
Start mock server on some port
To specify the port run mock server as ex.: PORT=3000 node app.js
Otherwise port 3000 will be used by default
 */
app.listen(app.get('port'), function () {
    global.mockConfiguration = {}; //to store current configuration of mock server
    global.mockHistory = []; // to store all the requests that were done to mock server
    console.log(`Mock server running on port ${app.get('port')}`);
});

module.exports = app;
