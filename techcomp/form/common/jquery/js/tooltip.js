/**
 * 工作流扩展tooltip组件，依赖jquery.qtip2插件
 */
(function($){
  $.fn.formTooltip=function(option){
    var htmlContent=option.content;
    var my="right top";
    var at="bottom right";
    if(option.at){
      at=option.at;
    }
    if(option.my){
      my=option.my;
    }
    var options={
         show:{
           ready:true,
           when:{
             event:'blur'
           }
         },
         hide: {
             event: 'click',
             inactive: 8000
         },
         api:{},
         position: {
           my:my,
           at:at
        },
         style: {
            classes:'qtip-red qtip-rounded'
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