workflow.define("Util",function(){
	var timeOut=null;
	var infoTimeout=null;
	//以单帧方式加载制定页�?
	this.loadPage=function(containerId,url,iframe){
		if(timeOut)
			clearTimeout(timeOut);
		var self=this;
		timeOut=setTimeout(function(){self._loadPage(containerId, url,iframe)},500);
	}
	
	this._loadPage=function(containerId,url,iframe){
		var container=document.getElementById(containerId);
		//每次加载前销毁原有单帧对�?
		destroyxhrWidget(containerId);
		unieap.destroyWidgets(container);
		if(iframe){//非单帧
			var iframeStr='<iframe style="width:100%;height:100%;" class="tabIframe" frameborder="0" src="'+url+'"></iframe>';
			$(iframeStr).appendTo($(container).empty());
			
		}else{
			unieap.loader.load( {showXhrLoading : false,node : container,url : url});
		}//单帧加载
	}
	
	this.extLoadPage=function(containerId,url,deferred){
		var container=document.getElementById(containerId);
		//每次加载前销毁原有单帧对�?
		destroyxhrWidget(containerId);
		unieap.destroyWidgets(container);
		unieap.loader.load( {showXhrLoading : false,node : container,url : url,load:function(){deferred&&deferred.resolve();}});
	}
	
	this.removeContainer=function(containerId) {
		var container = document.getElementById(containerId);
		destroyxhrWidget(containerId);
		unieap.destroyWidgets(container);
		$(container).remove();
	}
	
	this.confirm=function(message,okCallBack,cancelCallBack){
		if(window!=top&&top.Util){
			top&&top.Util&&top.Util.confirm(message,okCallBack,cancelCallBack);
		}else{
			var messageContainer="<div class='confirm_message' id='confirm'></div>";
			var container=$(messageContainer);
			container.html(message);
			container.wDialog({
				    title:RIA_I18N.common.confirm,
		            modal:true,
		            width:'350px',
		            height:'150px',
		            confirm:okCallBack,
		            cancel:cancelCallBack,
		            appendTo:$(document.body)
				});
		}
		
	}
	
	this.info=function(message,type){
		if(window!=top&&top.Util){
			top&&top.Util&&top.Util.info(message);
			return;
		}
		if(infoTimeout){//防止多次点击
			return;
		}
		var messageContainer="<div class='infoMessage infoSuccess'>" +
				             "</div>";
		var container=$(messageContainer);
		container.html(message);
		var topWidth=$(top).width();
		var messageWidth=250;
		var left=(topWidth-messageWidth)/2;
		var info=container.bPopup({
	            modal:false,
	            easing: 'linear', //uses jQuery easing plugin
	            speed: 800,
	            transition: 'fadein',
	            position:[left,80]
		});
		
		infoTimeout=setTimeout(function(){
			info.close();
			infoTimeout=null;
		},1500);
	}
	
	this.error=function(briefMessage,detailMessage){
		if(window!=top&&top.Util){
			top&&top.Util&&top.Util.error(briefMessage,detailMessage);
			return;
		}
		var messageContainer="<div class='error_message'>" +
				"<div class='errorImg'></div>" +
				"<div class='briefMessage'></div>" +
				"<div style='width:100%;height:20px;font-weight:bold;'>"+RIA_I18N.common.detail+"</div>" +
				"<div class='detailMessage'></div>" +
				"</div>";
		var container=$(messageContainer);
		var scrollBarParams={
				autoHideScrollbar:false,
				theme:"dark-thick",
				advanced:{
					updateOnContentResize: true
				},
				axis:'yx'
		};
		container.find(".briefMessage").html(briefMessage.replace(new RegExp('<',"gm"),'(').replace(new RegExp('>',"gm"),')').replace(new RegExp('\\(br/\\)',"gm"),'<br/>'));
		container.find(".detailMessage").html("<div style='width:auto;float:left;margin-top:5px;'>"+detailMessage.replace(new RegExp('<',"gm"),'(').replace(new RegExp('>',"gm"),')').replace(new RegExp('\\(br/\\)',"gm"),'<br/>')+"</div>");
		
		container.wDialog({
	            modal:true,
	            title:RIA_I18N.common.error,
	            width:'600px',
	            height:'400px',
	            confirmOnly:true,
	            appendTo:$(document.body)
		});
		$(".detailMessage").mCustomScrollbar(scrollBarParams);
		$(".briefMessage").mCustomScrollbar(scrollBarParams);
	}
});