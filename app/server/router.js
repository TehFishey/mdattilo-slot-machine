const fs = require('fs');
const path = require('path');

const config = require('./config/config.json');
const public = path.resolve(__dirname, '../client');
const homepage = config.homepage;

/*
A watered-down HTML router written in pure js. It is able to handle page requests as well as AJAX calls
from the front-end.
*/

const mime = {
    html: 'text/html',
    css: 'text/css',
    png: 'image/png',
    js: 'application/javascript'
}

// Page request handler. Takes {filepath} requests and returns ./client/{filepath}. A rudimentary mime allows
// it to return all file types used in the view. There's no permission/security checking because I don't
// really know how to implement that, but it probably should have it...
exports.getRequest = function(req, res) {
    let filePath = path.resolve(public + req.url);
    if (req.url === '/') filePath = path.join(public, homepage);
    
    //Return a homepage in case there's no url. This should probably be defined in the config
    if (req.url === '/') filePath = path.join(public, homePage);

    //Fetch the file type...
    let fileType = mime[path.extname(filePath).slice(1)] || 'text/plain';
    
    //... stream out the file at the designated path ...
    let streamOut = fs.createReadStream(filePath);
    streamOut.on('open', () => {
        res.writeHead(200, {'Content-Type': fileType});
        console.log(`Serving: ${filePath} \n File Type: ${fileType}`)
        streamOut.pipe(res);
    });
    //... or return an error.
    streamOut.on('error', () => {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        console.log(`ERROR: 404 ${filePath}`)
        res.end('File not found');
    });
}

// AJAX handler. Takes a '?{function}' query from {pageName}, and routes it to {pageName}.{function} 
// in modules. Handler responds with a json object returned by that function.
exports.ajaxRequest = function(req, res) {
    
    //Get the last segment of the url.
    let reqPage = req.url.split('\\').pop().split('/').pop();
    if (reqPage[0] === '?') reqPage = (homePage + reqpage);
    
    //We know it's a '?' query because we checked in the controller. 
    //Set the page to home if there is none.
    if (reqPage[0] === '?') reqPage = (homePage + reqPage);
    
    //Determine the module and function based on page name/query text...
    let reqModule = require(`./modules/${reqPage.split('.')[0]}.js`);
    let reqFunc = reqModule[reqPage.split('?')[1]];
    
    //...and return the json from it.
    let json = reqFunc(req);
    res.writeHead(200, {'Content-Type': 'application/json'});
    console.log('Serving Ajax Response Object: ', json)
    res.end(JSON.stringify(json));
}

// 501 Handler. We don't do non-GET requests here.
exports.invalidRequest = function(req, res) {
    console.log(`ERROR: 501 ${req.method}`)
    res.writeHead(501, {'Content-Type': 'text/plain'});
    res.write('Method not implemented');
    res.end();
}