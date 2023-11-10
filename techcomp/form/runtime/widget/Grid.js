WebForm.widget("unieap.grid.Grid",WebForm.FormContainer,{
	table:null,// 获取整个dom节点
	name:null,
	dataStore:null,
	uploadFilesDataStore:null,//保存上传附件信息的ds
	canEdit:true,
	primaryKeys:[],//保存查询出来的原始主键
	rowNumber:null,// 每页显示的行数
	maxRowNum:null,//限制最多行数xzdswe
	canAddRow:null,// 是否可增加行
	canDeleteRow:null,// 是否可删除行
	gridDataBind:null,// 获取绑定字段
	totalInfo:null,// 全部节点信息
	notVisibleInfo:null,// 不可见列信息
	primaryKeyValue:null,//主键名
	count:null,//全局记数器，保证添加行时，rowid唯一
	onAddPagePop:[],//弹出添加行回调（datatable）
	onEditPagePop:[],//弹出编辑行回调（datatable）
	beforeAddDT:[],//增加行数据之前回调（datatable）
	afterAddDT:[],//增加行数据之后回调（datatable）
	beforeUpdateDT:[],//更新行数据之前回调（datatable）
	afterUpdateDT:[],//更新行数据之后回调（datatable）
	beforeDelDT:[],//删除行数据之前回调（datatable）
	afterDelDT:[],//删除行数据之后回调（datatable）
	afterAdd:[],//增加行数据后回调
	afterDelete:[],//删除行回调
	afterSave:[],//编辑行回调
	beforeEdit:[],//编辑前事件回调
	beforeSave:[],//保存前事件回调
	currentCell:null,//当前选中的单元格
//	sortname:null,//默认排序列
	preCol:null,//预置资产数据列
	isExitPkRow:null,//是否存在主键
	isReadOnly:false,//只读开关
	isPC:true,//是否电脑端
	isPreReadOnly:false,//预知项只读开关
	showtypes:{},//记录每列的显示类型
	vms:{},//vue对象集
	_create:function(){
		if(Util.getClientInfo()==="PC"){
			this.isPC=true;
		}else{
			this.isPC=false;
		}
		this.totalInfo=[];
		this.notVisibleInfo=[];
		this.preCol=[];
		this.onAddPagePop=[];
		this.onEditPagePop=[];
		this.beforeAddDT=[];
		this.afterAddDT=[];
		this.beforeUpdateDT=[];
		this.afterUpdateDT=[];
		this.beforeDelDT=[];
		this.afterDelDT=[];
		this.afterAdd=[];//清空数组,防止一个表单里面有多个Grid时,数组叠加。
		this.afterDelete=[];
		this.afterSave=[];
		this.beforeEdit=[];
		this.beforeSave=[];
		this.isExitPkRow=false;
		this.table =this.element;
		this.id=this.table.attr("id");
		this.name = this.table.attr("name");
		this.pageId = this.id+'page';
//		this.sortname=this.table.attr('sortname');
		var canEditTable=this.table.attr("editable");
		if(canEditTable&&canEditTable=="false")
			this.canEdit=false;
		var canReadOnly=this.table.attr("readonly");
		if((canReadOnly&&canReadOnly=="readonly")||(canReadOnly&&canReadOnly=="true"))
			this.isReadOnly=true;
		var canReadOnlyPre=this.table.attr("readonlypre");
		if(canReadOnlyPre&&canReadOnlyPre=="true")
			this.isPreReadOnly=true;
		this.table.parent().append('<div id=' + this.pageId + '></div>');
		var left = this.table.offset().left-21;
		
		var dc=dataCenter; 
		var dataBindName=this.table.attr("databind"); 
		this.primaryKeyValue =this.table.attr("primarykey");
		
		this.analyzeDom();
		
		this.count = 0;
		if(!dataBindName)
			return; 
		for(var name in dataCenter.dataStores){
			if(name.indexOf("_record")>=0){
				continue;
			}
			var dataStore=dataCenter.dataStores[name];
			var ctrls=dataStore.getParameter("relatedcontrols");
			if(!ctrls||ctrls=="")
				continue;
			var controls=ctrls.split(",");
			for(var i=0;i<controls.length;i++){
				var controlID=controls[i];
				if(controlID!=this.id)
					continue;
				var rowSetName=dataStore.getRowSetName();
				if(rowSetName!=dataBindName)
					alert("数据集绑定实体和当前Grid关联实体不匹配！");
				else
				 	this.dataStore=dataStore;
			}
		}
		if(!this.dataStore){ 
			this.dataStore= new unieap.ds.DataStore(this.id);
			this.dataStore.setParameter("relatedcontrols",this.id);
			dataCenter.addDataStore(this.dataStore); 
		}
        this.uploadFilesDataStore = dataCenter.dataStores['uploader_grid_'+this.id];
        this.uploadFilesDataStore.setParameter("grid_name",this.name);
	},
	bindOnAddPagePopEvent:function(callback){
		this.onAddPagePop.push(callback);
	},
	bindOnEditPagePopEvent:function(callback){
		this.onEditPagePop.push(callback);
	},
	bindBARowDTEvent:function(callback){
		this.beforeAddDT.push(callback);
	},
	bindAARowDTEvent:function(callback){
		this.afterAddDT.push(callback);
	},
	bindBURowDTEvent:function(callback){
		this.beforeUpdateDT.push(callback);
	},
	bindAURowDTEvent:function(callback){
		this.afterUpdateDT.push(callback);
	},
	bindBDRowDTEvent:function(callback){
		this.beforeDelDT.push(callback);
	},
	bindADRowDTEvent:function(callback){
		this.afterDelDT.push(callback);
	},
	//为grid增加回调行增加回调接口
	bindAfterAddEvent:function(callback){
		this.afterAdd.push(callback);
	},
	//为grid增加回调行增加回调接口
	bindAfterDeleteEvent:function(callback){
		this.afterDelete.push(callback);
	},
	//为grid增加回调行增加回调接口
	bindAfterSaveCellEvent:function(callback){
		this.afterSave.push(callback);
	},
	//为grid增加回调行增加回调接口
	bindBeforeEditCellEvent:function(callback){
		this.beforeEdit.push(callback);
	},
	//为grid增加回调行增加回调接口
	bindBeforeSaveCellEvent:function(callback){
		this.beforeSave.push(callback);
	},

	//绑定数据
	bindData:function(){
		if(this.table.attr('datatable')=='true'){//datatable样式表单
			this._loadDatatable(this._bindCallbackDatatable);
		}else{
			this._loadJQGrid(this._bindCallback);
		}
	},
	
	_bindCallback:function(){
		if(!this.dataStore) return;
		// this.getEditAuth();
		this.creatGrid();
		
		//添加上传按钮
		if(!this.isReadOnly&&this.canEdit){
			var div = $("<div style='display:none'></div>");
			div.attr('id',this.id+'_importExcel');
			$('body').append(div);
		    
		    var uploader = WebUploader.create({
			    // 选完文件后，是否自动上传。
			    auto: true,
			    // swf文件路径
			    swf: WEBAPP+'/techcomp/form/common/webuploader/Uploader.swf',
			    // 文件接收服务端。
			    server: WEBAPP + '/formParser?status=formExcel&action=importGridExcel',
			    // 内部根据当前运行是创建，可能是input元素，也可能是flash.
			    pick: '#'+this.id+'_importExcel',
			    // 只允许选择图片文件。
			    accept: {
			    	title:'Excel',
			        extensions: 'xls,xlsx',
			        mimeTypes: '.xls,.xlsx'
			    },
			    fileNumLimit: 9999,
			    duplicate:true, 
		        fileSizeLimit: 200 * 1024 * 1024,    // 200 M
		        fileSingleSizeLimit: 50 * 1024 * 1024 ,    // 50 M
		        formData : {
		        	allowSize : 1 * 1024 * 1024,  
		        	allowSuffix : 'xls,xlsx'
		        }
			});	
		    // 数据导入成功
			uploader.on( 'uploadSuccess', function(file,data) {
				for(var i=data.length-1;i>=0;i--){
					var row = data[i];
					self.count ++;
					var idName = self.primaryKeyValue;
					if(!row[idName])
						row[idName]=Math.getUuid("rowid",25,32);
					for(var j=0;j<self.totalInfo.length;j++){
						if(self.totalInfo[j].showtype == 'date'){
							var bindName = self.totalInfo[j].dataBind;
							if(!row[bindName]){//非必填且空值不校验
								continue;
							}
							var time = row[bindName];
							time = new Date(parseInt(time,10));
							if(Date.parse(time)==0){
								Msg.warning("表格中日期格式列未能正确导入，请将表格中日期格式的列在Excel中改为日期类型，并定义其格式为如：2012/3/13 13:30的形式")
							}
							var timeStr=Util.dateFormatter(time,self.totalInfo[j].format||"yyyy-MM-dd");
							row[bindName] = timeStr;
						}
					}
					self.table.setGridParam().addRowData(self.count,row,'first');
					self.dataStore.getRowSet().addRow(row,false,false);
					var callbacks=self.afterAdd;
					for( var index in callbacks){
						if(callbacks[index](row,self.count)==false){
							return;
						}
					}
					self.table.trigger("reloadGrid");
				}
			});

			//数据导入失败
			uploader.on( 'uploadError', function( file ) {
				alert('数据导入失败');
			});
		}
		
		var rowset=this.dataStore.getRowSet();
		var i=0;
		var grid=this.table;
		var self = this;
		rowset.forEach(function(row){
			if(unieap.isEmpty(row.getData()))
				return;			
			for(var j = 0; j < self.totalInfo.length; j++){
				//解析日期
				if(self.totalInfo[j].showtype == 'date'){
					var bindName = self.totalInfo[j].dataBind;
					var time = row.getData()[bindName];
					if(time){
						var miles = Number(time);
						// 服务器端时区，北京东八区（-8*60）
						var timezone = -480;
						// 客户端实际时区(例如东京为东九区：-540)
						var offsetGMT = new Date(miles).getTimezoneOffset();
						// 计算差值
						var adjust = timezone - offsetGMT;
						miles = miles - adjust * 60 * 1000;
						time = new Date(miles);
						var timeStr=Util.dateFormatter(time,self.totalInfo[j].format||"yyyy-MM-dd");
						row.getData()[bindName] = timeStr;
					}
				}
			}
			//保存查询出来的所有的主键信息
			primaryKeyValue=self.primaryKeyValue;
			var pk_id=Math.getUuid("pre",25,32);
			var rowKeyValue=row.getData()[primaryKeyValue];
			var keyObject={};
			var newRowData=row.getData();
			if(rowKeyValue&&newRowData._t!=1){
				self.primaryKeys.push(rowKeyValue);
				keyObject[rowKeyValue]=1;
			}else{
				keyObject[pk_id]=1;
				var pk_col={};
				pk_col[primaryKeyValue]=pk_id;
				newRowData=$.extend({},row.getData(),pk_col);
	        	var newRow = new unieap.ds.Row(null,newRowData,0);
	        	self.dataStore.getRowSet().updateRow(i,newRow);
			}
			grid.jqGrid('addRowData',i,newRowData);
			i++;
			self.count++;
		});
		this.table.trigger("reloadGrid");
		//新增
		var colInfo=$(".jqgfirstrow>td",this.table);
		for(var j=0;j<colInfo.length;j++){
			if(self.totalInfo[j]){
				var colnName=self.totalInfo[j].databind;
				//var defaultvalue=self.totalInfo[j].defaultvalue;
				colInfo.eq(j).attr({"name":colnName
//					,"defaultvalue":defaultvalue
					})
			}
		} 
		if(window.innerWidth<1023){
			//手机端Grid无高度
			$(".ui-jqgrid-bdiv").css("height","");
		}
	},
	_bindCallbackDatatable:function(){
		if(!this.dataStore) return;
		// this.getEditAuth();
		this.creatGrid();
		var rowset=this.dataStore.getRowSet();
		var i=0;
		var grid=this.table;
		var self = this;
		rowset.forEach(function(row){
			if(unieap.isEmpty(row.getData()))
				return;			
			for(var j = 0; j < self.totalInfo.length; j++){
				//解析日期
				if(self.totalInfo[j].showtype == 'date'){
					var bindName = self.totalInfo[j].dataBind;
					var time = row.getData()[bindName];
					if(time){
						var miles = Number(time);
						// 服务器端时区，北京东八区（-8*60）
						var timezone = -480;
						// 客户端实际时区(例如东京为东九区：-540)
						var offsetGMT = new Date(miles).getTimezoneOffset();
						// 计算差值
						var adjust = timezone - offsetGMT;
						miles = miles - adjust * 60 * 1000;
						time = new Date(miles);
						var timeStr=Util.dateFormatter(time,self.totalInfo[j].format||"yyyy-MM-dd");
						row.getData()[bindName] = timeStr;
					}
				}
			}
			//保存查询出来的所有的主键信息
			primaryKeyValue=self.primaryKeyValue;
			var pk_id=Math.getUuid("pre",25,32);
			var rowKeyValue=row.getData()[primaryKeyValue];
			var keyObject={};
			var newRowData=row.getData();
			if(rowKeyValue&&newRowData._t!=1){
				self.primaryKeys.push(rowKeyValue);
				keyObject[rowKeyValue]=1;
			}else{
				keyObject[pk_id]=1;
				var pk_col={};
				pk_col[primaryKeyValue]=pk_id;
				newRowData=$.extend({},row.getData(),pk_col);
	        	var newRow = new unieap.ds.Row(null,newRowData,0);
	        	self.dataStore.getRowSet().updateRow(i,newRow);
			}
			grid.datatableAdd(newRowData,false,true);
			i++;
		});
	},
	//加载jqgrid
	_loadJQGrid:function(callback){
		var that=this;
		if($.fn.jqGrid)//已经加载直接执行
			callback.apply(that);
		else{
			$.ajaxSettings.async=false;
			//$.getScript(WEBAPP+"/techcomp/form/common/jquery/js/jquery-jqGrid-min.js",function(){
			$.getScript(WEBAPP+"/techcomp/form/common/jquery/js/jquery-jqGrid-neusoft.js",function(){
				callback.apply(that);
			});
		}
	},
	//加载datatable
	_loadDatatable:function(callback){
		var that=this;
		if($.fn.datatable)//已经加载直接执行
			callback.apply(that);
		else{
			$.ajaxSettings.async=false;
			$.getScript(WEBAPP+"/techcomp/form/common/jquery/js/datatableMethod.js",function(){
				callback.apply(that);
			});
		}
	},
	//创建数据表格
	creatGrid:function(){// 初始化grid所需要的数据
		var area = this.table;
		if(!this.dataStore) return;

		var primaryRows = this.dataStore.getRowSet().getData('primary');
		var deleteRows = this.dataStore.getRowSet().getData('delete');
		var colNames = [];
		for(var i = 0; i < this.totalInfo.length; i++){
			colNames.push(this.totalInfo[i].text);
		}
		var colModel = [];
		for(var i = 0; i < this.totalInfo.length; i++){
			var buffer = {};
			buffer.name = this.totalInfo[i].dataBind;
			buffer.index = this.totalInfo[i].dataBind;
			buffer.align = 'center';
			buffer.width = this.totalInfo[i].width;
			buffer.presetcol  = this.totalInfo[i].presetcol ;
//			buffer.sorttype = 'int';
			//设定显示类型
			if(this.totalInfo[i].showtype == 'textarea'){//多行文本
				buffer.edittype = 'textarea';
				buffer.editoptions = {rows:"2",cols:"20"};	
			}else if(this.totalInfo[i].showtype == 'select'){//下拉菜单
				buffer.edittype = 'select';
				buffer.editoptions = {};
				buffer.editoptions.value = this.totalInfo[i].comboboxshowvalue;
				buffer.formatter = 'select';
				buffer.unformat = this.selectTwo;
			}else if(this.totalInfo[i].showtype == 'checkbox'){//复选框
				buffer.edittype = 'checkbox';
				buffer.editoptions = {};
				buffer.editoptions.value = this.totalInfo[i].checkboxshowvalue;
			}else if(this.totalInfo[i].showtype == 'text'){//单行文本
				buffer.edittype = 'text';
			}else if(this.totalInfo[i].showtype == 'date'){//单行文本
//				buffer.sorttype = 'date';//搜索时按日期搜索
			}
			if(this.totalInfo[i].editable == 'true')// 设置可编辑
				buffer.editable = true;
			else
				buffer.editable = false;
			if(this.totalInfo[i].notnull == 'true')// 设置可排序
				buffer.notnull = true;
			else
				buffer.notnull = false;
			if(this.totalInfo[i].visible == 'true')// 设置可见
				buffer.visible = true;
			else
				buffer.visible = false;
			colModel.push(buffer);
		}
		var IsShrinkToFit=false;
		this.width =this.table.parent().width()-5;
		var height;
		if(this.rowNumber <= 10)
			height = this.rowNumber*23+2;
		else
			height = 10 * 23;
		var lastsel;
		area.children().remove();
		area.attr('style',null);
		area.attr('align',null);
		var self = this;
		var isAddAndDel = !(area.attr('isAddAndDel')=='false');
		var isImport = !(area.attr('isImport')=='false');
		var isExport = !(area.attr('isExport')=='false');
		var isReset = !(area.attr('isReset')=='false');
		if(area.attr('datatable')=='true'){//datatable样式表单
			area.datatable();
			if(!this.isReadOnly&&this.canEdit){
				if(isImport){//可导入
					var downTemp = $('<a href="JavaScript:;" class="link_btn swiper-slide swiper-slide-active"><i class="fa fa-download"></i>下载模板</a>');
					area.next().find(".swiper-wrapper").append(downTemp);
					downTemp.on("click",function(){
						    var area = $(this).parents(".responsive-padding-box").prev();
						    var self = area.data("FormWidget");
							var requestURL = WEBAPP + "/formParser?status=formExcel&action=exportGridExcelTemplate";
			                var columns = [];
			                for(var i = 0; i < self.totalInfo.length; i++){
			                	var column = {};
			                	if(self.totalInfo[i].visible!='false'&&self.totalInfo[i].editable!='false'){
			                		column.name = self.totalInfo[i].dataBind;
			                		column.label = self.totalInfo[i].text;
			                		if(self.totalInfo[i].showtype=="date"){
			                			column.datatype = "date";
			                		}else if(self.totalInfo[i].showtype=="select"){
			                			column.datatype = "string";
			                			column.fieldtype = "combobox";
			                			column.fieldvalue = self.totalInfo[i].comboboxshowvalue;
			                		}else{
			                			column.datatype = "string";
			                		}
			                		if(self.totalInfo[i].showtype!="uploadFiles"){
			                		    columns.push(column);
			                		}
			                	}
			        		}
			                var titleStr = self.table.attr("name").replace(' ','');
			                var xhr = new XMLHttpRequest();
			                  xhr.open('POST',requestURL,true);
			                  xhr.responseType = "blob";
			                  xhr.onload = function(){
			                	  if(this.status == 200) {
			                		  var blob = this.response;
			                		  var url = URL.createObjectURL(blob);
			                		  if(url.indexOf("http")==-1){
			                		  window.navigator.msSaveOrOpenBlob(blob,titleStr+".xls");
			                		  }else{
			                		  var alink = $("<a id = 'alink' href = '"+url+"' download  = '"+titleStr+".xls'><p></p></a>")
			                		  $('body').append(alink);
			                		  $("#alink").children().click();
			                		  $("#alink").remove();
			                		  }
			                	  }
			                  }
			                 var  data = {"columns":JSON.stringify(columns),"title":titleStr,"gridData":JSON.stringify(self.dataStore.rowSet.primary)};
			                  xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
			                  var data1 = JSON.stringify(columns);
			                  var data2 = titleStr;
			                  data1=data1.replace(/\%/g,"%25"); 
			                  data1=data1.replace(/\#/g,"%23"); 
			                  data1=data1.replace(/\&/g,"%26"); 
			                  data1=data1.replace(/\+/g,"%2B"); 
			                  data2=data2.replace(/\%/g,"%25"); 
			                  data2=data2.replace(/\#/g,"%23"); 
			                  data2=data2.replace(/\&/g,"%26"); 
			                  data2=data2.replace(/\+/g,"%2B");
			                  xhr.send("columns="+data1+"&title="+data2);
					})
					var upload = $('<a href="JavaScript:;" class="link_btn swiper-slide swiper-slide-active"><i class="fa fa-upload"></i>导入数据</a>');
					//添加上传按钮
					    area.next().find(".swiper-wrapper").append(upload);
						var div = $("<div style='display:none'></div>");
						div.attr('id',this.id+'_importExcel');
						$('body').append(div);
					    var uploader = WebUploader.create({
						    // 选完文件后，是否自动上传。
						    auto: true,
						    // swf文件路径
						    swf: WEBAPP+'/techcomp/form/common/webuploader/Uploader.swf',
						    // 文件接收服务端。
						    server: WEBAPP + '/formParser?status=formExcel&action=importGridExcel',
						    // 内部根据当前运行是创建，可能是input元素，也可能是flash.
						    pick: '#'+this.id+'_importExcel',
						    // 只允许选择图片文件。
						    accept: {
						    	title:'Excel',
						        extensions: 'xls,xlsx',
						        mimeTypes: '.xls,.xlsx'
						    },
						    fileNumLimit: 9999,
						    duplicate:true, 
					        fileSizeLimit: 200 * 1024 * 1024,    // 200 M
					        fileSingleSizeLimit: 50 * 1024 * 1024 ,    // 50 M
					        formData : {
					        	allowSize : 1 * 1024 * 1024,  
					        	allowSuffix : 'xls,xlsx'
					        }
						});	
					    // 数据导入成功
						uploader.on( 'uploadSuccess', function(file,data) {
							$(data).each(function(i,o){
								var row = data[i];
								var idName = self.primaryKeyValue;
								if(!row[idName]){
									row[idName]=Math.getUuid("rowid",25,32);
								}
								var errorMsg = {};
								for(var j=0;j<self.totalInfo.length;j++){
									if(self.totalInfo[j].visible!='true'||self.totalInfo[j].editable!='true'){
										var bindName = self.totalInfo[j].dataBind;
										row[bindName]="";
									}else if(self.totalInfo[j].showtype == 'date'){
										var bindName = self.totalInfo[j].dataBind;
										if(!row[bindName]){//空值不校验
											continue;
										}
										var time = row[bindName];
										if(Number(time)){
											time = new Date(parseInt(time,10));
											if(Date.parse(time)==0){
												row[bindName] ="";
											    errorMsg[bindName] = "部分条目中的“" + self.totalInfo[j].text+"”列，由于“日期格式不正确”而没有导入成功";
												continue;
											}
											var timeStr=Util.dateFormatter(time,self.totalInfo[j].format||"yyyy-MM-dd");
											row[bindName] = timeStr;
										}else{
										    var formatTest;
										    switch(self.totalInfo[j].format){
										      case 'yyyy-MM':
										        formatTest=/^[0-9]{4}-(0[1-9]|(10|11|12))$/;
										        break;
										      case 'yyyy-MM-dd HH:mm':
										        formatTest=/^[0-9]{4}-(((0[13578]|(10|12))-(0[1-9]|[1-2][0-9]|3[0-1]))|(02-(0[1-9]|[1-2][0-9]))|((0[469]|11)-(0[1-9]|[1-2][0-9]|30)))\s+([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
										        break;
										      case 'yyyy-MM-dd':
										      default:
										        formatTest=/^[0-9]{4}-(((0[13578]|(10|12))-(0[1-9]|[1-2][0-9]|3[0-1]))|(02-(0[1-9]|[1-2][0-9]))|((0[469]|11)-(0[1-9]|[1-2][0-9]|30)))$/;
										        break;
										    }
                                            if(!formatTest.test(time)){
                                                row[bindName] = "";
                                                errorMsg[bindName] = "部分条目中的“" + self.totalInfo[j].text+"”列，由于“日期格式不正确”而没有导入成功";
                                            }
										}
									}else if(self.totalInfo[j].showtype == 'autoComplete'){
									    if(!row[bindName]){//空值不校验
                                        	continue;
                                        }
                                        var bindName = self.totalInfo[j].dataBind;
                                        row[bindName] = "";
                                        errorMsg[bindName] = "所有条目中的“" + self.totalInfo[j].text+"”列，由于“不支持导入”而没有导入成功";
									}else if(self.totalInfo[j].showtype == 'select'){
									    var bindName = self.totalInfo[j].dataBind;
									    if(!row[bindName] && !row[bindName+"_VALUE"]){//空值不校验
                                        	continue;
                                        }
                                        var valueStr = "";
                                        var isFailed = false;
                                        if(row[bindName+"_VALUE"]){
                                           valueStr = row[bindName+"_VALUE"];
                                        }else{
                                            $(row[bindName].split(",")).each(function(ii,oo){
                                                            var isFailedThis = true;
                                                            $(self.totalInfo[j].comboboxshowvalue.split(';')).each(function(jj,kk){
                                                                var value = kk.substring(kk.indexOf(':')+1,kk.length);
                                                                if(value==oo){
                                                                    isFailedThis = false;
                                                                    if(valueStr.length==0){
                                                                       valueStr = kk.split(':')[0];
                                                                    }else{
                                                                       valueStr = valueStr + ";" +kk.split(':')[0];
                                                                    }
                                                                }
                                                            })
                                                            if(isFailedThis){
                                                               isFailed = true;
                                                            }
                                            })
                                        }
                                        if(!isFailed){
                                           row[bindName+"_TEXT"] = row[bindName];
                                           row[bindName] = valueStr;
                                        }else{
                                           row[bindName] = "";
                                           errorMsg[bindName] = "部分条目中的“" + self.totalInfo[j].text+"”列，由于“未能找到其选项”而没有导入成功";
                                        }

                                    }else{
                                        var bindName = self.totalInfo[j].dataBind;
                                        if(row[bindName]!=undefined && row[bindName]!=null && row[bindName].indexOf("<script")!=-1 && row[bindName].indexOf("<img")!=-1){
                                            row[bindName] = "";
                                            errorMsg[bindName] = "部分条目中的“" + self.totalInfo[j].text+ "”列，由于“存在Javascript标签”而没有导入成功";
                                        }
                                    }
								}
								var i = 0,errorStr;
								for(var key in errorMsg){
								   if(i==0){
								       errorStr = "1、"+errorMsg[key];
								   }else{
								       errorStr = errorStr+"<br>"+(i+1+"、")+errorMsg[key];
								   }
								   i++;
								}
								if(i>0){
								  var layerObj = parent.layer.confirm(errorStr,{
                                     title: "错误提示",
                                     area:['550px'],
                                     btn: [parent.tp_common_confirm]
                                    }, function(){
                                          parent.layer.close(layerObj);
                                    });
								}
								var callbacksBefore=self.beforeAddDT;
								for( var indexCall in callbacksBefore){//添加前回调事件
									if(callbacksBefore[indexCall](row,self.count)==false){
										return;
									}
								}
								
								area.datatableAdd(row);//增加页面数据
								
								var callbacksAfter=self.afterAddDT;
								for( var indexCall in callbacksAfter){//添加后回调事件
									if(callbacksAfter[indexCall](row,self.count-1)==false){
										return;
									}
								}
							})
						});

						//数据导入失败
						uploader.on( 'uploadError', function( file ) {
							Msg.warning('数据导入失败');
						});
						upload.on("click",function(){
							$("#"+$(this).parents(".responsive-padding-box").prev().attr("id")+"_importExcel").find('input').trigger('click');
						});
				}
				if(isReset){
					var clean = $('<a href="JavaScript:;" class="link_btn swiper-slide swiper-slide-active"><i class="fa fa-refresh"></i>重置数据</a>');
					area.next().find(".swiper-wrapper").append(clean);
					clean.on("click",function(){
						var area = $(this).parents(".responsive-padding-box").prev();
						Msg.confirm("确认是否重置数据？",function(){
				            var self = area.data("FormWidget");
			            	var table_name = area.attr("databindtext");
			            	var FK_ID = dataCenter.getParameter("SYS_FK");
			            	var url = WEBAPP + '/formParser?status=preset';
			        	    var valueArray = "";
			        	    var params={};
			        	    params.formid = dataCenter.getParameter("formid");
			        	    params.procinstid = dataCenter.getParameter("SYS_FK");
			        	    params.workitemid = dataCenter.getParameter("workitemid");
			        	    params.presetbind = area.attr("presetbind");
			        	    var allIds = area.getDataIDsDT();
			        	    
							var callbacksBefore=self.beforeDelDT;
							for( var indexCall in callbacksBefore){//删除前回调事件
								if(callbacksBefore[indexCall](allIds)==false){
									return;
								}
							}

			        	    area.datatableDel(allIds);

			        	    
							var callbacksAfter=self.afterDelDT;
							for( var indexCall in callbacksAfter){//删除后回调事件
								if(callbacksAfter[indexCall](deleteRows)==false){
									return;
								}
							}
							
							if(!self.isPreReadOnly){
				        	    var queryMenuDataSuccess = function(results) {
				        	    	var dataStore = self.dataStore;//获取dataStore
				        	    	$(results).each(function(i,o){
					        	    	o.pk_id = Math.getUuid("pre",25,32);
					        	    	var temp = o;
					        	    	
										var callbacksBefore=self.beforeAddDT;
										for( var indexCall in callbacksBefore){//添加前回调事件
											if(callbacksBefore[indexCall](temp,self.count)==false){
												return;
											}
										}
										
										area.datatableAdd(temp);
										
										var callbacksAfter=self.afterAddDT;
										for( var indexCall in callbacksAfter){//添加后回调事件
											if(callbacksAfter[indexCall](temp,self.count-1)==false){
												return;
											}
										}
										
					        	    })
				        	    };
				        	    $.ajax({
				        	      url : url,
				        	      async: false,
				        	      type : 'post',
				        	      data : params,
				        	      dataType : 'json',
				        	      success : queryMenuDataSuccess
				        	    });
							}
						})
					});
				}
			}
			if(isExport){
				var downData = $('<a href="JavaScript:;" class="link_btn swiper-slide swiper-slide-active"><i class="fa fa-download"></i>导出数据</a>');
				//添加上传按钮
				if(document.body.scrollWidth>767){
					area.next().find(".swiper-wrapper").append(downData);
				}
				downData.on("click",function(){
					var area = $(this).parents(".responsive-padding-box").prev();
				    var self = area.data("FormWidget");
	                var requestURL = WEBAPP + "/formParser?status=formExcel&action=exportGridExcelData";
	                var columns = [];
	                for(var i = 0; i < self.totalInfo.length; i++){
	                    var column = {};
	                    if(self.totalInfo[i].visible!='false'){
	                    	column.name = self.totalInfo[i].dataBind;
	                    	column.label = self.totalInfo[i].text;
	                    	if(self.totalInfo[i].showtype=="date"){
	                    		column.datatype = "date";
	                    	}else if(self.totalInfo[i].showtype=="select"){
	                    		column.datatype = "string";
	                    		column.fieldtype = "combobox";
	                    		if(self.totalInfo[i].presettype=="codeList"){
	                    		   column.fieldvalue ="";
	                    		}else{
	                    		   column.fieldvalue = self.totalInfo[i].comboboxshowvalue;
	                    		}
	                    	}else{
	                    		column.datatype = "string";
	                    	}
	                    	if(self.totalInfo[i].showtype!="uploadFiles"){
	                    	    columns.push(column);
	                    	}
	                    }
	                }
	                var titleStr = self.table.attr("name").replace(' ','');
	                var xhr = new XMLHttpRequest();
	                xhr.open('POST',requestURL,true);
	                xhr.responseType = "blob";
	                xhr.onload = function(){
	              	  if(this.status == 200) {
	              		  var blob = this.response;
	              		  var url = URL.createObjectURL(blob);
	              		  if(url.indexOf("http")==-1){
	              		  window.navigator.msSaveOrOpenBlob(blob,titleStr+".xls");
	              		  }else{
	              		  var alink = $("<a id = 'alink' href = '"+url+"' download  = '"+titleStr+".xls'><p></p></a>")
	              		  $('body').append(alink);
	              		  $("#alink").children().click();
	              		  $("#alink").remove();
	              		  }
	              	  }
	                }
					var datas = [];
					var num = 0;
					area.next().find("[name='datatable-check']").each(function(i,o){
						if($(o).is(":checked")){
						    var index = $(o).parent().parent().parent().parent().children().index($(o).parent().parent().parent())-1;
						    var rowThis = self.dataStore.rowSet.primary[index];
                            var row = {};
                            for(var key in rowThis){
                                $(self.totalInfo).each(function(m,n){
                                   if(key==n.dataBind){
                                      switch(n.showtype){
                                         case 'select':
                                            if(n.presettype=="codeList"){
                                                row[key] = rowThis[key]+"::"+rowThis[key+"_TEXT"];
                                            }else{
                                                row[key] = rowThis[key+"_TEXT"];
                                            }
                                            break;
                                         case 'uploadFiles':
                                            break;
                                         case 'date':
                                            row[key] = DataTableUtil.dateToStr(rowThis[key],n.format);
                                         default:
                                            row[key] = rowThis[key];
                                            break;
                                      }
                                   }
                                })
                            }
                            datas[num] = row;
                            num++;
//							var row = {};
//							$(o).parents("tr:eq(0)").find("span").each(function(j,k){
//								if($(k).attr("key")){
//									row[$(k).attr("key")]=$(k).text();
//								}
//							})
//							datas[num] = row;
//							num++;
						}
					})
					if(datas.length==0){
						if(area.attr("isCheck")!="false"){
							Msg.warning("请选择要导出的数据！");
						    return;
						}else{
//							area.next().find("tbody tr:not([name='empty_tr'])").each(function(i,o){
//									var row = {};
//									$(o).find("span").each(function(j,k){
//										if($(k).attr("key")){
//											row[$(k).attr("key")]=$(k).text();
//										}
//									})
//									datas[num] = row;
//									num++;
//							})
							$(self.dataStore.rowSet.primary).each(function(i,o){
							        var row = {};
							        for(var key in o){
                                        $(self.totalInfo).each(function(m,n){
                                           if(key==n.dataBind){
                                              switch(n.showtype){
                                                 case 'select':
                                                    if(n.presettype=="codeList"){
                                                        row[key] = o[key]+"::"+o[key+"_TEXT"];
                                                    }else{
                                                        row[key] = o[key+"_TEXT"];
                                                    }
                                                    break;
                                                 case 'uploadFiles':
                                                    break;
                                                 case 'date':
                                                    row[key] = DataTableUtil.dateToStr(o[key],n.format);
                                                 default:
                                                    row[key] = o[key];
                                                    break;
                                              }
                                           }
                                        })
							        }
                                    datas[num] = row;
                                    num++;
							})
						}
					}
					if(datas.length==0){
						Msg.warning("表格中无数据！");
						return;
					}
	               var  data = {"columns":JSON.stringify(columns),"title":titleStr,"gridData":JSON.stringify(datas)};
	                xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
	                var data1 = JSON.stringify(columns);
	                var data2 = titleStr;
	                var data3 = JSON.stringify(datas);
	                data1=data1.replace(/\%/g,"%25"); 
	                data1=data1.replace(/\#/g,"%23"); 
	                data1=data1.replace(/\&/g,"%26"); 
	                data1=data1.replace(/\+/g,"%2B"); 
	                data2=data2.replace(/\%/g,"%25"); 
	                data2=data2.replace(/\#/g,"%23"); 
	                data2=data2.replace(/\&/g,"%26");
	                data2=data2.replace(/\+/g,"%2B");
	                data3=data3.replace(/\%/g,"%25"); 
	                data3=data3.replace(/\#/g,"%23"); 
	                data3=data3.replace(/\&/g,"%26"); 
	                data3=data3.replace(/\+/g,"%2B");
	                xhr.send("columns="+data1+"&title="+data2+"&gridData="+data3);
				});
			}
			
//				jqnav.navSeparatorAdd('#'+this.pageId,{
//		        	sepclass : "ui-separator",
//		        	sepcontent: ''
//		        }).navButtonAdd('#'+this.pageId, {  
//		            caption: "",
//		            buttonicon:"svg-download",
//		            title:"下载模板",
//		            onClickButton: function () {
//		            	var requestURL = WEBAPP + "/formParser?status=formExcel&action=exportGridExcelTemplate";
//		                var columns = [];
//		                for(var i = 0; i < self.totalInfo.length; i++){
//		                	var column = {};
//		                	if(self.totalInfo[i].visible!='false'){
//		                		column.name = self.totalInfo[i].dataBind;
//		                		column.label = self.totalInfo[i].text;
//		                		if(self.totalInfo[i].showtype=="date"){
//		                			column.datatype = "date";
//		                		}else if(self.totalInfo[i].showtype=="select"){
//		                			column.datatype = "string";
//		                			column.fieldtype = "combobox";
//		                			column.fieldvalue = self.totalInfo[i].comboboxshowvalue;
//		                		}else{
//		                			column.datatype = "string";
//		                		}
//		                		columns.push(column);
//		                	}
//		        		}
//		                var titleStr = self.table.attr("name").replace(' ','');
//		                var xhr = new XMLHttpRequest();
//		                  xhr.open('POST',requestURL,true);
//		                  xhr.responseType = "blob";
//		                  xhr.onload = function(){
//		                	  if(this.status == 200) {
//		                		  var blob = this.response;
//		                		  var url = URL.createObjectURL(blob);
//		                		  if(url.indexOf("http")==-1){
//		                		  window.navigator.msSaveOrOpenBlob(blob,titleStr+".xls");
//		                		  }else{
//		                		  var alink = $("<a id = 'alink' href = '"+url+"' download  = '"+titleStr+".xls'><p></p></a>")
//		                		  $('body').append(alink);
//		                		  $("#alink").children().click();
//		                		  $("#alink").remove();
//		                		  }
//		                	  }
//		                  }
//		                 var  data = {"columns":JSON.stringify(columns),"title":titleStr,"gridData":JSON.stringify(self.dataStore.rowSet.primary)};
//		                  xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
//		                  var data1 = JSON.stringify(columns);
//		                  var data2 = titleStr;
//		                  data1=data1.replace(/\%/g,"%25"); 
//		                  data1=data1.replace(/\#/g,"%23"); 
//		                  data1=data1.replace(/\&/g,"%26"); 
//		                  data2=data2.replace(/\%/g,"%25"); 
//		                  data2=data2.replace(/\#/g,"%23"); 
//		                  data2=data2.replace(/\&/g,"%26"); 
//		                  xhr.send("columns="+data1+"&title="+data2);
//		            },
//		            position: "last"  
//		        }).navSeparatorAdd('#'+this.pageId,{
//		        	sepclass : "ui-separator",
//		        	sepcontent: ''
//		        }).navButtonAdd('#'+this.pageId, {  
//		            caption: "",
//		            buttonicon:"svg-upload",
//		            title:"导入EXCEL",
//		            onClickButton: function () {
//		            	$("#"+this.id+"_importExcel").find('input').trigger('click');
//		            },
//		            position: "last"  
//		        })
//			}
//			if((this.canAddRow == 'true' ||this.canDeleteRow == 'true')&&this.canEdit){
//				jqnav.navSeparatorAdd('#'+this.pageId,{
//		        	sepclass : "ui-separator",
//		        	sepcontent: ''
//		        }).navButtonAdd('#'+this.pageId, {  
//		            caption: "",
//		            buttonicon:"svg-eraser",
//		            title:"清除表格暂存并刷新",
//		            onClickButton: function () {
//		            	var table_name = $(this).attr("databindtext");
//		            	var FK_ID = dataCenter.getParameter("SYS_FK");
//		            	var url = WEBAPP + '/formParser?status=preset';
//		        	    var valueArray = "";
//		        	    var params={};
//		        	    params.formid = dataCenter.getParameter("formid");
//		        	    params.procinstid = dataCenter.getParameter("SYS_FK");
//		        	    params.workitemid = dataCenter.getParameter("workitemid");
//		        	    params.presetbind = $(this).attr("presetbind");
//		        	    var allIds = area.getDataIDs();
//		        	    for(i=0;i<self.count;i++){
//		        	    self.dataStore.getRowSet().deleteRow(0);
//		        	    }
//		        	    $(this).jqGrid("clearGridData");
//		        	    self.count = 0;
//		        	    var callbacks=self.afterDelete;
//						for( var index in callbacks){
//							callbacks[index](allIds);
//						}
//		        	    var queryMenuDataSuccess = function(results) {
//		        	    	var dataStore = self.dataStore;//获取dataStore
//		        	    	$(results).each(function(i,o){
//			        	    	o.pk_id = Math.getUuid("rowid",25,32);
//			        	    	var temp = o;
//			        	    	self.table.setGridParam().addRowData(self.count,temp,'first');
//								self.dataStore.getRowSet().addRow(temp,false,false);
//								var callbacks=self.afterAdd;
//								for( var index in callbacks){
//									if(callbacks[index](temp,self.count)==false){
//										return;
//									}
//								}
//								self.count++;
//			        	    })
//			        	    self.table.trigger("reloadGrid");
//		        	    };
//		        	    $.ajax({
//		        	      url : url,
//		        	      async: false,
//		        	      type : 'post',
//		        	      data : params,
//		        	      dataType : 'json',
//		        	      success : queryMenuDataSuccess
//		        	    });
//		            },
//		            position: "last"  
//		        });
//			}
//			jqnav.navSeparatorAdd('#'+this.pageId,{
//	            sepclass : "ui-separator",
//	            sepcontent: ''
//	          }).navButtonAdd('#'+this.pageId, {  
//	              caption: "",
//	              buttonicon:"svg-download",
//	              title:"下载表格数据",
//	              onClickButton: function () {
//	                  var requestURL = WEBAPP + "/formParser?status=formExcel&action=exportGridExcelData";
//	                  var columns = [];
//	                  for(var i = 0; i < self.totalInfo.length; i++){
//	                      var column = {};
//	                      if(self.totalInfo[i].visible!='false'){
//	                      	column.name = self.totalInfo[i].dataBind;
//	                      	column.label = self.totalInfo[i].text;
//	                      	if(self.totalInfo[i].showtype=="date"){
//	                      		column.datatype = "date";
//	                      	}else if(self.totalInfo[i].showtype=="select"){
//	                      		column.datatype = "string";
//	                      		column.fieldtype = "combobox";
//	                      		column.fieldvalue = self.totalInfo[i].comboboxshowvalue;
//	                      	}else{
//	                      		column.datatype = "string";
//	                      	}
//	                      	columns.push(column);
//	                      }
//	                  }
//	                  var titleStr = self.table.attr("name").replace(' ','');
//	                  var xhr = new XMLHttpRequest();
//	                  xhr.open('POST',requestURL,true);
//	                  xhr.responseType = "blob";
//	                  xhr.onload = function(){
//	                	  if(this.status == 200) {
//	                		  var blob = this.response;
//	                		  var url = URL.createObjectURL(blob);
//	                		  if(url.indexOf("http")==-1){
//	                		  window.navigator.msSaveOrOpenBlob(blob,titleStr+".xls");
//	                		  }else{
//	                		  var alink = $("<a id = 'alink' href = '"+url+"' download  = '"+titleStr+".xls'><p></p></a>")
//	                		  $('body').append(alink);
//	                		  $("#alink").children().click();
//	                		  $("#alink").remove();
//	                		  }
//	                	  }
//	                  }
//	                 var  data = {"columns":JSON.stringify(columns),"title":titleStr,"gridData":JSON.stringify(self.dataStore.rowSet.primary)};
//	                  xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
//	                  var data1 = JSON.stringify(columns);
//	                  var data2 = titleStr;
//	                  var data3 = JSON.stringify(self.dataStore.rowSet.primary);
//	                  data1=data1.replace(/\%/g,"%25"); 
//	                  data1=data1.replace(/\#/g,"%23"); 
//	                  data1=data1.replace(/\&/g,"%26"); 
//	                  data2=data2.replace(/\%/g,"%25"); 
//	                  data2=data2.replace(/\#/g,"%23"); 
//	                  data2=data2.replace(/\&/g,"%26"); 
//	                  data3=data3.replace(/\%/g,"%25"); 
//	                  data3=data3.replace(/\#/g,"%23"); 
//	                  data3=data3.replace(/\&/g,"%26"); 
//	                  xhr.send("columns="+data1+"&title="+data2+"&gridData="+data3);
//	              },
//	              position: "last"  
//	          });
			
		}else{
			area.jqGrid({
				datatype: "local",
				height: height,
				width: self.width,
				shrinkToFit:IsShrinkToFit,
			    colNames: colNames,
				colModel: colModel,
			   	multiselect: true,
				cellEdit: this.canEdit,
			   	pager: '#' + self.pageId,
				cellsubmit:'clientArray',
			   	gridview: true,
			   	caption: null,
			   	sortable:false,
//			   	sortname: self.sortname, 
//			   	sortorder: 'asc',
			   	rowNum:this.rowNumber,
			    viewrecords: true,
			    localReader:{
			    	id:'rowid'
			    },
			    onCellSelect:function(rowid,iCol,cellcontent,e){
			    	//浏览器兼容（火狐）
			    	self.currentCell=e.srcElement ? e.srcElement : e.target;
			    },
			    
			    afterEditCell: function(id,name,val,iRow,iCol) {
			    //新增
			    	function setValue(colMap,target){
						var length=colMap.length;
						for(var j=0;j<length;j++){
							var formula=colMap[j].formula;
							var gridName=colMap[j].gridName;
							var iRow=colMap[j].iRow;
							var id=colMap[j].id
							var result=colMap[j].result;
							var currentColName="";
							if(target!=null)
								currentColName=$(target).attr("name");
							if(target!=null&&currentColName==result)
								continue;
							var currColName=colMap[j].currColName;
							var cols=formula.split("(")[1].split(")")[0].split(",");
			    			var method=formula.split("(")[0];
			    			var finalValue="";
			    			var colValue="";
							var InterResult="";
							var returnFlag=true;
							for(var p=0;p<cols.length;p++){
							    var obj=$('tr#'+id,$("#"+gridName));
							    if(Number(cols[p]))
							    	{
							    	columnVal=cols[p];
							    	}
							    else{
							    	if(cols[p]==currColName){
										columnVal=$("#"+iRow+"_"+cols[p],obj).val();
										if(!columnVal){
											var td=gridName+"_"+cols[p];
											columnVal=$('[aria-describedby="'+td+'"]',obj).text();
										}
									}else
									{
										var tdInfo=gridName+"_"+cols[p];
										columnVal=$('[aria-describedby="'+tdInfo+'"]',obj).text();
									}
							    }
								
								if(columnVal.length==0) continue;
								var interFlag=/^(-?\d+)(\.\d+)?$/.test(columnVal);
								if(!interFlag){
									returnFlag=false;
									break;
								}
							}
							for(var l=0;l<cols.length;l++){
								var colObj=$('tr#'+id,$("#"+gridName));
								if(Number(cols[l]))
									{
									colValue=cols[l];
									}else
									{
										if(cols[l]==currColName){
											colValue=$("#"+iRow+"_"+cols[l],colObj).val();
											if(!colValue){
												var col=gridName+"_"+cols[l];
												colValue=$('[aria-describedby="'+col+'"]',colObj).text();
											}
										}else
										{
											var ColInfo=gridName+"_"+cols[l];
											colValue=$('[aria-describedby="'+ColInfo+'"]',colObj).text();
										}
									}
								
								if(colValue.length==0) continue;
								if(method=="add"){
									if(l==0&&returnFlag){
										InterResult=math.add(0,colValue);
									}else if(l==0&&!returnFlag){
										InterResult=""+colValue;
									}else if(l!=0&&returnFlag){
										InterResult=math.add(InterResult,colValue);
									}else{
										InterResult+=colValue;
									}
								}
								if(method=="multiply"){
									if(l==0&&returnFlag){
										InterResult = colValue;
									}else if(l!=0&&returnFlag){
										InterResult = InterResult*colValue;
									}
								}
							}
							if(returnFlag&&InterResult.toString().indexOf(".")>-1)
								InterResult=InterResult.toFixed(2);
							finaResult=InterResult;
							var colResult=gridName+"_"+result;
							$('[aria-describedby="'+colResult+'"]',obj).text(finaResult).attr("title",finaResult).click();
							var backColName=gridName+"_"+currColName;
							$('[aria-describedby="'+backColName+'"]',obj).click();
						}
					}
			    	var e = jQuery.Event("keydown");
			            e.keyCode = $.ui.keyCode.ENTER;
			            var edit = $(".edit-cell > span > *",this);
			            var relatedColMap=[];
			            var showtype = self.showtypes[name];
				    	if(showtype == 'date') {
				    		edit.datepicker({
								dateFormat:"yy-mm-dd",
								onClose: function() {
									edit.trigger(e);
								}
							});
				    		edit.datepicker('option', $.datepicker.regional['zh-CN']);
				    		edit.unbind('keydown', $.datepicker._doKeyDown).unbind('keypress', $.datepicker._doKeyPress).unbind('keyup', $.datepicker._doKeyUp);
						}else if(showtype == 'select') {
							var select = $("#"+iRow+"_"+name);
							var parent = select.parent();
							var editcell = $(".edit-cell",this);
							select.width(parent.width()-20);
							select.change(function(){
								edit.trigger(e);
							})
							$(document).bind("click",function(f){
								var target = $(f.target);
								if(target.closest(editcell).length == 0&&!target.hasClass("select2-search__field")){
									edit.trigger(e);
								}
							})
							
						}else{
							edit.blur(function() {
							                edit.trigger(e);
							            });
//							//新增
//							for(var i=0;i<self.totalInfo.length;i++){
//								var colMap={};
//								if(self.totalInfo[i].defaultvalue.indexOf("(")>-1&&self.totalInfo[i].defaultvalue.indexOf(")")>-1)
//								{
//									 var  gridName=self.table.attr("name");
//									 colMap.gridName=gridName;
//									 colMap.result=self.totalInfo[i].dataBind;
//									 colMap.formula=self.totalInfo[i].defaultvalue;
//									 colMap.iRow=iRow;
//									 colMap.id=id;
//									 colMap.currColName=name;
//									 relatedColMap.push(colMap);
//								}
//							}
//							if(relatedColMap.length!=0){
//								 $("#"+iRow+"_"+name,self.table).bind('input propertychange', function() {  
//									 setValue(relatedColMap,this);
//				    			 });
//							}
						}
		        },
		        beforeEditCell : function(rowid, cellname, value, iRow, iCol) {
					if (cellname == self.primaryKeyValue) {// 如果修改的是主键
						setTimeout(function() {
							alert('主键信息不可以被修改');
							area.jqGrid('restoreCell', iRow, iCol);
						}, 1);
					}
					
					var rowData = area.getRowData(rowid);
					if(self.isReadOnly==true&&rowData[self.primaryKeyValue].substring(0,3)=="pre"){
						for(i=0;i<self.preCol.length;i++){
							if(cellname==self.preCol[i]){
								setTimeout(function() {
									area.jqGrid('restoreCell', iRow, iCol);
								}, 1);
								//grid 表格无法编辑无需弹框
							//	alert('该单元格不可编辑！');
							}
						}
					}
					var callbacks=self.beforeEdit;
		        	for( var index in callbacks){
						return callbacks[index](rowid, cellname, value, iRow, iCol,self);
					}
					
				},
				beforeSaveCell: function(rowid, cellname, value, iRow, iCol) {
					var val=area.getCell(iRow, iCol);
					var callbacks=self.beforeSave;
		        	for( var index in callbacks){
						return callbacks[index](rowid, cellname, value, iRow, iCol,self);
					}
				},

		        afterSaveCell: function(rowid, cellname, value, iRow, iCol) {
		        	var callbacks=self.afterSave;
					for( var index in callbacks){
						if(callbacks[index](rowid, cellname, value, iRow, iCol, self)==false){
							return;
						}
					}
					
		        	var rowData = area.getRowData(rowid);
		        	var idName = self.primaryKeyValue;
		        	var idNameList = idName.split('+');
		        	var editRowId = '';
		        	for(var i = 0; i < idNameList.length; i++){
		        		var name = idNameList[i];
		        		if(rowData[name]){
		        			editRowId += rowData[name] + '+';
		        		}
		        	}
		        	if(editRowId.length>0){
		        		editRowId=editRowId.substring(0,editRowId.length-1);
		        	}
		        	var editRowIdList=[];
		        	if(editRowId.length>0){
		        		editRowIdList = editRowId.split('+');
		        	}else{
		        		editRowIdList.push(rowid);
		        	}
		        	
//		        	editRowIdList.splice(editRowIdList.length-1, 1);//去掉最后一个加号

					
					
		        	var editRowNum = getRowById(idNameList,editRowIdList);//取得是哪个要改，反回行号      	
		        	var rowSet = self.dataStore.getRowSet();
		        	var oldData = rowSet.getRowData(editRowNum,"primary");
		        	var newRowData=$.extend({},oldData,rowData);
		        	var newRow = new unieap.ds.Row(null,newRowData,0);
		        	rowSet.updateRow(editRowNum,newRow);
		        	for(var i=0;i<self.primaryKeys.length;i++){
		        		if(self.primaryKeys[i]==newRowData[self.primaryKeyValue]){//只有对原有查询出来的行修改才是修改，对于添加后再修改的行仍然是新增
		        			rowSet.getRow(editRowNum).setRowStatus(3);
		        			break;
		        		}
		        	}


		        },
		        //grid加减行
			    dataProxy:function(row,dd){
					var selectRow ;
					if(row.data.oper == 'add'){
						selectRow = area.jqGrid('getGridParam','selrow'); 
						var callbacks=self.afterAdd;
						for( var index in callbacks){
							if(callbacks[index](row.data)==false){
								return;
							}
						}
						var idName = self.primaryKeyValue;
						if(!row.data[idName])
							row.data[idName]=Math.getUuid("rowid",25,32);
						if(!selectRow){
							area.setGridParam().addRowData(self.count,row.data,'first');
							self.dataStore.getRowSet().addRow(row.data,false,false);
						}else{
							selectRow = parseInt(selectRow,10);
							area.setGridParam().addRowData(self.count,row.data,'after',selectRow);
							self.dataStore.getRowSet().addRow(row.data,false,false);
						}
						var callbacks=self.afterAdd;
						for( var index in callbacks){
							if(callbacks[index](row.data,self.count)==false){
								return;
							}
						}
						self.count ++;
						area.trigger("reloadGrid");
					}else if(row.data.oper == 'del'){
						selectRow=area.jqGrid('getGridParam','selarrrow');
						var idName = self.primaryKeyValue;
			        	var idNameList = idName.split('+');		        	
			        	for(var j=0;j<selectRow.length;j++){
			        		var deleteRowId = '';
			        		var selectRowNum = parseInt(selectRow[j],10);
			        		for(var i = 0; i < idNameList.length; i++){
				        		var name = idNameList[i];
				        		deleteRowId += area.getRowData(selectRowNum)[name] + '+';
				        	}
				        	var deleteRowIdList = deleteRowId.split('+');
				        	deleteRowIdList.splice(deleteRowIdList.length-1, 1);//去掉最后一个加号
				        	var deleteRow = getRowById(idNameList,deleteRowIdList);//取得是哪个要改，反回行号      	
							self.dataStore.getRowSet().deleteRow (deleteRow);//设dataStore
							area.jqGrid('delRowData',selectRowNum,{reloadAfterSubmit:false});
			        	}
						area.trigger("reloadGrid");
						var callbacks=self.afterDelete;
						for( var index in callbacks){
							callbacks[index](selectRow);
						}

					}
		    	}
		});
		function getRowById(idNameList,editRowIdList){
			var rows = self.dataStore.getRowSet().getData(3);//取得primary所有数据
			for(var i = 0; i < rows.length; i++){
				var result = true;
				for(var j =0; j < idNameList.length; j++){
					var idName = idNameList[j];
					var editRowId = editRowIdList[j];
					if(rows[i][idName] != editRowId){
						result = false;
						break;
					}
				}
				if(result)
					return i;
			}
		}
		var barSet = {edit:false,add:false,del:false,addfunc:addRow,search:true};
		if(!this.isReadOnly&&this.canEdit)
			barSet.add = true;
		if(!this.isReadOnly&&this.canEdit)
			barSet.del = true;
		var jqnav = area.jqGrid('navGrid','#'+this.pageId,barSet,{closeAfterEdit:true},{closeAfterAdd:true},{closeAfterDel:true},{closeAfterSearch:true,multipleSearch: true,});
		if(!this.isReadOnly&&this.canEdit){
			jqnav.navSeparatorAdd('#'+this.pageId,{
	        	sepclass : "ui-separator",
	        	sepcontent: ''
	        }).navButtonAdd('#'+this.pageId, {  
	            caption: "",
	            buttonicon:"svg-download",
	            title:"下载模板",
	            onClickButton: function () {
	            	var requestURL = WEBAPP + "/formParser?status=formExcel&action=exportGridExcelTemplate";
	                var columns = [];
	                for(var i = 0; i < self.totalInfo.length; i++){
	                	var column = {};
	                	if(self.totalInfo[i].visible!='false'){
	                		column.name = self.totalInfo[i].dataBind;
	                		column.label = self.totalInfo[i].text;
	                		if(self.totalInfo[i].showtype=="date"){
	                			column.datatype = "date";
	                		}else if(self.totalInfo[i].showtype=="select"){
	                			column.datatype = "string";
	                			column.fieldtype = "combobox";
	                			column.fieldvalue = self.totalInfo[i].comboboxshowvalue;
	                		}else{
	                			column.datatype = "string";
	                		}
	                		columns.push(column);
	                	}
	        		}
	                var titleStr = self.table.attr("name").replace(' ','');
	                var xhr = new XMLHttpRequest();
	                  xhr.open('POST',requestURL,true);
	                  xhr.responseType = "blob";
	                  xhr.onload = function(){
	                	  if(this.status == 200) {
	                		  var blob = this.response;
	                		  var url = URL.createObjectURL(blob);
	                		  if(url.indexOf("http")==-1){
	                		  window.navigator.msSaveOrOpenBlob(blob,titleStr+".xls");
	                		  }else{
	                		  var alink = $("<a id = 'alink' href = '"+url+"' download  = '"+titleStr+".xls'><p></p></a>")
	                		  $('body').append(alink);
	                		  $("#alink").children().click();
	                		  $("#alink").remove();
	                		  }
	                	  }
	                  }
	                 var  data = {"columns":JSON.stringify(columns),"title":titleStr,"gridData":JSON.stringify(self.dataStore.rowSet.primary)};
	                  xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
	                  var data1 = JSON.stringify(columns);
	                  var data2 = titleStr;
	                  data1=data1.replace(/\%/g,"%25"); 
	                  data1=data1.replace(/\#/g,"%23"); 
	                  data1=data1.replace(/\&/g,"%26"); 
	                  data1=data1.replace(/\+/g,"%2B"); 
	                  data2=data2.replace(/\%/g,"%25"); 
	                  data2=data2.replace(/\#/g,"%23"); 
	                  data2=data2.replace(/\&/g,"%26"); 
	                  data2=data2.replace(/\+/g,"%2B");
	                  xhr.send("columns="+data1+"&title="+data2);
	            },
	            position: "last"  
	        }).navSeparatorAdd('#'+this.pageId,{
	        	sepclass : "ui-separator",
	        	sepcontent: ''
	        }).navButtonAdd('#'+this.pageId, {  
	            caption: "",
	            buttonicon:"svg-upload",
	            title:"导入EXCEL",
	            onClickButton: function () {
	            	$("#"+this.id+"_importExcel").find('input').trigger('click');
	            },
	            position: "last"  
	        })
		}
		if(!this.isReadOnly&&this.canEdit){
			jqnav.navSeparatorAdd('#'+this.pageId,{
	        	sepclass : "ui-separator",
	        	sepcontent: ''
	        }).navButtonAdd('#'+this.pageId, {  
	            caption: "",
	            buttonicon:"svg-eraser",
	            title:"清除表格暂存并刷新",
	            onClickButton: function () {
	            	var table_name = $(this).attr("databindtext");
	            	var FK_ID = dataCenter.getParameter("SYS_FK");
	            	var url = WEBAPP + '/formParser?status=preset';
	        	    var valueArray = "";
	        	    var params={};
	        	    params.formid = dataCenter.getParameter("formid");
	        	    params.procinstid = dataCenter.getParameter("SYS_FK");
	        	    params.workitemid = dataCenter.getParameter("workitemid");
	        	    params.presetbind = $(this).attr("presetbind");
	        	    var allIds = area.getDataIDs();
	        	    for(i=0;i<self.count;i++){
	        	    self.dataStore.getRowSet().deleteRow(0);
	        	    }
	        	    $(this).jqGrid("clearGridData");
	        	    self.count = 0;
	        	    var callbacks=self.afterDelete;
					for( var index in callbacks){
						callbacks[index](allIds);
					}
	        	    var queryMenuDataSuccess = function(results) {
	        	    	var dataStore = self.dataStore;//获取dataStore
	        	    	$(results).each(function(i,o){
		        	    	o.pk_id = Math.getUuid("rowid",25,32);
		        	    	var temp = o;
		        	    	self.table.setGridParam().addRowData(self.count,temp,'first');
							self.dataStore.getRowSet().addRow(temp,false,false);
							var callbacks=self.afterAdd;
							for( var index in callbacks){
								if(callbacks[index](temp,self.count)==false){
									return;
								}
							}
							self.count++;
		        	    })
		        	    self.table.trigger("reloadGrid");
	        	    };
	        	    $.ajax({
	        	      url : url,
	        	      async: false,
	        	      type : 'post',
	        	      data : params,
	        	      dataType : 'json',
	        	      success : queryMenuDataSuccess
	        	    });
	            },
	            position: "last"  
	        });
		}
		jqnav.navSeparatorAdd('#'+this.pageId,{
            sepclass : "ui-separator",
            sepcontent: ''
          }).navButtonAdd('#'+this.pageId, {  
              caption: "",
              buttonicon:"svg-download",
              title:"下载表格数据",
              onClickButton: function () {
                  var requestURL = WEBAPP + "/formParser?status=formExcel&action=exportGridExcelData";
                  var columns = [];
                  for(var i = 0; i < self.totalInfo.length; i++){
                      var column = {};
                      if(self.totalInfo[i].visible!='false'){
                      	column.name = self.totalInfo[i].dataBind;
                      	column.label = self.totalInfo[i].text;
                      	if(self.totalInfo[i].showtype=="date"){
                      		column.datatype = "date";
                      	}else if(self.totalInfo[i].showtype=="select"){
                      		column.datatype = "string";
                      		column.fieldtype = "combobox";
                      		column.fieldvalue = self.totalInfo[i].comboboxshowvalue;
                      	}else{
                      		column.datatype = "string";
                      	}
                      	columns.push(column);
                      }
                  }
                  var titleStr = self.table.attr("name").replace(' ','');
                  var xhr = new XMLHttpRequest();
                  xhr.open('POST',requestURL,true);
                  xhr.responseType = "blob";
                  xhr.onload = function(){
                	  if(this.status == 200) {
                		  var blob = this.response;
                		  var url = URL.createObjectURL(blob);
                		  if(url.indexOf("http")==-1){
                		  window.navigator.msSaveOrOpenBlob(blob,titleStr+".xls");
                		  }else{
                		  var alink = $("<a id = 'alink' href = '"+url+"' download  = '"+titleStr+".xls'><p></p></a>")
                		  $('body').append(alink);
                		  $("#alink").children().click();
                		  $("#alink").remove();
                		  }
                	  }
                  }
                 var  data = {"columns":JSON.stringify(columns),"title":titleStr,"gridData":JSON.stringify(self.dataStore.rowSet.primary)};
                  xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
                  var data1 = JSON.stringify(columns);
                  var data2 = titleStr;
                  var data3 = JSON.stringify(self.dataStore.rowSet.primary);
                  data1=data1.replace(/\%/g,"%25"); 
                  data1=data1.replace(/\#/g,"%23"); 
                  data1=data1.replace(/\&/g,"%26"); 
                  data1=data1.replace(/\+/g,"%2B"); 
                  data2=data2.replace(/\%/g,"%25"); 
                  data2=data2.replace(/\#/g,"%23"); 
                  data2=data2.replace(/\&/g,"%26"); 
                  data2=data2.replace(/\+/g,"%2B"); 
                  data3=data3.replace(/\%/g,"%25"); 
                  data3=data3.replace(/\#/g,"%23"); 
                  data3=data3.replace(/\&/g,"%26"); 
                  data3=data3.replace(/\+/g,"%2B"); 
                  xhr.send("columns="+data1+"&title="+data2+"&gridData="+data3);
              },
              position: "last"  
          });
		function style_edit_form(form){
			form.find('select').css('width','162px').select2({language: 'zh-CN'});
		};
		this.setVisible();
		//自定义添加行
		function addRow(){
			var editFlag = false;
			var row = {};
			for(var i = 0; i < self.totalInfo.length; i++){
				    row[self.totalInfo[i].dataBind] ="";
		    		if(self.totalInfo[i].editable == 'true'){
		    			editFlag = true;
		    		}
	    		}
			if(editFlag){
				var idName = self.primaryKeyValue;
				row[idName]=Math.getUuid("rowid",25,32);
				self.table.setGridParam().addRowData(self.count,row,'first');
				self.dataStore.getRowSet().addRow(row,false,false);
				self.count++;
				self.table.trigger("reloadGrid");
				return true;
			}else{
				alert('当前列表所有列都不可编辑，无法添加新行。');
				return false;
			}
			
		}
	 }
	},
	selectTwo:function (cellvalue, options, cell){
		setTimeout(function(){
			$(cell) .find('select')
			.select2({language: 'zh-CN'}).on("select2:select", function(e) { 
				var e = jQuery.Event("keydown");
	            e.keyCode = $.ui.keyCode.ENTER;
	            var edit = $(".edit-cell > *");
	            edit.trigger(e);
			});
		}, 0);
	},
	restoreCell:function(iRow,iCol){
		var gr=this.table;
		setTimeout(function() {
			gr.jqGrid('restoreCell', iRow, iCol);
		}, 1);
	},
	tooltips:function(text){
		$.pt({
	        target: this.currentCell,
	        content: text,
	        autoClose:false,
	        width:'auto',
	        position:'b',
	        align:'l'
	    });
	},
	closeTips:function(){
		$.pt({
	        target: this.currentCell,
	    }).hide();
	},
	setVisible:function(){
		var area = this.table;
		for (var i = 0 ;i < this.notVisibleInfo.length; i++){
			area.setGridParam().hideCol(this.notVisibleInfo[i].dataBind);
		}
		area.setGridWidth(this.width+10);
	},
	//好像没有啥用 by刘淼
//	getEditAuth:function(){
//		var _this=this;
//		var baseUrl=this.table.context.baseURI;
//		var arrs;
//		if(baseUrl == null){
//			baseUrl = location.href;
//		}
//		arrs=baseUrl.split('&');
//		var service_id="";
//		for(var i=0;i<arrs.length;i++){
//			var param=arrs[i].split('=');
//			if(param[0]=="service_id"){
//				service_id=param[1];
//				break;
//			}
//		}
//		var url=WEBAPP +"/fp/editorprem/getPrem";
//		$.ajax({  
//		    type: "POST",  
//		    url: url,  
//		    async : false,
//		    data: JSON.stringify({service_id:service_id}),
//		    dataType : "json",  
//		    contentType : 'application/json;charset=utf-8',
//		    success: function(result){ 
//		    	if(result=="3"){
//		    		_this.isReadOnly=false;
//		    	}
//		    },  
//		    error: function(err){
//		    	
//		    }  
//		});
//	},
	getSelectOption:function(presetInfos,isAz){
		var url = "";
        var params={};
        params.formid = dataCenter.getParameter("formid");
        params.procinstid = dataCenter.getParameter("SYS_FK");
        params.workitemid = dataCenter.getParameter("workitemid");
		if(presetInfos.presettype==="codeList"){
		   url =WEBAPP + '/formParser?status=codeList';
		   params.codelist_type = presetInfos.presetbind;
		}else{
		   url =WEBAPP + '/formParser?status=preset';
		   params.presetbind = presetInfos.presetbind;
		}
		var isAzFinal = false;
		if(Util.getClientInfo()!="PC"&&isAz){
		   url = url+'&az=true';
		   isAzFinal = true;
		}
	    var valueArray = "";
	    var queryMenuDataSuccess = function(results) {
	      if (results&&results.length>0) {
	    	  for(var i = 0 ;i < results.length; i++){
	    		  valueArray+=results[i].VALUE+":"+results[i].NAME+(isAzFinal?(":"+results[i].FINAL_INITIAL_LETTER):"")+";"
	    	  }
	        valueArray = valueArray.substring(0,valueArray.length-1);
	      }
	    };
	    $.ajax({
	      url : url,
	      async: false,
	      type : 'post',
	      data : params,
	      dataType : 'json',
	      success : queryMenuDataSuccess
	    });
	    return valueArray;
	},
	//解析数据表格定义
	analyzeDom:function(){
		var table = this.table;
		this.rowNumber = parseInt(table.attr('rownumber'),10);// 根据table设定属性
		this.maxRowNum = parseInt(table.attr('maxRowNum'),10);// 根据table设定属性
		this.canAddRow = table.attr('addrows');
		this.canDeleteRow = table.attr('deleterows');
		this.gridDataBind = table.attr('databind');
		var tds=this.table.find('td');
		var inputs = this.table.find('td').find('input');// 根据input设定属性
		var length = inputs.length;
		
		//是否存在主键列
//		var isExitPkRow = false;
		for(var i =0; i < inputs.length; i++){
			var buffer = {};
			buffer.dataBind = inputs.eq(i).attr('databind');
			buffer.presetbind = inputs.eq(i).attr('presetbind');
			buffer.presetdatabind = inputs.eq(i).attr('presetdatabind');
			buffer.presetdatabindisquery = inputs.eq(i).attr('presetdatabindisquery');
			buffer.text = inputs.eq(i).attr('databindtext');
			buffer.visible = inputs.eq(i).attr('visible');
			buffer.editable = inputs.eq(i).attr('editable');
			buffer.notnull = inputs.eq(i).attr('notnull');
			buffer.datalength = inputs.eq(i).attr('datalength');
			buffer.showtype = inputs.eq(i).attr('showtype');
			buffer.checkboxshowvalue = inputs.eq(i).attr('checkboxshowvalue');
			buffer.comboboxshowvalue = inputs.eq(i).attr('comboboxshowvalue');
			buffer.isSearch = inputs.eq(i).attr('isSearch');
			buffer.isMulti = inputs.eq(i).attr('isMulti');
			buffer.az = inputs.eq(i).attr('az');
			buffer.placeholder = inputs.eq(i).attr('placeholder');
			buffer.validateType = inputs.eq(i).attr('validateType');
			buffer.customReg = inputs.eq(i).attr('customReg');
			buffer.rows = inputs.eq(i).attr('rows');
			buffer.format = inputs.eq(i).attr('format');
			buffer.fileLimitSize = inputs.eq(i).attr('fileLimitSize');
			buffer.fileSaveType = inputs.eq(i).attr('fileSaveType');
			buffer.fileLimitNum = inputs.eq(i).attr('fileLimitNum');
			buffer.allowFormat = inputs.eq(i).attr('allowFormat');
            buffer.cascadeWidgetId = inputs.eq(i).attr('cascadeWidgetId');
            var presetInfos = {};
            presetInfos.presettype = inputs.eq(i).attr('presettype');
            presetInfos.presetbind = inputs.eq(i).attr('presetbind');
            buffer.presettype = presetInfos.presettype;
            buffer.presetbind = presetInfos.presetbind;
            buffer.isquerykey = inputs.eq(i).attr('isquerykey')=='true'||presetInfos.presettype=='codeList';
			//下拉菜单绑定预置资产
			if(presetInfos.presetbind!="no"&&inputs.eq(i).attr('showtype')=="select"&&!buffer.cascadeWidgetId){
				buffer.comboboxshowvalue=this.getSelectOption(presetInfos,buffer.az==='true');
			}else{
				buffer.comboboxshowvalue = inputs.eq(i).attr('comboboxshowvalue');
			}
//			buffer.defaultvalue=inputs.eq(i).attr('defaultvalue');  //新增
			buffer.width = inputs.eq(i).width();
			buffer.presetcol =inputs.eq(i).attr('presetcol');
			this.totalInfo.push(buffer);
			if(buffer.visible == 'false'){
				this.notVisibleInfo.push(buffer);
			}
			if(buffer.dataBind==this.primaryKeyValue){
				this.isExitPkRow = true;
			}
			if(buffer.presetcol =="true"){
				this.preCol.push(buffer.dataBind);
			}
			this.showtypes[buffer.dataBind]=buffer.showtype;
		}
		//如果不存在主键列,则增加主键列
		if(!this.isExitPkRow){
			var pk = {};
			pk.dataBind = this.primaryKeyValue;
			pk.text=this.primaryKeyValue;
			pk.visible = "false";
			pk.editable = "false";
			pk.notnull = "false";
			pk.showtype = "text";
			pk.checkboxshowvalue = "是:否";
			pk.comboboxshowvalue = "0:0";
			pk.isSearch = "false";
			pk.isMulti = "false";
			pk.az = "false";
			pk.placeholder = "";
			pk.validateType = "";
			pk.customReg = "";
			pk.rows = "";
			pk.format = "";
//			pk.defaultvalue="";
			this.totalInfo.push(pk);
			this.notVisibleInfo.push(pk);
			this.showtypes[this.primaryKeyValue]="text";
		}
	},
	submitValue:function(){
		var sys_fk=dataCenter.getParameter("SYS_FK");
		var pk_col={};
		pk_col["fk_id"]=sys_fk;
		var rowSet = this.dataStore.getRowSet();
		var newRowSet=new unieap.ds.RowSet();
		var self=this;
		//遍历源dataStore，获取更改的行
		for(var i = 0; i < rowSet.getRowCount(); i++){	
			var row=rowSet.getRow(i);
			var rowData=row.getData();
			if(sys_fk){//添加外键列，防止更新时无外键
				rowData=$.extend({},rowData,pk_col);
			}
			if(row.getRowStatus()!=unieap.ds.Status.NOTMODIFIED)
				newRowSet.addRow(rowData,true,true);
		};
		
		var deleteRows=rowSet.getData(unieap.ds.Buffer.DELETE);
		var newDeleteRows=newRowSet["delete"];
		for(var i=0;i<deleteRows.length;i++){
			var row=deleteRows[i];
			var newRow=$.extend(true, {}, row);
			convertDate(newRow);
			newDeleteRows.push(newRow);
		}
		
		//针对日期类型进行处理
		for(var i = 0; i < newRowSet.getRowCount(); i++){	
			var row=newRowSet.getRow(i);
			var rowData=row.getData();
//			convertDate(rowData);
		};
		var newDataStore=new unieap.ds.DataStore(this.dataStore.getName());
		newDataStore.setRowSet(newRowSet);
		newDataStore.parameters=this.dataStore.parameters;
		if(this.dataStore.parameters){//如果包含queryds时，才是绑定了有效实体的datastore
			if(this.dataStore.parameters.queryds){
				newDataStore.setParameter("gridds","true");
			}
		}
    	
    	dataCenter.addDataStore(newDataStore);
    	
		//提交后更改表格数据状态。
//		for(var i=0;i< rowSet.getRowCount();i++){
//			rowSet.getRow(i).setRowStatus(3);
//		}
		
		//将日期格式转换成long类型
		function convertDate(rowData){
			for(var j = 0; j < self.totalInfo.length; j++){
				//解析日期
				if(self.totalInfo[j].showtype == 'date'){
					var bindName = self.totalInfo[j].dataBind;
					var time =rowData[bindName];
					if(time){
						var date= new Date(Date.parse(time.replace(/-/g,   "/"))); //转换成Data();   
						rowData[bindName] = date.getTime().toString();
					}
				}
			}
		}
		
	}
});
