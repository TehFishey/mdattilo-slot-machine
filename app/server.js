const config = require('./config/config.json');
const hostname = config.hostname;
const port = config.port;

const server = require('./controller.js');

/*
This is a wrapper for node.js server (which is defined in controller.js).
Mainly, it just serves as an application entrypoint.
*/

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

