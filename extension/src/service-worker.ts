(chrome.browserAction ?? chrome.action).onClicked.addListener((tab) => {
    chrome.tabs.create({"url":"/page/view.html", "active":true})
});