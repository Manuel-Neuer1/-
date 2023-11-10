if(!dojo._hasResource["unieap.form.Form"]){
dojo._hasResource["unieap.form.Form"] = true;
dojo.provide("unieap.form.Form");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("unieap.rpc");

dojo.declare("unieap.form.Form", [dijit._Widget, dijit._Templated], {
	
	/**
	 * @declaredClass:
	 * 		unieap.form.Form
	 * @summary:
	 * 		Form控件和HTML中的form标签类似，可以内嵌其他表单控件
	 * @example:
	 * |<form dojoType="unieap.form.Form" binding="{store:'prince_store',bindIndex:1}">
	 * |	<div dojoType="unieap.form.TextBox" binding="{name:'city'}"></div>
	 * |</form>
	 * 		上述代码表示普通表单的使用，并在表单控件上直接进行了数据绑定。
	 * @example:
	 * |var form=unieap.byId('form');
	 * |var ds=new unieap.ds.DataStore('demo',[{name:'jack',age:22}]);
	 * |var row=ds.getRowSet().getRow(0);
	 * |form.getBinding().bind(row);
	 * 		上述代码表示对表单控件进行动态的数据绑定。
	 * @example：
	 * |dojo.addOnLoad(function(){
	 * |	var row = ...;
	 * |	form.getBinding().bind(row);	
	 * |});
	 * 		推荐应用上述方式在页面加载完成后对表单控件进行动态数据绑定，
	 * 		此方式的页面载入性能优于表单控件上直接进行数据绑定的方式。
	 * @example:
	 * |<form dojoType="unieap.form.Form" enctype="multipart/form-data" method="post">
	 * |	<div dojoType="unieap.form.TextBox" name="name"></div>
	 * |    <div dojoType="unieap.form.DateTextBox" name="hiredate"></div>
	 * |	<div dojoType="unieap.form.FileInput" name="picture"></div>
	 * |</form>
	 * |function success(res,args){console.info(arguments);}
	 * |function error(res,args){console.info(arguments);}
	 * |var args={
	 * |	url:'/application/demo.jsp',
	 * |	load:success,${1} 
	 * |	error:error,${2} 
	 * |	timeout:2000,
	 * |	parameters:{dc:new unieap.ds.DataCenter().toJson()}
	 * |};
	 * |unieap.Action.upload(args);
	 * 		上述代码表示利用表单控件进行文件上传。
	 * 		注意：使用文件上传时,后台返回的数据必须是如下格式:
	 * 		<textarea>+json+</textarea>		例如 "<textarea>{name:'jack'}</textarea>"
	 * ${1}请求成功的回调方法
	 * ${2}请求失败的回调方法
	 * @img:
	 *      images/form/form.png
	 */
	
	templateString: "<form dojoAttachPoint='containerNode'></form>",
	
	
	/**
	 * @summary:
	 * 		数据绑定信息
	 * @type:
	 * 		{unieap.form.FormBinding}
	 * @example:
	 * |<div dojoType="unieap.form.Form" binding="{store:'storeName'}">
	 * |	<div dojoType="unieap.form.TextBox" binding="{name:'name'}" ></div>
	 * |</div>
	 * 默认绑定绑定DataStore中第一条row记录
	 * @example:
	 * |<div dojoType="unieap.form.Form" binding="{store:'demo',bindIndex:1}">
	 * |</div>
	 * 通过bindIndex绑定DataStore指定row记录
	 */
	binding: null,
	
	/**
	 * @summary:
	 * 		设置表单的MIME编码
	 * @description:
	 * 		当进行文件上传时,需要设置该属性为multipart/form-data
	 * @default:
	 * 		application/x-www-form-urlencoded
	 * 		
	 * @type:
	 * 		{string}
	 * @enum:
	 * 		{"application/x-www-form-urlencoded"|"multipart/form-data"}
	 * @example:
	 * |<div dojoType="unieap.form.Form" enctype="multipart/form-data">
	 * |	<div dojoType="unieap.form.FileInput"></div>
	 * |</div>
	 */
	enctype:"application/x-www-form-urlencoded",
	
	/**
	 * @summary:
	 * 		设置服务器地址
	 * @description:
	 * 		和<form action="server.jsp">中的action属性相同
	 * @type:
	 * 		{string}
	 */
	action:"",
	
	/**
	 * @summary:
	 * 		设置提交方式
	 * @description:
	 * 		和<form action="server.jsp" method="post">中的post属性相同
	 * @type:
	 * 		{string}
	 * @enum:
	 * 		{"get"|"post"}
	 */
	method:"post",
	
	//自动注入dataCenter
	Autowired : "dataCenter",
	
	/**
	 * @summary：
	 * 		获取表单下所有Form编辑组件
	 * @description：
	 * 		当控件是unieap.form.FormWidget的子类才返回
	 * @return：
	 * 		{array}
	 * @example:
	 * |var form=unieap.byId('form');
	 * |var children=form.getDescendants();
	 * |dojo.forEach(children,function(widget){
	 * |	unieap.debug(widget);
	 * |});
	 */
	getDescendants : function(){
		var descendants = this.inherited(arguments);
		for(var i = descendants.length-1;i>=0;i--){
			if(!(descendants[i] instanceof unieap.form.FormWidget)){
				descendants.splice(i,1);
			}
		}
		return descendants;
	},
	
	postCreate: function() {
		//文件上传时,ie和firefox不一样.ie不能直接操作enctype属性
		if(dojo.isIE<9){
			if(this.enctype){
				var encType = this.domNode.getAttributeNode("enctype");
				encType.value = this.enctype;
			}
			if(this.method){
				var method=this.domNode.getAttributeNode("method");
				method.value=this.method;
			}
		}else{
			this.enctype&&dojo.attr(this.domNode,"enctype",this.enctype);
			this.method&&dojo.attr(this.domNode,"method",this.method);
		}
		this.action&&dojo.attr(this.domNode,"action",this.action);

	},
	
	startup:function(){
		this.binding && this.binding.store && this._bindData();
		//如果是FF等设置Enter键换Tab的处理
		if(!dojo.isIE) { setTimeout(dojo.hitch(this,"_enter2Tab"),0); };
	},
	
    /**
     * @summary：
     * 		判断各表单控件的值是否已被修改
     * @description:
     * 		对于DataStore中的一条Row而言，它有很多字段。修改其中任何一个字段的值,isModified方法将返回false
     * @example:
     * |var form=unieap.byId('form');
     * |var isModified=form.isModified();
     * 		返回Form的修改状态
     * @return：
     * 		{boolean}
     * 		已修改返回true；没有修改则返回为false
     */
	isModified: function() {
		var binding = this.getBinding();
		return binding ? binding.getRow().isModified() : false;
	},
	
	/**
	 * @summary:
	 * 		清空Form控件下各表单控件的值.
	 * @description:
	 * 		如果Form控件绑定了数据源,调用本方法,Form控件下各表单控件左上角的红色三角将隐藏
	 * @example:
	 * |var form=unieap.byId('form');
	 * |form.clear();
	 */
	clear: function() {
		dojo.forEach(this.getDescendants(), function(widget) {
			if("unieap.form.FileInput" == widget.declaredClass){
				widget._clearInput();
			}else{
				widget.declaredClass == 'unieap.form.ComboBox' ? widget.setValue(null) : widget.setValue("");
			}
			if(widget.declaredClass == 'unieap.form.ComboBox' && widget.autoCompleter != null){
			    var ds = widget.getDataProvider().getDataStore();
			    if(ds){
				    ds = new unieap.ds.DataStore();
					widget.getDataProvider().setDataStore(ds);
			    }
			}
			widget.setModified(false);
			widget.getValidator()&&widget.getValidator().handleError(true);
		});
	},
	
	/**
	 * @summary:
	 * 		恢复绑定的初始值
	 * @description:
	 * 		将Form控件下各表单控件的值恢复到初次绑定DataStore时的值
	 * @example:
	 * |var form=unieap.byId('form');
	 * |form.reset();
	 */
	reset: function() {
		dojo.forEach(this.getDescendants(), function(widget) {
			widget.reset();
		});
	},
	
	/**
	 * @summary：
	 * 		对Form控件下的各个表单控件进行校验操作
	 * @description:
	 * 		当嵌套在Form内的每一个表单控件的检验方法都返回true时，该方法返回true
	 * 		如果参数errorPrompt为true,当校验不通过时会自动提示错误信息并将光标置于第一个校验不通过的文本框。
	 * @param:
	 * 		{boolean} errorPrompt 是否自动提示校验信息,不传入则从global.js中的unieap.widget.errorPrompt读取
	 * @return:
	 * 		{boolean}
	 * @example:
	 * |<script type="text/javascript">
	 * |	var form=unieap.byId('form');
	 * |	//没有传入参数errorPrompt,errorPrompt值为unieap.widget.errorPrompt
	 * |	var isValid=form.validate();
	 * |</script>
	 * @example:
	 * |<script type="text/javascript">
	 * |	var form=unieap.byId('form');
	 * |	var isValid=form.validate(false);
	 * |</script>
	 */
	validate: function(errorPrompt) {
		var b = true,_widget;
		this._inValidWidget=null;
		dojo.forEach(this.getDescendants(), function(widget) {
			var validator = widget.getValidator();
			if(validator && !validator.validate() && b) {
				_widget=this._inValidWidget=widget;
				b = false;
			}
		},this);
		
		if(typeof(errorPrompt)=="undefined"){
			errorPrompt=unieap.widget.errorPrompt;
		}
		
		errorPrompt?_widget&&MessageBox.alert({
			title:RIA_I18N.form.form.validateMsg,
			message:_widget.getValidator().getErrorMsg(),
			type:'warn',
			onComplete:function(){
				_widget.focus();
			}
		}):_widget&&_widget.focus&&_widget.focus();
		return b;
	},
	
	/**
	 * @summary:
	 * 		当Form主动校验不通过时,获得Form控件中第一个输入值不合法的控件
	 * @description:
	 * 		使用本方法时请确保调用了validate方法
	 * @return:
	 * 		{null||unieap.form.FormWidget}
	 * @example:
	 * |<script type="text/javascript">
	 * |	var form=unieap.byId('form');
	 * |	var isValid=form.validate(false);
	 * |	if(!isValid){
	 * |		var widget=form.getInvalidWidget();
	 * |		//获得控件的错误提示信息;
	 * |		alert(widget.getValidator().getErrorMsg());
	 * |		//光标置于输入不合法的文本框中
	 * |		widget.focus();
	 * |	}
	 * |</script>
	 */
	getInvalidWidget:function(){
		return this._inValidWidget;
	},
	
	/**
	 * @summary:
	 * 		强制刷新Form控件的数据绑定
	 * @description:
	 * 		相当于重新对Form控件进行了数据绑定，如果Form绑定的DataStore为空，则执行clear动作
	 * @example:
	 * |var form=unieap.byId('form');
	 * |form.refresh();
	 */
	refresh: function() {
		var binding = this.getBinding();
		binding&&binding.getRow()?binding.bind(binding.getRow()) : this.clear();
	},
	
	/**
	 * @summary:
	 * 		获得Form控件的辅助模块
	 * @description:
	 * 		该模块提供了一些方法来对Form控件进行操作
	 * @example:
	 * |var form=unieap.byId('form');
	 * |var helper=form.getHelper();
	 * @see:
	 * 		unieap.form.FormHelper
	 */
	getHelper: function() {
		dojo.require("unieap.form.FormHelper");
		return new unieap.form.FormHelper(this);
	},
	
	/**
	 * @summary:
	 * 		获得Form控件的数据绑定模块
	 * @description:
	 * 		该模块提供了一些方法来对绑定的DataStore进行操作
	 * @return:
	 * 		{unieap.form.FormBinding}
	 * @example:
	 * |var form=unieap.byId('form');
	 * |var binding=form.getBinding();
	 * @see:
	 * 		unieap.form.FormBinding
	 */
	getBinding: function() {
		return unieap.getModuleInstance(this,"binding","unieap.form.FormBinding");
	},
	
	
	
	/**
	 * @summary:
	 * 		实现Form 与 Grid 的绑定
	 * @description:
	 * 		实现Form 与 Grid 的绑定,当选中Grid中的某行，自动将选中的数据绑定到Form上。
	 * @param:
	 * 		{string} gridid
	 * 		需要与Form绑定的Grid的 id
	 * @example:
	 * |var form = unieap.byId('form');
	 * |	form.bindGrid('grid');
	 * 
	 */
	bindGrid:function(gridid){
		var target=unieap.byId((this._rootID||"")+gridid);
		if(!target){
			return ;
		}
		this.connect(target.getManager("SelectionManager"), 'onAfterSelect',function(){
			var datastore = target.getBinding().getDataStore();
			var row = target.getManager('SelectionManager').getSelectedRows()[0];
			if (row == null) {
				var index = grid.getRowManager().getCurrentRowIndex();
				if (index != null && index > 0) {
				
					row = datastore.getRowSet().getRow(index);
				}
			}
			if (row != null) {
				return this.getBinding().bind(row);
			}
		});
	},
	
	
	//数据绑定、自动获取codelist
	_bindData: function() {
		var binding = this.getBinding();
		binding.bind(binding.row);
	},
	
	destroy:function(){
		//form
		this.getBinding() && this.getBinding().unbind();
		this.inherited(arguments);
	},
	
	_enter2Tab: function() {
		dojo.forEach(this.getDescendants(),function(widget,index,widgets){
			//unieap.form.RadioButtonGroup 有fucosOffset属性
			widget.focusOffset && (index += widget.focusOffset);
			var nextFocusWidget = widgets[index+1];
			if(nextFocusWidget){
				!widget.nextFocusId&&widget.setNextFocusId(nextFocusWidget.id);
			}
			else{
				var node = this.domNode;
				while(node && !node.nextSibling){
					node=node.parentNode;
				}
				!node && (node = document.body);
				!node.id && (node.id="focus_"+unieap.getUnique());
				!widget.nextFocusId&&widget.setNextFocusId(node.id);					
			}
		});
	}	
});
}
