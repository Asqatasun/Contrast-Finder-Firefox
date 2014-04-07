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
	submit.className = "btn btn-primary btn-lg disabled";
	document.getElementById("color-sample-foreground").style.backgroundColor = "#F0F0F0";
	document.getElementById("color-sample-foreground").style.backgroundImage = "repeating-linear-gradient(45deg, transparent, transparent 15px, rgba(255,255,255,0.5) 3px, rgba(255,255,255,.5) 29px)";
	document.getElementById("color-sample-background").style.backgroundColor = "#F0F0F0";
	document.getElementById("color-sample-background").style.backgroundImage = "repeating-linear-gradient(45deg, transparent, transparent 15px, rgba(255,255,255,0.5) 3px, rgba(255,255,255,.5) 29px)";
	submit.href = "";
	addon.port.emit("checked");
    } else {
	addon.port.emit("unchecked");
    }
}

addon.port.on("live-components", function(tabResult) {
    document.getElementById("on-invalid-ratio").style.display = "none";
    document.getElementById("background-error").style.display = "none";
    document.getElementById("color-sample-foreground").style.backgroundColor = "#F0F0F0";
    document.getElementById("color-sample-foreground").style.backgroundImage = "repeating-linear-gradient(45deg, transparent, transparent 15px, rgba(255,255,255,0.5) 3px, rgba(255,255,255,.5) 29px)";
    document.getElementById("color-sample-background").style.backgroundColor = "#F0F0F0";
    document.getElementById("color-sample-background").style.backgroundImage = "repeating-linear-gradient(45deg, transparent, transparent 15px, rgba(255,255,255,0.5) 3px, rgba(255,255,255,.5) 29px)";
    document.getElementById("channel-alpha").style.display = "none";
    document.getElementById("valid-ratio").style.display = "none";
    
    if(tabResult === "background-error") {
	onBackgroundError();
	foreground.innerHTML = "#------";
	background.innerHTML = "#------";
    } else if (tabResult == "alpha-channel") {
	onChannelAlphaError();
	foreground.innerHTML = "#------";
	background.innerHTML = "#------";
    } else {
	document.getElementById("color-sample-foreground").style.backgroundColor = "#" + tabResult[0]
;
	document.getElementById("color-sample-foreground").style.backgroundImage = "none";
	document.getElementById("color-sample-background").style.backgroundColor = "#" + tabResult[1];
	document.getElementById("color-sample-background").style.backgroundImage = "none";
	foreground.innerHTML = "#" + tabResult[0];
	background.innerHTML = "#" + tabResult[1];
    }
});

addon.port.on("click-components", function(tabResult) {
    initializeHtmlElements();
    if(tabResult === "background-error") {
	onBackgroundError();
    } else if (tabResult == "alpha-channel") {
	onChannelAlphaError();
    } else if (tabResult[2] == "valid-ratio") {
	document.getElementById("valid-ratio").style.display = "block";
	foreground.innerHTML = "#" + tabResult[0];
	background.innerHTML = "#" + tabResult[1];
    } else {
	onInvalidRatio();
	foreground.innerHTML = "#" + tabResult[0];
	background.innerHTML = "#" + tabResult[1];
	ratio = tabResult[2];
    }
    selector.checked = false;
    addon.port.emit("unchecked");

    foreground = document.getElementById("edit-box-foreground");
    background = document.getElementById("edit-box-background");
    component = backgroundIsTested;
    
    var openUrl = "http://contrast-finder.tanaguru.com/result.html?foreground=%23"
	+ foreground.innerHTML.replace("#", "") + "&background=%23" + background.innerHTML.replace("#", "")
	+ "&isBackgroundTested=" + backgroundIsTested + "&ratio= "
	+ ratio + "&algo=HSV";
    
    submit.href = openUrl;    
});


function initializeHtmlElements() {
    document.getElementById("on-invalid-ratio").style.display = "none";
    document.getElementById("background-error").style.display = "none";
    document.getElementById("invalid-ratio").style.display = "none";
    document.getElementById("channel-alpha").style.display = "none";
    document.getElementById("valid-ratio").style.display = "none";
    document.getElementById("fieldset-component").disabled = true;
    document.getElementById("legend-component").style.opacity = "0.5";
}

function onInvalidRatio() {
    document.getElementById("on-invalid-ratio").style.display = "block";
    document.getElementById("invalid-ratio").style.display = "block";
    document.getElementById("fieldset-component").disabled = false;
    document.getElementById("legend-component").style.opacity = "1";
    submit.className = "btn btn-primary btn-lg";
}

function onBackgroundError() {
    document.getElementById("background-error").style.display = "block";
    dropForegroundAndBackgroundValue();
}

function onChannelAlphaError() {
    document.getElementById("channel-alpha").style.display = "block";
    dropForegroundAndBackgroundValue();
}

function dropForegroundAndBackgroundValue() {
    foreground.value = "";
    background.value = "";
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