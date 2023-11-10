dojo.provide("unieap.xgrid.core.lib");

dojo.mixin(unieap.xgrid, {
	nop: function() {
	},
	getTr: function(rowOwner, index){
		return rowOwner && ((rowOwner.rows||0)[index]);
	},
	mouseEvents: [ 'mouseover', 'mouseout', /*'mousemove', */'mousedown', 'mouseup', 'click', 'dblclick', 'contextmenu' ],
	keyEvents: [ 'keyup', 'keydown', 'keypress' ],
	funnelEvents: function(inNode, inObject, inMethod, inEvents) {
		var evts = (inEvents ? inEvents : unieap.xgrid.mouseEvents.concat(unieap.xgrid.keyEvents));
		for (var i=0, l=evts.length; i<l; i++){
			inObject["connect"](inNode,'on' + evts[i],  inMethod);
		}
	},
	addObserver: function(target, ob) {
		if (!target.observers) {
			target.observers = [];
		}
		target.observers.push(ob);
	},
	notify: function(host, method, inArgs) {
		var a = inArgs || [];
		for(var i=0, m, o; (o=host.observers[i]); i++){
			(method in o)&&(o[method].apply(o, a));
		}
	}
});

//@ sourceURL=/tp_fp/techcomp/ria/dojo/../unieap/xgrid/core/lib.js