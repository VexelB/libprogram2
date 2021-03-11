//functions
let init = () => {
    document.querySelectorAll('.row').forEach((x) => {
        x.addEventListener('click', () => {
            let temp = document.querySelectorAll(`#${x.parentNode.parentNode.id} #${x.id}`)
            head.fields = {}
            for (let i in temp) {
                if (temp[i].parentNode) {
                    if (temp[i].parentNode.id == 'booksbibl') {
                        head.fields[fields[table][i]] = temp[i].lastChild.innerText
                    } else {
                        head.fields[fields[table][i]] = temp[i].innerText
                    }
                }   
            }
            document.querySelector('#myModal3 #data3').innerHTML = ''
            for (let i in fields[table]) {
                document.querySelector('#myModal3 #data3').innerHTML += `<div id="div${fields[table][i]}">${assoc[fields[table][i]]}: <input id = "input${fields[table][i]}" value="${head.fields[fields[table][i]]}"></div>`;
                if (fields[table][i] == 'id') {
                    reqbody.oldid = head.fields[fields[table][i]];
                }
            }
            document.querySelector('#myModal3').style.display = "block";
        })
    })
}
let get = (x, i) => {
    reqbody.action = "get";
    reqbody.table = x;
    reqbody.page = i;
    reqbody.sql = `select * from ${x} limit ${(i-1)*50}, 50`;
    ws.send(JSON.stringify(reqbody));
    reqbody = {};
}

let dutytake = () => {
    reqbody.action = "pupilduty";
    reqbody.pupil = document.querySelector('#inputpupil').value;
    reqbody.sql = `SELECT invid, name, qwhen FROM TakeHistory WHERE pupil = "${reqbody.pupil}" AND return = "-"`
    ws.send(JSON.stringify(reqbody))
    reqbody = {}
}
let update = () => {
    get (table, )
}

// init
const ws = new WebSocket ("wss://192.168.1.2:5353")
let reqbody = {};
let assoc = {};
let datas = [];
let table = '';
let page = 0
let amounts = {};
let fields = {};
let video;
let head = {};
let duty = [];
let oldcode = { data: ''};
// table switch lictener
document.querySelectorAll('.tables').forEach((x) => {
    x.addEventListener('click', (x) => {
        document.querySelector('#shapbtns').style.display = "inline-block";
        table = x.target.id;
        if (table == 'duty') {
            reqbody.action = "dutyget";
            reqbody.table = table;
            ws.send(JSON.stringify(reqbody))
            reqbody = {}
        }
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
        get(table, 1)
    })
})

// body

// page load
ws.onopen = () => {
    setTimeout(() => {
        document.querySelector("#load").style.display = "none";
        document.querySelector("#onload").style.display = "block";
        // init();
    }, 1000);
    get('class', 0)
    get('books', 0)
    get('Sbooks', 0)
    get('staff', 0)
    get('pupil', 0)
    get('TakeHistory', 0)
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
    else if (data.action == "pages") {
        document.querySelector(`#pages #${data.table}`).innerHTML = ``;
        for (let i = 1; i <= Math.ceil(data.content.length / 50); i++) {
            document.querySelector(`#pages #${data.table}`).innerHTML += `<div class = "page" id = "page${i}">${i}</div>`;
        }
        // page switch listener
        document.querySelectorAll('#pages .page').forEach((x) => {
            x.addEventListener('click', (q) => {
                page = parseInt(q.target.innerHTML)
                get(table, q.target.innerHTML)
            })
        })
        if (data.table == 'pupil' || data.table == 'staff'){
            for (let i = 1; i <= Math.ceil(data.content.length / 50); i++) {
                for (let j = 0; j < 50; j++) {
                    if (data.content[j+50*(i-1)]){
                        document.querySelector('#optionspupil').innerHTML += `<option>${data.content[j+50*(i-1)].FIO}</option>`
                    }
                }
            }
        }
    }
    else if (data.action == "rows") {
        fields[data.table] = []
        console.log(data.content)
        for (let i in data.content[0]) {
            fields[data.table].push(i);
        }
        document.querySelector(`#maindata `).innerHTML = ``;
        for (let i = 1; i <= Math.ceil(data.content.length / 50); i++) {
            for (let j in data.content[0]) {
                document.querySelector(`#maindata `).innerHTML += `<div class = "table" id="${data.table}${j}"><div class = "tablehead">${assoc[j]}</div></div>`
                
            }
            for (let j = 0; j < 50; j++) {              
                for (let q in data.content[j+50*(i-1)]) {
                    if (q == 'bibl') {
                        document.querySelector(`#maindata #${data.table}${q}`).innerHTML += `<div class="row" id="row${data.content[j+50*(i-1)].id}">><div style="display:none;">${data.content[j+50*(i-1)][q]}</div></div>  `
                    }
                    else {
                        document.querySelector(`#maindata #${data.table}${q}`).innerHTML += `<div class="row" id="row${data.content[j+50*(i-1)].id}">${data.content[j+50*(i-1)][q]}</div>  `
                    }
                    
                }
            }
        }
        init()
    }
    else if (data.action == 'pupilduty') {
        duty = [];
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
            duty.push(data.content[i].invid)
        }
    }
    else if (data.action == 'search') {
        if (data.content.length != 0) {
            document.querySelector('#divsearch').innerHTML += `<div id = "search${data.table}${data.row}">${assoc[data.table]}: ${assoc[data.row]} <br></div>`
            for (let i in data.content[0]) {
                document.querySelector(`#search${data.table}${data.row}`).innerHTML += `<div class = "table" id="${data.table}${i}"><div class = "tablehead">${assoc[i]}</div></div>`
            }
            for (let i in data.content) {
                for (let j in data.content[i]) {
                    if (j == 'bibl') {
                        document.querySelector(`#search${data.table}${data.row} #${data.table}${j}`).innerHTML += `<div class="row" id="row${data.content[i].id}">><div style="display:none;">${data.content[i][j]}</div></div>`
                    } else {
                        document.querySelector(`#search${data.table}${data.row} #${data.table}${j}`).innerHTML += `<div class="row" id="row${data.content[i].id}">${data.content[i][j]}</div>`
                    }
                }
            }
        }
    }
};

