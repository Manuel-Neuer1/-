dojo.provide("unieapx.query.Query");
dojo.require("unieap.ds");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("unieap.layout.ContentPane");
dojo.require("unieap.form.Button");
dojo.require("unieap.form.DateTextBox");
dojo.require("unieap.form.ComboBox");
dojo.require("unieap.form.CheckBox");
dojo.require("unieap.form.NumberTextBox");

dojo.require("unieapx.query.Binding");

dojo.declare("unieapx.query.Query", [dijit._Widget, dijit._Templated], {
	
	/**
	 * @declaredClass:
	 * 		unieapx.query.Query
	 * @summary:
	 * 		查询组件，根据绑定的实体类路径进行数据查询。<br>
	 * 			组件提供动态改变增删查询条件，设置最大条件数及查询前构造查询条件等功能。
	 * @example:
	 * 
	 * |<div dojoType='unieapx.query.Query'
	 * |		id='queryId' 
	 * |		binding="{store:'codeListFieldStore'}" 
	 * |		target="codeListGrid"
	 * |	 	maxDisplayCount="4" 
	 * |	 	pageSize="18"
	 * |		onChangeCondition="changeCodeListQueryHeight"
	 * |	 	buildQueryCondition="customBuilderQueryCondition">
	 * |</div>
	 *
	 */
	
    /**
     * @summary:
     *      查询结果集绑定目标对象ID值。
     * @type:
     *   {string}
     * @example:
     * |<div dojoType="unieapx.query.Query" target="queryResultGridId">
     * |</div>
     * 		上述代码表示:
     * 		点击查询按钮时，会将查询结果集绑定到id为queryResultGridId的组件上。
     * @default:
     *     ""
     */	
	target:"",
	/**
	 * @summary:
	 *     显示最多查询条件行数。
	 * @type:
	 *   {number}
	 * @example:
	 * |<div dojoType="unieapx.query.Query" maxDisplayCount="8">
	 * |</div>
	 * 		上述代码表示:
	 * 		最多可显示8个查询条件。
	 * @default:
	 *     100
	 */	
	maxDisplayCount:100,
    /**
     * @summary:
     *     查询组件绑定数据源。
     * @type:
     *   {Object}
     * @example:
     * |<div dojoType="unieapx.query.Query" binding="{store:'codeListFieldStore'}">
     * |</div>
     * 		上述代码表示:
     * 		查询组件绑定数据源为codeListFieldStore。
     * @default:
     *     null
     */		
	binding:null,
    /**
     * @summary:
     *     显示样式。
     * @type:
     *   {Object}
     * @enum:
	 * 		{{mode:list}|{mode:form,columnCount:3}"}
     * @example:display
     * |<div dojoType="unieapx.query.Query" displayMode="{mode:form,columnCount:3}">
     * |</div>
     * 		上述代码表示:
     * 		页面查询条件采用form方式展现，每行显示3个查询条件。
     * @default:
     *     mode:list
     */		
	displayMode : {mode:'list'},
	
    /**
     * @summary:
     *     默认显示查询条件行数，默认显示1行。
     * @type:
     *   {number}
     * @example:
     * |<div dojoType="unieapx.query.Query" maxDisplayCount="2">
     * |</div>
     * 		上述代码表示:
     * 		页面默认显示两行查询条件。
     * @default:
     *     1
     */		
	displayCount : 1,
	/**
	 * @summary:
	 * 		是否显示“增加”、“删除”图标按钮。
	 * @description:
	 * 		如果为true表示显示，false表示不显示，默认值为true。
	 * @type:
	 * 		{boolean}
	 * @example:
	 * |<div dojoType="unieapx.query.Query" showOperationWigdet="false">
	 * |</div>
	 * 		上述代码表示:
	 * 		页面不会显示“增加”、“删除”图标按钮。
	 * @default:
	 *     true
	 */
	showOperationWigdet:true,
	/**
	 * @summary:
	 * 		是否显示“查询”按钮。
	 * @description:
	 * 		如果为true表示显示，false表示不显示，默认值为true。
	 * @type:
	 * 		{boolean}
	 * @example:
	 * |<div dojoType="unieapx.query.Query" showQueryWigdet="false">
	 * |</div>
	 * 		上述代码表示:
	 * 		页面不会显示“查询”按钮。
	 * @default:
	 *     true
	 */
	showQueryWigdet:true,
	/**
	 * @summary:
	 * 		是否显示“清空”按钮。
	 * @description:
	 * 		如果为true表示显示，false表示不显示，默认值为true。
	 * @type:
	 * 		{boolean}
	 * @example:
	 * |<div dojoType="unieapx.query.Query" showClearWigdet="false">
	 * |</div>
	 * 		上述代码表示:
	 * 		页面不会显示“清空”按钮。
	 * @default:
	 *     true
	 */
	showClearWigdet:true,
	/**
	 * @summary:
	 *     查询结果集绑定目标组件每页记录数，默认值为0，表示读取系统分页常数值。
	 *	   如果为-1，表示只有一页记录数。
	 * @type:
	 *   {number}
	 * @example:
	 * |<div dojoType="unieapx.query.Query" pageSize="16">
	 * |</div>
	 * 		上述代码表示:
	 * 		目标组件每页记录数为16。
	 * @default:
	 *     10
	 */	
	pageSize:10,
	/**
	 * @summary:
	 *     设置查询控件排序条件。
	 *     其形式为sql中的排序条件,即order by后面部分，如"username desc, roleName"。
	 * @type:
	 *   {string}
	 * @example:
	 * |<div dojoType="unieapx.query.Query" order="username desc, roleName">
	 * |</div>
	 * 		上述代码表示:
	 * 		目标组件查询结果按order值（username desc, roleName）进行排序。
	 * @default:
	 *     “”
	 */	
	order:"",
	/**
	 * @summary:
	 *     查询结果集附带查询条件dataStore的名称。<br/>
	 *     约束：queryStore名称不能与绑定的目标Store名称相同，否则将出现错误。
	 * @type:
	 *   {string}
	 * @example:
	 * |<div dojoType="unieapx.query.Query" queryStore="myQueryStore">
	 * |</div>
	 * 		上述代码表示:
	 * 		查询结果集附带查询条件dataStore的名称为myQueryStore，
	 * 		执行查询时，将把myQueryStore中的约束作为默认查询条件。
	 * @default:
	 *   "_queryStore"
	 */		
	queryStore:"_queryStore",
	// 默认查询结果DataStore名称。
	_queryResultStoreName:"_queryResultStore",
	//查询控件内部组件宽度。
	_widgetWidth:"100%",
	//整型条件类型提示信息。
	_integerMsg:RIA_UNIEAPX_I18N.query.integerPrompt,
	//查询组件查询条件实体名称。
	_rowsetName : "com.neusoft.unieap.techcomp.ria.query.dto.Condition",
	//存储查询条件及查询结果的DataCenter。
	_conditionDataCenter: new unieap.ds.DataCenter(),
	//查询条件DataStore对象
	_queryStore:null,
	
	_displayModelForm:'form',
	
    templateString: '<div>'+
						'<TABLE cellPadding="4" class="query_table" cellSpacing="4" dojoAttachPoint="tableNode"><tbody dojoAttachPoint="tbodyNode"></tbody>' +					
						'</TABLE>' +
					'</div>',
	postCreate: function() {
		//从页面dataCenter中获取条件DataStore对象。
		this._createControls();
	},
	reset:function(){
		var length = this.tableNode.rows.length;
		if(length){
			for(var i=0;i<length;i++){
				this.tableNode.deleteRow(0);
			}
		}
		this._createControls();
	},
	_createControls:function(){
		// -form
		if(this.displayMode.mode==this._displayModelForm){
			this._constructFormMode();
		}else{
		//-list
			if(this.displayCount>0){
				for(var i = 0;i < this.displayCount;i++){
					this._insertQueryRow(i);
				}
				if(this.displayCount == 1){
					this._disabledFirstRemoveImage();
				}
			}else{
				this._insertQueryRow(0);
				this._disabledFirstRemoveImage();
			}
		}
		this._initQueryClearDisplay();		
		if(!this.binding)
			return;
		if(!this.binding.store)
			return;
		var bindingStore = unieap.getDataStore(this.binding.store);
		this.getBinding().setDataStore(bindingStore);
	},
	_constructFormMode:function(){
		var metadata = this.getBinding().getDataStore().getMetaData();
		if(!metadata)
			return null;
		var codename = null;
		var codevalue = null;
		var tr  = this.tableNode.insertRow(this.tableNode.rows.length);
		var index = 1;
		var j = 0;
		var disc = this.displayMode.columnCount;
		this.displayMode.columnCount=disc&&disc>0?disc:3;
		for(var i=0;i<metadata.length;i++,index++,j++){
			if(index > this.displayMode.columnCount){
				tr  = this.tableNode.insertRow(this.tableNode.rows.length);
				index = 1;
				j=0;
			}
			codename = metadata[i].label?metadata[i].label:metadata[i].getName();
			var labelTd = tr.insertCell(index + j - 1);
			labelTd.innerHTML = codename+"&nbsp;<b>:</b>&nbsp";
			labelTd.setAttribute('noWrap','true'); 
			dojo.addClass(labelTd,"query_table_label");
			var widgetTd = tr.insertCell(index+j);
			var dataType = metadata[i].getDataType();	
			var valueWidget = this._getValueWidgetByType(dataType,metadata[i]);
			widgetTd.appendChild(valueWidget.domNode);
			//-匹配操作符
			var operation = this._getFormModeOption(dataType);
			valueWidget.queryConfig = {
									   column:metadata[i].getName(),
									   operation:operation,
									   dataType:dataType
								      };
		}
	},
	/**
	 * @summary:
	 * 		按条件进行数据查询。
	 * @example:
	 * |var queryObj=unieap.byId('queryId');
	 * |queryObj.query();
	 */
	query:function(){
		//重新查询查询时，将翻页记录置回第一页
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
		//准备查询条件
   		var queryConditionStore = this._prepareQueryConditionData();
   		if(queryConditionStore){
   			this._conditionDataCenter.addDataStore(this.queryStore,queryConditionStore);
   			this.doQuery(queryConditionStore,this.onComplete);
   		}
	},
	/**
	 * @summary:
	 * 		清空查询条件。
	 * @example:
	 * |var queryObj=unieap.byId('queryId');
	 * |queryObj.clear();
	 */
	clear:function(){
		if(this.displayMode.mode==this._displayModelForm){
			var rowLength = this.tableNode.rows.length -1;
			for(var i=0;i<rowLength;i++){
				var cells = this.tableNode.rows[i].cells;
				for(var j=1;j<cells.length;j=j+2){
					var valueWidget = dijit.byNode(cells[j].childNodes[0]);
					valueWidget.setValue(null);
				}				
			}			
		}else{
			//先清空查询列表
			var rowLength = this.tableNode.rows.length;
			//去掉第一行查询部分以及最后一行按钮部分
			for(var i = 0 ;i < rowLength - 1;i++){
				var row = this.tableNode.rows[i];
				var columnWidget = this._getColumnWidgetByRow(row);
				var conditionWidget = this._getConditionWidgetByRow(row);
				var valueWidget = this._getValueWidgetByRow(row);
				//值控件
				var cell = row.cells[2];
				cell.removeChild(cell.childNodes[0]);
				var valueWidget = new unieap.form.TextBox();
				valueWidget.setWidth(this._widgetWidth);
				cell.appendChild(valueWidget.domNode);
				columnWidget.setValue(null);
				conditionWidget.setValue(null);
				conditionWidget.setDisabled(true);
				conditionWidget.getDataProvider().setDataStore(null);
				valueWidget.setDisabled(true);
				valueWidget.setValue(null);
			}
		}
		this._conditionDataCenter.removeDataStore (this.queryStore);
		
	},
	/**
	 * @summary:
	 * 		设置目标组件每页记录数大小。
	 * @example:
	 * |var queryObj=unieap.byId('queryId');
	 * |queryObj.setPageSize(12);
	 */
	setPageSize:function(pageSize) {
		if(pageSize < 1)
			return;
   		this.pageSize = pageSize;
   	},
   	/**
	 * @summary:
	 * 		获取目标组件每页记录数大小。
	 * @example:
	 * |var queryObj=unieap.byId('queryId');
	 * |queryObj.getPageSize();
	 */
	getPageSize:function() {
   		return this.pageSize;
   	},
   	/**
	 * @summary:
	 * 		设置目标组件排序字段。
	 * @example:
	 * |var queryObj=unieap.byId('queryId');
	 * |queryObj.setOrder(name);
	 */
   	setOrder:function(order){
   		this.order = order;
   	},
   	/**
	 * @summary:
	 * 		获取目标组件排序字段。
	 * @example:
	 * |var queryObj=unieap.byId('queryId');
	 * |queryObj.getOrder();
	 */
   	getOrder:function(){
   		return this.order;
   	},
   	/**
	 * @summary:
	 * 		设置目标组件ID值。
	 * @example:
	 * |var queryObj=unieap.byId('queryId');
	 * |queryObj.setTarget("targetId");
	 */
   	setTarget:function(target) {
   		this.target = target;
   	},
   	/**
	 * @summary:
	 * 		获取目标组件ID值。
	 * @example:
	 * |var queryObj=unieap.byId('queryId');
	 * |queryObj.getTarget();
	 */
   	getTarget:function() {
   		return this.target;
   	},
   	/**
	 * @summary:
	 * 		获取查询组件绑定数据源。
	 * @example:
	 * |var queryObj=unieap.byId('queryId');
	 * |var bind = queryObj.getBinding();
	 * |bind.getDataStore();
	 */
   	getBinding:function(){
   		return unieap.getModuleInstance(this,"binding","unieapx.query.Binding");
   	},
   	
	/**
	 * @summary:
	 * 		设置默认查询条件数据源。
	 * @example:
	 * |	var queryStore = new unieap.ds.DataStore();
	 * |	var rowset = queryStore.getRowSet();
	 * | 	rowset.addRow({column:"codeListGroupId",operation:"E",dataType:12,value:selectedTreeId });
	 * |	unieap.byId("queryId").setQueryStore(queryStore);
	 */
   	setQueryStore:function(queryStore){
   		this._queryStore = queryStore;
   	},
   	/**
	 * @summary:
	 * 		获取默认查询条件数据源。
	 * @example:
	 * |	unieap.byId("queryId").getQueryStore();
	 */
   	getQueryStore:function(){
   		return this._prepareQueryConditionData();
   	},
   	/**
	 * @summary:
	 * 		执行翻页时，需要配合此方法使用，用以获取查询数据。
	 * @example:
	 * |	unieap.byId("queryId").descendPage(ds,_callback);
	 */
   	descendPage:function(ds,_callback){	
		var dataStore = this._getQueryData(ds);
		var dc = new unieap.ds.DataCenter();
		dc.addDataStore(dataStore);
		_callback(dc);
	},
	/**
	 * @summary:
	 * 		获取CodeList
	 * @example:
     * |<div dojoType="unieapx.query.Query" getCodeList="customGetCodeList">
     * |</div>
     * |function customGetCodeList(codeType){
     * | //...
     * |}
	 */
	getCodeList:function(codeType){
		return codeType;
	},
	/**
	 * @summary:
	 * 		执行查询事件实现，可以通过覆盖此方法实现自定义查询。
	 * @example:
     * |<div dojoType="unieapx.query.Query" doQuery="customDoQuery">
     * |</div>
     * |function customDoQuery(queryStore,onComplete){
     * | //...
     * |}
	 */
	doQuery:function(queryStore,onComplete){
		//准备target绑定的DataStore
		var resultStore = null;
   		if (this.target) {
   			var widget = unieap.byId(this.target);
   			if(widget){
   				resultStore = widget.getBinding().getDataStore();
   			}
   			if(resultStore){
   				if(resultStore.getName()){
   					this._queryResultStoreName = resultStore.getName();
   				}
   			}
		}
   		if(!resultStore)
   			resultStore = new unieap.ds.DataStore(this._queryResultStoreName);
   		//设置目标每页记录数
   		resultStore.setPageSize(this.pageSize);
		//根据查询条件执行查询
   		var resultDataStore = this._queryResultDataStore(queryStore , resultStore);
   		if (resultDataStore==null) 
   			return null;
   		this._conditionDataCenter.addDataStore(resultDataStore);
   		//执行回调方法
		onComplete(this._conditionDataCenter);
	},
	/**
	 * @summary:
	 * 		执行查询前准备查询条件事件。
	 * @example:
     * |<div dojoType="unieapx.query.Query" buildQueryCondition="customBuildQueryCondition">
     * |</div>
     * |function customBuildQueryCondition(queryStore){
     * | 	var rowset = queryStore.getRowSet();
	 * | 	rowset.addRow({column:"codeListGroupId",operation:"E",dataType:12,value:selectedTreeId });
     * |}
	 */
	buildQueryCondition:function(queryStore){
		return;
	},
	/**
	 * @summary:
	 * 		执行查询后处理查询结果事件。
	 * @example:
     * |<div dojoType="unieapx.query.Query" onComplete="customOnComplete">
     * |</div>
     * |function customOnComplete(dc){
     * | //...
     * |}
	 */
	onComplete:function(dc) {
		return;
	},
	/**
	 * @summary:
	 * 		执行查询后渲染目标组件事件。
	 * @example:
     * |<div dojoType="unieapx.query.Query" onRenderTarget="customonRenderTarget">
     * |</div>
     * |function onRenderTarget(ds){
     * | //...
     * |}
	 */
	onRenderTarget:function(resultStore){
		//将结果集绑定到目标组件上
		if (this.target) {
   			var widget = unieap.byId(this.target);
   			if(widget){
   				widget.getBinding().setDataStore(resultStore);
   			}
		}
	},
	_callback:function(dc){
		return;
	},
	/**
	 * @summary:
	 * 		点击增加、删除图标按钮时触发事件。
	 * @example:
     * |<div dojoType="unieapx.query.Query" onChangeCondition="customOnChangeCondition">
     * |</div>
     * |function customOnChangeCondition(){
     * | 	unieap.byId("parentAd").notifyResize();
     * |}
	 */
	onChangeCondition:function(){
		return null;
	},
	
	//初始化查询、清空按钮。
	_initQueryClearDisplay:function(){
		var _tr  = this.tableNode.insertRow(this.tableNode.rows.length);
		var _td = _tr.insertCell(0);
		_td.setAttribute("align","right");
		if(this.displayMode.mode==this._displayModelForm){
			_td.setAttribute("colSpan",this.tableNode.rows[0].cells.length);
		}else{
			_td.setAttribute("colSpan",3);
		}
		if(this.showOperationWigdet&&this.displayMode.mode!=this._displayModelForm){
			var tmpTd = _tr.insertCell(1);
			tmpTd.setAttribute("colSpan",2);
		}
		if(this.showQueryWigdet && this.showClearWigdet){
			var _div = document.createElement("div");
			dojo.addClass(_div,"query_buttons");
			var queryButton = new unieap.form.Button();
			var clearButton = new unieap.form.Button();
			queryButton.setLabel(RIA_UNIEAPX_I18N.query.queryLabel);
			clearButton.setLabel(RIA_UNIEAPX_I18N.query.clearLabel);
			_div.appendChild(queryButton.domNode);
			_div.appendChild(clearButton.domNode);
			_td.appendChild(_div);
			dojo.connect(queryButton,"onClick",this,this._doQuery)
			dojo.connect(clearButton,"onClick",this,this._doClear)
		}else if(this.showQueryWigdet){
			var _div = document.createElement("div");
			dojo.addClass(_div,"query_buttons");
			var queryButton = new unieap.form.Button();
				queryButton.setLabel(RIA_UNIEAPX_I18N.query.queryLabel);
				_div.appendChild(queryButton.domNode);
				_td.appendChild(_div);
			dojo.connect(queryButton,"onClick",this,this._doQuery)
		}else if(this.showClearWigdet){
			var _div = document.createElement("div");
			dojo.addClass(_div,"query_buttons");
			var clearButton = new unieap.form.Button();
				clearButton.setLabel(RIA_UNIEAPX_I18N.query.clearLabel);
				_td.appendChild(_div);
				
			dojo.connect(clearButton,"onClick",this,this._doClear)
		}
	},
	//向table中增加一个行记录。
	_insertRow:function(tableNode,index){
		return tableNode.insertRow(index);
	},
	//增加一个查询条件记录。
	_insertQueryRow:function(index){
		var _this = this;
		var queryRow = this._insertRow(this.tableNode,index);
		//向table第一个单元格插入查询列下拉列表
		var columnBox = new unieap.form.ComboBox();
		var columnBoxStore = this._configColumnBoxStore();
		var columnBoxTd = queryRow.insertCell(0); 
			columnBox.setWidth(this._widgetWidth);
			columnBox.getDataProvider().setDataStore(columnBoxStore);
			columnBox.setReadOnly(true);
			columnBoxTd.setAttribute("width","40%");
			columnBoxTd.appendChild(columnBox.domNode);	
		dojo.connect(columnBox,"onChange",function(){_this._columnBoxOnChange(columnBox)})
		//向table第二个单元格插入查询条件下拉列表
		var conditionBox = new unieap.form.ComboBox();
		var conditionTd = queryRow.insertCell(1); 
			conditionBox.setWidth(this._widgetWidth);
			conditionBox.getDataProvider().setDataStore(null);
			conditionBox.setReadOnly(true);
			conditionBox.setDisabled(true);
			conditionTd.setAttribute("width","120px");
			conditionTd.appendChild(conditionBox.domNode);
		//向table第三个单元格插入文本输入域
		var valueBox = new unieap.form.TextBox();
		var valueTd = queryRow.insertCell(2); 
			valueBox.setWidth(this._widgetWidth);
			valueTd.setAttribute("width","auto");
			valueTd.appendChild(valueBox.domNode);
			valueBox.setDisabled(true);
		//分别向table第四、五单元格插入增加、删除条件图标
		if (this.showOperationWigdet) {
			//增加查询条件图标
			var addImage = document.createElement("SPAN");
			var add_Td = queryRow.insertCell(3); 
				addImage.className = "query-add";
				add_Td.setAttribute("width","16px");
				add_Td.appendChild(addImage);
			//删除查询条件图标
			var removeImage = document.createElement("SPAN");
			var remove_Td = queryRow.insertCell(4);
				removeImage.className = "query-delete";
				remove_Td.setAttribute("width","16px");
				remove_Td.appendChild(removeImage);
				
			dojo.connect(addImage,"onclick",function(){_this._addNewRowOnClick(addImage)});
			dojo.connect(removeImage,"onclick",function(){_this._removeRowOnClick(removeImage)});
		}
	},
	//根据查询数据Store配置查询下拉列表数据。
	_configColumnBoxStore:function(){
		if(!this.getBinding().getDataStore())
			return null;
		var metadata = this.getBinding().getDataStore().getMetaData();
		if(!metadata)
			return null;
		var conditionStore = new unieap.ds.DataStore();
		var rowset = conditionStore.getRowSet();
		var codename = null;
		var codevalue = null;
		for(var i=0;i<metadata.length;i++){
			codevalue = metadata[i].name;
			codename = metadata[i].label?metadata[i].label:codevalue;
			rowset.addRow({CODENAME:codename,CODEVALUE:codevalue});
		}
		return conditionStore;
	},
	//查询按钮点击事件绑定方法。
	_doQuery:function(){
		this.query();
	},
	//清空按钮点击事件绑定方法。
	_doClear:function(){
		this.clear();
	},
	//增加图标按钮点击事件绑定方法。
	_addNewRowOnClick:function(cell){
		var rowLength = this.tableNode.rows.length;
		if(this.showQueryWigdet || this.showClearWigdet){
			if(rowLength > this.maxDisplayCount)
				return;
		}else{
			if(rowLength > this.maxDisplayCount - 1){
				return;
			}
		}
		this._enabledFirstRemoveImage();
		var rowIndex = cell.parentNode.parentNode.rowIndex;
		this._insertQueryRow(cell.parentNode.parentNode.rowIndex+1);
		this.onChangeCondition();
	},
	//删除图标按钮点击事件绑定方法。
	_removeRowOnClick:function(cell){
		var rowIndex = cell.parentNode.parentNode.rowIndex;
		this.tableNode.deleteRow(rowIndex);
		this._disabledFirstRemoveImage();
		this.onChangeCondition();
	},
	//根据查询条件返回查询结果数据。
   	_getQueryData: function(resultStore) {
		var queryConditionStore = this._prepareQueryConditionData();
		if(queryConditionStore){
			this._conditionDataCenter.addDataStore(this.queryStore,queryConditionStore);
	   		return this._queryResultDataStore(queryConditionStore,resultStore);
		}
		return null;
   	}, 
   	//根据查询条件与查询结果集返回查询结果数据。
   	_queryResultDataStore:function(queryStore , resultStore){
   	//如果没有配置entityClass属性，则从store中取得实体class。
		var rowSetName = null;
		if(this.getBinding().getDataStore())
			rowSetName = this.getBinding().getDataStore().getRowSetName();
   		if (!rowSetName) {
   			rowSetName = resultStore.getRowSetName();
   		}
   		if(!rowSetName){
   			dojo.require("unieap.dialog.MessageBox");
   			MessageBox.alert({
   				title : RIA_I18N.dialog.messageBox.promptDialog,
   				type : 'warn',
   				message : RIA_UNIEAPX_I18N.query.queryMessage
   			});
   			return null;
   		}
   		resultStore.setRowSetName(rowSetName);
   		var paramDC = new unieap.ds.DataCenter();
   		paramDC.addDataStore(queryStore);
   		paramDC.addDataStore(resultStore);
   		var dc = new unieap.ds.DataCenter();
   		this.doQueryRequestData(paramDC,rowSetName,this._queryResultStoreName,this.queryStore,dc);
   		if (dc instanceof unieap.ds.DataCenter) {
			var resultStore = dc.getDataStore(this._queryResultStoreName);
			if(resultStore){
				var name = resultStore.getName();
				var timeStamp = dc.getParameter(name);
				//添加resultStore到全局dataCenter中
				unieap.setDataStore(resultStore,dataCenter,true,timeStamp);
			}
			this.onRenderTarget(resultStore);
			return resultStore;
		} else 
			return null;
   	},
   	doQueryRequestData:function(paramDC , rowSetName, queryResultStoreName , queryStore, retDc){
   		var path =unieap.WEB_APP_NAME + "/techcomp/ria/queryAction!doQuery.action";
		var dc = unieap.Action.requestData({
			url:path,
			parameters:
				{
					"_entityClass":rowSetName,
					"_queryResultStore":queryResultStoreName,
					"_queryConditionStore":queryStore
				},
			sync:true,
			error:function(e){
				throw new Error(e);
			}
		},paramDC);
		var ds = dc.getSingleDataStore();
		if(ds){
			var name = ds.getName();
			var timeStamp = dc.getParameter(name);
			unieap.setDataStore(ds,retDc,true,timeStamp);
		}
   	},
   	//重新复制查询条件DataStore。
	_copyQueryCoditionStore:function(){
		var store = this._queryStore;
		if(!store){
			store = dataCenter.getDataStore(_this.queryStore);
		}
		if(!store){
			return null;
		}
		var tmpStore = unieap.revDS(store);
			tmpStore.setName(_this.queryStore);
		return tmpStore;
	},
	//准备全部查询条件数据。
	_prepareQueryConditionData:function() {
		//去掉第一行查询部分以及最后一行按钮部分
		_this = this;
		var tmpQueryStore = _this._copyQueryCoditionStore();
		if(!tmpQueryStore && _this.queryStore)
			tmpQueryStore = new unieap.ds.DataStore(_this.queryStore);
		//解的查询组件条件数据。
		var tmpRowSetName = _this._rowsetName;
		tmpQueryStore.setRowSetName(tmpRowSetName);
		var rowset = tmpQueryStore.getRowSet();
		var rowLength = _this.tableNode.rows.length;
		//form mode
		if(this.displayMode.mode==this._displayModelForm){
			for(var i=0;i<rowLength-1;i++){
				var cells = this.tableNode.rows[i].cells;
				for(var j=1;j<cells.length;j=j+2){
					var valueWidget = dijit.byNode(cells[j].childNodes[0]);
					//输入不合法数据时提示
					if(!valueWidget.getValidator().validate()){
						dojo.require("unieap.dialog.MessageBox");
			   			MessageBox.alert({
			   				title : RIA_I18N.dialog.messageBox.promptDialog,
			   				type : 'warn',
			   				message : this._integerMsg
			   			});
			   			return null;
					}
					var value = valueWidget.getValue();
					if(value){
						if(valueWidget instanceof unieap.form.ComboBoxTree){
							var metadata = this.getBinding().getDataStore().getMetaData(valueWidget.queryConfig.column);
							if(metadata.config.treeJson && !metadata.config.treeJson.loader){
								value = valueWidget.getTree().getCurrentNode().item.data.CODEVALUE;
							}
						}
						valueWidget.queryConfig.value = value;
						rowset.addRow(valueWidget.queryConfig);
					}
				}				
			}
		}else{
			for(var i=0;i<rowLength -1;i++){
				var row = this.tableNode.rows[i];
				var conditionWidget = this._getConditionWidgetByRow(row);
				if(!conditionWidget.getValue()){
					continue;
				}
				var columnWidget = this._getColumnWidgetByRow(row);
				if(!columnWidget.getValue()){
					continue;
				}
				var valueWidget = this._getValueWidgetByRow(row);
				//输入不合法数据时提示
				if(!valueWidget.getValidator().validate()){
					dojo.require("unieap.dialog.MessageBox");
		   			MessageBox.alert({
		   				title : RIA_I18N.dialog.messageBox.promptDialog,
		   				type : 'warn',
		   				message : this._integerMsg
		   			});
		   			return null;
				}
				var value = valueWidget.getValue();
				if (value){
					var metadata = this.getBinding().getDataStore().getMetaData(columnWidget.getValue());
					if(valueWidget instanceof unieap.form.ComboBoxTree && metadata.config.treeJson && !metadata.config.treeJson.loader){
						value = valueWidget.getTree().getCurrentNode().item.data.CODEVALUE;
					}
					rowset.addRow({column:columnWidget.getValue(),
						   operation:conditionWidget.getValue(),
						   dataType:metadata.getDataType(),
						   value:value});
				}
			}
		}
		//设置查询排序条件
		tmpQueryStore.setOrder(this.order);
		//构造用户条件
		this.buildQueryCondition(tmpQueryStore);
		return tmpQueryStore;
	},
	//禁用只有一条查询条件的删除图标按钮。
	_disabledFirstRemoveImage:function(){
		var rowLength = this.tableNode.rows.length;
		if((((this.showQueryWigdet || this.showClearWigdet) && rowLength == 2)
				|| rowLength == 1) && this.showOperationWigdet){
			var row = this.tableNode.rows[0];
			var removeCell = row.cells[4];
			var removeDisabledImage = document.createElement("SPAN");
			removeDisabledImage.className = "query-delete-disabled";
				removeCell.removeChild(removeCell.childNodes[0]);
				removeCell.appendChild(removeDisabledImage);
		}
	},
	//使被禁用的删除图标按钮可用。
	_enabledFirstRemoveImage:function(){
		var rowLength = this.tableNode.rows.length;
		var _this = this;
		if(((_this.showQueryWigdet ||_this.showClearWigdet) && rowLength == 2)
				|| rowLength == 1){
			var row = _this.tableNode.rows[0];
			var removeCell = row.cells[4];
			var removeImage = document.createElement("SPAN");
				removeImage.className = "query-delete";
				removeCell.removeChild(removeCell.childNodes[0]);
				removeCell.appendChild(removeImage);
			dojo.connect(removeImage,"onclick",function(){_this._removeRowOnClick(removeImage)});
		}
	},
	//条件数据下拉列表变化时绑定方法。
	_columnBoxOnChange:function(box){
		if(box.getValue()){
			this._setConditionAvailable(box);
		}
	},
	//获取条件数据下拉列表组件。
	_getColumnWidgetByRow:function(row){
		return dijit.byNode(row.cells[0].childNodes[0]);
	},
	//将条件输入框设置为可用并设置可选的值。
	_setConditionAvailable:function(box){
		var conditionBox = this._getConditionWidget(box);
		var value = box.getValue();
		var metadata = this.getBinding().getDataStore().getMetaData(value);
		var dataType = metadata.getDataType();
		var conditionDataStore = this._getConditionStoreByType(dataType);
		conditionBox.setDisabled(false);
		conditionBox.getDataProvider().setDataStore(conditionDataStore);
		//条件store一定大于0条
		conditionBox.getDataProvider().setSelectedItemsByIndex(0);
		this._displayValueWidget(box,dataType,metadata);
	},
	
	//根据单元格对象获取条件编辑下拉列表组件。
	_getConditionWidget:function(box){
		var conditionNode = box.domNode.parentNode.parentNode.cells[1].childNodes[0];
		return dijit.byNode(conditionNode);
	},
	//根据行对象获取条件编下拉列表组件。
	_getConditionWidgetByRow:function(row){
		return dijit.byNode(row.cells[1].childNodes[0]);
	},
	//根据单元格对象获取值编下拉列表组件。
	_getValueWidget:function(box){
		var valueNode = this._getValueWidgetCell(box).childNodes[0];
		return dijit.byNode(valueNode);		
	},
	//据单元格对象获取值编下拉列表组件。
	_getValueWidgetCell:function(box){
		return box.domNode.parentNode.parentNode.cells[2];
	},
	//根据行对象获取值编下拉列表组件。
	_getValueWidgetByRow:function(row){
		return dijit.byNode(row.cells[2].childNodes[0]);
	},
	//使条件编辑下拉列表组件可用。
	_displayValueWidget:function(box,dataType,metadata){
		var widget = this._getValueWidgetByType(dataType,metadata);
		var cell = this._getValueWidgetCell(box);
		cell.removeChild(cell.childNodes[0]);
		cell.appendChild(widget.domNode);
		widget.setValue(null);
		widget.setDisabled(false);
	},	
	//根据数据类型获取条件编辑列表数据。
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
	//根据数据类型获取组件对象。
	_getValueWidgetByType:function(dateType,metadata){
		var widget = null;
		if(metadata.config && metadata.config.type){
			if(metadata.config.type == 'list'){
				widget = this._createSelectedWidget(metadata);
				return widget;
			}else if(metadata.config.type == 'tree'){
				widget = this._createComboBoxTreeWidget(metadata);
				return widget;
			}
		}
		switch(dateType){
			case unieap.DATATYPES.BIGINT :
				widget = this._createNumberWidget();
				widget.range={allowDecimal:false};
				widget.getValidator().setErrorMsg(this._integerMsg); 
				break;
			case unieap.DATATYPES.BOOLEAN :
				widget = this._createStringWidget();
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
		return widget;
	},
	//构造字符类型列对应条件DataStore。
	_construtStringDataStore:function(){
		var stringDataStore = new unieap.ds.DataStore();
		var rowset = stringDataStore.getRowSet();
		rowset.addRow({CODEVALUE:"M",CODENAME:RIA_UNIEAPX_I18N.query.stringMatch});
		rowset.addRow({CODEVALUE:"LM",CODENAME:RIA_UNIEAPX_I18N.query.stringLeftMatch});
		rowset.addRow({CODEVALUE:"RM",CODENAME:RIA_UNIEAPX_I18N.query.stringRigthMatch});
		rowset.addRow({CODEVALUE:"NM",CODENAME:RIA_UNIEAPX_I18N.query.stringNotMatch});
		rowset.addRow({CODEVALUE:"NLM",CODENAME:RIA_UNIEAPX_I18N.query.stringLeftNotMatch});
		rowset.addRow({CODEVALUE:"NRM",CODENAME:RIA_UNIEAPX_I18N.query.stringRightNotMatch});
		return stringDataStore;
	}, 	
	//构造数字类型列对应条件DataStore。
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
	//构造布尔类型列对应条件DataStore。
	_construtBooleanDataStore:function(){
		var booleanDataStore = new unieap.ds.DataStore();
		var rowset = booleanDataStore.getRowSet();
		rowset.addRow({CODEVALUE:"E",CODENAME:RIA_UNIEAPX_I18N.query.numberEquals});
		rowset.addRow({CODEVALUE:"NE",CODENAME:RIA_UNIEAPX_I18N.query.numberNotEquals});
		return booleanDataStore;
	},
	//构造字符类型组件。
	_createStringWidget:function(){
		var widget = new unieap.form.TextBox({trim:true});
		widget.setWidth(this._widgetWidth);
		return widget;
	},
	//构造数字类型组件。
	_createNumberWidget:function(){
		var widget = new unieap.form.NumberTextBox();
		widget.setWidth(this._widgetWidth);
		return widget;
	},
	//构造下拉列表类型组件。 edit by muxg
	_createSelectedWidget:function(metadata){
		if(!metadata.config){
			return this._createStringWidget();
		}
		var dataProvider = {};
		if(metadata.config.store){
			if(dataCenter.getDataStore(metadata.config.store)){
				dataProvider.store = metadata.config.store;
			}
		}
		if(!dataProvider || !dataProvider.prototype){
			dataProvider.store = this.getCodeList(metadata.config.store);
		}
		var decoder = {displayAttr:metadata.config.displayAttr||'CODENAME',valueAttr:metadata.config.valueAttr||'CODEVALUE'};
		var widget = new unieap.form.ComboBox({readOnly:true,dataProvider:dataProvider,decoder:decoder});
		widget.setWidth(this._widgetWidth);
		return widget;
	},
	
	
	//构造下拉树类型组件。 
	_createComboBoxTreeWidget:function(metadata){
		if(!metadata.config){
			return this._createStringWidget();
		}
		var widget = null;
		//构造来自代码表中下拉树
		if(metadata.config.treeJson && !metadata.config.treeJson.loader){
			var storeName = metadata.config.treeJson.binding.store;
			var ds = unieap.Action.getCodeList(storeName);
			if(ds){
				dataCenter.addDataStore(ds);
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
			//构造自定义下拉树
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
	
	
	
	
	
	//构造日期类型组件。
	_createDateWidget:function(){
		var widget = new unieap.form.DateTextBox();
		widget.setWidth(this._widgetWidth);
		return widget; 
	},
	//构造Timestamp日期类型组件。
	_createTimestampWidget:function(){
		var widget = new unieap.form.DateTextBox(
				{
					displayFormatter:{dataFormat:"yyyy/MM/dd hh:mm:ss"},
					popup:{showsTime:24}
				}
				);
		widget.setWidth(this._widgetWidth);
		return widget; 
	},
	_getFormModeOption:function(dateType){
		var option = "M";
		switch(dateType){
		case unieap.DATATYPES.BIGINT :
			option="E";
			break;
		case unieap.DATATYPES.BOOLEAN :
			option="E";
			break;
		case unieap.DATATYPES.DATE :
			option="E";
			break;
		case unieap.DATATYPES.DECIMAL :
			option="E";
			break;
		case unieap.DATATYPES.DOUBLE :
			option="E";
			break;
		case unieap.DATATYPES.FLOAT :
			option="E";
			break;
		case unieap.DATATYPES.INTEGER :
			option="E";
			break;
		case unieap.DATATYPES.LONGVARCHAR :
			option="M";
			break;
		case unieap.DATATYPES.NUMERIC :
			option="E";
			break;
		case unieap.DATATYPES.REAL :
			option="E";
			break;
		case unieap.DATATYPES.SMALLINT :
			option="E";
			break;			
		case unieap.DATATYPES.STRING :
			option="M";
			break;
		case unieap.DATATYPES.TIME :
			option="E";
			break;		
		case unieap.DATATYPES.TIMESTAMP :
			option="E";
			break;
		case unieap.DATATYPES.TINYINT :
			option="E";
			break;
		case unieap.DATATYPES.VARCHAR :
			option="M";
			break;
		default :
			option="M";
		}
	   return option;
	}
});
