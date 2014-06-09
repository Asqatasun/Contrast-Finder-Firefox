function stateButton(worker,
		     selectionInProgressTabs,
		     fgPickerInProgressTabs,
		     bgPickerInProgressTabs, tabs) {
    var isCurrentTabHasSelectionInProgress = getStateProgressTab(selectionInProgressTabs, tabs);
    var isCurrentTabHasfgPickerInProgress = getStateProgressTab(fgPickerInProgressTabs, tabs);
    var isCurrentTabHasbgPickerInProgress = getStateProgressTab(bgPickerInProgressTabs, tabs);
    emitButtonState(worker,
		    isCurrentTabHasSelectionInProgress,
		    "start-selector-button",
		    "stop-selector");
    emitButtonState(worker,
		    isCurrentTabHasfgPickerInProgress,
		    "start-fgPicker-button",
		    "stop-fgPicker");
    emitButtonState(worker,
		    isCurrentTabHasbgPickerInProgress,
		    "start-bgPicker-button",
		    "stop-bgPicker");
}

function emitButtonState(worker, isTabInProgress, emitStringStart, emitStringStop) {
    if (isTabInProgress)
	worker.port.emit(emitStringStart);
    else
	worker.port.emit(emitStringStop)
}

function getStateProgressTab(progressTab, tabs) {
    for (var i=0;i<progressTab.length;i++){
	if (progressTab[i].tabId === tabs.activeTab.id) {
	    return true;
	}
    }
    return false;
}

function emitStopMessages(worker) {
    worker.port.emit("stop-selector");
    worker.port.emit("stop-fgPicker");
    worker.port.emit("stop-bgPicker");
}

exports.stateButton = stateButton;
exports.emitStopMessages = emitStopMessages;