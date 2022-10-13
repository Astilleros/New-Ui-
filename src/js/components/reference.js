
import {Canvas} from '../helpers/canvas.js'
import { random } from '../helpers/utils.js'
import {focusM} from '../index.js'
let app
// CORE
const canvas = new Canvas(document.getElementById('PRcanvas'))

// VIEW IDS
const V = {
    showReferenceBtn: document.getElementById("showReferenceBtn"),
    saveReferenceBtn: document.getElementById("saveReferenceBtn"),
    doTakeBtn: document.getElementById("doTakeBtn"),
    ledNum: document.getElementById("MakeImage_LEDIntensity_value1"),
    brightnessNum: document.getElementById("MakeImage_Brightness_value1"),
    contrastNum: document.getElementById("MakeImage_Contrast_value1"),
    saturationNum: document.getElementById("MakeImage_Saturation_value1"),
    prerotateNum: document.getElementById("prerotateangle"),
    finerotateNum: document.getElementById("finerotate"), // NO SERVER USE
    waitTimeNum: document.getElementById("MakeImage_WaitBeforeTakingPicture_value1"),
    imageQualityNum: document.getElementById("MakeImage_ImageQuality_value1"),
    imageSizeSlc: document.getElementById("MakeImage_ImageSize_value1"),
    fixedExposureChk: document.getElementById("MakeImage_FixedExposure_value1"), // NO SERVER USE
    flipVerChk: document.getElementById("flipVer"), // NO SERVER USE
    flipHorChk: document.getElementById("flipHor"), // NO SERVER USE
    saveReboot: document.getElementById("saveReboot"),
    
    gridChk: document.getElementById("PRgrid"),
    pointerChk: document.getElementById("PRpointer")
}
// VIEW GROUPS
const form = [
    V.ledNum, V.brightnessNum, V.contrastNum, V.saturationNum,
    V.prerotateNum, V.finerotateNum, V.flipVerChk, V.flipHorChk, 
    V.waitTimeNum, V.imageSizeSlc, V.imageQualityNum, V.fixedExposureChk,
    V.gridChk, V.pointerChk
]
// VIEW EVENTS
function bindViewControls() {
    V.showReferenceBtn.addEventListener('click', showReference);
    V.doTakeBtn.addEventListener('click', doTake);
    V.saveReferenceBtn.addEventListener('click', saveReference);
    V.saveReboot.addEventListener('click', saveReboot);
    V.gridChk.addEventListener('click', grid);
    V.pointerChk.addEventListener('change', pointer);
    V.prerotateNum.addEventListener('change', setDegrees);
    V.finerotateNum.addEventListener('change', setDegrees);
    V.flipVerChk.addEventListener('change', flipVer);
    V.flipHorChk.addEventListener('change', flipHor);
}


// PRINCIPAL ACTIONS 
async function doTake(){ 
    disableElements(form)

    let url = `/editflow.html?task=test_take`
    url += '&host='+app.V.basepath
    url += '&bri='+V.brightnessNum.value
    url += '&con='+V.contrastNum.value
    url += '&sat='+V.saturationNum.value
    url += '&int='+V.ledNum.value
    const res = await app.get(url)
    if(!res.ok) {
        enableElements(form)
        return false
    }

    // CONFIG CANVAS INIT from VIWE
    canvas.reset()
    setDegrees()
    canvas.flipHor(V.flipHorChk.checked)
    canvas.flipVer(V.flipVerChk.checked)
    canvas.pointer(V.pointerChk.checked)
    canvas.grid(V.gridChk.checked)
    canvas.loadUrl(`${app.V.basepath}/img_tmp/raw.jpg?session=${random()}`)

    enableElements(form)
    return true
}

async function showReference(){
    const rotate = app.P.Alignment.InitialRotate.value1
    const prerotate = Math.trunc(rotate)
    const finerotate =  +(Math.round((rotate % 1) + "e+2")  + "e-2");
    // LOAD FORM FROM CONFIG
    V.ledNum.value = app.P.MakeImage.LEDIntensity.value1
    V.brightnessNum.value = app.P.MakeImage.Brightness.value1
    V.contrastNum.value = app.P.MakeImage.Contrast.value1
    V.saturationNum.value = app.P.MakeImage.Saturation.value1
    V.finerotateNum.value = finerotate
    V.prerotateNum.value = prerotate
    V.waitTimeNum.value = app.P.MakeImage.WaitBeforeTakingPicture.value1
    V.imageQualityNum.value = app.P.MakeImage.ImageQuality.value1
    V.imageSizeSlc.value = app.P.MakeImage.ImageSize.value1
    V.flipHorChk.checked = app.P.MakeImage.FlipHor.value1 == 'true'
    V.flipVerChk.checked = app.P.MakeImage.FlipVer.value1 == 'true'
    V.fixedExposureChk.checked = app.P.MakeImage.FixedExposure.value1 == 'true'
    
    canvas.reset()
    
    if(app.blobReference != undefined){
        canvas.fromBlob(app.blobReference)
    }else{
        await app.loadReferenceBlob()
    }

    disableElements(form);
}

async function saveReboot(){
    app.P.MakeImage.WaitBeforeTakingPicture.checkEnable(true).setValue(1, V.waitTimeNum.value)
    app.P.MakeImage.ImageQuality.checkEnable(true).setValue(1, V.imageQualityNum.value)
    app.P.MakeImage.ImageSize.checkEnable(true).setValue(1, V.imageSizeSlc.value)
    app.P.MakeImage.FixedExposure.checkEnable(true).setValue(1, V.fixedExposureChk.checked)

    const updated = await app.updateDeviceConfig()   
    if(!updated) return false

    focusM('Reboot')

}


