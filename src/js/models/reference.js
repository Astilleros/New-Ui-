export class Reference { 
    
    name = 'default'
    x = 0
    y = 0
    dx = 0
    dy = 0

   constructor (r = {}) {
      if(r.name) this.name = r.name
      if(r.x) this.x = r.x
      if(r.y) this.y = r.y
      if(r.dx) this.dx = r.dx
      if(r.dy) this.dy = r.dy
   } 
   
   toLine() { return `${this.name} ${this.x} ${this.y}`}// ${this.dx} ${this.dy}`}

};