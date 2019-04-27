# Mock server 

This mock server will reply to requests sent to it by your app based on the prepared configuration.

* Mock server records all the request it receives and provides the log on HTTP GET request to /mock/history
* Mock server can be configured with HTTP POST request to /mock/configure endpoint.
* It can also provide its current configuration via HTTP GET request to /mock/configure endpoint.

In current version mock server can provide either a response with json body
or an jpg, png or mp4 file.

### Prerequisites
To use this mock server [Node](https://nodejs.org/en/) must be installed

### Installing
Checkout this project from git and navigate to the project folder
* Install dependencies by running ``` npm install ```
* To start the mock server on port 3000 (default) simply run: ``` npm start ```
* To run mock server on other port run: ``` PORT:1234 node app.js ``` . Replace '1234' with desired port number

Wait till 'Mock server running on port XXXX' message will appear in console.

### Configure mock server

In order to configure a mock server an http POST request to /configuration endpoint shall be sent.
_Each time mock server get configured all previous configuration and history will be cleared._

Request body shall contain an array of json elements with following values:
* **url**: string, url for which to expect a call from the app, including params string
* **method**: string, http method {GET, POST, PUT, DELETE}
* **status**: number, which status shall be returned in response {200, 400, etc}
* **timeout?**: number, to wait defined time before responding
* **contentType?**: string, to return img or video back {png, jpg, mp4} see test-data folder; leave empty if no file shall be sent back
* **responseBody?**: {} , response json body to be returned for given request }

An example of a request:
```
 POST http://localhost:3000/mock/configuration
 Body: 
 [{
   "url": "/one",
   "method": "GET",
   "status": 200,
   "responseBody": { "test": "get one" }
 },
 {
   "url": "/two",
   "method": "POST",
   "status": 200,
   "timeout": 5000,
   "responseBody": { "test": "post two" }
 },
 {
   "url": "/img",
   "method": "GET",
   "status": 200,
   "contentType": "jpg"
 },
 {
   "url": "/bad",
   "method": "GET",
   "status": 403,
 "responseBody": {
   "test": "bad request test"
 }
 }
 	]
```

## Some useless info

Mock server consists of following items: app.js, mock.js and index.js

#### app.js
app.js exports express application. By default application will be listening on port 3000.
On start two global variables are created: mockConfiguration and mockHistory.
* **mockConfiguration** stores current mock configuration as an array of key:value pairs. 
As a key url+params string of each element provided in the body of POST /mock/configuration request will be used.
As a value item itself will be stored.
* **mockHistory** stores all requests that come to mock server, excluding those prefixed with '/mock'.
Following request attributes are recorded: originalUrl, method, headers, body

app.js routes all requests prefixed with '/mock' to mock.js router.
All other requests are routed to index.js

#### mock.js
mock.js handles requests that are prefixed with /mock ``` example: http://localhost:3000/mock/configuration ``` and 
has following endpoints:
* **POST /mock/configuration** - allows to define url:response pairs to be handled by mock
````
Request: 
POST http://localhost:3000/mock/configuration
Body: 
[
    {
        "url": "/one",
        "method": "GET",
        "status": 200,
        "responseBody": {
            "test": "get one"
    },
] 
Response:
200 : configuration saved
````
* **GET /mock/configuration** - returns a json body with currently stored url:response pairs
````
Request: 
GET http://localhost:3000/mock/configuration
Response: 200
{
    "/one": {
        "url": "/one",
        "method": "GET",
        "status": 200,
        "responseBody": {
            "test": "get one"
        }
    },
 }
200 : configuration saved
````

* **GET /mock/history** - returns an array of all requests made to mock server (excluding prefixed with /mock).
Following request attributes are recorded: originalUrl, method, headers, body.
````
Request: 
GET http://localhost:3000/mock/history
Response: 200
[
    {
        "url": "/one",
        "method": "GET",
        "headers": {
            "user-agent": "PostmanRuntime/7.11.0",
            "accept": "*/*",
            "cache-control": "no-cache",
            "host": "localhost:3000",
            "accept-encoding": "gzip, deflate",
            "connection": "keep-alive"
        },
        "body": {}
    }
]
200 : configuration saved
````

#### index.js
index.js logs and provides a response to all requests sent to the mock server that are not prefixed with /mock
Currently incoming requests are mapped to defined responses by url+params string only,
 thus different responses for the same url (but for example different http method) can not be configured.
Given response for incoming request was found in mockConfiguration, defined response will be returned:
1. specified file (contentType was set to either jpg, png or video) will be sent in response
2. response with specified body and status will be sent
3. If timeout was defined for given response function will wait for defined number of milliseconds before sending response

Following errors can occur:
* **400: request not found** - no response for requested url was configured 
* **404: ../file not found** - file of requested type is not available in '/data' folder

**Example:**

Given a POST request to http://localhost:3000/mock/configuration with following body was sent:
````
[
    {
        "url": "/one",
        "method": "GET",
        "status": 200,
        "responseBody": {
            "test": "get one"
    },
] 
````

Then 
* on sending **any type of HTTP request** to http://localhost:3000/one the response will be: 
```` 200 : {"test": "get one"} ````
* on sending request to any other url (ex: http://localhost:3000/two) the response will be: 
```` 400 : request not found ````

## Built With

* [Node](https://nodejs.org/en/)  - JavaScript runtime built
* [Express](https://expressjs.com/) - web application framework for Node.js

## Authors

[Anna Berezhkova](https://www.linkedin.com/in/annaberezhkova/)

## License

This project is licensed under the MIT License