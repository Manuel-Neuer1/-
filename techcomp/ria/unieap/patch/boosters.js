function _doAfterDijitRegistry(id,widget){
	
}
dojo.provide("unieap.patch.boosters");
(function(){
	if(false === unieap.isBoosters ){
		return;
	}
	dojo.require("dijit._Widget");
	var _WidgetConnect = dijit._Widget.prototype.connect;
	var bindEvents = {};
	var uiEvents = { //常用的监听事件定义
			'onmouseover' : 1,
			'onmouseout' : 1,
			'onmousemove' : 1,
			'onmousedown' : 1, 
			'onmouseup' : 1, 
			'onmove' : 1,
			'onclick' : 1, 
			'ondblclick' : 1, 
			'oncontextmenu' : 1,
			'onkeyup' : 1, 
			'onkeydown' : 1, 
			'onkeypress' : 1,
			'onfocus' : 1,
			'onblur' : 1,
			'onchange' : 1,
			'oncopy' : 1,
			'onpaste' : 1,
			'oncut' : 1
	};
function attachEvents(node){
	var widgetId;
	while(node){
		if(node.getAttribute && (widgetId= node.getAttribute("widgetId"))){
			unieap.attachEvent(dijit.byId(widgetId));
		}
		node = node.parentNode;
	}
};
unieap.attachEvent = function(widget){
	var widgetId = widget.id;
	if(widgetId in bindEvents){
		var cEvents = bindEvents[widgetId]; 
		for(var i=0,event;event=cEvents[i];i++){
			if(event[1]=="onfocus"){ //connect导致原来的方法还起作用
				event[0].onfocus = null;
			}
			_WidgetConnect.apply(widget,event);
		}
		delete bindEvents[widgetId]; 
	}
}
dojo.addOnLoad(function(){
	dojo.connect(document.body,"onmouseover",function(evt){
		attachEvents(evt.target);
	});
});

//重载dijit的remove方法，及时删除widget事件定义
var _remove = dijit.registry.remove;
dijit.registry.remove = function(id){
	_remove.apply(dijit.registry,arguments);
	delete bindEvents[id]
};

//重载dijit.registry的add方法，在不同的上下文下，允许出现相同的id
var _add=dijit.registry.add;

dijit.registry.add=function(widget){
	var id = widget.id;
	//如果存在WIDGET_CONTEXT上下文，就修改widget控件的id属性
	widget.id = (widget._rootID||"") + id;
	_add.apply(dijit.registry,arguments);
	_doAfterDijitRegistry(id,widget);
}


//mouseoverEventProxy
unieap.mep = function(target){
	var node = target;
	while(node){
		if(node.getAttribute && (widgetId= node.getAttribute("widgetId"))){
			target.onmouseover = null;
			if(!(widgetId in bindEvents)){
				return;
			}
			var cEvents = bindEvents[widgetId]; 
			for(var i=0,event;event=cEvents[i];i++){
				_WidgetConnect.apply(dijit.byId(widgetId),event);
			}
			delete bindEvents[widgetId]; 
			break;
		}
		node = node.parentNode;
	}
	if(document.createEventObject){
		target.fireEvent("onmouseover"); 
	} else {
		var event = document.createEvent("MouseEvent"); 
		event.initMouseEvent("mouseover",true,false);
		target.dispatchEvent(event); 
	}
}
//focusEventProxy
unieap.fep = function(target){
	var node = target;
	while(node){
		if(node.getAttribute && (widgetId= node.getAttribute("widgetId"))){
			target.onfocus = null;
			if(!(widgetId in bindEvents)){
				return;
			}
			var cEvents = bindEvents[widgetId]; 
			for(var i=0,event;event=cEvents[i];i++){
				_WidgetConnect.apply(dijit.byId(widgetId),event);
			}
			delete bindEvents[widgetId]; 
			break;
		}
		node = node.parentNode;
	}
	if(document.createEventObject){
		target.fireEvent("onfocus"); 
	} else {
		var event = document.createEvent("Event"); 
		event.initEvent("focus",true,false);
		target.dispatchEvent(event); 
	}
}
dojo.extend(dijit._Widget,{
	connect : function(obj,event,method,flag){
		if(false == flag || !(event in uiEvents)){
			_WidgetConnect.apply(this,arguments);
			return;
		}
		var cEvents = bindEvents[this.id] || (bindEvents[this.id] = []);
		cEvents.push([obj,event, method]);
	}	
});


//overload parser class
dojo.parser = new function(){
	// summary: The Dom/Widget parsing package
	var d = dojo;
	
	this._attrName = d._scopeName + "Type";
	this._query = "[" + this._attrName + "]";
	function val2type(/*Object*/ value){
		// summary:
		//		Returns name of type of given value.
		if(d.isString(value)){ return "string"; }
		if(typeof value == "number"){ return "number"; }
		if(typeof value == "boolean"){ return "boolean"; }
		if(d.isFunction(value)){ return "function"; }
		if(d.isArray(value)){ return "array"; } // typeof [] == "object"
		if(value instanceof Date) { return "date"; } // assume timestamp
		if(value instanceof d._Url){ return "url"; }
		return "object";
	}

	function str2obj(/*String*/ value, /*String*/ type){
		// summary:
		//		Convert given string value to given type
		switch(type){
			case "string":
				return value;
			case "number":
				return value.length ? Number(value) : NaN;
			case "boolean":
				// for checked/disabled value might be "" or "checked".  interpret as true.
				return typeof value == "boolean" ? value : !(value.toLowerCase()=="false");
			case "function":
				if(d.isFunction(value)){
					value=value.toString();
					value=d.trim(value.substring(value.indexOf('{')+1, value.length-1));
				}
				try{
					if(value.search(/[^\w\.]+/i) != -1){
						// The user has specified some text for a function like "return x+5"
						return new Function(value);
					}else{
						// The user has specified the name of a function like "myOnClick"
						return d.getObject(value, false);
					}
				}catch(e){ return new Function(); }
			case "array":
				return value ? value.split(/\s*,\s*/) : [];
			case "date":
				switch(value){
					case "": return new Date("");	// the NaN of dates
					case "now": return new Date();	// current date
					default: return d.date.stamp.fromISOString(value);
				}
			case "url":
				return d.baseUrl + value;
			default:
				return d.fromJson(value);
		}
	}

	var instanceClasses = {
	};

	dojo.connect(dojo, "extend", function(){
		instanceClasses = {};
	});
	//获取组件类的定义
	function getClassInfo(/*String*/ className){
		if(!instanceClasses[className]){
			// get pointer to widget class
			var cls = d.getObject(className);
			if(!d.isFunction(cls)){
				throw new Error("Could not load class '" + className +
					"'. Did you spell the name correctly and use a full path, like 'dijit.form.Button'?");
			}
			var proto = cls.prototype;
	
			// get table of parameter names & types
			var params = {};
			if(proto.UserInterfaces){
				params = proto.UserInterfaces;
			}
			else{
				var dummyClass = {};
				for(var name in proto){
					if(name.charAt(0)=="_"){ continue; } 	// skip internal properties
					if(name in dummyClass){ continue; }		// skip "constructor" and "toString"
					var defVal = proto[name];
					params[name]=val2type(defVal);
				}
			}
			instanceClasses[className] = { cls: cls, params: params };
		}
		return instanceClasses[className];
	}
	//获取属性配置内容
	function getAnnotation(node){
		var annotation  = node.getAttribute("unieap-data-annotation");
		return annotation && annotation.split(",");
	}
	this.instantiate = function(/* Array */nodes, /* Object? */mixin, /* Object? */args,/* function?*/callBack){
		var thelist = [], dp = dojo.parser,containerlist=[];
		mixin = mixin||{};
		args = args||{};
		for(var k=0,node;node=nodes[k];k++){
			if(!node){ return; }
			var type = dp._attrName in mixin?mixin[dp._attrName]:node.getAttribute(dp._attrName);
			if(!type || !type.length){ return; }
			var clsInfo = getClassInfo(type),
				clazz = clsInfo.cls;

			// read parameters (ie, attributes).
			// clsInfo.params lists expected params like {"checked": "boolean", "n": "number"}
			var params = {},
				attributes = node.attributes,
				parameters = clsInfo.params,
				annotation = getAnnotation(node);
				//使用注释方式告诉组件使用了哪些属性
			if(annotation!=null){
				for(var i=0,name;name=annotation[i];i++){
					var item = attributes.getNamedItem(name);
					if(item==null) continue;
					var value = item.value;
					switch(name){
						case "class":
							value = node.className;
							break;
						case "style":
							value = node.style && node.style.cssText; 
					}
					var _type = parameters[name];
					if(_type && typeof value == "string"){
						params[name] = str2obj(value, _type);
					}else{
						params[name] = value;
					}
				}
			}
			else{
				for(var name in parameters){
					var item = name in mixin?{value:mixin[name],specified:true}:attributes.getNamedItem(name);
					if(!item || (!item.specified && (!dojo.isIE || name.toLowerCase()!="value"))){ continue; }
					var value = item.value;
					// Deal with IE quirks for 'class' and 'style'
					switch(name){
					case "class":
						value = "className" in mixin?mixin.className:node.className;
						break;
					case "style":
						value = "style" in mixin?mixin.style:(node.style && node.style.cssText); // FIXME: Opera?
					}
					var _type = parameters[name];
					if(typeof value == "string"){
						params[name] = str2obj(value, _type);
					}else{
						params[name] = value;
					}
				}
			}
			if(args["xhr"]){
				params['_rootID'] =  args["rootNode"].id;
			}
			if("dataCenter"==clazz.prototype.Autowired){
				params['dataCenter'] = args['dataCenter'];
			}
			
			var markupFactory = clazz.markupFactory || clazz.prototype && clazz.prototype.markupFactory;
			// create the instance
			var instance = markupFactory ? markupFactory(params, node, clazz) : new clazz(params, node);
			thelist.push(instance);
			if(	!args.noStart && instance  && 
					instance.startup &&
					!instance._started && 
					(!instance.getParent || !instance.getParent())
				){
				containerlist.push(instance);
			}

			// map it to the JS namespace if that makes sense
			var jsname = node.getAttribute("jsId");
			if(jsname){
				d.setObject(jsname, instance);
			}
		};

		//在回调方法中将临时片段中的节点放回body,保证startup正常运行
		if(callBack){
			callBack();
		}
		
		if(!mixin._started){
			for(var i=containerlist.length-1;i>=0;i--){
				var instance = containerlist[i];
				instance.startup();
			}
		}
		return thelist;
	};
	//查找节点，根据postponeRender属性判断是否查找子节点，用于懒渲染功能
	function queryNodes(attrName,rootNode,args){
		var list = [],
			 node = rootNode.firstChild;
		while(node){
			if(node.getAttribute){
				if(node.getAttribute(attrName)){
					list.push(node);
					if("true"==node.getAttribute("postponeRender")){
						node = node.nextSibling;
						continue;
					}
				}else if(args["xhr"] && node.getAttribute("id")){
					//在单帧情况下对于html元素带id的加上rootId的前缀
					if(!compatAclome)
						node.setAttribute("id",((args["rootNode"]?args["rootNode"].id:"")||"") +node.getAttribute("id"));
				}
				var subList = queryNodes(attrName,node,args);
				if(subList.length>0){
					Array.prototype.push.apply(list,subList);
				}
			}
			node = node.nextSibling;
		}
		return list;
	}
	//把普通的Element转换成DocumentFragment文档片段
	function createDocumentFragment(node){
		if (11 != node.nodeType && !(dojo.isIE && dojo.isIE < 8)
			&& document.getElementsByTagName("OBJECT").length == 0) {
			// 如果nodeType类型不是documentFragment
			// 不是IE6 IE7
			// 没有object节点， flash在DocumentFragment中渲染会出现意想不到的问题
			var fragment = document.createDocumentFragment();
			while (node.hasChildNodes()) {
				fragment.appendChild(node.firstChild);
			}
			return fragment;
		}
		return node;
	}
	
	this.parse = function(/*DomNode?*/ node, /* Object? */ args){
		var fragment;
		args = args || {};
		//指定传入的DataCenter
		args.dataCenter = args.currentDataCenter;
		//指定parse的节点，默认是body
		node = node || document.body;
		//普通的加载方式
		if(!args["xhr"]){
			if(unieap.Action){
				var context = unieap.Action.getViewContext(node);
				if(context && context.rootNode){
					args["xhr"]=true;
					args["rootNode"] = context.rootNode; //一直找到xhr加载的根节点
					args["dataCenter"] = context.dataCenter;
				}
			}
			fragment = createDocumentFragment(node);
		}
		//此时是xhr加载方式，传递进来的rootNode是普通的Element或者DocumentFragment
		else{
			fragment = args.fragment || createDocumentFragment(node);
			args["rootNode"] = node;
		}
		//在单帧情况下对于html元素带id的加上rootId的前缀
		var list = queryNodes(this._attrName, fragment,args);

		if(args["xhr"] && unieap.animate){
			dojo.style(node,'opacity',0);
			dojo.animateProperty({
				node:node,
				properties:{opacity:1},
				duration:500
			}).play()
		}
		
		// go build the object instances
		var result =  this.instantiate(list, null, args,function(){
			node!=fragment && node.appendChild(fragment);			
		});
		return result;
	};
	
	var increament = 0;
	function queryNodesIgnoringJsContext(attrName, rootNode, args) {
		var list = [],
			node = rootNode.firstChild,
			type = "",
			binding = "",
			bindingRecords = [];
		while (node) {
			if (node.getAttribute) {
				if ((type = node.getAttribute(attrName))) {
					list.push(node);
					if (binding = node.getAttribute("binding")) {
						var bindingStr = binding.replace(/[\s,]*store:.*?(,|})/,function(storeStr){
							var result = "";
							storeStr = dojo.trim(storeStr);
							var fst = storeStr.charAt(0);
							var lst = storeStr.charAt(storeStr.length-1);
							
							if(fst===",")
							{
								//{...,store:'store'}
								if(lst==="}")
									result = "}";
								//{...,store:'store',...}
								else //if(lst===",")
									result = ",";
							}
							else //if(fst!==",")
							{
								//{store:'store',...}
								if(lst===",")
									result = "";
								//{store:'store'}
								else //if(lst==="}")
									result = "}";
							}
							storeStr = storeStr.replace(/[,}]/g,"");	
							var storeName = eval(storeStr.split(":")[1]);
							var jsId = node.getAttribute("jsId"),
							keepVar = true;
							if(!jsId)
							{
								jsId = ["jsId", increament++].join("-");
								node.setAttribute("jsId", jsId);
								keepVar = false;
							} 
							bindingRecords.push({
								jsId: jsId,
								type: type,
								storeName: storeName,
								keepVar:keepVar
							});
							
							return result;
						});
						
						node.setAttribute("binding",bindingStr);
					}
					if ("true" == node.getAttribute("postponeRender")) {
						node = node.nextSibling;
						continue;
					}
				} else if (args["xhr"] && node.getAttribute("id")) {
					//在单帧情况下对于html元素带id的加上rootId的前缀
					if(!compatAclome)
						node.setAttribute("id", ((args["rootNode"] ? args["rootNode"].id : "") || "") + node.getAttribute("id"));
				}
				var queryResult = queryNodesIgnoringJsContext(attrName, node, args);
				if (queryResult.nodeList.length > 0) {
					Array.prototype.push.apply(list, queryResult.nodeList);
				}
				if (queryResult.bindingRecords.length > 0) {
					Array.prototype.push.apply(bindingRecords, queryResult.bindingRecords);
				}
			}
			node = node.nextSibling;
		}
		return {
			nodeList: list,
			bindingRecords: bindingRecords
		};
	}

	this.parseIgnoringJsContext = function( /*DomNode?*/ node, /* Object? */ args) {
		var fragment;
		args = args || {};
		//指定传入的DataCenter
		args.dataCenter = args.currentDataCenter;
		//指定parse的节点，默认是body
		node = node || document.body;
		//普通的加载方式
		if (!args["xhr"]) {
			if (unieap.Action) {
				var context = unieap.Action.getViewContext(node);
				if (context && context.rootNode) {
					args["xhr"] = true;
					args["rootNode"] = context.rootNode; //一直找到xhr加载的根节点
				}
			}
			fragment = createDocumentFragment(node);
		}
		//此时是xhr加载方式，传递进来的rootNode是普通的Element或者DocumentFragment
		else {
			fragment = args.fragment || createDocumentFragment(node);
			args["rootNode"] = node;
		}
		//在单帧情况下对于html元素带id的加上rootId的前缀
		var queryResult = queryNodesIgnoringJsContext(this._attrName, fragment, args),
			list = queryResult.nodeList,
			bindingRecords = queryResult.bindingRecords;
		if (args["xhr"] && unieap.animate) {
			dojo.style(node, 'opacity', 0);
			dojo.animateProperty({
				node: node,
				properties: {
					opacity: 1
				},
				duration: 500
			}).play()
		}

		// go build the object instances
		var result = this.instantiate(list, null, args, function() {
			node != fragment && node.appendChild(fragment);
		});

		return {
			parsingResult: result,
			bindingRecords: bindingRecords
		};
	};
	
	
}();
})();
