dojo.provide("unieap.global");
	/**
	 * @declaredClass: unieap.global
	 * @summary: 定义全局变量，用户可以修改里面的参数
	 */

if(!unieap){
	unieap={};
}

if(!unieap.global){
	unieap.global={};
}

// dojo.destroy = function(node){
// if(node) {
// dojo._destroyElement(node);
// }
// }
/**
 * @summary: 根据id获取组件方法
 * @param： {string} id 组件在页面上的唯一标识
 * @param: {domNode} rootNode 控件所在的上下文节点
 * @example: | var widget = unieap.byId("grid");
 */
unieap.byId=function(id,rootNode){
// if(dojo.isString(id)){
// var framePageContainer=document.getElementById("framePageContainer");
// var visible =
// dojo.query(".unieap-container.unieapVisible",framePageContainer);
//		
// if(visible[0]){
// id = visible[0].id + id;
// }
//	
// }
	if(!dijit) return null;
	var contextId =rootNode?rootNode.id:"";
	return dijit.byId(contextId ? contextId+id : id);
}

// 获取单帧下，每个页面唯一的datacenter，如果没找到，就返回全局的
// 兼容单帧和非单帧
unieap.getDataCenter = function(){
	if(typeof(_currentNodeOfSingleFrame) != "undefined" && _currentNodeOfSingleFrame != null && typeof(viewContextHolder) != "undefined" && viewContextHolder != null){
		if(viewContextHolder[_currentNodeOfSingleFrame.id]){
			return viewContextHolder[_currentNodeOfSingleFrame.id].dataCenter;
		}   	
  }
  return window.dataCenter;	
}
unieap.destroyDialogAndMenu = function(pane){
	if(!pane) return;
	var widgets = dojo.query("> [widgetId]",document.body).map(dijit.byNode);
	dojo.forEach(widgets,function(widget){
		if(widget){
			if(pane.dialog && (widget.id in pane.dialog)){
				widget.domNode && unieap.destroyWidgets(widget.domNode)
				widget.destroy && widget.destroy();
			}
			else if(pane.menu && (widget.id in pane.menu)){
				widget.destroy && widget.destroy();
				delete pane.menu[widget.id];
			}
		}
	});
	for(menuId in pane.menu){
		if(unieap.byId(menuId)){
			var menu = unieap.byId(menuId);
			if(menu.declaredClass=="unieap.menu.Menu"&&!menu.isSystemMenu)
				menu.destroy();
		}
	}
}

/**
 * @summary: 根据id和上下文来销毁控件
 * @param {String}
 *            id 要销毁的控件id
 * @param {domNode}
 *            context 控件所在的上下文节点
 */
unieap.destroyWidget=function(id,rootNode){
	if(!dijit) return;
	var contextId =rootNode?rootNode.id:"";
	var widget=dijit.byId(contextId ? contextId+id : id);
	widget && widget.destroy && widget.destroy();
}

/**
 * @summary: 删除context上下文中的所有widget控件
 * @param: {String} context
 */
function destroyxhrWidget(xhrNodeId){
	var id = xhrNodeId,
			viewContext = viewContextHolder[id];
		if(viewContext){
			dojo.forEach(viewContext.instances,function(elem){
				var instanceName = elem[0];
				var instance = elem[1];
				var _scribeHandles = instance._scribeHandles
				if(_scribeHandles){
					for(var index = 0;index < _scribeHandles.length;index++){
						unieap.unsubscribe(_scribeHandles[index]);
					}
				}
				window[elem[0]] = null;
				if(instance.initData){
					instance.initData = null;
				}
				var dc = instance.dataCenter;
				if(dc){
				for(ds in dc.dataStores){
					dc.dataStores[ds] = null;
					}
				}
				instance.dataCenter=null;
				instance.rootNode=null;
				instance = null;
			});
			viewContext.dataCenter 
				&& viewContext.dataCenter.clear 
				&& viewContext.dataCenter.clear();
			viewContext.dataCenter = null;
			viewContext.instances = null;
			viewContext.rootNode = null;
			viewContext.topics = null;
			viewContext=null;
			delete viewContextHolder[id];
		}
		//如果存在unieapViewContextHolder，在单帧下销毁节点时，需要删除对应内容
		if(typeof(unieapViewContextHolder) != "undefined"){
			if(unieapViewContextHolder[id]){
				delete unieapViewContextHolder[id];
			}
		}
}

