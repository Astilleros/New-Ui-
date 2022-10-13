export class Canvas extends EventTarget{

    imageObj = new Image();
    canvas;
    ctx;
    rotated = false;
    mirrored = false;
    scaleW = 1
    scaleH = 1
    degrees = 0
    isGrid = false
    isPointer = false
    rectangles = []
    creatingRectangle = false
    creatingRectangleFirstClick = false
    drawTemplate = 'rectangle'
    aspectRatio = undefined
    rect = { x:0, y:0, dx:0, dy:0 }

    constructor(ca){
        super()
        this.canvas = ca
        this.ctx = this.canvas.getContext('2d')
        this.imageObj.addEventListener("load", this.imageOnLoad, false);
    }

    
    imageOnLoad= (e) => {
        this.canvas.width = this.imageObj.width;
        this.canvas.height = this.imageObj.height;
        this.redraw()
    }
    reset(){
        this.clearCtx()
        this.canvas.width = 0
        this.canvas.height = 0
        this.imageObj.src=""
        this.flipHor(false)
        this.flipVer(false)
        this.setDegrees(0)
        this.grid(false)
        this.pointer(false)
    }
    clearCtx(){
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    loadUrl(url) {
        this.imageObj.src = url;
    }

    //////////////////////////////////////////////////////////////////////
    flipHor(isFlipHor) {
        if(isFlipHor){
            this.scaleW = -1
        } else {
            this.scaleW = 1
        }
        this.redraw()
    }
    flipVer(FlipVer) {
        if(FlipVer){
            this.scaleH = -1
        } else {
            this.scaleH = 1
        }
        this.redraw()
    }
    scale(){
        const dw = this.canvas.width
        const dh = this.canvas.height
        this.ctx.scale(this.scaleW, this.scaleH);
        this.ctx.translate(this.scaleW == -1? -dw : 0, this.scaleH == -1? -dh : 0);
    }

    //////////////////////////////////////////////////////////////////////
    setDegrees(degrees) {
        if(this.degrees == degrees) return
        this.degrees = degrees
        this.redraw()
    }
    rotate(){
        const dw = this.canvas.width/2
        const dh = this.canvas.height/2
        this.ctx.save();
        this.ctx.translate(dw,dh);
        this.ctx.rotate(this.degrees*Math.PI/180);
        this.ctx.drawImage(this.imageObj, -dw, -dh);
        this.ctx.restore();

    }

    //////////////////////////////////////////////////////////////////////
    grid(active) {
        if(this.isGrid == active) return
        this.isGrid = active
        this.redraw()
    }
    gridDraw(){
        if(!this.isGrid) return
        
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = '#00FF00';

        this.ctx.globalAlpha = 0.7

        for (let i = 0; i < h; i += 50){
            this.ctx.beginPath()
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(w, i);
            this.ctx.stroke();
        }
        this.ctx.beginPath()
        this.ctx.moveTo(0, h);
        this.ctx.lineTo(w, h);
        this.ctx.stroke();
        for (let i = 0; i < w; i += 50) {
            this.ctx.beginPath()
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, h);
            this.ctx.stroke();              
        }
        this.ctx.beginPath()
        this.ctx.moveTo(w, 0);
        this.ctx.lineTo(w, h);
        this.ctx.stroke();    

        this.ctx.closePath();
        this.ctx.globalAlpha = 1
    }

    //////////////////////////////////////////////////////////////////////
    pointer(isPointer){
        if(this.isPointer === isPointer) return
        else this.isPointer = isPointer

        if(isPointer){
            this.canvas.addEventListener('mousemove', this.pointerDraw);
        } else {
            this.canvas.removeEventListener('mousemove', this.pointerDraw, false);
        }
        this.redraw()
    }

    pointerDraw = (e) => {

        this.redraw()
        
        let point = this.getCoords(e)
 
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = "#FF0000";
        this.ctx.beginPath(); 
        this.ctx.moveTo(0,point.y);
        this.ctx.lineTo(this.canvas.width, point.y);
        this.ctx.moveTo(point.x, 0);
        this.ctx.lineTo(point.x, this.canvas.height);
        this.ctx.stroke();   
    }

    //////////////////////////////////////////////////////////////////////

    addRectangle(rect = {
        x: 10,
        y: 10,
        dx: 10,
        dy: 10,
        template: 'rectangle'
    }){
        this.rectangles.push(rect)
        this.redraw()
    }
    clearRectangle(i){
        if(i == undefined)  this.rectangles = []
        else this.rectangles.splice(i, 1)
        this.redraw()
    }
    rectanglesDraw(){
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = "#FF0000";
        for (let ir = 0; ir < this.rectangles.length; ir++) {
            const r = this.rectangles[ir];
            if(r.template == 'rectangle')
                this.ctx.strokeRect(r.x, r.y, r.dx, r.dy); 
            if(r.template == 'digit'){
                this.ctx.strokeRect(r.x, r.y, r.dx, r.dy); 
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(r.x + r.dx * 0.2, r.y + r.dy * 0.2, r.dx * 0.6, r.dy * 0.6);
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(r.x, r.y + r.dy / 2);
                this.ctx.lineTo(r.x + r.dx, r.y + r.dy / 2);
                this.ctx.stroke();
            } 
            if(r.template == 'analog'){
                this.ctx.strokeRect(r.x, r.y, r.dx, r.dy); 
                this.ctx.beginPath();
                this.ctx.arc(r.x+r.dx/2, r.y+r.dy/2, r.dx/2, 0, 2 * Math.PI);
                this.ctx.moveTo(r.x+r.dx/2, r.y);
                this.ctx.lineTo(r.x+r.dx/2, r.y+r.dy);
                this.ctx.moveTo(r.x, r.y+r.dy/2);
                this.ctx.lineTo(r.x+r.dx, r.y+r.dy/2);
                this.ctx.stroke();
            }
        }
    }

    //////////////////////////////////////////////////////////////////////
    createRectangle(drawTemplate = 'rectangle', aspectRatio){
        if(this.creatingRectangle == true) this.exitCreateRectangle()
        if(aspectRatio != undefined) this.aspectRatio = aspectRatio
        this.drawTemplate = drawTemplate
        this.rect = { x:0, y:0, dx:0, dy:0 }
        if(this.creatingRectangle == true)
            this.exitCreateRectangle()

        this.creatingRectangle = true
        this.canvas.addEventListener('mousedown', this.mouseDownRectangle);
        this.canvas.addEventListener('mouseup', this.mouseUpRectangle);
        this.canvas.addEventListener('mousemove', this.printCreatingRectangle);

    }

    exitCreateRectangle(){
        if(this.creatingRectangle == false) return
        this.canvas.removeEventListener('mousedown', this.mouseDownRectangle, false);
        this.canvas.removeEventListener('mouseup', this.mouseUpRectangle, false);
        this.canvas.removeEventListener('mousemove', this.printCreatingRectangle, false);
        this.creatingRectangle = false
        this.creatingRectangleFirstClick = false
        this.drawTemplate = undefined
        this.aspectRatio = undefined
        this.redraw()
    }

    printCreatingRectangle = (e) => {
        if(!this.creatingRectangleFirstClick) return
        this.redraw()
        const p = this.getCoords(e)      



        const r = {
            x: p.x > this.rect.x? this.rect.x : p.x,
            y: p.y > this.rect.y? this.rect.y : p.y,
            
            dx: (p.x > this.rect.x? p.x : this.rect.x)-(p.x > this.rect.x? this.rect.x : p.x),
            dy: (p.y > this.rect.y? p.y : this.rect.y)-(p.y > this.rect.y? this.rect.y : p.y)
        }

        if (this.aspectRatio) {
            if(p.x > this.rect.x)
                r.dx = Math.round(r.dy * this.aspectRatio);
            else {
                r.dx = Math.round(r.dy * this.aspectRatio);
                r.x = (this.rect.x + this.rect.dx) - (Math.round(r.dy * this.aspectRatio))
            }
        }

        if(this.drawTemplate == 'rectangle'){
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = "#FF0000";
            this.ctx.strokeRect(r.x, r.y, r.dx, r.dy);  
        }
        if(this.drawTemplate == 'digit'){
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = "#FF0000";
            this.ctx.strokeRect(r.x, r.y, r.dx, r.dy); 
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(r.x + r.dx * 0.2, r.y + r.dy * 0.2, r.dx * 0.6, r.dy * 0.6);
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(r.x, r.y + r.dy / 2);
            this.ctx.lineTo(r.x + r.dx, r.y + r.dy / 2);
            this.ctx.stroke();
        }
        if(this.drawTemplate == 'analog'){
            this.ctx.strokeRect(r.x, r.y, r.dx, r.dy); 
            this.ctx.beginPath();
            this.ctx.arc(r.x+r.dx/2, r.y+r.dy/2, r.dx/2, 0, 2 * Math.PI);
            this.ctx.moveTo(r.x+r.dx/2, r.y);
            this.ctx.lineTo(r.x+r.dx/2, r.y+r.dy);
            this.ctx.moveTo(r.x, r.y+r.dy/2);
            this.ctx.lineTo(r.x+r.dx, r.y+r.dy/2);
            this.ctx.stroke();
        }
    }

    mouseDownRectangle = (e) => {
        this.creatingRectangleFirstClick = true
        this.rect = {...this.rect, ...this.getCoords(e)}
    }

    mouseUpRectangle = (e) => {
        let p = this.getCoords(e)        
        this.rect.dx = p.x - this.rect.x;
        this.rect.dy = p.y - this.rect.y ;

        if (this.rect.dx < 0) {
            this.rect.dx = -this.rect.dx
            this.rect.x-=this.rect.dx
        }
        if (this.rect.dy < 0) {
            this.rect.dy = -this.rect.dy
            this.rect.y-=this.rect.dy
        }

        if (this.aspectRatio) {
            if(p.x > this.rect.x)
                this.rect.dx = Math.round(this.rect.dy * this.aspectRatio);
            else {
                this.rect.x = (p.x + this.rect.dx) - (Math.round(this.rect.dy * this.aspectRatio))
                this.rect.dx = Math.round(this.rect.dy * this.aspectRatio);
            }
        }
        this.exitCreateRectangle()
        this.creatingRectangleFirstClick = false
        this.creatingRectangle = false;
        
        this.dispatchEvent(new Event('newRectangle'));
    }


    //////////////////////////////////////////////////////////////////////
    redraw(){
        this.clearCtx()
        this.scale()
        this.rotate()
        this.gridDraw()
        this.rectanglesDraw()
    }

    toBlob(format = 'image/jpeg', quality = 1) {
        const dataurl = this.canvas.toDataURL(format, quality);	
        let  arr = dataurl.split(','), 
             mime = arr[0].match(/:(.*?);/)[1],
             bstr = atob(arr[1]), 
             n = bstr.length, 
             u8arr = new Uint8Array(n);
        while(n--){
             u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type:mime});
    }	

    fromBlob(blob){
        let urlCreator = window.URL || window.webkitURL;
        this.loadUrl(urlCreator.createObjectURL(blob))
    }

    getCoords(e) {
        var box = this.canvas.getBoundingClientRect();
        var body = document.body;
        var docEl = document.documentElement;
        var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
        var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;
        var clientTop = docEl.clientTop || body.clientTop || 0;
        var clientLeft = docEl.clientLeft || body.clientLeft || 0;
        var top  = box.top +  scrollTop - clientTop;
        var left = box.left + scrollLeft - clientLeft;
        let zw = { top: Math.round(top), left: Math.round(left) };
        let x = e.pageX - zw.left;
        let y = e.pageY - zw.top;
        x = this.scaleW == -1? this.canvas.width - x : x
        y = this.scaleH == -1? this.canvas.height - y : y
        return {x,y}
    }
    
}