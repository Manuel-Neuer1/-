dojo.provide("unieap.form.ComboBox");
dojo.require("unieap.form.TextBoxWithIcon");
dojo.declare("unieap.form.ComboBox", unieap.form.TextBoxWithIcon, {
	/**
	 * @declaredClass:
	 * 		unieap.form.ComboBox
	 * @superClass:
	 * 		unieap.form.TextBoxWithIcon
	 * @summary:
	 * 		普通下拉框
	 * @classDescription：
	 *		1.支持的数据源包括unieap.ds.DataStore和html的option节点。
	 *		2.输入框支持模糊匹配，支持拼音查询。
	 *		3.支持根据指定数据列排序。
	 *		4.支持ComboBox组件间的级联。
	 *		5.支持多种展现风格，包括列表，表格，多选列表。
	 *		6.支持数据过滤。
	 *		7.支持自定义下拉框的显示内容(见popup属性)
	 * @img:
	 * 		images/form/combobox.png
	 */
	 
	// 用户属性配置接口
	UserInterfaces: dojo.mixin(
		{
			dataProvider: "object",
			separator: "string",
			decoder: "object", 
			dataFilter: "object",
			autoCompleter: "object",
			cascade: "object",
			hasDefault: "boolean",
			focusOffset: "number",
			popup: "object",
			defaultText: "string",
			dataType: "boolean",
			textValidate: "boolean",
			comboShowSelect:"boolean",
			comboShowSelectValue:"string",
			comboShowSelectText:"string",
			strictFilter: "boolean",
			isReport: "boolean"
		},
		unieap.form.TextBoxWithIcon.prototype.UserInterfaces),
	
	// 组件，其中popup在父类中已有声名
	/**
	 * @type
	 * 		{object}
	 * @summary:
	 * 		设置数据源相关的信息
	 * @see：
	 * 		unieap.form.ComboBoxDataProvider
	 */
	dataProvider: null,
	
	/**
	 * @summary:
	 * 		设置下拉框转码相关的信息
	 * @description:
	 * 		定义下拉框数据的显示列名，保存值列名等。
	 * @type：
	 * 		{object}
	 * @example:
	 * |	<div id="multiCombobox"  dojoType="unieap.form.ComboBox" 
	 * |		${1}decoder="{displayAttr:'value',valueAttr:'key'}">
	 * |	</div>
	 * 	${1}对应的数据格式为[{key:'1',value:'value1'},{key:'2',value:'value2'}]
	 * @see：
	 * 		unieap.form.ComboboxDecoder
	 */
	decoder: null,
	
	/**
	 * @summary:
	 * 		设置数据源的过滤查询信息
	 * @type：
	 * 		{object}
	 * @see：
	 * 		unieap.form.ComboBoxDataFilter
	 */
	dataFilter: null,
	
	/**
	 * @summary：
	 * 		设置级联相关信息
	 * @type：
	 * 		{object}
	 * @see：
	 * 		unieap.form.Cascade
	 */
	cascade: null,
	
	//自动注入dataCenter
	Autowired : "dataCenter",
	
	/**
	 * @summary：
	 * 		设置自动下拉相关信息
	 * @type：
	 * 		{object}
	 * @see：
	 * 		unieap.form.AutoCompleter
	 */
	autoCompleter: null,
	
	/**
	 * @type：
	 * 		{object}
	 * @summary:
	 * 		设置弹出控件控制器
	 * @see：
	 * 		unieap.form.ComboBoxPopup
	 */
	popup: null,
	
	popupClass: "unieap.form.ComboBoxPopup",
	
	/**
	 * @summary:
	 *		多选时，数据的分隔符
	 * @type:
	 * 		{string}
	 * @default：
	 *		","
	 * @example:
	 * |	<div id="multiCombobox" popup="{displayStyle:'multi'}" dojoType="unieap.form.ComboBox" separator="#">
	 * |	</div>
	 * |	${1}unieap.byId("multiCombobox").setValue("1#2#3");
	 * 	${1}设置值为 1 2 3
	 */
	separator: ",",
	
	/**
	 * @summary:
	 * 		设置控件(绑定)值的数据类型
	 * @description:
	 * 		如果控件绑定的值为boolean类型，需要设置此属性为boolean.如果没有，会从元数据中取得
	 * @type:
	 * 		{string}
	 * @example:
	 * |<script type="text/javascript">
	 * |	//info的值为bool类型，不是字符串类型
	 * |	var ds=new unieap.ds.DataStore("formDs",[{info:true}]);
	 * |	var ds1=new unieap.ds.DataStore("infoDs",[{CODEVALUE:'true',CODENAME:'正确'},{CODEVALUE:'false',CODENAME:'错误'}]);
	 * |	dataCenter.addDataStore(ds);
	 * |	dataCenter.addDataStore(ds1);
	 * |</script>
	 * |<div dojoType="unieap.form.Form" binding="{store:'formDs'}">
	 * |	<div dojoType="unieap.form.ComboBox" dataType='boolean' dataProvider="{store:'infoDs'}">
	 * |</div>
	 */
	dataType: "",
	//
	/**
	 * @summary：
	 * 		是否默认选中第一条数据
	 * @description:
	 * 		在hasDefault属性和onChange事件一起使用的情况下请注意:
	 * 		var box=combox 错误写法,不应该使用jsId属性.由于dojo生命周期的关系,此时combox对象还没有创建
	 * 		正确写法为unieap.byId('combox1');
	 * @type：
	 * 		{boolean}
	 * @default：
	 * 		false
	 * @example：
	 * |	<div dojoType='unieap.form.ComboBox' hasDefault='true' onChange='fn' id='combox1' ></div>
	 * |	function fn(){
	 * |		${1}var box=unieap.byId('combobox1');
	 * |	}
	 * 	${1}在获取控件对象时推荐使用unieap.byId,这样可以保证代码无误!
	 */
	hasDefault: false,
	
	/**
	 * @summary:
	 * 		当焦点离开时校验输入值是否在下拉框中，如果不在清空下拉框
	 * @type：
	 * 		{boolean}
	 * @default：
	 * 		false
	 * @example:
	 * |//当输入非法值时焦点离开自动清空
	 * |<div dojoType='unieap.form.ComboBox' hasDefault='true' textValidate='true' ></div>
	 */
	textValidate: unieap.widget.form.textValidate,
	
	defaultText: "",
	
	/**
	 * @summary:
	 * 		覆盖全局配置默认选择项配置（该选项配置的值将常在下拉选项中）
	 * @type：
	 * 		{boolean}
	 * @default：
	 * 		null
	 * 
	 */
	comboShowSelect:null,
	
	// values
	values: [],
	
	/*
	 * input域keydown、onclick、oniconclick时将其设为true，
	 * input域blur、keyup时将其设为false
	 * 当keyup时，若此变量true，则认为在此域内完成一次type in，执行set
	 */
	_keyPressed: false,
	
	
	_hasBlur:false,
	
	comboShowSelectValue: unieap.widget.form.comboShowSelectValue || "",
	
	comboShowSelectText: "",
	
	/**
	 *  @summary:
	 * 		是否开启严格检索功能，默认关闭严格检索功能，开启模糊检索功能
	 *  @type：
	 * 		{boolean}
	 *  @default：
	 * 		false
	 * 	@example:
	 *      |//当设置strictFilter="true"时，即关闭模糊检索功能，启用严格检索功能。
	 * 		|<div dojoType='unieap.form.ComboBox' strictFilter="true" ></div>
	 */
	strictFilter: false,	
	
	isReport: false,
	
	setIsReport: function(flag){
		this.isReport = flag;
	},
	
	// 获取组件的方法
	/**
	 * @summary:
	 * 		得到数据源控制器
	 * @return：
	 * 		{unieap.form.ComboBoxDataProvider}
	 * @see：
	 * 		unieap.form.ComboBoxDataProvider
	 */
	getDataProvider: function() {
		return unieap.getModuleInstance(this,"dataProvider", "unieap.form.ComboBoxDataProvider");
	},
	
	/**
	 * @summary:
	 * 		获取下拉框转码器
	 * @return：
	 * 		{unieap.form.ComboboxDecoder}
	 * @see：
	 * 		unieap.form.ComboboxDecoder
	 */
	getDecoder: function() {
		return unieap.getModuleInstance(this,"decoder", "unieap.form.ComboBoxDecoder");
	},
	
	/**
	 * @summary:
	 * 		得到数据过滤器
	 * @return：
	 * 		{unieap.form.ComboBoxDataFilter}
	 * @see：
	 * 		unieap.form.ComboBoxDataFilter
	 */
	getDataFilter: function(){
		return unieap.getModuleInstance(this,"dataFilter", "unieap.form.ComboBoxDataFilter");
	},
	
	/**
	 * @summary:
	 * 		获取级联控制器
	 * @return：
	 * 		{unieap.form.Cascade}
	 * @see：
	 * 		unieap.form.Cascade
	 */
	getCascade: function(){
		return unieap.getModuleInstance(this,"cascade", "unieap.form.Cascade");
	},
	
	/**
	 * @summary：
	 * 		获取自动下拉控制器
	 * @type：
	 * 		{unieap.form.AutoCompleter}
	 * @see：
	 * 		unieap.form.AutoCompleter
	 */
	getAutoCompleter:function(){
		return unieap.getModuleInstance(this,"autoCompleter", "unieap.form.AutoCompleter");
	},
	
	// life cycle
	postMixInProperties: function() {
		// staticData功能
		if (this.dataProvider && this.dataProvider.staticData) {
			this._staticNode = dojo.clone(this.srcNodeRef);
		}
	},
	
	postCreate: function() {
		this.inherited(arguments);
		dojo.addClass(this.iconNode, "u-form-combobox-icon-normal");
		//构造器中调用_registerCascade
		this.getCascade();
		if (this.hasDefault) {
			if(this.getDataProvider().isComboShowSelect()){
				this._setValue(this.comboShowSelectValue);
			}
			else{
				var items = this.getDataProvider().getItems();
				if (items.length > 0) {
					this.setValue(this.getDecoder().code(items[0]));
				}
			}
		}
		if(this.getCascade().filterNull == "none"){
			this.getCascade()._notifyFilterMe();
		}
	},
	
	//对下拉按钮增加禁用样式
	setDisabled: function() {
		this.inherited(arguments);
		if(this.disabled){
			dojo.removeClass(this.iconNode,'u-form-combobox-icon-normal');
			dojo.addClass(this.iconNode,'u-form-combobox-icon-disabled');
		}else{
			dojo.removeClass(this.iconNode,'u-form-combobox-icon-disabled');
			dojo.addClass(this.iconNode,'u-form-combobox-icon-normal');
		}
	},
	
	// API
	/**
	 * @summary:
	 * 		设置组件值
	 * @param:
	 * 		 {string} value
	 * @example：
	 * |	combobox.setValue("1");
	 * |	combobox.setValue("1,2,3,4");
	 * |	combobox.setValue("1|2|3|4"); separator='|'
	 * 		设置值
	 */
	setValue: function(value) {
		if (value === "" || value ===undefined) value = null;
		if(this.autoCompleter != null){
			var autoCompleter = this.getAutoCompleter(),
				me = this;
		    if(autoCompleter.url&&autoCompleter._canSendQuery(value)){
		    	var url=unieap.WEB_APP_NAME+autoCompleter.url;
		    	var query=autoCompleter.queryName;
				autoCompleter.params = {};
				autoCompleter.params[query] = value;
			    var dc=new unieap.ds.DataCenter();
			    autoCompleter.onBeforeSendQuery(autoCompleter.params,dc);//可以在此回调方法中重新修改已有参数或者增加其他参数
			    unieap.Action.requestData({
			    	url:url,
			    	parameters:autoCompleter.params,
			    	sync:true,
			    	load:function(dc){
					    if(!dc){
							return;
						}
						var store=dc.getSingleDataStore();
						me.getDataProvider().setDataStore(store);
			    		autoCompleter.onAfterSendQuery(dc);
			    	}
			    },dc,false);//fasle表示不显示loading
	    	}
		}
		this._setValue(value);
	},
	_setValue: function(value,noNeedOpenPopupAgain){
		this.dataType = this.dataType||(this.getBinding()&&this.getBinding().getDataType());
		if (this.textValidate && !this._validateValue(value)) {
			this._updateText();
			return;
		}
		if (!this._validateChange(value)) {
			this._updateText();
			return;
		}
		//应该在校验合法和校验是否改变之后才改变当前的值，否则dataStore中相应的值不会改变
		this.values = value==null?[]:value.toString().split(this.separator);
		this._changeValue(value);
		if (this.getPopup().isOpen() && !noNeedOpenPopupAgain) {
			setTimeout(dojo.hitch(this, function() {
				var items = this.getDataProvider().getItems();
				this.getPopup().open(items, this._getSelectedItems(items), this._onPopupClose);
			}), 0);
		}
	},
	
	/**
	 * @summary:
	 * 		返回组件值
	 * @return：
	 * 		{string}
	 */
	getValue: function() {
		if (this.dataType == "boolean") {
			if (this.values.length==1 && this.values[0]=="true") {
				return true;
			} else if (this.values.length==1 && this.values[0]=="false") {
				return false;
			}
		}
		var autoCompleter = this.autoCompleter;
		if(autoCompleter != null && autoCompleter.params){
			query = autoCompleter.queryName;
			return autoCompleter.params[query];
		}
		return (this.values==null||this.values.length==0)?
					null:this.values.join(this.separator);
	},
	
	/**
	 * @summary:
	 * 		设置组件文本显示值
	 * @param：
	 * 		{string} text
	 */
	setText: function(text) {
		if (text == null) {
			text = "";
		}
		this.inputNode.value = text;
	},
	
	/**
	 * @summary:
	 * 		返回组件文本显示值
	 * @return：
	 * 		{string}
	 */
	getText: function() {
		return this.inputNode.value;
	},
	
	/**
	 * @summary:
	 * 		setValue(value)时,当value找不到相应的显示值,将调用getLoseItem返回数据。
	 * @return:
	 * 		{object}
	 * @example:
	 * |	<div dojoType="unieap.form.ComboBox" getLoseItem="getMyItem">
	 * |	</div>
	 * |	getMyItem=function(value){
	 * |		return {CODENAME:"teste",CODEVALUE:value}
	 * |	}
	 * 		当setValue,值为value,而转义中并无此显示值。
	 * 		此时调用此方法得到显示值。默认显示值和值是相等的。
	 * @deprecated
	 */
	getLoseItem: function(value) {
		var _i={};
		_i[this.getDecoder().valueAttr]=value;
		_i[this.getDecoder().displayAttr]=value;
		return _i;
	},
	
	/**
	 * @summary:
	 * 		设置多选分隔符
	 * @param：
	 * 		 {string} separator
	 */
	setSeparator: function(separator) {
		this.separator = separator;
	},
	
	/**
	 * @summary:
	 * 		选中一个或多个节点
	 * @param：
	 * 		{array} item
	 * @example:
	 * |function setSelectItems(){
	 * |	var items = unieap.byId("setSelect").getDataProvider().getItems();
	 * |	unieap.byId("setSelect").setSelectedItems([items[2],items[3]]);
	 * |}
	 * |<div id="setSelect" popup="{displayStyle:'multi'}" dojoType="unieap.form.ComboBox" dataProvider="{'store':'city_store'}">
	 * |</div>
	 * 以上代码执行后，会将第三条和第四条数据选中。
	 */
	setSelectedItems: function(items) {
		if (dojo.isArray(items)) {
			var d = this.getDecoder();
			var values = [];
			var allItems = this.getDataProvider().getItems();
			for (var i=0; i<items.length; i++) {
				for (var j=0; j<allItems.length; j++) {
					if (items[i] != allItems[j]) continue;
					var v = d.code(items[i]);
					values.push(v);
					break;
				}
			}
			this.setValue(values.join(this.separator));
		}
	},
	
	/**
	 * @summary:
	 * 		根据选项序号设置值
	 * @param:
	 * 		{array} index 选项序号数组
	 * @example:
	 * |function setSelectItems(){
	 * |	unieap.byId("setSelect").setSelectedItems([2,3]);
	 * |}
	 */
	setSelectedIndex: function(index) {
		if (dojo.isArray) {
			var items = this.getDataProvider().getItems();
			var selection = [];
			for (var i in index) {
				if (typeof index[i]=="number") {
					selection.push(items[index[i]]);
				}
			}
			this.setSelectedItems(selection);
		}
	},
	
	// inner API
	_getSelectedItems: function(/*[option]传入items以免popup时filter被调用两被*/items) {
		if (items == null)
			items = this.getDataProvider().getItems();
		if (!(dojo.isArray(items) && dojo.isArray(this.values))) return [];
		var selection = [];
		var d = this.getDecoder();
		for (var i=0; i<items.length; i++) {
			for (var j=0; j<this.values.length; j++) {
				if (d.code(items[i])==this.values[j]) {
					selection.push(items[i]);
					break;
				}
			}
		}
		return selection;
	},

	_changeValue: function(value,isBind) {
		this.values = value==null?[]:value.toString().split(this.separator);
		this.getDataProvider()._checkLoseItems(this.values);
		this._updateText();
		this.fireDataChange();
//		if(!isBind){
//			this.getCascade().cascade();
//		}
	},
	
	_updateText: function(isValueUnchange) {
		if (this.values==null || this.values.length==0) {
			this.setText("");
			this.getCascade().cascade();
			return;
		}
		
		var items = this.getDataProvider().getItems();
		if (items == null) {
			this.setText(this.values.join(this.separator));
			return;
		}
		if(!isValueUnchange){
			//在选中值没有变化时（例如再次打开popup，不选择就关闭），不需要触发级联
			this.getCascade().cascade();
		}
		var text = [];
		var d = this.getDecoder();
		for (var i=0; i<this.values.length; i++) {
			var v = this.values[i];
			for (var j=0; j<items.length; j++) {
				if (v==d.code(items[j])) {
//					text.push(decoder.decode(items[j]));
					v = d.decode(items[j]);
					break;
				}
			}
			text.push(v);
		}
		this.setText(text.join(this.separator));
	},
	
	// inner event handler
	_onIconClick: function(evt) {
		if(!(this.readOnly&&unieap.global.combobox_notReadonlyPopup)&&!this.disabled&& unieap.fireEvent(this, this.onBeforeIconClick,[evt])) {
			unieap.fireEvent(this, this.onIconClick,[evt])
			var popup=this.getPopup();
			if (popup.isOpen()) {
				popup.close();
			} else {
				var items = this.getDataProvider().getItems();
				//当没有数据时不应弹出
				if(items.length && items.length > 0){
					popup.open(items, this._getSelectedItems(items), this._onPopupClose);
				}
			}
			this._keyPressed = true;
			this._hasBlur = false;
		}else{
			if(evt) dojo.stopEvent(evt);
		}
	},
	
	_onFocus: function(evt) {
		if (!evt||typeof(evt)=="string")  return ;
		this.inherited(arguments);
		this._keyPressed = false;
		this._hasBlur = false;
	},
	
	_onChange: function(evt) {
		// do key typing
		var value = this.inputNode.value;
		if (value == "") value = null;
		if (this.textValidate && !this._validateValue(value)) {
			this._updateText();
			return;
		}
		if (!this._validateChange(value)) {
			this._updateText();
			return;
		}
		this._changeValue(value,true);
		if (this.getPopup().isOpen()) {
			this.getPopup()._updateSelection();
		}
		unieap.fireEvent(this, this.onChange,[value]);
	},
	
	_onClick: function(evt) {
		if ((this.readOnly&&unieap.global.combobox_notReadonlyPopup) || this.disabled || !unieap.fireEvent(this, this.onBeforeClick,[])) return;
		if (this.getPopup().isOpen()) {
			this.getPopup().close();
		} else {
			var items = this.getDataProvider().getItems();
			if(items.length && items.length > 0){
				this.getPopup().open(items, this._getSelectedItems(items), this._onPopupClose);
			}
		}
		unieap.fireEvent(this, this.onClick,[evt]);
		this._keyPressed = true;
		this._hasBlur = false;
	},
	
	_onPopupClose: function(/* Array of Item */selection) {
		if (selection == null || !dojo.isArray(selection) || selection.length==0) {
			if (this._validateChange(null)) {
				if(unieap.widget.form.comboSelectFirstValue && this.values.length>0){
					unieap.fireEvent(this, this.onChange,[this.values.toString()]);
				}else{
					this._changeValue(null);
					unieap.fireEvent(this, this.onChange,[]);
				}
			} else {
				this._updateText();
			}
			return;
		}
		var values = [], de = this.getDecoder();
		for (var i=0; i<selection.length; i++) {
			values.push(de.code(selection[i]));
		}
		var value = values.join(this.separator);
		if (this._validateChange(value)) {
			this._changeValue(value);
			unieap.fireEvent(this, this.onChange,[value]);
		} else {
			this._updateText(true);
		}
	},
	
	// validate if the given value equals to the old value
	_validateChange: function(value) {
		if (value == null) 
			return !(this.values==null || this.values.length==0);
		
		var newValues = value.toString().split(this.separator);
		
		if (this.values==null && newValues.length>0)
			return true;
		if (newValues.length!=this.values.length)
			return true;
			
		for (var i=0; i<newValues.length; i++) {
			if (this.values[i]!=newValues[i]) {
				return true;
			}
		}
		return false;
	},
	
	_onKeyUp: function(evt) {
		this.keyCode = evt.keyCode;
		//社保需求，在抬起按钮后确认是否为功能键或功能键+其他键；
		//功能键不过滤选项；功能键+其他做过滤选项
		var needPopupFiltItems = true;
		var currentKeyCode = evt.keyCode;
		if(currentKeyCode==dojo.keys.SHIFT 
			|| currentKeyCode==dojo.keys.ALT
			|| currentKeyCode==dojo.keys.CTRL){
			needPopupFiltItems = false;
		}
		if (this.disabled || (this.readOnly&&unieap.global.combobox_notReadonlyPopup)) {
			if(evt)dojo.stopEvent(evt);return;
		}

		var interest = this._interestInKeyCode(evt);
		if (interest && this.autoCompleter) {
			!this.dataProvider&&(this.dataProvider={});
			if(!this.dataProvider.declaredClass){
				var ds=new unieap.ds.DataStore();
				this.dataProvider.store=ds;
				this.getDataProvider().setDataStore(ds);
			}
			this._job(this.getAutoCompleter(), "_handleKeyUp");
		}
		this.inherited(arguments);
		//ComboBox聚集时，按上下键弹出下拉框（社保）U_EAP00021852
		if(!(this.readOnly&&unieap.global.combobox_notReadonlyPopup) && (evt.keyCode == dojo.keys.UP_ARROW || evt.keyCode == dojo.keys.DOWN_ARROW ) && !this.getPopup().isOpen()){
			this.getPopup().open();
		}
		if (interest) {
			clearTimeout(this._uphandle);
			this._uphandle = setTimeout(dojo.hitch(this,function(){
				if (!this._keyPressed && !this._hasBlur) { //如果是从其他控件的keydown来到本域内keyup
					if(this.keyCode != dojo.keys.TAB && this.keyCode != dojo.keys.ENTER){
						this.getPopup().open();
					}
				} else { 
					if(!this._hasBlur&&!this.readOnly && needPopupFiltItems){
						//如果完全是本域内事件
						var items = this.getDataProvider().getItems(this.getText());
						if (dojo.isArray(items) && items.length>0) {
							this.getPopup().open(items, [], this._onPopupClose);
						} else if (this.getPopup().isOpen()){
							this.getPopup().close(function(){});// 要求popup什么都不做，只是关闭
						}
					}
				}
			}),150);
		}
	},
	
	_onKeyDown: function(evt) {
		this.getPopup()._handleKeyDown(evt);
		this.inherited(arguments);
		this._keyPressed = true;
		this._hasBlur = false;
	},
	
	_onBlur: function(evt) {
		if (this._interestInBlur(evt)) {
			this._keyPressed = false;
			this.getPopup()._inmousedown = false;
		}
		this._hasBlur = true;
		this.inherited("_onBlur",arguments);
	},
	
	// service functions
	// 判断是否对事件键值敏感
	_interestInKeyCode: function(evt) {
		var keyCode = evt.keyCode;
		return !((keyCode<2 && keyCode!=dojo.keys.BACKSPACE)
					|| (keyCode>=33 && keyCode<=46) 
					|| (keyCode>=112 && keyCode<=123)
					|| (evt.ctrlKey&&keyCode==65));
	},
	
	_interestInBlur: function(evt) {
		if (this.getPopup()._inmousedown) {
			return false;
		}
		return this.inherited(arguments);
	},
	
	destroy: function(){
		if (this.inputNode){
			this.inputNode.onfocus = null; //防止内存泄漏
		}
		var cascade = this.getCascade();
		if(cascade && cascade.primary){
			delete dojo.global.ComboBoxCascadeMap[(this._rootID || "") + cascade.primary];
		}
		if(this.autoCompleter){
			var keyUpHandle = this.autoCompleter["_handleKeyUpHandle"];
			if(keyUpHandle){
				window.clearTimeout(keyUpHandle);
			}
		}
		this.inherited(arguments);
	},
	
	//社保需求：在下拉框中输入内容，回车后能将第一个模糊匹配值选中
	_setFirstValueWhenTypeEnter: function(){
		var tempValue = null;
		var text = this.getText();
		var items = this.getDataProvider().getItems(text);
		if(dojo.isArray(items) && items.length>0 && text!=null && text!="")
			tempValue = this.getDecoder().code(items[0]);
		this._setValue(tempValue,true);

	},
	
	// 判断输入值是否合法
	_validateValue: function(value) {
		if (value == null) return true;// 允许空值
		var items = this.getDataProvider().getItems();
		var vals = value.toString().split(this.separator);
		var  valueAttr= this.getDecoder().valueAttr;
		if ((!dojo.isArray(items) || items.length==0) && vals.length>0)
			return false;
		if (vals.length > items.length)
			return false;
		for (var i=0; i<vals.length; i++) {
			var match = false, v=vals[i];
			for (var j=0; j<items.length; j++) {
//				if (v == items[j][valueAttr]) {
//					match = true;
//					break;
//				}
				if (v == this.dataProvider._getItemValueIgnoreCase(items[j],valueAttr)) {
					match = true;
					break;
				}
			}
			if (!match)
				return false;
		}
		return true;
	}
});
