var foreground = document.getElementById("edit-box-foreground");
var background = document.getElementById("edit-box-background");
var element = document.getElementById("element-targeted");
var wrongRatio = document.getElementById("on-invalid-ratio");
var selector = document.getElementById("selector");
var fgColor = null, fgPicker = document.getElementById("fgPicker");
var bgColor = null, bgPicker = document.getElementById("bgPicker");
var submit = document.getElementById("submit");
var boldState = document.getElementById("bold-text");
var backgroundIsTested = false;
var ratio = "4.5";

selector.addEventListener("click", selectorFunc);
fgPicker.addEventListener("click", fgPickerFunc);
bgPicker.addEventListener("click", bgPickerFunc);

function fgPickerFunc() {
    if (fgPicker.checked) {
	initializeHtmlElements();
	if (bgPicker.checked)
	    addon.port.emit("bgPicker-unchecked");
	if (bgColor !== null)
	    onActivatePickerElements();
	submit.href = "";
	submit.className = "btn btn-gray btn-lg disabled";
	addon.port.emit("fgPicker-checked");
    } else {
	addon.port.emit("fgPicker-unchecked");
    }
}

function bgPickerFunc() {
    if (bgPicker.checked) {
	initializeHtmlElements();
	if (fgPicker.checked)
	    addon.port.emit("fgPicker-unchecked");
	if (fgColor !== null)
	    onActivatePickerElements();
	submit.href = "";
	submit.className = "btn btn-gray btn-lg disabled";
	addon.port.emit("bgPicker-checked");
    } else {
	addon.port.emit("bgPicker-unchecked");
    }
}

function selectorFunc() {
    if (selector.checked) {
	initializeHtmlElements();
	initializeColorSamplesElements();
	initializePickerElements();
	submit.href = "";
	submit.className = "btn btn-gray btn-lg disabled";
	addon.port.emit("checked");
    } else {
	addon.port.emit("unchecked");
    }
}

addon.port.on("live-components", function(tabResult) {
    initializeHtmlElements();
    initializeColorSamplesElements();
     
    if (tabResult[0] === "background-error")
	onBackgroundError(tabResult);
    else if (tabResult[0] == "alpha-channel")
	onChannelAlphaError(tabResult);
    else if (tabResult[2] == "valid-ratio")
	onValidRatio(tabResult);
    else
	onLiveInvalidRatio(tabResult);
});

addon.port.on("live-components-fgPicker", function(fgColor) {
    this.fgColor = fgColor;
    document.getElementById("color-sample-foreground").style.backgroundColor = "#" + fgColor;
    document.getElementById("color-sample-foreground").style.backgroundImage = "none";
    foreground.textContent = "#" + fgColor;
    if (bgColor !==  null) {
	addon.port.emit("picker-ratio",
		    (fgColor + ";" + bgColor + ";" + null + ";"+ ratio + ";LIVE"));
    }
});

addon.port.on("live-components-bgPicker", function(bgColor) {
    this.bgColor = bgColor;
    document.getElementById("color-sample-background").style.backgroundColor = "#" + bgColor;
    document.getElementById("color-sample-background").style.backgroundImage = "none";
    background.textContent = "#" + bgColor;
    if (fgColor !==  null) {
	addon.port.emit("picker-ratio",
			(fgColor + ";" + bgColor + ";" + null + ";" + ratio + ";LIVE"));
    }
});

addon.port.on("stop-fgPicker-click", function() {
    fgPicker.checked = false;
    if ((fgColor !== null) && (bgColor !== null)) {
	addon.port.emit("picker-ratio",
			(fgColor + ";" + bgColor + ";" + null + ";" + ratio + ";CLICK"));
    }
    addon.port.emit("fgPicker-unchecked");
});

addon.port.on("stop-bgPicker-click", function() {
    bgPicker.checked = false;
    if ((fgColor !== null) && (bgColor !== null)) {
	addon.port.emit("picker-ratio",
			(fgColor + ";" + bgColor + ";" + null + ";" + ratio + ";CLICK"));
    }
    addon.port.emit("bgPicker-unchecked");
});

