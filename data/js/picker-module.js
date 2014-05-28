var target = null;
var lastElementStyle;
var picker = false;
var handleMouseover;
var win = window.content;
var positionTab;

var handleClick = function (e) {
    if (picker === true) {
	e.preventDefault();
	e.stopPropagation();
	win.removeEventListener('mouseover', handleMouseover, false);
	if (target !== null)
	    target.style.cursor = lastElementStyle;
	picker = false;
	self.port.emit("picker", positionTab);
	self.port.emit("picker-click");
    }
};

self.port.on("checked-picker", function() {
    console.log("receive click on content script");
    picker = true;
    handleMouseover = function (e) {
	if (picker === true) {
	    win.addEventListener('click', handleClick, false);
	    if (target !== null) {
		target.style.cursor = lastElementStyle;
	    }
	    target = e.target || e.srcElement;
	    lastElementStyle = target.style.cursor;
	    target.style.cursor = "crosshair";
	    var pageX = e.clientX + win.scrollX;
	    var pageY = e.clientY + win.scrollY;
	    var position = pageX + ";" + pageY + ";";
	    positionTab = position.split(";");
	    self.port.emit("picker", positionTab);
	}
    };
    win.removeEventListener('click', handleClick, false);
    win.addEventListener('mousemove', handleMouseover, false);
});

self.port.on("unchecked-picker", function() {
    picker = false;
    win.removeEventListener('mousemove', handleMouseover, false);
    win.removeEventListener('click', handleClick, false);
    if (target !== null)
	target.style.cursor = lastElementStyle;
});