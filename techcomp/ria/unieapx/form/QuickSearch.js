dojo.provide("unieapx.form.QuickSearch");
dojo.require("unieap.form.ComboBox");
dojo.declare("unieapx.form.QuickSearch", unieap.form.ComboBox, {

	UserInterfaces : dojo.mixin( {
		config : "string",
		detailDialog : "string",
		onClear : "function",
		onBeforeQuery : "function",
		onComplete : "function",
		bindable : "boolean",
		onlySelect: "boolean",
		onBeforeSendQuery : "function"
	}, unieap.form.ComboBox.prototype.UserInterfaces),

	popupClass : "unieapx.form.QuickSearchPopup",
	width : "300px",
	/**
	 * @summary:
	 * 		选择选中的值后是否不清空控件
	 * @description:
	 * 		如果设置为false时，可以在onSelect事件中处理业务逻辑，而控件实际的值会被清空
	 * @type：
	 * 		{boolean}
	 */
	bindable : true,
	
	//是否支持手动输入
	onlySelect: true,
	
	/**
	 * @summary:
	 * 		自定义查询对话框id
	 * @description:
	 * 		可以自定义查询对话框，精确查找数据，该项为配置自定义查询对话框id
	 * @type：
	 * 		{string}
	 */
	detailDialog:"",
	
	iconClass : "quicksearchIcon",
	textValidate : false,
	comboShowSelect : false,
	
	//弹出窗口Dialog对象
	_dlg : null,
	//是否是用鼠标点击选中
	_isClick: false,
	//通过绑定数据和quicksearch查询只有一条数据直接赋值时，设置_isSetText为true
	_isSetText: false,
	//标示控件是否是通过选择得到的值，非选择得到的值在onBlur时清空控件的值
	_hasValue: false,
	
	
//	_isClearing: false,
	_selectedText: '',
	_oldValue:'',
	constructor: function(inView) {
		this.inherited(arguments);
	},

	postCreate : function() {
		this.connects = [];
		this._tooglePrompt();
		this._toogleIcon();
		this.connects.push(dojo.connect(this.getBinding(),'bind',this,'_bindText'));
		if(!this.bindable) this.onlySelect = false;
		this.inherited(arguments);
	},
	
	_bindText: function(row){
		if(!row) return;
		this.connects.push(dojo.connect(row.getRowSet(),"onItemChanged",this,'_onBindChange'));
		this._onBindChange(row, true);
		if(0 == row.getRowSet().getRowCount()){
			this.getPopup()._clearSelection();
		}
	},
	
	_onBindChange: function(row, isbindText){
		var self = this;
		if(row.isItemChanged(self.getBinding().name) || ('undefined' != typeof isbindText) && true == isbindText){
			setTimeout(function(){
				var items = self.getDataProvider().getItems();
				if(self.onlySelect &&row.getItemValue(self.getBinding().name)&&self.inputNode && self.getText() ){
					//通过绑定数据和quicksearch查询只有一条数据直接赋值时，设置_isSetText为true
					self._isSetText = true;
				}else{
					self._isSetText = false;
				}
			},0);
		}
	},
	
	_onKeyUp:function(evt){
		if(this.disabled){
			dojo.stopEvent(evt);
			return;
		}
		if(this.onlySelect){
			var keyCode = evt.keyCode;
			if( ((this._isSetText && this.getText()!="" && !this.getPopup().isOpen()) || 
			    (keyCode != dojo.keys.ENTER &&this.getPopup()._isSelecting())) && 
			    ( keyCode!=dojo.keys.DOWN_ARROW && keyCode!=dojo.keys.UP_ARROW && keyCode!=dojo.keys.TAB)
					){
				dojo.stopEvent(evt);
				return ;
			}
		}
		this.inherited(arguments);
	},
	
	_onKeyDown: function(evt) {
		if(this.disabled){
			dojo.stopEvent(evt);
			return;
		}
		if(this.onlySelect){
			var keyCode = evt.keyCode;
			if( ((this._isSetText && this.getText()!=""&& !this.getPopup().isOpen()) || 
				    (keyCode != dojo.keys.ENTER &&this.getPopup()._isSelecting())) && 
				    ( keyCode!=dojo.keys.DOWN_ARROW && keyCode!=dojo.keys.UP_ARROW && keyCode!=dojo.keys.TAB)
						){
				dojo.stopEvent(evt);
				return ;
			}
			if(keyCode == dojo.keys.ENTER){
				this.getPopup()._handleKeyDown(evt);
				if(unieap.fireEvent(this,this.onEnter,[evt])==false) return;
				this._keyPressed = true;
				this._hasBlur = false;
				return;
			}
		}
		this.inherited(arguments);
	},

	_interestInKeyCode : function(evt) {
		var keyCode = evt.keyCode;
		var popUpWidget = this.getPopup()
		if(popUpWidget.isOpen() && keyCode!=dojo.keys.DOWN_ARROW && keyCode!=dojo.keys.UP_ARROW && keyCode!=dojo.keys.ENTER){
				popUpWidget._clearSelection();
				this._oldValue = this.getText();
				popUpWidget.close();
		}
		if(keyCode = dojo.keys.ENTER){
			return null;
		}else{
			return !((keyCode<2 && keyCode!=dojo.keys.BACKSPACE)
					|| (keyCode>=33 && keyCode<=46) 
					|| (keyCode>=112 && keyCode<=123)
					|| (evt.ctrlKey&&keyCode==65));
		}
	},

	setValue: function(value){
		if ((value === "" || value ===undefined)&& !this._isClick) {
			value = null;
			this.getPopup()._clearSelection();
		}
		this._setValue(value);
		!this.readOnly && this.getValidator().validate();
	},
	
	onEnter : function(evt) {
		dojo.stopEvent(evt);
		if(this.disabled) return;
		if (this.readOnly || ((this.onlySelect) && this.getPopup()._isSelecting() && this.inputNode && this.getText()))
			return true;
		var p = this.getPopup();
		if ((!p._selection || p._selection.length == 0 || p._selection[0][this.decoder.displayAttr] != this.getText() || this.getDataProvider().getDataStore() == null)){
			this.getAutoCompleter()._sendQuery(this.getText());
//			this._isClearing = false;
			return false
		}
		return true;
	},

	_onFocus : function(evt) {
		if(this.disabled){
			dojo.stopEvent(evt);
			return;
		}
		this._tooglePrompt();
		this._hasBlur = false;
	},

	_onBlur : function(evt) {
		if (this.bindable) {
			this.inherited(arguments);
//			this.setValue(this.getText());
//			this.fireDataChange();
		}else{//不绑定数据的quicksearch当焦点离开的时候要设置为“”，然后在_tooglePrompt中改为提示信息
			this.setText("");
		}
//		if(this._hasBlur) return;
		if(this.onlySelect){
			if(this.getPopup()._isSelecting() || this._isSetText){
//				alert(" 保留 ");
			}else{
				if(this.getText()!='' &&  !this._hasValue)	{
					this.setValue("");
				}
			}
		}
		this._tooglePrompt();
		if (!this.readOnly && this._interestInBlur(evt)) {
			 this.getValidator().validate();
		}
		this._hasBlur = true;

	},
	
	onBeforeShowDialog : function(dlg){
		return true;
	},

	getAutoCompleter : function() {
		return unieap.getModuleInstance(this, "autoCompleter", "unieapx.form.QuickSearchAutoCompleter");
	},

//	getValue : function() {
//		return this.getText();
//	},

	_onIconClick : function(evt) {
		if(this.disabled || this.readOnly){
			dojo.stopEvent(evt);
			return;
		}
		if(this.getPopup().isOpen()) {
			dojo.stopEvent(evt);
			return;
		}
		if (this.iconClass == "lemis-icon-formqsdel") {
			if (this.onClear)
				this.onClear(evt);
			this.clear();
			/////////////////sun
			this.getPopup()._clearSelection();
		} else if (this.detailDialog) {
			var dlg = this._getDialog();
			if(dlg && this.onBeforeShowDialog && this.onBeforeShowDialog(dlg))
				this._getDialog().show();
		}
	},

	_changeValue: function(value,isBind) {
		this.values = value==null?[]:value.toString().split(this.separator);
		this._updateText();
		this.fireDataChange();
		if(!isBind){
			this.getCascade().cascade();
		}
	},
	

	setText : function(value) {
		this.inherited(arguments);
		this._toogleIcon();
	},

	_toogleIcon : function() {
		if(this.bindable){
			if (this.getText() == "" || (this.getPromptManager() && this.getPromptManager().promptMsg && this.getText() == this.getPromptManager().promptMsg)) {
				this.setIconClass(this.detailDialog?"lemis-icon-formqsfind":"lemis-icon-formqsfind-dis");
			} else {
				this.setIconClass("lemis-icon-formqsdel");
			}
		}
		else
			this.setIconClass(this.detailDialog?"lemis-icon-formqsfind":"lemis-icon-formqsfind-dis");	
	},

	_tooglePrompt : function(widget) {
		if(!widget)
			widget=this;
		if (!widget.bindable && widget.getPromptManager() && widget.getPromptManager().promptMsg) {
			if (widget.focused) {
				if (widget.getText() == widget.getPromptManager().promptMsg) {
					dojo.removeClass(widget.inputNode, "quicksearchPrompt");
					widget.setText("");
				}
			} else {
				if (widget.getText() == "" && !widget.getPopup().isOpen()) {
					dojo.addClass(widget.inputNode, "quicksearchPrompt");
					widget.setText(widget.getPromptManager().promptMsg);
				}
			}
		}
	},
	
	clear : function() {
		this.setValue(null);
		this.setText(null);
		this._isSetText = false;
		this._hasValue = false;
	},

	_getDialog : function() {
		if (!this._dlg) {
			this._dlg = unieap.byId(this._rootID ? this._rootID + this.detailDialog : this.detailDialog);
			if(this._dlg == undefined && _currentNodeOfSingleFrame && _currentNodeOfSingleFrame.id){
				this._dlg = unieap.byId(_currentNodeOfSingleFrame.id + this.detailDialog);
				this._dlg.domNode.notApplyWidget=true;
			}
			var me = this;
			this._dlg.onComplete = function(ds) {
				if (ds) {
					if(!(ds instanceof unieap.ds.DataStore)) ds = unieap.fromJson(ds);
					me.setText(ds.getRowSet().getItemValue(0, me.decoder.displayAttr));
					me.setValue(ds.getRowSet().getItemValue(0, me.decoder.valueAttr));
//					!me.readOnly && me.getValidator().validate();
					me.onComplete(ds);
					if (!me.bindable) {
						me.clear();
					}
					me._tooglePrompt();
				}
			}
		}
		return this._dlg;
	},
	
	onComplete: function(){
	},
	destroy: function(){
		while(this.connects.length){
			dojo.disconnect(this.connects.pop());
		}
		this.inherited(arguments);
	}

});