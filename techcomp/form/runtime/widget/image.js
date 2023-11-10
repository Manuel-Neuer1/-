WebForm.widget("unieap.form.image",WebForm.FormWidget,{
	srcId:'',
	uploader:null,
	uploadHandler:{upload:function(){}},
	_create:function(){
		this._super(arguments);
		
	},
	
	//控件UI渲染，自定义控件需override该方法
	render:function(domNode){
		var imagefrom=this.element.attr("imagefrom");
		
		if(imagefrom==="runtime"){//运行期上传
			if(this.element.attr("disabled")!="disabled"){
				this.element.hide();
				$(this.element).css("cursor","pointer");
				var height=$(this.element).height();
				var width=$(this.element).width();
				var imageId=this.element.attr("id");
				var imageSize=this.element.attr("size")||500;
				if(this.srcId.length==0){
					this.srcId=Math.getUuid("image",25,32);
				}
				var imageWidth=$(this.element).width();
				var imageHeight=$(this.element).height();
				
				this.uploader=$('<div style="min-width:'+imageWidth+'px;min-height:'+imageHeight+'px;">'+
									'<input id="'+imageId+'ImageUpload" type="file" name="upload" accept="image/*" size="37" style="cursor:pointer;font-size:300px;position: absolute;width:'+imageWidth+'px;height:'+imageHeight+'px;opacity:0;"></input>'+
							        '<div id="'+imageId+'ImageUpLoader" class="imageUpLoader" style="width:'+imageWidth+'px;height:'+imageHeight+'px;border:1px dashed #dedede;text-align:center;margin:4px;cursor:pointer;display:none;">'+
							            '<p><i class="fa fa-folder-open" style="margin-top:16px;font-size:40px;color:#aaa;"></i></p>'+
							            '<p style="margin-top:12px;"><i style="font-size:16px;color:#aaa;">点击选择图片</i></p>'+
							            '<p><i style="font-size:14px;color:#aaa;">(不大于'+imageSize+'KB)</i></p>'+
							         '</div>'+
							     '</div>');
				this.element.after(this.uploader);
				this.uploader.append(this.element);
				this.uploader.find("input").css("margin-top",$(this.element).css("margin-top"));
				this.uploader.find("input").css("margin-right",$(this.element).css("margin-right"));
				this.uploader.find("input").css("margin-bottom",$(this.element).css("margin-bottom"));
				this.uploader.find("input").css("margin-left",$(this.element).css("margin-left"));
				
				this.uploader.attr("imageId",imageId);
				this.uploader.attr("size",imageSize);
				this.uploader.attr("srcId",this.srcId);
				this.uploader.attr("imageurl",WEBAPP+"/formImage.do?method=downloadImage&imageid="+this.srcId);
				
				$.ajax({
					url:WEBAPP + "/formImage.do?method=isImageExist",
					data:{imageid:this.srcId},
					type:'POST',
					context:this.element,
					dataType:'json',
					async:false,
					success:function(result){
						if(result.result=="yes"){//已经设置了图片
							 $(this).show();
						}else{//第一次加载，还没有设置图片
							$("#"+$(this).attr("id")+"ImageUpLoader").show();
						}
					},error:function(){
						$("#"+$(this).attr("id")+"ImageUpLoader").show();
					}
				});
				
				this.element.attr("src",WEBAPP+"/formImage.do?method=downloadImage&imageid="+this.srcId);
				
				this.uploader.find("input").change(this,function(event){
					var $this=$(this);
					if($this.length<1) return;
					 var file=$this.val(); 
					 var suffixs=new Array("jpg","gif","png");  
	                 //截取上传文件格式  
	                 var fileType=file.substring(file.lastIndexOf('.')+1);  
	                 if($.inArray(fileType,suffixs)<=-1){  
	                     alert("图片格式错误");  
	                     return;  
	                 }
	                 
	                 var size=500;
	                 var maxSize=$(this).parent().attr("size");
	                 if(this.files){
	                	 size=this.files[0].size/1024;//kb
	                	
	                     if(size>maxSize){
	                    	 alert("图片内容不许大于"+maxSize+"kb");
	                    	 return;
	                     }
	                     event.data.ajaxUpLoad(this);
	                 }else{//IE环境下适配，暂时不支持文件大小限制
	                	 event.data.ajaxUpLoadIE($this[0]);
	                 }     
				});
			}
			
		}
		
		
	},
	uploadImage:function(event){
		return $(event.data[0]).click();
	},
	
	ajaxUpLoad:function(obj){
		$this=$(obj);
		 $.ajaxFileUpload
         (
             {
                 url: WEBAPP + "/formImage.do?method=uploadImage", //用于文件上传的服务器端请求地址
                 secureuri: false, //是否需要安全协议，一般设置为false
                 fileElementId: $this.attr("id"), //文件上传域的ID
                 data:{imageid:$this.parent().attr("srcId"),fileid:$this.attr("id")},
                 dataType: 'json', //返回值类型 一般设置为json
                 success: function (data, status)  //服务器成功响应处理函数
                 {
                   var fileId=data.file;
                   var file=$("#"+fileId);
   				   var url=file.parent().attr("imageurl");
   				   var imageId=file.parent().attr("imageId");
   				   $("#"+imageId+"ImageUpLoader").hide();
   				   $("#"+imageId).attr("src",url+"&tempid="+Math.random()).show();
   				   $("#"+imageId).attr("srcId",file.parent().attr("srcId"));
                 },
                 error: function (data, status, e)//服务器响应失败处理函数
                 {
                     alert("文件上传失败！");
                 }
             }
         )
	},
	
	ajaxUpLoadIE:function(obj){
		$this=$(obj);
		 $.ajaxFileUpload
         (
             {
                 url: WEBAPP + "/formImage.do?method=uploadImage", //用于文件上传的服务器端请求地址
                 fileElementId: $this.attr("id"), //文件上传域的ID
                 data:{imageid:$this.parent().attr("srcId"),fileid:$this.attr("id")},
                 dataType: 'xml/html', //返回值类型 一般设置为json
                 success: function (data, status)  //服务器成功响应处理函数
                 {
                   data=$.parseJSON(data);
                   var fileId=data.file;
                   var file=$("#"+fileId);
   				   var url=file.parent().attr("imageurl");
   				   var imageId=file.parent().attr("imageId");
   				   $("#"+imageId+"ImageUpLoader").hide();
 				   $("#"+imageId).attr("src",url+"&tempid="+Math.random()).show();
 				   $("#"+imageId).attr("srcId",file.parent().attr("srcId"));
                 },
                 error: function (data, status, e)//服务器响应失败处理函数
                 {
                     alert("文件上传失败！");
                 }
             }
         )
	},
	
	//设置控件数据，自定义控件需override该方法
	setValue:function(){
		if(this.currentValue){
			this.srcId = this.currentValue;
		    this.element.attr("src",WEBAPP+'/formImage.do?method=downloadImage&imageid='+this.srcId);
		    this.element.attr('srcId',this.srcId);
		    this.element.show();
		    var imageId=this.element.attr("id");
		    $("#"+imageId+"ImageUpLoader").hide();
		}
	},
	
	//返回控件数据，表单提交时调用。自定义控件需override该方法
	collectValue:function(){
		this.currentValue=this.element.attr('srcId');
		return this.currentValue;
	}

});