// take/give functionality
document.querySelector('#takegive').addEventListener('click', () => {
    document.querySelector('#myModal1').style.display = "block";
    video = document.createElement("video")
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
                if (code.data) {
                    if (oldcode.data != code.data) {
                        if (document.querySelector('#myModal1').style.display = "block") {
                            if (document.querySelector('#inputpupil').value != '') {
                                oldcode = code;
                                reqbody.action = "book";
                                if (duty.includes(code.data)){
                                    reqbody.subaction = "take"
                                }
                                else {
                                    reqbody.subaction = 'give';
                                }
                                reqbody.invid = code.data;
                                reqbody.pupil = document.querySelector('#inputpupil').value;
                                ws.send(JSON.stringify(reqbody));
                                reqbody = {}
                                alert(`Запись отправлена с номером книги ${reqbody.invid} на ${reqbody.pupil}`);
                                dutytake();
                                // get('TakeHistory');
                            } else {
                                alert('Введите ученика');
                            }
                        }
                    }
                }  
            } 
        }
        requestAnimationFrame(tick);
    }
})

// listeners
// search listener
document.querySelector('#search').addEventListener('change', (x) => {
    if (x.target.value == '') {
        // document.querySelector('#main').style.display = "block";
        document.querySelector('#divsearch').style.display = "none"
    }
    else {
        // document.querySelector('#main').style.display = "none";
        document.querySelector('#divsearch').style.display = "block"
        document.querySelector('#divsearch').innerHTML = "Поиск:"
        reqbody.action = 'search';
        reqbody.search = x.target.value;
        reqbody.fields = fields;
        ws.send(JSON.stringify(reqbody));
        reqbody = {}
    }
})
// add listener
document.querySelectorAll('#addclose').forEach((x) => {
    x.addEventListener('click', () => {
        x.parentNode.parentNode.parentNode.style.display = "none"
        reqbody.fields = {}
        document.querySelectorAll('#data2 div').forEach((x) => {
            if (x.childNodes[1].value != '') {
                reqbody.fields[x.id.slice(3)] = x.childNodes[1].value
            } else {
                reqbody.fields[x.id.slice(3)] = '-'
            }
        })
        reqbody.action = "put";
        reqbody.table = table;
        reqbody.sql = `INSERT into ${table} values (`
        for (let i in reqbody.fields) {
        reqbody.sql += `'${reqbody.fields[i]}',`
        }
        reqbody.sql = reqbody.sql.slice(0,reqbody.sql.length-1) + ');'
        ws.send(JSON.stringify(reqbody))
        reqbody = {}
        update();
    })
})
// close addwindow listener
document.querySelectorAll('#close').forEach((x) => {
    x.addEventListener('click', () => {
        x.parentNode.parentNode.parentNode.style.display = "none";
        if (video) {
            video.srcObject.getTracks().forEach((track) => {
                track.stop();
                oldcode = {data: ''}
                document.getElementById("loadingMessage").hidden = false;
            })
        }
        document.querySelector('#inputpupil').value = ''
    })

})
// pupils duty listener
document.querySelector('#inputpupil').addEventListener('change', (x) => {
    dutytake();
})
// addwindow opener listener
document.querySelector("#addbtn").addEventListener('click', () => {
    document.querySelector('#myModal2 #data2').innerHTML = ''
    for (let i in fields[table]) {
        if (fields[table][i] == 'id') {
            document.querySelector('#myModal2 #data2').innerHTML += `<div id="div${fields[table][i]}">${assoc[fields[table][i]]}: <input id = "input${fields[table][i]}" value="${Number(amounts[table])+1}"></div>`;
        } else {
            document.querySelector('#myModal2 #data2').innerHTML += `<div id="div${fields[table][i]}">${assoc[fields[table][i]]}: <input id = "input${fields[table][i]}" value=""></div>`;
        }
    }
    document.querySelector('#myModal2').style.display = "block"
})
// dellbtn listener
document.querySelector('#delbtn').addEventListener('click', () => {
    reqbody.action = 'delete';
    reqbody.delid = document.querySelector('#myModal3 #inputid').value;
    reqbody.table = table;
    reqbody.sql = `delete from ${reqbody.table} where id = '${reqbody.delid}'`;
    reqbody.fields = {};
    ws.send(JSON.stringify(reqbody));
    document.querySelector('#myModal3').style.display = 'none';
    update();
})
// chgbtn listener
document.querySelector('#chgbtn').addEventListener('click', () => {
    reqbody.action = "change";
    reqbody.table = table;
    reqbody.fields = {}
    document.querySelectorAll('#data3 div').forEach((x) => {
        if (x.childNodes[1].value != '') {
            reqbody.fields[x.id.slice(3)] = x.childNodes[1].value;
        } else {
            reqbody.fields[x.id.slice(3)] = '-';
        }
    })
    reqbody.sql = `update ${reqbody.table} set `;
    for (let i in reqbody.fields) {
        reqbody.sql += `${i} = '${reqbody.fields[i]}',`;
    }
    reqbody.sql = reqbody.sql.slice(0, reqbody.sql.length-1) + `where id = ${reqbody.oldid}`;
    ws.send(JSON.stringify(reqbody));
    reqbody = {};
    document.querySelector('#myModal3').style.display = "none";
    update();
})
