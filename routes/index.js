const express = require('express');
var minimatch = require("minimatch");
const fs = require('fs');
const path = require('path');
const url = require('url');
const router = express.Router();

/*
store all requests that come to this router in global variable mockHistory
Following request attributes are recorded: originalUrl, method, headers, body
 */
router.use(function (req, res, next) {
    mockHistory.push({
        url: req.originalUrl,
        path: req.path,
        query: req.query,
        method: req.method,
        headers: req.headers,
        body: req.body});
    next();
});

/*
Handles all the requests that were done to mock server, excluding those prefixed with /mock
This function finds a response for incoming request if
an item with key = (url+params of the incoming request) exists in mockConfiguration.
If an item was found then
1. specified file (contentType was set to either jpg, png or video) will be sent in response
2. response with specified body and status will be sent
If timeout was defined for given response function will wait for defined number of milliseconds before sending response
Following errors are possible:
400 - url+params string was not found in mockConfiguration (
    case when mock was started without SERVER var, otherwise request will be proxied to SERVER)
404 - there is no file for the defined contentType
 */
router.all('/*', async function (req, res, next) {
    var element = findMockedRequest(req);
    if (element === undefined) {
        if (req.app.get('server') !== undefined){
            next(); // go to next app router (proxy) if mock is started with SERVER var
        } else {
            res.status(400).send('request not found');
        }
    } else {
        if (element.delay) {
            await new Promise(resolve => setTimeout(resolve, element.delay));
        }
        if ((element.contentType === undefined) || (element.contentType === '')) {
            res.status(element.status).json(element.response);
        } else {
            const filePath = path.join(__dirname, `../data/test.${element.contentType}`);
            fs.access(filePath, error => {
                if (!error) {
                    res.sendFile(filePath);
                } else {
                    res.status(404).send(`${filePath} does not exist`)
                }
            });
        }
    }
});

// try first to find exact url + params + method match, if not find, try to search by regexp
function findMockedRequest(req) {
    var element = mockConfiguration.filter( (element) => {
        return ((element.url === req.originalUrl) && (element.method === req.method));
    })[0];
    if (element){
        return element;
    } else {
        element = mockConfiguration.filter( (element) => {
            return (minimatch(req.originalUrl, element.url) && (element.method === req.method));
        })[0];
    }
    return element;
}

module.exports = router;
