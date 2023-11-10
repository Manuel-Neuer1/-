/**
 * @summary
 * 定义前台表单的数据渲染
 * @author zhaozg
 */
$(function(){
	WebForm.initForm();
	dealWithAnswers();
	WebForm.hideLoadingMask();
	$("#loadingForm",window.parent.document).hide();
	$("#formIframe",window.parent.document).show();
    parent.window.onpageshow = function(event){
      if(event.persisted){
        window.location.reload();
      }
    }
});

var dealWithAnswers=function(){
	var url=window.location.search;
	var formid=dataCenter.getParameter("formid");
	var requestURL = WEBAPP+"/rest/assignment/shuffleitem";
	if(url.indexOf("assignment_id")<=-1){
		return;
	}
	var assignment_id=dataCenter.getParameter("assignment_id");
	$.ajax({
	 	type: 'get',
		url:requestURL,
		async:false,
		data:{'formId':formid,"assignmentId":assignment_id},
		contentType:'text/plain;charset=UTF-8',
		dataType:'json',
		success:function(results){
               preDealWithAns(results);
		},
		error:function(result){
		}
	});
}
var preDealWithAns = function(results){
	var setting=results.setting;
	window.unieap.paperSetting=setting;
	var questions=results.questions;
	var disorderQuestions=[];
	$(questions).each(function(index ,question) {
		if(question.test){
			var id=question.id;
			var disorderQuestion=$("#"+id).parent().parent()
			if(disorderQuestion.length>0) disorderQuestions.push(disorderQuestion[0]);
			if(setting.isOptionDisorder===1){
				var answers=$("#"+id).children();
				var changeAns=shuffle(answers);
				$("#"+id).empty();
				$(changeAns).each(function(index ,answer) {
					$("#"+id).append(answer);			
				});
			}
		}
	});
	
	if(setting.isQuestionDisorder===1){
		disorderQuestions=shuffle(disorderQuestions);
		for(var i=0;i<disorderQuestions.length-1;i++){
			var question1=disorderQuestions[i];
			var question2=disorderQuestions[i+1];
			$(question1).after(question2);
		}
	}
	
}

var shuffle = function(v){
    for(var j, x, i = v.length; i; j = parseInt(Math.random() * i), x = v[--i], v[i] = v[j], v[j] = x);
    return v;
};

