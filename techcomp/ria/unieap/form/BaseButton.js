dojo.provide("unieap.form.BaseButton");
dojo.require("unieap.form.FormWidget");
dojo.declare("unieap.form.BaseButton", unieap.form.FormWidget, {
	/**
	 * @declaredClass:
	 * 		unieap.form.BaseButton
	 * @summary:
	 * 		所有按钮的基类
	 * @superClass:
	 * 		unieap.form.FormWidget
	 */
	 
	//配置属性接口 
	UserInterfaces : dojo.mixin({
		accessKey : "string",
		onEnter : "function",
		onTab : "function",
		onKeyDown : "function",
		onClick : "function"	
	},
	unieap.form.FormWidget.prototype.UserInterfaces),
	
	/**
	 * @summary:
	 * 		设置或获取对象的快捷键
	 * @type:
	 * 		{string}
	 * @example:
	 * |<div dojoType="unieap.form.Button" accessKey="j" label="J">
	 * |</div>
	 * 		在ie中按下Alt+j 触发这个按钮的onClick事件。
	 * 		其它浏览器需要使用各自的组合键。			
	 */
	accessKey: "",	
	
	postCreate: function() {
		this.inherited(arguments);
		this.inputNode.accessKey = this.accessKey;
		var flag = true;
		if("" != this.accessKey){
			flag = false;
		}
		this._postCreate(); 
		this.connect(this.inputNode, "onclick", "_onButtonClick",flag);
		this.connect(this.inputNode,'onkeydown','_onKeyDown',flag);
	},
	
	//子类初始化其他方法和参数
	_postCreate : function(){		
	},
	
	
	//绑定click事件
	_onButtonClick: function(/*Event*/ e) {
		unieap.fireEvent(this,this.onClick,[e]);
		dojo.stopEvent(e);
	},
	
	
	_onKeyDown:function(evt){
		switch(evt.keyCode){
			case dojo.keys.ENTER :
				this._onEnterDown(evt);
				break ;
			case dojo.keys.TAB :
				unieap.fireEvent(this,this.onTab,[evt])
				break;
			default :
				unieap.fireEvent(this,this.onKeyDown,[evt])
		}		
	},
	
	_onEnterDown: function(evt) {
		if(unieap.fireEvent(this,this.onEnter,[evt])==false) return;
		this._enter2Tab(evt);
	},

	//执行inputNode的onkeydown事件，触发tab键
	_enter2Tab : function(evt){
		if(dojo.isIE&&!this.nextFocusId) {
			evt.keyCode = dojo.keys.TAB
		} else {
			//避免回车触发按钮的onclick事件
			dojo.stopEvent(evt);
			this.processNextFocusId();
		}
		unieap.fireEvent(this,this.onTab,[evt])
	},
	
	
	onEnter:function(evt){},
    
	onTab:function(evt){},	
	
	onKeyDown:function(evt){},
	
	
	
	/**
	 * @summary:
	 * 		按钮的点击事件
	 * @description:
	 * 		注意大小写，编程方式创建时'onClick'将不被解析
	 * @param:
	 * 		{event} e
	 * @example:
	 * |<div dojoType="unieap.form.Button" onClick="hello()"></div>
	 * 		绑定hello方法到onClick事件		
	 */
	onClick: function(/*Event*/ e) {			
	},
	
	focus: function() {
		this.focusNode&&this.focusNode.focus();
	}
});

//@ sourceURL=/tp_fp/techcomp/ria/dojo/../unieap/form/BaseButton.js