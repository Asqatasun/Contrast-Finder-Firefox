# This page contain all technical documentation to contribute

## Prerequisite

For a clearer understanding, please see the [add-on SDK based documentation on the MDN](https://developer.mozilla.org/en-US/Add-ons/SDK).

## Extension modules

The "main" of the extension is in the main.js file (lib/main.js).

To communicate between each javascript file, it's necessary to use workers with port communication :
* worker.port.emit("emitMsg", data);<br/> 
    --> To send some data using an emit message.
* worker.port.on("receiveMsg", function(optionalParameter) { } ); <br/>
    --> To listen a message and use the function code (optionalParameter = data).