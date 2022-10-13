let app

const V = {
    DigitEnabledChk: document.getElementById('PCNN_DigitEnabledChk'),
    DigitModel: document.getElementById('PCNN_DigitModel'),
    CNNGoodThreshold:  document.getElementById('PCNN_CNNGoodThreshold'),
    AnalogEnabledChk: document.getElementById('PCNN_AnalogEnabledChk'),
    AnalogModel:  document.getElementById('PCNN_AnalogModel'),
    SaveBtn: document.getElementById('PCNN_SaveBtn'),
}

const digitForm = [
    V.DigitModel,
    V.CNNGoodThreshold
]
const analogForm = [
    V.AnalogModel
]

function bindViewControls() {
    V.DigitEnabledChk.addEventListener('change', setEnable);
    V.AnalogEnabledChk.addEventListener('change', setEnable);
    V.SaveBtn.addEventListener('click', Save);
}

function setEnable(){
    if(V.DigitEnabledChk.checked) enableElements(digitForm);
    else disableElements(digitForm);
    if(V.AnalogEnabledChk.checked) enableElements(analogForm);
    else disableElements(analogForm);
}

async function Save() {
    app.C.Digits.enabled = V.DigitEnabledChk.checked;
    if(app.C.Digits.enabled){
        app.P.Digits.Model.checkEnable(true).setValue(1, V.DigitModel.value);
        app.P.Digits.CNNGoodThreshold.checkEnable(true).setValue(1, V.CNNGoodThreshold.checked);
    }
    app.C.Analog.enabled = V.AnalogEnabledChk.checked;
    if(app.C.Analog.enabled){
        app.P.Analog.Model.checkEnable(true).setValue(1, V.AnalogModel.value);
    }

    const updated = await app.updateDeviceConfig()   
    if(!updated) return false
    alert("Config.ini is updated!");
}
function load() {
    V.DigitEnabledChk.checked = app.C.Digits.enabled 
    V.AnalogEnabledChk.checked = app.C.Analog.enabled 

    V.DigitModel.value = app.P.Digits.Model.value1
    V.CNNGoodThreshold.checked = app.P.Digits.CNNGoodThreshold.value1
    V.AnalogModel.value =  app.P.Analog.Model.value1
    
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
