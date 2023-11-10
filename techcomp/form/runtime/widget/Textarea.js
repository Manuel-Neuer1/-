WebForm.widget("unieap.form.Textarea",WebForm.FormWidget, {
		_create:function(){
			this._super(arguments);
			if(this.element.attr("notnull") && this.element.attr("notnull")=="true"){
				if(this.element.css("visibility") && this.element.css("collapse")){
					return;
				}
				this.element.on('blur',textBoxOnBlurEvent);
				var label = "label[for="+"'"+this.element[0].id+"']";
				if($(label) && $(label).length>0){
//					$($(label).get(0)).after("<span style='color: #FF0000;'>*</span>");
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

			var textType=this.element.attr("texttype");
			if(textType && textType.length>0){
				if(textType=="identityCard" || textType=="email" ||textType=="postalCode"
					|| textType=="mobilePhone" || textType=="customReg" || textType=="number" || textType=="money"){
					this.element.on('blur',textBoxOnBlurEvent);
				}
			}
			if(this.element.attr("presetbind")&&this.element.attr("isforeignkey")=="true"){
				this.element.on('change',cascadeEvent);
			}
		},

		//控件UI渲染，自定义控件需override该方法
		render:function(domNode){
			if(this.element.attr("ismenutree")=="true"){
				$(this.element).click(function(){
					var str='<div id="orgdeptree" style="padding:0;"><iframe style="width:100%;height:100%;border:0;" src="'+WEBAPP+'/workflow/common/tree/orgdeparttree.jsp"/></div>';
					var orgText=this;
					$(orgText).append(str);
					$("#orgdeptree").dialog({
						title:'组织机构',
						height:'350',
						width:'252',
						buttons: {
					        "确定": function() {
					        	var selectOrgName=document.getElementsByTagName('iframe')[0].contentWindow.getSelectedItems();
					        	$(orgText).val(selectOrgName);
					        	$( this ).dialog( "close" );
					        	$("#orgdeptree").remove();
					        },
					        "取消": function() {
					          $( this ).dialog( "close" );
					          $("#orgdeptree").remove();
					        }
						}
					});

				});
			}
		},

		//设置控件数据，自定义控件需override该方法
		setValue:function(){
			if(this.currentValue){
				this.element.val(this.currentValue);
			}
			if(this.element.attr("texttype")=="money"){
				this.element.trigger('blur',textBoxOnBlurEvent);
			}

		},

		//返回控件数据，表单提交时调用。自定义控件需override该方法
		collectValue:function(){
			this.currentValue=this.element.val();
			return this.currentValue;
		}

	});