addon.port.on("click-components", function(tabResult) {
    initializeHtmlElements();
    if (tabResult[0] === "background-error") {
	onBackgroundError(tabResult);
    } else if (tabResult[0] == "alpha-channel") {
	onChannelAlphaError(tabResult);
    } else if (tabResult[2] == "valid-ratio") {
	onValidRatio(tabResult);
    } else {
	onClickInvalidRatio(tabResult);
    }

    selector.checked = false;
    addon.port.emit("unchecked");
    component = backgroundIsTested;
    
    var openUrl = "http://contrast-finder.tanaguru.com/result.html?foreground=%23"
	+ foreground.textContent.replace("#", "") + "&background=%23" + background.textContent.replace("#", "")
	+ "&isBackgroundTested=" + backgroundIsTested + "&ratio="
	+ ratio + "&algo=HSV";
    
    submit.href = openUrl;    
});

function initializeColorSamplesElements() {
    initializeComponentFieldset();
    document.getElementById("color-sample-foreground").style.backgroundColor = "#F0F0F0";
    document.getElementById("color-sample-foreground").style.backgroundImage = "repeating-linear-gradient(45deg, transparent, transparent 15px, rgba(255,255,255,0.5) 3px, rgba(255,255,255,.5) 29px)";
    document.getElementById("color-sample-background").style.backgroundColor = "#F0F0F0";
    document.getElementById("color-sample-background").style.backgroundImage = "repeating-linear-gradient(45deg, transparent, transparent 15px, rgba(255,255,255,0.5) 3px, rgba(255,255,255,.5) 29px)";
}

function initializeComponentFieldset() {
    document.getElementById("legend-component").style.opacity = "0.5";
    document.getElementById("fieldset-component").disabled = true;
    document.getElementById("foreground-component-text").style.opacity = "0.5";
    document.getElementById("foreground-component-text").style.cursor = "not-allowed";
    document.getElementById("background-component-text").style.opacity = "0.5";
    document.getElementById("background-component-text").style.cursor = "not-allowed";
}

function initializeHtmlElements() {
    document.getElementById("background-error").style.display = "none";
    document.getElementById("invalid-ratio").style.display = "none";
    document.getElementById("channel-alpha").style.display = "none";
    document.getElementById("valid-ratio").style.display = "none";
    document.getElementById("valid-contrast-alt-attribute").style.display = "none";
    document.getElementById("invalid-contrast-alt-attribute").style.display = "none";
    if (document.getElementById("language-reference").textContent == "Avant plan") {
	submit.title = "Trouver des couleurs valides (vous emmenera sur Tanaguru Contrast-Finder dans un nouvel onglet)";
    }
}

function initializePickerElements() {
    document.getElementById("legend-component").style.opacity = "0.5";
    document.getElementById("fieldset-component").disabled = true;
    document.getElementById("foreground-component-text").style.opacity = "0.5";
    document.getElementById("foreground-component-text").style.cursor = "not-allowed";
    document.getElementById("background-component-text").style.opacity = "0.5";
    document.getElementById("background-component-text").style.cursor = "not-allowed";
    document.getElementById("legend-ratio").style.opacity = "0.5";
    document.getElementById("fieldset-ratio").disabled = true;
    document.getElementById("small-size-text").style.opacity = "0.5";
    document.getElementById("small-size-text").style.cursor = "not-allowed";
    document.getElementById("medium-size-text").style.opacity = "0.5";
    document.getElementById("medium-size-text").style.cursor = "not-allowed";    
    document.getElementById("big-size-text").style.opacity = "0.5";
    document.getElementById("big-size-text").style.cursor = "not-allowed";
    document.getElementById("isbold-text").style.opacity = "0.5";
    document.getElementById("isbold-text").style.cursor = "not-allowed";
    element.textContent = "";
}

function onActivatePickerElements() {
    var smallText = document.getElementById("small-size-text");
    var mediumText = document.getElementById("medium-size-text");
    var bigText = document.getElementById("big-size-text");
    document.getElementById("legend-ratio").style.opacity = "1";
    document.getElementById("fieldset-ratio").disabled = false;
    smallText.style.opacity = "1";
    smallText.style.cursor = "inherit";
    smallText.firstElementChild.style.cursor = "inherit";
    mediumText.style.opacity = "1";
    mediumText.style.cursor = "inherit";
    mediumText.firstElementChild.style.cursor = "inherit";
    bigText.style.opacity = "1";
    bigText.style.cursor = "inherit";
    bigText.firstElementChild.style.cursor = "inherit";
    document.getElementById("isbold-text").style.opacity = "1";
    document.getElementById("isbold-text").style.cursor = "inherit";
}

