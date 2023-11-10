dojo.provide("unieap.form.NumberSpinner");
dojo.require("unieap.form.FormWidget");
dojo.require("unieap.form.NumberTextBox");
dojo.declare("unieap.form.NumberSpinner",[unieap.form.NumberTextBox,unieap.form.FormWidget],{
	
	//用户属性配置接口
	UserInterfaces : dojo.mixin({
		smallDelta : "number",
		constraints : "object"
	},
	unieap.form.FormWidget.prototype.UserInterfaces),
	
	templateString :
		"<div class='u-form-widget'>"+
			"<div dojoAttachPoint='requiredNode' class='u-form-required'>*</div>" + 
			"<div dojoAttachPoint='fieldNode' class='u-form-field'>"+
				"<div dojoAttachPoint='modifiedNode' class='u-form-modified'></div>"+
				"<div class='u-form-spinner-icon' dojoAttachPoint='iconNode'>"+
					"<div tabindex='-1' class='u-form-spinner-arrowup' dojoAttachPoint='iconUpNode'></div>"+
					"<div tabindex='-1' class='u-form-spinner-arrowdown' dojoAttachPoint='iconDownNode'></div>"+
				"</div>"+
				"<div dojoAttachPoint='errorNode' class='u-form-error'></div>"+
				"<div class='u-form-textbox-field'>" +
					"<input dojoAttachPoint='inputNode,focusNode,textbox' class='u-form-textbox-input' onfocus='unieap.fep&&unieap.fep(this)'>"+
				"</div>" + 	
			"</div>" + 	
		"</div>",		
	
	/**
	 * @summary:
	 * 		按向上或向下按钮时，控件中数字减少的偏移量
	 * @type:
	 * 		{Number}
	 * @default：
	 * 		1
	 * @example:
	 * |<div dojoType="unieap.form.NumberSpinner" id="integerspinner1" binding={name:'attr_empno'} 
	 * |		constraints={max:500,min:0} smallDelta=3></div>
	 */
	smallDelta: 1,
	
	/**
	 * @summary:
	 * 		指定控件输入数字的边界。
	 * @type:
	 * 		{object}
	 * @default：
	 * 		null
	 * @example:
	 * |<div dojoType="unieap.form.NumberSpinner" id="integerspinner1" binding={name:'attr_empno'} 
	 * |		constraints={max:500,min:0}></div>
	 */
	constraints: null,
	
	//默认值格式化实现类名称
	valueFormatterClass : "unieap.form.SimpleFormatter",
	
	postCreate:function(){
		this.inherited(arguments);
		if(this.constraints){
			this.constraints.max == undefined && (this.constraints.max = 9999999);
			this.constraints.min == undefined && (this.constraints.min = -9999999);
		} else {
			this.constraints = {max:9999999, min:-9999999};
		}
		this.connect(this.iconNode, "mouseover", "domouseover");
		this.connect(this.iconUpNode, "mousedown", "doupdown");
		this.connect(this.iconUpNode, "mouseup", "doupup");
		this.connect(this.iconDownNode, "mousedown", "dodowndown");
		this.connect(this.iconDownNode, "mouseup", "dodownup");
		var bind = this.getBinding();
	},
	
	domouseover: function(e) {
		e.target.style.cursor = 'pointer'; 
	},

	doupdown: function(e){
		if(this.disabled){ return; }
		dojo.addClass(this.iconUpNode,"u-form-spinner-arrowup-down");
		var value = this.getValue();
		(value=='') && (value=this.constraints.min);
		var new_value = this.floatAdd(value,this.smallDelta);
		if(new_value > this.constraints.max) return;
		this.setValue(new_value);
		var self = this;
		this.handleUp && clearTimeout(this.handleUp);
		this.handleUp=setTimeout(dojo.hitch(self,function(){self.doupdown();}),150);
	},
	
	doupup: function(e){
		this.handleUp && clearTimeout(this.handleUp);
		dojo.removeClass(this.iconUpNode,"u-form-spinner-arrowup-down");
	},
	
	dodowndown: function(e){
		if(this.disabled){ return; }
		dojo.addClass(this.iconDownNode,"u-form-spinner-arrowdown-down");
		var value = this.getValue();
		(value=='') && (value=this.constraints.max);
		var new_value = this.floatSub(value,this.smallDelta);
		if(new_value < this.constraints.min) return;
		this.setValue(new_value);
		var self = this;
		this.handleDown && clearTimeout(this.handleDown);
		this.handleDown=setTimeout(dojo.hitch(self,function(){self.dodowndown();}),150);
	},
	
	dodownup: function(e){
		this.handleDown && clearTimeout(this.handleDown);
		dojo.removeClass(this.iconDownNode,"u-form-spinner-arrowdown-down");
	},
	
	floatAdd: function(arg1,arg2){
		var r1,r2,m; 
		try{r1=arg1.toString().split(".")[1].length;}catch(e){r1=0;}
		try{r2=arg2.toString().split(".")[1].length;}catch(e){r2=0;}
		m=Math.pow(10,Math.max(r1,r2));
		return (this.floatMul(arg1,m)+this.floatMul(arg2,m))/m;
	},
	
	
	floatSub: function(arg1,arg2){ 
		return this.floatAdd(arg1,-arg2);
	},
	
	floatMul: function(arg1,arg2){
		var m=0,s1=arg1.toString(),s2=arg2.toString();
		try{m+=s1.split(".")[1].length}catch(e){}
		try{m+=s2.split(".")[1].length}catch(e){}
		return Number(s1.replace(".",""))*Number(s2.replace(".",""))/Math.pow(10,m)
	},
	_onBlur:function(evt){
		var newValue = this.getValue();
		if('number' == typeof newValue){
			if(newValue < this.constraints.min) this.setValue(this.constraints.min);
			if(newValue > this.constraints.max) this.setValue(this.constraints.max);
		}
		this.inherited(arguments);
	}
});