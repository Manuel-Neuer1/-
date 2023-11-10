dojo.provide("unieapx.query.Binding");

dojo.declare("unieapx.query.Binding", null, {
	
	/**
	 * @declaredClass:
	 * 		unieapx.query.Binding
	 * @summary:
	 * 		查询组件绑定数据源模块
	 * @example:
	 * 
	 * |<div dojoType="unieapx.query.Query" binding="{store:'empDs'}">
	 * |	...
	 * |</div>
	 *
	 */
	
	/**
	 * @summary:
	 * 		设置查询组件绑定的数据源。
	 * 
	 * @type:
	 * 		{unieap.ds.DataStore}
	 * @example:
	 * |<div dojoType="unieapx.query.Query" binding="{store:'empDs'}">
	 * |	...
	 * |</div>
	 */
	store: "",
	
	//查询数据DataStore对象
	_bindingStore:null,
	
	constructor: function(param, inGrid) {
		dojo.mixin(this, param);
		if (param && param.store) {
			if (dojo.isString(param.store)) {
				this._bindingStore = unieap.getDataStore(param.store);
			} else {
				this._bindingStore = param.store;
			}
		}
		this._bindingStore = (this._bindingStore ||  new unieap.ds.DataStore(this.store));
	},
	
	/**
	 * @summary:
	 * 		获取查询组件绑定的DataStore
	 * @return:
	 * 		{unieap.ds.DataStore}
	 * @example:
	 * | 	unieap.byId("queryId").getBinding().getDataStore();
	 */
	getDataStore: function() {
		return this._bindingStore;
	},
	
	/**
	 * @summary:
	 * 		设置查询组件绑定的数据源。
	 * @example:
	 * |	var codeListFieldStore = new unieap.ds.DataStore("codeListFieldStore");
	 * |	var name = new unieap.ds.MetaData("name");
	 * |	name.setPrimaryKey(true);
	 * |	name.setDataType(12);
	 * |	name.setNullable(false);
	 * |	name.setLabel("名称");
	 * |	codeListFieldStore.addMetaData(name);
	 * |	codeListFieldStore.setRowSetName("com.neusoft.unieap.techcomp.codelist.entity.CodeListImpl");
	 * | 	unieap.byId("queryId").getBinding().setDataStore(codeListFieldStore);
	 */
	setDataStore: function(store) {
		this._bindingStore = store;
	}
	
});