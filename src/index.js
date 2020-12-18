const express = require('express');
const { createServer } = require('http');
const cors = require('cors');
const socket = require('socket.io');
const logger = require('./config/winston');
const advice = require('./aop/advice');
/**
 * @since
 * 201217 | osj4532 | created
 */

const app = express();
const server = createServer(app);
const io = socket(server);
const port = 5000;
const corsOpt = {
    origin: ['http://localhost:3000'],
    credentials: true,
}

app.use(cors(corsOpt))
app.use(advice)

app.get('/', (req, res) => {
    res.send('video-chat-server');
});

io.on('connection', socket => {
    logger.info(`Connecting    [socketId: ${socket.id}, clientIp: ${socket.handshake.address}]`)

    socket.on('join', joinData => {
        const roomClients = io.sockets.adapter.rooms[joinData.roomId] || {length: 0};
        const numberOfClients = roomClients.length;

        logger.info(`Join:   numClients: [${numberOfClients}]`);
        logger.info(`Join: joinUserName: [${joinData.userName}]`);
        if (numberOfClients === 0) {
            logger.info(`${joinData.userName} Creating room ${joinData.roomId} and emitting room_created socket event`);
            socket.join(joinData.roomId);
            socket.emit('room_created', joinData);
        } else if (numberOfClients === 1) {
            logger.info(`${joinData.userName} Joining room ${joinData.roomId} and emitting room_joined socket event`);
            socket.join(joinData.roomId);
            socket.emit('room_joined', joinData);
        } else {
            logger.info(`${joinData.userName} can't join room ${joinData.roomId}, emitting full_room socket event`);
            socket.emit('full_room', joinData);
        }
    });

    socket.on('start_call', (roomId) => {
        logger.info(`Broadcasting start_call event to peers in room ${roomId}`);
        socket.broadcast.to(roomId).emit('start_call');
    });

    socket.on('webrtc_offer', (event) => {
        logger.info(`Broadcasting webrtc_offer event to peers in room ${event.roomId}`)
        socket.broadcast.to(event.roomId).emit('webrtc_offer', event.sdp)
    });

    socket.on('webrtc_answer', (event) => {
        logger.info(`Broadcasting webrtc_answer event to peers in room ${event.roomId}`)
        socket.broadcast.to(event.roomId).emit('webrtc_answer', event.sdp)
    });

    socket.on('webrtc_ice_candidate', (event) => {
        logger.info(`Broadcasting webrtc_ice_candidate event to peers in room ${event.roomId}`)
        socket.broadcast.to(event.roomId).emit('webrtc_ice_candidate', event)
    });
    socket.on("disconnect", () => {
        logger.info(`Disconnecting [socketId: ${socket.id}]`)
    });
});

server.listen(port, () => {
    logger.info(`video-chat-server listening on http://localhost:${port}`);
});