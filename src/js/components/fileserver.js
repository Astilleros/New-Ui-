let app
const MAX_FILE_SIZE = 2000 * 1024;
const getprefix = '/fileserver'
const uploadprefix = '/upload'
const root_path = '/'
let path = '/'
let items = []

const V = {
    newfileBtn: document.getElementById('newfile'),
    filepath: document.getElementById('filepath'),
    uploadBtn: document.getElementById('upload'),
    filesTable: document.getElementById('filesTable'),
    navBar: document.getElementById('FS_navBar')
}
const menuGroup = [V.newfileBtn, V.filepath, V.uploadBtn]
function bindViewControls() {
    V.uploadBtn.addEventListener('click', (e) => upload());
    V.newfileBtn.addEventListener('change', (e) => V.filepath.value = path + V.newfileBtn.files[0].name);
}


////////////////////////////////////////////////

function clearNav() {
    while( V.navBar.firstChild ){
        V.navBar.removeChild( V.navBar.firstChild );
    }
}
function loadNav(path) {
    let folders = path.split('/')
    for (let i = 0; i < folders.length -1; i++) {
        const folderName = i!=0? '/'+folders[i] : '/';
        const folderPath = folders.slice(0, i+1).join('/')+'/'
        let li = document.createElement("li");
        li.addEventListener('click', (e) => {
            goPath(folderPath)
        })
        li.appendChild(document.createTextNode(folderName));
        V.navBar.appendChild(li);
    }
}


////////////////////////////////////////////////

function init(_app){
    app = _app
    bindViewControls()
    return true
}

async function load() {
    goPath(root_path)
    return true
}

async function goPath(new_path){
    clearTable()
    clearNav()
    path = new_path
    const  str_json = await app.getFile(path)
    if(!str_json.ok) return console.log('Cant get fileserver path data.');
    items = JSON.parse(str_json.text).sort((a,b) => a.name.localeCompare(b.name))
    for (let i = 0; i < items.length; i++) {
        insertRow(items[i])
    }
    loadNav(path)
}

function clearTable(){
    let items = V.filesTable.rows.length
    for (let i = 0; i < items; i++) {
        V.filesTable.deleteRow(0);
    }
}

function insertRow(item, index = undefined){
    if(!index) index = V.filesTable.rows.length
    console.log('Insert row index: ', index);
    let tr = V.filesTable.insertRow(index);
    let nameTd = tr.insertCell();
    nameTd.innerHTML = item.name;
    nameTd.addEventListener('click', (e) => {
        if(item.type == 'directory')
            goPath(`${path}${item.name}/`)
        if(item.type == 'file')
            window.open(`${app.V.basepath}${getprefix}${path}${item.name}`, '_blank').focus();
    })
    let typeTd = tr.insertCell();
    typeTd.innerHTML = item['type'];
    let sizeTd = tr.insertCell();
    sizeTd.innerHTML = item['syze'];
    let readonlyTd = tr.insertCell();
    readonlyTd.innerHTML = item['readonly'];
    let deleteTd = tr.insertCell();
    deleteTd.innerHTML = 'Delete'
    deleteTd.addEventListener('click', async (e) => {
        const deleted = await app.deleteFile(`${path}${item.name}`)
        if(!deleted.ok) {
            console.log('Cant delete file.');
            return
        }
        goPath(path)
    })
}

async function upload() {
    // VALIDATE
    if (V.newfileBtn.files.length == 0) {
        alert("No file selected!");
    } else if (V.filepath.value.length == 0) {
        alert("File path on server is not set!");
    } else if (V.filepath.value.indexOf(' ') >= 0) {
        alert("File path on server cannot have spaces!");
    } else if (V.filepath.value[V.filepath.value.length - 1] == '/') {
        alert("File name not specified after path!");
    } else if (V.newfileBtn.files[0].size > MAX_FILE_SIZE) {
        alert("File size must be less than 2000KB!");
    } else {
        disableElements(menuGroup)

        const posted = await app.post( uploadprefix + V.filepath.value, V.newfileBtn.files[0])
        if(!posted) {
            enableElements(menuGroup)
            return false
        }

        insertRow({
            //name: V.newfileBtn.files[0].name,
            name: V.filepath.value.split('/').pop(),
            type: 'file',
            syze: V.newfileBtn.files[0].size,
            readonly: false,
        })

        enableElements(menuGroup)
        return true
    }
}

export default {
    init,
    load,
    focus: undefined
}
