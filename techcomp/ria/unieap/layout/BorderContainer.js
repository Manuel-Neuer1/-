dojo.provide("unieap.layout.BorderContainer");
dojo.require('unieap.layout.Container');

dojo.declare("unieap.layout.BorderContainer", [unieap.layout.Container], {
	/**
     * @declaredClass:
     * 		unieap.layout.BorderContainer
     * @summary:
     * 		方位布局组件
     * @classDescription:
     * 		提供对页面的方位布局，将页面分为上、下、左、右、中五个面板，中面板是自适应面板且必须配置，其他面板可选
     * 		注意：BorderContainer和BorderPane中都提供了splitLine,showTitleBar,fixed,wrap属性的配置，
     * 			  对于同一属性，BorderContainer的优先级要高于BorderPane
     * @example:
	 * |<div id="bc" dojoType="unieap.layout.BorderContainer">
	 * |	<div dojoType="unieap.layout.BorderPane" region="top" title="top" height="20%">
	 * |		top面板内容
	 * |	</div>
	 * |	<div dojoType="unieap.layout.BorderPane" region="bottom" title="bottom" height="30%">
	 * |		bottom面板内容
	 * |	</div>
	 * |	<div dojoType="unieap.layout.BorderPane" region="center" title="center">
	 * |		center面板内容,center面板必须有
	 * |	</div>
	 * |	<div dojoType="unieap.layout.BorderPane" region="left" title="left" width="20%">
	 * |		left面板内容
	 * |	</div>
	 * |	<div dojoType="unieap.layout.BorderPane" region="right" title="right" width="30%">
	 * |		right面板内容
	 * |	</div>
	 * | </div>	
	 * @img:
	 * 		images/layout/bordercontainer-headline.png
	 */
	
	//配置属性接口
	UserInterfaces : dojo.mixin({
		design : "string",
		showTitleBar : "boolean",
		splitLine : "boolean",
		wrap : "boolean",
		fixed : "boolean"
	},
	unieap.layout.Container.prototype.UserInterfaces),
	
	/**
	 * @summary:
	 * 		方位布局方式
	 * @description:
	 * 		标题布局(headline):top和bottom面板宽度100%、高度需设置；left和right高度自适应、宽度需设置
	 * 		边栏布局(sidebar)：top和bottom面板宽度自适应、高度需设置；left和right高度100%、宽度需设置
	 * @default:
	 * 		headline
	 * @type:
	 * 		{string}
	 * @enum:
	 * 		{'headline','sidebar'}
	 * @example:
	 * |//默认是标题布局，如下展示边栏布局
	 * |<div id="bc" dojoType="unieap.layout.BorderContainer" design="sidebar">
	 * |    ...  //嵌套方位面板
	 * | </div>	
	 * @img:
	 * 		images/layout/bordercontainer-sidebar.png
	 */
	design:'headline',
	
	/**
	 * @summary
	 * 		配置是否显示面板之间的分割条
	 * @description:
	 * 		true:显示，false:不显示，默认显示
	 * 		如果在此配置了spliteLine=false，则所有分割条都不显示，在BorderPane中即使配置了spliteLine=true也不能显示
	 * 		如果在此配置了spliteLine=true，在BorderPane中可以配置了spliteLine=false隐藏指定分割条
	 * @default:
	 * 		true
	 * @type:
	 * 		{boolean}
	 * @example:
	 * |<div id="bc" dojoType="unieap.layout.BorderContainer" splitLine="false">
	 * |    ...  //嵌套方位面板
	 * | </div>	
	 * 配置不显示分割条
	 * @img:
	 * 		images/layout/bordercontainer-nosplitline.png
	 */
	splitLine:true,
	
	/**
	 * @summary:
	 * 		是否显示标题条
	 * @description:
	 * 		false：不显示，true：显示，默认为true
	 * 		如果在此配置了showTitleBar=false，则所有标题都不显示，在BorderPane中即使配置了showTitleBar=true也不能显示
	 * 		如果在此配置了showTitleBar=true，在BorderPane中可以配置了showTitleBar=false隐藏指定面板的标题
	 * @default:
	 * 		true
	 * @type:
	 * 		{boolean}
	 * @example:
	 * |<div id="bc" dojoType="unieap.layout.BorderContainer" showTitleBar="false">
	 * |    ...  //嵌套方位面板
	 * | </div>	
	 * 配置不显示标题条
	 * @img:
	 * 		images/layout/bordercontainer-notitle.png
	 */
	showTitleBar:true,
	
	/**
	 * @summary:
	 * 		配置内部方位面板分割条是否可拖动
	 * @description:
	 * 		true:不可拖动，false：可拖动,默认可拖动，在显示分割条（splitLine=true）情况下生效。
	 * 		如果在此配置了fixed=true，则所有面板均不可拖动，在BorderPane中即使配置了fixed=false也不能拖动
	 * 		如果在此配置了fixed=false，在BorderPane中可以配置了fixed=true使指定面板的不可拖动
	 * @default:
	 * 		false
	 * @type：
	 * 		{boolean}
	 * @example:
	 * |<div id="bc" dojoType="unieap.layout.BorderContainer" fixed="true">
	 * |    ...  //嵌套方位面板
	 * | </div>	
	 * 配置分割条不可拖动
	 */
	fixed:false,
	
	/**
	 * @summary:
	 * 		面板是否可收缩
	 * @description:
	 * 		false：不可收缩，true：可收缩，默认为true。
	 * 		收缩按钮显示在标题条上，wrap=true,需要showTitleBar=true为前提才能保证收缩功能可用
	 * 		此二属性默认均为true。
	 * 		如果在此配置了wrap=false，则所有面板均不可收缩，在BorderPane中即使配置了wrap=true也不能收缩
	 * 		如果在此配置了wrap=true，在BorderPane中可以配置了wrap=false使指定面板的不可收缩
	 * @default:
	 * 		true
	 * @type:
	 * 		{boolean}
	 * @example:
	 * |<div id="bc" dojoType="unieap.layout.BorderContainer" wrap="true">
	 * |    ...  //嵌套方位面板
	 * | </div>	
	 * 配置面板可收缩,默认可收缩，如图下图所示，收缩按钮用黑框标出，当不可收缩时，没有此按钮
	 * @img:
	 * 		images/layout/bordercontainer-wrap.png
	 */
	wrap:true,
	
	/**
	 * @summary：
	 * 		配置BorderContainer容器的宽度
	 * @type：
	 * 		{string}
	 * @default：
	 * 		100%
	 */
	width:'100%',
	
	/**
	 * @summary：
	 * 		配置BorderContainer容器的高度
	 * @type：
	 * 		{string}
	 * @default：
	 * 		100%
	 */
	height:'100%', 
	
	// 左侧面板
	leftPane:null,
	
	rightPane:null,
	
	centerPane:null,
	
	topPane:null,
	
	bottomPane:null,
	
	postCreate: function() {
		dojo.addClass(this.domNode,'borderContainer');
		this.inherited(arguments);
		//为子面板赋属性
		var panes = this.containerNode.childNodes;
		var attrs = ['showTitleBar','fixed','splitLine','wrap'];
		for(var j=0; j<attrs.length; j++ ){
			var attrName = attrs[j];
			var attrValue = this.containerNode.getAttribute(attrName);
			if(attrValue != undefined) {
				for (var i = 0; i < panes.length; i++) {
					if(panes&&panes.nodeType==1){
						dojo.attr(panes[i], attrName)==null && dojo.attr(panes[i], attrName, attrValue);
					}
				}
			}
		}
	},
	
	startup: function() {
		this.resizeContainer();
		if(this.design == 'sidebar') {
			this.panes = [this.leftPane,this.rightPane,this.topPane,this.centerPane,this.bottomPane];
		} else {
			this.panes = [this.topPane,this.leftPane,this.rightPane,this.centerPane,this.bottomPane];
		}
		//对面板布局
		this.sortPanes();
		
		this.inherited(arguments);	//resizeContainer();
		
		//创建拖动条,拖动条是在BorderContainer内，对于各个面板来说是全局共用的，每次显示时调整位置
		this._moveLine = dojo.create('div',{
			'id':'moveLine',
			'class':'u-border-moveSplitLine'
		},this.domNode,'last');
		dojo.style(this._moveLine,'display','none');
		
		//设置方位面板属性
		for(var i=0; i<this.panes.length; i++) {
			if(this.panes[i]) {
				this.panes[i]._moveLine = this._moveLine;
			}
		}
	},
	
	
	sortPanes: function() {
		var preNode = dojo.create('div',null,this.domNode,'first');
		
		for(var i=0; i<this.panes.length; i++) {
			if(this.panes[i]) {
				dojo.place(this.panes[i].domNode,preNode,'after');
				preNode = this.panes[i].domNode;
			}
		}
		this.domNode.removeChild(this.domNode.firstChild);
	},
	//设置pane的宽、高:	top,bottom的高度由用户设置，left,right的宽度由用户设置，其他自动计算
	
	resize: function() {
		this.resizePanesHW();
	},
	
	resizeContainer: function() {
		if(null == this.domNode) return;
		this.resize();
		this.resizeChildrenContainer();
	},
	
	notifyParentResize: function() {
		this.resizeContainer();
	},
	
	resizePanesHW: function() {
		
		this.topPane && (this.topPane.domNode.style.width = 'auto');
		this.bottomPane && (this.bottomPane.domNode.style.width = 'auto');
		this.centerPane.domNode.style.width = 'auto';
		if(this.centerPane.domNode.offsetWidth < this.centerPane.centerMinSize) {
			this.centerPane.domNode.style.width = this.centerPane.centerMinSize + 'px';
		}
		
		//计算centerPane的高度
		var topHeight = this.topPane ? parseInt(this.topPane.domNode.offsetHeight) : 0;
		var bottomHeight = this.bottomPane ? parseInt(this.bottomPane.domNode.offsetHeight) : 0;
		var containerHeight = this.domNode.clientHeight;
		var finalHeight = (containerHeight - topHeight - bottomHeight);
		
	    finalHeight = this._adjustCenterSize(finalHeight);
		
		this.centerPane.domNode.style.height = finalHeight;
		
		if(this.design == 'sidebar') {
			this.leftPane && (this.leftPane.domNode.style.height = '100%');
			this.rightPane && (this.rightPane.domNode.style.height = '100%');
		} else {
			this.leftPane && (this.leftPane.domNode.style.height = finalHeight);
			this.rightPane && (this.rightPane.domNode.style.height = finalHeight);
			this.bottomPane && (this.bottomPane.domNode.style.clear = 'both');
		}
		this.handleFloatLayout();
	},
	
	//处理浏览器窗口缩小时，流式布局串位问题
	handleFloatLayout: function() {
		var lw = this.leftPane ? this.leftPane.domNode.offsetWidth : 0;
		var rw = this.rightPane ? this.rightPane.domNode.offsetWidth : 0;
		var cw = this.domNode.offsetWidth;
		if(cw == 0) {
			return;
		}
		var offset = lw + rw + this.centerPane.centerMinSize - cw;
		if(offset > 0) {
			if(this.leftPane && this.rightPane) { //左右面板都有
				var rightOffset = Math.floor(offset/2);
				var leftOffset = offset - rightOffset;
				if(rw-rightOffset >= 30 && lw-leftOffset >= 30) {
					dojo.style(this.rightPane.domNode,'width',(rw-rightOffset)+'px');
					dojo.style(this.leftPane.domNode,'width',(lw-leftOffset)+'px');
				} else if(rw-rightOffset >= 30 && lw-leftOffset <= 30){
					dojo.style(this.leftPane.domNode,'width','30px');
					rightOffset = offset - (lw - 30);
					if(rw - rightOffset >= 30){
						dojo.style(this.rightPane.domNode,'width',(rw - rightOffset)+'px');
					}else{
						dojo.style(this.rightPane.domNode,'width','30px');
					}
				} else if(rw-rightOffset <= 30 && lw-leftOffset >= 30) {
					dojo.style(this.rightPane.domNode,'width','30px');
					leftOffset = offset - (rw - 30);
					if(lw - leftOffset >= 30) {
						dojo.style(this.leftPane.domNode,'width',(lw - leftOffset)+'px');
					}else{
						dojo.style(this.leftPane.domNode,'width','30px');
					}
				}
			} else if(this.rightPane) { //只有左面板
				if(rw-offset >= 30) {
					dojo.style(this.rightPane.domNode,'width',(rw-offset)+'px');
				} else {
					dojo.style(this.rightPane.domNode,'width','30px');
				}
			} else if(this.leftPane) {
				if(lw-offset >= 30) {
					dojo.style(this.leftPane.domNode,'width',(lw-offset)+'px');
				}  else {
					dojo.style(this.leftPane.domNode,'width','30px');
				}
			}
			dojo.style(this.centerPane.domNode,'width',this.centerPane.centerMinSize + 'px');
		}
	},
	
	_adjustCenterSize: function(size){
		if(size < this.centerPane.centerMinSize){
			return this.centerPane.centerMinSize + 'px'
		} else {
			return  size+ 'px'
		}
	},
	
	/**
	 * @summary:
	 * 		获取指定方位的面板
	 * @param:
	 * 		{String} region 需要获取面板的方位
	 * @description:
	 *		如果没有输入参数，则返回null。
	 * @return:
	 * 		{unieap.layout.BorderPane}
	 * @enum:
	 * 		{'left'|'right'|'center'|'top'|'bottom'}
	 * @example:
	 * |var bc = unieap.byId('borderContainer');
	 * |var left = bc.getPaneByRegion('left');			
	 */
	getPaneByRegion: function(region) {
		switch (region) {
			case 'left':
				return this.leftPane;
			case 'right':
				return this.rightPane;
			case 'top':
				return this.topPane;
			case 'bottom':
				return this.bottomPane;
			case 'center':
				return this.centerPane;
			default:
				return null;
		}
	}
});