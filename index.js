// init
const ws = new WebSocket ("ws://localhost:5354")
let reqbody = {};
let assoc = {};
let datas = [];
let table = '';
let amounts = {};
let fields = {};
let video = document.createElement("video");
document.querySelectorAll('.tables').forEach((x) => {
    x.addEventListener('click', (x) => {
        document.querySelector('#shapbtns').style.display = "inline-block";
        table = x.target.id;
        document.querySelectorAll('.data').forEach((e) => {
            if (e.id == x.target.id) {
                e.style.display = 'block'
            }
            else {
                e.style.display = "none"
            }
        })
        document.querySelectorAll('.pages').forEach((e) => {
            if (e.id == x.target.id) {
                e.style.display = 'block'
            }
            else {
                e.style.display = "none"
            }
        })
        document.querySelector(`#maindata #${x.target.id} div`).style.display = "block"
    })
})

//functions
let get = (x) => {
    reqbody.action = "get";
    reqbody.table = x;
    reqbody.sql = `select * from ${x}`;
    ws.send(JSON.stringify(reqbody))
}

let put = () => {
    reqbody.action = "put";
    reqbody.table = table;
    reqbody.sql = `INSERT into ${table} values (`
    for (let i in reqbody.fields) {
        reqbody.sql += `'${reqbody.fields[i]}',`
    }
    reqbody.sql = reqbody.sql.slice(0,reqbody.sql.length-1) + ');'
    ws.send(JSON.stringify(reqbody))
}

// body
ws.onopen = () => {
    setTimeout(() => {get('pupil')}, 1000)
    setTimeout(() => {get('staff')}, 1000)
    setTimeout(() => {get('Sbooks')}, 1000)
    setTimeout(() => {get('books')}, 100)
    setTimeout(() => {get('class')}, 100)
    setTimeout(() => {
        document.querySelector("#load").style.display = "none";
        document.querySelector("#onload").style.display = "block";
    }, 1000);
};


ws.onmessage = (d) => {
    let data = JSON.parse(d.data)
    if (data.action == "assoc") {
        for (let i in data.content) {
            assoc[data.content[i].name] = data.content[i].mean
        }
    }
    else if (data.action == "datas") {
        for (let i in data.content) {
            if (!datas.includes(i.name)) {
                datas.push(i.name);
            }
        }
    }
    if (data.action == "rows") {
        fields[data.table] = []
        for (let i in data.content[0]) {
            fields[data.table].push(i);
        }
        for (let i = 1; i <= Math.ceil(data.content.length / 50); i++) {
            document.querySelector(`#pages #${data.table}`).innerHTML += `<div class = "page" id = "page${i}">${i}</div>`;
            document.querySelector(`#maindata #${data.table}`).innerHTML += `<div class = "data" id = "page${i}" style="display:none"></div>`;
            for (let j in data.content[0]) {
                document.querySelector(`#maindata #${data.table} #page${i}`).innerHTML += `<div class = "table" id="${j}"><div class = "tablehead">${assoc[j]}</div></div>`
                
            }
            for (let j = 0; j < 50; j++) {
                if (data.content[j+50*(i-1)] != undefined)
                if (data.table == 'pupil') {
                    document.querySelector('#optionspupil').innerHTML += `<option>${data.content[j+50*(i-1)].FIO}</option>`
                }
                {
                    for (let q in data.content[j+50*(i-1)]) {
                        if (q == 'bibl') {
                            document.querySelector(`#maindata #page${i} #${q}`).innerHTML += `<div class="row" id="row${data.content[j+50*(i-1)].id}">><div style="display:none;">${data.content[j+50*(i-1)][q]}</div></div>  `;
                        }
                        else {
                            document.querySelector(`#maindata #page${i} #${q}`).innerHTML += `<div class="row" id="row${data.content[j+50*(i-1)].id}">${data.content[j+50*(i-1)][q]}</div>  `
                        }
                        amounts[data.table] = data.content[j+50*(i-1)].id;
                    }
                }
            }
        }

        // page switch listener
        document.querySelectorAll('#pages .page').forEach((x) => {
            x.addEventListener('click', (q) => {
                document.querySelectorAll(`#maindata #${data.table} .data`).forEach((w) => {
                    if(q.target.id == w.id) {
                        w.style.display = "block";
                    }
                    else {
                        w.style.display = "none";
                    }
                })
            })
        })
    }
    if (data.action == 'pupilduty') {
        if (data.content.length == 0) {
            document.querySelector('#duty').innerHTML = 'Ничего не должен'    
        } else {
            document.querySelector('#duty').innerHTML = ''
        }
        for (let j in data.content[0]) {
            document.querySelector(`#duty`).innerHTML += `<div class = "table" id="${j}"><div class = "tablehead">${assoc[j]}</div></div>`
        }
        for (let i in data.content) {
            for (let q in data.content[i]) {
                document.querySelector(`#duty #${q}`).innerHTML += `<div class="row" id="row${data.content[i].invid}">${data.content[i][q]}</div>  `
            }
        }
    }
};

