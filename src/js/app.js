import * as RE from './helpers/regexp.js'
import {
     Category,
     Number,
     Reference,
     Configuration, 
     Digit, 
     Analog
} from './models/index.js'

export class APP extends EventTarget{

     MAX_FILE_SIZE = 8000*1024;
     MAX_FILE_SIZE_STR = "8MB";
     P;                  // Parameters.
     C = {};             // Categories.
     CFG_STR = "";       // All cfg in string.
     CFG_LINES = [];     // All cfg line splited.
     N = [];             // Numbers.
     R = [];             // References.
     V = {
          basepath: '',
          Hostname: '',
          starttime: '',
          IP: '',
          SSID: '',
          GitBranch: '',
          GitBaseBranch: '',
          GitVersion: '',
          BuildTime: '',
          HTMLVersion: '',
     }
     blobReference = undefined

     /** APP */
     async init() {
          try{
               this.V.basepath = this.getbasepath();
               const config = await this.getFile('/config/config.ini')
               if(!config.ok) throw new Error('Cant get config.ini file from device.')
               this.CFG_STR = config.text
               this.parseConfig();
               return true
          }catch(e){
               console.log('App cant init.');
               console.log(e);
               return false
          }
     }

     async loadReferenceBlob(){
          try {
               const url = this.V.basepath + '/fileserver/config/reference.jpg'; 
               const res = await fetch(url)
               const blob = await res.blob()
               this.setReference(blob)
          }catch (e){console.log(`ERROR LOAD IMG REFERENCE "${e}"`); throw e;}
     }

     async loadRunningValues() {
          return await Promise.all([
               ['Hostname',        '/version?type=Hostname'],
               ['starttime',       '/starttime'],
               ['IP',              '/version?type=IP'],
               ['SSID',            '/version?type=SSID'],
               ['GitBranch',       '/version?type=GitBranch'],
               ['GitBaseBranch',   '/version?type=GitBaseBranch'],
               //['GitVersion',    '/version?type=GitVersion'],
               ['BuildTime',       '/version?type=BuildTime'],
               ['HTMLVersion',     '/version?type=HTMLVersion'],
          ].map(async value => {
               const res = await this.get(value[1])
               this.V[value[0]] = res.ok? res.text : 'Response error.'
          }))
     }

