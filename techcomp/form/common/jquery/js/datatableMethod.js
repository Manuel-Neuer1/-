var enable_qtip = 'true';
var DataTableUtil = {
		html2Escape:function (sHtml) { 
			 return sHtml.replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];}); 
		} ,
		escape2Html:function (str) { 
			 var arrEntities={'lt':'<','gt':'>','nbsp':' ','amp':'&','quot':'"'}; 
			 return str.replace(/&(lt|gt|nbsp|amp|quot);/ig,function(all,t){return arrEntities[t];}); 
		},
		dateToStr:function(miles,format){
            var value = miles==undefined?'':miles;
            var regPos = /^[1-9][0-9]*$/; // 非负整数
            var regNeg = /^\-[1-9][0-9]*$/; // 负整数
            var all_date = "";
            if(regPos.test(value) || regNeg.test(value)){
                var miles = Number(value);
                // 服务器端时区，北京东八区（-8*60）
                var timezone = -480;
                // 客户端实际时区(例如东京为东九区：-540)
                var offsetGMT = new Date(miles).getTimezoneOffset();
                // 计算差值
                var adjust = timezone - offsetGMT;
                miles = miles - adjust * 60 * 1000;
                var time = new Date(miles);
                all_date = Util.dateFormatter(time,format||"yyyy-MM-dd");
            }else{
               all_date = value;
            }
            return all_date==""?value:all_date;
		},
		upload : function(params){
			var hash = parent.location.hash;
			var serviceIdApply = Util.getHash(hash, "serveID", "");
			var serviceIdTask = Util.getHash(hash, "service_id", "");
			var serviceId = (serviceIdApply == "" || serviceIdApply == undefined) ? serviceIdTask : serviceIdApply;
			//初始化上传控件
		    var uploader = new parent.WebUploader.create({
				// 选完文件后，是否自动上传。
			    auto: true,
		    	pick: "#"+params.domId,
		        accept: {
		            title: 'affix_file',
		            extensions: params.allowFormat.replace(/_/g,'')
		        },
		        // swf文件路径
		        swf: WEBAPP+'/techcomp/form/common/swfupload/swfupload/swfupload.swf',
		        //文件路径
		        server: WEBAPP+'/formParser?status=fileUpload&action=fileupload&type='+params.fileSaveType+'&serviceId='+serviceId,
		        //数量
//		        fileNumLimit: params.fileLimitNum,
		        //总大小
		        //fileSizeLimit: 50 * 1024 * 1024,
		        //单大小
		        fileSingleSizeLimit: Number(params.fileLimitSize) * 1024 * 1024 ,  
		        formData : {
		        	allowSize : Number(params.fileLimitSize) * 1024 * 1024,  
		        	allowSuffix : params.allowFormat.replace(/_/g,'')
		        } ,
		        duplicate : true 
		    });
            // 文件上传过程中创建进度条实时显示。
            uploader.on( 'uploadProgress', function( file, percentage ) {
                var $progress = $("[name='progress']",window.parent.document);
                $("[name='filename']",$progress).text(file.name);
                $progress.show();
                var percent = parseInt(percentage*100,10)+"%";
                $("[role='progressbar']",$progress).text(percent).css("width",percent);
                if(percentage==1){
                    $progress.hide();
                    $("[name='filename']",$progress).text("");
                    $("[role='progressbar']",$progress).text("0%").css("width","0%");
                }
            });
			//上传服务器	
			uploader.on( 'uploadSuccess', function( file ,response) {
			       if(response.success){
			    	    var up_encodeName = encodeURIComponent(response.file_old_name);
						var newurl=response.relative_path+response.file_new_name;
			   	    	$("#"+params.recieveId,window.parent.document).append( '<div class="bar" up_newurl="'+newurl+'" file_size="'+response.file_size+'" up_encodeName="'+up_encodeName+'" file_type="'+params.fileSaveType+'" column_name="'+params.domId+'" column_text="'+params.domName+'" up_id="'+Math.getUuid("fileupload",25,32)+'" >' +
			   	    		'<span name="uploadFile"  filename="' + file.name + '" class="tz-accessory pull-left text-overflow" style="background:none;width:auto;padding-right: 30px;position: relative;max-width: 100%;">' +
			   	    		'<i class="pull-left glyphicon glyphicon-paperclip push-up-7 push-right-10"></i>'+
			   	    		'<a target="_blank" href="' + newurl +'" download="'+ file.name +'">' + file.name + '</a>'+
			   	    		'<span class="fa fa-trash-o" name="del_grid_file" style="cursor: pointer;position: absolute;right: 10px;top: 7px;"></span></span></div>');
			       }else{
			    	   $("#"+params.recieveId,window.parent.document).append( '<div class="bar"><a class="tz-accessory pull-left" style="background:none;width:auto;">' +
			   	    		'<i class="glyphicon glyphicon-paperclip push-right-10"></i>'+
			   	            '<span>' + file.name + '</span>'+
			   	            '<font color="red">上传失败</font>'+
			   	            '<i class="fa fa-trash-o push-left-10 push-up-20" name="del_grid_file"></i>'+
			   	            '</a></div>');
			       }
			});
			//提示信息
			uploader.on( 'error', function(code) {
				if(code == "Q_EXCEED_NUM_LIMIT"){
					Msg.error("添加的文件个数最多"+params.fileLimitNum+"个 ！");
				}else if (code == "Q_TYPE_DENIED"){
					Msg.error("文件类型错误！");
				}else if(code == "F_EXCEED_SIZE"){
					Msg.error("添加的文件单个大小超过"+params.fileLimitSize+"M！");
				}
			});
            uploader.on( 'uploadError', function(file) {
                  Msg.error("文件"+file.name+"上传失败！");
            });
			uploader.count=0;
			uploader.on( 'beforeFileQueued', function(file) {
				if(!params.fileLimitNum){
					return true;
				}
				this.count++;
				if(this.count+$("#"+params.recieveId,window.parent.document).find('[name="uploadFile"]').length>Number(params.fileLimitNum)){
					Msg.error("添加的文件个数最多"+params.fileLimitNum+"个 ！");
					return false;
				}
			});
			uploader.on( 'filesQueued', function(files) {
				$('#'+params.domId+'-error',window.parent.document).remove();
				this.count=0;
			});
			return uploader;
		},
		renderFilesLayer : function(upload_ids,self){
			if(!upload_ids){
				Msg.warning("无附件！");
				return;
			}
			var layer = $('	<div class="modal-dialog  push-up-0 push-down-0 push-left-0 push-right-0" style="max-width:380px"  >'+
					'<div class="modal-content modal-content-noborder">'+
					'<div class="modal-header">'+			
						'<h4 class="modal-title">附件详细</h4>'+
					'</div>'+
					'<div class="modal-body" style="overflow:auto;">'+
						'<div class="responsive-padding-box form-horizontal">'+
							'<div class="table-responsive amost-datatable-box push-up-5" style="overflow:auto;">'+
								'<table class="amost-datatable" style="width:100%;">'+
									'<thead>'+
										'<tr>'+
											'<th>附件名称</th>'+
											'<th style="min-width:80px;max-width:80px;">操作</th>'+
										'</tr>'+
									'</thead>'+
									'<tbody>'+
										
									'</tbody>'+
								'</table>'+
							'</div>'+
						'</div>'+
					'</div>'+
					'<div class="modal-footer">'+
						'<button type="button"  name="closeFiles" class="btn btn-primary pull-right">确定</button>'+
						'<button type="button" name="closeFiles"  class="btn btn-default pull-left">取消</button>'+
					'</div>'+
				'</div>'+
			'</div>');
			var rowSet = self.uploadFilesDataStore.getRowSet();
			var rows = rowSet.getData(3);
			var $tbody = layer.find('tbody');
			$(upload_ids.split(";")).each(function(j,k){
				$(rows).each(function(m,n){
					if(n.up_id===k){
			    	    var file_name = decodeURIComponent(n.up_encodeName);
			    	    var url = WEBAPP+'/formParser?status=fileUpload&action=filedownload&fileName='+n.up_encodeName+'&filePath='+n.up_newurl;
			    	    $tbody.append('<tr><td><b>附件名称</b><span>'+file_name+'</span></td><td><b>操作</b><span><a class="fa fa-download" href="'+DataTableUtil.html2Escape(url)+'" title="下载" name="download">下载</a></span></td></tr>')
					}
				})
			})
			layer.find()
			Msg.open({
				title:false,
				type: 1,
				closeBtn: 0,
				maxWidth: 1200,
				content: layer.html(),
				success: function(layero, index){
					$("[name='closeFiles']",window.parent.document).off("click").on("click",function(){
						parent.layer.close(index);
					})
				}
			})
		},
		valueSelect:function($element){
            var invalue = $element.attr("invalue");
            if(invalue!=undefined&&invalue!=""){
                if($element.attr("multiple")){//多选下拉赋值
                    var invalueArr = invalue.split(";");
                    $element.selectpicker("val",invalueArr);
                }else{
                    $element.selectpicker("val",invalue);
                }
            }else{
                $element.selectpicker("val",null);
            }
		},
		//控件联动触发事件
        cascadeEvent:function(){
        	var currElementId=$(this).attr("name");
        	var value=this.value;
        	value=value.replace(/\%/g,"%25"); //转义！！！！！！！
        	value=value.replace(/\#/g,"%23");
        	value=value.replace(/\&/g,"%26");
        	value=value.replace(/\+/g,"%2B");
        	value=value.replace(/\ /g,"%20");
        	var presetbind = $(this).attr('presetdatabind');
        	if(presetbind){
        		var jsonData = dataCenter && dataCenter.toJson?dataCenter.toJson():String(dataCenter || "");
        		var bindName = presetbind.split(".")[1];
        		var entityName = presetbind.split(".")[0];
        		var url = WEBAPP + '/formParser?status=preset' + '&presetbind='
        				+ entityName + '&' + bindName + '=' + value;
        		var renderDataFunc = function(results) {
        			var data = results;
        			$('[presetdatabind*="'+entityName+'"]',parent.window.document).each(function() {
        				if($(this).attr("name")!=currElementId){
        					var bindData=eval("("+JSON.stringify(data[0])+")");
        					var widgettype = $(this).attr('widgettype');
        					if(bindData){
        						var presetbind = $(this).attr('presetdatabind')
        						var entityId = presetbind.split(".")[0]
        						var name = presetbind.split(".")[1]
        						if (entityId == entityName) {
                                    if(widgettype=="date"){
                                        if(results.length<=1){
                                                $(this).val(DataTableUtil.dateToStr(bindData[name],$(this).attr("format")));
                                        }else{
                                                $(this).val("");
                                        }
                                    }
        							else if(widgettype=="select"){
                                        if(results.length==1){
                                                if($(this).attr("multiple")){//多选下拉赋值
                                                    var invalueArr = bindData[name].split(";");
                                                    $(this).selectpicker("val",invalueArr);
                                                }else{
                                                    $(this).selectpicker("val",bindData[name]);
                                                }
                                        }else{
                                                $(this).selectpicker("val",null);
                                        }
        							}else{
                                        if(results.length<=1){
                                                $(this).val(bindData[name]);
                                        }else{
                                                $(this).val("");
                                        }
        							}
        						}
        					}else{
        						//this.value="";
        						if(widgettype=="select"){
        							$(this).selectpicker("val",null);
        						}else{
        							$(this).val("");
        						}
        					}
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
          //建立级联关联事件
          buildcascade:function($element) {
            var id =$element.attr("name");
            var cascadeWidgets=$("[cascadewidgetid='"+id+"']",parent.window.document);
            if(cascadeWidgets.length==0)
              return;
            $element.change(function(){
              var parentVal = this.value;
              for(var i=cascadeWidgets.length-1,comboBox;comboBox=cascadeWidgets[i];i--){
                DataTableUtil.cascadeQueryData($(comboBox),$element.attr("presetbind") ,parentVal);
              };
            });
          },
          //级联查询codeList
          cascadeQueryData:function($comboBox,parentType ,parentValue){
            var type = $comboBox.attr("presetbind");
            var oriType = type.substring(0, type.lastIndexOf("_"));
            var oriParentType = parentType.substring(0, parentType.lastIndexOf("_"));
            if(oriType!=oriParentType){//若绑定的不是一个codetype则取子下拉的
               parentType = oriType+'_'+(Number(type.substring(oriType.length+1, type.length))-1);
            }
            var params = {
              codelist_parentType : parentType ,
              codelist_parentValue: parentValue
            };
            var dataItemArray = DataTableUtil.queryCodes(params,$comboBox.attr("az")==="true");
            var height =$comboBox.height();
            DataTableUtil.initMenu($comboBox,dataItemArray);
            $comboBox.selectpicker('refresh');
            if(dataItemArray.length>0){
                DataTableUtil.valueSelect($comboBox);
                $comboBox.attr("invalue","");
            }
            //级联查询重新绑定数据后,触发change事件，为绑定了联动查询的控件赋值
            setTimeout(function(){
                $comboBox.trigger('change');
             },100);
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
		renderLayer : function(type,area,self,index,$datatabletr){
		    var title,callbacksOnPop;
		    if(type===1){
				title = '修改数据';
				callbacksOnPop=self.onEditPagePop;
			}else if(type===0){
				title = '新增数据';
				callbacksOnPop=self.onAddPagePop;
			}
			var boxMaxHeight = $(window.parent).height() - 200;
			var layer = $('<div>'+
				     '<div class="modal-dialog push-up-0 push-down-0 push-left-0 push-right-0" style="min-width: 320px;">'+
				      '<div class="modal-content modal-content-noborder">'+
				        '<div class="modal-header">'+
				          '<h4 class="modal-title">'+
				              title+
				          '</h4>'+
				        '</div>'+
				        '<div class="modal-body" style="max-height:' + boxMaxHeight + 'px;overflow:auto;">'+
				          '<div class="form-horizontal push-up-5 push-down-5 bar">'+
				            '<form id="layerForm">'+
				               '<div class="bar" name="content">'+
				               '</div>'+
				            '</form>'+
				          '</div>'+
				        '</div>'+
				        '<div class="modal-footer">'+
				          '<button class="btn btn-default pull-left" name = "cancel" type="button">取消'+
				          '</button>'+
				          '<button class="btn btn-primary pull-right" name = "ok" type="button">确定'+
				          '</button>'+
				        '</div>'+
				      '</div>'+
				    '</div>'+
				    '</div>');
		
		var model =$('<div class="form-group">'+
		                  '<label class="col-md-3 col-xs-12 control-label text-align"></label>'+
		                  '<div class="col-md-8 col-xs-12 push-down-0 must-inter-box notranslate">'+
		                  '</div>'+
		               '</div>');
		
		var layerContent = layer.find("[name='content']");
		$(self.totalInfo).each(function(i,o){
			if(o.visible=='true'){
				var thisModel = model.clone();
				thisModel.find('.control-label').text(o.text+"：");
				switch(o.showtype){
					case 'select':
						var widget = $('<select ispreset="'+(o.presetdatabind&&o.presetdatabind!='no'?'true':'false')+'" isquery="'+o.presetdatabindisquery+'" presetdatabind="'+o.presetdatabind+'" widgettype="select" presettype = "'+o.presettype+'" presetbind = "'+o.presetbind+'" isquerykey = "'+o.isquerykey+'" cascadeWidgetId = "'+o.cascadeWidgetId+'" id = "'+o.dataBind+'" name = "'+o.dataBind+'" class="col-md-12 padding-none select select-dropdown-fixed" '+ (o.editable!='true' ? ' disabled':'') + (o.notnull=='true' ? ' required="true"':'') + (o.isSearch=='true' ? ' data-live-search="true"':'') + (o.isMulti=='true' ? ' data-multiple-select="true" multiple':'') + (o.az=='true' ? ' az="true" ':'') +'><select>')
						if(o.isMulti!="true"){
						    widget.append('<option value = "" initial="-">请选择</option>');
						}
						$(o.comboboxshowvalue.split(';')).each(function(i,o){
						    var splited = o.split(':');
							if(splited.length===3){//AZ
                                widget.append('<option value="'+splited[0]+'" initial="'+splited[2]+'">'+ splited[1] +'</option>')
							}else{
							    widget.append('<option value="'+splited[0]+'">'+ o.substring(o.indexOf(':')+1,o.length)+'</option>')
							}
						})
						break;
					case 'text':
						var widget = $('<input ispreset="'+(o.presetdatabind&&o.presetdatabind!='no'?'true':'false')+'"  isquery="'+o.presetdatabindisquery+'" presetdatabind="'+o.presetdatabind+'" widgettype="text"  maxlength = "'+o.datalength+'" id = "'+o.dataBind+'" name = "'+o.dataBind+'" class = "form-control" '+ (o.editable!='true' ? 'disabled':'') + (o.notnull=='true' ? ' required="true"':'') + (o.placeholder ? (' placeholder="'+o.placeholder+'" '):'') + (o.customReg ? (' customReg="'+o.customReg+'" '):'') +'>');
						switch (o.validateType){
						  case 'number':
							  widget.attr("digits","true");
							  break;
						  case 'identityCard':
							  widget.attr("CARD_ID","true");
							  break;
						  case 'email':
							  widget.attr("email","true");
							  break;
						  case 'mobilePhone':
							  widget.attr("mobilePhone","true");
							  break;
						  case 'customReg':
							  jQuery.validator.addMethod(o.dataBind+"_v", function(value, element) {  
									var mreg = eval(unescape($(element).attr("customReg")));
									return this.optional(element) ||(mreg.test(value));  
							  }, "不符合规则"); 
							  widget.attr(o.dataBind+"_v","true");
							  break;
							  
						}
						break;
					case 'autoComplete':
						var widget = $('<input autocomplete="off" automatictp="true" hidecode="true" aria-required="true"  aria-invalid="true" name = "'+o.dataBind+'" id = "'+o.dataBind+'" dataprovider="'+o.presetbind+'" class = "form-control" '+ (o.editable!='true' ? 'disabled':'') + (o.notnull=='true' ? ' required="true"':'') + (o.placeholder ? (' placeholder="'+o.placeholder+'" '):'') +'action = "'+WEBAPP+'/fp/Uniformcommon/autoInput">');
						break;
					case 'date':
						var widget = $('<input  ispreset="'+(o.presetdatabind&&o.presetdatabind!='no'?'true':'false')+'" format="'+o.format+'" isquery="'+o.presetdatabindisquery+'" presetdatabind="'+o.presetdatabind+'" widgettype="date"  id="'+o.dataBind+'" name = "'+o.dataBind+'" class = "form-control datepicker" style="background-image: url(\'././techcomp/form/workflow/themes/default/images/form/date.gif\');background-repeat:no-repeat;background-position:98.5% center" readonly' + (o.notnull=='true' ? ' required="true"':'') +'>');
						
						if(o.editable=='true'){
							var dateTimeFormat = o.format;
							if(!dateTimeFormat){//若都没配置，默认是yyyy-mm-dd格式
								dateTimeFormat = "yyyy-MM-dd";
							}
							if(self.isPC){//电脑端 my97
								widget.attr('onclick','WdatePicker({oncleared:function(){document.getElementById("formIframe").contentWindow.$(this).trigger("change")},onpicked:function(){document.getElementById("formIframe").contentWindow.$(this).trigger("change")},readOnly:true,dateFmt:"'+dateTimeFormat+'"})');
							}else{
								widget.attr('dateTimeFormat',dateTimeFormat);
								widget.attr('vantDate','vantDate');
							}
						}
						
						break;
					case 'textarea':
						var widget = $('<textarea ispreset="'+(o.presetdatabind&&o.presetdatabind!='no'?'true':'false')+'"  isquery="'+o.presetdatabindisquery+'" presetdatabind="'+o.presetdatabind+'" widgettype="textarea"  maxlength = "'+o.datalength+'" id = "'+o.dataBind+'" name = "'+o.dataBind+'" class = "form-control" style="resize:none;"'+ (o.editable!='true' ? 'disabled':'') + (o.notnull=='true' ? ' required="true"':'') + (o.placeholder ? (' placeholder="'+o.placeholder+'" '):'') + ' rows="' + (o.rows ? o.rows :'3') +'" >');
						break;
					case 'uploadFiles':
						var widget = $('<div name="'+o.dataBind+'" id="'+o.dataBind+'" uploader="uploader" fileLimitSize="'+o.fileLimitSize+'" fileSaveType="'+o.fileSaveType+'" fileLimitNum="'+o.fileLimitNum+'" allowFormat="'+o.allowFormat+'"  class="mobile-padding-0"><button class="btn btn-default" '+(o.editable!='true' ? 'disabled':'') +' type="button">上传本地文件</button></div>');
						break;
				}
				if(o.notnull=='true'){
					thisModel.find('.must-inter-box').append(widget).append('<span class="must-inter-star">*</span>');
				}else{
					thisModel.find('.must-inter-box').append(widget);
				}
				if (type===1) {
					$datatabletr.find("span").each(function(j,k){//渲染已键入的值
						if($(k).attr("key")==o.dataBind){
							if($(k).attr("type")=="mapping"){
								widget.attr("invalue",$(k).attr("value"));
								widget.attr("intext",$(k).text());
							}else if($(k).attr("type")=="non-mapping"){
								widget.attr("invalue",$(k).text());
							}else if($(k).attr("type")=="full-mapping"){
								widget.attr("invalue",$(k).attr("value"));
								widget.attr("intext",$(k).text());
							}else if($(k).attr("type")=="upload"){
								widget.attr("upload_ids",$(k).attr("upload_ids"));
							}
						}
					})
				}
				layerContent.append(thisModel);
			}
		})
		layerContent.append("<div style='display:none;' name='info' gridid='"+area.attr("id")+"' rowid='"+(index-1)+"'></div>");
//		var winH = $("body",parent.window.document).height();
//		layer.find(".modal-body").css("max-height",winH - 120);
		//弹出新增数据层
			Msg.open({
				title:false,
				type: 1,
				closeBtn: 0,
				maxWidth: 1200,
				content: layer.html(),
				success: function(layero, index){
					$(".layui-layer-shade",window.parent.document).css("z-index","1000");
					$(".layui-layer",window.parent.document).css("z-index","1001");//layui的index太高了。。会导致日期被盖在下面
					$("select",window.parent.document).selectpicker();
					var isMobile = (Util.getClientInfo()!="PC");
					$("select",window.parent.document).each(function(i,o){
					    var $o = $(o);
						$o.selectpicker("val",null);
						if($o.attr("isquerykey")==="true"){
						    DataTableUtil.buildcascade($o);
						}
						if(isMobile){
						   $o.renderMobileSelect($o.attr("az")==='true');
						}

					})
                    $("[isquery='true']",window.parent.document).each(function(i,o){
                        var $o = $(o);
                        $o.on("change",DataTableUtil.cascadeEvent);
                    })
					$("[uploader='uploader']",window.parent.document).each(function(i,o){
						var params = {
								domId:$(o).attr("id"),
								domName:$(o).attr("name"),
								allowFormat:$(o).attr("allowFormat"),
								fileLimitSize:$(o).attr("fileLimitSize"),
								fileLimitNum:$(o).attr("fileLimitNum"),
								fileSaveType:$(o).attr("fileSaveType"),
								recieveId:$(o).attr("id")+"_recieve"
						}
						$(o).after('<div fileNotNull="true" id="'+params.recieveId+'" class="bar push-up-0 tz-details" style="padding-top:0!important;"></div>');
                        var $progress = $('<div class="bar push-up-10" name="progress" style="display:none;">'+
                                                '<div name="filename"></div>'+
                                                '<div style="max-width: 200px;">'+
                                                    '<div class="progress push-down-5" style="height:12px;">'+
                                                        '<div class="progress-bar progress-bar-striped progress-bar-success active" role="progressbar" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100" style="width: 0%;line-height:12px;">0%</div>'+
                                                    '</div>'+
                                                '</div>'+
                                            '</div>');
                        $(o).after($progress);
						if(!$(o).find("button").is(":disabled")){
							var uploadObj = DataTableUtil.upload(params);
						}
						if(type===1){//将已上传的文件初始化
							var upload_ids = $(o).attr("upload_ids");
							if(upload_ids){
								var rowSet = self.uploadFilesDataStore.getRowSet();
								var rows = rowSet.getData(3);
								$(upload_ids.split(";")).each(function(j,k){
									$(rows).each(function(m,n){
										if(n.up_id===k){
								    	    var file_name = decodeURIComponent(n.up_encodeName);
								   	    	$("#"+params.recieveId,window.parent.document).append( '<div class="bar" up_newurl="'+n.up_newurl+'" file_size="'+n.file_size+'" up_encodeName="'+n.up_encodeName+'" file_type="'+n.file_type+'" column_name="'+n.column_name+'" column_text="'+n.column_text+'" up_id="'+n.up_id+'" >' +
								   	    		'<span name="uploadFile"  filename="' + file_name + '" class="tz-accessory pull-left text-overflow" style="background:none;width:auto;padding-right: 30px;position: relative;max-width: 100%;">' +
								   	    		'<i class="pull-left glyphicon glyphicon-paperclip push-up-7 push-right-10"></i>'+
								   	    		'<a target="_blank" href="' + n.up_newurl +'" download="'+ file_name +'">' + file_name + '</a>'+
								   	    		'<span class="fa fa-trash-o" name="del_grid_file" style="cursor: pointer;position: absolute;right: 10px;top: 7px;"></span></span></div>');
										}
									})
								})
							}
						}
					})
	                if (type===1) {
						$("select",window.parent.document).each(function(i,o){
							DataTableUtil.valueSelect($(o));
						})
						$("select[isquerykey='true']",window.parent.document).each(function(i,o){
						    var $o = $(o);
						    if(!$o.attr("cascadeWidgetId")){
						       $o.trigger("change");
						    }
						});
						$("input,textarea",window.parent.document).each(function(i,o){
							var isAc = $(o).attr("automatictp")=="true";
							var name = $(o).attr("name");
							var invalue = $(o).attr("invalue");
							if(isAc){//输入联想
								 $(o).after('<input type="hidden" name="'+name+'_code">');
								 var param = {};
								 param.presetKey = $(this).attr("dataprovider");
								 param.procinstId = dataCenter.getParameter("SYS_FK");
						         Util.autocompleteFp($(this),null,param);
                                 if(Util.getClientInfo()!="PC"){
                                    $(this).renderMobileAutocomplete(false,param);
                                 }
							}
							if(invalue!=undefined&&invalue!=""){
								if(isAc){
									$(o).val($(o).attr("intext"));
									$(o).attr("real-value",invalue);
									$("input[name='"+name+"_code']",layero).val(invalue);
								}else{
									$(o).val(invalue);
								}
							}
						})
					}else if(type===0){
						$("input[automatictp='true']",window.parent.document).each(function(i,o){//初始化输入联想
							 var name = $(o).attr("name");
							 $(o).after('<input type="hidden" name="'+name+'_code">');
							 var param = {};
							 param.presetKey = $(this).attr("dataprovider");
							 param.procinstId = dataCenter.getParameter("SYS_FK");
						     Util.autocompleteFp($(this),null,param);
                             if(Util.getClientInfo()!="PC"){
                                $(this).renderMobileAutocomplete(false,param);
                             }
						})
						var entityArray = [];
//						var presetInfoArray = [];
						//处理预置数据，避免重复查询
						$("[ispreset='true']",window.parent.document).each(function(i,o){
                              	var presetbind = $(o).attr('presetdatabind');
                              	if(presetbind){
                              		var entityName = presetbind.split(".")[0];
                              		if(entityArray.indexOf(entityName)<0){
                              		     entityArray.push(entityName);
                              		}
                              	}
						})
						$(entityArray).each(function(i,o){
                                var url = WEBAPP + '/formParser?status=preset';
                                var params={};
                                params.formid = dataCenter.getParameter("formid");
                                params.procinstid = dataCenter.getParameter("SYS_FK");
                                params.workitemid = dataCenter.getParameter("workitemid");
                                params.presetbind = o;
				        	    $.ajax({
				        	      url : url,
				        	      async: false,
				        	      type : 'post',
				        	      data : params,
				        	      dataType : 'json',
				        	      success : function(results){
				        	         if(results.length===1){
				        	             var data = results[0];
				        	             $('[presetdatabind*="'+o+'"]',parent.window.document).each(function(m,n) {
				        	                var $n = $(n);
				        	                var presetbind = $n.attr('presetdatabind');
                                            if(presetbind){
                                                var presetValue = data[presetbind.split('.')[1]];
                                                var widgettype = $n.attr("widgettype");
                                                if(widgettype=="date"){
                                                    $n.val(DataTableUtil.dateToStr(presetValue,$n.attr("format")));
                                                }else if(widgettype=="select"){
                                                	$n.attr("presetvalue",presetValue);
                                                    if($n.attr("multiple")){//多选下拉赋值
                                                        var invalueArr = presetValue.split(";");
                                                        $n.selectpicker("val",invalueArr);
                                                    }else{
                                                        $n.selectpicker("val",presetValue);
                                                    }
                                                    if($n.attr("cascadewidgetid")){
                                                        $n.attr("invalue",presetValue);
                                                    }else{
                                                        $n.trigger("change");
                                                    }
                                                }else{
                                                    $n.val(presetValue);
                                                }
                                            }
				        	             })
				        	         }
				        	      }
				        	    });
						})

					}
					//渲染vant
					$("input[vantDate='vantDate']",window.parent.document).each(function(i,o){
					    renderVantDate($(o));
					})
					$('[name="ok"]',layero).off("click").on("click",function () {
						var flag = true;
						if(!$("#layerForm",window.parent.document).validate().form()){
							flag = false;
						}
						$(self.totalInfo).each(function(i,o){
						    var value = $("[name='"+o.dataBind+"']",layero).val();
						    if( value!=undefined && value!=null && value.indexOf("<script")!=-1 && value.indexOf("<img")!=-1){
						        Msg.error("禁止输入Javascript标签");
						        flag = false;
						    }
						});
						var newRow = {};
						$(self.totalInfo).each(function(i,o){
							if(o.visible=='true'){
								if(o.showtype=="autoComplete"){
									var $autocomplete = $("[name='"+o.dataBind+"']",layero);
									var value = $("[name='"+o.dataBind+"_code']",layero).val();
									var text = $autocomplete.val();
									value = value==undefined?"":value;
									text = text==undefined?"":text;
									if(value==""&&text!=""){
										flag = false;
										$('#'+o.dataBind+'-error',layero).remove();
										$autocomplete.removeClass("valid");
										$autocomplete.removeClass("error");
										$autocomplete.addClass("error");
										$autocomplete.after('<label id="'+o.dataBind+'-error" class="error" for="'+o.dataBind+'">只能选择系统选项，请搜索选择系统值</label>');
										$autocomplete.off("blur").on("blur",function(){
											if($('input [name="'+$(this).attr("name")+'_code"]').val()){
												$(this).removeClass("error");
												$(this).next('lable #'+o.dataBind+'-error').remove();
											}
										})
									}
									var key = o.dataBind;
									newRow[key]=value;
									newRow[key+'_TEXT']=text;
								}else if(o.showtype=="select"){
									var $select = $("[name='"+o.dataBind+"']",layero);
									var value = $select.val();
									value = value==undefined?"":value;
									var key = o.dataBind;
									var text = "";
									if( Array.isArray(value)){
										newRow[key] = value.join(";");
										$select.find("option:selected").each(function(i,o){
											if(i==0){
												text = $(o).text();
											}else{
												text =text + "," + $(o).text();
											}
										})
									} else{
										newRow[key]=value;
										text = $select.find("option:selected").text();
									}
									newRow[key+"_TEXT"]=text;
								}else if(o.showtype=="uploadFiles"){
									var $fileRecieve = $("#"+o.dataBind+"_recieve",layero);
									var file_ids = [];
									$fileRecieve.find("[name='uploadFile']").each(function(j,k){
										file_ids.push($(k).parent().attr("up_id"));
									})
									if(o.notnull=="true"){
										if(file_ids.length==0){
											flag=false;
											$('#'+o.dataBind+'-error',layero).remove();
											$fileRecieve.after('<label id="'+o.dataBind+'-error" class="error" for="'+o.dataBind+'">必须上传</label>');
										}
									}
									newRow[o.dataBind]=file_ids.join(";");
								}else{
									var value = $("[name='"+o.dataBind+"']",layero).val();
									value = value==undefined?"":value;
									var key = o.dataBind;
									newRow[key]=value;
								}
							}
						})
						if(!flag){
							return;
						}
						if(type===1){
							var rowid = $(this).parent().prev().find("[name='info']").attr("rowid");
							var oldRowData = self.dataStore.getRowSet().getRowData(rowid,"primary");
							var callbacksBefore=self.beforeUpdateDT;
							for( var indexCall in callbacksBefore){//回调事件
								if(callbacksBefore[indexCall](oldRowData,newRow,rowid)==false){
									return;
								}
							}
							
							var idName = self.primaryKeyValue;
							if(!newRow[idName]){ //添加主键ID
								newRow[idName]=oldRowData[idName];
							}
							area.datatableUpdate(rowid,newRow);//更新页面内容
							
							//从dc中删除该行附件
							var rowSet = self.uploadFilesDataStore.getRowSet();
							var rows = rowSet.getData(3);
							for(var i=rows.length-1;i>=0;i--){
								if(rows[i].row_id===newRow[idName]){
									rowSet.deleteRow(i);
								}
							}
							//将附件写入dc
							$("[name='uploadFile']",window.parent.document).each(function(i,o){
								var fileDom = $(o).parent();
								var fileRow = {
										row_id:newRow[idName],
										up_id:fileDom.attr("up_id"),
										column_name:fileDom.attr("column_name"),
										file_type:fileDom.attr("file_type"),
										up_encodeName:fileDom.attr("up_encodeName"),
										file_size:fileDom.attr("file_size"),
										up_newurl:fileDom.attr("up_newurl"),
                                        column_text:fileDom.attr("column_text")
								}
								rowSet.addRow(fileRow,false,false);//增加datastore数据
							})
							var callbacksAfter=self.afterUpdateDT;
							for( var indexCall in callbacksAfter){//回调事件
								if(callbacksAfter[indexCall](oldRowData,newRow,rowid)==false){
									return;
								}
							}
						}else if(type===0){
							var callbacksBefore=self.beforeAddDT;
							for( var indexCall in callbacksBefore){//添加前回调事件
								if(callbacksBefore[indexCall](newRow,self.count)==false){
									return;
								}
							}
							
							var idName = self.primaryKeyValue;
							if(!newRow[idName]){ //添加主键ID
								newRow[idName]=Math.getUuid("rowid",25,32);
							}
							area.datatableAdd(newRow);//增加页面数据
							
							//将附件写入dc
							$("[name='uploadFile']",window.parent.document).each(function(i,o){
								var fileDom = $(o).parent();
								var fileRow = {
										row_id:newRow[idName],
										up_id:fileDom.attr("up_id"),
										column_name:fileDom.attr("column_name"),
										file_type:fileDom.attr("file_type"),
										up_encodeName:fileDom.attr("up_encodeName"),
										file_size:fileDom.attr("file_size"),
										up_newurl:fileDom.attr("up_newurl"),
										column_text:fileDom.attr("column_text")
								}
								var rowSet = self.uploadFilesDataStore.getRowSet();
								rowSet.addRow(fileRow,false,false);//增加datastore数据
							})
							var callbacksAfter=self.afterAddDT;
							for( var indexCall in callbacksAfter){//添加后回调事件
								if(callbacksAfter[indexCall](newRow,self.count-1)==false){
									return;
								}
							}
						}
						
						parent.layer.close(index);
					});
					$('[name="cancel"]',layero).off("click").on("click",function () {
						parent.layer.close(index);
					});
					
					for( var indexCall in callbacksOnPop){//回调事件
						if(callbacksOnPop[indexCall].call(area[0],$(layero))==false){
							parent.layer.close(index);
						}
					}
				}
			});
	}
};
$(document).off("click","[name='datatableEdit'],[name='fixedtableEdit']").on("click","[name='datatableEdit'],[name='fixedtableEdit']",function(){//绑定编辑按钮事件
    var index = $(this).parent().parent().parent().parent().children().index($(this).parent().parent().parent());
    var $datatable = $(this).parents(".responsive-padding-box").find(".amost-datatable:eq(0)");
    // var $fixedtable = $(this).parents(".responsive-padding-box").find(".amost-datatable:eq(1)");
    var $datatabletr = $datatable.find("tbody tr").eq(index);
    var area = $(this).parents(".responsive-padding-box").prev();
    var self = area.data("FormWidget");
    DataTableUtil.renderLayer(1,area,self,index,$datatabletr);

});
$(document).off("click","[name='datatableDel'],[name='fixedtableDel']").on("click","[name='datatableDel'],[name='fixedtableDel']",function(){//绑定删除按钮事件
      var rowid = $(this).parent().parent().parent().parent().children(":visible").index($(this).parent().parent().parent());
      var area = $(this).parents(".responsive-padding-box").prev();
      Msg.confirm("确认是否删除该记录？",function(){
		  var self = area.data("FormWidget");
		  var callbacksBefore=self.beforeDelDT;
		  for( var indexCall in callbacksBefore){//回调事件
			  if(callbacksBefore[indexCall]([rowid])==false){
				  return;
			  }
		  }
		  area.datatableDel([rowid]);//删除页面数据
		  
		  var callbacksAfter=self.afterDelDT;
		  for( var index in callbacksAfter){
			  callbacksAfter[index]();
		  }
      });
});
$(window.parent.document).off("click","[name='del_grid_file']").on("click","[name='del_grid_file']",function(){
	$(this).parent().remove();
});
$.fn.datatable =  function() {
			var isReadOnly = this.data("FormWidget").isReadOnly;//配置只读
			var canEdit = this.data("FormWidget").canEdit;//授权可编辑
			var canAdd = !(this.attr("canAdd")=='false');//可新增
			var isDelRight = !(this.attr("isDelRight")=='false');//右侧删除按钮
			var isEditRight = !(this.attr("isEditRight")=='false');//右侧编辑按钮
			var isCheck = !(this.attr("isCheck")=='false');//是否可选择
			var isDelLeft = !(this.attr("isDelLeft")=='false');//左上角删除按钮
			var showRowNum = !(this.attr("showRowNum")=='false');
			//渲染表头开始
			var allContain = $('<div class="responsive-padding-box form-horizontal"></div>');
			var btnContain = $('<div class="swiper-btngroup col-md-7 col-sm-7 col-xs-7 padding-none push-down-10 push-up-5" style="width:auto;"><div class="link_btn_bar swiper-container-btn swiper-container-horizontal" style="width: auto;"><div class="swiper-wrapper"></div></div></div>');
			var btnBox = btnContain.find(".swiper-wrapper").eq(0);
			var fixedcol = $('<div class="bar amost-datatable-fixedcol"></div>');
			var almostTableBox = $('<div class="amost-datatable-box"></div>');
			var fixedTableBox = $('<div class="fixed-col-datatable-box" style="width:125px;"></div>');
			var almostTable= $('<table class="amost-datatable" style="width:auto;table-layout: fixed;" id="'+this.attr("id")+'_datatable"></table>');
			var fixedTable= $('<table class="amost-datatable" style="width:100%;" id="'+this.attr("id")+'_fixedtable"><thead><tr><th style="width:124px;">操作</th></tr></thead><tbody></tbody></table>');
			var thead = $('<thead></thead>');
			var tbody = $('<tbody></tbody>');
			var tr = $('<tr></tr>');
			thead.append(tr);
			almostTable.append(thead);
			almostTable.append(tbody);
			visiblecolNum = 0;
			if(isCheck){
				visiblecolNum++;
			    tr.append('<th width="65"><input type="checkbox" name = "datatable-check-all" class="push-up-0"></th>');
				tr.find('[name = "datatable-check-all"]').on("click",function(){
					if($(this).is(":checked")){
						$(this).parents("table:eq(0)").find("[name='datatable-check']").prop("checked","checked");
					}else{
						$(this).parents("table:eq(0)").find("[name='datatable-check']").prop("checked","");
					}
				})
			}
			if(showRowNum){
				visiblecolNum++;
				tr.append('<th>序号</th>');
			}
			//渲染列
			$(this.data("FormWidget").totalInfo).each(function(i,o){
				if(o.visible=='true'){
					tr.append('<th>'+o.text+'</th>');
					visiblecolNum++;
				}else{
					tr.append('<th style="display:none;">'+o.text+'</th>');
				}
			})
			almostTableBox.append(almostTable);
			fixedTableBox.append(fixedTable);
			fixedcol.append(almostTableBox);
			if(!isReadOnly&&canEdit&&(isDelRight||isEditRight)){//不能删除且不能添加则不显示操作列
				tr.append('<th style="min-width:125px;width:125px" sign="operate">操作</th>');
				fixedcol.append(fixedTableBox);
				visiblecolNum++;
			}
			tbody.append('<tr name="empty_tr" style="height: 40px;"><td colspan="'+visiblecolNum+'" class="dataTables_empty" valign="top">无数据</td></tr>');
			fixedTable.find("tbody:eq(0)").append('<tr name="empty_tr" style="height: 40px;"><td class="dataTables_empty" valign="top"></td></tr>');
			allContain.append(btnContain).append(fixedcol);
			this.after(allContain);
			//渲染表头结束
			//渲染按钮事件开始
			if(!isReadOnly&&canEdit){
				if(canAdd){//左上角新增按钮
					var addBtn = $('<a href="JavaScript:;" class="link_btn swiper-slide swiper-slide-active"><i class="fa fa-plus "></i>新增</a>');
								btnBox.append(addBtn);
								addBtn.on('click',function(){
									var area =$(this).parents(".responsive-padding-box").prev();
									var self = area.data("FormWidget");
									if(self.count>=self.maxRowNum){
										Msg.error("该表格限制最大行数为"+self.maxRowNum+"，不可再添加！");
										return;
									}
									DataTableUtil.renderLayer(0,area,self);
								})
				}
				if(isDelLeft){
					var delBtn = $('<a href="JavaScript:;" class="link_btn swiper-slide swiper-slide-active"><i class="fa fa-trash-o"></i>删除</a>');
									btnBox.append(delBtn);
									delBtn.on('click',function(){
										var area = $(this).parents(".responsive-padding-box").prev();
										Msg.confirm("确认是否删除所选记录？",function(){
											var self = area.data("FormWidget");
											var deleteRows = [];
											var num = 0;
											area.next().find("[name='datatable-check']").each(function(i,o){
												if($(o).is(":checked")){
													deleteRows[num]=i;
													num++;
												}
											})
											
											var callbacksBefore=self.beforeDelDT;
											for( var indexCall in callbacksBefore){//添加前回调事件
												if(callbacksBefore[indexCall](deleteRows)==false){
													return;
												}
											}
											
						
											area.datatableDel(deleteRows);//删除页面数据
											
											var callbacksAfter=self.afterDelDT;
											for( var indexCall in callbacksAfter){//添加前回调事件
												if(callbacksAfter[indexCall](deleteRows)==false){
													return;
												}
											}
									})
					})
				}
			}
}
$.fn.datatableAdd  =  function(newRow,isImport,notAddDc) {
    if(!Util.isNotEmpty(newRow.pk_id)){
        newRow.pk_id = Math.getUuid("rowid",25,32);
    }
	var gridid = this.attr("id");
	var self = this.data("FormWidget");
	var isDelRight = !(this.attr("isDelRight")=='false');//右侧删除按钮
	var isEditRight = !(this.attr("isEditRight")=='false');//右侧编辑按钮
	var isCheck = !(this.attr("isCheck")=='false');//是否可选择
	var showRowNum = !(this.attr("showRowNum")=='false');
	$(this).next().find(".dataTables_empty").parent().hide();//缺省行干掉
	$tr = $("<tr></tr>");
	$("#"+gridid+"_datatable").find("tbody").append($tr);
	if(isCheck){
	    $tr.append('<td><b>选取</b><span><input type="checkbox"  name = "datatable-check" class="push-up-7"></span></td>');
	}
	if(showRowNum){
		$tr.append('<td><b>序号</b><span serial="serial">'+(self.count+1)+'</span></td>');
	}
	$(self.totalInfo).each(function(i,o){
		var $td = $("<td></td>");
		$tr.append($td);
		var key = o.dataBind;
		if(o.showtype=="autoComplete"){
			$td.append('<b>'+o.text+'</b><span key="'+key+'" type="full-mapping" value="'+(newRow[key]==undefined?'':newRow[key])+'">'+(newRow[key+'_TEXT']==undefined?'':newRow[key+'_TEXT'])+'</span>');
		}else if(o.showtype=="select"){
			var text = "";
			if(isImport){
				$(o.comboboxshowvalue.split(';')).each(function(j,k){
					var value = k.substring(k.indexOf(':')+1,k.length);
					if(value==newRow[key]){
						text = value;
						newRow[key] = k.split(':')[0];
					}
				})
			}else{
	     		  if(newRow[key+"_TEXT"]){
	     			  	text = newRow[key+"_TEXT"];
	 		      }else{
		 			    var textArr = [];
					    $(o.comboboxshowvalue.split(';')).each(function(j,k){
					    	if(newRow[key]!=undefined && newRow[key]!=null && newRow[key]!= ""){
					    		$(newRow[key].split(";")).each(function(m,n){
									if(k.split(':')[0]==n){
										textArr.push(k.substring(k.indexOf(':')+1,k.length));
									}
							   });
					    	}
						})
						text = textArr.join(",");
				  }
			}
			$td.append('<b>'+o.text+'</b><span key="'+key+'" type="mapping" value="'+(newRow[key]==undefined?'':newRow[key])+'" tablestr = "'+o.comboboxshowvalue+'">'+(text==undefined?'':text)+'</span>');
		}else if(o.showtype=="date"){
			$td.append('<b>'+o.text+'</b><span key="'+key+'" type="non-mapping">'+DataTableUtil.dateToStr(newRow[key],o.format)+'</span>');
		}else if(o.showtype=="uploadFiles"){
            $td.append('<b>'+o.text+'</b><span key="'+key+'" title="查看" '+(newRow[key]?'':'style="display:none;" ' )+'upload_ids="'+newRow[key]+'" type="upload"><a style="float:none"><li class="fa fa-eye push-right-5 push-up-0"></li>查看附件</a></span>');
            $td.find("a").on('click',function(){
                DataTableUtil.renderFilesLayer($(this).parent().attr('upload_ids'),self);
            })
		}else{
			$td.append('<b>'+o.text+'</b><span key="'+key+'" type="non-mapping">'+(newRow[key]==undefined?'':newRow[key])+'</span>');
		}
		if(o.visible!='true'){
			$td.hide();
		}
	})
	if(!self.isReadOnly&&self.canEdit){
		var $fixedTbody = $("#"+gridid+"_fixedtable").find("tbody");
		if(self.isPreReadOnly&&newRow[self.primaryKeyValue].substring(0,3)=="pre"){
			if(isDelRight||isEditRight){
				$tr.append('<td sign="operate"><b>操作</b></td>');
				$fixedTbody.append('<tr><td><b>操作</b></td></tr>');
			}
		}else{
			var editText ="";
			var delText = "";
			if(document.body.scrollWidth<=767){
				editText = "修改";
				delText = "删除";
			}
			if(isDelRight||isEditRight){
				$tr.append('<td sign="operate"><b>操作</b><span></span></td>');
				$fixedTbody.append('<tr><td><b>操作</b><span></span></td></tr>');
				if(isEditRight){
					$tr.find('td[sign="operate"]').find('span').append('<a class="btn btn-default push-right-10 fa fa-edit" href="JavaScript:;" title="修改" name="datatableEdit"> '+editText+'</a>');
					$fixedTbody.children('tr:last-child').find('span').append('<a class="fa fa-edit push-right-10 fz-14" href="JavaScript:;" title="修改" name="fixedtableEdit">'+editText+'</a>');
				}
				if(isDelRight){
					$tr.find('td[sign="operate"]').find('span').append('<a class="btn btn-default fa fa-trash-o" href="JavaScript:;" title="删除" name="datatableDel"> '+delText+'</a>');
					$fixedTbody.children('tr:last-child').find('span').append('<a class="fa fa-trash-o fz-14" href="JavaScript:;" title="删除" name="fixedtableDel">'+delText+'</a>');
				}
			}
		}
	}
	
    if(!notAddDc){
    	self.dataStore.getRowSet().addRow(newRow,false,false);//增加datastore数据
    }
	self.count++;
}
$.fn.datatableDel  =  function(rowids) {
	var gridid = $(this).attr("id");
	var self = $(this).data("FormWidget");
	var $datatable = $("#"+gridid+"_datatable");
	var $fixedtable =$("#"+gridid+"_fixedtable");
	var arrayDel = new Array();
	$(rowids).each(function(i,o){
	    if(self.isPreReadOnly&&$datatable.find("tbody tr:visible").eq(rowids[i]).find("span[key='"+self.primaryKeyValue+"']").eq(0).text().substring(0,3)=="pre"){
	    	Msg.warning("预置数据不可删除！");
	    }else{
			arrayDel.push($datatable.find("tbody tr:visible").eq(rowids[i]));
			arrayDel.push($fixedtable.find("tbody tr:visible").eq(rowids[i]));
	    }
	})
	$(arrayDel).each(function(i,o){
		o.remove();
	})
	$datatable.find("tbody tr:visible").each(function(i,o){//编号重序
		$(o).find("span[serial='serial']").text(i+1);
	})
    if($datatable.find("tbody tr:visible").length==0){
  	  $datatable.find(".dataTables_empty").parent().show();
  	  $fixedtable.find(".dataTables_empty").parent().show();
    }
	
	for(var i=rowids.length-1;i>=0;i--){
		if(!self.isPreReadOnly||self.dataStore.getRowSet().getData('primary')[rowids[i]][self.primaryKeyValue].substring(0,3)!="pre"){
			var pk_id = self.dataStore.getRowSet().getRowData(rowids[i],"primary").pk_id;
			self.dataStore.getRowSet().deleteRow(rowids[i]);
			self.count--;
			//从dc中删除该行附件
			var rowSet = self.uploadFilesDataStore.getRowSet();
			var rows = rowSet.getData(3);
			for(var j=rows.length-1;j>=0;j--){
				if(rows[j].row_id===pk_id){
					rowSet.deleteRow(j);
				}
			}
		}
	}
}
$.fn.datatableUpdate  =  function(rowid,newRow) {
	var self = $(this).data("FormWidget");
	var gridid = $(this).attr("id");
	var $datatable = $("#"+gridid+"_datatable");
	$oldtr = $datatable.find("tbody tr:visible").eq(rowid);
	$oldtr.find("span").each(function(i,o){
		   var key = $(o).attr("key");
		   var type = $(o).attr("type");
           if(newRow[key]!=undefined){
        	   if(type=="mapping"){
        		   var tablestr = $(o).attr("tablestr");
        		   var text = "";
        		   if(newRow[key+"_TEXT"]){
        			   text = newRow[key+"_TEXT"];
        		   }else{
        			   var textArr = [];
					   $(tablestr.split(';')).each(function(j,k){
						   $(newRow[key].split(";")).each(function(m,n){
								if(k.split(':')[0]==n){
									textArr.push(k.substring(k.indexOf(':')+1,k.length));
								}
						   })
					   })
					   text = textArr.join(",");
        		   }
        		   $(o).text(text);
				   $(o).attr("value",newRow[key]);
        	   }else if (type=="non-mapping"){
        		   $(o).text(newRow[key]);
        	   }else if (type=="full-mapping"){
        		   $(o).attr("value",newRow[key]);
				   $(o).text(newRow[key+"_TEXT"]);
        	   }else if (type=="upload"){
        	       if(newRow[key]){
        		        $(o).attr("upload_ids",newRow[key]);
        		        $(o).show();
        	       }else{
        	            $(o).hide();
        	       }
        	   }
           }
	})
	var rowSet = self.dataStore.getRowSet();//更新datastore
	var oldRowData = rowSet.getRowData(rowid,"primary");
	var newRowData=$.extend({},oldRowData,newRow);
	var newRowObj = new unieap.ds.Row(null,newRowData,0);
	rowSet.updateRow(rowid,newRowObj);
	for(var i=0;i<self.primaryKeys.length;i++){
		if(self.primaryKeys[i]==newRowData[self.primaryKeyValue]){//只有对原有查询出来的行修改才是修改，对于添加后再修改的行仍然是新增
			rowSet.getRow(rowid).setRowStatus(3);
			break;
		}
	}
}
$.fn.getDataIDsDT  =  function() {
	var gridid = $(this).attr("id");
	var $datatable = $("#"+gridid+"_datatable");
	var rowids=[];
	$datatable.find("tbody tr[name!='empty_tr']:visible").each(function(i,o){
		rowids[i]=i;
	})
	return rowids;
}