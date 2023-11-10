function setProcMakerIFrame(procInstId,procdefid,version,pattern,path,line,curStr,flag){
	var str = '<iframe id="resourceViewIFrame"  src="'+path+'/workflow/processDesigner/processmonitor.html?procInstId='+procInstId
	+'&procDefId='+procdefid+'&version='+version+'&pattern=Monitor&line='+line+'&curID='+curStr+'&curState='+flag+"&theme=new"
	+'" style="width:100%;height:100%;border:0px;background: #fff;"></iframe>' 
	document.write(str);
}