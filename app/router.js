const fs = require('fs');
const path = require('path');
const slots = require('./modules/slots.js');

serve = function(req, res) {
    let filePath = path.resolve(__dirname, './client' + req.url);
    if (req.url === '/') 
        filePath = path.resolve(__dirname, './client/main.html');
    
    fs.readFile(filePath, null, function(err, data) {
        if(err) {
            exports.invalidRequest(req, res)
        }
        else {
            console.log(`Serving: ${filePath}`)
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(data);
        }
        res.end();
    });
}

exports.getRequest = function(req, res) {
    let filePath = path.resolve(__dirname, './client' + req.url);
    if (req.url === '/') 
        filePath = path.resolve(__dirname, './client/main.html');
    
    fs.readFile(filePath, null, function(err, data) {
        if(err) {
            exports.invalidRequest(req, res)
        }
        else {
            console.log(`Serving: ${filePath}`)
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(data);
        }
        res.end();
    });
}

exports.postRequest = function(req, res) {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
        const body = Buffer.concat(chunks);
        let content = JSON.parse(body);

        let type = content.type;
        switch(type) {
            case 'slotRequest':
                let roll = slots.roll()
                res.writeHead(200, {'Content-Type': 'application/json'});
                let json = { 'result': roll };
                res.end(JSON.stringify(json));
                break;
        }
    });
}

exports.invalidRequest = function(req, res) {
    console.log(`Warning! Invalid request type or missing file.`)
    res.writeHead(404);
    res.write('File not found!');
    res.end();
}