// init
const ws = new WebSocket ("ws://192.168.1.15:5354")
let reqbody = {};
let assoc = {}
let table = ''
fields = {}
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
        // get('TakeHistory')
    }, 1000);
};


ws.onmessage = (d) => {
    let data = JSON.parse(d.data)
    if (data.action == "init") {
        for (let i in data.content) {
            assoc[data.content[i].name] = data.content[i].mean
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
        console.log(data)
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
})
document.querySelectorAll('#addclose').forEach((x) => {
    x.addEventListener('click', () => {
        x.parentNode.parentNode.style.display = "none"
        reqbody.fields[table] = {}
        document.querySelectorAll('#data1 div').forEach((x) => {
            console.log(x.childNodes[1].value);
            reqbody.fields[table][x.id.slice(3)] = x.childNodes[1].value
        })
    })
})
document.querySelectorAll('#close').forEach((x) => {
    x.addEventListener('click', () => {
        x.parentNode.parentNode.style.display = "none"
    })
})
document.querySelector('#inputpupil').addEventListener('change', (x) => {
    reqbody.action = "pupilduty";
    reqbody.pupil = x.target.value;
    reqbody.sql = `SELECT books.invid, books.name FROM TakeHistory Left join books ON books.invid = TakeHistory.invid WHERE TakeHistory.who = '${reqbody.pupil}'`
    ws.send(JSON.stringify(reqbody))
})
document.querySelector('#next').addEventListener('click', () => {
    if (document.querySelector('#duty').style.display == "none") {
        document.querySelector('#duty').style.display = "block"
    }
    else {

    }
})
document.querySelector("#addbtn").addEventListener('click', () => {
    document.querySelector('#myModal2 #data1').innerHTML = ''
    for (let i in fields[table]) {
        document.querySelector('#myModal2 #data1').innerHTML += `<div id="div${fields[table][i]}">${assoc[fields[table][i]]}: <input id = "input${fields[table][i]}" value=""></div>`;
    }
    document.querySelector('#myModal2').style.display = "block"
})