/**
 * @summary: 删除context上下文中的所有widget控件
 * @param: {String} context
 */
unieap.destroyWidgets=function(rootNode){
	if(!dijit  || !rootNode) return;
	var widgets = dojo.query("[widgetId]",rootNode).map(dijit.byNode),
		rootWidget = unieap.byId(rootNode.id),
		xhrNodeIds =[],
		isXDialogLoad = (typeof(rootWidget)!="undefined")?((rootWidget.declaredClass == "unieap.xdialog.Dialog")?true:false):false;
	for(var i=widgets.length-1,widget;widget=widgets[i];i--){
		if(widget.declaredClass=="unieap.layout.ContentPane"){
			if(widget.domNode.getAttribute("xhr")&&widget.id)
				xhrNodeIds.push(widget.id)
		}
		if(widget.destroy){
			widget.destroy();
			widget.destroyRecursive();
		}
		else if(widget.id){
			dijit.registry.remove(widget.id);
		}
		if(widget._viewContext){
			widget._viewContext = null;
		}
	}
	//如果是XDialog需要把它内部加载的XDialog先干掉
	if(isXDialogLoad){
		var _dialogs = rootWidget._dialogs;
		if(_dialogs && _dialogs.length > 0){
			while (_dialogs.length > 0) {
				var _dialog = _dialogs.pop();
				unieap.destroyWidgets(_dialog.containerNode);
				unieap.destroyWidget(_dialog);
			}
		}
	}
	if(xhrNodeIds.length>0){
		for(var index=0;index<xhrNodeIds.length;index++){
			destroyxhrWidget(xhrNodeIds[index]);
		}
	}
	var xhr = rootNode.getAttribute("xhr");
	if(xhr){
		destroyxhrWidget(rootNode.getAttribute("id"));
		rootNode.removeAttribute("xhr");
		var context = "default";
		if(viewContextHolder[context]){
			viewContextHolder[context].dataCenter = null;
		}
		// 如果是XDialog方式加载的话，需要从数组中弹出上一个节点，肯定数组当中至少有两个节点
		if(isXDialogLoad && typeof(_currentNodesOfSingleFrame) != "undefined" && _currentNodesOfSingleFrame.length > 1){
			_currentNodesOfSingleFrame.pop();
			_currentNodeOfSingleFrame = _currentNodesOfSingleFrame[_currentNodesOfSingleFrame.length - 1];
			var viewContext = viewContextHolder[_currentNodeOfSingleFrame.id];
			if(typeof(viewContext) != "undefined" && viewContext != null){
				_restoreCurrentViewContext(viewContext);
			}
		}
	}
	
	dojo.isIE && CollectGarbage();
}

/**
 * @summary: 设置事件方法中this指针的上下文
 * @description: 当为true时，可在单帧菜单框架下使用，在用户自定义事件中this指针代码自身js闭包的空间；当为false时，在用户自定义事件中this指向被点击控件；
 * @type: {boolean}
 * @default: false
 */
unieap.isXHR = false;

/**
 * @summary: 设置是否支持RIA的页面调试工具
 * @description: 当为true时，通过快捷键Alt + X 可以调试当前页面dataCenter对象，为false没有此功能
 * @type: {boolean}
 * @default: true
 */
unieap.isDebug = true;
/**
 * @summary: 设置是否使用客户端缓存
 * @type: {boolean}
 * @default: false
 */
unieap.global.isUseClientCache = false;

/**
 * @summary: 设置汉字所占字节
 * @type: {number}
 * @default: 3
 */
unieap.global.bitsOfOneChinese=2;

/**
 * @summary: 社保定制，View.js中提供的增删改查的方法不刷新DataStore状态
 * @type: {boolean}
 * @default: false
 */
unieap.global.notResetUpdate=false;

/**
 * @summary: 社保定制，readonly是否弹出下拉框
 * @type: {boolean}
 * @default: false
 */
unieap.global.combobox_notReadonlyPopup=false;
unieap.global.comboboxtree_notReadonlyPopup=false;
unieap.global.datatextbox_notReadonlyPopup=false;
unieap.global.textboxwithicon_notReadonlyPopup=false;

