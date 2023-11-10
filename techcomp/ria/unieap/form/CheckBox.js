dojo.provide("unieap.form.CheckBox");
dojo.require("unieap.form.BaseButton");
dojo.declare("unieap.form.CheckBox", unieap.form.BaseButton, {
	/**
	 * @declaredClass:
	 * 		unieap.form.CheckBox
	 * @summary:
	 * 		复选按钮，支持数据绑定
	 * @superClass:
	 * 		unieap.form.BaseButton
	 * @example:
	 * |<div dojoType="unieap.form.CheckBox" checked="true" checkedValue="yes" uncheckedValue="no"></div>
	 * 		如果复选框被勾选,通过getValue返回的是yes,否则为no
	 * @example:
	 * |//在ie下复选框(单选按钮)checked属性存在bug，如下代码所示：
	 * |var box=document.createElement('input');
	 * |box.type="checkbox";
	 * |//box.type=true  在ie下不能写在此处,此时box还没有放在页面文档流中
	 * |document.body.appendChild(box); //需将checkbox加入到文档流，然后再进行checked属性的设置
	 * |box.checked=true; 		
	 * @example:
	 * |//由于ie上述bug,RIA解决方法如下：
	 * |var box=new unieap.form.CheckBox({id:'chkBox'});
	 * |box.placeAt(dojo.body());
	 * |box.setChecked(true);
	 * 		必须把控件放到页面文档流中中才能执行setChecked操作
	 */
	 
	//配置属性接口
	UserInterfaces : dojo.mixin({
		checked : "boolean",
		checkedValue : "string",
		uncheckedValue : "string",
		onBeforeClick : "function",
		onBeforeChange : "function",
		onChange : "function"		
	},
	unieap.form.BaseButton.prototype.UserInterfaces),
	
	/**
	 * @summary:
	 * 		设置初始化时的选中状态
	 * @type:
	 * 		{boolean}
	 * @default:
	 * 		false
	 * @example:
	 * |	<div dojoTYpe="unieap.form.CheckBox" checked="true"></div>
	 * 		页面加载完毕后,控件就处于选中状态,即复选框被勾选上了。
	 */
	checked: false,	
	
	/**
	 * @summary：
	 * 		控件处于选中状态时对应的值
	 * @type：
	 * 		{string} 
	 * @default:
	 * 		"1"
	 * @example:
	 * |	<div dojoType="unieap.form.CheckBox" checkedValue="1"></div>
	 * 		当控件处于选中状态时,调用getValue()方法,返回的值就为1
	 * 		
	 * 
	 */
	checkedValue: "1",
	
	/**
	 * @summary:
	 * 		控件处于非选中状态时对应的值
	 * @type:
	 * 		{string}
	 * @default:
	 * 		"0"
	 * @example:
	 * |<div dojoTYpe="unieap.form.CheckBox" uncheckedValue="0"></div>
	 * 		当控件处于非选中状态时,调用getValue()方法,返回的值就为0
	 */
	uncheckedValue: "0",
	
	templateString:"<div class=\"u-form-chk\" >" +
			"<div dojoAttachPoint=\"modifiedNode\" class=\"u-form-modified\"></div>"+
			"<input type=\"checkbox\" class=\"u-form-chkInput\" name=\"${name}\" dojoAttachPoint=\"inputNode,focusNode\" onfocus=\"unieap.fep&&unieap.fep(this)\"/>"+
			"</div>",
			
	
	
	name:'chkBox',
			
	postMixInProperties:function(){
		//保存控件的初始值
		this.inherited(arguments);
		this.checked&&(this.value=this.checkedValue);
	},

   //覆盖父类的_postCreate方法
	_postCreate : function(){
		this.inputNode.checked=this.checked;
		this.inputNode.value = this.checkedValue;
	},
	
	/**
	 * @summary:
	 * 		点击复选框前的触发事件,返回为false将不勾选复选框
	 * @return:
	 * 		{boolean}
	 * @example:
	 * |function fn(){
	 * |	return false;
	 * |}
	 * |<div dojoType="unieap.form.CheckBox" onBeforeClick="fn"></div>
	 */
	onBeforeClick:function(){
		return true;
	},
	
	
	onBeforeChange:function(){
		return true;
	},
	
	
	//覆盖父类unieap.form._onButtonClick
	_onButtonClick: function(evt) {
		if(!unieap.fireEvent(this,this.onBeforeClick,[]) ||!unieap.fireEvent(this,this.onBeforeChange,[])){
			dojo.stopEvent(evt);
			return;
		
		}
		this.setChecked(!this.checked);
		unieap.fireEvent(this,this.onClick,[evt])
		this._onChange();
	},
	
	_onChange:function(){
		unieap.fireEvent(this,this.onChange,[this.checked]);
		this.fireDataChange();
	},
	

	/**
	 * @summary:
	 * 		设置复选按钮的选中状态
	 * @param:
	 * 		{boolean} checked
	 */
	setChecked: function(checked) {
		this.inputNode.checked=checked;
		if(checked==this.checked) return ;
		this.checked = checked;		
		this.fireDataChange();
		
	},
	/**
	 * @summary
	 * 		获取复选按钮的选中状态
	 */
	isChecked: function() {
		return this.inputNode.checked;
	},
	/**
	 * @summary:
	 * 		选中状态改变事件
	 * @param:
	 * 		{boolean}复选按钮选中状态
	 * @example:
	 * |function fn(checked){
	 * |	if(checked) { 
	 * |		alert('选中');
	 * |	}else {
	 * |		alert('取消选中');
	 * |	}
	 * |}
	 * |<div dojoType="unieap.form.CheckBox" onChange="fn"></div>
	 */
	onChange: function(checked) {
		
	},
	
	
	/**
	 * @summary:
	 * 		设置复选按钮的值,相当于调用setChecked方法
	 * @description:
	 * 		注意,当且仅当value值为checkedValue时复选框才能被选中,或者取消选中。
	 * @param:
	 * 		{string} value
	 */
	setValue: function(value) {
		//如果value值和用户设置的的checkedValue值相同,则选中复选框
		//var bool=value==null||value==''||typeof(value)=='undefined';
		if(String(value)==String(this.checkedValue)){
			this.setChecked(true);
		}else{
			this.setChecked(false);
		}
		this.fireDataChange();
		//bool&&this.setModified(false);
	},	
	
	/**
	 * @summary:
	 * 		取得复选按钮的值
	 * @return:
	 * 		object
	 */
	getValue: function() {
		return this.inputNode.checked ? this.checkedValue : this.uncheckedValue;
	},	
	
	/**
	 * @summary:
	 * 		取得复选按钮选中状态的值
	 * @return:
	 * 		object
	 */
	getCheckedValue: function() {
		return this.checkedValue;
	},
	
	/**
	 * @summary:
	 * 		取得复选按钮非选中状态的值
	 * @return:
	 * 		object
	 */
	getUncheckedValue: function() {
		return this.uncheckedValue;
	},
	
	destroy: function(){
		if (this.inputNode){
			this.inputNode.onfocus = null; //防止内存泄漏
		}
		this.inherited(arguments);
	},
	
	
	/**
	 * @summary:
	 * 		设置复选按钮选中状态和非选中状态的值
	 * @param:
	 * 		{object} checkedValue
	 * 		选中状态的值
	 * @param:
	 * 		{object} uncheckedValue
	 * 		非选中状态的值
	 * @example:
	 * |<div dojoType="unieap.form.CheckBox" id="checkbox"></div>
	 * |var checkbox = unieap.byId('checkbox');
	 * |checkbox.setCheckedOption("yes","no");
	 * 设置CheckBox选中状态的值是yes，非选中状态的值是no
	 */
	setCheckedOption: function(checkedValue, uncheckedValue) {
		this.checkedValue = checkedValue;
		this.uncheckedValue = uncheckedValue;
		this.inputNode.value = this.checkedValue;
	}
});