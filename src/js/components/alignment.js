import { Canvas } from '../helpers/canvas.js'
let app
// CORE
const canvas = new Canvas(document.getElementById('PAcanvas'))

// VIEW IDS
const V = {
    referenceSlc: document.getElementById("index"),
    enhanceContrastBtn: document.getElementById("enhancecontrast"),
    updateReferenceBtn: document.getElementById("updatereference"),
    saveRoiBtn: document.getElementById("PAsaveroi"),
    savereboot: document.getElementById("PAsavereboot"),

    nameTxt: document.getElementById("name"),
    referenceImg: document.getElementById("img_ref"),
    refOriginalImg: document.getElementById("img_ref_org"),


    x: document.getElementById("PArefx"),
    y: document.getElementById("PArefy"),
    dx: document.getElementById("PArefdx"),
    dy: document.getElementById("PArefdy"),
    gridChk: document.getElementById("PAgrid"),
    pointerChk: document.getElementById("PApointer"),

    SearchFieldXNum: document.getElementById("PA_SearchFieldX"),
    SearchFieldYNum: document.getElementById("PA_SearchFieldY"),
    AlignmentAlgoSlc: document.getElementById("PA_AlignmentAlgo")


}

// VIEW GROUPS
const form = []
// VIEW EVENTS
function bindViewControls() {
    V.enhanceContrastBtn.addEventListener('click', EnhanceContrast);
    V.updateReferenceBtn.addEventListener('click', CutOutReference);
    V.saveRoiBtn.addEventListener('click', SaveToConfig);
    V.savereboot.addEventListener('click', SaveAdvanced);
    V.x.addEventListener('change', valuemanualchanged);
    V.y.addEventListener('change', valuemanualchanged);
    V.dx.addEventListener('change', valuemanualchanged);
    V.dy.addEventListener('change', valuemanualchanged);
    V.nameTxt.addEventListener('change', nameChanged);
    V.referenceSlc.addEventListener('change', ChangeSelection);
    V.gridChk.addEventListener('click', grid);
    V.pointerChk.addEventListener('change', pointer);

    V.referenceImg.addEventListener('load', function (e) {
        V.dx.value = this.width;
        V.dy.value = this.height;
        app.R[refIndex]["dx"] = this.width;
        app.R[refIndex]["dy"] = this.height;
        rect.dx = V.dx.value;
        rect.dy = V.dy.value;
        drawRec();
    })
}

// VIEW OTHERS
let rect = {
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
}
let refIndex = 0
let enhanceConDone = false

function ChangeSelection() {
    refIndex = parseInt(V.referenceSlc.value);
    UpdateReference();
}
function nameChanged() {
    app.R[refIndex].name = V.nameTxt.value;
}
function valuemanualchanged() {
    rect.dx = V.dx.value;
    rect.dy = V.dy.value;
    rect.x = V.x.value;
    rect.y = V.y.value;
    drawRec();
}

async function CutOutReference() {
    app.R[refIndex].x = V.x.value;
    app.R[refIndex].y = V.y.value;
    app.R[refIndex].dx = V.dx.value;
    app.R[refIndex].dy = V.dy.value;

    await CallMakeRefZW();

    UpdateReference();

    V.enhanceContrastBtn.disabled = false;
}

async function EnhanceContrast() {
    // SAVE VIEW INFO TO APP
    app.R[refIndex]["name"] = V.nameTxt.value;
    app.R[refIndex]["x"] = V.x.value;
    app.R[refIndex]["y"] = V.y.value;
    app.R[refIndex]["dx"] = V.dx.value;
    app.R[refIndex]["dy"] = V.dy.value;

    enhanceConDone = true;
    const enhanced = await MakeContrastImageZW(app.R[refIndex], enhanceConDone);
    if (!enhanced) {
        console.log(`Error enhancing alignment mark.`);
        return false
    }
    UpdateReference();
    return true
}

async function SaveAdvanced() {
    app.P.Alignment.SearchFieldX.setValue(1, V.SearchFieldXNum.value);
    app.P.Alignment.SearchFieldY.setValue(1, V.SearchFieldYNum.value);
    app.P.Alignment.AlignmentAlgo.setValue(1, V.AlignmentAlgoSlc.value);


    const updated = await app.updateDeviceConfig()   
    if(!updated) return false
    alert("Config.ini is updated!");
}
async function SaveToConfig() {

    // OLD UPDATE CONFIG REFERENCE
    for (var index = 0; index < 2; ++index) {
        let to = app.R[index]["name"];
        let from = to.replace("/config/", "/img_tmp/");
        await app.deleteFile(to);
        await app.copyFile(from, to);

        to = to.replace(".jpg", "_org.jpg");
        from = from.replace(".jpg", "_org.jpg");
        await app.deleteFile(to);
        await app.copyFile(from, to);
    }

    const updated = await app.updateDeviceConfig()   
    if(!updated) return false
    alert("Config.ini is updated!");
}

