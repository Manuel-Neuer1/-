if(!dojo._hasResource["unieapx.query.AdvancedQuery"]){ 
dojo._hasResource["unieapx.query.AdvancedQuery"] = true;
dojo.provide("unieapx.query.AdvancedQuery");
dojo.require("unieap.util.util");
dojo.require("unieap.form.Button");
dojo.require("unieap.dialog.MessageBox");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("unieap.form.DateTextBox");
dojo.require("unieap.form.ComboBox");
dojo.require("unieap.form.CheckBox");
dojo.require("unieap.form.NumberTextBox");
dojo.require("unieap.ds");
dojo.declare(
	"unieapx.query.AdvancedQuery",
	[dijit._Widget, dijit._Templated],
{
	templateString:		
			"<div style=\"margin-left: 8px;\">"+
			"<table style=\"table-layout:fixed;\" dojoAttachPoint=\"tableNode\" cellSpacing=\"0\">"+
				"<colgroup>" +
				"	<col width='85%'></col>" +
				"	<col width='15%'></col>" +
				"</colgroup>" +
					"<tbody dojoAttachPoint=\"tbodyNode\">" +
					"<tr height='25px'>" +
					"	<td valign='top'  dojoAttachPoint=\"paneConditionNode\" style=\"position:relative\">" +
					"	</td>" +
					"	<td>" +
					"	</td>" +
					"</tr>" +
					"<tr>" +
					"	<td valign='top' dojoAttachPoint=\"paneConditionGridNode\"></td>" +
					"	<td valign='top' dojoAttachPoint=\"paneToolBarNode\"></td>" +
					"</tr>" +
					"<tr>" +
					"	<td colSpan='1' valign='top' dojoAttachPoint=\"paneQueryNode\"></td>" +
					"</tr>" +
					"</tbody>" +
			"</table>" +
			"</div>",
			
	
	/**
	 * @summary: 查询条件设置。
	 * @type: {Object}
	 * @example: |<div dojoType="unieap.query.AdvanceQuery"
	 *           config="{'name':{store:'codeListStore',displayAttr:'NAME',valueAttr:'VALUE',dataType:'string'}}"> |</div>
	 *           上述代码表示: 对查询条件进行详细配置
	 * @default: null
	 */
	config:null,
	
	
	/**
	 * @summary: 查询结果集绑定目标对象ID值。
	 * @type: {string}
	 * @example: |<div dojoType="unieap.query.AdvanceQuery"
	 *           target="queryResultGridId"> |</div> 上述代码表示:
	 *           点击查询按钮时，会将查询结果集绑定到id为queryResultGridId的组件上。
	 * @default: ""
	 */	
	target:"",
	
	label:"",
	
	/**
	 * @summary: 是否显示“查询”按钮。
	 * @description: 如果为true表示显示，false表示不显示，默认值为true。
	 * @type: {boolean}
	 * @example: |<div dojoType="unieap.query.AdvanceQuery"
	 *           showQueryWigdet="false"> |</div> 上述代码表示: 页面不会显示“查询”按钮。
	 * @default: true
	 */
	showQueryToolBar:true,
	
	
	/**
	 * @summary: 查询结果集绑定目标组件每页记录数，默认值为0，表示读取系统分页常数值。 如果为-1，表示只有一页记录数。
	 * @type: {number}
	 * @example: |<div dojoType="unieap.query.AdvanceQuery" pageSize="16"> |</div>
	 *           上述代码表示: 目标组件每页记录数为16。
	 * @default: 10
	 */	
	pageSize:10,
	
	/**
	 * @summary: 查询组件宽度
	 * @type: {number}
	 * @example: |<div dojoType="unieap.query.AdvanceQuery" width="80%"> |</div>
	 *           上述代码表示: 目标组件每页记录数为16。
	 * @default: 10
	 */	
	width:"100%",
	
	/**
	 * @summary: 查询组件高度
	 * @type: {number}
	 * @example: |<div dojoType="unieap.query.AdvanceQuery" height="80%"> |</div>
	 *           上述代码表示: 目标组件每页记录数为16。
	 * @default: 10
	 */	
	height:"200px",
	
	/**
	 * @summary: 查询对象类路径
	 * @type: {number}
	 * @example: |<div dojoType="unieap.query.AdvanceQuery" entityClass="com.neusoft.unieap.User"> |</div>
	 *           上述代码表示: 目标组件每页记录数为16。
	 * @default: 10
	 */
	saveEnable:false,
	
	//自动注入dataCenter
	Autowired : "dataCenter",
	
	entityClass:"",
	
	_queryGrid:null,
	
	_queryItem:null,
	
	_operator:null,
	
	_valueWidget:null,
	
	_historyConditions:[],
	
	_dataCenter:null,
	
	_queryStore:"_advancedQueryConditionStore",
	
	// 查询组件查询条件实体名称。
	_rowsetName : "com.neusoft.unieap.techcomp.ria.common.query.dto.Condition",
	
	// 整型条件类型提示信息。
	_integerMsg:RIA_UNIEAPX_I18N.query.integerPrompt,
	
	// 控件宽度
	_widgetWidth:"100%",
	
	// 查询条件Store
	_conditionStore:"object",
	
	// 存储查询条件及查询结果的DataCenter。
	_conditionDataCenter: new unieap.ds.DataCenter(),
	
	_queryResultStoreName:'_queryResultStore',
	
	_dataFormat:"yyyy-MM-dd",
	
	_operators:{'M':RIA_UNIEAPX_I18N.query.stringMatch,
		"LM":RIA_UNIEAPX_I18N.query.stringLeftMatch,
		"RM":RIA_UNIEAPX_I18N.query.stringRigthMatch,
		"NM":RIA_UNIEAPX_I18N.query.stringNotMatch,
		"NLM":RIA_UNIEAPX_I18N.query.stringLeftNotMatch,
		"NRM":RIA_UNIEAPX_I18N.query.stringRightNotMatch,
		"E":RIA_UNIEAPX_I18N.query.numberEquals,
		"NE":RIA_UNIEAPX_I18N.query.numberNotEquals,
		"G":RIA_UNIEAPX_I18N.query.numberGreaterThan,
		"S":RIA_UNIEAPX_I18N.query.numberLessThan,
		"GE":RIA_UNIEAPX_I18N.query.numberGreaterThanOrEquals,
		"SE":RIA_UNIEAPX_I18N.query.numberLessThanOrEquals
	},
	
	postCreate:function(){
		this._dataCenter = this.dataCenter || dataCenter;
		this._createContioner();
		this._createControls();
	},
	
	setEntityClass:function(entityClass){
		this.entityClass = entityClass;
	},
	
	setPageSize:function(pageSize){
		this.pageSize = pageSize;
	},
	getPageSize:function(){
		return this.pageSize;
	},
	setLabel:function(label){
		this.label = label;
	},
	getLabel:function(){
		return this.label;
	},
	setConfig:function(config){
		this.config = config;
		// 初始化数据:查询项
		var columnBoxStore = this._configQueryItemStore();
		var dataProvider = this._queryItem.getDataProvider();
		dataProvider.setDataStore(columnBoxStore);
		// 选中下拉框第一项
		var items = dataProvider.getItems();
		if(items != null && items.length > 0 ){
			if(unieap.widget.form.comboShowSelect){
				this._queryItem.setValue(items[1].CODEVALUE);
			}else{
				this._queryItem.setValue(items[0].CODEVALUE);
			}
		}
	},
	getConfig:function(){
		return this.config;
	},
	getConditionStore:function(){
		return this._conditionDataCenter.getDataStore(this._queryStore);
	},
	setConditionStore:function(ds){
		if(ds == null || ds.getRowSet() == null){
			return;
		}
		var conditonDS = new unieap.ds.DataStore();
		conditonDS.setRowSetName(ds.getRowSetName());
		for(var i = 0 ; i < ds.getRowSet().getRowCount(); i++){
			var row = ds.getRowSet().getRow(i);
			// ---将具体数值转换为代码------------------
			var col = row.getItemValue('column');
			var op = row.getItemValue('operation');
			var valCode = row.getItemValue('value');
			var valText = valCode;
			var dataType = row.getItemValue('dataType');
			for(var key in this._operators){
				if(this._operators[key] === op){
					break;
				}
			}
			if(dataType === unieap.DATATYPES.DATE){
				valText = this._format(valCode);
			}
			//code转换
			if(this.config[col] != null){
				var storeName = this.config[col].store;
				var displayAttr = this.config[col].displayAttr;
				if(displayAttr == null || displayAttr === ""){
					displayAttr = 'CODENAME';
				}
				var valueAttr = this.config[col].valueAttr;
				if(valueAttr == null || displayAttr === ""){
					valueAttr = 'CODEVALUE';
				}
				if(storeName!= null){
					//-----------
					var codeName = valCode;
					var store = unieap.getDataStore(storeName,this._dataCenter,true);
					if(!store){
						store = unieap.Action.getCodeList(storeName);
					}
					if(store){
						var count = store.getRowSet().getRowCount();
						for(var h = 0 ; h < count; h++){
							var codeValue = store.getRowSet().getRow(h).getItemValue(valueAttr);
							if(codeValue === valCode){
								codeName = store.getRowSet().getRow(h).getItemValue(displayAttr);
								break;
							}
						}
					}
					//-----------
					valText = codeName;
				}
			}
			var rowData = this._getTransformToDisplay(col,op,valText,valCode);
			conditonDS.getRowSet().addRow(rowData);
		}
		this._conditionDataCenter.addDataStore(this._queryStore,conditonDS);
		this._queryGrid.getBinding().setDataStore(conditonDS);
	},
   	/**
	 * @summary: 执行查询后处理查询结果事件。
	 * @example: |<div dojoType="unieap.query.AdvanceQuery"
	 *           onComplete="customOnComplete"> |</div> |function
	 *           customOnComplete(dc){ | //... |}
	 */
	onComplete:function(dc) {
		return;
	},
	
	/**
	 * @summary: 执行查询后渲染目标组件事件。
	 * @example: |<div dojoType="unieap.query.AdvanceQuery"
	 *           onRenderTarget="customonRenderTarget"> |</div> |function
	 *           onRenderTarget(ds){ | //... |}
	 */
	onRenderTarget:function(resultStore){
   		// 将结果集绑定到目标组件上
		if (this.target) {
   			var widget = unieap.byId(this.target);
   			if(widget){
   				widget.getBinding().setDataStore(resultStore);
   			}
		}
	},
	
	
  	/**
	 * @summary: 按条件进行数据查询。
	 * @example: |var queryObj=unieap.byId('queryId'); |queryObj.query();
	 */
	query:function(){
		// 重新查询查询时，将翻页记录置回第一页
		if (this.target) {
   			var widget = unieap.byId(this.target);
   			var resultStore = null;
   			if(widget){
   				resultStore = widget.getBinding().getDataStore();
   			}
   			if(resultStore){
   				resultStore.setPageNumber(1);
   			}
		}
		// 准备查询条件
		var store = this._queryGrid.getBinding().getDataStore();
		var conditionDS = this._transformCondition(store);
		// 执行查询
   		if(conditionDS){
   			this._conditionDataCenter.addDataStore(this._queryStore,conditionDS);
   			this._dataCenter.addDataStore("_advancedQueryConditionStore",conditionDS);
   			this.doQuery(conditionDS,this.onComplete);
   		}
	},
	
	/**
	 * @summary: 执行查询事件实现，可以通过覆盖此方法实现自定义查询。
	 * @example: |<div dojoType="unieap.query.AdvanceQuery"
	 *           doQuery="customDoQuery"> |</div> |function
	 *           customDoQuery(queryStore,onComplete){ | //... |}
	 */
	doQuery:function(queryStore,onComplete){
		// 准备target绑定的DataStore
		var resultStore = null;
   		if (this.target) {
   			var widget = unieap.byId(this.target);
   			if(widget){
   				resultStore = widget.getBinding().getDataStore();
   			}
		}
   		if(!resultStore)
   			resultStore = new unieap.ds.DataStore(this._queryResultStoreName);
   		// 设置目标每页记录数
   		resultStore.setPageSize(this.pageSize);
		// 根据查询条件执行查询
   		var resultDataStore = this._queryResultDataStore(queryStore , resultStore);
	},
	
	/**
	 * @summary 根据查询条件与查询结果集返回查询结果数据。
	 */
   	_queryResultDataStore:function(queryStore , resultStore){
   		// 如果没有配置entityClass属性，则从store中取得实体class。
		var rowSetName = this.entityClass;
		if(rowSetName === ""){
			rowSetName = resultStore.getRowSetName();
		}
   		var paramDC = new unieap.ds.DataCenter();
   		paramDC.addDataStore(queryStore);
   		paramDC.addDataStore(this._queryResultStoreName,resultStore);
   		var dc = new unieap.ds.DataCenter();
   		var _this = this;
   		if(this.target){
   			var widget = unieap.byId(this.target);
   			widget.getBinding().rpc = function(store,load){
   	   			var dc = new unieap.ds.DataCenter();
   	   			dc.addDataStore(store);
   	   			dc.addDataStore(this._dataCenter.getDataStore("_advancedQueryConditionStore"));
   	   			dc.addParameter("_entityClass",name);
   	   			var path =unieap.WEB_APP_NAME + "/techcomp/ria/queryAction!doQuery.action";
   	   			if(store){
   	   				var name = store.getRowSetName();
   	   			}
   	   			unieap.Action.requestData({
   	   				url:path,
   	   				sync:false,
   	   				load:function(dc){
   	   					load&&load(dc);
   	   				},
   	   				error:function(e){
   	   					throw new Error(e);
   	   				}
   	   			},dc);
   	   		};
   		}
   		this.doQueryRequestData(paramDC,rowSetName,this._queryResultStoreName,this._queryStore,dc,_this);
   	},
	/**
	 * @summary: 查询请求
	 */
	doQueryRequestData:function(paramDC,rowSetName,queryResultStoreName,queryStore,retDc,_this){
   		var path =unieap.WEB_APP_NAME + "/techcomp/ria/queryAction!doQuery.action";
		var dc = unieap.Action.requestData({
			url:path,
			parameters:
				{
					"_entityClass":rowSetName
				},
			sync:false,
			load:function(dc){
				var ds = dc.getSingleDataStore();
				if(ds){
					var name = ds.getName();
					var timeStamp = dc.getParameter(name);
					unieap.setDataStore(ds,this._dataCenter,true,timeStamp);
					_this.onRenderTarget(ds);
			   		_this._conditionDataCenter.addDataStore(ds);
			   		// 执行回调方法
					_this.onComplete(_this._conditionDataCenter);
				}
			},
			error:function(e){
				throw new Error(e);
			}
		},paramDC);
   	},
	
   	/**
	 * @summary: 设置目标组件ID值。
	 * @example: |var queryObj=unieap.byId('queryId');
	 *           |queryObj.setTarget("targetId");
	 */
   	setTarget:function(target) {
   		this.target = target;
   	},
   	/**
	 * @summary: 获取目标组件ID值。
	 * @example: |var queryObj=unieap.byId('queryId'); |queryObj.getTarget();
	 */
   	getTarget:function() {
   		return this.target;
   	},
   	
   	_createContioner:function(){
   		var contioner = new unieap.layout.AdaptiveContainer();
   		contioner.setHeight(this.height);
   	},
	_createControls:function(){
   		dojo.style(this.tableNode,"width",this.width);
		this._createQueryFormPane();
		this._createConditionGridPane();
		this._createToolBarPane();
		if(this.showQueryToolBar === true){
			this._createQueryBarPane();
		}
	},
	_createQueryFormPane:function(){
		// ----------创建设置查询项布局-----------------
		var conditionTable = 
			"<table height='100%' width=\"100%\" style=\"table-layout: fixed;\" cellSpacing=\"0\" >" +
				"<colgroup>" +
				"	<col width='8%'></col>" +
				"	<col width='22%'></col>" +
				"	<col width='8%'></col>" +
				"	<col width='22%'></col>" +
				"	<col width='8%'></col>" +
				"	<col width='22%'></col>" +
				"</colgroup>" +
				"<tbody>" +
				"<tr height='25px'>" +
						"<td></td>" +
						"<td></td>" +
						"<td></td>" +
						"<td></td>" +
						"<td></td>" +
						"<td></td>"+
					"</tr>" +
				"</tbody>"+
			"</table>";
		this.paneConditionNode.innerHTML = conditionTable;
		dojo.parser.parse(this.paneConditionNode);
		var table = this.paneConditionNode.firstChild;
		var row = table.rows[0];
		// 创建查询项输入域
		var cell = row.cells[0];
		var label = document.createElement("label");
		label.setAttribute("width",'100%');
		label.innerHTML = RIA_UNIEAPX_I18N.query.queryItem;
		cell.appendChild(label);
		cell = row.cells[1];
		var valueWidget = new unieap.form.ComboBox({required:true});
		this._queryItem = valueWidget;
		var popup = this._queryItem.getPopup();
		popup.height = 110;
		popup.displayStyle ="list";
		this._queryItem.setWidth("100%");
		// 初始化数据
		var columnBoxStore = this._configQueryItemStore();
		var dataProvider = this._queryItem.getDataProvider();
		dataProvider.setDataStore(columnBoxStore);
		// 选中下拉框第一项
		var items = dataProvider.getItems();
		if(items != null && items.length > 0){
			if(unieap.widget.form.comboShowSelect){
				this._queryItem.setValue(items[1].CODEVALUE);
			}else{
				this._queryItem.setValue(items[0].CODEVALUE);
			}
		}
		cell.appendChild(this._queryItem.domNode);
		var _this = this;
		dojo.connect(this._queryItem,"onChange",function(){_this._columnBoxOnChange(_this._queryItem)});
		// 创建操作输入域
		cell = row.cells[2];
		var label = document.createElement("label");
		label.setAttribute("width",'100%');
		label.innerHTML = RIA_UNIEAPX_I18N.query.operation;
		cell.appendChild(label);
		cell = row.cells[3];
		valueWidget = new unieap.form.ComboBox({required:true});
		
		// 初始化数据
		var dataProvider = valueWidget.getDataProvider();
		dataProvider.setDataStore(this._construtStringDataStore());
		valueWidget.setWidth("100%");
		this._operationWidget = valueWidget;
		this._operationWidget.getPopup().height = 110;
		this._operationWidget.getPopup().displayStyle ="list";
		// 选中下拉框第一项
		var items = dataProvider.getItems();
		if(items != null && items.length > 0){
			if(unieap.widget.form.comboShowSelect){
				this._operationWidget.setValue(items[1].CODEVALUE);
			}else{
				this._operationWidget.setValue(items[0].CODEVALUE);
			}
		}
		cell.appendChild(this._operationWidget.domNode);
		// 创建值输入域
		cell = row.cells[4];
		var label = document.createElement("label");
		label.setAttribute("width",'100%');
		label.innerHTML = RIA_UNIEAPX_I18N.query.value;
		cell.appendChild(label);
		cell = row.cells[5];
		valueWidget = new unieap.form.TextBox({required:true});
		valueWidget.setWidth("100%");
		this._valueWidget = valueWidget;
		cell.appendChild(valueWidget.domNode);
		//支持持久化条件
//		var width = this.paneConditionNode.getAttribute("clientWidth");
//		if(width == null || width < 18){
//			dojo.style(table,'width','95%');
//		}else{
//			dojo.style(table,'width',(width - 18));
//		}
		if(this.saveEnable == true){
			dojo.style(table,'width','95%');
			if(!this.menuNode){
				this.menuNode=dojo.create('div','',this.paneConditionNode,'first');
				dojo.addClass(this.menuNode,'queryMenuTop');
				dojo.connect(this.menuNode,'onclick',this,'menuward');
			}
			dojo.style(this.menuNode,'display','block');
		}
	},
	
	menuward:function(e){
		dojo.require("unieap.menu.Menu");
		if(this.menu == null || this.menu == undefined){
			this._doQueryHistoryCondition();
			if(this.menu != null && this.menu != undefined){
				this.menu.startup();
				this.menu._openMyself(e);
			}
		}else{
			if((this.menuItems && this.menuItems.length ==0)||this.menu == undefined){
					MessageBox.alert({
//						message : "无历史查询条件。" // MODIFY BY TENGYF
		   				message : RIA_UNIEAPX_I18N.query.noHistoryCondition
		   			});
			}else{
				this.updateMenu(this.menuItems);
				this.menu.startup();
				this.menu._openMyself(e);
			}
		}
	},
	
	_doQueryHistoryCondition:function(){
		var viewcontext = unieap.Action.getViewContext(this);
		if(viewcontext && viewcontext != null){
			var viewId = viewcontext.context;
		}else{
			var viewId = "";
		}
		var controlId = this._getId();
		var _this = this; 
   		var paramDC = new unieap.ds.DataCenter();
   		var dc = new unieap.ds.DataCenter();
   		var path =unieap.WEB_APP_NAME + "/techcomp/ria/queryAction!doQueryHistoryConditions.action";
   		paramDC.addParameter("_viewId",viewId);
   		paramDC.addParameter("_controlId",controlId);
   		paramDC.addParameter("_queryLabel",_this.getLabel());
		var dc = unieap.Action.requestData({
			url:path,
			sync:true,
			load:function(dc){
  				var ds = dc.getSingleDataStore();
  				if(ds != null && ds.getRowSet() != null){
  					_this.menuItems = ds.getRowSet().getData(unieap.ds.Buffer.PRIMARY);
  					if(_this.menuItems && _this.menuItems.length ==0){
  						MessageBox.alert({
//  			   			message : "无历史查询条件。"
  			   				message : RIA_UNIEAPX_I18N.query.noHistoryCondition
  			   			});
  					}else{
  						_this.updateMenu(_this.menuItems);
  					}
  				}
	
			},
			error:function(e){
				throw new Error(e);
			}
		},paramDC);
	},
	
	_getId:function(){
		var controlId = this._rootID == null ? this.id : this.id.substr((this.id.lastIndexOf(this._rootID)==-1?0:this.id.lastIndexOf(this._rootID))+this._rootID.length,this.id.length);
		return controlId;
	},
	
	updateMenu:function(menuItems){
		if(!this.menu){
			this.menu=new unieap.menu.Menu({});
		}
		this.menu.destroy();
		this.menu=new unieap.menu.Menu({});
		
		var _this = this;
		var getFun = function (child){
			return function(){
				//加入条件
				var cs = child['condition'];
				if(cs != ""){
					var json = dojo.fromJson(cs);
					var ds = new unieap.ds.DataStore();
					var rowset = new unieap.ds.RowSet(json);
					ds.setRowSet(rowset);
					ds.setRowSetName(_this._rowsetName);
					_this.setConditionStore(ds);
				}
			}	
		}
		if(menuItems == undefined || menuItems == null){
			return;
		}
		var item,childMenu;
		if(menuItems.length < 6){
			for(var l=menuItems.length,i=0;i<l;i++){
				var child=menuItems[i];
				var name = child['name'];
				var f=getFun(child);
				var menuItem = new unieap.menu.MenuItem({
					label:name,
					onClick:f
				});
				var deleteNode=dojo.create('div',{'class':'query-delete'},menuItem.arrowCell.firstChild,'first');
				dojo.style(menuItem.arrowCell.firstChild,"display","inline");
				deleteNode.deleteNodeIndex = i;
				dojo.connect(deleteNode,'onclick',this,"_deleteMenu");
				this.menu.addChild(menuItem);
			}
		}else{
			for(var l=menuItems.length,i=0;i<l;i++){
				if((i)%5==0){
					var itemLabel="Items "+(i+1)+"--"+(i+5);
					if(i+5>=l){
						itemLabel="Items "+(i+1)+"--"+(l)
					}
					childMenu=new unieap.menu.Menu();
					item=new  unieap.menu.PopupMenuItem({
						popup:childMenu,
						label:itemLabel,
						popupDelay:50
					});
					this.menu.addChild(item);
				}
				var child=menuItems[i];
				var t=child['name'];
				var f=getFun(child);
				var menuItem = new unieap.menu.MenuItem({
					label:t,
					onClick:f
				});
				childMenu.addChild(menuItem);
				var deleteNode=dojo.create('div',{'class':'query-delete'},menuItem.arrowCell.firstChild,'first');
				dojo.style(menuItem.arrowCell.firstChild,"display","inline");
				deleteNode.deleteNodeIndex = i;
				dojo.connect(deleteNode,'onclick',this,"_deleteMenu");
			}
		}
	},
	
	_deleteMenu:function(e){
		var node = e.srcElement || e.target;
		var index = node.deleteNodeIndex;
		dojo.stopEvent(e);
		var _this = this;
		MessageBox.confirm({
//			message:"是否确认删除？",
			message:RIA_UNIEAPX_I18N.query.confirmDelete,
			onComplete: function(value){
			   	if(value){
			   		if(index != undefined ){
			   			_this._deleteHistoryCondition(index);
			   		}
			   	}
			},
			iconCloseComplete:true
		});
	},
	
	_deleteHistoryCondition :function(index){
		var hcon = this.menuItems[index];
		if(hcon){
			var advancedConditionId = hcon['id'];
			var paramDC = new unieap.ds.DataCenter();
			var dc = new unieap.ds.DataCenter();
			var path =unieap.WEB_APP_NAME + "/techcomp/ria/queryAction!doDelete.action";
			paramDC.addParameter("_advancedConditionId",advancedConditionId);
			var _this = this;
			var dc = unieap.Action.requestData({
				url:path,
				sync:true,
				load:function(dc){
				_this._deleteHistoryConditionLoad(index);
			},
			error:function(e){
				throw new Error(e);
			}
			},paramDC);
		}
		
	},
	
	_deleteHistoryConditionLoad:function(index){
		if(this.menuItems.length <6){
			this.menu.getChildren()[index].destroy();
		}else{
			var popIndex = Math.floor(index/5);
			var popItem = this.menu.getChildren()[popIndex];
			var children = popItem.popup.getChildren();
			var menuIndex = index%5;
			var menu = children[menuIndex];
			if(menu){
				menu.destroy();
			}
		}
		this.menuItems.splice(index,1);
	},
	
	
	
	_createConditionGridPane:function(){
		// 是否显示行号
		var vm = {rowNumber: true}; 
		// 锁定列数据
		var fixedColumns=[];
		// 非锁定列数据
		var columns=[
	 		{label: RIA_UNIEAPX_I18N.query.queryItem,name: "column",width: "30%"},
			{label: RIA_UNIEAPX_I18N.query.operation,name: "operator",width: "30%"},
			{label: RIA_UNIEAPX_I18N.query.value,name : "value",width : "30%"}
		]
		var fixed={noscroll: true,rows:[fixedColumns]};
		var header={rows:[columns]}
		var layout = [fixed, header];
		var gridHeight = String(this.height);
		gridHeight = (gridHeight.indexOf("%") < 0 ? parseInt(gridHeight, 10) : gridHeight) - 50; //上下边框占位3象素
		// 数据绑定
		var binding = {store:'advancedQueryStore'};
		var decoder = {};
		this._queryGrid = new unieap.grid.Grid({
			views: vm,
			layout: {structure:layout},
			width: "100%",
			height: gridHeight
		});
		// 设置grid绑定的数据集
		var conditionStore = new unieap.ds.DataStore();
		conditionStore.setRowSetName(this._rowsetName);
		this._queryGrid.getBinding().setDataStore(conditionStore);
		this._conditionStore = new unieap.ds.DataStore();
		// 设置grid的选择类型
		this._queryGrid.getManager("SelectionManager").setSelectType("single");
		// 绑定grid选择事件
		var _this = this;
		dojo.connect(this._queryGrid.getManager("SelectionManager"),"onAfterSelect",this,function(){_this._onAfterSelectGridRow(this._queryItem)});
		this.paneConditionGridNode.appendChild(this._queryGrid.domNode);
	},
	_createQueryBarPane:function(){
		// ----------创建QueryBar布局-----------------
		var toolbarTable = 
			"<table width='100%'  style=\"table-layout:fixed;\" cellSpacing=\"0\" >" +
				"<colgroup>" +
				"	<col width=\"30%\"></col>" +
				"	<col width=\"30%\"></col>" +
				"	<col width=\"20%\"></col>" +
				"	<col width=\"20%\"></col>" +
				"</colgroup>" +
				"<tbody>" +
				"<tr height='25px'>" +
				"	<td></td>" +
				"	<td></td>" +
				"	<td></td>" +
				"	<td></td>" +
				"</tr>" +
				"</tbody>" +
			"</table>";
		this.paneQueryNode.innerHTML = toolbarTable;
		dojo.parser.parse(this.paneQueryNode);
		// ----------动态创建toolBar-----------------
		var table = this.paneQueryNode.firstChild;
		var rowBar = table.rows[0];
		// 创建查询按钮
		var queryCell = rowBar.cells[1];
		var queryButton = new unieap.form.Button();
		queryButton.setLabel(RIA_UNIEAPX_I18N.query.queryLabel);
		queryButton.setWidth("70px");
		queryButton.setIconClass("find-icon");
		queryCell.appendChild(queryButton.domNode);
		dojo.connect(queryButton,"onClick",this,this.query)
		// 创建关闭按钮
		var closeCell = rowBar.cells[2];
		var closeButton = new unieap.form.Button();
		closeButton.setLabel(RIA_UNIEAPX_I18N.query.closeLabel);
		closeButton.setWidth("70px");
		closeButton.setIconClass("query-close");
		closeCell.appendChild(closeButton.domNode);
		dojo.connect(closeButton,"onClick",this,this._doClose)
	},
	_doClose:function(){
		var dialog = unieap.getDialog()== null? unieap.getXDialog():unieap.getDialog();
		if(dialog !=null){
			dialog.close(false);
		}
	},
	_createToolBarPane:function(){
		// ----------创建toolBar布局-----------------
		var toolbarTable = "<table width='100%' style=\"table-layout:fixed;\">" +
		"<colgroup><col width='100%'></col></colgroup>" +
		"<tbody>" +
		"	<tr height='0px'><td align='center' valign='top'></td></tr >" +
		"	<tr height='30px'><td align='center' valign='top'></td>	</tr>" +
		"	<tr height='30px'><td align='center' valign='top'></td>	</tr>" +
		"	<tr height='30px'><td align='center' valign='top'></td>	</tr>" +
		"	<tr height='30px'><td align='center' valign='top'></td></tr>" +
		"</tbody>" +
		"</table>";
		this.paneToolBarNode.innerHTML = toolbarTable;
		dojo.parser.parse(this.paneToolBarNode);
		// ----------动态创建toolBar-----------------
		var table = this.paneToolBarNode.firstChild;
		// 创建新增按钮
		var addRow = table.rows[1];
		var addCell = addRow.cells[0];
		var addButton = new unieap.form.Button();
		addButton.setLabel(RIA_UNIEAPX_I18N.query.addLabel);
		addButton.setWidth("70px");
		addButton.setIconClass('query-add');
		var className = addButton.domNode.className;
		addCell.appendChild(addButton.domNode);
		dojo.connect(addButton,"onClick",this,this._addNewRowOnClick);
		// 创建修改按钮
//		var modifyRow = table.rows[2];
//		var modifyCell = modifyRow.cells[0];
//		var modifyButton = new unieap.form.Button();
//		modifyButton.setLabel(RIA_UNIEAPX_I18N.query.modifyLabel);
//		modifyButton.setWidth("70px");
//		modifyButton.setIconClass("query-editor");
//		modifyCell.appendChild(modifyButton.domNode);
//		dojo.connect(modifyButton,"onClick",this,this._modifyRowOnClick);
		// 创建删除按钮
		var deleteRow = table.rows[2];
//		var deleteRow = table.rows[3];
		var deleteCell = deleteRow.cells[0];
		var deleteButton = new unieap.form.Button();
		deleteButton.setLabel(RIA_UNIEAPX_I18N.query.deleteLabel);
		deleteButton.setWidth("70px");
		deleteButton.setIconClass("query-delete");
		deleteCell.appendChild(deleteButton.domNode);
		dojo.connect(deleteButton,"onClick",this,this._deleteNewRowOnClick);
		// 创建全部清除按钮
		var clearRow = table.rows[3];
//		var clearRow = table.rows[4];
		var clearCell = clearRow.cells[0];
		var clearButton = new unieap.form.Button();
		clearButton.setLabel(RIA_UNIEAPX_I18N.query.clearLabel);
		clearButton.setWidth("70px");
		clearButton.setIconClass("query-clear");
//		clearButton.domNode.className = className+' titlePane-button';
		clearCell.appendChild(clearButton.domNode);
		dojo.connect(clearButton,"onClick",this,this._deleteAllRowOnClick);
		// 创建全部清除按钮
		var saveRows = table.rows[4];
		var saveCell = saveRows.cells[0];
		var saveRowsButton = new unieap.form.Button();
//		saveRowsButton.setLabel("保存");
		saveRowsButton.setLabel(RIA_UNIEAPX_I18N.query.save);
		saveRowsButton.setWidth("70px");
		saveRowsButton.setIconClass("query-save");
		saveCell.appendChild(saveRowsButton.domNode);
		dojo.connect(saveRowsButton,"onClick",this,this._saveRowsOnClick);
		if(this.saveEnable == false){
			dojo.style(saveRowsButton.domNode,"display","none");
		}
	},
	
	_saveRowsOnClick :function(){
		var _this = this;
		var store = _this._queryGrid.getBinding().getDataStore();
		if(store && store.getRowSet() && store.getRowSet().getRowCount()==0){
			MessageBox.alert({
//   			message : "请新增查询条件！"
				message : RIA_UNIEAPX_I18N.query.addSelectConditon
   			});
		}else{
			MessageBox.prompt({
//				title:"输入框",
				title:RIA_UNIEAPX_I18N.query.input,
//				message :"查询条件名称：",
				message :RIA_UNIEAPX_I18N.query.coditionName,
				onComplete: function(value){
				if(value.btn){
					var conditionDS = _this._transformCondition(store);
					if(conditionDS){
						_this.doSave(conditionDS,value.text);
					}
					
				}
			}
			});
		}
	},
	
	/**
	 * @summary: 执行查询事件实现，可以通过覆盖此方法实现自定义查询。
	 * @example: |<div dojoType="unieap.query.AdvanceQuery"
	 *           doQuery="customDoQuery"> |</div> |function
	 *           customDoQuery(queryStore,onComplete){ | //... |}
	 */
	doSave:function(queryStore,text){
		var viewcontext = unieap.Action.getViewContext(this);
		if(viewcontext && viewcontext != null){
			var viewId = viewcontext.context;
		}else{
			var viewId = "undefined";
		}
		var _this = this;
		var name = text;
		if(name === ""){
//			name = "条件";
			name = RIA_UNIEAPX_I18N.query.condition;
		}
		var label = this.getLabel();
		if(label == undefined || label == null || label == ""){
//			var dialog = unieap.getDialog() == null ? unieap.getXDialog():null;
//			if(dialog == null){
//				this.setLabel("");
//			}else{
//				this.setLabel(dialog.getLabel());
//			}
			label = "";
		}
   		var paramDC = new unieap.ds.DataCenter();
   		paramDC.addDataStore(queryStore);
   		var dc = new unieap.ds.DataCenter();
   		paramDC.addParameter("_viewId",viewId);
   		paramDC.addParameter("_conditionName",name);
   		paramDC.addParameter("_controlId",_this._getId());
   		paramDC.addParameter("_queryLabel",_this.getLabel());
   		var path =unieap.WEB_APP_NAME + "/techcomp/ria/queryAction!doSave.action";
		var dc = unieap.Action.requestData({
			url:path,
			sync:false,
			load:function(dc){
  				//菜单增加一项
  				MessageBox.alert({
//	   				message : "保存成功"
  					message : RIA_UNIEAPX_I18N.query.saveSuccess
	   			});
  				var ds = dc.getSingleDataStore();
  				if(ds!=null && ds.getRowSet()!=null && ds.getRowSet().getRowCount() >0){
  					var data = ds.getRowSet().getData(unieap.ds.Buffer.PRIMARY);
  					if(_this.menuItems == undefined || _this.menuItems == null){
  						_this.menuItems = [];
  					}
  					_this.menuItems.push(data[0]);
  				}
			},
			error:function(e){
				throw new Error(e);
			}
		},paramDC);
	},
	
//	_addMenu:function(data){
//		var getFun = function (child){
//			return function(){
//				//加入条件
//				var cs = child['conditionString'];
//				if(cs != ""){
//					var json = dojo.fromJson(cs);
//					var ds = new unieap.ds.DataStore();
//					var rowset = new unieap.ds.RowSet(json);
//					ds.setRowSet(rowset);
//					ds.setRowSetName(_this._rowsetName);
//					_this.setConditionStore(ds);
//				}
//			}	
//		}
//		var l = this.menuItems.length;
//		if(l < 5){
//			var name = data['name'];
//			var f = getFun(data);
//			this.menu.addChild(new unieap.menu.MenuItem({
//				label:name,
//				onClick:f
//			}));
//		}else{
//			var f=getFun(data);
//			var name = data['name'];
//			if(l%5 == 0){
//				var i = l/5;
//				var itemLabel="Items "+(i*5+1)+"--"+(i*5+5);
//				childMenu=new unieap.menu.Menu();
//				item=new  unieap.menu.PopupMenuItem({
//					popup:childMenu,
//					label:itemLabel
//				});
//				this.menu.addChild(item);
//				childMenu.addChild(new unieap.menu.MenuItem({
//					label:t,
//					onClick:f
//				}));
//			}else{
//				var popMenus = menu.getChildren();
//				var childMenu = popMenus[popMenus.length-1];
//				childMenu.addChild(new unieap.menu.MenuItem({
//					label:t,
//					onClick:f
//				}));
//			}
//		}
//	},
	
	clear:function(){
		// 初始化数据:查询项
		var columnBoxStore = this._configQueryItemStore();
		var dataProvider = this._queryItem.getDataProvider();
		dataProvider.setDataStore(columnBoxStore);
		// 选中下拉框第一项
		var items = dataProvider.getItems();
		if(items != null && items.length > 0){
			this._queryItem.setValue(items[0].CODEVALUE);
		}
		this._valueWidget.setValue("");
		this._queryGrid.getBinding().getDataStore().getRowSet().deleteAllRows();
	},
 
	/**
	 * @summary: 准备查询条件
	 */
	_transformCondition:function(store){
		var conditonDS = new unieap.ds.DataStore();
		conditonDS.setName("_advancedQueryConditionStore");
		conditonDS.setRowSetName(store.getRowSetName());
		if(store){
			for(var i = 0 ; i < store.getRowSet().getRowCount(); i++){
				var row = store.getRowSet().getRow(i);
				// ---将具体数值转换为代码------------------
				var col = row.getItemValue('column');
				var op = row.getItemValue('operator');
				var val = row.getItemValue('value');
				var valCode = row.getItemValue('valueCode');
				var colValue = this._getItemValue(this._queryItem,col);
				for(var key in this._operators){
					if(this._operators[key] === op){
						break;
					}
				}
				// 初始化conditionStore
				rowData = {'column':colValue,'operation':key,'dataType':this._getQueryItemDataType(colValue),'value':valCode,'order':this._getQueryItemOrder(colValue)};
				conditonDS.getRowSet().addRow(rowData);
				// ----------------------------------------
			}
		}
		return conditonDS;
	},

   
	// 根据查询数据Store配置查询下拉列表数据。
	_configQueryItemStore:function(){
		var conditionStore = new unieap.ds.DataStore();
		var codename = null;
		var codevalue = null;
		if(this.config != null){
			for(var key in this.config){
				// 查询项配置信息
				itemConfigInfo = this.config[key];
				codeName = itemConfigInfo.label;
				codeValue = key;
				conditionStore.getRowSet().addRow({CODENAME:codeName,CODEVALUE:codeValue});
			}
		}
		return conditionStore;
   		
	},
	// 条件数据下拉列表变化时绑定方法。
	_columnBoxOnChange:function(box){
		this._setConditionAvailable(box);
	},
	// 将条件输入框设置为可用并设置可选的值。
	_setConditionAvailable:function(box){
		var value = this._queryItem.getValue();
		var config = this.config;
		// 获得查询项数据类型
		var dataType = this._getQueryItemDataType(value);
		// 获得查询操作设置
		var conditionDataStore = this._getConditionStoreByType(dataType);
		var conditionBox = this._getConditionWidget(box);
		conditionBox.setDisabled(false);
		var dataProvider = conditionBox.getDataProvider();
		dataProvider.setDataStore(conditionDataStore);
		var items = dataProvider.getItems();
		if(items != null && items.length > 0){
			conditionBox.setValue(items[0].CODEVALUE);
		};
		// 设置查询值控件显示
		this._displayValueWidget(box,dataType,config[value]);
	},
	_getQueryItemDataType:function(key){
		if(this.config != null){
			var itemConfigInfo = this.config[key];
			if(itemConfigInfo === undefined || itemConfigInfo === null){
				return null;
			}
			var dataType = itemConfigInfo.dataType;
			// 默认为String类型
			if(dataType === undefined || dataType === null){
				return 12;
			}
			return dataType;
		}
	},
	_getQueryItemOrder:function(key){
		if(this.config != null){
			var itemConfigInfo = this.config[key];
			if(itemConfigInfo === undefined || itemConfigInfo === null){
				return null;
			}
			var order = itemConfigInfo.order;
			// 默认为String类型
			if(order === undefined || order === null){
				return "";
			}
			return order;
		}
	},
	// 根据单元格对象获取条件编辑下拉列表组件。
	_getConditionWidget:function(box){
		var conditionNode = box.domNode.parentNode.parentNode.cells[3].childNodes[0];
		return dijit.byNode(conditionNode);
	},
	// 根据单元格对象获取条件编辑value组件。
	_getCurrentValueWidget:function(box){
		var conditionNode = box.domNode.parentNode.parentNode.cells[5].childNodes[0];
		return dijit.byNode(conditionNode);
	},
	// 使条件编辑下拉列表组件可用。
	_displayValueWidget:function(box,dataType,itemConfig){
		var widget = this._getValueWidgetByType(dataType,itemConfig);
		this._valueWidget = widget;
		var cell = box.domNode.parentNode.parentNode.cells[5];
		if(cell.childNodes[0]){
			cell.removeChild(cell.childNodes[0]);
		}
		cell.appendChild(widget.domNode);
	},	
	// 根据数据类型获取组件对象。
	_getValueWidgetByType:function(dateType,itemConfig){
		var widget = null;
		if(itemConfig){
			var store = itemConfig.store;
			// 下拉列表和下拉树
			if(store != null && store != ""){
				widget = this._createSelectedWidget(itemConfig);
			}else{
				switch(dateType){
				case unieap.DATATYPES.BIGINT :
					widget = this._createNumberWidget();
					widget.range={allowDecimal:false};
					widget.getValidator().setErrorMsg(this._integerMsg); 
					break;
				case unieap.DATATYPES.BOOLEAN :
					widget = this._createSelectedWidget(itemConfig);
					break;
				case unieap.DATATYPES.DATE :
					widget = this._createDateWidget();
					break;
				case unieap.DATATYPES.DECIMAL :
					widget = this._createNumberWidget();
					break;
				case unieap.DATATYPES.DOUBLE :
					widget = this._createNumberWidget();
					break;
				case unieap.DATATYPES.FLOAT :
					widget = this._createNumberWidget();
					break;
				case unieap.DATATYPES.INTEGER :
					widget = this._createNumberWidget();
					widget.range={allowDecimal:false};
					widget.getValidator().setErrorMsg(this._integerMsg); 
					break;
				case unieap.DATATYPES.LONGVARCHAR :
					widget = this._createStringWidget();
					break;
				case unieap.DATATYPES.NUMERIC :
					widget = this._createNumberWidget();
					break;
				case unieap.DATATYPES.REAL :
					widget = this._createNumberWidget();
					break;
				case unieap.DATATYPES.SMALLINT :
					widget = this._createNumberWidget();
					widget.range={allowDecimal:false};
					widget.getValidator().setErrorMsg(this._integerMsg); 
					break;			
				case unieap.DATATYPES.STRING :
					widget = this._createStringWidget();
					break;
				case unieap.DATATYPES.TIME :
					widget = this._createDateWidget();
					break;		
				case unieap.DATATYPES.TIMESTAMP :
					widget = this._createTimestampWidget();
					break;
				case unieap.DATATYPES.TINYINT :
					widget = this._createNumberWidget();
					widget.range={allowDecimal:false};
					widget.getValidator().setErrorMsg(this._integerMsg); 
					break;
				case unieap.DATATYPES.VARCHAR :
					widget = this._createStringWidget();
					break;
				default :
					widget = this._createStringWidget();
				}
			}
		}else{
			widget = this._createStringWidget();
		}
		return widget;
	},
	// 构造字符类型组件。
	_createStringWidget:function(){
		var widget = new unieap.form.TextBox({trim:true,required:true});
		widget.setWidth(this._widgetWidth);
		return widget;
	},
	// 构造数字类型组件。
	_createNumberWidget:function(){
		var widget = new unieap.form.NumberTextBox({required:true});
		widget.setWidth(this._widgetWidth);
		return widget;
	},
	// 构造下拉列表类型组件。
	_createSelectedWidget:function(itemConfig){
		var dataProvider = {};
		var value = this._queryItem.getValue();
		var dataType = itemConfig.dataType;
		var store = "";
		var ds = new unieap.ds.DataStore('CODE_VAR_STATE',
				[{CODEVALUE: 'true',CODENAME: RIA_UNIEAPX_I18N.query.isTrue},
				 {CODEVALUE: 'false',CODENAME: RIA_UNIEAPX_I18N.query.isFalse}]);
		if(dataType === unieap.DATATYPES.BOOLEAN){
			store = "CODE_VAR_STATE";
			if(!unieap.getDataStore(store)){
				dataCenter.addDataStore(ds);
			}
		}else{
			store = itemConfig.store;
		}
		dataProvider.store = store;
		var decoder = {displayAttr:itemConfig.displayAttr||'CODENAME',valueAttr:itemConfig.valueAttr||'CODEVALUE'};
		var widget = new unieap.form.ComboBox({readOnly:false,dataProvider:dataProvider,decoder:decoder,required:true});
		widget.setWidth(this._widgetWidth);
		widget.getPopup().height = 110;
		widget.getPopup().displayStyle= "list";
//		widget.getDataProvider().setDataStore(ds);
		return widget;
	},
	
	// 构造下拉树类型组件。
	_createComboBoxTreeWidget:function(metadata){
		if(!metadata.config){
			return this._createStringWidget();
		}
		var widget = null;
		// 构造来自代码表中下拉树
		if(metadata.config.treeJson && !metadata.config.treeJson.loader){
			var storeName = metadata.config.treeJson.binding.store;
			var ds = unieap.Action.getCodeList(storeName);
			if(ds){
				this._dataCenter.addDataStore(ds);
			}
			widget = new unieap.form.ComboBoxTree({
				readOnly:metadata.config.readOnly?metadata.config.readOnly:true,
				required:metadata.config.required?metadata.config.required:false,
				dataProvider:metadata.config.dataProvider,
				treeJson:{
					binding:{
						store:storeName,
						id:'ID',
						code:'CODEVALUE',
						label:'CODENAME',
						leaf:'leaf',
						parent:'PARENTID',
						query:{name:'PARENTID',relation:'=',value:'-1'}
					}
				},
					popup:metadata.config.popup,
					expandTree:metadata.config.expandTree
				});
		}else{
			// 构造自定义下拉树
			widget = new unieap.form.ComboBoxTree({
				readOnly:metadata.config.readOnly?metadata.config.readOnly:true,
				required:metadata.config.required?metadata.config.required:false,
				dataProvider:metadata.config.dataProvider,
				treeJson:{
					loader:metadata.config.treeJson?metadata.config.treeJson.loader:metadata.config.treeJson,
					binding:metadata.config.treeJson?metadata.config.treeJson.binding:metadata.config.treeJson
				},
				popup:metadata.config.popup,
				expandTree:metadata.config.expandTree
			});
		}
		widget.setWidth(this._widgetWidth);
		return widget;
	},
	// 构造日期类型组件。
	_createDateWidget:function(){
		var widget = new unieap.form.DateTextBox({required:true});
		widget.setWidth(this._widgetWidth);
		return widget; 
	},
	// 构造Timestamp日期类型组件。
	_createTimestampWidget:function(){
		var widget = new unieap.form.DateTextBox(
				{
					displayFormatter:{dataFormat:this._dataFormat},
					popup:{showsTime:24}
				}
				);
		widget.setWidth(this._widgetWidth);
		return widget; 
	},
	// 根据数据类型获取条件编辑列表数据。
	_getConditionStoreByType:function(dateType){
		var store = null;
		switch(dateType){
			case unieap.DATATYPES.BIGINT :
				store = this._construtNumberDataStore();
				break;
			case unieap.DATATYPES.BOOLEAN :
				store = this._construtBooleanDataStore();
				break;
			case unieap.DATATYPES.DATE :
				store = this._construtNumberDataStore();
				break;
			case unieap.DATATYPES.DECIMAL :
				store = this._construtNumberDataStore();
				break;
			case unieap.DATATYPES.DOUBLE :
				store = this._construtNumberDataStore();
				break;
			case unieap.DATATYPES.FLOAT :
				store = this._construtNumberDataStore();
				break;
			case unieap.DATATYPES.INTEGER :
				store = this._construtNumberDataStore();
				break;
			case unieap.DATATYPES.LONGVARCHAR :
				store = this._construtStringDataStore();
				break;
			case unieap.DATATYPES.NUMERIC :
				store = this._construtNumberDataStore();
				break;
			case unieap.DATATYPES.REAL :
				store = this._construtNumberDataStore();
				break;
			case unieap.DATATYPES.SMALLINT :
				store = this._construtNumberDataStore();
				break;			
			case unieap.DATATYPES.STRING :
				store = this._construtStringDataStore();
				break;
			case unieap.DATATYPES.TIME :
				store = this._construtNumberDataStore();
				break;		
			case unieap.DATATYPES.TIMESTAMP :
				store = this._construtNumberDataStore();
				break;
			case unieap.DATATYPES.TINYINT :
				store = this._construtNumberDataStore();
				break;
			case unieap.DATATYPES.VARCHAR :
				store = this._construtStringDataStore();
				break;																	
			default :
				store = this._construtStringDataStore();
		}
		return store;
	},
	// 构造字符类型列对应条件DataStore。
	_construtStringDataStore:function(){
		var stringDataStore = new unieap.ds.DataStore();
		var rowset = stringDataStore.getRowSet();
		
		rowset.addRow({CODEVALUE:"M",CODENAME:RIA_UNIEAPX_I18N.query.stringMatch});
		rowset.addRow({CODEVALUE:"LM",CODENAME:RIA_UNIEAPX_I18N.query.stringLeftMatch});
		rowset.addRow({CODEVALUE:"RM",CODENAME:RIA_UNIEAPX_I18N.query.stringRigthMatch});
		rowset.addRow({CODEVALUE:"E",CODENAME:RIA_UNIEAPX_I18N.query.numberEquals});
		rowset.addRow({CODEVALUE:"NM",CODENAME:RIA_UNIEAPX_I18N.query.stringNotMatch});
		rowset.addRow({CODEVALUE:"NLM",CODENAME:RIA_UNIEAPX_I18N.query.stringLeftNotMatch});
		rowset.addRow({CODEVALUE:"NRM",CODENAME:RIA_UNIEAPX_I18N.query.stringRightNotMatch});
		rowset.addRow({CODEVALUE:"NE",CODENAME:RIA_UNIEAPX_I18N.query.numberNotEquals});
		return stringDataStore;
	}, 	
	// 构造数字类型列对应条件DataStore。
	_construtNumberDataStore:function(){
		var stringDataStore = new unieap.ds.DataStore();
		var rowset = stringDataStore.getRowSet();
		rowset.addRow({CODEVALUE:"E",CODENAME:RIA_UNIEAPX_I18N.query.numberEquals});
		rowset.addRow({CODEVALUE:"NE",CODENAME:RIA_UNIEAPX_I18N.query.numberNotEquals});
		rowset.addRow({CODEVALUE:"G",CODENAME:RIA_UNIEAPX_I18N.query.numberGreaterThan});
		rowset.addRow({CODEVALUE:"S",CODENAME:RIA_UNIEAPX_I18N.query.numberLessThan});
		rowset.addRow({CODEVALUE:"GE",CODENAME:RIA_UNIEAPX_I18N.query.numberGreaterThanOrEquals});
		rowset.addRow({CODEVALUE:"SE",CODENAME:RIA_UNIEAPX_I18N.query.numberLessThanOrEquals});
		return stringDataStore;
	},
	// 构造布尔类型列对应条件DataStore。
	_construtBooleanDataStore:function(){
		var booleanDataStore = new unieap.ds.DataStore();
		var rowset = booleanDataStore.getRowSet();
		rowset.addRow({CODEVALUE:"E",CODENAME:RIA_UNIEAPX_I18N.query.numberEquals});
		rowset.addRow({CODEVALUE:"NE",CODENAME:RIA_UNIEAPX_I18N.query.numberNotEquals});
		return booleanDataStore;
	},
	// 构造布尔类型列对应条件DataStore。
	_construtBooleanDataStore:function(){
		var booleanDataStore = new unieap.ds.DataStore();
		var rowset = booleanDataStore.getRowSet();
		rowset.addRow({CODEVALUE:"E",CODENAME:RIA_UNIEAPX_I18N.query.numberEquals});
		rowset.addRow({CODEVALUE:"NE",CODENAME:RIA_UNIEAPX_I18N.query.numberNotEquals});
		return booleanDataStore;
	},
	// 校验当前输入条件是否符合规则
	_validateCondition:function(val){
		var queryValid = this._queryItem.getValidator().validate();
		var operationValid = this._operationWidget.getValidator().validate();
		var valueValid = this._valueWidget.getValidator().validate();
		if(!queryValid || !operationValid || !valueValid){
//			dojo.require("unieap.dialog.MessageBox");
//   			MessageBox.alert({
//   				title : RIA_I18N.dialog.messageBox.promptDialog,
//   				type : 'warn',
//   				message : this._integerMsg
//   			});
			return false;
		}
	},
	
	_collectUpdateCondition:function(addOrModify){
		var valueWidget = this._getCurrentValueWidget(this._queryItem);
		this._valueWidget = valueWidget;
		var val = valueWidget.getValue();
		var valText = valueWidget.getText();
		var flag = this._validateCondition(val);
		if(flag === false){
			return null;
		}else{
			var conditionStore = this._queryGrid.getBinding().getDataStore();
			var col = this._queryItem.getValue();
			var colText = this._queryItem.getText();
			var op = this._operationWidget.getValue();
			var count = conditionStore.getRowSet().getRowCount();
			// 判断是否重复
			for(var i = 0 ; i < count; i++){
				var rowData = conditionStore.getRowSet().getRowData(i);
				if(rowData == null){
					continue;
				}
				if(rowData["value"] != valText){
					continue;
				}
				if(rowData["column"] != colText){
					continue;
				}
				if(rowData["operator"] != this._operators[op]){
					continue;
				}
				break;
			}
			if(i === count){
				var rowData = this._getTransformToDisplay(col,op,valText,val);
				return rowData;
			}else{
				if(addOrModify == false){
//					var mes = "不能添加重复条件，请修改查询项的值。";
					var mes = RIA_UNIEAPX_I18N.query.cantAddRepeatConditionDoUpdate;
				}else{
					var mes = RIA_UNIEAPX_I18N.query.notDuplicateConditon;
				}
				dojo.require("unieap.dialog.MessageBox");
	   			MessageBox.alert({
	   				type : 'warn',
	   				message : mes
	   			});
			}
			return null;
		}
	},
	
	_getTransformToDisplay:function(col,op,valText,val){
		var colValue = this._getItemName(this._queryItem,col);
		var opValue = this._operators[op];
		var rowData = {column:colValue,operator:opValue,value:valText,valueCode:val};
		return rowData;
	},
	
	// 增加按钮点击事件绑定方法。
	_addNewRowOnClick:function(){
		var rowData = this._collectUpdateCondition(true);
		if(rowData != null){
			this._queryGrid.getBinding().getDataStore().getRowSet().addRow(rowData);
		}
	},
	_getItemName:function(widget,col){
		var store = widget.getDataProvider().getDataStore();
		if(store){
			var count = store.getRowSet().getRowCount();
			for(var i = 0 ; i < count; i++){
				var codeValue = store.getRowSet().getRow(i).getItemValue('CODEVALUE');
				if(codeValue === col){
					var codeName = store.getRowSet().getRow(i).getItemValue('CODENAME');
					return codeName;
				}
			}
		}
		return "";
	},
	_getItemValue:function(widget,col){
		var store = widget.getDataProvider().getDataStore();
		if(store){
			var count = store.getRowSet().getRowCount();
			for(var i = 0 ; i < count; i++){
				var codeName = store.getRowSet().getRow(i).getItemValue('CODENAME');
				if(codeName === col){
					var codeValue = store.getRowSet().getRow(i).getItemValue('CODEVALUE');
					return codeValue;
				}
			}
		}
		return "";
	},
	_modifyRowOnClick:function(){
		var rowIndexs = this._queryGrid.getManager("SelectionManager").getSelectedRowIndexs();
		if(rowIndexs != null && rowIndexs.length > 0){
			var rowData = this._collectUpdateCondition(false);
			if(rowData != null){
				var rowSet = this._queryGrid.getBinding().getDataStore().getRowSet();
				var row =  rowSet.getRow(rowIndexs[0]);
				for(var key in rowData){
					row.setItemValue(key,rowData[key]);
				}
				rowSet.resetUpdate();
			}
		}else{
   			MessageBox.alert({
   				type : 'warn',
//   			message : "请选择一条。"
   				message : RIA_UNIEAPX_I18N.query.selectOndeData
   			});
		}
	},
	_deleteNewRowOnClick:function(){
		var rowIndexs = this._queryGrid.getManager("SelectionManager").getSelectedRowIndexs();
		if(rowIndexs != null && rowIndexs.length > 0){
			this._queryGrid.getBinding().getDataStore().getRowSet().deleteRow(rowIndexs[0]);
		}else{
   			MessageBox.alert({
   				type : 'warn',
   				message : RIA_UNIEAPX_I18N.query.chooseQueryCondition
   			});
		}
	},
	_deleteAllRowOnClick:function(){
		this._queryGrid.getBinding().getDataStore().getRowSet().deleteAllRows();
	},
	_onAfterSelectGridRow:function(box){
		var rows = this._queryGrid.getManager("SelectionManager").getSelectedRows();
		if(rows != null && rows.length > 0){
			var col = rows[0].getItemValue('column');
			var op = rows[0].getItemValue('operator');
			var val = rows[0].getItemValue('value');
			var valCode = rows[0].getItemValue('valueCode');
			var colValue = this._getItemValue(this._queryItem,col);
			this._queryItem.setValue(colValue);
			this._setConditionAvailable(box);
			for(var key in this._operators){
				if(this._operators[key] === op){
					break;
				}
			}
			this._operationWidget.setValue(key);
			var conditionValue = valCode;
			this._valueWidget.setValue(conditionValue);
		}
	},
	_format: function(value){
		if(!value){
			return value;
		}
        var date = new Date(Number(value));
        return unieap.dateFormat(date.getTime(),this._dataFormat);
    }
});}
