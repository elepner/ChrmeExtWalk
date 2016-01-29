
chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.windows.create({ url: "info.html?" + tab.id, type: "popup", width: 800, height: 600 });
});

var version = "1.0";

