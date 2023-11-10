dojo.provide("unieapx.layout.NavigatorPane");
dojo.require("unieap.layout.Container");
dojo.declare("unieapx.layout.NavigatorPane", [unieap.layout.Container], {
	/**
	 * @declaredClass:
	 * 		unieap.layout.ContentPane
	 * @superClass:
	 * 		unieap.layout.Container
	 * @summary:
	 * 		容器类
	 * @classDescription:
	 * 		在TabContainer或StackContainer中使用
	 * @example:
	 * |<div dojoType="unieap.layout.TabContainer" style="width:400px;height:400px;">
	 * |	<div dojoType="unieap.layout.ContentPane" title="tab1">ContentPane,这是一个ContentPane!</div>
	 * |	<div dojoType="unieap.layout.ContentPane" title="tab二"></div>
	 * |	<div dojoType="unieap.layout.ContentPane" title="容器三"></div>
	 * |</div>
	 * 		包含三个ContentPane的TabContainer
	 * @img：
	 * 		images/layout/contentpane.png
	 */
	
	//配置属性接口
	UserInterfaces : dojo.mixin({
		href : "string",
		showLoading : "boolean",
		refreshOnShow : "boolean",
		selected : "boolean",
		closable : "boolean",
		hidden : "boolean",
		title : "string",
		onCompleteByClick : "boolean",
		onClose : "function",
		onShow : "function",
		onInit : "function",
		onHide : "function",
		enabled	: "boolean"
	},
	unieap.layout.Container.prototype.UserInterfaces),
	
	/**
	 * @summary:
	 * 		使用iframe的src路径
	 * @description：
	 * 		当配置href时，会将href链接的内容放入iframe中显示出来。
	 * @type：
	 * 		{string}		
	 */
	href: "",
	
	//用于记录本页面在返回时配置的onComplete信息
	_navigatorPaneSubscribe: null,

	//是否已经初始化内容
	_hasInit:false,
	
	//是否在TabContainer中
	_inTabContainer:false,
	
	/**
	 * @summary:
	 * 		是否显示登录进度条
	 * @type:
	 * 		{boolean}
	 * @default:
	 * 		false
	 */
	showLoading:false,
	
	/**
	 * @summary:
	 * 		页面显示时是否需要刷新页面
	 * @type:
	 * 		{boolean}
	 * @default：
	 * 		false
	 */
	refreshOnShow:false,
	
	
	/**
	 * @summary:
	 * 		是否默认选中
	 * @type：
	 * 		{boolean}
	 * @default：
	 * 		false
	 * @description：
	 * 		当所有的ContentPane都未设置selected时，选中第一个ContentPane。
	 * 		否则选中配置selected的ContentPane。
	 * 		当多个ContentPane都设置selected时，选中第一个配置selected的ContentPane。
	 */
	selected:false,
	
	/**
	 * @summary:
	 * 		设置Tab页在Tab容器中是否可关闭,不适合StackContainer
	 * @type：
	 * 		{boolean}
	 * @default：
	 * 		false
	 */
	closable:false,
	
	/**
	 * @summary:
	 * 		设置Tab页在Tab容器中是否隐藏
	 * @description:
	 * 		在StackContainer容器中无效
	 * @type：
	 * 		{boolean}
	 * @default：
	 * 		false
	 * @example:
	 * |<div dojoType="unieap.layout.TabContainer" style="width:400px;height:400px;">
	 * |	<div dojoType="unieap.layout.ContentPane" title="测试一"></div>
	 * |	<div dojoType="unieap.layout.ContentPane" title="测试二" hidden="true"></div>
	 * |</div>
	 */
    hidden:false,
	
	
	/**
	 * @summary:
	 * 		设置ContentPane在Tab容器中的显示标签
	 * @type:
	 * 		{string}
	 * @example:
	 * |<div dojoType="unieap.layout.TabContainer" style="width:400px;height:400px;">
	 * |	<div dojoType="unieap.layout.ContentPane" title="测试一"></div>
	 * |	<div dojoType="unieap.layout.ContentPane" title="测试二" hidden="true"></div>
	 * |</div>
	 */
	title:'',
	
	onCompleteByClick:false,
    
	/*
	 * @summary:
	 * 		装载页面内容的提示语
	 * @type：
	 * 		{string}
	 * @default:
	 * 		"正在装入..."
	 */
	loadingMessage: RIA_I18N.layout.contentPane.loading,
	
	/**
	 * @summary:
	 * 		设置Tab页在Tab容器中是否可编辑
	 * @type:
	 * 		{boolean}
	 * @default:
	 * 		true
	 */
	enabled:true,
	
	
	data: null,
	
	setData: function(data){
		this.data = data;
	},

	getData: function(data){
		return this.data;
	},


	setOnCompleteByClick: function(onCompleteByClick){
		this.onCompleteByClick =onCompleteByClick;
	},
	getOnCompleteByClick: function(){
		return this.onCompleteByClick;
	},
	
	 checkTime : function(i, j)
	{
	   if(j){
	     i = '0000' + i;
	     return i.substr(i.length - 4);
	   }
	   if (i < 10)
	   {
	      i = "0" + i;
	   }
	   return i;
	},
	postCreate : function(){
		this.inherited(arguments);
		this.navigatorSubscribe = [];
		this.origValue = this.data;
		var data = this.data;
		if(data && data.declaredClass === "unieap.ds.DataCenter"){
			this.origparameters = {};
			for(var a in data.parameters){
				this.origparameters[a] = data.parameters[a];
			}
		}
		var time = new Date();
		beginTime = time.getTime();
//		console.log("开始请求“"+ this.title +"”["+unieap.userAccount+" "+ this.checkTime(time.getHours())+":"+this.checkTime(time.getMinutes())+":"+this.checkTime(time.getSeconds())+":"+this.checkTime(time.getMilliseconds(), 1)+"]"+"..."); // MODIFY BY TENGYF
		console.log(RIA_UNIEAPX_I18N.layout.beginRequest + "“"+ this.title +"”["+unieap.userAccount+" "+ this.checkTime(time.getHours())+":"+this.checkTime(time.getMinutes())+":"+this.checkTime(time.getSeconds())+":"+this.checkTime(time.getMilliseconds(), 1)+"]"+"...");
	},
	
//	cloneDC: function(dc){
//		var newDC = new unieap.ds.DataCenter;
//		newDC.parameters = dc.parameters;
////		dojo.forEach(dc.getDataStores(), function(store){
////			newDC.addDataStore(store.getName(),store);
////		});
//		var stores = dc.getDataStores();
//		for(store in stores){
//			var name = stores[store].getName();
//			newDC.addDataStore(name,stores[store].clone(name));
//		}
//		return newDC;
//	},
	
	startup: function(){
	   this.inherited(arguments);
	   if(this._started){ return; }
	   //判断父容器类型，如果在tabcontainer中不执行onShow操作
	   var parent = this.getParentContainer();
	   if(!parent || parent.declaredClass != "unieapx.layout.NavigatorContainer"){
	   	 this._onShow();
	   }
	   
    },
	
	/**
	 * @summary:
	 * 		重新设置容器的显示内容，将会把原有内容清空。
	 * @param 
	 * 		{String|DomNode|Nodelist} data
	 * @example:
	 * |var content = "<div dojoType='unieap.form.Button' label='取消'></div>";
	 * |unieap.byId("container").setContent(content);
	 */
    setContent:function(data){
    	this.href = "";
		this._setContent(data || "");
		this._createSubWidgets();
		unieap.fireContainerResize(this.domNode);
    },
    
	_setContent: function(cont){
		this.destroyDescendants();
		var node = this.containerNode || this.domNode;
		try{
			while(node.firstChild){
				dojo._destroyElement(node.firstChild);
			}
			if(typeof cont == "string"){
				node.innerHTML = cont;
			}else{
				if(cont.nodeType){
					node.appendChild(cont);
				}else{
					dojo.forEach(cont, function(n){
						node.appendChild(n.cloneNode(true));
					});
				}
			}
		}catch(e){
			
		}
	},
	
	_createSubWidgets: function(){
		var rootNode = this.containerNode || this.domNode;
		try{
			dojo.parser.parse(rootNode, true);
		}catch(e){
			
		}
	},
    
//	resizeContainer : function(size){
//		dojo.marginBox(this.domNode, size);
//		var node = this.containerNode||this.domNode,
//			mb = dojo.mixin(dojo.marginBox(node), size||{});
//		var cb = (this._contentBox = dijit.layout.marginBox2contentBox(node, mb));
//		this.resizeChildrenContainer();
//	},
	
	/**
	 * @summary:
	 * 		设置容器的链接地址
	 * @param 
	 * 		{string} href
	 * @example:
	 * |unieap.byId("container").setHref("http://www.google.com");
	 */
	setHref: function(/*String|Uri*/ href){
		this._if = null;
		this.href=href;
		this.refresh();
	},
	
	_createForm:function(params){
		dojo.byId(this.id+"_form")&&dojo.destroy(this.id+"_form");
		var form = dojo.create("form",{
			name : this.id+"_form",
		    method : "post",
		    target:this.id+"_frame" //将返回的页面显示iframe中
		},dojo.body());
		
		for(var key in params){
			var input=dojo.create('input',{
				type:'hidden',
				value:this._formatParams(params[key]),
				name:key
			},form);
		}
		form.action=this.href;

		return form;
	},
	
	_formatParams:function(param){
		if(param&&(param.declaredClass=='unieap.ds.DataCenter'||param.declaredClass=='unieap.ds.DataStore')){
			return param.toJson();
		}else if(dojo.isObject(param)){
			return dojo.toJson(param);
		}
		return param;
	},
	
	/**
	 * @summary:
	 * 		刷新ContentPane中iframe的src
	 * @example:
	 * |unieap.byId("contentPane").refresh();
	 */
	refresh:function(params){
		if(this.href){
			this.onDownloadStart();
			if(dojo.isObject(params)){
				var form=this._createForm(params);
				form.submit();
			}else{
				if(dojo.isIE){
					this._if.src="javascript:false;";
					this._if.src=this.href;
				}else{
					//在火狐下若主页面尚未加载完成，不添加延时的话，子页面的addOnload不会执行
					var self = this;
				    setTimeout(function(){
					  self._if.src=self.href;
				    },1000);
				}
			}
		}
	},
	
	/**
	 * @summary:
	 * 		在Tab容器中,点击关闭按钮的回调方法
	 * @description:
	 * 		当返回false时,不关闭Tab页。
	 * 		当返回true时,关闭Tab页。
	 * 		默认返回true。
	 * 		不适合StackContainer
	 * @return:
	 * 		{boolean}
	 * @example:
	 * |<div dojoType="unieap.layout.TabContainer" style="width:400px;height:400px;">
	 * |	<div dojoType="unieap.layout.ContentPane" title="测试一" onClose="testOnClose" closable="true"></div>
	 * |	<div dojoType="unieap.layout.ContentPane" title="测试二"></div>
	 * |</div>
	 * |<script>
	 * |	function testOnClose(pane){
	 * |		//自定义逻辑判断
	 * |	}
	 * |</script>
	 *      
	 */
	onClose:function(){
		return true;
	},

	/**
	 * @summary:
	 * 		当内容显示时触发的事件，每次显示的时候均会触发
	 * @param: 
	 * 		{unieap.layout.ContentPane} pane
	 * @example:
	 * |<div dojoType="unieap.layout.TabContainer" style="width:400px;height:400px;">
	 * |	<div dojoType="unieap.layout.ContentPane" title="测试一" onShow="testOnShow"></div>
	 * |	<div dojoType="unieap.layout.ContentPane" title="测试二"></div>
	 * |</div>
	 * |<script>
	 * |	function testOnShow(pane){
	 * |		alert("showing");
	 * |	}
	 * |</script>
	 */
	onShow:function(pane){
		
	},
	
	/**
	 * @summary:
	 * 		当内容初始化时触发的事件，仅在初始化的时候执行一次
	 * @param: 
	 * 		{unieap.layout.ContentPane} pane
	 * @example:
	 * |<div dojoType="unieap.layout.TabContainer" style="width:400px;height:400px;">
	 * |	<div dojoType="unieap.layout.ContentPane" title="测试一" onInit="testOnInit"></div>
	 * |	<div dojoType="unieap.layout.ContentPane" title="测试二"></div>
	 * |</div>
	 * |<script>
	 * |	function testOnInit(pane){
	 * |		alert("init the pane");
	 * |	}
	 * |</script>
	 */
	onInit:function(pane){
		
	},
	
	/**
	 * @summary:
	 * 		当页面内容被隐藏时触发的事件
	 * @description:
	 * 		在tabContainer或stackContainer中打开多个页面时，在切换页面时，会回调此方法
	 * @example:
	 * |<div dojoType="unieap.layout.TabContainer" style="width:400px;height:400px;">
	 * |	<div dojoType="unieap.layout.ContentPane" title="测试一" onHide="testOnHide"></div>
	 * |	<div dojoType="unieap.layout.ContentPane" title="测试二"></div>
	 * |</div>
	 * |<script>
	 * |	function testOnHide(pane){
	 * |		alert("hide the pane");
	 * |	}
	 * |</script>
	 */
	onHide:function(){
		
	},
	
	_onComplete : function(dc){
		
	},
	
	_onShow: function(params){
			
		if(this.postponeRender){
			this.postponeRender = false;
			dojo.parser.parse(this.containerNode);
		}
        if (this.refreshOnShow||!this._hasInit) {
			//refreshOnShow为true或第一次载入 时刷新pane
           // this.refresh(params);
        }
		!this._hasInit&&(this._hasInit=true)&&this._onInit();	

		unieap.fireEvent(this,this.onShow,[this]);
	
    },
	
	_onInit:function(){
		this.resizeContainer();
		unieap.fireEvent(this,this.onInit,[this]);
	},
	
	//创建一个iframe，用于加载设置了href属性的页面
	_createIframe:function(){
		var iframe=null;
		//创建一个带name属性的iframe,在ie下需要显示地设置name属性,不能动态修改
		//不然form的target属性无效
	 	if(dojo.isIE<9){
	 		iframe=dojo.create("<iframe class='u-contentpane-iframe' name='"+this.id+"_frame'></iframe>");
	 	}else{
	 		iframe=dojo.create('iframe',{name:this.id+'_frame','class':'u-contentpane-iframe'});
	 	}
		dojo.style(iframe,{width:0,border:0,height:0});
		dojo.place(iframe,this.containerNode||this.domNode);
		return iframe;
	},
		
	//刷新contentpane的的href前的动作
	onDownloadStart: function(){
		//FIXME:
		//    StackContainer嵌套ContentPane时,loading的效果好像有问题
		//	  
		if(this.showLoading){
			this._loadingNode&&dojo.destroy(this._loadingNode);
			this._loadingNode=dojo.create("div",{'class':'loading','innerHTML':this.loadingMessage},
					this.containerNode||this.domNode,'first');
		}
		if(!this._if){
			this._if=this._createIframe();
			this._if.frameBorder="no";
			var self = this;
			this._if.onreadystatechange = this._if.onload = function(evt){
				if (!this.readyState || 
					this.readyState == "loaded" || 
					this.readyState == "complete") {
					self.onDownloadEnd();
				}
			};
			this._if.onactivate = function(evt){
				dojo.stopEvent(evt);
			}
		}
	},
	
	//成功设置href后的动作
	onDownloadEnd: function(){
		this._loadingNode&&dojo.destroy(this._loadingNode);
		dojo.style(this._if,{
			height:"100%",
			width:"100%"
		});
		//firefox下iframe加载只显示一部分

		(dojo.isFF||dojo.isIE>=8)&&this.height=='auto'&&dojo.style(this.domNode,"height","100%");
	},
	destroy : function(){
		if(this._if){
			this._if.onreadystatechange = null;
			this._if.onload = null;
			this._if.onactivate = null;
		}
		this.origValue = this.data = null;
		this.inherited(arguments);
	},
	/**
	 * @summary:
	 * 		获取iframe的window对象
	 * @return:
	 * 		{object}
	 * @example:
	 * |var container = unieap.byId("container");
	 * |var win = container.getContentWindow();
	 * |alert(win);
	 */
	getContentWindow : function(){
		if(this._if){
			return this._if.contentWindow;
		}	
		return window;
	}
});
