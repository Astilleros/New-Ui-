import {Canvas} from '../helpers/canvas.js'
let app

// CORE
const canvas = new Canvas(document.getElementById('PANcanvas'))

// VIEW IDS
const V = {
    analogEnableChk: document.getElementById("Category_Analog_enabled"),
    lockARChk: document.getElementById("PANlockAR"),
    
    newNumberBtn: document.getElementById("PANnewNumber"),
    numberSlc: document.getElementById("PANNumbers_value1"),
    renameNumberBtn: document.getElementById("PANrenameNumber"),
    removeNumberBtn: document.getElementById("PANremoveNumber"),

    newRoiBtn: document.getElementById("PANnewROI"),
    RoiSlc: document.getElementById("PANindex"),
    renameRoiBtn: document.getElementById("PANrenameROI"),
    deleteRoiBtn: document.getElementById("PANdeleteROI"),
    moveNextBtn: document.getElementById("PANmoveNext"),
    movePreviousBtn: document.getElementById("PANmovePrevious"),


    saveRoiBtn: document.getElementById("PANsaveroi"),

    x: document.getElementById("PANrefx"),
    y: document.getElementById("PANrefy"),
    dx: document.getElementById("PANrefdx"),
    dy: document.getElementById("PANrefdy"),
    gridChk: document.getElementById("PANgrid"),
    pointerChk: document.getElementById("PANpointer")
}
// VIEW GROUPS
const numberGroup = [V.newNumberBtn, V.numberSlc, V.renameNumberBtn, V.removeNumberBtn]
const roiGroup = [V.lockARChk, V.newRoiBtn, V.RoiSlc, V.renameRoiBtn, V.deleteRoiBtn, V.moveNextBtn, V.movePreviousBtn, V.saveRoiBtn, V.x, V.y, V.dx, V.dy]
const editGroup = [...roiGroup, ...numberGroup]
// VIEW EVENTS
function bindViewControls() {
    V.analogEnableChk.addEventListener('click', changeAnalogEnableChk);
    V.lockARChk.addEventListener('click', changeLockARChk);
    V.newNumberBtn.addEventListener('click', newNumber);
    V.numberSlc.addEventListener('change', (e) => UpdateROIs());
    V.renameNumberBtn.addEventListener('click', renameNumber);
    V.removeNumberBtn.addEventListener('click', removeNumber);
    V.newRoiBtn.addEventListener('click', newROI);
    V.RoiSlc.addEventListener('change', ChangeSelection);
    V.renameRoiBtn.addEventListener('click', renameROI);
    V.deleteRoiBtn.addEventListener('click', deleteROI);
    V.moveNextBtn.addEventListener('click', moveNext);
    V.movePreviousBtn.addEventListener('click', movePrevious);
    V.x.addEventListener('change', valuemanualchanged);
    V.y.addEventListener('change', valuemanualchanged);
    V.dx.addEventListener('change', valuemanualchangeddx);
    V.dy.addEventListener('change', valuemanualchanged);
    V.saveRoiBtn.addEventListener('click', SaveToConfig);
    //////
    V.gridChk.addEventListener('click', grid);
    V.pointerChk.addEventListener('change', pointer);
}

// STATUS && SHORTCUTS
let rect = { x: 0, y: 0, dx: 0, dy: 0 }
let roiI = 0
let analogs = []

function changeAnalogEnableChk() {
    if (V.analogEnableChk.checked) {
        enableElements(editGroup)
        canvas.createRectangle('analog', V.lockARChk.checked ? 1 : undefined)
        UpdateNUMBERS();
    } else {
        disableElements(editGroup)
        canvas.exitCreateRectangle()
    }
}

function changeLockARChk() {
    canvas.createRectangle('analog', V.lockARChk.checked ? 1 : undefined)
}

function UpdateNUMBERS(numberName) {

    while (V.numberSlc.length) V.numberSlc.remove(0);
    app.N.forEach((d, i) => {
        let option = document.createElement("option")
        option.text = d.name
        option.value = i
        V.numberSlc.add(option)
    })
    V.numberSlc.selectedIndex = 0
    if (numberName !== undefined) {
        app.N.forEach((d, i) => d.name == numberName ? V.numberSlc.selectedIndex = i : null)
    }

    UpdateROIs();
}

function renameNumber() {
    const oldName = V.numberSlc.options[V.numberSlc.selectedIndex].text;
    const newName = prompt("Please enter new name", oldName);
    const res = app.RenameNUMBER(oldName, newName);
    if (res != undefined) return alert(res);
    UpdateNUMBERS(newName);
}

function newNumber() {
    let numberName = prompt("Please enter name of new number", "name");
    numberName = numberName.replace(/ /g, '')
    const res = app.CreateNUMBER(numberName);
    if (res != undefined) return alert(res);
    UpdateNUMBERS(numberName);
}

function removeNumber() {
    if (confirm("This will remove the number complete (analog and digital).\nIf you only want to remove the digital ROIs, please use \"Delete ROIs\".\nDo you want to proceed?")) {
        const numberName = V.numberSlc.options[V.numberSlc.selectedIndex].text;
        const res = app.DeleteNUMBER(numberName);
        if (res != undefined) return alert(res);
        UpdateNUMBERS();
    }
}

function deleteROI() {
    const numberName = V.numberSlc.options[V.numberSlc.selectedIndex].text;
    const roiName = V.RoiSlc.options[V.RoiSlc.selectedIndex].text;
    const res = app.deleteROI(numberName, 'analog', roiName)
    if (res?.length) return alert(res)
    UpdateROIs();
}

