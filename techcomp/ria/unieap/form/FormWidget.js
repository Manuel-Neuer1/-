dojo.provide("unieap.form.FormWidget");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("unieap.util.util");

dojo.declare("unieap.form.FormWidget", [dijit._Widget, dijit._Templated],{
	/**
	 * @declaredClass:
	 * 		unieap.form.FormWidget
	 * @summary:
	 * 		FormWidget为所有表单控件的基类,它定义表单控件所需的一些基本属性和方法
	 */
	
	//配置属性接口
	UserInterfaces : {
		id : "string",
		jsId : "string",
		"class" : "string",
		style : "string",
		name : "string",
		tabIndex : "number",
		disabled : "boolean",
		display : "string",
		required : "boolean",
		width : "string",
		height : "string",
		binding : "object",
		validator : "object",
		nextFocusId : "string",
		securityId : "string"		
	},
	
	/**
	 * @summary:
	 * 		设置文本框的name属性
	 * @type:
	 * 		{string}
	 */
	name:'',
	
	/**
	 * @summary:
	 * 		设置Tab键的顺序
	 * @description:
	 * 		当用户按下Tab键时,控件会按照tabIndex值的大小依次被选中
	 * @type:
	 * 		{number}
	 * @img:
	 * 		images/form/tabIndex.png
	 * @example:
	 * |<div dojoType="unieap.form.Form" binding="{store:'empStore'}"></div>
	 * |	编号：<div id="id" dojoType="unieap.form.TextBox" binding="{name:id}" tabIndex="1"></div>
	 * | 	性别：<div id="sex" dojoType="unieap.form.TextBox" binding="{name:sex}" tabIndex="3"></div>
	 * |	城市：<div id="city" dojoType="unieap.form.ComboBox" binding="{name:city}" dataProvider="{store:'city'}" hasDefault="true" tabIndex="2">
	 * |</div>
	 * 未配置tabIndex属性的情况下，Tab键聚焦的顺序是：编号-->性别-->城市；
	 * 如上配置tabIndex属性以后,聚焦顺序是：编号-->城市-->性别。
	 * 注:为了代码清晰，上述示例代码去掉了布局代码
	 */
	tabIndex: 0,
	
	/**
	 * @summary:
	 * 		设置是否禁用控件
	 * @description：
	 * 		如果初始化的时候是可用状态，则不要在标签上配置disabled属性，
	 * 		浏览器是IE的情况下，只要设置disabled属性，就为不可用状态
	 * @type:
	 * 		{boolean}
	 * @example:
	 * | <div id="id" dojoType="unieap.form.TextBox" binding="{name:id}" disabled="true"></div>
	 * @img:
	 * 		images/form/disabled.png
	 */
	disabled: false,
	
	/**
	 * @summary:
	 * 		设置是否显示控件
	 * @description：
	 * 		设置display属性为block时,显示控件，当display为none时，则不显示控件
	 * @type:
	 * 		{string}
	 * @example:
	 * | <div id="id" dojoType="unieap.form.TextBox" binding="{name:id}" display="none"></div>
	 * 
	 */
	display: null,
	
	
	
	/**
	 * @summary:
	 * 		设置控件的值是否必须
	 * @description:
	 * 		如果为true,控件用淡黄色背景色标示
	 * @type:
	 * 		{boolean}
	 * @example:
	 * | <div id="id" dojoType="unieap.form.TextBox" binding="{name:id}" required="true"></div>
	 * @img:
	 * 		images/form/require.png
	 */
	required: false,
	
	
	/**
	 * @summary:
	 * 		设置控件的宽度,支持数字或者百分比
	 * @type:
	 * 		{number|string}
	 */
	width: "",

	/**
	 * @summary:
	 * 		设置控件的高度,支持数字或者百分比
	 * @type:
	 * 		{number|string}
	 * @example:
	 * | <div id="id" dojoType="unieap.form.TextBox" height="40px"></div>
	 * @example:
	 * | <div id="id" dojoType="unieap.form.TextBox" height="50%"></div>
	 */
	height: "",
	
	
	/**
	 * @summary:
	 * 		设置控件的数据绑定信息
	 * @type:
	 * 		{object}
	 * @example:
	 * | <div dojoType="unieap.form.Form" binding="{store:'empStore'}">
	 * | 	<div id="id" dojoType="unieap.form.TextBox" binding="{name:id}"></div>
	 * | </div>
	 * 如上例所示textbox绑定了empStore的id字段
	 */
	binding: null,
	
	/**
	 * @summary:
	 * 		校验器
	 * @type:
	 * 		{object}
	 * @example:
	 * |<div dojoType="unieap.form.TextBox" validator="{regExp:/^\d+$/,errorMsg:'只能输入数字'}></div>
	 * validator属性可以对控件的输入值进行校验,/^\d+$/是一个正则表达式,表示文本框的值只能为数字,否则会提示错误信息
	 * @img:
	 * 		images/form/textbox_validator.png
	 */
	validator: null,
	
	/**
	 * @summary:
	 * 		定义默认的验证实现类
	 * @description:
	 * 		子类可以替换其类的声明，而不必重载对应get方法(如：getValidator)
	 * @type:
	 * 		{string}
	 */
	validatorClass : "unieap.form.FormWidgetValidator",	
	
	/**
	 * @type:
	 * 		{string}
	 * @summary:
	 * 		设置焦点跳转的目的控件
	 * @description:
	 * 		Form控件支持回车聚焦功能（类似Tab键功能）：
	 * 		当焦点落到该控件时，回车事件会使焦点跳转到其他控件，Form中默认按控件在Form中的顺序跳转。
	 * 		可以通过设置nextFocusId属性，改变默认顺序，设置焦点跳转的目的控件。
	 * 		该功能在FireFox浏览器下，默认不能进行跨Form的焦点跳转，需要时可以通过配置该属性实现。
	 * @example:
	 * |<div dojoType="unieap.form.Form"></div>
	 * |	<div id="t1" dojoType="unieap.form.TextBox" nextFocusId="t3"></div>
	 * |	<div id="t2" dojoType="unieap.form.TextBox"></div>
	 * |	<div id="t3" dojoType="unieap.form.TextBox" nextFocusId="t2"></div>
	 * |</div>
	 * 		上述例子：当焦点落到控件t1上时，连续回车事件，焦点的跳转顺序是：t1->t3->t2，
	 * 		如果不配置nextFocusId属性的跳转顺序是：t1->t2->t3。
	 * 
	 * @example:
	 * |<div dojoType="unieap.form.Form" id="f1"></div>
	 * |	<div id="t1" dojoType="unieap.form.TextBox"></div>
	 * |	<div id="t2" dojoType="unieap.form.TextBox" nextFocusId="t3"></div>
	 * |</div>
	 * |<div dojoType="unieap.form.Form" id="f2"></div>
	 * |	<div id="t3" dojoType="unieap.form.TextBox"></div>
	 * |	<div id="t4" dojoType="unieap.form.TextBox"></div>
	 * |</div>
	 * 		上述例子控件t2配置了nextFocusId="t3",在FireFox浏览器下实现了跨Form焦点跳转。
	 */
	nextFocusId:'',
	
	securityId:'',

	
	postCreate: function() {
		//处理控件文本输入域的tabIndex
		if(this.tabIndex && this.focusNode && !this.readOnly ){
			dojo.attr(this.focusNode, "tabindex", this.tabIndex); 
		}
		this._setWidthAndHeigth();
		//设置disabled属性
		this.disabled && this.setDisabled(this.disabled);	
		//设置必填属性
		this.required && this._setRequired(this.required);
		//设置name属性
		this.name && this.inputNode&&(this.inputNode.name=this.name);
		//记录原始值
		this.origValue = this.value || "";
		//设置hidden属性，即是否显示
		this.display && this.setDisplay(this.display);
	},
	
	_setRequired: function(required) {
		this.required = required;
		this.requiredNode && dojo.style(this.requiredNode,"visibility",required?"visible":"hidden");
		var fieldNode = this.fieldNode;
		var inputNode = this.inputNode;
		if(required){
			fieldNode && dojo.hasClass(fieldNode,'u-form-file-required-right') && dojo.removeClass(fieldNode,'u-form-file-required-right');
			fieldNode && dojo.addClass(fieldNode,'u-form-file-required-error');
			inputNode && dojo.addClass(inputNode,'u-form-textbox-input-required');
		}else{
			fieldNode && dojo.hasClass(fieldNode,'u-form-file-required-error') && dojo.removeClass(fieldNode,'u-form-file-required-error');
			fieldNode && dojo.addClass(fieldNode,'u-form-file-required-right');		
			inputNode && dojo.hasClass(inputNode,'u-form-textbox-input-required') && dojo.removeClass(inputNode,'u-form-textbox-input-required');
		}
//		this.fieldNode&&dojo.addClass(this.fieldNode,required?"u-form-file-required-error":"u-form-file-required-right");
	},
	
	_setWidthAndHeigth: function() {
		//处理控件的宽度和高度
		this.width && dojo.style(this.domNode, "width", isNaN(this.width)?this.width:(this.width+"px"));
		//解决报表显示问题，同时修改了FileInput.js，解决height设置百分比无效问题
		if(this.height.indexOf("%") > 0){
			dojo.style(this.domNode, "height", isNaN(this.height)?this.height:(this.height+"px"));
		}
		this.height && this.fieldNode && dojo.style(this.fieldNode, "height", isNaN(this.height)?this.height:(this.height+"px"));
	},

	/**	 * @summary:
	 * 		设置控件的样式
	 * @description：
	 * 		使用错误的样式可能导致异常
	 * @param:
	 * 		{string} name
	 * @param:
	 * 		{string} value
	 * @example:
	 * |	<div id="box" dojoType="unieap.form.TextBox"></div>
	 * |	var box = unieap.byId('box');
	 * |	box.setStyle('width','200px');
	 * 		设置TextBox的宽度为"200px";		
	 */
	setStyle: function(name, value) {
		if (dojo.isString(name)) {
			dojo.style(this.domNode, name, String(value));
		}
	},
	
	/**
	 * @summary:
	 * 		获得控件的宽度
	 * @return:
	 * 		{number}
	 */
	getWidth: function() {
		return dojo.contentBox(this.domNode).w;
	},
	
	/**
	 * @summary:
	 * 		获得控件的高度
	 * @return:
	 * 		{number}
	 */	
	getHeight: function() {
		return dojo.contentBox(this.domNode).h;
	},
	
	/**
	 * @summary:
	 * 		设置控件的宽度
	 * @param:
	 * 		{number} width
	 */	
	setWidth: function(width) {
		dojo.style(this.domNode, "width", width);
	},
	
	/**
	 * @summary:
	 * 		设置控件的高度
	 * @param:
	 * 		{number} height
	 */	
	setHeight: function(height) {
		if(height.indexOf("%") > 0){
			dojo.style(this.domNode, "height", isNaN(height)?height:(height+"px"));
		}
		dojo.style(this.fieldNode, "height", isNaN(height)?height:(height+"px"));
	},
	
	/**
	 * @summary:
	 * 		设置控件是否隐藏
	 * @param:
	 * 		{boolean} bool 
	 */	
	setVisible: function(visible) {
		if(visible){
			dojo.style(this.domNode, "position", "relative");
			dojo.style(this.domNode, "visibility", "visible");
		}else{
			dojo.style(this.domNode, "postion", "absolute");
			dojo.style(this.domNode, "visibility", "hidden");
		}
	},
	
	/**
	 * @summary:
	 * 		设置是否禁用控件,背景颜色为"不可用"灰色
	 * @param:
	 * 		{boolean} bool 
	 */	
	setDisabled: function(disabled) {
		this.disabled = disabled;
		this.inputNode && (this.inputNode.disabled = disabled);
	},
	
	/**
	 * @summary:
	 * 		设置控件的值是否必须录入
	 * @description:
	 * 		设置required属性为true时,文本框控件的背景色为淡黄色
	 * 		当disabled为true时，则以disabled的样式优先
	 * @param:
	 * 		{boolean} bool 
	 */	
	setRequired: function(required) {
		if(!this.requiredNode) return;
		this._setRequired(required);
		this.getValidator().validate();
	},
	
	/**
	 * @summary:
	 * 		设置控件是否显示
	 * @description:
	 * 		设置display属性为block时,显示控件，当display为none时，则不显示控件
	 * @param:
	 * 		{boolean} bool 
	 */	
	setDisplay: function(display){
		dojo.style(this.domNode,"display",display);
	},
	
	setModified:function(modified){
		this.modifiedNode && dojo.style(this.modifiedNode,"visibility",modified?"visible":"hidden");
	},
	
	/**
	 * @summary:
	 * 		获取控件的数据绑定信息,binding可以为空
	 * @return:
	 * 		{unieap.form.FormWidgetBinding}  
	 */	
	getBinding: function() {	
		return this.binding && unieap.getModuleInstance(this,"binding","unieap.form.FormWidgetBinding");		
	},
	
	/**
	 * @summary:
	 * 		获得控件的校验器信息
	 * @return :
	 * 		{unieap.form.FormWidgetValidator}
	 */	
	getValidator: function() {	
		return unieap.getModuleInstance(this,"validator",this.validatorClass);
	},
	
	//内部private方法,触发数据改变
	fireDataChange: function() {
	},
		
	/**
	 * @summary:
	 * 		设置组件的值
	 * @param:
	 * 		{object} value
	 */
	setValue: function(value) {
	},
	
	/**
	 * @summary:
	 * 		取得组件的值
	 * @param:
	 * 		object
	 */
	getValue: function() {
	},
	
	/**
	 * @summary:
	 * 		将表单控件的值恢复到初次绑定DataStore时的值
	 * @description：
	 * 		例如某个表单控件的初始值(来自于DataStore)为10，用户手动改为20,调用本方法，控件中的值将重新显示为10
	 */
	reset: function() {
		var binding = this.getBinding(),
			   value =  binding?  binding.getOrigValue() : this.origValue;
		this.setValue(value);
		//特殊处理value值为空或者null的情况
		if(value==""||value==null){
			this.setModified(false)
		}
	},
	
	/*
	 * @summary：
	 * 		设置下一个焦点控件Id
	 * @private
	 */
	setNextFocusId : function(nextFocusId){
		this.nextFocusId = nextFocusId;
	},
	
	destroy:function(){
		this.getBinding() && this.getBinding().unbind();
		this.inherited(arguments);
	},

	//private 供子类调用
	//firefox下按住回车换行,只支持nextFocusId为widget控件的id
	processNextFocusId:function(){
		if(this.nextFocusId){
			var nfw = dijit.byId((this._rootID||"")+this.nextFocusId) || dijit.byId(this.nextFocusId);
			if(nfw){
				//判断节点是否隐藏,隐藏就直接执行nfw.processNextFocusId()
				if(nfw.domNode&&nfw.domNode.offsetHeight&&!nfw.skipFocus){
					if(nfw.focus){
						nfw.disabled?nfw.processNextFocusId():nfw.focus();
					}else if(nfw.focusNode){ //如果控件有focusNode的dom节点
						var rs=dojo.attr(nfw.focusNode,'disabled');
						//解决在Button控件下focus执行onClick的bug
						rs?nfw.processNextFocusId():setTimeout(function(){
							nfw.focusNode.focus();
						},0);
					}else{
						var inputs = dojo.query("input",nfw.domNode);
						var rs=dojo.filter(inputs,function(ele){
							return !dojo.attr(ele, 'disabled');
						});
						rs.length>0?rs[0].focus():nfw.processNextFocusId()
					}
				}else{
					nfw.processNextFocusId();
				}
			}
		}
	}
});
//@ sourceURL=/tp_fp/techcomp/ria/dojo/../unieap/form/FormWidget.js