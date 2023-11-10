dojo.provide("unieap.layout.AccordionPane");
dojo.require("unieap.layout.ContentPane");
dojo.declare("unieap.layout.AccordionPane", [unieap.layout.ContentPane], {
	/**
     * @declaredClass:
     * 		unieap.layout.AccordionPane
     * @summary:
     * 		手风琴
     * @classDescription:
     *		“手风琴”容器中的面板
     * @superClass:
	 * 		unieap.layout.ContentPane
     * @example:
	 * |<div id="AccordionContainer" dojoType="unieap.layout.AccordionContainer">
	 * |	<div dojoType="unieap.layout.AccordionPane"	title="1">
	 * |		
	 * |	</div>
	 * |	<div dojoType="unieap.layout.AccordionPane" title="2">
	 * |		
	 * |	</div>
	 * |	<div dojoType="unieap.layout.ContentPane" title="3">
	 * |		
	 * |	</div>
	 * | </div>	
     */
	
	//配置属性接口
	UserInterfaces : dojo.mixin({
		iconClass	:	"string",
		onSelected : "function"
	},
	unieap.layout.ContentPane.prototype.UserInterfaces),
	
	/**
	 * @summary:
	 * 		AccordionPane的图标样式
	 * @type：
	 * 		{string}
	 * @example：
	 * | .heart{
	 * |	background: url("heart.png") no-repeat;
	 * | }
	 * |
	 * | <div	dojoType="unieap.layout.AccordionPane"	title="自定义图标" iconClass="heart">
	 * | </div>
	 */
	iconClass:"",
	
	/**
	 * @summary:
	 * 		AccordionPane的是否被默认选中
	 * @type：
	 * 		{boolean}
	 * @default
	 * 		false
	 */
	selected:false,
	
	setIcon: function(icon){
		dojo.style(this._buttonWidget.iconNode, "backgroundImage", "url('"+icon+"')");
	},
	
	resize : function (changeSize){
		if(changeSize){
			var style = this.domNode.style;
			this.height=Math.max(0,changeSize.h);
			this.width=Math.max(0,changeSize.w);
			style.width=this.width+"px";
			style.height=this.height+"px";
		}
		this.resizeChildrenContainer();
	},

	/**
	 * @summary:
	 * 		AccordionPane的选中事件
	 * @type：
	 * 		{function}
	 * @example：
	 * | function fun{
	 * |	alert("你选中了我")
	 * | }
	 * |
	 * | <div	dojoType="unieap.layout.AccordionPane"	onSelected="fun">
	 * | </div>
	 */
	onSelected: function(){
		// summary:
		//		called when this pane is selected
	}
	
});