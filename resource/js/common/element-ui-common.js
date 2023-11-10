var elementUtil={
    renderDategroup:function(widget){//渲染日期组
            var startTextNow =  widget.element.find("[name='start_time']").val();
            var endTextNow = widget.element.find("[name='end_time']").val();
            widget.element.hide();
            widget.element.after("<div id='"+widget.id+"_elementui'>"+
                                    "<el-date-picker "+
                                          "v-model='value' "+
                                          "type='daterange' "+
                                          "range-separator='至' "+
                                          "start-placeholder='开始日期' "+
                                          "value-format='yyyy-MM-dd' "+
                                          "@change='change' "+
                                          "end-placeholder='结束日期' "+
                                          ":picker-options='dateOptions'>"+
                                        "</el-date-picker></div>");
            widget.dateGroupVm= new Vue({//挂载
                       el:"#"+widget.id+"_elementui",
                       methods:{
                        change:function(){
                          var isVal = Util.isNotEmpty(this.value);
                          var startText = isVal?this.value[0]:"";
                          var endText = isVal?this.value[1]:"";
                          var callbacks=this.widget.afterChoose;
                          for( var index in callbacks){
                              if(callbacks[index].call(this.widget.element,startText,endText)==false){
                                   return;
                              }
                          }
                          this.widget.element.find("[name='start_time']").val(startText);
                          this.widget.element.find("[name='end_time']").val(endText);
                          this.widget.start_time = startText;
                          this.widget.end_time = endText;
                          var $elementui = $("#"+widget.id+"_elementui");
                          if($elementui.data("qtip")){//有必填提示tip则去掉
                              var api = $elementui.qtip('api');
                              api.destroy(true);
                          }
                        }
                       },
                       data:{
                          value:[Util.isNotEmpty(startTextNow)?startTextNow:"",Util.isNotEmpty(endTextNow)?endTextNow:""],
                          widget:widget,
                          dateOptions:{disabledDate:null}
                       },
                       mounted:function(){
                        var widget = this.widget;
                        var $elementui = $("#"+widget.id+"_elementui");
                        $(".el-date-editor--daterange",$elementui).css("height","34px").css("width","100%");
                        $("span,i",$elementui).css("line-height","28px");
                        $(".el-range-separator",$elementui).css("width","10%")
                       }
            })
    },
    renderDategroupRepeator:function($element,repeator){//渲染日期组
            $element.hide();
            var widgetObj = {};
            widgetObj.type="elementui";
            widgetObj.vmId=Math.getUuid("elementui",25,32);
            $element.after("<div id='"+widgetObj.vmId+"'>"+
                                    "<el-date-picker "+
                                          "v-model='value' "+
                                          "type='daterange' "+
                                          "range-separator='至' "+
                                          "start-placeholder='开始日期' "+
                                          "value-format='yyyy-MM-dd' "+
                                          "@change='change' "+
                                          "end-placeholder='结束日期' "+
                                          ":picker-options='dateOptions'>"+
                                        "</el-date-picker></div>");
            widgetObj.vm= new Vue({//挂载
                       el:"#"+widgetObj.vmId,
                       methods:{
                        change:function(){
                            var isVal = Util.isNotEmpty(this.value);
                            var startText = isVal?this.value[0]:"";
                            var endText = isVal?this.value[1]:"";
                            this.element.find("[name='start_time']").val(startText);
                            this.element.find("[name='end_time']").val(endText);
                            var widget = this.element.data("widget");
                            widget.start_time = startText;
                            widget.end_time = endText;
                            var $elementui = $("#"+widget.vmId);
                            if($elementui.data("qtip")){//有必填提示tip则去掉
                              var api = $elementui.qtip('api');
                              api.destroy(true);
                            }
                            RepeatorWidgets.dategroup.collectData(this.element,repeator);
                            RepeatorWidgets.qtipChange.call(this.element,'dategroup');
                        }
                       },
                       data:{
                          value:'',
                          element:$element,
                          dateOptions:{disabledDate:null}
                       },
                       mounted:function(){
                        var $elementui = $("#"+widgetObj.vmId);
                        $(".el-date-editor--daterange",$elementui).css("height","34px").css("width","100%");
                        $("span,i",$elementui).css("line-height","28px");
                        $(".el-range-separator",$elementui).css("width","10%");
                       }
            })
            $element.data("widget",widgetObj);
    }
}