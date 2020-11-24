import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';

const app = express();
var os = require('os');
var pty = require('node-pty');

//initialize a simple http server
const server: any = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

var ptyProcess: any = {};


wss.on('connection', (ws: WebSocket) => {

    //connection is up, let's add a simple simple event
    ws.on('message', (message: string) => {

        //log the received message and send it back to the client
        console.log('received: %s', message);
        ws.send(`Hello, you sent -> ${message}`);
    });
    var shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

    ptyProcess = pty.spawn(shell, [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: process.env.HOME,
        env: process.env
    });

    ptyProcess.on('data', function (data) {
        ws.send(data);
    });
    //send immediatly a feedback to the incoming connection
    ws.send('Hi there, I am a WebSocket server \r\n');
});
app.get('/', function (req, res) {
    res.sendFile('index.html', { root: __dirname + "/views" });
});
app.get('/command/:command', (req, res) => {
    const command = req.params.command;
    ptyProcess.write(command + '\r');
})
//start our server
server.listen(process.env.PORT || 8999, () => {
    console.log(`Server started on port ${server.address().port} :)`);
});