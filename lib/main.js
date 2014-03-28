var cm = require("sdk/context-menu");
var data = require("sdk/self").data;

cm.Menu({
    label: "Verify with Tanaguru Contrast Finder",
    context: cm.URLContext("*"),
    contentScript: '',
    items: [
	cm.Item({label: "I want to modify the foreground", contentScriptFile: data.url("contrast-finder.js"), data:"false"}),
	cm.Item({label: "I want to modify the background", contentScriptFile: data.url("contrast-finder.js"), data:"true"})
    ]
});