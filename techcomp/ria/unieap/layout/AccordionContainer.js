dojo.provide("unieap.layout.AccordionContainer");
dojo.require("unieap.layout.Container");
dojo.require("dijit._Templated");
dojo.require("unieap.layout.ContentPane");
dojo.require("dijit._CssStateMixin");
dojo.declare("unieap.layout.AccordionContainer", [unieap.layout.Container], {
	/**
     * @declaredClass:
     * 		unieap.layout.AccordionContainer
     * @summary:
     * 		手风琴
     * @classDescription:
     *		俗称“手风琴”容器
     * @superClass:
	 * 		unieap.layout.Container
     * @example:
	 * |<div id="AccordionContainer" dojoType="unieap.layout.AccordionContainer">
	 * |	<div dojoType="unieap.layout.AccordionPane"	title="1">
	 * |		
	 * |	</div>
	 * |	<div dojoType="unieap.layout.AccordionPane" title="2">
	 * |		
	 * |	</div>
	 * |	<div dojoType="unieap.layout.AccordionPane" title="3">
	 * |		
	 * |	</div>
	 * | </div>	
     */
	
	//配置属性接口
	UserInterfaces : dojo.mixin({
		duration : "number",
		showDefaultPane : "boolean",
		animate : "boolean"
	},
	unieap.layout.Container.prototype.UserInterfaces),	
	
    /**
     * @summary:
     * 		指定展开某个板块的持续时间，单位ms
     * @type：
     * 		{number}
	 * @description：
     * 		当有动画效果时有效
     * @default：
     * 		300
     */
	duration: 300,
	
	/**
	 * @summary:
	 * 		是否使用动画收缩
	 * @description:
	 * 		可以在global.js中修改全局默认值unieap.animate。
	 * 		在IE6 IE7中强制关闭动画效果
	 * @type：
	 * 		{boolean}
	 * @default：
	 * 		true
	 */
	animate:(typeof(unieap.animate) == 'undefined')?true:unieap.animate,

	doLayout:true,
	
	showDefaultPane: true,

	buttonWidget: "unieap.layout._AccordionButton",
	
	baseClass: "accordionContainer",

	buildRendering: function(){
		this.inherited(arguments);
		this.domNode.style.overflow = "hidden";		// TODO: put this in dijit.css
	},

	startup: function(){
		if(this._started){ return; }
		var children = this.getChildren();
		dojo.forEach(children, this._setupChild, this);
		dojo.some(children, function(child){
			if(child.selected){
				this.selectedChildWidget = child;
			}
			return child.selected;
		}, this);
		var selected = this.selectedChildWidget;
		if(this.showDefaultPane && !selected && children[0]){
			selected = this.selectedChildWidget = children[0];
			selected.selected = true;
		}
		this.inherited(arguments);
		if(this.selectedChildWidget){
			var style = this.selectedChildWidget.containerNode.style;
			style.display = "";
			style.overflow = "auto";
			this.selectedChildWidget._wrapperWidget.set("selected", true);
		}
		this._started = true;
	},

	/**
	 * @summary:
	 * 		选择某个板块
	 * @param:
	 * 		{unieap.layout.AccordionPane}
     * @example:
	 * |<div id="AccordionContainer" id="container"	dojoType="unieap.layout.AccordionContainer">
	 * |	<div dojoType="unieap.layout.AccordionPane"	title="1">
	 * |		
	 * |	</div>
	 * |	<div dojoType="unieap.layout.AccordionPane" id="pane2" title="2">
	 * |		
	 * |	</div>
	 * |	<div dojoType="unieap.layout.AccordionPane" title="3">
	 * |		
	 * |	</div>
	 * | </div>
	 * |
	 * | <script>
	 * |	var accordionContainer = unieap.byId("container");
	 * |	var accordionPane2 = unieap.byId("pane2");
	 * |		accordionContainer.selectChild(accordionPane2);
	 * | </script>
	 */
	selectChild: function(page){
		if(dojo.isString(page))
			page = dijit.byId((this._rootID||"")+page);
		else
			page = dijit.byId(page);
		if(this.selectedChildWidget != page){
			// Deselect old page and select new one
			var d = this._transition(page, this.selectedChildWidget);
			this._set("selectedChildWidget", page);
		}else if(!this.showDefaultPane){
			if(page && page._wrapperWidget){ 
				if('block' == dojo.style(page._wrapperWidget.containerNode,"display")){
					page._wrapperWidget.set("selected", false);
					this._hideChild(page);
				}else{
					this._showChild(page);
					page._wrapperWidget.set("selected", true);
					this._set("selectedChildWidget", page);
				}
			}
		}
		return d;		
	},
		
	resize: function(changeSize, resultSize){
		var selected = this.selectedChildWidget;
		if(selected && !this._hasBeenShown){
			this._hasBeenShown = true;
			this._showChild(selected);
		}
		var node = this.domNode;

		// set margin box size, unless it wasn't specified, in which case use current size
		if(changeSize){
			dojo.marginBox(node, changeSize);
			// set offset of the node
			if(changeSize.t){ node.style.top = changeSize.t + "px"; }
			if(changeSize.l){ node.style.left = changeSize.l + "px"; }
		}

		// If either height or width wasn't specified by the user, then query node for it.
		// But note that setting the margin box and then immediately querying dimensions may return
		// inaccurate results, so try not to depend on it.
		var mb = resultSize || {};
		dojo.mixin(mb, changeSize || {});	// changeSize overrides resultSize
		if( !("h" in mb) || !("w" in mb) ){
			mb = dojo.mixin(dojo.marginBox(node), mb);	// just use dojo.marginBox() to fill in missing values
		}

		// Compute and save the size of my border box and content box
		// (w/out calling dojo.contentBox() since that may fail if size was recently set)
		var cs = dojo.getComputedStyle(node);
		var me = dojo._getMarginExtents(node, cs);
		var be = dojo._getBorderExtents(node, cs);
		var bb = (this._borderBox = {
			w: mb.w - (me.w + be.w),
			h: mb.h - (me.h + be.h)
		});
		var pe = dojo._getPadExtents(node, cs);
		this._contentBox = {
			l: dojo._toPixelValue(node, cs.paddingLeft),
			t: dojo._toPixelValue(node, cs.paddingTop),
			w: bb.w - pe.w,
			h: bb.h - pe.h
		};

		// Callback for widget to adjust size of its children
		this.layout();
	},
		
		
	resizeContainer: function() {
		if(null==this.domNode) return;
		this.resize();
	},
		
	layout: function(openWidget){
		// Implement _LayoutWidget.layout() virtual method.
		// Set the height of the open pane based on what room remains.
		var openPane = this.selectedChildWidget || openWidget;
		
		if(!openPane){ return;}

		// space taken up by title, plus wrapper div (with border/margin) for open pane
		if(!this._contentBox){
			var node = this.domNode;
			var mb = {};
			dojo.mixin(mb, {});	// changeSize overrides resultSize
			if( !("h" in mb) || !("w" in mb) ){
				mb = dojo.mixin(dojo.marginBox(node), mb);	// just use dojo.marginBox() to fill in missing values
			}
			var cs = dojo.getComputedStyle(node);
			var me = dojo._getMarginExtents(node, cs);
			var be = dojo._getBorderExtents(node, cs);
			var bb = (this._borderBox = {
				w: mb.w - (me.w + be.w),
				h: mb.h - (me.h + be.h)
			});
			var pe = dojo._getPadExtents(node, cs);
			this._contentBox = {
					l: dojo._toPixelValue(node, cs.paddingLeft),
					t: dojo._toPixelValue(node, cs.paddingTop),
					w: bb.w - pe.w,
					h: bb.h - pe.h
				};
		}
		var wrapperDomNode = openPane._wrapperWidget.domNode,
			wrapperDomNodeMargin = dojo._getMarginExtents(wrapperDomNode),
			wrapperDomNodePadBorder = dojo._getPadBorderExtents(wrapperDomNode),
			wrapperContainerNode = openPane._wrapperWidget.containerNode,
			wrapperContainerNodeMargin = dojo._getMarginExtents(wrapperContainerNode),
			wrapperContainerNodePadBorder = dojo._getPadBorderExtents(wrapperContainerNode),
			mySize = this._contentBox;

		// get cumulative height of all the unselected title bars
		var totalCollapsedHeight = 0;
		dojo.forEach(this.getChildren(), function(child){
            if(child != openPane && child._wrapperWidget){
				totalCollapsedHeight += dojo._getMarginSize(child._wrapperWidget.domNode).h;
			}
		});
		this._verticalSpace = mySize.h - totalCollapsedHeight - wrapperDomNodeMargin.h
		 	- wrapperDomNodePadBorder.h - wrapperContainerNodeMargin.h - wrapperContainerNodePadBorder.h
			- openPane._buttonWidget.getTitleHeight();

		// Memo size to make displayed child
		this._containerContentBox = {
			h: this._verticalSpace,
			w: this._contentBox.w - wrapperDomNodeMargin.w - wrapperDomNodePadBorder.w
				- wrapperContainerNodeMargin.w - wrapperContainerNodePadBorder.w
		};

		if(openPane){
			openPane.resize(this._containerContentBox);
		}
	},

	_setupChild: function(child){
		// Overrides _LayoutWidget._setupChild().
		// Put wrapper widget around the child widget, showing title

		child._wrapperWidget = new unieap.layout._AccordionInnerContainer({
			contentWidget: child,
			buttonWidget: this.buttonWidget,
			id: child.id + "_wrapper",
			dir: child.dir,
			lang: child.lang,
			parent: this
		});
		dojo.attr(child.domNode,'title','');
		this.inherited(arguments);
	},

	/**
	 * @summary:
	 * 		增加一个板块
	 * @param:
	 * 		{unieap.layout.AccordionPane}
	 * @param:
	 * 		{number} insertIndex
	 * 		插入的位置
	 * @param:
	 * 		{boolean} needselected 是否增加一个Tab页后就选择该Tab页，默认选中
	 * @example:
	 * |unieap.byId('accordionContainer').addChild(new unieap.layout.AccordionPane({
	 * |	title: "新增的板块"
	 * |}));
	 */
	addChild: function(/*dijit._Widget*/ child, /*Integer?*/ insertIndex){
		if(this._started){
			// Adding a child to a started Accordion is complicated because children have
			// wrapper widgets.  Default code path (calling this.inherited()) would add
			// the new child inside another child's wrapper.

			// First add in child as a direct child of this AccordionContainer
			dojo.place(child.domNode, this.containerNode, insertIndex);

			if(!child._started){
				child.startup();
			}
			
			// Then stick the wrapper widget around the child widget
			this._setupChild(child);

			// Code below copied from StackContainer
			dojo.publish(this.id+"-addChild", [child, insertIndex]);
			if(!this.selectedChildWidget && this.showDefaultPane){
				this.selectChild(child);
			}
			this.layout();
		}else{
			// We haven't been started yet so just add in the child widget directly,
			// and the wrapper will be created on startup()
			this.inherited(arguments);
		}
	},

	/**
	 * @summary:
	 * 		删除一个板块
	 * @param:
	 * 		{unieap.layout.AccordionPane}
	 */
	removeChild: function(child){
		if(child == this.selectedChildWidget && this.getChildren().length>1){
			this.forward();
		}
		if (1 == this.getChildren().length) {
			this.selectedChildWidget = null;
		}
		if(child._wrapperWidget){
			dojo.place(child.domNode, child._wrapperWidget.domNode, "after");
			child._wrapperWidget.destroy();
			delete child._wrapperWidget;
		}
		this.inherited(arguments);
		this.layout();
	},

	getChildren: function(){
		// Overrides _Container.getChildren() to return content panes rather than internal AccordionInnerContainer panes
		return dojo.map(this.inherited(arguments), function(child){
			return child.declaredClass == "unieap.layout._AccordionInnerContainer" ? child.contentWidget : child;
		}, this);
	},

	destroy: function(){
		if(this._animation){
			this._animation.stop();
		}
		dojo.forEach(this.getChildren(), function(child){
			// If AccordionContainer has been started, then each child has a wrapper widget which
			// also needs to be destroyed.
			if(child._wrapperWidget){
				child._wrapperWidget.destroy();
			}else{
				child.destroyRecursive();
			}
		});
		this.inherited(arguments);
	},

	_showChild: function(child){
		// Override StackContainer._showChild() to set visibility of _wrapperWidget.containerNode
		child._wrapperWidget.containerNode.style.display="block";
		return this.inherited(arguments);
	},

	_hideChild: function(child){
		// Override StackContainer._showChild() to set visibility of _wrapperWidget.containerNode
		child._wrapperWidget.containerNode.style.display="none";
		this.inherited(arguments);
	},

	_transition: function(/*dijit._Widget?*/ newWidget, /*dijit._Widget?*/ oldWidget){
		// Overrides StackContainer._transition() to provide sliding of title bars etc.
		var	animate = this.animate;
		
		if(dojo.isIE < 8){
			// workaround animation bugs by not animating; not worth supporting animation for IE6 & 7
			animate = false;
		}

		if(this._animation){
			// there's an in-progress animation.  speedily end it so we can do the newly requested one
			this._animation.stop(true);
			delete this._animation;
		}

		var self = this;
		if(newWidget){
			newWidget._wrapperWidget.set("selected", true);

			if('undefined' == typeof this._containerContentBox) this.layout(newWidget);
			var d = this._showChild(newWidget);	// prepare widget to be slid in

			// Size the new widget, in case this is the first time it's being shown,
			// or I have been resized since the last time it was shown.
			// Note that page must be visible for resizing to work.
			if(this.doLayout && newWidget.resize){
				newWidget.resize(this._containerContentBox);
			}
		}

		if(oldWidget && oldWidget._wrapperWidget){
			oldWidget._wrapperWidget.set("selected", false);
			if(!animate){
				this._hideChild(oldWidget);
			}
		}

		if(animate&&oldWidget){
			var newContents = newWidget._wrapperWidget.containerNode,
				oldContents = oldWidget._wrapperWidget.containerNode;

			// During the animation we will be showing two dijitAccordionChildWrapper nodes at once,
			// which on claro takes up 4px extra space (compared to stable AccordionContainer).
			// Have to compensate for that by immediately shrinking the pane being closed.
			var wrapperContainerNode = newWidget._wrapperWidget.containerNode,
				wrapperContainerNodeMargin = dojo._getMarginExtents(wrapperContainerNode),
				wrapperContainerNodePadBorder = dojo._getPadBorderExtents(wrapperContainerNode),
				animationHeightOverhead = wrapperContainerNodeMargin.h + wrapperContainerNodePadBorder.h;

			oldContents.style.height = (self._verticalSpace - animationHeightOverhead) + "px";
			var self=this;
			this._animation = new dojo.Animation({
				node: newContents,
				duration: this.duration,
				curve: [1, this._verticalSpace - animationHeightOverhead - 1],
				onAnimate: function(value){
					value = Math.floor(value);	// avoid fractional values
					newContents.style.height = value + "px";
					oldContents.style.height = (self._verticalSpace - animationHeightOverhead - value) + "px";
				},
				onEnd: function(){
					delete self._animation;
					newContents.style.height = "auto";
					if(oldWidget&&oldWidget._wrapperWidget){
						oldWidget._wrapperWidget.containerNode.style.display = "none";
						oldContents.style.height = "auto";
						self._hideChild(oldWidget);
					}
				}
			});
			this._animation.onStop = this._animation.onEnd;
			this._animation.play();
		}

		return d;	// If child has an href, promise that fires when the widget has finished loading
	},
	// note: we are treating the container as controller here
	_onKeyPress: function(/*Event*/ e, /*dijit._Widget*/ fromTitle){
		// summary:
		//		Handle keypress events
		// description:
		//		This is called from a handler on AccordionContainer.domNode
		//		(setup in StackContainer), and is also called directly from
		//		the click handler for accordion labels
		if(this.disabled || e.altKey || !(fromTitle || e.ctrlKey)){
			return;
		}
		var k = dojo.keys,
			c = e.charOrCode;
		if((fromTitle && (c == k.LEFT_ARROW || c == k.UP_ARROW)) ||
				(e.ctrlKey && c == k.PAGE_UP)){
			this._adjacent(false)._buttonWidget._onTitleClick();
			dojo.stopEvent(e);
		}else if((fromTitle && (c == k.RIGHT_ARROW || c == k.DOWN_ARROW)) ||
				(e.ctrlKey && (c == k.PAGE_DOWN || c == k.TAB))){
			this._adjacent(true)._buttonWidget._onTitleClick();
			dojo.stopEvent(e);
		}
	},
	_adjacent: function(/*Boolean*/ forward){
		// summary:
		//		Gets the next/previous child widget in this container from the current selection.
		var children = this.getChildren();
		var index = dojo.indexOf(children, this.selectedChildWidget);
		index += forward ? 1 : children.length - 1;
		return children[ index % children.length ]; // dijit._Widget
	},

	forward: function(){
		return this.selectChild(this._adjacent(true));
	},

	back: function(){
		return this.selectChild(this._adjacent(false));
	}
});


