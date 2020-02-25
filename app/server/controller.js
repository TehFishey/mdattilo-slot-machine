const http = require('http');

module.exports = http.createServer((req,res) => {
    const router = require('./router.js');

    if (req.method === 'GET') {
        if (!req.url.includes('?')) 
            router.getRequest(req,res);
        else
            router.ajaxRequest(req,res);
    }

    else {
        router.invalidRequest(req, res);
    }
})

