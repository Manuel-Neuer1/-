var __buffer = unieap.ds.Buffer;
var __status = unieap.ds.Status;

/*-------------------------------------------------录制脚本相关的全局方法 BEGIN--------------------------------------------------------*/
 function toggleScriptModel(view,isOpen) {
     dojo.require("dijit.Toolbar");
     var rootId = view._rootNodeId;
     if (isOpen) {
        if (typeof(dijit.byId(rootId+"recordScript_toolbar")) == 'undefined') {
	        var recordScript_toolbar = new dijit.Toolbar({}, rootId+"recordScript_toolbar");
        }
        dojo.require("dijit.form.Button");
        var button = new dijit.form.Button({
            label: '录制脚本模式',
            showLabel: true,
            iconClass: "dijitEditorIcon dijitEditorIconNewPage",
            baseClass: ""
        });
        dijit.byId(rootId+"recordScript_toolbar").addChild(button);
        dojo.animateProperty({　　
			node:dojo.byId(rootId+"recordScript_toolbar"),
            duration: 　1200,
            properties: {
                 opacity: {
                      start: 0,
                      end: 1
                 }
             }　
         }).play();
         if (rootId != "") {
         	  var rootWidget = unieap.byId(rootId);
			  var isXDialogLoad = (typeof(rootWidget) != "undefined") ? ((rootWidget.declaredClass == "unieap.xdialog.Dialog") ? true : false) : false;
			  if(!isXDialogLoad){
              	unieap.recordScriptMap[rootId] = true;
			  }
         }
     }
     else {
          var mine = view;
          dojo.animateProperty({
			   node:dojo.byId(rootId+"recordScript_toolbar"),
               duration: 1200,
               properties: {
	               opacity: {
	                     start: 1,
	                     end: 0
	               }
                },
	           onEnd: function () {
	               dijit.byId(rootId+"recordScript_toolbar").destroyDescendants();
	           }
          }).play();
          if (rootId != "") {
               delete unieap.recordScriptMap[rootId];
          }
          dojo.style(dojo.byId(rootId+"recordScript_toolbar"),"border","0px"); //待完善
          dojo.style(dojo.byId(rootId+"recordScript_toolbar"),"padding","0px"); //待完善
      }
}
function addCaseButton(view,caseInfo) {
     dojo.require("dijit.form.Button");
     var rootId = view._rootNodeId;
     var button = new dijit.form.Button({
         label: caseInfo.caseName,
         showLabel: true,
         iconClass: "dijitEditorIcon dijitEditorIconPaste",
         caseId: caseInfo.caseId,
         onClick: function (evt) {
              view.navigator.forward("testcomp", "unittest", "testCase", "用例设计", caseInfo.caseId);
         }
      });
      dijit.byId(rootId+"recordScript_toolbar").addChild(button);
}

//获取相关脚本信息
function collectRecordScript(dc,view,processorName){
	if(unieap.recordScript){
		var tempView = view;
		if(view._viewcContext){
			var viewContextKey = view._rootNodeId == ""?"viewContext":view._rootNodeId;
			var viewContextArray = unieapViewContextHolder[viewContextKey];
			tempView = viewContextArray[viewContextArray.length-1];
			var instances = viewContextHolder[viewContextKey].instances;
			for(var i = 0; i < instances.length; i++){
				var instance = instances[i];
				if(instance[0] == tempView.name){
					tempView = instance[1];
					break;
				}
			}
		}
		if(tempView._isRecordScriptOpen){
			var rootId = tempView._rootNodeId;
			if(dijit.byId(rootId+"recordScript_toolbar")){
				var prefix = (tempView && tempView._rootNodeId) ? tempView._rootNodeId : ""; 
				var parameters = [];
				if(dc.parameters && dc.parameters._parameters){
					parameters = dc.parameters._parameters.split(',');
				}
				var parameterValues = [];
				for(var i = 0; i < parameters.length; i++){
					if(typeof(dc.getParameter(parameters[i])) == 'undefined'){
						if(!dc.getDataStore(parameters[i])){
							parameterValues.push("");
						}else{
							parameterValues.push(dc.getDataStore(parameters[i]).toJson());
						}
					}else{
						parameterValues.push(dc.getParameter(parameters[i]));
					}
				}
				var dialogData = {
									'processorName' : processorName,
									'methodBoId' :dc.getParameter('_boId'),
									'parameterValues' : parameterValues,
									'methodName' : dc.getParameter('_methodName')
								 };
	//			unieap.scriptDQ.push(dialogData);
				unieap.scriptDQ.unshift(dialogData);
				//将dc中传入_methodId
				dc.setParameter("_methodId","true");
			}
		}
	}
}

//处理相关脚本信息
function handleRecordScript(dc,view,processorName){
	if(unieap.recordScript){
		var tempView = view;
		if(view._viewcContext){
			var viewContextKey = view._rootNodeId == ""?"viewContext":view._rootNodeId;
			var viewContextArray = unieapViewContextHolder[viewContextKey];
			tempView = viewContextArray[viewContextArray.length-1];
			var instances = viewContextHolder[viewContextKey].instances;
			for(var i = 0; i < instances.length; i++){
				var instance = instances[i];
				if(instance[0] == tempView.name){
					tempView = instance[1];
					break;
				}
			}
		}
		if(tempView._isRecordScriptOpen){
			var rootId = tempView._rootNodeId;
			if(dijit.byId(rootId+"recordScript_toolbar")){
				for(var i = 0; i < unieap.scriptDQ.length;i++){
					if(unieap.scriptDQ[i]['processorName'] == processorName){
						unieap.scriptDQ[i]['methodId'] = dc.getParameter('_methodId');
						unieap.scriptDQ[i]['_sessionVarString'] = dc.getParameter('_sessionVarString');
						unieap.scriptDQ[i]['_requestVarString'] = dc.getParameter('_requestVarString');
					}
				}
				if(unieap.scriptCount < unieap.scriptDQ.length-1){
					unieap.scriptCount++;
					return;
				}else{  //最后一次
					unieap.scriptCount = 0;
					_handleLoadScript(tempView);
				}
				
			}
		}
	}
}

function _handleLoadScript(view){
//	var dialogData = unieap.scriptDQ.pop();
	var dialogData = unieap.scriptDQ.shift();
	var dialog = DialogUtil.createDialog({
					title:"录制测试数据",
					height:"150", 
					width:"350",
					url:unieap.WEB_APP_NAME+'/testcomp/unittest/processorAOP-view.jsp',
					iconCloseComplete : true,
					dialogData : dialogData,
					animate : true,
					'onComplete' : function(returnVal){
						if(returnVal != null){
							var caseInfo = unieap.fromJson(returnVal);
							//发送当前请求的为viewc，要获取其外层view，让外层view来处理
							if(view._viewcContext){
								var viewContextKey = this._rootNodeId == ""?"viewContext":this._rootNodeId;
								var viewObj = unieapViewContextHolder[viewContextKey][unieapViewContextHolder.length-1];
								addCaseButton(viewObj,caseInfo);
							}else{  //发送当前请求的为view，直接处理
								addCaseButton(view,caseInfo);
							}
						}
						if(unieap.scriptDQ.length > 0){
							_handleLoadScript(view);  //递归调用
//							arguments.callee(view);  //递归调用
						}
					}
				});
	dialog.show();
}
/*---------------------------------------------------录制脚本相关的全局方法 END--------------------------------------------------------------------------------*/

/**
 * 
 * 在processor请求之前调用
 * @param dc：请求提交的datacenter
 * @param view：该请求发起的view模型js对象
 * @param processorName：该请求对应processor的方法名
 * @return true：请求继续执行，false：请求中断
 * 
 */
function doBeforeRequest(dc,view,processorName){
	collectRecordScript(dc,view,processorName);  //添加录制脚本AOP
    return true;
}
/**
 * 
 * 在processor的成功回调之前调用
 * @param dc：成功回调的结果datacenter
 * @param view：该请求发起的view模型js对象
 * @param processorName：该请求对应processor的方法名
 * @return true：成功回调继续执行，false：成功回调中断
 * 
 */
function doBeforeSuccessResponse(dc,view,processorName){
    return true;
}
/**
 * 
 * 在processor的成功回调之后调用
 * @param dc：成功回调的结果datacenter
 * @param view：该请求发起的view模型js对象
 * @param processorName：该请求对应processor的方法名
 * @return void
 * 
 */
function doAfterSuccessResponse(dc,view,processorName){
	handleRecordScript(dc,view,processorName);  //添加录制脚本AOP
}
/**
 * 
 * 在processor的失败回调之前调用
 * @param dc：成功回调的结果datacenter
 * @param view：该请求发起的view模型js对象
 * @param processorName：该请求对应processor的方法名
 * @return true：失败回调继续执行，false：失败回调中断
 */
function doBeforeFailedResponse(dc,view,processorName){
	return true;
}
/**
 * 
 * 在processor的失败回调之后调用
 * @param dc：成功回调的结果datacenter
 * @param view：该请求发起的view模型js对象
 * @param processorName：该请求对应processor的方法名
 * @return void
 * 
 */
