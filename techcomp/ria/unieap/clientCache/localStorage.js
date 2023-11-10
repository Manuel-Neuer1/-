dojo.require("unieap.global");
dojo.require("unieap.util.util");
dojo.provide("unieap.clientCache.localStorage");
dojo.declare("unieap.clientCache", null, {
	
	DB_NAME : unieap.defaultCacheDBName,
	
	constructor: function(param) {
		dojo.mixin(this, param);
	},
	
	
	/**
	 * @summary:
	 * 		判断当前浏览器是否支持HTML5本地缓存
	 * @description:
	 * 		如果支持返回true，否则返回false
	 */
	isAvailable : function(){
		return unieap.global.isUseClientCache && ('localStorage' in window) && window['localStorage'] !== null && window['localStorage'] !== undefined;
	},
	
	
	/**
	 * @summary:
	 * 		清除缓存中所有记录
	 * @example:
	 * |<script>
	 * |	unieap.cache.clear();
	 * |</script> 	
	 * 通过unieap的debug工具查看缓存数据是否被清空	
	 */
	clear : function(){
		if(!this.isAvailable()){
			return;
		}
		var keys =  this.getKeys();
		for(var i = 0; i < keys.length; i++){
			key = keys[i];
			window.localStorage.removeItem(this.DB_NAME+key);
		}
	},
	
	/**
	 * @summary:
	 * 		往缓存中插入数据
	 * @param：
	 * 		{string} key  
	 * @param：
	 * 		{string} value 
	 * @param：
	 * 		{string} timestamp 
	 * @example:
	 * |<script>
	 * |	var value = "[
	 * |		{CODEVALUE:1,CODENAME:'汉族'},
	 * |		{CODEVALUE:2,CODENAME:'回族'},
	 * |		{CODEVALUE:3,CODENAME:'白族'}
	 * |	]";
	 * |	unieap.cache.put("dept",value,String(new Date().getTime()));
	 * |</script> 	
	 * 通过unieap的debug工具查看缓存数据是否被清空
	 */
	put : function(key,value,timestamp) {
		if(!this.isAvailable()){
			return;
		}
		var cacheKey,cacheValue = {};
		cacheValue.value = value;
		//cacheValue.timestamp = timestamp || 1;
		cacheValue.timestamp = timestamp || 2649600001;
		cacheKey = this.DB_NAME+key;
		var value = dojo.toJson(cacheValue);//obj2Str(cacheValue);
		window.localStorage.setItem(cacheKey,value);
	},
	
	
	/**
	 * @summary:
	 * 		往缓存中插入数据
	 * @param：
	 * 		{string} key  
	 * @example:
	 * |<script>
	 * |	unieap.cache.remove("key");
	 * |</script> 	
	 * 通过unieap的debug工具查看缓存数据是否被清空
	 */
	remove : function(key){
		var cacheKey = this.DB_NAME+key;
		window.localStorage.removeItem(cacheKey);
	},
	
	
	/**
	 * @summary:
	 * 		往缓存中插入数据
	 * @param：
	 * 		{string} keys  
	 * @param：
	 * 		{string} values 
	 * @param：
	 * 		{string} timestamps 
	 */
	putMultiple : function(keys,values,timestamps) {
		if(!this.isAvailable()){
			return;
		}
		var key,value,timestamp;
		for(var i=j=k=0;i < keys.length; i++){
			key=keys[i];
			value=values[j];
			//timestamp=timestamps&&timestamps[k]||1;
			timestamp=timestamps&&timestamps[k]||2649600001; 
			this.put(key,value,timestamp);
			j++;
			k++;
		}
	},
	
	
	/**
	 * @summary:
	 * 		从缓存中获得数据
	 * @param：
	 * 		{string} key  
	 * @return：
	 * 		{string} value 
	 */
	get : function(key) {
		if(!this.isAvailable() || key == null){
			return;
		}
		var json,obj,cacheKey;
		cacheKey = this.DB_NAME+key;
		json = window.localStorage.getItem(cacheKey);
		obj = dojo.fromJson(json)//str2Obj(value);
		return (obj == null ? null : obj.value);
	},
	
	
	/**
	 * @summary:
	 * 		从缓存中获得所有key值
	 * @return：
	 * 		{string[]} keys 
	 */
	getKeys : function(){
		if(!this.isAvailable()){
			return;
		}
		var key,keys = [];
		for(var i = 0; i < window.localStorage.length; i++){
			key = window.localStorage.key(i);
			if(key.indexOf(this.DB_NAME) > -1){
				key = key.substring(this.DB_NAME.length);
				keys.push(key);
			}
		}
		return keys;
	},
	
	
	/**
	 * @summary:
	 * 		获取缓存中记录总数
	 * @return：
	 * 		{string} count 
	 */
	getCount : function(){
		if(!this.isAvailable()){
			return;
		}
		var key,count = 0;
		for(var i = 0; i < window.localStorage.length; i++){
			key = window.localStorage.key(i);
			if(key.indexOf(this.DB_NAME) > -1){
				count++;
			}
		}
		return count;
	},
	
	/**
	 * @summary:
	 * 		获取缓存中所有记录的timestamp
	 * @return：
	 * 		{string[]} timestamps 
	 */
	getAllTimeStamps : function(){
		if(!this.isAvailable()){
			return;
		}
		var key,json,obj,timestamp,timestamps = {};
		var keys = this.getKeys();
		for(var i = 0; i < keys.length; i++){
			key = keys[i];
			json = window.localStorage.getItem(this.DB_NAME+key);
			obj = dojo.fromJson(json);
			timestamp = parseInt(obj.timestamp);
			if(timestamp > 2649600000){
				timestamps[key] = timestamp;
			}
		}
		return timestamps;
	}

});
//@ sourceURL=/tp_fp/techcomp/ria/dojo/../unieap/clientCache/localStorage.js