dojo.declare("unieap.layout._AccordionInnerContainer",[dijit._Widget, dijit._CssStateMixin], {

	baseClass: "accordioninnerContainer",
	
	// tell nested layout widget that we will take care of sizing
	isContainer: true,
	isLayoutContainer: true,
	
	buildRendering: function(){
		// Builds a template like:
		//	<div class=dijitAccordionInnerContainer>
		//		Button
		//		<div class=dijitAccordionChildWrapper>
		//			ContentPane
		//		</div>
		//	</div>
	
		// Create wrapper div, placed where the child is now
		this.domNode = dojo.place("<div class='" + this.baseClass + "'>", this.contentWidget.domNode, "after");
		
		// wrapper div's first child is the button widget (ie, the title bar)
		var child = this.contentWidget,
			cls = dojo.getObject(this.buttonWidget);
		this.button = child._buttonWidget = (new cls({
			contentWidget: child,
			label: child.title,
			title: child.tooltip,
			dir: child.dir,
			lang: child.lang,
			iconClass: child.iconClass,
			id: child.id + "_button",
			parent: this.parent
		})).placeAt(this.domNode);
		
		// and then the actual content widget (changing it from prior-sibling to last-child),
		// wrapped by a <div class=dijitAccordionChildWrapper>
		this.containerNode = dojo.place("<div class='accordionChildWrapper' style='display:none'>", this.domNode);
		dojo.place(this.contentWidget.domNode, this.containerNode);
	},
	
	
	_setSelectedAttr: function(/*Boolean*/ isSelected){
		this._set("selected", isSelected);
		this.button.set("selected", isSelected);
		if(isSelected){
			var cw = this.contentWidget;
			if(cw.onSelected){ cw.onSelected(); }
		}
	},
	
	startup: function(){
		// Called by _Container.addChild()
		this.contentWidget.startup();
	},
	
	destroy: function(){
		this.button.destroyRecursive();
	
		dojo.forEach(this._contentWidgetWatches || [], function(w){ w.unwatch(); });
	
		delete this.contentWidget._buttonWidget;
		delete this.contentWidget._wrapperWidget;
	
		this.inherited(arguments);
	},
	
	destroyDescendants: function(){
		// since getChildren isn't working for me, have to code this manually
		this.contentWidget.destroyRecursive();
			}
});


