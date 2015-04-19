var injectPeggoScript = function (tabId) {
	chrome.tabs.executeScript(
		tabId,
		{
			file: 'peggo-content.js',
			runAt: 'document_end'
		},
		function () {
			
	});
};

var setOffDownload = function (url) {
	var peggoUrl = 'http://www.peggo.co/search/' + encodeURIComponent(url);
	
	chrome.windows.create({
		url: peggoUrl,
		focused: false,
		type: 'popup',
		width: 50,
		height:50,
		left: 3,
		top: 3
	},
	function (window) {
		console.log('window created');
		console.log(window);
		console.log(window.tabs[0].id);
		var peggoTabId = window.tabs[0].id;
		injectPeggoScript(peggoTabId);
	});
};

chrome.runtime.onMessage.addListener(function (message, sender) {
	console.log(message);
	
	if (message && message.type === 'showIcon') {
	    var tab = sender.tab;
        chrome.pageAction.show(tab.id);
        chrome.pageAction.setTitle({
            tabId: tab.id,
            title: 'Song Grabber'
        });
	} else if (message && message.type === 'download') {
		setOffDownload(message.url);
	}
});