function doAfterFailedResponse(dc,view,processorName){
	handleRecordScript(dc,view,processorName);  //添加录制脚本AOP
}
if (!dojo._hasResource["unieap.view.View"]) {
	dojo.provide("unieap.view.View");
	dojo.declare("unieap.view.View", null, {
		
		_viewName : null,

		mixinMethodsSourceCache : new Array(),
		_emptyFn : function(){},
		
		processor : null,
		
		stateObj:null,
		
		state:null,
		
		getViewName: function(){
			return this._viewName;
		},

		postscript: function(){
			this.create();
		},
		
		getProcessor : function(){
			return this.processor;
		},
		
		
		create : function(){
		},
		
		init : function(){
			// 子类在此函数中实现页面加载时的初始操作
		},
		
		page_load: function () {
			//子类的page_load方法调用之前，会首先调用父类的page_load方法
			//将当前页面的view和viewc的名字保存起来
			var viewContextKey = this._rootNodeId == ""?"viewContext":this._rootNodeId;
			if(unieapViewContextHolder){
				var viewContext = unieapViewContextHolder[viewContextKey];
				if(!viewContext){
					viewContext = [];
					unieapViewContextHolder[viewContextKey] = viewContext;
				}
				var dcPatternArray = this.declaredClass.split("."),
					type = "view";
				
				if(this._viewcContext){
					type = "viewc";
				}
				var _viewName = dcPatternArray[dcPatternArray.length-2];
				viewContext.push({
					name : _viewName,
					type : type,
					declaredClass : this.declaredClass
				});
				this._viewName = _viewName;
			}
			
			/*******************************录制脚本相关初始化功能 BEGIN*****************************************/
			if(unieap.recordScript){
				if(!this._viewcContext){
					
					var div = document.createElement("div");
					div.id = this._rootNodeId+"recordScript_toolbar_div";
					dojo.addClass(div,"claro");
					var span = document.createElement("span");
					span.id=this._rootNodeId+"recordScript_toolbar";
					dojo.place(span, div, "first");
					dojo.style(span,"border","0px");
					//如果是普通的view，将<div>放置于<body>下，如果是XDialog对应的view，将<div>放置于XDialog的dialogMainContent结点下
					var	rootNode  = (this._rootNodeId == "")?dojo.body():dojo.byId(this._rootNodeId);
					if(this._rootNodeId != "" && unieap.byId(this._rootNodeId) != null && unieap.byId(this._rootNodeId).declaredClass == "unieap.xdialog.Dialog"){
						rootNode = unieap.byId(this._rootNodeId).dialogMainContent;
					}
					dojo.place(div, rootNode, 'first');
		
		            if (this._rootNodeId != "" && unieap.recordScriptMap[this._rootNodeId]) {
		                this._isRecordScriptOpen = true;
		                toggleScriptModel(this, true);
		            }
		            else {
		                this._isRecordScriptOpen = false;
		                var recordScript_toolbar = document.getElementById(this._rootNodeId+"recordScript_toolbar");
		                recordScript_toolbar && dojo.style(recordScript_toolbar, "display", "none");
		            }
					
					//本view订阅录制脚本相关事件
					var self = this;
		            var handler = unieap.subscribe("unitTestRecordScript", function (obj) {
		                if (typeof (self._isRecordScriptOpen) == 'undefined' || self._isRecordScriptOpen == null) {
		                	self._isRecordScriptOpen = true;
		                }
		                else {
		                	self._isRecordScriptOpen = !self._isRecordScriptOpen;
		                }
		                toggleScriptModel(self, self._isRecordScriptOpen);
		            });
		            
		            if (typeof (this._scribeHandles) != "undefined") {
		               this._scribeHandles.push(handler);
		            }
		            
				}
			}
            /*******************************录制脚本相关初始化功能 END*******************************************/
		},
		
		mapToJson:function(mapData){
			var jsonData = {};
			if(!mapData){
				return null;
			}
			for(var key in mapData){
				if(mapData[key] instanceof unieap.ds.DataStore 
				  || (mapData[key]!=null && mapData[key].declaredClass && mapData[key].declaredClass == "unieap.ds.DataStore")){
					jsonData[key] = mapData[key].toJson();
				}else{
					jsonData[key] = mapData[key];
				}
			}
			return jsonData;
		},

// forward:function(scid,dcid,module,viewPath,parameters){
// var
// base=unieap.WEB_APP_NAME+"/"+scid+"/"+dcid+"/"+(module?module+"_":"")+viewPath.replace('/','_')+"_entry.action";
// var url=unieap.buildRequestPath(base,parameters);
// window.location.href = url;
// },
		
		// add by wukj view forward 支持传递dataCenter
		forward : function(scid,dcid,viewPath,dc,parameters){
			var dataCenter = dc?dc : new unieap.ds.DataCenter();
// for(var x in parameters){
// dataCenter.addParameter(x,parameters[x]);
// }
			var reg = new RegExp("/","g"); 
			var base=unieap.WEB_APP_NAME+"/"+scid+"/"+dcid+"/"+viewPath.replace(reg,'_')+"_entry.action";
			var url=unieap.buildRequestPath(base,parameters);
			var form = dojo.create("form");
			form.action = url;
			form.method = "post";
			form.style.display = "none";
			var textarea = dojo.create("textarea");
			textarea.name = "_forwardDataCenter";
			textarea.value = dataCenter && dataCenter.toJson?dataCenter.toJson():String(dataCenter || "");
			form.appendChild(textarea);
			dojo.query("body")[0].appendChild(form);
			form.submit();
			return form;
		},
		_getFuncBindJSONStr : function(eventName, handlerVarName)
		{
			var x = "{" + eventName + " : " + handlerVarName + "};";
			return x;	
		},
		_getExistingFuncImpl : function(obj,eventName)
		{
			var x = obj[eventName];
			if(dojo.isFunction(x))
			{
				return x;
			}
			return this._emptyFn;
		},
		_getOriginImplKey : function(controlId, eventName)
		{
			return controlId + "_" + eventName;
		},
		connect : function(controlRef, eventName, eventHandler)
		{
			if(!dojo.isObject(controlRef) || controlRef == null) return;
			if(!dojo.isString(eventName) || eventName.length == 0) return;
			if(!dojo.isFunction(eventHandler)) return;
			
			var originImplKey = this._getOriginImplKey(controlRef.id, eventName);
			
			var sc = this.mixinMethodsSourceCache[originImplKey];
			if(sc == undefined || sc == null)
			{
				this.mixinMethodsSourceCache[originImplKey] = this._getExistingFuncImpl(controlRef, eventName);
			}
			var funcJSONStr = this._getFuncBindJSONStr(eventName, "eventHandler");
			eval("var funcJSON=" + funcJSONStr + ";");
			dojo.mixin(controlRef, funcJSON);
		},
		disconnect : function(controlRef, eventName)
		{
			if(!dojo.isObject(controlRef) || controlRef == null) return;
			if(!dojo.isString(eventName) || eventName.length == 0) return;
			
			var originImplKey = this._getOriginImplKey(controlRef.id, eventName);
			var originImpl = this.mixinMethodsSourceCache[originImplKey];
			if(originImpl == undefined || originImpl == null) return;
			
			var funcJSONStr = this._getFuncBindJSONStr(eventName, "originImpl");
			eval("var funcJSON=" + funcJSONStr + ";");
			dojo.mixin(controlRef, funcJSON);
			this.mixinMethodsSourceCache[originImplKey] = null;
		},	
		dataStore :  {
			collect : function(store, pattern, ignoreData){
				var dataStore  = new unieap.ds.DataStore();
				dojo.mixin(dataStore,store);
				if(!((dojo.isObject(pattern)&&pattern["metaData"]) || dataStore["statementName"])){
					delete dataStore["metaData"];  
				}
				if(dojo.isObject(pattern)){
					pattern = pattern["policy"];
				}	
				var newRowSet = new unieap.ds.RowSet();
				var array = pattern.split(',');
				if(array.length > 0){
					var len = array.length;
					var item = null;
					for(var index = 0; index < len; index++){
						item = array[index];
						switch(dojo.trim(item)){
							case "auto" : this._collectAuto(newRowSet, store["rowSet"]) ; break;
							case "none" : this._collectNone(newRowSet) ; break;
							case "all" : this._collectAll(newRowSet, store["rowSet"]) ; break;
							case "update" : this._collectUpdate(newRowSet, store["rowSet"]) ; break;
							case "delete" : this._collectDelete(newRowSet, store["rowSet"]) ; break;
							case "insert" : this._collectInsert(newRowSet, store["rowSet"], ignoreData) ; break;
							case "select" : this._collectSelect(newRowSet, store["rowSet"]); break;
							default : 
								if(dojo.isFunction(pattern))this._collectCallback(newRowSet,store["rowset"], pattern);  break;
						}
					}
				}
				newRowSet.setDataStore(store);
				dataStore["rowSet"] = newRowSet;
				dataStore["rowSet"].setDataStore(dataStore);
				return dataStore;
			},
			
			// 收集所有的数据
			_collectAll : function(newRowSet, rowSet){
				newRowSet["primary"] = rowSet["primary"] ;
				newRowSet["filter"] = rowSet["filter"];
				newRowSet["delete"] = rowSet["delete"] ;
			},
			// 不收集任何数据
			_collectNone : function(newRowSet){
				newRowSet["primary"] = [] ;
				newRowSet["filter"] = [] ;
				newRowSet["delete"] = [] ;
			},
			// 自动收集改变数据
			_collectAuto : function(newRowSet, rowSet){
				var callback = function(row){
					if(row.getRowStatus()==__status.DATAMODIFIED||row.getRowStatus()==__status.NEWMODIFIED)
						return true;
					return false;
				};
				this._collectBuffer(newRowSet,rowSet, callback,__buffer.PRIMARY);
				this._collectBuffer(newRowSet,rowSet, callback,__buffer.FILTER);
				this._collectDelete(newRowSet, rowSet);
			},
			// 收集删除数据，排除新增的
			_collectDelete : function(newRowSet, rowSet){
				this._collectDelBuffer(newRowSet, rowSet, function(row){
					if(row.getRowStatus()!=__status.NEWMODIFIED)
						return true;				
					return false;
				},__buffer.PRIMARY, __buffer.DELETE);
			},
			// 收集修改的
			_collectUpdate : function(newRowSet, rowSet){
				var callback = function(row){
					if(row.getRowStatus()==__status.DATAMODIFIED)
						return true;
					return false;
				};
				this._collectBuffer(newRowSet,rowSet,callback,__buffer.PRIMARY);
				this._collectBuffer(newRowSet,rowSet,callback,__buffer.FILTER);
			},
			// 收集新增的
			_collectInsert : function(newRowSet, rowSet, ignoreData){
				var callback = function(row){
					if(row.getRowStatus()==__status.NEWMODIFIED)
						return true;
					return false;
				};
				this._collectBuffer(newRowSet,rowSet, callback,__buffer.PRIMARY, ignoreData);
				this._collectBuffer(newRowSet,rowSet, callback,__buffer.FILTER);
			},
			// 收集选中的记录
			_collectSelect : function(newRowSet, rowSet){
				var callback = function(row){
					if(row.isRowSelected())
						return true;
					return false;
				};
				this._collectBuffer(newRowSet, rowSet, callback,__buffer.PRIMARY);
				this._collectBuffer(newRowSet,rowSet, callback,__buffer.FILTER);
				this._collectBuffer(newRowSet,rowSet, callback,__buffer.DELETE);
			},
			// 自定义收集
			_collectCallback : function(newRowSet,rowSet,callback){
				
				this._collectBuffer(newRowSet,rowSet, callback,__buffer.PRIMARY);
				this._collectBuffer(newRowSet,rowSet, callback,__buffer.FILTER);
				this._collectBuffer(newRowSet,rowSet, callback,__buffer.DELETE);
			},		
			// 收集指定缓冲区数据
			_collectBuffer : function(newRowSet, rowSet, callback,bufferName, ignoreData){
				var buffer = newRowSet._getBuff(bufferName);
				try{
					rowSet.forEach(function(row){
						if(callback(row,bufferName)){
							var data = row.getData();
							var isNeedCollect = true;
							var len = 0;
							// 对于新增数据的特殊处理，对于空row不记录新增
							if(data["_t"] == 1){  
								for(var item in data){
									if(ignoreData && data[item] == ignoreData[item])continue;
									len++;
									if(len > 1)break;
								}
								if(len == 1)
									isNeedCollect = false;
							}
							if(isNeedCollect)buffer.push(data);
						}
					},null,null,bufferName);		
				}catch(e){
					// 对于一些不需要收集的buffer，直接抛出一个Error即可跳出
				}	
			},
			// 收集删除数据
			_collectDelBuffer : function(newRowSet, rowSet, callback,bufferName, delBufferName){
				var buffer = newRowSet._getBuff(bufferName);
				try{
					rowSet.forEach(function(row){
						if(callback(row,delBufferName)){
							buffer.push(row.getData());
						}
					},null,null,delBufferName);		
				}catch(e){
					// 对于一些不需要收集的buffer，直接抛出一个Error即可跳出
				}	
			},
			
			/**
			 * @summary:
			 * 		将两个dataStore合并成一个新的dataStore,前提是两者的rowSetName属性一致
			 * @param:
			 * 		{object}store1
			 * 		用于合并的dataStore
			 * @param:
			 * 		{object}store2
			 * 		用于合并的dataStore
			 * @example:
			 *    view.dataStore.union(store1,store2);
			 */
			union : function(store1,store2){
				if(store1.getRowSetName() != store2.getRowSetName()){
					return null;
				}
				var unionStore = store1.clone("unionStore");
				unionStore.getRowSet().addRows(store2.getRowSet().getData());
				return unionStore;
			}
		},
		navigator : {
			_getNavigatorContainer: function(){
				var framePageContainer = unieap.byId("framePageContainer") || unieap.getTopWin().unieap.byId("framePageContainer");
				return framePageContainer.getSelectedTab().NavigatorContainer;
			},
			/**
			 * 
			 * 页面导航的穿透发起
			 * @param scid：目标页面所在SC的id
			 * @param dcid：目标页面所在DC的id
			 * @param viewPath：目标页面所属的路径
			 * @param title：导航主题，用于区分不同的穿透请求
			 * @param dc：穿透携带的数据，支持多种数据格式
			 * @param parameters：穿透请求携带的参数，可以不填
			 * 
			 */
			forward : function(scid, dcid, viewPath, title, dc, parameters){
				// add by lugj 增加对页面导航的处理
				 var reg = new RegExp("/","g"); 
				 var base = unieap.WEB_APP_NAME+"/"+scid+"/"+dcid+"/"+viewPath.replace(reg,'_')+"_entry.action";
				 var navigatorContainer = this._getNavigatorContainer();//unieap.byId("framePageContainer").getSelectedTab().NavigaterContainer;
				 navigatorContainer.currentTitle = title;
				 if(navigatorContainer.openPane(base, dc, title)){
				     var time = new Date();
				     beginTime = time.getTime();
				     var pane = navigatorContainer.getChildren()[0];
				     console.log("开始请求“"+ title +"”["+unieap.userAccount+" "+ pane.checkTime(time.getHours())+":"+pane.checkTime(time.getMinutes())+":"+pane.checkTime(time.getSeconds())+":"+pane.checkTime(time.getMilliseconds(), 1)+"]"+"...");
				     // unieap.publish(title, dc);
				     unieap.getTopWin().dojo.publish(navigatorContainer.id + title, [dc]);
				     return;
				 }
				 //拼接get请求的参数
				 if(typeof(parameters) != "undefined" && parameters){
					var parametersStr = "";
					for(var _key in parameters){
						if(parametersStr != ""){
							parametersStr += "&";
						}
						parametersStr += _key + "=" + parameters[_key];
					}
					if(parametersStr != ""){
						base += "?" + parametersStr;
					}
				 }
				 var navigatorPane = new unieap.getTopWin().unieapx.layout.NavigatorPane( {
					 data : dc,
					 title : title,
					 onShow : unieap.getTopWin().onSelectNavigatorPane,
					 href : base
				 });
				 navigatorContainer.addChild(navigatorPane);
				
				 unieap.getTopWin().unieap.loader.load( {
					 node : navigatorPane.containerNode,
					 url : base
				 });
			},
			/**
			 * 
			 * 页面导航的返回发起
			 * @param title：导航主题，用于区分不同的返回请求
			 * @param dc：返回携带的数据，可以支持多种数据格式
			 * 
			 */
			prePage : function(title, dc){
				 var navigatorContainer = this._getNavigatorContainer();//unieap.byId("framePageContainer").getSelectedTab().NavigaterContainer;
				 title && this._changeOnComplete(title);
				 navigatorContainer.prePage(dc);
			},
			/**
			 * 
			 * 页面导航的穿透成功
			 * @param title：导航主题，用于区分不同的穿透请求，需要和穿透发起的主题相同
			 * @param method：穿透成功后调用的方法，可以接收穿透发起时传输的数据
			 * 
			 */
			receiveData : function (title, method){
				var navigatorContainer = this._getNavigatorContainer();//unieap.byId("framePageContainer").getSelectedTab().NavigaterContainer,
					dc = navigatorContainer.getSelectedTab().data;
				(navigatorContainer.currentTitle == title) && method.apply(this,[dc]);
				// unieap.subscribe(title, method);
				var subscribehandle = unieap.getTopWin().dojo.subscribe(navigatorContainer.id + title, this, method);
				navigatorContainer.navigatorSubscribe.push(subscribehandle);
				navigatorContainer.getSelectedTab().navigatorSubscribe.push(subscribehandle);
			},
			/**
			 * 
			 * 页面导航的返回成功
			 * @param title：导航主题，用于区分不同的返回请求，需要和返回发起的主题相同
			 * @param method：返回成功后调用的方法，可以接收返回发起时传输的数据
			 * 
			 */
			onComplete : function (title, method, onCompleteByClick){
				var navigatorPane = this._getNavigatorContainer().getSelectedTab();//unieap.byId("framePageContainer").getSelectedTab().NavigaterContainer.getSelectedTab();
				if(typeof onCompleteByClick != 'undefined') {
					navigatorPane.setOnCompleteByClick(onCompleteByClick);
				}else{//(typeof(unieap.widget.navigator) != 'undefined') && (typeof(unieap.widget.navigator.alwaysShowNavigator) != 'undefined'))?
					navigatorPane.setOnCompleteByClick(((typeof(unieap.widget.navigator) != 'undefined') && (typeof(unieap.widget.navigator.alwaysShowNavigator) != 'undefined'))?unieap.widget.navigator.onCompleteByClick:false);
				}
				if(navigatorPane._navigatorPaneSubscribe==null){
					navigatorPane._navigatorPaneSubscribe = {};
				}
				
				navigatorPane._navigatorPaneSubscribe[title] = {method:method,onCompleteByClick:navigatorPane.getOnCompleteByClick()};
			},
			_changeOnComplete : function(title){
				var navigatorContainer = this._getNavigatorContainer();//unieap.byId("framePageContainer").getSelectedTab().NavigaterContainer;
				var navigatorPane = navigatorContainer.navigatorList.pop(),
					selectedNavigatPane = navigatorContainer.navigatorList.pop();
				navigatorContainer.navigatorList.push(selectedNavigatPane);
				navigatorContainer.navigatorList.push(navigatorPane);
				if(selectedNavigatPane._navigatorPaneSubscribe && selectedNavigatPane._navigatorPaneSubscribe[title]){
					selectedNavigatPane._onComplete = selectedNavigatPane._navigatorPaneSubscribe[title].method;
				}
			},
			setTitle : function(title){
				var currentNavigatorPane = this._getNavigatorContainer().getSelectedTab();
				currentNavigatorPane.controlButton.setTitle(title);
			}
		},
		/**
		 * 
		 * 获取国际化信息
		 * @param {string} key 国际化key
		 * @return {string}
		 * 
		 */
		i18n : function(key) {
			var dataCenter = this.dataCenter;
			var i18n = dataCenter.getParameter('i18n');
			if(typeof(i18n) != "undefined"){
				return (i18n[key] ? i18n[key] : key);
			}
			return key;
		}
	});	
}
if (!dojo._hasResource["unieap.view.Control"]) {
	dojo.provide("unieap.view.Control");
	dojo.declare("unieap.view.Control", null, {
		view : null,
		
		postscript: function(view){
			this.view = view ;
		},
		getRealId : function(id){
			return this.view._rootNodeId+id;
		},
		getDataCenter : function(id){
			return this.view.dataCenter;
		}
	});	
}

