dojo.provide("unieap.menu.MenuSeparator");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.declare("unieap.menu.MenuSeparator",[dijit._Widget, dijit._Templated],{
	/**
	 * @declaredClass:
	 * 		unieap.menu.MenuSeparator
	 * @summary:
	 * 		设置菜单项之间的分隔符
	 * @example:
	 * |	<div dojoType="unieap.menu.Menu">
	 * |		<div dojoType="unieap.menu.MenuItem">开始</div>
	 * |		<div dojoType="unieap.menu.MenuSeparator"></div>
	 * |		<div dojoType="unieap.menu.MenuItem">结束</div>
	 * |	</div>
	 */
	
	templateString: '<tr class="u-menu-separator">'
			+'<td class="left">'
			+'<span class="u-menu-item-separator"></span>'
			+'</td><td class="middle">'
			+'<span class="u-menu-item-separator"></span>'
			+'</td><td class="right">'
			+'<span class="u-menu-item-separator"></span>'
			+'</td></tr>',

	postCreate: function(){
		dojo.setSelectable(this.domNode, false);
	}
});
//@ sourceURL=/tp_fp/techcomp/ria/dojo/../unieap/menu/MenuSeparator.js