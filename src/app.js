
class Rect{
    constructor(x,y,w,h,color){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = color;
        
        this.draw=function(ctx)
        {
          //console.log("in rectdraw");
          ctx.lineWidth="3";
          ctx.strokeStyle=this.color;
          ctx.strokeRect(this.x, this.y, this.w, this.h);
        }
      
        this.contains = function(mx, my) 
        {
          return  (this.x <= mx) && (this.x + this.w >= mx) &&
                  (this.y <= my) && (this.y + this.h >= my);
        }
    }
}

class Canvas extends React.Component{
    constructor(props){
        super(props)
        this.state={
            shapes: [],
            selection: null
        }
        this.init=this.init.bind(this)
        this.addShape=this.addShape.bind(this)
        this.delShape=this.delShape.bind(this)
        this.reShape=this.reShape.bind(this)        
        this.drawAll=this.drawAll.bind(this)
        this.clear=this.clear.bind(this)
        this.doDown=this.doDown.bind(this)
        this.doMove=this.doMove.bind(this)
        this.doUp=this.doUp.bind(this)        
        this.getPos=this.getPos.bind(this)
        this.canvas=undefined;
        this.ctx=undefined;
        this.width = undefined;
        this.height = undefined;  

        // when there's a border or padding.
        this.stylePaddingLeft = 0;
        this.stylePaddingTop  = 0;
        this.styleBorderLeft  = 0;
        this.styleBorderTop   = 0;

        //pages having fixed-position bars at the top or left of the page.we also account for this offset:
        var html = document.body.parentNode;
        this.htmlTop = html.offsetTop;//returns the top position relative to the top of the offsetParent element.
        this.htmlLeft = html.offsetLeft;
        
        this.dragging = false; // Keep track of when we are dragging
        //this.selection = null;// the current selected object.
      
        this.dragoffx = 0;// Keep track of where in the object we clicked
        this.dragoffy = 0;
        
        this.selectionColor = '#CC0000';
        this.selectionWidth = 3;
    }
    
    addShape(shape){
        this.setState((prevState)=>{
            return{
                shapes: prevState.shapes.concat([shape])
            }
        })
    }

    delShape(){
        console.log("in deleteRect");
        if(this.state.selection===null)
        {
            alert("select a rectangle to delete");
            return;
        }
        document.getElementsByName("rewidth")[0].value="";
        document.getElementsByName("reheight")[0].value="";
        this.setState((prevState)=>{
            return{
                shapes: prevState.shapes.filter((shape) => shape!==this.state.selection),
                selection:null
            }
        })    
    }

    reShape(){
        if(this.state.selection==null)
        {
            alert("select a rectangle to reshape");
            return;
        }
        var width,height;
        width=document.getElementsByName("rewidth")[0].value;
        height=document.getElementsByName("reheight")[0].value;
        if(width==""||height=="")
        {
            alert("All input values must be filled out");
            return;
        }
        this.state.selection.w=width;
        this.state.selection.h=height;
        this.drawAll();        
    }

    clear() {
      console.log("in clear"); 
      this.ctx.clearRect(0, 0, this.width, this.height);
    }

    drawAll(){
        var ctx = this.ctx;
        var shapes = this.state.shapes;
        this.clear();
        
        console.log("redrawing")

        // draw all shapes
        var l = shapes.length;
        for (var i = 0; i < l; i++) {
          var shape = shapes[i];
          // We can skip the drawing of elements that have moved off the screen:
          if (shape.x > this.width || shape.y > this.height || shape.x + shape.w < 0 || shape.y + shape.h < 0) continue;
          shapes[i].draw(ctx);
        }
        
        //draw selection ring
        if (this.state.selection != null) {
          this.ctx.strokeStyle = this.selectionColor;
          this.ctx.lineWidth = this.selectionWidth;
          var mySel = this.state.selection;
          this.ctx.strokeRect(mySel.x,mySel.y,mySel.w,mySel.h);
        }
    }
    
