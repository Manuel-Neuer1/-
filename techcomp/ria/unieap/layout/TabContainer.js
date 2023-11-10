dojo.provide("unieap.layout.TabContainer");
dojo.require("unieap.layout.TabController");
dojo.require("unieap.layout.Container");
dojo.require("dijit._Templated");

dojo.declare("unieap.layout.TabContainer", [unieap.layout.Container,dijit._Templated], {
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
		onBeforeSelectTab: "function",
		onAfterCloseChild: "function"
	},
	unieap.layout.Container.prototype.UserInterfaces),	
	
    templateString: "<div class='tabContainer'>" +
						"<div dojoAttachPoint='tabNest' class=\"tabContainer-nest\">" +
    					"<div dojoAttachPoint='tablistContainer' class='tab-scrolling-container'>"+
							"<div class='tab-scrolling' dojoAttachPoint='scrollingNode'>"+
								"<div dojoAttachPoint='tablistNode'></div>"+
							"</div>"+
						"</div>" +
    					"<div dojoAttachPoint='tablistSpacer' class='tabSpacer' style='dispaly:none;'></div>" +
    					"<div class='tabPaneWrapper'  dojoAttachPoint='containerNode' style='overflow:hidden;'></div>" +
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
	
    baseClass: "tabContainer",
	
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
	height:'400px',
	
	scroll:null,
	
	tablistsize:23+1 , //tab butotn的高度 + 1px tabSpacer
	
	getScroll: function() {
		return unieap.getModuleInstance(this,"scroll","unieap.layout.TabScrollProvider");
	},
    
	postCreate: function(){
		this.inherited(arguments);
		
		var pos = this.tabPosition.charAt(0).toUpperCase() + this.tabPosition.substr(1).replace(/-.*/, "");
		this.baseClass += pos;
		dojo.addClass(this.domNode, this.baseClass); 	//tabContainerTop
		dojo.addClass(this.tablistContainer,'tab-scrolling-container'+pos);
		dojo.isIE!=6&&dojo.addClass(this.tablistSpacer,'tabSpacer'+pos);
		dojo.addClass(this.containerNode,'tabPaneWrapper'+pos);
		
        //创建TabController
        var TabController = dojo.getObject("unieap.layout.TabController");
        this.tablist = new TabController({
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
	
	layout: function() {
		this.tablistsize = dojo.style(this.tablistContainer,'height')+1;
		if(this.domNode.offsetHeight == 0) { return;}
		this._calculaBorder();
		var pos = this.tabPosition.replace(/-.*/, "");
		if(pos == 'left' || pos == 'right') {
//			this.containerNode.style.width = this.domNode.clientWidth - this.tablistsize + 'px';
			var h = this._adjustSize(this.domNode.clientHeight - 2*this.borderSize);
			this.containerNode.style.height = h;
			this.tablistContainer.style.height = h;
		} else if(pos == 'bottom') {
			dojo.place(this.tablistContainer,this.tabNest,'last');
			dojo.place(this.tablistSpacer,this.tablistContainer,'before');
			if(this.height!="auto"){
				this.containerNode.style.height = this._adjustSize(this.domNode.clientHeight - this.tablistsize);
			}
		} else { // top
			if(this.height!="auto"){
				this.containerNode.style.height = this._adjustSize(this.domNode.clientHeight - this.tablistsize - this.borderSize);
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
		//目前只接受ContentPane作为Tab页的Child
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
		if(dojo.isString(page))
			page = unieap.byId((this._rootID||"")+page);
		else
			page = unieap.byId(page);
		//隐藏的page，不能选中
		if(page.hidden == true) {
			return;
		}
		if(this.selectedChildWidget != page){
			var oldpage = this.selectedChildWidget;
			this.selectedChildWidget = page;
			this._transition(page, oldpage);
			dojo.publish(this.id+"-selectChild", [page]);
		}
		this.getScroll().isShowing&&this.getScroll().needScroll(page);
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
		dojo.attr(page.domNode,'title','');
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
		this.onAfterCloseChild(this);
	},
	
	//这个时机才能判断关闭pane以后还有多少个孩子存在
	onAfterCloseChild: function(container){
		
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
		var page = unieap.byId((this._rootID||"")+contentPaneId);
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
		var page = unieap.byId((this._rootID||"")+contentPaneId);
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
	
	setTabButtonTitle: function(page,title) {
		if(this._started){
			dojo.publish(this.id+"-setTabButtonTitle", [page,title]);
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
		var contentPane = unieap.byId((this._rootID||"")+id);
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
		var contentPane = unieap.byId((this._rootID||"")+id);
		if(contentPane._inTabContainer){
			contentPane.hidden = false;
			this.showTabButton(contentPane);
			if(select){
				this.selectChild(contentPane);
			}
		}
	},
	
	
	/**
	 * @summary:
	 * 		动态设置ContentPane在Tab页中的title
	 * @param: 
	 * 		{string} Tab所对应ContentPane Id
	 * 		{string} title
	 * @example:
	 * |<div dojoType="unieap.layout.TabContainer" id="containerId" style="width:400px;height:400px;">
	 * |	<div id="test1" dojoType="unieap.layout.ContentPane" title="测试1"></div>
	 * |	<div id="test2" dojoType="unieap.layout.ContentPane" title="测试2" hiden="true"></div>
	 * |</div>
	 * |<script>
	 * |	//修改测试二Tab页title
	 * |	function setTitle(){
	 * |		var tabContainer = unieap.byId('containerId');
	 * |		tabContainer.setTabTitle('test2',"修改");
	 * |	}
	 * |</script>
	 */
	setTabTitle: function(id,title) {
		var contentPane = unieap.byId((this._rootID||"")+id);
		if(contentPane._inTabContainer){
			contentPane.hidden = false;
			this.setTabButtonTitle(contentPane,title);
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
        if (this.tablist) {
            this.tablist.destroy();
        }
		if(this.scroll) {
			this.scroll.destory();
		}
		this._beingDestroyed = true;
        this.inherited(arguments);
    }
});

