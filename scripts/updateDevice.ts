import { readTextFile } from './helpers';
import axios from 'axios';

if(!process.argv[2] || !process.argv[3])
    throw 'Error: add params to bundlePanels script.';
    
const in_path = process.argv[2];
const device_basepath = process.argv[3];

let files = [
    'index.html',
    'app.js'
];

(async () => {
    for (let i = 0; i < files.length; i++) {
        const f = files[i];
    
        const file_raw = readTextFile(in_path+f);
    
        // DELETE FILE SERVER
        try {
            const url = `${device_basepath}/delete/html/${f}`
            console.log(url);
            await axios.post(url);
        } catch (e) {
            console.log('Cant delete server file: '+f);
        }
    
        // UPDATE FILE SERVER
        try {
            const url = `${device_basepath}/upload/html/${f}`
            console.log(url);
            await axios.post(url, file_raw);
        } catch (e) {
            console.log('Cant upload server file: '+f);
        }
    }
})()