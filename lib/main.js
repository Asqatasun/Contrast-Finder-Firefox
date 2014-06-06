var windowUtils = require('sdk/window/utils');
var chromewin = windowUtils.getMostRecentBrowserWindow();
var tabUtils = require('sdk/tabs/utils');
var tab = tabUtils.getActiveTab(chromewin);
chromewin = tab.linkedBrowser.contentWindow;

var { ToggleButton } = require("sdk/ui/button/toggle");
var cm = require("sdk/context-menu");
var array = require('sdk/util/array');
var data = require("sdk/self").data;
var tabs = require("sdk/tabs");
var self = require("sdk/self");
var color = require("./color-utils.js");
var ratio = require("./ratio-utils.js");

var workers = [];
var fgPickerInProgressTabs = [];
var bgPickerInProgressTabs = [];
var selectionInProgressTabs= [];

function detachWorker(worker, workerArray) {
    var index = workerArray.indexOf(worker);
    if(index != -1) {
	workerArray.splice(index, 1);
    }
}

// set if the tabWorker is destroyed
var isDestroy = false;
var isDestroyfgPicker = false;
var isDestroybgPicker = false;

var lastContrastState = null;
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
	    chromewin = windowUtils.getMostRecentBrowserWindow();
	    tab = tabUtils.getActiveTab(chromewin);
	    chromewin = tab.linkedBrowser.contentWindow;
	    worker.port.emit("stop-selector");
	    worker.port.emit("stop-fgPicker");
	    worker.port.emit("stop-bgPicker");
	});
	tabs.on("ready", function() {
	    chromewin = windowUtils.getMostRecentBrowserWindow();
	    tab = tabUtils.getActiveTab(chromewin);
	    chromewin = tab.linkedBrowser.contentWindow;
	    worker.port.emit("stop-selector");
	    worker.port.emit("stop-fgPicker");
	    worker.port.emit("stop-bgPicker");
	});
	tabs.on("activate", function() {
	    chromewin = windowUtils.getMostRecentBrowserWindow();
	    tab = tabUtils.getActiveTab(chromewin);
	    chromewin = tab.linkedBrowser.contentWindow;
	    stateButton(worker);
	});
	worker.port.on("picker-ratio", function(stringResult) {
	    var tabResult = stringResult.split(";");
	    tabResult[5] = "PICKER";
	    var isValidRatio = ratio.isValidRatio(tabResult[0], tabResult[1], tabResult[3]);
	    if (isValidRatio)
		tabResult[2] = "valid-ratio";
	    else
		tabResult[2] = "invalid-ratio";
	    if (tabResult[4] === "CLICK")
		worker.port.emit("click-components", tabResult);
	    else if ((lastContrastState == null || lastContrastState !== tabResult[2])
		     && tabResult[4] === "LIVE")
		worker.port.emit("live-components", tabResult);
	    lastContrastState = tabResult[2];
	});
	worker.port.on('fgPicker-checked', function() {
	    lastContrastState = null;
	    isDestroyfgPicker = false;
	    tabfgPickerWorker = tabs.activeTab.attach({
		contentScriptFile: data.url("js/picker-module.js")
	    });
	    tabfgPickerWorker.port.on('picker', function(positionTab) {
		var data = color.getCanvasColor(positionTab, chromewin);
		worker.port.emit("live-components-fgPicker", color.rgbToHex(data[0], data[1], data[2]).toUpperCase());
	    });
	    tabfgPickerWorker.port.on("picker-click", function() {
		worker.port.emit("stop-fgPicker-click");
	    });
	    currentActionInProgressTab(tabfgPickerWorker, fgPickerInProgressTabs, "checked-picker");
	});
	worker.port.on('bgPicker-checked', function() {
	    lastContrastState = null;
	    isDestroybgPicker = false;
	    tabbgPickerWorker = tabs.activeTab.attach({
		contentScriptFile: data.url("js/picker-module.js")
	    });
	    tabbgPickerWorker.port.on('picker', function(positionTab) {
		var data = color.getCanvasColor(positionTab, chromewin);
		worker.port.emit("live-components-bgPicker", color.rgbToHex(data[0], data[1], data[2]).toUpperCase());
	    });
	    tabbgPickerWorker.port.on('picker-click', function() {
		worker.port.emit("stop-bgPicker-click");
	    });
	    currentActionInProgressTab(tabbgPickerWorker, bgPickerInProgressTabs, "checked-picker");
	});
	worker.port.on('fgPicker-unchecked', function() {
	    isDestroyfgPicker = destroyTabWorker(worker,
					       fgPickerInProgressTabs,
					       "unchecked-picker",
					       "stop-fgPicker");
	});
	worker.port.on('bgPicker-unchecked', function() {
	    isDestroybgPicker = destroyTabWorker(worker,
					       bgPickerInProgressTabs,
					       "unchecked-picker",
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
	    button.state("window", {
		checked: false
	    });
	    if (isDestroy == false) {
		if (tabWorker !== null) {
		    tabWorker.port.emit("selector-unchecked");
		    tabWorker.destroy();
		    isDestroy = true;
		}
	    }
	    if (isDestroyfgPicker == false) {
		if (tabfgPickerWorker !== null) {
		    tabfgPickerWorker.port.emit("unchecked-picker");
		    tabfgPickerWorker.destroy();
		    isDestroyfgPicker = true;
		}
	    }
	    if (isDestroybgPicker == false) {
		if (tabbgPickerWorker !== null) {
		    tabbgPickerWorker.port.emit("unchecked-picker");
		    tabbgPickerWorker.destroy();
		    isDestroybgPicker = true;
		}
	    }
	    detachWorker(this, workers);
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
	    worker.port.emit(stopButtonEmit);  
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