var tdIds = "";
//定义web表单对象
$.extend(WebForm,{
		eventListeners:{},
		//加载后绑定数据
		initForm:function(){
			$("td").each(function(index ,td) {
				var tdId = $(td).attr("id");
				if (tdId) {
					tdIds += tdId + ",";
				}
			});
			if (tdIds.length > 0) {
				tdIds = tdIds.substring(0 ,tdIds.length-1);
			}
		
			//表单加载后渲染表单、数据表格、上传组件 
			var widgets=$("[dojotype='unieap.form.Form'],[dojotype='unieap.repeating.repeator'],[dojotype='unieap.grid.Grid'],[dojotype='unieap.uploader.uploader']");
			widgets.each(function(){
				$(this).data("FormWidget").bindData();
			});
			
			//表单加载后渲染查看图片组件
//			var imageDom = $("[buttonType='imageUpload']");
//			imageDom.each(function(){
//				$(this).after('<div class="bar responsive-padding-box view-blueimp-gallery push-up-5"><div class="gallery" id="'+$(this).attr('id')+'_imageContainer'+'"></div></div>');
//			      document.getElementById($(this).attr('id')+'_imageContainer').onclick = function (event) {
//			          event = event || window.event;
//			          var target = event.target || event.srcElement;
//			          var link = target.src ? target.parentNode : target;
//			          var options = {index: link, event: event,onclosed: function(){
//			            setTimeout(function(){
//			              $("body").css("overflow","");
//			            },200);
//			          }};
//			          var links = this.getElementsByTagName('a');
//			          blueimp.Gallery(links, options);
//			        };
//			        $(this).click(function(){
//			            parent.chooseImage($(this).attr('id')+'_imageContainer')
//			        })
//			});
//		    if(imageDom.length>0){
//		    	$("[dojotype='unieap.form.Form']").append('<div class="blueimp-gallery blueimp-gallery-controls" id="blueimp-gallery" style="height:100%;"><div class="slides"></div><h3 class="title"></h3><a class="prev">‹</a> <a class="next">›</a> <a class="close">×</a><ol class="indicator"></ol></div>')
//		    	$(document).off("click",".gallery-item-controls").on("click",".gallery-item-controls",function(e){
//                  $(".blueimp-gallery").hide();
//                  $(this).parent().parent().remove();
//                  e.stopPropagation();
//                })
//                var pid=dataCenter.getParameter("SYS_FK");
//				Util.ajax({
//					url:WEBAPP +"/fp/serveapply/getImage",
//					param:{pid:pid},
//					async:false,
//				    method:"POST",
//					success:function(data){
//                         $(data).each(function(i,o){
//                        	 if($("#"+o.AREA_ID).hasClass('gallery')&&!$("#"+o.AREA_ID).parent().parent().hasClass("uploader")){
//                        	 $("#"+o.AREA_ID).append('<a class="gallery-item" href="'+o.FILE_PATH+'" title="'+o.FILE_NAME+'" data-gallery><div class="image"><img src="'+o.FILE_PATH+'" alt="'+o.FILE_NAME+'"/><ul class="gallery-item-controls"><li><span class="gallery-item-remove"><i class="fa fa-times"></i></span></li></ul></div></a>')
//                        	 }
//                         })
//					}
//			    });
//		    }
			
			//根据变量绑定控件值
			var varDataStore=dataCenter.getDataStore("variable");
			if (varDataStore) {
				var varRowSet=varDataStore.getRowSet();
			    
				
				var bindobj=[];
				$("[isforeignkey='true']").each(function(){
					var query=$(this).data("FormWidget");
					if(!query instanceof WebForm.FormWidget||$(this).attr("variablebind"))
						return;
					var bindid = "";
					if(query.presetbind){
						bindid=query.presetbind.split(".")[0];
					}
					bindobj.push(bindid);
				});
				var queryList = [];
				$("[presettype='presetconst']").each(function(){
					var query=$(this).data("FormWidget");
					if(!query instanceof WebForm.FormWidget)
						return;
					var flag = true;
					if(bindobj.length>0){
						for(var i=0;i<bindobj.length;i++){
							if(query.presetbind.split(".")[0]==bindobj[i]){
								flag=false;
								break;
							}
						}
					}
					if(flag){
						var dojoType = $(this).attr("dojotype")
						varRowSet.forEach(function(row){
							if(row.getItemValue("name")==query.presetbind){
								var value=row.getItemValue('value');
								if((query.currentValue==null || query.currentValue.length==0)&&query.element.context.style.visibility !="collapse"){
									if(dojoType == 'unieap.form.ComboBox'){
										query.presetValue=value;
									}else{
										query.currentValue=value;
									}
									queryList.push(query);
									
								}
							}
						})
					}
				});
				$(queryList).each(function(i,o){
					o.setValue();
				})
				$("[variablebind]").each(function(){
					var query=$(this).data("FormWidget");
					if(!query instanceof WebForm.FormWidget)
						return;
					var varoperation=query.varoperation;
					if(varoperation=="w")
						return;
					varRowSet.forEach(function(row){
						if(row.getItemValue("name")==query.varbind){
							var value=row.getItemValue('value');
							if(query.element.context.style.visibility !="collapse" && (query.element.attr("isWorkflow") == "true"||((query.currentValue==null || query.currentValue.length==0)&&(dataCenter.getParameter("SYS_FK")==null||dataCenter.getParameter("SYS_FK").length==0)))){//工作流变量则直接赋值，若不是工作流变量则在未生成流程实例时且无基础数据值时赋值
								query.currentValue=value;
								query.setValue();
							}
						}
					})
				});
				
				var bindobj=[];
				$("[isforeignkey='true']").each(function(){
					var query=$(this).data("FormWidget");
					if(!query instanceof WebForm.FormWidget||$(this).attr("variablebind"))
						return;
					var bindid = "";
					if(query.presetbind){
						bindid=query.presetbind.split(".")[0];
					}
					bindobj.push(bindid);
				});
			}
			if($("body").attr("autoRecord")=="true"&&$("#is_auto_record",window.parent.document).val()=="1"){//自动加载历史记录
				this.setValueAutoRecord();
			}
			$("select:not([repeatwidget='repeatWidget'])").each(function(i,o){
				var cascadewidgetid =  $(o).attr("cascadewidgetid");
				var notAutoChange = $(o).attr("notAutoChange");
				var caslength = $("select[cascadewidgetid='"+this.id+"']").length;
				if((cascadewidgetid==null||cascadewidgetid=="")&&(notAutoChange!="true"||caslength>0)){
				    setTimeout(function(){
						$(o).trigger("change");
				    },100);
				}
			})
			//渲染disabled的下拉框、单行多行文本，内容以span的形式显示
			$("select:disabled,input[type='text']:disabled:not([dojotype='unieap.form.GroupBox.others']),textarea:disabled").renderSpan();
			Util.swiperBtn();
			this.trigger("load");
		},
		//提交工作项
		submit:function(workitemId){
			if(!workitemId){
				if(!dataCenter.getParameter("workitemid")){
					workitemId="";
				}else{
					workitemId=dataCenter.getParameter("workitemid");
				}
			}
			WebForm.saveForm("completeWorkitem",workitemId);
		},
		//校验表单
		validateForm:function(){
		      var message=[];
			  var size=0;
				//表单检验
			  var comboBox=$("[dojotype='unieap.form.ComboBox']");
			  var autocomplete=$("[dojotype='unieap.form.Autocomplete']");
			  var dateGroup=$("[dojotype='unieap.form.dateGroup']");
		      var groupBox=$("[dojotype='unieap.form.GroupBox']");
		      var repeatWidget=$("[repeatwidget='repeatWidget']");
		      var uploader=$("[dojotype='unieap.uploader.uploader']");
		      var textBoxs=$("[dojotype='unieap.form.TextBox'],[dojotype='unieap.form.DateTextBox'],[dojotype='unieap.form.Textarea'],[dojotype='unieap.form.GroupBox.others']");
		      var gridWidget=$("[dojotype='unieap.grid.Grid']");
		      var signature = $("[dojotype='unieap.form.signature']");
			  var flag=true;
			  //下拉选项框 校验
	          var input=$("[validatetype='input']");
	          var select=$("[validatetype='select']");
	          var icheck=$("[validatetype='icheck']");
	          var alertflag = true;
	          uploader.each(function(){
	        	var $this=$(this);
				var notnullValue = $this.attr("notnull");
				var disabled = $this.attr("editable");
				var value = $this.children('span[action="newAffix"]').length + $("#btn_" + $this.attr("id") + "_imageContainer").find("a").length;
				var name = $this.attr("name");
				var uploadername = $this.attr("uploadername");
				if(uploadername!=undefined && uploadername!=""){
					name = uploadername;
				}
				if(disabled!="false" && notnullValue=="true"){
//					if(value==0&alertflag){
//						size++;
//						message.push(name);
//						Msg.warning(name+"，必须上传！")
//						alertflag = false;
//						flag = false;
//						return;
//					}
					var tmp_id = $this.attr("id");
					if(value==0){
						if($("#" + tmp_id + "_notnullspan").data("qtip")){
							var api = $("#" + tmp_id + "_notnullspan").qtip("api");
							api.set("content.text",WebForm_I18N.validate.notnull);
							api.toggle(true);
						}else{
							$("#" + tmp_id + "_notnullspan").formTooltip({
								content:WebForm_I18N.validate.notnull,my:"left top",at:"right bottom"
							});
						}
						flag = false;
						 message.push(name);
			             size++;
						return;
					}else {
						if($("#" + tmp_id + "_notnullspan").data("qtip")){
							var api = $("#" + tmp_id + "_notnullspan").qtip('api');
							api.destroy(true);
						}
					}
				}
	          });
	          input.each(function(){
	          	var $this=$(this);
				var value =$this.val();
				var notnullValue = $this.attr("notnull");
				var disabled = $this.attr("disabled");
				var validatename = $this.attr("validatename");
				if(notnullValue && !disabled && notnullValue=="true"){
					if(value.length==0&&alertflag){
						size++;
						message.push(name);
						Msg.warning(validatename+"必填，请检查表单是否有漏填！")
						alertflag = false;
						flag = false;
						return;
					}
				}
	          	
	          }
	          )
	          select.each(function(){
	          	var $this=$(this);
				var value =$this.val();
				var notnullValue = $this.attr("notnull");
				var disabled = $this.attr("disabled");
				var validatename = $this.attr("validatename");
				if(notnullValue && !disabled && notnullValue=="true"){
					if(value.length==0&&alertflag){
						size++;
						message.push(name);
						Msg.warning(validatename+"必填，请检查表单是否有漏填！")
						alertflag = false;
						flag = false;
						return;
					}
				}
	          	
	          }
	          )
	          icheck.each(function(){
	          	var $this=$(this);
				var name =$this.attr("name");
				var notnullValue = $this.attr("notnull");
				var validatename = $this.attr("validatename");
				var value = $("input[name='"+name+"']:checked").val() == null ? '' : $("input[name='"+name+"']:checked").val();
				if(notnullValue=="true"&&value.length==0&&alertflag){
					size++;
					message.push(name);
						Msg.warning(validatename+"必须勾选，请检查表单是否有漏填！")
						alertflag = false;
						flag = false;
						return;
				}
	          	
	          }
	          )
		      comboBox.each(function(){
		        var $this=$(this);
		        var notnullValue = $this.attr("notnull");
		        var disabled = $this.attr("disabled");
		        if(notnullValue && !disabled){
		           var value = $this.find("option:selected").val();
		           if(value==null||value==''){
		             flag=false;
		             message.push($this[0].name);
		             size++;
		             if($this.data("qtip")){
		               var api = $this.qtip("api");
		               api.set("content.text",WebForm_I18N.validate.notnull);
		               api.toggle(true);
		             }else{
		               if($this.css('display')=='none'){
		                 $this.next().formTooltip({
		                   content:WebForm_I18N.validate.notnull
		                 });
		               }
		             }
		             return;
		          } else{
		            if($this.css('display')=='none'){
		              if($this.next().data("qtip")){
		                var api = $this.next().qtip('api');
		                api.destroy(true);
		              }
		            }else{
		              if($this.data("qtip")){
		                var api = $this.qtip('api');
		                api.destroy(true);
		              }
		            }
		          }
		        }
		      });
//		      复选框、单选组校验
		      groupBox.each(function(){
		        var $this=$(this);
		        var type=$this.attr("type");
		        var notnullValue = $this.attr("notnull");
		        var disabled = $this.attr("disabled");
		        if(notnullValue && !disabled){
		          var tag=false;
				  if($this.data("FormWidget").isVue){
					  tag= $this.data("FormWidget").groupBoxVm.$data.result.length>0;
				  }else{
					  tag= $this.find('input:checked').length>0;
				  }
		          if(tag==false){
		            flag=false;
		            message.push($this.attr("name"));
		             size++;
		            if($this.data("qtip")){
		              var api = $this.qtip("api");
		              api.set("content.text",WebForm_I18N.validate.notnull);
		              api.toggle(true);
		            }else{
		              $this.formTooltip({
		                content:WebForm_I18N.validate.notnull,
		                my:"right top",
		                at:"right bottom"
		              });
		            }
		            return;
		          }else{
		            if($this.data("qtip")){
		              var api = $this.qtip('api');
		              api.destroy(true);
		            }
		          }
		        }
		      });
				//输入联想校验
		      autocomplete.each(function(){
					var $this=$(this);
					if($this.css("visibility") &&$this.css("visibility") =="collapse"){
						return;
					}
					var id =$this.attr("id");
					var value =$this.val();
					var notnullValue = $this.attr("notnull");
					var disabled = $this.attr("disabled");
					if(notnullValue && !disabled && notnullValue=="true"){
						if(value.length==0){
							if($this.data("qtip")){
								var api = $this.qtip("api");
								api.set("content.text",WebForm_I18N.validate.notnull);
								api.toggle(true);
							}else{
								$this.formTooltip({
									content:WebForm_I18N.validate.notnull
								});
							}
							flag = false;
							 message.push($this[0].name);
				             size++;
							return;
						}else {
							if($this.data("qtip")){
								var api = $this.qtip('api');
								api.destroy(true);
							}
						}
					}
					if(!disabled && value!==""){
			          	 var name = $this.attr("name");
			          	 var codename = name+"_code";
							if(!$("input[name = '"+codename+"']").val()){
								if($this.data("qtip")){
									var api = $this.qtip("api");
									api.set("content.text","请选择输入后所查询出的内容");
									api.toggle(true);
								}else{
									$this.formTooltip({
										content:"请选择输入后所查询出的内容"
									});
								}
								flag = false;
								message.push($this[0].name);
					             size++;
							}else {
								if($this.data("qtip")){
									var api = $this.qtip('api');
									api.destroy(true);
								}
							}
							return;
					}
				});
                //日期组校验
              dateGroup.each(function(){
                    var $this=$(this);
                    if($this.css("visibility") &&$this.css("visibility") =="collapse"){
                        return;
                    }
                    var id =$this.attr("id");
                    var start = $this.find("input[name='start_time']").val();
                    var end = $this.find("input[name='end_time']").val();
                    var notnullValue = $this.attr("notnull");
                    var disabled = $this.attr("disabled");
                    var $bindElement = $this;
                    var $elementui = $("#"+$this.data("FormWidget").id+"_elementui");
                    if(Util.getClientInfo()=="PC"&&Util.isNotEmpty($elementui)){
                        $bindElement = $elementui;
                    }
                    if(notnullValue && !disabled && notnullValue=="true"){
                        if(!start||!end){
                            if($bindElement.data("qtip")){
                                var api = $bindElement.qtip("api");
                                api.set("content.text",WebForm_I18N.validate.notnull);
                                api.toggle(true);
                            }else{
                                $bindElement.formTooltip({
                                    content:WebForm_I18N.validate.notnull
                                });
                            }
                            flag = false;
                             message.push($this.attr("name"));
                             size++;
                            return;
                        }else {
                            if($bindElement.data("qtip")){
                                var api = $bindElement.qtip('api');
                                api.destroy(true);
                            }
                        }
                    }
                });
                //手写签名校验
              signature.each(function(){
                    var $this=$(this);
                    var signObj = $this.data("signObj");
                    if(Util.isNotEmpty(signObj)&&Util.getActinstName()!="填写状态"&&$this.css("visibility") &&$this.css("visibility") =="collapse"){
                        return;
                    }
                    var $bindElement = $(".drawing-panel",$this);
                    if(signObj.isEmpty()){
                        if($bindElement.data("qtip")){
                            var api = $bindElement.qtip("api");
                            api.set("content.text",WebForm_I18N.validate.notnull);
                            api.toggle(true);
                        }else{
                            $bindElement.formTooltip({
                                content:WebForm_I18N.validate.notnull
                            });
                        }
                        flag = false;
                         message.push($this.attr("name"));
                         size++;
                        return;
                    }else {
                        if($bindElement.data("qtip")){
                            var api = $bindElement.qtip('api');
                            api.destroy(true);
                        }
                    }
                });
			//文本校验
			textBoxs.each(function(){
				var $this=$(this);
				if($this.css("visibility") &&$this.css("visibility") =="collapse"){
					return;
				}
				var id =$this.attr("id");
				var value =$this.val();
				var textType = $this.attr("texttype");
				var notnullValue = $this.attr("notnull");
				var disabled = $this.attr("disabled");
				if(notnullValue && !disabled && notnullValue=="true"){
					if(value.length==0){
						if($this.data("qtip")){
							var api = $this.qtip("api");
							api.set("content.text",WebForm_I18N.validate.notnull);
							api.toggle(true);
						}else{
							$this.formTooltip({
								content:WebForm_I18N.validate.notnull
							});
						}
						flag = false;
						 message.push($this[0].name);
			             size++;
						return;
					}else {
						if($this.data("qtip")){
							var api = $this.qtip('api');
							api.destroy(true);
						}
					}
				}
				
				if(!textType ||textType.length==0)
					return;
				if(!disabled && value!==""){
					if(textType=="identityCard"){
						if(!unieap.isIdentityCard(value)){
							if($this.data("qtip")){
								var api = $this.qtip("api");
								api.set("content.text",WebForm_I18N.validate.invalidIdentityCard);
								api.toggle(true);
							}else{
								$this.formTooltip({
									content:WebForm_I18N.validate.invalidIdentityCard
								});
							}
							flag = false;
							message.push($this[0].name);
				             size++;
						}else {
							if($this.data("qtip")){
								var api = $this.qtip('api');
								api.destroy(true);
							}
						}
						return;
					}else if(textType=="email"){
						if(!unieap.isEmail(value)){
							if($this.data("qtip")){
								var api = $this.qtip("api");
								api.set("content.text",WebForm_I18N.validate.invalidEmail);
								api.toggle(true);
							}else{
								$this.formTooltip({
									content:WebForm_I18N.validate.invalidEmail
								});
							}
							flag = false;
							message.push($this[0].name);
				             size++;
						}else {
							if($this.data("qtip")){
								var api = $this.qtip('api');
								api.destroy(true);
							}
						}
						return;
					}else if(textType=="postalCode"){
						if(!unieap.isPostalCode(value)){
							if($this.data("qtip")){
								var api = $this.qtip("api");
								api.set("content.text",WebForm_I18N.validate.invalidPostalCode);
								api.toggle(true);
							}else{
								$this.formTooltip({
									content:WebForm_I18N.validate.invalidPostalCode
								});
							}
							flag = false;
							message.push($this[0].name);
				             size++;
						}else {
							if($this.data("qtip")){
								var api = $this.qtip('api');
								api.destroy(true);
							}
						}
						return;
					}else if(textType=="money"){
						if(!unieap.isMoney(value)){
							if($this.data("qtip")){
								var api = $this.qtip("api");
								api.set("content.text","无效金额");
								api.toggle(true);
							}else{
								$this.formTooltip({
									content:"无效金额"
								});
							}
							flag = false;
							message.push($this[0].name);
				             size++;
						}else {
							if($this.data("qtip")){
								var api = $this.qtip('api');
								api.destroy(true);
							}
						}
						return;
					}else if(textType=="mobilePhone"){
						if(!unieap.isMobilePhone(value)){
							if($this.data("qtip")){
								var api = $this.qtip("api");
								api.set("content.text",WebForm_I18N.validate.invalidMobilePhone);
								api.toggle(true);
							}else{
								$this.formTooltip({
									content:WebForm_I18N.validate.invalidMobilePhone
								});
							}
							flag = false;
							message.push($this[0].name);
				             size++;
						}else {
							if($this.data("qtip")){
								var api = $this.qtip('api');
								api.destroy(true);
							}
						}
						return;
					}else if(textType=="customReg"){
						var regValue =$this.attr("reg");
						if(regValue && regValue.length>0){
							var r = value.match(eval(regValue));
							if(r==null){
								if($this.data("qtip")){
									var api = $this.qtip("api");
									api.set("content.text",WebForm_I18N.validate.invalid);
									api.toggle(true);
								}else{
									$this.formTooltip({
										content:WebForm_I18N.validate.invalid
									});
								}
								flag = false;
								message.push($this[0].name);
					             size++;
							}else{
								if($this.data("qtip")){
									var api = $this.qtip('api');
									api.destroy(true);
								}
							}
							return;
						}
					}else if(textType=="number"){
						if(!unieap.isNumber(value)){
							if($this.data("qtip")){
								var api = $this.qtip("api");
								api.set("content.text",WebForm_I18N.validate.invalidNumber);
								api.toggle(true);
							}else{
								$this.formTooltip({
									content:WebForm_I18N.validate.invalidNumber
								});
							}
							flag = false;
							message.push($this[0].name);
				             size++;
						}else{
							if($this.data("qtip")){
								var api = $this.qtip('api');
								api.destroy(true);
							}
						}
						return;
					}
				}
			});
			//Grid校验
            gridWidget.each(function(){
               var $this=$(this);
               var minNum = $this.attr("minRowNum");
               if(!minNum){
                  return;
               }
               var grid = $this.data("FormWidget");
               if(grid.count<minNum){
                 flag=false;
                 message.push($this.attr("name"));
                 size++;
                 if($this.next().data("qtip")){
                   var api = $this.next().qtip("api");
                   api.set("content.text","至少填写"+minNum+"条数据");
                   api.set("position.at","bottom left");
                   api.set("position.my","right bottom");
                   api.toggle(true);
                 }else{
                     $this.next().formTooltip({
                       content:"至少填写"+minNum+"条数据",
                       my:"right bottom",
                       at:"top left"
                     });
                 }
                 return;
              } else{
                   if($this.next().data("qtip")){
                    var api = $this.next().qtip('api');
                    api.destroy(true);
                  }
              }
              });
        //重复节校验
        repeatWidget.each(function(){
           var $this=$(this);
           var result = RepeatorWidgets[$this.attr("repeatortype")].validate($this);
            if(!$this.is(":visible")){
                $this = $this.next();
            }
            var rowId = $this.parents("[node='node']").attr("count");
            var $repeator = $this.parents("[dojotype='unieap.repeating.repeator']");
            var title = $repeator.attr("title");
            var subtitle = $repeator.attr("subtitle");
           if(!result.ok){
             flag=false;
             message.push("["+title+"]区域中<"+subtitle+rowId+">的"+result.name);
             size++;
             if($this.attr("repeatortype") == "uploader"){
            	 if($this.find(".notnull").data("qtip")){
                     var api = $this.find(".notnull").qtip("api");
                     api.set("content.text",result.message);
                     api.toggle(true); 
            	 }else{
            		 $this.find(".notnull").formTooltip({
                         content:result.message,
					      my:"left top",
					      at:"right bottom"
                     });
            	 }
        	 }else{
        		 if($this.data("qtip")){
                     var api = $this.qtip("api");
                     api.set("content.text",result.message);
                     api.toggle(true); 
            	 }else{
            		 $this.formTooltip({
                         content:result.message
                       });
            	 }
        	 }
             return;
          } else{
               if($this.data("qtip")){
                var api = $this.qtip('api');
                api.destroy(true);
              }
          }
          });
			if(!flag&&alertflag){
				if(size==1){
					Msg.warning("请检查表单填写内容，“" +message[0]+"”未正确填写！")
				} else if(size>1) {
					Msg.warning("请检查表单填写内容，“" +message[0]+"”等"+size+"项未正确填写！")
				} else {
					Msg.warning("请检查表单填写内容，信息填写不完整！")
				}
			}
			return flag;
		},
		//发起流程实例
		startProcess:function(processID){
			WebForm.saveForm("startProcess",processID);
		},
		
		//创建流程但不启动流程，可用于表单的暂存
		createProcess:function(processID){
			WebForm.saveForm("createProcess",processID);
		},
		
		validateAndBeforeSubmit:function(submitType,opinion,btnName){
			if((submitType=="startProcess" || submitType=="chooseActAndParti")&&!WebForm.validateForm()){
				return false;
			}
			if(submitType=="startProcess"){
				submitType = "apply";
			}
			var data = {status_ext:btnName,status:submitType,opinion:opinion}
			if(WebForm.trigger("beforesubmit",data)==false){
				return false;
			}	
		},
		saveForm:function(submitType,parameter,parameters,notVdAndBs,btnName,seqId,unitId,code){//submitType:保存表单的类型，opinion审批意见,//notValidateandbeforesubmit
			if(!notVdAndBs&&(submitType=="startProcess" || submitType=="agree" || submitType=="chooseActAndParti" || submitType=="selfBtn")&&!WebForm.validateForm()){
				return false;//校验未通过
			}
			var workflowAction = "none";
			var workitemId ="";
			var processID="";
			var status = "";
			switch(submitType){
			 case "createProcess":
			 case "":
			 case undefined:
				 status = "tempSave";
				 if(parameter!=null){
						processID=parameter;
				 }
				 break;
			 case "startProcess":
				 status = "apply";
				 if(parameter!=null){
						processID=parameter;
				 }
				 break;
			 default:
				 status = submitType;
				 workitemId = parameter==undefined?"":parameter;
			}
			workflowAction = submitType;
			var returnValue={};
			var opinion ="";
			if(parameters!=undefined&&parameters!=null){//审批及申请系列参数传入
				 opinion = parameters.approve_opinion;
				 $.each(parameters,function(key,value){
						dataCenter.addParameter(key,value);
				 });
			}
			var data = {status_ext:btnName,status:status,opinion:opinion}
			if(!notVdAndBs&&WebForm.trigger("beforesubmit",data)==false){
					return false;//beforeSubmit
			}
			//提交form
			var widgets=$("[dojotype='unieap.form.Form'],[dojotype='unieap.grid.Grid'],[dojotype='unieap.uploader.uploader'],[dojotype='unieap.repeating.repeator']");
			var flag = false;
			widgets.each(function(){
				$(this).data("FormWidget").submitValue();
				if($(this).data("FormWidget").submitFlag===false){
				   $(this).data("FormWidget").submitFlag=true;
				   flag = true;
				}
			});
			if(flag){
			  return false;
			}
			//搜集前台数据源查询参数isQueryKey
			$("[isquerykey='true']").each(function(){
				var query=$(this).data("FormWidget");
				if(query instanceof WebForm.FormWidget){
					dataCenter.setParameter(query.id,query.currentValue);//将控件ID以及value值写入到DataCenter参数中
				}
			});
			
			//搜集前台绑定变量的控件，并写入到variable DataStore中
			var varDataStore=dataCenter.getDataStore("variable");
			var varRowSet=varDataStore.getRowSet();
			var updateRS=new unieap.ds.RowSet();
			$("[variablebind]").each(function(){
				var query=$(this).data("FormWidget");
				if(!query instanceof WebForm.FormWidget)
					return;
				var varoperation=query.varoperation;
				if(varoperation=="r")
					return;
				varRowSet.forEach(function(row){
					if(row.getItemValue("name")==query.varbind){
						if(query instanceof unieap.form.GroupBox) {
//							if (query.isChecked()) {
//								row.setItemValue('value',query.currentValue);
//							}
							row.setItemValue('value',query.currentValue);
						} else {
							row.setItemValue('value',query.currentValue);
						}
						updateRS.addRow(row.getData());
					}
				})
			});
			$("[variablebindname]").each(function(){
				var query=$(this).data("FormWidget");
				if(!query instanceof WebForm.FormWidget)
					return;
				var varoperation=query.varoperation;
				if(varoperation=="r")
					return;
				varRowSet.forEach(function(row){
					if(row.getItemValue("name")==query.varbindName){
						row.setItemValue('value',query.bindRow.getItemValue(query.bindName+"_TEXT"));
						updateRS.addRow(row.getData());
					}
				})
			});
//			varDataStore.rowSet=updateRS;
			var jsonData = dataCenter && dataCenter.toJson?dataCenter.toJson():String(dataCenter || ""); 
			//WEBAPP变量值由后台写入
			var requestURL="";
				requestURL=WEBAPP+"/formParser?status=update&formid="+dataCenter.getParameter("formid")+"&workflowAction="+workflowAction+"&seqId="+seqId+"&unitId="+(Util.isNotEmpty(unitId)?unitId:"")+"&applyCode="+(Util.isNotEmpty(code)?code:"");
				requestURL=requestURL+"&workitemid="+workitemId+"&process="+processID;
				 $.ajax({
					 	type: 'post',
						url:requestURL,
						async:false,
						dataType:'json',
						data:jsonData,
						contentType:'text/plain;charset=UTF-8',
						success:function(result){
							if(result.SYS_FK!=""&&result.SYS_FK!=undefined){
								result.status="success";
								returnValue = result;
							}else if(result.status=="chooseUnit"||result.status=="codeDeal"){
								returnValue = result;
							}else{
                                result.status="fail";
                                returnValue = result;
                            }
                            if(submitType=="cache"){
                                //暂存成功，获取所有grid与重复节的rowSet并更改其状态
                                $("[dojotype='unieap.grid.Grid'],[dojotype='unieap.repeating.repeator']").each(function(j,k){
                                    var rowSet = $(k).data("FormWidget").dataStore.getRowSet();
                                    for(var i=0;i< rowSet.getRowCount();i++){
                                        rowSet.getRow(i).setRowStatus(3);
                                    }
                                })
                            }
						},
						error:function(result){
						    if(result.status == "0"){
						        result.status="fail";
						        result.message = "网络中断或网页已过期，请稍后重试。";
						    }else{
                                result.status="fail";
						    }
						    returnValue = result;
						}
					});
				 data["returnValue"] = returnValue;
				 WebForm.trigger("aftersubmit",data);
				 return returnValue;
		},
        saveFormBeforeLogin:function(btnName,serviceID){//submitType:保存表单的类型，opinion审批意见,//notValidateandbeforesubmit
            var submitType = "startProcess";
            if(!WebForm.validateForm()){
                return false;//校验未通过
            }
            var workflowAction = "none";
            var workitemId ="";
            var processID="";
            var status = "";
            workflowAction = submitType;
            var returnValue={};
            var data = {status_ext:btnName,status:"apply",opinion:""}
            if(WebForm.trigger("beforesubmit",data)==false){
                    return false;//beforeSubmit
            }
            //提交form
            var widgets=$("[dojotype='unieap.form.Form'],[dojotype='unieap.grid.Grid'],[dojotype='unieap.uploader.uploader'],[dojotype='unieap.repeating.repeator']");
            var flag = false;
            widgets.each(function(){
                $(this).data("FormWidget").submitValue();
                if($(this).data("FormWidget").submitFlag===false){
                   $(this).data("FormWidget").submitFlag=true;
                   flag = true;
                }
            });
            if(flag){
              return false;
            }
            //搜集前台数据源查询参数isQueryKey
            $("[isquerykey='true']").each(function(){
                var query=$(this).data("FormWidget");
                if(query instanceof WebForm.FormWidget){
                    dataCenter.setParameter(query.id,query.currentValue);//将控件ID以及value值写入到DataCenter参数中
                }
            });

            //搜集前台绑定变量的控件，并写入到variable DataStore中
            var varDataStore=dataCenter.getDataStore("variable");
            var varRowSet=varDataStore.getRowSet();
            var updateRS=new unieap.ds.RowSet();
            $("[variablebind]").each(function(){
                var query=$(this).data("FormWidget");
                if(!query instanceof WebForm.FormWidget)
                    return;
                var varoperation=query.varoperation;
                if(varoperation=="r")
                    return;
                varRowSet.forEach(function(row){
                    if(row.getItemValue("name")==query.varbind){
                        if(query instanceof unieap.form.GroupBox) {
//							if (query.isChecked()) {
//								row.setItemValue('value',query.currentValue);
//							}
                            row.setItemValue('value',query.currentValue);
                        } else {
                            row.setItemValue('value',query.currentValue);
                        }
                        updateRS.addRow(row.getData());
                    }
                })
            });
            $("[variablebindname]").each(function(){
                var query=$(this).data("FormWidget");
                if(!query instanceof WebForm.FormWidget)
                    return;
                var varoperation=query.varoperation;
                if(varoperation=="r")
                    return;
                varRowSet.forEach(function(row){
                    if(row.getItemValue("name")==query.varbindName){
                        row.setItemValue('value',query.bindRow.getItemValue(query.bindName+"_TEXT"));
                        updateRS.addRow(row.getData());
                    }
                })
            });
//			varDataStore.rowSet=updateRS;
            var jsonData = dataCenter && dataCenter.toJson?dataCenter.toJson():String(dataCenter || "");
            //WEBAPP变量值由后台写入
            var requestURL = WEBAPP+"/beforeLogin/apply?serviceID="+serviceID;
                 $.ajax({
                        type: 'post',
                        url:requestURL,
                        async:false,
                        dataType:'json',
                        data:jsonData,
                        contentType:'text/plain;charset=UTF-8',
                        success:function(result){
                            if(result.SYS_FK!=""&&result.SYS_FK!=undefined){
                                result.status="success";
                                returnValue = result;
                            }else{
                                result.status="fail";
                                returnValue = result;
                            }
                        },
                        error:function(result){
                            if(result.status == "0"){
                                result.status="fail";
                                result.message = "网络中断或网页已过期，请稍后重试。";
                            }else{
                                result.status="fail";
                            }
                            returnValue = result;
                        }
                    });
                 data["returnValue"] = returnValue;
                 WebForm.trigger("aftersubmit",data);
                 return returnValue;
        },
		tempsaveForm:function(submitType,parameter,strUserId,btnName){
			var returnValue={};
			/*if(!WebForm.validateForm()){
				return false;
			}*/
			var data = {status_ext:btnName,status:"tempSave",opinion:""};
			var isSubmit=WebForm.trigger("beforesubmit",data);
			if(isSubmit==false)
					return false;
				
			var workflowAction = "none";
			var workitemId ="";
			var processID="";
			if("completeWorkitem"==submitType || "rollback"==submitType 
				|| "suspend"==submitType || "abort" == submitType) {//如果进行工作流操作，则记录下来作为参数发送给formservlet
				workflowAction = submitType;
				workitemId = parameter;
			}
			else if("startProcess"==submitType || "createProcess"==submitType){//创建或启动流程
				workflowAction = submitType;
				if(parameter!=null){
					processID=parameter;
				}
			}
			else if(submitType){//正常保存表单，同时传递参数
				var parameters=submitType;
				$.each(parameters,function(key,value){
					dataCenter.addParameter(key,value);
				});
			}
			//提交form
			var widgets=$("[dojotype='unieap.form.Form'],[dojotype='unieap.grid.Grid'],[dojotype='unieap.uploader.uploader'],[dojotype='unieap.repeating.repeator']");
			widgets.each(function(){				
				$(this).data("FormWidget").submitValue();
			});
			//搜集前台数据源查询参数isQueryKey
			$("[isquerykey='true']").each(function(){
				var query=$(this).data("FormWidget");
				if(query instanceof WebForm.FormWidget){
					dataCenter.setParameter(query.id,query.currentValue);//将控件ID以及value值写入到DataCenter参数中
				}
			});
			
			//搜集前台绑定变量的控件，并写入到variable DataStore中
			var varDataStore=dataCenter.getDataStore("variable");
			var varRowSet=varDataStore.getRowSet();
			var updateRS=new unieap.ds.RowSet();
			$("[variablebind]").each(function(){
				var query=$(this).data("FormWidget");
				if(!query instanceof WebForm.FormWidget)
					return;
				var varoperation=query.varoperation;
				if(varoperation=="r")
					return;
				varRowSet.forEach(function(row){
					if(row.getItemValue("name")==query.varbind){
						if(query instanceof unieap.form.GroupBox) {
//							if (query.isChecked()) {
//								row.setItemValue('value',query.currentValue);
//							}
							row.setItemValue('value',query.currentValue);
						} else {
							row.setItemValue('value',query.currentValue);
						}
						updateRS.addRow(row.getData());
					}
				})
			});
//			varDataStore.rowSet=updateRS;
			var jsonData = dataCenter && dataCenter.toJson?dataCenter.toJson():String(dataCenter || ""); 
			 //WEBAPP变量值由后台写入
			var requestURL="";
				requestURL=WEBAPP+"/formParser?status=update&formid="+dataCenter.getParameter("formid")+"&workflowAction="+workflowAction;
				requestURL=requestURL+"&workitemid="+workitemId+"&process="+processID+"&strUserId="+strUserId;
				 $.ajax({
					 	type: 'post',
						url:requestURL,
						async:false,
						dataType:'json',
						data:jsonData,
						contentType:'text/plain;charset=UTF-8',
						success:function(result){
							if(result.SYS_FK!=""&&result.SYS_FK!=undefined){
								result.status="success";
								returnValue = result;
							}else{
								result.status="fail";
								returnValue = result;
							}
//						  returnValue = "success";
						},
						error:function(result){
							result.status="fail";
							returnValue = result;
//						  returnValue = "fail";
						}
					});
				 if(returnValue.status == "success"){//保存在线预览图片数据
//					 var imageDom = $("[buttonType='imageUpload']");
//						imageDom.each(function(i,o){
//							var imageList = new Array();
//							var area_id = $(o).attr("id")+'_imageContainer';
//							$('#'+area_id).children("a").each(function(j,k){
//								imageList.push({file_name:$(k).attr("title"),file_path:$(k).attr("href"),area_id:area_id})
//							})
//							if(imageList.length!=0){
//								Util.ajax({
//									url:WEBAPP +"/fp/serveapply/saveImage",
//									param:{pid:returnValue.SYS_FK,imageList:imageList},
//									async:false,
//									dataType:'text',
//								    method:"POST",
//									success:function(data){
//	                                    if(data=="FAILED"){
//	                                   	 Msg.warning("图片信息保存失败！")
//	                                    };
//									}
//							    });
//							}
//						})
                        //保存成功，获取所有grid与重复节的rowSet并更改其状态
                        $("[dojotype='unieap.grid.Grid'],[dojotype='unieap.repeating.repeator']").each(function(j,k){
                            var rowSet = $(k).data("FormWidget").dataStore.getRowSet();
                            for(var i=0;i< rowSet.getRowCount();i++){
                                rowSet.getRow(i).setRowStatus(3);
                            }
                        })
				 }
				 data["returnValue"] = returnValue;
				 WebForm.trigger("aftersubmit",data);
				 return returnValue;
		},
		setValueAutoRecord:function(){
			var record_fk = dataCenter.getParameter("record_fk");
			if(!record_fk){
				return;
			}
			var widgets=$("[dojotype='unieap.form.ComboBox'],[dojotype='unieap.form.Autocomplete'],[dojotype='unieap.form.GroupBox'],[dojotype='unieap.form.TextBox'],[dojotype='unieap.form.DateTextBox'],[dojotype='unieap.form.Textarea']");

			widgets.each(function(i,o){
				var widget =$(o).data("FormWidget");
				if($(o).attr("notAutoRecord")!="true"){//排除配置了不加载历史记录的组件
					var dataStore = widget.dataStore;
					var recordStoreName = dataStore.name+"_record";
					var dataStore_record = dataCenter.getDataStore(recordStoreName);
					var recordData = {};
					if(dataStore_record){
						recordData = dataStore_record.getRowSet(0).getData()[0];
					}
					var recordVal = recordData[widget.bindName];
					if(Util.isNotEmpty(recordVal)){//优先级，自动加载上次填写大于预置数据，若记录有值则直接赋值
                        widget.currentValue = recordVal;
                        widget.isRecord = true;
                        widget.setValue();
					}
				}
			})

			var dateGroups = $("[dojotype='unieap.form.dateGroup']:not([notAutoRecord='true'])");
            dateGroups.each(function(i,o){
                var widget =$(o).data("FormWidget");
                var dataStore = widget.dataStore;
                var recordStoreName = dataStore.name+"_record";
                var dataStore_record = dataCenter.getDataStore(recordStoreName);
                var recordData = {};
                if(dataStore_record){
                    recordData = dataStore_record.getRowSet(0).getData()[0];
                }
                var start_time = recordData[widget.bindName+"_START"];
                var end_time = recordData[widget.bindName+"_END"];
                start_time = Util.isNotEmpty(start_time)?start_time:"";
                end_time = Util.isNotEmpty(end_time)?end_time:"";
                widget.bindRow.setItemValue(widget.bindName+"_START",start_time);
                widget.bindRow.setItemValue(widget.bindName+"_END",end_time);
                widget.isRecord = true;
                widget.setDomValue();
            })

			var fileupload = $("[dojotype='unieap.uploader.uploader']:not([notAutoRecord='true'])");
			fileupload.each(function(i,o){
				var fileuploadWidget = $(o).data("FormWidget");
				fileuploadWidget.inituploadData(record_fk,true,2);
			})
			
			var grid = $("[dojotype='unieap.grid.Grid']:not([notAutoRecord='true'])");
			grid.each(function(i,o){
				var gridWidget = $(o).data("FormWidget");
                var dataStore_record = dataCenter.getDataStore(gridWidget.dataStore.name+"_record");
                var uploadFilesDataStore = gridWidget.uploadFilesDataStore;
                var uploadFilesDataStoreRecord = dataCenter.dataStores[uploadFilesDataStore.name+"_record"];
                var recordData = [];
                if(dataStore_record){
                    recordData = dataStore_record.getRowSet().getData(3);
                    if(recordData.length>0&&gridWidget.count!=0){//有预置项清空预置项内容
                        $(o).datatableDel($(o).getDataIDsDT());
                    }
                    $(recordData).each(function(j,k){
                        var newRow = $.extend({},k,{});
                        var oldPk = newRow["pk_id"];
                        var newPk = Math.getUuid("rowid",25,32);
                        var uploadCol = {};
                        $(uploadFilesDataStoreRecord.getRowSet().primary).each(function(m,n){
                            if(n.row_id==oldPk){
                                var newRowUpload = $.extend({},n,{});
                                newRowUpload["up_id"]=Math.getUuid("fileupload",25,32);
                                var column_name = newRowUpload.column_name;
                                if(Util.isNotEmpty(uploadCol[column_name])){
                                  newRow[column_name] = newRow[column_name]+";"+newRowUpload["up_id"];
                                }else{
                                  uploadCol[column_name]=1;
                                  //清空该字段的值，并添加新的upid
                                  newRow[column_name] = newRowUpload["up_id"];
                                }
                                newRowUpload["row_id"]=newPk;
                                uploadFilesDataStore.getRowSet().primary.push(newRowUpload);
                            }
                        })
                        newRow["pk_id"]=newPk;
                        gridWidget.element.datatableAdd(newRow);
                    })
                }
			})

            var repeators = $("[dojotype='unieap.repeating.repeator']:not([notAutoRecord='true'])");
            repeators.each(function(i,o){
                setTimeout(function(){//延时添加行，不然不触发事件
                    var repeatorWidget = $(o).data("FormWidget");
                    var uploadFilesDataStore = repeatorWidget.uploadFilesDataStore;
                    var uploadFilesDataStoreRecord = dataCenter.dataStores[uploadFilesDataStore.name+"_record"];
                    var dataStore_record = dataCenter.getDataStore(repeatorWidget.dataStore.name+"_record");
                    var recordData = [];
                    if(dataStore_record){
                        recordData = dataStore_record.getRowSet().getData(3);
                        if(recordData.length>0&&repeatorWidget.count!=0){//有预置项清空预置项内容
                            for(i=repeatorWidget.count-1;i>-1;i--){
                                repeatorWidget.delNodeById(i,true);
                            }
                        }
                        $(recordData).each(function(j,k){
                            var newRow = $.extend({},k,{});
                            var oldPk = newRow["pk_id"];
                            var newPk = Math.getUuid("rowid",25,32);
                            var uploadCol = {};
                            $(uploadFilesDataStoreRecord.getRowSet().primary).each(function(m,n){
                                if(n.row_id==oldPk){
                                    var newRowUpload = $.extend({},n,{});
                                    newRowUpload["up_id"]=Math.getUuid("fileupload",25,32);
                                    var column_name = newRowUpload.column_name;
                                    if(Util.isNotEmpty(uploadCol[column_name])){
                                      newRow[column_name] = newRow[column_name]+";"+newRowUpload["up_id"];
                                    }else{
                                      uploadCol[column_name]=1;
                                      //清空该字段的值，并添加新的upid
                                      newRow[column_name] = newRowUpload["up_id"];
                                    }
                                    newRowUpload["row_id"]=newPk;
                                    uploadFilesDataStore.getRowSet().primary.push(newRowUpload);
                                }
                            })
                            newRow["pk_id"]=newPk;
                            var $node = repeatorWidget.addNodeWithData(newRow);
                        })
                        if(repeatorWidget.minNum){
                           for(var k=repeatorWidget.count;k<repeatorWidget.minNum;k++){
                                  repeatorWidget.addNode();
                            }
                        }
                    }
                 },100);
            })
			Msg.success("已为您加载上次填报的数据！");
		},
		//隐藏正在加载的mask
		hideLoadingMask:function(){
			$('.body-loading').hide();
		},
		print:function (){
			var id = dataCenter.getParameter("formid");
			var width = "210mm";
			var height = "297mm";
			var requestUrl=WEBAPP+"/form_templet.do?method=queryFormPrintModel";
			$.ajax({url : requestUrl,type : 'get',data : {selectedID : id},dataType : 'json'})
			.done(function(result) {
				if(result!=null){
					id = result.id;
				} 
			})
			.done(function(){
				 var tdWidths = "";
				 var ids = tdIds.split(",");
				 for ( i=0 ;i<ids.length; i++) {
				 	var tdId = ids[i];
				 	var width = $('#'+tdId).width();
				 	tdWidths += '"' +tdId + '":"' + width + '",';
				 }
				 tdWidths = tdWidths.substring(0 ,tdWidths.length-1);
				 tdWidths = "{" + tdWidths + "}";
			
				 var fulls = "location=no,status=yes,scrollbars=yes";    //定义弹出窗口的参数
				 if (window.screen) {
				 	var ah = screen.availHeight - 60;
				 	fulls += ",top=0,height=" + ah;
				 } else {
				 	fulls += ",height=" + 750;
				 }
			     fulls += ",width=" + 850;
			     fulls += ",resizable";
			     var fkValue=dataCenter.getParameter("SYS_FK");
			     var workitemId=dataCenter.getParameter("workitemid");
			var url = WEBAPP+"/formParser?status=print&formid="+id+"&SYS_FK="+fkValue+"&tdWidth="+tdWidths+"&workitemid="+workitemId;
			window.open(url ,null, fulls);
			});
		},
		
		//根据索引获得grid
		getGrid:function(index){
			var gridWidgets =$("[dojotype='unieap.grid.Grid']").data("FormWidget");
			var len=gridWidgets.length;
			if(index<len){
				return gridWidgets[index];
			}
			return null;
		},
		getForm:function(index){
			var widgets =$("[dojotype='unieap.form.Form']").data("FormWidget");
			var len=widgets.length;
			if(index<len){
				return widgets[index];
			}
			return null;
		},
		//注册事件
		on:function(event,fun){
			var listeners=this.eventListeners[event];
			if(!listeners){
				listeners=this.eventListeners[event]=[];
				listeners.push(fun);
			}
		},
		//触发事件
	trigger : function(event,params) {
		var listeners = this.eventListeners[event];
			if(!listeners)
				return;
			for(var i=0;i<listeners.length;i++){
			var result = listeners[i].call(this,params);
			if (result || result == false)
					return result;
			}
		},
		getElementValue:function(elementId){
			var value="";
			var widgets =$("[dojotype='unieap.form.Form']").data("FormWidget");
			for(var i=widgets.length-1,form;form=widgets[i];i--){
				form.each(function(widget){
				    if(widget.id==elementId){
				    	value = widget.collectValue();
				    }
				});
			};
			return value;
		},
		setElementValue:function(elementId,value){
			var widgets =$("[dojotype='unieap.form.Form']").data("FormWidget");
			for(var i=widgets.length-1,form;form=widgets[i];i--){
				form.each(function(widget){
				    if(widget.id==elementId){
				    	widget.setValue(value);
				    }
				});
			};
		},
		exportForm:function(){
			var requestURL = WEBAPP + "/formParser?status=runningExport&formid="+dataCenter.getParameter("formid")+"&SYS_FK="+dataCenter.getParameter("SYS_FK");
			var form = $("<form>");
            form.attr('style', 'display:none');
            form.attr('target', '');
            form.attr('method', 'post');
            form.attr('action', requestURL);

            $('body').append(form);
            form.submit();
            form.remove();
		},
		validateText:function(element,flag){
			var $this=$(this);
			if($this.css("visibility") &&$this.css("visibility") =="collapse"){
				return;
			}
			var id =$this.attr("id");
			var value =$this.val();
			var textType = $this.attr("texttype");
			var notnullValue = $this.attr("notnull");
			if(notnullValue && notnullValue=="true"){
				if(value.length==0){
					if($this.data("qtip")){
						$this.qtip("api").updateContent(WebForm_I18N.validate.notnull,false);
					}else{
						$this.formTooltip({
							content:WebForm_I18N.validate.notnull
						});
					}
					flag = false;
					return;
				}
			}
			
			if(!textType ||textType.length==0)
				return;
			if(textType=="identityCard"){
				if(!unieap.isIdentityCard(value)){
					if($this.data("qtip")){
						$this.qtip("api").updateContent(WebForm_I18N.validate.invalidIdentityCard,false);
					}else{
						$this.formTooltip({
							content:WebForm_I18N.validate.invalidIdentityCard
						});
					}
					flag = false;
				}else{
					if($this.data("qtip")){
						$this.qtip("destroy");
					}
				}
			}else if(textType=="email"){
				if(!unieap.isEmail(value)){
					if($this.data("qtip")){
						$this.qtip("api").updateContent(WebForm_I18N.validate.invalidEmail,false);
					}else{
						$this.formTooltip({
							content:WebForm_I18N.validate.invalidEmail
						});
					}
					flag = false;
				}else{
					if($this.data("qtip")){
						$this.qtip("destroy");
					}
				}
			}else if(textType=="postalCode"){
				if(!unieap.isPostalCode(value)){
					if($this.data("qtip")){
						$this.qtip("api").updateContent(WebForm_I18N.validate.invalidPostalCode,false);
					}else{
						$this.formTooltip({
							content:WebForm_I18N.validate.invalidPostalCode
						});
					}
					flag = false;
				}else{
					$this.data("qtip")&&$this.qtip("destroy");
				}
			}else if(textType=="mobilePhone"){
				if(!unieap.isMobilePhone(value)){
					if($this.data("qtip")){
						$this.qtip("api").updateContent(WebForm_I18N.validate.invalidMobilePhone,false);
					}else{
						$this.formTooltip({
							content:WebForm_I18N.validate.invalidMobilePhone
						});
					}
					flag = false;
				}else {
					$this.data("qtip")&&$this.qtip("destroy");
				}
			}else if(textType=="money"){
				if(!unieap.isMoney(value)){
					if($this.data("qtip")){
						$this.qtip("api").updateContent("无效金额",false);
					}else{
						$this.formTooltip({
							content:"无效金额"
						});
					}
					flag = false;
				}else {
					$this.data("qtip")&&$this.qtip("destroy");
				}
			}else if(textType=="customReg"){
				var regValue =$this.attr("reg");
				if(regValue && regValue.length>0){
					var r = value.match(eval(regValue));
					if(r==null){
						if($this.data("qtip")){
							$this.qtip("api").updateContent(WebForm_I18N.validate.invalid,false);
						}else{
							$this.formTooltip({
								content:WebForm_I18N.validate.invalid
							});
						}
						flag = false;
					}else{
						if($this.data("qtip")){
							$this.qtip("destroy");
						}
					}
				}
			}else if(textType=="number"){
				if(!unieap.isNumber(value)){
					if($this.data("qtip")){
						$this.qtip("api").updateContent(WebForm_I18N.validate.invalidNumber,false);
					}else{
						$this.formTooltip({
							content:WebForm_I18N.validate.invalidNumber
						});
					}
					flag = false;
				}else{
					$this.data("qtip")&&$this.qtip("destroy");
		
				}
			}
		},
		addDataExtend:function(name,value){
			dataCenter.addParameter(name,value);
		}
});

