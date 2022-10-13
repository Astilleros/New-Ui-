let app

const V = {
    EnabledChk: document.getElementById('PCPPSS_EnabledChk'),
    PreValueUse: document.getElementById('PCPPSS_PreValueUse'),
    PreValueAgeStartup:  document.getElementById('PCPPSS_PreValueAgeStartup'),
    AllowNegativeRates:  document.getElementById('PCPPSS_AllowNegativeRates'),
    ErrorMessage: document.getElementById('PCPPSS_ErrorMessage'),
    SaveBtn: document.getElementById('PCPPSS_SaveBtn'),
}
const editForm = [
    V.PreValueUse,
    V.PreValueAgeStartup,
    V.AllowNegativeRates,
    V.ErrorMessage
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
    app.C.PostProcessing.enabled = V.EnabledChk.checked;
    if(app.C.PostProcessing.enabled){
        app.P.PostProcessing.PreValueUse.checkEnable(true).setValue(1, V.PreValueUse.checked);
        app.P.PostProcessing.PreValueAgeStartup.checkEnable(true).setValue(1, V.PreValueAgeStartup.value);
        app.P.PostProcessing.AllowNegativeRates.checkEnable(true).setValue(1, V.AllowNegativeRates.checked);
        app.P.PostProcessing.ErrorMessage.checkEnable(true).setValue(1, V.ErrorMessage.checked);
    }

    const updated = await app.updateDeviceConfig()   
    if(!updated) return false
    alert("Config.ini is updated!");
}
function load() {
    V.EnabledChk.checked = app.C.PostProcessing.enabled
    V.PreValueUse.checked = app.P.PostProcessing.PreValueUse.value1
    V.PreValueAgeStartup.value = app.P.PostProcessing.PreValueAgeStartup.value1
    V.AllowNegativeRates.checked = app.P.PostProcessing.AllowNegativeRates.value1
    V.ErrorMessage.checked = app.P.PostProcessing.ErrorMessage.value1

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