if (!dojo._hasResource["unieap.view.Controls"]) {
	dojo.provide("unieap.view.Controls");
	dojo.declare("unieap.view.Controls", unieap.view.Control, {
		setDataStore : function(id, store) {
			var id = this.getRealId(id);
			var object = unieap.byId(id);
// if(!object){
// MessageBox.alert( {
// title : '确认框',
// message : '不存在id为'+id+'的控件'
// });
// return;
// }
			if (object instanceof unieap.form.Form) {

				var form = object;
				if(form == null){
					return;
				}
				if(form.getBinding() ==null){
					return;
				}
				var formStore = form.getBinding().getDataStore();
				if (store == null) {
					var formRowSet = formStore.getRowSet();
// var formRowData = formRowSet.getRowData(0);
					formRowSet.deleteAllRows();
					formRowSet.resetUpdate();
					form.getBinding().setDataStore(formStore);
					return;
				}
				
				var bindRow = form.getBinding().getRow();
				
				if(store.getRowSet().getRowCount() <= 0){
					return;
				}
				var data = store.getRowSet().getRow(0).getData();
				if(formStore != null){
					if(bindRow == null){
						formStore.getRowSet().addRow(data,true,false);
						var inRowIndex = formStore.getRowSet().getRowCount('primary') - 1;
						form.getBinding().bind(formStore.getRowSet().getRow(inRowIndex));
					}else{
						for (var key in data){
							bindRow.setItemValue(key, data[key]);
						}
					}
					formStore.getRowSet().resetUpdate();
				}
			} else if (object instanceof unieap.grid.Grid) {
				var grid = object;
				if (!grid) {
					return;
				}
				grid.getBinding().setDataStore(store);
			} else if (object instanceof unieap.tree.Tree) {
				if (!object || !store) {
					return;
				}
				var tree = object,
					binding = tree.getBinding(),
					dataCenter = this.getDataCenter(),
					storeName = binding.getStore().getName(),
					treeDs = dataCenter.getDataStore(storeName);
				treeDs.append(store, "replace");
				binding.setDataStore(
						tree.getRootNode(),
						treeDs);
			}
		},
		/**
		 * 
		 * 从源DataStore中拷贝相同字段的值到目标DataStore中
		 * @param toDs {DataStore} 目标DataStore
		 * @param fromDs {DataStore} 源DataStore
		 * @param include {object} 拷贝的相同字段数组，默认值为all（即所有相同字段）
		 * @param remove {array} 移除的相同字段数组
		 * @return
		 */
		copySameItemValues:function(toDs,fromDs,include,remove){
			if(include != "all" && dojo.isArray(include)){
				this.copyItemValues(toDs,fromDs,include)
				return;
			}
			var sameItems = [];
			var toDsData = toDs.getRowSet().getRow(0).getData();
			var fromDsData = fromDs.getRowSet().getRow(0).getData();
			if(dojo.isArray(remove)){
				for(key in fromDsData){
					if(key in toDsData && !this.isRemoveItem(key,remove)){
						sameItems.push(key);
					}
				}
			}
			else{
				for(key in fromDsData){
					if(key in toDsData){
						sameItems.push(key);
					}
				}
			}
			this.copyItemValues(toDs,fromDs,sameItems);
		},
		/**
		 * 
		 * 从源DataStore中拷贝字段的值到目标DataStore中
		 * @param toDs {DataStore} 目标DataStore
		 * @param fromDs {DataStore} 源DataStore
		 * @param toKeys {array} 拷贝的字段数组
		 * @param fromKeys {array} 移除的字段数组
		 * @return
		 */
		copyItemValues:function(toDs,fromDs,toKeys,fromKeys){
			var toDsRow = toDs.getRowSet().getRow(0);
			var fromDsRow = fromDs.getRowSet().getRow(0);
			if(!fromKeys)
				fromKeys = toKeys;
			var fromKeysSize = fromKeys.length;
			for(var i=0;i<toKeys.length;i++){
				if(i<fromKeysSize){
				toDsRow.setItemValue(toKeys[i],fromDsRow.getItemValue(fromKeys[i]));
				}
			}
		},
		
		isRemoveItem:function(item,remove){
			for(var j=0;j<remove.length;j++){
				if(item == remove[j])
					return true;
			}
			return false;
		}
	});	
}

