dojo.provide("unieapx.trace.MessageCenter");
dojo.require("unieap.form.BaseButton");
dojo.require("unieap.form.Button");
dojo.require("unieap.dialog.Dialog");
dojo.declare("unieapx.trace.MessageCenter", unieap.form.BaseButton,{
	
	templateString:
		"<a href='javascript:void(0);'>" +
			"<div dojoAttachPoint=\"iconNode\">"+
			"</div>"+
		"</a>",
	iconClass:"iconTrace",
		
	postCreate:function(){
		this.iconClass&&this.setIconClass(this.iconClass);
		this.connect(this.iconNode,'onclick',this.onClick);
	},
	onClick:function(){
		unieapx.dialog.TraceMessageBox.showTraceMessages();
	},
	setIconClass: function(className) {
		this.iconClass&&dojo.removeClass(this.iconNode,this.iconClass);
		dojo.addClass(this.iconNode,className);
		this.iconClass=className;
	}
	
});