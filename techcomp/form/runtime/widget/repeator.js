WebForm.widget("unieap.repeating.repeator",WebForm.FormContainer,{
	node_html:null,// 获取节点html
	$content:null,
	$nodes:null,
	id:null,
	maxNum:null,
	count:null,
	editable:null,
	notAdd:null,
	notDel:null,
	title:null,
	subtitle:null,
	minNum:null,
	beforeAdd:[],
	afterAdd:[],
	beforeDel:[],
	afterDel:[],
	primaryKeys:[],//保存查询出来的原始主键
	bindBeforeAddEvent:function(callback){
		this.beforeAdd.push(callback);
	},
	bindAfterAddEvent:function(callback){
		this.afterAdd.push(callback);
	},
	bindBeforeDelEvent:function(callback){
		this.beforeDel.push(callback);
	},
	bindAfterDelEvent:function(callback){
		this.afterDel.push(callback);
	},
	_create:function(){
	    this.beforeAdd=[];
        this.afterAdd=[];
        this.beforeDel=[];
        this.afterDel=[];
        this.primaryKeys=[];
		this.count = 0;
		this.id=this.element.attr("id");
		this.maxNum=Number(this.element.attr("maxNum"));
		this.title=this.element.attr("title");
		this.subtitle=this.element.attr("subtitle");
		this.minNum=Number(this.element.attr("minNum"));
		this.editable=this.element.attr("editable")!="false";
		this.notAdd = this.element.attr("notAdd")=="true";
		this.notDel = this.element.attr("notDel")=="true";
		var dataBindName=this.element.attr("databind"); 
		if(!dataBindName)
			return; 
		for(var name in dataCenter.dataStores){
            if(name.indexOf("_record")>=0){
                continue;
            }
			var dataStore=dataCenter.dataStores[name];
			var ctrl=dataStore.getParameter("relatedcontrols");
			if(ctrl==this.id){
				this.dataStore=dataStore;
				break;
			}
		}
        this.uploadFilesDataStore = dataCenter.dataStores['uploader_grid_'+this.id];
        this.uploadFilesDataStore.setParameter("grid_name",this.title);
		this.$content = this.element.find("[layouttype='unieap.repeating.content']").eq(0);
		this.node_html = this.$content.html();
		this.$content.empty();//清空循环节内容
		this.$content.append('<div class="row layout-row block-title-outside" data-cols="1" ischild="true"><div class="layout-column col-xs-12 bg-theme-05 fz-17 text-bold block-title-content" contenteditable="false" ischild="true" style="text-align: center;">'+this.title+'</div></div>');
		this.$nodes = $('<div name="nodes"></div>').appendTo(this.$content);
	    if(this.editable&&!this.notAdd){
	    	this.$content.append('<div class="row layout-row btn-block" data-cols="1" ischild="true"><div class="layout-column col-xs-12" contenteditable="false" ischild="true" style="text-align: center;"><button class="btn btn-primary border-color-100 bg-theme-05 color-theme-100" type="button" onclick="$(\'#'+this.id+'\').data(\'FormWidget\').addNode()"><i class="fa fa-plus push-right-5"></i>新增'+this.subtitle+'</button></div></div>');
	    };
	    this.presetObj = {};
	    var self = this;
        var entityArray = [];
        $("[presetdatabind]",$(this.node_html)).each(function(i,o){
                var presetbind = $(o).attr('presetdatabind');
                if(presetbind){
                    var entityName = presetbind.split(".")[0];
                    if(entityArray.indexOf(entityName)<0){
                         entityArray.push(entityName);
                    }
                }
        })
        $(entityArray).each(function(i,o){
                var url = WEBAPP + '/formParser?status=preset';
                var params={};
                params.formid = dataCenter.getParameter("formid");
                params.procinstid = dataCenter.getParameter("SYS_FK");
                params.workitemid = dataCenter.getParameter("workitemid");
                params.presetbind = o;
                $.ajax({
                  url : url,
                  async: false,
                  type : 'post',
                  data : params,
                  dataType : 'json',
                  success : function(results){
                     if(results.length===1){
                         var data = results[0];
                         $('[presetdatabind*="'+o+'"]',$(self.node_html)).each(function(m,n) {
                            var $n = $(n);
                            var presetbind = $n.attr('presetdatabind');
                            if(presetbind){
                                var presetValue = data[presetbind.split('.')[1]];
                                var column = $n.attr('column');
                                self.presetObj[column] = presetValue;
                            }
                         })
                     }
                  }
                });
        })
},
	//绑定数据
	bindData:function(){
        var repeator = this;
        setTimeout(function(){//延时添加行，不然不触发事件
            var rowSet = repeator.dataStore.getRowSet();
            var rows = rowSet.getData(3);//取得primary所有数据
            if(rows.length==0){
                if(repeator.minNum){
                   for(var k=0;k<repeator.minNum;k++){
                          var $node = repeator.addNode();
                          if(!repeator.editable){
                              $('[repeatwidget="repeatWidget"]',$node).each(function(i,o){
                                  var $o =$(o);
                                  RepeatorWidgets.readOnly($o);
                              })
                          }
                    }
                }
            }else{
                var isStarted = Util.isNotEmpty(dataCenter.getParameter("SYS_FK"));
                $(rows).each(function(i,o){
                    if(isStarted){
                        repeator.primaryKeys.push(o.pk_id);
                    }
                    var $node = repeator.addNode(true,o);
                })
            }
            $("select[repeatortype='combobox']",repeator.element).each(function(i,o){
                var $o = $(o);
                if(!$o.attr("cascadeWidgetId")&&($o.attr("dataprovidertype")=="codeList"||$o.attr("isquerykey")=="true")){
                   $o.attr("notQtip","true");
                   $o.trigger("change");
                }
            });
			$("select:disabled,input[type='text']:disabled,textarea:disabled",repeator.element).renderSpan();
         },100);
	},
	//提交时的处理
	submitValue:function(){
		var repeator = this;
		// 所有控件重新collectData
		$("[repeatwidget='repeatWidget']",repeator.element).each(function(j,k){
			RepeatorWidgets.collectData($(k),repeator);
		});
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
//			convertDate(newRow);
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
		
//		//将日期格式转换成long类型
//		function convertDate(rowData){
//			for(var j = 0; j < self.totalInfo.length; j++){
//				//解析日期
//				if(self.totalInfo[j].showtype == 'date'){
//					var bindName = self.totalInfo[j].dataBind;
//					var time =rowData[bindName];
//					if(time){
//						var date= new Date(Date.parse(time.replace(/-/g,   "/"))); //转换成Data();   
//						rowData[bindName] = date.getTime().toString();
//					}
//				}
//			}
//		}
	},
	//addNodeWithData带着数据增加
	addNodeWithData:function(rowData){
	        var repeator = this;
	        if(!rowData.pk_id){
	            rowData.pk_id = Math.getUuid("rowid",25,32);
	        }
	        repeator.dataStore.getRowSet().addRow(rowData,false,false);//dc加row
            var $node = repeator.addNode(true);//加空行
            $('[repeatwidget="repeatWidget"]',$node).each(function(j,k){
                var $o =$(k);
                var column = $o.attr("column");
                var text = rowData[column+"_TEXT"];
                var value = rowData[column];
                if(Util.isNotEmpty(text)){//keyvalue形式
                    RepeatorWidgets.bindData($o,value+"::"+text);
                }else{
                    RepeatorWidgets.bindData($o,value);
                }
                if(!repeator.editable){
                    RepeatorWidgets.readOnly($o);
                }
            })
	},
    delNodeById:function(rowid,notCheck){
            if(!notCheck&&this.count==this.minNum){
                Msg.warning(this.title+"至少有"+this.minNum+"条");
                return false;
            }
            var $node = this.$nodes.children(":eq("+rowid+")");
            for( var index in this.beforeDel){
                if(this.beforeDel[index]($node)===false){
                    return false;
                };
            }
            this.count--;
            this.dataStore.getRowSet().deleteRow(rowid);
            //清除父页面vant元素
            $node.find('[repeatortype="date"][widgetType="vant"]').each(function(i,o){
                var id = $(o).attr("id");
                $('#'+id+'_vant',parent.window.document).remove();
            })
            //清除父页面图片元素
            $node.find('[repeatortype="uploader"][uploadertype="picture"]').each(function(i,o){
                var btnId = $(o).find("input[type='file']").attr("id");
                $('#'+btnId+'_imageContainer',parent.window.document).parent().remove();
            })
            $node.remove();
            this.reSort();
            for( var index in this.afterDel){
                this.afterDel[index]();
            }
            return true;
    },
    //修改某行号重复节某个数据
    updateColumn:function(rowid,column,value){
         var $node = $("[node='node'][count='"+(Number(rowid)+1)+"']",this.element);
         var $column = $("[column='"+column+"']",$node);
         RepeatorWidgets.bindData($column,value);
         RepeatorWidgets.collectData($column,$node);
    },
    empty:function(){
          for(var i=this.count-1;i>=0;i--){
             this.delNodeById(i);
          }
    },
	//新增重复节
	addNode:function(notNewRow,o){
		if(!notNewRow){
			if(this.maxNum){
				if(this.count+1>this.maxNum){
					Msg.warning(this.title+"最多可添加"+this.maxNum+"条！");
					return false;
				}
			}
			
		}
		for( var index in this.beforeAdd){
			if(!this.beforeAdd[index]()===false){
				return false;
			};
		}
		var repeator = this;
		var ds = repeator.dataStore;
		var newRowObj;
		if(!notNewRow){
		    newRowObj = $.extend({},{pk_id:Math.getUuid("rowid",25,32)},repeator.presetObj);
			ds.getRowSet().addRow(newRowObj,false,false);
		}
		var $node = $('<div node="node" count="'+(++this.count)+'"></div>');
		var delStr = '';
		if(repeator.editable&&!repeator.notDel){
			delStr ='<a class="remove-btn color-theme-100 color-theme-hover-50" onclick="$(\'#'+this.id+'\').data(\'FormWidget\').delNode(this)">'+
	        '<i class="fa fa-times-circle push-right-5"></i>'+
	        '<font>删除</font>'+
	        '</a>';
		}
		$node.append('<div class="row layout-row" data-cols="1" ischild="true"><div class="layout-column col-xs-12 bg-theme-05 fz-16 text-bold " contenteditable="false" ischild="true" style="text-align: center;">'+
				        '<p class="title-tag bg-theme-100">'+this.subtitle+this.count+'</p>'+delStr+'</div></div>');
		$node.append(this.node_html);
		$node.appendTo(this.$nodes);
		$('[repeatwidget="repeatWidget"]',$node).each(function(i,o){
			var $o =$(o);
			RepeatorWidgets.render($o,repeator);
			if(!notNewRow){
                var column = $o.attr("column");
                var text = newRowObj[column+"_TEXT"];
                var value = newRowObj[column];
                if(Util.isNotEmpty(value)){
                       if(Util.isNotEmpty(text)){//keyvalue形式
                           RepeatorWidgets.bindData($o,value+"::"+text);
                       }else{
                           RepeatorWidgets.bindData($o,value);
                       }
                       if(!repeator.editable){
                           RepeatorWidgets.readOnly($o);
                       }
                }
//
//                if(newRowObj[column]){
//                    RepeatorWidgets.bindData($o,newRowObj[column]);
//                    if(!repeator.editable){
//                        RepeatorWidgets.readOnly($o);
//                    }
//                }
			}
		})
        if(!notNewRow){
            $("select[repeatortype='combobox']",$node).each(function(i,o){
                var $o = $(o);
                if(!$o.attr("cascadeWidgetId")&&($o.attr("dataprovidertype")=="codeList"||$o.attr("isquerykey")=="true")){
                   $o.attr("notQtip","true");
                   $o.trigger("change");
                }
            });
        }
        if(o){
             $('[repeatwidget="repeatWidget"]',$node).each(function(j,k){
                 var $o =$(k);
                 var column = $o.attr("column");
                 var text = o[column+"_TEXT"];
                 var value = o[column];
                 if(Util.isNotEmpty(text)){//keyvalue形式
                     RepeatorWidgets.bindData($o,value+"::"+text);
                 }else{
                     RepeatorWidgets.bindData($o,value);
                 }
                 if(!repeator.editable){
                     RepeatorWidgets.readOnly($o);
                 }
             })
        }
        for( var index in this.afterAdd){
            this.afterAdd[index]($node);
        }
		return $node;
	},
	//删除重复节
	delNode:function(delbtn){
		var count = Number($(delbtn).parents("[node='node']").attr("count"));
		var rowid = count-1;
		return this.delNodeById(rowid);
	},
	//重组重复节编号，小标题
	reSort:function(){
		var subtitle = this.subtitle;
		this.$nodes.children().each(function(i,o){
			var count = i+1;
			$(o).attr("count",count);
			$(o).find(".title-tag").text(subtitle+count);
		})
	}
});