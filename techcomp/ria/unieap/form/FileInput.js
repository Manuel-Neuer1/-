dojo.provide("unieap.form.FileInput");
dojo.require("unieap.form.FormWidget");
dojo.declare("unieap.form.FileInput", unieap.form.FormWidget, {
	/**
	 * @declaredClass:
	 * 		unieap.form.FileInput
	 * @superClass:
	 * 		unieap.form.FormWidget
	 * @summary:
	 * 		文本上传控件,相当于HTML标签中的<input type="file" name="uploadFile" />
	 * @example:
	 * |	<div dojoType="unieap.form.FileInput" fileFilter="gif,jpg,png" name="userFile"></div>
	 * @img:
	 * 		images/form/fileinput.png	
	 */
	
	//配置属性接口
	UserInterfaces : dojo.mixin({
		label : "string",
		cancelText : "string",
		fileFilter : "string",
		onBeforeCancel : "function",
		onCancel : "function",
		onChange : "function"			
	},
	unieap.form.FormWidget.prototype.UserInterfaces),
	
	/**
	 * @summary:
	 * 		设置控件选择文件按钮的名称
	 * @type:
	 * 		{string}
	 * @default:
	 * 		"浏览"
	 */
	label: RIA_I18N.form.fileinput.browser,
	
	/**
	 * @summary:
	 * 		设置清空控件值的按钮名称
	 * @type:
	 * 		{string}
	 * @default:
	 * 		"取消"
	 */
	cancelText: RIA_I18N.form.fileinput.cancel,
	
	/**
	 * @summary:
	 * 		设置文件上传的名称,便于服务端处理。
	 * @description:
	 * 		相当于<input type="file" name="fileName" />中的name属性
	 * @type:
	 * 		{string}
	 * @default:
	 * 		"uploadFile"
	 */
	name: "uploadFile",
	
	/**
	 * @summary:
	 * 		设置只允许上传特定后缀名的文件
	 * @type:
	 * 		{string}
	 * @example:
	 * |	<div dojoType="unieap.form.FileInput" fileFilter="jpg,gif"></div>
	 * 		上述代码表明控件只接受后缀名为jpg和gif的图片文件
	 * 		
	 */
	fileFilter: "",
	
	templateString : 
		"<div class='u-form-file'>" + 	
			"<span class='u-form-file-btn' dojoAttachPoint='cancelNode'></span>" +
			"<span class='u-form-file-btn' dojoAttachPoint='browseNode'></span>" + 
			"<span class='u-form-file-required' dojoAttachPoint='requiredNode'>*</span>" + 
			"<div dojoAttachPoint='fieldNode' class='u-form-field' style='position:relative;'>"+
				"<div dojoAttachPoint='errorNode' class='u-form-error'></div>"+
				"<div class='u-form-file-fileField'>" +
					"<input class='u-form-textbox-input' readonly tabindex='-1' type='text' dojoAttachPoint='focusNode,inputNode' onfocus='unieap.fep&&unieap.fep(this)'/>" +
				"</div>" +
			"</div>"+
			"<div class='u-form-file-realFileField' dojoAttachPoint='realinputArea'>" +						
					"<input size='1' tabindex='-1' type='file' dojoAttachPoint='fileInput' style='cursor:pointer;position:absolute;width:62px;left:0;'>" +	
			"</div>" +	
		"</div>",
	
	postCreate : function() {
		this.inherited(arguments);
		//解决报表显示问题
		dojo.style(this.fieldNode,'height','auto');
		if(dojo.isFF){
			this.browseNode.textContent=this._processText(this.label);
			this.cancelNode.textContent=this._processText(this.cancelText);
		}else{
			this.browseNode.innerText=this._processText(this.label);
			this.cancelNode.innerText=this._processText(this.cancelText);
		}
		//由于要处理的是真正的文文件上传,清空文本输入框的name属性
		dojo.removeAttr(this.inputNode,"name");
		this.fileInput.name = this.name;
		this.inputNode.readOnly = true;
		this.fileFilter = this.fileFilter? String(this.fileFilter).toLowerCase().split(",") : "";
		
		//事件绑定
		this.connect(this.cancelNode,"onclick","_cancelClick");
		dojo.isIE&&this.connect(this.inputNode,'onkeydown',"_stopBackSpaceKey");
		this._fileInputHandle=this.connect(this.fileInput,"onchange","_onChange");
	
	},
	
	getValue:function(){
		return this.getFullPath();
	},
	
	/**
	 * @summary:
	 * 		点击取消按钮之前触发。
	 * @description:
	 * 		如果返回为false就不执行清空文本框操作。
	 * @return:
	 * 		{boolean}
	 * @example:
	 * |	<div dojoType="unieap.form.FileInput" onBeforeCancel="fn">
	 * |	</div>
	 * |	function fn(){
	 * |		if(..)
	 * |		return false;
	 * |	}
	 */
	onBeforeCancel:function(){
		return true;
	},
	
	
	/**
	 * @summary:
	 * 		点击取消按钮时触发
	 * @param:
	 * 		{event} evt
	 */
	onCancel:function(evt){
	},
	
	/**
	 * @summary:
	 * 		重新选择文件时触发
	 */
	onChange:function(evt){
	},
	
	_stopBackSpaceKey:function(evt){
		//在IE8下，设置为文本框为readonly,但关闭依然可以置入
		//此时按住BACKSPACE键盘,页面会回退到上一页,这是ie浏览器本身的问题
		evt.keyCode==dojo.keys.BACKSPACE&&dojo.stopEvent(evt);
	},
	
	
	//当字符串的长度大于2时,剩下的字符以省略号显示
	_processText:function(str){
//		if(str.length>2){
//			str=str.substr(0,2)+"...";
//		}
		return str;
	},
	setDisabled : function(disabled){
		this.inherited(arguments);
		this.fileInput.disabled = disabled;
		this.browseNode.disabled = disabled;
		this.cancelNode.disabled = disabled;
	},
	//点击取消按钮时触发
	_cancelClick: function(evt) {
		if (unieap.fireEvent(this,this.onBeforeCancel,[])) {
			this._clearInput();
			unieap.fireEvent(this,this.onCancel,[evt]);
		}
	},
	
	/**
	 * @summary:
	 * 		清空控件的值
	 */
	clearInput: function() {
		this._clearInput();
	},
	
	//清空控件的值,在ie下需要删除fileinput再重新创建
	_clearInput:function(){
		if(dojo.isIE){
			var fileInput=dojo.clone(this.fileInput);
			this.realinputArea.innerHTML="";
			this.disconnect(this._fileInputHandle);
			dojo.place(fileInput,this.realinputArea);
			this.fileInput=fileInput;
			this._fileInputHandle=this.connect(this.fileInput,"onchange","_onChange");

		}
		this.inputNode.value="";
		this.fileInput.value="";
		
	},
	
	//当fileInput的值发生变化时触发
	_onChange: function(evt) {
		if (this._validateSuffix()) {
			this.inputNode.value=this.getFullPath();
			unieap.fireEvent(this,this.onChange,[evt]);
			this.getValidator().validate();
		} else {
			this._clearInput();
			dojo.require("unieap.dialog.MessageBox");
			MessageBox.alert({
				title:RIA_I18N.form.fileinput.info,
				message:RIA_I18N.form.fileinput.fileInvalidFormer+this.fileFilter.join(',')+RIA_I18N.form.fileinput.fileInvalidLatter
			});
		}
		
	},
	
	setValue:function(value){
		(value==null||typeof(value)=="undefined")&&(value="");
		this.inputNode.value =(value!=null?value:"");
		if(dojo.isIE){
			var fileInput=dojo.clone(this.fileInput);
			this.realinputArea.innerHTML="";
			this.disconnect(this._fileInputHandle);
			dojo.place(fileInput,this.realinputArea);
			this.fileInput=fileInput;
			this._fileInputHandle=this.connect(this.fileInput,"onchange","_onChange");

		}
		this.fileInput.value=(value!=null?value:"");
		this.fireDataChange();
	},
	
	
	
	
	//验证文件的后缀名
	_validateSuffix: function() {
		//获得文件名称
		var fileName = this.getFileName().toLowerCase();
		if (fileName) {
			//如果存在文件过滤
			if (this.fileFilter) {
				var index = fileName.lastIndexOf(".");
				//当文件路径为c:\demo\hello hello是一个没有后缀名的文件
				if(index==-1){
					return false;
				}
				//获得文件后缀名比如hello.txt后缀名为txt
				var fileSuffix = fileName.substring(index + 1);
				return dojo.some(this.fileFilter, function(type){
					return type == fileSuffix;
				});
			}
			return true;
		}
		return false;		
	},	
	
	//获得文件的名称,例如c:\demo\demo.txt,名称为demo.txt
	getFileName: function() {
		var value = this.fileInput.value;
		if (value) {
			var index = value.lastIndexOf("\\");
			var filename = value.substring(index + 1);
			return filename;
		} else {
			return "";
		}
	},
	
	/**
	 * @summary:
	 * 		获得文件的全路径,比如c:\demo\demo.txt
	 * @description:
	 * 		由于firefox安全策略的问题,在firefox下可能只能获得文件名demo.txt
	 */
	getFullPath:function(){
		return dojo.isFF?this._getFFPath(this.fileInput): this.fileInput.value;
	},
	
	//获取firefox的完整文件路径
	_getFFPath:function(fileBrowser) {
		var file=null;
	    try {
	        netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
		    var fileName=fileBrowser.value;
		    file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		    file.initWithPath(fileName.replace(/\//g, "\\\\"));
	    } 
	    catch (e) {
	    }
		if(file&&file.path){
			return file.path;
		}
		return fileBrowser.value;
}
});
