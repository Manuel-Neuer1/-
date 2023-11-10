(function($){
	var dialogNum=0;//记录dialog的个数
	$.fn.wDialog=function(options, callback){
	        //模态是，蒙层的透明度，默认0.5
	        if(!options['opacity']){
	        	options['opacity']=0.5;
	        }
	        //根据目标按钮的位置，计算窗体应该显示的位置
		var targetObject=options['target'];
		if(targetObject){
			var left=targetObject.offset().left;
			var top=targetObject.offset().top;
			var width=targetObject.width();
			var height=targetObject.height();
			if(!options['position']){
				options['position']=[left+width-2,top+height+2];
			}
		}
		
		//弹出的dialog的templateStr
		var dialogId="dialog_"+dialogNum++;
		var container="<div class='wdialog' id='" +dialogId+"'><div class='wdialog_content'>"+
		            "<div class='wdialog_header'><div class='wdialog_title'></div></div>"+
					"<div class='wdialog_body'  id='"+dialogId+"_body'>" +
					 "</div>" +
					 "<div class='wdialog_toolbar'><div class='centerButton'>" +
					 	"<div class='wbtn_confirm'>"+RIA_I18N.common.ok+"</div>"+
					 	"<div class='wbtn_cancel'>"+RIA_I18N.common.cancel+"</div>"
					 "</div></div>" +
				     "</div></div>";
		this.css("display","block");
		
		var dialog=$(container);
		options["height"]&&dialog.height(options["height"])&&(options["outerHeight"]=dialog.height()+12);
		options["width"]&&dialog.width(options["width"])&&(options["outerWidth"]=dialog.width()+12);
		//设置窗体的title
		if(options["title"]){
			var title=dialog.find(".wdialog_title");
			title.css({display:'block'});
			title.html(options['title']);
		}else{
			var header=dialog.find(".wdialog_header");
			header.css({display:'none'});
			$(".wdialog_body").css({
			height : dialog.height() - $(".wdialog_toolbar").height()-15
			});
		}
		//为确定和取消按钮添加监听事件
		dialog.find(".wbtn_confirm").click(function(){
			unieap.publish("dialogClose");//发布窗体关闭消息
			var canClose=true;
			if(options['confirm']){
				var result=options['confirm']();
				if(result===false) canClose=false;
			}
			if(canClose)
				dialog.close();
		});
		
		if(options["confirmOnly"]&&options["confirmOnly"]===true){
			dialog.find(".wbtn_cancel").css({display:'none'});
			dialog.find(".centerButton").css({width:'102px'});
		}else{
			dialog.find(".wbtn_cancel").click(function(){
			options['cancel']&&options['cancel']();
			dialog.close();
		    });	
		}
		
		//提示框类型
		if(options["type"]){
			 //防止多处点击，造成的提示框重复显示
			 var defaultClass="."+options["type"];
			 $(defaultClass).remove();
			 dialog.addClass(options["type"]);
			 dialog.find(".wdialog_toolbar").css("display","none");
			 if(!options['position']){
				    var left=($(document.body).width()-options["width"])/2;
					options['position']=[left,4];
			 }
		}
		//支持绑定一个url以及绑定一段html串
		if(options["iframe"]===false){//单帧加载
			options["targetUrl"]=options['loadUrl'];
			delete options['loadUrl'];
		}
		else if(options['loadUrl']){//以iframe加载
			options['contentContainer']='.wdialog_body';
			options['content']='iframe';
		}else 
			this.appendTo(dialog.find(".wdialog_body"));
		
		options["onClose"]=function(){
			if(options["iframe"]!=true){
				var container=dialog.find(".wdialog_body")[0];
				unieap.destroyWidgets(container);
			}
			dialog.remove();
		};
		
		dialog.appendTo($(document.body));
		//动态调整body的宽和高
		dialog.find(".wdialog_body").css({
			height : dialog.height() - dialog.find(".wdialog_header").height()- dialog.find(".wdialog_toolbar").height()-15
		});
		//单帧环境下回调加载
		return dialog.bPopup(options,function(){
			if(options["iframe"]===false){
				var dialogBody=dialog.find(".wdialog_body")[0];
				unieap.loader.load( {showXhrLoading : false,node : dialogBody,url : options['targetUrl']});
			}
			var id=dialog.data("id");
			$('.b-modal.'+id).unbind('click');
			callback&&callback();
			
		});
	};
})(jQuery);