dojo.provide("unieap.form.InlineEditBox")
dojo.require("unieap.form.FormWidget")
dojo.declare("unieap.form.InlineEditBox",unieap.form.FormWidget,{
	
	
	/**
	 * @declaredClass:
	 * 		unieap.form.InlineEditBox
	 * @superClass:
	 * 		unieap.form.FormWidget
	 * @summary:
	 * 		从外表上看,InlineEditBox控件是一个只读文本;当点击只读文本时,会弹出一个编辑器,它可以对文本进行编辑。编辑器失去焦点后，编辑器消失，文本的值发生改变。
	 * @img:
	 * 		images/form/inlineeditbox.png
	 * @example:
     * |<form dojoType="unieap.form.Form" binding="{store:'empStore'}">
     * |	<div id="sex" dojoType="unieap.form.InlineEditBox" binding="{name:empName}" editor="{editorClass:'unieap.form.TextBox'}">
     * |	</div>
     * |</div>
	 */
	 
	 
	 UserInterfaces : dojo.mixin({
		showUnderLine : "boolean",
		decoder : "object",
		editor : "object",
		displayFormatter: "object",
		value : "string",
		disabled : "boolean",
		skipFocus : "boolean",
		width: "string",
		onChange : "function",
		onDblClick : "function",
		maxLength : "number",
		minLength : "number",
		required: "boolean"
	},
	unieap.form.FormWidget.prototype.UserInterfaces),
	 
	templateString:
			"<div class=\"u-form-inlineWidget\">" +
				'<div dojoAttachPoint=\"inlineNode\"  class="u-form-inline">' +
				 "<div dojoAttachPoint='requiredNode' class='u-form-required'>*</div>" +
					"<div dojoAttachPoint=\"modifiedNode\" class=\"u-form-modified\"></div>" +
					"<div dojoAttachPoint='errorNode' class='u-form-error'></div>"+
					'<div class="u-form-inline-display" dojoAttachPoint="displayNode,focusNode"></div>' +
				 "</div>" + 
			'</div>',
				  

	
	/**
	 * @summary:
	 * 		设置是否在只读文本下显示下划线
	 * @type:
	 * 		{boolean}
	 * @default:
	 * 		false
	 * @example:
	 * |	<div dojoType="unieap.form.InlineEditBox" showUnderLine="true"></div>
	 */
	showUnderLine:true,
	
	/**
	 * @summary:
	 * 		设置InlineEditBox的转码,例如将数字3转码成辽宁省等
	 * @type:
	 * 		{object}
	 * @example:
	 * |	<div dojoType="unieap.form.InlineEditBox" decoder="{store:'provinceStore',displayAttr:'id',valueAttr:'name'}"></div>
	 *      decoder的valueAttr和displayAttr属性的值分别为id,name。
	 */
	decoder:null,
	
	
	/**
	 * @summary:
	 * 		对InlineEditBox控件的显示值进行格式化
	 * @type:
	 * 		{object}
	 * @example:
	 *      下面的代码会把数字22转换为"$22.00"
	 * |	<div dojoType="unieap.form.InlineEditBox" displayFormatter="{declaredClass:'unieap.form.NumberDisplayFormatter',dataFormat:'$###,###.00'}"></div>
	 *      下面的代码会把字符串"1202745600000"变为"2008/02/02"
	 * |	div dojoType="unieap.form.InlineEditBox" displayFormatter="{declaredClass:'unieap.form.DateDisplayFormatter',dataFormat:'yyyy/MM/dd'}"></div>
	 *      
	 */
	displayFormatter:null,
	
	/**
	 * @summary:
	 * 		对日期值进行格式化。
	 * @type:
	 * 		{object}
	 * @example:
	 * 		假设有一个字符串为"2008-01-01",我们想把它格式化成"2008/01/01"
	 * |	<div dojoType="unieap.form.InlineEditBox" value="2008-01-01" valueFormatter="{declaredClass:'unieap.form.DateValueFormatter',dataFormat:'yyyy-MM-dd'}"
	 * |		 displayFormatter="{declaredClass:'unieap.form.DateDisplayFormatter',dataFormat:'yyyy/MM/dd'}">
	 * |	</div>
	 * 		
	 */
	valueFormatter:null,
	
	
	/**
	 * @summary:
	 * 		设置InlineEditorBox控件的编辑器,默认编辑器为unieap.form.TextBox
	 * 
	 * @type：
	 * 		{object}
	 * @example:
	 * |	<div dojoType="unieap.form.InlineEditBox" editor="{editorClass:'unieap.form.TextBox'}"></div>
	 * |	<div dojoType="unieap.form.InlineEditBox" editor="{editorProps:{required:true}}"></div>
	 */
	editor:{},
	
	/**
	 * @summary:
	 * 		设置是否禁用InlineEditBox控件
	 * @type:
	 * 		{boolean}
	 * @default:
	 * 		false
	 * @description:
	 * 		禁用后,控件将不可编辑
	 */
	disabled:false,
	/**
	 * @summary:
	 * 		设置控件的值是否必须
	 * @description:
	 * 		如果为true,控件用淡黄色背景色标示
	 * @type:
	 * 		{boolean}
	 * @example:
	 * | <div id="id" dojoType="unieap.form.InlineEditBox" binding="{name:id}" required="true"></div>
	 * @img:
	 * 		images/form/require.png
	 */
	required:false,
	/**
	 * @type:
	 * 		{number}
	 * @summary:
	 * 		设置控件能输入的最大长度
	 * @description:
	 * 		可以在global.js中配置一个汉字占用多少个字符
	 * @example:
	 * |<div dojoType="unieap.form.InlineEditBox" maxLength="6"></div>
	 * 		上述代码表示控件最多能输入6个字符,当设置汉字占用两个字符时控件只能输入3个汉字,输入多个会提示错误信息
	 */
	maxLength : -1,
	/**
	 * @type:
	 * 		{number}
	 * @summary:
	 * 		设置控件必须输入的最小长度,当长度没有达到需求时,控件会提示错误
	 * @description:
	 * 		当minLength的值大于maxLength时，设置的minLength将无效
	 * @example:
	 * |<div dojoType="unieap.form.InlineEditBox" minLength="6"></div>
	 */
	minLength : -1,

	/**
	 * @summary:
	 * 		控件初始化时显示的文本值
	 * @type:
	 * 		{string}
	 */
	value: "",

	//回车聚焦时跳过
	skipFocus: true,
	
	width: "",
	firstSet:true,
	
	validatorClass:'unieap.form.InlineEditBoxValidator',
	
	/**
	 * @summary:
	 * 		当控件的值发生变化时触发
	 * @param:
	 * 		{object} value
	 */
	onChange:function(value){
		
	},
	/**
	 * @summary:
	 * 		双击控件时触发
	 * @param:
	 * 		{object} event
	 */
	onDblClick : function (evt){
	},
	
	postCreate: function(){
		//设置静态文本格式化参数
		unieap.setLabelFormatProps(this);
		//如果设置了显示下划线
		if(!this.showUnderLine){
			//设置一个无效的1px 下划线消失?why?如果为空,ff下下划线不消失
			this.inlineNode.style.height= '20px';
			this.inlineNode.style.borderBottom="1px";
		}		
        //给displayNode增加点击事件
	    this.connect(this.domNode, 'onclick', '_onClick');
		this.connect(this.inlineNode, 'onmouseover', '_onMouseover');
		this.connect(this.inlineNode, 'onmouseout', '_onMouseout');
		this.connect(this.inlineNode, "onfocus", "_onFocus");
		
		//设置disabled属性
		this.disabled && this.setDisabled(this.disabled);
		this.required && this._setRequired(this.required);
		//文本默认居左
		dojo.style(this.displayNode, 'text-align', 'left');
		this.maxLength >-1 && (this.getEditor().editWidget.maxLength = this.maxLength);
		//初始化displayNode的值
		this.value&&this.setValue(this.value);
		  
		//由于数据绑定后源binding属性将变为unieap.form.FormWidgetBinding,克隆原有的binding属性
		this.orignBinding = dojo.clone(this.binding);
		this._setWidth();
		this._setHeight();
		this.tabIndex && dojo.attr(this.inlineNode,"tabIndex",this.tabIndex);
		this.tabIndex && dojo.attr(this.getEditor().editWidget.focusNode,"tabIndex",this.tabIndex);
	},
	
	destroy:function(){
		//销毁InlineEditor中的editWidget，以免发生内存泄露
		if(this.getEditor().editWidget){
			this.getEditor().editWidget.destroy();
		}
		this.inherited(arguments);
	},
	
	_onFocus:function(evt) {
		//屏蔽页面授权时点击inlineEditBox
		if(this.disabled) {return;}
		if(evt){ dojo.stopEvent(evt); return;}
		this.getEditor().attachEditor();
		if(this.tabIndex && dojo.attr(this.getEditor().editWidget.focusNode,"tabIndex") != dojo.attr(this.inlineNode,"tabIndex"))
			 dojo.attr(this.getEditor().editWidget.focusNode,"tabIndex",dojo.attr(this.inlineNode,"tabIndex"));
	},

    //点击只读文本时触发
	_onClick: function(evt){
		//如果配置了禁用属性或者正在编辑中……
		if(this.disabled || this.editing){ return; }
		if(evt){ dojo.stopEvent(evt); }
		var editor = this.getEditor();		
		editor.attachEditor();
	},
	
	focus : function(){
		var editor = this.getEditor();		
		editor.attachEditor();
	},
	_onMouseover: function(evt) {
		//displayNode Div实际高度>行高，说明换行，Inline显示不下，需要Tooltip
//		var needTooltip = dojo.style(this.displayNode, "height") 
//						> dojo.style(this.displayNode, "lineHeight");
		var needTooltip = this.displayNode.scrollWidth > dojo.style(this.displayNode, "width");
		var text = this.getText();
		var domNode = this.domNode;
		if(needTooltip && text) {
			this.toolTip = window.setTimeout(function(){
				unieap.showTooltip({inner:text,autoClose:true},domNode);
			},500);
		}
	},
	
	_onMouseout: function(evt) {
//		var needTooltip = dojo.style(this.displayNode, "height") 
//						> dojo.style(this.displayNode, "lineHeight");
		var needTooltip = this.displayNode.scrollWidth > dojo.style(this.displayNode, "width");
		var domNode = this.domNode;
		if(needTooltip && this.toolTip) {
			window.clearTimeout(this.toolTip);
			unieap.hideTooltip(domNode);
		}
	},
	
	//获得编辑器对象,获得一次后讲缓存这个编辑器对象.缓存过程可以查看getModuleInstance这个方法
	getEditor:function(){
		this.editor.editorProps = dojo.mixin({},
			this.editor.editorProps,
			{binding:this.orignBinding}
		);
		return unieap.getModuleInstance(this,"editor","unieap.form.InlineEditor");
	},
	
	//用户可以自己定义自己的formatter,例如
	//displayFormatter="{declaredClass:'unieap.form.NumberDisplayFormatter',dataFormat:'###,###.00'}"
	getDisplayFormatter:function(){
		return unieap.getModuleInstance(this,"displayFormatter","unieap.form.SimpleFormatter");
	},
	
	//获得Decoder对象
	getDecoder:function(){
		return unieap.getModuleInstance(this,"decoder","unieap.form.InlineDecoder");
	},
	
	/**
	 * @summary:
	 * 		设置InlineEditBox控件的解码器
	 * @param:
	 * 		{object} decoder
	 * @example:
	 * |	unieap.byId("inline").setDecoder({store:'ds',valueAttr:'id',displayAttr:'name'});
	 */
	setDecoder:function(decoder){
		this.getDecoder = dojo.getObject(this.declaredClass).prototype.getDecoder;
		this.decoder=decoder;
		this.setValue(this.value);
	},
	
	//对日期进行格式化
	getValueFormatter:function(){
		return unieap.getModuleInstance(this,"valueFormatter","unieap.form.SimpleFormatter");
	},
	
	setValue: function(value){
		(value==null||typeof(value)=="undefined")&&(value="");
		if(this.firstSet){
			this.oldValue = value;
			this.firstSet = false;
		}
		else
			this.oldValue = this.value;
		this.value=value;
		//如果处于控件处于编辑状态，直接返回
		if (this.editing) {
			return;
		}
		//进行解码操作
		if(this.decoder){
			value=this.getDecoder().decode(value);
		}
		//value值格式化操作
		if (this.valueFormatter) {
			value = this.getValueFormatter().format(value);
		}
		
		//显示值格式化操作
		if (this.displayFormatter) {
			value = this.getDisplayFormatter().format(value);
		}
		this.setText(value);
		this.fireDataChange();
	},
	/**
	 * @summary:
	 * 		设置是否禁用控件,背景颜色为"不可用"灰色
	 * @param:
	 * 		{bolean} bool 
	 */	
	setDisabled: function(disabled) {
		this.disabled = disabled;
//		this.domNode.disabled = disabled;
//		if(disabled){
//		   dojo.addClass(this.domNode, 'u-form-disabled');
//		}else{
//		   dojo.hasClass(this.domNode, 'u-form-disabled') && dojo.removeClass(this.domNode, 'u-form-disabled');
//		}
	},
	/**
	 * @summary:
	 * 		获得控件的值
	 * @return:
	 * 		{string}
	 * @example:
	 * |	例如控件的值是"0411",但显示成"大连"。那么getValue()返回的就为0411
	 */
	getValue: function(){
		return this.value;
	},
	
	/**
	 * @summary:
	 * 		获取控件的文本值
	 * @return:
	 * 		{string}
	 */
	getText:function(){
		return this.displayNode[dojo.isFF?"textContent":"innerText"] || "";
	},
	
//	_setWidth: function(){
//		var Width = this.width || this.domNode.style.width;
//		Width && dojo.style(this.domNode, "width", isNaN(Width)?Width:(this.width+"px"));
//	},
//	_setHeight : function(){
//		var Height = this.height || this.inlineNode.style.height;
//		Height && dojo.style(this.inlineNode, "height", isNaN(Height)?Height:(this.height+"px"));
//	},
	
	 _setWidth: function(){
		var Width = this.width || this.domNode.style.width;
		Width && dojo.style(this.domNode, "width", isNaN(Width)?Width:(this.width+"px"));
		Width && dojo.style(this.inlineNode, "width", "100%");
	},
	_setHeight : function(){
		var Height = this.height || this.domNode.style.height;
		Height && dojo.style(this.domNode, "height", isNaN(Height)?Height:(this.height+"px"));
		Height && dojo.style(this.inlineNode, "height", "100%");
	},

	/**
	 * @summary：
	 * 		设置控件的显示值
	 */
	setText:function(text){
		if(text == null)
			text = "";
		this.displayNode[dojo.isFF?"textContent":"innerText"] = text;
		if(this.getEditor().editWidget.declaredClass == "unieap.form.Textarea"){
			this.displayNode.style.lineHeight = "normal";
		}
	},
	      
	_setRequired: function(required) {
		this.required = required;
		this.requiredNode && dojo.style(this.requiredNode,"visibility",required?"visible":"hidden");
	}
});