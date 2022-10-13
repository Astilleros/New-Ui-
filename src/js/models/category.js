import * as RE from '../helpers/regexp.js'

export class Category { 

      name = 'default';
      found = false;
      enabled = false;
      line = '';

      constructor (n = {}) {
            if(n.name) this.name = n.name
            if(n.line) this.line = n.line
            if(n.found) this.found = n.found
            if(n.enabled) this.enabled = n.enabled
      };

      static categoryToLine(name, data){ return `${data.enabled? '': ';'}[${name}]` };

      setFound(boole = true){ 
            this.found = boole;
            return this;
      };

      setLine(l) { 
            this.line = l;
            return this;
      };

      checkEnable(){ 
            this.enabled = !RE.isDisabled.test(this.line);
            return this;
      };


};