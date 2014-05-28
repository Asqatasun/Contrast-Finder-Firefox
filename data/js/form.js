var foreground = document.getElementById("edit-box-foreground");
var background = document.getElementById("edit-box-background");
var element = document.getElementById("element-targeted");
var wrongRatio = document.getElementById("on-invalid-ratio");
var selector = document.getElementById("selector");
var fgPicker = document.getElementById("fgPicker");
var bgPicker = document.getElementById("bgPicker");
var submit = document.getElementById("submit");
var backgroundIsTested = false;
var ratio;

selector.addEventListener("click", selectorFunc);
fgPicker.addEventListener("click", fgPickerFunc);
bgPicker.addEventListener("click", bgPickerFunc);

function fgPickerFunc() {
    if (fgPicker.checked) {
	addon.port.emit("fgPicker-checked");
    } else {
	addon.port.emit("fgPicker-unchecked");
    }
}

function bgPickerFunc() {
    if (bgPicker.checked) {
	addon.port.emit("bgPicker-checked");
    } else {
	addon.port.emit("bgPicker-unchecked");
    }
}

function selectorFunc() {
    if (selector.checked) {
	initializeHtmlElements();
	initializeColorSamplesElements();
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
    initializeHtmlElements();
    document.getElementById("color-sample-foreground").style.backgroundColor = "#" + fgColor;
    document.getElementById("color-sample-foreground").style.backgroundImage = "none";
    foreground.textContent = "#" + fgColor;
});

addon.port.on("stop-fgPicker-click", function() {
    fgPicker.checked = false;
    addon.port.emit("fgPicker-unchecked");
});

addon.port.on("live-components-bgPicker", function(bgColor) {
    initializeHtmlElements();
    document.getElementById("color-sample-background").style.backgroundColor = "#" + bgColor;
    document.getElementById("color-sample-background").style.backgroundImage = "none";
    background.textContent = "#" + bgColor;
});

addon.port.on("stop-bgPicker-click", function() {
    bgPicker.checked = false;
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
    document.getElementById("legend-component").style.opacity = "0.5";
    document.getElementById("fieldset-component").disabled = true;
    document.getElementById("foreground-component-text").style.opacity = "0.5";
    document.getElementById("foreground-component-text").style.cursor = "not-allowed";
    document.getElementById("background-component-text").style.opacity = "0.5";
    document.getElementById("background-component-text").style.cursor = "not-allowed";
    document.getElementById("color-sample-foreground").style.backgroundColor = "#F0F0F0";
    document.getElementById("color-sample-foreground").style.backgroundImage = "repeating-linear-gradient(45deg, transparent, transparent 15px, rgba(255,255,255,0.5) 3px, rgba(255,255,255,.5) 29px)";
    document.getElementById("color-sample-background").style.backgroundColor = "#F0F0F0";
    document.getElementById("color-sample-background").style.backgroundImage = "repeating-linear-gradient(45deg, transparent, transparent 15px, rgba(255,255,255,0.5) 3px, rgba(255,255,255,.5) 29px)";
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

function onValidRatio(tabResult) {
    setColorSamplesElements(tabResult);
    document.getElementById("valid-ratio").style.display = "block";
    setForegroundAndBackgroundValue(tabResult);
    if (tabResult[3] === "IMG") {
	document.getElementById("valid-contrast-alt-attribute").style.display = "block";
    }
}

function onLiveInvalidRatio(tabResult) {
    setColorSamplesElements(tabResult);
    document.getElementById("invalid-ratio").style.display = "block";
    setForegroundAndBackgroundValue(tabResult);
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
    ratio = tabResult[2];
}
function onBackgroundError(tabResult) {
    document.getElementById("background-error").style.display = "block";
    setForegroundAndDropBackground(tabResult);
}

function onChannelAlphaError(tabResult) {
    document.getElementById("channel-alpha").style.display = "block";
    dropForegroundAndBackgroundValue();
    element.textContent = "<" + tabResult[1].toLowerCase() + ">";
}

function setColorSamplesElements(tabResult) {
    document.getElementById("color-sample-foreground").style.backgroundColor = "#" + tabResult[0]
    ;
    document.getElementById("color-sample-foreground").style.backgroundImage = "none";
    document.getElementById("color-sample-background").style.backgroundColor = "#" + tabResult[1];
    document.getElementById("color-sample-background").style.backgroundImage = "none";
}

function setForegroundAndBackgroundValue(tabResult) {
    foreground.textContent = "#" + tabResult[0];
    background.textContent = "#" + tabResult[1];
    element.textContent = "<" + tabResult[3].toLowerCase() + ">";
}

function dropForegroundAndBackgroundValue() {
    foreground.textContent = "#------";
    background.textContent = "#------";
}

function setForegroundAndDropBackground(tabResult) {
    document.getElementById("color-sample-foreground").style.backgroundColor = "#" + tabResult[1];
    document.getElementById("color-sample-foreground").style.backgroundImage = "none";
    foreground.textContent = "#" + tabResult[1];
    background.textContent = "#------";
    element.textContent = "<" + tabResult[2].toLowerCase() + ">";
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