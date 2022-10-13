let app
const V = {
    starttime: document.getElementById('starttime'),
    Hostname: document.getElementById('Hostname'),
    IP: document.getElementById('IP'),
    SSID: document.getElementById('SSID'),
    GitBranch: document.getElementById('GitBranch'),
    GitBaseBranch: document.getElementById('GitBaseBranch'),
    GitVersion: document.getElementById('GitVersion'),
    BuildTime: document.getElementById('BuildTime'),
    HTMLVersion: document.getElementById('HTMLVersion'),
    leaveSetupBtn: document.getElementById('leaveSetup'),
}
function bindViewControls() {
    V.leaveSetupBtn.addEventListener('click', (e) => leaveSetup());
}

////////////////////////////////////////////////

function init(_app){
    app = _app
    bindViewControls()
    return true
}

async function load(){
    await app.loadRunningValues()
    V.Hostname.innerHTML = app.V.Hostname

    V.starttime.innerHTML = app.V.starttime
    V.IP.innerHTML = app.V.IP
    V.SSID.innerHTML = app.V.SSID
    V.GitBranch.innerHTML = app.V.GitBranch
    V.GitBaseBranch.innerHTML = app.V.GitBaseBranch
    //V.GitVersion.innerHTML = app.V.GitVersion
    V.BuildTime.innerHTML = app.V.BuildTime
    V.HTMLVersion.innerHTML = app.V.HTMLVersion 
    return true
}

async function leaveSetup() {
    if (confirm("Do you want to leave the configuration mode and restart the ESP32?\n\nPlease reload the page in about 30s.")) {

        app.P.System.SetupMode.checkEnable(true).setValue(1, false)

        await app.updateDeviceConfig()  


        var stringota = "/reboot";
        window.location = stringota;
        window.location.href = stringota;
        window.location.assign(stringota);
        window.location.replace(stringota);

    }
}

export default {
    init,
    load,
    focus: undefined
}