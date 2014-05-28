var selector = false;
var target = null;
var handleMouseover = null;
var clickedElement;
var lastElementStyle;
var win = window.content;

var handleClick = function (e) {
    if (selector === true) {
	e.preventDefault();
	e.stopPropagation();
	win.removeEventListener('mouseover', handleMouseover, false);
	if (target !== null)
	    target.style.outline = lastElementStyle;
	selector = false;
	clickedElement = e.target || e.srcElement;
	getResultAndEmit(clickedElement, "click-refresh");
    }
};

self.port.on("selector-checked", function() {
    selector = true;
    handleMouseover = function (e) {
	if (selector === true) {
	    win.addEventListener('click', handleClick, false);
	    if (target !== null) {
		target.style.outline = lastElementStyle;
	    }
	    target = e.target || e.srcElement;
	    lastElementStyle = target.style.outline;
	    target.style.outline= "2px solid #F07D4E";
	    getResultAndEmit(target, "over-refresh");
	}
    };
    win.removeEventListener('click', handleClick, false);
    win.addEventListener('mouseover', handleMouseover, false);
});
	     
self.port.on("selector-unchecked", function() {
    selector = false;
    win.removeEventListener('mouseover', handleMouseover, false);
    win.removeEventListener('click', handleClick, false);
    if (target !== null)
	target.style.outline = lastElementStyle;
});

function getResultAndEmit(elem, emitString) {
    var bgColor = getNotTransparentColor(elem);	
    var stringResult = null;
    var tabResult = null;
    var computeRatio = getContrastRatio(getForegroundColor(elem), bgColor);
    if (bgColor == 'error') {
	stringResult = "background-error" + ";" 
	    + colorToHex(getForegroundColor(target)).toUpperCase() + ";"
	    + elem.tagName;
	tabResult = stringResult.split(";");
	self.port.emit(emitString, tabResult);
    } else if(computeRatio == "error-color") {
	stringResult = "alpha-channel" + ";" + elem.tagName;
	tabResult = stringResult.split(";");
	self.port.emit(emitString, tabResult);
    }else {
	var fontSize = getForegroundFontSize(elem);
	var fontWeight = getForegroundFontWeight(elem);
	computeRatio = getIndexofSelectBoxRatio(fontSize, fontWeight, computeRatio);
	if (computeRatio == "valid") {
	    stringResult = colorToHex(getForegroundColor(target)).toUpperCase() + ";"
		+ colorToHex(bgColor).toUpperCase() + ";"
		+ "valid-ratio" + ";"
		+ elem.tagName;
	    tabResult = stringResult.split(";");
	    self.port.emit(emitString, tabResult);
	} else {
	    stringResult = colorToHex(getForegroundColor(target)).toUpperCase() + ";"
		+ colorToHex(bgColor).toUpperCase() + ";"
		+ computeRatio + ";"
		+ elem.tagName;
	    tabResult = stringResult.split(";");
	    self.port.emit(emitString, tabResult);
	}
    }
}

/********************************************************************/
// Compute the contrast ratio functions
/********************************************************************/

function getIndexofSelectBoxRatio(fontSize, fontWeight, computeRatio) {
    if ((fontSize < 18 && fontWeight < 700 && computeRatio < 4.5) || (fontSize < 14 && fontWeight >= 700 && computeRatio < 4.5)) {
	return "4.5";
    } else if ((fontSize >= 18 && fontWeight < 700 && computeRatio < 3) || (fontSize >= 14 && fontWeight >= 700 && computeRatio < 3 )) {
	return "3";
    } else {
	return "valid";
    }
}

function getContrastRatio(fgColor, bgColor) {
    var fgLuminosity = getLuminosity(fgColor);
    var bgLuminosity = getLuminosity(bgColor);
    if (fgLuminosity === "error-color" || bgLuminosity === "error-color") {
	return "error-color";
    }
    if (fgLuminosity > bgLuminosity) {
        return computeContrast(fgLuminosity, bgLuminosity);
    } else {
        return computeContrast(bgLuminosity, fgLuminosity);
    }
};

function getLuminosity(color) {
    var digits = /(.*?)rgb\((\d+), (\d+), (\d+)\)/.exec(color);
    if (digits === null) {
	return "error-color";
    }
    var red = parseInt(digits[2]);
    var green = parseInt(digits[3]);
    var blue = parseInt(digits[4]);
    var luminosity =
        getComposantValue(red) * 0.2126
        + getComposantValue(green) * 0.7152
        + getComposantValue(blue) * 0.0722;
    return luminosity;
}

