var cm = require("sdk/context-menu");
var array = require('sdk/util/array');
var data = require("sdk/self").data;
var tabs = require("sdk/tabs");
var self = require("sdk/self");
var workers = [];

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
	var tabWorker = null;
	workers.push(worker);
	tabs.on("open", function() {
	    worker.port.emit("stop-selector");
	});
	tabs.on("ready", function() {
	    worker.port.emit("stop-selector");
	});
	worker.port.on('checked', function() {
	    tabWorker = tabs.activeTab.attach({
		contentScriptFile: data.url("js/contrast-finder-module.js")
	    });
	    tabWorker.port.on("over-refresh", function(tabResult) {
		worker.port.emit("live-components", tabResult);
	    });
	    tabWorker.port.on("click-refresh", function(tabResult) {
		worker.port.emit("click-components", tabResult);
	    });
	    tabWorker.port.emit("selector-checked");
	    isDestroy = false;
	});
	worker.port.on("unchecked", function () {
	    if (tabWorker !== null) {
		tabWorker.port.emit("selector-unchecked");
		tabWorker.destroy();
		isDestroy = true;
	    }
	    worker.port.emit("stop-selector");
	});
	worker.on('detach', function () {
	    if (isDestroy == false) {
		if (tabWorker !== null) {
		    tabWorker.port.emit("selector-unchecked");
		    tabWorker.destroy();
		}
	    }
	    detachWorker(this, workers);
	});
    }
});					    
 
// Create a widget, and attach the sidebar to it, so the sidebar is
// shown when the user clicks the widget.
var my_widget = require("sdk/widget").Widget({
    label: "Contrast-Finder",
    id: "contrast-finder-module",
    contentURL: data.url("images/favicon.ico"),
    onClick: function() {
    	sidebar.show();
    }
});

cm.Menu({
    label: "Tanaguru Contrast-Finder",
    context: cm.URLContext("*"),
    contentScript: '',
    items: [
	cm.Item({label: "Improve foreground", contentScriptFile: data.url("js/contrast-finder.js"), data:"false"}),
	cm.Item({label: "Improve background", contentScriptFile: data.url("js/contrast-finder.js"), data:"true"})
    ]
});