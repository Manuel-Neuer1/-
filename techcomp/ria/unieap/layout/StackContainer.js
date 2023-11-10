dojo.provide("unieap.layout.StackContainer");
dojo.require("unieap.layout.Container");
dojo.require("dijit._Templated");
dojo.declare("unieap.layout.StackContainer",[unieap.layout.Container,dijit._Templated],{

	/**
	 * @declaredClass:
	 * 		unieap.layout.StackContainer
	 * @superClass:
	 * 		unieap.layout.Container
	 * @summary:
	 * 		类似于TabContainer,每次只显示一个Tab页，但是没有Tab标签
	 * 		StackContainer只接受ContentPane作为其子容器。
	 * @example:
	 * |<div dojoTYpe="unieap.layout.StackContainer">
	 * |	<div dojoType="unieap.layout.ContentPane">Yes</div>
	 * |	<div dojoType="unieap.layout.ContentPane">NO</div>
	 * |</div>
	 */
	
	templateString:'<div dojoAttachPoint="containerNode" class="stackcontainer"></div>',
	
	/**
	 * @summary:
	 * 		设置容器的高度
	 * @type:
	 * 		{string}
	 * @default:
	 * 		"400px"
	 * @example:
	 * |<div dojoTYpe="unieap.layout.StackContainer" style="border"1px solid #9b9b9b" height="450px">
	 * |	<div dojoType="unieap.layout.ContentPane">第一个页面</div>
	 * |	<div dojoType="unieap.layout.ContentPane">第二个页面</div>
	 * |</div>
	 */
	height:'400px',
	
	//获得临近的兄弟页面
	//forward为-1或者1,-1表示向前(左)，1表示向后(右)
	_adjacent: function(forward){
		var children = this.getChildren();
		var index = dojo.indexOf(children, this.selectedChildWidget);
		if(index==0&&forward==-1){ //如果当前页为第一页并且向前翻页
			return children[0]
		}else if(index==children.length-1&&forward==1){ //如果当前页为最后一页并且向后翻页
			return children[children.length - 1];
		}
		index += forward;
		return children[index];
	},
	
	/**
	 * @summary:
	 * 		隐藏当前显示的页面,显示下一个页面
	 * @description:
	 * 		如果达到最后一个页面,不执行任何操作
	 * @param:
	 * 		{object} params 如果下一个页面设置了href属性,控件会通过post提交params到该页面
	 * @example:
	 * |<script type="text/javascript">
	 * |	var stackContainer=unieap.byId('stackContainer');
	 * |	stackContainer.forward();
	 * |</script>
	 * @example:
	 * |<script type="text/javascript">
	 * |	var stackContainer=unieap.byId('stackContainer'),
	 * |		params={name:'psd',address:'unieap'};
	 * |	stackContainer.forward(params);
	 * |</script>
	 * |//在Action中获得name值为psd,address为neusoft
	 * |<% 
	 * |	String name=request.getParameter("name");
	 * |	String address=request.getParameter("address");
	 * |%>
	 */
	forward:function(params){
		this.selectChild(this._adjacent(1),params);
	},
	
	/**
	 * @summary:
	 * 		隐藏当前显示的页面,显示上一个页面
	 * @description:
	 * 		如果达到第一个页面,不执行任何操作
	 * @param:
	 * 		{object} params 如果上一个页面设置了href属性,控件会通过post提交params到该页面
	 * @example:
	 * |<script type="text/javascript">
	 * |	var stackContainer=unieap.byId('stackContainer');
	 * |	stackContainer.back();
	 * |</script>
	 * @example:
	 * |<script type="text/javascript">
	 * |	var stackContainer=unieap.byId('stackContainer'),
	 * |		params={name:'psd',address:'neusoft'};
	 * |	stackContainer.back(params);
	 * |</script>
	 * |//在Action中获得name值为psd,address为neusoft
	 * |<% String name=request.getParameter("name");
	 * |   String address=request.getParameter("address");
	 * |%>
	 */
	back:function(params){
		this.selectChild(this._adjacent(-1),params);
	},
	
	/**
	 * @summary:
	 * 		隐藏当前页面，显示指定的页面
	 * @param:
	 * 		{unieap.layout.ContentPane | string | number} child ContentPane对象或者id或者序号
	 * @param:
	 * 		{object} params 如果要显示的页设置了href属性,控件会通过post提交params到该页面
	 * @example:
	 * |<script type="text/javascript">
	 * |	var stackContainer=unieap.byId('stackContainer');
	 * |	stackContainer.selectChild("page2");
	 * |</script>
	 * @example:
	 * |<script type="text/javascript">
	 * |	var stackContainer=unieap.byId('stackContainer');
	 * |	stackContainer.selectChild("page2",{name:'psd'});
	 * |</script>
	 * |//在Action中获得name值为psd
	 * |<% String name=request.getParameter("name");%>
	 */
	selectChild: function(child,params){
		typeof(child)=='string'?(child=unieap.byId((this._rootID||"")+child)):
			(typeof(child)=='number'?(child=this.getChildren()[child]):(child=child));
		
		//如果child已经删除，直接返回
		if(this.getIndexOfChild(child)==-1) return;
		if(child instanceof unieap.layout.ContentPane && this.selectedChildWidget!=child){
			var oldPage = this.selectedChildWidget;
			this.selectedChildWidget=child;
			this._transition(oldPage,child,params);
		}
	},
	
	//转换页面,即隐藏旧的页面，显示新的页面
	_transition:function(oldWidget,newWidget,params){
		oldWidget&&this._hideChild(oldWidget);
		this._showChild(newWidget,params);
		//调整孩子节点的大小
		newWidget.resizeContainer();
	},
	
	//显示孩子页面
	_showChild:function(page,params){
		var children = this.getChildren();
//		page.isFirstChild = (page == children[0]);
//		page.isLastChild = (page == children[children.length-1]);
		page.selected = true;
		dojo.removeClass(page.domNode, "stackpage-hidden");
		dojo.addClass(page.domNode, "stackpage-visible");
		page._onShow(params);
	},
	
	//隐藏孩子页面
	_hideChild: function(page){
		page.selected=false;
		dojo.removeClass(page.domNode, "stackpage-visible");
		dojo.addClass(page.domNode, "stackpage-hidden");
		page.onHide&&page.onHide();
	},
	
	/**
	 * @summary:
	 * 		往StackContainer中增加一个页面
	 * @param:
	 * 		{unieap.layout.ContentPane} child 要增加的ContentPane对象
	 * @param:
	 * 		{boolean} needSelected 是否需要选中新增加的页面
	 * @example:
	 * |<script type="text/javascript">
	 * |	var stackContainer=unieap.byId('stackContainer');
	 * |	stackContainer.addChild(new unieap.layout.ContentPane({id:'newPage',href:'demo.jsp'}));
	 * |</script>
	 */
	addChild:function(child,needSelected){
		typeof(needSelected)=='undefined'&&(needSelected=true);
		if(!(child instanceof unieap.layout.ContentPane)) return
		needSelected=!!needSelected;
		//防止执行ContentPane的_onShow方法
		child._inTabContainer=true;
		this.inherited(arguments);
		var children=this.getChildren();
		if (this._started) {
			if(needSelected||children.length==1){
				this.selectChild(child);
			}else{
				dojo.addClass(child.domNode,'stackpage-hidden');
			}
		}
	},
	
	
	/**
	 * @summary:
	 * 		删除StackContainer中的一个页面
	 * @param:
	 * 		{unieap.layout.ContentPane|string|number} child ContentPane对象或者id或者序号
	 * @example:
	 * |<script type="text/javascript">
	 * |	var stackContainer=unieap.byId('stackContainer');
	 * |	stackContainer.removeChild('page1');
	 * |</script>
	 */
	removeChild:function(child){
		var children=this.getChildren();
		typeof(child)=='string'?(child=unieap.byId((this._rootID||"")+child)):
			(typeof(child)=='number'?(child=children[child]):(child=child));
			
			
		if(!(child instanceof unieap.layout.ContentPane)) return;
		this.inherited(arguments);
		
		//如果文件正在删除中……
		if(this._beingDestroyed){ return; }
		//如果被删除节点是当前选中节点，在删除后将第一个子节点选中
		
		if(this.selectedChildWidget === child){
			this.selectedChildWidget = null;
			this._started&&(children=this.getChildren())&&children[0]&&this.selectChild(children[0]);
		}
	},
	
	/**
	 * @summary:
	 * 		获得当前显示的页面对象
	 * @return:
	 * 		{unieap.layout.ContentPane|null}
	 * @example:
	 * |<script type="text/javascript">
	 * |	var stackContainer=unieap.byId('stackContainer'),
	 * |		activeChild=stackContainer.getSelectedChild();
	 * |	alert(activeChild.id); //获得当前显示的ContentPane的id
	 * |</script>
	 */
	getSelectedChild:function(){
		return this.selectedChildWidget;
	},
	
	//当前选中的孩子节点
	selectedChildWidget:null,
	
	
	postCreate:function(){
		this.initContainer();
	},
	
	//等待孩子执行结束
	startup:function(){
		if(this._started) return;
		var children=this.getChildren();
		this._started = true;
//		if(children.length==0) return;
		//显示某一个页面，隐藏其他页面
		dojo.forEach(children,function(child){
			if(child.selected&&!this.selectedChildWidget){
				this.selectedChildWidget=child;
			}else{
				dojo.removeClass(child.domNode,'stackpage-visible');
				dojo.addClass(child.domNode,'stackpage-hidden');
			}
			//在孩子页面的startup方法中不执行onShow方法
			child._inTabContainer=true;
		},this);
		
		//如果没有一个页面设置selected属性
		!this.selectedChildWidget&&children[0]&&(this.selectedChildWidget=children[0])&&(children[0].selected=true);
		
		//调用父类的startup方法
		this.inherited(arguments);
	},
	
	
	//通知本容器的子容器调整大小
	resizeContainer:function(){
		var selected = this.selectedChildWidget;
		if(selected && !this._hasBeenShown){
			this._hasBeenShown = true;
			this._showChild(selected);
		}
		this.inherited(arguments);
	},
	
	//如果用户调用本控件的notifyResize,将执行该方法
	notifyParentResize:function(){
		
	}
	
});

