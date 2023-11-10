dojo.provide("unieap.form.CheckGroup");
dojo.require("unieap.form.FormWidget");

dojo.declare("unieap.form.CheckGroup", unieap.form.FormWidget, {
    /**
     * @declaredClass:
     * 		unieap.form.CheckGroup
     * @summary:
     * 		CheckBoxGroup的基类，定义了模板及基本结构。
     * @superClass:
     * 		unieap.form.FormWidget
     */
     
    //配置属性接口
    UserInterfaces : dojo.mixin({
		cols : "number",
		value : "string",
		labelAlign : "string",
		dataProvider : "object",
		decoder : "object",
		nextFocusId : "string",
		disabled : "boolean",
		focusOffset : "number",
		onChange : "function",
		onBeforeChange : "function",
		onTab : "function"
	},
	unieap.form.FormWidget.prototype.UserInterfaces),
     
    /**
     * @summary:
     * 		设置按钮组布局的列数
     * @type:
     * 		{number}
     * @default:
     * 		4
     */
    cols: 4,
    
    /**
     * @summary:
     * 		设置按钮组初始值
     * @type:
     * 		{object}
     * @default:
     * 		null
     */
    value: '',
    
    /**
     * @summary:
     * 		设置标签位置
     * @type:
     * 		{string}
     * @enum:
     * 		{"left"|"right"|"top"|"bottom"};
     * @default:
     * 		"left"
     */
    labelAlign: 'left',
    
    /**
     * @summary:
     * 		设置数据源的信息
     * @type
     * 		{object}
     * @see：
     * 		unieap.form.CheckGroupProvider
     */
    dataProvider: null,
    
    /**
     * @summary:
     * 		设置按钮组转码相关的信息
     * @type：
     * 		{object}
     * @see：
     * 		unieap.form.GroupDecoder
     */
    decoder: null,
	
	//自动注入dataCenter
	Autowired : "dataCenter",
	
	nextFocusId:'',
    
    
    /**
     * @summary:
     * 		设置是否禁用按钮组控件,禁用后控件将不可再进行选择
     * @type:
     * 		{boolean}
     * @default:
     * 		false
     */
    disabled: false,
	
	//Form._enter2Tab使用,跳过子RadioButton
	focusOffset: 0,
    
    templateString : 
		"<div class='u-form-chkGroup'>" +
			"<div dojoAttachPoint='modifiedNode' class='u-form-modified'></div>" +
			"<div dojoAttachPoint='requiredNode' class='u-form-required'>*</div>" + 
			"<div dojoAttachPoint='errorNode' class='u-form-error'></div>"+
			"<div dojoAttachPoint='containerNode' class='u-form-chkGroup-border'>" +
				"<div dojoAttachPoint='inputNode,focusNode'  style='overflow:hidden;width:100%;zoom:100%;'></div>" +
			"</div>" +
		"</div>",
    
    
    postCreate: function(){
		this.checkboxMap = [];
		this.setLayout(this.getDataProvider().getDataStore());
		this.inherited(arguments);
		
    },
    _attachTab : function(){
    },
    startup : function(){
    	if(!this.getDataProvider().getDataStore()){
    		this.checkboxMap = dijit.findWidgets(this.containerNode);
    		this._attachTab();
    	}
    	this.value && this.setValue(this.value);
    	this.disabled&&(this.setDisabled(true,[]));
    },

    //布局
    setLayout: function(store){
        if (!store) 
            return;
        
        var rs = store.getRowSet(), count = rs.getRowCount();
        if (count < 1) 
            return;
        
        //如果用户调用了setDataStore(),可能需要重新构建布局,删除原有的布局
        dojo.empty(this.inputNode);
        var mp = this.checkboxMap;
        while (mp.length > 0) {
            mp.pop().destroy();
        }
        
        var tb = document.createElement("TABLE"), tbody = document.createElement("TBODY"), layout = this[["_", this.labelAlign, "Layout"].join("")];
        tb.className = "u-form-chkGroup-tab";
        tb.cellpadding = tb.cellspacing = 0;
        tb.appendChild(tbody);
        for (var index = 0; index < count; index++) {
            layout.call(this, tbody, index);
        }
        //补偿TABLE
        for (var i = 0, l = count % this.cols == 0 ? 0 : (this.cols - count % this.cols); i < l; i++) {
            var td = document.createElement("TD");
            td.innerHTML = "&nbsp;";
            this.tr.appendChild(td);
            var labelTd = document.createElement("TD");
            labelTd.innerHTML = "&nbsp;";
            this.labelTr.appendChild(labelTd);
        }
        this.tr = this.labelTr = null;
        this.inputNode.appendChild(tb);
    },
    
  //labelAlign=="left",文字居左布局
    _leftLayout: function(tb, index){
        //是否开始换行,创建新的tr
        if (index % this.cols == 0) {
            this.labelTr = this.tr = document.createElement("TR");
            tb.appendChild(this.tr);
        }
        
        var labelTd = document.createElement("TD");
        labelTd.className = "u-form-chkGroup-label";
        labelTd.align = "right";
        labelTd.innerHTML = this.getLabel(index);
        this.labelTr.appendChild(labelTd);
        var td = document.createElement("TD");
        td.align = "center";
        td.className = "u-form-chkGroup-cell";
        td.appendChild(this.getCheckBox(index).checkboxNode);
        
        this.tr.appendChild(td);
    },
    
    
    //labelAlign=="right",文字居右布局
    _rightLayout: function(tb, index){
        if (index % this.cols == 0) {
            this.labelTr = this.tr = document.createElement("TR");
            tb.appendChild(this.tr);
        }
        this._addCell(index, "left");
    },
    
    //labelAlign=="top",文字居上
    _topLayout: function(tb, index){
        if (index % this.cols == 0) {
            this.labelTr = document.createElement("TR");
            tb.appendChild(this.labelTr);
            this.tr = document.createElement("TR");
            tb.appendChild(this.tr);
        }
        this._addCell(index, "center");
    },
    
    
    //labelAlign=="bottom",文字居下
    _bottomLayout: function(tb, index){
        if (index % this.cols == 0) {
            this.tr = document.createElement("TR");
            tb.appendChild(this.tr);
            this.labelTr = document.createElement("TR");
            tb.appendChild(this.labelTr);
        }
        this._addCell(index, "center");
    },
    
  //创建单元格
    _addCell: function(index, position){
        var td = document.createElement("TD");
        td.align = "center";
        td.className = "u-form-chkGroup-cell";
   		td.appendChild(this.getCheckBox(index).checkboxNode);
        this.tr.appendChild(td);
        var labelTd = document.createElement("TD");
        labelTd.className = "u-form-chkGroup-label";
        labelTd.align = position;
        labelTd.innerHTML = this.getLabel(index);
        this.labelTr.appendChild(labelTd);
    },
    
    
  //禁用所有的按钮(单选、多选)
    _setDisabled: function(bool){
        var map = this.checkboxMap,item;
        for (key in map) {
			item=map[key];
			this._setCheckDisabled(item,bool);
        }
    },
    
    /**
     * @summary:
     * 		得到数据源控制器
     * @return：
     * 		{unieap.form.CheckGroupProvider}
     * @see：
     * 		unieap.form.CheckGroupProvider
     */
    getDataProvider: function(){
        return unieap.getModuleInstance(this,"dataProvider", "unieap.form.CheckGroupProvider");
    },
    
    /**
     * @summary:
     * 		得到转码器
     * @return:
     * 		{unieap.form.GroupDecoder}
     * @see:
     * 		unieap.form.GroupDecoder
     */
    getDecoder: function(){
        return unieap.getModuleInstance(this,"decoder", "unieap.form.GroupDecoder");
    },
    
    /**
	 * @summary:
	 * 		按钮组值改变前事件,返回为false将不改变按钮组值,如果要保留原值调用this.setValue(this.getValue());
	 * @return:
	 * 		{boolean}
	 * @example:
	 * |function fn(){
	 * |	this.setValue(this.getValue());
	 * |	return false;
	 * |}
	 * |<div dojoType="unieap.form.RadioButtonGroup" onBeforeChange="fn"></div>
	 */
    onBeforeChange: function(){
    	return true;
    },
    
    /**
     * @summary:
     * 		按钮组值改变时触发事件
     * @param:
     * 		{unieap.form.CheckBox} checkbox
     * 		触发事件的按钮
     */
    onChange: function(checkbox){
    },
    
    /**
     * @summary:
     * 		取得按钮组数据源指定行的显示值
     * @param:
     * 		{number} inRowIndex
     * 		数据源行号
     */
    getLabel: function(inRowIndex){
        var displayAttr = this.getDecoder().getDisplayAttr();
        return this.getDataProvider().getItemValue(displayAttr, inRowIndex);
    },
    
    /**
     * @summary:
     * 		设置组内某些CheckBox为可用或不可用
     * @param:
     * 		{boolean} bool 可用或不可用
     * @param:
     * 		{array} items CheckBox序号数据
     * @description:
     * 		如果不传items,则会禁用或者解禁所有按钮
     * @example:
     * |var box=unieap.byId('chkBox')
     * |box.setDisabled(true)
     * |box.setDisabled(false,[0,1,2])
     */
    setDisabled: function(bool, items){
		if(!items) {
			this._setDisabled(bool);
		} else if(dojo.isArray(items) && items.length != 0) {
			var checkboxMap = this.checkboxMap, checkbox;
			for (var i = 0; i < items.length; i++) {
                checkbox = checkboxMap[items[i]];
 				checkbox && this._setCheckDisabled(checkbox,bool);
            }
		} 
    },
    
    
    //返回指定索引号的CheckBox(RadioButton)控件,子类覆盖即可
    getCheckBox: function(inRowIndex){
        return null;
    },
	
	onTab: function(){
	},
	
	focus: function() {
		this.checkboxMap.length && this.checkboxMap[0].inputNode.focus();
	},

	//是否显示promptMsg
	_showPromptMsg:function(bool){
		var promptManager=this.getPromptManager();
		if(promptManager){
			if(bool){
				promptManager.showPromptMsg(this.inputNode);
			}else{
				promptManager.hidePromptMsg(this.inputNode);
			}
		}
	},
	getPromptManager:function(){
		if(!this.prompt){
			this.prompt = {};
		}
		return unieap.getModuleInstance(this,"prompt","unieap.form.PromptManager");
	},
    _setCheckDisabled: function(checkbox,disabled){
    	checkbox.inputNode && (checkbox.inputNode.disabled = disabled);
    }
	
});

//@ sourceURL=/tp_fp/techcomp/ria/dojo/../unieap/form/CheckGroup.js