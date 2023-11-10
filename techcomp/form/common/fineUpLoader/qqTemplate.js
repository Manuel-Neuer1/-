var qqTemplate='<script type="text/template" id="qq-template">'+
        '<div class="qq-uploader-selector qq-uploader"> '+ 
	    '<div class="qq-upload-button-selector qq-upload-button">  '+
	      '<i class="fa fa-file-word-o"></i>'+
	    '</div>  '+
	    '<ul class="qq-upload-list-selector qq-upload-list" style="display:none;"> '+ 
	      '<li>  '+
	        '<div class="qq-progress-bar-container-selector"> '+ 
	          '<div class="qq-progress-bar-selector qq-progress-bar"></div> '+ 
	        '</div>  '+
	        '<span class="qq-upload-spinner-selector qq-upload-spinner"></span>'+  
	        '<span class="qq-edit-filename-icon-selector qq-edit-filename-icon"></span>  '+
	        '<span class="qq-upload-file-selector qq-upload-file"></span>  '+
	        '<span class="qq-upload-size-selector qq-upload-size"></span>  '+
	        '<a class="qq-upload-cancel-selector qq-upload-cancel" href="#">放弃上传</a> '+ 
	        '<a class="qq-upload-retry-selector qq-upload-retry" href="#">Retry</a>  '+
	        '<a class="qq-upload-delete-selector qq-upload-delete" href="#">删除</a> '+ 
	        '<span class="qq-upload-status-text-selector qq-upload-status-text"></span>  '+
	      '</li>  '+
	    '</ul> '+ 
	  '</div>  '+
 '</script>';
$("body").append(qqTemplate);