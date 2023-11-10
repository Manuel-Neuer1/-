if(!dojo._hasResource["unieap.form.Textarea"]){
dojo._hasResource["unieap.form.Textarea"] = true;
dojo.provide("unieap.form.Textarea");
dojo.require("unieap.form.TextBox");
dojo.declare("unieap.form.Textarea", unieap.form.TextBox, {
	/**
	 * @summary:
	 * 		Textarea控件,相当于HTML中的textarea标签
	 * @declaredClass:
	 * 		unieap.form.Textarea
	 * @superClass:
	 * 		unieap.form.TextBox
	 * @img:
	 * 		images/form/textarea.png
	 * @example:
	 * |	<div dojoType="unieap.form.Textarea" ></div>
	 * @default:
	 * 		"50px"
	 */
	
	height:'50px',
	
	postCreate : function(){
		//Textarea控件不应该为密码框
		this.password=false;
		var inputNode = this.inputNode;
		dojo.style(this.fieldNode,'position','relative');
		//修改errorNode的定位方式,不用float的方式而是absolute,见bug U_EAP00008166
		dojo.style(this.errorNode,{position:'absolute',right:'17px'});
		//将input替换成textarea
		this.inputNode = this.focusNode = dojo.create('textarea',{
			'class':'u-form-textarea-input',
			'name':inputNode.name,
			'tabIndex':inputNode.tabIndex,
			'style':{overflowX:'hidden',overflowY:'scroll'}
		});
		inputNode.parentNode.replaceChild(this.inputNode,inputNode);
		this.inputNode.onfocus = function(){
			unieap.fep && unieap.fep(this);
		};
		dojo.style(this.inputNode.parentNode,"height","100%");
		dojo.style(this.inputNode,"height","100%");
		this.inherited(arguments);
		this.connects = [];
		if(this.height.indexOf("%")>0){
			dojo.addClass(this.domNode,"unieap-container");
		}
		else{
			var h = parseInt(this.height,10) - 2;
//			dojo.style(this.fieldNode,'height',h + "px");
			dojo.style(this.inputNode,'height',h + "px");
		}
	},
	//默认情况下,按Enter键会执行Tab操作,return false就不会了
	onEnter : function(){
		return false;
	},
	//改变容器大小
	resizeContainer : function(){
		var box = dojo.contentBox(this.domNode),h = box.h -2;
		if(h>0){
			dojo.style(this.fieldNode,'height',h + "px");
			dojo.style(this.inputNode,'height',h + "px");
		}	
	},
	startup : function(){
		dojo.require("unieap.layout.Container");
		var cp = unieap.layout.Container.prototype;
		//没有外层容器
		if(!cp.getParentContainer.apply(this,arguments)){
			cp.bindEvent4onresize.apply(this,arguments);
			this.resizeContainer();
		}
	},
	destroy:function(){
		this.inherited(arguments);
		while(this.connects.length){
			dojo.disconnect(this.connects.pop());
		}
	},
	setHeight: function(height) {
		this.inherited(arguments);
		if(height.indexOf("%")>0){
			dojo.addClass(this.domNode,"unieap-container");
			this.resizeContainer();
		}
		else{
			var h = parseInt(height,10) - 2;
//			dojo.style(this.fieldNode,'height',h + "px");
			dojo.style(this.inputNode,'height',h + "px");
		}
	}
});
}