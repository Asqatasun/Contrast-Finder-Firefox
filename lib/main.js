var windowUtils = require('sdk/window/utils');
var chromewin = windowUtils.getMostRecentBrowserWindow();
var tabUtils = require('sdk/tabs/utils');
var tab = tabUtils.getActiveTab(chromewin);
chromewin = tab.linkedBrowser.contentWindow;

var { Hotkey } = require("sdk/hotkeys");
var { ToggleButton } = require("sdk/ui/button/toggle");
var cm = require("sdk/context-menu");
var array = require('sdk/util/array');
var data = require("sdk/self").data;
var windows = require("sdk/windows").browserWindows;
var tabs = require("sdk/tabs");
var self = require("sdk/self");
var color = require("./utils/color-utils.js");
var ratio = require("./utils/ratio-utils.js");
var tabFunc = require("./sidebar/tabs.js");
var pickerFunc = require("./sidebar/picker.js");
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

var isDestroy = true;
var isDestroyfgPicker = true;
var isDestroybgPicker = true;

var lastContrastState = null;
var sidebar = require("sdk/ui/sidebar").Sidebar({
    id: 'my-sidebar',
    title: 'Asqatasun Contrast Finder',
    url: data.url("contrast-finder-module.html"),
    onAttach: function (worker) {
	button.state("window", { checked: true });
	worker.port.emit("lang");
	var tabWorker = null;
	var tabfgPickerWorker = null;
	var tabbgPickerWorker = null;
	workers.push(worker);
	tabs.on("open", function() { onOpenAndReadyTab(worker); });
	tabs.on("ready", function() { onOpenAndReadyTab(worker); });
	tabs.on("activate", function() { onActivateTab(worker); });
	worker.port.on("picker-ratio", function(stringResult) {
	    lastContrastState = pickerFunc.pickerRatio(worker, stringResult,
						       lastContrastState, ratio);
	});
	worker.port.on('fgPicker-checked', function() {
	    isDestroyfgPicker = false;
	    initializeOnChecked();
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
	    isDestroybgPicker = false;
	    initializeOnChecked();
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
	    if (windows.activeWindow) {
		button.state("window", { checked: false });
		pickerFunc.destroyWorker(isDestroy, isDestroyfgPicker, isDestroybgPicker,
					 tabWorker, tabfgPickerWorker, tabbgPickerWorker);
	    }
	    detachWorker(this, workers);
	});
    }
});					    

var sidebarState = "Close";
var button = ToggleButton({
    id: "contrast-finder-module",
    label: "Contrast-Finder",
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

var showHotKey = Hotkey({
    combo: "alt-shift-c",
    onPress: function() {
    	button.click();
    }
});

cm.Menu({
    label: "Contrast-Finder",
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
	cm.Item({label: "Contrast-Finder website",
		 contentScript: 'self.on("click", function () {' +
                 '  self.postMessage(null);' +
                 '});',
		 onMessage: function (msg) {
		     tabs.activeTab.attach({
			 contentScript:
			 'window.location.href="https://app.contrast-finder.org"'
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

function initializeOnChecked() {
    lastContrastState = null;
}

function onActivateTab(worker) {
    updateWindowSetting();
    tabFunc.stateButton(
	worker,
	selectionInProgressTabs,
	fgPickerInProgressTabs,
	bgPickerInProgressTabs,
	tabs);
}

function onOpenAndReadyTab(worker) {
    updateWindowSetting();
    tabFunc.emitStopMessages(worker);
}

function updateWindowSetting() {
    chromewin = windowUtils.getMostRecentBrowserWindow();
    tab = tabUtils.getActiveTab(chromewin);
    chromewin = tab.linkedBrowser.contentWindow;
}