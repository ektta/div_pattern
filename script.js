$(function(){

    canvas_init();

});

function canvas_init() {

    var root = new Pattern();
    var active = root.addChild();
    active.addChild();

    var canvas = document.getElementById('ap_canvas');
    if (! canvas || ! canvas.getContext) {
        return false;
    }
    var context = canvas.getContext('2d');

    objWidth = 90;
    objHeight = 50;

    var objX1 = 520
    var objY1 = 50;
    var objX2 = 520;
    var objY2 = 150;

    canvas_draw();

    var x, y, relX, relY;
    var dragging = false;

    function onDown(e) {
        var offsetX = canvas.getBoundingClientRect().left;
        var offsetY = canvas.getBoundingClientRect().top;
        x = e.clientX - offsetX;
        y = e.clientY - offsetY;
        if (objX1 < x && (objX1 + objWidth) > x && objY1 < y && (objY1 + objHeight) > y) {
            dragging = 1;
            relX = objX1 - x;
            relY = objY1 - y;
        }
        if (objX2 < x && (objX2 + objWidth) > x && objY2 < y && (objY2 + objHeight) > y) {
            dragging = 2;
            relX = objX2 - x;
            relY = objY2 - y;
        }

        if (active.x1 < x && x < active.x2 && active.y1 < y && y < active.y2) {
            active.child.forEach(function(element) {
                if (element.x1 < x && x < element.x2) {
                    active = element;
                }
            }, this);
        } else if (20 < x && x < 520 && active.y1 < y && y < active.y2) {
            if (active.parent != null) {
                active = active.parent;
            }
        } else if (20 < x && x < 520 && 20 < y && y < 520) {
            root.child.forEach(function(element) {
                if (element.y1 < y && y < element.y2) {
                    active = element;
                }
            }, this);
        }
    }

    function onMove(e) {
        var offsetX = canvas.getBoundingClientRect().left;
        var offsetY = canvas.getBoundingClientRect().top;
        x = e.clientX - offsetX;
        y = e.clientY - offsetY;

        if (dragging == 1) {
            objX1 = x + relX;
            objY1 = y + relY;
            canvas_draw();
        }
        if (dragging == 2) {
            objX2 = x + relX;
            objY2 = y + relY;
            canvas_draw();
        }
    }

    function onUp(e) {
        var offsetX = canvas.getBoundingClientRect().left;
        var offsetY = canvas.getBoundingClientRect().top;
        x = e.clientX - offsetX;
        y = e.clientY - offsetY;
        objX1 = 520;
        objY1 = 50;
        objX2 = 520;
        objY2 = 150;

        if (dragging != 0) {
            if (active.x1 < x && x < active.x2 && active.y1 < y && y < active.y2) {
                if (dragging != 0) {
                    var p = active.addChild();
                    p.addChild();
                    active.parent.child.forEach(function(element) {
                        element.setSize();
                    }, this);
                }
            } else if (root.x1 < x && x < root.x2) {
                if (y < active.y1) {
                    root.addChild();
                }
                if (y > active.y2) {
                    var p = root.addChild();
                    p.addChild();
                    p.y1 = (root.child.length - 1) * 100 + 40;
                    p.y2 = p.y1 + 100;
                    p.x1 = root.x1;
                    p.x2 = root.x2;
                    active = p;
                }
            }
            dragging = 0;
        }
        canvas_draw();
    }

    function canvas_draw() {
        context.clearRect(0, 0, canvas.width, canvas.height); // キャンバスをクリア
        context.strokeStyle = 'rgb(96, 96, 96)';
        context.lineWidth = 1;
        context.strokeRect(20, 20, 610, 610);
        context.moveTo(500, 20);
        context.lineTo(500, 630);
        context.closePath();
        context.stroke();

        context.strokeRect(520, 50, objWidth, objHeight);
        context.strokeRect(520, 150, objWidth, objHeight);

        if (dragging == 1) {
            drawRect1();
        }
        if (dragging == 2) {
            drawRect2();
        }
        
        root.child.forEach(function(element) {
            element.draw();
        }, this);

        context.strokeStyle = 'rgb(16, 16, 255)';
        context.lineWidth = 3;
        context.beginPath();
        context.moveTo(active.x1, active.y1);
        context.lineTo(active.x2, active.y1);
        context.lineTo(active.x2, active.y2);
        context.lineTo(active.x1, active.y2);
        context.closePath();
        context.stroke();
    }

    function drawRect1() {
        context.strokeRect(objX1, objY1, objWidth, objHeight);
    }
    function drawRect2() {
        context.strokeRect(objX2, objY2, objWidth, objHeight);
    }

    canvas.addEventListener('mousemove', onMove, false);
    canvas.addEventListener('mousedown', onDown, false);
    canvas.addEventListener('mouseup', onUp, false);

}

/* 要素の階層関係を保持する */
var Pattern = function() {
    this.parent = null;
    this.child = new Array();
    this.x1 = 40;
    this.x2 = 480;
    this.y1 = 40;
    this.y2 = 140;
    this.getFirstChild = function(){
        if (this.child != null) {
            return this.child[0];
        } else {
            return null;
        }
    }
    this.getLastChild = function(){
          if (this.child != null && this.child.length > 0) {
            return this.child[this.child.length - 1];
        } else {
            return null;
        }
    }
    this.addChild = function(){
        var p = new Pattern();
        p.parent = this;
        p.y1 = this.y1;
        p.y2 = this.y2;
        this.child.push(p);
        p.setSize();
        return p;
    }
    this.addSibling = function(){
        var p = new Pattern();
        p.parent = this.parent.parent;
        this.parent.addChild(p);
    }
    this.setSize = function(){
        var _x = (this.x2 - this.x1) / this.child.length;
        for (var i=0; i<this.child.length; i++) {
            this.child[i].x1 = _x * i + this.x1;
            this.child[i].x2 = _x * (i + 1) + this.x1;
            this.child[i].y1 = this.y1;
            this.child[i].y2 = this.y2;
            this.child[i].setSize();
        }
    }
    this.draw = function(){
        var canvas = document.getElementById('ap_canvas');
        if (! canvas || ! canvas.getContext) {
            return false;
        }
        var context = canvas.getContext('2d');
        context.strokeRect(this.x1, this.y1, this.x2 - this.x1, this.y2 - this.y1);
        this.child.forEach(function(element) {
            element.draw();
        }, this);
    }
}
