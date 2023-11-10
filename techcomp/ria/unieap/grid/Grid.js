dojo.provide("unieap.grid.Grid");
dojo.require("dijit._Templated");
dojo.require("unieap.grid._grid.lib");
dojo.require("unieap.grid._grid.binding");
dojo.require("unieap.grid.manager.managers");
dojo.require("unieap.ds");
dojo.require("unieap.layout.Container");
dojo.declare('unieap.grid.Grid', [unieap.layout.Container, dijit._Templated], {
	/**
	 * @declaredClass:
	 * 		unieap.grid.Grid
     * @superClass:
     * 		unieap.layout.Container
	 * @summary:
	 * 		数据表格
	 * @example:
	 * |<div dojoType="unieap.grid.Grid" width="500px" height="300px"
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
	UserInterfaces : dojo.mixin({
		height : "string",
		trigger : "boolean",
		layout : "object",
		views : "object",
		rows : "object",
		selection : "object",
		filter : "object",
		menu : "object",
		edit : "object",
		group : "object",
		tree : "object",
		xtree : "object",
		binding : "object",
		lockedRow : "object",
		detail : "object",
		unitedCell : "object",	
		showLoading:"boolean"
	},
	unieap.layout.Container.prototype.UserInterfaces),
	
	/**
	 * @summary:
	 * 		表格高度
	 * @type:
	 * 		{string}
	 * @default:
	 * 		'250px'
	 */
	height: '250px',
	
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
	 *|<div dojoType="unieap.grid.Grid" id="grid" width="80%" height="250px" 
	 *|     binding="{store:'empDataStore'}" views="{rowNumber:true}" trigger="false">
     *| 	...... 
	 *|</div>
	 */
	trigger: true,
	
	/**
	 * @summary:
	 * 		布局控制器
	 * @description
	 * 		在使用new创建Grid时需要指定布局控制器中的表格结构信息，使用标签声明来创建表格时一般不使用此属性。
	 * @type:
	 * 		{object}
	 * @see:
	 * 		unieap.grid.manager.LayoutManager
	 * @example:
	 * |//锁定列数据
	 * |var fixedColumns=[
	 * |	{label: "员工编号",name: "attr_empno",width: "150px"}
	 * |]
	 * |//非锁定列数据
	 * |var columns=[
	 * |	{label: "姓名",name: "NAME",width: "100px"},
	 * |	{label: "职位",name: "attr_job",width: "150px"},
	 * |	{label: "工资",name : "attr_sal",width : "150px"}
	 * |]
	 * |var fixed={noscroll: true,rows:[fixedColumns]};
	 * |var header={rows:[columns]}
	 * |var layout = [fixed, header]; //注意这里的顺序，要将锁定列放在前面
	 * |var grid = new unieap.grid.Grid({
	 * |		binding: {store:'empDataStore'},
	 * |		views: {rowNumber: true},
	 * |		layout: {structure: layout},
	 * |		width: 600,
	 * |		height: 250
	 * |});
	 */
	layout: null,
	
	/**
	 * @summary:
	 * 		视图控制器
	 * @type:
	 * 		{object}
	 * @see:
	 * 		unieap.grid.manager.ViewManager
	 * @example:
	 * |<div dojoType="unieap.grid.Grid" binding="{store:'empDataStore'}" views="{rowNumber:true}">
	 * |	...
	 * |</div>
	 */
	views: null,
	
	/**
	 * @summary:
	 * 		行控制器
	 * @type:
	 * 		{object}
	 * @see:
	 * 		unieap.grid.manager.RowManager
	 * @example:
	 * |<div dojoType="unieap.grid.Grid" binding="{store:'empDataStore'}" rows="{defaultRowHeight:23}">
	 * |	...
	 * |</div>
	 */
	rows: null,
	
	/**
	 * @summary:
	 * 		选择控制器
	 * @type:
	 * 		{object}
	 * @see:
	 * 		unieap.grid.manager.SelectionManager
	 * @example:
	 * |<div dojoType="unieap.grid.Grid" binding="{store:'empDataStore'}" 
	 * |	 selection="{selectType:'single',onBeforeSelect:'myFunction'}">
	 * |	 ...
	 * |</div>
	 */
	selection: null,
	
	/**
	 * @summary:
	 * 		过滤相关信息
	 * @description：
	 * 		是否启用列过滤功能，可配置include或exclude属性，指定在哪些列上显示过滤菜单
	 * 		{include: ['col1', 'col2']} 在列绑定名为'col1'和'col2'的列上显示过滤菜单
	 * 		{exclude: ['col1', 'col2']} 除列绑定名为'col1'和'col2'的列不显示过滤菜单外，其它列上都显示
	 * 		{} 在所有列上都显示过滤菜单
	 * @type：
	 * 		{object}
	 * @see:
	 * 		unieap.grid.manager.FilterManager
	 * @example:
	 * |//在所有列上都显示过滤菜单
	 * |<div dojoType="unieap.grid.Grid" binding="{store:'empDataStore'}" filter="{}"></div>
	 * @example:
	 * |//只在列绑定名为attr_name的列才显示过滤菜单
	 * |<div dojoType="unieap.grid.Grid" filter="{include:['attr_name']}"></div>
	 * @example:
	 * |//除列绑定名为attr_name的列不显示滤外菜单,其他列都显示
	 * |<div dojoType="unieap.grid.Grid" filter="{exclude:['attr_name']}"></div>
	 */
	filter:null,
	
	/**
	 * @summary:
	 * 		菜单控制器
	 * @description
	 * 		设置表头上菜单相关的属性，若要出现菜单，还需要配置菜单项，例如filter。
	 * @type:
	 * 		{object}
	 * @see：
	 * 		unieap.grid.manager.MenuManager
	 * @example:
	 * |<div dojoType="unieap.grid.Grid" menu="{onBeforeMenuClick:fn}}"
	 * |	 width="100%" height="350px">
	 * |</div>
	 * |function fn(cell){
	 * |	console.info(cell.label);
	 * |	return true; //一定要有返回true,否则菜单项不会弹出来
	 * |}
	 */
	menu:null,
	
	//自动注入dataCenter
	Autowired : "dataCenter",
	
	/**
	 * @summary:
	 * 		编辑控制器
	 * @description
	 * 		设置编辑模式，cell中配置editor才能进行编辑。
	 * @type:
	 * 		{object}
	 * @see:
	 * 		unieap.grid.manager.EditManager
	 * @example:
	 * |<div dojoType="unieap.grid.Grid" binding="{store:'empDataStore'}" edit="{editType:'rowEdit',singleClickEdit:false}">
	 * |	 ...
	 * |</div>
	 */
	edit: null,
	
	/**
	 * @summary:
	 * 		分组控制器
	 * @type：
	 * 		{object}
	 * @see:
	 * 		unieap.grid.manager.GroupManager
	 * 		unieap.grid.manager.Group
	 * @example:
	 * |<div dojoType="unieap.grid.Grid" binding="{store:'empDataStore'}" group="{autoApply:true,groupBar:true}">
	 * |	 ...
	 * |</div>
	 */
	group: null,
	
	/*
	 * @summary:
	 * 		TreeGrid控制器
	 * @type:
	 * 		{object}
	 * @see:
	 * 		unieap.grid.manager.TreeManager
	 */
	tree: null,
	
	//新版treeGrid
	xtree: null,
	
	/**
	 * @summary:
	 * 		表格绑定
	 * @type:
	 * 		{object}
	 * @see:
	 * 		unieap.grid.Binding
	 * @example:
	 * |<div dojoType="unieap.grid.Grid" binding="{store:'empDataStore'}">
	 * |	 ...
	 * |</div>
	 */
	binding: null,
	
	/**
	 * @summary:
	 * 		锁定行相关信息
	 * @description
	 * 		getLockedRow 配置锁定行的自定义信息，配置一个函数，返回在锁定行显示的RowSet数据。
	 * 		statistics 配置锁定行的统计信息，要使用此功能，需要事先将计算好的数据存放在DataStore中
	 * 		DataStore的setStatistics可以向DataStore中添加统计信息。
	 * 		例如：
	 * 		var ds = new unieap.ds.DataStore("test");
	 * 		var statistics = {"attr_sal":{"max":5555,"min":222},attr_empno: {"min": ""}};
	 * 		ds.setStatistics(statistics);
	 * @type：
	 * 		{object}
	 * @example：
	 * |<div id="grid" id="grid" dojoType="unieap.grid.Grid" 
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
	lockedRow:null,
		
	/**
	 * @summary:
	 * 		表格行详情相关信息
	 * @description：
	 * 		实现每行的详细情况
	 * @type
	 * 		{object}
	 * @see：
	 * 		unieap.grid.manager.DetailManager
	 * @example:
	 * |<div dojoType="unieap.grid.Grid" detail='{expandAll:true,getMasterDetail:getMyDetail}'> 
	 * |</div>
	 * |function getMyDetail(inRowIndex){
	 * |	var span=dojo.create("span",{innerHTML:inRowIndex});
	 * |	return span;
	 * |}
	 */
	detail:null,
	
	/**
	 * @summary:
	 * 		表格合并单元格信息
	 * @type:
	 * 		{object}
	 * @see:
	 * 		unieap.grid.manager.UnitedCellManager
	 */
	unitedCell:null,
	
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
	
	templateString: '<div class="u-grid">' +
						'<table class="u-grid-master-header" cellpadding="0" cellspacing="0" dojoAttachPoint="header"><tbody><tr dojoAttachPoint="headerNode"></tr></tbody></table>' +
						'<div class="content-loading"  style="display:none;z-index:100" dojoAttachPoint="contentLoading">' +
						'<div class="content-loading-text" dojoAttachPoint="contentText"></div>' +
						'</div>'+
						'<table class="u-grid-master-views" cellpadding="0" cellspacing="0" dojoAttachPoint="view"><tbody><tr dojoAttachPoint="viewsNode"></tr>'+
						'</tbody></table>' +
					'</div>',
	
	postMixInProperties: function() {
		var s;
		if (this.layout && this.layout.structure) {
			return;
		} else if (typeof (s= this.srcNodeRef.innerHTML) =="undefined" || dojo.trim(s)==""){
			return;
		}
		//
		this._preSrcNodeRef();
		s = s.replace(/<header/gi,"<div tagName=header").
				replace(/<fixed/gi,"<div tagName=fixed").
				replace(/<row/gi,"<div tagName=row").
				replace(/<cell/gi,"<div tagName=cell").
				replace(/<foot/gi,"<div tagName=foot").
				replace(/<toolbar/gi,"<div tagName='toolbar'").
				replace(/(<\/header>)|(<\/fixed>)|(<\/row>)|(<\/cell>)|(<\/foot>)|(<\/toolbar)/gi,"</div>")
		this.srcNodeRef.innerHTML = s;
	},
	
	startup: function(){
		this.resizeContainer();
	},
	
	postCreate: function() {
		this.initContainer();
	    this._createManagers();
		unieap.grid.funnelEvents(this.view, this, "doContentEvent",[ 'mouseover', 'mouseout', 'mousedown', 'click', 'dblclick', 'contextmenu' , 'mouseup']);
		unieap.grid.funnelEvents(this.header, this, "doHeaderEvent", [ 'mouseover', 'mouseout', 'mousemove', 'mousedown', 'click', 'dblclick', 'contextmenu']);
		if(this.showLoading){
			this.contentText.innerHTML = RIA_I18N.util.util.loading;
			dojo.style(this.contentLoading,'display','block');
		}
	},
	doContentEvent : function(e){
    	this.managers.get("ViewManager").doContentEvent(e);
    },
    doHeaderEvent : function(e){
    	this.managers.get("ViewManager").doHeaderEvent(e);
    },
	
	_createManagers: function() {
		this.managers = new unieap.grid.managers(this);
		this.managers.init();
		var layout = this.managers.get("LayoutManager");
		unieap.grid.addObserver(layout, this.managers.get("ViewManager"));
		layout.setStructure(layout.structure);
	},
	
	resizeContainer : function(){
		if(!this.domNode || this.domNode.offsetHeight==0) return;
		var viewManager = this.managers.get("ViewManager");
		unieap.fireEvent(this,this.onBeforeResize,[]);
		if(this.width.indexOf("%") > 0 || this.height.indexOf("%") > 0){
			viewManager.resize();
		}
		else{
			viewManager.resizeHeight();
			viewManager.adjustScrollBar();
		}
		
	},
	
	onBeforeResize : function(){
		
	},
	
	/**
	 * @summary:
	 * 		取得表格的某个控制器
	 * @param:
	 * 		{string} manager 控制器名字
	 * @return:
	 * 		{unieap.grid.manager.*} 表格的某个控制器
	 * @example:
	 * |//取得视图控制器
	 * |var views = grid.getManager("ViewManager");
	 * @example:
	 * |//取得布局控制器	
	 * |var layout = grid.getManager("LayoutManager");
	 * @example:
	 * |//取得编辑控制,调用相关操作
	 * |var edit = grid.getManager("EditManager");
	 * |if (edit) {
	 * |	edit.apply();
	 * |}
	 */
	getManager: function(manager) {
		return this.managers.getManager(manager);
	},
	
	/**
	 * @summary:
	 * 		取得视图控制器
	 * @return:
	 * 		{unieap.grid.manager.ViewManager}
	 */
	getViewManager: function() {
		return this.getManager("ViewManager");
	},
	
	/**
	 * @summary:
	 * 		取得布局控制器
	 * @return:
	 * 		{unieap.grid.manager.LayoutManager}
	 */
	getLayoutManager: function() {
		return this.getManager("LayoutManager");
	},
	
	/**
	 * @summary:
	 * 		取得行控制器
	 * @return:
	 * 		{unieap.grid.manager.RowManager}
	 */
	getRowManager: function() {
		return this.getManager("RowManager");
	},
	
	/**
	 * @summary:
	 * 		取得某个cell对象
	 * @param:
	 * 		{number|string} inData 列的序号或绑定名
	 * @return:
	 * 		{unieap.grid.Cell}
	 * @description:
	 * 		获取某个cell对象，inData可为cell的序号，也可以是cell的name属性值
	 */
	getCell: function(inData) {
		return this.getManager("LayoutManager").getCell(inData);
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
	 * 		{unieap.grid.view.toolbar|null}
	 * @see:
	 * 		unieap.grid.view.toolbar
	 */
	getToolBar:function(){
		if(this.toolBar&&this.toolBar.declaredClass=='unieap.grid.view.toolbar'){
			return this.toolBar;
		}else{
			return null;
		}
	},
	
	/**
	 * @summary：
	 * 		取得foot
	 * @example:
	 * |//取得foot,进行foot的更新操作
	 * |var foot=grid.getFoot();
	 * |foot.update();
	 * @return:
	 * 		{unieap.grid.view.foot|null}
	 * @see:
	 * 		unieap.grid.view.foot
	 */
	getFoot:function(){
		if(this.foot&&this.foot.declaredClass=='unieap.grid.view.foot'){
			return this.foot;
		}else{
			return null;
		}
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
        var gridData = {}, self = this,lockedData;
        var layoutmanager = self.managers.get('LayoutManager');
        gridData.store = self.getBinding().store;
        gridData.layout = layoutmanager.getLayoutInfo();
		lockedData=self.getBinding().getLockedRowData();
		if(lockedData&&lockedData.length>0){
			gridData.lockedData=lockedData;	
		}
		var foot=self.getFoot();
		if (foot) {
			gridData.footer=foot.getInnerText();	
		}
		var datas=this.managers.getPlus(this,'getGridData');
		if(datas&&datas.length>0){
		 	for(var i=0;i<datas.length;i++){
				var _mdf=datas[i],_md;
				if(typeof _mdf =="function"){
					_md=_mdf.call();
					dojo.mixin(gridData,_md);
				}
			}
		 }
        return gridData;
    },
	
	/**
	 * @summary:
	 * 		取得表格的绑定
	 * @return:
	 * 		{unieap.grid.Binding}
	 */
	getBinding: function() {
		this.binding = new unieap.grid.Binding(this.binding||{}, this);
		this.getBinding = function(){
			return this.binding;
		}
		return this.binding;
	},
	

	/**
	 * @summary:
	 * 		校验Grid中的数据是否合法
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
		this.managers.destroy&&this.managers.destroy();
		this.binding&&this.binding.destroy&&this.binding.destroy();
		this.foot&&this.foot.destroy&&this.foot.destroy();
		this.toolBar&&this.toolBar.destroy&&this.toolBar.destroy();
		this.inherited(arguments);
	},
	getSortInfo : function(){
		return this.sortInfo || [];
	},
	setSortInfo : function(inCell){
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
	 * 		刷新表格，视图重新构建。
	 *	@example:
	 *	|unieap.byId("grid").refresh();
	 */
	refresh : function(){
		this.managers.get("ViewManager").structureChanged();
	},
	
	//SrcNode预处理
	_preSrcNodeRef:function(){
		if(this.srcNodeRef){
			var toolbar=this.srcNodeRef.getElementsByTagName('toolbar');
			var foot=this.srcNodeRef.getElementsByTagName('foot');
			if(toolbar&&toolbar[0]){
				if(!dojo.isIE || dojo.isIE>8){
					this.toolbarSrcNode=toolbar[0];
				}else{
					this.toolbarSrcNode=dojo.create('div',{});
					this.toolbarSrcNode.appendChild(toolbar[0]);
//					var cs=toolbar[0].parentNode.childNodes;
//					var begin,end;
//					for(var i=0;i<cs.length;i++){
//						if(cs[i].tagName=='TOOLBAR'){
//							begin=true;
//							continue;
//						}
//						if(begin){
//							if(cs[i].tagName=='/TOOLBAR'){
//								break;
//							}	
//							this.toolbarSrcNode.appendChild(cs[i]);
//							i--;
//						}
//					}
				}
			}else{
				//如果用户通过动态parse来创建toolbar
				//dojo.byId('x').innerHTML="<div dojoType='unieap.grid.Grid'><div tagName='header'><div tagName='cell' label='测试'></div></div><div tagName='toolbar'>Hello</div></div>";
				//dojo.parser.parse('x')
				//toolbar的内容无法显示
				try{
					var _t=dojo.query(" >div[tagName='toolbar']",this.srcNodeRef);
					if(_t&&_t[0]){
						this.toolbarSrcNode=dojo.create('div',{});
						while(_t[0].hasChildNodes()){
							this.toolbarSrcNode.appendChild(_t[0].firstChild);
						}
					}
				}
				catch(e){
					
				}
			}
			if(foot&&foot[0]){
				if(!dojo.isIE){
					this.footSrcNode=foot[0];
				}else{
					this.footSrcNode=dojo.create('div',{});
					var cs=foot[0].parentNode.childNodes;
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
				}
			}
		}
	},
	
	//事件等定义
	doKeyEvent: function(e) {
		e.dispatch = 'do' + e.type;
		this.onKeyEvent(e);
	},
	onKeyEvent: function(e) {
		this.dispatchKeyEvent(e);
	},
	dispatchKeyEvent: function(e) {
		this._dispatch(e.dispatch, e);
	},
	
	onContentEvent: function(e) {
		this.dispatchContentEvent(e);
	},
	onHeaderEvent: function(e) {
		this.dispatchHeaderEvent(e);
	},
	dispatchContentEvent: function(e) {
		e.sourceView.dispatchContentEvent(e) || this._dispatch(e.dispatch, e)
	},
	dispatchHeaderEvent: function(e) {
		e.sourceView.dispatchHeaderEvent(e) || this._dispatch('doheader' + e.type, e);
	},
	
	_dispatch: function(m, e) {
		if(m in this) {
			return this[m](e);
		}
	},
	domousedown: function(e) {
		this.managers.get("ViewManager")._onMousedown(e);
	},
	domouseup:function(e){
		this.managers.get("ViewManager")._onMouseup(e);
	},
	doclick: function(e) {
		this.managers.get("ViewManager")._doClick(e);
	},
	dodblclick: function(e) {
		this.managers.get("ViewManager")._doDbClick(e);
	},
	
	docontextmenu:function(e){
		this.managers.get("ViewManager")._doContextMenu(e);
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
		this.managers.get("ViewManager")._doHeaderClick(e);
	},
	doheadermousedown: function(e) {
		//groupbar may connect this function
		this.managers.get("ViewManager")._doHeaderMousedown(e);
	},
	
	//////////////////数据驱动//////////////////////////////
	
	///当一个单元格的值发生变化或者RowSet的item值被修改时触发
	onItemChanged:function(index,name) {
		var cell = this.managers.get("LayoutManager").getCell(name);
		var viewManager=this.managers.get("ViewManager");
		viewManager.refreshCell(index,cell);
		viewManager.renderLockedRow(true);
	},
	
	//grid新增、删除数据时触发
	onRowSetChanged:function() {
		this.managers.get("ViewManager").refreshPage();
		this.resizeContainer();
	},
	
    //grid的datastore发生改变时触发(datastore被重新设置、被替换等)
	onStoreChanged:function() {
		   this.toolBar && this.toolBar._comboBox 
		&& this.binding.getDataStore() && this.binding.getDataStore().getPageSize() 
		&& this.toolBar._comboBox.setValue(this.binding.getDataStore().getPageSize());
		//RowSet deleteAllRows方法中执行了this["primary"] = [];需要进行同步   modify by wangbw 09.11.26
		this.binding.updateRowData();
		if(this.managers.getManager("TreeManager") == undefined){
			this.managers.get("ViewManager").refresh();
		}
		//this.managers.get("ViewManager").refresh();
	},
	
	//操作列过滤时触发
	onRowSetFilter:function() {
		this.managers.get("ViewManager").refresh();
	},
	
	//grid绑定的datastore的统计信息发生变化时触发
	onStatisticChanged:function(){
		var viewManager=this.managers.get("ViewManager");
		viewManager.renderLockedRow();
	},

    //grid排序后触发
	onSorted:function(){
		var viewManager=this.managers.get("ViewManager");
		dojo.forEach(viewManager.views,function(view){
			!view.isRowBar&&view.renderHeader();
		})
		viewManager.refreshPage();
		
	},
	
	//发布消息
	publish : function(topic,args){
		var topics = this._topics || (this._topics = []);
		dojo.forEach(topics[topic] || [],function(method){
			method.apply(null,args || []);
		});
	},
	//订阅消息
	subscribe : function(topic,context,method){
		topic = topic.split(".");
		var id = topic[1] || "";
		topic = topic[0];
		var topics = this._topics || (this._topics = []);
		var listener = topics[topic] || (topics[topic] = []);
		function fn(){
			(dojo.isFunction(method) && method || context[method]).apply(context,arguments);
		}
		fn.id = id;
		listener.push(fn);
	},
	//取消订阅
	unsubscribe : function(topic){
		/**
		 * grid.unsubscribe("headerClick.uniqid");
		 */
		topic = topic.split(".");
		var id = topic[1] || "";
		topic = topic[0];
		var topics = this._topics || (this.grid._topics = []);
		if(null==id){
			delete topics[topic];
			return;
		}
		var listener = topics[topic] || [];
		for(var i=listener.length-1,fn;fn =listener[i];i--){
			if(fn.id==id){
				listener.splice(i,1);
			}
		}
	},
	//用于grid个性化保存获取原始ID
	getOriId:function(){
		if(this._rootID != null){
			var len = this._rootID.length;
			var len2 = this.id.length;
			return this.id.substring(len);
		}
		return this.id;
	}
});
