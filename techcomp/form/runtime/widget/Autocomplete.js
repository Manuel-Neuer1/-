WebForm.widget("unieap.form.Autocomplete",WebForm.FormWidget,{
	afterChoose:[],
	bindAfterChooseEvent:function(callback){
		this.afterChoose.push(callback);
	},
	onselected:function(data){
		var callbacks=this.afterChoose;
		for( var index in callbacks){
			if(callbacks[index].call(this.element[0],data.value,data.text)==false){
				this.element.val("");
			}
		}
	},
	_create:function(){
		this.afterChoose=[];
		this._super(arguments);
		if(this.element.attr("notnull") && this.element.attr("notnull")=="true"){
			if(this.element.css("visibility") && this.element.css("collapse")){
				return;
			}
			this.element.on('blur',textBoxOnBlurEvent);
			var label = "label[for="+"'"+this.element[0].id+"']";
			if($(label) && $(label).length>0){
//				$($(label).get(0)).after("<span style='color: #FF0000;'>*</span>");
				var placeholder = this.element.attr("placeholder");
				if(placeholder){
					this.element.attr("placeholder",placeholder+"(必填)");
				}else{
					this.element.attr("placeholder","(必填)");
				}
			}else{
				this.element.addClass("notnull");
			}
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
		
		if(this.element.attr("presetbind")&&this.element.attr("isforeignkey")=="true"){
			this.element.on('change',cascadeEvent);
		}
	},
	
	//控件UI渲染，自定义控件需override该方法
	render:function(domNode){
		 this.element.attr("action",WEBAPP+"/fp/Uniformcommon/autoInput");
         this.element.after('<input type="hidden" name="'+this.element.attr("name")+'_code">');
		 var param = {};
		 param.presetKey = this.element.attr("dataprovider");
		 param.procinstId = dataCenter.getParameter("SYS_FK");
         Util.autocompleteFp(this.element,null,param);
         if(Util.getClientInfo()!="PC"){
            this.element.renderMobileAutocomplete(false,param);
         }
	},
	
	//设置控件数据，自定义控件需override该方法
	setValue:function(){
		var defaultValue = this.element.val();
		var text="";
		var realVal = "";
		var name = this.element.attr("name");
		if(defaultValue&&!dataCenter.getParameter("SYS_FK")){//无实例则取默认值
			realVal = defaultValue;
			Util.ajax({
				url:WEBAPP +"/fp/Uniformcommon/getDataProviderNamebyValue",
				param:{
					value:defaultValue,
					presetKey:this.element.attr("dataprovider")
					},
				async:false,
			    method:"POST",
				success:function(data){
                     text = data.NAME==null?"":data.NAME;
				}
		    });
		}else{
			var curValue = this.currentValue?this.currentValue:"";
			realVal = curValue;
			if (this.bindRow){
				 text= this.bindRow.getItemValue(this.bindName+"_TEXT");
			}
			if(!text&&curValue){//绑定了预置数据
				Util.ajax({
					url:WEBAPP +"/fp/Uniformcommon/getDataProviderNamebyValue",
					param:{
						value:curValue,
						presetKey:this.element.attr("dataprovider"),
						procinstId:dataCenter.getParameter("SYS_FK")
						},
					async:false,
				    method:"POST",
					success:function(data){
	                     text = data.NAME==null?"":data.NAME;
					}
			    });
			}
		}
		this.element.val(text);
		this.element.attr("real-value",realVal);
		$("input[name='"+name+"_code']").val(realVal);
	},
	
	//返回控件数据，表单提交时调用。自定义控件需override该方法
	collectValue:function(){
		var name = this.element.attr("name");
		this.bindRow.setItemValue(this.bindName+"_TEXT",this.element.val());
		this.currentValue=$("input[name='"+name+"_code']").val();
		return this.currentValue;
	}

});