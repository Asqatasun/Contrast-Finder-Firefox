var foreground = document.getElementById("edit-box-foreground");
var background = document.getElementById("edit-box-background");
var ratio = document.getElementById("select-box-ratio");
var component = document.getElementById("select-box-component");
var sumbit = document.getElementById("submit-button");
var selector = document.getElementById("selector");


selector.addEventListener("click", selectorFunc);

function selectorFunc() {
    if (selector.checked) {
	document.getElementById("background-error").style.display = "none";
	document.getElementById("channel-alpha").style.display = "none";
	addon.port.emit("checked");
    } else {
	addon.port.emit("unchecked");
    }
}

addon.port.on("live-components", function(tabResult) {
    document.getElementById("background-error").style.display = "none";
    document.getElementById("channel-alpha").style.display = "none";
    if(tabResult === "background-error") {
	document.getElementById("background-error").style.display = "block";
	foreground.value = "";
	background.value = "";
	ratio.selectedIndex = 0;
    } else if (tabResult == "alpha-channel") {
	document.getElementById("channel-alpha").style.display = "block";
	foreground.value = "";
	background.value = "";
	ratio.selectedIndex = 0;	
    } else {
	foreground.value = tabResult[0];
	background.value = tabResult[1];
	ratio.selectedIndex = tabResult[2];
    }
});

addon.port.on("click-components", function(tabResult) {
    document.getElementById("background-error").style.display = "none";
    document.getElementById("channel-alpha").style.display = "none";
    if(tabResult === "background-error") {
	document.getElementById("background-error").style.display = "block";
	foreground.value = "";
	background.value = "";
	ratio.selectedIndex = 0;
    } else if (tabResult == "alpha-channel") {
	document.getElementById("channel-alpha").style.display = "block";
	foreground.value = "";
	background.value = "";
	ratio.selectedIndex = 0;
    } else {
	foreground.value = tabResult[0];
	background.value = tabResult[1];
	ratio.selectedIndex = tabResult[2];
    }
    selector.checked = false;
    addon.port.emit("unchecked");
});

addon.port.on("stop-selector", function() {
    selector.checked = false;
});

document.forms["formulaire"].onsubmit = function() {
    foreground = document.getElementById("edit-box-foreground");
    background = document.getElementById("edit-box-background");
    ratio = document.getElementById("select-box-ratio");
    component = document.getElementById("select-box-component");

    var algo1 = document.getElementById("algo1");
    var algo = "HSV";
    if (algo1.checked != true) {
	algo = "Rgb"
    }

    var backgroundIsTested = false;
    if (component.value == "background") {
	backgroundIsTested = true;
    }

    var openUrl = "http://contrast-finder.tanaguru.com/result.html?foreground=%23" + foreground.value + "&background=%23" + background.value + "&isBackgroundTested=" + backgroundIsTested + "&ratio=" + ratio.value + "&algo=" + algo;

    selector.checked = false;
    addon.port.emit("contrast-finder-get-url", openUrl);
}