function onValidRatio(tabResult) {
    submit.href = "";
    submit.className = "btn btn-gray btn-lg disabled";
    initializeComponentFieldset();    
    setColorSamplesElements(tabResult);
    document.getElementById("valid-ratio").style.display = "block";
    setForegroundAndBackgroundValue(tabResult);
    setRatioFieldsetParameters(tabResult[4], tabResult[5]);
    if (tabResult[3] === "IMG") {
	document.getElementById("valid-contrast-alt-attribute").style.display = "block";
    }
}

function onLiveInvalidRatio(tabResult) {
    setColorSamplesElements(tabResult);
    document.getElementById("invalid-ratio").style.display = "block";
    setForegroundAndBackgroundValue(tabResult);
    setRatioFieldsetParameters(tabResult[4], tabResult[5]);
    if (tabResult[3] === "IMG") {
	document.getElementById("invalid-contrast-alt-attribute").style.display = "block";
    }
}

function onClickInvalidRatio(tabResult) {
    document.getElementById("legend-component").style.opacity = "1";
    document.getElementById("foreground-component-text").style.opacity = "1";
    document.getElementById("foreground-component-text").style.cursor = "inherit";
    document.getElementById("background-component-text").style.opacity = "1";
    document.getElementById("background-component-text").style.cursor = "inherit";
    document.getElementById("fieldset-component").disabled = false;
    document.getElementById("invalid-ratio").style.display = "block";
    if (tabResult[3] === "IMG") {
	document.getElementById("invalid-contrast-alt-attribute").style.display = "block";
    }
    submit.className = "btn btn-primary btn-lg";
    setForegroundAndBackgroundValue(tabResult);
    setRatioFieldsetParameters(tabResult[4], tabResult[5]);
    if (tabResult[5] === "PICKER")
	ratio = tabResult[3];
    else
	ratio = tabResult[2];
}

function onBackgroundError(tabResult) {
    document.getElementById("background-error").style.display = "block";
    setForegroundAndDropBackground(tabResult);
    setRatioFieldsetParameters(tabResult[3], tabResult[4]);
}

function onChannelAlphaError(tabResult) {
    document.getElementById("channel-alpha").style.display = "block";
    dropForegroundAndBackgroundValue();
    setRatioFieldsetParameters(tabResult[2], tabResult[3]);
    element.textContent = "<" + tabResult[1].toLowerCase() + ">";
}

function setColorSamplesElements(tabResult) {
    if (fgColor !== 'undefined') {
	document.getElementById("color-sample-foreground").style.backgroundColor = "#" + tabResult[0]
	;
	document.getElementById("color-sample-foreground").style.backgroundImage = "none";
    }
    if (bgColor !== 'undefined') {
	document.getElementById("color-sample-background").style.backgroundColor = "#" + tabResult[1];
	document.getElementById("color-sample-background").style.backgroundImage = "none";
    }
}

function setForegroundAndBackgroundValue(tabResult) {
    if (fgColor !== 'undefined') {
	foreground.textContent = "#" + tabResult[0];
	fgColor = tabResult[0];
    }
    if (bgColor !== 'undefined') {
	background.textContent = "#" + tabResult[1];
	bgColor = tabResult[1];
    }
    if (tabResult[5] !== "PICKER")
	element.textContent = "<" + tabResult[3].toLowerCase() + ">";
}

function dropForegroundAndBackgroundValue() {
    foreground.textContent = "#------";
    background.textContent = "#------";
    fgColor = null;
    bgColor = null;
}

function setForegroundAndDropBackground(tabResult) {
    document.getElementById("color-sample-foreground").style.backgroundColor = "#" + tabResult[1];
    document.getElementById("color-sample-foreground").style.backgroundImage = "none";
    foreground.textContent = "#" + tabResult[1];
    fgColor = tabResult[1];
    background.textContent = "#------";
    bgColor = null;
    element.textContent = "<" + tabResult[2].toLowerCase() + ">";
}

