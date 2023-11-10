/**
 * 定义重复节组件
 */
var RepeatorWidgets = {
        //控件联动触发事件
        cascadeEvent:function(){
            var $this = $(this);
            var currElementId=$this.attr("column");
            var value=$this.val();
            value=value.replace(/\%/g,"%25"); //转义！！！！！！！
            value=value.replace(/\#/g,"%23");
            value=value.replace(/\&/g,"%26");
            value=value.replace(/\+/g,"%2B");
            value=value.replace(/\ /g,"%20");
            var presetbind = $this.attr('presetdatabind');
            if(presetbind){
                var jsonData = dataCenter && dataCenter.toJson?dataCenter.toJson():String(dataCenter || "");
                var bindName = presetbind.split(".")[1];
                var entityName = presetbind.split(".")[0];
                var url = WEBAPP + '/formParser?status=preset' + '&presetbind='
                        + entityName + '&' + bindName + '=' + value;
                var renderDataFunc = function(results) {
                    var data = results;
                    $('[presetdatabind*="'+entityName+'"]',$this.parents("[node='node']")).each(function(i,o) {
                        var $o = $(o);
                        if($o.attr("column")!=currElementId){
                            var bindData=eval("("+JSON.stringify(data[0])+")");
                            var repeatortype = $o.attr('repeatortype');
                            var dataValue="";
                            if(bindData){
                                var presetbind = $(this).attr('presetdatabind')
                                var entityId = presetbind.split(".")[0]
                                var name = presetbind.split(".")[1]
                                if (entityId == entityName) {
                                    if(results.length==1&&bindData[name]){
                                      dataValue = bindData[name];
                                    }
                                }
                            }
                            RepeatorWidgets.bindData($o,dataValue);
                            RepeatorWidgets.collectData($o,$o.parents("[dojotype='unieap.repeating.repeator']").data("FormWidget"));
                        }
                    });
                };
                $.ajax({
                    url : url,
                    async : false,
                    type : 'post',
                    data : jsonData,
                    dataType : 'json',
                    contentType:'text/plain;charset=UTF-8',
                    success : renderDataFunc
                });
            }
        },
		qtipChange:function (widgettype){
            var $element = $(this);
            var result = RepeatorWidgets[widgettype].validate($element);
            if(!$element.is(":visible")){
            	$element = $element.next();
            }
            var $validateElement = Util.isNotEmpty(RepeatorWidgets[widgettype].getValidateElement)?RepeatorWidgets[widgettype].getValidateElement($element):$element;
            $validateElement = Util.isNotEmpty($validateElement)?$validateElement:$element;
            if(!result.ok){
	             if($validateElement.data("qtip")){
	               var api = $validateElement.qtip("api");
	               api.set("content.text",result.message);
	               api.toggle(true);
	             }else{
	            	$validateElement.formTooltip({
	                   content:result.message
	                 });  
	             }
	             return;
	         } else{
                   if($validateElement.data("qtip")){
	                 var api = $validateElement.qtip('api');
	                 api.destroy(true);
	               }
	         }
		},
		updateRow:function(key,value,rowid,repeator){
			var ds = repeator.dataStore;
			var rowSet=ds.getRowSet();
			var oldRowData = rowSet.getRowData(rowid,"primary");
			var newRowData = {};
			newRowData[key]=value==null?"":value;
			newRowData=$.extend({},oldRowData,newRowData);
			var newRowObj = new unieap.ds.Row(null,newRowData,0);
			rowSet.updateRow(rowid,newRowObj);
			for(var i=0;i<repeator.primaryKeys.length;i++){
				if(repeator.primaryKeys[i]==newRowData.pk_id){//只有对原有查询出来的行修改才是修改，对于添加后再修改的行仍然是新增
					rowSet.getRow(rowid).setRowStatus(3);
					break;
				}
			}
		},
		getCellData:function(key,rowid,repeator){
			var ds = repeator.dataStore;
			var rowSet=ds.getRowSet();
			var data = rowSet.getRowData(rowid,"primary");
			return data[key];
		},
        render:function($element,repeator){//控件渲染
            var type = $element.attr("repeatortype");
            if($element.attr("widgetonlyread")=="true"){
                RepeatorWidgets[type].readOnly($element);
            }
            RepeatorWidgets[type].render($element,repeator);
        },
        readOnly:function($element){//改为只读状态
            var type = $element.attr("repeatortype");
            RepeatorWidgets[type].readOnly($element);
        },
        bindData:function($element,value){//控件绑定值
            var type = $element.attr("repeatortype");
            RepeatorWidgets[type].bindData($element,value);
        },
        validate:function($element){//校验
            var type = $element.attr("repeatortype");
            return RepeatorWidgets[type].validate($element);
        },
        collectData:function($element,repeator){//控件
            var type = $element.attr("repeatortype");
            RepeatorWidgets[type].collectData($element,repeator);
        },
		textfield:{//单行文本控件
			render:function($element,repeator){//控件渲染
				$element.addClass("notranslate");//禁止谷歌翻译
				$element.on("change",function(){
					RepeatorWidgets.textfield.collectData($element,repeator);
					RepeatorWidgets.qtipChange.call(this,'textfield');
					if($(this).attr("presetdatabindisquery")=="true"){
					    RepeatorWidgets.cascadeEvent.call(this);
					}
				})
				if($element.attr("notnull")==='true'){
					$element.addClass("notnull");
				}
                if(repeator.editable){
                    //监听控件notnull属性的变化。如果新增了notnull属性，则.addClass("notnull")；如果删除了notnull属性，则.removeClass("notnull")；
                    var targetNode = $element[0];
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
                }
				var prompt = $element.attr("prompt");
				if (prompt && "" != prompt){
					$element.css("width","calc(100% - 20px)");
					var tooltip = $('<a class="color-666 pull-right push-up-5 fz-16 fa fa-info-circle" data-container="body" data-toggle="tooltip" data-placement="bottom" title="'+prompt+'"></a>');
					$element.before(tooltip);
					tooltip.tooltip();
				}
			},
			readOnly:function($element){//改为只读状态
				$element.prop("disabled","disabled");
			},
			bindData:function($element,value){//控件绑定值
				$element.val(value);
				if($element.attr("texttype")==="money"){
					RepeatorWidgets.qtipChange.call(this,'textfield');
				}
			},
			validate:function($element){//校验
				var type = $element.attr('texttype');
				var result={ok:true,message:"",name:$element.attr("name")};
				var value = $element.val();
				if($element.attr('notnull')==='true'){
					if(!value){
						result.ok=false;
						result.message="此项不能为空";
						return result;
					}
				}
				var reg;
				var message="";
				switch(type){
				  case 'number':
					  reg=/^\+?[1-9][0-9]*$/;
					  message="请输入正整数！";
					  break;
				  case 'identityCard':
					  reg=/^[1-9]\d{5}(18|19|20|(3\d))\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
					  message="请输入正确的身份证号！";
					  break;
				  case 'email':
					  reg=/^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/;
					  message="无效电子邮箱";
					  break;
				  case 'mobilePhone':
					  reg=/^1\d{10}$/;
					  message="无效移动电话";
					  break;
				  case 'money':
					  if(unieap.isMoney(value)){
						  var $span = $("<span name ='upper' class='bar push-up-5 push-down-5' style='font-weight: initial;'></span>");
						  $span.text(unieap.digitUppercase(value));
						  $element.next("span[name='upper']").remove();
						  $element.after($span);
					  }else{
						  result.ok=false;
						  result.message="无效金额";
						  $element.next("span[name='upper']").remove();
						  return result;
					  }
					  break;
				  case 'customReg':
					  reg=eval($element.attr("reg"));
					  message="无效内容";
					  break;
				}
				if(reg&&value&&!reg.test(value)) {
					result.ok=false;
					result.message=message;
				}
				return result;

			},
			collectData:function($element,repeator){//控件
				var key = $element.attr("column");
				var value = $element.val();
				var count = $element.parents('[node="node"]').attr("count");
				RepeatorWidgets.updateRow(key,value,Number(count)-1,repeator);
			}
		},
		textarea:{//多行文本控件
			render:function($element,repeator){//控件渲染
			    $element.addClass("notranslate");//禁止谷歌翻译
				$element.on("change",function(){
					RepeatorWidgets.textarea.collectData($element,repeator);
					RepeatorWidgets.qtipChange.call(this,'textarea');
					if($(this).attr("presetdatabindisquery")=="true"){
					    RepeatorWidgets.cascadeEvent.call(this);
					}
				})
				if($element.attr("notnull")==='true'){
					$element.addClass("notnull");
				}
				if(repeator.editable){
                    //监听控件notnull属性的变化。如果新增了notnull属性，则.addClass("notnull")；如果删除了notnull属性，则.removeClass("notnull")；
                    var targetNode = $element[0];
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
                }
				var prompt = $element.attr("prompt");
				if (prompt && "" != prompt){
					$element.css("width","calc(100% - 20px)");
					var tooltip = $('<a class="color-666 pull-right push-up-5 fz-16 fa fa-info-circle" data-container="body" data-toggle="tooltip" data-placement="bottom" title="'+prompt+'"></a>');
					$element.before(tooltip);
					tooltip.tooltip();
				}
			},
			readOnly:function($element){//改为只读状态
				$element.prop("disabled","disabled");
			},
			bindData:function($element,value){//控件绑定值
				$element.val(value);
			},
			validate:function($element){//校验
				var result={ok:true,message:"",name:$element.attr("name")};
				var value = $element.val();
				if($element.attr('notnull')==='true'){
					if(!value){
						result.ok=false;
						result.message="此项不能为空";
					}
				}
				return result;
			},
			collectData:function($element,repeator){//控件
				var key = $element.attr("column");
				var value = $element.val();
				var count = $element.parents('[node="node"]').attr("count");
				RepeatorWidgets.updateRow(key,value,Number(count)-1,repeator);
			}
		},
		combobox:{//下拉菜单控件
	          //级联查询codeList
	          cascadeQueryData:function($comboBox,parentType ,parentValue,repeator){
	          	if(parentType==null){
              		parentType = "";
              	}
	            var type = $comboBox.attr("dataprovider");
	            var oriType = type.substring(0, type.lastIndexOf("_"));
	            var oriParentType = parentType.substring(0, parentType.lastIndexOf("_"));
	            if(oriType!=oriParentType){//若绑定的不是一个codetype则取子下拉的
	               parentType = oriType+'_'+(Number(type.substring(oriType.length+1, type.length))-1);
	            }
	            var params = {
	              codelist_parentType : parentType ,
	              codelist_parentValue: parentValue
	            };
	            var dataItemArray = RepeatorWidgets.combobox.queryCodes(params,$comboBox.attr("az")==="true");
              //在选项没有的情况下也得考虑,仅限进入表单第一次级联
	            var key = $comboBox.attr("column");
				var count = $comboBox.parents('[node="node"]').attr("count");
				if(repeator[key+count+"_isPre"]!="1"){
                       var textCur = RepeatorWidgets.getCellData(key+"_TEXT",Number(count)-1,repeator);
                       var valueCur = RepeatorWidgets.getCellData(key,Number(count)-1,repeator);
                       var valueArr,textArr;
                       var isMulti = false;
                       if($comboBox.attr("multiple")==="multiple"){
                            isMulti = true;
                            if(""==valueCur||null==valueCur){
                               valueArr = new Array();
                               textArr = new Array();
                            }else{
                               valueArr = valueCur.split(";");
                               textArr = textCur.split(";");
                             }
                       }
                       var valueOptionArray = new Array();
                       $(dataItemArray).each(function(i,o){
                           valueOptionArray.push(o.VALUE);
                       })
                       if(isMulti){//多选循环一下
                           $(valueArr).each(function(i,o){
                               if($.inArray(o,valueOptionArray)<0){
                                                 dataItemArray.push({VALUE:o,NAME:textArr[i]});
                               }
                           })
                       }else{
                                if(""!=valueCur&&null!=valueCur&&$.inArray(valueCur,valueOptionArray)<0){
                                     dataItemArray.push({VALUE:valueCur,NAME:textCur});
                                }
                       }
                       repeator[key+count+"_isPre"] = "1";
				}
	            var height =$comboBox.height();
	            RepeatorWidgets.combobox.initMenu($comboBox,dataItemArray);
	            $comboBox.selectpicker('refresh');
	            if(dataItemArray.length>0){
	            	if($comboBox.attr("binded")!="true"){
						var value= valueCur;
						if(value){
			                RepeatorWidgets.combobox.bindData($comboBox,value);
						}else{
							$comboBox.selectpicker("val",null);
						}
		                $comboBox.attr("binded","true");
	            	}else{
	            		$comboBox.selectpicker("val",null);
	            	}
					
	            }
	            //级联查询重新绑定数据后,触发change事件，为绑定了联动查询的控件赋值
//	            setTimeout(function(){
                   $comboBox.attr("notQtip","true");
	               $comboBox.trigger('change');
//	             },100);
	          },
	        queryCodes:function(params,isAz) {
	          var url = WEBAPP + '/formParser?status=codeList';
	          if(isAz){
	             url=url+'&az=true';
	          }
	          var valueArray = [];
	          var queryMenuDataSuccess = function(results) {
	            if (results) {
	              valueArray = results;
	            }
	          };
	          //添加表单id,流程实例id,工作项id等信息。
	          var formid = dataCenter.getParameter("formid");
	          var procinstid = dataCenter.getParameter("SYS_FK");
	          var workitemid = dataCenter.getParameter("workitemid");
	          params.formid =formid;
	          params.procinstid = procinstid;
	          params.workitemid = workitemid;
	          $.ajax({
	            url : url,
	            async: false,
	            type : 'post',
	            data : params,
	            dataType : 'json',
	            success : queryMenuDataSuccess
	          });
	          return valueArray;
	        },
	         initMenu:function($element,valueArray){//根据dc中的数据，添加option
	           var string = '';
	           if(!valueArray){
	             return;
	           }
	           $element.empty();
               if($element.attr("multiple") == "multiple"){
                string = '';
               }else{
                   string = '<option value = "" initial="-">请选择</option>';
               }
	           for(var i = 0; i < valueArray.length; i++){
	               if(valueArray[i].VALUE!=null){
	                   string += '<option '+ (valueArray[i].FINAL_INITIAL_LETTER?('initial="'+valueArray[i].FINAL_INITIAL_LETTER+'"'):'') + ' value =';
	                   string += "'"+valueArray[i].VALUE + "'>";
	                   string += valueArray[i].NAME + '</option>';
	             }
	           }
	           $element.html(string);
	         },
			render:function($element,repeator){//控件渲染
			    $element.addClass("notranslate");//禁止谷歌翻译
			    $element.addClass("select-dropdown-fixed");
			    var az = ($element.attr("az")==='true');
			    var mobile = (Util.getClientInfo()!="PC");
				if($element.attr("notnull")==='true'){
					$element.addClass("notnull");
				}
				if(repeator.editable){
                    //监听控件notnull属性的变化。如果新增了notnull属性，则.addClass("notnull")；如果删除了notnull属性，则.removeClass("notnull")；
                    var targetNode = $element[0];
                    var options = { attributes: true, childList: false,subtree:false,attributeOldValue:true};
                    function callback(mutationsList, observer) {
                        mutationsList.forEach(function(record) {
                            if(record.attributeName=="notnull"){
                            // 如果发生变化的属性是notnull
                                if($(record.target).attr("notnull") == "true" && $(record.target).attr("disabled") == undefined){
                                    //如果notnull为true了，并且当前不是“disabled”的，addClass("notnull");
                                    $(record.target).next().addClass("notnull");
                                }else if($(record.target).attr("notnull") == undefined){
                                    //如果notnull属性不存在，removeClass("notnull");
                                    $(record.target).next().removeClass("notnull");
                                }
                            }
                       });
                    }
                    if(navigator.userAgent.toLowerCase().indexOf("msie") == -1){
                        var mutationObserver = new MutationObserver(callback);
                        mutationObserver.observe(targetNode, options);
                    }
                    //监听上传控件notnull属性的变化end
                }
				//初始化选项
				var dataprovider = $element.attr("dataprovider");
				if(dataprovider&&!$element.attr("cascadewidgetid")){//如果绑定了数据来源，则option取数据来源
					var dataProviderType = $element.attr("dataprovidertype");
					var dataProviderText = $element.attr("dataprovidertext");
					var url = ""; 
					var dataParam = {};
				    if(dataProviderType=="preset"){
				        url=WEBAPP + '/formParser?status=preset';
				        dataParam.presetbind = dataprovider;
				        dataParam.presetbindtext = dataProviderText;
				    }else if(dataProviderType=="codeList"){
				        url=WEBAPP + '/formParser?status=codeList';
				        dataParam.codelist_type= dataprovider;
				    }
                    if(az&&mobile){
                       url=url+"&az=true";
                    }
				    dataParam.formid = dataCenter.getParameter("formid");
				    dataParam.procinstid = dataCenter.getParameter("SYS_FK");
				    dataParam.workitemid = dataCenter.getParameter("workitemid");
				    $.ajax({
				        url : url,
				        async: false,
				        type : 'post',
				        data : dataParam,
				        dataType : 'json',
				        success : function(results){
				        	if(results){
				        		$element.empty();
				        		$(results).each(function(i,o){
				        			$element.append("<option value='"+o.VALUE+"' "+(o.FINAL_INITIAL_LETTER?("initial='"+o.FINAL_INITIAL_LETTER+"'"):"")+">"+o.NAME+"</option>");
				        		})
				        	}
				        }
				    });
				   
				}
                if($element.attr("multiple") != "multiple"){
                    $element.prepend('<option value = "" initial="-">请选择</option>');
                }
              //在选项没有的情况下也得考虑
                var key = $element.attr("column");
                var count = $element.parents('[node="node"]').attr("count");
                var textCur = RepeatorWidgets.getCellData(key+"_TEXT",Number(count)-1,repeator);
                var valueCur = RepeatorWidgets.getCellData(key,Number(count)-1,repeator);
                var valueArr,textArr;
                var isMulti = false;
                if($element.attr("multiple")==="multiple"){
                     isMulti = true;
                     if(""==valueCur||null==valueCur){
                        valueArr = new Array();
                        textArr = new Array();
                     }else{
                        valueArr = valueCur.split(";");
                        textArr = textCur.split(";");
                      }
                }
                var valueOptionArray = new Array();
                $element.children().each(function(i,o){
                    valueOptionArray.push($(o).attr("value"));
                })
                if(isMulti){//多选循环一下
                    $(valueArr).each(function(i,o){
                        if($.inArray(o,valueOptionArray)<0){
                              $element.append("<option value='"+o+"' >"+textArr[i]+"</option>");
                        }
                    })
                }else{
                         if(""!=valueCur&&null!=valueCur&&$.inArray(valueCur,valueOptionArray)<0){
                              $element.append("<option value='"+valueCur+"' >"+textCur+"</option>");
                         }
                }
				$element.removeClass('form-control');
				$element.selectpicker();
				$element.selectpicker('val',null);
				if(mobile){
				   $element.renderMobileSelect(az);
				}
				$element.on("change",function(){
					RepeatorWidgets.combobox.collectData($element,repeator);
					if($element.attr("notQtip")==="true"){
					    $element.removeAttr("notQtip")
					}else{
					    RepeatorWidgets.qtipChange.call(this,'combobox');
					}
					if($element.attr("isquerykey")!="true"&&$element.attr("dataprovidertype")!="codeList"){
						return;
					}
		            var id =$element.attr("column");
		            var cascadeWidgets=$("[cascadewidgetid='"+id+"']",$element.parents("[node='node']"));
		            if(cascadeWidgets.length!=0){
			              var parentVal = this.value;
			              for(var i=cascadeWidgets.length-1,comboBox;comboBox=cascadeWidgets[i];i--){
			            	  RepeatorWidgets.combobox.cascadeQueryData($(comboBox),$element.attr("dataprovider") ,parentVal,repeator);
			              };
		            }
					if($(this).attr("presetdatabindisquery")=="true"){
					    RepeatorWidgets.cascadeEvent.call(this);
					}
				})
			},
			readOnly:function($element){//改为只读状态
				$element.prop("disabled","disabled");
			},
			bindData:function($element,value){//控件绑定值
			    if(!Util.isNotEmpty(value)){
			        value = "";
			    }
			    value = value.split("::")[0];
				if($element.attr("data-multiple-select")==="true"){
					value = value.split(";");
				}
				$element.selectpicker('val',value);
			},
			validate:function($element){//校验
				var result={ok:true,message:"",name:$element.attr("name")};
				var value = $element.val();
				if($element.attr('notnull')==='true'){
					if(!value){
						result.ok=false;
						result.message="此项不能为空";
					}
				}
				return result;
			},
			collectData:function($element,repeator){//控件
				var key = $element.attr("column");
				var value = $element.val();
				var text = "";
				$element.children("option:selected").each(function(i,o){
					if(i==0){
						text = $(o).text();
					}else{
						text =text + ";" + $(o).text();
					}
				})
				if($element.attr("data-multiple-select")==="true"){
					value = (value==null)?"":value.join(";");
				}
				var count = $element.parents('[node="node"]').attr("count");
				RepeatorWidgets.updateRow(key,value,Number(count)-1,repeator);
				RepeatorWidgets.updateRow(key+"_TEXT",text,Number(count)-1,repeator);
			}
			
		},
		autocomplete:{//输入联想控件
            render:function($element,repeator){//控件渲染
                 if($element.attr("notnull")==='true'){
                     $element.addClass("notnull");
                 }
                 if(repeator.editable){
                      //监听控件notnull属性的变化。如果新增了notnull属性，则.addClass("notnull")；如果删除了notnull属性，则.removeClass("notnull")；
                      var targetNode = $element[0];
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
                 }
                 var prompt = $element.attr("prompt");
                 if (prompt && "" != prompt){
                     $element.css("width","calc(100% - 20px)");
                     var tooltip = $('<a class="color-666 pull-right push-up-5 fz-16 fa fa-info-circle" data-container="body" data-toggle="tooltip" data-placement="bottom" title="'+prompt+'"></a>');
                     $element.before(tooltip);
                     tooltip.tooltip();
                 }
                 $element.attr("action",WEBAPP+"/fp/Uniformcommon/autoInput");
                 $element.after('<input type="hidden" name="'+$element.attr("name")+'_code">');
                 var param = {};
                 param.presetKey = $element.attr("dataprovider");
                 param.procinstId = dataCenter.getParameter("SYS_FK");
                 Util.autocompleteFp($element,null,param,true);
                 if(Util.getClientInfo()!="PC"){
                    $element.renderMobileAutocomplete(true,param);
                 }
                 var onselected = {
                  onselected : function(data){
                      RepeatorWidgets.autocomplete.collectData($element,repeator,data);
                      if($element.attr("notQtip")==="true"){
                          $element.removeAttr("notQtip")
                      }else{
                          RepeatorWidgets.qtipChange.call($element,'autocomplete');
                      }
                  }
                 }
                $element.data("onselected",onselected);
            },
            readOnly:function($element){//改为只读状态
                $element.prop("disabled","disabled");
            },
            bindData:function($element,value){//控件绑定值
                if(Util.isNotEmpty(value)&&value.indexOf("::")>-1){
                    var arr = value.split("::");
                    var value = arr[0];
                    var text = arr[1];
                    var $node = $element.parents('[node="node"]');
                    var name = $element.attr("name");
                    $("input[name='"+name+"_code']",$node).val(value);
                    $element.val(text);
                }
            },
            validate:function($element){//校验
                var result={ok:true,message:"",name:$element.attr("name")};
                var $node = $element.parents('[node="node"]');
                var name = $element.attr("name");
                var value = $("input[name='"+name+"_code']",$node).val();
                var text = $element.val();
                if($element.attr('notnull')==='true'){
                    if(!Util.isNotEmpty(value)){
                        result.ok=false;
                        result.message="此项不能为空";
                    }
                }
                if(Util.isNotEmpty(text)&&!Util.isNotEmpty(value)){
                     result.ok=false;
                     result.message="请选择输入后所查询出的内容";
                }
                return result;
            },
            collectData:function($element,repeator,data){//控件
                var key = $element.attr("column");
                var $node = $element.parents('[node="node"]');
                var name = $element.attr("name");
                var value = "";
                var text = "";
                if(Util.isNotEmpty(data)){
                   text = data.text;
                   value = data.value;
                }else{
                   text = $element.val();
                   value = $("input[name='"+name+"_code']",$node).val();
                }
                var count = $node.attr("count");
                RepeatorWidgets.updateRow(key,value,Number(count)-1,repeator);
                RepeatorWidgets.updateRow(key+"_TEXT",text,Number(count)-1,repeator);
            }

        },
		date:{//日期
			render:function($element,repeator){//控件渲染
				$element.attr("id",Math.getUuid("vantdate",25,32));
				$element.attr("readonly","readonly");
				var notClick = $element.attr("notClick");
				if(notClick==="true"){
				    $element.prop("disabled","disabled");
				}
				dateTimeFormat=$element.attr("dateTimeFormat");
				if(!dateTimeFormat){//若都没配置，默认是yyyy-mm-dd格式
					dateTimeFormat = "yyyy-MM-dd";
				}
				if(Util.getClientInfo()==="PC"){
					$element.attr("widgetType","my97");
					$element.attr('onclick','WdatePicker({oncleared:function(){$(this).trigger("change")},onpicked:function(){$(this).trigger("change")},readOnly:true,dateFmt:"'+dateTimeFormat+'"})');
				}else{
					$element.attr("widgetType","vant");
					renderVantDate($element);
				}
				$element.on("change",function(){
					RepeatorWidgets.date.collectData($element,repeator);
					RepeatorWidgets.qtipChange.call(this,'textarea');
					if($(this).attr("presetdatabindisquery")=="true"){
					    RepeatorWidgets.cascadeEvent.call(this);
					}
				})
				if($element.attr("notnull")==='true'){
					$element.addClass("date-notnull");
				}
				if(repeator.editable){
                    //监听控件notnull属性的变化。如果新增了notnull属性，则.addClass("notnull")；如果删除了notnull属性，则.removeClass("notnull")；
                    var targetNode = $element[0];
                    var options = { attributes: true, childList: false,subtree:false,attributeOldValue:true};
                    function callback(mutationsList, observer) {
                        mutationsList.forEach(function(record) {
                            if(record.attributeName=="notnull"){
                            // 如果发生变化的属性是notnull
                                if($(record.target).attr("notnull") == "true" && $(record.target).attr("disabled") == undefined){
                                    //如果notnull为true了，并且当前不是“disabled”的，addClass("notnull");
                                    $(record.target).addClass("date-notnull");
                                }else if($(record.target).attr("notnull") == undefined){
                                    //如果notnull属性不存在，removeClass("notnull");
                                    $(record.target).removeClass("date-notnull");
                                }
                            }
                       });
                    }
                    if(navigator.userAgent.toLowerCase().indexOf("msie") == -1){
                        var mutationObserver = new MutationObserver(callback);
                        mutationObserver.observe(targetNode, options);
                    }
                    //监听上传控件notnull属性的变化end
                }
				var prompt = $element.attr("prompt");
				if (prompt && "" != prompt){
					$element.css("width","calc(100% - 20px)");
					var tooltip = $('<a class="color-666 pull-right push-up-5 fz-16 fa fa-info-circle" data-container="body" data-toggle="tooltip" data-placement="bottom" title="'+prompt+'"></a>');
					$element.before(tooltip);
					tooltip.tooltip();
				}
			},
			readOnly:function($element){//改为只读状态
				$element.prop("disabled","disabled");
			},
			bindData:function($element,value){//控件绑定值
				var date;
				var widgettype = $element.attr("widgetType");
				var format = $element.attr("dateTimeFormat");
				if(value && $.isNumeric(value)){
					// 需要修复的时间
					var nowDate = parseInt(value);
					// 服务器端时区，北京东八区（-8*60）
					var timezone = -480;
					// 客户端实际时区(例如东京为东九区：-540)
					var offsetGMT = new Date(nowDate).getTimezoneOffset();
					// 计算差值
					var adjust = timezone - offsetGMT;
					nowDate = nowDate - adjust * 60 * 1000;
					date=new Date(nowDate);
				}
				switch (widgettype){
					case "vant":
						if(date){
							$element.data("dateVm").$data.currentDate = date;
						}else{
                         	$element.data("dateVm").$data.currentDate = new Date();
                         	$element.val("");
                        }
					case "my97":
						if(date){
							$element.val(Util.dateFormatter(date,format));
						}else{
						    $element.val("");
						}
						break;
				}
			},
			validate:function($element){//校验
				var result={ok:true,message:"",name:$element.attr("name")};
				var value = $element.val();
				if($element.attr('notnull')==='true'){
					if(!value){
						result.ok=false;
						result.message="此项不能为空";
					}
				}
				return result;
			},
			collectData:function($element,repeator){//控件
				var value;
				var key = $element.attr("column");
				var widgettype = $element.attr("widgetType");
//				var format = $element.attr("dateTimeFormat");
//				var date=new Date($element.val().replace(/-/g, '/'));
//				if(!date||!date.getTime()){
//					value = null;
//				}else{
//					// 服务器端时区，北京东八区（-8*60）
//					var timezone = -480;
//					// 客户端实际时区(例如东京为东九区：-540)
//					var offsetGMT = date.getTimezoneOffset();
//					// 计算差值（用户在东京时区下下单，需要补回1小时）
//					var adjust = timezone - offsetGMT;
//					// 需要修复的时间，支持字符串传参
//					var nowDate = date.getTime();
//					value=nowDate + adjust * 60 * 1000;
//				}
                value = $element.val();
				var count = $element.parents('[node="node"]').attr("count");
				RepeatorWidgets.updateRow(key,value,Number(count)-1,repeator);
			}
		},
		groupbox:{//复选、单选
			render:function($element,repeator){//控件渲染
			    $element.addClass("notranslate");//禁止谷歌翻译
			    if(Util.isIE()){//如果是IE浏览器，宽度设置为100%，避免由于选项内容过多导致选项超出屏幕问题，但是必填的红色星花会在最右。
                	$element.css("width","100%");
                }else{ //如果是其他浏览器，宽度设置为auto，必填的星花会挨着选项内容显示。
                	$element.css("width","auto");
                }
				var data = {
						result:type==='radio'?'':[],
						jqObj:$element,
						isDisabled:$element.attr("disabled") && $element.attr("disabled")=="disabled"
				}
				if($element.attr("notnull")==="true"){
					$element.addClass("notnull");
				}
				if(repeator.editable){
                    //监听控件notnull属性的变化。如果新增了notnull属性，则.addClass("notnull")；如果删除了notnull属性，则.removeClass("notnull")；
                    var targetNode = $element[0];
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
                }

				$element.attr("id",Math.getUuid("vantgroupbox",25,32));
				var type = $element.attr("type");
				var direction = $element.attr("direction");
				var vantStr = '';
				if (type==='radio') {
					vantStr = '<van-radio-group v-model="result" direction="'+direction+'" :disabled="isDisabled" @change="change()">';
					$element.find(".checkbox-label").each(function(i,o){//遍历选项
					    var text = $(o).text();
                        var sign = "option"+(i+1);
                        data[sign] = true;
					    vantStr = vantStr+'<van-radio :disabled="'+sign+' ==false" name="'+$(o).text()+'">'+$(o).text()+'</van-radio>';
					});
					vantStr = vantStr+'</van-radio-group>'
				} else if (type==='checkbox'){
					vantStr = '<van-checkbox-group v-model="result" direction="'+direction+'" :disabled="isDisabled" @change="change()">';
					$element.find(".checkbox-label").each(function(i,o){//遍历选项
					    var text = $(o).text();
                        var sign = "option"+(i+1);
                        data[sign] = true;
					    vantStr = vantStr+'<van-checkbox shape="square" :disabled="'+sign+' ==false" name="'+$(o).text()+'">'+$(o).text()+'</van-checkbox>';
					});
					vantStr = vantStr+'</van-checkbox-group>'
				}else{
					$element.empty();
					return;
				}
				$('<div id="'+$element.attr("id")+'_vant"></div>').appendTo($element.empty()).append(vantStr);
				var groupBoxVm = new Vue({
					el:'#'+$element.attr("id")+'_vant',
					data:data,
					methods:{
						change:function(){
							RepeatorWidgets.groupbox.collectData($element,repeator);
							RepeatorWidgets.qtipChange.call($element[0],'groupbox');
							if($element.data("changeEvent")){
                                $element.data("changeEvent").call($element[0],this.result);
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
						$(".van-checkbox--horizontal",this.jqObj).addClass("push-down-5");
                        $(".van-checkbox--horizontal",this.jqObj).addClass("push-up-5");
                        $(".van-radio--horizontal",this.jqObj).addClass("push-down-5");
                        $(".van-radio--horizontal",this.jqObj).addClass("push-up-5");
					  })
				    }
				});
				$element.data("groupBoxVm",groupBoxVm);
			},
			readOnly:function($element){//改为只读状态
				$element.data("groupBoxVm").$data.isDisabled=true;
				$element.attr("disabled","disabled");
			},
			bindData:function($element,value){//控件绑定值
				var vm = $element.data("groupBoxVm");
				var originalVal = vm.$data.result;
				var type = $element.attr("type");
				if(value){
					if(type!="radio"){
						value = value.split(";");
					}
					vm.$data.result=value;
				}else{
					if(type==="radio"){
						if(originalVal){
							vm.$data.result="";
						}
					}else{
						if(originalVal.length>0){
							vm.$data.result=[];
						}
					}
				}

			},
			validate:function($element){//校验
				var result={ok:true,message:"",name:$element.attr("name")};
				var value = $element.data("groupBoxVm").$data.result;
				if($element.attr('notnull')==='true'){
					if(value.length===0){
						result.ok=false;
						result.message="此项不能为空";
					}
				}
				return result;
			},
			collectData:function($element,repeator){//控件
				var value = $element.data("groupBoxVm").$data.result;
				var key = $element.attr("column");
				var type = $element.attr("type");
				if(type!='radio'){
					if(value){
						value=value.join(";")
					}else{
						value="";
					}
				}else if(value.length==0){
				    value = "";
				}
				var count = $element.parents('[node="node"]').attr("count");
				RepeatorWidgets.updateRow(key,value,Number(count)-1,repeator);
			}
		},
		uploader:{//上传文件
			render:function($element,repeator){//控件渲染
			    var fk_id = dataCenter.getParameter("SYS_FK");
			    var id = $element.attr("column");
				var uploaderName = $element.attr("uploaderName");
				var btnName = $element.attr("btnName");
				var uploaderType = $element.attr("uploaderType");
				var filesSizeLimit = $element.attr("filesSizeLimit");
				var filesOneceLimit = $element.attr("filesOneceLimit");
				var filesTotalLimit = $element.attr("filesTotalLimit");
				var disabled = false;
				if(!repeator.editable){
					disabled = true;
				}
				$element.empty();
				var fileUpload = "";
				var btnId = Math.getUuid("btn",25,32);
				if(btnName){
					fileUpload = "<span class='btn btn-primary fileinput-button push-down-5'><i class='fa fa-upload'></i><span>"+btnName+
					"</span><input id='"+btnId+"' type='file' name='files[]' multiple></span>";
				}else{
					fileUpload = "<span class='btn btn-primary fileinput-button push-down-5'>"+
					"<input id='"+btnId+"' type='file' name='files[]' multiple></span>";
				}
				$element.append(fileUpload);
				var $btn = $element.find("input");

				if(uploaderType==="picture"){
				    $btn.parent().after('<div class="bar responsive-padding-box view-blueimp-gallery push-up-5"><div class="gallery" id="'+btnId+'_imageContainer'+'"></div></div>');
				    $("#page-content",window.parent.document).append('<div style = "display:none"><ul name="pictures" id="'+btnId+'_imageContainer'+'"></ul></div>');
				}
                //进度条
                var $progress = $('<div class="bar push-up-10" name="progress" style="display:none;">'+
                                        '<div style="max-width: 200px;">'+
                                            '<div class="progress push-down-5" style="height:12px;">'+
                                                '<div class="progress-bar progress-bar-striped progress-bar-success active" role="progressbar" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100" style="width: 0%;line-height:12px;">0%</div>'+
                                            '</div>'+
                                        '</div>'+
                                    '</div>');
                $btn.parent().after($progress);
				
				var stop = false;
				function fileDialogComplete(files) {
					var allowformat = $element.attr("allowformat");
					if(allowformat!=""&&allowformat!=undefined){
						$(files).each(function(j,k){
							var flag = false;
							var format = k.name.substring(k.name.lastIndexOf(".")+1,k.name.length);
							$(allowformat.split(",")).each(function(i,o){
				                      if(format==o||(format+"_")==o||format.toLowerCase()==o||(format.toLowerCase()+"_")==o){
				                    	  flag = flag || "true";
				                      }
							})
							if(!flag){
								stop = true;
								alert(format+"类型的文件不允许被上传！支持上传的文件格式有："+allowformat.replace(/_/g,''));
							}else{
								stop = false;
							}
						})
					}else{
						stop = false;
					}
					var numFilesSelected = files.length;
					var haveSaved = $element.find("span[action='newAffix']").size();
					if(!stop && (haveSaved+numFilesSelected>parseInt(filesTotalLimit))) {
						stop = true;
						alert("上传文件总数不能超过"+filesTotalLimit+"个。");
					}
					if (!stop && numFilesSelected != 0 && parseInt(filesTotalLimit) > haveSaved) {
						if(numFilesSelected > parseInt(filesOneceLimit)) {
							stop = true;
							alert("每批最多上传"+filesOneceLimit+"个附件");
						}
					}
					if(!stop){
						var maxSize = parseInt(filesSizeLimit)*1000000;
						var excessFile = "";
						for(var i=0;i<numFilesSelected;i++){
							var file = files[i];
							if(file.size && file.size>maxSize){
								excessFile = excessFile+file.name+",";
							}
						}
						if(excessFile.length>0){
							stop = true;
							alert(excessFile.substring(0,excessFile.length-1)+" 不可超过"+filesSizeLimit+"MB");
						}
					}
				}
				function uploadSuccess(file, serverData) {
					var json=serverData; 
					var id = file.id;
					var type = file.type;
					var name = file.name;
					var relative_path=json.relative_path;
					var officeonline = json.office_online;
					var pan_path = json.pan_path;
					var file_new_name=json.file_new_name;
					var newurl=relative_path+file_new_name;//新文件名字
					var encodeName=encodeURIComponent(name);//文件原名
					var newurl = relative_path + file_new_name;
					var file_size = Number(json.file_size);
					var Str = "<span class = 'bar push-up-3' action='newAffix' id='" + id + "' name='after_insert' "
								+ " file_size='"+file_size+"'"
								+ " relative_path='"+relative_path+"'"
								+ " file_new_name='"+file_new_name+"'"
								+ " newurl='"+newurl+"'"
								+ " encodeName='"+encodeName+"'"
								+" style='margin-right:20px;'>"
								+"<b style='margin:-2px 3px 0 0px;height:20px;' class='"
								+ fixFileTypeIcon(type)
								+ "'></b>"
								+ "<a target='_blank' href='"+WEBAPP+"/formParser?status=fileUpload&action=filedownload&fileName="+encodeName+"&filePath="+newurl+"' class='annex_link text-primary'>"
								+name+"</a>"
								if(!disabled){
									Str = Str+ "  <a style='color:#0099CC' file_id='"
									+ id
									+ "' onclick='RepeatorWidgets.uploader.delFile(this);'><font size='3'>(×移除)</font></a>";
								}
					String.prototype.endWith = function(endStr){
						var d=this.length-endStr.length;
						return (d>=0&&this.lastIndexOf(endStr)==d);
					};
					if(officeonline!=null && officeonline!="" && officeonline!="false"){
						if(file_new_name.endWith(".doc") || file_new_name.endWith(".docx") || file_new_name.endWith(".xls") || file_new_name.endWith(".xlsx") || file_new_name.endWith(".ppt") || file_new_name.endWith(".pptx") ){
							Str = Str + "<a style='color:#0099CC' href='"+ WEBAPP + "/officePreviewRedirect?filename=" + name +"&filepath=" + newurl +"' target='_blank' rel='nofollow'><font size='3'>（@在线预览）</font></a>";
						}
					}

					if(file_new_name.endWith(".pdf")){
						Str = Str +"<a style='color:#0099CC' href='"+WEBAPP+"/resource/pdfjs/web/viewer.html?file="+WEBAPP+"/"+newurl+"' target='_blank'><font size='3'>（@在线预览）</font></a>";
					}
					if(file_new_name.endWith(".txt")){
						Str = Str +"<a style='color:#0099CC' onClick=showTxt('"+newurl+"') target='_blank'><font size='3'>（@在线预览）</font></a>";
					}
					if(file_new_name.endWith(".png")||file_new_name.endWith(".jpg")||file_new_name.endWith(".jpeg")){
						Str = Str +"<a  imgViewerOne='imgViewerOne' url='"+newurl+"' title='"+file_new_name+"' style='color:#0099CC' target='_blank'><font size='3'>（@在线预览）</font></a>";
					}
					$element.append(Str+"</span>");
				}
				var hash = parent.location.hash;
				var serviceIdApply = Util.getHash(hash, "serveID", "");
				var serviceIdTask = Util.getHash(hash, "service_id", "");
				var serviceId = (serviceIdApply == "" || serviceIdApply == undefined) ? serviceIdTask : serviceIdApply;
				var url = WEBAPP+'/formParser?status=fileUpload&action=fileupload&serviceId='+serviceId;
				$btn.fileupload({
			        url: url,
			        dataType: 'json',
			        disabled:disabled,
			        autoUpload: true,
			        singleFileUploads:false,
			        sequentialUploads:true,
			        forceIframeTransport:false,
			        multipart:true,
			        maxFileSize: parseInt(filesSizeLimit)*1000000,
			        disableImageResize: /Android(?!.*Chrome)|Opera/
			            .test(window.navigator.userAgent),
			        disableImagePreview:true,
			        progressall:function (e, data) {
                        var $progress = $("[name='progress']",$element);
                        $progress.show();
                        var percent = parseInt(data.loaded / data.total * 100, 10)+"%";
                        $("[role='progressbar']",$progress).text(percent).css("width",percent);
                        if(data.total==data.loaded){
                            setTimeout(function() {
                                $progress.hide();
                                $("[role='progressbar']",$progress).text("0%").css("width","0%");
                            }, 1000);
                        }
                    }
			    }).on('fileuploadadd', function (e, data) {
			    	fileDialogComplete(data.files,0,0);
			    }).on('fileuploadsubmit', function (e, data) {
			    	if(stop){
			    		return false;
			    	}
			    }).on('fileuploaddone', function (e, data) {
			    	var result = data.result;
			    	if(result.success){
			    		var file_new_name_Array = [];
			    		var file_old_name_Array = [];
			    		var file_size_Array = [];
    		            var file_relative_path_Array = [];
			    		if(result.file_new_name){
			    			file_new_name_Array = result.file_new_name.split(",");
			    		}
			    		if(result.file_old_name){
			    			file_old_name_Array = result.file_old_name.split(",");
			    		}
			    		if(result.file_size){
			    			file_size_Array = result.file_size.split(",");
			    		}
			    		if(result.relative_path){
                            file_relative_path_Array = result.relative_path.split(",");
                        }
			    		var office_online = result.office_online;
			    		var pan_path = result.pan_path;
			        	$.each(data.files, function (index, file) {
			        		var serverData={};
			        		serverData.file_new_name = file_new_name_Array[index];
			        		serverData.file_old_name = file_old_name_Array[index];
			        		serverData.relative_path = file_relative_path_Array[index];
			        		serverData.office_online = office_online;
			        		serverData.pan_path = pan_path;
			        		serverData.file_size = file_size_Array[index];
			        		file.id=Math.getUuid("fileupload",25,32);
							if(uploaderType==="picture"){
				               	var galleryClass = "";
				            	if(IsPC()){
				            		galleryClass = "gallery-item";
				            	}else{
				            	    galleryClass = "gallery-item active";
				            	}
				            	var imgId = Math.getUuid("img",25,32);
				            	if(disabled){
				            		$("#"+btnId+"_imageContainer").append('<a class="'+galleryClass+'" size="'+serverData.file_size+'" id="'+file.id+'"  title="'+
						            		  serverData.file_old_name+'"><div class="image"><img imgViewer="imgViewer" id = "'+imgId+'" src="'+serverData.relative_path+serverData.file_new_name+'" alt="'+
						            		  serverData.file_old_name+'"/></div></a>');
				            	}else{
				            		$("#"+btnId+"_imageContainer").append('<a class="'+galleryClass+'" size="'+serverData.file_size+'" id="'+file.id+'"  title="'+
				                  		  serverData.file_old_name+'"><div class="image"><img imgViewer="imgViewer" id="'+imgId+'" src="'+serverData.relative_path+serverData.file_new_name+'" alt="'+
				                  		  serverData.file_old_name+'"/><ul class="gallery-item-controls"><li><span class="gallery-item-remove" onclick="RepeatorWidgets.uploader.delPic(this);"><i class="fa fa-times"></i></span></li></ul></div></a>');
				            	}
			            		$("#"+btnId+"_imageContainer",window.parent.document).append('<li><img id="'+imgId+'"  data-original="'+serverData.relative_path+serverData.file_new_name+'" src="'+serverData.relative_path+serverData.file_new_name+'" alt="'+serverData.file_old_name+'"></li>');
							}else{
				            	uploadSuccess(file,serverData);
							}
							RepeatorWidgets.uploader.collectData($element,repeator);
							RepeatorWidgets.qtipChange.call($element[0],'uploader');
			            });
			    	}else{
			    		alert(result.result);
			    	}
			    }).on('fileuploadfail', function (e, data) {
			        $.each(data.files, function (index) {
			            alert(data.files[index].name+" 上传失败！");
			        });
			    }).prop('disabled', !$.support.fileInput || disabled).parent().addClass(!$.support.fileInput || disabled ? 'disabled' : undefined);
				if($element.attr("notnull") == "true" && !disabled){
					$element.append('<span eletype="notnullspan" class="notnull" style="width:10px;height:15px;display:inline-block;margin-left:6px;"></span>');
				}
				if(repeator.editable){
                	//监听控件notnull属性的变化。如果新增了notnull属性，则.addClass("notnull")；如果删除了notnull属性，则.removeClass("notnull")；
                    var targetNode = $element[0];
                    var options = { attributes: true, childList: false,subtree:false,attributeOldValue:true};
                    function callback(mutationsList, observer) {
                    	mutationsList.forEach(function(record) {
                        	if(record.attributeName=="notnull"){
                        	// 如果发生变化的属性是notnull
                        		if($(record.target).attr("notnull") == "true" && $(record.target).attr("editable") != "false" && $(record.target).find("[eletype='notnullspan']").length == 0){
                        			//如果notnull为true了，并且当前不是“不可编辑”的，并且当前没有红色*的span
                        			$(record.target).append('<span eletype="notnullspan" class="notnull" style="width:10px;height:15px;display:inline-block;margin-left:6px;"></span>');
                        		}else if(($(record.target).attr("notnull") == undefined || $(record.target).attr("notnull") != "true")&& $(record.target).find("[eletype='notnullspan']").length == 1){
                        			//（如果notnull属性不存在，或者notnull属性不等于true）并且红色*的span存在
                        			$(record.target).find("[eletype='notnullspan']").remove();
                        		}
                        	}
                       });
                    }
                    if(navigator.userAgent.toLowerCase().indexOf("msie") == -1){
                    	var mutationObserver = new MutationObserver(callback);
                    	mutationObserver.observe(targetNode, options);
                    }
                    //监听上传控件notnull属性的变化end
                }
			},
			readOnly:function($element){//改为只读状态
				$element.find(".fileinput-button").remove();
			},
			bindData:function($element,value){//控件绑定值
			    if(value == undefined){
			        value = "";
			    }
				var up_ids = value.split(";");
				var repeator = $element.parents("[dojoType='unieap.repeating.repeator']").data('FormWidget');
				var rowSet = repeator.uploadFilesDataStore.getRowSet();
				var rows = rowSet.getData(3);
				$(up_ids).each(function(i,o){
					$(rows).each(function(j,k){
						if(k.up_id===o){
				    	    var file_name = decodeURIComponent(k.up_encodeName);
				    	    if($element.attr('uploaderType')!='picture'){
								var Str = "<span class = 'bar push-up-3' action='newAffix' id='" + k.up_id + "' name='after_insert' "
								+ " file_size='"+k.file_size+"'"
								+ " newurl='"+k.up_newurl+"'"
								+ " encodeName='"+k.up_encodeName+"'"
								+" style='margin-right:20px;'>"
								+"<b style='margin:-2px 3px 0 0px;height:20px;' class='"
								+ fixFileTypeIcon(k.file_type)
								+ "'></b>"
								+ "<a target='_blank' href='"+WEBAPP+"/formParser?status=fileUpload&action=filedownload&fileName="+k.up_encodeName+"&filePath="+k.up_newurl+"' class='annex_link text-primary'>"
								+ file_name +"</a>"
								if(repeator.editable){
									Str = Str+ "  <a style='color:#0099CC' file_id='"
									+ k.up_id
									+ "' onclick='RepeatorWidgets.uploader.delFile(this);'><font size='3'>(×移除)</font></a>";
								}
								String.prototype.endWith = function(endStr){
									var d=this.length-endStr.length;
									return (d>=0&&this.lastIndexOf(endStr)==d);
								};
								if(k.office_online!=null && k.office_online!="" && k.office_online!="false"){
									if(file_name.endWith(".doc") || file_name.endWith(".docx") || file_name.endWith(".xls") || file_name.endWith(".xlsx") || file_name.endWith(".ppt") || file_name.endWith(".pptx") ){
										Str = Str + "<a style='color:#0099CC' href='"+ WEBAPP + "/officePreviewRedirect?filename=" + file_name +"&filepath=" + k.up_newurl +"' target='_blank' rel='nofollow'><font size='3'>（@在线预览）</font></a>";
									}
								}
			
								if(file_name.endWith(".pdf")){
									Str = Str +"<a style='color:#0099CC' href='"+WEBAPP+"/resource/pdfjs/web/viewer.html?file="+WEBAPP+"/"+k.up_newurl+"' target='_blank'><font size='3'>（@在线预览）</font></a>";
								}
								if(file_name.endWith(".txt")){
									Str = Str +"<a style='color:#0099CC' onClick=showTxt('"+k.up_newurl+"') target='_blank'><font size='3'>（@在线预览）</font></a>";
								}
								if(file_name.endWith(".png")||file_name.endWith(".jpg")||file_name.endWith(".jpeg")){
									Str = Str +"<a  imgViewerOne='imgViewerOne' url='"+k.up_newurl+"' title='"+file_name+"' style='color:#0099CC' target='_blank'><font size='3'>（@在线预览）</font></a>";
								}
								$element.append(Str+"</span>");
				    	    }else{
				               	var galleryClass = "";
				            	if(IsPC()){
				            		galleryClass = "gallery-item";
				            	}else{
				            	    galleryClass = "gallery-item active";
				            	}
				            	var imgId = Math.getUuid("img",25,32);
				            	var btnId = $element.find("input[type='file']").attr("id");
				            	if(!repeator.editable){
				            		$("#"+btnId+"_imageContainer").append('<a class="'+galleryClass+'" size="'+k.file_size+'" id="'+k.up_id+'"  title="'+
						            		  file_name+'"><div class="image"><img imgViewer="imgViewer" id = "'+imgId+'" src="'+k.up_newurl+'" alt="'+
						            		  file_name+'"/></div></a>');
				            	}else{
				            		$("#"+btnId+"_imageContainer").append('<a class="'+galleryClass+'" size="'+k.file_size+'" id="'+k.up_id+'"  title="'+
				                  		  file_name+'"><div class="image"><img imgViewer="imgViewer" id="'+imgId+'" src="'+k.up_newurl+'" alt="'+
				                  		  file_name+'"/><ul class="gallery-item-controls"><li><span class="gallery-item-remove" onclick="RepeatorWidgets.uploader.delPic(this);"><i class="fa fa-times"></i></span></li></ul></div></a>');
				            	}
			            		$("#"+btnId+"_imageContainer",window.parent.document).append('<li><img id="'+imgId+'"  data-original="'+k.up_newurl+'" src="'+k.up_newurl+'" alt="'+file_name+'"></li>');
				    	    }
						}
					})
				})
			},
			validate:function($element){//校验
				var result={ok:true,message:"",name:$element.attr("name")};
				if($element.attr('notnull')==='true'&&$element.find('.gallery-item,[action="newAffix"]').length<=0){
						result.ok=false;
						result.message="此项不能为空";
				}
				return result;
			},
			collectData:function($element,repeator){
				var count = $element.parents('[node="node"]').attr("count");
				var key = $element.attr("column");
				var rowid = Number(count)-1;
				var pk_id = repeator.dataStore.getRowSet().getRowData(rowid,"primary").pk_id;
				//从dc中删除该行附件
				var upRowSet = repeator.uploadFilesDataStore.getRowSet();
				var upRows = upRowSet.getData(3);
				for(var i=upRows.length-1;i>=0;i--){
					if(upRows[i].column_name===key&&upRows[i].row_id===pk_id){
						upRowSet.deleteRow(i);
					}
				}
				var file_ids = [];
				var type = $element.attr("uploadertype");
				if(type!="picture"){
					$element.find("[action='newAffix']").each(function(i,o){
						var $o = $(o);
						file_ids.push($o.attr("id"));
						var fileRow = {
								row_id:pk_id,
								up_id:$o.attr("id"),
								column_name:key,
								file_type:'url',
								up_encodeName:$o.attr("encodename"),
								file_size:$o.attr("file_size"),
								up_newurl:$o.attr("newurl"),
						}
						upRowSet.addRow(fileRow,false,false);//增加datastore数据
					})
				}else{
					$element.find(".gallery-item").each(function(i,o){
						var $o = $(o);
						file_ids.push($o.attr("id"));
						var fileRow = {
								row_id:pk_id,
								up_id:$o.attr("id"),
								column_name:key,
								file_type:'url',
								up_encodeName:encodeURIComponent($o.attr("title")),
								file_size:$o.attr("size"),
								up_newurl:$o.find("img").attr("src"),
						}
						upRowSet.addRow(fileRow,false,false);//增加datastore数据
					})
				}
				var value = file_ids.join(";");
				RepeatorWidgets.updateRow(key,value,rowid,repeator);			
			},
			delPic:function(element){
                var $element = $(element).parents("[repeatortype='uploader']");
                var repeator = $(element).parents("[dojotype='unieap.repeating.repeator']").data("FormWidget");
                $(element).parents(".gallery-item").remove();
				RepeatorWidgets.uploader.collectData($element,repeator);
				RepeatorWidgets.qtipChange.call($element[0],'uploader');
			},
			delFile:function(element){
                var $element = $(element).parents("[repeatortype='uploader']");
                var repeator = $(element).parents("[dojotype='unieap.repeating.repeator']").data("FormWidget");
                $(element).parents("span").remove();
				RepeatorWidgets.uploader.collectData($element,repeator);
				RepeatorWidgets.qtipChange.call($element[0],'uploader');
			}
		},
		dategroup:{//日期组控件
            render:function($element,repeator){//控件渲染
                if(Util.getClientInfo()==="PC"){
                    elementUtil.renderDategroupRepeator($element,repeator);
                }else{
                    $("[name='start_time']",$element).attr("onfocus","this.blur();");//禁止ios端点击日期框后，日期框获取到焦点
                    $("[name='end_time']",$element).attr("onfocus","this.blur();");//禁止ios端点击日期框后，日期框获取到焦点
                    $element.on("click",function(){
                         var widget = $(this).data("widget");
                          widget.vm.$data.show=true;
                          if(widget.start_time&&widget.end_time){
                             widget.vm.$data.defaultDate=[new Date(widget.start_time.replace(/-/g, '/')),new Date(widget.end_time.replace(/-/g, '/'))];
                          }
                    });
                    var widgetObj = {};
                    widgetObj.vmId=Math.getUuid("vantdate",25,32);
                    widgetObj.type="vant";
                    var position = "";
                    position = "bottom";
                    $("body",parent.window.document).append('<div name="date_vant" id="'+widgetObj.vmId+'"><van-calendar v-model="show" :min-date="minDate" :max-date="maxDate" :default-date="defaultDate" type="range" @confirm="onConfirm"  position="'+position+'"/></div>');//渲染vue标签到父页面
                    var now = new Date();
                    widgetObj.vm= new parent.Vue({//挂载
                               el:"#"+widgetObj.vmId,
                               data:{
                                         show: false,
                                         date:'',
                                         element:$element,
                                          minDate: new Date(now.getFullYear()-1, 0, 1),
                                          maxDate: new Date(now.getFullYear()+2, 11, 31),
                                          defaultDate : [now,new Date(now.getTime()+24*60*60*1000)]
                               },
                               methods: {
                                 onConfirm:function(date) {
                                    var start = date[0];
                                    var end = date[1];
                                    this.show = false;
                                    var startText = Util.dateFormatter(start,'yyyy-MM-dd');
                                    var endText = Util.dateFormatter(end,'yyyy-MM-dd');
                                    this.element.find("[name='start_time']").val(startText);
                                    this.element.find("[name='end_time']").val(endText);
                                    var widget = this.element.data("widget");
                                    widget.start_time = startText;
                                    widget.end_time = endText;
                                    RepeatorWidgets.dategroup.collectData(this.element,repeator);
                                    RepeatorWidgets.qtipChange.call(this.element,'dategroup');
                                 },
                               },
                    })
                    $element.data("widget",widgetObj);
                }
                $element.after('<div class="" style="width:10px;height:30px;position:absolute;top:calc(50% - 15px);right: 12px;"></div>');
                if($element.attr("notnull")==='true' && repeator.editable){
                   $element.addClass("notnull");
                   $element.next().addClass("notnull");
                }
                if(repeator.editable){
                    //监听控件notnull属性的变化。如果新增了notnull属性，则.addClass("notnull")；如果删除了notnull属性，则.removeClass("notnull")；
                     var targetNode = $element[0];
                     var options = { attributes: true, childList: false,subtree:false,attributeOldValue:true};
                     function callback(mutationsList, observer) {
                        mutationsList.forEach(function(record) {
                            if(record.attributeName=="notnull"){
                            // 如果发生变化的属性是notnull
                                if($(record.target).attr("notnull") == "true"){
                                    //如果notnull为true了，并且当前不是“disabled”的，addClass("notnull");
                                    $(record.target).next().addClass("notnull");
                                }else if($(record.target).attr("notnull") == undefined){
                                    //如果notnull属性不存在，removeClass("notnull");
                                    $(record.target).next().removeClass("notnull");
                                }
                            }
                        });
                     }
                     if(navigator.userAgent.toLowerCase().indexOf("msie") == -1){
                        var mutationObserver = new MutationObserver(callback);
                        mutationObserver.observe(targetNode, options);
                     }
                     //监听上传控件notnull属性的变化end
                 }
            },
            readOnly:function($element){//改为只读状态
                $element.off("click");
                var widgetObj = $element.data("widget");
                $("#"+widgetObj.vmId).hide();
                $element.show();
            },
            bindData:function($element,value){//控件绑定值
                if(!Util.isNotEmpty(value)){
                    value = ";";
                }
                var times = value.split(";");
                $element.find("[name='start_time']").val(times[0]);
                $element.find("[name='end_time']").val(times[1]);
                var widget = $element.data("widget");
                widget.start_time = times[0];
                widget.end_time = times[1];
                if(widget.type=="elementui"){
                    if(Util.isNotEmpty(widget.vm)){
                        widget.vm.value = [widget.start_time,widget.end_time];
                    }
                }
            },
            validate:function($element){//校验
                var result={ok:true,message:"",name:$element.attr("name")};
                var start_time = $element.find("[name='start_time']").val();
                 var end_time = $element.find("[name='end_time']").val();
                if($element.attr('notnull')==='true'){
                    if(!start_time||!end_time){
                        result.ok=false;
                        result.message="此项不能为空";
                    }
                }
                return result;
            },
            getValidateElement:function($element){
                var widgetObj = $element.data("widget",widgetObj);
                if(widgetObj=="elementui"){
                    return $("#"+widgetObj.vmId);
                }else{
                    return null;
                }
            },
            collectData:function($element,repeator){//控件
                var key = $element.attr("column");
                 var start_time = $element.find("[name='start_time']").val();
                 var end_time = $element.find("[name='end_time']").val();
                 var value = start_time+";"+end_time;
                var count = $element.parents('[node="node"]').attr("count");
                RepeatorWidgets.updateRow(key,value,Number(count)-1,repeator);
                RepeatorWidgets.updateRow(key+"_START",start_time,Number(count)-1,repeator);
                RepeatorWidgets.updateRow(key+"_END",end_time,Number(count)-1,repeator);
            }
        }
}