dojo.provide("unieap.xdialog.Dialog");
dojo.require("dojo.fx");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("unieap.xdialog.XDialogUtil");

dojo.declare("unieap.xdialog.Dialog", [dijit._Widget, dijit._Templated], {
	/**
	 * @declaredClass:
	 * 		unieap.xdialog.Dialog
	 * @summary:
	 * 		模态对话框实现类
	 * @classDescription:
	 *     	可以自定义显示内容，样式。
	 *     	可以通过脚本或标签创建Dialog。
	 *     	支持动画效果。
	 *     	支持拖拽位置，拖拽边框改变大小。
	 * @example:
	 * |var dialog = new unieap.xdialog.Dialog({
	 * |	inner: "Hello World!",
	 * |	title:"Hello World!",
	 * |	height:"200",
	 * |	width:"200"
	 * |});
	 * |dialog.show();
	 * @example:
	 * |var dialog = XDialogUtil.showDialog({
	 * |	inner: "Hello World!",
	 * |	title:"Hello World!",
	 * |	height:"200",
	 * |	width:"200"
	 * |});
	 * 		初始化一个Dialog,并显示出来
	 * @img:
	 *      images/dialog/dialog.png
	 */

	/**
	 * @summary:
	 *      	回调函数的上下文，用户一般较少用到
	 * @type:
	 *   	{object}
	 * @default:
	 *     	null
	 * @description:
	 *     	对话框关闭的时候，调用的回调函数的上下文，也就是函数的this。
	 * @example:
	 * |<div dojoType="unieap.form.TextBox" id='text' value="initText"></div>
	 * |var dialog = new unieap.xdialog.Dialog(
	 * |		{${1}src:unieap.byId("text"),
	 * |     iconCloseComplete: true,
	 * |		onComplete:test,
	 * |		url:"<%=appPath%>/pages/samples/dialog/inner.jsp"}
	 * |);
	 * |function test(){
	 * |		alert(${2}this.getValue())
	 * |}
	 * ${1}src配置的对象
	 * ${2}将会成为回调函数的this
	 */
	src : null,

	/**
	 * @summary:
	 *      对话框的宽度
	 * @type:
	 *   	{number}   
	 * @description:
	 *     	对话框的默认宽度，单位为"px"。如果不设置将会根据内容自动撑开。
	 */
	width : "",

	/**
	 * @summary:
	 * 		对话框的高度
	 * @type:
	 * 		{number}
	 * @description:
	 * 		对话框的默认高度，单位为"px"。如果不设置将会根据内容自动撑开。
	 */
	height : "",

	/**
	 * @summary:
	 * 		对话框的标题
	 * @type:
	 * 		{string}
	 * @default:
	 * 		对话框
	 */
	title : RIA_I18N.dialog.dialog.title,

	/**
	 * @summary:
	 * 		对话框关闭的回调函数
	 * @type:
	 * 		{function}
	 * @default:
	 * 		null
	 * @description: 
	 * 		对话框关闭时，会执行的回调函数
	 * 		当通过关闭按钮关闭对话框时，需要将iconCloseComplete设置为true才能执行回调函数
	 * 		如果通过脚本关闭对话框不需要设置iconCloseComplete 其参数通过setReturn方法进行设置
	 */
	onComplete : null,

	/**
	 * @summary:
	 *      对话框内的显示内容
	 * @type:
	 *   	{string|domNode}
	 * @default:
	 *     	null
	 * @description:
	 *     	通过指定html代码片段或domNode确定对话框内的显示内容
	 *     	若同时配置了url，以url属性优先
	 * @example:
	 * |var inner = "对话框显示的内容是预先定义，该对话框可以最大化和拖拽改变位置。"
	 * |var dialog = new unieap.xdialog.Dialog({inner:inner});
	 * |dialog.show(document.getElementById("btn1"));
	 */
	inner : "",

	/**
	 * @summary:
	 * 		是否显示渐入渐出效果
	 * @type:
	 * 		{boolean}
	 * @default:
	 * 		读取unieap.animate的值
	 * @description:
	 *      在对话框生成和关闭的时候，会有渐入渐出的效果
	 */
	animate : (typeof(unieap.animate) == 'undefined') ? true : unieap.animate,

	/**
	 * @summary:
	 *      对话框内容的链接地址
	 * @type:
	 *   	{string}
	 * @default:
	 *     	null
	 * @description:
	 *    	指定一个链接地址，作为对话框的显示内容
	 * @example:
	 * |var dialog = new unieap.xdialog.Dialog({url:"<%=appPath%>/pages/samples/dialog/inner.jsp"});
	 * |dialog.show(document.getElementById("btn2")); 
	 */
	url : "",

	/**
	 * @summary:
	 *      是否支持最大化功能
	 * @type:
	 *   	{boolean}
	 * @default:
	 *    	true
	 * @description:
	 *    	设置是否显示最大化按钮，若显示的话，点击会将对话框扩大至整个页面
	 */
	isExpand : true,

	/**
	 * @summary:
	 *      是否按照显示器窗口大小最大化显示
	 * @type:
	 *   	{boolean}
	 * @default:
	 *     	false
	 * @description:
	 *    	设置是否按照显示器窗口大小最大化显示
	 */
	isMax : false,

	/**
	 * @summary:
	 *      是否支持图标关闭功能
	 * @type:
	 *   	{boolean}
	 * @default:
	 *     	true
	 * @description:
	 * 		设置是否显示关闭按钮，若不显示的话，只能通过程序控制进行对话框的关闭
	 * 		适用于用户必须作出一定输入的情况
	 */
	isClose : true,

	/**
	 * @summary:
	 *      是否可以通过拖拽重设对话框大小
	 * @type:
	 *   	{boolean}
	 * @default:
	 *     	true
	 */
	resizable : true,

	/**
	 * @summary:
	 *      对话框的最小宽度
	 * @type:
	 *   	{number}
	 * @default:
	 *     	185
	 * @description:
	 *      为了保证对话框的显示效果，可设置本属性的值
	 *      若指定的width小于最小宽度，将以最小宽度的值进行显示
	 *      在允许拖拽调整大小的情况下，调整后对话框的宽度不会小于此值
	 */
	minWidth : "185",

	/**
	 * @summary:
	 *      对话框的最小高度
	 * @type:
	 *   	{number}
	 * @default:
	 *     	80
	 * @description:
	 *      为了保证对话框的显示效果，可设置本属性的值
	 *      若指定的height小于最小高度，将以最小宽度的值进行显示
	 *      在允许拖拽调整大小的情况下，调整后对话框的高度不会小于此值
	 */
	minHeight : "80",

	/**
	 * @summary:
	 *      父窗口传递到弹出窗口的对象
	 * @type:
	 *   	{object}
	 * @default:
	 *     	null
	 * @description:
	 *     	父窗口传递到对话框的数据
	 *     	对话框组件可以使用getObject方法得到该对象
	 * @example:
	 * |XDialogUtil.showDialog({
	 * |		url:"<%=appPath%>/pages/samples/dialog/target.jsp",
	 * |		onComplete:bindDataToForm,
	 * |		dialogData:{name:"param1",value:"param2"}
	 * |		width:"500",
	 * |		height:"400"},
	 * |	toSelect.domNode);
	 */
	dialogData : null,

	/**
	 * @summary:
	 *      点击右上角的关闭按钮时，是否调用回调函数
	 * @type:
	 *   	{boolean}
	 * @default:
	 * 		false
	 * @description:
	 * 		通过点击右上角的关闭按钮，将对话框关闭的时候，是否会调用回调函数
	 * 		默认值为false，即点击按钮关闭对话框，将不会调用指定的回调函数
	 */
	iconCloseComplete : false,

	/**
	 * @summary:
	 *      设置载入超时
	 * @type:
	 *   	{boolean}
	 * @default:
	 * 		10
	 * @description:
	 * 		在使用url方式载入时，可设置载入超时，单位为秒
	 * 		对话框载入期间，不允许用户关闭，当超过这个时间后，若对话框还未载入成功，则允许关闭
	 */
	timeout: 10,

	/**
	 * @summary:
	 * 		和dialogData类似，但是它配置一个函数来供用户使用
	 * @type:
	 * 		{function}
	 * @description:
	 *     	该对象可以通过getObject方法执行配置的function
	 * @example:
	 * |<div dojoType="unieap.xdialog.Dialog" id="dialog" url="/demo.do" getDialogData="fn"></div>
	 * |function fn(){
	 * |	//用户自己处理、获取数据
	 * |	var obj=someMethod.getObj();
	 * |	return obj;
	 * |}
	 * |
	 * |var dialog = unieap.byId("dialog");
	 * |alert(dialog.getObject());
	 */
	getDialogData : null,

	// 按纽列表，内部属性，供信息提示框使用，记录按钮的引用
	buttons : null,

	// 移动和拖拽调整大小时显示的层
	_moveDiv : null,

	// 返回数据对象
	returnObj : null,

	// 临时的事件，当对话框进行拖动时会用到
	tempEvents : null,

	// 渐入渐出时开始的x坐标，在渐入渐出时都会用到
	startx : null,

	// 渐入渐出时开始的y坐标，在渐入渐出时都会用到
	starty : null,

	// 渐入渐出时开始的宽度，在渐入渐出时都会用到
	startWidth : null,

	// 渐入渐出时开始的高度，在渐入渐出时都会用到
	startHeight : null,

	// 开始时对话框顶部所在x的位置，用于对话框的拖拽位置
	startHeadx : 0,

	// 开始时对话框顶部所在y的位置，用于对话框的拖拽位置
	startHeady : 0,

	// 拖拽前对话框的x位置
	winStartx : 0,// 窗口的最初位置。

	// 拖拽前对话框的y位置
	winStarty : 0,// 窗口的最初位置。

	// 是否在移动
	isHeadmove : false,

	// 是否正在进行resize操作
	isResizing : false,

	// 要调整大小的方式
	resizeType : '',

	// 按钮是否获得焦点，用于信息提示框组件，对于除输入型的信息提示框外，需要在生成的时候，进行焦点聚焦
	buttonFocus : null,

	_iconClose : false,

	// 在已经有弹出对话框的情况下，再次弹出对话框 此属性指前一对话框
	preDialog : null,

	// 对话框已弹出且再次弹出别的对话框时，用于遮挡本对话框的层
	_modalDiv : null,

	// 是否处于最大化状态
	_isExpanded : false,

	// 对话框初始应该显示的位置
	_initX : null,

	// 对话框初始应该显示的位置
	_initY : null,

	// 记录对话框在最大化时的参数，以确定当恢复原状时的位置和大小
	_beforeExpandPara : null,

	_isReady : false,

	_isShow : false,

	// 是否根据显示的内容确定对话框高宽
	_autoWidth : false,

	_autoHeight : false,

	_buttonArea : null,

	templateString : 
		"<div class='u-xdlg' dojoAttachPoint='mainNode' style='display:none'>" +
			"<div class='u-xdlg-mt' dojoAttachPoint='topNode'>" +
				"<div class='u-xdlg-mtl'></div>" +
				"<div class='u-xdlg-mtr'></div>" +
				"<div class='u-xdlg-mtc' dojoAttachPoint='topContentNode'>" +
					"<div class='u-xdlg-mtt' dojoAttachPoint='dialogTitleNode'></div>" +
					"<div class='u-xdlg-mtb' dojoAttachPoint='topButtonNode'>" +
						"<span class='u-xdlg-bc' dojoAttachPoint='closeNode'>&nbsp;&nbsp;&nbsp;&nbsp;</span>" +
						"<span class='u-xdlg-be' dojoAttachPoint='enlargeNode'>&nbsp;&nbsp;&nbsp;&nbsp;</span>" +
					"</div>" +
				"</div>" +
			"</div>" +
			"<div class='u-xdlg-mm' dojoAttachPoint='dialogMiddle'>" +
				"<div class='u-xdlg-ml' dojoAttachPoint='dialogLeftBorder'></div>" +
				"<div class='u-xdlg-mr' dojoAttachPoint='dialogRightBorder'></div>" +
				"<div class='u-xdlg-mmm' dojoAttachPoint='dialogMiddleMain'>" +
					"<div class='u-xdlg-mmf' dojoAttachPoint='dialogMain' style='height:100%'>" +
						"<div class='u-xdlg-mmc' dojoAttachPoint='dialogMainContent'></div>" +
					"</div>" +
					"<div class='u-xdlg-mmb' style='display:block;' align='center'" +
						"dojoAttachPoint='dialogMiddleButton'></div>" +
				"</div>" +
			"</div>" +
			"<div class='u-xdlg-mb'  dojoAttachPoint='dialogBottom'>" +
				"<div class='u-xdlg-mbl' dojoAttachPoint='dialogBottomLeft'></div>" +
				"<div class='u-xdlg-mbr' dojoAttachPoint='dialogBottomRight'></div>" +
			"</div>" +
			"<div dojoAttachPoint='containerNode' style='display:none'></div>" +
		"</div>",

	postCreate : function() {
		// _createDlgWithTag用来判断dialog是否通过标签来创建
		this.enlargeNode.title = RIA_I18N.dialog.dialog.maximinze;
		this.closeNode.title = RIA_I18N.dialog.dialog.close;
		this.srcNodeRef && (this._createDlgWithTag = true);
		if (!this._createDlgWithTag) {
			// 如果当前dialog弹出之前已经存在dialog,创建一个蒙层挡住之前的dialog
			this.updatePreDlg();
			// 注册该对话框
			this.addDialog(this);
			// 创建当前对话框的iframe
			this.initModal();
			// 创建移动对象。
			this._createMoveDiv();
		}
		// 让已经聚焦的其他控件失去焦点
		unieap.blurWidget();
		this.buttons = [];
		this.tempEvents = [];
		// 若当前对话框的前面已经有一个模态对话框，则再次弹出模态对话框时，将前一对话框遮挡住
		if (this.inner && typeof(this.inner) == "object" 
		&& this.inner.parentNode && this.inner.parentNode.nodeType != 11) {
			this.innerParentNode = this.inner.parentNode;
		}
		document.body.appendChild(this.domNode);
		this._dealDialogSize();
		// 保存原始的url
		this.originUrl = this.url;
		/*
		 * 为事业部扩展提供切入点，不要删除
		 */
		this._postCreate_ex();
		//单帧下关闭页面时销毁对应的dialog
		//有可能该xDialog是在另一个xDialog中打开的
		if(this._rootID != ""){
			var rootWidget = dijit.byId(this._rootID);
			if(rootWidget instanceof unieap.xdialog.Dialog){
				if(!rootWidget._dialogs){
					rootWidget._dialogs = [];
				}
				rootWidget._dialogs.push(this);
			}else{
				var framePageContainer = unieap.byId("framePageContainer");
				if(typeof framePageContainer  != 'undefined' && framePageContainer.getSelectedTab()){
					var currentTab = framePageContainer.getSelectedTab().NavigatorContainer?framePageContainer.getSelectedTab().NavigatorContainer.getSelectedTab():framePageContainer.getSelectedTab();
				}
				if(currentTab){
					var container4Dialog = currentTab;
					if(!container4Dialog.dialog) container4Dialog.dialog = {};
					container4Dialog.dialog[this.id] = 1;
				}
			}
		}
	},

	// 处理dialog的高度和宽度
	_dealDialogSize : function() {
		this.minWidth = parseInt(this.minWidth, 10);
		this.minHeight = parseInt(this.minHeight, 10);
		if (this.isMax) {
			var vs = dojo.window.getBox();
			this.width = vs.w;
			this.height = vs.h;
			this._isExpanded = true;
			this.enlargeNode.className = "u-xdlg-bs";
		} else {
			// 宽度处理
			if (this.width && this.width != "auto") {
				this.width = parseInt(this.width, 10);
				if (this.width < this.minWidth) {
					this.width = this.minWidth;
				}
			} else {
				this.width = 50;
				this._autoWidth = true;
			}
			// 高度处理
			if (this.height && this.height != "auto") {
				this.height = parseInt(this.height, 10);
				if (this.height < this.minHeight) {
					this.height = this.minHeight;
				}
			} else {
				this.height = 80;
				this._autoHeight = true;
			}
		}
	},

	_postCreate_ex : function() {

	},

	// 如果当前的dialog之前已经存在dialog，在之前的dialog上加一个蒙层
	updatePreDlg : function() {
		var aDlg = this.getUtil().getDialogs(), 
			preDlg = aDlg && aDlg[aDlg.length - 1];
		if (preDlg) {
			this.preDialog = preDlg;
			preDlg._isShow && this._createModalDiv();
			this.mainNode.style.zIndex = Number(preDlg.mainNode.style.zIndex) + 2;
		}
		else{
			this.mainNode.style.zIndex = 2000;
		}
	},

	innerShow : function() {
		// 真正显示对话框
		this.initShowContent();
		// 用div标签创建的dialog不用多次进行数据绑定
		!this._dlgClosed && this.initEvent();
		this.domNode.style.display = "block";
		if (this._isUseButton() && this.buttonFocus) {
			this.buttons[0].focusNode.focus();
		}
		// this._moveDiv.style.display="none" //添加这句话会导致动画渐入效果无法展现
		this._isShow = true;
		if (this.isMax) {
			this.enlargeNode.className = "u-xdlg-bs";
			this._isExpanded = true;
		}
		dojo.attr(this.domNode,'title','');
		unieap.fireContainerResize(this.domNode);
	},

	startup : function() {
		var nodes = dojo.query("*", this.containerNode);
		// nodes.length>0&&!this.url&&(this.inner=this.containerNode);
		if (nodes.length > 0 && !this.url) {
			this.inner = this.containerNode;
			this.innerParentNode = this.domNode; 
		}
	},

	/**
	 * @summary：
	 *         显示本对话框
	 *  @param 
	 *         {domNode}  渐入渐出效果起始和终止的dom对象
	 *  @param:
	 *  		{object} parameters 参数对象仅在url属性设置了才有效
	 *  @description:
	 *         显示本对话框
	 *         通过new方法或者调用XDialogUtil.createDialog生成的对话框默认会处于不可见状态，调用此方法能够使得对话框可见
	 *  @example:
	 *  |var dialog = new unieap.xdialog.Dialog(args);
	 *  |dialog.show(document.getElementById("sourceNode"));
	 *  @example:
	 *  |var dialog = XDialogUtil.createDialog(args);
	 *  |dialog.show(document.getElementById("sourceNode"));
	 *  @example:
	 *  |var dialog=new unieap.xdialog.Dialog({url:'/hello.action'});
	 *  |//载入页面的url为/hello.action?name=jack
	 *  |dialog.show(null,{'name':'jack'});
	 */
	show : function(refNode, parameters) {
		// 如果通过标签创建的dialog关闭后再重新显示,需要更新自己的preDialog属性
		if (typeof(parameters) == 'object' && this.url) {
			this.url = unieap.buildRequestPath(this.originUrl, parameters);
		} else {
			this.url = this.originUrl;
		}
		if (this._createDlgWithTag) {
			this.updatePreDlg();
			this.addDialog(this);
			this.initModal();
			this._createMoveDiv();
			this._iconClose = false;
			!this.url && dojo.style(this.containerNode, "display", "block");
		}
		var bgMask = dojo.byId("bgMask");
		bgMask && dojo.style(bgMask, "display", "block");
		this.refNode = refNode;
		this.innerShow();
		/*
		 * 由于popup的z-index高于dialog， 需要在Dialog弹出时，关闭已经弹出的popup
		 */
		dojo.require("unieap.form.Popup");
		if (unieap.form.Popup.popwidget) {
			var id = unieap.form.Popup.popwidget;
			var popwidget = dijit.byId(id);
			popwidget && popwidget.getPopup().close();
		}
	},

	startAnim : function() {
		var viewport = dijit.getViewport();
		this._initX = Math.floor(viewport.l + (viewport.w - this.width) / 2) > 0
				? Math.floor(viewport.l + (viewport.w - this.width) / 2) : "0";
		this._initY = Math.floor(viewport.t + (viewport.h - this.height) / 2) > 0
				? Math.floor(viewport.t + (viewport.h - this.height) / 2) : "0";
		dojo.style(this.mainNode, {
			left : this._initX + "px",
			top : this._initY + "px"
		});
		if (this.animate) {
			var viewport = dijit.getViewport();
			this.starty = Math.floor(viewport.t + 10);
			this.startx = Math.floor(viewport.l + 800);
			this.startWidth = "50";
			this.startHeight = "30";
			var topWin = unieap.getTopWin();
			if (this.refNode && this.getWindow() == topWin) {
				var pos = dojo.coords(this.refNode, true);
				if (dojo.isIE) {
					this.starty = pos.y
						+ dijit.getDocumentWindow(this.refNode.ownerDocument).screenTop
						- topWin.screenTop;
					this.startx = pos.x
						+ dijit.getDocumentWindow(this.refNode.ownerDocument).screenLeft
						- topWin.screenLeft;
				} else {
					var position = this.getObjTopRect(this.refNode);
					this.starty = position.top;
					this.startx = position.left;
				}
				this.startWidth = pos.w;
				this.startHeight = pos.h;
			} else if (this.refNode) {
				var pos = dojo.coords(this.refNode, true);
				this.starty = pos.y;
				this.startx = pos.x;
				this.startWidth = pos.w;
				this.startHeight = pos.h;
			}
			dojo.style(this._moveDiv, {
				width : this.startWidth + "px",
				height : this.startHeight + "px",
				left : this.startx + "px",
				top : this.starty + "px",
				display : "block"
			});
			var anim = dojo.animateProperty({
				node : this._moveDiv,
				duration : 450,
				properties : {
					width : {
						end : this.width,
						unit : "px"
					},
					height : {
						end : this.height,
						unit : "px"
					},
					top : this._initY,
					left : this._initX,
					unit : "px"
				},
				onEnd : dojo.hitch(this, function() {
					this._moveDiv.style.display = "none";
					this.domNode.style.visibility = "visible";
					if(this.url){
						this._loadUrl();
					}
				})
			});
			anim.play();
		} else {
			if(this.url){
				this._loadUrl();
			}
			this.domNode.style.visibility = "visible";
		}
	},

	_loadUrl : function(){
		dojo.require("unieap.patch.loader");
		dojo.addClass(this.dialogMainContent, "u-xdlg-loading");
		// 处理超时，防止载入出错一直等待
//		this._setTimeout();
		//解决两个对话框中存在相同ID时的冲突
		this.dialogMainContent.id = this.id;
		unieap.loader.load({
			node: this.dialogMainContent,
			url: this.url,
			showLoading: false,
			error: dojo.hitch(this, function(e){
				this._isReady = true;
//				this._clearTimeOut();
				dojo.removeClass(this.dialogMainContent, "u-xdlg-loading");
			}),
			load: dojo.hitch(this, function(){
				this._isReady = true;
//				this._clearTimeOut();
				dojo.removeClass(this.dialogMainContent, "u-xdlg-loading");
			})
		});
	},
	
	_setTimeout : function(){
		setTimeout(dojo.hitch(this, function(){
			if(this._isReady){
				return;
			}
			/* 
			 * TODO
			 * 这里可以加入超时处理 
			 * 也可以提供超时处理接口
			 */

			var sInfo = 
				"<table  vlign='center' style='width:100%;height:100%' class='messageBg'>" +
					"<tr>" +
						"<td align='center'>" +
							"<table border=0>" +
								"<tr>" +
									"<td class='warnIcon'></td>" +
									"<td style='text-align:left;'> " + RIA_I18N.dialog.dialog.error + "</td>" +
								"</tr>" +
							"</table>" +
						"</td>" +
					"</tr>" +
				"</table>";
			dojo.removeClass(this.dialogMainContent, "u-xdlg-loading");
			this.dialogMainContent.innerHTML = sInfo;
			this._isReady = true;
		}), this.timeout * 1000);
	},
		
	// 在top层次上弹出对话框时，得到渐入渐出效果的起始位置
	getObjTopRect : function(obj) {
		var rect = {
			top : 0,
			left : 0
		};
		var r = obj.getBoundingClientRect();
		rect.top += r.top;
		rect.left += r.left;
		var win = dijit.getDocumentWindow(obj.ownerDocument);
		while (win != window.top) {
			var element = win.frameElement;
			r = element.getBoundingClientRect();
			rect.top += r.top;
			rect.left += r.left;
			var doc = win.frameElement.ownerDocument;
			win = doc.parentWindow || doc.defaultView;
		}
		return rect;
	},

	// 初始化事件
	initEvent : function() {
		if (this.isExpand) {
			this.connect(this.enlargeNode, "onclick", "_enlarge");
			this.connect(this.enlargeNode, "onmouseover", "_enlargeOver");
			this.connect(this.enlargeNode, "onmouseout", "_enlargeOut");
		}
		if (this.isClose) {
			this.connect(this.closeNode, "onclick", "_imgClose");
			this.connect(this.closeNode, "onmouseover", "_closeOver");
			this.connect(this.closeNode, "onmouseout", "_closeOut");
		}
		if (this.resizable) {
			this.connect(this.dialogBottomRight, "onmousedown",
					"_onDialogBottomRightDown");
			this.connect(this.dialogBottomLeft, "onmousedown",
					"_onDialogBottomDown");
			this.connect(this.dialogBottom, "onmousedown",
					"_onDialogBottomDown");
			this.connect(this.dialogRightBorder, "onmousedown",
					"_onDialogRightDown");
		} else {
			this.dialogBottomRight.style.cursor = "default";
			this.dialogBottomLeft.style.cursor = "default";
			this.dialogBottom.style.cursor = "default";
			this.dialogRightBorder.style.cursor = "default";
		}
		this.connect(this.topContentNode, "onmousedown", "_onheadmousedown");
		// this.connect(this.topContentNode, "ondblclick", "_ondblclick");
		this.resizeHandle = dojo.connect(this.getWindow(), "onresize", this, "update");
	},

	// 初始化模态层
	initModal : function() {
		if (this.preDialog) {
			this.preDialog._isShow && (this.preDialog._modalDiv.style.display = "block");
			var bgMask = dojo.byId("bgMask");
			bgMask && this.removeNode(bgMask);
		}
		this._createModalIframe();
	},

	// 初始化显示内容
	initShowContent : function() {
		this.mainNode.style.top = "0px";
		this.mainNode.style.left = "0px";
		this.mainNode.style.width = this.width + "px";
		this.mainNode.style.height = this.height + "px";
		if(dojo.isIE == 6){ //只有IE6的情况下才创建iframe
			this.baseIframe = dojo.create('iframe',null,this.mainNode); 
			dojo.addClass(this.baseIframe,'u-dlg-backgroundIframe');
			dojo.style(this.baseIframe,{
				width:"100%",
				height:"100%",
				top:"0px",
				left:"0px"
			});
		}
		if(this.isMax){
			this._beforeExpandPara = {};
			var initHeight = 0;
			var initWidth = 0;
			if(this.params.height==undefined){
				this._beforeExpandPara.h = 428;
				initHeight = 428;
			}else{			
				var heightIndex = this.params.height.indexOf("px");
				if(heightIndex>0){
					initHeight = Math.max(Number(this.params.height.substring(0,heightIndex)),this.minHeight);
				}else{
					initHeight = Math.max(Number(this.params.height),this.minHeight);
				}
				this._beforeExpandPara.h = initHeight;
			}
			if(this.params.width==undefined){
				this._beforeExpandPara.w = 420;
				initWidth = 420;
			}else{
				var widthIndex = this.params.width.indexOf("px");
				if(widthIndex>0){
					initWidth = Math.max(Number(this.params.width.substring(0,widthIndex)),this.minWidth);
				}else{
					initWidth = Math.max(Number(this.params.width),this.minWidth);
				}
				this._beforeExpandPara.w = initWidth;
			}
			this._beforeExpandPara.l = (this.width-initWidth)/2;
			this._beforeExpandPara.t = (this.height-initHeight)/2;
			this._beforeExpandPara.x = 0;
			this._beforeExpandPara.y = 0;
		}

		this.initHeader();
		this.initBody();
		this.initFooter();
	},

	// 初始化头部区域
	initHeader : function() {
		this.dialogTitleNode.innerHTML = this.title;
		if (!this.isExpand) {
			this.enlargeNode.style.display = "none";
		}
		if (!this.isClose) {
			this.closeNode.style.display = "none";
		}
	},

	// 初始化主显示区
	initBody : function() {
		this.dialogMiddle.style.height = (this.height - 28) + "px";
		if (this._isUseButton()) {
			this.dialogMain.style.height = (this.height - 62) + "px";
		}
		this.domNode.style.visibility = "hidden";
		this.domNode.style.display = "block";
		if (this.url) {
			if (this._autoHeight) {
				this.setHeight(420);
			}
			if (this._autoWidth) {
				this.setWidth(428);
			}
		} else if (this.inner) {
			this._isReady = true;
			if (typeof(this.inner) == "object") {

				// 得到的是对象，要提取里面css为dialogButtonArea的区域，将其放在按钮区域
				var buttonArea = dojo.query(".dialogButtonArea", this.inner);
				if (buttonArea.length > 0) {
					this._buttonArea = buttonArea[0];
					this.dialogMain.style.height = (this.height - 62) + "px";
				}

				this.dialogMainContent.appendChild(this.inner);
			} else {
				this.dialogMainContent.innerHTML = this.inner;
			}
			if (this._autoHeight || this._autoWidth) {
				var position = dojo.position(this.dialogMainContent)
				var width = position.w;
				var height = position.h;
				if (this._autoHeight) {
					if (height <= 80) {
						this.setHeight(420);
					} else {
						this.setHeight(height + 30);
					}
				}
				if (this._autoWidth) {
					if (width <= 50) {
						this.setWidth(428);
					} else {
						this.setWidth(width + 20);
					}
				}
			}
		} else {
			this._isReady = true;
		}
		this.startAnim();
	},

	/**
	 * @summary：
	 *         自适应对话框的高宽
	 *  @description:
	 *         若对话框没有指定高宽，调用此方法可以根据对话框的内容自适应对话框的大小
	 *  @example:
	 *  |var dialog = new unieap.xdialog.Dialog(args);
	 *  |dialog.adaptiveDialog();
	 */
	adaptiveDialog : function() {
		if (!this._isReady)
			return;
		if (this.url) {
			if (this.dialogFrame.contentWindow
					&& this.dialogFrame.contentWindow.dojo) {
				this._adaptiveDialog(true);
			} else 
			{
				var position = dojo.position(this.dialogMainContent)
				if (this._autoHeight) {
					this.setHeight(position.h + 30);
				}
				if (this._autoWidth) {
					this.setWidth(position.w + 20);
				}
			}
		} else {
			if (this._autoHeight || this._autoHeight) {
				var position = dojo.position(this.dialogMainContent)
				var width = position.w;
				var height = position.h;
				if (this._autoHeight) {
					if (height <= 80) {
						this.setHeight(420);
					} else {
						this.setHeight(height);
					}
				}
				if (this._autoWidth) {
					if (width <= 50) {
						this.setWidth(428);
					} else {
						this.setWidth(width);
					}
				}
			}
		}
	},
	_adaptiveDialog : function(afterLoad) {
		var _dojo = this.dialogFrame.contentWindow.dojo;
		var width = _dojo.doc.body.scrollWidth;
		var height = _dojo.doc.body.scrollHeight
		// 得到第一层容器组件
		var containers = this.dialogFrame.contentWindow.unieap
				.getChildrenContainer(this.dialogFrame.contentWindow.document.body);
		for (var i = 0; i < containers.length; i++) {
			_dojo.require("unieap.grid.Grid");
			if (containers[i] instanceof this.dialogFrame.contentWindow.unieap.grid.Grid)
				continue;
			var childWidth = containers[i].containerNode.scrollWidth;
			var childHeight = containers[i].containerNode.scrollHeight;
			if (childWidth > width)
				width = childWidth;
			if (childHeight > height)
				height = childHeight;
		}
		if (this._autoHeight) {
			if (height <= 52) {
				this.setHeight(420);
			} else {
				this.setHeight(height + 30);
			}
		}
		if (this._autoWidth) {
			if (width <= 50) {
				this.setWidth(428);
			} else {
				this.setWidth(width + 20);
			}
		}
	},

	// 初始化底部内容
	initFooter : function() {
		if (this._isUseButton()) {
			var _span = document.createElement("span");
			_span.innerHTML = "&nbsp;";
			for (var i = 0, len = this.buttons.length; i < len; i++) {
				if (i > 0) {
					this.dialogMiddleButton.appendChild(_span.cloneNode(true));
				}
				this.dialogMiddleButton.appendChild(this.buttons[i].domNode);
			}
		} else if (this._buttonArea) {
			this.dialogMiddleButton.appendChild(this._buttonArea);
		} else {
			this.dialogMiddleButton.style.display = "none";
		}
	},

	/**
	* @summary：
	*       为对话框增加按钮
	* @param 
	*       {String}  config 设置按钮的label
	* @param:
	* 		{object} fn 设置按钮的回调函数
	* @param:
	* 		{object} scope 设置回调函数的this指针
	* @example:
	* | var dialog = XDialogUtil.createDialog({
	* |		url: "xxx.html",
	* |		title:"Hello World!",
	* |		height:"100",
	* |		width:"500"
	* |	});
	* | dialog.addButton("自定义按钮1",myfunc1,dialog);
	* | dialog.addButton("自定义按钮2",myfunc2);
	* | dialog.addButton("自定义按钮3",myfunc3,dialog);
	* | dialog.show();
	* |
	* | function myfunc1(){
	* |	this.setReturn("myfunc1");
	* |	this.close();
	* | }
	*/
	addButton : function(config, fn, scope) {
		dojo.require("unieap.form.Button");
		var btn = new unieap.form.Button({
					label : config
				});
		var handler = function(event) {
			fn.call(scope || window, event);
		}
		var _newHandle = dojo.hitch(this, handler);

		// this.connect(btn, "onClick", _newHandle);

		if (!this.connects) {
			this.connects = [];
		}
		this.connects.push(dojo.connect(btn, "onClick", _newHandle));
		// this.connect(btn, "onKeyDown",dojo.hitch(this, "keydown", btn));
		this.buttons.push(btn);
		return btn;
	},

	/**
	 * @summary：
	 *        获取通过inner方式传递进来的dom或html代码片段
	 *  @description:
	 *        通过inner传递dom或html代码片段的Dialog，调用此方法能够得到传递进来的dom对象或html字符串
	 *  @example:
	 *  |var dialog = XDialogUtil.showDialog({inner:dojo.byId("sss"),height:300,width:420});
	 *  |unieap.getXDialog().getInner();
	 */
	getInner : function() {
		if (this.inner) {
			return this.inner;
		} else {
			return null;
		}
	},

	destroy : function() {
		if (this.connects) {
			for (var i = 0, l = this.connects.length; i < l; i++) {
				dojo.disconnect(this.connects[i]);
			}
		}
//		this._clearTimeOut();
		this.inherited(arguments);
	},

	// 注册本对话框
	addDialog : function(obj) {
		this.getUtil().addDialog(obj);
		if (this._createDlgWithTag) {
			var frm = this.getTopFrm();
			!frm.dialogs && (frm.dialogs = [])
			frm.dialogs.push(this.id);
		}
	},

	// 移除对话框
	removeDialog : function(index) {
		this.getUtil().removeDialog(index);
		if (this._createDlgWithTag) {
			var frm = this.getTopFrm();
			frm.dialogs.pop();
		}

	},

	 getTopFrm:function(){
	 	var win=window,
			frameEle;
	 	try{
			do{
				if(win==win.parent) return win;
				frameEle=win.frameElement;
				if(frameEle){
					var parentNode=frameEle.parentNode;
					if(parentNode&&parentNode.getAttribute('id')=="unieap_pages"){
						return frameEle;
					}
				}
				win=win.parent;
			}while(win)
	 	}catch(e){
			return unieap.getTopWin();
		}
		return win;
	 },

	// 得到工具类
	getUtil : function() {
		return window.XDialogUtil;
	},
	/**
	 * @summary：
	 *         为对话框设置高度
	 *  @param 
	 *         {number} 对话框的高度值
	 *  @description:
	 *         为对话框设置高度
	 *  @example:
	 *  |dialog.setHeight(100);
	 */
	setHeight : function(height) {
		this.height = isNaN(height) ? parseInt(height, 10) : height;
		if (this.height < this.minHeight)
			this.height = this.minHeight;

		var viewport = dijit.getViewport();
		if (this.height >= viewport.h)
			this.height = 428;
		dojo.style(this.domNode, "height", this.height + "px");
		if (this._isUseButton() || this._buttonArea) {
			this.dialogMain.style.height = (this.height - 62) + "px";
		}
		var height = (this.height - 28) + "px";
		dojo.style(this.dialogMiddle, "height", height);
		dojo.style(this.dialogMainContent, "height", height);
		// ie6 baseiframe计算不对，不能自适应
		dojo.isIE < 7 && dojo.style(this.baseIframe, "height", this.height + "px");
	},
	/**
	 * @summary：
	 *         为对话框设置宽度
	 *  @param 
	 *         {number} 对话框的宽度值
	 *  @description:
	 *         为对话框设置宽度
	 *  @example:
	 *  |dialog.setWidth(100);
	 */
	setWidth : function(width) {
		this.width = isNaN(width) ? parseInt(width, 10) : width;
		if (this.width < this.minWidth)
			this.width = this.minWidth;
		var viewport = dijit.getViewport();
		if (this.width >= viewport.w)
			this.width = 420;
		dojo.style(this.domNode, "width", this.width + "px");
	},

	// 判断是否使用按钮，内部函数，用来确定显示区域的高度
	_isUseButton : function() {
		if (this.buttons.length == 0)
			return false;
		else
			return true;
	},

	// 在已有对话框弹出的情况下，对前一对话框进行遮挡的div
	_createModalDiv : function() {
		this.preDialog._modalDiv = dojo.create("div");
		this.preDialog._modalDiv.className = "u-xdlg-modalDiv";
		this.preDialog._modalDiv.style.height = this.preDialog.domNode.style.height;
		this.preDialog._modalDiv.style.width = this.preDialog.domNode.style.width;
		this.preDialog._modalDiv.style.zIndex = Number(this.preDialog.domNode.style.zIndex) + 1;
		if (this.preDialog.mainNode.style.top) {
			this.preDialog._modalDiv.style.top = this.preDialog.domNode.style.top;
			this.preDialog._modalDiv.style.left = this.preDialog.domNode.style.left;
		} else {
			this.preDialog._modalDiv.style.top = this.preDialog.endy;
			this.preDialog._modalDiv.style.left = this.preDialog.endx;
		}
		this.preDialog._modalDiv.style.display = "none";
		document.body.appendChild(this.preDialog._modalDiv);
	},

	// 创建用于渐入渐出和拖拽调整大小的遮挡div
	_createMoveDiv : function() {
		this._moveDiv = dojo.create("div");
		this._moveDiv.className = "u-xdlg-moveDiv";
		document.body.appendChild(this._moveDiv);
		this._moveDiv.style.display = "none";
	},

	// dialog是否可以enlarge、close、resize
	canECR : function() {
		if (this._createDlgWithTag) {
			var frm = this.getTopFrm();
			if (frm.dialogs[frm.dialogs.length - 1] != this.id) {
				return false;
			}
		}
		return true;
	},

	// inner event
	_enlarge : function(evt) {
		if (!this.canECR())
			return;
		if (this._isExpanded) {
			// 已经最大化，此时需要恢复原来的大小和位置
			if (this._beforeScroll)
				this.getWindow().document.body.scroll = this._beforeScroll;
			this.enlargeNode.className = "u-xdlg-be";
			this.enlargeNode.title = RIA_I18N.dialog.dialog.maximinze;;
			this._isExpanded = false;
			var viewport = dijit.getViewport();
			if (!this._beforeExpandPara) {
				var viewport = dijit.getViewport();
				var left = Math.floor(viewport.l + (viewport.w - 420) / 2) > 0
						? Math.floor(viewport.l + (viewport.w - 420) / 2)
						: "0", top = Math.floor(viewport.t
						+ (viewport.h - 428) / 2) > 0 ? Math
						.floor(viewport.t + (viewport.h - 428) / 2) : "0", width = 400, height = 428;
				dojo.style(this.mainNode, {
							left : left + "px",
							top : top + "px",
							width : width + "px",
							height : height + "px"
						});
				this.dialogMiddle.style.height = height + "px";

				if (this._isUseButton() || this._buttonArea) {
					this.dialogMain.style.height = (height - 62) + "px";
				}

			} else {
				dojo.style(this.mainNode, {
							left : Math.floor(this._beforeExpandPara.l)
									+ "px",
							top : Math.floor(this._beforeExpandPara.t)
									+ "px",
							width : this._beforeExpandPara.w + "px",
							height : this._beforeExpandPara.h + "px"
						});
				this.dialogMiddle.style.height = (this._beforeExpandPara.h - 28)
						+ "px";
				if (this._isUseButton() || this._buttonArea) {
					this.dialogMain.style.height = (this._beforeExpandPara.h - 62)
							+ "px";
				}
			}
			this.dialogMainContent.style.height = this.dialogMiddle.style.height;
		} else {
			this.enlargeNode.className = "u-xdlg-bs";
			this.enlargeNode.title = RIA_I18N.dialog.dialog.restore;;
			this._isExpanded = true;
			this._beforeExpandPara = dojo.coords(this.mainNode, true);
			this._beforeScroll = this.getWindow().document.body.scroll;
			this.getWindow().document.body.scroll = "no"
			var viewport = dijit.getViewport();
			dojo.style(this.mainNode, {
						left : Math.floor(viewport.l) + "px",
						top : Math.floor(viewport.t) + "px",
						width : Math.floor(viewport.w) + "px",
						height : Math.floor(viewport.h) + "px"
					});
			this.dialogMiddle.style.height = (viewport.h - 28) + "px";
			if (this._isUseButton() || this._buttonArea) {
				this.dialogMain.style.height = (viewport.h - 62) + "px";
			}
			this.dialogMainContent.style.height = this.dialogMiddle.style.height;
		}
		this._resizeContainer();
	},

	update : function() {
		var viewport = dijit.getViewport();
		if (this._isExpanded) {
			var top = viewport.t;
			var left = viewport.l;
			var width = viewport.w;
			var height = viewport.h;
			if (viewport.w < this.minWidth) {
				width = this.minWidth;
				left = 0;
			}
			if (viewport.h < this.minHeight) {
				height = this.minHeight;
				top = 0;
			}
			dojo.style(this.mainNode, {
						left : Math.floor(left) + "px",
						top : Math.floor(top) + "px",
						width : Math.floor(width) + "px",
						height : Math.floor(height) + "px"
					});
			this.dialogMiddle.style.height = (height - 28) + "px";
			if (this._isUseButton() || this._buttonArea) {
				this.dialogMain.style.height = (height - 62) + "px";
			}
			this.dialogMainContent.style.height = this.dialogMiddle.style.height;
		}
		var bgMask = dojo.byId("bgMask");
		if (bgMask) {
			var pos = dojo.coords(this.getWindow().document.body, true);
			// 解决dojo.coords方法resize整个window时未生成bgmask会报脚本错误问题
			dojo.style(bgMask, {
						left : "0px",
						top : "0px",
						width : Math.floor(pos.w) + "px",
						height : Math.floor(pos.h) + "px"
					});
		}
	},

	// 将最大化的图标更改样式
	_enlargeOver : function() {

	},
	// 将最大化的图标更改样式
	_enlargeOut : function() {

	},

	// 点击关闭按钮的监听函数
	_imgClose : function() {
		if (!this.canECR())
			return;
		this._iconClose = true;
		// 点击右上角上的"X"时执行
		this.onImgClose && this.onImgClose();
		this.close();
	},

	_closeOver : function() {

	},

	_closeOut : function() {

	},

	// 对右下角拖拽的监听
	_onDialogBottomRightDown : function(event) {
		if (!this.canECR())
			return;
		if (this.resizeType != '' || this._isExpanded) {
			return;
		}
		this.isResizing = true;
		this.resizeType = "se";
		this.onStartResize(event);
		// dojo.stopEvent(event);
	},

	// 对下方拖拽的监听
	_onDialogBottomDown : function(event) {
		if (!this.canECR())
			return;
		if (this.resizeType != '' || this._isExpanded) {
			return;
		}
		var e = dojo.fixEvent(event);
		var target = e.srcElement;
		if (target != this.dialogBottomRight
				&& target != this.dialogBottomLeft) {
			this.isResizing = true;
			this.resizeType = "s";
			this.onStartResize(event);
		}
	},

	// 对右侧拖拽的监听
	_onDialogRightDown : function(event) {
		if (!this.canECR())
			return;
		if (this.resizeType != '' || this._isExpanded) {
			return;
		}
		this.isResizing = true;
		this.resizeType = "e";
		this.onStartResize(event);
	},

	// 开始通过拖拽调整大小
	onStartResize : function(event) {
		this.startHeadx = event.clientX;
		this.startHeady = event.clientY;
		this._moveDiv.style.height = this.domNode.style.height;
		this._moveDiv.style.width = this.domNode.style.width;
		this._moveDiv.style.left = this.domNode.style.left;
		this._moveDiv.style.top = this.domNode.style.top;
		this._moveDiv.style.display = 'block';
		if (this._moveDiv.setCapture) {
			this.tempEvents.push(dojo.connect(this._moveDiv, "onmousemove",
					this, dojo.hitch(this, this.onResizeMouseMove)));
			this.tempEvents.push(dojo.connect(this._moveDiv, "onmouseup",
					this, dojo.hitch(this, this.onResizeMouseUp)));
			this._moveDiv.setCapture();
		} else {
			this.resizeMove = dojo.hitch(this, this.onResizeMouseMove);
			this.resizeUp = dojo.hitch(this, this.onResizeMouseUp);
			document.addEventListener("mousemove", this.resizeMove, true);
			document.addEventListener("mouseup", this.resizeUp, true);
		}
	},

	// resize时对鼠标事件的监听
	onResizeMouseMove : function(event) {
		var x = event.clientX;
		var y = event.clientY;
		var pos = dojo.coords(this.domNode);
		if (this.resizeType == "e") {
			if (Math.floor(x - pos.x) > this.minWidth)
				this._moveDiv.style.width = Math.floor(x - pos.x) + "px";
			return;
		}
		if (this.resizeType == "s") {
			if (Math.floor(y - pos.y) > this.minHeight)
				this._moveDiv.style.height = Math.floor(y - pos.y) + "px";
			return;
		}
		if (this.resizeType == "se") {
			if (Math.floor(x - pos.x) > this.minWidth)
				this._moveDiv.style.width = Math.floor(x - pos.x) + "px";
			if (Math.floor(y - pos.y) > this.minHeight)
				this._moveDiv.style.height = Math.floor(y - pos.y) + "px";
		}
	},
	// resize时对鼠标事件的监听
	onResizeMouseUp : function(event) {
		this._resizeContainer();
		dojo.stopEvent(dojo.fixEvent(event));
		this.isResizing = false;
		this.startHeadx = 0;
		this.startHeady = 0;
		if (this._moveDiv != null) {
			dojo.forEach(this.tempEvents, dojo.disconnect);
			this.tempEvents = [];
			this.mainNode.style.width = this._moveDiv.style.width;
			this.mainNode.style.height = this._moveDiv.style.height;
			this.dialogMiddle.style.height = Math
					.floor(parseInt(this.mainNode.style.height) - 28)
					+ "px";
			if (this._isUseButton() || this._buttonArea) {
				this.dialogMain.style.height = Math
						.floor(parseInt(this.mainNode.style.height) - 62)
						+ "px";
			}
			this.dialogMainContent.style.height = this.dialogMiddle.style.height;

			this._moveDiv.style.display = "none";
			if (this._moveDiv.releaseCapture) {
				this._moveDiv.releaseCapture();
			} else {
				document
						.removeEventListener("mouseup", this.resizeUp, true);
				document.removeEventListener("mousemove", this.resizeMove,
						true);
			}
			if (this.baseIframe) {
				if (this.baseIframe.style.width == "100%") {
					dojo.style(this.baseIframe, {
								width : "99%"
							});
				} else {
					dojo.style(this.baseIframe, {
								width : "100%"
							});
				}
				if (this.baseIframe.style.height == "100%") {
					dojo.style(this.baseIframe, {
								height : "99%"
							});
				} else {
					dojo.style(this.baseIframe, {
								height : "100%"
							});
				}
			}
		}
		this.resizeType = '';
	},

	_onheadmousedown : function(event) {
		if (this._isExpanded) {
			return;
		}
		var e = dojo.fixEvent(event);
		var target = e.srcElement || e.target; // 兼容火狐;
		if (target != this.topButtonNode && target != this.enlargeNode
				&& target != this.closeNode) {
			this.isHeadmove = true;
			this.startHeadx = event.clientX;
			this.startHeady = event.clientY;
			this.winStartx = parseInt(this.domNode.style.left);
			this.winStarty = parseInt(this.domNode.style.top);
			this.onheadStartmove();
		}
	},

	// 对标题栏双击事件的监听，在允许最大化的情况下，实现最大化和恢复原状的功能
	// _ondblclick : function(){
	// if(!this.isExpand){
	// return ;
	// }else{
	// this._enlarge();
	// }
	// },

	// 开始拖拽移动位置
	onheadStartmove : function() {
		this._moveDiv.style.height = this.domNode.style.height;
		this._moveDiv.style.width = this.domNode.style.width;
		this._moveDiv.style.left = this.winStartx + "px";
		this._moveDiv.style.top = this.winStarty + "px";
		this._moveDiv.style.display = 'block';
		if (this._moveDiv.setCapture)
			this._moveDiv.setCapture();
		else {
			this.moveMove = dojo.hitch(this, this.onheadmousemove);
			this.moveUp = dojo.hitch(this, this.onheadmouseup);
			document.addEventListener("mousemove", this.moveMove, true);
			document.addEventListener("mouseup", this.moveUp, true);
		}
		this.tempEvents.push(dojo.connect(this._moveDiv, "onmousemove",
				this, dojo.hitch(this, this.onheadmousemove)));
		this.tempEvents.push(dojo.connect(this._moveDiv, "onmouseup", this,
				dojo.hitch(this, this.onheadmouseup)));
	},

	// 鼠标移动时的事件
	onheadmousemove : function(event) {
		if (this.isHeadmove) {
			var x = event.clientX;
			var y = event.clientY;
			if (this.winStartx + x - this.startHeadx > 0) {
				this._moveDiv.style.left = Math.floor(this.winStartx + x
						- this.startHeadx)
						+ "px";
			}
			if (this.winStarty + y - this.startHeady > 0) {
				this._moveDiv.style.top = Math.floor(this.winStarty + y
						- this.startHeady)
						+ "px";
			}
		}
	},

	// 拖拽时鼠标弹起时的事件
	onheadmouseup : function() {
		if (this.isHeadmove) {
			this.isHeadmove = false;
			this.startHeadx = 0;
			this.startHeady = 0;
			if (this._moveDiv != null) {
				dojo.forEach(this.tempEvents, dojo.disconnect);
				this.tempEvents = [];
				this.mainNode.style.top = this._moveDiv.style.top;
				this.mainNode.style.left = this._moveDiv.style.left;
				this._moveDiv.style.display = "none";
				if (this._moveDiv.releaseCapture) {
					this._moveDiv.releaseCapture();
				} else {
					document.removeEventListener("mouseup", this.moveUp,
							true);
					document.removeEventListener("mousemove",
							this.moveMove, true);
				}
			}
		}
	},

	/**
	 * @summary:
	 *     关闭对话框
	 * @description:
	 *     将当前的对话框关闭并将对应的对象进行销毁
     * @param:
     *     {boolean}  isComplete
     *     在关闭对话框的时候，是不是要调用回调函数，默认通过脚本关闭对话框会调用回调函数
     * @example:
     * |unieap.getXDialog().close();   
	 */
	close : function(isComplete) {
		this.isComplete = isComplete;
		this._close();
	},

	// 关闭对话框并将相关对象销毁
	_close : function() {
		// 如果指定的url还没有加载完毕就点右上角的关闭按钮,直接返回
//		if (!this._isReady) {
//			this._iconClose = false;
//			return;
//		}
//		this._clearTimeOut();
		this.dialogFrame
				&& (this.dialogFrame.onreadystatechange = this.dialogFrame.onload = null);
		
		if (!this._createDlgWithTag) {
			dojo.disconnect(this.resizeHandle)
		}
		if (this.inner && this.innerParentNode) {
			this.innerParentNode.appendChild(this.inner);
		}
		var dialogDom = this.getUtil().getDialogs();
		if (dialogDom == null)
			return;
		for (var i = dialogDom.length - 1; i >= 0; i--) {
			if (dialogDom[i] == this) {
				this.removeDialog(i);
				break;
			}
		}
		// 如果此对话框是使用handle方式打开的
		if (this.getUtil().getDialog(this))
			this.getUtil().removeDialog(this);

		this.domNode.style.display = "none";
		if (this.animate) {
			dojo.style(this._moveDiv, {
						width : this.domNode.style.width,
						height : this.domNode.style.height,
						left : this.domNode.style.left,
						top : this.domNode.style.top,
						display : "block"
					})
			var anim = dojo.animateProperty({
						node : this._moveDiv,
						duration : 450,
						properties : {
							width : {
								end : this.startWidth,
								unit : "px"
							},
							height : {
								end : this.startHeight,
								unit : "px"
							},
							top : Math.floor(this.starty),
							left : Math.floor(this.startx),
							unit : "px"
						},
						onEnd : dojo.hitch(this, this._clear)
					});
			anim.play()
		} else {
			this._clear();
		}
		this._isShow = false;
	},
	_innerDisappear : function() {

	},

	_clear : function() {
		this._moveDiv.style.display = "none";
		this.removeNode(this._moveDiv);
		this.destroyModal();
		this.preDialog = null;
		var me = this;
		// 判断通过标签的创建的Dialog控件是否关闭过
		this._createDlgWithTag && (this._dlgClosed = true) && (this._isReady = false);
		window.setTimeout(function() {
			var frame = me.dialogFrame;
			if (me.dialogFrame) {
				dojo.withDoc(me.dialogFrame.contentWindow.document,
						function() {
							var children = me.dialogFrame.contentWindow.dijit
									? me.dialogFrame.contentWindow.dijit
											.findWidgets(dojo.body())
									: [];
							dojo.forEach(children, function(widget) {
										widget && widget.destroy
												&& widget.destroy();
									});
						}, me);
				frame.src = "";
				frame.contentWindow.document.write("");
				dojo.destroy(frame);
				frame = null;
				delete me.dialogFrame;
			}
			me.url && unieap.destroyWidgets(me.dialogMainContent);
			if (me.inner && typeof(me.inner) == "object"
					&& !me.innerParentNode) {
				// inner方式创建，且传入的不是html片段而是dom，且没有父节点
				unieap.destroyWidgets(me.inner);
				unieap.destroyWidgets(me.dialogMiddleButton);
			}
			// 执行回调函数
			if (me.onComplete && ((me._iconClose && me.iconCloseComplete) || (!me._iconClose && me.isComplete != false))) {
				me.onComplete.call(me.src, me.returnObj);
			}
			if (me.baseIframe != null) {
				me.removeNode(me.baseIframe);
			}
			!me._createDlgWithTag && me.destroy();
		}, 0);
	},

	/**
	 * @summary:
	 *     设置对话框组件的返回值
	 * @param: 
	 *     {object} obj
	 * @description:
	 *     在对话框关闭前可以设置对话框的返回值，并将在对话框关闭的时候，作为回调函数的参数
	 * @example:
	 * |unieap.getXDialog().setReturn(theReturnObject);  
	 */
	setReturn : function(Obj) {
		this.returnObj = Obj;
	},

	// 创建模态对话框的遮挡iframe
	_createModalIframe : function() {
		var bgMask;
		var pos = dojo.coords(this.getWindow().document.body, true);
		if (dojo.isIE == 6) {
			var burl = dojo.moduleUrl("dojo",
					"../unieap/dialog/_bgLayer.html")
					+ "";
			bgMask = dojo.create("iframe", {
						id : "bgMask",
						src : burl
//						style : {
//							position : "absolute",
//							zIndex : "998",
//							filter : "Alpha(Opacity=\"0\")",
//							opacity : 0
//						}
					});
			dojo.addClass(bgMask,"u-xdlg-bgMaskDialog-IE6");
			dojo.style(bgMask, {
						left : "0px",
						top : "0px",
						width : Math.floor(pos.w) + "px",
						height : Math.floor(pos.h) + "px",
						display : 'none'
					});
			dojo.body().appendChild(bgMask);
			bgMask.contentWindow.focus();
		}else 
		{
			bgMask = dojo.create("div", {
//						style : {
//							position : "absolute",
//							background : "#FFF",
//							zIndex : 998,
//							filter : "Alpha(Opacity=\"0\")",
//							opacity : 0
//						},
						id : "bgMask"
					});
			dojo.addClass(bgMask,"u-xdlg-bgMaskDialog-notIE");
			dojo.style(bgMask, {
						left : "0px",
						top : "0px",
						width : Math.floor(pos.w) + "px",
						height : Math.floor(pos.h) + "px",
						display : 'none'
					});
			dojo.body().appendChild(bgMask);
			// bgMask.focus();
		}
		return bgMask;
	},

	// 删除模态相关的div和iframe
	destroyModal : function() {
		if (this.preDialog && this.preDialog._modalDiv) {
			this.removeNode(this.preDialog._modalDiv);
			this.preDialog._modalDiv = null;
			delete this.preDialog._modalDiv;
		} else {
			var bgMask = dojo.byId("bgMask");
			bgMask && this.removeNode(bgMask);
		}

	},

	// 自定义移除domNode的方法
	removeNode : function(node) {
		dojo.destroy(node);
	},

	getWindow : function() {
		return window;
	},
	
	_resizeContainer: function(){
		dojo.forEach(unieap.getChildrenContainer(this.mainNode),function(widget){
			setTimeout(function(){
				unieap.notify(widget,"resizeContainer");
			},0);
		});
	},

	/**
	 * @summary:
	 *		得到从父窗口传递的参数
	 * @return
	 *		{object}
	 * @description:
	 *		得到父窗口传递到对话框的参数，可以为任何类型的数据，
	 *		当同时配置dialogData和getDialogData时，执行getDialogData的函数，并返回函数的返回值
	 * @example:
	 * |var param = unieap.getXDialog().getObject();
	 */
	getObject : function() {
		var fn = this.getDialogData;
		return dojo.isFunction(fn) ? fn() : this.dialogData;
	},
	_clearTimeOut:function(){
		if(this._setTimeOut){
			clearTimeout(this._setTimeOut);
		}
	}
});
