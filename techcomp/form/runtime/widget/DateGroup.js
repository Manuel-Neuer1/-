WebForm.widget("unieap.form.dateGroup", WebForm.FormWidget,{
	dateGroupVm:null,//vue对象
	id:"",
	start_time:"",
	end_time:"",
    afterChoose:[],
    bindAfterChooseEvent:function(callback){
        this.afterChoose.push(callback);
    },
	_create:function(){
	            this._super(arguments);
	            var widget = this;
	            var disabled = widget.element.attr("disabled");
	            widget.element.after('<div class="" id="'+ widget.element.attr("id") +'_NOTNULL_DIV" style="width:10px;height:30px;position:absolute;top:calc(50% - 15px);right: 12px;"></div>');
	            var notnull = widget.element.attr("notnull");
	            if(notnull == "true" && disabled == undefined){
                    $("#"+ widget.element.attr("id")+"_NOTNULL_DIV").addClass("notnull");
	            }
	            //监听控件notnull属性的变化。如果新增了notnull属性，则.addClass("notnull")；如果删除了notnull属性，则.removeClass("notnull")；
                var targetNode = widget.element[0];
                var options = { attributes: true, childList: false,subtree:false,attributeOldValue:true};
                function callback(mutationsList, observer) {
                	mutationsList.forEach(function(record) {
                    	if(record.attributeName=="notnull"){
                    	// 如果发生变化的属性是notnull
                    		if($(record.target).attr("notnull") == "true" && $(record.target).attr("disabled") == undefined){
                    			//如果notnull为true了，并且当前不是“disabled”的，addClass("notnull");
                    			$("#"+ widget.element.attr("id")+"_NOTNULL_DIV").addClass("notnull");
                    		}else if($(record.target).attr("notnull") == undefined){
                    			//如果notnull属性不存在，removeClass("notnull");
                    			$("#"+ widget.element.attr("id")+"_NOTNULL_DIV").removeClass("notnull");
                    		}
                    	}
                   });
                }
                if(navigator.userAgent.toLowerCase().indexOf("msie") == -1){
                	var mutationObserver = new MutationObserver(callback);
                	mutationObserver.observe(targetNode, options);
                }
                //监听上传控件notnull属性的变化end

                if(!Util.isNotEmpty(disabled)){
                    if(Util.getClientInfo()==="PC"){
                        elementUtil.renderDategroup(widget);
                    }else{
                        $("[name='start_time']",widget.element).attr("onfocus","this.blur();");//禁止ios端点击日期框后，日期框获取到焦点
                        $("[name='end_time']",widget.element).attr("onfocus","this.blur();");
                        widget.element.on("click",function(){
                            $(this).data("FormWidget").dateGroupVm.$data.show=true;
                            if(widget.start_time&&widget.end_time){
                               $(this).data("FormWidget").dateGroupVm.$data.defaultDate=[new Date(widget.start_time.replace(/-/g, '/')),new Date(widget.end_time.replace(/-/g, '/'))];
                            }
                        })
                        $('#'+widget.id+'_vant',parent.window.document).remove();
                        var position = "bottom";
                        $("body",parent.window.document).append('<div name="date_vant" id="'+widget.id+'_vant"><van-calendar v-model="show" :min-date="minDate" :max-date="maxDate" :default-date="defaultDate" :allow-same-day="true" type="range" @confirm="onConfirm"  position="'+position+'"/></div>');//渲染vue标签到父页面
                        var now = new Date();
                        widget.dateGroupVm= new parent.Vue({//挂载
                                   el:"#"+widget.id+"_vant",
                                   data:{
                                             show: false,
                                             date:'',
                                             widget:widget,
                                             minDate: new Date(now.getFullYear()-2, 0, 1),
                                             maxDate: new Date(now.getFullYear()+10, 11, 31),
                                             defaultDate : [now,new Date(now.getTime()+24*60*60*1000)]
                                   },
                                   methods: {
                                       onConfirm:function(date) {
                                          var start = date[0];
                                          var end = date[1];
                                          this.show = false;
                                          var startText = Util.dateFormatter(start,'yyyy-MM-dd');
                                          var endText = Util.dateFormatter(end,'yyyy-MM-dd');
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
                                          if(this.widget.element.data("qtip")){//有必填提示tip则去掉
                                              var api = this.widget.element.qtip('api');
                                              api.destroy(true);
                                          }
                                       },
                                   },
                        })
                    }
                }
	},
	//根据当前currentValue值设置dom
	setDomValue:function(){
          this.start_time=this.bindRow.getItemValue(this.bindName+"_START");
          this.end_time=this.bindRow.getItemValue(this.bindName+"_END");
          this.element.find("[name='start_time']").val(this.start_time);
          this.element.find("[name='end_time']").val(this.end_time);
          if(Util.getClientInfo()=="PC"){
            if(Util.isNotEmpty(this.dateGroupVm)){
                this.dateGroupVm.value = [Util.isNotEmpty(this.start_time)?this.start_time:"",Util.isNotEmpty(this.end_time)?this.end_time:""];
            }
          }
	},

	submitValue:function(){
       	if (this.bindRow){
       		this.bindRow.setItemValue(this.bindName+"_START",this.start_time);
       		this.bindRow.setItemValue(this.bindName+"_END",this.end_time);
       	}
	}
});