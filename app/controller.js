const http = require('http');
const url = require('url');

module.exports = http.createServer((req,res) => {
    const router = require('./router.js');
    const reqUrl = url.parse(req.url, true);
    const method = req.method;
    const pathname = reqUrl.pathname;

    console.log(`Request type: ${method} Endpoint: ${pathname}`)

    // GET Request
    if (req.method === 'GET') {
        router.getRequest(req,res);
    }

    // POST Request
    else if (req.method === 'POST') {
        router.postRequest(req,res);
    }

    else {
        router.invalidRequest(req, res);
    }
})

