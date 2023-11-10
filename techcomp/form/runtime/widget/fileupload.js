WebForm.widget("unieap.uploader.uploader",WebForm.FormWidget,{
	_uploaderdiv:null,// 获取整个dom节点
	_id:null,
	_btnName:null,
	_uploaderType:null,
	_uploaderName:null,
	_filesSizeLimit:null,
	_filesOneceLimit:null,
	_filesTotalLimit:null,
	_editable:true,
	web_office:false,
	_create:function(fk_id){
	    fk_id = fk_id?fk_id:dataCenter.getParameter("SYS_FK");
		this._uploaderdiv =this.element;
		this._id = this._uploaderdiv.attr("id");
		var id = this._id;
		var uploaderName = this._uploaderdiv.attr("uploaderName");
		this._uploaderName = uploaderName;
		var saveRecord = this._uploaderdiv.attr("saveRecord");
		this.id=this.element.attr("id");
		this._btnName = this._uploaderdiv.attr("btnName");
		this._uploaderType = this._uploaderdiv.attr("uploaderType");
		this._filesSizeLimit = this._uploaderdiv.attr("filesSizeLimit");
		this._filesOneceLimit = this._uploaderdiv.attr("filesOneceLimit");
		this._filesTotalLimit = this._uploaderdiv.attr("filesTotalLimit");
		$("[dojotype='unieap.form.Form']").append('<div class="blueimp-gallery blueimp-gallery-controls" id="blueimp-gallery" style="height:100%;"><div class="slides"></div><h3 class="title"></h3><a class="prev">‹</a> <a class="next">›</a> <a class="close">×</a><ol class="indicator"></ol></div>')
		if(this._uploaderdiv.attr("editable")=="false"){
			this._editable = false;
		}
    	var editable = this._editable;
		if(this._uploaderType!="picture"){
			createFileUpload(fk_id,this,saveRecord,uploaderName);
			inituploadfiles(Util.isNotEmpty(fk_id)?1:0,this);
			douploader(this);
		}else{
			    var $btn = $(this._uploaderdiv).find("input:eq(0)");
			    $btn.attr('type','file');
			    if(!parent.isMiniprogram){
			        $btn.attr('multiple','');
			    }
			    $btn.attr('name','files[]');
			    $btn.removeClass('uploader-style');
			    $btn.wrapAll('<span class="btn btn-primary fileinput-button push-down-5"></span>');
			    if(this._btnName){
			    	$btn.before('<i class="fa fa-upload"></i><span>'+this._btnName+'</span>');
			    }else{
			    	$btn.before('<i class="fa fa-upload"></i><span>上传图片</span>');
			    }
			    //表单加载后渲染查看图片组件
			    if(Util.getActinstName()!="填写状态"&&saveRecord=="save"){
				    var record = $('<a class="btn btn-default push-left-10 push-down-5">查看变更记录</a>');
				    $btn.parent().after(record);
				    record.click(function(){
				    	parent.showUploadfilesRecord(fk_id,id,uploaderName);
				    })
			    }
			    $btn.parent().after('<div class="bar responsive-padding-box view-blueimp-gallery push-up-5"><div class="gallery" id="'+$btn.attr('id')+'_imageContainer'+'"></div></div>');
                //进度条
                var $progress = $('<div class="bar push-up-10" name="progress" style="display:none;">'+
                                        '<div style="max-width: 200px;">'+
                                            '<div class="progress push-down-5" style="height:12px;">'+
                                                '<div class="progress-bar progress-bar-striped progress-bar-success active" role="progressbar" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100" style="width: 0%;line-height:12px;">0%</div>'+
                                            '</div>'+
                                        '</div>'+
                                    '</div>');
                $btn.parent().after($progress);
			    $("#"+$btn.attr('id')+"_imageContainer",window.parent.document).parent().remove();
			    $("#page-content",window.parent.document).append('<div style = "display:none"><ul name="pictures" id="'+$btn.attr('id')+'_imageContainer'+'"></ul></div>');
			    inituploadfilesPic(fk_id,this);
				douploaderImage(this);
		    }
		//如果上传控件notnull属性是true，并且不是“不可编辑”的，则append红色*的span
		if($("#"+id).attr("notnull") == "true" && $("#"+id).attr("editable") != "false"){
			$("#"+id).append('<span id="' + id + '_notnullspan" class="notnull" style="width:10px;height:15px;display:inline-block;margin-left:6px;"></span>');
		}
		
		//监听上传控件notnull属性的变化。如果div新增了notnull，则append一个span；如果div删除了notnull则把span删除；
		var targetNode = $("#"+id)[0];
		var options = { attributes: true, childList: false,subtree:false,attributeOldValue:true};
		function callback(mutationsList, observer) {
			mutationsList.forEach(function(record) {
		    	if(record.attributeName=="notnull"){
		    	// 如果发生变化的属性是notnull
		    		if($("#"+id).attr("notnull") == "true" && $("#"+id).attr("editable") != "false" && $("#"+id + "_notnullspan").length == 0){
		    			//如果notnull为true了，并且当前不是“不可编辑”的，并且当前没有红色*的span
		    			$("#"+id).append('<span id="' + id + '_notnullspan" class="notnull" style="width:10px;height:15px;display:inline-block;margin-left:6px;"></span>');
		    		}else if(($("#"+id).attr("notnull") == undefined || $("#"+id).attr("notnull") != "true") && $("#"+id + "_notnullspan").length == 1){
		    			//（如果notnull属性不存在，或者notnull属性不等于true）并且红色*的span存在
		    			$("#"+id + "_notnullspan").remove();
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
	//绑定数据
	bindData:function(){},
	//渲染数据
	inituploadData:function(fk_id,isNewId,initType){
	   	if(this._uploaderType!="picture"){
			inituploadfiles(initType,this,isNewId);
		}else{
		    inituploadfilesPic(fk_id,this,isNewId);
		}
	},
	//提交时的处理
	submitValue:function(){
		
		var divId = this._id;
		dataCenter.removeDataStore(divId);
		var uploadDataStore = new unieap.ds.DataStore(divId);
		uploadDataStore.setParameter("uploader","true");
		uploadDataStore.setParameter("exist","true");
		uploadDataStore.setParameter("SYS_FK",dataCenter.getParameter("SYS_FK"));
		
		var uploadRowSet=new unieap.ds.RowSet();
		uploadDataStore.rowSet=uploadRowSet;
		dataCenter.addDataStore(divId,uploadDataStore);
		var div_name = this.uploaderName==null||this.uploaderName==""?this._btnName:this.uploaderName;
		if(this._uploaderdiv.attr("uploaderType")!="picture"){
			//遍历上传附件
			this._uploaderdiv.find("[action='newAffix']").each(function(){
				var up_id = $(this).attr("id");
				var file_size = $(this).attr("file_size");
				var up_relative_path = $(this).attr("relative_path");
				var up_file_new_name = $(this).attr("file_new_name");
				var up_newurl = $(this).attr("newurl");
				var up_encodeName = $(this).attr("encodeName");
				uploadRowSet.addRow({"div_name":div_name,"div_id":divId,"up_id":up_id,"file_size":file_size,"up_relative_path":up_relative_path,"up_file_new_name":up_file_new_name,"up_newurl":up_newurl,"up_encodeName":up_encodeName});
			});  
			//当附件全部删除后，仍然装一条空的row，否则无法运行到DefaultExtSaveOrUpdateDataSet
			if(this._uploaderdiv.find("[action='newAffix']").length==0) {
				uploadRowSet.addRow({});
			}
		}else{
			var area_id = "btn_"+divId+"_imageContainer";
			$("#"+area_id).children("a").each(function(j,k){
				uploadRowSet.addRow({"div_name":div_name,"div_id":divId,"up_id":$(k).attr("id"),"file_size":$(k).attr("size"),"up_relative_path":"","up_file_new_name":$(k).attr("title"),"up_newurl":$(k).find("[imgViewer='imgViewer']").attr("src"),"up_encodeName":encodeURI($(k).attr("title"))});
			})
			if($("#"+area_id).children("a").length==0){
				uploadRowSet.addRow({});
			}
		}
	}
});

createFileUpload = function(fk_id,dom,saveRecord,uploaderName){
	$("#"+dom.id).empty();
	var fileUpload = "";
	if(dom._btnName){
		fileUpload = "<span class='btn btn-primary fileinput-button push-down-5'><i class='fa fa-upload'></i><span>"+dom._btnName+
		"</span><input id='"+"btn_"+dom.id+"' type='file' name='files[]' "+(parent.isMiniprogram?"":"multiple")+"></span>";
	}else{
		fileUpload = "<span class='btn btn-primary fileinput-button push-down-5'>"+
		"<input id='"+"btn_"+dom.id+"' type='file' name='files[]' "+(parent.isMiniprogram?"":"multiple")+"></span>";
	}
	$("#"+dom.id).append(fileUpload);
    //进度条
    var $progress = $('<div class="bar push-up-10" name="progress" style="display:none;">'+
                            '<div style="max-width: 200px;">'+
                                '<div class="progress push-down-5" style="height:12px;">'+
                                    '<div class="progress-bar progress-bar-striped progress-bar-success active" role="progressbar" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100" style="width: 0%;line-height:12px;">0%</div>'+
                                '</div>'+
                            '</div>'+
                        '</div>');
    $("#"+dom.id).children("span:eq(0)").after($progress);
    //表单加载后渲染查看图片组件
    if(Util.getActinstName()!="填写状态"&&saveRecord=="save"){
	    var record = $('<a class="btn btn-default push-left-10 push-down-5">查看变更记录</a>');
	    $("#"+dom.id).children("span:eq(0)").after(record);
	    record.click(function(){
	    	parent.showUploadfilesRecord(fk_id,dom.id,uploaderName);
	    })
    }
};

inituploadfiles = function(initType,dom,isNewId) {//initType 0流程未发起初始化 1流程发起后初始化 2加载上次填写初始化
    var uploadpdf_ext_radio = "";//是否开启盖章
    var uploadpdf_ext_divId = "";//绑定控件id
    var signature_client_path = ""//签章服务器地址
    var parentWindows = parent.fp;//获取父窗口对象
    var login_id = "";
    if(parentWindows){
       signature_client_path = window.parent.signature_client_path;
       if(parentWindows.hasOwnProperty('tasktodo')){//判断是否为办理页面
           var extPropertyMap = parentWindows.tasktodo.extPropertyMap;
           uploadpdf_ext_radio = extPropertyMap.uploadpdf_ext_radio;
           uploadpdf_ext_divId = extPropertyMap.uploadpdf_ext;
           login_id = parentWindows.tasktodo.applicant+","+parentWindows.tasktodo.login_id;
           if(extPropertyMap.weboffice_ext_radio=="1"){
               if(Util.isNotEmpty(extPropertyMap.weboffice_ext)){
                   var divIDS = extPropertyMap.weboffice_ext.split("&");
                   $(divIDS).each(function(i,o){
                       if(o==dom.id){
                           dom.web_office = true;
                       }
                   })
               }else{
                   dom.web_office = true;
               }
           }
       }
    }
    var files = [];
	if(initType==0){
		if(!dataCenter.dataStores[dom._id+"_preset"]){
    		return;
    	}
        files = dataCenter.dataStores[dom._id+"_preset"].getRowSet().getData(3);
	}else if(initType==1){
		if(!dataCenter.dataStores[dom._id]){
    		return;
    	}
    	files = dataCenter.dataStores[dom._id].getRowSet().getData(3);
	}else if(initType==2){
        if(!dataCenter.dataStores[dom._id+"_record"]){
            return;
        }
        files = dataCenter.dataStores[dom._id+"_record"].getRowSet().getData(3);
        if(files.length==0&&dataCenter.dataStores[dom._id+"_preset"]){
            files = dataCenter.dataStores[dom._id+"_preset"].getRowSet().getData(3);
        }
    }
    var signpdf=uploadpdf_ext_radio=="1" && (uploadpdf_ext_divId==dom.id || uploadpdf_ext_divId=="" || uploadpdf_ext_divId==null);
    String.prototype.endWith = function(endStr){
        var d=this.length-endStr.length;
        return (d>=0&&this.lastIndexOf(endStr)==d);
    };
	for(var index = 0; index < files.length; index ++) {
		var divId = dom.id;
		var file = files[index];
		var id = isNewId?Math.getUuid("fileupload",25,32):file.up_id;
		var type = file.file_new_name;
		var name = file.file_old_name;
		var officeonline = file.office_online;
		var pan_path = file.pan_path;
		var relative_path=file.relative_path;
		var file_new_name=file.file_new_name;
		var newurl=relative_path+file_new_name;//新文件名字
		var encodeName=encodeURIComponent(name);//文件原名
		var newurl = relative_path + file_new_name;
		var file_size = Number(file.file_size);
        var allpath = window.location.protocol+"//"+window.location.host+WEBAPP+"/"+newurl;//附件绝对路径
        var downloadPDF = signature_client_path+"/download?fileId="+hex_md5(allpath);//盖章后下载路径
        var download = WEBAPP+"/formParser?status=fileUpload&action=filedownload&fileName="+encodeName+"&filePath="+newurl;

		var spanHTML = "<span class = 'bar push-up-3' action='newAffix' id='" + id + "' name='after_insert' "
		+ " file_size='"+file_size+"'"
		+ " relative_path='"+relative_path+"'"
		+ " file_new_name='"+file_new_name+"'"
                                		+ " newurl='"+newurl+"'"
                                		+ " encodeName='"+encodeName+"'"
                                		+" style='margin-right:20px;'>"
                                		+"<b style='margin:-2px 3px 0 0px;height:20px;' class='"
                                		+ fixFileTypeIcon(type)
                                		+ "'></b>"
                                		+ "<a";
                                		if(signpdf&&file_new_name.endWith(".pdf")){
                                		    spanHTML = spanHTML + " onclick='downLoadPdf(\""+downloadPDF+"\",\""+download+"\")' "
                                		}else{
                                		    spanHTML = spanHTML + " href='JavaScript:;' onclick='Util.downloadFile(\""+download+"\",\""+name+"\",\""+newurl+"\")'";
                                		}
                                		spanHTML = spanHTML +" class='annex_link text-primary'>"+name+"</a>";
                                		if(dom._editable){
                                			spanHTML = spanHTML + "  <a style='color:#0099CC' id='affix' email_id='' file_id='"
                                			+ id
                                			+ "' href='javascript:deleteFile(\""
			+ id + "\")'><font size='3'>(×移除)</font></a>" ;
		}
		if(officeonline!=null && officeonline!="" && officeonline!="false"){
			if(testOffice(file_new_name)){
				spanHTML = spanHTML + "<a style='color:#0099CC' href='"+ WEBAPP + "/officePreviewRedirect?filename=" + name +"&filepath=" + newurl + "'  target='_blank' rel='nofollow'><font size='3'>（@在线预览）</font></a>";
			}
		}
        if(Util.isNotEmpty(file.web_office)&&file.web_office!="false"&&dom.web_office){//在线编辑
            if(testOffice(file_new_name)){
                spanHTML = spanHTML + "<a style='color:#0099CC' onclick='window.open(\""+ WEBAPP + "/webOfficeRedirect?id=" + id +"&filepath=" + newurl + "\")'  target='_blank' rel='nofollow'><font size='3'>（@在线编辑）</font></a>";
            }
        }
		if(file_new_name.endWith(".pdf")){
            downloadPDF = signature_client_path+"/download?fileId="+hex_md5(allpath);//盖章后下载路径
			if(signpdf){
			    spanHTML = spanHTML + "<a style='color:#0099CC' onclick=viewOline('"+newurl+"','"+file_new_name+"','"+downloadPDF+"') target='_blank'><font size='3'>（@在线预览）</font></a>";
			    spanHTML = spanHTML + "<a style='color:#0099CC' href='"+signature_client_path+"/sso/view?belong_users="+login_id+"&file="+allpath+"&fileName="+name+"' target='_blank'><font size='3'>（@盖章）</font></a>";
			}else{
			    spanHTML = spanHTML + "<a style='color:#0099CC' href='"+WEBAPP+"/resource/pdfjs/web/viewer.html?file="+WEBAPP+"/"+newurl+"' target='_blank'><font size='3'>（@在线预览）</font></a>";
			}
            if(existSignPdf(downloadPDF+"&type=exist")){
                spanHTML = spanHTML + "<a style='color:#0099CC' href='"+downloadPDF+"' target='_blank'><font size='3'>（@下载盖章PDF）</font></a>";
            }
		}
        if(file_new_name.endWith(".doc")||file_new_name.endWith(".docx")){
            allpath = window.location.protocol+"//"+window.location.host+WEBAPP+"/"+newurl.replace(/\.docx/g,".pdf").replace(/\.doc/g,".pdf");//附件绝对路径
            downloadPDF = signature_client_path+"/download?fileId="+hex_md5(allpath);//盖章后下载路径
            if(signpdf){
                var signpath = signature_client_path+"/sso/view?belong_users="+login_id+"&file="+allpath+"&fileName="+name.replace(/\.docx/g,".pdf").replace(/\.doc/g,".pdf");
                spanHTML = spanHTML + "<a style='color:#0099CC' onclick='signPdfDoc(\""+signpath+"\",\""+newurl+"\")' target='_blank'><font size='3'>（@盖章）</font></a>";
            }
            if(existSignPdf(downloadPDF+"&type=exist")){
                spanHTML = spanHTML + "<a style='color:#0099CC' href='"+downloadPDF+"' target='_blank'><font size='3'>（@下载盖章PDF）</font></a>";
            }
        }
		if(file_new_name.endWith(".txt")){
			spanHTML = spanHTML +"<a style='color:#0099CC' onClick=showTxt('"+newurl+"') target='_blank'><font size='3'>（@在线预览）</font></a>";
		}
		if(file_new_name.endWith(".png")||file_new_name.endWith(".jpg")||file_new_name.endWith(".jpeg")){
			spanHTML = spanHTML +"<a imgViewerOne='imgViewerOne' url='"+newurl+"' title='"+file_new_name+"' style='color:#0099CC' target='_blank'><font size='3'>（@在线预览）</font></a>";
		}
		$("#"+divId).append(spanHTML+"</span>");
	} 
};

viewOline = function(path,file_name,pdfurl){
    if(existSignPdf(pdfurl+"&type=exist")){
            Util.ajax({
                url : WEBAPP + "/fp/readtxt/readingPDF",
                method:"POST",
                param : {path:path,file_name:file_name,url:pdfurl},
                dataType:"text",
                success: function(data){
                    if(data=="" || data==null){
                        window.open(WEBAPP+"/resource/pdfjs/web/viewer.html?file="+WEBAPP+"/"+path);//返回空预览原文件
                    }else{
                        window.open(WEBAPP+"/resource/pdfjs/web/viewer.html?file="+WEBAPP+"/"+data);
                    }
                },
                error:function(){
                    window.open(WEBAPP+"/resource/pdfjs/web/viewer.html?file="+WEBAPP+"/"+path);//报错预览原文件
                }
            });
    }else{
        window.open(WEBAPP+"/resource/pdfjs/web/viewer.html?file="+WEBAPP+"/"+path);//报错预览原文件
    }
};

inituploadfilesPic = function(fk_id,dom,isNewId) {
		    	var pid=fk_id;
		    	if(pid){
					Util.ajax({
						url:WEBAPP +"/fp/serveapply/getImage",
						param:{pid:pid,area_id:dom.id},
						async:false,
					    method:"POST",
						success:function(data){
		                     $(data).each(function(i,o){
		                    	 var galleryClass = "";
		                    	 if(IsPC()){
		                    		 galleryClass = "gallery-item";
		                    	 }else{
		                    		 galleryClass = "gallery-item active";
		                    	 }
		                    	 var imgId = Math.getUuid("img",25,32);
		                    	 if(dom._editable){
			                    	 $("#btn_"+o.AREA_ID+"_imageContainer").append('<a class="'+galleryClass+'" size="'+o.FILE_SIZE+'" id="'+(isNewId?Math.getUuid("fileupload",25,32):o.ID)+'"  title="'+o.FILE_NAME+'"><div class="image"><img imgViewer="imgViewer" id="'+imgId+'" src="'+o.FILE_PATH+'" alt="'+o.FILE_NAME+'"/><ul class="gallery-item-controls"><li><span class="gallery-item-remove"><i class="fa fa-times"></i></span></li></ul></div></a>')
		                    	 }else{
		                    		 $("#btn_"+o.AREA_ID+"_imageContainer").append('<a class="'+galleryClass+'" size="'+o.FILE_SIZE+'" id="'+(isNewId?Math.getUuid("fileupload",25,32):o.ID)+'"  title="'+o.FILE_NAME+'"><div class="image"><img imgViewer="imgViewer" id="'+imgId+'" src="'+o.FILE_PATH+'" alt="'+o.FILE_NAME+'"/></div></a>')
		                    	 }
		                    	 $("#btn_"+o.AREA_ID+"_imageContainer",window.parent.document).append('<li><img id="'+imgId+'"  data-original="'+o.FILE_PATH+'" src="'+o.FILE_PATH+'" alt="'+o.FILE_NAME+'"></li>')
		                     })
						}
				    });
		    	}
};
showTxt = function(txturl){
	window.open(WEBAPP+"/view?m=fp#filepath="+txturl+"&act=fp/readtxt");
};
var nowquenednum = 0;
douploader = function(dom) {
	var disabled = false;
	if(!dom._editable){
		disabled = true;
	}
	var stop = false;
	var upload_name = dom._btnName;
	var upload_max_nums = dom._filesOneceLimit;
	var upload_max_nums2 = dom._filesTotalLimit;
	var upload_max_file = dom._filesSizeLimit;
	var btn_upload_id = "btn_"+dom.id;
	var haveSaved = $("span[action='newAffix']").size();
	function fileDialogComplete(files) {//1
		var allowformat = $("#"+dom.id).attr("allowformat");
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
		//upload_max_nums1
		var numFilesSelected = files.length;
		var haveSaved = $("#"+dom.id).find("span[action='newAffix']").size();
		if(!stop && (haveSaved+numFilesSelected>parseInt(upload_max_nums2))) {
			stop = true;
			alert("上传文件总数不能超过"+upload_max_nums2+"个。");
		}
		if (!stop && numFilesSelected != 0 && parseInt(upload_max_nums2) > haveSaved) {
			if(numFilesSelected > parseInt(upload_max_nums)) {
				stop = true;
				alert("每批最多上传"+upload_max_nums+"个附件");
			}
		}
		if(!stop){
			var maxSize = parseInt(upload_max_file)*1000000;
			var excessFile = "";
			for(var i=0;i<numFilesSelected;i++){
				var file = files[i];
				if(file.size && file.size>maxSize){
					excessFile = excessFile+file.name+",";
				}
			}
			if(excessFile.length>0){
				stop = true;
				alert(excessFile.substring(0,excessFile.length-1)+" 不可超过"+upload_max_file+"MB");
			}
		}
	}
	function uploadSuccess(file, serverData) {
		var divId = dom.id;
		var json=serverData; 
		var id = file.id;
		var type = file.type;
		var name = file.name;
		var relative_path=json.relative_path;
		var officeonline = json.office_online;
		var web_office = json.web_office;
		var pan_path = json.pan_path;
		var file_new_name=json.file_new_name;
		var newurl=relative_path+file_new_name;//新文件名字
		var encodeName=encodeURIComponent(name);//文件原名
		var newurl = relative_path + file_new_name;
		var file_size = Number(json.file_size);
		var wholePath = WEBAPP+"/formParser?status=fileUpload&action=filedownload&fileName="+encodeName+"&filePath="+newurl;
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
					+ "<a href='JavaScript:;' onclick='Util.downloadFile(\""+wholePath+"\",\""+name+"\",\""+newurl+"\")' class='annex_link text-primary'>"
					+name+"</a>"
					+ "  <a style='color:#0099CC' id='affix' email_id='' file_id='"
					+ id
					+ "' href='javascript:deleteFile(\""
					+ id + "\")'><font size='3'>(×移除)</font></a>";
		String.prototype.endWith = function(endStr){
			var d=this.length-endStr.length;
			return (d>=0&&this.lastIndexOf(endStr)==d);
		};
		if(officeonline!=null && officeonline!="" && officeonline!="false"){
			if(testOffice(file_new_name)){
				Str = Str + "<a style='color:#0099CC' href='"+ WEBAPP + "/officePreviewRedirect?filename=" + name +"&filepath=" + newurl +"' target='_blank' rel='nofollow'><font size='3'>（@在线预览）</font></a>";
			}
		}
        if(Util.isNotEmpty(web_office)&&web_office!="false"&&dom.web_office){
            if(testOffice(file_new_name)){
                Str = Str + "<a style='color:#0099CC' onclick='window.open(\""+ WEBAPP + "/webOfficeRedirect?id=" + id +"&filepath=" + newurl + "\")'  target='_blank' rel='nofollow'><font size='3'>（@在线编辑）</font></a>";
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
		$("#"+divId).append(Str+"</span>");
	}
	var hash = parent.location.hash;
	var serviceIdApply = Util.getHash(hash, "serveID", "");
	var serviceIdTask = Util.getHash(hash, "service_id", "");
	var serviceId = (serviceIdApply == "" || serviceIdApply == undefined) ? serviceIdTask : serviceIdApply;
	var url = WEBAPP+'/formParser?status=fileUpload&action=fileupload&serviceId='+serviceId;
	$("#"+btn_upload_id).fileupload({
        url: url,
        dataType: 'json',
        disabled:disabled,
        autoUpload: true,
        singleFileUploads:false,
        sequentialUploads:true,
        forceIframeTransport:false,
        multipart:true,
        maxFileSize: parseInt(upload_max_file)*1000000,
        disableImageResize: /Android(?!.*Chrome)|Opera/
            .test(window.navigator.userAgent),
        disableImagePreview:true,
        progressall:function (e, data) {
            var $progress = $("[name='progress']",$("#"+dom.id));
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
    		var relative_path = result.relative_path;
    		var office_online = result.office_online;
    		var web_office = result.web_office;
    		var pan_path = result.pan_path;
        	$.each(data.files, function (index, file) {
        		var serverData={};
        		serverData.file_new_name = file_new_name_Array[index];
        		serverData.file_old_name = file_old_name_Array[index];
        		serverData.relative_path = file_relative_path_Array[index];
        		serverData.office_online = office_online;
        		serverData.web_office = web_office;
        		serverData.pan_path = pan_path;
        		serverData.file_size = file_size_Array[index];
        		file.id=Math.getUuid("fileupload",25,32);
            	uploadSuccess(file,serverData);
            });
    	}else{
    		alert(result.result);
    	}
    }).on('fileuploadadd', function (e, data) {
          	fileDialogComplete(data.files,0,0);
    }).prop('disabled', !$.support.fileInput || disabled)
        .parent().addClass(!$.support.fileInput || disabled ? 'disabled' : undefined);
};




douploaderImage = function(dom) {
	var disabled = false;
	if(!dom._editable){
		disabled = true;
	}
	var stop = false;
	var upload_name = dom._btnName;
	var upload_max_nums = dom._filesOneceLimit;
	var upload_max_nums2 = dom._filesTotalLimit;
	var upload_max_file = dom._filesSizeLimit;
	var btn_upload_id = "btn_"+dom.id;
	var haveSaved = $("span[action='newAffix']").size();
	function fileDialogComplete(files) {//1
		var allowformat = $("#"+dom.id).attr("allowformat");
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
		//upload_max_nums1
		var numFilesSelected = files.length;
		var haveSaved = $("#"+dom.id).find("a.gallery-item").size();
		if(!stop && (haveSaved+numFilesSelected>parseInt(upload_max_nums2))) {
			stop = true;
			alert("上传文件总数不能超过"+upload_max_nums2+"个。");
		}
		if (!stop && numFilesSelected != 0 && parseInt(upload_max_nums2) > haveSaved) {
			if(numFilesSelected > parseInt(upload_max_nums)) {
				stop = true;
				alert("每批最多上传"+upload_max_nums+"个附件");
			}
		}
		if(!stop){
			var maxSize = parseInt(upload_max_file)*1000000;
			var excessFile = "";
			for(var i=0;i<numFilesSelected;i++){
				var file = files[i];
				if(file.size && file.size>maxSize){
					excessFile = excessFile+file.name+",";
				}
			}
			if(excessFile.length>0){
				stop = true;
				alert(excessFile.substring(0,excessFile.length-1)+" 不可超过"+upload_max_file+"MB");
			}
		}
	}
	var hash = parent.location.hash;
	var serviceIdApply = Util.getHash(hash, "serveID", "");
	var serviceIdTask = Util.getHash(hash, "service_id", "");
	var serviceId = (serviceIdApply == "" || serviceIdApply == undefined) ? serviceIdTask : serviceIdApply;
	var url = WEBAPP+'/formParser?status=fileUpload&action=fileupload&serviceId='+serviceId;
	$("#"+btn_upload_id).fileupload({
        url: url,
        dataType: 'json',
        disabled:disabled,
        autoUpload: true,
        singleFileUploads:false,
        sequentialUploads:true,
        forceIframeTransport:false,
        multipart:true,
        maxFileSize: parseInt(upload_max_file)*1000000,
        disableImageResize: /Android(?!.*Chrome)|Opera/
            .test(window.navigator.userAgent),
        disableImagePreview:true,
        progressall:function (e, data) {
            var $progress = $("[name='progress']",$("#"+dom.id));
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
    		var web_office = result.web_office;
    		var pan_path = result.pan_path;
    		if(disabled){
            	$.each(data.files, function (index, file) {
            		var serverData={};
            		serverData.file_new_name = file_new_name_Array[index];
            		serverData.file_old_name = file_old_name_Array[index];
        		    serverData.relative_path = file_relative_path_Array[index];
            		serverData.office_online = office_online;
            		serverData.web_office = web_office;
            		serverData.pan_path = pan_path;
            		serverData.file_size = file_size_Array[index];
            		file.id=Math.getUuid("fileupload",25,32);
	               	 var galleryClass = "";
	            	 if(IsPC()){
	            		 galleryClass = "gallery-item";
	            	 }else{
	            		 galleryClass = "gallery-item active";
	            	 }
	            	 var imgId = Math.getUuid("img",25,32);
            		$("#"+btn_upload_id+"_imageContainer").append('<a class="'+galleryClass+'" size="'+serverData.file_size+'" id="'+file.id+'"  title="'+
            		  serverData.file_old_name+'"><div class="image"><img imgViewer="imgViewer" id = "'+imgId+'" src="'+serverData.relative_path+serverData.file_new_name+'" alt="'+
            		  serverData.file_old_name+'"/></div></a>');
            		$("#"+btn_upload_id+"_imageContainer",window.parent.document).append('<li><img id="'+imgId+'"  data-original="'+serverData.relative_path+serverData.file_new_name+'" src="'+serverData.relative_path+serverData.file_new_name+'" alt="'+serverData.file_old_name+'"></li>')
                });
    		}else{
            	$.each(data.files, function (index, file) {
            		var serverData={};
            		serverData.file_new_name = file_new_name_Array[index];
            		serverData.file_old_name = file_old_name_Array[index];
        		    serverData.relative_path = file_relative_path_Array[index];
            		serverData.office_online = office_online;
            		serverData.web_office = web_office;
            		serverData.pan_path = pan_path;
            		serverData.file_size = file_size_Array[index];
            		file.id=Math.getUuid("fileupload",25,32);
	               	 var galleryClass = "";
	            	 if(IsPC()){
	            		 galleryClass = "gallery-item";
	            	 }else{
	            		 galleryClass = "gallery-item active";
	            	 }
	            	 var imgId = Math.getUuid("img",25,32);
            		$("#"+btn_upload_id+"_imageContainer").append('<a class="'+galleryClass+'" size="'+serverData.file_size+'" id="'+file.id+'"  title="'+
            		  serverData.file_old_name+'"><div class="image"><img imgViewer="imgViewer" id="'+imgId+'" src="'+serverData.relative_path+serverData.file_new_name+'" alt="'+
            		  serverData.file_old_name+'"/><ul class="gallery-item-controls"><li><span class="gallery-item-remove"><i class="fa fa-times"></i></span></li></ul></div></a>');
            		$("#"+btn_upload_id+"_imageContainer",window.parent.document).append('<li><img id="'+imgId+'"  data-original="'+serverData.relative_path+serverData.file_new_name+'" src="'+serverData.relative_path+serverData.file_new_name+'" alt="'+serverData.file_old_name+'"></li>')
                });
    		}
    	}else{
    		alert(result.result);
    	}
    }).on('fileuploadfail', function (e, data) {
        $.each(data.files, function (index) {
            alert(data.files[index].name+" 上传失败！");
        });
    }).prop('disabled', !$.support.fileInput || disabled)
        .parent().addClass(!$.support.fileInput || disabled ? 'disabled' : undefined);
};



deleteFile = function(affix_id,oaemail_id){
	if(oaemail_id==null){
		oaemail_id="";
	}
	$("span#" + affix_id).remove();
};

IsPC = function() {
    var userAgentInfo = navigator.userAgent;
    var Agents = ["Android", "iPhone",
                "SymbianOS", "Windows Phone",
                "iPad", "iPod"];
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
            flag = false;
            break;
        }
    }
    return flag;
}

fixFileTypeIcon = function(type){
    var tmp = type.split(".");
    if(tmp[1])
    		var fix = tmp[tmp.length - 1].toLowerCase();
    else return "";
    switch(fix){
        case "doc": return "doc";   
        case "wps": return "doc";
        case "zip": return "zip";   
        case "rar": return "zip";   
        case "ace": return "zip";   
        case "7z": return "zip";
        case "swf": return "swf";   
        case "fla": return "swf";
        case "rmv": return "dvd";   
        case "rm": return "dvd";   
        case "wmv": return "dvd";   
        case "avi": return "dvd";   
        case "mpg": return "dvd";
        case "chm": return "book";   
        case "pdf": return "book";
        case "ppt": return "ppt";   
        case "xls": return "xls";
        case "exe": return "exe";   
        case "bat": return "exe";
        case "cpp": return "scr";   
        case "js": return "scr";   
        case "jav": return "scr";   
        case "css": return "scr";
        case "cs": return "scr";   
        case "h": return "scr";   
        case "cgi": return "scr";
        case "jpg": return "img";   
        case "gif": return "img";   
        case "png": return "img";   
        case "psd": return "img";   
        case "bmp": return "img";
        case "htm": return "htm";   
        case "xml": return "htm";   
        case "xht": return "htm";   
        case "sht": return "htm";
        case "asp": return "htm";   
        case "jsp": return "htm";   
        case "php": return "htm";   
        case "txt": return "txt";
        case "cfg": return "cfg";   
        case "dll": return "cfg";   
        case "ini": return "cfg";
        case "mp3": return "mp3";   
        case "wma": return "mp3";   
        case "ape": return "mp3";   
        case "wav": return "mp3";   
        case "mid": return "mp3";
        default: return "oth";
    };
};
$(document).off("click",".gallery-item-controls").on("click",".gallery-item-controls",function(e){
    $(".blueimp-gallery").hide();
    $("#"+$(this).prev().attr("id"),window.parent.document).remove();
    $(this).parent().parent().remove();
    e.stopImmediatePropagation();
    e.stopPropagation();
    e.preventDefault();
})
$(document).off("click",".gallery-item").on("click",".gallery-item",function(e){
	parent.renderViewer($(this).parents(".gallery").attr("id"));
	$("#"+$(this).find("[imgViewer='imgViewer']").attr("id"),window.parent.document).trigger("click");
    e.stopImmediatePropagation();
    e.stopPropagation();
    e.preventDefault();
})
$(document).off("click","a[imgViewerOne='imgViewerOne']").on("click","a[imgViewerOne='imgViewerOne']",function(e){
	var picInfo = {};
	var $this = $(this);
	picInfo.id=$(this).parents("span").attr("id");
	picInfo.url=$this.attr("url");
	picInfo.name=$this.prevAll(".text-primary").text();
	parent.renderViewerOne(picInfo);
	$("#"+picInfo.id,window.parent.document).trigger("click");
	$(".viewer-next",window.parent.document).hide();
	$(".viewer-prev",window.parent.document).hide();
    e.stopImmediatePropagation();
    e.stopPropagation();
    e.preventDefault();
})




/*
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.1 Copyright (C) Paul Johnston 1999 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */

/*
 * Configurable variables. You may need to tweak these to be compatible with
 * the server-side, but the defaults work in most cases.
 */
var hexcase = 0;  /* hex output format. 0 - lowercase; 1 - uppercase        */
var b64pad  = ""; /* base-64 pad character. "=" for strict RFC compliance   */
var chrsz   = 8;  /* bits per input character. 8 - ASCII; 16 - Unicode      */

/*
 * These are the functions you'll usually want to call
 * They take string arguments and return either hex or base-64 encoded strings
 */
function hex_md5(s){ return binl2hex(core_md5(str2binl(s), s.length * chrsz));}
function b64_md5(s){ return binl2b64(core_md5(str2binl(s), s.length * chrsz));}
function str_md5(s){ return binl2str(core_md5(str2binl(s), s.length * chrsz));}
function hex_hmac_md5(key, data) { return binl2hex(core_hmac_md5(key, data)); }
function b64_hmac_md5(key, data) { return binl2b64(core_hmac_md5(key, data)); }
function str_hmac_md5(key, data) { return binl2str(core_hmac_md5(key, data)); }

/*
 * Perform a simple self-test to see if the VM is working
 */
function md5_vm_test()
{
  return hex_md5("abc") == "900150983cd24fb0d6963f7d28e17f72";
}

/*
 * Calculate the MD5 of an array of little-endian words, and a bit length
 */
function core_md5(x, len)
{
  /* append padding */
  x[len >> 5] |= 0x80 << ((len) % 32);
  x[(((len + 64) >>> 9) << 4) + 14] = len;

  var a =  1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d =  271733878;

  for(var i = 0; i < x.length; i += 16)
  {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;

    a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
    d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
    c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
    b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
    a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
    d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
    c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
    b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
    a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
    d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
    c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
    b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
    a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
    d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
    c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
    b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

    a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
    d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
    c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
    b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
    a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
    d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
    c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
    b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
    a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
    d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
    c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
    b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
    a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
    d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
    c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
    b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

    a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
    d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
    c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
    b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
    a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
    d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
    c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
    b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
    a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
    d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
    c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
    b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
    a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
    d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
    c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
    b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

    a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
    d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
    c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
    b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
    a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
    d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
    c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
    b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
    a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
    d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
    c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
    b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
    a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
    d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
    c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
    b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
  }
  return Array(a, b, c, d);

}

/*
 * These functions implement the four basic operations the algorithm uses.
 */
function md5_cmn(q, a, b, x, s, t)
{
  return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
}
function md5_ff(a, b, c, d, x, s, t)
{
  return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
}
function md5_gg(a, b, c, d, x, s, t)
{
  return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
}
function md5_hh(a, b, c, d, x, s, t)
{
  return md5_cmn(b ^ c ^ d, a, b, x, s, t);
}
function md5_ii(a, b, c, d, x, s, t)
{
  return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
}

/*
 * Calculate the HMAC-MD5, of a key and some data
 */
function core_hmac_md5(key, data)
{
  var bkey = str2binl(key);
  if(bkey.length > 16) bkey = core_md5(bkey, key.length * chrsz);

  var ipad = Array(16), opad = Array(16);
  for(var i = 0; i < 16; i++)
  {
    ipad[i] = bkey[i] ^ 0x36363636;
    opad[i] = bkey[i] ^ 0x5C5C5C5C;
  }

  var hash = core_md5(ipad.concat(str2binl(data)), 512 + data.length * chrsz);
  return core_md5(opad.concat(hash), 512 + 128);
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safe_add(x, y)
{
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function bit_rol(num, cnt)
{
  return (num << cnt) | (num >>> (32 - cnt));
}

/*
 * Convert a string to an array of little-endian words
 * If chrsz is ASCII, characters >255 have their hi-byte silently ignored.
 */
function str2binl(str)
{
  var bin = Array();
  var mask = (1 << chrsz) - 1;
  for(var i = 0; i < str.length * chrsz; i += chrsz)
    bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (i%32);
  return bin;
}

/*
 * Convert an array of little-endian words to a string
 */
function binl2str(bin)
{
  var str = "";
  var mask = (1 << chrsz) - 1;
  for(var i = 0; i < bin.length * 32; i += chrsz)
    str += String.fromCharCode((bin[i>>5] >>> (i % 32)) & mask);
  return str;
}

/*
 * Convert an array of little-endian words to a hex string.
 */
function binl2hex(binarray)
{
  var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
  var str = "";
  for(var i = 0; i < binarray.length * 4; i++)
  {
    str += hex_tab.charAt((binarray[i>>2] >> ((i%4)*8+4)) & 0xF) +
           hex_tab.charAt((binarray[i>>2] >> ((i%4)*8  )) & 0xF);
  }
  return str;
}

/*
 * Convert an array of little-endian words to a base-64 string
 */
function binl2b64(binarray)
{
  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var str = "";
  for(var i = 0; i < binarray.length * 4; i += 3)
  {
    var triplet = (((binarray[i   >> 2] >> 8 * ( i   %4)) & 0xFF) << 16)
                | (((binarray[i+1 >> 2] >> 8 * ((i+1)%4)) & 0xFF) << 8 )
                |  ((binarray[i+2 >> 2] >> 8 * ((i+2)%4)) & 0xFF);
    for(var j = 0; j < 4; j++)
    {
      if(i * 8 + j * 6 > binarray.length * 32) str += b64pad;
      else str += tab.charAt((triplet >> 6*(3-j)) & 0x3F);
    }
  }
  return str;
}
function testOffice(file_new_name){
    var res = false;
    var officeExt= [".doc",".docx",".xls",".xlsx",".ppt",".pptx"];
    $(officeExt).each(function(i,o){
        if(file_new_name.endWith(o)){
            res = true;
        }
    })
    return res;
}
function signPdfDoc(signpath,newurl){
    //先将word转成pdf
    Util.ajax({
        url : WEBAPP + "/fp/readtxt/convertPDF",
        method:"POST",
        loading:true,
        param : {newurl:newurl},
        success: function(data){
            if(data.errorStatus=="1"){
                Msg.warning(data.errorMsg);
            }else if(data.errorStatus=="0"){
                parent.window.open(signpath);
            }
        },
        error:function(){
            Msg.warning("转换pdf异常！");
        }
    });
}
function existSignPdf(existUrl){
    var res =false;
    if(window.parent.is_signature=="true"){//开启了证照才校验
        Util.ajax({
                url : WEBAPP + "/fp/readtxt/exist",
                async:false,
                method:"POST",
                param : {existUrl:existUrl},
                success: function(data){
                    if(data.success){
                        res = true;
                    }else{
                        res = false;
                    }
                }
        });
    }
    return res;

}
function downLoadPdf(downloadSign,download){
    if(existSignPdf(downloadSign+"&type=exist")){
        window.open(downloadSign);
    }else{
        window.open(download);
    }

}