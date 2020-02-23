const http = require('http');

module.exports = http.createServer((req,res) => {
    const router = require('./router.js');

    // GET Request
    if (req.method === 'GET') {
        if (!req.url.includes('?')) 
            router.getRequest(req,res);
        else
            router.ajaxRequest(req,res);
    }

    // POST Request
    //else if (req.method === 'POST') {
    //    router.postRequest(req,res);
    //}

    else {
        router.invalidRequest(req, res);
    }
})

