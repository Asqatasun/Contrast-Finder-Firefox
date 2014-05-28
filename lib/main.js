var { ToggleButton } = require("sdk/ui/button/toggle");
var chromewin = require('sdk/window/utils').getMostRecentBrowserWindow();
var tab = require('sdk/tabs/utils').getActiveTab(chromewin);
chromewin = tab.linkedBrowser.contentWindow;
var cm = require("sdk/context-menu");
var array = require('sdk/util/array');
var data = require("sdk/self").data;
var tabs = require("sdk/tabs");
var self = require("sdk/self");
var workers = [];
var fgPickerInProgressTabs = [];
var bgPickerInProgressTabs = [];
var selectionInProgressTabs=[];

function detachWorker(worker, workerArray) {
    var index = workerArray.indexOf(worker);
    if(index != -1) {
	workerArray.splice(index, 1);
    }
}

// set if the tabWorker is destroyed
var isDestroy = false;
var isDestroyPicker = false;

var sidebar = require("sdk/ui/sidebar").Sidebar({
    id: 'my-sidebar',
    title: 'Tanaguru Contrast Finder',
    url: data.url("contrast-finder-module.html"),
    onAttach: function (worker) {
	worker.port.emit("lang");
	var tabWorker = null;
	var tabfgPickerWorker = null;
	var tabbgPickerWorker = null;
	workers.push(worker);
	tabs.on("open", function() {
	    worker.port.emit("stop-selector");
	    worker.port.emit("stop-fgPicker");
	    worker.port.emit("stop-bgPicker");
	});
	tabs.on("ready", function() {
	    worker.port.emit("stop-selector");
	    worker.port.emit("stop-fgPicker");
	    worker.port.emit("stop-bgPicker");
	});
	tabs.on("activate", function() {
	    stateButton(worker);
	});
	worker.port.on('fgPicker-checked', function() {
	    tabfgPickerWorker = tabs.activeTab.attach({
		contentScriptFile: data.url("js/picker-module.js")
	    });
	    tabfgPickerWorker.port.on('picker', function(positionTab) {
		var data = getCanvasColor(positionTab);
		worker.port.emit("live-components-fgPicker", rgbToHex(data[0], data[1], data[2]));
	    });
	    tabfgPickerWorker.port.on("click-picker-foreground", function(fgColor) {
		worker.port.emit("picker-click-foreground", fgColor);
	    });
	    tabfgPickerWorker.port.on("picker-click", function() {
		worker.port.emit("stop-fgPicker-click");
	    });
	    currentActionInProgressTab(tabfgPickerWorker, fgPickerInProgressTabs, "checked-picker");
	});
	worker.port.on('bgPicker-checked', function() {
	    console.log("bg picker click");
	    tabbgPickerWorker = tabs.activeTab.attach({
		contentScriptFile: data.url("js/picker-module.js")
	    });
	    tabbgPickerWorker.port.on('picker', function(positionTab) {
		var data = getCanvasColor(positionTab);
		worker.port.emit("live-components-bgPicker", rgbToHex(data[0], data[1], data[2]));
	    });
	    tabbgPickerWorker.port.on('click-picker-background', function(bgColor) {
		worker.port.emit('picker-click-background', bgColor);
	    });
	    tabbgPickerWorker.port.on('picker-click', function() {
		worker.port.emit("stop-bgPicker-click");
	    });
	    currentActionInProgressTab(tabbgPickerWorker, bgPickerInProgressTabs, "checked-picker");
	});
	worker.port.on('fgPicker-unchecked', function() {
	    isDestroyPicker = destroyTabWorker(worker,
					       fgPickerInProgressTabs,
					       "picker-unchecked",
					       "stop-fgPicker");
	});
	worker.port.on('bgPicker-unchecked', function() {
	    isDestroyPicker = destroyTabWorker(worker,
					       bgPickerInProgressTabs,
					       "picker-unchecked",
					       "stop-bgPicker");
	});
	worker.port.on('checked', function() {
	    isDestroy = false;
	    tabWorker = tabs.activeTab.attach({
		contentScriptFile: data.url("js/contrast-finder-module.js")
	    });
	    tabWorker.port.on("over-refresh", function(tabResult) {
		worker.port.emit("live-components", tabResult);
	    });
	    tabWorker.port.on("click-refresh", function(tabResult) {
		worker.port.emit("click-components", tabResult);
	    });
	    currentActionInProgressTab(tabWorker, selectionInProgressTabs, "selector-checked");
	});
	worker.port.on("unchecked", function() {
	    isDestroy = destroyTabWorker(worker,
					 selectionInProgressTabs,
					 "selector-unchecked",
					 "stop-selector");
	});
	worker.on('detach', function () {
	    if (isDestroy == false) {
		if (tabWorker !== null) {
		    tabWorker.port.emit("selector-unchecked");
		    tabWorker.destroy();
		    isDestroy = true;
		}
	    }
	    if (isDestroyPicker == false) {
		if (tabfgPickerWorker !== null) {
		    tabfgPickerWorker.port.emit("picker-unchecked");
		    tabfgPickerWorker.destroy();
		    isDestroyPicker = true;
		}
	    }
	    detachWorker(this, workers);
	    button.state("window", {
		checked: false
	    });
	});
    }
});					    