if (!dojo._hasResource["unieap.view.Form"]) {
	dojo.provide("unieap.view.Form");
	dojo.declare("unieap.view.Form", unieap.view.Control, {
		
		/**
		 * @summary:
		 * 		设置form对应的DataStore，如果传入的是null则绑定空行
		 * @param:
		 * 		{string}id
		 * 		对应form的id
		 * @param:
		 * 		{object}store
		 * 		用于初始化form的dataStore
		 * @param:
		 * 		{number}rowIndex
		 * 		将store中rowIndex对应的行绑定到form上，如果不传入，则默认绑定store的第一行
		 * @example:
		 *   view.form.setDataStore('form1',dataStore1);
		 */
		setDataStore : function(id, store,rowIndex) {	
			var form = unieap.byId(this.getRealId(id));
			if(form.getBinding() ==null){
				return;
			}
			//var bindRow = form.getBinding().getRow();
			var formStore = form.getBinding().getDataStore();
			if (store == null||store.getRowSet().getRowCount()==0) {
				if(typeof unieap.widget.form.keepValidationMessage != 'undefined' && unieap.widget.form.keepValidationMessage){
					var formRowSet = formStore.getRowSet();
					formRowSet.deleteAllRows();
					formRowSet.insertRow({});
					var row = formRowSet.getRow(0);
					form.getBinding().bind(row);
					return;
				}else{
					var formRowSet = formStore.getRowSet();
					formRowSet.deleteAllRows();
					formRowSet.resetUpdate();
					form.getBinding().setDataStore(formStore);
					return;
				}
			}
//			var data;
//			if(!isNaN(rowIndex)){
//				var row = store.getRowSet().getRow(rowIndex);
//				if(row){
//					data = row.getData();
//				}else {
//					return;
//				}
//			} else {
//				data = store.getRowSet().getRow(0).getData();
//			}
			// 替换store的名称
			if(formStore){
//				if(bindRow == null){
//					formStore.getRowSet().addRow(data,true,false);
//					var inRowIndex = formStore.getRowSet().getRowCount('primary') - 1;
//					form.getBinding().bind(formStore.getRowSet().getRow(inRowIndex));
//				}else{
//					bindRow.clear();
//					for (var key in data){
//						bindRow.setItemValue(key, data[key]);
//					}
//				}
				if(typeof unieap.widget.form.keepValidationMessage != 'undefined' && unieap.widget.form.keepValidationMessage){
					if(!isNaN(rowIndex)){
						var rowSetName = store.getRowSetName();
						if(rowSetName == undefined || rowSetName == ''){
							store.setRowSetName(formStore.getRowSetName());
						}
						var storeData = store.getRowSet().getRow(rowIndex).getData();
						var formStoreRowSet = form.getBinding().getDataStore().getRowSet();
						formStoreRowSet.deleteAllRows();
						formStoreRowSet.insertRow(storeData);
						var formStoreRow = formStoreRowSet.getRow(0);
						form.getBinding().bind(formStoreRow);
					}else{
						var rowSetName = store.getRowSetName();
						if(rowSetName == undefined || rowSetName == ''){
							store.setRowSetName(formStore.getRowSetName());
						}
						var storeData = store.getRowSet().getRow(0).getData();
						var formStoreRowSet = form.getBinding().getDataStore().getRowSet();
						formStoreRowSet.deleteAllRows();
						formStoreRowSet.insertRow(storeData);
						var formStoreRow = formStoreRowSet.getRow(0);
						form.getBinding().bind(formStoreRow);
					}						
				}else{
					store.setName(formStore.getName());
					var rowSetName = store.getRowSetName();
					if(rowSetName == undefined || rowSetName == ''){
						store.setRowSetName(formStore.getRowSetName());
					}
					if(!isNaN(rowIndex)){
							form.getBinding().setDataStore(store,rowIndex);
						}
					else{
							form.getBinding().setDataStore(store);
						}
				}
				!unieap.global.notResetUpdate && formStore.getRowSet().resetUpdate();
				
			}
		},
		/**
		 * @summary:
		 * 		设置form绑定的dataStore的数据值。
		 * 		如果dataStore没有行数据，则将数据对象作为一个行数据插入到dataStore中。
		 * 		如果dataStore有行数据，则将数据对象中的属性值赋值给dataStore。
		 * @param:
		 * 		{string}id
		 * 		对应form的id
		 * @param:
		 * 		{object}data
		 * 		用于赋值的数据对象，格式为："{column:value}"
		 * @example:
		 *   view.form.unionDataStore('form1',{id:'123',name:'unieap'});
		 */		
		unionDataStore : function(id,data) {
			var form = unieap.byId(this.getRealId(id));
			if(form.getBinding() ==null){
				return;
			}
			var store = form.getBinding().getDataStore();
			if(store.getRowSet().getRowCount() <= 0){
				store.getRowSet().addRow({});
			}			
			for(var p in data){
				store.getRowSet().setItemValue(0, p, data[p]);
			}
		},
		
		/**
		 * @summary:
		 * 		获取form对应的DataStore
		 * @param:
		 * 		{string}id
		 * 		对应form的id
		 * @example:
		 *   view.form.getDataStore('form1');
		 */
		getDataStore : function(id) {
			var form = unieap.byId(this.getRealId(id));
// if(!form){
// MessageBox.alert( {
// title : '确认框',
// message : '不存在id为'+id+'的控件'
// });
// return;
// }
			if(!form.getBinding()){
				return null;
			}
			var formStore = form.getBinding().getDataStore();
			return formStore;
		},
		/**
		 * @summary:
		 * 		获得form对应的DataStore的某个属性值
		 * @param:
		 * 		{string}id
		 * 		对应form的id
		 * @param:
		 * 		{string}propertyName
		 * 		属性的名称
		 * @example:
		 *   view.form.getPropertyValue('form1','id');
		 */
		getPropertyValue : function(id, propertyName) {
			var form = unieap.byId(this.getRealId(id));
// if(!form){
// MessageBox.alert( {
// title : '确认框',
// message : '不存在id为'+id+'的控件'
// });
// return;
// }
			if(form.getBinding() ==null){
				return null;
			}
			var store = form.getBinding().getDataStore();
			if(store.getRowSet().getRowCount() <= 0){
				return null;
			}
			var propertyValue = store.getRowSet().getItemValue(0, propertyName);
			return propertyValue;
		},
		/**
		 * @summary:
		 * 		设置form对应的DataStore的某个属性值
		 * @param:
		 * 		{string}id
		 * 		对应form的id
		 * @param:
		 * 		{string}propertyName
		 * 		属性的名称
		 * @param:
		 * 		{object}propertyValue
		 * 		属性值
		 * @example:
		 *   view.form.setPropertyValue('form1','id','123456');
		 */
		setPropertyValue : function(id, propertyName, propertyValue) {
			var form = unieap.byId(this.getRealId(id));
// if(!form){
// MessageBox.alert( {
// title : '确认框',
// message : '不存在id为'+id+'的控件'
// });
// return;
// }
			if(form.getBinding() ==null){
				return;
			}
			var store = form.getBinding().getDataStore();
			if(store.getRowSet().getRowCount() <= 0){
				return;
			}
			store.getRowSet().setItemValue(0, propertyName, propertyValue);
		}
	});	
}