    init(){
        console.log("in init");
        this.canvas= this.refs.canvas;
        this.ctx=this.canvas.getContext("2d");
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        //window object represents an open window in a browser.
        if (window.getComputedStyle) { // returns an object that reports the values of all CSS properties of an element
          this.stylePaddingLeft = parseInt(getComputedStyle(this.canvas, null).getPropertyValue('padding-left'));
          this.stylePaddingTop  = parseInt(getComputedStyle(this.canvas, null).getPropertyValue('padding-top'));
          this.styleBorderLeft  = parseInt(getComputedStyle(this.canvas, null).getPropertyValue('border-left-width'));
          this.styleBorderTop   = parseInt(getComputedStyle(this.canvas, null).getPropertyValue('border-top-width'));
          // getpropertyValue retuens a DOMString containing the value of the property. If not set, returns the empty string.
        }
        //const rect=new Rect(40,40,60,60,'red')
        //console.log(rect)

        this.addShape(new Rect(40,40,60,60,'red')); 
        this.addShape(new Rect(60,140,40,60, 'green'));
        this.addShape(new Rect(80,180,80,50,  'rgba(84, 121, 128, .5)'));
        this.addShape(new Rect(125,80,40,120, 'rgba(69, 173, 168, .7)'));
        this.addShape(new Rect(225,80,90,80,  'rgba(157, 224, 173, .9)'));
        this.addShape(new Rect(205,120,90,80, 'rgba(229, 252, 194, .9)'));
    }

    doDown(e) {
        console.log("in mousedown");
        const pos = this.getPos(e);
        //console.log(pos);
        const mx = pos.x;
        const my = pos.y;
        const shapes = this.state.shapes;
        const l = shapes.length;
        for (var i = l-1; i >= 0; i--) 
        if (shapes[i].contains(mx, my)) {
            var mySel = shapes[i];
            // Keep track of where in the object we clicked
            this.dragoffx = mx - mySel.x;
            this.dragoffy = my - mySel.y;
            document.getElementsByName("rewidth")[0].value=mySel.w;
            document.getElementsByName("reheight")[0].value=mySel.h;
            this.dragging = true;
            this.setState(()=>{
                return{
                    selection:mySel
                }
            })
            return;
        }
        if (this.state.selection) 
        {
            this.setState(()=>{
                return{
                    selection: null
                }
            })
          document.getElementsByName("rewidth")[0].value="";
          document.getElementsByName("reheight")[0].value="";  
        }
    }

    doMove(e){
      if (this.dragging){
        console.log("in mousedrag"); 
        var mouse = this.getPos(e);
        
        // we want to drag it from where we clicked, so we use the offset
        // this.setState(()=>{
        //     return{
        //         selection: {x:mouse.x - this.dragoffx,y:mouse.y - this.dragoffy}
        //         //selection.x = mouse.x - this.dragoffx;
        //         //selection.y = mouse.y - this.dragoffy;
        //     }
        // })
        this.state.selection.x = mouse.x - this.dragoffx;
        this.state.selection.y = mouse.y - this.dragoffy;
        this.drawAll();
        //this.valid = false; // Something's dragging so we must redraw
      }
    }
    
    doUp(e) {
      console.log("in mouseup"); 
      this.dragging = false;
    }

    getPos(e){
        //console.log("in getPos"); 
        var element = this.canvas, offsetX = 0, offsetY = 0, mx, my;
        // Compute the total offset
        if (element.offsetParent !== undefined) {//returns a reference to the object which is the closest positioned containing element
          do {
            offsetX += element.offsetLeft;
            offsetY += element.offsetTop;
          } while ((element = element.offsetParent));
        }
        // Add padding and border style widths to offset
        // Also add the <html> offsets in case there's a position:fixed bar
        offsetX += this.stylePaddingLeft + this.styleBorderLeft + this.htmlLeft;
        offsetY += this.stylePaddingTop + this.styleBorderTop + this.htmlTop;
        mx = e.pageX - offsetX;//pageX & pageY coordinates of the mouse pointer when the mouse button
        my = e.pageY - offsetY;
        // We return a JavaScript object with x and y defined
        // mouse.x=mx;mouse.y=my;
        document.getElementsByName("X")[0].value=mx;
        document.getElementsByName("Y")[0].value=my;
        return {x: mx, y: my};
      }
    
