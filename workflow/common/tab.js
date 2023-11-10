(function($){
	$.fn.tab=function(options){
		var htmlTemplate='<div>'+
												'<%for(var i=0;i<list.length;i++){ var ele=list[i];%>'+
												'<div  class="workflow_tab"  index="<%=i%>"><%=ele.name%></div>'+
												'<%}%>'+
									'</div>'+
									'<div class="tab_seperator"></div>';
		var formTemplete='<div class="form_div"  style="display:none;overflow:auto;"  id="<%=id%>">'+
		                 '<iframe style="width:100%;height:100%;" class="tabIframe" frameborder="0" src=""></iframe>'+
		                 '</div>';

		var render = template.compile(htmlTemplate);
		var html = render({'list':options['data']});
	    var container=$(html);
	    container.appendTo(this);
	    function tabClick(){
	    	var selectId=$(this).attr("index");
	    	var formId = "form_div_"+selectId;
            var url = options['data'][selectId]['url'];
	    	if(options['data'][selectId].isreload){
		    	if($("#"+formId).length<=0){
		    		var render = template.compile(formTemplete);
		    		var html = render({'id':formId});
		    	    $(".tab_seperator").after(html);
		    	}else{
		    		$("#"+formId).remove();
		    		var render = template.compile(formTemplete);
		    		var html = render({'id':formId});
		    	    $(".tab_seperator").after(html);
		    	}
	    	}else{
		    	if($("#"+formId).length<=0){
		    		if(url!=""){
		    			var render = template.compile(formTemplete);
			    		var html = render({'id':formId});
			    	    $(".tab_seperator").after(html);
		    		}
		    	}
	    	}
	    	$(".tab_selected").removeClass("tab_selected");
	      var iForm=$(".tabIframe")[0];
	      if(iForm){
	      	/*if(url.indexOf("monitor")<0){//对监控模块tab页，不进行滚动条特殊处理，原因为flex监控页面不好控制.在其他多tab下也不稳定，去除效果
	      		var scrollBarParams={
			          	autoHideScrollbar:true,
						theme:"dark-thick",
						advanced:{
			                    updateOnContentResize: true
			            },
			            axis:'yx'
			          };
				  	$(".tabIframe").css("height", $(".form_div").height());
				    $(".tabIframe").css("width", $(".form_div").width());
			  	    $("#"+formId).mCustomScrollbar(scrollBarParams);//先给iframe预设一个高和宽，然后在调用scrollbar api，不然iframe会被覆盖
				  	if (iForm.attachEvent){ 
				      iForm.attachEvent("onload", function(){
					     $(".tabIframe").css("height", iForm.contentWindow.document.body.scrollHeight+18);
					     $(".tabIframe").css("width", iForm.contentWindow.document.body.scrollWidth+18);
				      }); 
				    } else { 
						iForm.onload = function(){
					        $(".tabIframe").css("height", iForm.contentWindow.document.documentElement.scrollHeight);
						    $(".tabIframe").css("width", iForm.contentWindow.document.documentElement.scrollWidth+10);
						}; 
				   } 
	      	}*/
			iForm.src=url;
	      }
		  
	    	
	    	
	    	var tab=$(this);
	    	$(".form_div").each(function(){
	    		if(this.id===formId){
	    			tab.addClass("tab_selected");
	    			$(this).show();
	    		}
	    		else
	    			$(this).hide();
	    	});
	    	var selectId="form_div_"+$(this).attr("index");
	    	if(options['afterTabClick']!=null){
	    		options['afterTabClick'](selectId);
	    	}

	    };
	     $(".workflow_tab").click(tabClick);
	    tabClick.call($(".workflow_tab")[0]);

	}
})(jQuery);