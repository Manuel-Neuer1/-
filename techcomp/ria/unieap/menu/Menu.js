dojo.provide("unieap.menu.Menu");
dojo.require("unieap.menu.MenuItem");
dojo.require("unieap.menu.PopupMenuItem");
dojo.require("unieap.menu.MenuSeparator");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit._KeyNavContainer"); 

dojo.declare("unieap.menu.Menu",[dijit._Widget, dijit._Templated, dijit._KeyNavContainer],{
	/**
	 * @declaredClass:
	 * 		unieap.menu.Menu
	 * @summary:
	 * 		弹出菜单控件,可以设置是否屏蔽系统右键菜单、绑定菜单到指定的dom节点，
	 * 		设置和得到object，主动弹出菜单方法
	 * 		当弹出菜单控件时，系统右键菜单不会弹出
	 * @example:
	 * |<div dojoType="unieap.menu.Menu">
	 * |	<div dojoType="unieap.menu.MenuItem">第一个</div>
	 * |	<div dojoType="unieap.menu.MenuItem" disabled="true">第一个</div>
	 * |	<div dojoType="unieap.menu.MenuSeparator"></div>  
	 * |	<div dojoType="unieap.menu.MenuItem">第三个</div>
	 * |</div>
	 */
	 
	constructor: function() {
		this._bindings = [];
	},

	templateString:'<table class="u-menu-table" cellPadding="0" cellSpacing="0" dojoAttachPoint="menuNode" >'
					+'<tbody dojoAttachPoint="containerNode"></tbody>'
					+'</table>',

	isShowingNow: false,
	
	/**
	 * @summary:
	 * 		是否显示此menu中的menuItem的指定菜单项左侧的css样式
	 * @type：
	 * 		{boolean}
	 * @default:
     * 		true
     *  @example:
     * |<div dojoType="unieap.menu.Menu" isShowIcon=false>
	 * |	<div dojoType="unieap.menu.MenuItem">项目一</div>
	 * |	<div dojoType="unieap.menu.MenuItem">项目二</div>
	 * |	<div dojoType="unieap.menu.MenuItem">项目三</div>
	 * |</div>
	 */
	isShowIcon: true,
	
	/**
	 * @summary:
	 * 		指定menu中menuItem的宽度
	 * @type：
	 * 		{Number | String}
	 * @default:
     * 		''
     *  @example:
     * |<div dojoType="unieap.menu.Menu" menuWidth=100>或<div dojoType="unieap.menu.Menu" menuWidth='100px'>
	 * |	<div dojoType="unieap.menu.MenuItem">项目一</div>
	 * |	<div dojoType="unieap.menu.MenuItem">项目二</div>
	 * |	<div dojoType="unieap.menu.MenuItem">项目三</div>
	 * |</div>
	 */
	menuWidth: '',
	
	/**
	 * @summary:
	 * 		指定menu中menuItem的高度
	 * @type：
	 * 		{Number | String}
	 * @default:
     * 		''
     *  @example:
     * |<div dojoType="unieap.menu.Menu" menuHeight=30>或<div dojoType="unieap.menu.Menu" menuHeight='30px'>
	 * |	<div dojoType="unieap.menu.MenuItem">项目一</div>
	 * |	<div dojoType="unieap.menu.MenuItem">项目二</div>
	 * |	<div dojoType="unieap.menu.MenuItem">项目三</div>
	 * |</div>
	 */
	menuHeight: '',
	
	/**
	 * @summary:
	 * 		需要绑定菜单的节点集
	 * @type：
	 * 		{string|array}
	 * @default:
     * 		[]
     *  @example:
     * |<button id="btn1">按钮1</button>
     * |<button id="btn2">按钮2</button>
     * |//通过标签配置时,targetNodeIds为用逗号分隔的字符串
     * |<div dojoType="unieap.menu.Menu" targetNodeIds="btn1,btn2">
     * |	<div dojoType="unieap.menu.MenuItem" label="测试"></div>
     * |</div>
     * @example:
     * |//动态创建菜单,targetNodeIds为数组
     * |var menu=new unieap.menu.Menu(targetNodeIds:['btn1','btn2']);
     * |menu.addChild(new unieap.menu.MenuItem({label:'测试'}));
     * |menu.startup();
	 */
	targetNodeIds: [],
	
	/**
	 * @summary:
	 * 		设置是否屏蔽网页的右键菜单,true则屏蔽
	 * @type：
	 * 		{boolean}
	 * @default:
     * 		false
     * @example:
	 * |var menu=new unieap.menu.Menu({id:'menu',contextMenuForWindow:true});
	 */
	contextMenuForWindow: false,
	
	obj: null,
	
	postCreate: function(){
		dojo.addOnLoad(dojo.hitch(this,function(){
			if(this.contextMenuForWindow){         //屏蔽系统菜单时，将菜单绑定到整个页面中
				this.bindDomNode(dojo.body());
			}else{              //不屏蔽系统菜单时，将菜单绑定到targetNodeIds中的各个节点上
				var self = this;
				dojo.forEach(this.targetNodeIds,function(node){
					self.bindDomNode(node);
				});
			}
		}));
//      多层菜单时有问题 会让菜单提前关闭 暂时屏蔽功能		
//		dojo.connect(this.menuNode,'onmouseleave',this._onMouseLeave);
		
		this.menuWidth && dojo.style(this.menuNode,"width",this.menuWidth);
		
		//单帧下关闭页面时销毁对应的menu
		var framePageContainer = unieap.byId("framePageContainer");
		if(typeof framePageContainer  != 'undefined'){
			var currentTab = framePageContainer.getSelectedTab();
		}
		if(currentTab){
			var container4Menu = currentTab;
			if(!container4Menu.menu) container4Menu.menu = {};
			container4Menu.menu[this.id] = 1;
		}
	},
	
	_onMouseLeave: function(){
		var thisOpener = this._popupOpener;
		if(thisOpener && thisOpener.declaredClass == "unieap.menu.PopupMenuBarItem"){
			thisOpener._closePopup();
			thisOpener._toggleClass(false);
		}
	},
	
	startup: function(thisOpener){
		this.menuNode._popupOpener = thisOpener;
		dojo.forEach(this.getChildren(), function(child){ child.startup(); });
	},
	
	/**
	 * @summary:
	 * 		手动绑定菜单到指定的控件节点
	 * @param 
     * 		{string|object}  控件ID|指定要绑定的节点控件
     * @example:
     * |	var menu=unieap.byId("aMenu");
     * |	var btn=dojo.byId("btn");
     * |	menu.bindDomNode(btn);//或者menu.bindDomNode("btn");
	 */
	bindDomNode: function(/*String|domNode*/ node){
		var viewContext = this._rootID || "";
		if(dojo.body() !== node){
			if(dojo.isString(node)){
				node = dojo.byId(viewContext+node);
			} else {
				// 解决合并单元格上右健菜单不能弹出问题，此时node的id为空，详见U_EAP00022253
				node = (node.id && dojo.byId(node.id)) || node;
			}
		}
		
		node[this.id] = this._bindings.push([
			dojo.connect(node, "oncontextmenu", this, "_openMyself")
		]);
	},
	
	/**
	 * @summary:
	 * 		解除菜单节点和指定的控件节点的绑定
	 * @param 
	 * 		{string|object}  控件ID|指定要绑定的节点控件
	 * @example:
	 * |	function fn_unbind(){
	 * |		unieap.byId('menu').unBindDomNode(dojo.byId('btn1'));
	 * |		//或者unieap.byId('menu').unBindDomNode('btn1');	
	 * |	}
	 */
	unBindDomNode: function(/*string|domNode*/ nodeName){
		var viewContext = this._rootID || "";
		var node = nodeName;
		if(dojo.isString(node)){
			node = dojo.byId(viewContext+nodeName);
		} else {
			node = dojo.byId(node.id);
		}
		var bid = node[this.id]-1, b = this._bindings[bid];
		dojo.forEach(b, dojo.disconnect,this);
		delete this._bindings[bid];
	},
	
	/**
	 * @summary:
	 * 		主动弹出菜单
	 * @param
	 * 		{object} inData 
	 * @example:
	 * |	var menu=new unieap.menu.Menu({id:'menu',contextMenuForWindow:false});
	 * |	menu.addChild(new unieap.menu.MenuItem({label:'中国'}));
	 * |	menu.addChild(new unieap.menu.MenuItem({label:'美国'}));
	 * |	menu.startup();
	 * |	menu.popup({x:10,y:10});
	 * @example:
	 * |	menu.popup({around:domNode});
	 * @example:
	 * |	menu.popup();
	 */
	popup: function(inData){
		if(inData && ((inData.x&&inData.y)||inData.around)){
			dijit.popup.open(dojo.mixin(inData,{popup:this}));
		} else {
			var loc=this._getMouseLocation()
			dijit.popup.open(dojo.mixin(inData,{x:loc.x, y:loc.y, popup:this}));
		}
		this.onOpen();
		dijit.focus(this.domNode);
	},
	
	//捕获当前事件
	_getEvent: function(){
		if(dojo.isIE) 
			return window.event;
		var func=this._getEvent.caller;        
		while(func!=null){
			var arg0=func.arguments[0]; 
			if(arg0){
				if((arg0.constructor==Event 
					|| arg0.constructor ==MouseEvent) 
					|| (typeof(arg0)=="object" && arg0.preventDefault && arg0.stopPropagation)){
					return arg0; 
				}
			}
			func=func.caller; 
        } 
		return null; 
	},
	
   //得到当前鼠标位置 
	_getMouseLocation: function(){
		var e = this._getEvent();
		var mouseX = 0;
		var mouseY = 0;
	
		if(!e) 
			return {x:dojo.body().scrollLeft,y:dojo.body().scrollLeft};
		if(dojo.isIE){
			mouseX = e.clientX; 
			mouseY = e.clientY;
		}else{
			mouseX = e.pageX;
			mouseY = e.pageY;  
		}
		return {x:mouseX,y:mouseY};
	},
	
	//在绑定节点后，右键触发弹出菜单事件
	_openMyself: function(/*Event*/ e){
		dojo.stopEvent(e);                       //阻止系统右键事件触发
		var x,y;
		if(dojo.isIE){
			x=e.clientX;
			y=e.clientY;
		} else {
			x = e.pageX;
			y = e.pageY;
		}
		
		dijit.popup.open({                       //在焦点处弹出右键菜单
			popup: this,
			x: x,
			y: y,
			orient: this._orient || (this.isLeftToRight() ?
									{'TR': 'TL', 'TL': 'TR', 'BR': 'BL', 'BL': 'BR'} :
									{'TL': 'TR', 'TR': 'TL', 'BL': 'BR', 'BR': 'BL'})
		});
				
		this._removeAllToggle(this);
		
		this.focus();
		this._onBlur = function(){
			dijit.popup.close(this);
		}
	},
	
	//鼠标在popupMenuItem上划过时，不弹出子菜单
	_onBlur: function() {
		if (this.isShowingNow){
			dijit.popup.close(this);
			this.isShowingNow=false;
		}		
	},
	
	_removeAllToggle: function(menu){
		var children = menu.getChildren();
		dojo.forEach(children, function(child) {
			child._toggleClass && child._toggleClass(false);
		}, this);
	},
	
	/**
	 * @summary
	 * 		设置object
	 * @param
	 * 		{object} obj 要设置的Object
	 * @description:
	 * 		用户可以把绑定菜单的节点保存在这里，用getObject方法可以获取到
	 */
	setObject: function(obj) {
		this.obj = obj;
	},
	
	/**
	 * @summary
	 * 		获取object
	 * @description:
	 * 		和setObject结合使用
	 */
	getObject: function(){
		return this.obj;
	},
	
	onOpen: function(/*event*/ e){
		dojo.style(this._popupWrapper,"zIndex","10000");
		this.isShowingNow = true;
	},
	
	//----当item的mouseover触发时触发
	_mouseOver: function(item) {
		clearTimeout(this._timeout);
		var children = this.getChildren();
		dojo.forEach(children, function(child) {
			if (child!=item) {
				child._toggleClass && child._toggleClass(false);
				child._closePopup && child._closePopup();
			}
		}, this);
		if(item.disabled){
			item._toggleClass && item._toggleClass(false);
		}
	},
	
	//销毁对象
	destroy: function(){
		dojo.forEach(this._bindings,function(handles){
			if(handles){
				while(handles.length){
					dojo.disconnect(handles.pop());
				}
			}
		});
		var children = this.getChildren();
		dojo.forEach(children, function(child) {
			child.popup && child.popup.destroy();
			child.destroy();
		}, this);
		this.inherited(arguments);
	}
});