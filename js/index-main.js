/* =============================================================================================
* Table of Contents:
*
* 1.0 - Load Custom, Google Fonts
* 2.0 - Simple Fixes
* 3.0 - Set Teaser FPS (Optional)
* 4.0 - Initialize Sven Teaser Plugin
* 5.0 - Teaser Controls (Play / Pause / Restart/ Mute / Skip)
============================================================================================= */
"use strict";

/* ==================================================================
	Global Variables
================================================================== */
var isFontActive = false, // to check if Main Font is loaded before the teaser initiates
isFirefox = typeof InstallTrigger !== 'undefined',
isIE = /*@cc_on!@*/false || !!document.documentMode,
isEdge = !isIE && !!window.StyleMedia,
isChrome = !!window.chrome && !!window.chrome.webstore;

$(function() {

	/* ==================================================================
	1.0 Load Custom, Google Fonts
	================================================================== */
	WebFont.load({
		// custom: {
		// 	families: [ 'TeXGyreHeros' ]
		// },
		google: {
			families: ['Montserrat:400,700']
		},
		classes: false,
		timeout: 5000,
		active: function() {
			document.documentElement.className += " fontLoaded";
			isFontActive = true;
			$(document).trigger("fontActive");
		},
		fontinactive: function(familyName, fvd) {
			isFontActive = true;
			$(document).trigger("fontActive");
		}
	});

	// add class "highlight" to sound button
	$(".pl-sound").parent().addClass("highlight");

	/* ==================================================================
	2.0 Simple Fixes
	================================================================== */

	/* Preloader Animation Fallback for ie9 */
	if (navigator.userAgent.indexOf('MSIE') != -1)
	var detectIEregexp = /MSIE (\d+\.\d+);/ //test for MSIE x.x
	else // if no "MSIE" string in userAgent
	var detectIEregexp = /Trident.*rv[ :]*(\d+\.\d+)/ //test for rv:x.x or rv x.x where Trident string exists
	if (detectIEregexp.test(navigator.userAgent)) { //if some form of IE
		var ieversion=new Number(RegExp.$1) // capture x.x portion and store as a number
		if (ieversion<=9) {
			$('body').addClass("loader-ie9");
		}
	}

	if($(".st-countdown").length) {
		var launchDate = $(".st-countdown").attr("data-launch-date") ? $(".st-countdown").attr("data-launch-date") : new Date(new Date().getTime() + 144 * 60 * 60 * 1000);
		$(".st-countdown").countdown(launchDate, function(event) {
			$(this).text(
				event.strftime('%D Days %H:%M:%S')
			);
		});
	}

	/* ==================================================================
	3.0 Set Teaser FPS (Optional)
	================================================================== */
	//TweenLite.ticker.fps(25);

	/* ==================================================================
	4.0 Initialize Sven Teaser Plugin
	================================================================== */
	var $svenContainer = $(".sven-container");
	var freezeProp = $svenContainer.attr("data-freeze-prop") ? parseBool($svenContainer.attr("data-freeze-prop")) : true;

	// Merge custom animations with the existing animations
	if (typeof svenCustom !== "undefined") {
		svenAnimations = $.extend(svenAnimations, svenCustom);
	}

	/* Set autostart to false on mobiles */
	var autoStartProp = true; // By default, autoStart is set to "true"
	if(isMobile.any) { // You can use "isMobile.phone" "isMobile.tablet" to target either phones or tablets
		autoStartProp = false;
	}

	/* Set preloadMethod to "xhr" for iOS to fix audio play*/
	var preMethod = "tag";
	if(isMobile.apple.device) {
		preMethod = "xhr";
	}

	/* Set easeOuterGPU to "false" for firefox and iOS to fix text blur */
	var easeGPU = false;
	if(isFirefox || isMobile.apple.device) {
		easeGPU = true;
	}

	/* Initiate Sven Teaser Plugin */
	$svenContainer.svenPlugin({

		// General Options
		autoStart: autoStartProp,
		fullDuration: "default",
		letterBoxing: false,
		force3DOnDevices: false,
		easeOuterGPU: easeGPU,
		preloadScenes: false,
		videoOnMobiles: true,
		//stopTeaserOnEnd: false, // If you want to continue playing the video on the background and audio, set it to false. Otherwise set it to true.

		// preload options
		preloadMethod: preMethod,
		preloadFiles: ["images/1x1.png"],
		fileTimeout: 8000,
		audioTimeout: 8000,
		initAfter: 80,

		// other options
		colors: ["#E7464F", "#CDAA20", "#80993B", "#07BABA", "#9B2C9D"],
		showAnimationSummary: false,
		freezeOnBlur: freezeProp,
		videoPlaybackChange: false,

		// callback functions
		// 1- onTeaserReady, 2- onTeaserStart, 3- onTeaserEnd
		// 4- onBeforeScene, 5- onBeforeIn, 6 - onBeforeFreeze
		// 7- onBeforeOut, 8- onAfterScene
		onTeaserReady: function () {
			$(".mbYTP_wrapper").css("visibility", "hidden");
			// Hide preloader here
			$(".loader-container").hide();

			// Show Splash Page content
			if(!autoStartProp) {
				$(".splash-page").show();
			}
			$(".confetti").appendTo('.sven-wrapper');
		},
		onTeaserEnd: function() {
			// Do whatever you want once the teaser ends :)
		},
		onTeaserStart: function() {
			$(".sven-container").focus();

			// adjust line height to fix the text to center. (some fonts wont need this)
			// $(".lt-main").css({"line-height" : "1"});

			// show controls here
			$(".pl-wrapper").show();
		}
	});

	/* ==================================================================
	5.0 Teaser Controls (Play / Pause / Restart/ Mute / Skip)
	================================================================== */
	/* 1. Skip To Main Site / Content */
	$('.pl-skip').on('click' , function(ev) {
		// $svenContainer.svenPlugin.pauseTeaser();
		// revealTL.play();
		// Skip to last scene (or) redirect to the particular page
	});

	/* 2.  Play / Pause / Restart Teaser control */
	$('.pl-play').on('click' , function(ev) {
		$svenContainer.svenPlugin.togglePlay();
	});

	/* 3.  Splash Page Get Started Button */
	$('.play-button').on('click' , function(ev) {
		if(!isMobile.apple.device) {
			// to fix the audio bug in android
			$svenContainer.svenPlugin.togglePlay();
			$svenContainer.svenPlugin.togglePlay();
		}

		TweenMax.to($(".splash-page"), 0.5, {
			x: "-100%",
			onComplete: function() {
				$svenContainer.svenPlugin.togglePlay();
				$(".splash-page").remove();
			}
		});
	});

	// Play / Pause teaser by pressing "SPACEBAR" on keyboard.
	$(document).on('keydown', function(e) {
		if ($svenContainer.is(':visible') && !$('#subscribe-page').is(':visible') && e.keyCode === 32) {
			$svenContainer.svenPlugin.togglePlay();
		}
	});

	/* 4. Mute / UnMute Teaser Sound */
	$('.pl-sound').on('click' , function(ev) {
		if($(this).parent().hasClass("highlight")) {
			// Do nothing
		} else {
			$svenContainer.svenPlugin.toggleSound();
		}
	});

	// The teaser triggers a specific event for each state. We change icons / text of controls here
	var $playIcon = $(".pl-play");
	var $volumeIcon = $(".pl-sound");

	$svenContainer.on("STPlay", function () {
		$playIcon.html("PAUSE");
	});

	$svenContainer.on("STPause", function () {
		$playIcon.html("PLAY");
	});

	$svenContainer.on("STEnd", function () {
		$playIcon.html("RESTART");
	});

	$svenContainer.on("STMuted", function () {
		$volumeIcon.addClass("strike");
	});

	$svenContainer.on("STUnMuted", function () {
		$volumeIcon.removeClass("strike");
	});

});
