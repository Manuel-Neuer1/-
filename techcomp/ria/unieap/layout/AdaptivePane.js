dojo.provide("unieap.layout.AdaptivePane");
dojo.require("unieap.layout.Container");
dojo.declare("unieap.layout.AdaptivePane", [unieap.layout.Container], {
	/**
     * @declaredClass:
     * 		unieap.layout.AdaptivePane
     * @summary:
     * 		自适应组件的内容面板
     * 		AdaptivePane如果设置autoHeight=true，则此面板的height只能设置为百分比形式。
     * 		如果没有设置autoHeight，此面板高度的height可以设置为任意格式
     * @classDescription:
     *		位于自适应容器内部，用作某一显示区域内容的展示
	 */
	
	//配置属性接口
	UserInterfaces : dojo.mixin({
		autoHeight : "boolean",
		marginTop : "number",
		marginBottom : "number",
		getHeight : "function",
		setHeight : "function",
		isAutoHeight : "function"
	},
	unieap.layout.Container.prototype.UserInterfaces),
	
	/**
	 * @summary：
	 * 		是否是自适应的容器
	 * @description：
	 * 		自适应容器可以自动撑满父容器剩下的高度空间，同时可以存在多个自适应容器根据规则自动分配高度
	 * @type：
	 * 		{boolean}
	 * @default：
	 * 		false
	 */
	autoHeight : false,
	
	/**
	 * @description:
	 * 		容器的上边距（不能和前一个容器的marginBottom同时使用）
	 * @type:
	 * 		{number}
	 * @default:
	 * 		0
	 */
	marginTop : 0,
	
	/**
	 * @description:
	 * 		容器的下边距（不能和下一个容器的marginTop同时使用）
	 * @type:
	 * 		{number}
	 * @default:
	 * 		0
	 */
	marginBottom : 0,
	
	postCreate:function(){
		dojo.addClass(this.containerNode,"adaptivepane");
		dojo.style(this.containerNode,{
			'marginTop': this.marginTop +"px",
			'marginBottom':this.marginBottom + "px"
		});
		this.initContainer();
	},
	
	/**
	 * @summary:
	 * 		获取容器的高度
	 * @return:
	 * 		{number}
	 * @example:
	 * |var height = unieap.byId('adaptivePane1').getHeight();
	 */
	getHeight : function(){
		if(this.isAutoHeight()){
			return this.height == "auto" ? 100 : parseInt(this.height);
		}
		var h = 0;
		if(this.height == "auto"){
			for(var i=0,n;(n=this.containerNode.childNodes[i]);i++){
				//不是注释、script、style 节点 ，在IE7里这些节点的offsetHeight不为0  
				//for 社保
				 if(n.nodeType && n.nodeType != 8 && n.tagName!='SCRIPT'&&n.tagName!='STYLE'){    
	                    h+=(n.offsetHeight || 0);
	              }
			}
			dojo.style(this.containerNode,"height",h+"px");
		}
		else{
			h = this.containerNode.offsetHeight;
		}
		return h;
	},
	
	/**
	 * @summary:
	 * 		设置容器的高度
	 * @param:
	 * 		{String} height 面板高度
	 * @description:
	 * 		设置AdaptivePane的高度前，请确认此面板是否为autoHeight的，如果是，则只接受百分比形式的高度
	 * 		如果不是，可以设置任意形式的高度
	 * @example:
	 * |unieap.byId('adaptivePane1').setHeight("500px");
	 * @example:
	 * |var pane = unieap.byId('adaptivePane1');
	 * |if(pane.isAutoHeight()){
	 * |	pane.setHeight("50%");
	 * |} else {
	 * |	pane.setHeight(200);
	 * |}
	 */
	setHeight : function(height){
		this.height = height;
		dojo.style(this.domNode,"height",this._convertNumber(this.height));
	},
	
	/**
	 * @summary:
	 * 		判断本自适应面板是否为自适应的
	 * @return:
	 * 		{boolean} true表示本面板是自适应的，false表示本面板不是自适应的
	 * @example:
	 * |unieap.byId('adaptivePane1').isAutoHeight()
	 */
	isAutoHeight : function(){
		return this.autoHeight;
	}
});
//@ sourceURL=/tp_fp/techcomp/ria/dojo/../unieap/layout/AdaptivePane.js