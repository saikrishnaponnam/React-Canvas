"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Rect = function Rect(x, y, w, h, color) {
    _classCallCheck(this, Rect);

    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = color;

    this.draw = function (ctx) {
        //console.log("in rectdraw");
        ctx.lineWidth = "3";
        ctx.strokeStyle = this.color;
        ctx.strokeRect(this.x, this.y, this.w, this.h);
    };

    this.contains = function (mx, my) {
        return this.x <= mx && this.x + this.w >= mx && this.y <= my && this.y + this.h >= my;
    };
};

var Canvas = function (_React$Component) {
    _inherits(Canvas, _React$Component);

    function Canvas(props) {
        _classCallCheck(this, Canvas);

        var _this = _possibleConstructorReturn(this, (Canvas.__proto__ || Object.getPrototypeOf(Canvas)).call(this, props));

        _this.state = {
            shapes: [],
            selection: null
        };
        _this.init = _this.init.bind(_this);
        _this.addShape = _this.addShape.bind(_this);
        _this.delShape = _this.delShape.bind(_this);
        _this.reShape = _this.reShape.bind(_this);
        _this.drawAll = _this.drawAll.bind(_this);
        _this.clear = _this.clear.bind(_this);
        _this.doDown = _this.doDown.bind(_this);
        _this.doMove = _this.doMove.bind(_this);
        _this.doUp = _this.doUp.bind(_this);
        _this.getPos = _this.getPos.bind(_this);
        _this.canvas = undefined;
        _this.ctx = undefined;
        _this.width = undefined;
        _this.height = undefined;

        // when there's a border or padding.
        _this.stylePaddingLeft = 0;
        _this.stylePaddingTop = 0;
        _this.styleBorderLeft = 0;
        _this.styleBorderTop = 0;

        //pages having fixed-position bars at the top or left of the page.we also account for this offset:
        var html = document.body.parentNode;
        _this.htmlTop = html.offsetTop; //returns the top position relative to the top of the offsetParent element.
        _this.htmlLeft = html.offsetLeft;

        _this.dragging = false; // Keep track of when we are dragging
        //this.selection = null;// the current selected object.

        _this.dragoffx = 0; // Keep track of where in the object we clicked
        _this.dragoffy = 0;

        _this.selectionColor = '#CC0000';
        _this.selectionWidth = 3;
        return _this;
    }

    _createClass(Canvas, [{
        key: "addShape",
        value: function addShape(shape) {
            this.setState(function (prevState) {
                return {
                    shapes: prevState.shapes.concat([shape])
                };
            });
        }
    }, {
        key: "delShape",
        value: function delShape() {
            var _this2 = this;

            console.log("in deleteRect");
            if (this.state.selection === null) {
                alert("select a rectangle to delete");
                return;
            }
            document.getElementsByName("rewidth")[0].value = "";
            document.getElementsByName("reheight")[0].value = "";
            this.setState(function (prevState) {
                return {
                    shapes: prevState.shapes.filter(function (shape) {
                        return shape !== _this2.state.selection;
                    }),
                    selection: null
                };
            });
        }
    }, {
        key: "reShape",
        value: function reShape() {
            if (this.state.selection == null) {
                alert("select a rectangle to reshape");
                return;
            }
            var width, height;
            width = document.getElementsByName("rewidth")[0].value;
            height = document.getElementsByName("reheight")[0].value;
            if (width == "" || height == "") {
                alert("All input values must be filled out");
                return;
            }
            this.state.selection.w = width;
            this.state.selection.h = height;
            this.drawAll();
        }
    }, {
        key: "clear",
        value: function clear() {
            console.log("in clear");
            this.ctx.clearRect(0, 0, this.width, this.height);
        }
    }, {
        key: "drawAll",
        value: function drawAll() {
            var ctx = this.ctx;
            var shapes = this.state.shapes;
            this.clear();

            console.log("redrawing");

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
                this.ctx.strokeRect(mySel.x, mySel.y, mySel.w, mySel.h);
            }
        }
    }, {
        key: "init",
        value: function init() {
            console.log("in init");
            this.canvas = this.refs.canvas;
            this.ctx = this.canvas.getContext("2d");
            this.width = this.canvas.width;
            this.height = this.canvas.height;

            //window object represents an open window in a browser.
            if (window.getComputedStyle) {
                // returns an object that reports the values of all CSS properties of an element
                this.stylePaddingLeft = parseInt(getComputedStyle(this.canvas, null).getPropertyValue('padding-left'));
                this.stylePaddingTop = parseInt(getComputedStyle(this.canvas, null).getPropertyValue('padding-top'));
                this.styleBorderLeft = parseInt(getComputedStyle(this.canvas, null).getPropertyValue('border-left-width'));
                this.styleBorderTop = parseInt(getComputedStyle(this.canvas, null).getPropertyValue('border-top-width'));
                // getpropertyValue retuens a DOMString containing the value of the property. If not set, returns the empty string.
            }
            //const rect=new Rect(40,40,60,60,'red')
            //console.log(rect)

            this.addShape(new Rect(40, 40, 60, 60, 'red'));
            this.addShape(new Rect(60, 140, 40, 60, 'green'));
            this.addShape(new Rect(80, 180, 80, 50, 'rgba(84, 121, 128, .5)'));
            this.addShape(new Rect(125, 80, 40, 120, 'rgba(69, 173, 168, .7)'));
            this.addShape(new Rect(225, 80, 90, 80, 'rgba(157, 224, 173, .9)'));
            this.addShape(new Rect(205, 120, 90, 80, 'rgba(229, 252, 194, .9)'));
        }
    }, {
        key: "doDown",
        value: function doDown(e) {
            console.log("in mousedown");
            var pos = this.getPos(e);
            //console.log(pos);
            var mx = pos.x;
            var my = pos.y;
            var shapes = this.state.shapes;
            var l = shapes.length;
            for (var i = l - 1; i >= 0; i--) {
                if (shapes[i].contains(mx, my)) {
                    var mySel = shapes[i];
                    // Keep track of where in the object we clicked
                    this.dragoffx = mx - mySel.x;
                    this.dragoffy = my - mySel.y;
                    document.getElementsByName("rewidth")[0].value = mySel.w;
                    document.getElementsByName("reheight")[0].value = mySel.h;
                    this.dragging = true;
                    this.setState(function () {
                        return {
                            selection: mySel
                        };
                    });
                    return;
                }
            }if (this.state.selection) {
                this.setState(function () {
                    return {
                        selection: null
                    };
                });
                document.getElementsByName("rewidth")[0].value = "";
                document.getElementsByName("reheight")[0].value = "";
            }
        }
    }, {
        key: "doMove",
        value: function doMove(e) {
            if (this.dragging) {
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
    }, {
        key: "doUp",
        value: function doUp(e) {
            console.log("in mouseup");
            this.dragging = false;
        }
    }, {
        key: "getPos",
        value: function getPos(e) {
            //console.log("in getPos"); 
            var element = this.canvas,
                offsetX = 0,
                offsetY = 0,
                mx,
                my;
            // Compute the total offset
            if (element.offsetParent !== undefined) {
                //returns a reference to the object which is the closest positioned containing element
                do {
                    offsetX += element.offsetLeft;
                    offsetY += element.offsetTop;
                } while (element = element.offsetParent);
            }
            // Add padding and border style widths to offset
            // Also add the <html> offsets in case there's a position:fixed bar
            offsetX += this.stylePaddingLeft + this.styleBorderLeft + this.htmlLeft;
            offsetY += this.stylePaddingTop + this.styleBorderTop + this.htmlTop;
            mx = e.pageX - offsetX; //pageX & pageY coordinates of the mouse pointer when the mouse button
            my = e.pageY - offsetY;
            // We return a JavaScript object with x and y defined
            // mouse.x=mx;mouse.y=my;
            document.getElementsByName("X")[0].value = mx;
            document.getElementsByName("Y")[0].value = my;
            return { x: mx, y: my };
        }
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {
            console.log('component mounted');
            this.init();
            //console.log(this.state.shapes.length)
            //this.drawAll();
            this.canvas.addEventListener('selectstart', function (e) {
                e.preventDefault();return false;
            }, false);
            this.canvas.addEventListener('mousedown', this.doDown, true);
            this.canvas.addEventListener('mousemove', this.doMove, true);
            this.canvas.addEventListener('mouseup', this.doUp, true);
            try {
                var json = localStorage.getItem('shapes');
                var shapes = JSON.parse(json);
                var json2 = localStorage.getItem('selection');
                var selection = JSON.parse(json2);
                console.log(shapes);
                //console.log(this.state.shapes)

                // if(shapes){
                //     this.setState(() => ({ shapes }))
                // }
                // if(selection){
                //     this.setState(() => ({ selection }))                
                // }
            } catch (e) {
                //Do nothing
            }
        }
    }, {
        key: "componentDidUpdate",
        value: function componentDidUpdate(prevProps, prevState) {
            if (prevState.shapes.length !== this.state.shapes.length || prevState.selection !== this.state.selection) {
                console.log('Saving data!');
                var json = JSON.stringify(this.state.shapes);
                localStorage.setItem('shapes', json);
                var json2 = JSON.stringify(this.state.selection);
                localStorage.setItem('selection', json2);
            }
            //console.log('shapessize',this.state.shapes.length)
            this.drawAll();
            console.log(this.state.shapes);
        }
    }, {
        key: "render",
        value: function render() {
            var canvasStyle = {
                border: '1px solid black'
            };
            return React.createElement(
                "div",
                null,
                React.createElement(
                    "canvas",
                    { ref: "canvas", name: "canvas", width: 1500, height: 600, style: canvasStyle },
                    "Your browser does not support the HTML5 canvas tag."
                ),
                React.createElement(Addrect, { canvas: this.canvas, addShape: this.addShape }),
                React.createElement(DeleteRect, { delShape: this.delShape }),
                React.createElement(Reshape, { reShape: this.reShape })
            );
        }
    }]);

    return Canvas;
}(React.Component);

var Addrect = function (_React$Component2) {
    _inherits(Addrect, _React$Component2);

    function Addrect(props) {
        _classCallCheck(this, Addrect);

        var _this3 = _possibleConstructorReturn(this, (Addrect.__proto__ || Object.getPrototypeOf(Addrect)).call(this, props));

        _this3.state = {
            X: undefined,
            Y: undefined
        };
        _this3.handleAdd = _this3.handleAdd.bind(_this3);
        return _this3;
    }

    _createClass(Addrect, [{
        key: "handleAdd",
        value: function handleAdd(e) {
            e.preventDefault();
            //const 
            console.log('Btn Add');
            var startX = e.target.elements.X.value.trim();
            var startY = e.target.elements.Y.value;
            var width = e.target.elements.width.value;
            var height = e.target.elements.height.value;
            var color = e.target.elements.color.value;
            if (startX == "" || startY == "" || width == "" || height == "" || color == "") {
                alert("All values must be filled out");
            } else {
                this.props.addShape(new Rect(Number(startX), Number(startY), Number(width), Number(height), color));
            }
        }
    }, {
        key: "render",
        value: function render() {
            return React.createElement(
                "div",
                null,
                React.createElement(
                    "form",
                    { onSubmit: this.handleAdd },
                    React.createElement(
                        "button",
                        null,
                        "Add"
                    ),
                    "X: ",
                    React.createElement("input", { type: "number", name: "X", value: this.state.X }),
                    "Y: ",
                    React.createElement("input", { type: "number", name: "Y", value: this.state.X }),
                    "Widht:",
                    React.createElement("input", { type: "number", name: "width" }),
                    "Height:",
                    React.createElement("input", { type: "number", name: "height" }),
                    "Color:",
                    React.createElement("input", { type: "text", name: "color", defaultValue: 'red' })
                )
            );
        }
    }]);

    return Addrect;
}(React.Component);

var DeleteRect = function (_React$Component3) {
    _inherits(DeleteRect, _React$Component3);

    function DeleteRect(props) {
        _classCallCheck(this, DeleteRect);

        return _possibleConstructorReturn(this, (DeleteRect.__proto__ || Object.getPrototypeOf(DeleteRect)).call(this, props));
    }

    _createClass(DeleteRect, [{
        key: "render",
        value: function render() {
            return React.createElement(
                "div",
                null,
                React.createElement(
                    "button",
                    { onClick: this.props.delShape },
                    "Delete"
                )
            );
        }
    }]);

    return DeleteRect;
}(React.Component);

var Reshape = function (_React$Component4) {
    _inherits(Reshape, _React$Component4);

    function Reshape(props) {
        _classCallCheck(this, Reshape);

        var _this5 = _possibleConstructorReturn(this, (Reshape.__proto__ || Object.getPrototypeOf(Reshape)).call(this, props));

        _this5.handleReShape = _this5.handleReShape.bind(_this5);
        return _this5;
    }

    _createClass(Reshape, [{
        key: "handleReShape",
        value: function handleReShape(e) {
            console.log("reshape");
            e.preventDefault();
            this.props.reShape();
        }
    }, {
        key: "render",
        value: function render() {
            return React.createElement(
                "div",
                null,
                React.createElement(
                    "form",
                    { onSubmit: this.handleReShape },
                    React.createElement(
                        "button",
                        null,
                        "Reshape"
                    ),
                    "Widht:",
                    React.createElement("input", { type: "number", name: "rewidth" }),
                    "Height:",
                    React.createElement("input", { type: "number", name: "reheight" })
                )
            );
        }
    }]);

    return Reshape;
}(React.Component);

ReactDOM.render(React.createElement(Canvas, null), document.getElementById("app"));
