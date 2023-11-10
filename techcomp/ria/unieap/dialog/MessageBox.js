dojo.require("unieap.dialog.Dialog");
dojo.require("unieap.dialog.DialogUtil");
dojo.require("unieap.global");
dojo.provide("unieap.dialog.MessageBox");
 	/**
     * @summary:
     *     各种信息提示框的实现
     * @classDescription:
     *     使用了Dialog的核心实现，只是确定了内部显示的内容，并为按钮绑定固定的事件
     *     模拟的信息提示框并不会使JavaScript程序阻塞，所以要将得到结果后的逻辑写在回调函数中
     *     支持多种类型的提示框及多样化的配置参数，包括
     * 	   confirm : 带有两个按钮的简单确认对话框，
     * 	   cancelConfirm : 复杂的确认对话框，
     *     customerButtonConfirm : 自定义按钮的对话框
     *     prompt : 单行输入提示框
     *     multiPrompt : 多行输入提示框
     *     alert : 简单反馈信息的提示框
     *     autoCloseAlert : 可自动关闭的信息提示框
 	 * @declaredClass:
 	 *		unieap.dialog.MessageBox
 	 * @example:
 	 * |	MessageBox.confirm({
 	 * |		title:"confirm"
 	 * |	},node);
 	 * 		一个确认对话框
     */

 MessageBox = {
	
    /**
     * @summary:
     *		简单的确认对话框，带有两个按钮，默认分别显示为"确定"和"取消"，点击分别返回boolean类型的true或false，并执行用户自定义的操作
     * @param:
     * 		{object} config 设置确认信息框的参数，具体可设置参数见详述部分。
     * @param 
     * 		{domNode} node  提示框渐入渐出效果的开始和结束节点，只有设置animate为true，才能看出效果
     * @description:
     *		作用等同于window.confirm方法，弹出提示框包含两个按钮，对应的返回值分别为true和false，用户可以基于不同的返回值采取相应的操作
     *		config部分可设置参数如下：
     *			title：标题的显示内容，默认为"确认框"
     *			message ：文本要显示的内容，默认为"您是否确认?"
     *			onComplete：对话框关闭时要执行的回调函数
     *			yesStr：确认按钮的显示值，默认为"确认"
     *			noStr：取消按钮的显示值，默认为"取消"
     *			animate：是否使用渐入渐出效果，默认为false
     *			type：确定要显示确认框的显示图标，可选值为"warn"、"info"、"error"和"question"，默认为"question"
     *			iconCloseComplete：点击右上角的图标关闭确认框的时候，会不会触发回调函数，默认会触发,并且回调函数的参数值为"false"
     *			isClose：是否显示右上角的关闭图标,默认显示关闭按钮
     * @example:
     * |<div dojoType="unieap.form.Button" label="点击" id="confirm" onClick="fn"></div>
     * |<script type="text/javascript">
     * |	function fn(){
     * |		MessageBox.confirm({
     * |			onComplete: confirmReturn,
     * |			//关闭右上角的"X"按钮时执行onComplete函数
     * |			iconCloseComplete:true 
     * |		}, dojo.byId("confirm"));
     * |	}
     * |
     * |	function confirmReturn(value){
     * |		if(value==true){
     * |			alert('您选择了"确定"');
     * |		}else{
     * |			alert('您选择了"取消"');
     * |		}
     * |	}
     * |</script>
     *@img:
	 *      images/dialog/confirm.png
     */
    confirm: function(config, node){
        config = config || {};
        var _yesStr = config["yesStr"] ? config["yesStr"] : RIA_I18N.dialog.messageBox.confirm;
        var _noStr = config["noStr"] ? config["noStr"] : RIA_I18N.dialog.messageBox.cancel;
        var _text = config["message"] ? config["message"] : RIA_I18N.dialog.messageBox.confirmText;
		_text = this._stringConvert(_text);
		var type = config["type"];
        if (type != null) 
            type += "Icon";
        else {
            type = "questionIcon";
        }
		var  isanimate = config["animate"];
		if(typeof(isanimate)=='undefined'||isanimate==null){
			isanimate = unieap.animate;
		}
		var  isClose = config["isClose"];
		if(isClose!=false){
			isClose = true;
		}
		var isIconCloseComplete = config["iconCloseComplete"];
		if(isIconCloseComplete!=false){
			isIconCloseComplete = true;
		}
        var htmlObj = this._getConfirmObj(_text, type);
        var dialogConfig = {
            width: htmlObj["width"],
            height: htmlObj["Height"],
            title: config["title"] ? config["title"] : RIA_I18N.dialog.messageBox.confirmTitle,
            inner: htmlObj["obj"],
            onComplete: config["onComplete"],
            animate: isanimate,
            buttonFocus: true,
            isExpand: false,
            resizable: false,
			iconCloseComplete:isIconCloseComplete,
			isClose:isClose
        }
        var dialog = null,
        	topWin = unieap.getTopWin();
        if (topWin.DialogUtil && config["inner"]==null && topWin.document.getElementsByTagName("frameset").length == 0&& !window.opener) {
            dialog = topWin.DialogUtil.createDialog(dialogConfig);
        }
        else {
            dialog = DialogUtil.createDialog(dialogConfig);
        }
        dialog.addButton(_yesStr, function(){
            dialog.setReturn(true);
            dialog.close();
        }, dialog);
        dialog.addButton(_noStr, function(){
            dialog.setReturn(false);
            dialog.close();
        }, dialog);
		
		//confirm对话框,点击右上角的"X",返回为false
		isIconCloseComplete&&isClose&&dialog.setReturn(false);
        this._show(dialog, node);
    },
    
    /**
     *@summary:
     *      复杂的确认对话框
     * @param:
     *		{object} config 设置确认信息框的参数，具体可设置参数见详述部分。
     * @param 
     * 		{domNode}  node  提示框渐入渐出效果的开始和结束节点，只有设置animate为true，才能看出效果
     * @description:
     *		带有三个按钮的确认对话框，默认分别显示为"是"、"否"和"取消".
     *		点击按钮分别返回字符串类型的"yes"、"no"或"cancel"，并执行用户自定义的回调函数
     *		config部分可设置参数如下：
     *			title：标题的显示内容，默认为"确认框"
     *			message：要显示的内容，默认为"您是否要继续？"
     *			onComplete：对话框关闭时要执行的回调函数
     *			yesStr：返回值为"yes"的按钮的显示值，默认为"是"，用户可自定义
     *			noStr：返回值为"no"的按钮的显示值，默认为"否"，用户可自定义
     *			cancelStr：返回值为"cancel"的按钮的显示值，默认为"取消"，用户可自定义
     *			animate：是否使用渐入渐出效果，默认为false
     *			type：确定要显示确认框的显示图标，可选值为"warn"、"info"、"error"和"question"，默认为"question"
     *			iconCloseComplete：点击右上角的图标关闭确认框的时候，会不会触发回调函数，默认会触发并且回调函数的参数值为"cancel"
     *			isClose：是否显示右上角的关闭图标默认显示
     * @example:
     * |MessageBox.cancelConfirm({
     * |		onComplete: cancelConfirmReturn
     * |	}, document.getElementById("cancelconfirm"));
     * |function cancelConfirmReturn(value){
     * |	if(value=='yes'){
     * |		alert('您选择了"是"');
     * |	}else if(value=='no'){
     * |		alert('您选择了"否"');
     * |	}else{
     * |		alert('您选择了"取消"');
     * |	}
     * |}
     * @img:
	 *      images/dialog/cancelConfirm.png
     */
    cancelConfirm: function(config, node){
        config = config ||{};
        var _yesStr = config["yesStr"] ? config["yesStr"] : RIA_I18N.dialog.messageBox.yes;
        var _noStr = config["noStr"] ? config["noStr"] : RIA_I18N.dialog.messageBox.no;
        var _cancelStr = config["cancelStr"] ? config["cancelStr"] : RIA_I18N.dialog.messageBox.cancel;
        var _text = config["message"] ? config["message"] : RIA_I18N.dialog.messageBox.confirmText;
		_text = this._stringConvert(_text);
        var type = config["type"];
        if (type != null) 
            type += "Icon";
        else {
            type = "questionIcon";
        }
	   	var  isanimate = config["animate"];
		if(typeof(isanimate)=='undefined'||isanimate==null){
			isanimate = unieap.animate;
		}
		var  isClose = config["isClose"];
		if(isClose!=false){
			isClose = true;
		}
		var isIconCloseComplete = config["iconCloseComplete"];
		if(isIconCloseComplete!=false){
			isIconCloseComplete = true;
		}
        var htmlObj = this._getConfirmObj(_text, type);
        var dialogConfig = {
            width: htmlObj["width"],
            height: htmlObj["Height"],
            title: config["title"] ? config["title"] : RIA_I18N.dialog.messageBox.confirmTitle,
            inner: htmlObj["obj"],
            onComplete: config["onComplete"],
            animate: isanimate,
            buttonFocus: true,
            isExpand: false,
            resizable: false,
			iconCloseComplete:isIconCloseComplete,
			isClose:isClose
        }
        
        var dialog = null,
        	topWin = unieap.getTopWin();
        if (topWin.DialogUtil && config["inner"]==null && topWin.document.getElementsByTagName("frameset").length == 0&& !window.opener) {
            dialog = topWin.DialogUtil.createDialog(dialogConfig);
        }
        else {
            dialog = DialogUtil.createDialog(dialogConfig);
        }
		//添加"是"按钮
        dialog.addButton(_yesStr, function(){
            dialog.setReturn("yes");
            dialog.close();
        }, dialog);
		//添加"否"按钮
        dialog.addButton(_noStr, function(){
            dialog.setReturn("no");
            dialog.close();
        }, dialog);
		//添加"取消"按钮
        dialog.addButton(_cancelStr, function(){
            dialog.setReturn("cancel");
            dialog.close();
        }, dialog);
		
		//cancelConfirm对话框,点击右上角的"X",返回为cancel
		isIconCloseComplete&&isClose&&dialog.setReturn("cancel");
        
        this._show(dialog,node);
    },
    
    /**
     * @summary:
     *      自定义按钮的对话框
     * @param:
     * 		{object} config 设置确认信息框的参数，具体可设置参数见详述部分。
     * @param 
     * 		{domNode}  node  提示框渐入渐出效果的开始和结束节点，只有设置animate为true，才能看出效果
     * @description:
     *		如果默认的两种对话框无法满足需求，可以自定义按钮及其返回值，实现特定的需求  
     *		config部分可设置参数如下：
     *			title：标题的显示内容
     *			message ：要显示的内容
     *			onComplete：对话框关闭时要执行的回调函数
     *			animate：是否使用渐入渐出效果，默认为false
     *			type：确定要显示确认框的显示图标，可选值为"warn"、"info"、"error"和"question"，默认为"question"
     *			customerButtons：自定义按钮的数组，数组元素为JavaScript的对象，包含label、returnValue两个属性.
     *							分别代表该按钮的显示值、返回值
     *			iconCloseComplete：点击右上角的图标关闭确认框的时候，会不会触发回调函数，默认会触发,传入的参数值为null
     *			isClose：是否显示右上角的关闭图标,默认显示
     * @example:
     * |MessageBox.customerButtonConfirm({
     * |	onComplete: customerButtonConfirmReturn,
     * |	customerButtons: [{
     * |		label: "跳过",
     * |		returnValue: "skip"
     * |	}, {
     * |		label: "忽略",
     * |		returnValue: "ignore"
     * |	}, {
     * |		label: "确定",
     * |		returnValue: "confirm"
     * |	}, {
     * |		label: "取消",
     * |		returnValue: "cancel"
     * |	}]
     * |}, document.getElementById("customerbuttonconfirm"));
     * |function customerButtonConfirmReturn(value){
     * |	if(value=='skip'){
     * |		alert('您选择了"跳过"');
     * |	}else if(value=='ignore'){
     * |		alert('您选择了"忽略"');
     * |	}else if(value=='confirm'){
     * |		alert('您选择了"确定"');
     * |	}else{
     * |		alert('您选择了"取消"');
     * |	}
     * |} 
     * @img:
	 *      images/dialog/selfButton.png        
     */
    customerButtonConfirm: function(config,node){
		config = config||{};
        var _text = config["message"]?config["message"]:RIA_I18N.dialog.messageBox.confirmText;
		//config['html']是社保定制代码 zhaolei
		var html=config['html'];
		//将字符串中的script标签进行转义，防止脚本攻击
		html ? (_text=_text.replace(/<script(.*?)>/g,'&lt;script$1&gt;').replace(/<\/script\s*>/g,'&lt;/script&gt;')) : (_text=_text = this._stringConvert(_text));
        var buttons = config["customerButtons"];
        var type = config["type"];
        if (type != null) 
            type += "Icon";
        else {
            type = "questionIcon";
        }
	    var  isanimate = config["animate"];
		if(typeof(isanimate)=='undefined'||isanimate==null){
			isanimate = unieap.animate;
		}
		var  isClose = config["isClose"];
		if(isClose!=false){
			isClose = true;
		}
		var isIconCloseComplete = config["iconCloseComplete"];
		if(isIconCloseComplete!=false){
			isIconCloseComplete = true;
		}
        var htmlObj = this._getConfirmObj(_text, type);
        var dialogConfig = {
            width: htmlObj["width"],
            height: htmlObj["Height"],
            title: config["title"] ? config["title"] : RIA_I18N.dialog.messageBox.confirmTitle,
            inner: htmlObj["obj"],
            onComplete: config["onComplete"],
            animate: isanimate,
            buttonFocus: true,
            isExpand: false,
            resizable: false,
			iconCloseComplete:isIconCloseComplete,
			isClose:isClose
        }
        var dialog = null,
        	topWin = unieap.getTopWin();
        if (topWin.DialogUtil && config["inner"]==null && topWin.document.getElementsByTagName("frameset").length == 0&& !window.opener) {
			dialog = topWin.DialogUtil.createDialog(dialogConfig);
		}
		else {
			dialog = DialogUtil.createDialog(dialogConfig);
		}
        if (buttons&&buttons.length != 0) {
            for (var i = 0; i < buttons.length; i++) {
                obj = buttons[i];
                this._addButton(dialog, obj);
            }
        }
        this._show(dialog,node);
    },
    
    /**
     * @summary:
     *          单行输入提示框     
     * @param 
     * 		{object} config  设置输入提示框的参数，具体可设置参数见详述部分。
     * @param 
     * 		{domNode}  node  提示框渐入渐出效果的开始和结束节点，只有设置animate为true，才能看出效果
     * @description:
     *		此时文本框为单行，要求用户输入一定的交互信息，然后点击按钮确定或取消，
     *		返回值为一个JavaScript对象，包含两个属性分别为text和btn，第一个属性为string类型，值是文本框里的内容。第二个属性为boolean类型，标识用户点击了哪个按钮。
     *		config部分可设置参数如下：
     *			title：标题的显示内容，默认为"输入提示框"
     *			yesStr ：确定按钮的显示值，默认为"确定"，可自定义
     *			noStr ：取消按钮的显示值，默认为"取消"，可自定义
     *			message ：要显示的内容，默认为"请输入内容"
     *			onComplete：对话框关闭时要执行的回调函数
     *			animate：是否使用渐入渐出效果，默认为false
     *			iconCloseComplete：点击右上角的图标关闭确认框的时候，会不会触发回调函数，默认会触发且传入的参数值为{value:文本框的值,btn:false}
     *			isClose：是否显示右上角的关闭图标,默认显示
     * @example:
     * |MessageBox.prompt({
     * |		onComplete: promptReturn
     * |	}, document.getElementById("prompt"));	
     * |function promptReturn(value){
     * |		if(value.btn){
     * |			alert("您输入了"+'"'+value.text+'"');
     * |		}
     * |}
     * @img:
	 *      images/dialog/prompt.png    
     */
    prompt: function(config,node){
		config = config||{};
        this._prompt(config, "single",node);
    },
    
    /**
     * @summary:
     *          多行输入提示框     
     * @param:
     * 		{object} config  设置输入提示框的参数，具体可设置参数见详述部分。
     * @param:
     * 		{domNode}  node  提示框渐入渐出效果的开始和结束节点，只有设置animate为true，才能看出效果
     * @description:
     *		此时文本框为多行，要求用户输入一定的交互信息，然后点击按钮确定或取消，
     *		返回值为一个JavaScript对象，包含两个属性分别为text和btn，第一个属性为string类型，值是文本框里的内容，第二个属性为boolean类型，标识用户点击了哪个按钮。
     *		config部分可设置参数如下：
     *			title：标题的显示内容，默认为"输入提示框"
     *			yesStr ：确定按钮的显示值，默认为"确定"，可自定义
     *			noStr ：取消按钮的显示值，默认为"取消"，可自定义
     *			message ：要显示的提示内容，默认为"请输入内容"
     *			onComplete：对话框关闭时要执行的回调函数
     *			animate：是否使用渐入渐出效果，默认为false
     *			iconCloseComplete：点击右上角的图标关闭确认框的时候，会不会触发回调函数，默认会触发且传入的参数值为{text:文本框的值,btn:false}
     *			isClose：是否显示右上角的关闭图标,默认显示
     * @example:
     * |MessageBox.multiPrompt({
     * |		onComplete: promptReturn
     * |	}, document.getElementById("multiprompt"));	
     * |function promptReturn(value){
     * |		if(value.btn){
     * |			alert("您输入了"+'"'+value.text+'"');
     * |		}
     * |}
     * @img:
	 *      images/dialog/multiprompt.png    
     */
    multiPrompt: function(config,node){
        this._prompt(config, "multi",node);
    },
	
    /**
     * @summary:
     *       提供简单反馈信息的提示框
     * @param 
     * 		{object} config 设置信息提示框的参数，具体可设置参数见详述部分。
     * @param 
     * 		{domNode} node  提示框渐入渐出效果的开始和结束节点，只有设置animate为true，才能看出效果
     * @description:
     *		给用户一个提示，有一个按钮，点击后会将提示框关闭，但不会有任何返回值
     *		config部分可设置参数如下：
     *			title：标题的显示内容，默认为"确认框"
     *			message ：要显示的提示内容，默认为"信息提示"
     *			onComplete：对话框关闭时要执行的回调函数
     *			yesStr：确认按钮的显示值，默认为"确认"
     *			animate：是否使用渐入渐出效果，默认为false
     *			type : 确定要显示确认框的显示图标，可选值为"warn"、"info"、"error"和"question"，默认为"info"
     *			iconCloseComplete：点击右上角的图标关闭确认框的时候，会不会触发回调函数，默认会触发
     *			isClose：是否显示右上角的关闭图标,默认显示
     * @example:
     * |<script type="text/javascript">
     * |	MessageBox.alert(
     * |		{title:"提示信息",message:'请输入正确的姓名!'}
     * |	);
     * |</script>
     * @img:
	 *      images/dialog/alert.png    
     */
    alert: function(config,node){
    	//如果body没有初始化
    	if(!document.body) return;
		config = config||{};
        var _yesStr = config["yesStr"]?config["yesStr"]:RIA_I18N.dialog.messageBox.confirm;
        var _text = config["message"]?config["message"]:RIA_I18N.dialog.messageBox.infoText;
		_text = this._stringConvert(_text);
        var type = config["type"]||"info";
        if (type != null) 
            type += "Icon";
	  	 var  isanimate = config["animate"];
		if(typeof(isanimate)=='undefined'||isanimate==null){
			isanimate = unieap.animate;
		}
		var  isClose = config["isClose"];
		if(isClose!=false){
			isClose = true;
		}
		var isIconCloseComplete = config["iconCloseComplete"];
		if(isIconCloseComplete!=false){
			isIconCloseComplete = true;
		}
        var htmlObj = this._getConfirmObj(_text, type);
        var dialogConfig = {
            width: htmlObj["width"],
            height: htmlObj["Height"],
            title: config["title"] ? config["title"] : RIA_I18N.dialog.messageBox.confirmTitle,
            inner: htmlObj["obj"],
            onComplete: config["onComplete"],
            animate: isanimate,
            buttonFocus: true,
            isExpand: false,
            resizable: false,
			iconCloseComplete:isIconCloseComplete,
			isClose:isClose
        }
        var dialog = null,
        	topWin = unieap.getTopWin();
        if (topWin.DialogUtil && config["inner"]==null && topWin.document.getElementsByTagName("frameset").length == 0&& !window.opener) {
            dialog = topWin.DialogUtil.createDialog(dialogConfig);
        }
        else 
            dialog = DialogUtil.createDialog(dialogConfig);
        dialog.addButton(_yesStr, function(){
			dialog.close();
		}, dialog);
        this._show(dialog,node);
    },
	
    /**
     * @summary:
     *       可自动关闭的信息提示框
     * @param 
     * 		{object} config  设置信息提示框的参数，具体可设置参数见详述部分。
     * @param 
     * 		{domNode}  node  提示框渐入渐出效果的开始和结束节点，只有设置animate为true，才能看出效果
     * @description:
     *		本提示框不包含按钮，没有返回值，经过指定的时间后会自动消失并执行给定的回调函数。
     *		config部分可设置参数如下：
     *			title：标题的显示内容，默认为"自动关闭确认框"
     *			message ：要显示的提示内容，默认为"信息提示"
     *			onComplete：对话框关闭时要执行的回调函数
     *			animate：是否使用渐入渐出效果，默认为false
     *			type : 确定要显示确认框的显示图标，可选值为"warn"、"info"、"error"和"question"，默认为"info"
     *			durationTime ：信息提示框的显示持续的毫秒数，默认为1000，经过该段时间后提示框会自动关闭
     *      注意:当animate属性为true并且durationTime值小于1000时,durationTime的值会被重新设置成1000
     * @example: 
     * |<script type="text/javascript">
     * |	MessageBox.autoCloseAlert({
     * |		durationTime:'2000',
     * |		message:'自动关闭的提示框的提示信息',
     * |		type:'info'
     * |		}
     * |	);
     * |</script>
     * @img:
	 *      images/dialog/autoclose.png    
     */
    autoCloseAlert: function(config,node){
		config = config||{};
        var _text = config["message"]?config["message"]:RIA_I18N.dialog.messageBox.infoText;
		_text = this._stringConvert(_text);
        var type = config["type"]||"info";
        if (type != null) 
            type += "Icon";
		var  isanimate = config["animate"];
		if(typeof(isanimate)=='undefined'||isanimate==null){
			isanimate = unieap.animate;
		}
        var htmlObj = this._getConfirmObj(_text, type);
        var dialogConfig = {
            width: htmlObj["width"],
            height: htmlObj["Height"],
            title: config["title"] ? config["title"] : RIA_I18N.dialog.messageBox.autoClose,
            inner: htmlObj["obj"],
            onComplete: config["onComplete"],
            animate: isanimate,
            buttonFocus: true,
            isExpand: false,
            resizable: false,
			isClose : false
        }
        var dialog = null,
        	topWin = unieap.getTopWin();
        if (topWin.DialogUtil && config["inner"]==null && topWin.document.getElementsByTagName("frameset").length == 0&& !window.opener) {
            dialog = topWin.DialogUtil.createDialog(dialogConfig);
        }
        else
            dialog = DialogUtil.createDialog(dialogConfig);
        this._show(dialog,node);
        var timer = parseInt(config["durationTime"]);
		timer?isanimate&&timer<1000&&(timer=1000):(timer = 1000);
        setTimeout(function(){
            dialog.close()
        }, timer);
    },
	
	// 增加按钮
    _addButton: function(dialog, obj){
        dialog.addButton(obj.label, function(){
            dialog.setReturn(obj.returnValue);
            dialog.close();
        }, dialog);
    },
    //得到各种confirm的主显示区域内容
    _getConfirmObj : function(text, icon){
        var obj = dojo.create("span");
		
        obj.innerHTML = text;
		dojo.mixin(obj.style,{
			'display':'inline-block'
		})
        document.body.appendChild(obj);
        var _width = obj.offsetWidth;
        if (_width == 0) 
            _width = 50;
        _width += 92;
        if (_width < 280) 
            _width = 280;
        if (!icon && _width > 50) {
            _width = _width - 32;
        }
        _height = obj.offsetHeight;
        if (_height == 0) 
            _height = 20;
        _height += 91;
        dojo.destroy(obj);
        obj = null;	
        var sInfo = "<table  vlign='center' style='width:100%;height:100%' class='messageBg'><tr>";
        sInfo += "<td align='center'><table border=0><tr><td class='" + icon +
        "'><td style='text-align:left;'> " +
        text +
        "</td></tr></table></td></tr></table>"
        return {
            width: _width,
            Height: _height,
            obj: sInfo
        };
    },
    // 显示
    _show: function(dialog, node){
        if (node == null) {
            dialog.show();
        }
        else {
            dialog.show(node);
        }
    },
    
    //单行和多行输入的统一入口
	 _prompt: function(config, type,event){
        var _yesStr = config["yesStr"]?config["yesStr"]:RIA_I18N.dialog.messageBox.confirm;
        var _noStr = config["noStr"]?config["noStr"]:RIA_I18N.dialog.messageBox.cancel;
        var _text = config["message"]?config["message"]:RIA_I18N.dialog.messageBox.inputContent;
		_text = this._stringConvert(_text);
        var htmlObj = null;
        if (type == "multi") {
            htmlObj = this._getMultiPromptObj(_text);
        }
        else {
            htmlObj = this._getPromptObj(_text);
        }
	    var  isanimate = config["animate"];
		if(typeof(isanimate)=='undefined'||isanimate==null){
			isanimate = unieap.animate;
		}
		var  isClose = config["isClose"];
		if(isClose!=false){
			isClose = true;
		}
		var isIconCloseComplete = config["iconCloseComplete"];
		if(isIconCloseComplete!=false){
			isIconCloseComplete = true;
		}
        var dialogConfig = {
            width: htmlObj["width"],
            height: htmlObj["Height"],
            title: config["title"] ? config["title"] : RIA_I18N.dialog.messageBox.promptDialog,
            inner: htmlObj["obj"],
            onComplete: config["onComplete"],
            animate: isanimate,
            buttonFocus: false,
            isExpand: false,
            resizable: false,
			iconCloseComplete:isIconCloseComplete,
			isClose:isClose
        }
		
		//点击右上角的"X"时执行
		isIconCloseComplete && isClose && (dialogConfig["onImgClose"]=function(){
			var _value = dialog.getWindow().document.getElementById("promptText").value;
			this.setReturn({text:_value,btn:false});
		});
		
        var dialog = null,
        	topWin = unieap.getTopWin();
        if (topWin.DialogUtil && config["inner"]==null && topWin.document.getElementsByTagName("frameset").length == 0&& !window.opener) {
			dialog = topWin.DialogUtil.createDialog(dialogConfig);
		}
		else {
			dialog = DialogUtil.createDialog(dialogConfig);
		}
        // 确认按纽。
        dialog.addButton(_yesStr, function(){
            var _value = dialog.getWindow().document.getElementById("promptText").value;
            dialog.setReturn({
                text: _value,
                btn: true
            });
            dialog.close();
        }, dialog);
        // 取消按纽。
        dialog.addButton(_noStr, function(){
             var _value = dialog.getWindow().document.getElementById("promptText").value;
            dialog.setReturn({
                text: _value,
                btn: false
            });
            dialog.close();
        }, dialog);
		
        this._show(dialog,event);
        window.setTimeout(function(){
           dialog.getWindow().document.getElementById("promptText").focus();
        }, 500);
    },
	 // 获得promp对象
    _getPromptObj: function(text){
        var obj = dojo.create("span");
        obj.innerHTML = text;	
			dojo.mixin(obj.style,{
				'display':'inline-block'
			})
        document.body.appendChild(obj);
        var _width = obj.offsetWidth;
        if (_width == 0) 
            _width = 50;
        _width += 92;
        if (_width < 280) 
            _width = 280;
        _height = obj.offsetHeight;
        if (_height == 0) 
            _height = 20;
        _height += 91;
        if (_height < 110) 
            _height = 110;
        dojo.destroy(obj);
        obj = null;// 直接删除对象。
        var sInfo = "<table  vlign='center' style='width:100%;height:100%' class='messageBg'>";
        sInfo += "<tr><td > " + text + "</td></tr>";
        sInfo += "<tr><td ><input type='text' style='width:" + (_width - 25) +"px' id='promptText'></td></tr></table>"
        return {
            width: _width,
            Height: _height,
            obj: sInfo
        };
    },
    // 获得promp对象
    _getMultiPromptObj: function(text){
        var obj = dojo.create("span");
        obj.innerHTML = text;
		dojo.mixin(obj.style,{
			'display':'inline-block'
		})
        document.body.appendChild(obj);
        var _width = obj.offsetWidth;
        if (_width == 0) 
            _width = 50;
        _width += 92;
        if (_width < 300) 
            _width = 300;
        _height = obj.offsetHeight;
        if (_height == 0) 
            _height = 20;
        _height += 162;
        if (_height < 180) 
            _height = 180;
        dojo.destroy(obj);
        obj = null;

        var sInfo = "<table  vlign='center' style='width:100%;height:100%' class='messageBg'>";
        sInfo += "<tr><td > " + text + "</td></tr>";
        sInfo += "<tr><td ><textarea rows='4' style='font-size:12pt;width:" + (_width - 25) + "px'  id='promptText'></textarea></td></tr></table>"
        return {
            width: _width,
            Height: _height,
            obj: sInfo
        };
    },	
	_stringConvert: function(text){
		text = this._convertEnterStr(text);//转换\n,\r\n为换行符号
		var textArr = text.split("@br@");//将字符串按行划分成数组
		var newStr = "";
		dojo.forEach(textArr,dojo.hitch(this,function(str){
			(newStr !="")&&(newStr += "@br@");
			newStr += this._textSplit(str);
		}));//根据长度和字符串定义重新转换字符串
		text = this._convertEnterBack(newStr);
		return this._convertCommonStr(text);//将字符串转换为标准字符串
	},
	_textSplit: function(text){	
		var str = text;
		var newStr="";
		var len = 0;
		while(text.length > 0){
			(newStr!="")&&(newStr += "@br@");
			var str_temp = this._subString(text,100);
			len = str_temp.length;
			newStr += str_temp;
			text = text.slice(len,(text.length));
		}
		newStr == ""?newStr = "@br@" + text:newStr += text;
		return newStr;
	},
	_subString:function(str,length){//length为要截取的长度
		var step=0; //当为汉字时，step增2，数字或者字母增1
		var str_temp="";
		for(var i=0;i<str.length;i++){
			if(str.charCodeAt(i)>255){
				step=step+2;
			}else{
				step=step+1;
			}
			if(step>length){
				return str_temp;
			}
			str_temp=str_temp+str.charAt(i);
		}
		return str;
	},
	_convertEnterStr: function(str){
		var RexStr = /\n|\r\n/g;
		str = str.replace(RexStr,    
	        function(MatchStr){    
	            switch(MatchStr){    
					case "\n":
						return "@br@";
						break;
					case "\r\n":
						return "@br@";
						break;       
	                default :    
	                    break;    
	            }    
	        }    
	    );
		return str;	
	},
	_convertEnterBack: function(str){
		var RexStr = /@br@/g;
		str = str.replace(RexStr,"\n");
		return str;	
	},
	_convertCommonStr: function(str){
		return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#39;").
		replace(/\n/g,"<br>").replace(/\t/g,"&nbsp;&nbsp;").replace(/\s/g,"&nbsp;");   
	}	
};