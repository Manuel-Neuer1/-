(function(){
	
	//解决在dojo1.3在frame里，刷新IE出现内存泄漏的问题
	//window的事件列表
	if(/^1\.3\./.test(dojo.version)){ //dojo 1.3
		var winEvtList = [
			"onactivate",
			"onafterprint",
			"onbeforedeactivate",
			"onbeforeprint",
			"onbeforeunload",
			"onblur",
			"oncontrolselect",
			"ondeactivate",
			"onerror",
			"onfocus",
			"onhelp",
			"onload",
			"onmove",
			"onmoveend",
			"onmovestart",
			"onresize",
			"onresizeend",
			"onresizestart",
			"onscroll", 
			"onunload" 
		];	
		var _orginUnLoad = window.onunload;
		window.onunload = function(){
			_orginUnLoad && _orginUnLoad();
			for(var i=0,l=winEvtList.length;i<l;i++){
				var name = winEvtList[i];
				window[name] = null;
			}		
		}
	}
	
	/**
	 * @summary:
	 * 		dojo.mixin(target,source)方法处理两个在不同window空间的对象时,source的
	 * 		constructor会覆盖target的constructor。dojo 2.0会修正这个问题。
	 * 默认的原型方法如下(见bootrap.js中dojo._extraNames)
	 *	dojo._extraNames = extraNames = extraNames ||
	 *	    ["hasOwnProperty", "valueOf", "isPrototypeOf",
	 *		"propertyIsEnumerable", "toLocaleString", "toString", "constructor"];
	*/
	if(/^1\.[4-9]\./.test(dojo.version)){ //dojo 1.4
		dojo._extraNames.length>0&&dojo._extraNames.pop()&&dojo._extraNames.push("propertyIsEnumerable");
	}
	
	/**
	 * @summary:
	 * 		 单帧框架下，快速打开两个菜单，第2个菜单的addOnLoad操作执行时机错误，
	 * 		 由于dojo的采用setTimeOut定时器去设置dojo._postLoad标识，导致第2个菜
	 *       	 单中的脚本在执行时，错误认为dojo._postLoad = true，所以立马执行addOnLoad操作
	 *                  将定时器的逻辑去掉
	 */
	dojo._callLoaded = function(){
		var d = dojo;
		// The "object" check is for IE, and the other opera check fixes an
		// issue in Opera where it could not find the body element in some
		// widget test cases.  For 0.9, maybe route all browsers through the
		// setTimeout (need protection still for non-browser environments
		// though). This might also help the issue with FF 2.0 and freezing
		// issues where we try to do sync xhr while background css images are
		// being loaded (trac #2572)? Consider for 0.9.
		if(typeof setTimeout == "object" || (d.config.useXDomain && d.isOpera)){
			d.isAIR ? d.loaded() : eval(d._scopeName + ".loaded();");	
		}else{
			d.loaded();
		}
	}
	
	dojo.config.deferredOnError = function(e) {
		if(e.name === "dojoParseError"){
			throw(e);
		}
	}
	
	//这三个is...家族的函数是克服iframe中切换window对象时结果混乱的问题
	
	dojo.isFunction = function(it){
		return Object.prototype.toString.call(it) == "[object Function]";
	}
	
	dojo.isString = function(it){
		return Object.prototype.toString.call(it) == "[object String]";
	}

	dojo.isArray = function(it){
		return Object.prototype.toString.call(it) == "[object Array]";
	}
	
})();