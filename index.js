// init
const ws = new WebSocket ("ws://localhost:5354")
let reqbody = {};
let assoc = {}
document.querySelectorAll('.tables').forEach((x) => {
    x.addEventListener('click', (x) => {
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
setTimeout(() => {get('pupil')}, 1000)
setTimeout(() => {get('staff')}, 1000)
setTimeout(() => {get('Sbooks')}, 1000)
setTimeout(() => {get('books')}, 100)
setTimeout(() => {get('class')}, 100)

ws.onmessage = (d) => {
    let data = JSON.parse(d.data)
    if (data.action == "init") {
        for (let i in data.content) {
            assoc[data.content[i].name] = data.content[i].mean
        }
    }
    if (data.action == "rows") {
        // document.querySelector(`#pages #${data.table}`).innerHTML = '';
        // document.querySelectorAll(`#maindata #${data.table}`).forEach((x) => {
        //     x.innerHTML = '';
        // })
        for (let i = 1; i <= Math.ceil(data.content.length / 50); i++) {
            document.querySelector(`#pages #${data.table}`).innerHTML += `<div class = "page" id = "page${i}">${i}</div>`;
            document.querySelector(`#maindata #${data.table}`).innerHTML += `<div class = "data" id = "page${i}" style="display:none"></div>`;
            for (let j in data.content[0]) {
                document.querySelector(`#maindata #${data.table} #page${i}`).innerHTML += `<div class = "table" id="${j}"><div class = "tablehead">${assoc[j]}</div></div>`
            }
            for (let j = 0; j < 50; j++) {
                if (data.content[j+50*(i-1)] != undefined)
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
};