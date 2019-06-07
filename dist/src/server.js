"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const mock_router_1 = require("./routes/mock-router");
const rest_router_1 = require("./routes/rest-router");
const proxy = require("express-http-proxy");
const ws_middleware_1 = require("./ws-middleware");
let mockConfiguration = [];
exports.mockConfiguration = mockConfiguration;
let mockHistory = [];
exports.mockHistory = mockHistory;
let app = express();
app.set('port', process.env.PORT || 3000); // get port from environment or use 3000 by default
app.set('server', process.env.SERVER || undefined);
//initialize a simple http server
const server = http.createServer(app);
//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });
app.use('/mock', mock_router_1.default); // redirect all requests starting with /mock to mock-router
app.use('/', rest_router_1.default); // use app router for all other requests
if (app.get('server')) { // if mock was started with SERVERPORT, then all not configured requests will be
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
    app.use('/', proxy(`${app.get('server')}`, {}));
}
wss.on('connection', (ws) => __awaiter(this, void 0, void 0, function* () {
    //connection is up, let's add a simple simple event
    ws.on('message', (message) => __awaiter(this, void 0, void 0, function* () {
        mockHistory.push({ method: 'WS', message });
        let element = yield ws_middleware_1.findWsMessage(message);
        if (element !== undefined) {
            ws.send(element.response);
        }
        else {
            if (app.get('server') !== undefined) {
                // proxy
            }
            else {
                ws.send('no match for ws message found');
            }
        }
    }));
    ws.send("connected");
}));
//start our server
server.listen(app.get('port'), () => {
    exports.mockConfiguration = mockConfiguration = []; //to store current configuration of mock server
    exports.mockHistory = mockHistory = []; // to store all the requests that were done to mock server
    console.log(`Server: Mock server running on port ${app.get('port')} with server ${app.get('server')}`);
});
//# sourceMappingURL=server.js.map