export class Analog { 
    name = 'default'
    x = 0
    y = 0
    dx= 0
    dy = 0
    ar = 0
    pos_ref = ''

   constructor (a = {}) {
         if(a.name) this.name = a.name
         if(a.pos_ref) this.pos_ref = a.pos_ref
         if(a.x) this.x = a.x         
         if(a.y) this.y = a.y
         if(a.dx) this.dx = a.dx
         if(a.dy) this.dy = a.dy
         if(this.dx && this.dy) this.ar = parseFloat(this.dx) / parseFloat(this.dy)

   } 
   
};
