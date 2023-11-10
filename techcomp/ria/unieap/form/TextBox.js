dojo.provide("unieap.form.TextBox");
dojo.require("unieap.form.FormWidget");
dojo.declare("unieap.form.TextBox",unieap.form.FormWidget,{
	/**
	 * @declaredClass:
	 * 		unieap.form.TextBox
	 * @superClass：
	 * 		unieap.form.FormWidget
	 * @summary:
	 * 		普通文本框控件,相当于HTML中的input标签。
	 * @description:
	 * 		支持文本的正则校验、编辑格式化，显示格式化，保存值格式化
	 * @img:
	 * 		images/form/textbox.png
	 * @example:
	 * | ${1}<div dojoType="unieap.form.TextBox"></div>
	 * 	${1}普通文本框
	 * | ${2}<div dojoType="unieap.form.TextBox" password="true"></div>
	 *	${2}上述代码解析后会生成一个密码框
	 * @example:
	 * | ${3}<div dojoType="unieap.form.TextBox" validator="{regExp:/^\d+$/,errorMsg:'只能输入数字'}></div>
	 *  ${3}validator属性可以对控件的输入值进行校验,/^\d+$/是一个正则表达式,表示文本框的值只能为数字,否则会提示错误信息
	 * @example:
	 * | ${4}<div dojoType="unieap.form.TextBox" inputFilter="filterRule:/[0-9]/"></div>
	 * ${4}inputFilter表示对输入的数据进行过滤,/[0-9]/表示控件只能输入数字,其他字符无法输入。
	 * 注意：如果用户打开软键盘输入字符,inputFilter属性将无法控制用户输入。可以考虑将validator属性和inputFilter属性联合使用。
	 */
	
	//用户属性配置接口
	UserInterfaces : dojo.mixin({
		textAlign : "string",
		trim : "boolean",
		password : "boolean",
		maxLength : "number",
		minLength : "number",
		displayFormatter : "object",
		valueFormatter : "object",
		editFormatter : "object",
		inputFilter : "object",
		prompt: "object",
		readOnly : "boolean",
		value : "string",
		onBeforeClick : "function",
		onClick : "function",
		onEnter : "function",
		onTab : "function",
		onChange : "function",
		onKeyUp : "function",
		onKeyPress : "function",
		onKeyDown : "function",
		onBlur : "function",
		onFocus : "function",
		onDblClick : "function",
		onBeforeCopy : "function",
		onCopy : "function",
		onBeforePaste : "function",
		onPaste : "function",
		onBeforeCut : "function",
		onCut : "function"		
	},
	unieap.form.FormWidget.prototype.UserInterfaces),
	
	templateString :
		"<div class='u-form-widget'>"+
			"<div dojoAttachPoint='requiredNode' class='u-form-required'>*</div>" + 
			"<div dojoAttachPoint='fieldNode' class='u-form-field'>"+
				"<div dojoAttachPoint='modifiedNode' class='u-form-modified'></div>"+
				"<div dojoAttachPoint='errorNode' class='u-form-error'></div>"+
				"<div class='u-form-textbox-field'>" +
					"<input dojoAttachPoint='inputNode,focusNode' class='u-form-textbox-input' onfocus='unieap.fep&&unieap.fep(this)'>"+
				"</div>" +
			"</div>" +
		"</div>",

	/**
	 * @type:
	 * 		{string}
	 * @summary:
	 * 		设置文本的对齐方式
	 * @default:
	 * 		"left"
	 * @enum:
	 * 		{"right"|"left"|"center"}
	 * @example:
	 * |<div dojoType="unieap.form.TextBox" textAlign="right"></div>
	 */
	textAlign:"left",

	/**
	 * @type:
	 * 		{boolean}
	 * @summary:
	 * 		是否对文本进行格式化，去掉两边的空格
	 * @default：
	 * 		false
	 * @example:
	 * |<div dojoType="unieap.form.TextBox" trim="true"></div>
	 */
	trim:false,

	/**
	 * @type:
	 * 		{boolean}
	 * @summary:
	 * 		是否为密码文本框。密码框中的文字不可复制、粘贴和剪切
	 * @default：
	 * 		false
	 * @example:
	 * |<div dojoType="unieap.form.TextBox" password="true"></div>
	 */
	password:false,

	/**
	 * @type:
	 * 		{number}
	 * @summary:
	 * 		设置控件能输入的最大长度
	 * @description:
	 * 		可以在global.js中配置一个汉字占用多少个字符
	 * @example:
	 * |<div dojoType="unieap.form.TextBox" maxLength="6"></div>
	 * 		上述代码表示控件最多能输入6个字符,当设置汉字占用两个字符时控件只能输入3个汉字,输入多个会提示错误信息
	 */
	maxLength:-1,

	/**
	 * @type:
	 * 		{number}
	 * @summary:
	 * 		设置控件必须输入的最小长度,当长度没有达到需求时,控件会提示错误
	 * @description:
	 * 		当minLength的值大于maxLength时，设置的minLength将无效
	 * @example:
	 * |<div dojoType="unieap.form.TextBox" minLength="6"></div>
	 */
	minLength:-1,

    //默认校验器实现类名称
	validatorClass:'unieap.form.TextBoxValidator',

	/**
	 * @summary：
	 * 		设置显示格式化信息
	 * @description:
	 * 		所谓显示值格式化是指当控件失去焦点时,对控件的值进行格式化
	 * @type:
	 * 		{object}
	 * @see：
	 * 		unieap.form.SimpleFormatter
	 * @example:
	 * |<div dojoType="unieap.form.TextBox"
	 * |		displayFormatter="{declaredClass:'unieap.form.NumberDisplayFormatter',dataFormat:'###,###.00'}">
	 * |</div>
	 * 		上述代码表示对控件的值进行格式化.例如控件的值为2000,格式化后的值为2,000.00
	 * 		用户可以编写的自己的displayFormatter对象,只需要继承unieap.form.SimpleFormatter即可
	 * @example:
	 * |dojo.provide("unieap.demo.MyDisplayFormatter");
	 * |dojo.require("unieap.form.SimpleFormatter");
	 * |dojo . declare("unieap.demo.MyDisplayFormatter",unieap.form.SimpleFormatter,{
	 * |
	 * |	//可选值为CH或者USA
	 * |	dataFormat:'CHN',
	 * |
	 * |	//格式化,比如格式化成￥5000
	 * |	format:function(value){
	 * |		var format=this._processDataFormat(this.dataFormat);
	 * |		if(value){
	 * |			return format+value;
	 * |		}
	 * |		return value;
	 * |	},
	 * |
	 * |	//把格式化后的值还原,例如￥5000还原成5000
	 * |	parse:function(value){
	 * |		var format=this._processDataFormat(this.dataFormat);
	 * |		if(value){
	 * |			return value.replace(new RegExp(format),'');
	 * |        }
	 * |		return value;
	 * |	},
	 * |
	 * |   _processDataFormat:function(dataFormat){
	 * |	   var str="";
	 * |	   switch(dataFormat){
	 * |		   case 'CHN':
	 * |			   return '￥';break;
	 * |		   case 'USA':
	 * | 			   return '$';break;
	 * |		}
	 * |    }
	 * |});
	 * |
	 * |<div dojoType="unieap.form.TextBox"
	 * |	 displayFormatter="{declaredClass:'unieap.demo.MyDisplayFormatter',dataFormat:'CHN'}">
	 * |</div>
	 * 		使用自定义的格式化类
	 */
	displayFormatter:null,


	//默认显示格式化实现类名称
	displayFormatterClass : "unieap.form.SimpleFormatter",

	/**
	 * @summary：
	 * 		设置保存值格式化信息
	 * @description:
	 * 		保存值格式化是指将控件的实际值格式化成另外一个值供其他格式化对象使用。
	 * 		以日期为例,假设有一个字符为"2009/08/01",我们想让它在控件中显示为"2009年8月1日",如下处理：
	 * 		首先,将"2009/08/01"通过valueFormatter对象格式化成长整型(日期本来就是一个long型)。
	 * 		然后再通过displayFormatter对象把长整型格式化成"2009年8月1日"。
	 * 		具体可以参考DateTextBox控件的模块unieap.form.DateValueFormatter和unieap.form.DateDisplayFormatter
	 * @type:
	 * 		{object}
	 * @see:
	 * 		unieap.form.SimpleFormatter
	 */
	valueFormatter:null,


	//默认值格式化实现类名称
	valueFormatterClass : "unieap.form.SimpleFormatter",

	/**
	 * @summary：
	 * 		设置编辑格式化信息
	 * @description:
	 * 		编辑值格式化是指当控件得到焦点时,对控件的值格式化
	 * @type:
	 * 		{object}
	 * @see:
	 * 		unieap.form.SimpleFormatter
	 */
	editFormatter:null,


	//默认编辑格式化实现类名称
	editFormatterClass : "unieap.form.SimpleFormatter",

	/**
	 * @summary：
	 * 		设置输入过滤信息,让控件只能输入指定的字符
	 * @type:
	 * 		{object}
	 * @see:
	 * 		unieap.form.InputFilter
	 * @example:
	 * |<div dojoType="unieap.form.TextBox" inputFilter="{filterRule:/[0-9]/}">
	 * |</div>
	 */
	inputFilter:null,

	/**
	 * @summary:
	 * 		设置控件的初始值
	 * @type:
	 * 		{string}
	 *
	 * @example:
	 * |<div dojoType="unieap.form.TextBox" value='开始信息'></div>
	 */
	value:'',

	/**
	 * @summary:
	 * 		设置控件的只读属性
	 * @default:
	 * 		false
	 * @type:
	 * 		{boolean}
	 * @example:
	 * |<div dojoType="unieap.form.TextBox" readOnly="true"></div>
	 */
	readOnly:false,

	/**
	 * @summary:
	 * 		设置光标置入到控件的输入域时的提示信息
	 * @type:
	 * 		{object}
	 * @example:
	 * |<div dojoType="unieap.form.TextBox" prompt="{promptMsg:'你好!',duration:2000}">
	 * |</div>
	 * 		上述代码中,promptMsg表示要提示的信息,duration表示多少毫秒后提示信息消失。
	 * 		设置duration小于等于0时,提示信息将不会自动消失
	 * @see:
	 * 		unieap.form.PromptManager
	 */
	prompt:null,

	//记录背景色，setDisalbed时使用
	_backgroundColor:'',

	postCreate:function(){
		//解决IE7下form下边框显示不全问题
		if(dojo.isIE<8){
			dojo.style(this.fieldNode,'height','21px');
		}
		//如果password为true,则删除inputNode并且新建立一个密码框
		if(this.password){
			var inputNode = this.inputNode;
			this.inputNode = this.focusNode = dojo.create('input',{
				'type':'password',
				'class':'u-form-textbox-input',
				'name':inputNode.name,
				'tabIndex':inputNode.tabIndex
			});
			inputNode.parentNode.replaceChild(this.inputNode,inputNode);
			//绑定onfocus监听事件
			this.inputNode.onfocus =function(){
				unieap.fep && unieap.fep(this);
			};
		}
		//设置文字显示位置
		this.inputNode.style.textAlign = this.textAlign;
		//设置文本框的最大长度
		this.maxLength >-1 && (this.inputNode.maxLength = this.maxLength);
		//设置文本框的初始值
		this.readOnly&&this.setReadOnly(this.readOnly);
		//设置文本框初始值,如果trim为true，这删除字符左右的空格
		this.value&& this.setValue(this.value);
		//绑定事件
		this.connect(this.focusNode, "onfocus", "_onFocus");
		this.connect(this.focusNode, "onblur", "_onBlur");
		this.connect(this.inputNode, "onchange", "_onChange");
		this.connect(this.inputNode, "onkeyup", "_onKeyUp");
		this.connect(this.inputNode, "onkeydown", "_onKeyDown");
		this.connect(this.inputNode, "onkeypress", "_onKeyPress");
		this.connect(this.inputNode, "ondblclick", "_onDblClick");
		this.connect(this.inputNode, "onclick", "_onClick");
		this.connect(this.inputNode, "oncopy", "_onCopy");
		this.connect(this.inputNode, "onpaste", "_onPaste");
		this.connect(this.inputNode, "oncut", "_onCut");
		this.inherited(arguments);
	},

	/**
	 * @summary:
	 * 		置光标到控件的文本域
	 * @example:
	 * |var box=unieap.byId('box');
	 * |box.foucs();
	 */
	focus:function(){
		dijit.focus(this.focusNode);
		this.select();
	},

	/**
	 * @summary:
	 * 		选中控件中的文本
	 * @example:
	 * |var box=unieap.byId('box');
	 * |box.select();
	 */
	select:function(){
//		setTimeout(dojo.hitch(this,function(){
			this.focusNode&&this.focusNode.select();
//		},0));
	},

	/**
	 * @summary:
	 * 		设置控件的值
	 * @description:
	 * 		当控件设置了displayFormatter等属性时,控件显示的是格式化后的值
	 * @param:
	 * 		{object} value
	 * @example:
	 * |var box=unieap.byId('box');
	 * |box.setValue('测试');
	 */
	setValue:function(value){
		(value==null||typeof(value)=="undefined")&&(value="");
		//如果有背景色，清除背景色
		value=this._trim(value);
		if (this.valueFormatter) {
			value = this.getValueFormatter().format(value);
		}
		if (this.displayFormatter) {
			value = this.getDisplayFormatter().format(value);
		}
		this.inputNode.value =(value!=null?value:"");
		if(unieap.global.validateOnSetValue && value) this.getValidator().validate();
		this.fireDataChange();
	},

	/**
	 * @summary:
	 * 		获取控件的值
	 * @description:
	 * 		当设置了displayFormatter等属性时,得到的值是控件格式化之前的值
	 * @return:
	 * 		{string}
	 * @example:
	 * |var box=unieap.byId('box');
	 * |var value=box.getValue();
	 */
	getValue : function(){
		var value = this.getText();
		value = this.getDisplayFormatter().parse(value);
		value = this.getValueFormatter().parse(value);
		return value;
	},

	/**
	 * @summary:
	 * 		得到控件的文本显示值
	 * @description:
	 * 		当控件不配置displayFormatter、valueFormatter等时，getValue和getText()返回的值相同
	 * @return:
	 * 		 {string}
	 * @example:
	 * |var box=unieap.byId('box');
	 * |var value=box.getText();
	 */
	getText:function(){
		return this._trim(this.inputNode.value);
	},

	/**
	 * @summary:
	 * 		设置控件的文本显示值
	 * @description:
	 * 		由于控件的实际值是更根据显示值转换过来的，改变显示值也会改变控件的实际值
	 * @param:
	 * 		 {string} value 要设置的显示值
	 */
	setText:function(value){
		this.inputNode.value = value;
	},

	//获得控件的最大长度
	getMaxLength:function(){
		return this.maxLength;
	},


	/**
	 * @summary:
	 * 		得到显示值格式化对象
	 * @return：
	 * 		{unieap.form.Formatter}
	 * @see:
	 * 		unieap.form.SimpleFormatter
	 * @example:
	 * |var box=unieap.byId('box');
	 * |var formatter=box.getDisplayFormatter();
	 */
	getDisplayFormatter:function(){
		return unieap.getModuleInstance(this,"displayFormatter",this.displayFormatterClass);
	},

    /**
	 * @summary:
	 * 		得到编辑格式化对象
	 * @return:
	 * 		unieap.form.Formatter
	 * @see:
	 * 		unieap.form.SimpleFormatter
	 * @example:
	 * |var box=unieap.byId('box');
	 * |var formatter=box.getEditFormatter();
     */
	getEditFormatter:function(){
		return unieap.getModuleInstance(this,"editFormatter",this.editFormatterClass);
	},

	/**
	 * @summary:
	 * 		得到保存值格式化对象
	 * @return:
	 * 		unieap.form.Formatter
	 * @see:
	 * 		unieap.form.SimpleFormatter
	 * @example:
	 * |var box=unieap.byId('box');
	 * |var formatter=box.getValueFormatter();
	 */
	getValueFormatter:function(){
		return unieap.getModuleInstance(this,"valueFormatter",this.valueFormatterClass);
	},

	/**
	 * @summary:
	 * 		得到输入过滤对象
	 * @return:
	 * 		unieap.form.InputFilter
	 * @see：
	 * 		unieap.form.InputFilter
	 * @example:
	 * |var box=unieap.byId('box');
	 * |var formatter=box.getInputFilter();
	 */
	getInputFilter:function(){
		return unieap.getModuleInstance(this,"inputFilter","unieap.form.InputFilter");
	},

   /**
	* @summary:
	* 	获得消息提示管理器
	* @return:
	* 	unieap.form.PromptManager
	* @see:
	* 	unieap.form.PromptManager
	* @example:
	* |var box=unieap.byId('box');
	* |var formatter=box.getPromptManager();
	*/
	getPromptManager:function(){
		if(!this.prompt){
			this.prompt = {};
		}
		return unieap.getModuleInstance(this,"prompt","unieap.form.PromptManager");
	},

	/**
	 * @summary:
	 *		设置控件是否只读
	 * @param：
	 *		{boolean} readOnly
	 * @example:
	 * |var box=unieap.byId('box');
	 * |var formatter=box.setReadOnly(true);
	 */
	setReadOnly:function(readOnly){
		this.inputNode.readOnly= this.readOnly=readOnly;
		if(readOnly){
			//设置文本框的tabindex为-1
			this.focusNode && dojo.attr(this.focusNode,'tabindex',-1);
		    dojo.addClass(this.fieldNode,"u-form-readOnly");
		    dojo.addClass(this.inputNode,"u-form-textbox-input-readonly");
		}else{
			//还原文本框的tabindex
			this.focusNode && dojo.attr(this.focusNode,'tabindex',this.tabIndex||0);
			dojo.removeClass(this.fieldNode,"u-form-readOnly");
			dojo.removeClass(this.inputNode,"u-form-textbox-input-readonly");
		}
	},
	destroy:function(){
		if (this.inputNode)
			this.inputNode.onfocus = null; //防止内存泄漏
		this.inherited(arguments);
	},
	/**
	 * @summary:
	 * 		设置是否禁用控件
	 * @param:
	 * 		{boolean} disabled
	 * @example:
	 * |var box=unieap.byId('box');
	 * |box.setDisabled(true);
	 */
	setDisabled:function(disabled){
		//记录原始disabled状态
		if(this.disabled=disabled){
			this.inputNode.disabled=true;
			dojo.addClass(this.fieldNode,"u-form-disabled");
			dojo.addClass(this.inputNode,"u-form-textbox-input-disabled");
			//清除校验颜色,如果校验过就清除校验错误信息
			//this.wasValidated赋值见FormWidgetValidator.js文件
			this.wasValidated && this.getValidator().handleError(true);
		}else{
			dojo.removeAttr(this.inputNode,'disabled');
			dojo.removeClass(this.fieldNode,"u-form-disabled");
			dojo.removeClass(this.inputNode,"u-form-textbox-input-disabled");
		}
	},

	//////////////////////////////////////////内部方法///////////////////////////////////

	//如果trim为true,去掉value值的前后空格
	_trim:function(value){
		//当值为日期类型时，去掉空格后值转为字符串类型，在format时如果不是日期或者number类型，将返回空。
		//业务代码中日期值通常前后不会有空格，所以可以直接将值返回。
		if(value instanceof Date){
			return value;
		}
		//去掉半角和全角空格
		return this.trim?dojo.trim(value+"").replace(/^[\u3000]*/,"").replace(/[\u3000]*$/,""):value;
	},

	//对文本框进行延时校验
	_job:function(scope,fn){
//		var handleName= fn+"Handle";
//		var s = [];
//		Array.prototype.push.apply(s,arguments);
//		s.splice(0,2);
//		window.clearTimeout(scope[handleName]);
//		scope[handleName]=window.setTimeout(dojo.hitch(scope,function(){
//			this[fn].apply(this,s);
//		}),"250");
//		上面的代码可以实现往fn里面传入参数,例如:
//		this._job(this.getValidator(),'validate',3,4,5);
		var handleName=fn+"Handle";
		window.clearTimeout(scope[handleName]);
		scope[handleName]=window.setTimeout(dojo.hitch(scope,fn),"250");
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


	////////////////////////////////////////内部事件/////////////////////////////////////

	//执行inputNode的onfocus事件
	_onFocus:function(evt){
		//dojo1.4中会在dijit/_base/focus.js中执行this._onFocus方法
		//传入的evt为"mosue",屏蔽之
		if (!evt||typeof(evt)=="string")  return ;
		var validator=this.getValidator();
		//validator.handleError&&validator.handleError(true);
		
		//wangzhb U_EAP00013602
		if (!unieap.widget.form.alwaysShowErrMssage) { 
		  validator.handleError&&validator.handleError(true);
		}
		
		var value = this.getText();
//		this._focusValue = value;
		value = this.getDisplayFormatter().parse(value);
		value = this.getEditFormatter().format(value);
		if(this.inputNode.value!=value){
			//解决光标置入的问题
			this.inputNode.value = value;
//			if(dojo.isIE){
//				var range=this.inputNode.createTextRange();
//				range.collapse(false);
//				range.moveEnd('character',0);
//				range.select();
//			}
		}
		//显示promptMsg信息
		this._showPromptMsg(true);
		this.select();
		unieap.fireEvent(this,this.onFocus,[evt]);
	},
	//执行inputNode的onblur事件
	_onBlur:function(evt,flag){
		//dojo1.4中会在dijit/_base/focus.js中执行this._onBlur方法
		//传入的evt为"mosue",屏蔽之
		if (!evt||typeof(evt)=="string" && !flag)  return ;
		var value = this.getText(),
			nowValue=value;
		value = this.getEditFormatter().parse(value);
		value = this.getDisplayFormatter().format(value);
		nowValue != value && (this.inputNode.value = value);
		//失去焦点时进行校验
		//如果只读，不校验
		!this.readOnly && this.getValidator().validate();
		this.fireDataChange();
		this._showPromptMsg(false);
		unieap.fireEvent(this,this.onBlur,[evt]);
	},
	//执行inputNode的onchange事件
	_onChange:function(value){
		var isValid = this._lengthCheck();
		if(!isValid){
			  this.focusNode.value=this._subString(this.focusNode.value,this.maxLength);
		}
		value = this.getValue();
		this.fireDataChange();
		unieap.fireEvent(this,this.onChange,[value]);
	},
	//执行inputNode的onkeyup事件
	_onKeyUp:function(evt){
		var isValid = this._lengthCheck();
		if(!isValid){
			 this.focusNode.value=this._subString(this.focusNode.value,this.maxLength);
		}
		//如果realTime为true则进行及时校验
		var validator=this.getValidator();
		//延时校验
		validator.realTime&&this._job(validator,"validate");
		unieap.fireEvent(this,this.onKeyUp,[evt]);
	},

	//执行inputNode的onkeydown事件
	_onKeyDown:function(evt){
		switch(evt.keyCode){
			case dojo.keys.ENTER :
				this.fireDataChange();
				if(unieap.fireEvent(this,this.onEnter,[evt])==false) return;
				this._enter2Tab(evt);
				break ;
			case dojo.keys.TAB :
				this.fireDataChange();
				unieap.fireEvent(this,this.onTab,[evt]);
				break;
			case dojo.keys.BACKSPACE:
				//在IE8下，设置为文本框为readonly,但关闭依然可以置入
				//此时按住BACKSPACE键盘,页面会回退到上一页,这是ie浏览器本身的问题
				this.readOnly&&dojo.stopEvent(evt);
				unieap.fireEvent(this,this.onKeyDown,[evt]);
				break;
			default :
				unieap.fireEvent(this,this.onKeyDown,[evt]);
		}
	},


	//执行inputNode的onkeydown事件，触发tab键
	_enter2Tab : function(evt){
		if(!this.nextFocusId) {
			dojo.isIE?(evt.keyCode = dojo.keys.TAB):dojo.byId('unieap_for_focus').focus();
		} else {
			//避免回车触发按钮的onclick事件
			dojo.stopEvent(evt);

			dijit.byId((this._rootID||"")+this.nextFocusId)||dijit.byId(this.nextFocusId)?this.processNextFocusId():dojo.byId("unieap_for_focus").focus();

		}
		unieap.fireEvent(this,this.onTab,[evt]);
	},
	//执行inputNode的onkeypress事件
	_onKeyPress:function(evt){
		//如果设置了filter,则只能输入用户指定的字符
		this.getInputFilter().filter(evt);
		unieap.fireEvent(this,this.onKeyPress,[evt]);
	},
	//执行inputNode的ondblclick事件
	_onDblClick:function(evt){
		unieap.fireEvent(this,this.onDblClick,[evt]);
	},

	//执行inputNode的onclick事件
	_onClick:function(evt){

		if (unieap.fireEvent(this,this.onBeforeClick,[])) {
			unieap.fireEvent(this,this.onClick,[evt]);
		}
	},

	//执行inputNode的oncopy事件,如果是密码框,不可复制
	_onCopy:function(evt){
		if(this.password||!unieap.fireEvent(this,this.onBeforeCopy,[])){
			dojo.stopEvent(evt);
			return;
		}
		unieap.fireEvent(this,this.onCopy,[evt]);
	},

	//执行inputNode的onpaste事件,如果是密码框，不可粘贴
	_onPaste:function(evt){
		if(this.password||!unieap.fireEvent(this,this.onBeforePaste,[])){
			dojo.stopEvent(evt);
			return;
		}
		unieap.fireEvent(this,this.onPaste,[evt]);
	},
	//执行inputNode的onpaste事件,如果是密码框，不可粘贴
	_onCut:function(evt){
		if(this.password||!unieap.fireEvent(this,this.onBeforeCut,[])){
			dojo.stopEvent(evt);
			return;
		}
		unieap.fireEvent(this,this.onCut,[evt]);
	},

	//检查文本框中的value值长度是否超过了maxLength
	_lengthCheck:function(){
		var len=unieap.bitLength(this.getValue());
		return this.maxLength>0?this.maxLength>=len:true;
	},

	//从字符串中截取指定长度的字符串
	_subString:function(str,length){//length为要截取的长度
		var step=0; //当为汉字时，step增2，数字或者字母增1
		var str_temp="";
		for(var i=0,l=str.length;i<l;i++){
			str.charCodeAt(i)>255?step+=unieap.global.bitsOfOneChinese:step++;
			if(step>length)return str_temp;
			str_temp+=str.charAt(i);
		}
		return str;
	},

///////////////////////////////用户事件///////////////////////////////////////////

   /**
    * @summary:
    * 		点击事件前回调事件
    * @return:
    * 		{boolean}
    */
	onBeforeClick:function(){
		return true;
	},

	/**
	 * @summary:
	 * 		点击事件
	 * @param:
	 * 		 {event} evt
	 */
	onClick:function(evt){},

	/**
	 * @summary:
	 * 		回车键事件。在onkeydown事件中按下回车键触发事件。
	 * @param:
	 * 		{event} evt
	 */
	onEnter:function(evt){

	},
	/**
	 * @summary:
	 * 		Tab键事件。在onkeydown事件中按下tab键触发事件。
	 * @param:
	 * 		{event} evt
	 */
	onTab : function(evt){

	},

	/**
	 * @summary:
	 * 		当对象内容改变时触发。
	 * @param:
	 * 		{string} value
	 */
	onChange:function(value){},

	/**
	 * @summary:
	 * 		当用户释放键盘按键时触发
	 * @param:
	 * 		{event} evt
	 */
	onKeyUp:function(evt){},

	/**
	 * @summary:
	 * 		当用户按下或按住键盘键时触发
	 * @param:
	 * 		{event} evt
	 */
	onKeyPress:function(evt){},


	/**
	 * @summary:
	 * 		当用户按下键盘键时触发
	 * @param:
	 * 		{event} evt
	 */
	onKeyDown:function(evt){

	},


	/**
	 * @summary:
	 * 		在对象失去输入焦点时触发
	 * @param:
	 * 		 {event} evt
	 */
	onBlur:function(evt){
	},

	/**
	 * @summary:
	 * 		当对象获得焦点时触发
	 * @param:
	 * 		 {event} evt
	 */
	onFocus:function(evt){
	},

	/**
	 * @summary:
	 * 		当用户双击对象时触发
	 * @param:
	 * 		 {event} evt
	 */
	onDblClick:function(evt){

	},

	/*
	 * @summary:
	 * 		复制文本框到文本框之前触发
	 * @return:
	 * 		{boolean}
	 */
	onBeforeCopy:function(){
		return true;
	},

	/**
	 * @summary:
	 * 		当用户复制文本框里的数据时触发
	 * @type:
	 * 		{event} evt
	 */
	onCopy:function(evt){},

	/**
	 * @summary: 粘贴文字到文本框之前触发
	 * @return:
	 * 		{boolean}
	 */
	onBeforePaste:function(){
		return true;
	},
	/**
	 * @summary:
	 * 		当用户粘贴数据以便从系统剪贴板向文档传送数据时在目标对象上触发。
	 * @param:
	 * 		 {event} evt
	 */
	onPaste:function(evt){

	},
	/**
	 * @summary:
	 * 		剪切文本框中的文字之前触发
	 * @return:
	 * 		{boolean}
	 */
	onBeforeCut:function(){
		return true;
	},
	/**
	 * @summary:
	 * 		当用户剪文本框中的文字时触发
	 * @param:
	 * 		 {event} evt
	 */
	onCut:function(evt){

	},
	fireEvent : function(eventName,args){
		this._hasFiredEvent = this._hasFiredEvent || {};
		if(eventName in this._hasFiredEvent){
			return;
		} 
		this._hasFiredEvent[eventName] = true;
		setTimeout(dojo.hitch(this,function(){
			delete this._hasFiredEvent[eventName];
		}),0);
		return this[eventName](args);
	}

});