dojo.declare("unieap.layout._AccordionButton",
	[dijit._Widget, dijit._Templated, dijit._CssStateMixin],
	{
	// summary:
	//		The title bar to click to open up an accordion pane.
	//		Internal widget used by AccordionContainer.
	// tags:
	//		private

	templateString:
	"<div dojoAttachEvent='onclick:_onTitleClick' class='accordionTitle'>" +
		"<div dojoAttachPoint='titleNode,focusNode' dojoAttachEvent='onkeypress:_onTitleKeyPress' " +
				"class='accordionTitleFocus' role='tab' aria-expanded='false'>" +
			"<span class='accordionArrow' role='presentation'></span>" +
			"<span class='arrowTextUp' role='presentation'>+</span>" +
			"<span class='arrowTextDown' role='presentation'>-</span>" +
			"<img src='${_blankGif}' alt='' class='accordionIcon' dojoAttachPoint='iconNode' style='vertical-align: middle' role='presentation'/>" +
			"<span role='presentation' dojoAttachPoint='titleTextNode' class='dijitAccordionText'></span>" +
		"</div>" +
	"</div>",
	
	attributeMap: dojo.mixin(dojo.clone(unieap.layout.ContentPane.prototype.attributeMap), {
		label: {node: "titleTextNode", type: "innerHTML" },
		title: {node: "titleTextNode", type: "attribute", attribute: "title"},
		iconClass: { node: "iconNode", type: "class" }
	}),

	baseClass: "accordionTitle",

	getParent: function(){
		// summary:
		//		Returns the AccordionContainer parent.
		// tags:
		//		private
		return this.parent;
	},

	buildRendering: function(){
		this.inherited(arguments);
		var titleTextNodeId = this.id.replace(' ','_');
		dojo.attr(this.titleTextNode, "id", titleTextNodeId+"_title");
		dijit.setWaiState(this.focusNode, "labelledby", dojo.attr(this.titleTextNode, "id"));
		dojo.setSelectable(this.domNode, false);
	},

	getTitleHeight: function(){
		// summary:
		//		Returns the height of the title dom node.
		return dojo._getMarginSize(this.domNode).h;	// Integer
	},

	// TODO: maybe the parent should set these methods directly rather than forcing the code
	// into the button widget?
	_onTitleClick: function(){
		var parent = this.getParent();
			parent.selectChild(this.contentWidget);
			dijit.focus(this.focusNode);
	},

	_onTitleKeyPress: function(/*Event*/ evt){
		return this.getParent()._onKeyPress(evt, this.contentWidget);
	},

	_setSelectedAttr: function(/*Boolean*/ isSelected){
		this._set("selected", isSelected);
		dijit.setWaiState(this.focusNode, "expanded", isSelected);
		dijit.setWaiState(this.focusNode, "selected", isSelected);
		this.focusNode.setAttribute("tabIndex", isSelected ? "0" : "-1");
	}
});