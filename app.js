const express = require("express");
const mockRouter = require('./routes/mock');
const appRouter = require('./routes/index');
const proxy = require('http-proxy-middleware');
const app = express();

app.set('port', process.env.PORT || 3000); // get port from environment or use 3000 by default
app.set('server', process.env.SERVER|| null);
app.use('/mock', mockRouter); // redirect all requests starting with /mock to mock-router
app.use('/', appRouter); // use app router for all other requests
if (app.get('server')) { // if mock was started with SERVERPORT, then all not configured requests will be
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
    app.use('/',
        proxy({target: `${app.get('server')}`, secure: false, logLevel: 'debug'}));
}


/*
Start mock server on some port
To specify the port run mock server as ex.: PORT=3000 node app.js
Otherwise port 3000 will be used by default
To let mock server proxy requests to another server add SERVER var, ex. : SERVER='https://localhost:443' node app.js
Example to start mock server on port 4000 and enable proxy: SERVER='https://localhost:443' PORT=4000 node app.js
 */
app.listen(app.get('port'), function () {
    global.mockConfiguration = {}; //to store current configuration of mock server
    global.mockHistory = []; // to store all the requests that were done to mock server
    console.log(`Mock server running on port ${app.get('port')}`);
});

module.exports = app;