if (!dojo._hasResource["unieap.view.Grid"]) {
	dojo.provide("unieap.view.Grid");
	dojo.declare("unieap.view.Grid", unieap.view.Control, {
		
		/**
		 * @summary:
		 * 		设置grid绑定的DataStore
		 * @param:
		 * 		{string}id
		 * 		对应grid的id
		 * @param:
		 * 		{object}store
		 * 		用于初始化grid的dataStore
		 * @example:
		 *  view.grid.setDataStore(dataStore1);
		 */
		setDataStore : function(id, store) {
			var grid = unieap.byId(this.getRealId(id));
// if (!grid) {
// MessageBox.alert( {
// title : '确认框',
// message : '不存在id为'+id+'的控件'
// });
// return;
// }
			var gridStore = grid.getBinding().getDataStore();
			
			if (store == null || store.getRowSet().getRowCount()=== 0) {
				gridStore.setPageNumber(1);
				gridStore.setRecordCount(0);
				var gridRowSet = gridStore.getRowSet();
				gridRowSet.deleteAllRows();
				gridRowSet.resetUpdate();
				grid.getBinding().setDataStore(gridStore);
				return;
			}
							
			// 替换store的名称
			if(gridStore){
				store.setName(gridStore.getName());
				var rowSetName = store.getRowSetName();
				if(rowSetName == undefined || rowSetName == ''){
					store.setRowSetName(gridStore.getRowSetName());
				}
			}
			grid.getBinding().setDataStore(store);
			//设置分页信息
			if(store.getParameter('processor')){
				var manager=grid.getManager('PagingManager');
				var processor={
					processor: store.getParameter('processor')
				}
				manager.setInfo(processor);		
			}
		},
		
		
		/**
		 * @summary:
		 * 		获取grid绑定的DataStore
		 * @param:
		 * 		{string}id
		 * 		对应grid的id
		 * @example:
		 *  view.grid.getDataStore('grid1');
		 */
		getDataStore : function(id) {
			var grid = unieap.byId(this.getRealId(id));
			if(!grid.getBinding()){
				return null;
			}
			var gridStore = grid.getBinding().getDataStore();
			return gridStore;
		},
		
		
		/**
		 * @summary:
		 * 		在Grid的指定位置插入一行数据
		 * @param:
		 * 		{string}id
		 * 		对应grid的id
		 * @param:
		 * 		{object}data
		 * 		待插入的行数据对象，格式为："{column:value}"，为空则新增空行
		 * @param:
		 * 		{number}index
		 * 		插入位置；不传入此值时，默认插入至最后一行
		 * @example:
		 *  view.grid.insertRow('grid1',{id:'001',name:'unieap'},0)
		 */
		insertRow:function(id,data,index){
			var grid = unieap.byId(this.getRealId(id));
			var dataStore = grid.getBinding().getDataStore();
			if (!dataStore) {
				return;
			}
			var rowSet = dataStore.getRowSet();
			if(data == null){
				data = {};
			}
			if(index != null){
				rowSet.insertRow(data, index ,true);
			} else {
				rowSet.insertRow(data,null,true);
			}
			!unieap.global.notResetUpdate&&rowSet.resetUpdate();
		},
		
		/**
		 * @summary:
		 * 		在Grid的指定位置插入若干行
		 * @param:
		 * 		{string}id
		 * 		对应grid的id
		 * @param:
		 * 		{object}store
		 * 		待插入的行数据组成的dataStore
		 * @param:
		 * 		{number}index
		 * 		插入位置；不传入此值时，默认插入至最后一行
		 * @example:
		 *  view.grid.insertRows('grid1',dataStore1,0)
		 */
		insertRows:function(id, store, index)
		{
			var grid = unieap.byId(this.getRealId(id));
			var dataStore = grid.getBinding().getDataStore();
			if (!dataStore) {
				return;
			}
			var rowSet = dataStore.getRowSet();
//			dataStore.setRowSetName(store.getRowSetName());
			if (store.getRowSet() && store.getRowSet().getRowCount() > 0) {
				for (var i = 0; i < store.getRowSet().getRowCount(); i++) {
					var row = store.getRowSet().getRow(i).getData();
					if(index != null) {
						rowSet.insertRow(row, index + i,true);
					} else {
						rowSet.insertRow(row,null,true);
					}
				}
				
				!unieap.global.notResetUpdate&&rowSet.resetUpdate();
			} else {
				return;
			}
		},
		
		deleteSelectedRow:function(id)
		{
// if(!unieap.byId(unieap.getRealId(id))){
// MessageBox.alert( {
// title : '确认框',
// message : '不存在id为'+id+'的控件'
// });
// return;
// }
			var rowSet = unieap.byId(this.getRealId(id)).getBinding().getDataStore().getRowSet();
			rowSet.deleteSelectedRows();
//			rowSet.resetUpdate();	
		},
		
		/**
		 * @summary:
		 * 		删除Grid中指定的某一行，如果不传入index值时，删除Grid选中的第一行。删除后会自动更新显示
		 * @param:
		 * 		{string}id
		 * 		对应grid的id
		 * @param:
		 * 		{number}index
		 * 		待删除的行索引；不传入此值时，默认删除Grid选中的第一行
		 * @example:
		 *  view.grid.deleteRow('grid1',3)
		 */
		deleteRow:function(id,index)
		{
			var grid = unieap.byId(this.getRealId(id));
// if (!grid) {
// MessageBox.alert( {
// title : '确认框',
// message : '不存在id为'+id+'的控件'
// });
// return;
// }
			var dataStore = grid.getBinding().getDataStore();
			if (!dataStore) {
				return;
			}
			var rowSet = dataStore.getRowSet();
			if (index != null) {
				rowSet.deleteRow(index);
			} else {
				var indexs = grid.getManager('SelectionManager').getSelectedRowIndexs();
				if (indexs && indexs.length > 0) {
					var delIndex = indexs[0];
					rowSet.deleteRow(delIndex);
				}
			}
			if(rowSet.getRowCount() == 0){
                grid.getManager("SelectionManager").setAllSelect(false);
            }
//			rowSet.resetUpdate();
		},
		
		/**
		 * @summary:
		 * 		删除Grid中指定的若干行，如果不传入indexs值时，删除Grid选中所有行。删除后会自动更新显示
		 * @param:
		 * 		{string}id
		 * 		对应grid的id
		 * @param:
		 * 		{object}indexs
		 * 		待删除的行索引构成的数组；不传入此值时，默认删除Grid选中的所有行
		 * @example:
		 *  view.grid.deleteRows('grid1',[1,3])
		 */
		deleteRows:function(id, indexs) {
			var grid = unieap.byId(this.getRealId(id));
// if (!grid) {
// MessageBox.alert( {
// title : '确认框',
// message : '不存在id为'+id+'的控件'
// });
// return;
// }
			var dataStore = grid.getBinding().getDataStore();
			if (!dataStore) {
				return;
			}
			var rowSet = dataStore.getRowSet();
			if (indexs && indexs.length > 0) {
				var len = indexs.length;
				var temp = null;
				for(var m = 0; m < len; m++){
					for(var n = m+1; n < len; n++){
						if(indexs[m] == indexs[n]){//去除重复项的干扰
							indexs[m] = -1;
							break;
						} else if(indexs[m] < indexs[n]){//降序排列，防止删除后干扰顺序
							temp = indexs[n];
							indexs[n] = indexs[m];
							indexs[m] = temp;
						}
					}
				}
				for (var i = 0; i < indexs.length; i++) {
					rowSet.deleteRow(indexs[i]);
				}
			} else {
				rowSet.deleteSelectedRows();
			}
			if(rowSet.getRowCount() == 0){
                grid.getManager("SelectionManager").setAllSelect(false);
            }
//			rowSet.resetUpdate();
		},
		
		/**
		 * @summary:
		 * 		更新Grid中指定的某一行，如果不传入index值时，更新Grid选中的第一行。更新后会自动更新显示
		 * @param:
		 * 		{string}id
		 * 		对应grid的id
		 * @param:
		 * 		{object}store
		 * 		用于更新的数据构成的dataStore，其RowSet中只包含一行数据
		 * @param:
		 * 		{number}index
		 * 		待更新的行索引；不传入此值时，默认更新Grid选中的第一行的内容
		 * @example:
		 *  view.grid.updateRow('grid1',dataStore1,2)
		 */
		updateRow:function(id, store, index)
		{
			var grid = unieap.byId(this.getRealId(id));
// if(!grid){
// MessageBox.alert( {
// title : '确认框',
// message : '不存在id为'+id+'的控件'
// });
// return;
// }
			if (!store) {
				return;
			}
			var gridStore = grid.getBinding().getDataStore();
			if (!gridStore) {
				return;
			}
			var rowData = store.getRowSet().getRow(0).getData();
			var selectedRow = null;
			var indexTemp = null;
			if (typeof index == 'undefined'||index==null){
				var selIndexs = grid.getManager('SelectionManager').getSelectedRowIndexs();
				if (selIndexs && selIndexs.length > 0) {
					var rowIndex = selIndexs[0];
					selectedRow = gridStore.getRowSet().getRow(rowIndex);
					indexTemp = rowIndex;
				} else {
					return;
				}
			}else {
				selectedRow = gridStore.getRowSet().getRow(index);
				indexTemp = index;
			} 
			
			for (var key in rowData) {
// if (rowData[key] != null)
					selectedRow.setItemValue(key, rowData[key]);
			}
// var row = new unieap.ds.Row();
// for (var key in rowData) {
// row.setItemValue(key, rowData[key]);
// }
// gridStore.getRowSet().updateRow(indexTemp, row);
			!unieap.global.notResetUpdate&&gridStore.getRowSet().resetUpdate();
		},
		
		updateSelectedRow:function(id,store)
		{
// if(!unieap.byId(unieap.getRealId(id))){
// MessageBox.alert( {
// title : '确认框',
// message : '不存在id为'+id+'的控件'
// });
// return;
// }
			var grid = unieap.byId(this.getRealId(id));
			var rowData = store.getRowSet().getRow(0).getData();
			var gridStore = grid.getBinding().getDataStore();
			var indexs = grid.getManager('SelectionManager').getSelectedRowIndexs();
			var rowIndex = indexs[0];
			var selectedRow = gridStore.getRowSet().getRow(rowIndex);
			for(var key in rowData){
				selectedRow.setItemValue(key,rowData[key]);
			}
			!unieap.global.notResetUpdate&&gridStore.getRowSet().resetUpdate();
		},

		/**
		 * @summary:
		 * 		获得grid对应的一行数据，封装为dataStore的格式，当不传入index值时，默认取Grid选中的第一行数据，并组装成一个dataStore返回
		 * @param:
		 * 		{string}id
		 * 		需要添加数据的grid id
		 * @param:
		 * 		{number}index
		 * 		要获取的数据的行索引；不传入此值时，取Grid选中的第一行
		 * @example:
		 *   view.grid.getRow('grid1',2)
		 */
		getRow:function(id,index)
		{
			var grid = unieap.byId(this.getRealId(id));
// if (!grid) {
// MessageBox.alert( {
// title : '确认框',
// message : '不存在id为'+id+'的控件'
// });
// return;
// }
			var store = grid.getBinding().getDataStore();
			if (!store) {
				return null;
			}
			var rowData = null;
			if(index != null){
				var row = store.getRowSet().getRow(index);
				if (!row) {
					return null;
				}
				rowData = row.getData();
			} else {
				var rowIndexs = grid.getManager("SelectionManager").getSelectedRowIndexs();
				if(rowIndexs != null && rowIndexs.length > 0){
					var index = rowIndexs[0];
					var row = store.getRowSet().getRow(index);
					if (!row) {
						return null;
					}
					rowData = row.getData();
				}else{
					return null;
				}
			}
			var ds = new unieap.ds.DataStore();
			ds.setName(store.getName());
			ds.setRowSetName(store.getRowSetName());
			ds.getRowSet().addRow(rowData,true,true);
			return ds;
			
		},
		
		/**
		 * @summary:
		 * 		根据传入的属性名称和属性值获取与之相匹配的行索引数组
		 * @param:
		 * 		{string}id
		 * 		对应grid的id
		 * @param:
		 * 		{string}propertyName
		 * 		属性的名称
		 * @param:
		 * 		{object}propertyValue
		 * 		属性值
		 * @example:
		 *   view.grid.getRowIndexsByPropertyValue('grid1','id','123456')
		 */
	    getRowIndexsByPropertyValue:function(id,propertyName,propertyValue){
			var grid = unieap.byId(this.getRealId(id));
			var store = grid.getBinding().getDataStore();
			if (!store) {
				return null;
			}
			var indexList = [];
			for(var i = 0, j= store.getRowSet().getRowCount();i<j;i++){
			var dsProperty = store.getRowSet().getRow(i).getItemValue(propertyName);
			if(dsProperty == propertyValue){
					indexList.push(i);
				}
			}
			return indexList;
		},
				
		/**
		 * @summary:
		 * 		获得grid对应的多行数据，封装为dataStore的格式，当不传入indexs值时，默认取Grid所有选中的行，并组装成一个dataStore返回
		 * @param:
		 * 		{string}id
		 * 		对应grid的id
		 * @param:
		 * 		{object}indexs
		 * 		要获取的数据的行索引构成的数组；不传入此值时，取Grid所有选中的行
		 * @example:
		 *   view.grid.getRows('grid1');
		 */
		getRows:function(id, indexs)
		{
			var grid = unieap.byId(this.getRealId(id));
// if (!grid) {
// MessageBox.alert( {
// title : '确认框',
// message : '不存在id为'+id+'的控件'
// });
// return;
// }
			var store = grid.getBinding().getDataStore();
			if (!store) {
				return null;
			}
			var rowData = null;
			var ds = new unieap.ds.DataStore();
			ds.setName(store.getName());
			ds.setRowSetName(store.getRowSetName());
			if(indexs && indexs.length > 0){
				for (var i = 0; i < indexs.length; i ++) {
					var row = store.getRowSet().getRow(indexs[i]);
					if (!row) {
						continue;
					}
					rowData = row.getData();
					ds.getRowSet().addRow(rowData,true);
				}
				
			} else {
				var rowIndexs = grid.getManager("SelectionManager").getSelectedRowIndexs();
				if(rowIndexs != null && rowIndexs.length > 0){
					for (var i = 0; i < rowIndexs.length; i ++) {
						var row = store.getRowSet().getRow(rowIndexs[i]);
						if (!row) {
							continue;
						}
						rowData = row.getData();
						ds.getRowSet().addRow(rowData,true);
					}
				}else{
					return null;
				}
			}
			
			return ds;
		},
		
		exchangeRow:function(id,index1,index2){
// if(!unieap.byId(unieap.getRealId(id))){
// MessageBox.alert( {
// title : '确认框',
// message : '不存在id为'+id+'的控件'
// });
// return;
// }
			var rowSet = unieap.byId(this.getRealId(id)).getBinding().getDataStore().getRowSet();
			var row1 = rowSet.getRow(index1);
			var row2 = rowSet.getRow(index2);
			if(row1 && row2){
				rowSet.updateRow(index1,row2);
				rowSet.updateRow(index2,row1);
				!unieap.global.notResetUpdate&&rowSet.resetUpdate();
			}
		},
		
		getSelectedStore:function(id){
// if(!unieap.byId(unieap.getRealId(id))){
// MessageBox.alert( {
// title : '确认框',
// message : '不存在id为'+id+'的控件'
// });
// return;
// }
			var rowData = this.getRow(id).getRowSet.getRowData(0);
			if(rowData == null){
				return null;
			}
			var store = this.getDataStore(id);
			var ds = new unieap.ds.DataStore();
			ds.setName(store.getName());
			ds.setRowSetName(store.getRowSetName());
			ds.getRowSet().addRow(rowData,true);
			return ds;
		},
		
		/**
		 * @summary:
		 * 		获得Grid中某行数据的某个属性的值，当不传入index值时，默认取Grid所有选中的第一行对应的属性值
		 * @param:
		 * 		{string}id
		 * 		对应grid的id
		 * @param:
		 * 		{string}propertyName
		 * 		属性的名称
		 * @param:
		 * 		{number}index
		 * 		要获取的数据的行索引；不传入此值时，取Grid选中的第一行
		 * @example:
		 *   view.grid.getPropertyValue('grid1','id',2);
		 */
		getPropertyValue : function(id, propertyName, index) {
			var grid = unieap.byId(this.getRealId(id));
// if (!grid) {
// MessageBox.alert( {
// title : '确认框',
// message : '不存在id为'+id+'的控件'
// });
// return;
// }
			var store = grid.getBinding().getDataStore();
			if (!store) {
				return null;
			}
			var rowData = null;
			if(index != null){
				var row = store.getRowSet().getRow(index);
				if (!row) {
					return null;
				}
				rowData = row.getData();
			} else {
				var rowIndexs = grid.getManager("SelectionManager").getSelectedRowIndexs();
				if(rowIndexs != null && rowIndexs.length > 0){
					var index = rowIndexs[0];
					var row = store.getRowSet().getRow(index);
					if (!row) {
						return null;
					}
					rowData = row.getData();
				}else{
					return null;
				}
			}
			
			return rowData[propertyName];
			
		},

		/**
		 * @summary:
		 * 		设置Grid中某行数据的某个属性的值，当不传入index值时，默认设置Grid所有选中的第一行对应的属性值
		 * @param:
		 * 		{string}id
		 * 		对应grid的id
		 * @param:
		 * 		{string}propertyName
		 * 		属性的名称
		 * @param:
		 * 		{object}propertyValue
		 * 		属性值
		 * @param:
		 * 		{number}index
		 * 		要设置数据的行索引；不传入此值时，取Grid选中的第一行
		 * @example:
		 *   view.grid.setPropertyValue('grid1','id','123456',2);
		 */
		setPropertyValue : function(id, propertyName, propertyValue, index) {
			var grid = unieap.byId(this.getRealId(id));
// if (!grid) {
// MessageBox.alert( {
// title : '确认框',
// message : '不存在id为'+id+'的控件'
// });
// return;
// }
			var store = grid.getBinding().getDataStore();
			if (!store) {
				return;
			}
			var resultRow = null;
			if(index != null){
				var row = store.getRowSet().getRow(index);
				if (!row) {
					return;
				}
				resultRow = row;
			} else {
				var rowIndexs = grid.getManager("SelectionManager").getSelectedRowIndexs();
				if(rowIndexs != null && rowIndexs.length > 0){
					var index = rowIndexs[0];
					var row = store.getRowSet().getRow(index);
					if (!row) {
						return;
					}
					resultRow = row;
				}else{
					return;
				}
			}
			
			resultRow.setItemValue(propertyName, propertyValue);
			
		}
	});	
}

