dojo.provide('unieap.xgrid.manager.Manager');
dojo.declare("unieap.xgrid.manager.Manager", null, {
	constructor: function(params) {
		dojo.mixin(this, params);
		this.create();
	},
	create : function(){
	},
	startup : function(){
	},
	//发布消息
	publish : function(topic,args){
		var topics = this.grid._topics || (this.grid._topics = []);
		dojo.forEach(topics[topic] || [],function(method){
			method.apply(null,args || []);
		});
	},
	//订阅消息
	subscribe : function(topic,context,method){
		topic = topic.split(".");
		var id = topic[1] || "";
		topic = topic[0];
		var topics = this.grid._topics || (this.grid._topics = []);
		var listener = topics[topic] || (topics[topic] = []);
		function fn(){
			(dojo.isFunction(method) && method || context[method]).apply(context,arguments);
		}
		fn.id = id;
		listener.push(fn);
	},
	//取消订阅
	unsubscribe : function(topic){
		/**
		 * grid.unsubscribe("headerClick.uniqid");
		 */
		topic = topic.split(".");
		var id = topic[1] || "";
		topic = topic[0];
		var topics = this.grid._topics || (this.grid._topics = []);
		if(null==id){
			delete topics[topic];
			return;
		}
		var listener = topics[topic] || [];
		for(var i=listener.length-1,fn;fn =listener[i];i--){
			if(fn.id==id){
				listener.splice(i,1);
			}
		}
	}
});

//@ sourceURL=/tp_fp/techcomp/ria/dojo/../unieap/xgrid/manager/Manager.js