dojo.provide('unieap.xgrid.manager.SelectionManager');
dojo.require("unieap.xgrid.manager.Manager");

dojo.declare("unieap.xgrid.manager.SelectionManager", unieap.xgrid.manager.Manager, {
	/**
	 * @declaredClass:
	 * 		unieap.xgrid.manager.SelectionManager
	 * @summary:
	 * 		选择控制器
	 * @description:
	 * 		选择控制器为表格提供针对行的选择功能。
	 * 		可在Grid配置上配置selection指定表格的选择类型(单选/多选)，及各种选择事件。
	 * @example:
	 * |	<div dojoType="unieap.xgrid.Grid" width="500px" height="200px"
	 * |		binding="{store:'empDataStore'}"
	 * |		views="{rowNumber:true,orderType:'none'}"
	 * |		selection="{selectType:'single',onBeforeSelect:onSelect}">
	 * |		<fixed>
	 * |			<cell label="员工编号" width="150" name="attr_empno"></cell>
	 * |		</fixed>
	 * |		<header>
	 * |			<cell width="100px" label="姓名" name="NAME"></cell>
	 * |			<cell width="150px" label="职位" name="attr_job"></cell>
	 * |			<cell width="150px" label="工资" name="attr_sal" headerStyles="text-align: left;"></cell>
	 * |		</header>
	 * |	</div>
	 * @img:
	 * 		images/grid/grid_select.png
	 */
	
	types : {
		s: "s",
		single: "single",
		m: "m",
		multiple: "multiple"
	},
	
	/**
	 * @summary:
	 * 		选择类型
	 * @type:
	 * 		{string}
	 * @enum:
	 * 		{"s"|"single"|"m"|"multiple"|"none"}
	 * @default:
	 * 		"none"
	 * @example:
	 *|<div dojoType="unieap.xgrid.Grid"  width="80%" height="250px" binding="{store:'empDataStore'}" selection="{selectType:'single'}">
	 *|... ...
	 *|</div> 
	 */
	selectType: "none",
	
	//根据selection类型返回selection宽度
	getRowBarWidth: function() {
		var inWidth=0;
		if(this.selectType&&this.selectType!="none"){
			inWidth+=20;
		}
		return inWidth;
	},
	
	//根据selection类型，产生相应的HTML
	generateRowBarCells: function(inRowIndex) {
		var html = "",
			selectType = this.getSelectType(),
			types=this.types;
		if (selectType==types.m || selectType==types.multiple) {
			html += this.generateMultiSelectCell(inRowIndex);
		} else if (selectType==types.s || selectType==types.single) {
			html += this.generateSingleSelectCell(inRowIndex);
		}
		return html;
	},
	
	isSelectable : function(inRowIndex){
		return true;
	},
	
	//产生单选按钮的HTML
	generateSingleSelectCell: function(inRowIndex) {
		var binding = this.grid.getBinding();
		if(inRowIndex < -1)  return;
        if (inRowIndex == -1) {
        	var hheight = this.grid.ViewManager.getHeaderHeight();
            return "<td><div class='u-xgrid-rowbar-choice'style='height:"+(hheight-1)+"px; line-height:"+hheight+"px'>&nbsp;</div></td>";
        }else {
        	var hheight = this.grid.RowManager.defaultRowHeight;
            var data = binding.getRow(inRowIndex);
            var html = [];
            html.push("<td class='u-xgrid-rowbar-choice' style='height:"+(hheight-1)+"px; line-height:"+hheight+"px'><input type='radio' name='");
            html.push("radio_" + this.grid.id + "' style='height:"+(hheight-1)+"px; line-height:"+hheight+"px'");
            var row = new unieap.ds.Row(binding.getRowSet(),data);
            if (row.isRowSelected()) {
            	html.push(" checked='true' ");
                this.addToSelection(inRowIndex);
            }
            if (!this.isSelectable(inRowIndex) || row.getIdentifier("uncheckabled")) {
            	html.push(" disabled='true' ");
            }
            html.push("/></td>");
            return html.join('');
        }
	},
	//产生复选按钮的HTML
	generateMultiSelectCell: function(inRowIndex) {
		var binding = this.grid.getBinding();
		var data = inRowIndex>=0?binding.getRow(inRowIndex):{allSelect: true};
		var row = new unieap.ds.Row(binding.getRowSet(),data);
		var html = [];
		if (inRowIndex == -1) {
        	var hheight = this.grid.ViewManager.getHeaderHeight();
            html.push("<td><div class='u-xgrid-rowbar-choice' " +
            		"style='height:"+(hheight-1)+"px; line-height:"+hheight+"px'>" +
            		"<input type='checkbox' style='height:"+(hheight-1)+"px; line-height:"
            		+hheight+"px'");
            if (data["allSelect"]) {
				var checkNode=dojo.query("input[type^=checkbox]",this.grid.headersNode);
				if(checkNode[0]&&checkNode[0].checked){
					html.push(" checked='true' ");
				} 
			} 
			html.push("></div></td>");
        }else {
			var hheight = this.grid.RowManager.defaultRowHeight;
			
			html.push("<td><div class='u-xgrid-rowbar-choice' style='height:"+(hheight-1)+"px; line-height:"+hheight+"px'><input type='checkbox' name='");
			html.push("checkbox_" + this.grid.id + "' style='height:"+(hheight-1)+"px; line-height:"+hheight+"px'");
			if (row.isRowSelected()) {
				html.push(" checked='true' ");
				this.addToSelection(inRowIndex);
			} else {
				this.removeFromSelection(inRowIndex);
			}
			if (!this.isSelectable(inRowIndex) || row.getIdentifier("uncheckabled")) {
				html.push(" disabled='true' ");
			}
			html.push("></div></td>");
			
        }
        return html.join('');
	},
	
	/**
	 * @summary:
	 * 		取得表格的选择类型
	 * @return:
	 * 		{string}
	 * @enum:
	 * 		{"s"|"single"|"m"|"multiple"|"none"}
	 * @example:
	 * |<script type="text/javascript">
	 * |	var grid=unieap.byId("grid");
	 * |    var type=grid.getManager("SelectionManager").getSelectType(); 
	 * |	alert(type);
	 * |</script>
	 */
	getSelectType: function() {
		return this.selectType;
	},
	
	/**
	 * @summary:
	 * 		设置表格的选择类型
	 * @param:
	 * 		{string} inSelectType
	 * @enum:
	 * 		{"s"|"single"|"m"|"multiple"|"none"}
	 * @example:
	 * |<script type="text/javascript">
	 * |	var grid=unieap.byId("grid");
	 * |	var selectType = grid.getManager("SelectionManager").getSelectType();
	 * |	if(selectType=="m" || selectType=="multiple"){
   	 * |		grid.getManager("SelectionManager").setSelectType("s");
	 * |	}else if(selectType=="s" || selectType=="single"){
   	 * |		grid.getManager("SelectionManager").setSelectType("m"); 
	 * |	}
	 * |</script>
	 */
	setSelectType: function(inSelectType) {
		if (this.selectType == inSelectType) {
			return;
		} else {
			this.selectType = inSelectType;
			this.clearSelection();	
			this.grid.refresh();
		}
	},
	
	/**
	 * @summary:
	 * 		取得表格选中行
	 * @return:
	 * 		{array} 被选中的行的Row对象数组
	 * @example:
	 * |<script type="text/javascript">
	 * |	var grid=unieap.byId("grid");
	 * |	var selectedRows=grid.getManager('SelectionManager').getSelectedRows();
	 * |	unieap.debug(selectedRows);
	 * |</script>
	 */
	getSelectedRows: function() {
		return this.grid.getBinding().getRowSet().getSelectedRows();
	},
	
	
	/**
	 * @summary:
	 * 		取得选中的数据集
	 * @return：
	 * 		{unieap.ds.RowSet} 选中的数据对象组成的数据集
	 * @description：
	 * 		取得选中的数据集。
	 * 		当存在翻页缓存时,能够获取缓存中的数据。
	 * 		
	 */
	getSelectedDataSet:function(){
		var pagingMan=this.grid.getManager("PagingManager");
		if(pagingMan.pageCache){
			//如果存在缓存页
			var data=pagingMan.getSelectedCachedData();
			return new  unieap.ds.DataStore(data).getRowSet();
		}else{
			var rs = new unieap.ds.DataStore().getRowSet();
			var grs = this.grid.getBinding().getRowSet();
			var arr  = grs.getSelectedRowIndexs();
			var data = grs.getData();
			for(var i = 0;i<arr.length;i++){
				rs.addRow(data[arr[i]],false,true,false);
			}
			return rs;
		}
	},

	
	/**
	 * @summary:
	 * 		删除选中行
	 * @example:
	 * |<script type="text/javascript">
	 * |	var grid=unieap.byId("grid");
	 * |	grid.getManager('SelectionManager').deleteSelectedRows();
	 * |</script>
	 */
	deleteSelectedRows: function() {
		try {
			var binding = this.grid.getBinding();
			binding.getRowSet().deleteSelectedRows();
			this.grid.resizeContainer();
			if(binding.getRowCount() == 0){
				var checkNode=dojo.query("input[type^=checkbox]",this.grid.headersNode);
				checkNode[0]&&(checkNode[0].checked = false);
			}
		} catch(e) {
			
		}
	},
	
	/**
	 * @summary:
	 * 		选中前监听事件
	 * @description:
	 * 		此方法返回false时，选择将不生效。
	 * @param:
	 * 		{number} inRowIndex
	 * @return:
	 * 		{boolean}
	 */
	onBeforeSelect: function(inRowIndex) {
		return true;
	},
	
	/**
	 * @summary:
	 * 		取消选择前监听事件
	 * @description:
	 * 		此方法返回false时，取消选择将不生效。
	 * @param:
	 * 		{number} inRowIndex
	 * @return:
	 * 		{boolean}
	 * @example:
	 *|<div dojoType="unieap.xgrid.Grid"  width="80%" height="250px" binding="{store:'empDataStore'}" views="{rowNumber:true}" 
     *|	    selection="{selectType:'multiple',onBeforeDeselect:test}">
   	 *|		... 
	 *|</div>	  
	 */
	onBeforeDeselect: function(inRowIndex) {
		return true;
	},
	
	/**
	 * @summary:
	 * 		选择后事件
	 * @param:
	 * 		{number} inRowIndex
	 * @example:
	 *|<div dojoType="unieap.xgrid.Grid"  width="80%" height="250px" binding="{store:'empDataStore'}" views="{rowNumber:true}" 
     *|     selection="{selectType:'single',onAfterSelect:test}">
	 *|</div>
	 */
	onAfterSelect: function(inRowIndex) {
	},
	/**
	 * @summary:
	 * 		取消选择后事件
	 * @param:
	 * 		{number} inRowIndex
	 * @example:
	 *|<div dojoType="unieap.xgrid.Grid"  width="80%" height="250px" binding="{store:'empDataStore'}" views="{rowNumber:true}" 
     *|	selection="{selectType:'multiple',onAfterDeselect:test}">
     *|</div>
	 */
	onAfterDeselect: function(inRowIndex) {
	},
	/**
	 * @summary:
	 * 		全选前事件
	 * @description:
	 * 		此方法返回false时，全部选择将不生效。
	 * @param:
	 * 		{boolean} select select为true全部选中前事件，为false表示全部取消选择前事件
	 * @return:
	 * 		{boolean}
	 * @example:
	 *|<div dojoType="unieap.xgrid.Grid"  width="80%" height="250px" binding="{store:'empDataStore'}" views="{rowNumber:true}" 
     *|selection="{selectType:'multiple',onBeforeAllSelect:test}">
	 *|</div>
	 */
	onBeforeAllSelect: function(select) {
		return true;
	},
	/**
	 * @summary:
	 * 		全选后事件
	 * @param:
	 * 		{boolean} select select为true全部选中后事件，为false表示全部取消选择后事件
	 * @example:
	 *|<div dojoType="unieap.xgrid.Grid" width="80%" height="250px" binding="{store:'empDataStore'}" views="{rowNumber:true}" 
     *|     selection="{selectType:'multiple',onAfterAllSelect:test}">
	 *|</div>
	 */
	onAfterAllSelect: function(select) {
	},
	//根据inRowIndex选中一行
	addToSelection: function(inRowIndex) {
		this.grid.getBinding().selectedData(inRowIndex);
	},
	//根据inRowIndex移除一行	
	removeFromSelection: function(inRowIndex) {
		this.grid.getBinding().unSelectedData(Number(inRowIndex));
	},
	//根据inRowIndex使一行可以被选中
	enableCheckbox: function(inRowIndex) {
		var binding = this.grid.getBinding();
		var data = binding.getRow(inRowIndex);
		var row = new unieap.ds.Row(binding.getRowSet(),data);
		row.setIdentifier("uncheckabled",false);
	},
	//根据inRowIndex使一行不可被选中	
	unableCheckbox: function(inRowIndex) {
		var binding = this.grid.getBinding();
		var data = binding.getRow(inRowIndex);
		var row = new unieap.ds.Row(binding.getRowSet(),data);
		row.setIdentifier("uncheckabled",true);
	},
	/**
	 * @summary:
	 * 		判断某行是否可变更选择状态
	 * @param:
	 * 		{number} inRowIndex
	 * @return:
	 * 		{boolean}
	 */
	isCheckable: function(inRowIndex) {
		var binding = this.grid.getBinding();
		var data = binding.getRow(inRowIndex);
		var row = new unieap.ds.Row(binding.getRowSet(),data);
		var value = row.getIdentifier("uncheckabled");
		return value != true;
	},
		
	/**
	 * @summary:
	 * 		设置表格行数据的选中状态
	 * @param:
	 * 		{number} inRowIndex
	 * @param:
	 * 		{boolean} inSelect
	 */
	setSelect: function(inRowIndex, inSelect, event) {
		inRowIndex = parseInt(inRowIndex,10);
		if (isNaN(inRowIndex) || inRowIndex<0 || inRowIndex >= this.grid.getManager("RowManager").getRowCount()) {
			return;
		}
		
		if(!this.isCheckable(inRowIndex)) return;
		var select = true;
		
		if (typeof inSelect != 'undefined') {
			select = (inSelect==true);
		}
//		this.grid.getViewManager().refreshRow(inRowIndex);
		if (select) {
			if (!unieap.fireEvent4Widget(this, this.grid,this.onBeforeSelect,[inRowIndex])) {
				dojo.stopEvent(event);
				return;
			}
		} else {
			if (!unieap.fireEvent4Widget(this, this.grid,this.onBeforeDeselect,[inRowIndex])) {
				dojo.stopEvent(event);
				return;
			}
		}

		if(this.selectType&&this.selectType!="none"){
			if(this.selectType==this.types.s||this.selectType==this.types.single){
				this.clearSelection();
			}
			select?this.addToSelection(inRowIndex):this.removeFromSelection(inRowIndex);
			var rows = this.grid.getManager("RowManager");
			unieap.fireEvent4Widget(this, this.grid,select?this.onAfterSelect:this.onAfterDeselect,[inRowIndex]);
			var vm = this.grid.getViewManager();
			var snapshot = vm.views[vm.views.length-1].snapshot;
			if(inRowIndex <= snapshot.beginRowIndex+snapshot.showRows){
				vm.refreshRow(inRowIndex);
			}
			rows.updateSelectRow(inRowIndex);
			this.refreshCheckState(select);
		}
	},
			
	/**
	 * @summary:
	 * 		设置一行是否可设置选择状态
	 * @param:
	 * 		{number} inRowIndex
	 * @param:
	 * 		{boolean} checkabled
	 */
	setCheckabled: function(inRowIndex, checkabled) {
		if (inRowIndex != parseInt(inRowIndex,10)) return;
		if (isNaN(inRowIndex)) return;
		if (inRowIndex<0||inRowIndex>this.grid.getBinding().getRowCount()-1) return;
		checkabled? this.enableCheckbox(inRowIndex):this.unableCheckbox(inRowIndex);
		var vm = this.grid.getViewManager();
		var snapshot = vm.views[vm.views.length-1].snapshot;
		if(inRowIndex <= snapshot.beginRowIndex+snapshot.showRows){
			vm.refreshRow(inRowIndex);
		}
	},
	
	setCheckable: function(inRowIndex, checkabled) {
		if (inRowIndex != parseInt(inRowIndex,10)) return;
		if (isNaN(inRowIndex)) return;
		if (inRowIndex<0||inRowIndex>this.grid.getBinding().getRowCount()-1) return;
		checkabled? this.enableCheckbox(inRowIndex):this.unableCheckbox(inRowIndex);
		var vm = this.grid.getViewManager();
		var snapshot = vm.views[vm.views.length-1].snapshot;
		if(inRowIndex <= snapshot.beginRowIndex+snapshot.showRows){
			vm.refreshRow(inRowIndex);
		}
	},
	
	
	
	/**
	 * @summary:
	 * 		设置一行选择状态是否显示
	 * @param:
	 * 		{number} inRowIndex
	 * @param:
	 * 		{boolean} display
	 */
	setCheckDisplay: function(inRowIndex, display) {
		if (inRowIndex != parseInt(inRowIndex,10)) return;
		if (isNaN(inRowIndex)) return;
		if (inRowIndex<0||inRowIndex>this.grid.getBinding().getRowCount()-1) return;
		var checkNode=dojo.query("input[type^=checkbox]",this.grid.viewsNode);
		if(checkNode && checkNode[inRowIndex]){
			if(display){
				dojo.style(checkNode[inRowIndex],"display","block");
			}
			else{
				dojo.style(checkNode[inRowIndex],"display","none");
			}
		}
	},
	
	/**
	 * @summary:
	 * 		设置表格全选
	 * 		只对多选时有用
	 * @param:
	 * 		{boolean} inSelect
	 */
	setAllSelect: function(inSelect) {
		if (!unieap.fireEvent4Widget(this, this.grid,this.onBeforeAllSelect,[inSelect])) {
			return false;
		}
		if (!(this.selectType==this.types.multiple || this.selectType==this.types.m)) {
			return false;
		}
		var binding = this.grid.getBinding();
		//var rowData = binding.getRowSet().getData();
		//var rowCount = rowData.length;
		var rowCount = binding.getRowCount();
		var checkNode=dojo.query("input[type^=checkbox]",this.grid.headersNode);
		if (rowCount==0) {
			checkNode[0]&&(checkNode[0].checked = inSelect);
			return false;
		}
		if (inSelect) {					
			for (var i =0; i<rowCount; i++){
				var row = new unieap.ds.Row(binding.getRowSet(),binding.getRow(i));
				if (true == row.getIdentifier("uncheckabled")) {
				} else {
					row.setRowSelected(true);
				}
			}
			checkNode[0]&&(checkNode[0].checked = true);
		} else {					
			for (var i =0; i<rowCount; i++){
				var row = new unieap.ds.Row(binding.getRowSet(),binding.getRow(i));
				if (true == row.getIdentifier("uncheckabled")) {
				} else {
					row.setRowSelected(false);
				}
			}
			checkNode[0]&&(checkNode[0].checked = false);
		}
		this.grid.getManager("ViewManager").refreshPage();
		unieap.fireEvent4Widget(this, this.grid,this.onAfterAllSelect,[inSelect]);
		return true;
	},
			
	/**
	 * @summary:
	 * 		判断一行是否被选中
	 * @param:
	 * 		{number} inIndex
	 * @return:
	 * 		{boolean}
	 */
	isSelected: function(inRowIndex){
		if(inRowIndex<0 || inRowIndex >= this.grid.getManager("RowManager").getRowCount()) {
			return false;
		}
		var binding = this.grid.getBinding();
		var row = new unieap.ds.Row(binding.getRowSet(),binding.getRow(inRowIndex));
		return row.isRowSelected();
		//return this.grid.getBinding().getRow(inRowIndex)["_s"]==true;
	},
	
	/**
	 * @summary:
	 * 		取得选择的行号
	 * @return:
	 * 		{array}
	 */
	getSelectedRowIndexs: function() {
		return this.grid.getBinding().getRowSet().getSelectedRowIndexs();
	},
	
	/**
	 * @summary:
	 * 		清空选择
	 */
	clearSelection: function() {
		var view = this.grid.getManager("ViewManager").views[0];
		if (view.isRowBar) {
			var inputs = dojo.query("input",view.domNode);
			for (var i=0, check; check=inputs[i]; i++) {
				if (check.checked==true) {
					check.checked = false;
				}
			}
		}
		var pageManager = this.grid.getManager("PagingManager");
		if(pageManager){
			pageManager.clearPageData();
		}
		var rows = this.grid.getBinding().getRowSet().getSelectedRows();
		for (var i=0,r; r=rows[i]; i++) {
			if(r){
				r.setRowSelected(false);
			}
		}
		this.refreshCheckState();
	},
	refreshCheckState: function(select) {
		if(this.selectType==this.types.m||this.selectType==this.types.multiple){
			var checkNode=dojo.query("input[type^=checkbox]",this.grid.headersNode);
			if(checkNode&&checkNode[0]){
				if(typeof select != 'undefined'&&!select){
					if(checkNode[0].checked)
						checkNode[0].checked = false;
				}
				else{
					var binding = this.grid.getBinding();
					var rowCount = binding.getRowCount();
					if (rowCount==0) return;
					var isAllSelected = true;
					for (var i =0; i<rowCount; i++){
						if (!this.isSelected(i)) {
							isAllSelected = false;
							checkNode[0].checked = false;
							return;
						} 
					}
					if(isAllSelected)
						checkNode[0].checked = true;
				}
			}
		}
	}
});
