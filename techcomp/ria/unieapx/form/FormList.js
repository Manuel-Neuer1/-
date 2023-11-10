dojo.provide("unieapx.form.FormList");
dojo.require("unieap.util.util");
dojo.require("unieap.form.Form");
dojo.declare("unieapx.form.FormList",[dijit._Widget,dijit._Templated],{

	/**
	 * @declaredClass:
	 * 		unieap.form.FormList  
	 * @summary:
	 * 		类似于Form控件,但是会根据其绑定的DataStore同时显示多个Form
	 * @example:
	 * |<div dojoType="unieap.form.FormList" binding="{store:'emp'}">
	 * |	<div dojoType="unieap.form.TextBox" binding="{name:'attr_empno'}"></div>
	 * |	<div dojoType="unieap.form.TextBox" binding="{name:'attr_ename'}"></div>
	 * |</div>
	 *
	 */

	/**
	 * @summary:
	 * 		设置控件绑定的dataStore
	 * @type:
	 * 		{unieap.form.FormListBinding}
	 * @example:
	 * |<div dojoType="unieap.form.FormList" binding="{store:'emp'}">
	 * |	<div dojoType="unieap.form.TextBox" binding="{name:'attr_empno'}"></div>
	 * |	<div dojoType="unieap.form.TextBox" binding="{name:'attr_ename'}"></div>
	 * |</div>
	 */
	binding:null,


	 /**
	  * @summary:
	  * 	设置FormList控件的宽度
	  * @description:
	  * 	FormList的宽度默认为浏览器的宽度
	  * @type:
	  * 	{string}
	  * @default:
	  * 	"auto"
	  */
	 width:'auto',

	 /**
	  * @summary:
	  * 	是否插入一空行
	  * @description:
	  * 	当formList绑定的数据集为空时是否加入一空行
	  * @type:
	  * 	{boolean}
	  * @default:
	  * 	"false"
	  */
	 insertBlankRow: false,

	 /**
	  * @summary:
	  * 	设置FormList控件的高度
	  * @description:
	  * 	FormList的高度随着其嵌套的控件的高度而增加
	  * @type:
	  * 	{string}
	  * @default:
	  * 	"auto"
	  */
	 height:'auto',
	 
	 count: 0,
	 
	 formListCount: 0,
	 
	 //自动注入dataCenter
	 Autowired : "dataCenter",
	
	 radioNameArray : [],
	 
	 tabIndexArray : [],
	/**
	 * @summary:
	 * 		是否增加提示信息“正在加载数据...”
	 * @type:
	 * 		{boolean}
	 * @default:
	 * 		 false
	 * @example:
	 * |<div dojoType="unieap.xgrid.Grid" showLoading="true">
	 * |	...
	 * |</div>
	 */
	showLoading:false,

	templateString: "<div >" +
						"<div class='content-loading'  style='display:none;position:relative' dojoAttachPoint='contentLoading'>" +
						"<div class='content-loading-text' dojoAttachPoint='contentText'></div>" +
						"</div>" +
						"<div dojoAttachPoint='containerNode' style='overflow:auto;' ></div>" +						
					 "</div>",	
	/**
	 * @summary:
	 * 		设置FormList控件的宽度
	 * @param:
	 * 		{string} width
	 * @example:
	 * |<script type="text/javascript">
	 * |	var formList=unieap.byId('formList');
	 * |	formList.setWidth("400px");
	 * |</script>
	 */
	setWidth:function(width){
		if(isNaN(width)){
			dojo.style(this.domNode,'width',parseInt(width,10)+"px");
		}else{
			dojo.style(this.domNode,'width',width);			
		}
	},

	/**
	 * @summary:
	 * 		设置FormList控件的高度
	 * @param:
	 * 		{string} height
	 * @example:
	 * |<script type="text/javascript">
	 * |	var formList=unieap.byId('formList');
	 * |	formList.setHeight("400px");
	 * |</script>
	 */
	setHeight:function(height){
		dojo.style(this.domNode,'height',parseInt(height,10)+"px");
	},

	/**
	 * @summary:
	 * 		获得节点所在的Form的索引
	 * @description:
	 * 		如果传入的节点不在Form中,返回-1
	 * @param:
	 * 		{domNode|dijit._Widget} node
	 * @return:
	 * 		{number}
	 * @example:
	 * |<div dojoType="unieap.form.FormList" binding="{store:'emp'}">
	 * |	<div dojoType="unieap.form.TextBox" binding="{name:'attr_empno'}"></div>
	 * |	<div dojoType="unieap.form.TextBox" binding="{name:'attr_ename'}"></div>
	 * |	<span onclick="getIndex(this)">获得绑定的索引号</span>
	 * |</div>
	 * |<script type="text/javascript">
	 * |	function getIndex(node){
	 * |		alert(unieap.byId('formList').getIndex(node));
	 * |	}
	 * |</script>
	 */
	getIndex:function(node){
		if(!node) return -1;
		var widget,parentWidget, _node;
		
		node instanceof dijit._Widget?(_node=node.domNode)&&(widget=node):
					(_node=node)&&(widget=dijit.byNode(_node));
		parentWidget = widget;
		while((parentWidget||0).declaredClass!='unieapx.form.FormList'&&_node.tagName!="BODY"){
			widget=dijit.byNode(_node);
			if(widget instanceof unieap.form.Form){
				return typeof(widget.rowIndex)=="undefined"?-1:widget.rowIndex;
			}else{
				_node=_node.parentNode;
				parentWidget = dijit.byNode(_node);
			}
		}
		return -1;
	},
	

	/**
	 * @summary:
	 * 		对FormList下的表单进行校验
	 * @param:
	 * 		{boolean} bool 是否自动弹出错误提示信息
	 * @return:
	 * 		{boolean}
	 */
	validate:function(bool){
		return !dojo.query(" > [widgetId]",this.containerNode).map(dijit.byNode).some(function(form){
			return form.validate(bool)==false;
		})
	},


    /**
     * @summary:
     * 		获得FormList的数据绑定模块
     * @return:
     * 		{unieap.form.FormListBinding}
     * @example:
     * |<script type="text/javascript">
     * |	var formList=unieap.byId('formList'),
     * |    	binding=formList.getBinding();
     * |</script>
     */
	getBinding: function() {
		return unieap.getModuleInstance(this,"binding","unieapx.form.FormListBinding");
	},


	/**
	 * @summary:
	 * 		获得FormList所有的Form控件
	 * @return :
	 * 		{array}
	 * @example:
	 * |<script type='text/javascript'>
	 * |	var forms=unieap.byId('formList').getForms();
	 * |	dojo.forEach(forms,function(form){
	 * |		alert(form.rowIndex);
	 * |	});
	 * |</script>
	 */
	getForms:function(){
		var arr=[];
		dojo.query(" > [widgetId]",this.containerNode).forEach(function(node){
			var widget=dijit.byNode(node);
			widget.declaredClass=='unieap.form.Form'&&arr.push(widget);
		});
		return arr;
	},

	/**
	 * @summary:
	 * 		通过索引号获得FormList指定的Form控件
	 * @return :
	 * 		{unieap.form.Form|null}
	 * @example:
	 * |<script type='text/javascript'>
	 * |	var form=unieap.byId('formList').getForm(0);
	 * |	unieap.debug(form);
	 * |</script>
	 */
	getForm:function(index){
		var forms=this.getForms();
		return forms[index]||null;
	},

	//不推荐使用
    _getFormChild:function(formIndex, childIndex){
    	var form = this.getForm(formIndex);
    	var arr=[];
    	dojo.query("[widgetId]", form.domNode).forEach(function(node){
    		var widget = dijit.byNode(node);
    		if(widget && widget.declaredClass != 'unieap.form.Form'){
    			arr.push(widget);
    		}
    	});
    	return arr[childIndex] || null;
    },

	postCreate:function(){
    	this.radioNameArray = [];
    	this.tabIndexArray = [];
    	this.count = 0;
		this.binding=this.getBinding();
		var self = this;
		//如果嵌套的Form控件有id或者jsId属性，删除id和jsId
		dojo.query("[dojoType]",this.containerNode).forEach(function(node){
			dojo.hasAttr(node,'id')&&dojo.removeAttr(node,'id');
			dojo.hasAttr(node,'jsId')&&dojo.removeAttr(node,'jsId');
			self.count++;
		});
		this.originNodeHTML=this.containerNode.innerHTML;
		if(this.width!="auto"){
			if(isNaN(this.width)){
				this.domNode.style.width = this.width;
			}else{
				this.domNode.style.width = parseInt(this.width,10)+"px";
			}
		}else{
			this.domNode.style.width = "100%";
		}
		
		if(this.showLoading){
			this.contentText.innerHTML = RIA_I18N.util.util.loading;
			dojo.style(this.contentLoading,'display','block');
		}
	},

	startup:function(){
		this._createForm();
	},
	
	_getDataStore:function(){
		return this.getBinding().store;
	},
	
	forceDestroy: function(){
		this.formListCount = -1;
	},
	
	_destroyFormWidget: function(){
		//清空ContainerNode下的节点
		dojo.query("[widgetId]",this.containerNode).map(dijit.byNode).forEach(function(widget){
			//防止销毁后执行FieldSet控件的startup方法
			widget._started=true;
			widget.destroy&&widget.destroy();
		});
		dojo.empty(this.containerNode);
	},

	//复制表单
	_createForm:function(){
		this._store=this._getDataStore();
		
		if(!this._store){
			if(this.insertBlankRow) {
				var rowSet = new unieap.ds.RowSet();
				rowSet.insertRow({}, 0);
				this._store = new unieap.ds.DataStore();
				this._store.setRowSet(rowSet);
			}else{
				this._destroyFormWidget();
				return;
			}
		}
		if(this._store.getRowSet().getRowCount()==0) {
			if(this.insertBlankRow){
				this._store.getRowSet().insertRow({}, 0);
			}else{
				this._destroyFormWidget();
				return;
			}
		}
		if(this.formListCount != this._store.getRowSet().getRowCount()){
			this.formListCount = this._store.getRowSet().getRowCount();
			//首先清空ContainerNode下的节点
			this._destroyFormWidget();
			var len=this._store.getRowSet().getRowCount(),
			str=[];
			var div = dojo.create('div');
			for(var i=0;i<len;i++){
				str.push("<div dojoType='unieap.form.Form'>");
				str.push(this.originNodeHTML);
				str.push("</div>");
				div.innerHTML= str.join("");
				this.containerNode.appendChild(div.childNodes[0]);
				str = [];
			}
			div = null;
			dojo.parser.parse(this.containerNode, {xhr:true, currentDataCenter:this.dataCenter || (unieap.Action.getViewContext(this) || window).dataCenter});
		}
		var self=this;
		if(this.showLoading)
		   dojo.style(this.contentLoading ,'display','none');
//		setTimeout(function(){
		//临时解决控件渲染后数据显示慢的问题
		self._bindData(self._store);
//		},0);
	},


	//数据绑定
	_bindData:function(store){
		var binding = this.getBinding();
		var self = this;
		dojo.query(" > [widgetId]",this.containerNode).map(dijit.byNode).forEach(function(form,index){
			form.rowIndex=index;
			form.getBinding().setDataStore(store,index);
			if(index == 0){
				dojo.query("input[type ='radio']", form.domNode).forEach(function(input){
					if(dojo.hasAttr(input,'name')){
						self.radioNameArray.push(dojo.attr(input, "name"));
					}
				});
				dojo.query("[tabIndex]", form.domNode).forEach(function(input){
					if(dojo.attr(input, "tabIndex") > 0){
						self.tabIndexArray.push(dojo.attr(input, "tabIndex"));
					}
				});
			}
			if(index > 0){
				binding.reNameRadio(form.domNode, self.radioNameArray, index);
				binding.reNameTabIndex(form.domNode, self.tabIndexArray, self.count, index);
			}
		});
	},   
	// 在添加和删除行后更新受影响的formIndex、radioName和tabIndex
	_upDateFormIndex : function(currIndex){
		var binding = this.getBinding();
		var self = this;
		dojo.query(" > [widgetId]",this.containerNode).map(dijit.byNode).forEach(function(form,index){
			form.rowIndex=index;
			if(index >= currIndex){
				binding.reNameRadio(form.domNode, self.radioNameArray, index);
				binding.reNameTabIndex(form.domNode, self.tabIndexArray, self.count, index);
			}
		});
	},
	
	//添加删除行后更新formListCount
	_upDateFormListCount : function(){
		this.formListCount = this._store.getRowSet().getRowCount();
	},
	
	//销毁处理操作
	destroy:function(){
		this.getBinding().destroy();
		this.inherited(arguments);
	}
})
