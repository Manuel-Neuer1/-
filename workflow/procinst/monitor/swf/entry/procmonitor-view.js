workflow.define("procmonitor",function(){
	
	this.loadDetail=function(type,item){
		if(type==="Process"){
			parent.window["monitor"].loadProcDetail(item.instId);
			parent.window["reldata-processor"].getRelDataByIds(item.instId,"","");
			parent.window["monitorworkitem"].clearWorkItemGrid();
		}else{
			//如果节点实例id为空，表示此时未走到该节点，取id即模板ID
			if(item.instId.length==0){
				parent.window["reldata-processor"].getRelDataByIds(procInstId,"",item.id);
				parent.window["monitorworkitem"].clearWorkItemGrid();
			}else{
				parent.window["reldata-processor"].getRelDataByIds("",item.instId,item.id);
				parent.window["monitorworkitem-processor"].getWorkItemByActId(item.instId);
			}
			if(type==="0"){
				parent.window["monitor"].loadAutoActDef(item.id);
			}else if(type==="1"){
				parent.window["monitor"].loadManulActDef(item.id);
			}else if(type==="2"|| type==="3"){
				parent.window["monitor"].loadSubProcActDef(item.id);
			}else if(type==="4"){
				parent.window["monitor"].loadEventActDef(item.id);
			}
		}
	}
	
	this.actComplete=function(actInstID){
		var features={};
		features.operation="actComplete";
		features.procinstId=procInstId;
		features.actInstId=actInstID;
		var url=unieap.WEB_APP_NAME+"/workflow/svgMonitor.action";
		unieap.Action.requestData({
			url:url,
			parameters:features,
			sync:true,
			load:function(dc,ds){}
		});
		location.href = unieap.WORKFLOW_PATH+"/procinst/monitor/swf/entry/procmonitor.jsp?procinstId="+procInstId;
	}
	
	this.actRollBack=function(item){
		getParentJqWidget("dialog").wDialog({
            modal:false,
            title:'节点回退',
            width:'300px',
            height:'150px',
            loadUrl:unieap.WEB_APP_NAME+"/workflow/procinst/monitor/swf/entry/actRollBack.jsp?actInstID="+item.instId+"&actName="+item.name,
            confirm:function(){
            	if(patterFlag=='H5-Monitor'){
            		parent.window[1]["actRollBack"].actRollBack();
            	}else{
            		parent.window[2]["actRollBack"].actRollBack();//貌似也是[1]才好用
            	}
            	location.href = unieap.WORKFLOW_PATH+"/procinst/monitor/swf/entry/procmonitor.jsp?procinstId="+procInstId;
            }
	    });
	}
	
	this.doAbort=function(procinstid){
		var features={};
		features.operation="abort";
		features.procinstId=procinstid;
		features.isNewVersion=true;
		var url=unieap.WEB_APP_NAME+"/workflow/svgMonitor.action";
		unieap.Action.requestData({
			url:url,
			parameters:features,
			sync:true,
			load:function(dc,ds){}
		});
		location.href = unieap.WORKFLOW_PATH+"/procinst/monitor/swf/entry/procmonitor.jsp?procinstId="+procinstid;
	}
	
	this.doComplete=function(){
		var features={};
		features.operation="complete";
		features.procinstId=procinstid;
		features.isNewVersion=true;
		var url=unieap.WEB_APP_NAME+"/workflow/svgMonitor.action";
		unieap.Action.requestData({
			url:url,
			parameters:features,
			sync:true,
			load:function(dc,ds){}
		});
		location.href = unieap.WORKFLOW_PATH+"/procinst/monitor/swf/entry/procmonitor.jsp?procinstId="+procinstid;
	}
	
	this.doResume=function(){
		var features={};
		features.operation="resume";
		features.procinstId=procinstid;
		features.isNewVersion=true;
		var url=unieap.WEB_APP_NAME+"/workflow/svgMonitor.action";
		unieap.Action.requestData({
			url:url,
			parameters:features,
			sync:true,
			load:function(dc,ds){}
		});
		location.href = unieap.WORKFLOW_PATH+"/procinst/monitor/swf/entry/procmonitor.jsp?procinstId="+procinstid;
	}
	
	this.doSuspend=function(){
		var features={};
		features.operation="suspend";
		features.procinstId=procinstid;
		features.isNewVersion=true;
		var url=unieap.WEB_APP_NAME+"/workflow/svgMonitor.action";
		unieap.Action.requestData({
			url:url,
			parameters:features,
			sync:true,
			load:function(dc,ds){}
		});
		location.href = unieap.WORKFLOW_PATH+"/procinst/monitor/swf/entry/procmonitor.jsp?procinstId="+procinstid;
	}
	
	this.doRestart=function(){
		var features={};
		features.operation="restart";
		features.procinstId=procinstid;
		features.isNewVersion=true;
		var url=unieap.WEB_APP_NAME+"/workflow/svgMonitor.action";
		unieap.Action.requestData({
			url:url,
			parameters:features,
			sync:true,
			load:function(dc,ds){}
		});
		location.href = unieap.WORKFLOW_PATH+"/procinst/monitor/swf/entry/procmonitor.jsp?procinstId="+procinstid;
	}
	
	this.refresh=function(){
		location.href = unieap.WORKFLOW_PATH+"/procinst/monitor/swf/entry/procmonitor.jsp?procinstId="+procinstid;
	}
	
});