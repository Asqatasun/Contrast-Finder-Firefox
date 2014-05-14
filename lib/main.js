var { ToggleButton } = require("sdk/ui/button/toggle");
var cm = require("sdk/context-menu");
var array = require('sdk/util/array');
var data = require("sdk/self").data;
var tabs = require("sdk/tabs");
var self = require("sdk/self");
var workers = [];
var tabWorkers = [];
var selectionInProgressTabs=[];

function detachWorker(worker, workerArray) {
    var index = workerArray.indexOf(worker);
    if(index != -1) {
	workerArray.splice(index, 1);
    }
}

// set if the tabWorker is destroyed
var isDestroy = false;

var sidebar = require("sdk/ui/sidebar").Sidebar({
    id: 'my-sidebar',
    title: 'Tanaguru Contrast Finder',
    url: data.url("contrast-finder-module.html"),
    onAttach: function (worker) {
	worker.port.emit("lang");
	var tabWorker = null;
	workers.push(worker);
	tabs.on("open", function() {
	    worker.port.emit("stop-selector");
	});
	tabs.on("ready", function() {
	    worker.port.emit("stop-selector");
	});
	tabs.on("activate", function() {
	    var isCurrentTabHasSelectionInProgress = false;
	    for (var i=0;i<selectionInProgressTabs.length;i++){
		if (selectionInProgressTabs[i].tabId === tabs.activeTab.id) {
		    isCurrentTabHasSelectionInProgress = true;
		    break;
		}
	    }
	    if (isCurrentTabHasSelectionInProgress) {
		worker.port.emit("start-selector-button");
	    } else
		worker.port.emit("stop-selector")
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
	    var currentSelectionInProgressTab={};
	    currentSelectionInProgressTab.tabId=tabs.activeTab.id;
	    currentSelectionInProgressTab.tabWorker=tabWorker;
	    selectionInProgressTabs.push(currentSelectionInProgressTab);
	    tabWorker.port.emit("selector-checked");
	});
	worker.port.on("unchecked", function () {
	    for (var i=0;i<selectionInProgressTabs.length;i++){
		if (selectionInProgressTabs[i].tabId === tabs.activeTab.id) {
		    var currentTabWorker=selectionInProgressTabs[i].tabWorker;
		    selectionInProgressTabs.splice(i,1);
		    currentTabWorker.port.emit("selector-unchecked");  
		    currentTabWorker.destroy();
		    isDestroy = true;
		    break;
		}
	    }                                     
	    worker.port.emit("stop-selector");
	});
	worker.on('detach', function () {
	    if (isDestroy == false) {
		if (tabWorker !== null) {
		    tabWorker.port.emit("selector-unchecked");
		    tabWorker.destroy();
		    isDestroy = true;
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