var sidebarState = "Close";
var button = ToggleButton({
    id: "contrast-finder-module",
    label: "Tanaguru Contrast-Finder",
    icon: {
	"16": data.url("images/icon-16.png"),
	"32": data.url("images/icon-32.png"),
	"64": data.url("images/icon-64.png")
    },
    onClick: function(state) {
	if (state.checked) {
    	    sidebar.show();
	    sidebarState = "Close";
	}
	else {
	    sidebar.hide();
	    sidebarState = "Open";
	}
    }
});

cm.Menu({
    label: "Tanaguru Contrast-Finder",
    context: cm.URLContext("*"),
    contentScript: '',
    items: [
	cm.Item({label: "Improve foreground", contentScriptFile: data.url("js/contrast-finder.js"), data:"false"}),
	cm.Item({label: "Improve background", contentScriptFile: data.url("js/contrast-finder.js"), data:"true"}),
	cm.Separator(),
	cm.Item({label: "Open / Close sidebar",
		 contentScriptFile: data.url("js/cm-sidebar-label.js"),
		 onMessage: function (msg) {
		     button.click();
		 }
		}),
	cm.Separator(),
	cm.Item({label: "Tanaguru Contrast-Finder website", 
		 contentScript: 'self.on("click", function () {' +
                 '  self.postMessage(null);' +
                 '});',
		 onMessage: function (msg) {
		     tabs.activeTab.attach({
			 contentScript:
			 'window.location.href="http://contrast-finder.tanaguru.com"'
		     })
		 }
		}),
    ]});

function currentActionInProgressTab(tabElementWorker, progressTabs, checkedEmit) {
    var currentActionInProgressTab={};
    currentActionInProgressTab.tabId=tabs.activeTab.id;
    currentActionInProgressTab.tabWorker=tabElementWorker;
    progressTabs.push(currentActionInProgressTab);
    tabElementWorker.port.emit(checkedEmit);
}

function destroyTabWorker(worker, progressTabs, uncheckedEmit, stopButtonEmit) {
    for (var i=0;i<progressTabs.length;i++){
	if (progressTabs[i].tabId === tabs.activeTab.id) {
	    var currentTabWorker=progressTabs[i].tabWorker;
	    progressTabs.splice(i,1);
	    currentTabWorker.port.emit(uncheckedEmit);  
	    currentTabWorker.destroy();
	    return true;
	}
    }                                     
    worker.port.emit(stopButtonEmit);
}

function stateButton(worker) {
    var isCurrentTabHasSelectionInProgress = getStateProgressTab(selectionInProgressTabs);
    var isCurrentTabHasfgPickerInProgress = getStateProgressTab(fgPickerInProgressTabs);
    var isCurrentTabHasbgPickerInProgress = getStateProgressTab(bgPickerInProgressTabs);
    emitButtonState(worker,
		    isCurrentTabHasSelectionInProgress,
		    "start-selector-button",
		    "stop-selector");
    emitButtonState(worker,
		    isCurrentTabHasfgPickerInProgress,
		    "start-fgPicker-button",
		    "stop-fgPicker");
    emitButtonState(worker,
		    isCurrentTabHasbgPickerInProgress,
		    "start-bgPicker-button",
		    "stop-bgPicker");
}

function emitButtonState(worker, isTabInProgress, emitStringStart, emitStringStop) {
    if (isTabInProgress)
	worker.port.emit(emitStringStart);
    else
	worker.port.emit(emitStringStop)
}

function getStateProgressTab(progressTab) {
    for (var i=0;i<progressTab.length;i++){
	if (progressTab[i].tabId === tabs.activeTab.id) {
	    return true;
	}
    }
    return false;
}

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
function getCanvasColor(positionTab) {
    var canvas = chromewin.document.createElementNS('http://www.w3.org/1999/xhtml',
						    'canvas');
    canvas.width = 1;
    canvas.height = 1;
    var context = canvas.getContext("2d");
    context.drawWindow(chromewin, positionTab[0], positionTab[1], 1, 1, "white");
    return context.getImageData(0, 0, 1, 1).data;
}