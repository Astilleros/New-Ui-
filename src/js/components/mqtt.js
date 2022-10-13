let app

const V = {
    Uri: document.getElementById('PMQTT_Uri'),
    MainTopic:  document.getElementById('PMQTT_MainTopic'),
    ClientID:  document.getElementById('PMQTT_ClientID'),
    user: document.getElementById('PMQTT_user'),
    password:  document.getElementById('PMQTT_password'),
    SetRetainFlag: document.getElementById('PMQTT_SetRetainFlag'), 
    EnabledChk: document.getElementById('PMQTT_EnabledChk'),
    SaveBtn: document.getElementById('PMQTT_SaveBtn'),
}
const editForm = [
    V.Uri,
    V.MainTopic,
    V.ClientID,
    V.user,
    V.password,
    V.SetRetainFlag
]
function bindViewControls() {
    V.EnabledChk.addEventListener('change', setEnable);
    V.SaveBtn.addEventListener('click', Save);
}
function setEnable(){
    if(V.EnabledChk.checked) enableElements(editForm);
    else disableElements(editForm);
}
async function Save() {
    app.C.MQTT.enabled = V.EnabledChk.checked;
    if(app.C.MQTT.enabled){
        app.P.MQTT.Uri.checkEnable(true).setValue(1, V.Uri.value);
        app.P.MQTT.MainTopic.checkEnable(true).setValue(1, V.MainTopic.value);
        app.P.MQTT.ClientID.checkEnable(true).setValue(1, V.ClientID.value);
        app.P.MQTT.user.checkEnable(true).setValue(1, V.user.value);
        app.P.MQTT.password.checkEnable(true).setValue(1, V.password.value);
        app.P.MQTT.SetRetainFlag.checkEnable(true).setValue(1, V.SetRetainFlag.checked);
    }

    const updated = await app.updateDeviceConfig()   
    if(!updated) return false
    alert("Config.ini is updated!");
}
function load() {
    V.EnabledChk.checked = app.C.MQTT.enabled
    
    V.Uri.value = app.P.MQTT.Uri.value1
    V.MainTopic.value = app.P.MQTT.MainTopic.value1
    V.ClientID.value = app.P.MQTT.ClientID.value1
    V.user.value = app.P.MQTT.user.value1
    V.password.value = app.P.MQTT.password.value1
    V.SetRetainFlag.checked = app.P.MQTT.SetRetainFlag.value1

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
