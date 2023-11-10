dojo.require("unieap.rpc");

unieap.dbDialect = "hibernate";

dojo.mixin(
				unieap.Action,
				{

					// 获取代码缓存地址
					CODELISTURL : "/techcomp/ria/getSingleCodesList.action",
					// 获取多个代码缓存地址
					MULTICODELISTURL : "/techcomp/ria/getMultiCodeList.action",
					// 查询数据地址
					QUERYURL : "/techcomp/ria/rpc!query.action",
					// 统计地址
					COUNTURL : "/techcomp/ria/rpc!count.action",
					// 更新数据地址
					UPDATEURL : "/techcomp/ria/rpc!update.action",
					// 打印地址
					PRINTURL : "/?.action",
					// 导出地址
					EXPORTURL : "/techcomp/ria/csvExportAction!export.action",
					// 获取个性化信息地址
					GINDIVIDUALURL : "/techcomp/ria/rpc!getIndividual.action",
					// 保存个性化信息地址
					SINDIVIDUALURL : "/techcomp/ria/rpc!setIndividual.action",
					// 获取缓存地址
					CACHEURL : "/techcomp/ria/checkCache.action",

					loadAllCodes : function(codelistKey) {
						var data = {
							url : unieap.WEB_APP_NAME
									+ "/techcomp/ria/getAllCodesByCodelistKey.action",
							parameters : {
								store : codelistKey
							},
							headers : {
								ajax : "true",
								charset : "utf-8"
							},
							sync : true,
							timeout : 120,
							load : function(dc, xhr) {
								var store = dc.getDataStore(codelistKey);
								dataCenter.addDataStore(store);
							},
							context : this
						};
						unieap.Action.requestData(data, dataCenter, false);
					},
					/*
					 * @summary: 登陆后初始化加载缓存数据 @param： {menu} mode
					 * 加载模式{load加载所有代码表数据|check检查时间戳只加载有变化的代码表数据} @param:
					 * {function} callback 回调方法
					 */
					loadCacheData : function(mode, callback) {
						dojo.require("unieap.cache");

						var loading = document.createElement("div");
						loading.style.cssText = "position:absolute;bottom:0px;left:0px;overflow:hidden;height:20px;border:1px solid #eee;width:120px;background:#fff;font:12px;";
						// loading.innerHTML = "正在装载缓存数据...";
						loading.innerHTML = RIA_I18N.rpc.loadingCache;
						document.body.appendChild(loading);
						// 返回本地时间戳对象,格式为object['key']=>timestamp

						var dc = new unieap.ds.DataCenter();
						if (mode == "check" || mode == "update") {
							var localTimeStamps = unieap.cache
									.getAllTimeStamps();
							dc.setParameter("timeStamps", localTimeStamps);
						}
						unieap.Action.requestData( {
							url : unieap.WEB_APP_NAME + this.CACHEURL,
							sync : false,
							parameters : {
								mode : mode
							},
							load : function(dc) {
								var serverTimeStamps = dc.getParameter('timeStamps');
								if(mode == "check"){
									for(var name in serverTimeStamps){
										unieap.cache.remove(name);
									}
								}else if(mode == "update"){
									for(var name in serverTimeStamps){
										var ds = dc.getDataStore(name);
										if(ds){
											unieap.setDataStore(ds,dc,true,serverTimeStamps[name]);
										}
									}
								}
								loading.style.visibility = "hidden";
								callback && callback();
							},
							timeout : 50000,
							error : function(text) {
								// loading.innerHTML="装载缓存数据失败。";
							loading.innerHTML = RIA_I18N.rpc.loadCacheError;
						}
						}, dc, false);
					}
				});
//用于记录session过期时发的请求，在重新登录后，向后台发送
var dataTimeOutArray = new Array();
var dcTimeOutArray = new Array();
var showLoadingTimeOutArray = new Array();
//超时处理
_timeoutProcess = function(json,data,dc,showLoading){
	if(dojo.isString(json)  &&  
		json.match(unieap.session.timeout) && 
		data["sessionout"]!=false){
		if (unieap.session.dialogRelogin){
			dojo.require("unieap.dialog.DialogUtil");
			var dialog = unieap.getDialog();
			dataTimeOutArray.push(data);
			dcTimeOutArray.push(dc);
			showLoadingTimeOutArray.push(showLoading);
			if (typeof(dialog)=='undefined'||dialog.url.indexOf(unieap.relogin)<0){
				DialogUtil.showDialog({
					url : unieap.WEB_APP_NAME+unieap.relogin,
					width: "563",
					height: "360",
					resizable:false,
					isExpand:false,
					isClose:false,
					//会话过期,请重新登录
					title : RIA_I18N.rpc.sessionOut,
					onComplete:function(value){
						if(value=="success"){
							for (var i=0;i<dataTimeOutArray.length;i++){
								unieap.Action.requestData(dataTimeOutArray[i],dcTimeOutArray[i],showLoadingTimeOutArray[i]);
							}
							dataTimeOutArray = new Array();
							dcTimeOutArray = new Array();
							showLoadingTimeOutArray = new Array();
						}
					}									
				});	
			}
		}
		else{
			var topWin = unieap.getTopWin();
			topWin.location=topWin.location;
		}	
		return true;						
	}
	return false;	
}
//异常弹出是否可控制
_isExceptionControl = function(){
	return true;
}
// 异常处理for v4
_exceptionProcess = function(xhr) {
	var json = null;
	if (xhr.responseText) {
		json = dojo.fromJson(xhr.responseText);
	} else {
		json = xhr;
	}
	var _dc = new unieap.ds.DataCenter(json);
	if (_dc.getCode() == -1) {
		unieapx.exception.Handler.handleSystemException(_dc);
	} else {
		unieapx.exception.Handler.handleBusinessException(_dc);
	}
}
//帐号踢出处理
_accountKickedProcess = function(json){
	if(dojo.isString(json)  &&  
		json.match(unieap.account.kicked)){
		var topWin = unieap.getTopWin();
		topWin.location = unieap.WEB_APP_NAME + unieap.kicked; 
		return true;						
	}
	return false;	
}