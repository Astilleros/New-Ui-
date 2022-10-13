import {Param} from './index.js'

export class Number { 
    name = 'default'
    digit = []
    analog = []
    PostProcessing = {
         DecimalShift: new Param(),
         ExtendedResolution: new Param(),
         IgnoreLeadingNaN: new Param(),
         MaxRateType: new Param(),
         MaxRateValue: new Param()
    }

   constructor (n) {
         if(n?.name) this.name = n.name
         if(n?.digit?.length) this.digit = n.digit
         if(n?.analog?.length) this.analog = n.analog
   } 

   digitsToLines() { return this.digit.map(d => this.name+'.'+d.name+' '+d.x+' '+d.y+' '+d.dx+' '+d.dy); }

   analogsToLines() { return this.analog.map(d => this.name+'.'+d.name+' '+d.x+' '+d.y+' '+d.dx+' '+d.dy); }

   postProcessingToLines() {
      let keys = Object.keys(this.PostProcessing)
      let ret = keys.map(pp => {
            return `${this.PostProcessing[pp].enabled? '': ';'}${this.name}.${pp} = ${this.PostProcessing[pp].value1}`
      });
      console.log(ret);
      return ret
   }
};