if (!dojo._hasResource["unieap.view.Tree"]) {
	dojo.provide("unieap.view.Tree");
	dojo.declare("unieap.view.Tree", unieap.view.Control, {
		getNodeDataStore:function(id,object){
			var ds = new unieap.ds.DataStore();
			var rowSetName = unieap.byId(this.getRealId(id)).getBinding().getStore().getRowSetName();
			ds.setRowSetName(rowSetName);
			if(object instanceof unieap.tree.TreeNode){
				var data = object.getData();
				ds.getRowSet().addRow(data,true,false);
			}else if(object instanceof Array){
				ds.getRowSet().addRows(dojo.clone(object));
			}else{
				ds.getRowSet().addRow(object,true,false);
			}
			return ds;
		
		},
		 /**
		 * @summary:
		 * 		用于树初始化和加载数据,在树控件的某一节点下添加store返回的节点 
		 * @param:
		 * 		{string}id
		 * 		对应tree的id
		 * @param:
		 * 		{object}selectedNode
		 * 		指定的节点；当不传入此值时，默认为当前节点
		 * @param:
		 * 		{object}store
		 * 		子节点对应的dataStore
		 * @param:
		 * 		{object}configMap
		 * 		节点加载数据和显示的配置，结构为键值对形式,当不传入此参数时，使用tree的默认配置。
		 * @example:
		 *      view.tree.addChildren('tree1',store1);
		 */
		addChildren:function(id,selectedNode,store,configMap)
		{
			var treeDs = new unieap.ds.DataStore();
			
			var tree = unieap.byId(this.getRealId(id));
// if(!tree){
// MessageBox.alert( {
// title : '确认框',
// message : '不存在id为'+id+'的控件'
// });
// return;
// }
			if (!store) {
				return;
			}
			var count = store.getRowSet().getRowCount();
			var id = tree.getBinding().id;
			var label = tree.getBinding().label;
			var parent = tree.getBinding().parent;
			var leaf = tree.getBinding().leaf;
			
// var children = selectedNode.getChildren();
// if (children && children.length > 0) {
// for (var i = 0; i < children.length; i++) {
// var data = children[i];
// treeDs.getRowSet().addRow(data);
// }
// }
			
			if(count > 0 ){
				// 遍历返回的dataStore
				for(var i = 0;i < count; i++){
					var rowData = {};
					
// for(var key in configMap){
// var valueInMap = configMap[key];
// if(key == 'leaf' && typeof valueInMap == 'boolean'){
// rowData[leaf] = valueInMap;
// }else{
// var rowSet = store.getRowSet();
// var value = rowSet.getItemValue(i, valueInMap);
// if (value) {
// rowData[key] = value;
// }
// }
// }
					var rowSet = store.getRowSet();
					if (configMap) {
						if (typeof configMap['leaf'] == 'boolean') {
							rowData[leaf] = configMap['leaf'];
						} else {
							rowData[leaf] = rowSet.getItemValue(i, configMap['leaf']);
						}
						rowData[id] =  rowSet.getItemValue(i, configMap['id']);
						rowData[parent] =  rowSet.getItemValue(i, configMap['parent']);
						rowData[label] =  rowSet.getItemValue(i, configMap['label']);
						
						var rowDataInStore = rowSet.getRowData(i);
						for (var key in rowDataInStore) {
							if (key == configMap['id'] || key == configMap['leaf'] || key == configMap['parent']
								   || key == configMap['label']) {
								continue;
							} else {
								rowData[key] = rowDataInStore[key];
							}
							
						}
						
					} else {
						rowData[id] =  rowSet.getItemValue(i, id);
						rowData[parent] =  rowSet.getItemValue(i, parent);
						rowData[label] =  rowSet.getItemValue(i,label);
						rowData[leaf] = rowSet.getItemValue(i, leaf);
						
						var rowDataInStore = rowSet.getRowData(i);
						for (var key in rowDataInStore) {
							if (key == id || key == parent || key == label
								   || key == leaf) {
								continue;
							} else {
								rowData[key] = rowDataInStore[key];
							}
							
						}
						
					}
					
					treeDs.getRowSet().addRow(rowData,true);
				}
				tree.getBinding().setDataStore(selectedNode, treeDs);
			}
		},
		
		init:function(id,store,configMap){
// if (!unieap.byId(unieap.getRealId(id))) {
// MessageBox.alert( {
// title : '确认框',
// message : '不存在id为'+id+'的控件'
// });
// return;
// }
			if(!store){
				return;
			}
			var tree = unieap.byId(this.getRealId(id));
			if(configMap){              // 懒加载
				var rootNode = tree.getRootNode();
				if(rootNode){
					this.addChildren(id,rootNode,store,configMap);
				}
			}else{                      // 全加载
				var binding = tree.getBinding(),
					dataCenter = this.getDataCenter(),
					storeName = binding.getStore().getName(),
					treeDs = dataCenter.getDataStore(storeName);
				treeDs.append(store, "replace");
				treeDs.setName(storeName);
				binding.setDataStore(
						tree.getRootNode(),
						treeDs);
			}
		},
		/**
		 * @summary:
		 * 		使用dataStore中的数据初始化tree 
		 * @param:
		 * 		{string}id
		 * 		对应tree的id
		 * @param:
		 * 		{object}store
		 * 		用于初始化tree的dataStore
		 * @example:
		 *      view.tree.setDataStore('tree1',store1);
		 */
		setDataStore : function(id, store){
// if (!unieap.byId(unieap.getRealId(id))) {
// MessageBox.alert( {
// title : '确认框',
// message : '不存在id为'+id+'的控件'
// });
// return;
// }
			var rowSetName = unieap.byId(this.getRealId(id)).getBinding().getStore().getRowSetName();
			if(store!=null)	
				store.setRowSetName(rowSetName);
			this.init(id, store);
		}, 
		/**
		 * @summary:
		 * 		删除tree指定的某个节点
		 * @param:
		 * 		{string}id
		 * 		对应tree的id
		 * @param:
		 * 		{object}nodes
		 * 		指定的节点；当不传入此值时，默认为当前节点
		 * @example:
		 *      view.tree.deleteNode('tree1',node);
		 */
		deleteNode : function(id, node) {
			var tree = unieap.byId(this.getRealId(id));
// if (!tree) {
// MessageBox.alert( {
// title : '确认框',
// message : '不存在id为'+id+'的控件'
// });
// return;
// }
			if(!node){
				node = tree.getCurrentNode();
			}
			if (tree && node) {
				tree.deleteNode(node,true);
			}
		},
		/**
		 * @summary:
		 * 		删除tree指定的某些节点
		 * @param:
		 * 		{string}id
		 * 		对应tree的id
		 * @param:
		 * 		{object}nodes
		 * 		指定的节点的数组；当不传入此值时，默认为当前节点
		 * @example:
		 *      view.tree.deleteNodes('tree1',nodes);
		 */
		deleteNodes : function(id, nodes) {
// if (!unieap.byId(unieap.getRealId(id))) {
// MessageBox.alert( {
// title : '确认框',
// message : '不存在id为'+id+'的控件'
// });
// return;
// }
			for (var i = 0; i < nodes.length; i++) {
				this.deleteNode(id, nodes[i]);
			}
		},
		/**
		 * @summary:
		 * 		更新tree指定的节点
		 * @param:
		 * 		{string}id
		 * 		对应tree的id
		 * @param:
		 * 		{object}node
		 * 		指定的节点
		 * @param:
		 * 		{object}node
		 * 		存放更新数据的dataStore
		 * @example:
		 *      view.tree.updateNode('tree1',node,store1);
		 */
		updateNode : function(id,node,store) {
			var tree = unieap.byId(this.getRealId(id));
// if (!tree) {
// MessageBox.alert( {
// title : '确认框',
// message : '不存在id为'+id+'的控件'
// });
// return;
// }
			var id = tree.getBinding().id;
			var label = tree.getBinding().label;
			var parent = tree.getBinding().parent;
			var leaf = tree.getBinding().leaf;
			var row = tree.getBinding().getRow(node);
			var treeRowData = row.getData();
			var rowData = store.getRowSet().getRowData(0);
// for (var key in treeRowData) {
// row.setItemValue(key, rowData[key]);
// }
			if (rowData[id]) {
				row.setItemValue(id, rowData[id]);
			}
			if (rowData[label]) {
				row.setItemValue(label, rowData[label]);
			}
			if (rowData[parent]) {
				row.setItemValue(parent, rowData[parent]);
			}
			if (rowData[leaf]) {
				row.setItemValue(leaf, rowData[leaf]);
			}
			
			for (var key in rowData) {
				if (key != id && key != label && key != parent && key != leaf) {
					row.setItemValue(key, rowData[key]);
				}
			}
			
			tree.freshNodeLabel(node);
		}, 
		/**
		 * @summary:
		 * 		获得tree指定节点的属性值
		 * @param:
		 * 		{string}id
		 * 		对应tree的id
		 * @param:
		 * 		{object}node
		 * 		指定的节点
		 *  @param:
		 * 		{string}propertyName
		 * 		属性名称
		 * @example:
		 *      view.tree.getPropertyValue('tree1',node,'id');
		 */
		getPropertyValue : function(id, node, propertyName) {
			var tree = unieap.byId(this.getRealId(id));
// if(!tree){
// MessageBox.alert( {
// title : '确认框',
// message : '不存在id为'+id+'的控件'
// });
// return;
// }
			if (!node) {
				return;
			}
			return node.getData()[propertyName];
		}, 
		
		getChildrenNodes:function(node,childrenNodes) {
			if(node == null){
				return;
			}
			var children = node.getChildren();
			if(children == null){
				return;
			}
			for(var i = 0; i < children.length;i++){
				childrenNodes.push(children[i]);
				this.getChildrenNodes(children[i],childrenNodes);
			}
		},
		
		/*
		 * 获得一棵树的所有节点 id:树控件的id isContainRoot：true代表包含根节点，false代表不包含根节点
		 */
		 getAllNodes:function(id,isContainRoot,node){
			var tree = unieap.byId(this.getRealId(id));
// if(!tree){
// MessageBox.alert( {
// title : '确认框',
// message : '不存在id为'+id+'的控件'
// });
// return;
// }
			if(!node){
				var root = tree.getRootNode();
				var nodes = [];
				if(isContainRoot){
					nodes.push(root);
				}
				this.getChildrenNodes(root,nodes);
				return nodes;
			}else{
				var nodes = [];
				if(isContainRoot){
					nodes.push(node);
				}
				this.getChildrenNodes(node,nodes);
				return nodes;
			}
			
		 },
		/**
		 * @summary:
		 * 		设置tree指定节点的属性值
		 * @param:
		 * 		{string}id
		 * 		对应tree的id
		 * @param:
		 * 		{object}node
		 * 		指定的节点
		 * @param:
		 * 		{string}propertyName
		 * 		属性名称
		 * @param:
		 * 		{string}propertyValue
		 * 		属性值
		 * @example:
		 *      view.tree.setPropertyValue('tree1',node,'id','123456');
		 */
		setPropertyValue : function(id, node, propertyName, propertyValue) {
			var tree = unieap.byId(this.getRealId(id));
// if (!tree) {
// MessageBox.alert( {
// title : '确认框',
// message : '不存在id为'+id+'的控件'
// });
// return;
// }
			if(!node){
				return;
			}
			var row = tree.getBinding().getRow(node);
			row.setItemValue(propertyName, propertyValue);
		}
	});	
}
if (!dojo._hasResource["unieap.view.Map"]) {
	dojo.provide("unieap.view.Map");
	dojo.declare("unieap.view.Map", null, {
		
		mapToJson:function(mapData){
			var jsonData = {};
			if(!mapData){
				return null;
			}
			for(var key in mapData){
				if(mapData[key] instanceof unieap.ds.DataStore){
					jsonData[key] = mapData[key].toJson();
				}else{
					jsonData[key] = mapData[key];
				}
			}
			return jsonData;
		}
	});	
}

if (!dojo._hasResource["unieap.view.Entry"]) {
	dojo.provide("unieap.view.Entry");
	dojo.declare("unieap.view.Entry", null, {
		view : null,
		
		postscript: function(view){
			this.view = view ;
			this.create();
		},
		create : function(){
			// 子类在此方法中实现初始化代码
		},
		getView : function(){
			return view;
		},
		show : function(){
			// 子类应重载此函数实现
			alert("unieap.view.Entry.show");
		}
		
	});	
}

