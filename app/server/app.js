const config = require('./config/config.json');
const hostname = config.hostname;
const port = config.port;

const server = require('./controller.js');

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

