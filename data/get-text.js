var foreground = document.getElementById("edit-box-foreground");
var background = document.getElementById("edit-box-background");
var component = document.getElementById("select-box-component");
var selector = document.getElementById("selector");
var submit = document.getElementById("submit");
var label_button = document.getElementById("label-selector");
var ratio;

selector.addEventListener("click", selectorFunc);

function selectorFunc() {
    if (selector.checked) {
	document.getElementById("background-error").style.display = "none";
	document.getElementById("channel-alpha").style.display = "none";
	document.getElementById("valid-ratio").style.display = "none";
	label_button.className = "selector-button-clicked";
	submit.className = "btn btn-primary btn-lg disabled";
	submit.href = "#";
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
	submit.className = "btn btn-primary btn-lg";
	foreground.value = tabResult[0];
	background.value = tabResult[1];
	ratio = tabResult[2];
    }
    selector.checked = false;
    addon.port.emit("unchecked");

    foreground = document.getElementById("edit-box-foreground");
    background = document.getElementById("edit-box-background");
    component = document.getElementById("background-component");
    
    var backgroundIsTested = false;
    if (component.checked === true) {
	backgroundIsTested = true;
    }
    
    var openUrl = "http://contrast-finder.tanaguru.com/result.html?foreground=%23" + foreground.value + "&background=%23" + background.value + "&isBackgroundTested=" + backgroundIsTested + "&ratio= " + ratio + "&algo=HSV";
    
    submit.href = openUrl;

});

addon.port.on("stop-selector", function() {
    selector.checked = false;
    label_button.className = "selector-button";
});