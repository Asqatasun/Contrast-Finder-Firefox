var cm = require("sdk/context-menu");
var data = require("sdk/self").data;

cm.Menu({
    label: "Tanaguru Contrast-Finder",
    context: cm.URLContext("*"),
    contentScript: '',
    items: [
	cm.Item({label: "Improve foreground", contentScriptFile: data.url("contrast-finder.js"), data:"false"}),
	cm.Item({label: "Improve background", contentScriptFile: data.url("contrast-finder.js"), data:"true"})
    ]
});
