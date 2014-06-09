function pickerRatio(worker, stringResult, lastContrastState, ratio)
{
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
    return tabResult[2];
}

function destroyWorker(isDestroy, isDestroyfgPicker, isDestroybgPicker,
		       tabWorker, tabfgPickerWorker, tabbgPickerWorker) {
    workerToDestroy(isDestroy, tabWorker, "selector-unchecked");
    workerToDestroy(isDestroyfgPicker, tabfgPickerWorker, "unchecked-picker");
    workerToDestroy(isDestroybgPicker, tabbgPickerWorker, "unchecked-picker");
}

function workerToDestroy(workerState, tabWorker, emitString) {
    if (workerState == false) {
	if (tabWorker !== null) {
	    tabWorker.port.emit(emitString);
	    tabWorker.destroy();
	    workerState = true;
	}
    }    
}


exports.pickerRatio = pickerRatio;
exports.destroyWorker = destroyWorker;