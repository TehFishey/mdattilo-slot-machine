const config = require('./config/config.json');
const hostname = config.hostname;
const port = process.env.PORT|| config.port;

const server = require('./controller.js');

server.listen(port, hostname, () => {
    console.log(`Server running at ${hostname}:${port}/`);
});

