dojo.require("unieap.util.util");
dojo.require("unieap.ds.DataCenter");
dojo.provide("unieap.patch.loader");
//--------------------BEGIN: Global variables and functions------------------------

//兼容Aclome使用场景
var compatAclome = false;
if("undefined"!=typeof(aclomeCompat))
	compatAclome = aclomeCompat;

function getWidgetById(id) {
	return dijit.byId(id);
}

function getElementById(id) {
	return dojo.byId(id);
}

function getRootNode() {
	return null;
}

function getRealId(id) {
	return id;
}

if (!window.unieap) {
	unieap = {};
}

unieap.getRealId = function(id) {
	return id;
}

unieap.getElementById = function(id) {
	return dojo.byId(id);
}

unieap.define = function(context, func) {
	if (dojo.isFunction(arguments[0])) {
		func = context;
		context = "";
	}
	var funcStr = func.toString().replace(/(^function\s*\(\)\s*\{)+?|(}$)+?/g,"");
	//页面是否加载完毕，用于判断单帧是单独访问页面
	if (!dojo._initFired) {
		var	clazz =  new Function("var dataCenter = window.dataCenter;\n"+funcStr),
		context = context || "default";
		var instance = new clazz();
		window[context] = instance;
		viewContextHolder[context] = {
			dataCenter: window.dataCenter
		}
		if (instance.onload) {
			dojo.addOnLoad((function(instance) {
				return function() {
					instance.onload()
				};
			})(instance));
		}

		instance = null;
		return;
	}
	//保存用户自定的方法
	DefinitionLocalMap = {
		proxyString: funcStr,
		context: context
	};
}

var viewContextHolder = {},
	DefinitionLocalMap = null;
//--------------------END: Global variables and functions------------------------

