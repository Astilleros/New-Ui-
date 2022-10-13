import { readTextFile, writeTextFile } from './helpers';

if(!process.argv[2] || !process.argv[3])
    throw 'Error: add params to bundlePanels script.'

const in_path = process.argv[2]
const out_path = process.argv[3]

/** PANELS */
const panels = [
    {
        name: 'panelHome',
        html: '../src/views/panelHome.html'
    },
    {
        name: 'panelReference',
        html: '../src/views/panelReference.html'
    },
    {
        name: 'panelAlignment',
        html: '../src/views/panelAlignment.html'
    },
    {
        name: 'panelDigits',
        html: '../src/views/panelDigits.html'
    },
    {
        name: 'panelAnalogs',
        html: '../src/views/panelAnalogs.html'
    },
    {
        name: 'panelMQTT',
        html: '../src/views/panelMQTT.html'
    },
    {
        name: 'panelHelp',
        html: '../src/views/panelHelp.html'
    },
    {
        name: 'panelInfluxDB',
        html: '../src/views/panelInfluxDB.html'
    },
    {
        name: 'panelFileServer',
        html: '../src/views/panelFileServer.html'
    },
    {
        name: 'panelSchedule',
        html: '../src/views/panelSchedule.html'
    },
    {
        name: 'panelCNN',
        html: '../src/views/panelCNN.html'
    },
    {
        name: 'panelPostprocessing',
        html: '../src/views/panelPostprocessing.html'
    },
    {
        name: 'panelReboot',
        html: '../src/views/panelReboot.html'
    },
    {
        name: 'panelConfig',
        html: '../src/views/panelConfig.html'
    },
    {
        name: 'panelOTA',
        html: '../src/views/panelOTA.html'
    },
]


let index = readTextFile(in_path)
if(!index) throw 'index.html not found.'

for (let i = 0; i < panels.length; i++) {
    const p = panels[i];
    const html = readTextFile(p.html)
    const re = new RegExp(`<div[^>]*id="${p.name}"[^>]*>`, 'g')
    const match : any = index.match(re)
    if(!match) throw 'Match not found: '+p.name 
    index = index?.replace(re, match[0]+html)
}

/** CSS & SCRIPT CSS */
// <link rel="stylesheet" href="./style.css">
const css = readTextFile('../src/style.css')
if(css){
    index = index?.replace('<head>', '<head><style>'+css+'</style>')
}

writeTextFile(out_path, index)
