WebForm.widget("unieap.form.GroupBox",WebForm.FormWidget,{
	groupBoxVm:null,//vue对象
	isVue:false,
	sortObject:{},//排序对象
	direction:'',
	type:'',
	change:null,//change回调
	bindChangeEvent:function(callback){
		this.change=callback;
	},
	_create:function(){
		if(Util.isIE()){ //如果是IE浏览器，宽度设置为100%，避免由于选项内容过多导致选项超出屏幕问题，但是必填的红色星花会在最右。
    		this.element.css("width","100%");
    	}else{ //如果是其他浏览器，宽度设置为auto，必填的星花会挨着选项内容显示。
    		this.element.css("width","auto");
    	}
		if(this.element.attr("isVue")==="true"){//新配置的groupbox有vue属性
			this.isVue = true;
		}
		this.type = this.element.attr("type");
		this.direction = this.element.attr("direction");
		this.inputNodes=[];//输入域节点
		this.labels=[];
		this._super(arguments);
		var that=this;
		var isNotNull=false;
		if(this.element.attr("notnull")){
			this.element.addClass("notnull");
			isNotNull=true;
		}
		if (this.isVue) {
		    var data = {
                result:[],
                jqObj:this.element,
                isDisabled:this.element.attr("disabled") && this.element.attr("disabled")=="disabled"
            };
			var vantStr = '';
			if (this.type==='radio') {
				vantStr = '<van-radio-group v-model="result" direction="'+this.direction+'" :disabled="isDisabled" @change="change()">';
				this.element.find(".checkbox-label").each(function(i,o){//遍历选项
				    var text = $(o).text();
				    var sign = "option"+(i+1);
				    data[sign] = true;
				    vantStr = vantStr+'<van-radio :disabled="'+sign+' ==false" name="'+text+'">'+text+'</van-radio>';
				});
				vantStr = vantStr+'</van-radio-group>'
			} else if (this.type==='checkbox'){
				vantStr = '<van-checkbox-group v-model="result" direction="'+this.direction+'" :disabled="isDisabled" @change="change()">';
				var widgetObject = this;
				this.element.find(".checkbox-label").each(function(i,o){//遍历选项
                    var text = $(o).text();
                    var sign = "option"+(i+1);
                    data[sign] = true;
				    vantStr = vantStr+'<van-checkbox shape="square" :disabled="'+sign+' ==false" name="'+text+'">'+text+'</van-checkbox>';
				    widgetObject.sortObject[text]=i;
				});
				vantStr = vantStr+'</van-checkbox-group>'
			}else{
				this.element.empty();
				return;
			}
			$('<div id="'+this.element.attr("id")+'_vant"></div>').appendTo(this.element.empty()).append(vantStr);
			this.groupBoxVm = new Vue({
				el:'#'+this.element.attr("id")+'_vant',
				data:data,
				methods:{
					change:function(){
						var groupbox=this.jqObj;
						var flag=false;
						if(this.result.length>0){
							flag=true;
						}
						if(flag&&this.result instanceof Array){//有值且是数组，则排序
                             Util.shellSort(this.result,groupbox.data("FormWidget").sortObject);
						}
						if(flag==false && this.jqObj.attr("notnull") == "true"){
						  if(groupbox.data("qtip")){
						    var api = groupbox.qtip("api");
						    api.set("content.text",WebForm_I18N.validate.notnull);
						    api.toggle(true);
						  }else{
						    groupbox.formTooltip({
						      content:WebForm_I18N.validate.notnull,
						      my:"right top",
						      at:"right bottom"
						    });
						  }
						}else{
						  if(groupbox.data("qtip")){
						    var api = groupbox.qtip('api');
						    api.destroy(true);
						  }
						}
						if(this.jqObj.data("FormWidget").change!=null){
							this.jqObj.data("FormWidget").change.call(this.jqObj,this.result);
						}
						//显示必填or隐藏非必填其他
						var othersBind = groupbox.attr("othersBind");
						if(othersBind){
						    var $othersP = $("#"+groupbox.attr("id")+"_othersP");
						    var $othersInput = $("#"+groupbox.attr("id")+"_othersInput");
						    if(this.result.length>0&&(this.result==othersBind||$.inArray(othersBind,this.result)>-1)){
                                this.jqObj.css("transform","translateY(3px)");
						        $othersP.css("display","inline-block");
						        $othersInput.attr("notnull","true");
						    }else{
						        this.jqObj.css("transform","");
						        $othersP.css("display","none");
						        $othersInput.removeAttr("notnull");
                                if($othersInput.data("qtip")){
                                    var api = $othersInput.qtip('api');
                                    api.destroy(true);
                                }
						    }
						}

					}
				},
				mounted: function () {
					$(".van-icon",this.jqObj).css("font-weight","bold");
					if (this.isDisabled) {
						$(".van-checkbox__icon--disabled.van-checkbox__icon--checked .van-icon",this.jqObj).css("color","#1989fa");
						$(".van-radio__icon--disabled.van-radio__icon--checked .van-icon",this.jqObj).css("color","#1989fa");
					}
					$(".van-checkbox-group--vertical",this.jqObj).addClass("push-right-15");
					$(".van-checkbox--vertical",this.jqObj).addClass("push-down-10");
					$(".van-checkbox__label",this.jqObj).addClass("color-666");
					$(".van-radio-group--vertical",this.jqObj).addClass("push-right-15");
					$(".van-radio--vertical",this.jqObj).addClass("push-down-10");
					$(".van-radio__label",this.jqObj).addClass("color-666");
					$(".van-checkbox--horizontal",this.jqObj).addClass("push-down-5");
					$(".van-checkbox--horizontal",this.jqObj).addClass("push-up-5");
					$(".van-radio--horizontal",this.jqObj).addClass("push-down-5");
                    $(".van-radio--horizontal",this.jqObj).addClass("push-up-5");
                    var jqObj = this.jqObj;
                    setTimeout(function(){
                        if(jqObj.data("FormWidget").change!=null && jqObj.data("FormWidget").currentValue ==""){
                            jqObj.data("FormWidget").change.call(jqObj,null);
                        }
                    },100);

			    },
			    updated: function () {
				  this.$nextTick(function () {
				    $(".van-icon",this.jqObj).css("font-weight","bold");
					if (this.isDisabled) {
						$(".van-checkbox__icon--disabled.van-checkbox__icon--checked .van-icon",this.jqObj).css("color","#1989fa");
						$(".van-radio__icon--disabled.van-radio__icon--checked .van-icon",this.jqObj).css("color","#1989fa");
					}
					$(".van-checkbox--vertical",this.jqObj).addClass("push-down-10");
					$(".van-checkbox__label",this.jqObj).addClass("color-666");
					$(".van-radio--vertical",this.jqObj).addClass("push-down-10");
					$(".van-radio__label",this.jqObj).addClass("color-666");
				  })
			    }
			})
			//其他
			if(this.element.attr("othersBind")){
			    var width = this.element.attr("othersWidth");
			    if(!width){
			        width = "120";
			    }
			    var isDisabled = this.element.attr("disabled")=="disabled";
			    this.element.after('<p id="'+this.element.attr("id")+'_othersP" style="margin: 0;width: '+width+'px;display: none;transform: translateY(-1px);"><input class="form-control notranslate notnull" dojotype="unieap.form.GroupBox.others" maxlength="20" name="'+this.element.attr("name")+'-'+this.element.attr("othersBind")+'" id="'+this.element.attr("id")+'_othersInput" style="width: 100%; line-height: 20px; height: 34px;'+(isDisabled?"border: 1px solid #ddd;background: #f5f5f5!important;padding: 0 10px;":"")+'" texttype="text" type="text" '+(isDisabled?"disabled='disabled'":"")+'></p>')
			}
		} else{
			this.element.find("input").each(function(index){
				that.inputNodes.push(this);
				if(isNotNull){
					$(this).on('click',groupboxClickEvent);
				}
				//如果groupbox的disabled=="disabled",radio和checkbox都不可点击
				if(that.element.attr("disabled") && that.element.attr("disabled")=="disabled"){
					$(this).attr("disabled",true);
				}else{
					$(this).attr("disabled",false);
				}
			});
			this.element.find("label").each(function(index){
				that.labels.push(this);
			});
		}
		//监听控件notnull属性的变化。如果新增了notnull属性，则.addClass("notnull")；如果删除了notnull属性，则.removeClass("notnull")；
		var targetNode = this.element[0];
		var options = { attributes: true, childList: false,subtree:false,attributeOldValue:true};
		function callback(mutationsList, observer) {
			mutationsList.forEach(function(record) {
		    	if(record.attributeName=="notnull"){
		    	// 如果发生变化的属性是notnull
		    		if($(record.target).attr("notnull") == "true" && $(record.target).attr("disabled") == undefined){
		    			//如果notnull为true了，并且当前不是“disabled”的，addClass("notnull");
		    			$(record.target).addClass("notnull");
		    		}else if($(record.target).attr("notnull") == undefined){
		    			//如果notnull属性不存在，removeClass("notnull");
		    			$(record.target).removeClass("notnull");
		    		}
		    	}
	       });
		}
		if(navigator.userAgent.toLowerCase().indexOf("msie") == -1){
			var mutationObserver = new MutationObserver(callback);
			mutationObserver.observe(targetNode, options);
		}
		//监听上传控件notnull属性的变化end
	},

	//根据当前currentValue值设置dom
	setDomValue:function(){
		if(!this.currentValue)
			return;
		var values=[];
		if(this.isVue){
			if(this.type==='radio'){
			    values.push(this.currentValue);
				this.groupBoxVm.$data.result = values[0];
			}else if(this.type==='checkbox'){
				var optionsArr = []; //optionsArr选项数组
				var tempCurrentValue = this.currentValue;
                this.element.find(".van-checkbox__label").each(function(i,o){
                    optionsArr.push($(o).text());
                });
                for(var i=0;i<optionsArr.length;i++){
                    if(optionsArr[i].indexOf(",")!=-1 && tempCurrentValue.indexOf(optionsArr[i]) != -1){//如果选项里有逗号，并且currentValue里有个选项的字符串
                        tempCurrentValue = tempCurrentValue.replace(optionsArr[i],optionsArr[i].split(",").join("$_$"));
                    }
                }
                values = tempCurrentValue.split(",");
                for(var i=0;i<values.length;i++){
                	values[i] = values[i].split("$_$").join(",");
                }
			    this.groupBoxVm.$data.result = values;
			}
			//赋值其他
			var othersBind = this.element.attr("othersBind");
			var id = this.element.attr("id");
            if(othersBind){
                var $othersInput = $("#"+id+"_othersInput");
                var otherText= this.bindRow.getItemValue(this.bindName+"_OTHER");
                $othersInput.val(otherText);
            }
		}else{
		    values=this.currentValue.split(",");
			for(var i=0;i<values.length;i++){
				var value=values[i];
				var inputNode=getInputByLabelValue.call(this,value);
				inputNode&&$(inputNode).attr("checked",true);
			}
			
			function getInputByLabelValue(value){
				for(var i=0;i<this.labels.length;i++){
					var label=this.labels[i];
					if(label.innerHTML.replace(/<.+?>/gim,'')==value)
						return this.inputNodes[i];
				}
			}
		}
	},
	submitValue:function(){
		var values=[];
		if(this.isVue){
			values = this.groupBoxVm.$data.result;
		}else{
			for(var index in this.inputNodes){
				if($(this.inputNodes[index]).is(":checked")){
					values.push(this.labels[index].innerHTML.replace(/<.+?>/gim,''));
				}
			}
		}
		if(values.length>0){
			if($.isArray(values)){
			    this.currentValue=values.join(",");
			}else{
				this.currentValue=values;
			}
		}else{
			this.currentValue="";
		}
		var othersBind = this.element.attr("othersBind");
        var id = this.element.attr("id");
        if(othersBind){
            var $othersInput = $("#"+id+"_othersInput");
		    this.bindRow.setItemValue(this.bindName+"_OTHER",$othersInput.val());
        }
		this._super(arguments);
	}
});