//--------------------BEGIN: Defination of unieap.loader------------------------
unieap.loader = new function() {
	//	unieap.loader.load({
	//		data:{name:'',password:''},
	//		node: rootNode,
	//		url:'/test/a.html',
	//		showLoading : true
	//	})
	this.load = function(loadArgs) {
		dojo.require("unieap.util.util");
		loadArgs = normalizeArgs(loadArgs);
		if (_loadedResources == null) {
			initLoadedResources();
		}
		dojo._postLoad = false;
		dojo.xhrGet({
			url: loadArgs.url,
			preventCache: true,
			content: loadArgs.data || {},
			load: function(response) {
				loadSuccessed(response, loadArgs);
			},
			error: function(error) {
				loadArgs.xhrLoadingHandle && loadArgs.xhrLoadingHandle.shutDown();
				loadFailed(error, loadArgs);
			}
		});
	};
	//--------------------BEGIN: Internal variables and functions of unieap.loader------------------------
	var templateString = "var dataCenter= arguments[0] || window.dataCenter,"
			+ "rootNode=arguments[1],"
			+ "rootId= rootNode && rootNode.id || '';\n"
			+ "this.rootNode=rootNode;\n"
			+ "function getWidgetById(id){return dijit.byId(rootId + id);}\n"
			+ "function getRootNode(){return rootNode;}\n"
			+ "function getRealId(id){return rootId+id;}\n"
			+ "this.getWidgetById = function(id){return getWidgetById(id);}\n"
			+ "this.getElementById = function(id){return getElementById(id);}\n"
			+ "this.getRootNode = function(){return this.rootNode;}\n"
			+ "var unieap = new UnieapDecorate();\n"
			+ "unieap.byId = function(id){return getWidgetById(id);}\n"
			+ "unieap.getRealId = function(id){return getRealId(id);}\n"
			+ "unieap.getElementById = function(id){return getElementById(id);}\n"
			+ "var _scribeHandles = [];\n"
			+ "this._scribeHandles = _scribeHandles;\n"
			+ "unieap.subscribe = function(topic,fun){var subscriber=window.unieap.subscribe(topic,fun);if(subscriber!=null)_scribeHandles.push(subscriber);}\n";
	if(compatAclome){
		templateString += "function getElementById(id){return dojo.query((rootNode?'#'+rootId+' ':'')+'#'+id)[0];}\n"
			+ "var dojo = new DojoDecorate(),dojoAddOnloads=[];\n"
			+ "dojo.addOnLoad = function(f){dojoAddOnloads.push(f);}\n"
			+ "this.onload=function(){for(var i=0;i<dojoAddOnloads.length;i++){dojoAddOnloads[i]();}}\n";
		}
	else
		templateString += "function getElementById(id){return dojo.byId(rootId + id);}\n";
		
	var templateHolder = {};

	var _loadedResources = null;
	var _locProc = document.location.protocol;

	function normalizeArgs(loadArgs) {
		if (dojo.isString(loadArgs)) {
			loadArgs = {
				url: loadArgs
			};
		}
		loadArgs.node = (loadArgs.node || document.body);
		loadArgs.xhrLoadingHandle = (loadArgs.showXhrLoading ? unieap.openTabLoading(loadArgs.node.id) : null);
		var injectTemplate = loadArgs.injectTemplate || "";
		if (injectTemplate.length > 0 && /\.template$/g.test(injectTemplate)) {
			if (injectTemplate in templateHolder) {
				loadArgs.injectTemplate = templateHolder[injectTemplate];
			} else {
				dojo.xhrGet({
					url: dojo.moduleUrl("") + injectTemplate,
					sync: true,
					load: function(response) {
						loadArgs.injectTemplate = templateHolder[injectTemplate] = response;
					}
				});
			}
		}
		return loadArgs;
	}

	function initLoadedResources() {
		_loadedResources = {};
		var head = document.getElementsByTagName("head")[0] || document.documentElement,
			stylesheets = head.getElementsByTagName("link");
		for (var i = 0, stylesheet; stylesheet = stylesheets[i]; i++) {
			_loadedResources[stylesheet.href] = 1;
		}
		var scripts = head.getElementsByTagName("script");
		for (var i = 0, script; script = scripts[i]; i++) {
			if (script.src && !enforceLoad(script)) {
				_loadedResources[script.src] = 1;
			}
		}
	}

	function loadSuccessed(response, loadArgs) {
		//0.准备解析参数
		var parsePrompts = initParsePrompts(response, loadArgs);
		//1.处理注释
		parseComments(parsePrompts);
		//2.处理样式表
		parseStyles(parsePrompts);
		//3.处理脚本
		var deferredScriptsHandle = parseScripts(parsePrompts);
		//4.处理页面内容元素
		parsePrompts.advancedScriptsReady.addCallback(parseContents);
		//5.处理延后的脚本
		parsePrompts.contentShownReady.addCallback(deferredScriptsHandle);
	}

	function loadFailed(e, loadArgs) {
		if (_timeoutProcess(e.responseText, loadArgs)) {
			return;
		}
		loadArgs.node.innerHTML = e.responseText || e.message || e.description;
		loadArgs.error && loadArgs.error(e);

		function _timeoutProcess(responseText, loadArgs) {
			if (responseText.match(unieap.session.timeout)) {
				if (unieap.session.dialogRelogin) {
					dojo.require("unieap.dialog.DialogUtil");
					var j_application = unieap.appPath.substring(unieap.WEB_APP_NAME.length + 1);
					DialogUtil.showDialog({
						url: unieap.WEB_APP_NAME + "/techcomp/security/relogin.jsp",
						dialogData: {
							"j_application": j_application
						},
						width: "563",
						height: "360",
						resizable: false,
						isExpand: false,
						isClose: false,
						//会话过期,请重新登录
						title: RIA_I18N.rpc.sessionOut,
						onComplete: function(value) {
							if (value == "success") {
								unieap.loader.load(loadArgs);
							}
						}
					});
				} else {
					var topWin = unieap.getTopWin();
					var hash = topWin.location.hash;
					var locationURL = topWin.location.toString();
					if(hash || locationURL.endWith("#")){
						if(hash)
							locationURL = locationURL.substring(0,locationURL.lastIndexOf(location.hash));
						if(locationURL.endWith("#")){
							locationURL = locationURL.substring(0,locationURL.length-1);
						}
						topWin.location.href=locationURL;
					}else{
						topWin.location = topWin.location;
					}
				}
				return true;
			}
			return false;
		}
	}

	function initParsePrompts(response, loadArgs) {
		var node = loadArgs.node,
			id = node.id,
			rootWidget = unieap.byId(id);

		unieap.destroyWidgets(node);

		node.setAttribute("xhr", true);

		var runtimeLocalMap = {
			dataCenter: null, //数据对象
			context: null, //上下文对象
			rootNode: node,
			instances: [], //上下文对象队列
			topics: null //缓存页面中发布订阅的handles
		};
		viewContextHolder[id] = runtimeLocalMap;

		var parsePrompts = {
			htmlHead: document.getElementsByTagName("head")[0] || document.documentElement,
			isXDialogLoad: (typeof(rootWidget) != "undefined") ? ((rootWidget.declaredClass == "unieap.xdialog.Dialog") ? true : false) : false,
			rootWidget: rootWidget,
			inHtmlStr: response,
			runtimeLocalMap: runtimeLocalMap,
			advancedScriptsReady: new dojo.Deferred(),
			deferredScriptsReady: new dojo.Deferred(),
			contentShownReady: new dojo.Deferred()
		};
		dojo.mixin(parsePrompts, loadArgs);
		
		//aclome需要对节点进行提前处理
		if(compatAclome){
			handleBodyLoading(parsePrompts);
		}
		handleXdialogLoading(parsePrompts);

		return parsePrompts;
	}

	function parseComments(parsePrompts) {
		parsePrompts.inHtmlStr = parsePrompts.inHtmlStr.replace(/<!--[\s\S]*?-->/ig, function() {
			return ""
		});
	}

	function parseStyles(parsePrompts) {
		var linkRe = /(<link[^<>]*><\/link>|<link[^<>]*\/>)/ig,
			styleRe = /<style[^@]*?<\/style>/ig,
			hrefRe = new RegExp('href=["][^"\']*["]', "i"),
			insertLinkEle = null,
			insertStyleEle = null,
			url = "";

		parsePrompts.inHtmlStr = parsePrompts.inHtmlStr.replace(linkRe, function(linkStr) {
			var matchResult = linkStr.match(hrefRe);
			if (matchResult && matchResult.length > 0) {
				url = matchResult[0];
				url = url.substring(url.indexOf('"') + 1, url.lastIndexOf('"'));
				if (url != null) {
					var loaded = isLoadedUrl(url);
					if (!loaded) {
						if (insertLinkEle == null) {
							insertLinkEle = document.createElement("link");
							insertLinkEle.rel = "stylesheet";
							insertLinkEle.type = "text/css";
							insertLinkEle.media = "screen";
						} else
							insertLinkEle = insertLinkEle.cloneNode(false);
						insertLinkEle.href = url;
						parsePrompts.htmlHead.appendChild(insertLinkEle);
						_loadedResources[url] = 1;
					}
					return "";
				}
			}
			return linkStr;
		});
		// TODO:Style元素中定义的样式尚未考虑
		var styleElements = parsePrompts.htmlHead.getElementsByTagName("style");
		if (styleElements.length == 0) {//如果不存在style元素则创建  
		if (document.createStyleSheet) {    //ie  
		    document.createStyleSheet();
		} else {
		    var tempStyleElement = document.createElement('style'); //w3c  
			tempStyleElement.setAttribute("type", "text/css");
	        parsePrompts.htmlHead.appendChild(tempStyleElement);
		    }
		}
		insertStyleEle = styleElements[0];
		parsePrompts.inHtmlStr = parsePrompts.inHtmlStr.replace(styleRe, function(styleStr) {
			styleStr = styleStr.substring(styleStr.indexOf('>')+1,styleStr.lastIndexOf('<'));
			if (insertStyleEle.styleSheet) {    //ie  
		        insertStyleEle.styleSheet.cssText += styleStr;
		    } else if (document.getBoxObjectFor) {
		        insertStyleEle.innerHTML += styleStr; //火狐支持直接innerHTML添加样式表字串  
		    } else {
		        insertStyleEle.appendChild(document.createTextNode(styleStr))
		    }
			return "";
		});
	}

	function parseScripts(parsePrompts) {
		var scriptRe = new RegExp("(<SCRIPT[\\s\\S]*?</SCRIPT>)|(<SCRIPT[^>]*?/>)", "ig"),
			scriptTagRe = /<script[^>]*>/i,
			scriptsAdvanced = [],
			scriptsDeferred = [],
			resolvePrompts = {
				baseURL: parsePrompts.url.substring(0, parsePrompts.url.lastIndexOf("/") + 1),
				regExps: [{
					name: "scope",
					exp: /scope=(['"])[^'"]*\1/
				}, {
					name: "advanced",
					exp: /advanced=(['"])[^'"]*\1/
				}, {
					name: "load",
					exp: /load=(['"])[^'"]*\1/
				}, {
					name: "context",
					exp: /context=(['"])[^'"]*\1/
				}, {
					name: "parallel",
					exp: /parallel/
				}]
			};
			
	
		parsePrompts.inHtmlStr = parsePrompts.inHtmlStr.replace(scriptRe, function(scriptStr) {
			var scriptInfo = resolveScriptStr(scriptStr, resolvePrompts);
			if (needLoading(scriptInfo)) {
				if (scriptInfo.advanced && scriptInfo.advanced === "false")
					scriptsDeferred.push(scriptInfo);
				else
					scriptsAdvanced.push(scriptInfo);
			}
			return "";
		});

		exeScriptsSequentially(scriptsAdvanced, parsePrompts, parsePrompts.advancedScriptsReady);

		var deferredScriptsHandle = function(parsePrompts) {
			var scriptsDeferredDone = exeScriptsSequentially(scriptsDeferred, parsePrompts);
			scriptsDeferredDone.addCallback(onLoadCompleted);
		};
		return deferredScriptsHandle;
	}

	function parseContents(parsePrompts) {
		if(compatAclome){
			var node = parsePrompts.node;
		}else{
			var node = handleBodyLoading(parsePrompts);
		}
		try{
			parsePrompts.parseResult = dojo.parser.parseIgnoringJsContext(node, {
				xhr: true,
				currentDataCenter: parsePrompts.runtimeLocalMap.dataCenter || window.dataCenter
			});
		}
		catch(e)
		{
			dojo._loaders = [];
			e.name = "dojoParseError";
			throw(e);
		}
		
		if(typeof t_click !== "undefined")
			console.info(new Date()-t_click);
	
		setTimeout(function() {
			parsePrompts.contentShownReady.callback(parsePrompts);
		}, 0);
		//TODO:尚未考虑body中的style元素
	}

	function onLoadCompleted(parsePrompts) {
		if("undefined" !=typeof(globalDataCenter)){
			dataCenter = globalDataCenter;
		}
		var runtimeLocalMap = parsePrompts.runtimeLocalMap,
			dc = runtimeLocalMap.dataCenter || window.dataCenter,
			bindings = parsePrompts.parseResult.bindingRecords,
			w = window;
		for (var i = bindings.length; i--;) {
			var binding = bindings[i];
			switch (binding.type) {
				case "unieap.tree.Tree":
					{
						w[binding.jsId].getBinding().setDataStore(w[binding.jsId].getRootNode(), dc.getDataStore(binding.storeName));
						break;
					}
				default:
					{
						w[binding.jsId].getBinding().setDataStore(dc.getDataStore(binding.storeName));
						break;
					}
			}
			if (!binding.keepVar)
				w[binding.jsId] = null;
		}
		parsePrompts.xhrLoadingHandle && parsePrompts.xhrLoadingHandle.shutDown();
		dojo._callLoaded();
		dojo.forEach(runtimeLocalMap.instances, function(elem) {
			elem[1].onload && elem[1].onload();
		});
		runtimeLocalMap = null;
		//执行用户的回调
		parsePrompts.load && parsePrompts.load();
		//解决xDialog下没有该方法，但是如果xDialog里有AdaptiveContainer，可能还是有问题的。
		parsePrompts.rootWidget && parsePrompts.rootWidget.resizeContainer && parsePrompts.rootWidget.resizeContainer();
		//清除dojo._unloaders数组，避免内存泄露
		if(!compatAclome){
			dojo._unloaders = [];
		}
		return;
	}

	function exeScriptsSequentially(scriptInfoArr, parsePrompts, scriptDoneDeferred) {
		var node = parsePrompts.node,
			htmlHead = parsePrompts.htmlHead,
			runtimeLocalMap = parsePrompts.runtimeLocalMap,
			scriptDoneDeferred = arguments[2] || new dojo.Deferred(),
			indexPointer = 0;

		function handleScript() {
			var scriptInfo = scriptInfoArr[indexPointer];
			if (null == scriptInfo) {
				scriptDoneDeferred.callback(parsePrompts);
				return;
			}
			var src = scriptInfo.src;
			if (src) {
				runtimeLocalMap.context = scriptInfo.context;
				if (dojo.isIE && scriptInfo.parallel) {
					dojo.xhrGet({
						url: src,
						sync: false,
						load: function(text) {
							dojo.eval(text);
							autowiredefine(node, parsePrompts.injectTemplate, runtimeLocalMap);
							handleScript(indexPointer++);
						}
					});
				} else {
					//异步串行加载脚本
					var dynamicalScript = document.createElement("script");
					dynamicalScript.src = scriptInfo.src;
					dynamicalScript.onload = dynamicalScript.onreadystatechange = scriptOnLoad;
					htmlHead.appendChild(dynamicalScript);
				}
			} else {
				var inlineCode = scriptInfo.jsText;
				var dynamicalScript = document.createElement("script");
				dynamicalScript.text = inlineCode;
				htmlHead.appendChild(dynamicalScript);
				htmlHead.removeChild(dynamicalScript);
				//使得dataCenter成为私有变量
				if (/(var\s+dataCenter)+?/g.test(inlineCode)) {
					runtimeLocalMap.dataCenter = window.dataCenter;
				}
				handleScript(indexPointer++);
			}
		}

		function scriptOnLoad() {
			if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
				this.onload = this.onreadystatechange = null;
				this.parentNode.removeChild(this);
				var hasDuplicateContext = false;
				//JavaScript为单线程执行，执行js文件会同步执行回调方法，不会并行执行其他的js操作，不会出现资源锁问题
				hasDuplicateContext = autowiredefine(node, parsePrompts.injectTemplate, runtimeLocalMap);
				if (!hasDuplicateContext) {
					handleScript(indexPointer++);
				} else {
					//如果存在重复上下文，以Iframe方式加载，首先清除之前已经加载过的变量
					dojo._loaders = [];
					unieap.destroyWidgets(node);
					node.innerHTML = "";
					if(parsePrompts.isXDialogLoad || compatAclome){
						var contentPane = new unieap.layout.ContentPane();
						node.appendChild(contentPane.domNode);
						contentPane.setHref(parsePrompts.url);
						dojo.style(contentPane.domNode, {
							"overflow": "auto",
							"position": "relative",
							"visibility": "visible"
						});
					}
					else{
						dijit.byNode(node).setHref(parsePrompts.url);
						dojo.style(node, {
							"overflow": "auto",
							"position": "relative",
							"visibility": "visible"
						});
					}
					parsePrompts.xhrLoadingHandle && parsePrompts.xhrLoadingHandle.shutDown();
				}
			}
		}
		handleScript();
		return scriptDoneDeferred;
	}

	function handleXdialogLoading(parsePrompts) {
		//如果是Xdialog方式加载，需要首先缓存当前的_currentNodeOfSingleFrame
		var node = parsePrompts.node;
		if (parsePrompts.isXDialogLoad && typeof(_currentNodeOfSingleFrame) != "undefined" && _currentNodeOfSingleFrame != null && _currentNodeOfSingleFrame.id != node.id) {
			var viewContext = viewContextHolder[_currentNodeOfSingleFrame.id];
			if (typeof(viewContext) != "undefined" && viewContext != null) {
				_saveCurrentViewContext(viewContext);
			}
			//并且更新当前节点为XDialog的ContainerNode
			_currentNodeOfSingleFrame = node;
			//并且将当前XDialog的ContainerNode放入到数组中维护，防止在此XDialog之上又弹出新的XDialog
			_currentNodesOfSingleFrame.push(node);
		}
	}
	
	function handleBodyLoading(parsePrompts) {
		var objectRe = new RegExp("<object[\\s\\S]*?</object>", "ig"), bodyRe = new RegExp(
					"<body[\\s\\S]*?</body>", "ig"), inHtmlStr = parsePrompts.inHtmlStr, objectsStr = "", bodysStr = "";
			// 取得所有body定义，并且将原html中的body清空
			inHtmlStr = inHtmlStr.replace(bodyRe, function(bodyStr) {
				bodysStr += bodyStr;
				return "";
			});
			// 取得所有不在body下的obejct定义
			var objectResults = inHtmlStr.match(objectRe);
			if (objectResults) {
				for ( var i = 0, length = objectResults.length; i < length; i++) {
					objectsStr += objectResults[i];
				}
			}
			if(compatAclome){
				inHtmlStr += bodysStr;//重新加入body，以便之后能够对body之中的script进行解析
			}
			
			// 将所有object定义放入一个body定义中
			if (objectsStr.length > 0) {
				bodysStr = "<body>" + objectsStr + "</body>" + bodysStr;
			}
			var node = parsePrompts.node;
			dojo.style(node, {
				"overflow" : "auto",
				"position" : "relative"
			});
			node.innerHTML = bodysStr;
			return node;
	}
	

	function isLoadedUrl(url) {
		var fullUrl = url;
		//IE兼容视图下取到的src不带协议和端口
		if (fullUrl.substring(0, 4) != "http") {
			fullUrl =  _locProc +"//" + window.location.host + fullUrl;
		}
		if (_loadedResources[fullUrl] || _loadedResources[url])
			return true;
		else
			return false;
	}

	function enforceLoad(scriptInfo) {
		var url = scriptInfo.src,
			load, scope;

		if (scriptInfo.tagName) {
			//Dom object
			load = scriptInfo.getAttribute("load");
			scope = scriptInfo.getAttribute("scope");
		} else {
			//Json object
			load = scriptInfo.load;
			scope = scriptInfo.scope;
		}

		if (load == "enforce") return true;
		if (load == "cache") return false;
		if(compatAclome){
			if(!/\/unieap\/|\/aclome-app-ui\/|\/aclome-app-chart\//.test(url)) return true;
		}else{
			if (typeof(scope) != "undefined" && (scope == "view" || scope == "processor")) return true;
			if(!/\/techcomp\/ria/.test(url)) return true;
		}
		return false;
	}

	function resolveScriptStr(scriptStr, resolvePrompts) {
		//resolvePrompts={
		// baseURL:"",
		// regExps: [{name:"src",exp:/src=(['"])[^'"]*\1/i},{name:"deferred",exp:/deferred/i}]
		//}
		var result = {},
			regExps = resolvePrompts.regExps,
			gtI = scriptStr.indexOf(">"),
			beginningScript = scriptStr.slice(scriptStr.indexOf("<"), gtI + 1),
			mSrc = beginningScript.match(/src=(['"])[^'"]*\1/i),
			jsText = "";
		if (mSrc != null || (jsText = trim(scriptStr.slice(gtI + 1, scriptStr.lastIndexOf("<")))).length > 0) {
			var src;
			result.src = (mSrc === null ? null : (src = ((src = mSrc[0].substring(mSrc[0].indexOf("=") + 1)).slice(1, src.length - 1))).search("/") === 0 ||src.search("http")===0? src : resolvePrompts.baseURL + src);
			result.jsText = (jsText.length > 0 ? jsText : null);
			for (var i = regExps.length; i--;) {
				var regExp = regExps[i],
					m = beginningScript.match(regExp.exp);
				if (m != null) {
					m = m[0].split("=");
					if (m.length === 2)
						result[regExp.name] = m[1].slice(1, m[1].length - 1);
					else
						result[regExp.name] = true;
				} else
					result[regExp.name] = null;
			}
		}
		return result;
	}

	function needLoading(scriptInfo) {
		var src = scriptInfo.src;
		if (src && !isLoadedUrl(src)) {
			if (!enforceLoad(scriptInfo)) {
				_loadedResources[src] = 1;
			}
			return true;
		}
		if (scriptInfo.jsText)
			return true;
		return false;
	}

	function autowiredefine(node, injectTemplate, runtimeLocalMap) {
		if (null != DefinitionLocalMap) {
			//防止打开的页面当中没有新建dataCenter的情况，使得局部dataCenter和globalDataCenter引用相同
			var dc = runtimeLocalMap.dataCenter;
			if (!dc || dc == globalDataCenter) {
				var dataCenter = new unieap.ds.DataCenter();
				window["dataCenter"] = dataCenter;
				runtimeLocalMap.dataCenter = dataCenter;
			}
			var proxyString = DefinitionLocalMap.proxyString,
				context = DefinitionLocalMap.context || runtimeLocalMap.context || ("view:" + node.id);
			//已经存在同名上下文的变量，这时采用Iframe方式去加载
			if (typeof(window[context]) != "undefined" && window[context] != null && window[context].id != context) {
				DefinitionLocalMap = null;
				runtimeLocalMap = null;
				return true;
			}
			var clazz = new Function(templateString + "\n" + injectTemplate + "\n" + proxyString + "\nthis.dataCenter = dataCenter;"),
				instance = new clazz(runtimeLocalMap.dataCenter, node);
			window[context] = instance;
			DefinitionLocalMap = null;
			runtimeLocalMap.dataCenter = instance.dataCenter;
			runtimeLocalMap.context = context;
			runtimeLocalMap.instances.push([context, instance]);
		}
	}

	function trim(text) {
		text = text.replace(/^\s+/, "");
		for (var i = text.length - 1; i-- > 0;) {
			if (/\S/.test(text.charAt(i))) {
				text = text.substring(0, i + 1);
				break;
			}
		}
		return text;
	}
	//--------------------End: Internal variables and functions of unieap.loader------------------------
}();
//--------------------END: Defination of unieap.loader------------------------