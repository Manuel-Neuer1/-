dojo.require("unieap.dialog.DialogUtil");
dojo.require("unieap.global");
dojo.provide("unieapx.trace.TraceMessageBox");

unieapx.trace.TraceMessageBox = {
	
	showTraceMessages:function(){
		DialogUtil.showDialog({
			title : RIA_UNIEAPX_I18N.trace.infoList,
			width:"800",
			height:"500",
			url : unieap.WEB_APP_NAME+"/techcomp/ria/unieapx/trace/ShowTraceMessages.jsp"
		});
	}
};