function setRatioFieldsetParameters(fontSize, fontWeight) {
    var small = document.getElementById("small-size");
    var medium = document.getElementById("medium-size");
    var big = document.getElementById("big-size");
    
    if (fontSize < 14 && fontWeight < 700) {
	boldState.checked = false;
	small.checked = true;
	ratio = "4.5";
	pickerTextSize = "inf";
    } else if (fontSize < 14 && fontWeight >= 700) {
	boldState.checked = true;
	small.checked = true;
	ratio = "4.5";
	pickerTextSize = "inf";
    } else if (fontSize >= 18 && fontWeight < 700) {
	boldState.checked = false;
	big.checked = true;
	ratio = "3";
	pickerTextSize = "sup";
    } else if (fontSize >= 18 && fontWeight >= 700) {
	boldState.checked = true;
    	big.checked = true;
	ratio = "3";
	pickerTextSize = "sup";
    } else if (fontSize >= 14 && fontSize < 18 && fontWeight < 700) {
	boldState.checked = false;
    	medium.checked = true;
	ratio = "4.5";
	pickerTextSize = "med";
    } else if (fontSize >= 14 && fontSize < 18 && fontWeight >= 700) {
	boldState.checked = true;
    	medium.checked = true;
	ratio = "3";
	pickerTextSize = "med";
    }
}	     
    
var radios = document.forms["formulaire"].elements["component-modify"];
for(var radio in radios) {
    radios[radio].onclick = function() {
	if (this.value === "background" && backgroundIsTested !== true) {
	    backgroundIsTested = true;
	    if (submit.href !== "") {
		submit.href = submit.href.replace("false", backgroundIsTested);
	    }
	}
	else if (this.value === "foreground" && backgroundIsTested !== false) {
	    backgroundIsTested = false;
	    if (submit.href !== "") {
		submit.href = submit.href.replace("true", backgroundIsTested);
	    }
	}
    }
}

var pickerTextSize = "inf";
var sizeRadios = document.forms["formulaire"].elements["text-size"];
for(var sizeRadio in sizeRadios) {
    sizeRadios[sizeRadio].onclick = function() {
	if (this.value === "sup") {
	    pickerTextSize = this.value;
	    ratio = "3";
	    addon.port.emit("picker-ratio",
			    (fgColor + ";" + bgColor + ";" + null + ";" + ratio + ";CLICK"));
	}
	else if (this.value === "med") {
	    if (boldState.checked) {
		pickerTextSize = this.value;
		ratio = "3";
		addon.port.emit("picker-ratio", 
				(fgColor + ";" + bgColor + ";" + null + ";" + ratio + ";CLICK"));
	    }
	    else {
		pickerTextSize = this.value;
		ratio = "4.5";
		addon.port.emit("picker-ratio", 
				(fgColor + ";" + bgColor + ";" + null + ";" + ratio + ";CLICK"));
	    }
	}
	else if (this.value === "inf") {
	    pickerTextSize = this.value;
	    ratio = "4.5";
		addon.port.emit("picker-ratio",
				(fgColor + ";" + bgColor + ";" + null + ";" + ratio + ";CLICK"));
	}
    }
}

boldState.onclick = function() {
    if (boldState.checked && pickerTextSize === "med") {
	ratio = "3";
    } else if (!boldState.checked && pickerTextSize === "med") {
	ratio = "4.5";
    }
    addon.port.emit("picker-ratio", 
		    (fgColor + ";" + bgColor + ";" + null + ";" + ratio + ";CLICK"));
}

addon.port.on("stop-selector", function() {
    selector.checked = false;
});

addon.port.on("start-selector-button", function() {
    selector.checked = true;
});

addon.port.on("stop-fgPicker", function() {
    fgPicker.checked = false;
});

addon.port.on("start-fgPicker-button", function() {
    fgPicker.checked = true;
});

addon.port.on("stop-bgPicker", function() {
    bgPicker.checked = false;
});

addon.port.on("start-bgPicker-button", function() {
    bgPicker.checked = true;
});