function getComposantValue(composant) {
    var rsgb = composant / 255;
    if (rsgb <= 0.03928) {
        return rsgb / 12.92;
    } else {
        return Math.pow(((rsgb + 0.055) / 1.055), 2.4);
    }
}

function computeContrast(lighter, darker) {
    return ((lighter + 0.05) / (darker + 0.05));
}


/********************************************************************/
// Get and verify color functions
/********************************************************************/

/*
 * Check if the color is not transparent
 */
function getNotTransparentColor(elem) {
    var isValidBackground = false, bgColor = extractBackgroundColor(elem);
    var currentNode = elem;
    if (currentNode.tagName == "HTML" && ((bgColor == null) || bgColor == 'transparent')) {
	 return "rgb(255, 255, 255)";
    }
    while (isValidBackground !== true && currentNode.parentNode.tagName != null) {
	if (bgColor == 'transparent' || bgColor == null) {
	    currentNode = currentNode.parentNode;
	    bgColor = extractBackgroundColor(currentNode);
	    if (currentNode.tagName == "HTML" && ((bgColor == null) || bgColor == 'transparent')) {
		return "rgb(255, 255, 255)";
	    }
	} else {
	    isValidBackground = true;
	}
    }
    return bgColor;
}

/*
 * get the computed style of an element
 */
function getStyle(elem, strCssRule, pseudoSelector) {
    var style = "";
    if (elem.currentStyle) {
        style = elem.currentStyle[strCssRule];
    } else if (win.getComputedStyle) {
        style = document.defaultView.getComputedStyle(elem, pseudoSelector).
            getPropertyValue(strCssRule);
    }
    return style;
}

/*
 * get the text size
 */
function getForegroundFontSize(elem) {
    var fontSize = parseInt(getStyle(elem, 'font-size'));
    return fontSize;
}

/*
 * get the text weight value to know if the text is bold or not
 */
function getForegroundFontWeight(elem) {
    var fontWeight = parseInt(getStyle(elem, 'font-weight'));
    return fontWeight;
}

/*
 * compute the foreground color of a node
 */
function getForegroundColor(elem) {
    var color = getStyle(elem, 'color');
    return (color);
}

/*
 * compute the background color of a node
 */
function getBackgroundColor(elem) {
    var bgImg = getStyle(elem, 'background-image');
    if (bgImg != 'none') {
        return "error";
    }
    var bgColor = getStyle(elem, 'background-color');
    return (bgColor);
}


/*
 * get the element name
 */
function getElementName(elem) {
    return elem.tagName.toLowerCase();
}

/*
 * determine whether an element is of a given type
 */
function isElementOfType(elemName, typeName) {
    if (elemName === typeName) {
        return true;
    }
    return false;
}

function isAllowedElement(elem) {
    var tagName = getElementName(elem);
    if (isElementOfType(tagName, 'script')) {
        return false;
    }
    if (isElementOfType(tagName, 'noscript')) {
        return false;
    }
    if (isElementOfType(tagName, 'br')) {
        return false;
    }
    if (isElementOfType(tagName, 'svg')) {
        return false;
    }
    if (isElementOfType(tagName, 'head')) {
        return false;
    }
    if (isElementOfType(tagName, 'style')) {
        return false;
    }
    if (isElementOfType(tagName, 'meta')) {
        return false;
    }
    if (isElementOfType(tagName, 'link')) {
        return false;
    }
    if (isElementOfType(tagName, 'title')) {
        return false;
    }
    if (isElementOfType(tagName, 'option')) {
        return false;
    }
    return true;
};

/*
 * get the background color of the node passing in parameter
 */
function extractBackgroundColor(elem) {
    if (isAllowedElement(elem)) {
        return getBackgroundColor(elem);
    }
    return null;
};

/*
 * convert a rgb color to hexadecimal value
 */
function colorToHex(color) {
    var digits = /(.*?)rgb\((\d+), (\d+), (\d+)\)/.exec(color);
    
    var red = parseInt(digits[2]);
    var green = parseInt(digits[3]);
    var blue = parseInt(digits[4]);
    
    return componentToHex(red) + componentToHex(green) + componentToHex(blue);
};


/*
 * convert one component of rgb color to hexadecimal value
 */
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}