     async reboot() {
          return await this.init()
     }
     /** CONFIG */
     parseConfig() {

          this.P = new Configuration();
          this.C = {};
          Object.keys(this.P).forEach(name => this.C[name] = new Category());
          this.CFG_LINES = this.CFG_STR.split("\n");
          let current_category;
          
          for (let i=0; i < this.CFG_LINES.length; i++){
               const l = this.CFG_LINES[i];
               if(!l.length) {
                    continue
               }
               // CATEGORIES
               if(RE.isCategory.test(l)){
                    const cat_name = l.replace(RE.cleanName, '');
                    if(!this.C[cat_name]) {
                         console.log(`ERROR: ${cat_name} not found.`);
                         continue;
                    }
                    current_category = cat_name
                    this.C[cat_name].setLine(l).setFound().checkEnable()
                    continue;
               }
               if(!current_category) {
                    console.log('ParseConfig: File malformed, lines without category.');
                    continue;
               }

               // REFERENCES
               if( current_category === 'Alignment' && RE.isReference.test(l)){
                    const d = l.replace(/ {2}/g, ' ').trim().split(' ')
                    this.R.push(new Reference({
                         name: d[0],
                         x: d[1],
                         y: d[2]
                    }))
                    continue;
               }
                    
               // DIGITS
               if(current_category === 'Digits' && RE.isDigit.test(l)){
                    const d = l.replace(/ {2}/g, ' ').replace(/\./, ' ').split(' ')
                    let num_i = this.N.map(n=>n.name).indexOf(d[0])
                    if(num_i === -1) {
                         this.N.push(new Number({name: d[0]}))
                         num_i=this.N.length-1
                    }
                    this.N[num_i].digit.push(new Digit({
                         name: d[1],
                         pos_ref: l,
                         x: d[2],
                         y: d[3],
                         dx: d[4],
                         dy: d[5]
                    }))
                    continue;
               }

               // ANALOGS
               if(current_category === 'Analog' && RE.isDigit.test(l)){
                    const d = l.replace(/ {2}/g, ' ').replace(/\./, ' ').split(' ')
                    let num_i = this.N.map(n=>n.name).indexOf(d[0])
                    if(num_i === -1) {
                         this.N.push(new Number({name: d[0]}))
                         num_i=this.N.length-1
                    }
                    this.N[num_i].analog.push(new Analog({
                         name: d[1],
                         pos_ref: l,
                         x: d[2],
                         y: d[3],
                         dx: d[4],
                         dy: d[5]
                    }))
                    continue;
               }

               // POSTPROCESSING
               if( current_category === 'PostProcessing' && RE.isNumberValue.test(l) ){
                    const d = l.replace(/[ ;]*/g, '').replace(/\./, '=').split('=')
                    let num_i = this.N.map(n=>n.name).indexOf(d[0])
                    if(num_i === -1) {
                         this.N.push(new Number({name: d[0]}))
                         num_i=this.N.length-1
                    }
                    this.N[num_i].PostProcessing[d[1]].setLine(l).checkEnable().setFound().setValue(1, d[2])
                    continue;
               }

               // PARAMS
               const value_name = l.split('=')[0].replace(RE.cleanName, '');
               if(!this.P[current_category][value_name]) {
                    console.log(`ERROR: ${current_category} - ${l}`);
                    continue;
               }
               
               if(!this.P[current_category][value_name].fromLine(l)) {
                    console.log(`ERROR: ${current_category} - ${l}`);
                    continue;
               }
               
          }

     }
     
     async updateDeviceConfig(){
          // Cleanup empty NUMBERS
          this.N = this.N.filter(n => n.analog.length + n.digit.length)

          this.CFG_LINES = []
          for (let cat in this.P) {
               if(this.CFG_LINES.length > 0) this.CFG_LINES.push("");
               this.CFG_LINES.push('\n'+Category.categoryToLine(cat, this.C[cat]))
               
               for (let name in this.P[cat]) {
                    this.CFG_LINES.push(this.P[cat][name].toLine(name))
               }

               if (cat == "Digits"){
                    this.N.map(n => this.CFG_LINES = this.CFG_LINES.concat(n.digitsToLines()))
               }
               if (cat == "Analog"){
                    this.N.map(n => this.CFG_LINES = this.CFG_LINES.concat(n.analogsToLines()))
               }
               if (cat == "Alignment"){
                    this.R.map( r => this.CFG_LINES.push(r.toLine()))
               }
               if(cat == "PostProcessing"){
                    this.N.map(n => this.CFG_LINES = this.CFG_LINES.concat(n.postProcessingToLines()))
               }
               

               
          }

          this.CFG_LINES = this.CFG_LINES.filter(l => l != '')
          this.CFG_STR = this.CFG_LINES.join('\n') + '\n'

          const deleted = await this.deleteFile("/config/config.ini")
          if(!deleted.ok) {
               console.log(`Error deleting old device config.`);
          } 
          const uploaded = await this.uploadFile("/config/config.ini", this.CFG_STR);
          if(!uploaded.ok) {
               console.log(`Error uploading new device config.`);
          } 
          return uploaded.ok
     }

     /** SERVER FILE MANAGER */

     async deleteFile(filePath){
          console.log('Device deleteFile path: ', filePath);
          const url = this.V.basepath + "/delete" + filePath;
          const res = await fetch(url, {method: 'POST'})
          return { ok: res.ok }
     }

