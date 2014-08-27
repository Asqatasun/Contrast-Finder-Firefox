# This page contain all technical documentation to contribute

## Prerequisite

For a clearer understanding, please see the [add-on SDK based documentation on the MDN](https://developer.mozilla.org/en-US/Add-ons/SDK).

## Extension modules

### The main module

The "main" module of the extension is in the main.js files (lib/main.js).

To communicate between each javascript file, it's necessary to use workers with port communication :<br/><br/>
* To send some data using an emit message :
```javascript
worker.port.emit("myMessage", data);
```
* To listen a message and use the function code (optionalParameter = data) :
```javascript
worker.port.on("myMessage", function(data) { 
   //code here 
});
```

The main module call several javascript file :
* The data/js/contrast-finder.js script to redirect the user to contrast-finder.tanaguru.com if the contrast is not valid, else it shows an alertbox with a message.
* The data/js/cm-sidebar-label.js script that send a simple message to open or close the sidebar.
* The data/js/contrast-finder-module.js script when the user use click on the element selector. 
* The data/js/picker-module.js script is called when the user click either on the foreground or the background picker button.

### The interface module

The extension's UI is a sidebar. Its code is wrote in one HTML file (data/contrast-finder-module.html). The interface is design with CSS, all CSS files to design the sidebar are available in data/css/ folder.<br/>
The interface listen and send messages to the main script using the data/js/form.js file. When an event is catched, the form.js file modify the sidebar DOM (for the UI) and send message to the main script.

