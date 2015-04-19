SoundGrabber = (function () {
	var GenerateGrabberButton = function () {
		var btn = document.createElement('DIV');
		btn.innerHTML = 'Grab Song';
		btn.style.lineHeight = '28px';
		btn.setAttribute('class', 'scGrabberDownloadButton yt-uix-button yt-uix-button-size-default yt-uix-button-opacity');
		return btn;
	};

	var SendDownloadMessageToBackgroundScript = function () {
		var songUrl = window.location.href;
		chrome.runtime.sendMessage({
			'type': 'download',
			'url': songUrl
		});	
	};

	var IsVideoPage = function (url) {
		return /((https:\/\/www.youtube.com\/watch)|(http:\/\/www.youtube.com\/watch)).+/.test(url);
	};
	
	var btn;
	var GrabberHasButton = 'grabberHasButton';
	var trueConstText = 'true';
	var InjectGrabberButton = function ($elementToAppendTo) {
		if(!$elementToAppendTo) {
			return;
		}

		if (btn) {
			$(btn).remove();
		}
		btn = GenerateGrabberButton();
		$elementToAppendTo.data(GrabberHasButton, trueConstText);
		$elementToAppendTo.append(btn);	
	};

	var currentUrl;
	var EveryUrlChangeToVideo = function (currentUrl, callback) {
		var newUrl = window.location.href;
		if (!callback) {
			callback = currentUrl;
			currentUrl = newUrl;
		}
		
		if (currentUrl !== newUrl) {
			currentUrl = newUrl;
			var isVideoPage = /((https:\/\/www.youtube.com\/watch)|(http:\/\/www.youtube.com\/watch)).+/.test(newUrl);
			if (IsVideoPage(newUrl)) {
				callback();
			}
		}
		
		setTimeout(function (){
			EveryUrlChangeToVideo(currentUrl, callback);
		}, 1500);
	};	
	
	var RequestPageActionIcon = function () {
		chrome.extension.sendMessage({type:'showIcon'});
	};
	
	var EnsureJqueryIsLoaded = function () {
		var s = document.createElement('script');
		s.setAttribute('src', 'https://code.jquery.com/jquery-latest.min.js');
		if (typeof jQuery == 'undefined') {
			document.getElementsByTagName('head')[0].appendChild(s);
		}			
	};
	
	var WaitAndAddInjectButton = function (waitPeriod) {
		waitPeriod = waitPeriod || 1500;
		setTimeout(function () {
			$toolbar = $('#watch8-secondary-actions');
			InjectGrabberButton($toolbar);			
		}, waitPeriod);			
	};
	
	var Init = function () {
		$toolbar = $('#watch8-secondary-actions');
		var isVideoPage = /((https:\/\/www.youtube.com\/watch)|(http:\/\/www.youtube.com\/watch)).+/.test(window.location.href);
		if (IsVideoPage(window.location.href)) {
			InjectGrabberButton($toolbar);
		}
		
		EveryUrlChangeToVideo(function () {	
			WaitAndAddInjectButton()
		});			
		
		$('#content').on('click' , '.scGrabberDownloadButton', SendDownloadMessageToBackgroundScript);	
	};
	
	return {
		EnsureJqueryIsLoaded : EnsureJqueryIsLoaded,
		RequestPageActionIcon: RequestPageActionIcon,
		Init: Init
	};
})();

SoundGrabber.RequestPageActionIcon();
SoundGrabber.EnsureJqueryIsLoaded();
$(document).ready(function (){
	SoundGrabber.Init();
});