import {Canvas} from '../helpers/canvas.js'
let app
// CORE
const canvas = new Canvas(document.getElementById('PDcanvas'))

// VIEW IDS
const V = {
    digitsEnableChk: document.getElementById("Category_Digits_enabled"),
    lockARChk: document.getElementById("PDlockAR"),
    newNumberBtn: document.getElementById("PDnewNumber"),
    numberSlc: document.getElementById("PDNumbers_value1"),
    renameNumberBtn: document.getElementById("PDrenameNumber"),
    removeNumberBtn: document.getElementById("PDremoveNumber"),

    newRoiBtn: document.getElementById("PDnewROI"),
    RoiSlc: document.getElementById("PDindex"),
    renameRoiBtn: document.getElementById("PDrenameROI"),
    deleteRoiBtn: document.getElementById("PDdeleteROI"),
    moveNextBtn: document.getElementById("PDmoveNext"),
    movePreviousBtn: document.getElementById("PDmovePrevious"),

    saveRoiBtn: document.getElementById("PDsaveroi"),

    x: document.getElementById("PDrefx"),
    y: document.getElementById("PDrefy"),
    dx: document.getElementById("PDrefdx"),
    dy: document.getElementById("PDrefdy"),
    gridChk: document.getElementById("PDgrid"),
    pointerChk: document.getElementById("PDpointer")
}
// VIEW GROUPS
const numberGroup = [V.newNumberBtn, V.numberSlc, V.renameNumberBtn, V.removeNumberBtn]
const roiGroup = [V.lockARChk, V.newRoiBtn, V.RoiSlc, V.renameRoiBtn, V.deleteRoiBtn, V.moveNextBtn, V.movePreviousBtn, V.saveRoiBtn, V.x, V.y, V.dx, V.dy]
const editGroup = [...roiGroup, ...numberGroup]
// VIEW EVENTS
function bindViewControls() {
    V.digitsEnableChk.addEventListener('click', changeDigitsEnableChk);
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
let digits = []

function changeDigitsEnableChk() {
    if (V.digitsEnableChk.checked) {
        enableElements(editGroup)
        canvas.createRectangle('digit', V.lockARChk.checked ? 0.5 : undefined)
        UpdateNUMBERS();
    } else {
        disableElements(editGroup)
        canvas.exitCreateRectangle()
    }
}

function changeLockARChk() {
    canvas.createRectangle('digit', V.lockARChk.checked ? 0.5 : undefined)
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
    const res = app.deleteROI(numberName, 'digit', roiName)
    if (res?.length) return alert(res)
    UpdateROIs();
}

function newROI() {
    const numberName = V.numberSlc.options[V.numberSlc.selectedIndex].text;
    const roiName = prompt("Please enter name of new ROI", "name");
    const res = app.CreateROI(
        numberName,
        "digit",
        roiName,
        1,
        1,
        digits.length ? digits[roiI].dx : 30,
        digits.length ? digits[roiI].dy : 51
    )
    if (res?.length) return alert(res);
    UpdateROIs(roiName);
}

function movePrevious() {
    [digits[roiI - 1], digits[roiI]] = [digits[roiI], digits[roiI - 1]];
    roiI--;
    UpdateROIs();
}

function moveNext() {
    [digits[roiI + 1], digits[roiI]] = [digits[roiI], digits[roiI + 1]];
    roiI++;
    UpdateROIs();
}

function ChangeSelection() {
    roiI = parseInt(V.RoiSlc.value);
    UpdateROIs();
}

async function SaveToConfig() {
    app.C.Digits.enabled = V.digitsEnableChk.checked;

    const updated = await app.updateDeviceConfig()   
    if(!updated) return false
    alert("Config.ini is updated!");
}

function renameROI() {
    const numberName = V.numberSlc.options[V.numberSlc.selectedIndex].text;
    const roiName = V.RoiSlc.options[V.RoiSlc.selectedIndex].text;
    const newName = prompt("Please enter new name", roiName);
    const res = app.RenameROI(numberName, "digit", roiName, newName);
    if (res?.length) return alert(res);

    UpdateROIs(newName);
}

function UpdateROIs(roiName) {

    // SHORTCUT SELECTED NUMBER DIGITS
    digits = app.N[V.numberSlc.selectedIndex].digit

    if (V.digitsEnableChk.checked == false) {
        disableElements(editGroup)
        return
    }

    if (!digits?.length) {
        disableElements(roiGroup)
        V.newRoiBtn.disabled = false
        V.saveRoiBtn.disabled = false
        return
    }

    enableElements(roiGroup)


    while (V.RoiSlc.length) V.RoiSlc.remove(0)

    if (roiI > digits?.length) roiI = digits?.length;

    digits.forEach((d, i) => {
        let option = document.createElement("option")
        option.text = d.name
        option.value = i
        V.RoiSlc.add(option)
    })

    if (roiName !== undefined) {
        digits.forEach((d, i) => d.name == roiName ? roiI = i : null)
    }


    V.RoiSlc.selectedIndex = roiI;
    if (roiI == 0) V.movePreviousBtn.disabled = true;
    if (roiI == (digits.length - 1)) V.moveNextBtn.disabled = true;
    V.x.value = rect.x = digits[roiI].x;
    V.y.value = rect.y = digits[roiI].y;
    V.dx.value = rect.dx = digits[roiI].dx;
    V.dy.value = rect.dy = digits[roiI].dy;


    updateCanvasRoisView();
}

function updateCanvasRoisView() {
    if (!V.digitsEnableChk.checked) return
    if (!digits) return
    canvas.clearRectangle()
    digits.forEach((d, i) => canvas.addRectangle({
        x: parseInt(d.x),
        y: parseInt(d.y),
        dx: parseInt(d.dx),
        dy: parseInt(d.dy),
        template: i == V.RoiSlc.selectedIndex ? 'digit' : 'rectangle'
    }))

}

function valuemanualchanged() {
    digits[roiI].dx = rect.dx = V.dx.value;
    digits[roiI].dy = rect.dy = V.dy.value;

    if (V.lockARChk.checked) {
        digits[roiI].dx = V.dx.value = rect.dx = Math.round(rect.dy * digits[roiI]["ar"]);
    }
    digits[roiI].x = rect.x = V.x.value;
    digits[roiI].y = rect.y = V.y.value;

    updateCanvasRoisView();
}

function valuemanualchangeddx() {
    digits[roiI].dx = rect.dx = V.dx.value;
    digits[roiI].dy = rect.dy = V.dy.value;
    if (V.lockARChk.checked) {
        digits[roiI].dy = V.dy.value = rect.dy = Math.round(rect.dx / digits[roiI]["ar"]);
    }

    digits[roiI].x = rect.x = V.x.value;
    digits[roiI].y = rect.y = V.y.value;
    updateCanvasRoisView();
}
function grid() { canvas.grid(V.gridChk.checked) }
function pointer() { canvas.pointer(V.pointerChk.checked) }

function init(_app) {
    app = _app

    V.digitsEnableChk.checked = app.C.Digits.enabled
    V.lockARChk.checked = true

    canvas.addEventListener('newRectangle', e => {
        rect = canvas.rect
        digits[roiI].x = V.x.value = rect.x;
        digits[roiI].y = V.y.value = rect.y;
        digits[roiI].dx = V.dx.value = rect.dx;
        digits[roiI].dy = V.dy.value = rect.dy;
        canvas.createRectangle('digit', V.lockARChk.checked ? 0.5 : undefined)
        updateCanvasRoisView()
    })

    app.addEventListener('ReferenceUpdated', e => {
        canvas.fromBlob(app.blobReference)
    })

    bindViewControls()

    
    canvas.createRectangle('digit', V.lockARChk.checked ? 0.5 : undefined)
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