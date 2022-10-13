import * as RE from '../helpers/regexp.js'

export class Param { 
     
     found = false
     enabled = false
     line = -1
     anzParam = 1 
     Numbers = false
     checkRegExList = null
     help = ''

    constructor (p = {}) {
          if(p.found) this.found = p.found;
          if(p.enabled) this.enabled = p.enabled;
          if(p.line) this.line = p.line;
          if(p.anzParam) this.anzParam = p.anzParam;
          for (let i = 1; i <= this.anzParam; i++) {
               this['value'+i] = ''          
          }
          if(p.Numbers) this.Numbers = p.Numbers;
          if(p.checkRegExList) this.checkRegExList = p.checkRegExList;
          if(p.help) this.help = p.help;
    } 

     fromLine(l){
          if(!RE.isValue.test(l)) return false
          const split = l.split('=');
          const value_split = split[1].trim().split(' ')
          this.setLine(l).setFound().checkEnable()
          for(let i = 1; i <= value_split.length; i++){
               this.setValue(i, value_split[i-1])
          }
          return true
     }

     toLine(name) { 
          let ret = `${!this.enabled? ';': ''}${name} =`; 
          for (let i = 1; i <= this.anzParam; i++) {
               ret += ' '+this['value'+i]
          }
          console.log('toLine ',ret);
          return ret
     }

     setFound(boole = true){ 
          this.found = boole;
          return this;
     };

     checkEnable(boole){  
          if(boole !== undefined)
               this.enabled = boole
          else
               this.enabled = !RE.isDisabled.test(this.line);
               
          return this;
     }

     setLine(l) { 
          this.line = l;
          return this;
     }

     setValue(number, value, reset = true) {
          this.setFound(true)
          //this.enabled = true
          let key = 'value'+number;
          if(!reset && this[key] && this[key] != undefined) return
          this[key] = value;
          return this;
     }
};