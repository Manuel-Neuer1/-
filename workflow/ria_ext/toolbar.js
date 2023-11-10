/**
 * 擴展RIAgrid的工具欄
 */
(function(){
	if(!unieap.xgrid.toolbar)
		return;
	var toolbar_prototype=unieap.xgrid.toolbar.prototype;
	toolbar_prototype.templateString="<div class='u-grid-master-toolbar'>" +
						//动态改变每页显示数据条数
						"<div class='u-grid-page left' style='display:none'>"+
							"<table cellPadding='0' cellSpacing='0'><tbody><tr>"+
							"<td><span class='u-grid-cpagesize-left' dojoAttachPoint='perPageNode'></span></td>"+
							"<td dojoAttachPoint='customPageSizeNode'></td>"+
							"<td><span class='u-grid-cpagesize-right' dojoAttachPoint='rowsNode'></span></td>"+
							"<td><div class='sep'></div></td>" +
							"</tr></tbody></table>"+
						"</div>"+
						
						//导出、打印
						"<div  class='u-grid-page left' style='display:none'>" +
							"<table cellPadding='0' cellSpacing='0'><tbody><tr>" +
								"<td><span class='u-grid-export' dojoAttachPoint='exportNode'></span></td>" +
								"<td><span class='u-grid-individual' dojoAttachPoint='individualNode'></span></td>" +
								"<td><span class='u-grid-print' dojoAttachPoint='printNode'></span></td>" +
							"</tr></tbody></table>" +
						"</div>" +
						
						//用户在toolbar上自定义显示
						"<div class='u-grid-page left'>" +
							"<table cellPadding='0' cellSpacing='0'><tbody><tr><td dojoAttachPoint='containerNode' height='100%'>" +
							"</td></tr></tbody></table>" +
						"</div>" +
						
						//翻页信息显示(本页多少条记录、共多少条记录)
						"<div class='u-grid-page right'>" +
							"<table cellPadding='0' cellSpacing='0'><tbody><tr><td>" +
							    "<span dojoAttachPoint='pageInfoNode'></span>" +
						    "</td></tr></tbody></table>" +
					    "</div>" +
					    //翻页条
					    "<div class='u-grid-page right'>" +
						    "<table cellPadding='0' cellSpacing='0'><tbody><tr>" +
								    "<td><span dojoAttachPoint='firstImageNode' class='ico u-grid-page-first'></span></td>" +
								    "<td><span dojoAttachPoint='prevImageNode' class='ico u-grid-page-prev'></span></td>" +
								    "<td><span dojoAttachPoint='pageNoStart'></span></td>" +
								    "<td><input dojoAttachPoint='pageNoNode' class='u-grid-page-pageNo'></td>" +
								    "<td><span dojoAttachPoint='totalPageNoNode'></span></td>" +
								    "<td><span dojoAttachPoint='nextImageNode' class='ico u-grid-page-next'></span></td>" +
								    "<td><span dojoAttachPoint='lastImageNode' class='ico u-grid-page-last'></span></td>" +
								    "<td><div class='sep'></div></td>" +
							"</tr></tbody></table>" +
						"</div>" +
    				"</div>";
})();