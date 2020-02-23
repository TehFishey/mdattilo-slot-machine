const fs = require('fs');
const path = require('path');

const public = path.resolve(__dirname, './client');
const homePage = 'slots.html';

const mime = {
    html: 'text/html',
    css: 'text/css',
    png: 'image/png',
    json: 'application/json'
}

exports.getRequest = function(req, res) {
    let filePath = path.resolve(public + req.url);
    if (req.url === '/') filePath = path.join(public, homePage);
    let fileType = mime[path.extname(filePath).slice(1)] || 'text/plain';
    
    let streamOut = fs.createReadStream(filePath);
    streamOut.on('open', () => {
        res.writeHead(200, {'Content-Type': fileType});
        console.log(`Serving: ${filePath} \n File Type: ${fileType}`)
        streamOut.pipe(res);
    });
    streamOut.on('error', () => {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        console.log(`ERROR: 404 ${filePath}`)
        res.end('File not found');
    });
}

exports.ajaxRequest = function(req, res) {
    let reqPage = req.url.split('\\').pop().split('/').pop();
    if (reqPage[0] === '?') reqPage = (homePage + reqPage);
    
    let reqModule = require(`./modules/${reqPage.split('.')[0]}.js`);
    let reqFunc = reqModule[reqPage.split('?')[1]];
    let json = reqFunc(req);

    res.writeHead(200, {'Content-Type': 'application/json'});
    console.log('Serving Ajax Response Object: ', json)
    res.end(JSON.stringify(json));
}

exports.invalidRequest = function(req, res) {
    console.log(`ERROR: 501 ${req.method}`)
    res.writeHead(501, {'Content-Type': 'text/plain'});
    res.write('Method not implemented');
    res.end();
}