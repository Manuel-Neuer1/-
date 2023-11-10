dojo.provide("unieap.form.ComboBoxTree")
dojo.require("unieap.form.TextBoxWithIcon");
dojo.require("unieap.tree.Tree");
dojo.require("unieap.util.util");
dojo.declare("unieap.form.ComboBoxTree",unieap.form.TextBoxWithIcon,{
	/**
	 * @declaredClass:
	 * 		unieap.form.ComboBoxTree
	 * @superClass:
	 * 		unieap.form.TextBoxWithIcon
	 * @summary:
	 * 		ComboBoxTree控件又叫做下拉树控件。从外观上来看，它和ComboBox控件类似。
	 * 		但后者下拉的是列表，而前者是一棵树形结构。当用户需要展现带有层次结构的数据时，可以考虑使用下拉树控件
	 * @img:
	 * 		images/form/comboboxtree.png
	 * @example:
	 * |var ds=new unieap.ds.DataStore("menuTree",[
	 * |	{id:'1001',label:'人',parent:'',leaf:false},
	 * |	{id:'10011',label:'学生',parent:'1001',leaf:true},
	 * |	{id:'10013',label:'农民',parent:'1001',leaf:true},
	 * |	{id:'1002',label:'动物', parent:'',leaf:false},
	 * |	{id:'1003',label:'脊椎动物', parent:'1002',leaf:true}
	 * |
	 * |]);
	 * |dataCenter.addDataStore(ds);
	 * |var combotree=new unieap.form.ComboBoxTree({
	 * |	id:'combo_tree',
	 * |	popup:{width:'300px',height:'400px'},
	 * |	separator:',',
	 * |	treeJson:{
	 * |		label:'UniEAP',
	 * |		checkLogic:{model:'multiple'},
	 * |		binding:{
	 * |			leaf:'leaf',
	 * |			store:'menuTree',
	 * |			query:{
	 * |				name: 'parent',
	 * |				relation: '=',
	 * |				value:'1001'
	 * |			}
	 * |		}
	 * |	}
	 * |});
	 * 		上述的代码的popup表示设置弹出窗口的宽度和高度,treeJson其实就是树的属性。树怎么配置,treeJson就怎么配置
	 * @example:
	 * |<div dojoType="unieap.form.ComboBoxTree"  
	 * |	id='combo_tree',
	 * |	popup="{width:'300px',height:'400px'}",
	 * |	separator:",",
	 * |	treeJson="{label:'UniEAP',binding:{leaf:'leaf',store:'menuTree',query:{name:'parent',relation:'=',value:'1001'}}}">
	 * |</div>
	 * |		
	 * 上述代码展示了标签配置ComboBoxTree的方式
	 */
	
	//配置属性接口
	UserInterfaces : dojo.mixin({
		dataProvider : "object",
		separator : "string",
		expandTree : "boolean",
		treeJson : "object",
		getValuePath:"function"
	},
	unieap.form.TextBoxWithIcon.prototype.UserInterfaces),
	
	popupClass:"unieap.form.ComboBoxTreePopup",
	
	//树组件,通过treeJson生成
	_tree:null,
	
	//树的id列表,对应树的id,为一个数组,例如[1,2,3,...]
	_treeIdList:null,
	
	//树的label列表,对应树的label,为一个数组,和_treeIdList一一对应,例如["one","two","tree",...]
	_treeLabelList:null,
	
	//树的id名称
	_treeId:'id',
	
	//树的label名称
	_treeLabel:'label',
	
	//是否是复选树
	_isMultiTree:false,
	
	//树绑定的datastore,来置于binding属性
	_store:null,
	
	_flag:true,
	
	
	/**
	 * @summary:
	 * 		设置是否点击下拉按钮就根据树的id来展开树
	 * @type:
	 * 		{boolean}
	 * @default:
	 * 		true
	 */
	expandTree:true,
	
	
	/**
	 * @summary:
	 * 		动态创建一棵树，传入树的属性即可
	 * @type:
	 * 		{object}
	 * @example:
	 * |var ds=new unieap.ds.DataStore("treeDs",[
	 * |	{id:'1001',label:'人',parent:'',leaf:false},
	 * |	{id:'1002',label:'动物',parent:'',leaf:false},
 	 * |	{id:'10011',label:'学生',parent:'1001',leaf:true},
 	 * |	{id:'10012',label:'工人',parent:'1001',leaf:true},
 	 * |	{id:'10013',label:'软体动物',parent:'1002',leaf:true},
	 * |	{id:'10021',label:'脊椎动物',parent:'1002',leaf:true}
	 * |]);
	 * |dataCenter.addDataStore(ds);
	 * |<div dojoType="unieap.form.ComboBoxTree"  treeJson="{label:'UniEAP',binding:{leaf:'leaf',store:'treeDs'}}"></div>
	 */
	treeJson:null,
	
	//自动注入dataCenter
	Autowired : "dataCenter",
	
	/**
	 * @summary:
	 *		设置当树为多选时数据的分隔符
	 * @type:
	 * 		{string}
	 * @example:
	 * |<div dojoType="unieap.form.ComboBoxTree" separator="#"></div>
	 * |combo_tree.setValue("1#2#3");
	 * 		如果树找到了对应的label,会显示成"one#two#three"
	 * @default：
	 *		","
	 */
	separator: ",",
	
	
	/**
	 * @summary:
	 * 		数据提供对象
	 * @description:
	 * 		常用于数据绑定且树为懒加载的情况。
	 * 		由于控件初始化后会根据数据绑定传来的值(id)在输入域中显示该值(id)所对应的显示值(label);当树是懒加载时,数据未加载完毕,控件在树中找不到指定的id所对应的label,所以需要用户显示指定。
	 *   	dataProvider对象的getLazyLabel为一个回调函数,用于处理懒加载数据
	 *
	 * @type:
	 * 		{object}
	 * @example:
	 * |var ds=new unieap.ds.DataStore('demo',[
	 * |	{empNo:'1002'}
	 * |]);
	 * |dataCenter.addDataStore(ds);
	 * |function getLabels(ids){
	 * |	alert(ids); //ids默认是以逗号分隔的字符串
	 * |	var labels=sendRequest(ids); //用户将ids发送到后台
	 * |	return labels; //返回的labels也应该是以逗号分隔的字符串.返回成功后文本框中将显示labels
	 * |}
	 * |<div dojoType="unieap.form.Form" binding="{store:'demo'}">
	 * |	<div dojoType="unieap.form.ComboBoxTree" binding="{name:'empNo'} 
	 * |		dataProvider="{${1}getLazyLabel:getLabels}"  
	 * |		treeJson="{loader:{url:'/getChildren.do'},label:'LazyTree',binding:{leaf:'leaf'}}">
	 * |	</div>
	 * |</div>
	 * ${1}定义获取label的方法 
	 */
	dataProvider:null,
	
	
	
	/**
	 * @summary:
	 * 		为setValue方法提供节点路径
	 * @param:
	 * 		{string} 所要设置的value值
	 * @description:
	 * 		用于数据绑定且树为懒加载的情况。
	 * 		由于控件初始化后会根据数据绑定传来的值(id)在输入域中显示该值(id)所对应的显示值(label);当树是懒加载时,数据未加载完毕,控件在树中找不到指定的id所对应的label,所以需要用户显示指定。
	 *   	节点路径来获取label值
	 *
	 * @type:
	 * 		{object}
	 */
	getValuePath : function(nodeId){},
	
	postMixInProperties:function(){
		this.inherited(arguments);
		this._treeIdList=[]
		this._treeLabelList=[];
		this._connectHandles=[];
		this._getTreeInfo(this.treeJson);
	},
	
	postCreate:function(){
		dojo.addClass(this.iconNode, "u-form-combobox-icon-normal");
		var binding=this.getBinding(),
			dataProvider=this.getDataProvider();
		if(binding&&dataProvider&&dataProvider.label){
			this.connect(binding,"onBeforeBind",function(){
				this._flag=true;
			})
		}
		this.inherited(arguments);
	},
	
	
	/**
	 * @summary:
	 * 		获得下拉树控件下拉的树对象
	 * @return:
	 * 		unieap.tree.Tree
	 * @example:
	 * |var tree=unieap.byId('comboxTree').getTree();
	 * |alert(tree.declaredClass);
	 */
	getTree:function(){
		return this._tree;
	},
	
	/**
	 * @summary:
	 * 		获得数据提供对象
	 * @return:
	 * 		{unieap.form.ComboBoxTreeDataProvider|null}
	 * @example:
	 * |var dataProvider=unieap.byId('comboxTree').getDataProvider();
	 * |unieap.debug(dataProvider);
	 */
	getDataProvider:function(){
		return this.dataProvider && unieap.getModuleInstance(this,"dataProvider","unieap.form.ComboBoxTreeDataProvider");
	},


	/**
	 * @summary:
	 * 		重新设置treeJson属性,创建一棵新的树。
	 * @description:
	 * 		注意，调用该方法，原有的树将被销毁
	 * @param:
	 * 		{object} treeJson
	 * @example:
	 * |var treeJson={
	 * |	label:'新的根节点',
	 * |	binding:{leaf:'leaf',store:'newStore'}
	 * |}
	 * |var comboTree=unieap.byId('comboBoxTree');
	 * |comboTree.setTreeJson(treeJson);
	 */
	setTreeJson:function(treeJson){
		this._tree&&this._tree.destroy(); //销毁树
		this._tree=null;
		this.treeJson=treeJson;
		//清空树的id列表和label列表
		this._reset();
		//如果有弹出窗口则关闭
		if(this.getPopup()._isShowingNow) {
			this.getPopup().close();
		}
		//重新置this._isMultiTree为false,否则由复选树转为单选树时,this._isMultiTree属性
		//仍然为true
		this._isMultiTree=false;
		//获得树的id、label、store等属性
		this._getTreeInfo(treeJson);
		this._createJsonTree(treeJson);
	},
	

	
	/**
	 * @summary:
	 * 		设置树多选时的数据分隔符
	 * @param:
	 * 		{string} separator 要设置的分隔符
	 * @example:
	 * |var comboTree=unieap.byId('comboTree');
	 * |comboTree.setSeparator(',');
	 * 
	 */
	setSeparator: function(separator){
		this.separator = separator;
	},

    //value是以逗号分隔的字符串,比如"1,2,3",它需要查找到对应的label,例如"one、two、three"
	//并显示在输入域中
	setValue:function(value){
		var valueStr = value;
		this.treeJson&&this._createJsonTree(this.treeJson);
		if(value!=null&&value!=""&&typeof(value)!="undefined"){
			 value=value+"";
			 //去除重复的元素
			 value=unieap.array_unique(value.split(this.separator));
		}else{
			value=[];
		}
		
		//处理节点的选中的和取消
		if(this._isMultiTree && this._tree){
			this._processSelectedNode(value);
		}
		
		//清空_treeIdList、_treeLabelList
		this._reset();
		
		
		if(value.length>0){
			//首先查询binding(来自于treeJson)中的datastore,看能否找到id对应的label
			if(this._store){
				this._helper1(value);
			}
			
			//然后通过已经展开过的树的id来获得对应的domNode
			if(value.length!=this._treeIdList.length && this._tree){
				this._helper2(value);
			}
			
			//依然找不到,根据传入的节点的path寻找
			if(value.length!=this._treeIdList.length){
				var valuePath = this.getValuePath(valueStr);
				if(this.getValuePath && valuePath ){
					this.expandTree&&this._tree.expandNodeByPath(valuePath);
					this._helper2(value);
				}
			}
			
			//从用户自定义的回调函数或者label属性来查找
			if(value.length!=this._treeIdList.length){
				var dataProvider=this.getDataProvider();
				dataProvider&&this._getLazyLabel(dataProvider,value);
			}
			
			//依然找不到,在文本框中显示id
			if(value.length!=this._treeIdList.length){
				this._helper3(value);
			}
		}
		this.setText(this._treeLabelList.join(this.separator));
		this.fireDataChange();
	},
	
	

	
	/**
	 * @summary:
	 * 		获得控件的值,控件的值以seperator分开,例如"1,2,3"
	 * @return:
	 * 		{string}
	 * @example:
	 * |var comboBoxTree=unieap.byId('comboBoxTree');
	 * |var value=comboBoxTree.getValue();
	 * |alert(value);
	 */
	getValue:function(){
		return this._treeIdList.join(this.separator);
	},
	
	
	/**
	 * @summary:
	 * 		清空控件的值以及选中状态(如果是复选树)
	 * @example:
	 * |var comboBoxTree=unieap.byId('comboBoxTree');
	 * |comboBoxTree.clear();
	 */
	clear:function(){
		if(this._isMultiTree){
			var nodes=this._tree.getSelectedNodes();
			dojo.forEach(nodes,function(node){
				this._tree.setChecked(node,false);
			},this);
		}
		this._reset();
		this._updateRow("");
		this.fireDataChange();
	},
	
	///////////////////内部方法////////////////////////////
	
	//清空id、label等
	_reset:function(){
		this._treeIdList=[];
		this._treeLabelList=[];
		this.setText('');
	},
	
	//通过json字符串来创建树
	_createJsonTree:function(treeJson){
		if(this.getTree()) return;
		if(treeJson){
			this._tree = new unieap.tree.Tree(dojo.mixin(treeJson,{dataCenter:this.dataCenter}));
		}
		if (this._tree) {
			dojo.style(this._tree.domNode, "display", "none");
			this._connectEvents();
			this._tree.placeAt(this.getPopup().domNode,"first");
		}
	},
	
	//获得树的id、label、store、是否是复选树等属性
	_getTreeInfo:function(treeJson){
		var logic,binding;
		if(treeJson){
			logic=treeJson.checkLogic;
			binding=treeJson.binding;
		}
		if(logic&&logic.model){
			this._isMultiTree=true;
		}
		if(binding){
			this._treeId=binding.id||this._treeId;
			this._treeLabel=binding.label||this._treeLabel;
			this._store=binding.store;
		}
	},
	
	
	//处理节点的选中的和取消
	_processSelectedNode:function(value){
		var treeNode;
		var list=unieap.array_unique(this._treeIdList.concat(value));
		dojo.forEach(list,function(id){
			if(dojo.indexOf(value,id)==-1){
				treeNode=this._tree.getNodeById(id);
				treeNode&&treeNode.isChecked()&&this._tree.setChecked(treeNode,false);
				
			}else{
				treeNode=this._tree.getNodeById(id);
				treeNode&&!treeNode.isChecked()&&this._tree.setChecked(treeNode,true);
			}
		},this)
	},
	
	//首先从树绑定的datastore中找label
	_helper1:function(list){
		dojo.forEach(list,function(id){
			var label=unieap.transcode(id,{
				valueAttr:this._treeId,
				displayAttr:this._treeLabel,
				store:this._store
			}, this.dataCenter);
			if(label){
				this._treeIdList.push(id);
				this._treeLabelList.push(label);
			}
		},this);
	},
	
	//从已经展开的树节点中获取label
	_helper2:function(list){
		dojo.forEach(list,function(id){
			var index=dojo.indexOf(this._treeIdList,id);
			var treeNode=this._tree.getNodeById(id);
			if(index==-1&&treeNode){
				var label=treeNode.getLabel();
				this._treeIdList.push(id);
				this._treeLabelList.push(label);
			}
		},this);
	},
	
	//如果树是懒加载的
	_getLazyLabel:function(dataProvider,list){
		//dataProvider中getLazyLabel函数
		if(dataProvider.getLazyLabel&&dojo.isFunction(dataProvider.getLazyLabel)){
			var ids=[];
			dojo.forEach(list,function(id){
				dojo.indexOf(this._treeIdList,id)==-1&&ids.push(id);
			},this);
			
			var labels=dataProvider.getLazyLabel(ids.join(this.separator));
			if(labels&&labels.split(this.separator).length==ids.length){
				this._treeIdList=this._treeIdList.concat(ids);
				this._treeLabelList=this._treeLabelList.concat(labels);
			}
		}else if(dataProvider.label){  //deprecated,不建议使用
			//判断是谁调用了setValue方法,如果是控件本身,this._flag保存不变
			//如果用户调用了form.getBinding().setDataStore(),则this._flag重新变为true
			if(this._flag){
				var binding=this.getBinding(),
					row=binding&&binding.getRow();
				var item=row&&row.getItemValue(dataProvider.label);
				if(item&&item.split(this.separator).length==list.length){
					this._treeIdList=list;
					this._treeLabelList=item.split(this.separator);
				}
				this._flag=false;
			}
		}
	},
	
	
	//如果找不到id所对应的label,就假设id和label相同
	_helper3:function(list){
		dojo.forEach(list,function(id){
			var index=dojo.indexOf(this._treeIdList,id);
			if(index==-1){
				this._treeIdList.push(id);
				this._treeLabelList.push(id);
			}
		},this);
	},
	
	//根据树的id来展开树
	_expandTree:function(){
		this._tree&&this._treeIdList.length>0&&this._tree.showNodesById(this._treeIdList);
	},
	
	//用于树是懒加载的情况,假设一个store的一条row为:
	//[empNo:'1001',empName:'测试信息'],同时dataProvider为{label:'empNo'}
	//修改empNo的同时也得修改empName
	_updateRow:function(str){
		var dataProvider=this.getDataProvider();
		if(dataProvider&&dataProvider.label){
			var binding=this.getBinding();
			var row=binding&&binding.getRow();
			row&&row.setItemValue(dataProvider.label,str);
		}
	},
	
	
	
   ///////////////////内部事件/////////////////////////////
   
   //覆盖父类的_onChange方法,因为TextBoxWithIcon的onChange事件和Comboxtree的onChange是不一样的
   _onChange:function(){
   	
   },
   
	//对下拉控件中的树进行事件绑定
	_connectEvents:function(){
		this.handles = [];
		//复选树
		if(this._isMultiTree){
//			var logic = this._tree.getCheckLogic();
//			var x = logic['onChecked'];
//			if(dojo.isFunction(x) && unieap.fireEvent(logic,x,[]) == false)
//			{
//				return x;
//			}else{
//			}
			this.handles.push(dojo.connect(this._tree.getCheckLogic(),'onChecked',this,'_checkTree'));
			this.handles.push(dojo.connect(this._tree.getCheckLogic(),'onUnChecked',this,'_unCheckTree'));
			this.handles.push(dojo.connect(this._tree,'onAfterExpand',this,'_checkOrUnCheckTree'));
		}else{
			//单选树
			//setTimeout(function(){innerThis.connect(innerThis._tree, 'onClick', '_singleClick');},0);
			this.handles.push(dojo.connect(this._tree, 'onClick', this,'_singleClick'));
		}
		if (dojo.isWebKit) {
			this.handles.push(dojo.connect(this._tree, 'onMouseDown', this,'_onMouseDown'));
		}
	},
	destroy : function(){
		while(this.handles.length){
			dojo.disconnect(this.handles.pop());
		}
		this.inherited(arguments);
	},
	_onBlur: function(evt) {
		if (this._interestInBlur(evt)) {
			//this.inherited(arguments);
			this._inmousedown = false;
		}
		this.inherited(arguments);
	},
	_onMouseDown: function(node,evt) {
		var flag = unieap.fireEvent(this,this.onBeforeMouseDown,[node]);
        if (flag === false) {
            return;
        }
        if(!this._isMultiTree){
			this._singleClick(node,evt);
        }
		this._inmousedown = true;
	},
	//单选树点击事件
	_singleClick:function(node,evt){
		//如果当前节点是根节点,不操作_treeIdList和_treeLabelList
		if(!node.isRoot()){
			var info=node.getItem().data;
			var id=info[this._treeId];
			var label=info[this._treeLabel];
			if(this._treeIdList[0]!=id){
				this._treeIdList=[id];
				this._treeLabelList=[label];
				this.setText(label);
				//触发onChange事件
				this._updateRow(label);
				this.onChange(id,label);
				this.fireDataChange();
			}
		}
		if(dojo.isWebKit){//非webKit浏览器 没有evt 需要单独处理
			if(evt){		
				var domElement = evt.target;
				var treeDomNode = this._tree._getTreeDomNodeByEvent(evt); 
			}
			if (this.getPopup()._isShowingNow && evt && domElement != this._tree.getExpandoNode(treeDomNode)) {
				this.getPopup().close();
			}
		}else{
			if (this.getPopup()._isShowingNow) {
				this.getPopup().close();
			}
		}
		this.focus();
	},
	
	
	
	//复选树选中复选框事件
	_checkTree:function(node){
		if(!node.isRoot()){
			var info=node.getItem().data;
			var id=info[this._treeId];
			var label=info[this._treeLabel];
			//如果在列表中找不到节点对应的id
			if(dojo.indexOf(this._treeIdList,id)==-1){
				this._treeIdList.push(id);
				this._treeLabelList.push(label);
				this.setText(this._treeLabelList.join(this.separator));
				this._updateRow(this._treeLabelList.join(this.separator));
				this.onChange(id,label);
				this.fireDataChange();
			}
		}
		
	},
	
	//复选树清空复选框事件
	_unCheckTree:function(node){
		if(!node.isRoot()){
			var info=node.getItem().data;
			var id=info[this._treeId];
			var label=info[this._treeLabel];
			var index=dojo.indexOf(this._treeIdList,id);
			if(index>-1){
				this._treeIdList.splice(index,1);
				this._treeLabelList.splice(index,1);
				this.setText(this._treeLabelList.join(this.separator));
				this._updateRow(this._treeLabelList.join(this.separator));
				this.onChange(id,label);
				this.fireDataChange();
			}
		}
		
	},
	
	//Tree的onAfterExpand事件
	_checkOrUnCheckTree:function(node){ 
		var obj,isChecked,id,treeNode;
		var children=this._tree.getChildrenByDom(node.domNode);
		var treeJsonId = this.treeJson.binding.id;
		dojo.forEach(children,function(domNode){
			obj = domNode.associatedData;
			isChecked = obj.isChecked;
			id = obj.item.data[treeJsonId] || obj.item.data['id'];
			treeNode = this._tree.getNodeByDom(domNode);
			if(dojo.indexOf(this._treeIdList,id)>-1){
				!isChecked&&this._tree.setChecked(treeNode,true);
			}else{
				//树的id不在_treeIdList中并且节点处于选中状态,取消选选中
				isChecked&&this._tree.setChecked(treeNode,false);
			}
		},this);
		
	},
	
	//点击下拉箭头时触发,覆盖父类TextBoxWithIcon中的方法
	_onIconClick: function(evt){
		if(!(this.readOnly&&unieap.global.comboboxtree_notReadonlyPopup)&&!this.disabled&&this.onBeforeIconClick(evt)){
			this.treeJson&&this._createJsonTree(this.treeJson);
			if (this.getPopup()._isShowingNow) {
				this.getPopup().close();
			}
			else {
				this._tree&&dojo.style(this._tree.domNode,"display","block");
				this.expandTree&&this._expandTree();	
				this.getPopup().open();
			}
		unieap.fireEvent(this, this.onIconClick,[evt]);
		}
	},
	
	
	
	//点击输入域时触发
	_onClick:function(evt){
		if(!this.onBeforeClick()) return;
		if(!(this.readOnly&&unieap.global.comboboxtree_notReadonlyPopup)&&!this.disabled&&this.onBeforeIconClick(evt)){
			this.treeJson&&this._createJsonTree(this.treeJson);
			if (this.getPopup()._isShowingNow) {
				this.getPopup().close();
			}
			else {
				this._tree&&dojo.style(this._tree.domNode,"display","block");
				this.expandTree&&this._expandTree();	
				this.getPopup().open();
			}
		unieap.fireEvent(this, this.onClick,[evt]);
		}
	},
	

	//ie下的onkeypress不捕获BACKSPACE键,需要特殊处理
    _onKeyDown:function(evt){
	    if(dojo.isIE&&(evt.keyCode==8 || evt.keyCode==46)){
				this.clear();
		}
		this.inherited(arguments);
	},
	
	_onKeyPress:function(evt){
		var code=evt.keyCode;
		
		//如果是Tab键、回车键、左右方向箭头，则不执行dojo.stopEvent()方法
		if (dojo.indexOf([9,13,37,39],code)>-1) {
			return;
		}else if(code===8 || code===46){
			this.clear();
		}else if(evt.ctrlKey&&dojo.indexOf([65,67,97,99],evt.keyCode||evt.which)>-1){ 
			return;
		}
		dojo.stopEvent(evt);
	},
	
	onBeforeMouseDown: function(node){
    },
	destroy : function(){
		if(this._tree){
			this._tree.destroy();
		}
		this.inherited(arguments);
	}
	
});