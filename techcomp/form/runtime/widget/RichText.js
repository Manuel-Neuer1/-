WebForm.widget("unieap.form.RichText",WebForm.FormWidget, {
	
	_create:function(){
		this._super(arguments);
		
		//summernote增加文件上传插件
//		var PasteWord = function (context) {
//			  // you can get current editor's elements from layoutInfo
//			  var layoutInfo = context.layoutInfo;
//			  var $editor = layoutInfo.editor;
//			  var $editable = layoutInfo.editable;
//			  var $toolbar = layoutInfo.toolbar;
//
//			  // ui is a set of renderers to build ui elements.
//			  var ui = $.summernote.ui;
//
//			  // this method will be called when editor is initialized by $('..').summernote();
//			  // You can attach events and created elements on editor elements(eg, editable, ...).
//			  this.initialize = function () {
//			    // create button
//			    var button = ui.button({
//			      className: 'btn-group note-btn-bold',
//			      contents: '<div id="'+$($toolbar).parent().prev().attr("id")+'_uploader"></div>'
//			    });
//
//			    // generate jQuery element from button instance.
//			    this.$button = button.render();
//			    $toolbar.append(this.$button);
//			  }
//
//			  // this method will be called when editor is destroyed by $('..').summernote('destroy');
//			  // You should detach events and remove elements on `initialize`.
//			  this.destroy = function () {
//			    this.$button.remove();
//			    this.$button = null;
//			  }
//		};
//		$.extend($.summernote.plugins, {
//			  wordPast: PasteWord
//			});
		this.element.summernote({
			lang : 'zh-CN',
			height:this.element.css('height'),
			fontNames: ['黑体', '宋体', '仿宋', '微软雅黑','楷体','隶书','幼圆','Arial', 'Arial Black', 'Comic Sans MS', 'Courier New',
			            'Helvetica Neue', 'Helvetica', 'Impact', 'Lucida Grande',
			            'Tahoma', 'Times New Roman', 'Verdana'],
			callbacks:{  
//                onPaste: function (ne) { 
//                    var bufferText = ((ne.originalEvent || ne).clipboardData || window.clipboardData).getData('Text/html');  
//                     //    ne.preventDefault();    
//                     ne.preventDefault ? ne.preventDefault() : (ne.returnValue = false);  
//                     // Firefox fix  
//                     setTimeout(function () {
//                    	 bufferText= unieap.string2JSON(bufferText);
//                         document.execCommand("insertHTML", false, bufferText);  
//                    	// bufferText=string2Json(bufferText);
//                    	// this.summernote("code",bufferText);
//                     }, 10);  
//                    /*  */  
//                 }  
             },
             toolbar: [
						['style', ['bold', 'italic','fontname', 'underline', 'clear']],
						['font', ['strikethrough']],
						['fontsize', ['fontsize']],
						['color', ['color']],
						['para', ['ul', 'ol', 'paragraph']],
						['height', ['height']],
						['insert',['picture','link','table','hr']]
                     ]
		});
		var trigger=this.element;
		//文件上传控件
//		var uploader = new qq.FineUploader({
//		    element: $('#'+$(this.element).attr("id")+'_uploader')[0],
//		    multiple:false,
//		    request: {
//		        endpoint: 'sumernoteupload.do'
//		    },
//		    callbacks:{
//		    	onComplete:function(id,  fileName,  responseJSON){
//		    		trigger.summernote("code",responseJSON.html);
//		    	}
//		    },
//		    validation:  {
//	          allowedExtensions: ['doc', 'docx'],
//	          sizeLimit: 3145728 // 3M
//		    } ,
//		    text: {
//                defaultResponseError: "文件上传失败！",
//                fileInputTitle: "导入word文件"
//            },
//            messages: {
//                typeError: "{file} 文件类型错误，请上传doc或docx结尾的word文件",
//                sizeError: "{file} 太大，文件大小不能超过3M",
//                tooManyItemsError: "选择文件过多，最多选择一个文件"
//            }
//	  });
	},
	
	//根据当前currentValue值设置dom
	setDomValue:function(){
		if(this.currentValue){
		    this.currentValue = $("<div>").html(this.currentValue).text();
			this.element.summernote("code",this.currentValue); 
		}
	},
	
	submitValue:function(){
		var value=this.element.summernote("code"); 
		if(!value)
			return;
		this.currentValue=value;
		this._super(arguments);
	}
});
