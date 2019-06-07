"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const bodyParser = require("body-parser");
const server_1 = require("../server");
let router = express.Router();
router.use(bodyParser.json()); // for parsing application/json
/*
In order to prepare mock server to respond to requests it shall be configured first
Send an http POST request to /mock/configuration endpoint with an array of MockedRequest
Each MockedRequest element will be stored in global variable mockConfiguration as a key:value pair
As a key MockedRequest.url will be used (url+params string)
As a value MockedRequest item itself will be stored
Each time POST /mock/configuration request is sent to mock server both previous configuration and history get cleared
If all will go well, a response with status code 200 will be sent back

Example:
POST http://localhost:3000/mock/configuration
Request body: [
{
url: '/one',
method: 'POST',
status: 200,
response: {foo: 'bar'},
},
{
url: '/two',
method: 'GET',
status: 200,
contentType: 'png',
}]
 */
router.post("/configuration", function (req, res) {
    server_1.mockConfiguration.length = 0;
    server_1.mockHistory.length = 0;
    if (req.body.length > 0) {
        var body = req.body;
        body.forEach(function (element) {
            server_1.mockConfiguration.push(element);
        });
        res.status(200).send('configuration saved');
    }
    else {
        res.status(200).send('history and configuration cleared');
    }
});
/*
Returns a list of all requests that were sent to mock server (excluding requests to /mock/*)
 */
router.get("/history", function (req, res) {
    res.json(server_1.mockHistory);
});
/*
Returns a list of all requests that are prepared on mock server
 */
router.get("/configuration", function (req, res) {
    res.json(server_1.mockConfiguration);
});
/*
Returns 400 for all other requests sent to /mock
 */
router.all("/*", function (req, res) {
    res.status(400).send('request not found');
});
exports.default = router;
//# sourceMappingURL=mock.js.map
