dojo.provide("unieap.form.TextBoxWithIcon");
dojo.require('unieap.form.TextBox');
dojo.declare("unieap.form.TextBoxWithIcon", unieap.form.TextBox,{
	/**
	 * @declaredClass:
	 * 		unieap.form.TextBoxWithIcon
	 * @summary:
	 * 		带图标的文本框。
	 * 		可以定义图标样式。
	 * @superClass：
	 * 		unieap.form.TextBox
	 * @example:
	 * |<div dojoType="unieap.form.TextBoxWithIcon" iconClass="newIcon"></div>
	 * @img:
	 * 		images/form/textboxwithicon_common.png
	 */
	
	//用户属性配置接口
	UserInterfaces : dojo.mixin({
		label: "string",
		cancelText : "string",
		fileFilter: "string",
		iconClass: "string",
		showIcon: "boolean",
		onBeforeIconClick: "function",
		onIconClick: "function",
		onBeforeCancel: "function",
		onCancel: "function",
		onChange: "function",
		popup: "object"
	},
	unieap.form.TextBox.prototype.UserInterfaces), 
	
	templateString :
		"<div class=\"u-form-widget\">"+
			"<div dojoAttachPoint='requiredNode' class='u-form-required'>*</div>" + 
			"<div dojoAttachPoint=\"fieldNode\" class=\"u-form-field\">"+
				"<div dojoAttachPoint=\"modifiedNode\" class=\"u-form-modified\"></div>"+
				"<a href='javascript:void(0);' tabindex='-1' class=\"u-form-textbox-icon u-form-textbox-icon-normal u-a-common\" dojoAttachPoint=\"iconNode\"></a>"+
				"<div dojoAttachPoint=\"errorNode\" class=\"u-form-error\"></div>"+
				"<div class=\"u-form-textbox-field\">" +
					"<input dojoAttachPoint=\"inputNode,focusNode,textbox\" class=\"u-form-textbox-input\" onfocus=\"unieap.fep&&unieap.fep(this)\">"+
				"</div>" + 	
			"</div>" + 	
		"</div>",
	
	/**
	 * @summary:
	 * 		设置控件是否显示右侧图标。
	 * @type:
	 * 		{boolean}
	 * @default:
	 * 		true
	 */
	showIcon:true,
	
	
	/**
	 * @summary:
	 * 		通过改变css样式来设置控件右侧的图标
	 * @type:
	 * 		{string}
	 * @example:
	 * |<style type="text/css">
	 * |	.newIcon{
	 * |		border-left: 1px solid #7f9db9; 
	 * |		width: 16px; 
	 * |		height: 19px; 
	 * |		float: right; 
	 * |		overflow:hidden;
	 * |		background:url("../images/find.gif") no-repeat;
	 * |	}
	 * |</style>
	 * |<div dojoType="unieap.form.TextBoxWithIcon" iconClass="newIcon"></div>
	 * @img:
	 * 		images/form/textboxwithicon.png
	 */
	iconClass:"u-form-textbox-icon",
	
	/**
	 * @type：
	 * 		{object}
	 * @summary:
	 * 		设置弹出控件控制器
	 * @see：
	 * 		unieap.form.Popup
	 */
	popup:null,
	
    /**
	 * @type：
	 * 		{boolean}
	 * @summary:
	 * 		设置当点击图标的时候，是否将光标转移到其他控件，默认为false，即不进行转移
	 * @default:
	 * 		false
	 */
	focusShift:false,
	
	popupClass:"unieap.form.Popup",
	
	_infield: false,

	/**
	 * @summary:
	 * 		点击图前回调事件
	 * @param：
	 * 		{event} evt
	 */
	onBeforeIconClick:function(evt){
		return true
	},
	
	/**
	 * @summary:
	 * 		点击图标触发的事件
	 * @param：
	 * 		{event} evt
	 */
	onIconClick:function(evt){},
	
	/**
	 * @summary:
	 * 		重新设置TextBoxWithIcon控件右侧的图标的样式
	 * @param:
	 * 		{string} className
	 * @example:
	 * |<style type="text/css">
	 * |	.newIcon{
	 * |		border-left: 1px solid #7f9db9; 
	 * |		width: 16px; 
	 * |		height: 19px; 
	 * |		float: right; 
	 * |		overflow:hidden;
	 * |		background:url("../images/find.gif") no-repeat;
	 * |	}
	 * |</style>
	 * |<script type="text/javascript">
	 * |	var box = unieap.byId('box');
	 * |	box.setIconClass('newIcon');
	 * |</sript>
	 * |<div id="box" dojoType="unieap.form.TextBoxWithIcon"></div>
	 * |
	 */
	setIconClass:function(className){
		dojo.removeClass(this.iconNode,this.iconClass);
		dojo.addClass(this.iconNode,className);
		this.iconClass=className;
	},
	
	/**
	 * @summary:
	 * 		重新设置TextBoxWithIcon控件右侧的图标的是否显示
	 * @param:
	 * 		{boolean} show
	 * @example:
	 * |<script type="text/javascript">
	 * |var show=false;
	 * |	function showIcon(){
	 * |		dijit.byId("text1").changeIconState(show);
	 * |		show=!show
	 * |	}
	 * |</sript>
	 * |<div id="text1" dojoType="unieap.form.TextBoxWithIcon"></div>
	 * |<div dojoType="unieap.form.Button" onClick="showIcon" label="改变图标显示"></div>
	 * |
	 */
	changeIconState: function(show){
		if(!show){
			dojo.style(this.iconNode,"display","none");
		} else {
			dojo.style(this.iconNode,"display","block");
		}
	},
	
	postCreate:function(){
		this.inherited(arguments);
		if(this.iconClass){
			dojo.addClass(this.iconNode,this.iconClass);
		}
		this.connect(document.body, "onclick", "_onBodyClick");
		if(dojo.isFF){
			this.connect(document.body, "DOMMouseScroll", "_onBodyClick");
		}else{
			this.connect(document.body, "onmousewheel", "_onBodyClick");
		}
		this.connect(this.fieldNode, "onmousedown", "_mouseDownInFiled");
		this.connect(this.iconNode, "onclick", "_onIconClick");
		this.connect(this.iconNode, "onblur", "_onIconBlur");
		!this.showIcon&&dojo.style(this.iconNode,"display","none");
	},
	//对下拉按钮增加禁用样式
	setDisabled: function() {
		this.inherited(arguments);
		if(this.disabled){
			dojo.removeClass(this.iconNode,'u-form-textbox-icon-normal');
			dojo.addClass(this.iconNode,'u-form-textbox-icon-disabled');
		}else{
			dojo.removeClass(this.iconNode,'u-form-textbox-icon-disabled');
			dojo.addClass(this.iconNode,'u-form-textbox-icon-normal');
		}
	},
	
	/**
	 * @summary:
	 * 		得到下拉框的下拉控制器
	 * @return：
	 * 		{unieap.form.Popup}
	 * @see：
	 * 		unieap.form.Popup
	 */
	getPopup: function(){
		return unieap.getModuleInstance(this,"popup",this.popupClass);
	},
	
	
	/////////////////////////////////////  内部事件  ////////////////////////////////////////////////
	destroy: function() {
		if(this.popup&&this.popup.destroy){
			this.popup.destroy();
		}
		this.inherited(arguments);
	},
	
	_mouseDownInFiled: function() {
		this._infield = true;
	},
	
	_onIconClick: function(evt) {
		if(!(this.readOnly&&unieap.global.textboxwithicon_notReadonlyPopup)&&!this.disabled&& unieap.fireEvent(this,this.onBeforeIconClick,[evt])) {
			unieap.fireEvent(this,this.onIconClick,[evt])
			var popup=this.getPopup();
			if(popup._isShowingNow){
				popup.close()
			}else{
				popup.open()
			}
		}
	},
	
	// 抽出这个api 是为了方便定制，用户可以重载这个方法
	// 请不要随便修改这个方法 chenxujie
	_canPopOpen: function() {
		return true;
	},
	
	_onIconBlur: function(evt) {
		if (this._interestInBlur(evt))
			this._onBlur(evt);
	},

	_onBlur: function(evt,flag) {
		if (this._interestInBlur(evt)) {
			this._onBeforeBlur&&this._onBeforeBlur();
			this.getPopup().close();
			this.inherited("_onBlur",arguments); 
		}else if(arguments.length > 1 && !this._infield){
			this.inherited("_onBlur",arguments); 
		}
		this._infield = false;
	},
	_onBodyClick: function(evt) {
		if(unieap.isClassEntity(this.popup)&&this.getPopup()._isShowingNow){
			var t = evt.target;
			if (dojo.isDescendant(t,this.domNode)||dojo.isDescendant(t,this.getPopup().domNode)) {
				return;
			}else {
				this.getPopup().close();
				if (dojo.isSafari || dojo.isChrome) {
					this.inherited("_onBlur",arguments);
				}
			}
		}
		this._infield = false;
	},	
	//触发tab键
	_onTab: function(evt) {
		this.getPopup().close();
		this.inherited("_onTab",arguments);
		this._infield = false;
	},
	
	// 判断是否应该执行_onBlur
	_interestInBlur: function(evt) {
		if (!evt||typeof(evt)=="string")
			return false;
			
		var at = null;
		if (dojo.isIE) {
			at = document.activeElement;
		} else if (dojo.isFF) {
			at = evt.explicitOriginalTarget;
		} else if (dojo.isChrome){
			at = evt.currentTarget;
		} else if (this._infield) {
			at = this.iconNode;
		}
		if (at == this.iconNode) {
			return false;
		}
		if(dojo.isDescendant(at,this.domNode)
			|| (this.getPopup() && dojo.isDescendant(at,this.getPopup().domNode))) {
			//FF下日期控件不执行onBlur会赋值不上
			if(!dojo.isIE && this.declaredClass == "unieap.form.DateTextBox"&&!this.dateYM) return true;
			return false;
		}
		return true;
	}

});