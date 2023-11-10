/**
 * 工作流扩展tooltip组件，依赖jquery.qtip插件
 */
(function($){
	$.fn.wTooltip=function(option){
		var htmlContent=option.content;
		var height=option.height;
		var width=option.width;
		var target=option.target ? option.target :'bottomRight';
		var tooltip=option.tooltip ? option.tooltip :'topMiddle';
		var corner=option.corner ? option.corner :'topMiddle';
		var options={
			   show: 'click',
			   hide: 'unfocus',
			   api:{},
			   position: {
				      corner: {
				         target: target,
					     tooltip: tooltip
				      }
				},
			   style: { 
				      width: width,
				      height:height,
				      background: '#4e4e58',
				      tip: {color:'#4e4e58',corner:corner,size:{height:6,width:6}},
				      classes:{content:'qtip-content'},
				      padding:0,
				      opacity:0.8,
				      border:{width:2,radius:2,color:'#4e4e58'},
				      name:'dark'
				   },
			  content:{
				  	text:htmlContent,
				  	prerender:true
			       }
			};
		if(option['onRender']){
			options.api.onRender=option['onRender'];
		}
		$(this).qtip(options);
	}
})(jQuery);