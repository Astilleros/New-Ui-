
import { APP } from './app.js'
import Home from './components/home.js'
import Reference from './components/reference.js'
import Alignment from './components/alignment.js'
import Digits from './components/digits.js'
import Analogs from './components/analog.js'
import Help from './components/help.js'
import MQTT from './components/mqtt.js'
import InfluxDB from './components/influxdb.js'
import FileServer from './components/fileserver.js'
import Schedule from './components/schedule.js'
import CNN from './components/cnn.js'
import Postprocessing from './components/postprocessing.js'
import Reboot from './components/reboot.js'
import Config from './components/config.js'
import OTA from './components/OTA.js'


let MODULES = {
    Home,
    Reference,
    Alignment,
    Digits,
    Analogs,
    Help,
    MQTT,
    InfluxDB,
    FileServer,
    Schedule,
    CNN,
    Postprocessing,
    Reboot,
    Config,
    OTA,
    Iframe: {
        init: undefined, load: undefined, focus: undefined
    }
}
var app = new APP()

const V = {
    iframe: document.getElementById('iframe'),
    Spinner: document.getElementById('panelSpinner'),
    Home: document.getElementById('panelHome'),
    Reference: document.getElementById('panelReference'),
    Alignment: document.getElementById('panelAlignment'),
    Digits: document.getElementById('panelDigits'),
    Analogs: document.getElementById('panelAnalogs'),
    Iframe: document.getElementById('panelIframe'),
    Help: document.getElementById('panelHelp'),
    MQTT: document.getElementById('panelMQTT'),
    InfluxDB: document.getElementById('panelInfluxDB'),
    FileServer: document.getElementById('panelFileServer'),
    Schedule: document.getElementById('panelSchedule'),
    CNN: document.getElementById('panelCNN'),
    Postprocessing: document.getElementById('panelPostprocessing'),
    Reboot: document.getElementById('panelReboot'),
    Config: document.getElementById('panelConfig'),
    OTA: document.getElementById('panelOTA'),

    panelHomeBtn: document.getElementById('panelHomeBtn'),
    panelReferenceBtn: document.getElementById('panelReferenceBtn'),
    panelAlignmentBtn: document.getElementById('panelAlignmentBtn'),
    panelDigitsBtn: document.getElementById('panelDigitsBtn'),
    panelAnalogsBtn: document.getElementById('panelAnalogsBtn'),
    panelMQTTBtn: document.getElementById('panelMQTTBtn'),
    panelInfluxDBBtn: document.getElementById('panelInfluxDBBtn'),
    panelFileServerBtn: document.getElementById('panelFileServerBtn'),
    scheduleBtn: document.getElementById('scheduleBtn'),
    panelCNNBtn: document.getElementById('panelCNNBtn'),
    panelPostprocessingBtn: document.getElementById('panelPostprocessingBtn'),
    panelConfigBtn: document.getElementById('panelConfigBtn'),
    panelOTABtn: document.getElementById('panelOTABtn'),
    statusFlowNavBar: document.getElementById('statusFlowNavBar'),

    helpBtn: document.getElementById('help'),
    rebootBtn: document.getElementById('reboot'),
}

let allPanels = [
    V.OTA,
    V.Config,
    V.Reboot,
    V.Postprocessing,
    V.CNN,
    V.Schedule,
    V.FileServer, 
    V.InfluxDB, 
    V.MQTT, 
    V.Help, 
    V.Spinner, 
    V.Home, 
    V.Alignment, 
    V.Reference, 
    V.Digits, 
    V.Analogs, 
    V.Iframe
]

// VIEW EVENTS
function bindViewControls() {
    V.panelHomeBtn.addEventListener('click', (e) => focusM('Home'));
    V.panelReferenceBtn.addEventListener('click', (e) => focusM('Reference'));
    V.panelAlignmentBtn.addEventListener('click', (e) => focusM('Alignment'));
    V.panelDigitsBtn.addEventListener('click', (e) => focusM('Digits'));
    V.panelAnalogsBtn.addEventListener('click', (e) => focusM('Analogs'));
    V.panelMQTTBtn.addEventListener('click', (e) => focusM('MQTT'));
    V.panelInfluxDBBtn.addEventListener('click', (e) => focusM('InfluxDB'));
    V.panelFileServerBtn.addEventListener('click', (e) => focusM('FileServer'));
    V.scheduleBtn.addEventListener('click', (e) => focusM('Schedule'));
    V.panelCNNBtn.addEventListener('click', (e) => focusM('CNN'));
    V.panelPostprocessingBtn.addEventListener('click', (e) => focusM('Postprocessing'));
    V.panelConfigBtn.addEventListener('click', (e) => focusM('Config'));
    V.panelOTABtn.addEventListener('click', (e) => focusM('OTA'));

    V.helpBtn.addEventListener('click', (e) => focusM('Help'));
    V.rebootBtn.addEventListener('click', (e) => focusM('Reboot'));
}

function initM(name) {
    if (MODULES[name].init == undefined) return true
    if (MODULES[name].init(app)) {
        MODULES[name].init = undefined
        console.log('Init module ', name);
    }
    return !MODULES[name].init
}
async function loadM(name) {
    if (!initM(name)) return false;
    if (MODULES[name].load == undefined) return true;
    let loaded = await MODULES[name].load(app)
    if(!loaded) return false
    MODULES[name].load = undefined;
    console.log('Load module ', name);
    return true
}
export async function focusM(name) {
    hideElements(allPanels)
    showElements([V.Spinner])
    if (!await loadM(name)) { return false }
    if (MODULES[name].focus) MODULES[name].focus(app)
    console.log('Focus module ', name);


    hideElements([V.Spinner])
    showElements([V[name]])

    return true
}

export function goIframe(url) {
    focusM('Iframe')
    V.iframe.src = url;
}


async function init() {

    hideElements(allPanels)
    bindViewControls()
    const init = await app.init()
    if (!init) {
        console.log('ERROR: App init fail.');
        return
    }
    console.log('MODULES Keys: ', Object.keys(MODULES));
    
    Object.keys(MODULES).map(Mk => initM(Mk))

    console.log('Termina init, muestra panel segun setupMode', app.P.System.SetupMode.value1);

    if (app.P.System.SetupMode.value1 == true) {
        focusM('Help')
    } else {
        focusM('Home')
    }

    setInterval(async ()=>{
        const res = await app.get('/statusflow.html')
        V.statusFlowNavBar.innerHTML = res.ok? res.text : 'No status response.'
        
    }, 3000)
}

init()