const express = require('express');
const http = require('http');

/**
 * @since
 * 201217 | osj4532 | created
 */

const app = express();
const server = http.createServer(app);
const port = 5000;

app.use('/', (req, res) => {
    res.send('video-chat-server');
});

server.listen(port, () => {
    console.log(`video-chat-server listening on http://localhost:${port}`);
});