if (!dojo._hasResource["unieap.view.Processor"]) {
	dojo.provide("unieap.view.Processor");
	dojo.declare("unieap.view.Processor", null, {
		view : null,
		
		pattern : unieap.global.dataOption,
		
		postscript: function(view){
			this.view = view ;
			this.create();
		},
		create : function(){
			// 子类在此方法中实现初始化代码
		},
		getView : function(){
			return view;
		},
		getCodeList:function(name){
			unieap.Action.getCodeList(name);
		},
		setDataOption : function(processorName,dataOption){
			var processor = this[processorName],
				pattern = this.pattern;
			if(typeof(processor._pattern) == "undefined"){
				processor._pattern = {
					parameters:pattern.parameters,
					dataStores:pattern.dataStores
				};
			}
			processor._pattern.dataStores = dataOption;
		},
		setDataStoreOption : function(processorName,dataStoreName,dataOption){
			var processor = this[processorName],
				pattern = this.pattern;
			if(typeof(processor._pattern) == "undefined"){
				processor._pattern = {
					parameters:pattern.parameters,
					dataStores:{}
				};
			}
			processor._pattern.dataStores[dataStoreName] = dataOption;
		},
		collect : function(dc,pattern){
			if(typeof(pattern["dataStores"])=="string"){
				return dc.collect(pattern);
			}else{
				//默认dataStore的收集策略
				var policy = this.pattern["dataStores"],
					dataStores = dc.getDataStores(),
					tdc = dc.collect(pattern),
					pDataStores = pattern["dataStores"];
				//将未设定的dataStore按默认收集策略收集
				for(var key in dataStores){
					if(!pDataStores[key]){
						tdc.addDataStore(key,dataStores[key].collect(policy));
					}
				}	
				return tdc;
			}
		},
		
		/**
		 * @summary:
		 * 		view模型所生成的processor脚本中定义的各个processor方法的流程逻辑。
		 * @param:
		 * 		{object}args
		 * 		processor方法的参数集合，结构参见example
		 * @param:
		 * 		{function}_load
		 * 		ria内部使用的成功回调方法
		 * @param:
		 * 		{function}_error
		 * 		ria内部使用的失败回调方法
		 * @return 
		 * 		{unieap.ds.DataCenter|void} 
		 * 		同步的时候返回DataCenter对象，异步的时候无返回值
		 * @example:
		 |    run({
		 |      //Processor名
		 |	    processorName: "queryOrder",
		 |	    
		 |	    //用户参数信息
		 |	    uParameters: [{
		 |	            name: "order",
		 |	            type: "string",
		 |	            javaType: "string",
		 |	            value: order
		 |	        }
		 |	    ],
		 |	    
		 |	    //View名
		 |	    viewName: "saleMgr",
		 |	    
		 |	    //同步标识,若为同步请求，将生成该域为true
		 |	    syncRequest: true|undefined,
		 |	    
		 |	    //请求成功回调，若未指定，将为undefined
		 |	    loadSuccessed: view.queryOrderSuccess,
		 |	    
		 |	    //请求失败回调,若未指定，将为undefined
		 |	    loadFailed: view.queryOrderFailed,
		 |	    
		 |	    //分页信息,若未设定，将为undefined
		 |	    pagingInfo: {
		 |	        pageNum: 1,
		 |	        pageSize: 10,
		 | 	        calcRecordCount: true
		 |	    },
		 |	    
		 |	    //文件上传标识,若上传文件，BO方法中有参数为Form类型，将生成该域为true
		 |	    fileUpload: true|undefined,
		 |	    
		 |	    //文件下载标识，若下载文件，BO方法返回File、Workbook、FileAttachment类型值，将生成该域为true
		 |	    fileExport: true|undefined,
		 |	    
		 |	    //请求CodeList数据标识,若请求返回值是codelist类型，将生成该域为true
		 |	    returnCodelist: true|undefined,
		 |	    
		 |	    //请求BO信息,若请求对象是后台BO方法，将生成该域
		 |	    boInvoked: {
		 |	        dcID: "sale",
		 |	        boID: "sale_orderBO_bo",
		 |	        methodName: "queryOrder",
		 |	    },
		 |	    
		 |	    //命名查询信息,若请求类型为命名查询，将生成该域
		 |	    namedQuery: {
		 |	        id: "qName",
		 |	    },
		 |	    
		 |	    //声明查询信息，若请求类型为声明查询，将生成该域
		 |	    statementQuery: {
	     |           statementName: "test,test2",
	     |           statementRef: "test,test2",
	     |           dcId: "testDC,testDC",
	     |           pageNumber: "'',''",
	     |           pageSize: "'',''"
	     |      },
	     |       
	     |      //是否显示进度条
	     |      showLoading:true|false,
		 |		
		 |		//旧版本grid导出方法的兼容标记，若采用旧的方式，将会生成该域为true
		 |		serverExportCompatible: true|undefined
         |
		 |   }, _load, _error);
		 */
		run : function(args, _load, _error) {
			var path = unieap.WEB_APP_NAME + "/techcomp/ria/commonProcessor!commonMethod.action",
				self = this;
		    //初始准备一些必要的变量
		    var view = this.view,
		        pattern = this.pattern,
		        dataCenter = view.dataCenter,
		        pFuncName = args.processorName,
		        pFunc = this[pFuncName],
		        uParameters = args.uParameters,
		        dc = new unieap.ds.DataCenter(),
		        paraNameArr = [],
		        paraTypeArr = [],
		        paraJavatypeArr = [],
		        para;
		    //处理请求参数值与类型的整理
		    for (var i = 0,l = uParameters.length; i<l;i++) {
		        para = uParameters[i];
		        if (para.type === "pojo" || para.type === "pojoList")
		            dc.addDataStore(para.name, para.value);
		        else if(para.type.indexOf("map") === 0)
		        	dc.setParameter(para.name.substr(0,para.name.indexOf("(")),view.mapToJson(para.value));
		        else
		            dc.setParameter(para.name, para.value);
		        paraNameArr.push(para.name);
		        paraTypeArr.push(para.type);
		        paraJavatypeArr.push(para.javaType);
		    }
		    dc.setParameter("_parameters", paraNameArr.join(","));
		    dc.setParameter("_parameterTypes", paraTypeArr.join(","));
		    //处理“BO调用”或“命名查询”或“Statement查询”参数设定
		    if (args.boInvoked) {
		        var boInvoked = args.boInvoked;
		        dc.setParameter('dcID', boInvoked.dcID);
		        dc.setParameter("_boId", boInvoked.boID);
		        dc.setParameter("_methodName", boInvoked.methodName);
		        dc.setParameter("_methodParameterTypes", paraJavatypeArr.join(","));
		    } else if (args.namedQuery) {
		        var namedQuery = args.namedQuery;
		        dc.setParameter("_namedQuery", namedQuery.id);
		        dc.setParameter("_queryParameterTypes", paraTypeArr.join(","));
		    } else if (args.statementQuery) {
		    	var statementQuery = args.statementQuery;
		    	dc.setParameter("_statement", statementQuery.statementName);
		        dc.setParameter("_statementRef", statementQuery.statementRef);
		        dc.setParameter("_dcId", statementQuery.dcId);
		        dc.setParameter("_statementPageNumber", statementQuery.pageNumber);
		        dc.setParameter("_statementPageSize", statementQuery.pageSize);
		        var pi = {};
		    }
		    //处理自动分页参数设定
		    if (args.pagingInfo) {
		        var pi = args.pagingInfo;
		        dc.setParameter("_pageNumber", pi.pageNumber);
		        dc.setParameter("_pageSize", pi.pageSize);
		        dc.setParameter("_calcRecordCount", pi.calcRecordCount);
		    }
		    //处理文件上传参数设定
		    if (args.fileUpload)
		    {
		    	var formIdIndex = dojo.indexOf(paraJavatypeArr,"com.neusoft.unieap.core.common.form.Form");
		    	var d = view.form.getDataStore(uParameters[formIdIndex].value);
		    	if(d)
		    		dc.addDataStore('_uploadFormStore', d);
		    }
		    //处理高级查询参数设定
		    dc.addDataStore(dataCenter.getDataStore("_advancedQueryConditionStore"));
		    //
		    for (var _para in pFunc) {
		        var _paraValue = pFunc[_para];
		        if (_para == "_pattern") {
		            pattern = _paraValue;
		        } else {
		            dc.setParameter(_para, _paraValue);
		        }
		        delete pFunc[_para];
		    }
		    
		    // 处理文件导出或为BO调用、命名查询以及文件上传等操作发送请求
		    if (args.fileExport === true) {
		    	handleFileExport();
		    } else {
		        if (doBeforeRequest(dc, view, pFuncName)) {
		            var baseArgs = {
		                url: path,
		                dc: dataCenter,
		                load: load,
		                error: error
		            };
		            if (args.fileUpload) {
		                return unieap.Action.upload(
		                    dojo.mixin(baseArgs, {
		                    form: view._rootNodeId + uParameters[formIdIndex].value,
		                    parameters: {
		                        'dc': self.collect(dc, pattern).toJson()
		                    }
		                }));
		            } else {
		                return unieap.Action.requestData(
		                    dojo.mixin(baseArgs, {
		                    sync: args.syncRequest
		                }), this.collect(dc, pattern),args.showLoading);
		            }
		        }
		    }

		    function load(dc) {
		        if (doBeforeSuccessResponse(dc, view, pFuncName)) {
		            //记录分页信息   
		            if (typeof pi !== "undefined") {
		                var dataStores = dc.getDataStores(),
		                    pValues = [],
		                    processorInfo = {
		                        view: args.viewName,
		                        name: pFuncName,
		                        parameters: pValues
		                    };

		                dojo.forEach(uParameters, function(para) {
		                    pValues.push(para.value === "" ? "" : unieap.toJson(para.value));
		                });

		                for (var key in dataStores) {
		                    dataStores[key].setParameter('processor', processorInfo);
		                }
		            }
		            if(args.serverExportCompatible)//兼容旧的Grid导出实现方式
		            {
		            	if (dataCenter.getHeaderAttribute(pFuncName) == "serverExport") {
                            var dataStores = dc.getDataStores();
                            for (var key in dataStores) {
                                var _ds = dataStores[key];

                                if (dataCenter.getDataStore("_advancedQueryConditionStore")) {
                                    _ds.setParameter("_advancedQueryConditionStore", dataCenter.getDataStore("_advancedQueryConditionStore").toJson());
                                }
                                
                                for(var i=0,l=uParameters.length;i<l;i++)
                                {
                                	var p = uParameters[i];
                                	if(p.name === "pageNum")
                                		_ds.setParameter("pageNum", 1);
                                	else if(p.name === "pageSize")
                                		_ds.setParameter("pageSize", _ds.getRecordCount());
                                	else {
                                		if (p.type === "pojo" || p.type === "pojoList")
                                			_ds.setParameter(p.name, p.value.toJson());
                        		        else if(p.type.indexOf("map") === 0)
                        		        	_ds.setParameter(p.name.substr(0,p.name.indexOf("(")),view.mapToJson(p.value));
                        		        else
                        		        	_ds.setParameter(p.name, p.value)
                                		}
                                }
                                
                                _ds.setParameter("_parameters", paraNameArr.join(","));
                                _ds.setParameter("_parameterTypes", paraTypeArr.join(","));
                                
                                if (args.boInvoked) {
                    		        var boInvoked = args.boInvoked;
                    		        _ds.setParameter("_boId", boInvoked.boID);
                    		        _ds.setParameter("_methodName", boInvoked.methodName);
                    		        _ds.setParameter("_methodParameterTypes", paraJavatypeArr.join(","));
                    		    }
                            }
                        }
		            }
		            //缓存Codelist
		            if (args.returnCodelist === true) {
		                var ds = dc.getSingleDataStore();
		                if (ds) {
		                    var name = ds.getName(),
		                        timeStamp = dc.getParameter(name);
		                    unieap.setDataStore(ds, window.dataCenter, true, timeStamp);
		                }
		            }
		            _load && _load(dc);
		            args.loadSuccessed && args.loadSuccessed(dc);
		        }
		        doAfterSuccessResponse(dc, view, pFuncName);
		    }

		    function error(xhr) {
		        if (doBeforeFailedResponse(dc, view, pFuncName)) {
		        	_error && _error(xhr);
		   			(args.loadFailed && args.loadFailed(xhr)) || _exceptionProcess(xhr);
		        }
		        doAfterFailedResponse(dc, view, pFuncName);
		    }

		    function handleFileExport() {
		        var form = dojo.byId("unieap_export_form"),
		            iframe;
		        if (!form) {
		            if (dojo.isIE < 9) {
		                iframe = dojo.create("<iframe name='exportIframe' style='border:0px' width='0px' height='0px'></iframe>");
		            } else {
		                iframe = dojo.create("iframe");
		                dojo.style(iframe, "border", "0px");
		                iframe.setAttribute("name", "exportIframe");
		                iframe.setAttribute("width", "0px");
		                iframe.setAttribute("height", "0px");
		            }
		            dojo.place(iframe, dojo.body())
		            form = dojo.create("form", {
		                id: "unieap_export_form",
		                name: "unieap_export_form",
		                method: "post",
		                target: 'exportIframe'
		            });
		            var input = dojo.create("input", {
		                name: "data",
		                type: "hidden"
		            });
		            dojo.place(input, form);
		            dojo.place(form, document.body);
		        } else {
		            input = form.firstChild;
		        }
		        input.value = self.collect(dc, pattern).toJson();
		        form.action = path;
		        if (dc.getParameter("isPreView") == true) {
		            form.target = "_blank";
		        }
		        form.submit();
		    }
		}
	});	
}


