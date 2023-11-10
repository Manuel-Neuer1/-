function open_windows(openURL,width,height)
{
    var left = (window.screen.availWidth - width) / 2;
    
    var top = (window.screen.availHeight - height) /2;
    
    var features = "status=no,resizable=no,scrollbars=no,left=" + left + "," + "top=" + top + "," + "width=" + width + "," + "height=" + height;

    window.open(openURL, "", features);
}
function open_scrollable_window(openURL,width,height)
{
    var left = (window.screen.availWidth - width) / 2;
    var top = (window.screen.availHeight - height) /2;
    var features = "status=no,resizable=yes,scrollbars=yes,left=" + left + "," + "top=" + top + "," + "width=" + width + "," + "height=" + height;
    window.open(openURL, "", features);
}
function open_max_window(openURL){
  	var left=0;
    var top =0;
    var width=window.screen.availWidth-10;
    var height=window.screen.availHeight;
    var features = "status=no,resizable=yes,scrollbars=yes,left=" + left + "," + "top=" + top + "," + "width=" + width + "," + "height=" + height;
    window.open(openURL, "", features);
}
function open_modalWindow(openURL,title,width,height)
{
    var left = (window.screen.availWidth - width) / 2;
    var top = (window.screen.availHeight - height) /2;
    var features ="status:no;resizable:no;center:yes;help:no;dialogLeft:" + left + "px;" + "dialogTop:" + top + "px;" + "dialogWidth:" + width + "px;" + "dialogHeight:" + height+"px";
    var param = new Array(openURL,title);
    return window.showModalDialog("unieap/pages/workflow/common/popupwrapper.jsp",param , features);
}

function open_modalWindow(openURL,width,height)
{
  var left = (window.screen.availWidth - width) / 2;
  var top = (window.screen.availHeight - height) /2;
  var features ="status:yes;resizable:no;center:yes;help:no;dialogLeft:" + left + "px;" + "dialogTop:" + top + "px;" + "dialogWidth:" + width + "px;" + "dialogHeight:" + height+"px";
  if(window.showModalDialog("unieap/pages/workflow/common/popupwrapper.jsp",openURL , features))
    refresh();
 }