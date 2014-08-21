# This page contain all technical documentation to contribute

## Prerequisite

For a clearer understanding, please see the add-on SDK based documentation on the MDN [here](https://developer.mozilla.org/en-US/Add-ons/SDK).

## Extension modules

The "main" of the extension is in the main.js file (lib/main.js).

To communicate between each javascript file, it's necessary to use workers with port communication :
* worker.port.emit("EmitMsg", Data); --> To send some data using an emit message.
* worker.port.on("ReceiveMsg", function(optionalParameter) { } ); --> To listen a message and got some data.