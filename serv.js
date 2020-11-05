const express = require("express");
const app = new express();
const path = require("path")
const sqlite3 = require("sqlite3")
const { Server } = require('ws');
const wss = new Server({ port: 5354 });
const password = 'random';
let clients = [];

app.use(express.urlencoded());

app.use('/books.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'books.html'))
})

app.get('/*.*', (req, res) => {
    if (clients.includes(req.ip)) {
        res.sendFile(path.join(__dirname, req.path))
    }
})
app.get('/*', (req, res) => {
    if (clients.includes(req.ip)) {
        res.sendFile(path.join(__dirname, 'index.html'))
    }
    else {
        res.sendFile(path.join(__dirname, 'login.html'));
    }
})
app.post('/*', (req, res) => {
    if (req.body.pass == password) {
        clients.push(req.connection.remoteAddress);
        res.sendFile(path.join(__dirname, 'index.html'))
        setTimeout(() => {clients.splice(clients.indexOf(req.connection.remoteAddress, 1))}, 1000)
    }
    else {
        res.sendFile(path.join(__dirname, 'login.html'));
    }
})

app.listen(5353, () => {})
wss.on('connection', (ws, req) => {
    let db = new sqlite3.Database('sqlite.db', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
          console.error(err.message);
        }
    });
    db.serialize(() => {
        db.all(`select * from assoc`, (err,rows) => {
            ws.send(JSON.stringify({action: "assoc", content: rows}))
        })
        db.all(`select * from datas`, (err, rows) => {
            ws.send(JSON.stringify({action: "datas", content: rows}))
        })
    })
    db.close();
    ws.on('message', (d) => {
        d = JSON.parse(d)
        if (d.action == "get") {
            let db = new sqlite3.Database('sqlite.db', sqlite3.OPEN_READWRITE, (err) => {
                if (err) {
                  console.error(err.message);
                }
            });
            db.serialize(() => {
                db.all(d.sql, (err,rows) => {
                    ws.send(JSON.stringify({action: "rows", content: rows, table: d.table}))
                })
            })
            db.close();
        }
        else if (d.action == "pupilduty") {
            let db = new sqlite3.Database('sqlite.db', sqlite3.OPEN_READWRITE, (err) => {
                if (err) {
                  console.error(err.message);
                }
            });
            db.serialize(() => {
                db.all(d.sql, (err,rows) => {
                    ws.send(JSON.stringify({action: d.action, content: rows, table: d.table}))
                })
            })
            db.close();
        }
        else if (d.action == "put") {
            let db = new sqlite3.Database('sqlite.db', sqlite3.OPEN_READWRITE, (err) => {
                if (err) {
                  console.error(err.message);
                }
            });
            db.run(d.sql);
            db.close();
        }
        else if (d.action == "book") {
            let db = new sqlite3.Database('sqlite.db', sqlite3.OPEN_READWRITE, (err) => {
                if (err) {
                  console.error(err.message);
                }
            });
            db.serialize(() => {
                db.get(`select * from books where invid = ${d.invid}`, (err, row) => {
                    if (row.own == '0') {
                        db.run(`update books set own = "1" where invid = "${row.invid}"`);
                        // db.run(`insert into TakeHistory values ()`)
                    }
                })
            })
            db.close();
        }
    })
})