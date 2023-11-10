/*
根据不同的浏览器获得xml的dom解析器
*/
function XmlLoader(xmlStr)
{
   var xmlDoc=null;
        if(!window.DOMParser && window.ActiveXObject){//IE
            var xmlDomVersions = ['Microsoft.XMLDOM','MSXML.2.DOMDocument.6.0','MSXML.2.DOMDocument.3.0'];
            for(var i=0;i<xmlDomVersions.length;i++){
                try{
                    xmlDoc = new ActiveXObject(xmlDomVersions[i]);
                    xmlDoc.async = false;
                    xmlDoc.loadXML(xmlStr);
                    break;
                }catch(e){
                   return null;
                }
            }
        }
        else if(window.DOMParser && document.implementation && document.implementation.createDocument){//FireFox
            try{
                domParser = new  DOMParser();
                xmlDoc = domParser.parseFromString(xmlStr, 'text/xml');
            }catch(e){
               return null;
            }
        }
        else{
            return null;
        }
        return xmlDoc;
}

/*
解析xml串
*/
function XmlToJson(xmlStr,type,id)
{
    var tagName=getNameBaseType(type);
    var xmlParser=XmlLoader(xmlStr);
    if(xmlParser==null)
    {
     alert("your explorer do not have the xml parser required!");
     return "";
    }else{
	     var jsonStr="{";
	     var root=xmlParser.documentElement;
	     if(tagName=="Process")
	     {
	     	var items=root.getElementsByTagName(tagName);
		     var length=items.length;
		     for(var i=0;i<length;i++)
		     {
		     	var item=items[i];
		     	jsonStr+="id:'"+id+"'";
		         var name=item.getAttribute("name");
		         jsonStr+=",name:'"+name+"'";
		         var instId=item.getAttribute("instID");
		         jsonStr+=",instId:'"+instId+"'";
		         var state=item.getAttribute("state");
		         jsonStr+=",state:'"+state+"'";
		          var versionName=item.getAttribute("versionName");
		          var isActiveVersion=item.getAttribute("isActiveVersion");
		          var isCompleted=item.getAttribute("isCompleted");
		          var builder=item.getAttribute("builder");
		          var buildTime=item.getAttribute("buildTime");
		          var modifiedTime=item.getAttribute("modifiedTime");
		          jsonStr+=",versionName:'"+versionName+"',isActiveVersion:'"+isActiveVersion+"',isCompleted:'"+isCompleted+"',builder:'"+builder+"',buildTime:'"+buildTime+"',modifiedTime:'"+modifiedTime+"'";
		          return jsonStr+="}";
		     }
	     }
	     var items=root.getElementsByTagName(tagName);
	     var length=items.length;
	     for(var i=0;i<length;i++)
	     {
		       var item=items[i];
		       var iid="";
		       if(tagName=="Transition")
		       {
		         iid=item.getAttribute("id");
		       }else{
		         iid=item.getAttribute("ID");
		       }
		       if(iid==id)
		       {
		         jsonStr+="id:'"+id+"'";
		         var name=item.getAttribute("name");
		         jsonStr+=",name:'"+name+"'";
		         var instId=item.getAttribute("instID");
		         jsonStr+=",instId:'"+instId+"'";
		         var state=item.getAttribute("state");
		         jsonStr+=",state:'"+state+"'";
		         if(tagName=="SubprocNode")
		         {
		          var subproc=item.getElementsByTagName("subProc")[0];
		          if(subproc)
		          {
			          var id=item.getAttribute("subDefId");
			          jsonStr+=",subProcId:'"+id+"'";
			          var subInstId=item.getAttribute("subInstId");
			          jsonStr+=",subInstId:'"+subInstId+"'";
			          var versionName=subproc.getAttribute("versionName");
			          jsonStr+=",versionName:'"+versionName+"'";
			          var subprocType = subproc.getAttribute("boundType");
			          jsonStr+=",subprocType:'"+subprocType+"'";
		          }else{
		              jsonStr+=",subprocId:'',subInstId:'',versionName:''";
		          }
		         }
		          if(tagName=="Transition")
		         {
		          var sourceID=item.getAttribute("source");
		          var targetID=item.getAttribute("target");
		          var priority=item.getAttribute("priority");
		          jsonStr+=",sourceID:'"+sourceID+"',targetID:'"+targetID+"',priority:'"+priority+"'";
		         }
		         
		         if(tagName=="AutoNode")
		         {
		          var appID=item.getAttribute("application");
		          jsonStr+=",appID:'"+appID+"'";
		         }
		         
		         if(tagName=="ManualNode")
		         {
		          jsonStr+=",participants:[";
		          var children=item.childNodes;
		          var length=children.length;
			          for(var i=0;i<length;i++)
			          {
			           var child=children[i];
				           if(child.nodeName=="participants")
				           {
				            var participants=child.childNodes;
				            var l=participants.length;
					            if(l!=0)
					            {					               
						            for(var j=0;j<l;j++)
						            {
						              var participant=participants[j];
						              if(participant.nodeName=="Participant")
						              {
							              var type=participant.getAttribute("type");
							              var value=participant.getAttribute("value");
							              jsonStr+="{type:'"+type+"',value:'"+value+"'},"
							           }
						            }
						             var lt=jsonStr.length;
			                         jsonStr=jsonStr.substr(0,lt-1);
						        }
				           }
			          }
			      jsonStr+="]";
		         }
		         break;
		       }
	     }
     jsonStr+="}";
    }
    jsonStr=jsonStr.replace(new RegExp("\r","gm"),"").replace(new RegExp("\n","gm"),"");
    return jsonStr;
}

/*
根据控件类型，获得xml中的tagName
*/
function getNameBaseType(type)
{
 switch(type)
 {
   case "Process":
       return "Process";
       break;
   case "Transition":
       return "Transition";
       break;
   case "0":
       return "AutoNode";
       break;
   case "1":
       return "ManualNode";
       break;
   case "2":
       return "SubprocNode";
       break;
   case "5":
       return "ChoiceNode";
       break;
   case "8":
       return "StartNode";
       break;
   case "9":
      return "EndNode";
      break;
   case "16":
      return "Parallel";
      break;
   default:
      return "";
 }
}