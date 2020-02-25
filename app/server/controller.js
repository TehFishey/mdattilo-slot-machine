const http = require('http');

/*
Right now, this module only exists to direct traffic to the router/API. If the server 
architecture was ever to be expanded - adding cookies/session persistance, a database 
access layer, etc. - relevant hooks would probably go here.
*/

module.exports = http.createServer((req,res) => {
    const router = require('./router.js');

    // We can only handle GET requests right now...
    if (req.method === 'GET') {
        if (!req.url.includes('?')) 
            router.getRequest(req,res);
        else
            router.ajaxRequest(req,res);
    }

    // ...all others will return a 501 error.
    else {
        router.invalidRequest(req, res);
    }
})

