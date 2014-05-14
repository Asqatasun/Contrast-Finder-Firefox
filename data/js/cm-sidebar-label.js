self.on("click", function (node, data) {
    console.log(data);
    self.postMessage("openSidebar");
});