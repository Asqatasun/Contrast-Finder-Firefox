var foreground = document.getElementById("edit-box-foreground");
var background = document.getElementById("edit-box-background");
var wrongRatio = document.getElementById("on-invalid-ratio");
var selector = document.getElementById("selector");
var submit = document.getElementById("submit");
var label_button = document.getElementById("label-selector");
var backgroundIsTested = false;
var ratio;


selector.addEventListener("click", selectorFunc);

function selectorFunc() {
    if (selector.checked) {
	initializeHtmlElements();
	initializeColorSamplesElements();
	submit.href = "";
	addon.port.emit("checked");
    } else {
	addon.port.emit("unchecked");
    }
}

addon.port.on("live-components", function(tabResult) {
    initializeHtmlElements();
    initializeColorSamplesElements();

    if (tabResult === "background-error")
	onBackgroundError();
    else if (tabResult == "alpha-channel")
	onChannelAlphaError();
    else if (tabResult[2] == "valid-ratio")
	onValidRatio(tabResult);
    else
	onLiveInvalidRatio(tabResult);
});

addon.port.on("click-components", function(tabResult) {
    initializeHtmlElements();
    if (tabResult === "background-error") {
	onBackgroundError();
    } else if (tabResult == "alpha-channel") {
	onChannelAlphaError();
    } else if (tabResult[2] == "valid-ratio") {
	onValidRatio(tabResult);
    } else {
	onClickInvalidRatio(tabResult);
    }

    selector.checked = false;
    addon.port.emit("unchecked");
/*    foreground = document.getElementById("edit-box-foreground");
    background = document.getElementById("edit-box-background");*/
    component = backgroundIsTested;
    
    var openUrl = "http://contrast-finder.tanaguru.com/result.html?foreground=%23"
	+ foreground.innerHTML.replace("#", "") + "&background=%23" + background.innerHTML.replace("#", "")
	+ "&isBackgroundTested=" + backgroundIsTested + "&ratio= "
	+ ratio + "&algo=HSV";
    
    submit.href = openUrl;    
});

function initializeColorSamplesElements() {
    document.getElementById("color-sample-foreground").style.backgroundColor = "#F0F0F0";
    document.getElementById("color-sample-foreground").style.backgroundImage = "repeating-linear-gradient(45deg, transparent, transparent 15px, rgba(255,255,255,0.5) 3px, rgba(255,255,255,.5) 29px)";
    document.getElementById("color-sample-background").style.backgroundColor = "#F0F0F0";
    document.getElementById("color-sample-background").style.backgroundImage = "repeating-linear-gradient(45deg, transparent, transparent 15px, rgba(255,255,255,0.5) 3px, rgba(255,255,255,.5) 29px)";
}

function initializeHtmlElements() {
    document.getElementById("on-invalid-ratio").style.display = "none";
    document.getElementById("background-error").style.display = "none";
    document.getElementById("invalid-ratio").style.display = "none";
    document.getElementById("channel-alpha").style.display = "none";
    document.getElementById("valid-ratio").style.display = "none";
}

function onValidRatio(tabResult) {
    setColorSamplesElements(tabResult);
    document.getElementById("valid-ratio").style.display = "block";
    setForegroundAndBackgroundValue(tabResult);
}

function onLiveInvalidRatio(tabResult) {
    setColorSamplesElements(tabResult);
    document.getElementById("invalid-ratio").style.display = "block";
    setForegroundAndBackgroundValue(tabResult);
}

function onClickInvalidRatio(tabResult) {
    document.getElementById("invalid-ratio").style.display = "block";
    setForegroundAndBackgroundValue(tabResult);
    document.getElementById("on-invalid-ratio").style.display = "block";
    ratio = tabResult[2];
}
function onBackgroundError() {
    document.getElementById("background-error").style.display = "block";
    dropForegroundAndBackgroundValue();
}

function onChannelAlphaError() {
    document.getElementById("channel-alpha").style.display = "block";
    dropForegroundAndBackgroundValue();
}

function setColorSamplesElements(tabResult) {
    document.getElementById("color-sample-foreground").style.backgroundColor = "#" + tabResult[0]
    ;
    document.getElementById("color-sample-foreground").style.backgroundImage = "none";
    document.getElementById("color-sample-background").style.backgroundColor = "#" + tabResult[1];
    document.getElementById("color-sample-background").style.backgroundImage = "none";
}

function setForegroundAndBackgroundValue(tabResult) {
    foreground.innerHTML = "#" + tabResult[0];
    background.innerHTML = "#" + tabResult[1];
}

function dropForegroundAndBackgroundValue() {
    foreground.innerHTML = "#------";
    background.innerHTML = "#------";
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