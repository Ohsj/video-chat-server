const express = require('express');
const { createServer } = require('http');
const logger = require('./config/winston');
/**
 * @since
 * 201217 | osj4532 | created
 */

const app = express();
const server = createServer(app);
const port = 5000;

app.use('/', (req, res) => {
    res.send('video-chat-server');
});

server.listen(port, () => {
    logger.info(`video-chat-server listening on http://localhost:${port}`);
});