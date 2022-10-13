export class Digit { 
    name = 'default'
    x = 0
    y = 0
    dx= 0
    dy = 0
    ar = 0
    pos_ref = ''

   constructor (d = {}) {
         if(d.name) this.name = d.name
         if(d.pos_ref) this.pos_ref = d.pos_ref
         if(d.x) this.x = d.x         
         if(d.y) this.y = d.y
         if(d.dx) this.dx = d.dx
         if(d.dy) this.dy = d.dy
         if(this.dx && this.dy) this.ar = parseFloat(this.dx) / parseFloat(this.dy)

   } 

};