    componentDidMount(){
        console.log('component mounted')
        this.init();
        //console.log(this.state.shapes.length)
        //this.drawAll();
        this.canvas.addEventListener('selectstart',function(e) { e.preventDefault(); return false; }, false);
        this.canvas.addEventListener('mousedown', this.doDown, true);
        this.canvas.addEventListener('mousemove',this.doMove, true);
        this.canvas.addEventListener('mouseup',this.doUp, true);
        try{
            const json=localStorage.getItem('shapes');
            const shapes=JSON.parse(json);
            const json2=localStorage.getItem('selection');
            const selection=JSON.parse(json2);
            console.log(shapes)
            //console.log(this.state.shapes)
            
            // if(shapes){
            //     this.setState(() => ({ shapes }))
            // }
            // if(selection){
            //     this.setState(() => ({ selection }))                
            // }
        } catch(e){
            //Do nothing
        }
    }

    componentDidUpdate(prevProps,prevState){
        if(prevState.shapes.length!==this.state.shapes.length||prevState.selection!==this.state.selection){
            console.log('Saving data!')
            const json=JSON.stringify(this.state.shapes);
            localStorage.setItem('shapes',json)
            const json2=JSON.stringify(this.state.selection);
            localStorage.setItem('selection',json2)

        }
        //console.log('shapessize',this.state.shapes.length)
        this.drawAll()
        console.log(this.state.shapes)
    }

    
    
    render(){
        const canvasStyle ={
            border: '1px solid black'
          };
        return(
            <div>
                <canvas ref="canvas" name="canvas" width={1500} height={600} style={canvasStyle} >
                Your browser does not support the HTML5 canvas tag.
                </canvas>
                <Addrect canvas={this.canvas} addShape={this.addShape}/>
                <DeleteRect delShape={this.delShape}/>
                <Reshape reShape={this.reShape}/>
            </div>
        )
    }
}

class Addrect extends React.Component{
    constructor(props){
        super(props)
        this.state={
            X: undefined,
            Y: undefined
        }
        this.handleAdd=this.handleAdd.bind(this)
    }
    handleAdd(e){
        e.preventDefault();
        //const 
        console.log('Btn Add')
        const startX=e.target.elements.X.value.trim();
        const startY=e.target.elements.Y.value;
        const width=e.target.elements.width.value;
        const height=e.target.elements.height.value;
        const color=e.target.elements.color.value;
        if(startX==""||startY==""||width==""||height==""||color=="")
        {
          alert("All values must be filled out");
        }
        else{
          this.props.addShape(new Rect(Number(startX),Number(startY),Number(width),Number(height),color));
        }
    }
    render(){
        return(
            <div>
                <form onSubmit={this.handleAdd}>
                    <button>Add</button>
                    X: <input type="number" name="X" value={this.state.X}/>
                    Y: <input type="number" name="Y" value={this.state.X}/>
                    Widht:<input type="number" name="width"/>
                    Height:<input type="number" name="height"/>
                    Color:<input type="text" name="color" defaultValue={'red'}/>
                </form>
            </div>
        )
    }
}


class DeleteRect extends React.Component{
    constructor(props){
        super(props)
    }
    render(){
        return(
            <div>
                <button onClick={this.props.delShape}>Delete</button>
            </div>
        )
    }
}


class Reshape extends React.Component{
    constructor(props){
        super(props)
        this.handleReShape=this.handleReShape.bind(this)
    }
    handleReShape(e){
        console.log("reshape")
        e.preventDefault();
        this.props.reShape();
    }
    
    render(){
        return(
            <div>
                <form onSubmit={this.handleReShape}>
                <button>Reshape</button>
                Widht:<input type="number" name="rewidth"/>
                Height:<input type="number" name="reheight"/>
                </form>
            </div>
        )
    }
}


ReactDOM.render(<Canvas/>,document.getElementById("app"))