dojo.provide("unieap.form.Button");
dojo.require("unieap.form.BaseButton");
dojo.declare("unieap.form.Button", unieap.form.BaseButton, {
	/**
	 * @declaredClass:
	 * 		unieap.form.Button
	 * @superClass:
	 * 		unieap.form.BaseButton
	 * @summary:
	 * 		按钮控件和普通HTML中的button标签类似，可以像使用普通按钮一样来使用。
	 * 		支持数据绑定，可以绑定数据源中的值作为按钮的标签
	 * @img:
	 * 		images/form/button.png
	 * @example:
	 * |<div dojoType="unieap.form.Button" label="Neusoft东软"></div>
	 * 		创建一个显示值为'Neusoft东软'的按钮
	 * @example:
	 * |<form dojoType="unieap.form.Form"  binding="{store:'emp_store'}>
	 * |	<div dojoType="unieap.form.Button" binding="{name:empName}"></div> 
	 * |</for>
	 * 		通过数据绑定设置Button显示值		
	 */
	 
	//配置属性接口 
	UserInterfaces : dojo.mixin({
		label : "string",
		toolTip : "string",
		iconClass : "string"
	},
	unieap.form.BaseButton.prototype.UserInterfaces),
	
	/**
	 * @summary:
	 * 		按钮上显示的文本值
	 * @type:
	 * 		{string}
	 * @example:
	 * |<div dojoType="unieap.form.Button" label="你好"></div>
	 * 		创建一个显示值'你好'的按钮
	 */
	label: '',
	
	/**
	 * @summary:
	 * 		通过改变css样式来设置按钮上的图标
	 * @type:
	 * 		{string}
	 * @example:
	 * |<style type="text/css">
	 * |		.iconBtn{
	 * |			display:inline-block;
	 * |			width:16px;
	 * |			height:16px;
	 * |			background:url("../images/find.gif") no-repeat;
	 * |		}
	 * |</style>
	 * |<div dojoType="unieap.form.Button" iconClass="iconBtn" labal="设置图标"></div>
	 * @img:
	 * 		images/form/buttonWithIcon.png
	 */
	iconClass:'',
	
	_background:'',
	
	toolTip:'',
	
	templateString:
			"<a href='javascript:void(0);' class='u-form-btn-outer' tabindex='-1' style=\"text-decoration:none;vertical-align:middle;\">" +
				"<button type=\"button\"  class=\"u-form-btn\" dojoAttachPoint=\"focusNode, inputNode,btnNode\" onfocus=\"unieap.fep&&unieap.fep(this)\">" +
					"<table style=\"display:inline-block\">"+
						"<tr><td dojoAttachPoint=\"iconNode\"></td>" +
						"<td class=\"u-form-btn-txt\" dojoAttachPoint=\"labelNode\"></td></tr>" +
					"</table>"+
				"</button>"+
			"</a>",
			
			
	postCreate:function(){
		this.inherited(arguments);
		this.label&&this.setLabel(this.label);
		this.iconClass&&this.setIconClass(this.iconClass);
//		this.connect(this.btnNode,'onmouseover',this._onMouseOver);
//		this.connect(this.btnNode,'onmouseout',this._onMouseOut);
		if(this.toolTip){
			this.inputNode.title = this.toolTip;
		}
	},
	
	_setWidthAndHeigth: function() {
		//处理控件的宽度和高度
		var btnWidth = this.width || this.domNode.style.width;
		var btnHeight = this.height || this.domNode.style.height;
		
		btnWidth && dojo.style(this.domNode, "width", isNaN(btnWidth)?btnWidth:(this.width+"px"));
		btnWidth && dojo.style(this.btnNode, "width", "100%");
		btnHeight && dojo.style(this.domNode, "height", isNaN(btnHeight)?btnHeight:(this.height+"px"));
	},
	
   /**
	 * @summary:
	 * 		设置是否按钮禁用
	 * @param:
	 * 		{boolean} disabled
	 * @example:
	 * |var btn=unieap.byId('btn');
	 * |btn.setDisabled(true);
	 */
	setDisabled:function(disabled){
		if(disabled){
			dojo.style(this.labelNode,"color","#a7a6aa");
			dojo.removeClass(this.domNode,'u-form-btn-outer');
			dojo.addClass(this.domNode,'u-form-btn-outer-disabled');
		}else{
			dojo.style(this.labelNode,"color","");
			dojo.removeClass(this.domNode,'u-form-btn-outer-disabled');
			dojo.addClass(this.domNode,'u-form-btn-outer');
		}
		this.btnNode.disabled=disabled;
		this.disabled = disabled;
	},
	
	
	//数据绑定
	setValue: function(value) {
		this.label=value;
		if(this.getBinding()&&this.getBinding().getRow()){
			this.setLabel(this.label);
			this.fireDataChange();
		}
		
	},
	
	
	getValue:function(){
		return this.label;
	},
	

	/**
	 * @summary:
	 * 		设置按钮的标签值
	 * @param:
	 * 		{string} label 要设置的标签值
	 * @example:
	 * |var btn=unieap.byId('btn');
	 * |btn.setLabel('你好');
	 * 		设置显示值为'你好'
	 */
	setLabel:function(label){
		this.label=label;
		this.labelNode.innerHTML=label;
	},
	
	/**
	 * @summary:
	 * 		设置按钮图标样式
	 * @description：
	 * 		建议图片大小:16*16,CSS设置width,height为16px; 
	 * @param:
	 * 		{string} className 图标的css名
	 * @example:
	 * |<style type="text/css">
	 * |		.iconBtn{
	 * |			display:inline-block;
	 * |			width:16px;
	 * |			height:16px;
	 * |			background:url("../images/find.gif") no-repeat;
	 * |		}
	 * |</style>
	 * |var btn=unieap.byId('btn');
	 * |btn.setIconClass('iconBtn');
	 */
	setIconClass: function(className) {
		this.iconClass&&dojo.removeClass(this.iconNode,this.iconClass);
		dojo.addClass(this.iconNode,className);
		this.iconClass=className;
	},
	
	_onMouseOver:function(){
		this.toolTip && unieap.showTooltip({inner:this.toolTip},this.inputNode);
	},
	
	_onMouseOut:function(){
		this.toolTip && unieap.showTooltip(this.inputNode);
	},
	
	_onEnterDown: function(evt) {
		this.onEnter(evt);
	}
});