document.querySelector('#search').addEventListener('input', (x) => {
    if (x.target.value == '') {
        document.querySelector('#main').style.display = "block";
        document.querySelector('#divsearch').style.display = "none"
    }
    else {
        document.querySelector('#main').style.display = "none";
        document.querySelector('#divsearch').style.display = "block"
    }
})

document.querySelector('#takegive').addEventListener('click', () => {
    document.querySelector('#myModal1').style.display = "block";
    const canvasElement = document.getElementById("canvas");
    const canvas = canvasElement.getContext("2d");
    const loadingMessage = document.getElementById("loadingMessage");
    const outputContainer = document.getElementById("output");
    const outputMessage = document.getElementById("outputMessage");
    const outputData = document.getElementById("outputData");
        
    // Use facingMode: environment to attemt to get the front camera on phones
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(function(stream) {
        video.srcObject = stream;
        video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
        video.play();
        requestAnimationFrame(tick);
    });
        
    function tick() {
        loadingMessage.innerText = "⌛ Loading video..."
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            loadingMessage.hidden = true;
            canvasElement.hidden = false;
            outputContainer.hidden = false;
        
            canvasElement.height = video.videoHeight;
            canvasElement.width = video.videoWidth;
            canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
            var imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
            var code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert",
            });
            if (code) {
                    // let db = new sqlite3.Database('sqlite.db', sqlite3.OPEN_READWRITE, (err) => {
                    // if (err) {
                    //   console.error(err.message);
                    // }
                    // db.get(`SELECT * from books where invid = "${code.data}"`, (err, row) => {
                    //     if (err) {
                    //         console.error(err);
                    //     }
                    //     let d = new Date();
                    //     if (row.own == '0') {
                    //         document.getElementById('inputinvid').value = row.id;
                    //         document.getElementById('inputname').value = row.name;
                    //         document.getElementById('inputwwhen').value = `${d.getDate()}.${d.getMonth()+1}.${d.getFullYear()}`
                    //         let d2 = new Date(Date.parse(d)+1209600033)
                    //         document.getElementById('inputqwhen').value = `${d2.getDate()}.${d2.getMonth()+1}.${d2.getFullYear()}`
                    //         db.run(`UPDATE books SET own = "1" WHERE id = ${code.data}`)
                    //     }
                    //     else {
                    //         db.run(`UPDATE books SET own = "0" WHERE id = ${code.data}`)
                    //         db.run(`UPDATE TakeHistory SET return = "${d.getDate()}.${d.getMonth()+1}.${d.getFullYear()}" WHERE invid = ${code.data}`)
                    //         clsbtn.click();
                    //         alert('Книга сдана')
                    //     }
                    // })
                    // });
                if (document.querySelector('#myModal1').style.display = "block") {
                    if (document.querySelector('#inputpupil').value != '') {
                        reqbody.action = "book";
                        reqbody.invid = code.data;
                        ws.send(JSON.stringify(reqbody));
                    }
                }
            } else {
                outputMessage.hidden = false;
                outputData.parentElement.hidden = true;
            }
        }
        requestAnimationFrame(tick);
    }
})
document.querySelectorAll('#addclose').forEach((x) => {
    x.addEventListener('click', () => {
        x.parentNode.parentNode.parentNode.style.display = "none"
        reqbody.fields = {}
        document.querySelectorAll('#data1 div').forEach((x) => {
            if (x.childNodes[1].value != '') {
                reqbody.fields[x.id.slice(3)] = x.childNodes[1].value
            } else {
                reqbody.fields[x.id.slice(3)] = '-'
            }
        })
        put();
    })
})
document.querySelectorAll('#close').forEach((x) => {
    x.addEventListener('click', () => {
        x.parentNode.parentNode.parentNode.style.display = "none";
        video.srcObject.getTracks().forEach((track) => {
            track.stop();
        })
    })
})
document.querySelector('#inputpupil').addEventListener('change', (x) => {
    reqbody.action = "pupilduty";
    reqbody.pupil = x.target.value;
    reqbody.sql = `SELECT invid, name FROM TakeHistory WHERE pupil = '${reqbody.pupil}'`
    ws.send(JSON.stringify(reqbody))
})
document.querySelector('#next').addEventListener('click', () => {

})
document.querySelector("#addbtn").addEventListener('click', () => {
    document.querySelector('#myModal2 #data1').innerHTML = ''
    for (let i in fields[table]) {
        if (fields[table][i] == 'id') {
            document.querySelector('#myModal2 #data1').innerHTML += `<div id="div${fields[table][i]}">${assoc[fields[table][i]]}: <input id = "input${fields[table][i]}" value="${Number(amounts[table])+1}"></div>`;
        } else {
            document.querySelector('#myModal2 #data1').innerHTML += `<div id="div${fields[table][i]}">${assoc[fields[table][i]]}: <input id = "input${fields[table][i]}" value=""></div>`;
        }
    }
    document.querySelector('#myModal2').style.display = "block"
})




// qrcamera
