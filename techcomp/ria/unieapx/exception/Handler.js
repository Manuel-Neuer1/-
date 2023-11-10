dojo.provide("unieapx.exception.Handler");
unieapx.exception.Handler = {
		
	getBusinessExceptionType: function(){
		return 'businessException';
	},
	getSystemExceptionType: function(){
		return 'sytemException';
	},
	handleBusinessException : function(dc) {
		this._displayBusinessException(dc, unieapx.exception.Handler.getBusinessExceptionType());
	},
	handleSystemException : function(dc) {
		this._displayException(dc, unieapx.exception.Handler.getSystemExceptionType());
	},
	_displayException : function(dc, exType) {
		var dialog = DialogUtil.showDialog( {
			dialogData : {
				dc : dc,
				exType : exType
			},
			url : unieap.WEB_APP_NAME
					+ "/techcomp/ria/unieapx/exception/error.jsp",
			title : RIA_UNIEAPX_I18N.exception.title,
			height : "110",
			width : "400",
			isExpand:false,
			resizable:false
		});
//		dialog.show();
	},
	
	_displayBusinessException:function(dc, exType) {
//		MessageBox.alert({title:'确认框',message:dc.header.message.title}); // MODIFY BY TENGYF
		if(unieap.recordScript){
			unieap.exceptionScriptDC = dc;
		}
		MessageBox.alert({title:RIA_UNIEAPX_I18N.exception.confirmTitle,message:dc.header.message.title});
	}

};
