import {focusM} from '../index.js'
let app

const V = {
    text: document.getElementById('PCFG_text'),
    reboot: document.getElementById('PCFG_reboot'),
    save:  document.getElementById('PCFG_save')
}

function bindViewControls() {
    V.save.addEventListener('click', (e) => save());
    V.reboot.addEventListener('click', (e) => focusM('Reboot'));
}


async function save()
{
	if (confirm("Are you sure you want to update \"config.ini\"?")) {
		const deleted = await app.deleteFile("/config/config.ini");
        if(!deleted.ok) console.log('Error deleting config.ini file.')
		const saved = await app.uploadFile("/config/config.ini", V.text.value);
        saved.ok? alert("Config.ini is updated!") : console.log('Error uploading new config.ini file.');
	}
}

function load() {
	V.text.value = app.CFG_STR;
    V.text.rows = app.CFG_LINES.length + 3
    V.text.cols = app.CFG_LINES.reduce((p, line) => line.length > p? line.length : p, 0) + 3
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
