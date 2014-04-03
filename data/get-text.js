var foreground = document.getElementById("edit-box-foreground");
var background = document.getElementById("edit-box-background");
var component = document.getElementById("");
var selector = document.getElementById("selector");
var submit = document.getElementById("submit");
var label_button = document.getElementById("label-selector");
var backgroundIsTested = false;
var ratio;


selector.addEventListener("click", selectorFunc);

function selectorFunc() {
    if (selector.checked) {
	document.getElementById("background-error").style.display = "none";
	document.getElementById("channel-alpha").style.display = "none";
	document.getElementById("valid-ratio").style.display = "none";
	document.getElementById("fieldset-component").disabled = true;
	document.getElementById("legend-component").style.opacity = "0.5";
	label_button.className = "selector-button-clicked";
	submit.className = "btn btn-primary btn-lg disabled";
	submit.href = "";
	addon.port.emit("checked");
    } else {
	addon.port.emit("unchecked");
    }
}

addon.port.on("live-components", function(tabResult) {
    document.getElementById("background-error").style.display = "none";
    document.getElementById("channel-alpha").style.display = "none";
    document.getElementById("valid-ratio").style.display = "none";
    if(tabResult === "background-error") {
	document.getElementById("background-error").style.display = "block";
	foreground.value = "";
	background.value = "";
    } else if (tabResult == "alpha-channel") {
	document.getElementById("channel-alpha").style.display = "block";
	foreground.value = "";
	background.value = "";
    } else {
	foreground.value = tabResult[0];
	background.value = tabResult[1];
    }
});

addon.port.on("click-components", function(tabResult) {
    document.getElementById("background-error").style.display = "none";
    document.getElementById("channel-alpha").style.display = "none";
    document.getElementById("valid-ratio").style.display = "none";
    document.getElementById("fieldset-component").disabled = true;
    document.getElementById("legend-component").style.opacity = "0.5";
    label_button.className = "selector-button";
    if(tabResult === "background-error") {
	document.getElementById("background-error").style.display = "block";
	foreground.value = "";
	background.value = "";
    } else if (tabResult == "alpha-channel") {
	document.getElementById("channel-alpha").style.display = "block";
	foreground.value = "";
	background.value = "";
    } else if (tabResult[2] == "valid-ratio") {
	document.getElementById("valid-ratio").style.display = "block";
	foreground.value = tabResult[0];
	background.value = tabResult[1];
    } else {
	document.getElementById("fieldset-component").disabled = false;
	document.getElementById("legend-component").style.opacity = "1";
	submit.className = "btn btn-primary btn-lg";
	foreground.value = tabResult[0];
	background.value = tabResult[1];
	ratio = tabResult[2];
    }
    selector.checked = false;
    addon.port.emit("unchecked");

    foreground = document.getElementById("edit-box-foreground");
    background = document.getElementById("edit-box-background");
    component = backgroundIsTested;
    
    var openUrl = "http://contrast-finder.tanaguru.com/result.html?foreground=%23" + foreground.value + "&background=%23" + background.value + "&isBackgroundTested=" + backgroundIsTested + "&ratio= " + ratio + "&algo=HSV";
    
    submit.href = openUrl;
    
});

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
    label_button.className = "selector-button";
});