/**
 * @summary: 社保定制，setValue时是否校验，如果校验会对性能有影响
 * @type: {boolean}
 * @default: false
 */
 unieap.global.validateOnSetValue=false;

/**
 * @summary: 数据收集默认策略
 * @type: {object}
 * @default: {parameters:"all",dataStores:"all"}
 */
unieap.global.dataOption={parameters:"all",dataStores:"all"};

/**
 * @summary: grid自动分页请求url
 * @type: {string}
 * @default: "/techcomp/ria/pageQueryAction!commonMethod.action"
 */
unieap.global.gridServerPagingUrl = "/techcomp/ria/pageQueryAction!commonMethod.action";

/**
 * @summary: 数据类型
 * @description: 数据类型与java.sql.Types数据类型一致
 * @type: {object}
 * @default: 无
 */
unieap.DATATYPES={
		TINYINT : -6,
	 	SMALLINT : 5,
	 	INTEGER : 4,
  		BIGINT : -5,
  		FLOAT : 6,
  		REAL : 7,
  		DOUBLE : 8,
  		NUMERIC : 2,
  		DECIMAL : 3,
  		VARCHAR : 12,
		STRING : 12,
        LONGVARCHAR : -1,
		DATE : 91,
  		TIME : 92,
		TIMESTAMP : 93,
   		BOOLEAN : 16
};

unieap.session = {
	// Ajax请求返回的超时的标记
	timeout : "<!-- THE-NODE-OF-SESSION-TIMEOUT -->",
	// 登陆成功
	reloginSuccessful:"THE-NODE-OF-RELOGIN-SUCCESSFUL",
	/**
	 * @summary: 是否用Dialog重新登陆
	 * @type: {boolean}
	 */
	dialogRelogin : true
};

/**
 * @summary: 录制脚本统一开关
 * @type: {boolean}
 * @default: true
 */
unieap.recordScript = true;
//用于v4录制脚本
unieap.scriptCount = 0;
//用于v4录制脚本
unieap.scriptDQ = [];
//用于v4录制脚本
unieap.recordScriptMap = {};


//用于v4
unieap.account = {
		//帐号被踢出的标记
		kicked : "<!-- THE-NODE-OF-ACCOUNT-KICKED -->"
	};

unieap.relogin = "/login.do?method=relogin";
	
/**
 * @summary: 动画统一开关
 * @type: {boolean}
 * @default: true
 */
unieap.animate = false;

unieap.defaultCacheDBName = "com_neusoft_unieap_clientCache_"; 

