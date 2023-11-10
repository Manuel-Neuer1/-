dojo.provide("unieapx.layout.NavigatorContainer");
dojo.require("unieap.layout.TabController");
dojo.require("unieap.layout.Container");
dojo.require("dijit._Templated");

dojo.declare("unieapx.layout.NavigatorContainer", [unieap.layout.Container,dijit._Templated], {
    /**
     * @declaredClass:
     * 		unieap.layout.TabContainer
     * @superClass:
     * 		unieap.layout.Container
     * @summary:
     * 		Tab容器
     * @classDescription：
     * 		Tab容器，以ContentPane作为其子容器。
     * 		可以指定Tab的显示位置。
     * @example:
     * |<div dojoType="unieap.layout.TabContainer"   tabPosition="left-h">
     * |	<div dojoType="unieap.layout.ContentPane" title="Tab1">
     * |		Hello Tab1!
     * |	</div>
     * |	<div dojoType="unieap.layout.ContentPane" title="Tab2">
     * |		Hello Tab2!
     * |	</div>
     * |</div>
     *
     */
	
	//配置属性接口
	UserInterfaces : dojo.mixin({
		tabPosition : "string",
		baseClass : "string",
		autoSwitchTab: "boolean",
		onBeforeSelectTab: "function"
	},
	unieap.layout.Container.prototype.UserInterfaces),	
	
    templateString: "<div class='tabContainer'>" +
						"<div dojoAttachPoint='tabNest' class=\"tabContainer-nest\">" +
    					"<div dojoAttachPoint='tablistContainer' class='navigator-scrolling-container'>"+
							"<div class='tab-scrolling' dojoAttachPoint='scrollingNode'>"+
								"<div dojoAttachPoint='tablistNode'>" +
									"<div dojoAttachPoint='refreshNode' class='refreshDiv'></div>"+
									"<div dojoAttachPoint='backNode' class='disableBackDiv'></div>"+
									"<div dojoAttachPoint='nextNode' class='disableNextDiv'></div>"+
								"</div>"+
							"</div>"+
						"</div>" +
    					"<div dojoAttachPoint='tablistSpacer' class='tabSpacer' style='dispaly:none;'></div>" +
    					"<div class='tabPaneWrapper navigatorWrapper'  dojoAttachPoint='containerNode' style='overflow:hidden;'></div>" +
						"</div>" +
    				"</div>",
	
	/**
	 * @summary:
	 * 		Tab标签的位置
	 * @description:
	 * 		控制Tab标签的位置,默认为上
	 * @default：
	 * 		"top"
	 * @type:
	 * 		{string}
	 * @enum:
	 * 		{"top"|"bottom"|"left-h"|"right-h"}		
	 */
    tabPosition: "top",
    
    /**
	 * @summary:
	 * 		自动切换到鼠标移动到的tab页
	 * @description:
	 * 		控制Tab页是否鼠标移动其上，能够自动切换到相应的页
	 * @default：
	 * 		false
	 * @type:
	 * 		{boolean}
	 */
    autoSwitchTab : false,
	
    baseClass: "navigatorContainer",
	
	//_Widget里的startup()方法维护了此属性
//	_started: false,
	
	/**
	 * @summary:
	 * 		Tab的默认高度
	 * @default：
	 * 		"400px"
	 * @type:
	 * 		{string}		
	 */
	height:'auto',
	
	scroll:null,
	
	navigatorList: null,
	
	closedNavigatorList: null,
	
	currentTitle: "",
	
	_canRefresh: true,
	
	showNavigator: (typeof(unieap.widget.navigator.showNavigator) == 'undefined')?true:unieap.widget.navigator.showNavigator,
	
	alwaysShowNavigator: (typeof(unieap.widget.navigator.alwaysShowNavigator) == 'undefined')?true:unieap.widget.navigator.alwaysShowNavigator,
   
	onCompletePrePage : false,
	
	setOnCompletePrePage : function(onCompletePrePage){
		this.onCompletePrePage = onCompletePrePage;
	},
	getOnCompletePrePage : function(){
		return this.onCompletePrePage;
	},
	
	tablistsize:23+1 , //tab butotn的高度 + 1px tabSpacer
	
	getScroll: function() {
		return unieap.getModuleInstance(this,"scroll","unieap.layout.TabScrollProvider");
	},
    
	postCreate: function(){
		this.inherited(arguments);
		this.navigatorList = [];
		this.navigatorSubscribe = [];
		this.closedNavigatorList = [];
		var pos = this.tabPosition.charAt(0).toUpperCase() + this.tabPosition.substr(1).replace(/-.*/, "");
		this.baseClass += pos;
		dojo.addClass(this.domNode, this.baseClass); 	//tabContainerTop
		dojo.addClass(this.tablistContainer,'navigator-scrolling-container'+pos);
		dojo.isIE!=6&&dojo.addClass(this.tablistSpacer,'tabSpacer'+pos);
		dojo.addClass(this.containerNode,'tabPaneWrapper'+pos);
		
        //创建TabController
        dojo.require("unieapx.layout.NavigatorController");
        var NavigatorController = dojo.getObject("unieapx.layout.NavigatorController");
        this.tablist = new NavigatorController({
            id: this.id + "_tablist",
            tabPosition: this.tabPosition,
            container: this,
            autoSwitchTab : this.autoSwitchTab,
			style:"height:'100%'",
            "class": this.baseClass + "-tabs" ,//tabContainerTop-tabs
            onBeforeSelectTab: this.onBeforeSelectTab
        }, this.tablistNode);
        /*
         * 解决第一次展现页面时多个tab页面的信息瞬间显示在同一个页面的问题
         * U_EAP00019316
         */
        dojo.forEach(this.containerNode.children,function(child){
        	dojo.style(child,"display","none");
        },this);
        
        this.connects = [];
        this.connects.push(dojo.connect(this.backNode,'onclick',this,'prePage'));
        this.connects.push(dojo.connect(this.refreshNode,'onclick',this,'refresh'));
		if(!this.showNavigator){
			dojo.style(this.tablistContainer, "display", "none");
		}
		else if(!this.alwaysShowNavigator){
			dojo.style(this.tablistContainer, "display", (this.navigatorList.length <= 1)?"none":"block");
		}
		
    },
    
	/**
	 * @summary:
	 * 		点击Tab页前触发的事件
	 * @param:
	 * 		{object} contentPane Tab页,目前只接收unieap.layout.ContentPane对象
	 * @return
	 * 		Boolean 返回false则不加载点击的Tab页
	 * @example:
	 * |<div dojoType="unieap.layout.TabContainer" id="tabcontainer" style="height:200px;" onBeforeSelectTab="fn">
	 * |function fn(contentPane){
	 * |	unieap.debug(contentPane);
	 * |    return false;
	 * |}
	 */
	onBeforeSelectTab: function(contentPane){
	},
	
	_setupChild: function(/* Widget */child){
        dojo.addClass(child.domNode, "tabPane");
		dojo.style(child.domNode, "overflow","auto");
		dojo.style(child.domNode, "position","relative");
		
		//去掉鼠标悬停时的title显示
		child.domNode.title = "";
		//add 修改孩子widget的_inTabContainer属性
		if("_inTabContainer" in child) {
			child._inTabContainer=true;
			child.tabContainer = this;
		} 
    },
    
   startup: function(){
		if(!this._started) {
			//目前此方法是空实现（wire up the tablist and its tabs ）
	        this.tablist.startup();	
			
			var children = this.getChildren();
			// 每个孩子page的初始化
			dojo.forEach(children, this._setupChild, this);
			dojo.some(children, function(child){
				if(child.selected){
					this.selectedChildWidget = child;
				}
				return child.selected;
			}, this);
			
			var selected = this.selectedChildWidget;
			if(!selected && children[0]){
				selected = this.selectedChildWidget = children[0];
				selected.selected = true;
			}
	
			//发布startup()事件
			dojo.publish(this.id+"-startup", [{children: children, selected: selected}]);
			
			this.layout();
			//执行选中某节点时会进行resizeContainer
			if(selected) {
				this._showChild(selected);
			}
			this._started = true;
			for(var i=0; i<children.length; i++){
				if(children[i].hidden){
					this.hideTabButton(children[i]);
				}
				/*
				 * @author
				 * 		zhengh
				 * @sumarry
				 * 		初始化Tab容器时，将enabled属性为false的Tab页设置为不可编辑
				 */
				if(!children[i].enabled){
					this._disableTabButton(children[i]);
				}
			}
		}
		this.inherited(arguments);
    },
	
	resizeContainer: function() {
		if(null == this.domNode) return;
		this.resize();
		this.resizeChildrenContainer();
	},
	
	notifyParentResize: function() {
	},
	
	resize: function() {
		this.layout();
	},
	
	_interestShowNavigator: function(){
		if(!this.alwaysShowNavigator && this.showNavigator){
			var displayCss = dojo.style(this.tablistContainer, "display");
			dojo.style(this.tablistContainer, "display", this.navigatorList.length <= 1?"none":"block");
			if(displayCss != dojo.style(this.tablistContainer, "display")){
				this.layout();
			}
		}
	},
	layout: function() {
		if(this.domNode.offsetHeight == 0) { return;}
		this._calculaBorder();
		var pos = this.tabPosition.replace(/-.*/, "");
		var tablistsize = this.tablistsize;
		if(this.navigatorList.length <= 1 && !this.alwaysShowNavigator){
			tablistsize = 0;
		}
		if(pos == 'left' || pos == 'right') {
//			this.containerNode.style.width = this.domNode.clientWidth - this.tablistsize + 'px';
			var h = this._adjustSize(this.domNode.clientHeight - 2*this.borderSize);
			this.containerNode.style.height = h;
			this.tablistContainer.style.height = h;
		} else if(pos == 'bottom') {
			dojo.place(this.tablistContainer,this.tabNest,'last');
			dojo.place(this.tablistSpacer,this.tablistContainer,'before');
			if(this.height!="auto"){
				this.containerNode.style.height = this._adjustSize(this.domNode.clientHeight - tablistsize);
			}
		} else { // top
			if(this.height!="auto"){
				this.containerNode.style.height = this._adjustSize(this.domNode.clientHeight - tablistsize - this.borderSize);
			}
		}
		
		//如果contentPane没设置高度，则高度为100%
		if(this.height!="auto"&&this.selectedChildWidget && this.selectedChildWidget instanceof unieap.layout.Container) {
			this.selectedChildWidget.setHeight('100%');
		} 
		
		this.getScroll().calculateScroll();
	},
	
	
	// 校正计算值
	_adjustSize: function(size) {
		if(size < 0) {
			return '0px';
		} else {
			return size + 'px';
		}
	},
	
	_calculaBorder: function() {
		//CSS1Compat  引DOCTYPE
		//BackCompat  未引DOCTYPE
		if(dojo.isIE && dojo.doc.compatMode == "BackCompat") {//IE下，在不引DOCTYPE的情况下，border不占宽度
			this.borderSize = 0;
		} else {
			this.borderSize = 1;
		}
	},
	
	/**
	 * @summary:
	 * 		增加一个Tab页
	 * @param:
	 * 		{object} page Tab页,目前只接收unieap.layout.ContentPane对象
	 * @param:
	 * 		{object} insertIndex 插入的位置
	 * @param:
	 * 		{boolean} needselected 是否增加一个Tab页后就选择该Tab页，默认选中
	 * @example:
	 * |unieap.byId('createTab').addChild(new unieap.layout.ContentPane({
	 * |	title: "新增的Tab页"
	 * |}));
	 */
	addChild:function(page,insertIndex,needSelected){
		this.navigatorList.push(page);
		this.test = "abc"+page.id;
		
		if (!page instanceof unieap.layout.ContentPane) {
			return;
		}
		typeof(needSelected)=='undefined'&&(needSelected=true);
		needSelected=!!needSelected
		page._inTabContainer=true;
		if(this.getIndexOfChild(page)!=-1){
			this.selectChild(page)
		}else{
			this.inherited(arguments);
			if(this._started){
				dojo.publish(this.id+"-addChild", [page, insertIndex]);
				this.layout();
				//选中新增page
				if(needSelected){
					this.selectChild(page);
				}else{
					dojo.removeClass(page.domNode, "unieapVisible");
					dojo.addClass(page.domNode, "unieapHidden");
				}
			}
		}
		this._interestShowNavigator();
	},
	/**
	 * @summary:
	 * 		删除一个Tab页
	 * @param:
	 * 		{object} page Tab页,目前只接收unieap.layout.ContentPane对象
	 * @example:
	 * |var pane = unieap.byId('aContentPane');
	 * |unieap.byId('aTabContainer').removeChild(pane);
	 */
	removeChild: function(/*Widget*/ page){
		// Overrides Container.removeChild() to do layout and publish events
		this.inherited(arguments);
		
		// If we are being destroyed than don't run the code below (to select another page), because we are deleting
		// every page one by one
		if(this._beingDestroyed){ return; }

		if(this._started){
			// this will notify any tablists to remove a button; do this first because it may affect sizing
			dojo.publish(this.id+"-removeChild", [page]);

			this.getScroll().calculateScroll();
		}
		//如果被删除节点是当前选中节点，在删除后将TabContainer第一个子节点选中
		if(this.selectedChildWidget === page){
			this.selectedChildWidget = undefined;
			if(this._started){
				var children = this.getChildrenNotHidden();
				if(children.length){
					this.selectChild(children[0]);
				}
			}
		}
	},
	
	/**
	 * @summary:
	 * 		选择某个Tab页
	 * @description
	 * 		注意参数不是index,而是contentPane对象
	 * @param: 
	 * 		{object} page contentPane对象
	 * @example:
	 * |var contentPane = unieap.byId("contentpane1");
	 * |unieap.byId("tabContainer").selectChild(contentPane);
	 */
	selectChild:function(page){
		//可以接受id或JS对象
		var page = unieap.byId(page);
		//隐藏的page，不能选中
		if(page.hidden == true) {
			return;
		}
		if(this.selectedChildWidget != page){
			var oldpage = this.selectedChildWidget;
			this.selectedChildWidget = page;
			this._transition(page, oldpage);
			this._doSelect(page);
			this._changeBackClass();
			//dojo.publish(this.id+"-selectNavigator", [page]);
		}
//		this.getSroll().isShowing&&this.getScroll().needScroll(page);
	},
	
	_doSelect: function(page){
		var navigatorPane = this.navigatorList.pop();
		while(page != navigatorPane && this.navigatorList.length>0){
			page.getParentContainer().removeChild(navigatorPane);
			this.closedNavigatorList.push(navigatorPane);//保留已经打开的页面；
			navigatorPane = this.navigatorList.pop()
		}
		this.navigatorList.push(navigatorPane);
		if(navigatorPane._navigatorPaneSubscribe && navigatorPane._navigatorPaneSubscribe[page.parentContainer.title]){
			   if(!this.getOnCompletePrePage() && navigatorPane._navigatorPaneSubscribe[page.parentContainer.title].onCompleteByClick){
					navigatorPane._onComplete = navigatorPane._navigatorPaneSubscribe[page.parentContainer.title].method;
					navigatorPane._onComplete(null);					
			   }				  
		}				
		page.parentContainer.title=this.getSelectedTab().title;
		this._interestShowNavigator();
	},
	
	/**
	 * @summary:
	 * 		打开已经打开过的NavigatorPane
	 * @param: 
	 * 		{string} href NavigatorPane的href
	 */
	openPane: function(href, dc, title){
		if(0 == this.closedNavigatorList.length) return false;
		var closedPane = this.closedNavigatorList.pop();
		var tempClosedPaneList = [];
		//遍历查找关闭的navigatorPane是否存在将要打开的pane
		while(href != closedPane.href && this.closedNavigatorList.length>0){
			tempClosedPaneList.push(closedPane);
			closedPane = this.closedNavigatorList.pop();
		}
		
		for(var i = 0, l = tempClosedPaneList.length; i < l; ++i){
			this.closedNavigatorList.push(tempClosedPaneList.pop());
		}
		
		if(href == closedPane.href){
			closedPane.data = dc;
			if(dc && dc.declaredClass === "unieap.ds.DataCenter"){
				closedPane.origparameters = {};
				for(var a in closedPane.parameters){
					closedPane.origparameters[a] = dc.parameters[a];
				}
			}
			closedPane.title = title;
			this.addChild(closedPane);
			closedPane.controlButton.setTitle(title);
			return true;
		}else{
			this.closedNavigatorList.push(closedPane);
		}
		return false;
	},
	
	_changeBackClass: function(){
		if(this.navigatorList.length > 1){
			!dojo.hasClass(this.backNode,"backDiv") && dojo.addClass(this.backNode,"backDiv");
			dojo.removeClass(this.backNode,"disableBackDiv");
		}else{
			!dojo.hasClass(this.backNode,"disableBackDiv") && dojo.addClass(this.backNode,"disableBackDiv");
			dojo.removeClass(this.backNode,"backDiv");
		}
		this._interestShowNavigator();
	},
	
	prePage: function(dc){
		if(1 == this.navigatorList.length) return;
		var navigatorPane = this.navigatorList.pop(),
			selectedNavigatPane = this.navigatorList.pop();
		this.navigatorList.push(selectedNavigatPane);
		this.navigatorList.push(navigatorPane);
		selectedNavigatPane.data = dc;
	    this.setOnCompletePrePage(true);
		this.selectChild(selectedNavigatPane);
		this._interestShowNavigator();
		//当点击回退按钮时，没有返回数据，不比调用回调函数。
		(dc && (!dc.target || (dc.target.className !== "backDiv"))) && selectedNavigatPane._onComplete(dc);
		this.setOnCompletePrePage(false);
	},
	
	onCompleteClick : function(title){	
		var navigatorPane = this.navigatorList.pop(),
			selectedNavigatPane = this.navigatorList.pop();
		this.navigatorList.push(selectedNavigatPane);
		this.navigatorList.push(navigatorPane);
		if(selectedNavigatPane._navigatorPaneSubscribe){
			selectedNavigatPane._onComplete = selectedNavigatPane._navigatorPaneSubscribe[title].method;
		}					
	},
	/**
	 * @summary:
	 * 		刷新当前导航页
	 * @example:
	 */
	refresh: function(){
		//快速连续刷新由于页面没有渲染完可能会导致错误
		if(!this._canRefresh) return;
		var self = this;
		this._canRefresh = false;
		setTimeout(function(){
			self._canRefresh = true;
		},1000);
		var currentTab = this.getSelectedTab(),
		parentContainer = currentTab.getParentContainer();
		//当用iframe方式加载的时候currentTab.getParentContainer()为undefined，因为是iframe方式也就不用做销毁处理了。
		if(parentContainer){
		if(parentContainer.getParentContainer && parentContainer.getParentContainer()){
				unieap.destroyWidgets(currentTab.domNode);
			}else{
				unieap.destroyWidgets(document.body);
			}
		}
		if(currentTab.href){
			//刷新之前首先解除之前页面的发布订阅，否则影响后续逻辑执行以及内存泄露
//			if(parentContainer){
//				var topics = unieap.getTopWin().dojo._topics[parentContainer.id + currentTab.title];
//				if(typeof topics != 'undefined')  topics._listeners = [];
//			}
			dojo.forEach(currentTab.navigatorSubscribe, unieap.getTopWin().dojo.unsubscribe);
			unieap.loader.load( {
				 node : currentTab.domNode,
				 showXhrLoading : true,
				 url : currentTab.href
			 });
		}
		//恢复数据
		var data = currentTab.data;
		//用户在刷新以后给页面传递的数据，数据是非DataCenter或者DataStore类型的object
		if(this.onAfterRefresh()){
			data = this.onAfterRefresh();
		}else if(data && data.declaredClass === "unieap.ds.DataCenter"){ //原始传入的是dataCenter
			var stores = data.getDataStores();
			for(store in stores){
				var rowSet = stores[store].getRowSet();
				rowSet && rowSet.discardUpdate();
			}
		}else if(data && data.declaredClass === "unieap.ds.DataStore"){  //原始传入的是dataStroe
			var rowSet = data.getRowSet();
			rowSet && rowSet.discardUpdate();
		}else{
			data = currentTab.origValue;       //原始传入的是普通的数据，如number或者string类型的简单类型数据
		}
		for(var a in currentTab.origparameters){
			data.parameters[a] = currentTab.origparameters[a];
		}
		unieap.destroyDialogAndMenu(currentTab);
		unieap.destroyDialogAndMenu(this.getParentContainer());
	},
	
	//刷新以后给页面传递的数据
	onAfterRefresh: function(){
		return null;
	},
	/**
	 * @summary:
	 * 		得到当前选中的Tab页
	 * @return:
	 * 		{Object} 当前选中的Tab页，如果没有tab页，则返回null
	 * @example:
	 * |var contentPane = unieap.byId("contentpane1");
	 * |unieap.byId("tabContainer").selectChild(contentPane);
	 * |var selectPane = unieap.byId("tabContainer").getSelectedTab();
	 */
	getSelectedTab:function(){
		return this.selectedChildWidget||null;
	},
	
	_transition: function(/*Widget*/newWidget, /*Widget*/oldWidget){
		if(oldWidget){
			this._hideChild(oldWidget);
		}
		this._showChild(newWidget);
	},
	
	_showChild : function(page){
		var children = this.getChildren();
		page.selected = true;

		dojo.removeClass(page.domNode, "unieapHidden");
		dojo.addClass(page.domNode, "unieapVisible");
		
		//在显示后计算
		this.resizeContainer();
		
		if(page._onShow){
			page._onShow(); // trigger load in ContentPane
		}else if(page.onShow){
			page.onShow();
		}
	},
    
	_hideChild: function(/*Widget*/ page){
		page.selected = false;
		dojo.removeClass(page.domNode, "unieapVisible");
		dojo.addClass(page.domNode, "unieapHidden");

		if(page.onHide){
			page.onHide();
		}
	},
	
	closeChild: function(/*Widget*/ page){
		var remove = page.onClose(this, page);
		if(remove){
			this.removeChild(page);
			// makes sure we can clean up executeScripts in ContentPane onUnLoad
			page.destroyRecursive();
		}
	},
	
	//隐藏
	hideTabButton: function(page) {
		if(this._started){
			dojo.publish(this.id+"-hideTabButton", [page]);
			
			this.getScroll().calculateScroll();
			
			//如果被删除节点是当前选中节点，在删除后将TabContainer第一个子节点选中
			if(this.selectedChildWidget === page){
				var children = this.getChildrenNotHidden();
				if(children.length){
					this.selectChild(children[0]);
				}
			}
		}
	},
	
	//设置Tab页不可编辑
	_disableTabButton: function(page){
		if(this._started){
			dojo.publish(this.id+"-disableTabButton",[page]);
			this.getScroll().calculateScroll();
			//如果被设置不可编辑的节点是当前选中节点，在删除后将TabContainer第一个子节点选中
			if(this.selectedChildWidget === page){
				var children = this.getChildrenEnabled();
				if(children.length){
					this.selectChild(children[0]);
				}
			}
		}
	},
	
	/**
	 * @summary:
	 * 		设置某个Tab页可编辑
	 * @param: 
	 * 		{string} contentPane ID
	 * @example:
	 * |unieap.byId("tabContainer").enableTabButton(contentpane1);
	 */
	enableTabButton: function(contentPaneId){
		var page = unieap.byId(contentPaneId);
		if(this._started){
			dojo.publish(this.id+"-enableTabButton",[page]);
			this.getScroll().calculateScroll();
		}
	},
	/**
	 * @summary:
	 * 		设置某个Tab按钮编辑状态
	 * @param: 
	 * 		{string} contentPane ID
	 * @param: 
	 * 		{boolean} 是否可编辑
	 * @example:
	 * |unieap.byId("tabContainer").setTabButtonState(contentpane1,false);
	 */
	setTabButtonState:function(contentPaneId,state){
		var page = unieap.byId(contentPaneId);
		if(this._started){
			dojo.publish(this.id+"-setTabButtonState",[page,state]);
			this.getScroll().calculateScroll();
		}
	},
	
	showTabButton: function(page) {
		if(this._started){
			dojo.publish(this.id+"-showTabButton", [page]);
			this.getScroll().calculateScroll();
		}
	},
	
	/**
	 * @summary:
	 * 		动态设置ContentPane在Tab页中的隐藏
	 * @description：
	 * 		如果该Tab正在被选中，隐藏后会自动选中TabContainer中第一个Tab页
	 * @example:
	 * |<div dojoType="unieap.layout.TabContainer" id="containerId" style="width:400px;height:400px;">
	 * |	<div id="test1" dojoType="unieap.layout.ContentPane" title="测试一"></div>
	 * |	<div id="test2" dojoType="unieap.layout.ContentPane" title="测试二"></div>
	 * |</div>
	 * |<script>
	 * |	//设置Tab页隐藏
	 * |	function hideTab(){
	 * |		var tabContainer = unieap.byId('containerId');
	 * |		tabContainer.hideTab('test2');
	 * |	}
	 * |</script>
	 */
	hideTab: function(id){
		var contentPane = unieap.byId(id);
		if(contentPane && contentPane._inTabContainer){
			contentPane.hidden = true;
			this.hideTabButton(contentPane);
		}
	},
	/**
	 * @summary:
	 * 		动态设置ContentPane在Tab页中的显示
	 * @param: 
	 * 		{string} Tab容器内的ContentPane Id
	 * 		{boolean} 显示后是否默认选中，默认为false，不选中
	 * @example:
	 * |<div dojoType="unieap.layout.TabContainer" id="containerId" style="width:400px;height:400px;">
	 * |	<div id="test1" dojoType="unieap.layout.ContentPane" title="测试一"></div>
	 * |	<div id="test2" dojoType="unieap.layout.ContentPane" title="测试二" hiden="true"></div>
	 * |</div>
	 * |<script>
	 * |	//显示测试二Tab页并选中
	 * |	function showTab(){
	 * |		var tabContainer = unieap.byId('containerId');
	 * |		tabContainer.showTab('test2',true);
	 * |	}
	 * |</script>
	 */
	showTab: function(id,select) {
		var contentPane = unieap.byId(id);
		if(contentPane._inTabContainer){
			contentPane.hidden = false;
			this.showTabButton(contentPane);
			if(select){
				this.selectChild(contentPane);
			}
		}
	},
	
	getChildrenNotHidden: function() {
		var allChildren = this.getChildren();
		var children = [];
		for(var i=0; i<allChildren.length; i++){
			if(allChildren[i].hidden == false) {
				children.push(allChildren[i]);
			}
		}
		return children;
	},
	
	getChildrenEnabled: function(){
		var allChildren = this.getChildren();
		var children = [];
		for(var i = 0; i < allChildren.length; i++){
			if(allChildren[i].enabled){
				children.push(allChildren[i]);
			}
		}
		return children;
	},
	
	_adjacent: function(/*Boolean*/ forward){
		// summary:
		//		Gets the next/previous child widget in this container from the current selection.
		var children = this.getChildren();
		var index = dojo.indexOf(children, this.selectedChildWidget);
		index += forward ? 1 : children.length - 1;
		return children[ index % children.length ]; // dunieap_Widget
	},

	forward: function(){
		// summary:
		//		Advance to next page.
		this.selectChild(this._adjacent(true));
	},

	back: function(){
		// summary:
		//		Go back to previous page.
		this.selectChild(this._adjacent(false));
	},
	
	_getTabWidth : function() {
		var width = 0;
		dojo.forEach(this.tablist.getChildren(), function(p) {
			width += p.getWidth();
		}, this);
		return width;
	},
	
	
	_getTabHeight : function(){
		var height = 0;
		dojo.forEach(this.tablist.getChildren(), function(p) {
			height += p.getHeight();
		}, this);
		return height;				
	},
	
	
    destroy: function(){
		dojo.forEach(this.navigatorSubscribe, unieap.getTopWin().dojo.unsubscribe);
		this.navigatorSubscribe = null;
    	for(var i = 0, l = this.closedNavigatorList.length; i < l; ++i){
			var pane = this.closedNavigatorList.pop();
			pane.destroy();
		}
		
		
        if (this.tablist) {
            this.tablist.destroy();
        }
		if(this.scroll) {
			this.scroll.destory();
		}
		this._beingDestroyed = true;
        this.inherited(arguments);
        while(this.connects.length){
			dojo.disconnect(this.connects.pop());
		}
    }
});

