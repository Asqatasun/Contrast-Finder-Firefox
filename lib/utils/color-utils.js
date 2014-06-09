function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return componentToHex(r) + componentToHex(g) + componentToHex(b);
}

/* I can't call the chrome window from the content script. So, I call this from the
// main script. 
//http://stackoverflow.com/questions/23888525/
//firefox-drawwindow-canvas-function-using-the-add-on-sdk/23893077 
*/
function getCanvasColor(positionTab, chromewin) {
    var canvas = chromewin.document.createElementNS('http://www.w3.org/1999/xhtml',
						    'canvas');
    canvas.width = 1;
    canvas.height = 1;
    var context = canvas.getContext("2d");
    context.drawWindow(chromewin, positionTab[0], positionTab[1], 1, 1, "white");
    return context.getImageData(0, 0, 1, 1).data;
}

exports.rgbToHex = rgbToHex;
exports.getCanvasColor = getCanvasColor;
