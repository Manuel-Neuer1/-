dojo.provide("unieap.menu.MenuItem");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require('dijit._Contained');

dojo.declare("unieap.menu.MenuItem",[dijit._Widget, dijit._Templated, dijit._Contained],{
	/**
	 * @declaredClass:
	 * 		unieap.menu.MenuItem
	 * @summary:
	 * 		菜单项
	 */
	 
	templateString:
		 '<tr class="u-menu-item" dojoAttachPoint="itemNode" >'
			+'<td class="u-menu-itemLeft" dojoAttachPoint="itemLeftNode"><div class="${iconClass}" dojoAttachPoint="iconNode" ></div></td>'
			+'<td tabIndex="-1" class="u-menu-itemLabel" dojoAttachPoint="containerNode" waiRole="menuitem">'
				+'<div dojoAttachPoint="labelNode"></div>'
			+'</td>'
			+'<td class="u-menu-itemRight" dojoAttachPoint="arrowCell">'
				+'<div class="u-menu-expand" dojoAttachPoint="expandNode" style="display:none">'
				+'</div>'
			+'</td>'
		 +'</tr>',
			
	/**
	 * @summary:
	 * 		指定菜单项名称
	 * @type:
	 * 		{string}
	 * @default：
	 * 		''
	 * @example:
	 * |<div dojoType="unieap.menu.Menu">
	 * |		<div dojoType="unieap.menu.MenuItem" label="中国"></div>
	 * |		<div dojoType="unieap.menu.MenuItem" label="日本"></div>
	 * |</div>
	 */
	label: '',
	
	/**
	 * @summary:
	 * 		指定菜单项左侧的css样式,例如在菜单左侧显示图标
	 * @type:
	 * 		{string}
	 * @example:
	 * |.plusIcon{
	 * |	background-image: url(plus.gif);
	 * |	width: 18px;
	 * |	height: 18px;
	 * |}
	 * |<div dojoType="unieap.menu.Menu">
	 * |		<div dojoType="unieap.menu.MenuItem" label="中国" iconClass="plusIcon"></div>
	 * |		<div dojoType="unieap.menu.MenuItem" label="日本"></div>
	 * |</div>
	 */
	iconClass: "",
	
	/**
	 * @summary:
	 * 		设置是否禁用菜单项
	 * @type:
	 * 		{boolean}
	 * @default:
	 * 		false
	 * @example:
	 *|<div dojoType="unieap.menu.Menu">
	 *|		<div dojoType="unieap.menu.MenuItem" label="中国"></div>
	 *|		<div dojoType="unieap.menu.MenuItem" label="日本" disabled="true"></div>
	 *|</div>
	 */
	disabled: false,
	
	postCreate: function(){
		dojo.setSelectable(this.domNode, false);
		this.disabled&&this.setDisabled(this.disabled);
		this._conn();
		if(this.label){
			this.labelNode.innerHTML = this.label;
		}
		if(this.getParent()){
			//dojo.style(this.itemLeftNode,"display","none");解决设置isShowIcon = false时样式错乱问题
			!this.getParent().isShowIcon && dojo.style(this.itemLeftNode,"width","0px");
			this.getParent().menuHeight && dojo.style(this.itemNode,"height",this.getParent().menuHeight);
		}
	},
	
	//为菜单绑定一些操作：鼠标移动到其上、鼠标点击事件
	_conn:function(){
		this.connect(this.itemNode,'onmousemove',this._onMouseMove);
		this.connect(this.itemNode,'onclick',this._onClick);
	},
	
	//鼠标移动到其上，突出显示这一项
	_onMouseMove: function(evt){
		dijit.focus(this.containerNode);
		this._toggleClass(true);
		this.getParent()._mouseOver(this);
	},
	
	//鼠标点击，如果此项设置为disabled，点击无效，否则使菜单消失
	_onClick: function(evt){
		if(this.disabled) return;
		if(false == unieap.fireEvent(this,this.onClick,[this.label, evt])){
			return;
		}
		
		var topMenu=this._getTopMenu();
		dijit.popup.close(topMenu);
		
	},
	
	_getTopMenu: function(){
		var top=this;
		while(top.getParent&&top.getParent()&&top.getParent().parentMenu){
			top._toggleClass(false);
			dijit.popup.close(top.getParent());
			top=top.getParent().parentMenu;
		}
		top._toggleClass(false);
		return top.getParent&&top.getParent();
	},
	
	/**
	 * @summary:
	 * 		点击菜单项时触发，如果返回false点击无效，否则使菜单消失
	 * @param：
	 * 		{string} label
	 * @param:
	 * 		{event} evt
	 * @example:
	 * |<script type="javascript/text">
	 * |	function fn(label,evt) {
	 * |		alert('您点击了'+label);
	 * |	}
	 * |</script>
	 * |<div dojoType="unieap.menu.Menu">
	 * |		<div dojoType="unieap.menu.MenuItem" label="中国" onClick="fn"></div>
	 * |		<div dojoType="unieap.menu.MenuItem" label="日本" disabled="true"></div>
	 * |</div>
	 */
	onClick: function(la, evt) {
		return true;
	},
	
	//判断本项是否是叶子节点
	isLeafNode : function(){
		return this.declaredClass!="unieap.menu.PopupMenuItem";
	},
	
	/**
	 * @summary:
	 * 		隐藏菜单项
	 * @param：
	 * 		{boolean} value
	 * @example:
	 * |    var disItem=new unieap.menu.MenuItem({label:'法国'});
	 * |	disItem.setVisible(true);
	 */
	setVisible : function(/*Boolean*/ value){
		this.domNode.style.display = value?"block":"none";
	},
	
	/**
	 * @summary:
	 * 		设置菜单项是否可用
	 * @param：
	 * 		{boolean} value
	 * @example:
	 * |    var disItem=new unieap.menu.MenuItem({label:'法国'});
	 * |	disItem.setDisabled(true);
	 */
	setDisabled: function(/*Boolean*/ value){
		// summary: enable or disable this menu item
		this.disabled = value;
		if(value){
			this.domNode && dojo.addClass(this.domNode, 'u-menu-itemDisabled');
			var className = null;
			if (this.iconNode) {
				className = this.iconNode.className;
			} 
			if(className&&className.lastIndexOf("Disabled")<0){
				this.iconNode.className= className.concat("Disabled");
			}
			if(!this.isLeafNode()){ 				
				dojo.addClass(this.expandNode, 'u-menu-expandDisabled');
				dojo.removeClass(this.expandNode, 'u-menu-expandEnabled');
			}
		}
		else{
			this.domNode && dojo.removeClass(this.domNode, 'u-menu-itemDisabled');
			var className = null,i;
			if (this.iconNode) {
				className = this.iconNode.className;
			} 
			if(className && (i=className.lastIndexOf("Disabled"))>0){
				this.iconNode.className= className.substring(0,i);
			}
			if(!this.isLeafNode()){	
				dojo.removeClass(this.expandNode, 'u-menu-expandDisabled');
				dojo.addClass(this.expandNode, 'u-menu-expandEnabled');
			}
		}
		
	},
	
	focus: function(){
		this._toggleClass(true);
		try{
			dijit.focus(this.containerNode);
		}catch(e){
			// this throws on IE (at least) in some scenarios
		}
	},
	
	// 更新item的样式
	_toggleClass: function(isHover) {
		if (isHover) {
			dojo.addClass(this.domNode, 'u-menu-itemHover');
			dojo.addClass(this.itemLeftNode, 'u-menu-itemHover');
			dojo.addClass(this.containerNode, 'u-menu-itemHover');
			dojo.addClass(this.arrowCell, 'u-menu-itemHover');
		} else {
			dojo.removeClass(this.domNode, 'u-menu-itemHover');
			dojo.removeClass(this.itemLeftNode, 'u-menu-itemHover');	
			dojo.removeClass(this.containerNode, 'u-menu-itemHover');
			dojo.removeClass(this.arrowCell, 'u-menu-itemHover');
		}
	}
});
//@ sourceURL=/tp_fp/techcomp/ria/dojo/../unieap/menu/MenuItem.js