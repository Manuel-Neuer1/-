dojo.provide("unieap.menu.PopupMenuItem");
dojo.require("unieap.menu.MenuItem");

dojo.declare("unieap.menu.PopupMenuItem",unieap.menu.MenuItem,{
	/**
	 * @summary:
	 * 		弹出菜单，当菜单项有子菜单时,需要使用该控件
	 * @declaredClass:
	 * 		unieap.menu.PopupMenuItem
	 * @superClass:
	 * 		unieap.menu.MenuItem
	 * @example:
	 * |	<div dojoType="unieap.menu.Menu">
	 * |		<div dojoType="unieap.menu.MenuItem" label="单独的"></div>
	 * |		<div dojoType="unieap.menu.PopupMenuItem" label="子项目">
	 * |			<div dojoType="unieap.menu.Menu">
	 * |				<div dojoType="unieap.menu.MenuItem" label="项目一"></div>
	 * |				<div dojoType="unieap.menu.MenuItem" label="项目二"></div>
	 * |			</div>
	 * |		</div>
	 * |	</div>
	 */
	
	/**
	 * @summary:
	 * 		子菜单弹出延迟时间,单位为毫秒
	 * @type:
	 * 		{number}
	 * @default:
	 * 		250
	 * @example:
	 * 		<div dojoType="unieap.menu.PopupMenuItem" label="子项目" popupDelay=500><div>
	 */
	popupDelay: 250,
	
	parentMenu:null,
	
	// 对HTML中包含以下语句进行解析
	// <div dojoType="dijit.PopupMenuItem">
	//		<span>pick me</span>
	//		<popup> ... </popup>
	// </div>
	_fillContent: function(){
		if(this.srcNodeRef){
			var nodes = dojo.query("*", this.srcNodeRef);
			
			if(nodes && nodes[0] && nodes[0].tagName=="SPAN"){
				unieap.menu.PopupMenuItem.superclass._fillContent.call(this, nodes[0]);
			}
			// save pointer to srcNode so we can grab the drop down widget after it's instantiated
			this.dropDownContainer = this.srcNodeRef;
		}
	},
	
	startup: function(){
		if(!this.popup){
			var node = dojo.query("[widgetId]", this.dropDownContainer)[0];
			this.popup = dijit.byNode(node);
			dojo.body().appendChild(this.popup.domNode);
			this.popup.domNode.style.display="none";
		}
		
		dojo.addClass(this.expandNode, "u-menu-expandEnabled");
		dojo.style(this.expandNode, "display", "");
		dijit.setWaiState(this.containerNode, "haspopup", "true");
		this.inherited(arguments);
	},
	
	//鼠标移动到其上，突出显示这一项
	_onMouseMove: function(evt){
		this.inherited(arguments);
		this._startPopupTimer(evt);
	},
	
	//鼠标移动到其上，突出显示这一项
	_onMouseOver: function(evt){
		this.inherited(arguments);
		this._startPopupTimer(evt);
	},
	
	_startPopupTimer: function(evt) {
		if(!this.disabled && !this.hover_timer){
			this.hover_timer = setTimeout(dojo.hitch(this, "_openPopup"), this.popupDelay);
		}
	},
	
	_stopPopupTimer: function() {
		if(this.hover_timer){
			clearTimeout(this.hover_timer);
			this.hover_timer = null;
		}
	},
	
	_openPopup: function(){
		this._stopPopupTimer();	
		var popup = this.popup;
		if (popup.isShowingNow) return;
		
		popup.startup && popup.startup();
		
		dijit.popup.open({
			parent: this,
			popup: popup,
			around: this.domNode,
			orient: this._orient || (this.isLeftToRight() ?
									{'TR': 'TL', 'TL': 'TR', 'BR': 'BL', 'BL': 'BR'} :
									{'TL': 'TR', 'TR': 'TL', 'BL': 'BR', 'BR': 'BL'})
		});
		popup.parentMenu=this;
		this._onBlur = function(){
			this._toggleClass(false);
			this._closePopup();
		}
		popup._removeAllToggle(popup);
	},
	
	_closePopup: function() {
		this._stopPopupTimer();
		if (!this.popup.isShowingNow) return;
		dijit.popup.close(this.popup);
		this.popup.isShowingNow = false;
	},
	
	//鼠标点击，如果此项设置为disabled，点击无效，否则触发onClick
	_onClick: function(evt){
		if(this.disabled) return;
//		if(this.popup.isShowingNow){
//			this._closePopup();
//		}	
		this.onClick(this.label, evt);
	}
});
//@ sourceURL=/tp_fp/techcomp/ria/dojo/../unieap/menu/PopupMenuItem.js