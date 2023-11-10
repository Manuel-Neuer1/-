if (!dojo._hasResource["unieap.rpc"]) { //_hasResource checks added by build. Do not use _hasResource directly in your code.
    dojo._hasResource["unieap.rpc"] = true;
    dojo.provide("unieap.rpc");  
    dojo.require("unieap.ds");
	dojo.require("unieap.util.util");

	dojo.declare("unieap.Action",null);
	/**
	 * @summary:
	 * 		定义了与后台交互的一些方法
	 * @classDescription:
	 * 		在项目中这些方法可被重写。
	 * @declaredClass:
	 * 		unieap.Action
	 */
	 
	if("undefined" ==typeof(globalDataCenter)){
		globalDataCenter = dataCenter = new unieap.ds.DataCenter();
	}
	
//ajax成功回调失败会触发弹出一个显示异常的dialog,该方法在弹出dialog之前调用，用户可以根据需要来复写相关逻辑

	function doAfterFailedCustomLoad(){
	}
	
	unieap.riaPath =  dojo.moduleUrl("");	
	
	unieap.dbDialect="drm";
	
	unieap.buildRequestPath = function(url,parameters){
		 var path = [];
		 for(var name in parameters){
   			path.push(name+"="+encodeURIComponent(parameters[name]));
   		 }
   		 if(path.length==0){
   			return url;
   		 }
   		 path = path.join("&");
   		 return url.concat(url.lastIndexOf("?")>0?"&":"?" ).concat(path);  
	}	
	//超时处理
	_timeoutProcess = function(json,data,dc,showLoading){
    	if(dojo.isString(json)  &&  
    		json.match(unieap.session.timeout) && 
    		data["sessionout"]!=false){
			if (unieap.session.dialogRelogin){
				dojo.require("unieap.dialog.DialogUtil");
				var j_application = unieap.appPath.substring(unieap.WEB_APP_NAME.length+1);
				DialogUtil.showDialog({
					url : unieap.WEB_APP_NAME+unieap.relogin,
					dialogData : {
						"j_application" : j_application
					},
					width: "563",
					height: "318",
					resizable:false,
					isExpand:false,
					isClose:false,
					//会话过期,请重新登录
					title : RIA_I18N.rpc.sessionOut,
					onComplete:function(value){
						if(value=="success"){
							unieap.Action.requestData(data,dc,showLoading);
						}
					}									
				});	
			}
			else{
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
	//帐号踢出处理（用于v4）
	_accountKickedProcess = function(){}	
	// 异常弹出是否可控制（用于v4，v3中值为false）
	_isExceptionControl = function(){
		return false;
	}
	//异常处理
	_exceptionProcess = function(json,data,_dc,complete){
       //异常处理
       if(_dc.getCode()<0){
    	   dojo.require("unieap.dialog.MessageBox");
        		MessageBox.alert({
        			//错误提示
        			title : RIA_I18N.rpc.errorTip,
        			//message : _dc.getTitle() || "请求操作失败",
        			message : _dc.getTitle() || RIA_I18N.rpc.errorMessage,
        			onComplete : function(){
        				if(data.error) {
							data.context?data.error.call(data.context, _dc):data.error(_dc);
						}
        			}
        		});
        		return true;
        }
		var	dc = data.dc || globalDataCenter;
		
	    dc.append(_dc,data.coverage || "discard");
	    if(_dc.getCode()>0){
	   		dojo.require("unieap.dialog.MessageBox");
    		MessageBox.alert({
    			//成功提示
    			title : RIA_I18N.rpc.success,
    			//message : _dc.getTitle() || "请求操作成功" ,
    			message : _dc.getTitle() || RIA_I18N.rpc.successMessage ,
				onComplete : complete
    		});
			return true;
	   }
	   return false;
 		
	}
	
	// 推送消息的处理
	_handlePushingTips = function(tipList, unReadNum) {
		if(typeof tipDia !=="undefined" && tipDia.dialog("isOpen"))
			return;
		if(typeof(tipList) != "undefined"){
		for ( var i = 0, l = tipList.length; i < l; i++) {
			var tip = tipList[i];

			var dialogProps = {};

			dialogProps.draggable = false;

			dialogProps.resizable = false;

			dialogProps.show = {
				effect : "blind",
				duration : 1000
			};

			dialogProps.position = {
				my : "right bottom",
				at : "right-" + (30 + i * 5) + " bottom-" + (30 + i * 5),
				of : $(document)
			};

			if (tip.config) {
				dialogProps.title = tip.config.headLine ? tip.config.headLine
						: "";
				dialogProps.height = tip.config.height ? tip.config.height
						: "100";
				dialogProps.width = tip.config.width ? tip.config.width : "120";

				dialogProps.dialogClass = "infotipDialog";

				dialogProps.open = function() {
					$("div[class='DrugNewsText'] a", this)
						.css("cursor", "pointer")
						.click(function() {
								$.Open_UNIEAP_INFOTIP_CLIENTBROWSER_dialog($(
												this).attr("id")
												&& $(this).attr("id").length > 0 ? $(
												this).attr("id")
												: null);
								var currentDlg = $("div[class~='infotipDialog']:visible div[class~='ui-dialog-content']");
								if (currentDlg.length > 0)
									$(currentDlg).dialog("close");
						});
					$("div[class='DrugNewsMore'] a", this)
						.css("cursor", "pointer")
						.click(function() {
							$.Open_UNIEAP_INFOTIP_CLIENTBROWSER_dialog_v2();
							var currentDlg = $("div[class~='infotipDialog']:visible div[class~='ui-dialog-content']");
							if (currentDlg.length > 0)
								$(currentDlg).dialog("close");
						});
				}
			}

			var tipDia = $("<div>" + tip.abbr + "</div>").dialog(dialogProps);
			var timeoutConfig = tip.config.dialogTimeOut != null ? tip.config.dialogTimeOut
					: 5000;
			var t = setTimeout(function() {
				tipDia.dialog("close")
			}, timeoutConfig);

			$(tipDia[0].parentElement).hover(function() {
				clearTimeout(t);
			});

			$(tipDia[0].parentElement).mouseleave(function() {
				t = setTimeout(function() {
					tipDia.dialog("close")
				}, timeoutConfig);
			});
			}
		}
		$.Set_UNIEAP_INFOTIP_TIPSNUM && $.Set_UNIEAP_INFOTIP_TIPSNUM(unReadNum);
	}
	
	dojo.mixin(unieap.Action,{
		
		//获取代码缓存地址
		CODELISTURL : "/rpc.do?method=getCodeList" ,
		//获取多个代码缓存地址
		MULTICODELISTURL : "/rpc.do?method=getMultiCodeList",
		//查询数据地址
		QUERYURL : "/rpc.do?method=doQuery",
		//统计地址
		COUNTURL : "/rpc.do?method=doCount",
		//更新数据地址
		UPDATEURL : "/rpc.do?method=doUpdate",
		//打印地址
		PRINTURL : "/rpc.do?method=doPrint",
		//导出地址
		EXPORTURL : "/rpc.do?method=doExport",
		//获取个性化信息地址
		GINDIVIDUALURL : "/rpc.do?method=getIndividual",
		//保存个性化信息地址
		SINDIVIDUALURL : "/rpc.do?method=setIndividual",
		//获取缓存地址
		CACHEURL : "/rpc.do?method=loadCacheData",
	
	/**
	 * @summary:
	 *		向服务器端发送ajax http request请求的通用方法，传输协议为dataCenter
	 * @param
	 *	 	{object} data 请求参数对象
	 * @example:
	 * |	var data={
	 * |		${1}url:"/eapdomain/login.do?method=begin",
	 * |		${2}parameters:{role: "admin", dept: "telcom"},
	 * |		${3}headers:{ajax:"true",charset:"utf-8"},
	 * |		${4}sync:true,
	 * |		${5}timeout:120,
	 * |		${6}preventCache:false, 
	 * |		${7}load:function(${8}dc, ${9}xhr){
	 * |			},
	 * |		error:function(${10}responseText, ${11}xhr){
	 * |			},
	 * |		${12}context:this,
	 * |		${13}coverage : "discard"
	 * |	}
	 * |	unieap.Action.requestData(data,dc,false);
	 * ${1}必填项，向服务器请求的URL
	 * ${2}可选项，向服务器请求的参数
	 * ${3}可选项，向服务器头部请求的参数,在服务器端通过HttpServletRequest.getHeader方法可以取得 
	 * ${4}可选项，true表示同步。请求同步或异步，默认为异步
	 * ${5}可选项，请求超时时间，单位为秒，默认为120秒
	 * ${6}可选项，是否阻止该请求在客户端浏览器缓存，默认为true，即不缓存 
	 * ${7}可选项，请求成功后的回调函数
	 * ${8}dc 请求成功后生成的dataCenter对象
	 * ${9}xhr 当前的XMLHttpRequest请求对象 
	 * ${10}responseText 出错的响应内容
	 * ${11}xhr 当前的XMLHttpRequest请求对象
	 * ${12}可选项，load或error方法的上下文
	 * ${13}替换DataStore的策略	
	 * @param 
	 * 		{unieap.ds.DataCenter|Null} 
	 * 		dc 传输的数据对象
	 * @param 
	 * 		{Boolean|Null} showLoading 
	 * 		是否显示进度条，默认显示异步方式使用
	 * @return 
	 * 		{unieap.ds.DataCenter|void} 
	 * 		同步的时候返回DataCenter对象，异步的时候无返回值
	 */
   	requestData : function(data,dc,showLoading){   	
		var requestURL =  unieap.buildRequestPath(data.url,data.parameters);
		var json = dc && dc.toJson?dc.toJson():String(dc || ""); 
        var _dc = null;   
        if(!data.sync&&showLoading!=false){ //异步
        	unieap.showXhrLoading(true);
        }
		if(unieap.isEncrypt==true){
			dojo.require("unieap.util.encrypt");
			var digest =  hex_sha1(escape(json).toLowerCase());
			data.headers = data.headers || {};
			data.headers["digest"] = digest;
		}
        dojo.rawXhrPost({
            url: requestURL,
            sync: data.sync,
            preventCache: (data.preventCache ? data.preventCache : true),
           // contentType: "multipart/form-data",
            timeout: ((data.timeout) ? data.timeout : 120*1000),
            headers : dojo.mixin({ajaxRequest:true},data.headers,{"Content-Type":"application/json"}),
            postData: json,
            load: function(text, args){ 
            	var json = text;       	
            	if(!data.sync&&showLoading!=false){ //异步
	            	unieap.showXhrLoading(false);
	            }
	            try{
            		json = dojo.fromJson(text);
	            }catch(e){
	            }
	            //超时处理
            	if(_timeoutProcess(json,data,dc,showLoading)) 
            		return;
            		
            	//帐号被踢出的处理(用于v4)
            	if(_accountKickedProcess(json))
            		return;
				function complete(){
				   if (data.load) {	
							try{
								data.context?data.load.call(data.context, _dc, args.xhr):data.load( _dc, args.xhr);
							}catch(e){
								//alert("请求数据成功！但回调方法出错；请检查自定义load回调函数。\n "+dojo.toJson(e,true));
								doAfterFailedCustomLoad();
								var dataLoadString = data.load.toString();
								var isV4 = dataLoadString.indexOf("_load && _load(dc);")!=-1?true:false;
								//如果是V4的方法
								if(isV4){
									var viewIndex = dataLoadString.indexOf("view.");
									dataLoadString = dataLoadString.substring(viewIndex);
									//去除干扰项"_load && _load(dc);"
									var successFuncIndex = dataLoadString.indexOf(";");									
									var successFuncName =  dataLoadString.substring(0,successFuncIndex);
									successFuncName = successFuncName.replace("view.","");
									if(dojo.isFF){
										alert(RIA_I18N.rpc.loadError+"\n"+successFuncName+"\n"+dojo.toJson(e,true));
									}else{
										alert(RIA_I18N.rpc.loadError+"\n"+successFuncName);
									}
								}else{//V3的情况
									if(dojo.isFF){
										alert(RIA_I18N.rpc.loadError+"\n"+dataLoadString+"\n"+dojo.toJson(e,true));
									}else{
										alert(RIA_I18N.rpc.loadError+"\n"+dataLoadString);
									}
								}
//								alert(RIA_I18N.rpc.loadError+"\n "+dojo.toJson(e,true));
							}
					}
				}
				
				//推送消息的处理
				if(json.body && (json.body.infotips || json.body.unReadNum))
				{
					_handlePushingTips(json.body.infotips,json.body.unReadNum);
				}
				
				try{
			 		   json.body.dataStores; //确定返回来的是否为DataCenter格式的Json对象
			            _dc = new unieap.ds.DataCenter(json);	
			            //异常处理
			            if(_isExceptionControl()){
				            if (_dc.getCode() < 0) {
				            	data.error(args.xhr);
				            	return;
				            }else{
				            	var	dc = data.dc || globalDataCenter;
				            	dc.append(_dc, data.coverage || "discard");
				            	if (_dc.getCode() > 0) {
									dojo.require("unieap.dialog.MessageBox");
									MessageBox.alert({
										// 成功提示
										title : RIA_I18N.rpc.success,
										// message : _dc.getTitle() || "请求操作成功" ,
										message : _dc.getTitle() || RIA_I18N.rpc.successMessage,
										onComplete : complete
									});
								}
				            }
			            }
			            else{
							if(_exceptionProcess(json,data,_dc,complete)){
								return;
							}
			            }
						   
			 		}catch(e){
			 			_dc = json;
			 		}
				
				complete();
            },
			error: function(text, args) {
				var result = text.responseText;
				if(!data.sync&&showLoading!=false){ //异步
	            	unieap.showXhrLoading(false);
	            }
	            if(_timeoutProcess(result,data,dc,showLoading)) 
	            	return;
	            //帐号被踢出的处理(用于v4)
            	if(_accountKickedProcess(result))
            		return;
				if (data.error) {
					data.context?data.error.call(data.context, result, args.xhr):data.error(result, args.xhr)
				}
			}
        });
        //同步返回
        if(data.sync){ 
        	return _dc; 
        } 
    },
	
	/**
	 * @summary：
	 * 		同步获取DataStore，用于获取下拉列表数据
	 * @description:
	 * 		先从缓存中取，如果没有则发请求从服务端获取数据并放到缓存中
	 * @param:
	 * 		{string} storeName dataStore的名字
	 * @return
	 * 		{unieap.ds.DataStore}
	 */		
	getCodeList : function(store){
	   if(!store){
	   		return;
	   }
	   //从缓存中获取数据
	   var ds = unieap.getDataStore(store,null,true);
	   if(ds){
	   		return ds;
	   }	   
	   var dc = new unieap.ds.DataCenter();
	   dc.setParameter("store",store);
       unieap.Action.requestData({
   			url:unieap.WEB_APP_NAME + this.CODELISTURL,
   			sync : true,
   			load:function(dc){
				ds=dc.getSingleDataStore();
				if(ds){
					var name = ds.getName();
					var timeStamp = dc.getParameter(name);
					unieap.setDataStore(ds,dataCenter,true,timeStamp);
				}
   			}
        },dc);
        return ds;
	},
	
	
	/**
	 * @summary：
	 * 		异步获取多个DataStore，用于获取下拉列表数据或值转义
	 * @description：
	 * 		多用于Form绑定和Grid的代码表转义，两种情形为：
	 * 		1、Form中有多个ComboBox组件和InlineEditBox，且provider中没有对应DataStore时，发请求只获取Form所绑定行所需的部分行数据信息
	 * 		2、Grid中多需要列值转义，如果客户端缓存中没有相应的DataStore，则自动发请求获取相关的全部DataStore信息
	 * @param：
	 * 		{array} inData
	 * @param：
	 * 		{Function} callback
	 * 		定义的回调方法，传入的参数为unieap.ds.DataCenter对象和数组对象inData
	 * @example
	 * 	| 	function demo(){
	 *	|		unieap.Action.getMultiCodeList(['key1','key2'],function(dc){
	 *	|			unieap.debug(dc);
 	*	|		});
	 *	| 	}
	 *
	 */
	getMultiCodeList : function(inData,callback){
			
			if(!inData || unieap.isEmpty(inData=unieap.array_unique(inData))) {
				callback && callback();
			}
			else{
				var dc = new unieap.ds.DataCenter();
				var requestKeys=[];
				for(var i=0;i<inData.length;i++){
					//首先从缓冲中查找数据
					var ds = unieap.getDataStore(inData[i],null,true);
					if(!ds){
						requestKeys.push(inData[i]);
					}else{
						dc.addDataStore(ds);
					}
				}
				if(requestKeys.length==0){
					callback && callback(dc);
				}else if(requestKeys.length>0){
					dc.setParameter("stores",inData);
					unieap.Action.requestData({
						url:unieap.WEB_APP_NAME + this.MULTICODELISTURL,
						//由于struts2后台不能连续多次提交请求，不然返回的数据不对，需要设置为同步
						//但同步会影响性能!!!
						//UniEAP V3采用struts 1.x,不存在此问题，如果用该版本，把sync属性去掉
						sync:true,
						load : function(dc){
							if(dc=="") return;
							var stores = dc.getDataStores();
							for(var name in stores){
								var timeStamp= dc.getParameter(name);
								unieap.setDataStore(dc.getDataStore(name),dataCenter,true,timeStamp);
							}
							callback && callback(dc);
						},
						error : function(){
							callback && callback();
						}
					},dc);
				}
			}			
	},	
	
	/**
	 * @summary：
	 * 		普通RowSet查询操作
	 * @description:
	 * 		只适合单个DataStore查询，用于Grid翻页等操作获取数据，用户也可直接调用加载某个DataStore数据
	 * 		自动替换DataCenter对象中的同名对象
	 * @param：
	 * 		{unieap.ds.DataStore} store
	 * 		所有查询的DataStore对象，包括查询的必要信息
	 * @param：
	 * 		{object} inData
	 * 		传递的其他信息，可以为空
	 * @example:
	 * |	var data={
	 * |		${1}load:function(ds,dc){},
	 * |		${2}error:function(error){},
	 * |		${3}onBeforeQuery:function(dc,indata){},
	 * |		${4}sync:true,
	 * |		${5}synCount:true,
	 * |		${6}url:"store.do",
	 * |		${7}countUrl:"count.do",
	 * |		${8}parameters：{...}
	 * |		${9}operator:"sort",
	 * |	}
	 * |	unieap.Action.doQuery(store,data); 
	 * ${1}成功回调方法，传入的值为DataStore和DataCenter对象
	 * ${2}失败回调方法，传入的值为错误信息
	 * ${3}查询前的回调方法，传入值为DataCenter对象和inData，返回值为false不提交
	 * ${4}请求同步异步方式，默认为同步（true）请求方式
	 * ${5}是否同步获取统计数，默认为同步（true）请求方式
	 * ${6}自定义查询的url地址
	 * ${7}自定义统计查询的url地址
	 * ${8}定义额外的提交参数
	 * ${9}操作方式，用于Grid查询操作{query、paging、sort等}
	 */
	doQuery : function(store,inData){
		var dc = new unieap.ds.DataCenter();
		var ds = store.collect("none");
		dc.addDataStore(ds);
		inData = inData || {};
		inData["synCount"]  = inData["synCount"]!=false;
		//设置是否异步获取统计值，包括总记录数求和、平均、最大、最小等操作
		dc.setParameter("synCount",String(inData["synCount"]));
		if(inData.onBeforeQuery && inData.onBeforeQuery(dc,inData)==false) return ;
 		var path = unieap.WEB_APP_NAME	+ (inData["url"] ? inData["url"]  : unieap.Action.QUERYURL);
		path = unieap.buildRequestPath(path,inData.parameters);
		unieap.Action.requestData({
			url : path,
			dc: inData.dc || dataCenter,
			sync : inData["sync"]!=false,
			load : function(dc){
				var ds = dc.getSingleDataStore();
				inData.load && inData.load(ds,dc);				
				if(!inData["synCount"]){ //异步获取统计数
					dc = new unieap.ds.DataCenter();
					dc.addDataStore(ds.collect("none"));
					path = unieap.WEB_APP_NAME + (inData["countUrl"] ? inData["countUrl"]  : unieap.Action.COUNTURL);
					path = unieap.buildRequestPath(path,inData.parameters);
					unieap.Action.requestData({
						url : path,
						load : function(dc){
							var ds = dc.getSingleDataStore();
							var currentDC = inData.dc || "";
							if('undefined'==typeof(globalDataCenter)){
								currentDC = currentDC || dataCenter;
							} else {
								currentDC = currentDC || globalDataCenter;
							}
							
							var store = newdc.getDataStore(ds.getName());
							//更新统计数
							store.append(ds,"updateProps");
						}						
					},dc);
				}
			},
			error : function(xhr){
				inData.error && inData.error(xhr);
			}
		},dc);
	},
	
	
	/**
	 * @summary：
	 * 		普通RowSet集合持久化操作
	 * @description:
	 * 		Grid使用此接口进行持久化操作，用户也可直接调用进行保存操作
	 * 		成功后自动调用resetUpdate本地持久化Rowset的数据 
	 * @param：
	 * 		{unieap.ds.DataStore} store
	 * 		所有保存的DataStore对象，收集数据方式为auto包括新增、修改和删除记录
	 * 	@param：
	 * 		{object} inData
	 * 		传递的其他信息，可以为空
	 * @example:
	 * |	var data={
	 * |		${1}load:function(ds){},
	 * |		${2}error:function(error){},
	 * |		${3}onBeforeSubmit:function(dc){},
	 * |		${4}url:"submit.do",
	 * |		${5}parameters:{a:'a',b:'b'}
	 * |	}
	 * |	unieap.Action.doUpdate(store,data); 
	 * ${1}成功回调方法，传入的值为DataStore	
	 * ${2}error：{function} 失败回调方法，传入的值为错误信息
	 * ${3}提交前的回调方法，传入值为DataCenter对象，返回值为false不提交
	 * ${4}自定义提交url地址
	 * ${5}定义额外的提交参数
	 */	
	doUpdate : function(store,inData){		
		var dc = new unieap.ds.DataCenter();
		var ds = store.collect("auto");
		dc.addDataStore(ds);
		inData = inData || {};
		if(inData.onBeforeSubmit && inData.onBeforeSubmit(dc)==false) return ;
		var path = unieap.WEB_APP_NAME	+ (inData["url"] ? inData["url"]  : this.UPDATEURL);
		path = unieap.buildRequestPath(path,inData.parameters);
		unieap.Action.requestData({
			url : path,
			load : function(dc){
				//本地数据持久化
				store.getRowSet().resetUpdate();	
				inData.load && inData.load(dc);					
			},
			error : function(xhr){
				inData.error && inData.error(xhr);
			}
		},dc);		
	},
	
	
	/*
	 * @summary:
	 * 		打印RowSet结果集
	 * @description:
	 * 		如果传入的DataStore的rowSetName为空,则不执行打印操作
	 * @param:
	 * 		{object} inData
	 * @example:
	 * |	var data={
	 * |		${1}store:store,
	 * |		${2}layout:
	 * |		[
	 * |			[
	 * |				[
	 * |					{name:"attr_empno",label:"员工编号",width:"80"}
	 * |				]
	 * |			],
	 * |			[
	 * |				[
	 * |					{name:"attr_ename",label:"姓名" , rowSpan:2,width:"150"},
	 * |					{label:"基本信息",colSpan:4,isMulTitle:true}
	 * |				],
	 * |				[
	 * |					{name:"attr_deptno",label:"部门", colSpan:1, width:"150",decoder:{"10":"财务部","20":"开发部"}}, 		
	 * | 					{name:"attr_hiredate",label:"入职日期" , width:"160", dataFormat:'yyyy-MM-dd'},
	 * | 					{name:"attr_job",label:"职位", width:"150"},
	 * |					{name:"attr_sal",label:"工资", width:"150",dataFormat:'#,###.00'}
	 * |				]
	 * |			]
	 * |		],
	 * |		${3}url:"/customRpc.do?method=print",
	 * |		${4}unitedCells:['detp','city'],
	 * |		${5}parameters:{username:"zhangsan",password:"***"},
	 * |		${6}lockedData：[{salary:"最大：20000"},{salary:"平均：4000"}],
	 * |		${7}footer："平均工资：4000  最大年限 1",
	 * |	}
	 * |	unieap.Action.doPrint(data);
	 * ${1}要打印的DataStore对象
	 * ${2}列描述信息集合（包括名称、宽度、转义字典、格式化等信息）
	 * ${3}自定义提交url地址
	 * ${4}合并单元格信息
	 * ${5}传递其他额外信息
	 * ${6}锁定行数据，可以为空
	 * ${7}字符串类型，自定义信息，可以为空
	 */
	doPrint : function(inData){
		var url = unieap.WEB_APP_NAME+(inData["url"]?inData["url"]: this.PRINTURL);
		url= unieap.buildRequestPath(url,inData.parameters);
		if(!inData.layout){
        	 //alert("导出的布局信息为空！");
			 alert(RIA_I18N.rpc.layoutInfoEmpty);
        	 return;
        }
        
        var dc=new unieap.ds.DataCenter();
        var ds=inData["store"];
        //如果rowSetName不存在,不执行打印操作
        if(!ds.getRowSetName()){
        	dojo.require("unieap.dialog.MessageBox");
        	MessageBox.alert({
        		type:'warn',
        		yesStr:RIA_I18N.rpc.confirmButton,
        		title:RIA_I18N.rpc.info,
        		message:RIA_I18N.rpc.printError,
        		motion:false
        	})
        	return;
        };  
		ds =ds.collect({policy:'none',metaData:true}); //只收集metaData,不收集数据
		ds.setPageSize(-1);
		dc.setParameter("layout",inData["layout"]);
		inData["unitedCells"] && dc.setParameter("unitedCells",inData["unitedCells"]);
		dc.addDataStore(ds);
		

    	unieap.Action.requestData({
    		url:url,
    		sync:true,
    		load:function(dc){
    			var form=dojo.byId('unieap-print-form'),iframe;
    			if(!form){
				 	if(dojo.isIE < 9){
				 		iframe=dojo.create("<iframe name='printIframe' style='border:0px;' width=0 height=0></iframe>");
				 	}else{
				 		iframe=dojo.create('iframe',{name:'printIframe',style:{border:'0px'},width:0,height:0});
				 	}
    				dojo.place(iframe,dojo.body());
    				form=dojo.create('form',{id:'unieap-print-form',method:'post',target:'printIframe'});
    				dojo.place(form,dojo.body());
    				var input=dojo.create('input',{type:'hidden',name:'myAction',value:'rpc.do?method=doPrint'})
    				dojo.place(input,form);
    				input=dojo.create('input',{type:'hidden',name:'uid',value:''});
    				dojo.place(input,form);
    				form.action=unieap.WEB_APP_NAME + "/unieap/pages/report/jsp/show/UniPrint.jsp";
					
    			}
    			form.submit();
    		}
    	},dc,false);
	},
	
	/**
	 * @summary：
	 * 		获取控件的上下文
	 * @return：
	 * 		{object|Element} obj
	 * @example:
	 * |<script>
	 * | 	var dc = unieap.Action.getViewContext(unieap.byId('form'));
	 * |</script>
	 */
	getViewContext: function(obj){
		if(null!=obj.declaredClass){
			var rootID = obj._rootID;
			if(rootID){
				return viewContextHolder[rootID];
			}	
		}
		else{
			var node = obj;
			while(node){
				if(node.getAttribute && node.getAttribute("xhr")){
					return viewContextHolder[node.getAttribute("id")];
				}
				node = node.parentNode;
			}		
		}	
		//返回frameset结构的页面上下文	
		if("undefined" ==typeof(viewContextHolder)){
			return null;
		}
		return viewContextHolder["default"];
	},

	/**
	 * @summary：
	 * 		导出RowSet结果集
	 * @param:
	 * 		{object} inData 导出相关信息
	 * @example：
	 * |	var data={
	 * |		${1}store:store,
	 * |		${2}layout:
	 * |		[
	 * |			[
	 * |				[
	 * |					{name:"attr_empno",label:"员工编号",width:"80"}
	 * |				]
	 * |			],
	 * |			[
	 * |				[
	 * |					{name:"attr_ename",label:"姓名" , rowSpan:2,width:"150"},
	 * |					{label:"基本信息",colSpan:4,isMulTitle:true}
	 * |				],
	 * |				[
	 * |					{name:"attr_deptno",label:"部门", colSpan:1, width:"150",decoder:{"10":"财务部","20":"开发部"}}, 		
	 * | 					{name:"attr_hiredate",label:"入职日期" , width:"160", dataFormat:'yyyy-MM-dd'},
	 * | 					{name:"attr_job",label:"职位", width:"150"},
	 * |					{name:"attr_sal",label:"工资", width:"150",dataFormat:'#,###.00'}
	 * |				]
	 * |			]
	 * |		],
	 * |		${3}url:"/customRpc.do?method=print",
	 * |		${4}unitedCells:['detp','city'],
	 * |		${5}parameters:{username:"zhangsan",password:"***"},
	 * |		${6}lockedData：[{salary:"最大：20000"},{salary:"平均：4000"}],
	 * |		${7}footer："平均工资：4000  最大年限 1",
	 * |		${8}type:'server'
	 * |	}
	 * |	unieap.Action.doExport(data);
	 * ${1}要导出的DataStore对象
	 * ${2}列描述信息集合（包括名称、宽度、转义字典、格式化等信息）
	 * ${3}自定义提交url地址
	 * ${4}合并单元格信息
	 * ${5}传递其他额外信息
	 * ${6}锁定行数据，可以为空
	 * ${7}字符串类型，自定义信息，可以为空
	 * ${8}导出方式(server为服务器端导出，client为客户端导出)
	 */
	doExport: function(inData){
		var url = unieap.WEB_APP_NAME	+ (inData["url"] ? inData["url"]  : this.EXPORTURL );
		url = unieap.buildRequestPath(url,inData.parameters);
		if(!inData.layout){
        	 //alert("导出的布局信息为空！");
			alert(RIA_I18N.rpc.layoutInfoEmpty);
        	 return;
        }
		var dc=new unieap.ds.DataCenter();
		var ds = inData["store"];
		dc.setParameter("layout",inData["layout"]);
		inData["unitedCells"] && dc.setParameter("unitedCells",inData["unitedCells"]);
		dc.setParameter("type",inData["type"]);
		dc.setParameter("dsName",ds.getName());
		for(var param in inData['parameters']||{}){
			dc.setParameter(param,inData['parameters'][param]);
		}
		inData["footer"] && dc.setParameter("footer",inData["footer"]);
		inData["lockedData"]&&dc.addDataStore(new unieap.ds.DataStore("lockedStore",inData["lockedData"]));
		if(inData["type"]=="server"){
			ds =ds.collect({policy:'none',metaData:true}); 
			ds.setPageSize(-1);
		}
		dc.addDataStore(ds);
		var form = dojo.byId("unieap_export_form"),iframe;
		 if(!form){
		 	if(dojo.isIE < 9){
		 		iframe=dojo.create("<iframe name='exportIframe' style='border:0px' width=0 height=0></iframe>");
		 	}else{
		 		iframe=dojo.create('iframe',{name:'exportIframe',style:{border:'0px'}, width:0,height:0});
		 	}
			dojo.place(iframe,dojo.body())
			form = dojo.create("form",{
				id : "unieap_export_form",
				name : "unieap_export_form",
			    method : "post",
			    target:'exportIframe'
			});
			
			var input = dojo.create("input",{
				name : "data",
				type : "hidden"
			});
			
			dojo.place(input,form);
			dojo.place(form,document.body);
		 }
		 else{
		 	input = form.firstChild;
		 }		 
	    input.value =dc.toJson();
		if(unieap.isEncrypt){
			dojo.require("unieap.util.encrypt");
			var digestInput = form.lastChild;
			if(digestInput.getAttribute("name")!="digest"){
				digestInput = dojo.create('input',{type:'hidden',name:'digest'});
				dojo.place(digestInput,form);
			}
			digestInput.value=  hex_sha1(escape(input.value).toLowerCase());
		}
	    form.action = url;
	    form.submit();	
	},
	
	
	/**
	 * @summary：
	 * 		获取指定Grid的个性化定义信息，同步请求
	 * @param：
	 * 		{string} id
	 * 		Grid的唯一标识
	 * @return：
	 * 		{array|null}
	 * @description：
	 * 		lock是否锁定{1是|0否}，show是否显示{1是|0否}，index列顺序，
	 * 		label显示名称，sort指定排序信息只能指定一个（暂时没有实现）
	 * 	@example：
	 * 	| [
	 * 	|	{lock:1,show:1,index:0,label:"职位"},
	 * 	|	{lock:0,show:1,index:1,label:"工资",sort:"asc"}
	 * 	| ]	
	 */
	getIndividual:function(id){
		//表格个性化去掉前台缓存，每次都会发请求，后台有缓存不会每次都执行SQL语句
		//var obj = window["unieap.individual"];
		var obj = false;
		if(unieap.WEB_APP_NAME==null) return null;
		if(!obj){
			unieap.Action.requestData({
            	url:unieap.WEB_APP_NAME+this.GINDIVIDUALURL,
            	parameters:{
	    			path:unieap.cmpPath
	    		},
           		sync:true,
           		timeout:5000,
            	load:function(dc){
            		var msg = dc.getParameter("individual");
            		obj = window["unieap.individual"] = msg;
            	},
            	error:function(err){
            		obj = {};
            		err.getDetail?alert(err.getDetail()):alert(RIA_I18N.rpc.getInfoError);
            	}            	
            });
		}
		return obj[id]||null;
	},
	
	
	/**
	 * @summary：
	 * 		保存Grid个性化定制信息
	 * @param：
	 * 		{object} inData
	 * 		保存个性化所提供的必要信息
	 * @example:
	 * |	var data={
	 * |		${1}id:"myGrid",
	 * |		${2}data:[
	 * |			{lock:1,show:1,index:0,label:"职位"},
	 * |			{lock:0,show:1,index:1,label:"工资",sort:"asc"}
	 * |		],
	 * |		${3}callback:function(dc){
	 * |		}
	 * |	}
	 * |	unieap.Action.setIndividual(data);
	 * ${1}{string} Grid的唯一标识
	 * ${2}保存的数据，如果为null时清除服务器保存的Grid个性化信息
	 * ${3}成功回调方法，返回参数为DataCenter对象	
	 */
	setIndividual : function(inData){
		if(unieap.WEB_APP_NAME==null){
			inData.callback && inData.callback();
			return;
		}
		var value=inData['data'];
		if(!inData||!(value instanceof Array)){
			return;
		}
		
		var obj = window["unieap.individual"];
		if(obj&&(dojo.toJson(obj[inData["id"]])==dojo.toJson(value))){
			return;
		}
		var dc = new unieap.ds.DataCenter();
		dc.setParameter("individual",value);
		unieap.Action.requestData({
    		url:unieap.WEB_APP_NAME+this.SINDIVIDUALURL,
    		parameters:{
    			id : inData["id"],
    			path:unieap.cmpPath
    		},
    		preventCache:true,
    		timeout:5000,
    		load:function(dc){
    			obj&&(obj[inData["id"]] = value); //更新本地的缓存个性化数据
        		inData.callback && inData.callback(dc);
    		},
    		error:function(err){
    			
    			err.getDetail?alert(err.getDetail()):alert(RIA_I18N.rpc.saveError);
    		}        		
        },dc);	
	},
	
	
	/*
	 * @summary:
	 * 		登陆后初始化加载缓存数据
	 * @param：
	 * 		{menu} mode 
	 * 		加载模式{load加载所有代码表数据|check检查时间戳只加载有变化的代码表数据}
	 * @param:
	 * 		{function} callback 回调方法
	 */
	loadCacheData : function(mode,callback){
		dojo.require("unieap.cache");
		
		var loading = document.createElement("div");
		loading.style.cssText = "position:absolute;bottom:0px;left:0px;overflow:hidden;height:20px;border:1px solid #eee;width:120px;background:#fff;font:12px;";
		//loading.innerHTML = "正在装载缓存数据...";
		loading.innerHTML = RIA_I18N.rpc.loadingCache;
		document.body.appendChild(loading);		
		//返回本地时间戳对象,格式为object['key']=>timestamp
		
		var dc = new unieap.ds.DataCenter();
		if(mode=="check"){
			var localTimeStamps=unieap.cache.getAllTimeStamps(); 
			dc.setParameter("timeStamps",localTimeStamps);
		}
		unieap.Action.requestData({
			url:unieap.WEB_APP_NAME + this.CACHEURL,
			sync:false,
			parameters:{
				mode:mode
			},	
			load:function(dc){
			
				var serverTimeStamps=dc.getParameter('timeStamps');
				var keys=[];
				var values=[];
				var stamps=[];
				for(var name in dc.dataStores){
					var ds = dc.dataStores[name];
					keys.push(name);
					values.push(ds.getRowSet().toBufJson("primary"));
					stamps.push(serverTimeStamps[name]);
				}
				unieap.cache.putMultiple(keys,values,stamps);
				loading.style.visibility = "hidden";
				callback && callback();
			},
			timeout:5000,
			error:function(text){
				//loading.innerHTML="装载缓存数据失败。";
				loading.innerHTML=RIA_I18N.rpc.loadCacheError;
			}
		},dc,false);	
	},
	
	/**
	 * @summary:
	 * 		提交带有FileInput控件的表单
	 * @description:
	 * 		本方法要求服务器返回具有特定格式的数据，否则前台会提示错误。
	 * 		数据格式为::<textarea>+json+</textarea>,例如 "<textarea>{name:'jack'}</textarea>"。
	 * @param:
	 * 		{object} obj 
	 * @example:
	 * |	<form dojoType="unieap.form.Form" enctype="multipart/form-data" method="post">
	 * |		<div dojoType="unieap.form.TextBox" name="age"></div>
	 * |		<div dojoType="unieap.form.FileInput" name="yourFile"></div>
	 * |	</form>
	 * |	function success(res,args){console.info(arguments);}
	 * |	function error(res,args){console.info(arguments);}
	 * |	${1}var args={
	 * |		${2}url:'/application/demo.do',
	 * |		${3}load:success,
	 * |		${4}error:error,
	 * |		${5}timeout:2000,
	 * |		${6}parameters:{'dc':new unieap.ds.DataCenter().toJson()}
	 * |	};
	 * |	unieap.Action.upload(args);
	 * ${1}上传的参数
	 * ${2}提交路径
	 * ${3}成功后的回调
	 * ${4}失败后的回调，包括url不存在、超时等状况
	 * ${5}设置超时的时间
	 * ${6}额外的参数（可以传DataCenter数据，后台通过request.getParameter方式来获取）
	 */
	upload:function(obj,showLoading){
		dojo.require("dojo.io.iframe");
		obj.parameters = obj.parameters || {};
		var _dc = null;
		var url = obj.url || "";
		url = unieap.buildRequestPath(url,{ajaxRequest:true});
		if(showLoading){
        	unieap.showXhrLoading(true);
        }
		dojo.io.iframe.send({
			url:url||"",
			handleAs:'json',
			form:obj.form||"",
			timeout:obj.timeout||1000*120,//12s后超时
			content:obj.parameters,
			load:function(res,args){
        		var json = res; 
        		if(showLoading){
	            	unieap.showXhrLoading(false);
	            }      	
        		try{
        			json = dojo.fromJson(res);
        		}catch(e){
        		}
				function complete(){
				   if (obj.load) {	
							try{
								obj.context?obj.load.call(obj.context, _dc, args.xhr):obj.load( _dc, args.xhr);
							}catch(e){
								//alert("请求数据成功！但回调方法出错；请检查自定义load回调函数。\n "+dojo.toJson(e,true));
								doAfterFailedCustomLoad();
								alert(RIA_I18N.rpc.loadError+"\n "+dojo.toJson(e,true));
							}
					}
				}
				try{
		 		    json.body.dataStores; //确定返回来的是否为DataCenter格式的Json对象
		            _dc = new unieap.ds.DataCenter(json);	
		            //异常处理
		            if(_isExceptionControl()){
			            if (_dc.getCode() < 0) {
			            	obj.error(res);
			            	return;
			            }else{
			            	var	dc = obj.dc || globalDataCenter;
			            	dc.append(_dc, obj.coverage || "discard");
			            	if (_dc.getCode() > 0) {
								dojo.require("unieap.dialog.MessageBox");
								MessageBox.alert({
									// 成功提示
									title : RIA_I18N.rpc.success,
									// message : _dc.getTitle() || "请求操作成功" ,
									message : _dc.getTitle() || RIA_I18N.rpc.successMessage,
									onComplete : complete
								});
							}
			            }
		            }
		            else{
						if(_exceptionProcess(json,obj,_dc,complete)){
							return;
						}
		            }   
		 		}catch(e){
		 			_dc = json;
		 		}
				complete();
			},
			error:function(res,args){
				if(showLoading){
	            	unieap.showXhrLoading(false);
	            }  
				obj.error&&dojo.hitch(obj,obj.error(res,args));
			}
		});
	}
});
}