// RELOAD REFERENCE VIEW FROM APP
function UpdateReference() {
    const path_tmp = app.R[refIndex]["name"].replace("/config/", "/img_tmp/");
    const url_ref = new URL(`/fileserver${path_tmp}?${Date.now()}`, app.V.basepath)
    console.log('Alignment UpdateReference url url_ref: ', url_ref.toString());
    V.referenceImg.src = url_ref.toString();

    const path_org = app.R[refIndex]["name"].replace("/config/", "/img_tmp/").replace(".jpg", "_org.jpg");
    const url_org = new URL(`/fileserver${path_org}?${Date.now()}`, app.V.basepath)
    console.log('Alignment UpdateReference url_org: ', url_org.toString());
    V.refOriginalImg.src = url_org.toString();

    V.nameTxt.value = app.R[refIndex]["name"];
    V.x.value = app.R[refIndex]["x"];
    V.y.value = app.R[refIndex]["y"];
    rect.x = app.R[refIndex]["x"];
    rect.y = app.R[refIndex]["y"];

    V.enhanceContrastBtn.disabled = true;

    drawRec();
}

async function CallMakeRefZW() {
    let zw = app.R[refIndex]
    const path = zw["name"].replace("/config/", "/img_tmp/").replace(".jpg", "_org.jpg");

    let url = '/editflow.html?task=cutref'
    url += '&in=/config/reference.jpg'
    url += '&out='+path
    url += '&x='+zw.x
    url += '&y='+zw.y
    url += '&dx='+zw.dx
    url += '&dy='+zw.dy
    const res = await app.get(url)


    const cuted = await app.get(url)
    if (!cuted.ok) return false

    const path2 = app.R[refIndex]["name"].replace("/config/", "/img_tmp/");
    const copied = await app.copyFile(path, path2);
    if (!copied.ok) return false
    return true
}

async function MakeContrastImageZW(zw, enhanceContrast) {

    let url = '/editflow.html?task=cutref'
    url += '&in=/config/reference.jpg'
    url += '&out='+zw["name"].replace("/config/", "/img_tmp/")
    url += '&x='+zw.x
    url += '&y='+zw.y
    url += '&dx='+zw.dx
    url += '&dy='+zw.dy
    if (enhanceContrast) url += 'enhance=true'
    const res = await app.get(url)

    const enhanced = await app.get(url)
    return enhanced.ok

}

function drawRec() {
    canvas.clearRectangle()
    canvas.addRectangle({
        x: parseInt(rect.x),
        y: parseInt(rect.y),
        dx: parseInt(rect.dx),
        dy: parseInt(rect.dy),
        template: 'rectangle'
    })
}
function grid() { canvas.grid(V.gridChk.checked) }
function pointer() { canvas.pointer(V.pointerChk.checked) }

function init(_app) {
    app = _app

    canvas.addEventListener('newRectangle', e => {
        rect = canvas.rect
        V.dx.value = rect.dx;
        V.dy.value = rect.dy;
        V.x.value = rect.x;
        V.y.value = rect.y;
        drawRec()
        canvas.createRectangle()
    })

    app.addEventListener('ReferenceUpdated', e => {
        canvas.fromBlob(app.blobReference)
    })

    bindViewControls()
    canvas.createRectangle()

    return true
}

async function load() {
    if(app.blobReference != undefined){
        canvas.fromBlob(app.blobReference)
    }else{
        await app.loadReferenceBlob()
    }
    for (let i = 0; i < 2; ++i) {
        const enhanced = app.R[i]["name"];
        const temp_enh = enhanced.replace("/config/", "/img_tmp/");

        await app.deleteFile(temp_enh)
        const c1 = await app.copyFile(enhanced, temp_enh)
        if(!c1.ok) return false

        const original = enhanced.replace(".jpg", "_org.jpg");
        const temp_org = temp_enh.replace(".jpg", "_org.jpg");

        
        await app.deleteFile(temp_org)
        const c2 = await app.copyFile(original, temp_org)
        if(!c2.ok) return false
    }

    V.SearchFieldXNum.value = app.P.Alignment.SearchFieldX.value1
    V.SearchFieldYNum.value = app.P.Alignment.SearchFieldY.value1
    V.AlignmentAlgoSlc.value = app.P.Alignment.AlignmentAlgo.value1

    return true
}

function focus() {
    UpdateReference();
}

export default {
    init,
    load,
    focus
}