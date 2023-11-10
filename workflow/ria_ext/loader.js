/**
 * //在单帧情况下，记录外层父对象的ID。RIA的单帧策略会为单帧的页面的所有的ID增加一个父容器的ID作为前缀
	//在此情况下，jquery根据ID获得对象的方式不可用，需要进行代理。
 */

//禁止使用dialog重新登陆--重写RIA  global.js常量定义
unieap.session.dialogRelogin=false;


if (!window.workflow) {
	workflow = {};
};
workflow.define= function(context, func) {
	viewContextHolder.localFunc=func;//在单帧框架下，define里的函数时动态定义的，导致无法访问外部的func，只有保存在全局变量中
	unieap.define(context,function(){
		var parentNodeId="";
		if(this.rootNode)
			parentNodeId=rootId;	
		var jquery=window.jQuery;
		var $=function(selector){
			if(typeof selector==="string"&&selector.indexOf("#")==0)
				return jquery("#"+parentNodeId+selector.slice(1));
			else
				return jquery(selector);
		};
		 function getParentWidget(id){
			var parentContainer=window;
			if(!parentNodeId)//非单帧加载
				parentContainer=parent;
			return parentContainer.dijit.byId(getParentWidgetId(id));
		};
		function getParentJqWidget(id){
			var parentContainer=window;
			if(!parentNodeId)//非单帧加载
				parentContainer=parent;
			return parentContainer.$("#"+getParentWidgetId(id));
		};
		function getParentJqWidgetByClass(cls){
			var parentContainer=window;
			if(!parentNodeId)//非单帧加载
				parentContainer=parent;
			return parentContainer.$(cls);
		};
		getParentWidgetId=function(id){
			return "content"+id;//暂时写死导航页面中的id
		};
		
		jquery.extend($,jquery);
		var funcStr = viewContextHolder.localFunc.toString().replace(/(^function\s*\(\)\s*\{)+?|(}$)+?/g,"");
		eval(funcStr);
		viewContextHolder.localFunc=null;
		
	});
}