async function saveReference(){
    if (confirm("Are you sure you want to update the reference image?")) {

        canvas.grid(false)
        canvas.pointer(false)
        canvas.redraw()


        // SAVE FORM
        app.P.Alignment.InitialRotate.checkEnable(true).setValue(1, Number(V.prerotateNum.value) + Number(V.finerotateNum.value))
        app.P.MakeImage.Brightness.checkEnable(true).setValue(1, V.brightnessNum.value)
        app.P.MakeImage.Contrast.checkEnable(true).setValue(1, V.contrastNum.value)
        app.P.MakeImage.Saturation.checkEnable(true).setValue(1, V.saturationNum.value)
        app.P.MakeImage.LEDIntensity.checkEnable(true).setValue(1, V.ledNum.value)
        app.P.MakeImage.WaitBeforeTakingPicture.checkEnable(true).setValue(1, V.waitTimeNum.value)
        app.P.MakeImage.ImageQuality.checkEnable(true).setValue(1, V.imageQualityNum.value)
        app.P.MakeImage.ImageSize.checkEnable(true).setValue(1, V.imageSizeSlc.value)
        app.P.MakeImage.FixedExposure.checkEnable(true).setValue(1, V.fixedExposureChk.checked)
        app.P.MakeImage.FlipHor.checkEnable(true).setValue(1, V.flipHorChk.checked)
        app.P.MakeImage.FlipVer.checkEnable(true).setValue(1, V.flipVerChk.checked)

        const updated = await app.updateDeviceConfig()   
        if(!updated) return false

        // SAVE CANVAS TO SERVER
        const file_path = "/config/reference.jpg"
        const blob = canvas.toBlob()
        
        const deleted = await app.deleteFile(file_path);
        if(!deleted.ok) {
             console.log(`Error deleting old image reference.`);
        } 
        const uploaded = await app.uploadFile(file_path, blob);
        if(!uploaded.ok) {
             console.log(`Error uploading new image reference.`);
             return false
        } 

        showReference();
        
        alert("Reference is updated!");

        return true

    }
}

// SECONDARY CANVAS ACTIONS
function setDegrees(){
    let prerot= parseFloat(V.prerotateNum.value);
    let finerot= parseFloat(V.finerotateNum.value);
    if (finerot == 1 || finerot == -1) { prerot+=finerot; finerot=0; }
    V.prerotateNum.value = prerot
    V.finerotateNum.value = finerot
    canvas.setDegrees(prerot + finerot)
}
function flipHor() { canvas.flipHor(V.flipHorChk.checked) }
function flipVer() { canvas.flipVer(V.flipVerChk.checked) }
function grid() { canvas.grid(V.gridChk.checked) }
function pointer() { canvas.pointer(V.pointerChk.checked) }


function init(_app) {
    app = _app
    
    bindViewControls()

    app.addEventListener('ReferenceUpdated', e => {
        canvas.fromBlob(app.blobReference)
    })

    return true
}

function load() {
    // ENSURE MINIMAL ENABLE APP CONFIG
    app.P.MakeImage.LEDIntensity.enabled = true;
    app.P.MakeImage.Brightness.enabled = true;
    app.P.MakeImage.Contrast.enabled = true;
    app.P.MakeImage.Saturation.enabled = true;
    app.P.Alignment.InitialRotate.enabled = true;
    app.P.MakeImage.FlipVer.enabled = true;
    app.P.MakeImage.FlipHor.enabled = true;
    app.P.MakeImage.WaitBeforeTakingPicture.enabled = true;
    app.P.MakeImage.ImageQuality.enabled = true;
    app.P.MakeImage.ImageSize.enabled = true;
    app.P.MakeImage.FixedExposure.enabled = true;

    // DEFAULTS TO APP CONFIG NOT FOUNDS
    if (!app.P.MakeImage.LEDIntensity.found) app.P.MakeImage.LEDIntensity.setValue(1, '0');
    if (!app.P.MakeImage.Brightness.found) app.P.MakeImage.Brightness.setValue(1, '0');
    if (!app.P.MakeImage.Contrast.found) app.P.MakeImage.Contrast.setValue(1, '0');
    if (!app.P.MakeImage.Saturation.found) app.P.MakeImage.Saturation.setValue(1, '0');
    if (!app.P.Alignment.InitialRotate.found) app.P.Alignment.InitialRotate.setValue(1, '0');
    if (!app.P.MakeImage.FlipVer.found) app.P.MakeImage.FlipVer.setValue(1, 'false');
    if (!app.P.MakeImage.FlipHor.found) app.P.MakeImage.FlipHor.setValue(1, 'false');
    if (!app.P.MakeImage.WaitBeforeTakingPicture.found) app.P.MakeImage.WaitBeforeTakingPicture.setValue(1, '5');
    if (!app.P.MakeImage.ImageQuality.found) app.P.MakeImage.ImageQuality.setValue(1, '10');
    if (!app.P.MakeImage.ImageSize.found) app.P.MakeImage.ImageSize.setValue(1, 'VGA');
    if (!app.P.MakeImage.FixedExposure.found) app.P.MakeImage.FixedExposure.setValue(1, 'false');

    return true
}

function focus(){
    showReference(); 
}

export default {
    init,
    load,
    focus
}