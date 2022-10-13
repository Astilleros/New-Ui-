let app

const V = {
    status: document.getElementById("status"),
    doUpdate: document.getElementById("doUpdate"),
    newfile: document.getElementById("newfile"),
    progress: document.getElementById('progress'),
}

function bindViewControls() {
    V.newfile.addEventListener('click',(e) => setpath())
    V.doUpdate.addEventListener('click',(e) => prepareOnServer())
}

function setpath() {
    V.doUpdate.disabled = false;
    V.status.innerText = "Status: File selected";
}

async function prepareOnServer() {
    
    const fileName = V.newfile.value.split(/[\\\/]/).pop();

    if (V.newfile.files.length == 0) {
        alert("No file selected!");
        return;
    } else if (fileName.length == 0) {
        alert("File path on server is not set!");
        return;
    } else if (fileName.length > 100) {
        alert("Filename is to long! Max 100 characters.");
        return;
    } else if (fileName.indexOf(' ') >= 0) {
        alert("File path on server cannot have spaces!");
        return;
    } else if (V.newfile.files[0].size > app.MAX_FILE_SIZE) {
        alert("File size must be less than " + app.MAX_FILE_SIZE_STR + "!");
        return;
    }

    V.status.innerText = "Status: Preparations on ESP32";
    V.doUpdate.disabled = true;
    timerOn("Server preparations...");
    const url = "/ota?delete=" + fileName;
    const res = await app.get(url)
    timerOff();
    if(!res.ok) {
        V.doUpdate.disabled = false;
        return alert("Prepare on server went wrong!")
    }
    upload();
}

async function upload() {
    V.newfile.disabled = true;
    timerOn("Upload");
    V.status.innerText = "Status: Uploading (takes up to 60s)...";
    const url = "/firmware/" + filePath;
    const uploaded = await app.uloadFile(url, V.newfile.files[0])
    timerOff();
    if(!uploaded.ok) {
        V.doUpdate.disabled = false;
        return alert("Upload went wrong!")
    }
    extract();


}

async function extract() {
    V.status.innerText = "Status: Processing on ESP32 (takes up to 3 minutes)...";
    timerOn("Extraction");
    const url = '/ota?task=update&file=' + V.newfile.value.split(/[\\\/]/).pop();
    const res = await app.get(url)
    timerOff();
    if(!res.ok) return alert("OTA task update went wrong!")
    V.status.innerText = "Status: Update completed!";
    V.doUpdate.disabled = true;
    V.newfile.disabled = false;
    if (res.text.startsWith("reboot")) focusM('Reboot');
    else alert("Processing done!\n\n" + res.text);
}

/** TIMER */
let timer
let count
function timerOn(step) {     
    V.progress.innerHTML = '(0s)';
    count = 0;    
    timer = setInterval(() => {
        count++;
        V.progress.innerHTML = `(${count}s)`;
    }, 1000);
}
function timerOff() {            
    clearInterval(timer);
    V.progress.innerHTML = "";
}
/**  */

function init(_app){
    app = _app
    bindViewControls()
    V.doUpdate.disabled = true;
    return true
}

export default {
    init,
    load: undefined,
    focus: undefined
}