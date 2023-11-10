dojo.provide('unieap.grid._grid.binding');

dojo.declare("unieap.grid.Binding", null, {
	/**
	 * @declaredClass:
	 * 		unieap.grid.Binding
	 * @summary:
	 * 		Grid数据绑定
	 * @description:
	 * 		Grid控件的数据绑定模块(binding)，用来和DataCenter的数据进行绑定
	 * @example:
	 * |<div id="grid" id="grid" dojoType="unieap.grid.Grid" width="500px" height="300px"
	 * |	binding="{store:'empDataStore'}"
	 * |	views="{rowNumber:true,orderType:'client'}">
     * |	<fixed>
     * |		<cell label="员工编号" width="150" name="attr_empno"></cell>
     * |	</fixed>
     * |	<header>
     * |		<cell width="100px" label="姓名" name="NAME"></cell>
     * |		<cell width="150px" label="职位" name="attr_job"></cell>
     * |		<cell width="150px" label="工资" name="attr_sal" dataType="number"></cell>
     * |	</header>
	 * |</div>
	 */
	
	grid: null,
	
	/**
	 * @summary:
	 * 		设置Grid控件所绑定的DataStore对象
	 * @description:
	 * 		如果类型是DataStore对象，则不需要配置dataCenter属性
	 * 		如果类型是字符串，则表示DataCenter中的DataStore名，还需要配置dataCenter属性
	 * 		若不配置默认为全局的DataCenter对象(即dataCenter)
	 * @type:
	 * 		{unieap.ds.DataStore|string}
	 * @example:
	 * |<div dojoType="unieap.grid.Grid" binding="{store:'empDs'}">
	 * |	...
	 * |</div>
	 */
	store: null,
	
	/**
	 * @summary:
	 * 		设置Grid控件所绑定的DataStore对象来源于哪个DataCenter
	 * @description:
	 * 		设置Grid控件所绑定的DataStore对象来源于哪个DataCenter，仅在store属性为DataStore名称时生效
	 * 		若没有指明,将会在全局的DataCenter对象(即dataCenter)中获取
	 * @type:
	 * 		{unieap.ds.DataCenter}
	 * @example:
	 * |<div dojoType="unieap.grid.Grid" binding="{store:'empDs',datacenter:dc}">
	 * |	...
	 * |</div>
	 */
	dataCenter: null,
	
	constructor: function(param, inGrid) {
		dojo.mixin(this, param);
		this.connects = [];
		this.grid = inGrid;
		if (param && param.store) {
			if(!this.dataCenter){
				this.dataCenter = this.grid.dataCenter || (unieap.Action.getViewContext(this.grid) || window).dataCenter;
			}
			dojo.isString(param.store)?
					(this.originStore=unieap.getDataStore(param.store, this.dataCenter, false)):(this.originStore= param.store);
			//如果支持客户端翻页，构建一个新的datastore
			if(this._supportClientPaging()){
				this.store=this.getDataStoreByPageNumber(this.originStore.getPageNumber());
			}else{
				this.store=this.originStore;
			}
			
		}
		!this.store&&(this.store = new unieap.ds.DataStore(param.store || "temp"));
		this.setData(this.store);
	},
	
	/**
	 * @summary:
	 * 		取得Grid绑定的DataStore
	 * @return:
	 * 		{unieap.ds.DataStore}
	 */
	getDataStore: function() {
		return this.store;
	},
	
	/**
	 * @summary:
	 * 		设置表格的数据源
	 * @param:
	 * 		{unieap.ds.DataStore} store
	 */
	setDataStore: function(store) {
		!store && (store=new unieap.ds.DataStore("temp"));
		var dsName=store.getName();
		//判断是否支持前台翻页
		if(this._supportClientPaging() && dsName.indexOf('_client_paging_ds')==-1){
			this.originStore=store;
			this.store=this.getDataStoreByPageNumber(this.originStore.getPageNumber());
			this.setData(this.store);
		}else{
			this.setData(store);
		}
		this.grid.onStoreChanged();
		if(this.grid.showLoading){
			dojo.style(this.grid.contentLoading,'display','none');	
		}
	},
	
	//通过pageNumber属性从原始datastore中来读取数据
	getDataStoreByPageNumber:function(pageNumber){
//		pageNumber=pageNumber||1;
//		var store=this.originStore,
//			rows = store.getRowSet().getData(),
//			pageSize=store.getPageSize(),
//			recordCount=store.getRecordCount();
//		//构建datastore
//		var start = (pageNumber-1)*pageSize,
//			rowData = rows.slice(start, start+pageSize),
//			dsObj = {
//				pageSize: pageSize,
//				pageNumber: pageNumber,
//				recordCount: recordCount,
//				rowSet:rowData,
//				name:'_client_paging_ds',
//				metaData:(store.getMetaData())
//			};
//		return  new unieap.ds.DataStore(dsObj);
		pageNumber=pageNumber||1;
		var store=this.originStore,
			pageSize=store.getPageSize(),
			recordCount=store.getRecordCount();
		//构建datastore
		var start = (pageNumber-1)*pageSize,
			rows = store.getRowSet().getRows(null,start, start+pageSize),
			rowset = new unieap.ds.RowSet();
		for(var i=0,len = rows.length;i<len;i++){
			rowset.insertRow(rows[i].getData(),i);
			rowset.resetUpdate(i);
		}
		var tempStore = new unieap.ds.DataStore();
		tempStore.setRowSet(rowset);
		tempStore.setPageSize(pageSize);
		tempStore.setPageNumber(pageNumber);
		tempStore.setRecordCount(recordCount);
		tempStore.setName('_client_paging_ds');
		tempStore.setMetaData(store.getMetaData());
//		tempStore.getRowSet().resetUpdate();
		return  tempStore;
		
	},
	
	//是否支持客户端翻页
	_supportClientPaging:function(){
		var pagingManager=this.grid.managers.get('PagingManager');
		if(pagingManager){
			return pagingManager.supportClientPaging();
		}
		return false;
	},
	

	/**
	 * @summary:
	 * 		当有客户端翻页时，返回grid初始绑定的DataStore
	 * @return:
	 * 		{unieap.ds.DataStore}
	 */
	getOriginStore:function(){
		return this.originStore;
	},
	
	
	//删除当前grid绑定的datastore时，同步原始的主datastore
	syncOriginStore:function(indexs){
		if(this._supportClientPaging()){
			var pagingManager=this.grid.managers.get('PagingManager'),
				pageInfo=pagingManager.getPageInfo(),
				totalCount=pageInfo['totalCount'],
				pageNumber=pageInfo['pageNumber'],
				pageSize=pageInfo['pageSize'],
				startNumber=(pageNumber-1)*pageSize;
			indexs=dojo.map(indexs,function(index){
				return startNumber+index;
			});
			
			if (totalCount > 0){
				this.originStore.getRowSet().deleteRows(indexs);
				//更新主datastore的总记录数
				this.originStore.setRecordCount(totalCount-indexs.length);
				//让当前页面总是显示为pageSize条记录
				this.setDataStore(this.getDataStoreByPageNumber(pageNumber));
			}
		}
	},
	
	
	/**
	 * @summary:
	 * 		清空表格的数据
	 * @description：
	 * 		清空表格的数据，相当于getBinding().setDataStore(null)
	 */
	clear : function(){
		this.setDataStore(null);
	},
	
	
	
	setData: function(inData) {
		this.disconnect();
		this.store = (inData ||  new unieap.ds.DataStore(this.store.getName()));
		var data = this.getRowSet().getData();
		this.setRowData(data);
		this.setInternalRowSet();
		this.grid.trigger && this.bindDataSetTrigger();
	},
	
	setRowData: function(data) {
		this.rowData = data;
	},
	
	//基于数据构建一个Grid组件内部使用的RowSet对象，避免触发原来RowSet绑定的事件
	setInternalRowSet:function(){
		this.internalRowSet = this.store.getRowSet().collect("all");
	},
	
	getInternalRowSet:function(){
		return this.internalRowSet;
	},
	
	//DataStore rowData同步更新this.rowData
	updateRowData: function() {
	    //重新设置数据后清空原有的排序状态
		this.grid.sortInfo = [];
		this.setRowData(this.getRowSet().getData());
		this.setInternalRowSet();
	},
	//selection
	selectedData : function(inRowIndex){
//		var row = this.getRowData()[inRowIndex];
//		row["_s"] = true;
		var row = new unieap.ds.Row(this.getRowSet(),this.getRow(inRowIndex));
		row.setRowSelected(true);
	},
	unSelectedData : function(inRowIndex){
//		var row = this.getRowData()[inRowIndex];
//		row["_s"] = false;
		var row = new unieap.ds.Row(this.getRowSet(),this.getRow(inRowIndex));
		row.setRowSelected(false);
	},
	
	/**
	 * @summary:
	 * 		取得Grid绑定的RowSet
	 * @return:
	 * 		{unieap.ds.RowSet}
	 */
	getRowSet: function() {
		return this.store.getRowSet();
	},
	
	/**
	 * @summary:
	 * 		取得当前Grid的数据行数
	 * @return:
	 * 		{number}
	 */
	getRowCount: function() {
		//return this.getRowData().length;
		return this.getInternalRowSet().getRowCount();
	},
	
	/**
	 * @summary:
	 * 		取得Grid的指定行数据
	 * @param:
	 * 		{number} inRowIndex
	 * @return:
	 * 		{object}
	 */
	getRow: function(inRowIndex) {
		var row = this.getInternalRowSet().getRow(inRowIndex);
		if(row){
			return row.getData();
		}
		//return this.getRowData()[inRowIndex];
	},
	
	getRowData: function() {
		return this.rowData;
	},
	
	getDatum: function(inRowIndex, colName) {
//		var row=this.getRowData()[inRowIndex];
//		if(!row)return "";
//		var value = this.getRowData()[inRowIndex][colName];
//		if(value==null) return "";
//		//对Grid单元格中的数据进行转义
//		return String(value).replace(/&/g,"&amp;").
//							 replace(/</g,"&lt;").
//							 replace(/>/g,"&gt;").
//							 replace(/\s/g,"&nbsp;");
	
		var row = this.getInternalRowSet().getRow(inRowIndex);
		if(!row)return "";
		var value = row.getItemValue(colName);
		if(value==null) return "";
		//对Grid单元格中的数据进行转义
		return String(value).replace(/&/g,"&amp;").
							 replace(/</g,"&lt;").
							 replace(/>/g,"&gt;").
							 replace(/\s/g,"&nbsp;");					 
	},
	
	/**
	 * @summary:
	 * 		往Grid绑定的RowSet中插入一行数据
	 * @description:
	 * 		往RowSet中插入一行数据后，Grid会自动刷新并且显示该行数据
	 * 		如果不传入任何参数或者传入的第一个参数不为对象,将在控件的最前面增加一条空记录。
	 * @param:
	 * 		{object} inData 要插入的数据对象
	 * @param:
	 * 		{number} inRowIndex 设置在哪个位置插入数据
	 * @example:
	 * |var binding=unieap.byId('grid').getBinding();
	 * |binding.insertRow({deptno:10},0);	//在第一行插入一条记录
	 * |binding.insertRow({deptno:10});		//在第一行插入一条记录
	 * |binding.insertRow({deptno:10},1);	//在第二行插入一条记录
	 * |binding.insertRow();				//在第一行插入一条空记录
	 * |binding.insertRow({}, 1); 			//在第二插入一条空记录
	 */
	insertRow: function(inData, inRowIndex){
		var len=arguments.length;
		if(len>=2){
			this.getRowSet().insertRow(inData,inRowIndex);
		}else if(len==1){
			typeof(inData)!='object'&&(inData={});
			this.getRowSet().insertRow(inData,0);
		}else{
			this.getRowSet().insertRow({},0);
		}
		
	},
	
	/**
	 * @summary:
	 * 		删除Grid绑定的RowSet中的某一行数据
	 * @description:
	 * 		删除RowSet中的一行记录后,Grid会自动刷新表格数据
	 * @param:
	 * 		{number} inRowIndex
	 * @example:
	 * |var binding=unieap.byId('grid').getBinding();
	 * |binding.deleteRow(0) //删除第一条数据
	 */
	deleteRow: function(inRowIndex) {
		this.getRowSet().deleteRow(inRowIndex);
		this.syncOriginStore([inRowIndex]);
	},
	
	/**
	 * @summary:
	 * 		删除Grid绑定的RowSet中的多行数据
	 * @description:
	 * 		删除RowSet中的多行记录后,Grid会自动刷新表格数据
	 * @param:
	 * 		{array} rowsIndexArray
	 * @example:
	 * |var binding=unieap.byId('grid').getBinding();
	 * |binding.deleteRows([0,1]) //删除Grid中的第一条和第二个数据
	 */
	deleteRows: function(rowsIndexArray) {
		this.getRowSet().deleteRows(rowsIndexArray);
		this.syncOriginStore(rowsIndexArray);
	},
	
	
	//暂停对rowset的监听
	disabledEvent: function() {
		this.getRowSet().disabledEvent();
	},

	//恢复对rowset的监听
	enabledEvent: function() {
		this.getRowSet().enabledEvent();
	},
	
	//触发事件监听
	bindDataSetTrigger: function() {
		var grid = this.grid,
			rowset=this.getRowSet(),
			self=this;
		if(grid){
			this.connects.push(dojo.connect(
				rowset,
				"discardUpdate",
				function(){
					grid.getManager('ViewManager').refresh();
				}
			));
			this.connects.push(dojo.connect(
				rowset,
				"onItemChanged",
				function(thisRow, itemName, value, index){
					if(grid){
						grid.onItemChanged(index,itemName);
					}
					return true;
				}
			));
			
			/*监听RowSet的postAddRow事件*/
			this.connects.push(dojo.connect(
				rowset,
				"onAfterAddRow",
				function(){
					grid.onRowSetChanged();	
					return true;
				}
			));
			/*监听RowSet的postAddRows事件*/
			this.connects.push(dojo.connect(
				rowset,
				"onAfterAddRows",
				function(){
					grid.onRowSetChanged();
					return true;
				}
			));
			/*监听RowSet的postDeleteRow事件*/
			this.connects.push(dojo.connect(
				rowset,
				"onAfterDeleteRow",
				function(){
					grid.onRowSetChanged();
					return true;
				}
			));
			/*监听RowSet的postDeleteRows事件*/
			this.connects.push(dojo.connect(
				rowset,
				"onAfterDeleteRows",
				function(){
					grid.onRowSetChanged();
					return true;
				}
			));
			
			/*监听RowSet的postDeleteAllRows事件*/
			this.connects.push(dojo.connect(
				rowset,
				"onAfterDeleteAllRows",
				function(){
					grid.onStoreChanged();
					return true;
				}
			));
			
			this.connects.push(dojo.connect(
				rowset,
				"onFilter",function(){
					grid.onRowSetFilter();
			}));
			
			this.connects.push(dojo.connect(
				rowset,
				"onResetUpdate",function(inRowIndex){
					if(inRowIndex!=null){
						grid.getManager("ViewManager").refreshRow(inRowIndex);
						return;
					}
					grid.onStoreChanged();
			}));
			
			//监听rowset的discardUpdate事件
			this.connects.push(dojo.connect(rowset,"onBeforeDiscardUpdate",function(){
				//获得Grid控件的选择类型
				var type=self.grid.managers.get('SelectionManager').getSelectType();

				if(type=='s'||type=='single'){
					//this此时指向RowSet对象
					this.forEach(function(row){
						//delete row.getData()["_s"];
						row.setRowSelected(false);
					},null,null,unieap.ds.Buffer.DELETE);
					
					this.forEach(function(row){
						//delete row.getData()["_s"];
						row.setRowSelected(false);
					},null,null,unieap.ds.Buffer.FILTER);
				}
				
			}));
			
			
			this.connects.push(dojo.connect(
				rowset,
				"onSort",function(){
					grid.onSorted();
			}));
			
			//datastore的数据被替换时触发
			this.connects.push(dojo.connect(
				this.store,
				"onRowSetChanged",
				this,
				function(){
					grid.setDataStore(this.store);
				}
			));
			
			//统计信息发生改变
			this.connects.push(dojo.connect(
				this.store,
				"onPropsChanged",
				this,
				function(){
					grid.onStatisticChanged();
				}
			));
			/*监听RowSet的onAfterDeleteSelectedRows事件*/
            this.connects.push(dojo.connect(
                this.getRowSet(),
                "onAfterDeleteSelectedRows",
                function(){
                    grid.onRowSetChanged();
                    return true;
                }
            ));
		}
	},
	
	//销毁绑定
	disconnect: function() {
		while(this.connects.length>0){
			dojo.disconnect(this.connects.pop());	
		}
	},
	
	//销毁绑定
	destroy: function() {
		this.disconnect();
	},
	
	/**
	 * @summary:
	 * 		判断Grid绑定的RowSet是否被修改
	 * @return:
	 * 		{boolean}
	 * @example:
	 * |var binding=unieap.byId('grid').getBinding();
	 * |var modified=binding.isModified();
	 */
	isModified: function() {
		return this.getDataStore().getRowSet().isModified();
	},
	
	//已经废弃,建议使用validate方法
	isValid: function(inRowIndex,indication,needFocus) {
		return this.validate(inRowIndex,indication,needFocus)
	},
	
	/**
	 * @summary:
	 * 		校验Grid中的数据是否合法
	 * @description:
	 * 		如果校验不通过的单元格可以编辑,当errorPrompt参数为true时会自动提示错误信息，并置光标到单元格中
	 * @param:
	 * 		{number} inRowIndex 对某一行的数据进行校验
	 * @param:
	 * 		{boolean} errorPrompt 校验不通过后是否自动提示错误信息,如果不设置就为global.js中的unieap.widget.errorPrompt
	 * @param:
	 * 		{boolean} needFocus  当校验不通过时，是否设置光标到出错的单元格，默认为true
	 * @return:
	 * 		{boolean}
	 * @description:
	 * 		如果用户使用了编辑模块，并且配置了onBeforeEdit事件，建议用户不要在onBeforeEdit方法中调用validate方法。
	 * 		因为使用不当，可能会使得页面出现死循环。如果您的确需要这么做，请确保needFocus值参数为false
	 * @example:
	 * |<script type="text/javascript">
	 * |	var grid=unieap.byId("grid");
	 * |	//只校验第1行,是否提示错误信息依赖于unieap.widget.errorPrompt
	 * |	grid.getBinding().validate(0); 
	 * |	//校验第一行并提示错误信息
	 * |	grid.getBinding().validate(0,true);
	 * |	//校验所有的单元格并提示错误信息
	 * |	grid.getBinding().validate(null,true);
	 * |	//或者简写成grid.getBinding().validate(true);
	 * |</script>
	 */
	validate:function(inRowIndex,errorPrompt,needFocus){
		if(arguments.length==1){
			typeof(inRowIndex)=="boolean"&&(errorPrompt=inRowIndex);
		}
		
		if(arguments.length==2){
			if(typeof(inRowIndex)=='boolean'&&typeof(errorPrompt)=='boolean'){
				needFocus=errorPrompt;
				errorPrompt=inRowIndex;
			}
		}
		
		typeof(errorPrompt)=="undefined"&&(errorPrompt=unieap.widget.errorPrompt);
		
		typeof(needFocus)=="undefined"&&(needFocus=true);
		
		var cells = this.grid.managers.get("LayoutManager").getCells(),
			rowSet = this.getRowSet();
		
		//只对某一行进行校验
		if(typeof(inRowIndex)=="number"){
			var row = rowSet.getRow(inRowIndex);
			if(!row) return true;
			for (var i=0,cell; (cell=cells[i]); i++) {
				if (!cell.isValid(row)) {
					errorPrompt?this._showErrorPrompt(inRowIndex,cell,needFocus):this._setEdit(inRowIndex,cell,needFocus);
					return false;
				}
			}
			return true;
		}
		
		var result=true;
		
		
		//对primary缓冲区中的数据进行校验
		result=!rowSet.some(function(row) {//对每个row校验，有不合法的值返回true
			for (var i=0,cell; (cell=cells[i]); i++) {
				if (!cell.isValid(row)) {
					errorPrompt?this._showErrorPrompt(row.getIndex(),cell,needFocus):this._setEdit(row.getIndex(),cell,needFocus);
					return true;
				}
			}
			return false;
		},null,null,unieap.ds.Buffer.PRIMARY,this);
		
		//如果primary缓冲区中有不合法数据,直接返回false
		if(!result) return false;
		
		

		
		//对filter缓冲区中的数据进行校验
		result=!rowSet.some(function(row) {
			for (var i=0,cell; (cell=cells[i]); i++) {
				if (!cell.isValid(row)) {
					cell.setEditable(false);
					//过滤缓冲区，不需要focus
					errorPrompt?this._showErrorPrompt(row.getIndex(),cell,false):this._setEdit(row.getIndex(),cell,needFocus);
					return true;
				}
			}
			return false;
		},null,null,unieap.ds.Buffer.FILTER,this);	
		
		
		return result;
		
	},
	
	_showErrorPrompt:function(rowIndex,cell,needFocus){
		var me=this;
		MessageBox.alert({
			title:cell.label+RIA_I18N.grid.group.columnCheckInfo, 
			type:'warn',
			message:cell.getErrorMsg(),
			onComplete:function(){
				me._setEdit(rowIndex,cell,needFocus);
			}
		});
	},
	
	_setEdit:function(rowIndex,cell,needFocus){
		if(needFocus&&cell.isEditable()){
			this.grid.managers.get("EditManager").setEdit(rowIndex,cell.index);
			//光标置入出错的单元格中后，马上进行校验
			setTimeout(function(){
				cell.getEditor()&&cell.getEditor().getValidator().validate();
			},0);
		}
	
	},
	
	
	/**
	 * @summary:
	 * 		表格排序
	 * @param:
	 * 		{unieap.grid.Cell} inCell
	 * @param:
	 * 		{number} asc 可选值为-1和1,-1表示降序，1表示升序
	 */
	sort: function(inCell, asc) {
		this.grid.publish("onBeforeSort");
		if (unieap.fireEvent4Widget(this,this.grid,this.onBeforeSort,[inCell, asc])==false || !inCell.name) return;
		asc && (inCell.asc = asc);
		this.grid.setSortInfo(inCell);
		var sortInfo = this.grid.getSortInfo();
		//client sort	
		if(this.grid.managers.get("ViewManager").orderType=="client") {
			//this.getRowSet().sorts(sortInfo);
			this.getRowSet().sort(inCell.name,inCell.asc,inCell.dataType);
			unieap.fireEvent4Widget(this,this.grid,this.onAfterSort,[inCell, asc]);
		} else { //server sort
			var store = this.getDataStore(),
				    result = [];
			for(var i=0;i<sortInfo.length;i++){
				var order = sortInfo[i].name; 
				if(!store.getStatementName()){
					if(unieap.dbDialect&&unieap.dbDialect=='drm'){
						order = "[".concat(order).concat("]");
					}
					
				}
				order = order.concat(" ").concat(sortInfo[i].asc>0?"asc":"desc");
				result.push(order);
			}
			if(this.isModified()&&confirm(RIA_I18N.grid.paging.saveChanges)) {
					this.save();
			}
			 store.setOrder(result.join(","));
			 //请求处理，调用回调刷新表格，清除所有状态翻到第一页
			 store=store.collect('none');
			 store.setPageNumber(1);
			 var self=this,
			 	 callback=function(a,b){
				 	var ds,dc;
					if(arguments.length==2){
						ds=a;
						dc=b;
					}else if(arguments.length==1){
						dc=a;
					}else{
						return;
					}
					!ds&&(ds=dc.getSingleDataStore());
					self.setDataStore(ds);
					self.onAfterSort(inCell, asc);
			 	 };

			 if(dojo.isFunction(this.rpc)){
			 	this.rpc(this.getDataStore().collect("none"),callback,this.grid,'sort');
			 }else{
				unieap.Action.doQuery(store,{
				 	load:function(ds,dc){
						callback(ds,dc);
					},
					sync:false
				 });
			 }
		}
		
	},
	
	/**
	 * @summary:
	 * 		求某一列的最小值
	 * @param:
	 * 		{string} name 列名
	 * @return:
	 * 		{number}
	 * @example:
	 * |var binding=unieap.byId('grid').getBinding();
	 * |var min=binding.min('attr_sal'); //获得RowSet中列为attr_sal的最小值
	 */
	min : function(name){
		return this.getRowSet().min(name);
	},
	
	/**
	 * @summary:
	 * 		求某一列的最大值
	 * @param:
	 * 		{string} name 列名
	 * @return:
	 * 		{number}
	 * @example:
	 * |var binding=unieap.byId('grid').getBinding();
	 * |var max=binding.max('attr_sal'); //获得RowSet中列为attr_sal的最大值
	 */
	max : function(name){
		return this.getRowSet().max(name);
	},
	
	/**
	 * @summary:
	 * 		求某一列的平均值
	 * @param:
	 * 		{string} name 列名
	 * @param:
	 * 		{string} pattern 格式化字符串
	 * @return:
	 * 		{number}
	 * @example:
	 * |var binding=unieap.byId('grid').getBinding();
	 * |var avg=binding.avg('attr_sal'); //获得RowSet中列为attr_sal的平均值
	 * |var avg1=binding.avg('attr_sal','###,###.000'); //avg1值形如123.25
	 */
	avg : function(name,pattern){
		return this.getRowSet().avg(name,pattern);
	},
	
	/**
	 * @summary:
	 * 		求某一列的总和
	 * @param:
	 * 		{string} name 列名
	 * @param:
	 * 		{string} pattern 格式化字符串
	 * @return:
	 * 		{number}
	 * @example:
	 * |var binding=unieap.byId('grid').getBinding();
	 * |var sum=binding.sum('attr_sal'); //获得RowSet中列为attr_sal的总和
	 * |var sum1=binding.sum('attr_sal','###,###.000'); //sum1值形如123.25
	 */
	sum : function(name,pattern){
		return this.getRowSet().sum(name,pattern);
	},
	
	/*
	 * @summary:
	 * 		用户自定义获得datastore，给V4模型提供接口实现
	 * @param:
	 * 		{unieap.ds.DataStore} ds Grid控件绑定的datastore
	 * @param:
	 * 		{function} load 回调成功后执行
	 */
	rpc:null,
	
	//取得锁定行数据
	getLockedRowData : function(){
		var d=[];
		if(this.grid.lockedRow){
			var statistics=this.grid.lockedRow.statistics;
			var getLockedRow=this.grid.lockedRow.getLockedRow;
			var setLockedRowData=this.grid.lockedRow.setLockedRowData;
			if(setLockedRowData){
				return setLockedRowData;
			}
			if(getLockedRow){
				if(typeof(getLockedRow)=='function'){
					var data=getLockedRow.apply(this.grid);
					if(data){
						d=d.concat(data);
					}
				}
			}
			if(statistics){
				var datas = this.store.getStatistics();
				
				if(datas){
					if (!dojo.isArray(statistics)) {
						statistics=[statistics];
					}
					dojo.forEach(statistics,function(statistic){
						var data={};
						for(var name in statistic){
							if(datas[name]&&datas[name][statistic[name]]){
								dojo.require('unieap.util.util')
								var statisticName=unieap.translate(statistic[name])||RIA_I18N.grid.group.count;
								data[name]=statisticName+": "+datas[name][statistic[name]]
							}
						}
						d.push(data);
					})
				}
			}
		}
		return d;
	},
	
	setLockedRowData : function(data){
		if (this.grid.lockedRow) {
			this.grid.lockedRow.setLockedRowData=data;			
		}
		var viewManager=this.grid.managers.get('ViewManager');
		viewManager.renderLockedRow(true);
	},

	//Grid列过滤
	doFilter:function(){
		var self=this;
		var layoutmanager=this.grid.managers.get('LayoutManager');
		var cells=layoutmanager.cells;
		this.getRowSet().doFilter();
		var filter={condition:{},pattern:""},hasfilter=false;
		dojo.forEach(cells,function(cell,index){
			if(cell.filter){
				dojo.mixin(filter.condition,cell.filter.condition);
				filter.pattern+=(filter.pattern==""?'  ':' && ')+"("+cell.filter.pattern+")";
				hasfilter=true;
			}
		});
		if(hasfilter){
			self.getRowSet().doFilter(dojo.clone(filter));
		}else{
			self.getRowSet().doFilter();
		}
		
		//如果有toolbar，就更新toolbar状态
		this.grid.getToolBar()&&this.grid.getToolBar().update();
	},
	
	/**
	 * @summary:
	 * 		持久化表格中的数据
	 * @param:
	 * 		{object} inData 额外的提交参数
	 * @example:
	 * |var grid=unieap.byId('grid')
	 * |grid.getBinding().save()
	 * |grid.getBinding().save({url:'/demo.do?method=update'});
	 */
	save:function(inData){
		if(false == unieap.fireEvent4Widget(this,this.grid,this.onBeforeSave,[])){
			return;
		}
		var _store=this.store,inData=inData||{};
		if(_store){
			if(inData['load']){
				dojo.connect(inData,'load',dojo.hitch(this,this._onAfterSave))
			}else{
				dojo.mixin(inData,{'load':dojo.hitch(this,this._onAfterSave)})
			}
			unieap.Action.doUpdate(_store,inData);
		}

	},
	
	_onAfterSave:function(){
		this.grid.managers.get('ViewManager').refresh();
		unieap.fireEvent4Widget(this,this.grid,this.onAfterSave,[]);
	},
	
	/**
	 * @summary:
	 * 		表格保存前事件
	 * @description:
	 * 		此方法返回false时，保存操作将取消。
	 * @return:
	 * 		{boolean}
	 * @example:
	 * |<div dojoType="unieap.grid.Grid" id="grid" binding="{onBeforeSave:fn}">
	 * |</div>
	 * |function fn(){
	 * |	var isValid=unieap.byId("grid").getBinding().validate();
	 * |    return isValid; //如果校验不成功,就不执行保存操作
	 * |}
	 * |unieap.byId("grid").getBinding().save(); //save执行之前会执行fn
	 */
	onBeforeSave: function() {
		return true;
	},
	
	/**
	 * @summary:
	 * 		表格持久化后回调事件
	 * @description:
	 * 		此方法会刷新表格的视图
	 * @example:
	 * |<div dojoType="unieap.grid.Grid" id="grid" binding="{onAfterSave:fn}">
	 * |</div>
	 * |function fn(){
	 * |	unieap.byId('grid').refresh();
	 * |}
	 * |unieap.byId("grid").getBinding().save(); //save执行完毕后会执行fn
	 * |
	 */
	onAfterSave: function() {
	},
	
	/**
	 * @summary:
	 * 		表格列排序前事件
	 * @description:
	 * 		此方法返回false时，排序操作将取消。
	 * @param:
	 * 		{unieap.grid.Cell} inCell
	 * @param:
	 * 		{number} asc 可选值为-1和1,-1表示降序，1表示升序
	 * @return:
	 * 		{boolean}
	 * @example:
	 *|<div dojoType="unieap.grid.Grid" id="grid" width="80%" height="250px" 
	 *| 	binding="{store:'empDataStore',onBeforeSort:fn}">
     *|</div>
     *|function fn(inCell,asc){
     *|}
	 */
	onBeforeSort: function(inCell, asc) {
		return;
	},
	
	/**
	 * @summary:
	 * 		表格列排序后回调事件
	 * @param:
	 * 		{unieap.grid.Cell} inCell
	 * @param:
	 * 		{number} asc 可选值为-1和1,-1表示降序，1表示升序
	 * @example:
	 *|<div dojoType="unieap.grid.Grid" id="grid" height="250px"
	 *| 	binding="{store:'empDataStore',onAfterSort:fn}">
	 *|</div>
     *|function fn(inCell,asc){
     *|}
	 */
	onAfterSort: function(inCell, asc) {
		
	}
});
//@ sourceURL=/tp_fp/techcomp/ria/dojo/../unieap/grid/_grid/binding.js