     async uploadFile(filePath, body){
          console.log('Device uploadFile path: ', filePath);
          const url = this.V.basepath + "/upload" + filePath;
          const res = await fetch(url, {method: 'POST', body})
          return { ok: res.ok }
     }

     async copyFile(fileFromPath, fileToPath){
          console.log('Device copyFile from -> to: ', fileFromPath, ' -> ', fileToPath);
          const url = this.V.basepath + "/editflow.html?task=copy&in=" + fileFromPath + "&out=" + fileToPath;
          const res = await fetch(url)
          return { ok: res.ok }
     }

     async getFile(filePath) {
          console.log('Device getFile path: ', filePath);
          const url = this.V.basepath + "/fileserver" + filePath;
          const res = await fetch(url)
          return {
               ok: res.ok,
               text: res.ok? await res.text() : undefined
          }
     }

     async get(path){
          const url = this.V.basepath + path;
          const res = await fetch(url)
          return {
               ok: res.ok,
               text: res.ok? await res.text() : undefined
          }
     }

     /** NUMBERS */
     CreateNUMBER(newName){
          if(this.N.some((n) => n.name == newName)) return "Name does already exist, please choose another one!";
          this.N.push(new Number({name: newName}));
     }

     RenameNUMBER(name, newName){
          if(this.N.some((n) => n.name == newName)) return "Name does already exist, please choose another one!";
          for (let i = 0; i < this.N.length; ++i) {
               if (this.N[i]["name"] == name) {
                    this.N[i]["name"] = newName
                    break
               }
          }
     }

     DeleteNUMBER(name){
          if (this.N.length == 1) return "The last number cannot be deleted."
          for (let i = 0; i < this.N.length; ++i) {
               if (this.N[i]["name"] == name){
                    this.N.splice(i, 1);
                    break
               }
          }
     }

     /** ROIS */
     RenameROI(numberName, roiType, roiName, newName){

          const numberNameIndex =this.N.reduce((p, n, i) => n.name == numberName? i : p, -1)
          if(numberNameIndex == -1) return "Number name does not exist!";
          const newNameExist = this.N[numberNameIndex][roiType].some((roi) => roi.name == newName )
          if(newNameExist) return "ROI name is already in use - please use another name";
          this.N.forEach((n,i) => n.name == numberName? n[roiType].forEach((roi, j) => roi.name == roiName? this.N[i][roiType][j].name = newName : null) : null )
     }

     CreateROI(numberName, roiType, name, x, y, dx, dy){
          const numberNameIndex =this.N.reduce((p, n, i) => n.name == numberName? i : p, -1)
          if(numberNameIndex == -1) return "Number name does not exist!";
          const newNameExist = this.N[numberNameIndex][roiType].some((roi) => roi.name == name )
          if(newNameExist) return "ROI name is already in use - please use another name";
          let d = {name, x, y, dx, dy}
          let newRoi = roiType == 'digit'? new Digit(d) : roiType == 'analog'? new Analog(d) : null
          this.N[numberNameIndex][roiType].push(newRoi)
     }

     deleteROI(numberName, roiType, roiName){
          const numberNameIndex =this.N.reduce((p, n, i) => n.name == numberName? i : p, -1)
          if(numberNameIndex == -1) return "Number name does not exist!";
          const roiNameIndex = this.N[numberNameIndex][roiType].reduce((p, roi, i) => roi.name == roiName? i : p, -1 )
          if(roiNameIndex == -1) return "ROI name is does not exist";
          this.N[numberNameIndex][roiType].splice(roiNameIndex, 1)
     }

     getbasepath(){
          let host = window.location.hostname;
          
          host = "http://" + host;
          if (window.location.port != "") {
               host = host + ":" + window.location.port;
          }
              
      
          return host;
     }

     // EVENTS VIEWS BROADCAST
     setReference(blobReference){
          this.blobReference = blobReference
          this.publicEvent('ReferenceUpdated')
     }

     publicEvent(name){
        this.dispatchEvent(new Event(name));
     }
}

