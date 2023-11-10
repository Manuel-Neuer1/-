dojo.provide("unieap.layout.BorderPane");
dojo.require('unieap.layout.Container');

dojo.declare("unieap.layout.BorderPane",[unieap.layout.Container,dijit._Templated],{ 
	/**
     * @declaredClass:
     * 		unieap.layout.BorderPane
     * @summary:
     * 		方位布局组件内的方位面板
     * @description:
     * 		可以通过region属性，配置面板在BorderContainer中的方位，
     * 		当region="center"时，此面板为宽高自适应面板，不支持height,width,splitLine,fixed,minSize,maxSize,wrap属性
     * 		
	 */
	 
	//配置属性接口
	UserInterfaces : dojo.mixin({
		region : "string",
		title : "string",
		showTitleBar : "boolean",
		splitLine : "boolean",
		wrap : "boolean",
		fixed : "boolean",
		scroll: "boolean",
		minSize : "string",
		maxSize : "string",
		onOpen : "function",
		onClose : "function"
	},
	unieap.layout.Container.prototype.UserInterfaces),
	 
	templateString:"<div class=\"borderPaneOuter\">"+
						"<div dojoAttachPoint='wrapNode' style=\"display:none\">"+
							"<a href='javascript:void(0);' dojoAttachPoint='wrapButton' class=\"u-border-wrapButton u-border-a\"></a>"+
						"</div>"+
						"<div dojoAttachPoint='splitNode'></div>"+
						"<div dojoAttachPoint='paneNode' class=\"borderPane\">"+
							"<div dojoAttachPoint='titleNode' class=\"titleNode\">" +
								"<a href='javascript:void(0);' dojoAttachPoint='titleButton' class=\"u-border-titleButton u-border-a\"></a>" +
								"<div class=\"u-border-titleText\"><div dojoAttachPoint='titleText' class=\"u-border-titleText-Inner\"></div></div>" +
							"</div>"+
							"<div dojoAttachPoint='containerNode' style=\"width:100%;position:relative;\">"+
							"</div>"+
						"</div>"+
					"</div>",

	/**
	 * @summary:
	 * 		设置面板在方位布局容器内的方位
	 * @description:
	 * 		此属性必须配置
	 * @type:
	 * 		{string}
	 * @enum:
	 * 		{'top','bottom','center','left','right'}
     * @example:
	 * |<div id="bc" dojoType="unieap.layout.BorderContainer">
	 * |	<div dojoType="unieap.layout.BorderPane" region="top" height="20%">
	 * |		top面板内容
	 * | 	</div>
	 * |	<div dojoType="unieap.layout.BorderPane" region="center">
	 * |		center面板内容
	 * | 	</div>
	 * |</div>
	 */
	region:'',
	
	/**
	 * @summary:
	 * 		面板标题
	 * @type:
	 * 		{string}
	 * @example:
	 * |<div id="bc" dojoType="unieap.layout.BorderContainer">
	 * |	<div dojoType="unieap.layout.BorderPane" region="top" title="top" height="20%">
	 * |		top面板内容
	 * | 	</div>
	 * |	<div dojoType="unieap.layout.BorderPane" region="center" title="center">
	 * |		center面板内容
	 * | 	</div>
	 * |</div>
	 * 配置top面板标题为top,center面板标题为center
	 */
	title:'',
	
	/**
	 * @summary:
	 * 		面板是否显示标题条
	 * @description:
	 * 		false：不显示，true：显示，默认为true
	 * @type:
	 * 		{boolean}
	 * @example:
	 * |<div id="bc" dojoType="unieap.layout.BorderContainer">
	 * |	<div dojoType="unieap.layout.BorderPane" region="top" showTitleBar="false" height="20%">
	 * |		top面板内容
	 * | 	</div>
	 * |	<div dojoType="unieap.layout.BorderPane" region="center">
	 * |		center面板内容
	 * | 	</div>
	 * |</div>
	 * 配置top面板不显示标题条
	 */
	showTitleBar:true,
	
	/**
	 * @summary:
	 * 		面板是否显示分割条
	 * @description:
	 * 		false：不显示，true：显示，默认为true
	 * @type:
	 * 		{boolean}
	 * @example:
	 * |<div id="bc" dojoType="unieap.layout.BorderContainer">
	 * |	<div dojoType="unieap.layout.BorderPane" region="top" splitLine="false" height="20%">
	 * |		top面板内容
	 * | 	</div>
	 * |	<div dojoType="unieap.layout.BorderPane" region="center">
	 * |		center面板内容
	 * | 	</div>
	 * |</div>
	 * 配置top面板不显示分割条
	 */
	splitLine:true,
	
	/**
	 * @summary:
	 * 		面板是否可收缩
	 * @description:
	 * 		false：不可收缩，true：可收缩，默认为true
	 * 		收缩按钮显示在标题条上，wrap=true,需要showTitleBar=true为前提才能保证收缩功能可用
	 * 		此二属性默认均为true。
	 * @type:
	 * 		{boolean}
	 * @example:
	 * |<div id="bc" dojoType="unieap.layout.BorderContainer">
	 * |	<div dojoType="unieap.layout.BorderPane" region="top" wrap="false" height="20%">
	 * |		top面板内容
	 * | 	</div>
	 * |	<div dojoType="unieap.layout.BorderPane" region="center">
	 * |		center面板内容
	 * | 	</div>
	 * |</div>
	 * 配置top面板不可收缩
	 */
	wrap:true, 
	
	paneSize_h: -1,
	paneSize_w: -1,//记录pane的宽/高（收缩、展开时记录收缩前的宽，高）
	
	/**
	 * @summary:
	 * 		配置面板分割条是否可拖动
	 * @description:
	 * 		true:不可拖动，false：可拖动，默认可拖动，在显示分割条（splitLine=true）情况下生效。
	 * @type：
	 * 		{boolean}
	 * 
	 * @example:
	 * |<div id="bc" dojoType="unieap.layout.BorderContainer">
	 * |	<div dojoType="unieap.layout.BorderPane" region="top" fixed="true" height="20%">
	 * |		top面板内容
	 * | 	</div>
	 * |	<div dojoType="unieap.layout.BorderPane" region="center">
	 * |		center面板内容
	 * | 	</div>
	 * |</div>
	 * 配置top面板分割条不可拖动
	 */
	fixed:false,
	
	/**
	 * @summary:
	 * 		设置面板可拖动范围的最小边界
	 * @description:
	 * 		在面板可拖动情况下生效,只支持像素值，不支持百分比
	 * @type:
	 * 		{number|string}
	 * @example:
	 * |<div id="bc" dojoType="unieap.layout.BorderContainer">
	 * |	<div dojoType="unieap.layout.BorderPane" region="top" height="150px" minSize="100px" maxSize="200px">
	 * |		top面板内容
	 * | 	</div>
	 * |	<div dojoType="unieap.layout.BorderPane" region="center">
	 * |		center面板内容
	 * | 	</div>
	 * |</div>
	 * 配置top面板在拖动时，最小宽度100px，最大宽度200px		
	 */
	minSize:'23px',
	/**
	 * @summary:
	 * 		设置面板可拖动范围的最大边
	 * @description:
	 * 		在面板可拖动情况下生效，只支持像素值，不支持百分比
	 * @type:
	 * 		{number|string}
	 * @example:
	 * |<div id="bc" dojoType="unieap.layout.BorderContainer">
	 * |	<div dojoType="unieap.layout.BorderPane" region="left" width="150px" minSize="100px" maxSize="200px">
	 * |		left面板内容
	 * | 	</div>
	 * |	<div dojoType="unieap.layout.BorderPane" region="center">
	 * |		center面板内容
	 * | 	</div>
	 * |</div>
	 * 配置left面板在拖动时，最小宽度100px，最大宽度200px		
	 */
	maxSize:'10000px',
	
	/**
	 * @summary:
	 * 		面板默认宽度
	 * @description:
	 * 		
	 * @type:
	 * 		{string|number}	
	 */
	width:'100px',
	
	/**
	 * @summary:
	 * 		面板默认高度
	 * @description:
	 * 		
	 * @type:
	 * 		{string|number}	
	 */
	height:'100px',
	
	isShowing:true,
	
	/**
	 * 容器是否自动出现滚动条 
	 */
	scroll : true,
	
	borderSize: 1,
	splitLineSize: 5,
	wrapBarSize: 23+2,
	titleSize:23-1, //ff 下 margin-top:-1
	centerMinSize:50,
	
	//父容器，BorderContainer
	borderContainer: null,
	
	_reverseRegion: function(region) {
		switch(region) {
			case 'left':
				return 'right';
			case 'right':
				return 'left';
			case 'top':
				return 'bottom';
			case 'bottom':
				return 'top';
			default:
				return region;
		}
	},
	
	_setDivBorder: function() {
		//CSS1Compat  引DOCTYPE
		//BackCompat  未引DOCTYPE
		if(dojo.isIE && dojo.doc.compatMode == "BackCompat") {//IE下，在不引DOCTYPE的情况下，border不占宽度
			this.borderSize = 0;
		} else {
			this.borderSize = 2 * this.borderSize;
		}
	},
	
	postCreate: function() {
		this.borderContainer = this.getParentContainer();
		this.addRegionStyle();
		
		this.inherited(arguments);
		
		if(this.borderContainer.wrap && this.wrap && this.region != 'center') {
			this.connects.push(dojo.connect(this.titleButton,'onclick',this,'_clickTitleButton'));
			this.connects.push(dojo.connect(this.wrapButton,'onclick',this,'_clickWrapButton'));
		}
		
		!this.borderContainer.fixed && !this.fixed && this.connects.push(dojo.connect(this.splitNode, 'onmousedown', this, '_startMove'));
		
		//将自己注册到Border容器
		
		this.borderContainer[this.region+'Pane'] = this;
		
		if(this.scroll){
			dojo.style(this.containerNode,'overflow','auto');
		}else{
			dojo.style(this.containerNode,'overflow','hidden');
		}
	},
	
	layoutInner: function() {
		if(this.domNode.clientHeight == 0 || this.domNode.clientWidth == 0) {
			return;
		}
		
		if(this.region == 'top') {
			this.paneNode.style.height = this._adjustSize(this.domNode.clientHeight - this.splitLineSize - this.borderSize);//splitLine width:5px  paneNode border:2px
			dojo.place(this.splitNode,this.domNode,'last');
		} else if(this.region == 'bottom'){
			this.paneNode.style.height = this._adjustSize(this.domNode.clientHeight - this.splitLineSize - this.borderSize);
			dojo.place(this.splitNode,this.domNode,'first');
		} else if(this.region == 'left' || this.region == 'right') {	//left和right处理相同
			dojo.style(this.splitNode,'styleFloat',this._reverseRegion(this.region));
			this.paneNode.style.height = this._adjustSize(this.domNode.clientHeight - this.borderSize);
			this.wrapNode.style.height = this._adjustSize(this.domNode.clientHeight - this.borderSize);//如果收缩条显示，需要设置收缩条高度
		} else if(this.region == 'center') {
			this.paneNode.style.height = this._adjustSize(this.domNode.clientHeight - this.borderSize);
		}
		this.containerNode.style.height = this._adjustSize(this.paneNode.clientHeight - this.titleSize);
		
	},
	
	_adjustSize: function(size) {
		if(size < 0) {
			return '0px';
		} else {
			return size + 'px';
		}
	},
	
	resizeContainer: function() {
		if(null == this.domNode) return;
		this.resize();
		this.resizeChildrenContainer();
	},
	
	resize: function() {
		this.layoutInner();
	},
	
	//依据region为面板添加样式
	addRegionStyle: function() {
		
		this._setDivBorder();
		
		dojo.addClass(this.domNode,this.region+'BorderPane');
		
		this.title && this.setTitle(this.title);
		this.domNode.title = "";
		
		if(this.region != 'center' && this.wrap) {
			dojo.addClass(this.titleButton,'u-border-titleButton-' + this.region);
			dojo.addClass(this.wrapButton,'u-border-wrapButton-' + this.region);
		} else {
			dojo.style(this.titleButton,'display','none');
			dojo.style(this.wrapButton,'display','none');
		}
		
		if(this.region == 'top' || this.region == 'bottom') {
			dojo.addClass(this.splitNode,'u-border-splitterH');
			//先检查父容器是否是fixed，再检查自身是否是fixed
			!this.parentContainer.connects[0][0].fixed&&!this.fixed && dojo.style(this.splitNode,'cursor','n-resize');
			dojo.addClass(this.wrapNode,'u-border-wrapNodeH');
		} else if(this.region == 'left' || this.region == 'right') {
			dojo.addClass(this.splitNode,'u-border-splitterV');
			dojo.addClass(this.splitNode,'u-border-splitterV-'+this.region);//解决IE6下，垂直分割条白边的缺陷
			//先检查父容器是否是fixed，再检查自身是否是fixed
			!this.parentContainer.connects[0][0].fixed&&!this.fixed && dojo.style(this.splitNode,'cursor','w-resize');
			dojo.addClass(this.wrapNode,'u-border-wrapNodeV');
		}
		
		if(!this.borderContainer.splitLine || !this.splitLine) {//不显示面板分割条情况
			dojo.style(this.splitNode,'display','none');
			this.splitLineSize = 0
		}; 
		if(!this.borderContainer.showTitleBar || !this.showTitleBar) {//不显示标题条
			dojo.style(this.titleNode,'display','none');
			this.titleSize = 0;
		}
	},
	
	/**
	 * @summary:
	 * 		设置面板标题
	 * @param:
	 * 		{string}
	 * @example:
	 * |var pane = unieap.byId('leftPane');
	 * |pane.setTitle('面板');
	 */
	setTitle: function(title) {
		this.title = title;
		dojo.attr(this.domNode,'title','');
		if(dojo.isFF) {
			this.titleText.textContent = title;
		} else {
			this.titleText.innerText = title;
		}
	},
	
	//收缩 =========================================================
	_savePaneSize: function() {
		if( this.domNode.offsetHeight > 0) {
			this.paneSize_h = this.domNode.offsetHeight;
			this.paneSize_w = this.domNode.offsetWidth;
		} else {//如果在隐藏状态执行close,那么记录pane的配置宽高
			this.paneSize_h = this.domNode.style.height || this.height;
			this.paneSize_w = this.domNode.style.width || this.width;
		}
	},
	
	_clickTitleButton: function() {
		this.close();
	},
	
	_clickWrapButton: function() {
		this.open();
	},
	/**
	 * @summary:
	 * 		设置打开面板，即面板展开
	 * @example:
	 * |var pane = unieap.byId('leftPane');
	 * |pane.open();
	 */
	open: function() {
		if(!this.isShowing && unieap.fireEvent(this,this.onOpen,[])!= false) {
			dojo.style(this.paneNode,'display','block');
			dojo.style(this.wrapNode,'display','none');
			//计算恢复domNode的高度和宽度
			this._calculateOpenHW();
			this.isShowing = true;
			if(!this.fixed&&!this.parentContainer.connects[0][0].fixed) {//如果可拖动，加上cursor样式
				if(this.region == 'top' || this.region == 'bottom') {
					dojo.style(this.splitNode,'cursor','n-resize');
				} else if(this.region == 'left' || this.region == 'right') {
					 dojo.style(this.splitNode,'cursor','w-resize');
				}
			}
			this.notifyParentResize();
		}
	},
	//如果展开后的面板宽（高）+中间面板宽（高）+对面面板宽（高） < 当前容器宽（高） 则恢复展开前宽（高）
	//否则展开成收缩条大小
	_calculateOpenHW: function() {
	
		var _w = this.toRealValue(this.paneSize_w,this.borderContainer.domNode.offsetWidth);
		var _h = this.toRealValue(this.paneSize_h,this.borderContainer.domNode.offsetHeight);
		
		if(this.region == 'left' || this.region == 'right') {
			//对面面板的宽度
			var oppositeWidth =  this.borderContainer[this._reverseRegion(this.region)+'Pane'] ? 
								this.borderContainer[this._reverseRegion(this.region)+'Pane'].domNode.offsetWidth : 0;
			var afterOpenWidth = oppositeWidth + this.centerMinSize + _w;
			
			if(afterOpenWidth > this.borderContainer.domNode.offsetWidth) {
				dojo.style(this.domNode,'width',this.wrapBarSize + this.splitLineSize + 'px');
			} else {
				dojo.style(this.domNode,'width',_w + 'px');
			}
		} else if(this.region == 'top' || this.region == 'bottom') {
			
			var oppositeHeight = this.borderContainer[this._reverseRegion(this.region)+'Pane'] ?
								this.borderContainer[this._reverseRegion(this.region)+'Pane'].domNode.offsetHeight : 0;
			var afterOpenHeight = oppositeHeight + this.centerMinSize + _h;
			
			if(afterOpenHeight > this.borderContainer.domNode.offsetHeight) {
				dojo.style(this.domNode,'height',this.wrapBarSize + this.splitLineSize + 'px');
			} else {
				dojo.style(this.domNode,'height',_h + 'px');
			}
		}
	},
	//解决U_EAP00008299
	toRealValue: function(inValue,containerSize) {
		if(isNaN(inValue)) {
			if(inValue.indexOf('%') != -1) {
				return inValue = Math.floor(containerSize *  parseInt(inValue) / 100);
			}
			if(inValue.indexOf('px') != -1){
				return parseInt(inValue);
			}
		}
		return inValue;
	},
	/**
	 * @summary:
	 * 		设置关闭面板，即面板收缩
	 * @example:
	 * |var pane = unieap.byId('leftPane');
	 * |pane.close();
	 */
	close: function() {
		if(this.isShowing && unieap.fireEvent(this,this.onClose,[])!= false) {
			this._savePaneSize(); //记录收缩前的domNode宽高
			dojo.style(this.paneNode,'display','none');
			dojo.style(this.wrapNode,'display','block');
			if(this.region == 'top' || this.region == 'bottom') {
				dojo.style(this.domNode,'height',this.wrapBarSize+this.splitLineSize+'px'); //wrapNode 21px border 2px; splitLine 5px
			} else if(this.region == 'left' || this.region == 'right'){
				dojo.style(this.domNode,'width',this.wrapBarSize+this.splitLineSize+'px');
				dojo.style(this.wrapNode,'float',this.region);
			}
			this.isShowing = false;
			dojo.style(this.splitNode,'cursor','default');//收缩情况下不可拖动，去掉cursor样式
			this.notifyParentResize();
		}
	},
	/**
	 * @summary:
	 * 		面板打开事件
	 * @description:
	 * 		在面板打开时触发,用户可覆盖此方法，如方法主动返回false则不执行面板打开操作
	 * @example:
	 * |<script type="text/javascript">
	 * |	function openEvent() {
	 * |		alert('打开事件');
	 * |	}
	 * |</script>
	 * |<div id="bc" dojoType="unieap.layout.BorderContainer">
	 * |	<div dojoType="unieap.layout.BorderPane" region="top" onOpen="openEvent" height="20%">
	 * |		top面板内容
	 * | 	</div>
	 * |	<div dojoType="unieap.layout.BorderPane" region="center">
	 * |		center面板内容
	 * | 	</div>
	 * |</div>;
	 */
	onOpen: function() {
		return true;
	},
	/**
	 * @summary:
	 * 		面板关闭事件
	 * @description:
	 * 		在面板关闭时触发,用户可覆盖此方法，如方法主动返回false则不执行面板关闭操作
	 * @example:
	 * |<script type="text/javascript">
	 * |	function closeEvent() {
	 * |		alert('关闭事件');
	 * |	}
	 * |</script>
	 * |<div id="bc" dojoType="unieap.layout.BorderContainer">
	 * |	<div dojoType="unieap.layout.BorderPane" region="top" onClose="closeEvent" height="20%">
	 * |		top面板内容
	 * | 	</div>
	 * |	<div dojoType="unieap.layout.BorderPane" region="center">
	 * |		center面板内容
	 * | 	</div>
	 * |</div>;
	 */
	onClose: function() {
		return true;
	},
	
	//splitLine拖动=========================================================
	
	_showMoveLine : function(){
		
		this._moveLine.style.display = 'block';
		
		this._moveLine.style.height = this.splitNode.offsetHeight + 'px';
		this._moveLine.style.width = this.splitNode.offsetWidth + 'px';
		
		//设置top/left
		this._setMoveLineTL();
		
		//绑定事件
		this._moveEvents = [];
		if(this._moveLine.setCapture) { //锁定鼠标事件
			this._moveLine.setCapture();	
			this._moveEvents.push(dojo.connect(this._moveLine,'onmousemove',this,'_doMoveLine'));
			this._moveEvents.push(dojo.connect(this._moveLine,'onmouseup',this,'_endMoveLine'));
		}else { //FF 绑定全局事件
			this._moveEvents.push(dojo.connect(document,'onmousemove',this,'_doMoveLine'));
			this._moveEvents.push(dojo.connect(document,'onmouseup',this,'_endMoveLine'));
		}
	},
	
	_setMoveLineTL: function() {
		if(this.borderContainer.design == 'sidebar') {
			if(this.region == 'left') {
				this._moveLine.style.top = '0px';
				this._moveLine.style.left = this.paneNode.offsetWidth + 'px';
			} else if (this.region == 'right') {
				this._moveLine.style.top = '0px';
				this._moveLine.style.left = this.borderContainer.domNode.clientWidth - this.domNode.offsetWidth + 'px';
			} else if (this.region == 'top') {
				this._moveLine.style.top = this.paneNode.offsetHeight + 'px';
				if(this.borderContainer.leftPane) { //left  pane存在
					this._moveLine.style.left = this.borderContainer.leftPane.domNode.offsetWidth + 'px';
				} else {
					this._moveLine.style.left = '0px';
				}
			} else if (this.region == 'bottom') {
				this._moveLine.style.top = this.borderContainer.domNode.clientHeight - this.domNode.offsetHeight + 'px';
				if(this.borderContainer.leftPane) { //left  pane存在
					this._moveLine.style.left = this.borderContainer.leftPane.domNode.offsetWidth + 'px';
				} else {
					this._moveLine.style.left = '0px';
				}
			}
		}else{
			if(this.region == 'left') {
				if(this.borderContainer.topPane) {
					this._moveLine.style.top = this.borderContainer.topPane.domNode.offsetHeight + 'px';
				} else {
					this._moveLine.style.top = '0px';
				}
				this._moveLine.style.left = this.paneNode.offsetWidth + 'px';
			} else if (this.region == 'right') {
				if(this.borderContainer.topPane) {
					this._moveLine.style.top = this.borderContainer.topPane.domNode.offsetHeight + 'px';
				} else {
					this._moveLine.style.top = '0px';
				}
				this._moveLine.style.left = this.borderContainer.domNode.clientWidth - this.domNode.offsetWidth + 'px';
			} else if (this.region == 'top') {
				this._moveLine.style.top = this.paneNode.offsetHeight + 'px';
				this._moveLine.style.left = '0px';
			} else if (this.region == 'bottom') {
				this._moveLine.style.top = this.borderContainer.domNode.clientHeight - this.domNode.offsetHeight + 'px';
				this._moveLine.style.left = '0px';
			}
		}		
	},
		
	_startMove: function(evt) {
		//收缩情况下，不可拖动
		if(!this.isShowing) {
			return;
		}
		
		dojo.disconnect(this.startMoveEvent);
		
		this._showMoveLine();
		
		//记录拖拽前
		this.splitMouse_x = evt.clientX;
		this.splitMouse_y = evt.clientY;
		this.splitLine_t = this._moveLine.offsetTop;
		this.splitLine_l = this._moveLine.offsetLeft;
	},
	
	_doMoveLine: function(evt) {
		
		var offset;
		//移动Line
		if(this.region == 'left') {
			offset = evt.clientX - this.splitMouse_x;
			this._isValid(offset) && (this._moveLine.style.left  =   Math.floor(this.splitLine_l + offset)  + 'px');
		} else if (this.region == 'right') {
			offset = this.splitMouse_x - evt.clientX
			this._isValid(offset) && (this._moveLine.style.left  =   Math.floor(this.splitLine_l - offset)  + 'px');
		} else if (this.region == 'top') {
			offset = evt.clientY - this.splitMouse_y;
			this._isValid(offset) && (this._moveLine.style.top  =   Math.floor(this.splitLine_t + offset)  + 'px');
		} else if (this.region == 'bottom') {
			offset = this.splitMouse_y - evt.clientY;
			this._isValid(offset) && (this._moveLine.style.top  =   Math.floor(this.splitLine_t - offset)  + 'px');
		}
	},
	
	//计算是否在偏移允许范围
	_isValid: function(offset) {
		var maxlimit,minlimit,value;
		if(this.region == 'left' || this.region == 'right')  {
			minlimit = parseInt(this.minSize,10);
			maxlimit =  Math.min(parseInt(this.maxSize),
				(this.domNode.offsetWidth + this.borderContainer.centerPane.domNode.offsetWidth - this.centerMinSize));//保持center的50宽、高
			value = this.domNode.offsetWidth + offset;
		} else if(this.region == 'top' || this.region == 'bottom') {
			minlimit = parseInt(this.minSize,10);
			maxlimit =  Math.min(parseInt(this.maxSize),
				(this.domNode.offsetHeight + this.borderContainer.centerPane.domNode.offsetHeight - this.centerMinSize));
			value = this.domNode.offsetHeight + offset;
		}
		maxlimit = Math.min(maxlimit,parseInt(this.maxSize));
		if(value >= minlimit && value <= maxlimit) {
			return true;
		}else {
			return false;
		}
	},
	
	_endMoveLine: function(evt) {
		//位移(offset)：用moveLine当前的top,left 减去 moveLine出现时的原始位置 的 差值
		//依据“正值扩大、负值缩小”，不同region pane计算时的减数和被减数不一样
		var offset = 0;
		if(this.region == 'left') {
			offset = Math.floor(this._moveLine.offsetLeft - this.splitLine_l); 
			//如果可以收缩
			if(this.wrap && this.domNode.offsetWidth + offset <= this.wrapBarSize+this.splitLineSize) {
				this.close();
			} else {
				dojo.style(this.domNode,'width',this.domNode.offsetWidth + offset + 'px');
			}
		} else if(this.region == 'right') {
			offset = Math.floor(this.splitLine_l - this._moveLine.offsetLeft);
			if(this.wrap && this.domNode.offsetWidth + offset <= this.wrapBarSize+this.splitLineSize) {
				this.close()
			} else {
				dojo.style(this.domNode,'width',this.domNode.offsetWidth + offset + 'px');
			}
		} else if (this.region == 'top') {
			offset = Math.floor(this._moveLine.offsetTop - this.splitLine_t);
			if(this.wrap && this.domNode.offsetHeight + offset <= this.wrapBarSize+this.splitLineSize) {
				this.close();
			} else {
				dojo.style(this.domNode,'height',this.domNode.offsetHeight + offset + 'px');
			}
		} else if (this.region == 'bottom'){
			offset = Math.floor(this.splitLine_t - this._moveLine.offsetTop);
			if(this.wrap && this.domNode.offsetHeight + offset <= this.wrapBarSize+this.splitLineSize) {
				this.close();
			} else {
				dojo.style(this.domNode,'height',this.domNode.offsetHeight + offset + 'px');
			}
		}
//		dojo.hitch(this,this._destoryAfterMove);
		this._destoryAfterMove();
		this.notifyParentResize(); 
	},
	
	
	_destoryAfterMove: function() {
		if(this._moveLine.releaseCapture) {
			this._moveLine.releaseCapture();
		}
		
		dojo.forEach(this._moveEvents, dojo.disconnect);
		
		this._moveLine.style.top = '0px';
		this._moveLine.style.left = '0px';
		this._moveLine.style.display = 'none';

		delete this.splitMouse_x;
		delete this.splitMouse_y;
		delete this.splitLine_t;
		delete this.splitLine_l;
	},
	/**
	 * @summary:
	 * 		设置面板的高度
	 * @description:
	 *		支持像素值和百分比,只对top和bottom面板有效，且设置高度不能超过高度限制
	 *		即：top(bottom)面板高度 应在BorderContainer容器高度和bottom(top)面板高度不变的情况下 保证center面板的可见 
	 * @param:
	 * 		{string|number} height
	 * @example:
	 * |var topPane = unieap.byId('topPane');
	 * |topPane.setPaneHeight("200px");
	 */
	setPaneHeight: function(height) {
		if(this.region == 'left' || this.region == 'right' || this.region == 'center') {
			return;
		}
		if(this.isShowing) {
			this.setHeight(height);
		} else {			//关闭状态下，改变this.paneSize_h记录值
			this.paneSize_h = height;
		}		
	},
	/**
	 * @summary:
	 * 		设置面板的宽度
	 * @description:
	 *		支持像素值和百分比,只对left和right面板有效，且设置宽度不能超过宽度限制
	 *		即：left(right)面板宽度 应在BorderContainer容器宽度和right(left)面板宽度不变的情况下 保证center面板的可见
	 * @param:
	 * 		{string|number} width
	 * @example:
	 * |var leftPane = unieap.byId('leftPane');
	 * |topPane.setPaneWidth("200px");
	 */
	setPaneWidth: function(width) {
		if(this.region == 'top' || this.region == 'bottom' || this.region == 'center') {
			return;
		}
		if(this.isShowing) {
			this.setWidth(width);
		} else {
			this.paneSize_w = width;
		}		
	}
});