WebForm.FormWidget = function( /* options, element */) {};
WebForm.FormWidget._childConstructors = [];
WebForm.FormWidget.prototype = {
	name : '',// 控件名称
	id : '',// 控件ID
	prompt : '', //提示
	disabled : false,// 控件是否可用
	display : null,// 是否显示控件
	bindName : null,// 数据绑定名称
	dataStore : null,// 当前数据源
	bindRow : null,// 当前绑定的行
	currentValue : null,// 保存当前控件的值
	isQueryKey : false,// 是否是查询参数
	presetbind:null,//预置资产绑定
	varbind : null,// 变量绑定
	varbindName : null,// 变量绑定Name
	varoperation : null,// 变量操作：读(r) 写(w) 读/写(rw)
	element : null,// 保存jquery对象
	submitFlag : true,
	_createWidget : function(options, element) {
		if (!element)
			element = options;
		else
			$.extend(this, options);

		this.element = $(element);
		$.data(element, this.widgetName, this);
		$.data(element,"FormWidget",this);
		this._init();
		this._create();
	},
	_init : $.noop,

	_create : function() {
		this.element.addClass("notranslate");//禁止谷歌翻译
		this.id = this.element.attr("id");
		this.prompt = this.element.attr("prompt");
		if (this.prompt && "" != this.prompt)//this.prompt && "" != this.prompt
			{
			$(this.element).css("width","calc(100% - 20px)");
			var tooltip = $('<a class="color-666 pull-right push-up-5 fz-16 fa fa-info-circle" data-container="body" data-toggle="tooltip" data-placement="bottom" title="'+this.prompt+'"></a>');
			$(this.element).before(tooltip);
			tooltip.tooltip();
			}
		this.name = this.element.attr("name");
		var queryKey = this.element.attr("isquerykey");
		if ("true" == queryKey)
			this.isQueryKey = true;
		var dataBind = this.element.attr("databind");
		if (dataBind) {
			this.bindName = dataBind.split(".")[1];
			var entityName = dataBind.split(".")[0];// person.name
			var parentWidget=this.getParent();
			if(parentWidget){
				this.dataStore =parentWidget.dataStores[entityName];// 从父Form中获得对应的DataStore
			}
		}
		this.varbind = this.element.attr("variablebind");
		this.varbindName = this.element.attr("variablebindname");
		this.presetbind=this.element.attr("presetbind");
		if (this.varbind && "" != this.varbind)
			this.varoperation = this.element.attr("variableoperation");
		var readonly = this.element.attr("widgetonlyread");
		readonly && readonly == "true"
				&& this.element.attr("disabled", "disabled");
		this.render();
	},

	bindData : function() {
		if (!this.bindName || !this.dataStore
				|| this.dataStore.getRowSet().isEmpty())
			return;

		this.bindRow = this.dataStore.getRowSet().getRow(0);
		this.currentValue = this.bindRow.getItemValue(this.bindName);
		if (!this.currentValue)
			this.currentValue = '';
		this.setValue(this.currentValue);
	},

	// 控件UI渲染，自定义控件需override该方法
	render : function() {
	},

	// 设置控件数据，自定义控件需override该方法
	setValue : function(value) {
		this.setDomValue();
	},

	// 根据当前currentValue值重新设置dom
	setDomValue : function() {

	},
	/**
	 * @summary 提交当前widget的值
	 */
	submitValue : function() {
		this.collectValue();
		if (this.bindRow)
			this.bindRow.setItemValue(this.bindName, this.currentValue);
	},

	// 返回控件数据，表单提交时调用。自定义控件需override该方法
	collectValue : function() {
		return this.currentValue;
	},

	/**
	 * @summary: 设置控件的样式
	 * @description： 使用错误的样式可能导致异常
	 * @param: {string} name
	 * @param: {string} value
	 * @example: | <div id="box" dojoType="unieap.form.TextBox"></div> | var
	 *           box = unieap.byId('box'); | box.setStyle('width','200px');
	 *           设置TextBox的宽度为"200px";
	 */
	setStyle : function(name, value) {
		element.css(name, value);
	},

	/**
	 * @summary: 设置控件是否隐藏
	 * @param: {boolean} bool
	 */
	setVisible : function(visible) {
		if (visible) {
			element.css("position", "relative");
			element.css("visibility", "visible");
		} else {
			element.css("postion", "absolute");
			element.css("visibility", "hidden");
		}
	},
	/**
	 * @summary: 设置控件是否显示
	 * @description: 设置display属性为block时,显示控件，当display为none时，则不显示控件
	 * @param: {boolean} bool
	 */
	setDisplay : function(display) {
		element.css("display", display);
	},
	//获得父容器
	getParent:function(){
		var parentWidget;
		this.element.parents("[dojotype='unieap.form.Form']").each(function(){
			parentWidget=$(this).data("FormWidget");
		});
		return parentWidget;
	}
};