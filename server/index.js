// Importing necessary modules to build web server and GUN network protocols
const express = require('express');
const Gun = require('gun');
const http = require('http');

// Initialize application instance and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize new instance of a GUN node and help it attach to the HTTP server
const gun = Gun({
    web: server,
    radisk: false,
    localStorage: false
});

// Starting the engine
const PORT = process.env.PORT || 8765;

server.listen(PORT, () => {
    console.log('[Signaling Server] Relay node activity on port ${PORT}');
    console.log('[Signaling Server] Peer URL: http://localhost:${PORT}/gun');
});