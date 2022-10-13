let app
const V = {
    image: document.getElementById("image"),
    value: document.getElementById("value"),
    prevalue: document.getElementById("prevalue"),
    raw: document.getElementById("raw"),
    error: document.getElementById("error"),
    timestamp: document.getElementById("timestamp"),
    statusflow: document.getElementById("statusflow"),
    panelul: document.getElementById("panelul"),
}


async function loadStatus() {
    const res = await app.get('/statusflow.html')
    V.statusflow.innerHTML = res.ok? res.text : 'No status flow response.'
    return true
}

async function loadValue(name, values) {
    const url = '/wasserzaehler.html?all=true&type=' + name;
    const res = await app.get(url)
    if (!res.ok) return false
    res.text.split("\r")
        .map(l => l.split('\t'))
        .map(l => {
            if (!values[l[0]]) values[l[0]] = {}
            return values[l[0]][name] = l[1]
        })
    return true
}


async function load() {
    let vals = {}
    V.timestamp.innerHTML = new Date().toISOString();
    V.image.src = `/fileserver/img_tmp/alg_roi.jpg?timestamp=${V.timestamp.innerHTML}`
    const loads = await Promise.all([
        loadStatus(),
        loadValue("value", vals),
        loadValue("raw", vals),
        loadValue("prevalue", vals),
        loadValue("error", vals)
    ])
    console.log(loads);
    if (loads.some(ok => !ok)) {
        console.log(`Home error: init fail.`);
        return false
    }

    const keys = Object.keys(vals)
    const htmldata = keys.map(v => `
		<section>
            <h4>${v}</h4>
            <p>Last: ${vals[v]?.value}</p>
            <p>Previous: ${vals[v]?.prevalue}</p>
            <p>Raw: ${vals[v]?.raw}</p>
            <p>Errors: ${vals[v]?.error}</p>
        </section>
    `).join('')
    V.panelul.innerHTML = htmldata

    setInterval(load, 300000);
    return true
}

async function focus(){
    await loadStatus();
    V.timestamp.innerHTML = new Date().toISOString();
    return true
}

function init(_app) {
    app = _app
    return true
}

export default {
    init,
    load,
    focus
}