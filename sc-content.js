var SoundGrabber = (function () {	
	var GrabberBtnTypeKey = 'grabberBtnType';
	var PageTypes = {
		SongList : 'songListItem',
		SearchList : 'searchListItem',
		SongPage: 'songPage'
	};
	
	var GetSongUrlForSongListItemButton = function ($likeButton){
		var songContainer = $likeButton.closest('.soundList__item');
		return songContainer.find('a.soundTitle__title').prop('href');
	};	
	
	var GetSongUrlForSearchListItemButton = function ($likeButton){
		var songContainer = $likeButton.closest('.searchList__item');
		return songContainer.find('a.soundTitle__title').prop('href');	
	};		
	var GetSongUrlForSongPageButton = function () { return window.location.href; };
	
	var GetSongUrlMap = {};
	GetSongUrlMap[PageTypes.SongList] = GetSongUrlForSongListItemButton;
	GetSongUrlMap[PageTypes.SearchList] = GetSongUrlForSearchListItemButton;
	GetSongUrlMap[PageTypes.SongPage] = GetSongUrlForSongPageButton;
	
	var KickoffDownload = function () {
			var btnType = $(this).data(GrabberBtnTypeKey);
			var songUrl = GetSongUrlMap[btnType]($(this));		
			chrome.runtime.sendMessage({
				'type': 'download',
				'url': songUrl
			});
	};
	
	var GenerateButton = function (type) {
		var btn = document.createElement('BTN');
		btn.setAttribute('class', 'scGrabberDownloadButton sc-button sc-button-small');
		btn.innerHTML = 'Grab Song';
		$(btn).data(GrabberBtnTypeKey, type);
		return btn;
	};
	
	var InjectDownloadButtons = function ($injectionSites, type) {
		var GrabberAdded = 'grabberAdded';
		for (var i = 0; i < $injectionSites.length; i++) {
			var $element = $($injectionSites[i]);
			if (!($element.data(GrabberAdded) === GrabberAdded)) {
				var btn = GenerateButton(type);
				$element.append(btn);
				$element.data(GrabberAdded, GrabberAdded);
			}
		}
	};	
	
	var GetInjectionSites = function (rootElement, pageType) {
		if (pageType === PageTypes.SongList) {
			return $(rootElement).find('li.soundList__item');
		}
		if (pageType === PageTypes.SearchList) {
			return $(rootElement).find('li.searchList__item');
		}
		if (pageType === PageTypes.SongPage) {
			return $(rootElement).find('.fullListenHero .soundTitle');
		}
	};
	
	var DeterminePageType = function () {
		var currentUrl = window.location.href;
		if(/(https:\/\/soundcloud.com\/search.+)/.test(currentUrl)){
			return PageTypes.SearchList;
		}
		if(/(https:\/\/soundcloud.com\/)((stream)|(explore))/.test(currentUrl)) {
			return PageTypes.SongList;	
		}
		return PageTypes.SongPage;
	};
	
	var SetupGrabbingWithin = function (rootElement) {
		var pageType = DeterminePageType();
		var $injectionSites = GetInjectionSites(rootElement, pageType);
		InjectDownloadButtons($injectionSites, pageType);
	};
	
	var Init = function () {
		chrome.extension.sendMessage({type:'showIcon'});
	
		var appElement = document.getElementById('app');
		SetupGrabbingWithin(appElement);
		
		$('#content').on('click', '.scGrabberDownloadButton', KickoffDownload);
			
		document.getElementById('content').addEventListener('DOMNodeInserted', function (ev) {
				SetupGrabbingWithin(ev.relatedNode);
		}, false);
	};

	var EnsureJqueryIsLoaded = function () {
		var s = document.createElement('script');
		s.setAttribute('src', 'https://code.jquery.com/jquery-latest.min.js');
		if (typeof jQuery == 'undefined') {
			document.getElementsByTagName('head')[0].appendChild(s);
		}		
	};
	
	return {
		EnsureJqueryIsLoaded: EnsureJqueryIsLoaded,
		Init: Init
	}
})();

SoundGrabber.EnsureJqueryIsLoaded();
$(window).load(function (){
	SoundGrabber.Init();
});
