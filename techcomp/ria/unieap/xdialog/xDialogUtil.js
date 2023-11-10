dojo.provide("unieap.xdialog.XDialogUtil");
/*
dojo.declare("unieap.xdialog.XDialogUtil",[dijit._Widget, dijit._Templated],{
/**
 * @summary:
 * 		对话框组件的辅助工具类
 * @classDescription:
 * 		提供了对对话框组件的辅助方法类
 * 		在页面引入该文件后，会创建一个XDialogUtil对象，以后的对话框操作可以借用该类进行实现
 * 		在主页面引用该文件且主框架非frameset结构的话，若页面内容通过链接确定，能够实现对话框在最外层的页面进行显示
 * @declaredClass:
 *		unieap.xdialog.XDialogUtil
 */

(function(){
	if(typeof this["XDialogUtil"] == "undefined") {
		//在页面引入该文件后，会创建的一个对象
		this.XDialogUtil = {};
		//存储对话框引用的数组
	    //this.XDialogUtil.dialogs = [];
	}
	
	XDialogUtil = {
		//存放打开的dialog堆栈，dialog可以一层一层地弹出
		dialogs : [],
		//社保需求，可以同时打开多个dialog，相互之间没有调用关系，自己控制dialog
		//在hndlDlgs中的dialog不会放入dialogs中
		hndlDlgs: [],
		
		/**
		 * @summary:
		 *        创建并显示一个对话框
		 * @param 
		 *         {object} config  对话框的配置信息
		 * @param 
		 *         {domNode} srcElement  渐入渐出效果的起始终结元素
		 * @param 
		 *         {object} handle  任意形式的对象，标识用户控制的dialog，由用户自己维护
		 * @return 
		 *         {unieap.dialog.Dialog}
		 * @description:
		 *         创建对话框并显示
		 *         如对话框的内容不是通过inner确定的，而是指向一个url并且最外层框架不是frameset，将会试图在最外层上创建此对话框
		 *         如果对话框的内容是通过inner方式确定的，只能在当前帧上创建对话框，此时拖拽时只能限于当前帧的区域
		 *         会将产生的对话框组件作为返回值
		 * @example:
		 * |var dialog = XDialogUtil.showDialog({
		 * |	inner: "Hello World!",
		 * |	title:"Hello World!",
		 * |	height:"200",
		 * |	width:"200"
		 * |}, document.getElementById("sourceNode"));
		 *         
		 */
		showDialog: function(config,srcElement,handle) {
			/*
			 * 为事业部扩展提供切入点，不要删除
			 */
			config = this._config_show_ex(config,srcElement);
			
			var dialog = null,
				topWin = unieap.getTopWin();
			if (topWin.XDialogUtil&&config["inner"]==null&&topWin.document.getElementsByTagName("frameset").length==0&& !window.opener) {
				dialog = topWin.XDialogUtil.createDialog(config,handle);
			} else {
				dialog = this.createDialog(config,handle);
			}
			if (srcElement) {
				dialog.show(srcElement);
			} else {
				dialog.show();
			}
			return dialog;
		},
		   
		_config_show_ex: function(config, srcElement) {
			return config;
		},
	 
		/**
	     * @summary:
	     *     创建一个对话框
	     * @param 
	     *       {object} config  该对话框的配置参数
	     * @param 
	     *       {object} handle  任意形式的对象，标识用户控制的dialog，由用户自己维护
	     *  @return
	     *       {unieap.xdialog.Dialog}
	     * @description:
	     *      创建一个对话框，不进行显示，需要用户手动调用Dialog的show方法进行显示
	     *      如对话框的内容不是通过inner确定的，而是指向一个url并且最外层框架不是frameset，将会试图在最外层上创建此对话框
		 *      如果对话框的内容是通过inner方式确定的，只能在当前帧上创建对话框，此时拖拽时只能限于当前帧的区域
		 *      会将产生的对话框组件作为返回值
		 * 	@example:
		 * |var dialog = XDialogUtil.createDialog({
		 * |	inner: "Hello World!",
		 * |	title:"Hello World!",
		 * |	height:"200",
		 * |	width:"200"
		 * |});
		 * |dialog.show();
	     */
		createDialog: function(config,handle) {
			/*
			 * 为事业部扩展提供切入点，不要删除
			 */
			config = this._config_create_ex(config);
				
			var context = null,
				topWin = unieap.getTopWin();
			if(topWin.XDialogUtil&&config["inner"]==null&&topWin.document.getElementsByTagName("frameset").length==0&& !window.opener){
				context = topWin;
			}else{
				context  = window;
			}
			dojo.require("unieap.xdialog.Dialog");
			var dialog=	new context.unieap.xdialog.Dialog(config);
			if (handle) {
				context.XDialogUtil.hndlDlgs.push({hnd:handle,dlg:dialog});
				var idx = -1;
				for (i in context.XDialogUtil.dialogs) {
					if (context.XDialogUtil.dialogs[i]==dialog) {
						idx=i;
						break;
					}
				}
				if (idx!=-1)
					context.XDialogUtil.removeDialog(idx);
			}
			return dialog;
		},
		
		_config_create_ex: function(config) {
			return config;
		},
		
		//在dialog数组中，添加某一对象，在对话框新建的时候会调用
		addDialog: function(dialog) {
			if (unieap.getXDialog(dialog))
				return;
			if (this.dialogs) {
				this.dialogs.push(dialog);
			}
		},
		
		//得到对话框数组
		getDialogs: function() {
			return this.dialogs;
		},
	
		//在dialog数组中，移除某一对象，在对话框关闭的时候会调用
		removeDialog: function(idx) {
			if (typeof idx=="number") {
				this.dialogs.splice(idx,1);
			} else {
				var handle = idx,i=-1;
				for(el in this.hndlDlgs) {
					if (this.hndlDlgs[el].hnd==handle||this.hndlDlgs[el].dlg==handle) {
						i = el;
						break;
					}
				}
				if (i!=-1) {
					this.hndlDlgs.splice(Number(i), 1);
				}
			}	
		},
	
		//得到最上层的对话框
		getDialog: function(handle){
			if (handle) {
				for(el in this.hndlDlgs) {
					if (this.hndlDlgs[el].hnd==handle||this.hndlDlgs[el].dlg==handle)
						return this.hndlDlgs[el].dlg;
				}
				return null;
			}
			var dialogDom = XDialogUtil.getDialogs();
		    if (dialogDom == null) {
				return null;
			}
			var l = dialogDom.length - 1;
			if (l >= 0) {
				for(var i=l;i>=0 ;i--) {
					var diaObj = dialogDom[i];
					if(diaObj != null) {
						return diaObj;
					}
				}
			}
		}
	}
})();