if (!dojo._hasResource["unieap.view.MessageTrigger"]) {
	dojo.provide("unieap.view.MessageTrigger");
	dojo.declare("unieap.view.MessageTrigger", null, {
		view : null,
		messageHandlers : null,

		postscript : function(view) {
			this.view = view;
			this.messageHandlers = {};
		},

		getView : function() {
			return view;
		},

		messageMetaInfo : {},

		setMessageMetaInfo : function(messageMetaInfo) {
			this.messageMetaInfo = messageMetaInfo;
		},

		getMessageMetaInfo : function() {
			return this.messageMetaInfo;
		},
		
		/*filterChain
		 {
		 	filters:
		 	[
		 		{
		 			type:"built-in",
		 			parameter:
		 			{
		 				filterName:"mappingConverter",
		 				arguments:...
		 			}
		 		},
		 		{
		 			type:"custom-method",
		 			method: function(in){return out;}
		 		}
		 	]
		 }
		 * */
		builtInFilters : {
			mappingConverter : function(data, parameters/*[2，3，1，null]*/) {
				var result = [];//保存映射转换后的参数列表值
				for(var i = 0,l = parameters.length; i<l; i++)
				{
					if(parameters[i]==-1)
					{
						//映射值为-1的，表示无映射值，设为null
						result[i] = null;
					}
					else if(typeof parameters[i] ==="object" && typeof parameters[i].staticValue != "undefined")
					{
						////映射值为静态值的情况
						result[i] = parameters[i].staticValue;
					}
					else if(/^(0|[1-9]\d*)\..*$/.test(parameters[i]))
					{
						//如果映射值为：2.name 形式的的情况，表示为DataStore变量的某一个域（数字表示参数序号，字符串表示DataStore的域名）
						var splits = parameters[i].split(".");
						if(splits.length >= 2)
						{
							var seq = splits.shift();
							var itemName = splits.join(".");
							if(data[seq]==null || data[seq].getRowSet()==null ||data[seq].getRowSet().getRow(0)==null)
								result[i] = null;
							else
								result[i] = data[seq].getRowSet().getRow(0).getItemValue(itemName);
						}
						else 
							//格式错误，设为null
							result[i] = null;
					}
					else if(/^(0|[1-9]\d*)$/.test(parameters[i]))
					{
						//如果映射值为单纯一个序号的情况
						result[i] = data[parameters[i]];
					}
					else
						//格式错误，设为null
						result[i] = null;
				}
				return result;
			}
		},

		bind : function(messageType, handler, context, filterChain) {
			if (typeof this.messageHandlers[messageType] == "undefined") {
				this.messageHandlers[messageType] = [];
			}
			context = context ? context : null;
			this.messageHandlers[messageType].push( {
				handler : handler,
				context : context,
				filterChain: filterChain
			});
		},

		trigger : function(messageType, args) {
			if (this.messageHandlers[messageType] instanceof Array) {
				/*将传入的arguments对象转换为数组格式便于操作*/
				var newArgs = [];
				for ( var i = 0, len = args.length; i < len; i++) {
					newArgs.push(args[i]);
				}
				var newArgsBak = [];
				for ( var i = 0, len = newArgs.length; i < len; i++) {
					newArgsBak.push(newArgs[i]);
				}				
				/*遍历该消息的所有的监听者*/
				var messageHandlers = this.messageHandlers[messageType];
				for ( var i = 0, len = messageHandlers.length; i < len; i++) {
					if(messageHandlers[i].filterChain)
					{
						/*若某个监听者连接中，设定了过滤器链，则将消息内容按过滤链的设定依次进行处理*/
						var filters = messageHandlers[i].filterChain.filters;
						for(var j = 0, len2 = filters.length; j < len2; j++)
						{
							//内置过滤器
							if(filters[j].type === "built-in")
							{
								newArgs = this.builtInFilters[filters[j].parameters.filterName](newArgs,filters[j].parameters.arguments);
							}
							//用户自定义过滤器
							else if(filters[j].type === "custom-method")
							{
								newArgs = filters[j].method(newArgs);
							}
						}
					}
					else
					{
						//无映射转换的情形下，直接按顺序对应，并且以监听参数为准（参数列表长度）
						newArgs = newArgs.slice(messageHandlers[i].handler.length);
					}
					//最终的消息结构尾部加上消息元信息
					newArgs.push(this.getMessageMetaInfo());
					messageHandlers[i].handler.apply(
							messageHandlers[i].context, newArgs);
					//ReStore 变量 newArgs，以便传递给下一个注册的监听器使用
					newArgs=newArgsBak;
				}
			}
		}
	});
}

if (!dojo._hasResource["unieap.view.MessageListener"]) {
	dojo.provide("unieap.view.MessageListener");
	dojo.declare("unieap.view.MessageListener", null, {
		view : null,
		postscript: function(view){
			this.view = view ;
		},
		getView : function(){
			return view;
		}
	});
}

dojo.provide("unieap.view.State");

dojo.declare("unieap.view.State",null,{
	/**
	 * @declaredClass: unieap.view.State
	 * @summary: 视图的状态
	 * @example | <state> | <addControl> | <textBox></textBox> | </addControl> |
	 *          </state>
	 */
	
	view:null,
	
	/**
	 * @summary: 状态名
	 */
	name:'',
	
	actions:null,
	
	constructor:function(stateActions,view) {
		this.view=view;
		actions=[];
		dojo.forEach(stateActions,function(action){
			actions.push(new unieap.view.StateAction(action,view));
		});
		this.actions=actions;
		this.set();
	},
	
	/**
	 * @summary: 设置状态
	 */
	set:function(){
		dojo.forEach(this.actions,function(action){
			action.install();
		});
	},
	
	/**
	 * @summary: 取消该状态
	 */
	cancel:function(){
		dojo.forEach(this.actions,function(action){
			action.unInstall();
		});
	}
	
});


dojo.declare("unieap.view.StateAction",null,{
	/**
	 * @declaredClass: unieap.view.State
	 * @summary: 视图的状态描述的最小单位
	 */
	
	/**
	 * @summary: 状态的类型,增加组件,移除组件,设置属性,设置事件
	 * @ENUM: {'addControl'|'removeControl'|'setProperty'|'setEventHandler'}
	 */
	type:"",
	
	relativeTo:"",	// targetId
	control:"",		// innerHTML
	position:"",	// before after firstChild lastChild
	target:"",		// targetId
	name:"",		
	value:"",
	handlerFunction:"",
	
	
	/**
	 * @summary： 增加某个组件
	 */
	addControl:function(){
		var t;
		if(!this.position){
			this.position="lastChild";
		}
		if(this.position=="lastChild"||this.position=="firstChild"){
			if(dijit.byId(this.relativeTo)){
				if(dijit.byId(this.relativeTo).containerNode){
					t=dijit.byId(this.relativeTo).containerNode;
				}else{
					t=dijit.byId(this.relativeTo).domNode;
				}
			}
		}
		if(!t){
			t=dojo.byId(this.relativeTo);
		}
		if(!t){
			return;
		}
		var temp=dojo.create('div',{innerHTML:this.control});
		var control=temp.firstChild;
		this.controlId=control.id
		dojo.place(control, t, this.position.replace("Child",""));
		dojo.parser.parse(control.parentNode);
		if(this.onAdd){
			dojo.hitch(this,this.onAdd).apply()
		}
	},
	
	/**
	 * @summary: 移除增加的组件
	 */
	unAddControl:function(){
		if(dijit.byId(this.controlId)){
			dijit.byId(this.controlId).destroyRecursive();
		}else{
			if(dojo.byId(this.controlId)){
				dojo.forEach(dijit.findWidgets(dojo.byId(this.controlId))||[], function(widget){ 
					if(widget.destroyRecursive){
						widget.destroyRecursive(preserveDom);
					}
				});
				dojo.destroy(this.controlId);
			}
		}
	},
	
	/**
	 * @summary: 移除某个组件
	 */
	removeControl:function(){
		var removePosition=dojo.create("div",{style:{width:'10px',height:'10px',display:'inline-block',border:'1px red solid'}});
		if(dijit.byId(this.target)){
			dojo.place(removePosition,dijit.byId(this.target).domNode,'after');
			dijit.byId(this.target).destroyRecursive();
		}else{
			dojo.place(removePosition,dojo.byId(this.target),'after');
			dojo.forEach(dijit.findWidgets(dojo.byId(this.target))||[], function(widget){ 
				if(widget.destroyRecursive){
					widget.destroyRecursive(preserveDom);
				}
			});
			dojo.destroy(this.target);
		}
		this.removePosition=removePosition;
	},
	
	/**
	 * @summary: 恢复移除的组件
	 */
	unRemoveControl:function(){
		var temp=dojo.create('div',{innerHTML:this.control});
		var control=temp.firstChild;
		dojo.place(control, this.removePosition, 'replace');
		dojo.parser.parse(control.parentNode);
		if(this.onUnRemove){
			dojo.hitch(this,this.onUnRemove).apply()
		}
	},
	
	/**
	 * @summary： 修改某个组件的属性
	 */
	setProperty:function(){
		var name=this.name,value=this.value,oldValue=null,target=this.target;
		if(dijit.byId(target)){
			var w=dijit.byId(target);
			var setF=w['set'+name.charAt(0).toUpperCase() + name.substr(1)];
			oldValue=w[name];
			if(setF){
				dojo.hitch(w,setF)(value);
				this._unSetProperty=function(){
					dojo.hitch(w,setF)(oldValue);
				}
			}
		}else{
			if(dojo.indexOf(['width','height','color'],name)!=-1){
				oldValue=dojo.style(dojo.byId(target),name);
				dojo.style(dojo.byId(target),name,value);
				this._unSetProperty=function(){
					dojo.style(dojo.byId(target),name,oldValue);
				}
			}else{
				oldValue=dojo.attr(dojo.byId(target),name);
				dojo.attr(dojo.byId(target),name,value);
				this._unSetProperty=function(){
					dojo.attr(dojo.byId(target),name,oldValue);
				}
			}
		}
		
	},
	
	/**
	 * @summary: 恢复修改的属性
	 */
	unSetProperty:function(){
		if(this._unSetProperty){
			dojo.hitch(this,this._unSetProperty).apply();
			this._unSetProperty=null;
		}
	},
	
	
	/**
	 * @summary: 设置事件
	 */
	setEventHandler:function(){
		this.eh=this.view.connect(this.target,this.name,this.handlerFunction);
	},
	
	/**
	 * @summary: 取消设置的事件
	 */
	unSetEventHandler:function(){
		if(this.eh){
			dojo.disconnect(this.eh);
		}
	},
	
	
	
	constructor:function(action,view){
		this.view=view;
		dojo.mixin(this,action);
	},
	
	/**
	 * @summary： 装载一个状态描述
	 */
	install:function(){
		if(this.type){
			var	action=this[this.type];
			if(action&&typeof action =="function"){
				dojo.hitch(this,action).apply();
			}
		}
	},
	
	/**
	 * @summary: 卸载一个状态描述
	 */
	unInstall:function(){
		if(this.type){
			var	unAction=this["un"+this.type.substring(0,1).toUpperCase() +this.type.substring(1)];
			if(unAction && typeof unAction =="function"){
				dojo.hitch(this,unAction).apply();
			}
		}
	}
	
});
var view = null;
var __viewStack = new Array();
function __connectPageControlEvents()
{
	for(var i = __viewStack.length-1;i>=0;i--)
	{
		var x = __viewStack[i];
		if(dojo.isFunction(x.page_initEvents)) eval("x.page_initEvents();");
	}
}
function __executePageLoadEvents()
{
	for(var i = __viewStack.length-1;i>=0;i--)
	{
		var x = __viewStack[i];
		if(dojo.isFunction(x.page_load)) eval("x.page_load();");
	}
}
function __executePageUnloadEvents()
{
	for(var i = __viewStack.length-1;i>=0;i--)
	{
		var x = __viewStack[i];
		if(dojo.isFunction(x.page_unload)) eval("x.page_unload();");
	}
}
function __executeViewInit()
{
	for(var i = __viewStack.length-1;i>=0;i--)
	{
		var x = __viewStack[i];
		eval("x.init();");
	}
}
function initView(viewClass)
{
	if(view == undefined ||view == null)
 	{
	 	view = new viewClass();
		view.init();
	 	__viewStack.push(view);
		dojo.addOnLoad(function(){
			__connectPageControlEvents();
			// __executeViewInit();
			__executePageLoadEvents();
		});
		dojo.addOnUnload(function(){
			__executePageUnloadEvents();
		});
 	}
	else
	{
 		// 拷贝Processor
 		var _view = new viewClass();
 		// 遍历原有view对象的Processor，记录其方法。
 		var copy = dojo.mixin({}, view.processor);
 		var pageFunctions = new Array();
 		for(var i in copy)
 		{
	 		if(typeof(copy[i])=="function") pageFunctions.push(i + "");
	 	}
	 	// 定义一个内部函数
 		function isPageFunctions(pageFunctions, functionName)
	 	{
		 	for(var i=0;i<pageFunctions.length;i++)
		 	{
			 	if(pageFunctions[i]==functionName)
			 	{
				 	return true;
				}
			}
			return false;
		}
		// 对比_view的Processor，记录需要增加到view的processor上的方法
	 	var copy1 = dojo.mixin({}, _view.processor);
	 	var functionsToAdd = new Array();
	 	for(var i in copy1)
 		{
	 		if(typeof(copy1[i])=="function" && !isPageFunctions(pageFunctions, i+""))
	 		{
	 			functionsToAdd.push(i+"");
		 	}
	 	}
	 	for(var i = 0;i<functionsToAdd.length;i++)
	 	{
		 	eval("view.processor." + functionsToAdd[i] + "=_view.processor." + functionsToAdd[i]);
		}
	 	__viewStack.push(_view);
		_view.init();
 	}
}

