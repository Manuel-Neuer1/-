unieap.relogin = "/techcomp/security/loginProcessor!relogin.action";
unieap.kicked = "/techcomp/security/loginProcessor!kicked.action";
if(dojo._hasResource["unieap.form.RichTextEditor"]){
	dojo.require("unieap.form.RichTextEditor");
	unieap.form.RichTextEditor.extend( {
		// 图片文件上传的后台操作路径
		imageUploadURL:unieap.WEB_APP_NAME+"/techcomp/ria/richEditorAction.action?Type=Image",
		// 链接文件上传的后台操作路径
		linkUploadURL:unieap.WEB_APP_NAME+"/techcomp/ria/richEditorAction.action?Type=File",
		// Flash文件上传的后台操作路径
		flashUploadURL:unieap.WEB_APP_NAME+"/techcomp/ria/richEditorAction.action?Type=Flash"
		
	});
}
////统一Grid选择处理
//dojo.require("unieap.grid.manager.ViewManager");
//unieap.grid.manager.ViewManager.extend( {
//	onRowClick : function(event) {
//		if(!event.grid){
//			return;
//		}
//		var selectionManager = event.grid.getManager('SelectionManager');
//		selectionManager && selectionManager.setSelect(event.rowIndex, true);
//	},
//
//	onRowDblClick : function(event) {
//		if(!event.grid){
//			return;
//		}
//		var selectionManager = event.grid.getManager('SelectionManager');
//		selectionManager && selectionManager.setSelect(event.rowIndex, true);
//	}
//});
//dojo.require("unieap.xgrid.manager.ViewManager");
//unieap.xgrid.manager.ViewManager.extend( {
//
//	onRowClick : function(event) {
//		if(!event.grid){
//			return;
//		}
//		var selectionManager = event.grid.getManager('SelectionManager');
//		selectionManager && selectionManager.setSelect(event.rowIndex, true);
//	},
//
//	onRowDblClick : function(event) {
//		if(!event.grid){
//			return;
//		}
//		var selectionManager = event.grid.getManager('SelectionManager');
//		selectionManager && selectionManager.setSelect(event.rowIndex, true);
//	}
//});