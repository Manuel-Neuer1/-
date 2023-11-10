dojo.provide("unieap.form.NumberTextBox")
dojo.require("unieap.form.TextBox");
dojo.declare("unieap.form.NumberTextBox",unieap.form.TextBox,{
	/**
	 * @declaredClass:
	 * 		unieap.form.NumberTextBox
	 * @superClass:
	 * 		unieap.form.TextBox
	 * @summary:
	 * 		数字文本框控件,只能输入负号、数字和小数点。
	 * @description:
	 * 		在默认情况下,数字文本框会对输入的字符进行及时校验,您可以设置validator="{realTime:false}"来关闭。
	 * 		关闭后,只有在数字文本框失去焦点时才进行校验
	 * 
	 */
	
	
	UserInterfaces : dojo.mixin({
		range : "object",
		precision : "number",
		scale : "number"		
	},
	unieap.form.TextBox.prototype.UserInterfaces),
	
	//覆盖默认格式化类
	displayFormatterClass:'unieap.form.NumberDisplayFormatter',
	
	validatorClass:'unieap.form.NumberTextBoxValidator',
	
	//数字文本框之内输入负号、数字及其点号
	inputFilter : {filterRule:/[-\.\d]/},
	
	
	/**
	 * @summary:
	 * 		设置控件能输入的最大值和最小值
	 * @description:
	 * 		range.max:控件能输入的最大值
	 * 		range.min:控件能输入的最小值
	 * 		range.allowDecimal:是否允许数字中出现小数点
	 * @default:
	 * 		range.max为Infinity,即正无限大
	 * 		range.min为-Infiniy,即负无限大
	 * 		range.allowDecimal为true,即允许数字中出现小数点
	 * @type:
	 * 		{object}
	 * @example:
	 * |<div dojoType="unieap.form.NumberTextBox" validator="{errorMsg:'只能输入-100~100之间的整数'}" range="{min:-100,max:100,allowDecimal:false}"></div>
	 *    该代码表示用户只能输入-100~100之间的整数,否则控件会提示错误信息
	 */
	range:null,
	

	/**
	 * @summary:
	 * 		设置控件中数字的精度限制
	 * @type:
	 * 		{number}
	 * @example:
	 * |<div dojoType="unieap.form.NumberTextBox" precision="5" scale="2"></div>
	 * 上述代码表明数字文本框中最多只能输入5个数字和一个小数点,其中整数为3位,小数为2位,例如123.45
	 */
	precision:-1,
	
	
	/**
	 * @summary:
	 * 		设置控件中数字的小数精度
	 * @description:
	 * 		scale的值不能大于或等于precision的值,如果大于precision的值,scale的值就变为0
	 * @type:
	 * 		{number}
	 * @example:
	 * |<div dojoType="unieap.form.NumberTextBox" precision="5" scale="2"></div>
	 * 上述代码表明数字文本框中最多只能输入5个数字和一个小数点,其中整数为3位,小数为2位,例如123.45
	 */
	scale:0,

	postMixInProperties:function(){
		this.inherited(arguments);
		!this.range&&(this.range={		
			min:-Infinity,
			max:Infinity,
			allowDecimal:true
		});
		typeof(this.range['max'])=='undefined'&&(this.range['max']=Infinity);
		typeof(this.range['min'])=='undefined'&&(this.range['min']=-Infinity);
		typeof(this.range['allowDecimal'])=='undefined'&&(this.range['allowDecimal']=true);
	},
	
	postCreate:function(){
		this.password=false;
		this.inherited(arguments);
		//数字文本框只能输入数字,需要屏蔽输入法
		dojo.style(this.inputNode,"imeMode","disabled");
		this._initMaxLength();
		if(this.range.min>this.range.max){
			this.range.min=-Infinity;
		}
	},
	
	
	//在grid编辑器中,metadata的dataType为4，清除编辑器的值
	//再次点击编辑器,编辑器的值会变为0,因为此时传入的value为null
	setValue:function(value){
		value==null&&(value='');
		this.inherited(arguments);
	},
	getValue : function(){
		var value = this.getText();
		value = this.getDisplayFormatter().parse(value);
		value = this.getValueFormatter().parse(value);
		if(value!=''&& value!=null && value!="-"){
			value = Number(value);
			if(isNaN(value)){
				this.setValue('');
				this.focus();
				return '';
			}else
				return value;
		}
		else
			return value;
	},
	
	
	///////////////////////////////////内部方法//////////////////////////////
	
	//处理最大长度、精度等
	_initMaxLength:function(){
		if(this.maxLength>-1){
			this.inputNode.maxLength=this.maxLength;
		}
		if(this.precision>-1){
			if(this.scale>=this.precision||!this.scale||this.scale<0){
				this.scale=0;
			}
		}
	},
	
	_onBlur:function(evt){
		if (!evt||typeof(evt)=="string")  return ;		
		var value=this.inputNode.value;
		var len=value.length;
		//过滤输入值最后的一个点号,例如'3.'会显示成'3'
		if(len>0&&value.indexOf('.')==len-1){
			this.inputNode.value=this.inputNode.value.substring(0,len-1);
		}
		this.inherited(arguments);
	}
});