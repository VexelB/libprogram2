const express = require("express");
const app = new express();
const path = require("path")
const { Server } = require('ws');
const wss = new Server({ port: 5354 });
const password = 'random';
let clients = [];

app.get('/*', (req, res) => {
    if (clients.includes(req.ip)) {
        res.sendFile(path.join(__dirname, 'index.html'))
    }
    else {
        res.sendFile(path.join(__dirname, 'login.html'));
    }
})

app.listen(5353, () => {})
wss.on('connection', (ws, req) => {
    ws.on('message', (d) => {
        d = JSON.parse(d)
        if (d.pass){
            if (d.pass == password) {
                clients.push(req.connection.remoteAddress);
                setTimeout(() => {clients.splice(clients.indexOf(req.connection.remoteAddress, 1))}, 600000)
            }
        }
    })
})