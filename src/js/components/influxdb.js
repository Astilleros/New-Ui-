let app

// VIEW IDS
const V = {
    Uri: document.getElementById('PIDB_Uri'),
    Database:  document.getElementById('PIDB_Database'),
    Measurement:  document.getElementById('PIDB_Measurement'),
    user: document.getElementById('PIDB_user'),
    password:  document.getElementById('PIDB_password'), 
    EnabledChk: document.getElementById('PIDB_EnabledChk'),
    SaveBtn: document.getElementById('PIDB_SaveBtn'),
}
const editForm = [
    V.Uri,
    V.Database,
    V.Measurement,
    V.user,
    V.password
]
// VIEW EVENTS
function bindViewControls() {
    V.EnabledChk.addEventListener('change', setEnable);
    V.SaveBtn.addEventListener('click', Save);
}
function setEnable(){
    if(V.EnabledChk.checked) enableElements(editForm);
    else disableElements(editForm);
}
async function Save() {
    app.C.InfluxDB.enabled = V.EnabledChk.checked;
    if(app.C.InfluxDB.enabled){
        app.P.InfluxDB.Uri.checkEnable(true).setValue(1, V.Uri.value);
        app.P.InfluxDB.Database.checkEnable(true).setValue(1, V.Database.value);
        app.P.InfluxDB.Measurement.checkEnable(true).setValue(1, V.Measurement.value);
        app.P.InfluxDB.user.checkEnable(true).setValue(1, V.user.value);
        app.P.InfluxDB.password.checkEnable(true).setValue(1, V.password.value);
    }

    const updated = await app.updateDeviceConfig()   
    if(!updated) return false
    alert("Config.ini is updated!");
}
function load() {
    V.EnabledChk.checked = app.C.InfluxDB.enabled

    V.Uri.value = app.P.InfluxDB.Uri.value1
    V.Database.value = app.P.InfluxDB.Database.value1
    V.Measurement.value = app.P.InfluxDB.Measurement.value1
    V.user.value = app.P.InfluxDB.user.value1
    V.password.value = app.P.InfluxDB.password.value1

    setEnable()
    return true
}

function init(_app){
    app = _app
    bindViewControls()
    return true
}


export default {
    init,
    load,
    focus: undefined
}