unieap.widget={
	
	/**
	 * @summary: 是否在Form和Grid进行主动校验时自动提示错误信息
	 * @type: {boolean}
	 * @default: false
	 */
	errorPrompt:false,
	
	navigator:{
		/**
		 * @summary: 设置是否使用导航回调函数
		 * @type: {boolean}
		 * @default: false
		 */
		onCompleteByClick : false,
		/**
		 * @summary: 导航条是否默认显示
		 * @type: {boolean}
		 * @default: true
		 * @description： 导航在只有一个导航页的时候是否显示导航条
		 */
		alwaysShowNavigator: true,
		/**
		 * @summary: 导航条是否显示
		 * @type: {boolean}
		 * @default: true
		 * @description： 设置成false后导航条不显示，导航的功能还会有效
		 */
		showNavigator: true
	},
	tree:{
		/**
		 * @summary: 点击节点展现节点树的开关
		 * @type: {boolean}
		 * @default: true
		 */
		expandByOnClickLabel : false
	},
	
	grid:{
		/**
		 * @summary: 是否总是在grid的表头上显示菜单按钮(点击按钮就会弹出菜单)
		 * @type: {boolean}
		 */
		alwaysShowMenu:false,
		
		/**
		 * @summary: grid翻页时，当本页发生变化时默认采取的操作
		 * @description: discard： 不提示，不保存，翻页
		 * 
		 * saveconfirm： 根据提示进行操作 “数据发生改变，是否保存修改?” 选择确定：保存，不翻页 选择取消：不保存，翻页
		 * discardconfirm：根据提示进行操作，“数据发生改变，是否放弃修改？” 选择确定：不保存，翻页 选择取消： 不保存，不翻页
		 * @type: {string}
		 * @enum: {"discard"|"saveconfirm"|"discardconfirm"}
		 */
		pagingModifiedSave:"saveconfirm",
		
		
		/**
		 * @summary: grid 的默认编辑模式
		 * @type: {string}
		 * @enum: {"rowEdit"|"cellEdit"|"readonly"}
		 * @description： xgrid目前只支持rowEdit
		 * 
		 */
		editType:"readonly",
			
		
		/**
		 * @summary: 设置grid是否单击触发编辑
		 * @type: {boolean}
		 * @description： xgrid操作模式无需设置此属性，xgrid双击触发编辑
		 */
		singleClickEdit:false,
		
		/**
		 * @summary: 设置每页显示的数据条数
		 * @type: {boolean|array}
		 */
		userPageSize:false
			
	},
	form:{
		
		/**
		 * @summary： 当输入文本框内容为空并且鼠标焦点置入时,设置文本框是否显示当前时间。
		 * @type： {boolean}
		 * @default: true
		 */
		autoDate : true,
		
		
		alwaysShowErrMessage:true,
		
		/**
		 * @summary: 下拉框的显示类型，默认为list
		 * @default: "list"
		 * @type： {string}
		 * @enum： {"table"|"list"|"multi"}
		 */
		comboDisplayStyle: "list",
		
		/**
		 * @summary: 多选下拉框的弹出结构
		 * @see： unieap.form.ComboBoxPopup
		 */
		comboStructure: null,
		
		/**
		 * @summary: 是否在每个下拉框都否显示 <请选择> 列
		 * @type: {boolean}
		 * @default: false
		 */
		comboShowSelect : false,

		/**
		 * @summary: 下拉框 <请选择> 列，自定义显示
		 * @description： 下拉框 <请选择> 列，自定义显示，当comboShowSelect的值为true时有效
		 */
		comboShowSelectText : "<请选择>", // MODIFY BY TENGYF
		//comboShowSelectText : RIA_I18N.global.comboBox.choices,
		
		/**
		 * @summary: 下拉框 <请选择> 列，自定义VALUE
		 * @description： 下拉框 <请选择> 列，自定义VALUE，当comboShowSelect的值为true时有效
		 */
		comboShowSelectValue : "",
		
		/**
		 * @summary: 下拉框自动选择第一个有值的项
		 * @type： {boolean}
		 * @default： false
		 * @description： 当下拉框执行模糊查询后，按下回车键，下拉框自动赋第一个有值的项
		 */
		comboSelectFirstValue : false,
		
		/**
		 * @summary:
		 * 		设置是否显示FieldSet的提示信息
		 * @type:
		 * 		{boolean}
		 * @default:
		 * 		true
		 */	
        showTitle: true,
        
        /**
		 * @summary:
		 * 		设置是否点击日期输入框时弹出日期框
		 * @type:
		 * 		{boolean}
		 * @default:
		 * 		false
		 */	
        dataTextBoxIsClickPopup: false,
		
		/**
		 * @summary: 当焦点离开时校验输入值是否在下拉框中，如果不在清空下拉框
		 * @type： {boolean}
		 * @default： true
		 * @description： 当输入非法值时焦点离开自动清空,如果为false则添加到下拉列表中展现，并加入codelist中，但datastore中不会加入。
		 */
		textValidate : true,
		
		/**
		 * @summary: 是否开启combobox下拉框大数据量优化方案
		 * @type： {boolean}
		 * @default： true
		 * @description： 当下拉框数据很大时，默认只显示50条数据
		 */
		comboBoxPopupOptimize : true
		
	}
}

// 引入国际化文件
if('undefined' == typeof(RIA_I18N)){
	if('undefined' != typeof(UNIEAP_LOCALE) && (UNIEAP_LOCALE== 'zh_CN' || UNIEAP_LOCALE == 'en_US')){
		!unieap.locale&&(unieap.locale=UNIEAP_LOCALE);
		dojo.require("unieap.nls.application_"+UNIEAP_LOCALE);
	}else{
		dojo.require("unieap.nls.application_zh_CN");
	}
}
// 定义unieap和document的包装类
function UnieapDecorate(){
}
UnieapDecorate.prototype = unieap;

function DojoDecorate(){
}
DojoDecorate.prototype =dojo;