function newROI() {
    const numberName = V.numberSlc.options[V.numberSlc.selectedIndex].text;
    const roiName = prompt("Please enter name of new ROI", "name");
    const res = app.CreateROI(
        numberName,
        "analog",
        roiName,
        1,
        1,
        analogs.length ? analogs[roiI].dx : 30,
        analogs.length ? analogs[roiI].dy : 51
    )
    if (res?.length) return alert(res);
    UpdateROIs(roiName);
}

function movePrevious() {
    [analogs[roiI - 1], analogs[roiI]] = [analogs[roiI], analogs[roiI - 1]];
    roiI--;
    UpdateROIs();
}

function moveNext() {
    [analogs[roiI + 1], analogs[roiI]] = [analogs[roiI], analogs[roiI + 1]];
    roiI++;
    UpdateROIs();
}

function ChangeSelection() {
    roiI = parseInt(V.RoiSlc.value);
    UpdateROIs();
}

async function SaveToConfig() {
    app.C.Analog.enabled = V.analogEnableChk.checked;
    await app.updateDeviceConfig()
    alert("Config.ini is updated!");
}

function renameROI() {
    const numberName = V.numberSlc.options[V.numberSlc.selectedIndex].text;
    const roiName = V.RoiSlc.options[V.RoiSlc.selectedIndex].text;
    const newName = prompt("Please enter new name", roiName);
    const res = app.RenameROI(numberName, "analog", roiName, newName);
    if (res?.length) return alert(res);

    UpdateROIs(newName);
}

function UpdateROIs(roiName) {

    // SHORTCUT SELECTED NUMBER DIGITS
    analogs = app.N[V.numberSlc.selectedIndex].analog

    if (V.analogEnableChk.checked == false) {
        disableElements(roiGroup)
        return
    }

    if (!analogs?.length) {
        disableElements(roiGroup)
        V.newRoiBtn.disabled = false
        V.saveRoiBtn.disabled = false
        return 
    }

    enableElements(roiGroup)


    while (V.RoiSlc.length) V.RoiSlc.remove(0)

    if (roiI > analogs?.length) roiI = analogs?.length;

    analogs.forEach((d, i) => {
        let option = document.createElement("option")
        option.text = d.name
        option.value = i
        V.RoiSlc.add(option)
    })

    if (roiName !== undefined) {
        analogs.forEach((d, i) => d.name == roiName ? roiI = i : null)
    }


    V.RoiSlc.selectedIndex = roiI;
    if (roiI == 0) V.movePreviousBtn.disabled = true;
    if (roiI == (analogs.length - 1)) V.moveNextBtn.disabled = true;
    V.x.value = rect.x = analogs[roiI].x;
    V.y.value = rect.y = analogs[roiI].y;
    V.dx.value = rect.dx = analogs[roiI].dx;
    V.dy.value = rect.dy = analogs[roiI].dy;


    updateCanvasRoisView();
}

function updateCanvasRoisView() {
    if (!V.analogEnableChk.checked) return
    if (!analogs) return
    canvas.clearRectangle()
    analogs.forEach((d, i) => canvas.addRectangle({
        x: parseInt(d.x),
        y: parseInt(d.y),
        dx: parseInt(d.dx),
        dy: parseInt(d.dy),
        template: i == V.RoiSlc.selectedIndex ? 'analog' : 'rectangle'
    }))

}

function valuemanualchanged() {
    analogs[roiI].dx = rect.dx = V.dx.value;
    analogs[roiI].dy = rect.dy = V.dy.value;

    if (V.lockARChk.checked) {
        analogs[roiI].dx = V.dx.value = rect.dx = Math.round(rect.dy * analogs[roiI]["ar"]);
    }
    analogs[roiI].x = rect.x = V.x.value;
    analogs[roiI].y = rect.y = V.y.value;

    updateCanvasRoisView();
}

function valuemanualchangeddx() {
    analogs[roiI].dx = rect.dx = V.dx.value;
    analogs[roiI].dy = rect.dy = V.dy.value;
    if (V.lockARChk.checked) {
        analogs[roiI].dy = V.dy.value = rect.dy = Math.round(rect.dx / analogs[roiI]["ar"]);
    }

    analogs[roiI].x = rect.x = V.x.value;
    analogs[roiI].y = rect.y = V.y.value;
    updateCanvasRoisView();
}
function grid() { canvas.grid(V.gridChk.checked) }
function pointer() { canvas.pointer(V.pointerChk.checked) }

function init(_app) {
    app = _app
    
    V.analogEnableChk.checked = app.C.Analog.enabled
    V.lockARChk.checked = true

    canvas.addEventListener('newRectangle', e => {
        rect = canvas.rect
        analogs[roiI].x = V.x.value = rect.x;
        analogs[roiI].y = V.y.value = rect.y;
        analogs[roiI].dx = V.dx.value = rect.dx;
        analogs[roiI].dy = V.dy.value = rect.dy;
        canvas.createRectangle('analog', V.lockARChk.checked ? 1 : undefined)
        updateCanvasRoisView()
    })

    app.addEventListener('ReferenceUpdated', e => {
        canvas.fromBlob(app.blobReference)
    })

    bindViewControls()
    
    canvas.createRectangle('analog', V.lockARChk.checked ? 1 : undefined)
    return true

}

function focus(){
    UpdateNUMBERS();
}

async function load(){
    if(app.blobReference != undefined){
        canvas.fromBlob(app.blobReference)
    }else{
        await app.loadReferenceBlob()
    }
    return true
}

export default {
    init,
    load,
    focus
}