(function(){
	//异常处理，改回默认，返回false；
	_isExceptionControl = function(){
		return false;
	}
	// 异常处理for workflow
	_exceptionProcess = function(xhr,data,_dc,complete) {
		var json = null;
		if (xhr.responseText) {
			json = dojo.fromJson(xhr.responseText);
		} else {
			json = xhr;
		}
		var _dc = new unieap.ds.DataCenter(json);
		if (_dc.getCode() == -1) {
//			_dc.getTitle();
//			_dc.getDetail();
			Util.error(_dc.getTitle(),_dc.getDetail());
		} else if(_dc.getCode() == 0){
			var	dc = data.dc || globalDataCenter;
		    dc.append(_dc, data.coverage || "discard");
		    complete();
		}
		return true;
	};
	
	//将通过ria parameters传递的参数通一放入到Dc 参数中以防止乱码
	var formerAction=unieap.Action.requestData;
	unieap.Action.requestData=function(data,dc,showLoading){
		var isStruts2=data.url.indexOf(".action")>0;
		var paras=data.parameters;
		if(isStruts2&&paras&&dc){
			for(var name in paras){
	   			dc.setParameter(name,paras[name]);
	   		}
			data.parameters={};
		}

		return formerAction(data,dc,showLoading);
	}

})();