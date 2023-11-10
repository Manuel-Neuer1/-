dojo.provide("unieap.xgrid.Grid");
dojo.require("dijit._Templated");
dojo.require("unieap.xgrid.core.lib");
dojo.require("unieap.layout.Container");
if(dojo.isIE){
	//创建未知元素节点，以供dojo.query能够查询到以下声明的dom结点
	dojo.forEach(["header","fixed","row","cell","toolbar"],function(element){
		document.createElement(element);
	});
}
dojo.declare('unieap.xgrid.Grid', [unieap.layout.Container, dijit._Templated], {
	
	/**
	 * @declaredClass:
	 * 		unieap.xgrid.Grid
     * @superClass:
     * 		unieap.layout.Container
	 * @summary:
	 * 		数据表格
	 * @example:
	 * |<div dojoType="unieap.xgrid.Grid" width="500px" height="300px"
	 * |	 binding="{store:'empDataStore'}"
	 * |	 views="{rowNumber:true,orderType:'none'}">
	 * |	 <fixed>
	 * |		<cell label="员工编号" width="150" name="attr_empno"></cell>
	 * |	 </fixed>
	 * |	 <header>
	 * |		<cell width="100px" label="姓名" name="NAME"></cell>
	 * |		<cell width="150px" label="职位" name="attr_job"></cell>
	 * |		<cell width="150px" label="工资" name="attr_sal" headerStyles="text-align: left;"></cell>
	 * |	</header>
	 * |</div>
	 * @img:
	 * 		images/grid/grid_overview.png
	 */
	 
	//配置属性接口
	UserInterfaces: dojo.mixin({
		height: "string",
		trigger: "boolean",
		layout: "object",
		views: "object",
		rows: "object",
		selection: "object",
		filter: "object",
		menu: "object",
		individual: "object",
		edit: "object",
		binding: "object",
		lockedRow: "object",
		showLoading:"boolean"
	},
	unieap.layout.Container.prototype.UserInterfaces),
	
	/**
	 * @summary:
	 * 		布局控制器
	 * @type:
	 * 		{object}
	 * @see:
	 * 		unieap.xgrid.manager.LayoutManager
	 */
	layout: null,
	
	/**
	 * @summary:
	 * 		表格高度
	 * @type:
	 * 		{string|number}
	 * @default:
	 * 		'250px'
	 */
	height: '250px',
	
	/**
	 * @summary:
	 * 		表格绑定
	 * @type:
	 * 		{object}
	 * @see:
	 * 		unieap.xgrid.manager.BindingManager
	 * @example:
	 * |<div dojoType="unieap.xgrid.Grid" binding="{store:'empDataStore'}">
	 * |	 ...
	 * |</div>
	 */
	binding: null,
	
	//滚动条的宽度
	scrollerOffset: 16,
	
	/**
	 * @summary:
	 * 		是否监听数据变更
	 * @type:
	 * 		{boolean}
	 * @default:
	 * 		true
	 * @description:
	 * 		是否根据表格绑定的数据的变化，自动刷新表格的显示。
	 * @example:
	 *|<div dojoType="unieap.xgrid.Grid" id="grid" width="80%" height="250px" 
	 *|     binding="{store:'empDataStore'}" views="{rowNumber:true}" trigger="false">
     *| 	...... 
	 *|</div>
	 */
	trigger: true,
	
	//自动注入dataCenter
	Autowired : "dataCenter",
	
	/**
	 * @summary:
	 * 		视图控制器
	 * @type:
	 * 		{object}
	 * @see:
	 * 		unieap.xgrid.manager.ViewManager
	 * @example:
	 * |<div dojoType="unieap.xgrid.Grid" binding="{store:'empDataStore'}" views="{rowNumber:true}">
	 * |	...
	 * |</div>
	 */
	views: null,
	
	/**
	 * @summary:
	 * 		编辑控制器
	 * @type:
	 * 		{object}
	 * @see:
	 * 		unieap.xgrid.manager.EditManager
	 * @example:
	 * |<div dojoType="unieap.xgrid.Grid" binding="{store:'empDataStore'}" edit="{onBeforeEdit:fn}">
	 * |	 ...
	 * |</div>
	 */
	edit: null,
	
	/**
	 * @summary:
	 * 		选择控制器
	 * @type:
	 * 		{object}
	 * @see:
	 * 		unieap.xgrid.manager.SelectionManager
	 * @example:
	 * |<div dojoType="unieap.xgrid.Grid" binding="{store:'empDataStore'}" 
	 * |	 selection="{selectType:'single',onBeforeSelect:'myFunction'}">
	 * |	 ...
	 * |</div>
	 */
	selection: null,
	
	/**
	 * @summary:
	 * 		过滤相关信息
	 * @description：
	 * 		是否启用列过滤功能
	 * @type：
	 * 		{object}
	 * @see:
	 * 		unieap.xgrid.manager.FilterManager
	 * @example:
	 * |<div dojoType="unieap.xgrid.Grid" binding="{store:'empDataStore'}" filter="{}"></div>
	 * @example:
	 * |//只在列绑定名为attr_name的列才可以进行数据过滤
	 * |<div dojoType="unieap.xgrid.Grid" filter="{include:['attr_name']}"></div>
	 * @example:
	 * |//除列绑定名为attr_name的列不可过滤外,其他列都可以过滤
	 * |<div dojoType="unieap.xgrid.Grid" filter="{exclude:['attr_name']}"></div>
	 */
	filter: null,
	
	/**
	 * @summary:
	 * 		菜单控制器
	 * @description
	 * 		鼠标移过表头出现menu按钮
	 * @type:
	 * 		{object}
	 * @see：
	 * 		unieap.xgrid.manager.MenuManager
	 * @example:
	 * |<div dojoType="unieap.xgrid.Grid" menu="{onBeforeMenuClick:fn}}"
	 * |	 width="100%" height="350px">
	 * |</div>
	 * |function fn(cell){
	 * |	console.info(cell.label);
	 * |	return true; //一定要有返回true,否则菜单项不会弹出来
	 * |}
	 */
	menu: null,
	/**
	 * @summary:
	 * 		个性化设置，可以控制ToolBar是否显示，
	 * 		当没有ToolBar时，配置这个属性，也可以使用个性化的所有功能
	 * 		要使个性化设置的锁定解锁列、显示隐藏列可用，必须在Grid上配置menu属性
	 * @type:
	 * 		{object}
	 * @see:
	 * 		unieap.xgrid.manager.Individual
	 * @example:
	 * |<div dojoType="unieap.xgrid.Grid" binding="{store:'empDataStore'}" 
	 * |	 individual="{isShowToolbar: false}">
	 * |	 ...
	 * |	<toolbar individual="true"></toolbar>
	 * |</div>
	 * |
	 */
	individual: null,
	
	/**
	 * @summary:
	 * 		行控制器
	 * @type:
	 * 		{object}
	 * @see:
	 * 		unieap.xgrid.manager.RowManager
	 * @example:
	 * |<div dojoType="unieap.xgrid.Grid" binding="{store:'empDataStore'}" rows="{defaultRowHeight:23}">
	 * |	...
	 * |</div>
	 */
	rows: null,
	
	/**
	 * @summary:
	 * 		锁定行相关信息
	 * @description
	 * 		配置锁定行的统计信息。
	 * 		配置锁定行的自定义信息。
	 * @type：
	 * 		{object}
	 * @example：
	 * |<div id="grid" id="grid" dojoType="unieap.xgrid.Grid" 
	 * |	 lockedRow="{getLockedRow:getLockedFun,statistics:[{attr_sal:'max'},{attr_sal:'min'}]}">
	 * |</div>
	 * |function getLockedFun(){
	 * |	return [{
	 * |              NAME: '用户1',
	 * |              attr_empno: 251,
	 * |              attr_job: '职位1',
	 * |              attr_sal: '25555'
	 * |          },{
	 * |              NAME: '用户2',
	 * |              attr_empno: 252,
	 * |              attr_job: '职位2',
	 * |              attr_sal: '25555'
	 * |          }];
	 * |}
	 * @img:
	 * 		images/grid/lockrow.png
	 */
	lockedRow: null,
	/**
	 * @summary:
	 * 		是否增加提示信息“正在加载数据...”
	 * @type:
	 * 		{boolean}
	 * @default:
	 * 		 false
	 * @example:
	 * |<div dojoType="unieap.xgrid.Grid" showLoading="true">
	 * |	...
	 * |</div>
	 */
	showLoading: false,
	
	templateString: 
		"<div class='u-xgrid'>" +
			"<div class='u-xgrid-headers' dojoAttachPoint='headersNode'>" +
				"<div class='header-corner' dojoAttachPoint='headerCorner'></div>"+
			"</div>" +
			'<div class="u-xgrid-views" dojoAttachPoint="viewsNode">' +
				"<div class='u-xgrid-yscroller' dojoAttachPoint='yscrollerNode'>" +
					"<div dojoAttachPoint='yscrollerTop' class='y-scroller-up'></div>"+
					"<div dojoAttachPoint='yscrollerBottom' class='y-scroller-down'></div>"+
					"<div dojoAttachPoint='yscrollerHandle' class='y-scroller-handle'>" +
						"<div class='y-scroller-handle-top'></div>" + 
						"<div class='y-scroller-handle-middle'></div>" + 
						"<div class='y-scroller-handle-bottom'></div>" + 
					"</div>"+
				"</div>"+
				"<div class='u-xgrid-xscroller' dojoAttachPoint='xscrollerNode'>" +
					"<div dojoAttachPoint='xscrollerTop' class='x-scroller-up'></div>"+
				    "<div dojoAttachPoint='xscrollerBottom' class='x-scroller-down'></div>"+
				    "<div dojoAttachPoint='xscrollerHandle' class='x-scroller-handle'>" +
				    	"<div class='x-scroller-handle-west'></div>" + 
						"<div class='x-scroller-handle-middle'></div>" + 
						"<div class='x-scroller-handle-east'></div>" + 
				    "</div>"+
				"</div>"+
				"<div class='content-corner' dojoAttachPoint='contentCorner'></div>" +
				"<div class='content-loading'  style='display:none' dojoAttachPoint='contentLoading'>" +
				"<div class='content-loading-text' dojoAttachPoint='contentText'></div>" +
				"</div>" +				
			'</div>' +
		'</div>',
		
	postCreate: function() {
		this.inherited(arguments);
		this.initContainer();
		this._createManagers();
		unieap.xgrid.funnelEvents(this.viewsNode, this, "doContentEvent",[ 'mouseover', 'mouseout', 'mousedown', 'click', 'dblclick', 'contextmenu' , 'mouseup']);
		unieap.xgrid.funnelEvents(this.headersNode, this, "doHeaderEvent", [ 'mouseover', 'mouseout', 'mousemove', 'mousedown', 'click', 'dblclick', 'contextmenu']);
		if(this.showLoading){
			this.contentText.innerHTML = RIA_I18N.util.util.loading;
			dojo.style(this.contentLoading,'display','block');
		}
	},
	_createManagers: function(){
		this.managers = [];
		var managers = [
	                ["Layout","unieap.xgrid.manager.LayoutManager","layout"],
	                ["View","unieap.xgrid.manager.ViewManager","views"],
	                ["Row","unieap.xgrid.manager.RowManager","row"]
		      ];
		if(this.menu || this.filter || this.individual){
			managers.push(["Menu","unieap.xgrid.manager.MenuManager","menu"]);
		}
		if(this.filter){
			managers.push(["Filter","unieap.xgrid.manager.FilterManager","filter"]);
		}
		if(this.selection){
			managers.push(["Selection","unieap.xgrid.manager.SelectionManager","selection"]);
		}
		if(this.edit){
			managers.push(["RowEdit","unieap.xgrid.manager.RowEditManager","edit"]);
		}
		for(var i=0,m;m = managers[i];i++){
			dojo.require(m[1]);
			var managerName = m[0].concat("Manager"),
				managerClazz = dojo.getObject(m[1]);
			this[managerName] = new managerClazz(dojo.mixin(this[m[2]],{grid:this}));
			this.managers.push(managerName);
		}
		//初始化核心的manager
		for(var i=0,m;m = managers[i];i++){
			var manager = this[m[0].concat("Manager")];
			manager.startup && manager.startup();
		}
		this._parseFoot();
		this._parseToolBar();
		var toolBarIndividual = this.getToolBar() && this.getToolBar()['individual'];
		if(toolBarIndividual && this.individual){
			if(this.individual.isShowToolbar == false){
				dojo.style(this.getToolBar().individualNode,"display","none");
			} 
		}
		if(this.individual && !toolBarIndividual){
			dojo.require("unieap.xgrid.manager.Individual");
			this['IndividualManager'] = new unieap.xgrid.manager.Individual({grid:this});
			this.managers.push("IndividualManager");
		}
	},
	
	doContentEvent : function(e){
    	this.getManager("ViewManager").doContentEvent(e);
    },
    doHeaderEvent : function(e){
    	this.getManager("ViewManager").doHeaderEvent(e);
    },
    
    _parseFoot: function() {
		if(!this.srcNodeRef){
			return;
		}
		var footNode=this.srcNodeRef.getElementsByTagName('foot');
		if(footNode.length>0){
			footNode=footNode[0];
			if(!dojo.isIE || dojo.isIE>8){
				dojo.style(footNode,{textAlign:'right',display:'block'});
			}else{
				this.footSrcNode=dojo.create('div',{});
				dojo.style(this.footSrcNode,'textAlign','right');
				var cs=footNode.parentNode.childNodes;
				var begin,end;
				for(var i=0;i<cs.length;i++){
					if(cs[i].tagName=='FOOT'){
						begin=true;
						continue;
					}
					if(begin){
						if(cs[i].tagName=='/FOOT'){
							break;
						}	
						this.footSrcNode.appendChild(cs[i]);
						i--;
					}
				}
				footNode =this.footSrcNode;
			}
			dojo.require("unieap.xgrid.core.foot");
			//引用foot
			this.foot=new  unieap.xgrid.view.foot(this,footNode);
		}
	},
	
	_parseToolBar: function() {
		if(!this.srcNodeRef){
			return;
		}
		var toolBar=this.srcNodeRef.getElementsByTagName('toolbar');
		if(toolBar.length>0) {
			//引用toolbar
			dojo.require("unieap.xgrid.core.toolbar");
			dojo.attr(toolBar[0],'dojoType','unieap.xgrid.toolbar');
			//实例化一个toolbar对象，传入toolBar domNode节点
			this.toolBar=dojo.parser.instantiate(toolBar,{grid:this})[0];
		}
	},
	
	resizeContainer: function(autoHeight){
		if(!this.domNode) return;
		var width = this.domNode.style.width,
			height = this.domNode.style.height;
		if(String(width+height).indexOf("%")<0 && (width != "auto") && (height != "auto")){
			this.ViewManager.resize(parseInt(width,10),parseInt(height,10));
		}
		else{
			width = this.domNode.clientWidth;
//			if(0==(width = this.domNode.clientWidth)) return;
			if(this.height == "auto" && autoHeight){
				setTimeout(dojo.hitch(this,this._autoHeight),0);
				return;
			}
			else if(width==0)
				return
			else
				height = this.domNode.clientHeight;
			this.ViewManager.resize(width,height);
		}
	},
	
	_autoHeight:function(){
		var defaultRowHeight = this.getManager("RowManager").defaultRowHeight;
		var defaultHeaderHeight = this.getManager("RowManager").defaultHeaderHeight;
		var toolBarHeight = 0;
		var footHeight = 0;
		var width = this.domNode.offsetWidth+20;
		var height=0;
		if(this.toolBar)
			toolBarHeight = dojo.style(this.toolBar.domNode,"height") +2;
		if(this.foot)
			footHeight = dojo.style(this.foot.footNode,"height") +15;
		height = this.getBinding().getDataStore().getRowSet().getRowCount()*defaultRowHeight + defaultHeaderHeight + toolBarHeight + footHeight + 2;
		this.ViewManager.resize(width,height);
	},
	/**
	 * @summary:
	 * 		校验xGrid中的数据是否合法
	 * @description:
	 * 		如果校验不通过的单元格可以编辑，当errorPrompt参数为true时会自动提示错误信息，并置光标到单元格中
	 * @param:
	 * 		{number} inRowIndex 对某一行的数据进行校验，如果不设置则检验所有单元格
	 * @param:
	 * 		{boolean} errorPrompt 校验不通过后是否自动提示错误信息，如果不设置就为global.js中的unieap.widget.errorPrompt
	 * @return:
	 * 		{boolean} needFocus 当校验不通过时，是否设置光标到出错的单元格，默认为true
	 * @example:
	 * |<script type="text/javascript">
	 * |	var grid=unieap.byId("grid");
	 * |	//只校验第1行,是否提示错误信息依赖于unieap.widget.errorPrompt
	 * |	grid.validate(0); 
	 * |	//校验第一行并提示错误信息
	 * |	grid.validate(0,true);
	 * |	//校验所有的单元格但不提示错误信息
	 * |	grid.validate(false);
	 * |</script>
	 */
	validate:function(inRowIndex,errorPrompt){
		var binding=this.getBinding();
		if(binding){
			return binding.validate.apply(binding,arguments);
		}
		return true;
	},
	destroy: function(){
		var scroller = this.getViewManager().scroller;
		if(scroller){
			scroller.destroy();
		}
		var managers = this.managers;
		for(var i = 0,m; m = managers[i]; i++){
			if(this[m] && this[m].destroy){
				this[m].destroy();
			}
		}
		this.binding&&this.binding.destroy&&this.binding.destroy();
		this.toolBar&&this.toolBar.destroy&&this.toolBar.destroy();
		this.foot&&this.foot.destroy&&this.foot.destroy();
		this.inherited(arguments);
	},
	getSortInfo: function(){
		return this.sortInfo || [];
	},
	setSortInfo: function(inCell){
		this.sortInfo = this.sortInfo || [];
		for(var i=0;i<this.sortInfo.length;i++){
			if(this.sortInfo[i]==inCell){
				this.sortInfo.splice(i,1);
				break;
			}
		}
		this.sortInfo.unshift(inCell);
		this.sortInfo.length>2 && this.sortInfo.pop();
	},
	/**
	 * @summary:
	 * 		取得表格的某个控制器
	 * @param:
	 * 		{string} manager 控制器名字
	 * @return:
	 * 		{unieap.xgrid.manager.*} 表格的某个控制器
	 * @example:
	 * |//取得视图控制器
	 * |var views = grid.getManager("ViewManager");
	 * @example:
	 * |//取得布局控制器	
	 * |var layout = grid.getManager("LayoutManager");
	 */
	getManager: function(manager) {
		return this[manager] ? this[manager] : null;
	},
	/**
	 * @summary:
	 * 		取得视图控制器
	 * @return:
	 * 		{unieap.xgrid.manager.ViewManager}
	 */
	getViewManager: function() {
		return this.getManager("ViewManager");
	},
	
	/**
	 * @summary:
	 * 		取得布局控制器
	 * @return:
	 * 		{unieap.xgrid.manager.LayoutManager}
	 */
	getLayoutManager: function() {
		return this.getManager("LayoutManager");
	},
	/**
	 * @summary:
	 * 		取得行控制器
	 * @return:
	 * 		{unieap.xgrid.manager.RowManager}
	 */
	getRowManager: function() {
		return this.getManager("RowManager");
	},
	
	/**
	 * @summary:
	 * 		取得过滤控制器
	 * @return:
	 * 		{unieap.xgrid.manager.FilterManager}
	 */
	getFilterManager: function() {
		return this.getManager("FilterManager");
	},
	
	/**
	 * @summary:
	 * 		设置表格的数据源
	 * @param:
	 * 		{unieap.ds.DataStore} store
	 */
	setDataStore: function(store) {
		this.getBinding().setDataStore(store);
	},
	/**
	 * @summary：
	 * 		取得toolbar
	 * @example：
	 * |	var toolbar=grid.getToolBar();
	 * |	toolbar.update();
	 * 		取得工具条,进行工具条的更新操作
	 * @return:
	 * 		{unieap.xgrid.view.toolbar|null}
	 * @see:
	 * 		unieap.xgrid.view.toolbar
	 */
	getToolBar: function(){
		return this.toolBar;
	},
	/**
	 * @summary：
	 * 		取得foot
	 * @example：
	 * |	var foot=grid.getFoot();
	 * 		自定义XGrid的foot区域
	 * @return:
	 * 		{unieap.xgrid.view.foot|null}
	 * @see:
	 * 		unieap.xgrid.view.foot
	 */
	getFoot: function(){
		return this.foot;
	},
	/**
	 * @summary：
	 * 		取得rowEdit控制器
	 * @example：
	 * |	var rowEdit=grid.getRowEditManager();
	 * |	toolbar.update();
	 * 		取得工具条,进行工具条的更新操作
	 * @return:
	 * 		{unieap.xgrid.view.RowEditManager|null}
	 */
	 getRowEditManager: function(){
	 	return this.getManager("RowEditManager");
	 },
	//监听数据变化
	onItemChanged: function(index,name) {
		var cell = this.LayoutManager.getCell(name);
		var viewManager=this.ViewManager;
		viewManager.refreshCell(index,cell);
		viewManager.renderLockedRow(false);
	},
	//grid新增、删除数据时触发
	onRowSetChanged: function() {
		this.ViewManager.refreshPage();
	},
	//grid的datastore发生改变时触发(datastore被重新设置、被替换等)
	onStoreChanged: function() {
		var viewManager = this.getViewManager();
		//this.BindingManager.updateRowData();
		dojo.forEach(viewManager.views,function(view){
    		view.renderHeader();
    	});
    	var selectionManager = this.getManager("SelectionManager");
    	if(selectionManager){
    		selectionManager.refreshCheckState();
    	}
		this.height == "auto"?viewManager.refresh(true):viewManager.refresh();
	},
	//grid排序后触发
	onSorted: function(){
		var viewManager=this.ViewManager;
		dojo.forEach(viewManager.views,function(view){
			!view.isRowBar&&view.renderHeader();
		})
		viewManager.refreshPage();
	},
	/**
	 * @summary:
	 * 		取得表格的绑定
	 * @return:
	 * 		{unieap.xgrid.Binding}
	 */
	getBinding: function() {
		this.BindingManager=unieap.getModuleInstance(this,'binding',"unieap.xgrid.manager.BindingManager");
		this.managers.push("BindingManager");
		return this.BindingManager;
		
	},
	
	/**
	 * @summary:
	 * 		刷新表格，视图重新构建。
	 *	@example:
	 *	|unieap.byId("grid").refresh();
	 */
	refresh: function(){
		this.getManager("ViewManager").structureChanged();
		this.getManager("ViewManager").refresh();
	},
	
	
	/**
	 * @summary
	 * 		取得grid的信息
	 * @description:
	 * 		用于打印导出等功能
	 * @return:
	 * 		{array} 二维数组
	 * @example:
	 * | var layout = gird.getGridData(); 	
	 * |//返回的内容形如如下格式：
	 * |[
	 * |${1}[
	 * |		[
	 * |			{${2}name:"attr_empno",${3}label:"员工编号",${4}width:"80"}
	 * |		]
	 * |	],
	 * |${5}[
	 * |	${6}[
	 * |			{name:"attr_ename",label:"姓名" , ${7}rowSpan:2,width:"150"},
	 * |			{label:"基本信息",${8}colSpan:4,${9}isMulTitle:true}
	 * |		],
	 * |	${10}[
	 * |			{name:"attr_deptno",label:"部门", colSpan:1, width:"150",${11}decoder:{"10":"财务部","20":"开发部"}}, 		
	 * | 			{name:"attr_hiredate",label:"入职日期" , width:"160", ${12}dataFormat:'yyyy-MM-dd'},
	 * | 			{name:"attr_job",label:"职位", width:"150"},
	 * |			{name:"attr_sal",label:"工资", width:"150",dataFormat:'#,###.00'}
	 * |		]
	 * |	]
	 * |]
	 * ${1}锁定列视图部分定义
	 * ${2}列数据绑定字段名称
	 * ${3}列显示的名称
	 * ${4}列在页面上显示的宽度
	 * ${5}非锁定列视图部分定义
	 * ${6}多标题第一行内容定义与（table的row定义一致）
	 * ${7}定义该列占几行，如果不写默认为1
	 * ${8}定义该列占几列，如果不写默认为1
	 * ${9}标明该列是否为多标题列，如果是则没有数据绑定
	 * ${10}多标题第二行内容定义
	 * ${11}转义字典，根据它值可以翻译成显示文本
	 * ${12}格式化定义，根据它显示格式化后的文本
	 * @img:
	 * 		images/grid/grid_multititles.png
	 */
	getGridData: function(){
        var gridData={},
			layoutManager = this.LayoutManager;
        gridData['store'] = this.BindingManager.getDataStore();
        gridData['layout'] = layoutManager.getLayoutInfo();
		//TODO:
		//	如果xgrid支持锁定行、footer，还需要导出锁定行、footer等相关信息
        return gridData;
    },
    
	//事件
	docontextmenu:function(e){
		this.ViewManager._doContextMenu(e);
		if(dojo.isIE){
			this.domNode.fireEvent('oncontextmenu');
		}else{
			var evt=document.createEvent('HTMLEvents');
			evt.initEvent("contextmenu", false, false);
			this.domNode.dispatchEvent(evt);
		}
		dojo.stopEvent(e);
	},
	doheaderclick: function(e) {
		this.ViewManager._doHeaderClick(e);
	},
	doheadermousedown: function(e) {
		this.ViewManager._doHeaderMousedown(e);
	},
	doKeyEvent: function(e) {
		e.dispatch = 'do' + e.type;
		this.onKeyEvent(e);
	},
	onKeyEvent: function(e) {
		this._dispatch(e.dispatch, e);
	},
	onHeaderEvent: function(e) {
		e.sourceView.dispatchHeaderEvent(e) || this._dispatch('doheader' + e.type, e);
	},
	onContentEvent: function(e) {
		e.sourceView.dispatchContentEvent(e) || this._dispatch(e.dispatch, e);
	},
	_dispatch: function(m, e) {
		if(m in this) {
			return this[m](e);
		}
	},
	domousedown: function(e) {
		this.ViewManager._onMousedown(e);
	},
	domouseup: function(e){
		this.ViewManager._onMouseup(e);
	},
	doclick: function(e) {
		this.ViewManager._doClick(e);
	},
	dodblclick: function(e) {
		this.ViewManager._doDbClick(e);
	},
	startup: function(){
		this.resizeContainer();
	},
	//用户个性化保存获取grid原始ID
	getOriId:function(){
		if(this._rootID != null){
			var len = this._rootID.length;
			var len2 = this.id.length;
			return this.id.substring(len);
		}
		return this.id;
	}
});
