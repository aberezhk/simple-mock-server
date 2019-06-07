import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import mockRouter from './routes/mock-router'
import restRouter from './routes/rest-router'
import * as proxy from 'express-http-proxy';
import {MockedRequest} from "./models/mocked-request";
import {findWsMessage} from "./ws-middleware";

let mockConfiguration: MockedRequest[] = [];
let mockHistory: {}[] = [];
export {mockHistory as mockHistory, mockConfiguration as mockConfiguration};

let app = express();
app.set('port', process.env.PORT || 3000); // get port from environment or use 3000 by default
app.set('server', process.env.SERVER || undefined);

//initialize a simple http server
const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({server});

app.use('/mock', mockRouter); // redirect all requests starting with /mock to mock-router
app.use('/', restRouter); // use app router for all other requests
if (app.get('server')) { // if mock was started with SERVERPORT, then all not configured requests will be
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
    app.use('/',
        proxy(`${app.get('server')}`, {}));
}

wss.on('connection', async (ws: WebSocket) => {
    //connection is up, let's add a simple simple event
    ws.on('message', async (message) => {
        mockHistory.push({method: 'WS', message});
        let element = await findWsMessage(message as string);
        if (element !== undefined) {
            ws.send(element.response);
        } else {
            if (app.get('server') !== undefined) {
                // proxy
            } else {
                ws.send('no match for ws message found')
            }
        }
    });
    ws.send("connected");
});

//start our server
server.listen(app.get('port'), () => {
    mockConfiguration = []; //to store current configuration of mock server
    mockHistory = []; // to store all the requests that were done to mock server
    console.log(`Server: Mock server running on port ${app.get('port')} with server ${app.get('server')}`);
});
