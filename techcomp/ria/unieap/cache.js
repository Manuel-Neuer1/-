dojo.require("unieap.global");
dojo.require("unieap.util.util");
dojo.provide("unieap.cache");
(function(){
	var isInstalledGears = function(){
		if (window.google && google.gears) {
			return google.gears;
		}
		var factory = null;
		// Firefox
		if (typeof GearsFactory != 'undefined') {
			factory = new GearsFactory();
		} else {
			// IE
			try {
				factory = new ActiveXObject('Gears.Factory');
				if (factory.getBuildInfo().indexOf('ie_mobile') != -1) {
					factory.privateSetGlobalObject(this);
				}
			} catch (e) {
				// Safari
				if ((typeof navigator.mimeTypes != 'undefined')
						&& navigator.mimeTypes["application/x-googlegears"]) {
					factory = document.createElement("object");
					factory.style.display = "none";
					factory.width = 0;
					factory.height = 0;
					factory.type = "application/x-googlegears";
					document.documentElement.appendChild(factory);
				}
			}
		}
		if (!factory) {
			return null;
		}
		if (!window.google) {
			google = {};
		}
		if (!google.gears) {
			google.gears = {
				factory : factory
			};
		}
		return  typeof( google.gears ) !== "undefined"  ;
	};
	var isHTML5Available = ('localStorage' in window) && window['localStorage'] !== null && window['localStorage'] !== undefined,
		isGooglegearAvailable = isInstalledGears();
	if(isHTML5Available){
		dojo.require("unieap.clientCache.localStorage");
	}else if(isGooglegearAvailable){
		dojo.require("unieap.clientCache.googlegear");
	} else if(dojo.isIE){
		dojo.require("unieap.clientCache.userData");
	}
	unieap.cache = new unieap.clientCache();
	
})();