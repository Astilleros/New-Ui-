let app

const V = {
    AutoStart: document.getElementById('PCFG_AutoStart'),
    Interval:  document.getElementById('PCFG_Interval'),
    
    RawLogEnabled: document.getElementById('PCFG_RawLogEnabledChk'),
    RawStorePath:  document.getElementById('PCFG_RawLogImageLocation'),
    RawStoreRetention: document.getElementById('PCFG_RawLogfileRetentionInDays'),

    DigitLogEnabled: document.getElementById('PCFG_DigitLogEnabledChk'),
    DigitStorePath:  document.getElementById('PCFG_DigitLogImageLocation'),
    DigitStoreRetention: document.getElementById('PCFG_DigitLogfileRetentionInDays'),

    AnalogLogEnabled: document.getElementById('PCFG_AnalogLogEnabledChk'),
    AnalogStorePath:  document.getElementById('PCFG_AnalogLogImageLocation'),
    AnalogStoreRetention: document.getElementById('PCFG_AnalogLogfileRetentionInDays'),

    SaveBtn: document.getElementById('PCFG_SaveBtn')
}
const deviceRun = [
    V.AutoStart,
    V.Interval
]
const rawForm = [
    V.RawStorePath,
    V.RawStoreRetention
]
const digitForm = [
    V.DigitStorePath,
    V.DigitStoreRetention
]
const analogForm = [
    V.AnalogStorePath,
    V.AnalogStoreRetention
]

function bindViewControls() {
    V.RawLogEnabled.addEventListener('change', setEnable);
    V.DigitLogEnabled.addEventListener('change', setEnable);
    V.AnalogLogEnabled.addEventListener('change', setEnable);
    V.SaveBtn.addEventListener('click', Save);
}

function setEnable(){
    if(V.RawLogEnabled.checked) enableElements(rawForm);
    else disableElements(rawForm);
    if(V.DigitLogEnabled.checked) enableElements(digitForm);
    else disableElements(digitForm);
    if(V.AnalogLogEnabled.checked) enableElements(analogForm);
    else disableElements(analogForm);
}

async function Save() {
    app.P.AutoTimer.AutoStart.checkEnable(true).setValue(1, V.AutoStart.value);
    app.P.AutoTimer.Intervall.checkEnable(true).setValue(1, V.Interval.value);

    const rawOn = V.RawLogEnabled.checked
    app.P.MakeImage.LogImageLocation.checkEnable(rawOn).setValue(1, V.RawStorePath.value);
    app.P.MakeImage.LogfileRetentionInDays.checkEnable(rawOn).setValue(1, V.RawStoreRetention.value);
    
    const digOn = V.DigitLogEnabled.checked
    app.P.Digits.LogImageLocation.checkEnable(digOn).setValue(1, V.DigitStorePath.value);
    app.P.Digits.LogfileRetentionInDays.checkEnable(digOn).setValue(1, V.RawStoreRetention.value);

    const anaOn = V.AnalogLogEnabled.checked
    app.P.Analog.LogImageLocation.checkEnable(anaOn).setValue(1, V.AnalogStorePath.value);
    app.P.Analog.LogfileRetentionInDays.checkEnable(anaOn).setValue(1, V.AnalogStoreRetention.value);

    const updated = await app.updateDeviceConfig()   
    if(!updated) return false
    alert("Config.ini is updated!");
}
function load() {
    V.RawLogEnabled.checked = app.P.MakeImage.LogfileRetentionInDays.enabled
    V.DigitLogEnabled.checked = app.P.Digits.LogfileRetentionInDays.enabled
    V.AnalogLogEnabled.checked = app.P.Analog.LogfileRetentionInDays.enabled
    
    V.AutoStart.value = app.P.AutoTimer.AutoStart.value1
    V.Interval.value = app.P.AutoTimer.Intervall.value1

    V.RawStorePath.value = app.P.MakeImage.LogImageLocation.value1
    V.RawStoreRetention.value = app.P.MakeImage.LogfileRetentionInDays.value1

    V.DigitStorePath.value = app.P.Digits.LogImageLocation.value1
    V.DigitStoreRetention.value = app.P.Digits.LogfileRetentionInDays.value1

    V.AnalogStorePath.value = app.P.Analog.LogImageLocation.value1
    V.AnalogStoreRetention.value = app.P.Analog.LogfileRetentionInDays.value1

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
