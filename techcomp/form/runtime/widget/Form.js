WebForm.widget("unieap.form.Form",WebForm.FormContainer,{

	//数据绑定 dataStores数组对象
	dataStores:null,
	enctype:"application/x-www-form-urlencoded",
	primaryKey:'',
	submitFlag:true,
	
	/**
	 * @summary:
	 * 		设置服务器地址
	 * @description:
	 * 		和<form action="server.jsp">中的action属性相同
	 * @type:
	 * 		{string}
	 */
	action:"/formParser",
	
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
	/**
	 * @summary
	 * 解析当前form对象绑定的数据源
	 */
	_create:function(){
		this.dataStores={};
		this.element.attr("method","post");
		this.element.attr("action",WEBAPP+this.action);
		this.id=this.element.attr("id");
		this.initDataCenter();
	},
	//根据当前form控件绑定的信息初始化dataCenter
	initDataCenter:function (){
		if(!dataCenter)
			dataCenter=new unieap.ds.DataCenter();
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
				var rowSet=dataStore.getRowSet();
				if(rowSet.isEmpty()){
					var rowset = new unieap.ds.RowSet([{}]);
					dataStore.setRowSet(rowset);
				}
				var rowSetName=dataStore.getRowSetName();
				this.dataStores[rowSetName]=dataStore;
				this.primaryKey=dataStore.getParameter("primarykey");
			}
		}
		
		//如果查询数据集中缺少当前form绑定的相关实体数据集，则创建一个，否则无法收集数据
		var dbs=this.element.attr("databind");
		if(!dbs||dbs=="")
			return;
		var dataBinds=dbs.split(",");
		for(var index in dataBinds){
			var dbName=dataBinds[index];
			var dataStore=this.dataStores[dbName];
			if(!dataStore){
				dataStore=new unieap.ds.DataStore(this.id+"&"+index,[{}]);//防止一个form元素中有多个实体没有数据集
				dataStore.setParameter("relatedcontrols",this.id);
				dataStore.setRowSetName(dbName);
				this.dataStores[dbName]=dataStore;
				dataCenter.addDataStore(dataStore);
			}
		}
		
	},
	
	/**
	 * 清空表单所有的元素值
	 */
	clear: function() {
		
	},
	
	/**
	 * 校验表单
	 */
	validate: function() {
		
	},
	/**
	 * @summary
	 * 绑定数据源
	 */
	bindData:function(){
		if(this.dataStores.length==0)
			return;
		 this.each(function(widget){
			 widget.bindData();
		 });
	},
	
	/**
	 * @summary
	 * 提交数据
	 */
	submitValue:function(){
		if(this.dataStores.length==0)
			return;
		 this.each(function(widget){
			 widget.submitValue();
			 this.submitFlag = this.submitFlag && widget.submitFlag;
			 widget.submitFlag= true;
		 });
	},
	
	
	/**
	 * 遍历子元素
	 */
	each:function(fun){
		var childRen=this.getChildren();
		 for(var i=0;i<childRen.length;i++){
			 var formWidget=childRen[i];
			 fun.call(this,formWidget);
		 }
	},
	/**
	 * 恢复原有值
	 */
	reset:function(){
		
	},
	
	//如果存在多个dataStore，返回第一个
	getDataStore:function(){
		this.submitValue();//每次获得数据前都搜集一次数据
		return this.dataStores;
	}
	
	
});
