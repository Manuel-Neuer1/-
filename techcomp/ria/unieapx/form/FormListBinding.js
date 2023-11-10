dojo.provide('unieapx.form.FormListBinding');
dojo.declare("unieapx.form.FormListBinding",null, {

	/**
	 * @declaredClass: unieap.form.FormListBinding
	 * @summary: FormList控件数据绑定模块
	 * @example: |<div dojoType="unieap.form.FormList"
	 *           binding="{store:'empDs'}"> | <div
	 *           dojoType="unieap.form.TextBox" binding="{name:'address'}"></div> |</div>
	 */

	/**
	 * @summary: 设置FormList控件所绑定的DataStore
	 * @type: {unieap.ds.DataStore|string}
	 * @example: |<div dojoType="unieap.form.FormList"
	 *           binding="{store:'empDs'}"> | <div
	 *           dojoType="unieap.form.TextBox" binding="{name:'address'}"></div> |</div>
	 */
	store: null,

	constructor: function(params) {
		dojo.mixin(this, params);
		this.store=(this.widget.dataCenter || (unieap.Action.getViewContext(this.widget) || window).dataCenter).getDataStore(this.store);
		this.connects=[];
		this.store&&this.store.getRowSet()&&this._bindTrigger();
	},

	/**
	 * @summary: 获得FormList控件绑定的DataStore对象
	 * @return: {unieap.ds.DataStore}
	 * @example: |<script type="text/javascript"> | var
	 *           formList=unieap.byId('formList'), |
	 *           ds=formList.getBinding().getDataStore(); | unieap.debug(ds); |</script>
	 */
	getDataStore:function(){
		return this.store;
	},

	// 事件触发
	_bindTrigger:function(){
		if(typeof(this.store) == "undefined" || this.store == null){
			return;
		}
		var rowset=this.store.getRowSet();
	
		this.connects.push(dojo.connect(rowset,'onAfterAddRow',this,function(row){
			var count = rowset.getRowCount();
			if(count==1 && this.widget.insertBlankRow){
				// this.widget._createForm();
				return;
			}
			var div=dojo.create('div'),form_id;
			div.innerHTML='<div dojoType="unieap.form.Form">'+this.widget.originNodeHTML+"</div>";
			dojo.parser.parse(div, {xhr:true, currentDataCenter:this.widget.dataCenter || (unieap.Action.getViewContext(this.widget) || window).dataCenter});
			form_id=div.childNodes[0].id;
			// 为formlist增加id
			// this.widget._initWidgetId(div.childNodes[0], rowset.getRowCount());
			var currIndex = row.getIndex();
			if(currIndex + 1 == count){
				this.widget.containerNode.appendChild(div.childNodes[0]);
			}else{
				this.widget.containerNode.insertBefore(div.childNodes[0], this.widget.containerNode.childNodes[currIndex]);
			}
			div=null;
			unieap.byId(form_id).getBinding().bind(row);
			this.widget._upDateFormIndex(currIndex);
			this.widget._upDateFormListCount();
		}));

		this.connects.push(dojo.connect(rowset,'onBeforeDeleteRow',this,function(rowIndex){
			if (rowset.getRowCount() == 1 && this.widget.insertBlankRow) {
				return;
			}
			var childNodes = this.widget.containerNode.childNodes;
			// unieap.destroyWidgets(childNodes[rowIndex]);
			var widgets = dojo.query("[widgetId]",childNodes[rowIndex]).map(dijit.byNode);
			for(var i=widgets.length-1,formWidget;formWidget=widgets[i];i--){
				if(formWidget.destroy){
					formWidget.destroy();
				}
				else if(formWidget.id){
					dijit.registry.remove(formWidget.id);
				}
			}
			this.widget.containerNode.removeChild(childNodes[rowIndex]);
			this.widget._upDateFormIndex(rowIndex);
		}));

		// 删除Row时的监听
		this.connects.push(dojo.connect(rowset,'onAfterDeleteRow',this,function(row){
			// // FIXME:
			// 能否得到删除的序号,直接删除该序号对应的Form即可,不用重新删除Form再创建
			if (rowset.getRowCount() == 0 && this.widget.insertBlankRow){
				// rowset.insertRow({}, 0);
				// this.widget.getForm(0).getBinding().setDataStore(rowset.getDataStore());
				this.widget._createForm();
			}
			this.widget._upDateFormListCount();
		}));
		
		// 删除全部Row时的监听
		this.connects.push(dojo.connect(rowset,'onAfterDeleteAllRows',this,function(row){
			if (rowset.getRowCount() == 0){
				this.widget._createForm();
			}
			this.widget._upDateFormListCount();
		}));
	},



	// 销毁监听
	disconnect:function(){
		dojo.forEach(this.connects,function(item){
			dojo.disconnect(item);
		});
		this.connects=[];
	},


	destroy:function(){
		this.disconnect();
	},


	// 对radio进行处理
	reNameRadio:function(form, originRadioArr, index){
		var k = 0;
		dojo.query("input[type ='radio']", form).forEach(function(input){
			if(dojo.hasAttr(input,'name')){
				    var srcName = originRadioArr[k];
					var desName = srcName;
					for(var i = 0; i < index; i++){
						desName = desName + "_" + srcName;
						if(i == index-1){break;}
					}
					dojo.attr(input,"name", desName);
					k++;
			}
		});
	},
	// 对tabIndex进行处理
	reNameTabIndex : function(form, orginTabIndexArr, count, index){
		var k = 0;
		dojo.query("[tabIndex]", form).forEach(function(input){
			if(dojo.attr(input, "tabIndex") > 0){
				dojo.attr(input, "tabIndex", Number(orginTabIndexArr[k]) + count * index);
				k++;
			}
		});
	},

	/**
	 * @summary: 重新设置FormList控件绑定的DataStore
	 * @param: {unieap.ds.DataStore} store 要重新绑定的DataStore 对象
	 * @example: |<script type="text/javascript"> | var
	 *           ds=dataCenter.getDataStore('emp'), |
	 *           formList=unieap.byId('formList'); |
	 *           formList.getBinding().setDataStore(ds); |
	 *           unieap.debug(formList.getBinding().getDataStore()); |</script>
	 */
	setDataStore:function(store){
		if(!store instanceof unieap.ds.DataStore) return
		this.disconnect();
		this.store=store;
		this._bindTrigger();
		this.widget._createForm();
	}
});