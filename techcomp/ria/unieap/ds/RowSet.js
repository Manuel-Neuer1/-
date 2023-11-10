if(!dojo._hasResource["unieap.ds.RowSet"]){ 
	dojo._hasResource["unieap.ds.RowSet"] = true;
	dojo.require('unieap.util.util')
	dojo.provide("unieap.ds.RowSet");

	(function(){
		var __status = unieap.ds.Status;
		var __buffer = unieap.ds.Buffer;
		dojo.declare("unieap.ds.RowSet", null, {		
			/**
			 * @declaredClass:
	 		 * 		unieap.ds.RowSet
			 * @summary:
			 * 		RowSet是客户端数据的容器
			 * @classDescription:
			 * 		它类似于关系数据库的Table，而Table内的每行类似于RowSet的每一个Row对象。
			 * 		可以通过操作RowSet来实现客户端数据的排序、过滤、缓存、分页。
			 * 		RowSet为UI控件提供数据支持。
			 * 		在RowSet内部，有三个数组Buffer，一个是primary Buffer，存储新建、更新和未更新的数据行；
			 * 		一个是deleted Buffer，存储被删除的数据行；
			 * 		一个是filter Buffer，存储页面过滤（主要是查找满足条件的数据）后得到的结果（行）。
			 * @example:
			 * |	new unieap.ds.RowSet([
			 * |			{'key':'value','key1':'value1'},
			 * |			{'key':'value','key1':'value1'}
			 * |		]);
			 *		根据一组数据创建RowSet,默认加到主缓冲区中。
			 * @example:
			 * |	new unieap.ds.RowSet({
			 * |		'primary':[],
			 * |		'delete':[],
			 * |		'filter':[]});
			 *		根据多组数据创建RowSet,分别加到各自的缓冲区中。
			 * @img：
			 * 		images/ds/rowset1.png
			 */
			
			constructor : function(data){
				this["primary"] = [];
				this["delete"] = [];
				this["filter"] = [];
				this.initialCount=0;
				if(data){
					if(typeof data.length == "number"){
						this["primary"] = data;
						this.initialCount=data.length;
					}else {
						if(typeof data["primary"] != "undefined"){
							this["primary"] = data["primary"];
							this.initialCount+=data["primary"].length;
						}
						if(typeof data["delete"] != "undefined"){
							this["delete"] = data["delete"] ;
						}
						if(typeof data["filter"]!= "undefined"){
							this["filter"] = data["filter"];
						}
					}
				}
			},
			
			/**
			 * @summary：
			 * 		判断当前RowSet对象内数据是否被修改
			 * @description:
			 * 		遍历所有的数据直到发现有修改状态的数据
			 * @return：
			 * 		{boolean}
			 * @example:
			 * | 		var rowset = new unieap.ds.RowSet([
			 * |	                ${1} {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001",_s:true},  
			 * |	                ${2} {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800",_t:3}, 
			 * |	                ${3} {attr_empno:"1002",NAME:"张韶涵",attr_job:"singer",attr_sal:"9500",_t:1}     
			 * |		]);
			 * |		alert(rowset.isModified());  
			 * ${1}状态位_t=2或没有，表示该row没有变化
			 * ${2}状态位_t=3,表示该row被修改过
			 * ${3}状态位_t=1,表示该row为新增
			 */
			isModified : function(){
				//遍历DELETE
				var modified= this.some(function(row){
						var status = row.getRowStatus();
						return ((status != __status.NEWMODIFIED)) ;
					},null, null, __buffer.DELETE);
				//遍历PRIMARY
				(!modified)&&(modified=this.some(function(row){
							var status = row.getRowStatus();
							return status && status!= __status.NOTMODIFIED ;
						},null, null, __buffer.PRIMARY));
				//遍历FILTER		
				(!modified)&&(modified=this.some(function(row){
							var status = row.getRowStatus();
							return status && status!= __status.NOTMODIFIED ;
						},null, null, __buffer.FILTER))
				return modified;
			},
			
			/**
			 * @summary：
			 * 		提取RowSet对象内部数据
			 * @description：
			 * 		包括主缓冲区、过滤缓冲区和删除缓冲区数据的对象
			 * @return 
			 * 		{object} 
			 * @example:
			 * 	|	var rowset = new unieap.ds.RowSet([
			 *  |	                {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001",_s:true},  
			 *  |	                {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800",_t:3}, 
			 *  |	                {attr_empno:"1002",NAME:"张韶涵",attr_job:"singer",attr_sal:"9500",_t:1}     
			 *  |	]);
			 *  |	unieap.debug(rowset.toData());
			 */
			toData: function() {
				var data = {};
				data["primary"] = this["primary"];
				data["delete"] = this["delete"];
				data["filter"] = this["filter"];
				return data;
			},
			
			/**
			 * @summary:
			 * 		提取RowSet数据为json格式
			 * @return：
			 * 		{string}
			 * @example：
			 *  |	var rowset = new unieap.ds.RowSet([
			 *  |	                {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001",_s:true},  
			 *  |	                {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800",_t:3}, 
			 *  |	                {attr_empno:"1002",NAME:"张韶涵",attr_job:"singer",attr_sal:"9500",_t:1}     
			 *  |	]);
			 *  |	alert(rowset.toJson());
			 */
			toJson : function(){
				var result = [];
				result.push("{");
				result.push("\"primary\":".concat(this.toBufJson(__buffer.PRIMARY)));
				result.push(",");
				result.push("\"filter\":".concat(this.toBufJson(__buffer.FILTER)));
				result.push(",");
				result.push("\"delete\":".concat(this.toBufJson(__buffer.DELETE)));
				result.push("}");
				return result.join("");
			},
			
			/**
			 * @summary:
			 * 		提取RowSet中的某个缓冲区json格式数据
			 * @example:
			 * |	${1}var name=unieap.ds.Buffer.PRIMARY;
			 * |	var rowset = new unieap.ds.RowSet([
			 * |	                {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001",_s:true},  
			 * |	                {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800",_t:3}, 
			 * |	                {attr_empno:"1002",NAME:"张韶涵",attr_job:"singer",attr_sal:"9500",_t:1}     
			 * |	]);
			 * |	rowset.toBufJson(name);
			 * 		${1}取得主缓冲区的json格式string对象		
			 * @param
			 * 		{string} name
			 * 		缓冲区名称
			 * @return:
			 * 		{string}
			 * 		json格式数据
			 */
			toBufJson : function(name){	
				var buf = this._getBuff(name),result = [],item,value;
				for(var i=0,_o,data,key,record;(data=buf[i]);i++){
					_o=data["_o"];
					delete data["_o"];
					record = [];					
					for(key in data){
//						if(key == "_styles" || key == "identifierNO") continue;
						item = [];		
						item.push("\"")	;	
						item.push(key);
						item.push("\"")	;
						item.push(":");
						value = data[key];
						if(dojo.isString(value)){
							item.push(dojo._escapeString(value));
						}
						else{
							//value 为[object Object]或者[object Object]	
							if(/\[object [oO]bject\]/.test(value)){
								item=[];
							}else{
								item.push(value==null?"null":value);	
							}		
												
						}					
						item.length>0&&record.push(item.join(""));
					}				
					if(_o){
						data["_o"]  = _o;
						var dd = [];
						for(key in _o){
							item = [];		
							item.push("\"");	
							item.push(key);
							item.push("\"")	;
							item.push(":");
							value = _o[key];
							if(dojo.isString(value)){
								item.push(dojo._escapeString(value));
							}
							else{						
								item.push(value==null?"null":value);						
							}						
							dd.push(item.join(""));	
						}
						item = [];		
						item.push("_o : {");
						item.push(dd.join(","));
						item.push("}");
						record.push(item.join(""));
					}
					item = [];
					item.push("{");
					item.push(record.join(","));
					item.push("}");		
					result.push(item.join(""));		
				}
				return "[".concat(result.join(",")).concat("]");	
			},
			
			/**
			 * @summary：
			 * 		取得当前RowSet对象内某个缓冲区的数据
			 * @example：
		     * |	var rowset = new unieap.ds.RowSet([
			 * |					{attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001"},
			 * |					{attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800"},
			 * |					{attr_empno:"1002",NAME:"张韶涵",attr_job:"singer",attr_sal:"9500"}
		     * |	]);
			 * |		
		     * |	${1}var name=unieap.ds.Buffer.PRIMARY; 
		     * |	unieap.debug(rowset.getData(name));
			 *	${1}取得主缓冲区的数据对象
			 * @param：
			 * 		{number} bufferName 
			 * 		可选项，默认为主缓冲区
			 * @return：
			 * 		{array}
			 * 		指定缓冲区的数据
			 */
			getData: function(bufferName) {
				return this._getBuff(bufferName);
			},
					
			/**
			 * @summary：
			 * 		取当前RowSet对象的某缓冲区的行数
			 * @param：
			 * 		{number}  bufferName
			 * 		可选项，某缓冲区，默认为主缓冲区。0:PRIMARY；1：FILTER；2:DELETE
			 * @return：
			 * 		{number} 
			 * 		某缓冲区内的Row对象个数，即行数
			 * @example:
			 * |	var rowset = new unieap.ds.RowSet([
			 * |	                {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001",_s:true},  
			 * |	                {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800",_t:3}, 
			 * |	                {attr_empno:"1002",NAME:"张韶涵",attr_job:"singer",attr_sal:"9500",_t:1}     
			 * |	]);
			 * |	var count=rowset.getRowCount(0);
			 * |	alert(count);
			 */
			getRowCount : function(bufferName){
				var buff = this._getBuff(bufferName); 
				return buff.length;
			},
			
			/**
			 * @summary:
			 * 		取RowSet所有数据的总行数
			 * @return 
			 * 		{number}
			 * 		取得当前RowSet对象所有缓冲区内Row对象的总行数
			 * @example:
			 * 	|	var rowset = new unieap.ds.RowSet({'primary':[
			 *  |	                {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001",_s:true},  
			 *  |	                {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800",_t:3}, 
			 *  |	                {attr_empno:"1002",NAME:"张韶涵",attr_job:"singer",attr_sal:"9500",_t:1}     
			 *  |	],'delete':[{attr_empno:"1003",NAME:"牛牛",attr_job:"演员",attr_sal:"104"}]});
			 * 	|	alert(rowset.getTotalCount());
			 */
			getTotalCount : function()
			{
				return (this["primary"].length + this["filter"].length + this["delete"].length);
			},
			
			/**
			 * @summary:
			 * 		获取初始行数
			 * @description:
			 * 		获取主缓冲区和过滤缓冲区的初始行数
			 * @return：
			 * 		{number}
			 * @example:
			 *  |	var rowset = new unieap.ds.RowSet({'primary':[
			 *  |	                {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001",_s:true},  
			 *  |	                {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800",_t:3}, 
			 *  |	                {attr_empno:"1002",NAME:"张韶涵",attr_job:"singer",attr_sal:"9500",_t:1}     
			 *  |	],'delete':[{attr_empno:"1003",NAME:"牛牛",attr_job:"演员",attr_sal:"104"}]});
			 *  |	alert(rowset.getInitialCount());
			 */
			getInitialCount:function(){
				return this.initialCount;
			},
			
			/**
			 * @summary:
			 *  	重新设置初始行数
			 * @description: 
			 * 		重新设置主缓冲区和过滤缓冲区的初始行数,初始行数为主缓冲区和过滤缓冲区的行数
			 * @return:
			 * 		{number}
			 * @example:
			 *  |	var rowset = new unieap.ds.RowSet({'primary':[
			 *  |	                {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001",_s:true},  
			 *  |	                {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800",_t:3}, 
			 *  |	                {attr_empno:"1002",NAME:"张韶涵",attr_job:"singer",attr_sal:"9500",_t:1}     
			 *  |	],'filter':[{attr_empno:"1003",NAME:"牛牛",attr_job:"演员",attr_sal:"104"}]});
			 *  |	rowset.resetInitialCount(); 
			 *  |	unieap.debug(rowset);
			 */
			resetInitialCount:function(){
				var nowcount=this.getRowCount(__buffer.FILTER)+this.getRowCount();
				if(this._dataStore){
					this._dataStore.recordCount+=nowcount-this.initialCount;
				}
				this.initialCount=nowcount;
			},
			
			/**
			 * @summary：
			 * 		判断是否为空的RowSet
			 * @description：
			 * 		空的RowSet代表主缓冲区,过滤缓冲区,删除缓冲区内均没有数据
			 * @return
			 * 		{boolean} 
			 * @example:
			 * |	${1}var rowset1 = new unieap.ds.RowSet([]);    
			 * |	${2}alert(rowset1.isEmpty()); 
			 * ${1}  定义一个空的RowSet
			 * ${2}  本例返回true
			 */
			isEmpty: function() {
				return 0 == this.getTotalCount();
			},
			
			/**
			 * @summary:
			 * 		清除RowSet内所有数据
			 * @description:
			 * 		三个缓冲区数组清零,调用后，isEmpty() 返回true
			 * @example:
			 * | 	var rowset = new unieap.ds.RowSet([
			 * |	                 {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001"},                
			 * |                	 {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800"}, 
			 * |	                 {attr_empno:"1002",NAME:"张韶涵",attr_job:"singer",attr_sal:"9500"}   
			 * |	]);
			 * |	unieap.debug(rowset);
			 * |	rowset.reset();
			 * |	unieap.debug(rowset);
			 */
			reset : function(){
				this["primary"] = [];
				this["filter"] = [];
				this["delete"] = [];
				this.applyEvent("onAfterDeleteAllRows",[this]);
			},
			
			/**
			 * @summary:
			 * 		清除更新标志。
			 * 		row中的resetUpdate方法不支持状态更新，可用RowSet中的resetUpdate(rowIndex)替代，即传入row的index
			 * @description:
			 * 		清除删除缓冲区的数据,清除主缓冲区和过滤缓冲区的更新标志
			 * @example：
			 * |	rowset.resetUpdate(1);
			 * 		清除index为1的数据的更新标识
			 * @example：
			 * |	var rowset = new unieap.ds.RowSet([
		 	 * |			                 {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001"},                
			 * |			                 {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800"}, 
			 * |			                 {attr_empno:"1002",NAME:"张韶涵",attr_job:"singer",attr_sal:"9500"}   
			 * |	]);
			 * |	rowset.setItemValue(0,"NAME","茜茜公主");
			 * |	rowset.deleteRow(2);
			 * |	unieap.debug(rowset);
			 * |	${1}rowset.resetUpdate();  
			 * |	unieap.debug(rowset);
			 * |	或
			 * |	${2}rowset.resetUpdate(0);     
			 * ${1}会清除删除缓冲区的数据,清除主缓冲区和过滤缓冲区的更新标志
			 * ${2}清除主缓冲区内，行索引为0的row对象的更新标志
			 */
			resetUpdate : function(rowIndex){
				if(rowIndex!=null){
					this.getRow(rowIndex).resetUpdate();
					this.applyEvent("onResetUpdate",[rowIndex]);
					return;
				}			
				this["delete"] = [];
				var buff = this["primary"];
				for(var i=0, l =buff.length; i<l; i++){
					 var row=new unieap.ds.Row(this,buff[i]);
					 row.resetUpdate();
					//_rf._resetUpdate(buff[i]);
				}
				buff = this["filter"]; 
				for(var i=0, l =buff.length; i<l; i++){
					var row=new unieap.ds.Row(this,buff[i]);
					row.resetUpdate();
					//_rf._resetUpdate(buff[i]);
				}
				this.resetInitialCount();
				this.applyEvent("onResetUpdate",[]);
			},
			

			/**
			 * @summary:
			 * 		把数据恢复成原始值
			 * @description:
			 * 		恢复所有数据,删除新增的数据,恢复修改过滤的数据
			 * @example:
    		 * |	var rowset = new unieap.ds.RowSet([
			 * |		               {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001"},        
			 * |		               {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800"},   
			 * |		               {attr_empno:"1002",NAME:"张韶涵",attr_job:"歌星",attr_sal:"9500"}           
			 * |	]);
			 * |	//===================================删除=============================================
			 * |	${1}rowset.deleteRows([0,2]);     
			 * |	${2}rowset.discardUpdate()；      
			 * |	//===================================修改=============================================
			 * |	${3}var row = rowset.getRow(0);     
			 * |	${4}row.setItemValue("NAME","郭靖");  
			 * |	${5}rowset.discardUpdate(0)；
			 * |	或
			 * |	${6}rowset.discardUpdate();   
			 * |		
			 * |	//================================新增=============================================
			 * |	rowset.addRow({attr_empno:"1004",NAME:"Jack",attr_job:"演员"});
			 * |	${7}rowset.discardUpdate();   
 			 * |
 			 * ${1}删除行索引为0和2的行
 			 * ${2}对于删除的数据，可不配置参数，即恢复所有数据
 			 * ${3}获得索引行为0的Row对象
 			 * ${4}修改row的NAME值
 			 * ${5}对于已经修改的RowSet对象，可以指定恢复哪一行的数据，参数为行索引
 			 * ${6}如果想恢复全部被修改的数据，可不配置参数
 			 * ${7}对于新增的数据，使用该方法，会把该条数据从缓冲区删除，恢复原来的状态
			 * @param 
			 * 		{number} rowIndex
			 */
			discardUpdate : function(rowIndex){
				if(this.applyEvent("onBeforeDiscardUpdate",typeof(rowIndex)!='undefined'?[rowIndex]:[]) == false) return;
				if(rowIndex!=null){
					this.getRow(rowIndex).discardUpdate();
					return;
				}			
				Array.prototype.push.apply(this["primary"],this["filter"].splice(0,this["filter"].length));
				Array.prototype.push.apply(this["primary"],this["delete"].splice(0,this["delete"].length));
				//this._dataStore.recordCount+=this["delete"].length;
				for(var i =0;i<this["primary"].length;i++){
					if(this["primary"][i]._t==__status.DATAMODIFIED){
						var orig = this["primary"][i]._o;
						for(var p in orig){
							 this["primary"][i][p] = orig[p];
						}
						delete this["primary"][i]._t;
						delete this["primary"][i]._o;
					}
					else if(this["primary"][i]._t==__status.NEWMODIFIED){
						this["primary"].splice(i,1);
						//this._dataStore.recordCount--;
						i--;
					}
				}
				this.applyEvent("onAfterDiscardUpdate",[]);	
			},
			
			/**
			 * @summary:
			 * 		增加一行数据
			 * @example:
			 * |	${1}var rowset = new unieap.ds.RowSet([
			 * |					{attr_empno:"1000",NAME:"Rose",attr_job:"演员"},
			 * |					{attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监"},
			 * |					{attr_empno:"1002",NAME:"张韶涵",attr_job:"歌星"}
			 * |	]);
			 * |	var data = {attr_empno:"1003",NAME:"张柏芝",attr_job:"演员"};
			 * |	rowset.addRow(data);
			 * |	或
			 * |	rowset.addRow(data,false,false);
			 * ${1}新建一个RowSet
			 * @param 
			 * 		{object} data 
			 * 		被增加的行数据
			 * @param 
			 * 		{boolean} clone 
			 * 		是否通过clone方式，因为data数据内可能有状态信息，如“是否被选择”、“是否是修改状态”等
			 * @param 
			 * 		{boolean} keepStatus 
			 * 		是否保留data的状态信息，如果不保留，则为新数据，即状态为NEWMODIFIED。
			 * @return 
			 * 		{unieap.ds.Row} 
			 * 		被添加的Row对象
			 */
			addRow : function (data, clone, keepStatus,setDefValue){	
				if(this.applyEvent("onBeforeAddRow",arguments)==false) return;
				data = this._buildRow(data,clone,keepStatus,setDefValue);
				var newRowIndex = this["primary"].length;
				this["primary"].push(data);	
				var row = new unieap.ds.Row(this, data, newRowIndex);
				if(keepStatus != true){
					row.setRowStatus(__status.NEWMODIFIED);
				}
			    this.applyEvent("onAfterAddRow",[row,this]);
				return row;
			},
			
			/**
			 * @summary:
			 * 		添加多行数据
			 * @param 
			 * 		{array} data 
			 * 		数据对象的数组
			 * @example:
			 * |	${1}var rowset = new unieap.ds.RowSet([]);
			 * |	var datas=[]
			 * |	for(var i=0;i<10;i++){
			 * |	    datas.push({attr_empno:"100"+i,NAME:"name_"+i,attr_job:"演员_"+i});
			 * |	}
			 * |	rowset.addRows(datas);
			 * ${1}新建一个空的RowSet对象
			 */
			addRows : function(data,setDefValue,isNotNewModified){
				if(this.applyEvent("onBeforeAddRows",arguments) == false) return;
				if(!data) data = [];
				if(!(typeof data == "array" || data instanceof Array)) data = [data];
				for(var i=0;i<data.length;i++){
					data[i]=this._buildRow(data[i],null,null,setDefValue);
					var row=new unieap.ds.Row(this,data[i]);
					if(!isNotNewModified)
						row.setRowStatus(__status.NEWMODIFIED);
					this["primary"].push(data[i]);
				 }
				 this.applyEvent("onAfterAddRows",[data,this]);
			},
			
			/**
			 * @summary:
			 * 		插入一行数据
			 * @param: 
			 * 		{object} data 
			 * 		被增加的行数据
			 * @param 
			 * 		{number} rowIndex 
			 * 		被增加行所在的索引位置,默认为最后一条
			 * @param 
			 * 		{boolean} clone 
			 * 		是否通过clone方式，因为data数据内可能有状态信息，如“是否被选择”、“是否是修改状态”等
			 * @param 
			 * 		{boolean} keepStatus
			 * 		 是否保留data的状态信息，如果不保留，则为新数据，即状态为NEWMODIFIED。
			 * @return 
			 * 		{unieap.ds.Row} 
			 * 		被插入的Row对象
			 * @example:
			 * |	var rowset = new unieap.ds.RowSet([
		 	 * |			                 {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001"},                
			 * |			                 {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800"}, 
			 * |			                 {attr_empno:"1002",NAME:"张韶涵",attr_job:"singer",attr_sal:"9500"}   
			 * |	]);
			 * | 	var data = {attr_empno:"1003",NAME:"杨康",attr_job:"木匠",attr_sal:"888"};
			 * |	rowset.insertRow(data,2);
			 * |	或
			 * |	rowset.insertRow(data,2,false,false);
			 * |	unieap.debug(rowset);
			 */
			insertRow : function(data, rowIndex, clone,keepStatus,setDefValue){
				if(this.applyEvent("onBeforeAddRow",arguments)==false) return;
				var buff = this["primary"], row;
				if((rowIndex == null) || (rowIndex < 0)||(rowIndex > buff.length )){	
					rowIndex = buff.length;
				}
				data = this._buildRow(data,clone,keepStatus,setDefValue);
				buff.splice(rowIndex,0,data);
				row = new unieap.ds.Row(this, data, rowIndex);
				if(!keepStatus){
					row.setRowStatus(__status.NEWMODIFIED);
				}
				this.applyEvent("onAfterAddRow",[row,this]);
				return row;
			},
			
			/**
			 * @summary:
			 * 		删除指定行
			 * @param 
			 * 		{number} rowIndex 
			 * 		被删除行所在的索引
			 * @return 
			 * 		{unieap.ds.Row}  
			 * 		被删除的行对象，该对象在删除缓冲区
			 * @example:
			 * |	var rowset = new unieap.ds.RowSet([
		 	 * |			                 {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001"},                
			 * |			                 {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800"}, 
			 * |			                 {attr_empno:"1002",NAME:"张韶涵",attr_job:"singer",attr_sal:"9500"}   
			 * |	]);
			 * |	 ${1} rowset.deleteRow(0); 
			 * |	unieap.debug(rowset);
			 *${1}删除行索引为0的row
			 */
			deleteRow : function (rowIndex){
				if(this.applyEvent("onBeforeDeleteRow",arguments)==false) return ;
				var buff = this["primary"];
				if((rowIndex == null) || (rowIndex < 0)||(rowIndex >= buff.length )){	
					return false;
				}
				var rows = buff.splice(rowIndex, 1);
				var deleteindex=this["delete"].length;
				if(rows[0]._t!=1){
					//当不是新增的数据时,才放到删除区，否则直接删除
					this["delete"].push(rows[0]);
				}
				var row = new unieap.ds.Row(this, rows[0], deleteindex);
				/*触发"postDeleteRow"事件*/
				this.applyEvent("onAfterDeleteRow",[row,this]);
				return row;
			},
			
			/**
			 * @summary:
			 * 		批量删除行记录
			 * @param 
			 * 		{array} data
			 * 		 行下标，形如:[1,0,5,4,3];
			 * @example:
			 * |	var rowset = new unieap.ds.RowSet([
		 	 * |			                 {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001"},                
			 * |			                 {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800"}, 
			 * |			                 {attr_empno:"1002",NAME:"张韶涵",attr_job:"singer",attr_sal:"9500"}   
			 * |	]);
			 * |	${1} rowset.deleteRows([0,2]);
			 * |	unieap.debug(rowset);
			 * ${1}批量删除行索引为0和2的row 
			 */
			deleteRows : function (data){
				if(this.applyEvent("onBeforeDeleteRows",arguments)==false) return;
				data = dojo.clone(data).sort(function(a,b){
					return a-b;
				});
				for(var i=data.length-1;i>=0;i--){
					if(data[i]<0||data[i]>=this["primary"].length) continue;
					var rows = this["primary"].splice(data[i], 1);
					if(rows[0]._t!=1){
						//当不是新增的数据时,才放到删除区，否则直接删除
						this["delete"].push(rows[0]);
					}
				}
				this.applyEvent("onAfterDeleteRows",arguments);
			},
			
			/**
			 * @summary:
			 * 		删除所有缓冲区的所有行
			 * @description:
			 * 		包括过滤缓冲区
			 * @example:
			 * | 	var rowset = new unieap.ds.RowSet([
		 	 * |			                 {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001"},                
			 * |			                 {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800"}, 
			 * |			                 {attr_empno:"1002",NAME:"张韶涵",attr_job:"singer",attr_sal:"9500"}   
			 * |	]);
			 * | 	rowset.deleteAllRows();
			 * |	unieap.debug(rowset);
			 */
			deleteAllRows : function(){
				if(this.applyEvent("onBeforeDeleteAllRows",arguments)==false) return ;
				var _p = this["primary"].concat(this["filter"]);
				_p=dojo.filter(_p,function(row){
					return row._t != 1;
				})
				this["delete"] = this["delete"].concat(_p);
				this["primary"] = [];
				this["filter"] = [];
				//this._dataStore.recordCount=0;
				this.applyEvent("onAfterDeleteAllRows",[this]);
			},
			
			/**
			 * @summary：
			 * 		恢复某被删除的行
			 * @param 
			 * 		{number} rowIndex
			 * 		 被恢复的删除行所在的索引
			 * @return 
			 * 		{boolean} 
			 * 		true：恢复成功， false：恢复失败，如索引位置为负值或超出行记录数
			 * @example:
			 * |	var rowset = new unieap.ds.RowSet({'delete':[
			 * |	                 {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001"},                
			 * |	                 {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800"}, 
			 * |	                 {attr_empno:"1002",NAME:"张韶涵",attr_job:"singer",attr_sal:"9500"}   
			 * |	]});
			 * |	unieap.debug(rowset);
			 * |	rowset.unDeleteRow(1);
			 * |	unieap.debug(rowset);
			 */
			unDeleteRow : function(rowIndex)
			{
				var buff = this["delete"];
				if((rowIndex == null) || (rowIndex < 0)||(rowIndex >= buff.length )){	
					return false;
				}
				var rows = buff.splice(rowIndex,1);
				this["primary"].push(rows[0]);
				//this._dataStore.recordCount++;
				return true;
			},
			
			/**
			 * @summary：
			 * 		恢复所有被删除的行
			 * @description:
			 * 		删除缓冲区的数据恢复到主缓冲区中
			 * @example:
			 * |	var rowset = new unieap.ds.RowSet({'delete':[
			 * |	                 {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001"},                
			 * |	                 {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800"}, 
			 * |	                 {attr_empno:"1002",NAME:"张韶涵",attr_job:"singer",attr_sal:"9500"}   
			 * |	]});
			 * |	unieap.debug(rowset);
			 * |	rowset.unDeleteAll();
			 * |	unieap.debug(rowset);
			 */
			unDeleteAll : function()
			{
				var buff = this["delete"];
				var count = this.rowsMove(0, -1, __buffer.DELETE, this, -1, __buffer.PRIMARY);
				return count;
			},
			
			/**
			 * @summary：
			 * 		丢弃某缓冲区中的若干行数据
			 * @description:
			 * 		丢弃数据不是把数据放到删除缓冲区,而是直接删除
			 * @param 
			 * 		{number} startIndex
			 * 		 起始行索引
			 * @param 
			 * 		{number} endIndex
			 * 		 结束行索引
			 * @param 
			 * 		{number} bufferName
			 * 		 可选项，缓冲区名称，默认为主缓冲区
			 * @example:
			 * |	var rowset = new unieap.ds.RowSet({'primary':[
			 * |	                 {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001"},                
			 * |	                 {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800"}, 
			 * |	                 {attr_empno:"1002",NAME:"张韶涵",attr_job:"singer",attr_sal:"9500"}   
			 * |	]});
			 * | 	${1}rowset.rowsDiscard(0,2,unieap.ds.Buffer.PRIMRY); 
			 * |	unieap.debug(rowset);
			 *  ${1}丢弃主缓冲区中行索引为0至1的row对象  
			 */
			rowsDiscard : function(startIndex, endIndex, bufferName)
			{
				var buff = this._getBuff(bufferName);
				if((startIndex == null) || (startIndex < 0)||(startIndex >= buff.length ))
					startIndex = 0;
				if((endIndex == null) || (endIndex < 0)||(endIndex > buff.length ))
					endIndex = buff.length;
				var result = buff.splice(startIndex, endIndex - startIndex);	
				return result;
			},
			
	
			_rowsMove : function(startIndex, endIndex, fromBuffer, toRs, toIndex, toBuffer, isMove )
			{
				if(toRs == null){
					return 0;
				}
				var buff = this._getBuff(fromBuffer);
				var buff2 = toRs._getBuff(toBuffer);
		
				if((startIndex == null) || (startIndex < 0)||(startIndex >= buff.length ))
					startIndex = 0;
				if((endIndex == null) || (endIndex < 0)||(endIndex > buff.length ))
					endIndex = buff.length;
				var  count = endIndex - startIndex;
				if (count <=0){
					return 0;
				}
					
				var rows;
				if(isMove){
					rows = buff.splice(startIndex, count);
				}else{
					rows = buff.slice(startIndex, endIndex);
					//clone rows
					var rows2 = [] , row;
					for(var i=0, l= rows.length;i<l; i++){
						row = this._cloneRow(rows[i]);
						(new unieap.ds.Row(this,row)).setRowStatus(__status.NEWMODIFIED);
						rows2.push(row);
					}
					rows = rows2;
				}
				
				if((toIndex == null) || (toIndex < 0)||(toIndex >= buff2.length ))
						toIndex = buff2.length;
				
				var rows2 = buff2.splice(toIndex, buff2.length - toIndex);
							
				for(var i=0, l = rows.length; i<l; i++){
					buff2.push(rows[i]);
				}
				
				if(rows2.length > 0){
					for(var i=0, l = rows2.length; i<l; i++){
						buff2.push(rows2[i]);
					}
				}
//				buff2=buff2.concat(rows,rows2)
				return (count);
			},
			
			/**
			 * @summary：
			 * 		行拷贝
			 * @param:
			 * 		 {number} startIndex
			 * 		 源RowSet的起始行索引
			 * @param 
			 * 		{number} endIndex 
			 * 		源RowSet的结束行索引（不包含endIndex这行）
			 * @param 
			 * 		{number} fromBuffer 
			 * 		源RowSet的某缓冲区
			 * @param
			 * 		{unieap.ds.RowSet} toRs 
			 * 		目标RowSet
			 * @param
			 * 		{number} toIndex 
			 * 		目标缓冲区的索引
			 * @param
			 * 		{number} toBuffer 
			 * 		目标RowSet的目标缓冲区
			 * @example:
			 * |	var rowset = new unieap.ds.RowSet([
			 * |	                 {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001"},                
			 * |	                 {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800"}, 
			 * |	                 {attr_empno:"1002",NAME:"张韶涵",attr_job:"singer",attr_sal:"9500"}   
			 * |	]);
			 * |	
			 * |	var bufferName = unieap.ds.Buffer.PRIMRY;
			 * |	var bufferName1 = unieap.ds.Buffer.DELETE;
			 * |	${1}var rowset1 = new unieap.ds.RowSet([]);                                     
			 * |	${2}rowset.rowsCopy(0,1,bufferName,rowset1,0,bufferName1);                  
			 * |	unieap.debug(rowset1);
			 * ${1}  定义一个空的rowset
			 * ${2}  把rowset主缓冲中第0条row对象，拷贝到rowset1的delete缓冲区中
			 */
			rowsCopy: function(startIndex, endIndex, fromBuffer, toRs, toIndex, toBuffer ) {
				return this._rowsMove(startIndex, endIndex, fromBuffer, toRs, toIndex, toBuffer, false);
			},
			
			/**
			 * @summary:
			 * 		行移动
			 * @param:
			 * 		{number} startIndex 
			 * 		源RowSet的起始行索引
			 * @param
			 * 		{number} endIndex 
			 * 		源RowSet的结束行索引
			 * @param
			 * 		{number} fromBuffer 
			 * 		源RowSet的某缓冲区
			 * @param
			 * 		{unieap.ds.RowSet} toRs 
			 * 		目标RowSet
			 * @param
			 * 		{number} toIndex 
			 * 		目标缓冲区的索引
			 * @param
			 * 		{number} toBuffer 
			 * 		目标RowSet的目标缓冲区
			 * @example:
			 * |	${1}var rowset = new unieap.ds.RowSet([
			 * |	                 {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001"},                
			 * |	                 {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800"}, 
			 * |	                 {attr_empno:"1002",NAME:"张韶涵",attr_job:"singer",attr_sal:"9500"}   
		 	 * |	]);
			 * |	${2}var rowset1 = new unieap.ds.RowSet([]);               
			 * |	unieap.debug(rowset);
			 * |	${3}rowset.rowsMove(0,2,unieap.ds.Buffer.PRIMRY,rowset1,0,unieap.ds.Buffer.DELETE); 
			 * |	unieap.debug(rowset);
			 * |	unieap.debug(rowset1);
			 * ${1}源RowSet
			 * ${2}目标RowSet
			 * ${3} 把rowset主缓冲区中rowindex=0和1（不包括2）的记录移到rowset1的删除缓冲区中
			 */
			rowsMove : function(startIndex, endIndex, fromBuffer, toRs, toIndex, toBuffer )
			{
				return this._rowsMove(startIndex, endIndex, fromBuffer, toRs, toIndex, toBuffer, true);
			},
			
			/**
			 * @summary:
			 * 		设置行是否被选中状态
			 * @description:
			 * 		将若干行标识为select参数的状态
			 * @example:
			 * |	rowset.setSelectRows(true,0,3);
			 * 		选中前四条数据
			 * @param 
			 * 		{boolean} select 
			 * 		选择状态
			 * @param:
			 * 		{number} startIndex 
			 * 		开始行索引
			 * @param
			 * 		{number} endIndex 
			 * 		结束行索引
			 * @param
			 * 		{number} bufferName 
			 * 		可选项，默认为主缓冲区
			 * @example:
			 * |		var rowset = new unieap.ds.RowSet([
			 * |    				{attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001"},                
			 * |   					{attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800"}, 
			 * |					{attr_empno:"1002",NAME:"张韶涵",attr_job:"singer",attr_sal:"9500"}   
			 * |		]);
			 * |	${1}rowset.selectRows(true,0,2);
			 * |		unieap.debug(rowset);
			 * ${1}将第0、1行设为选中状态
			 */
			selectRows : function(select, startIndex, endIndex, bufferName ){
				select = select||false;
				this.forEach(
					function(row){
						row.setRowSelected(select)
					},
					startIndex, endIndex, bufferName
				);
			},
			
			/**
			 * @summary:
			 * 		取得某缓冲区的被选中行总数
			 * @description：
			 * 		遍历某缓冲区,返回选中行总数
			 * @param
			 * 		{number} bufferName 
			 * 		可选项，默认为主缓冲区
			 * @return
			 * 		{number} 
			 * 		被选中的行总数
			 * @example:
			 * |	var rowset = new unieap.ds.RowSet([
			 * |			${1}{attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001",_s:true},                   
			 * |			{attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800",_s:true},
			 * |			{attr_empno:"1002",NAME:"张韶涵",attr_job:"singer",attr_sal:"9500"}
			 * |	]);
			 * |	${2}var count = rowset.getSelectedCount("primary"); 
			 * ${1}_s=true,表示该行被选中     
			 * ${2}本例返回“2”       
			 */
			getSelectedCount : function(bufferName){
				var count = 0;
				this.forEach(
					function(row){
						if(row.isRowSelected()){
							count ++;
						}
					},
					null, null, bufferName
				);
				return count;
			},
			
			/**
			 * @summary:
			 * 		取得当前被选中的行的Row对象数组
			 * @param
			 * 		{string} bufferName
			 *		可选项，默认为主缓冲区
			 * @return
			 * 		{array} 
			 * 		被选中的行的Row对象数组
			 * @example:
			 * | 	var rowset = new unieap.ds.RowSet([
			 * |			${1}{attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001",_s:true},                   
			 * |			{attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800",_s:true},
			 * |			{attr_empno:"1002",NAME:"张韶涵",attr_job:"singer",attr_sal:"9500"}
			 * |	]);
		 	 * |	${2}unieap.debug(rowset.getSelectedRows(unieap.ds.BUFFER.PRIMARY));       
			 * |	或
			 * |	${3}unieap.debug(rowset.getSelectedRows()); 
			 * ${1}_s=true,表示该行被选中                    
			 * ${2}参数为缓冲区的名称
			 * ${3}如不配置参数，默认为主缓冲区
			 */
			getSelectedRows : function(bufferName){	
				var arr = [];
				this.forEach(function(row){
					if(row.isRowSelected()){
						arr.push(this.getRow(row.getIndex(),bufferName));
					}
				},null,null,bufferName,this);
				return arr;				
			},
			/**
			 * @summary:
			 * 		取得当前选中的行的行号对象数组
			 * @param:
			 * 		{string} bufferName
			 * 		 可选项，默认为主缓冲区
			 * @return 
			 * 		{array}
			 * 		 被选中的行的Row对象行号数组
			 * @example:
			 * |	var rowset = new unieap.ds.RowSet([
			 * |			${1}{attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001",_s:true},                 
			 * |			{attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800",_s:true},
			 * |			{attr_empno:"1002",NAME:"张韶涵",attr_job:"singer",attr_sal:"9500"}
			 * |	]);
			 * |	var indexs=rowset.getSelectedRowIndexs(unieap.ds.BUFFER.PRIMARY);
			 * |	alert(indexs);
			 * ${1} _s=true,表示该行被选中
			 */
			getSelectedRowIndexs : function(bufferName){	
				var arr = [];
				this.forEach(function(row){
					if(row.isRowSelected()){
						arr.push(row.getIndex());
					}
				},null,null,bufferName);
				return arr;				
			},
			
			/**
			 * @summary：
			 * 		取得当前未被选中的行的Row对象数组
			 * @param 
			 * 		{string} bufferName
			 * 		 可选项，默认为主缓冲区
			 * @return 
			 * 		{array} 
			 * 		被选中的行的Row对象数组
			 * @example:
			 * |	var rowset = new unieap.ds.RowSet([
			 * |		              {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001",_s:true},                     
			 * |		              ${1}{attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800",_s:false},   
			 * |		              {attr_empno:"1002",NAME:"张韶涵",attr_job:"singer",attr_sal:"9500"}
			 * |		]);
			 * |	${2}rowset.getUnSelectedRows(unieap.ds.BUFFER.PRIMARY);          
			 * |		或
			 * |	${3}rowset.getUnSelectedRows();    
			 *  ${1}_s=false或没有该标志位,表示该行未被选中               
			 *  ${2}参数为缓冲区的名称
			 *  ${3}如不配置参数，默认为主缓冲区
			 */
			getUnSelectedRows : function(bufferName){	
				var arr = [];
				this.forEach(function(row){
					if(!row.isRowSelected()){
						arr.push(this.getRow(row.getIndex(),bufferName));
					}
				},null,null,bufferName,this);
				return arr;			
			},
			/**
			 * @summary：
			 * 		取得当前未被选中的行的行号对象数组
			 * @param 
			 * 		{string} bufferName
			 * 		 可选项，默认为主缓冲区
			 * @return 
			 * 		{array}
			 *		被选中的行的Row对象数组
			 * @example:
			 * |	var rowset = new unieap.ds.RowSet([
			 * |	              {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001",_s:true},                     
			 * |	              ${1}{attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800",_s:false},   
			 * |	              {attr_empno:"1002",NAME:"张韶涵",attr_job:"singer",attr_sal:"9500"}
			 * |	]);
			 * |	 ${2}rowset.getUnSelectedRowIndexs(unieap.ds.BUFFER.PRIMARY);        
			 * |	或
			 * |	  ${3}rowset.getUnSelectedRowIndexs(); 
			 *  ${1}_s=false或没有该标志位,表示该行未被选中       
			 *  ${2}参数为缓冲区的名称
			 *  ${3}如不配置参数，默认为主缓冲区
			 */
			getUnSelectedRowIndexs : function(bufferName){	
				var arr = [];
				this.forEach(function(row){
					if(!row.isRowSelected()){
						arr.push(row.getIndex());
					}
				},null,null,bufferName);
				return arr;			
			},
			
			/**
			 * @summary：
			 * 		删除所有选中行
			 * @example:
			 * |	var rowset = new unieap.ds.RowSet([
			 * |	               ${1}{attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001",_s:true},         
			 * |	               ${2}{attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800",_s:true}, 
		 	 * |	               {attr_empno:"1002",NAME:"张韶涵",attr_job:"歌星",attr_sal:"9500"}           
			 * |	]);
			 * |	rowset.deleteSelectedRows();
			 * |	unieap.debug(rowset);
			 * ${1}被选中的行
			 * ${2}被选中的行      
			 */
			deleteSelectedRows: function(){
				if(this.applyEvent("onBeforeDeleteSelectedRows",arguments)==false) return;
				var _p = this["primary"] ,_f = this["filter"], _d = this["delete"];
				var arr = [];
				var row;
				for(var i= 0; i< _p.length; i++){
					row = _p[i];
					var isRowSelected=(new unieap.ds.Row(this,row)).isRowSelected();
					if(isRowSelected/*_rf._isRowSelected(row)*/){
						arr.push(this.getRow(i));
						var rows = _p.splice(i,1);
						_d.push(rows[0]);
						//this._dataStore.recordCount--;	
						i--;
					}
				}
				/*触发"postDeleteSelectedRows"事件*/
				this.applyEvent("onAfterDeleteSelectedRows",[arr,this]);
				//this.postDeleteSelectedRows(arr,this);
			},
			
			/**
			 * @summary：
			 * 		通过行索引获取行对象
			 * @param
			 *		{number} rowIndex
			 *		行索引
			 * @param 
			 * 		{number} bufferName 
			 * 		可选项，默认为主缓冲区
			 * @return 
			 * 		{unieap.ds.Row} 
			 * 		返回指定行的Row对象,,没有这条数据时返回null
			 * @example:
			 * |	var rowset = new unieap.ds.RowSet([
			 * |	               {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001"},         
			 * |	               {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800"}, 
		 	 * |	               {attr_empno:"1002",NAME:"张韶涵",attr_job:"歌星",attr_sal:"9500"}           
			 * |	]);
			 * |	var row=rowset.getRow(0);   
			 * |	unieap.debug(row);
			 */
			getRow : function(rowIndex, bufferName)
			{
				var buff = this._getBuff(bufferName);
				if(!buff[rowIndex])
					return null;
				return new unieap.ds.Row(this,buff[rowIndex], rowIndex);
			},
			
			/**
			 * @summary：
			 * 		获取指定缓冲区中,指定索引区间的Row对象
			 * @param 
			 * 		{number} bufferName 
			 * 		可选项，默认为主缓冲区
			 * @param
			 *		{number} beginIndex
			 *		行索引
			 * @param
			 *		{number} endIndex
			 *		行索引
			 * @return
			 * 		{array} 
			 * 		被选中的行的Row对象数组
			 * @example:
			 * |	var rowset = new unieap.ds.RowSet([
			 * |	               {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001"},         
			 * |	               {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800"}, 
		 	 * |	               {attr_empno:"1002",NAME:"张韶涵",attr_job:"歌星",attr_sal:"9500"}           
			 * |	]);
			 * |	var rows=rowset.getRows("primary",0,rowset.getRowCount());   
			 * |	unieap.debug(rows);
			 */
			getRows : function(bufferName,beginIndex,endIndex){
				var arr = [];
				this.forEach(function(row){
					arr.push(this.getRow(row.getIndex(),bufferName));
				},beginIndex,endIndex,bufferName,this);
				return arr;	
			},
			
			/**
			 * @summary：
			 * 		获取行内数据
			 * @param 
			 * 		{number} rowIndex
			 * 		 行索引
			 * @param 
			 * 		{number} bufferName
			 * 		 可选项，默认为主缓冲区
			 * @return 
			 * 		{object|null}
			 * 		所在行内的数据，null：当rowIndex值为负值或超出主缓冲区数组范围时
			 * @example:
			 * |	var rowset = new unieap.ds.RowSet([
			 * |	               {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001"},         
			 * |	               {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800"}, 
		 	 * |	               {attr_empno:"1002",NAME:"张韶涵",attr_job:"歌星",attr_sal:"9500"}           
			 * |	]);
			 * |	${1}var data = rowset.getRowData(0,"primary");      
			 * |	${2}var colValue = data["NAME"];  
			 * |	alert(colValue);
			 * ${1}获取行内数据
			 * ${2}获取“NAME”字段的值
			 */
			getRowData : function(rowIndex, bufferName)
			{
				var buff = this._getBuff(bufferName);
				if((rowIndex == null) || (rowIndex < 0)||(rowIndex >= buff.length ))	
					return null;
				return buff[rowIndex];
			},
			
			
			/**
			 * @summary：
			 * 		遍历当前的RowSet，对每个row进行操作
			 * @description：
			 * 		对当前RowSet对象缓冲区的若干行执行callback操作
			 * @example：
			 * |	var rowset = new unieap.ds.RowSet([
			 * |	               {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001"},         
			 * |	               {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800"}, 
		 	 * |	               {attr_empno:"1002",NAME:"张韶涵",attr_job:"歌星",attr_sal:"9500"}           
			 * |	]);
			 * |	${1}rowset.forEach(function(row){
			 * |		row.setItemValue('dept',20);
			 * |	})
			 * |	unieap.debug(rowset);
			 * 		${1}遍历RowSet中的所有Row对象的数据,对每个Row进行操作
			 * @param:
			 * 		{function} callback
			 * 		 回调函数
			 * @param 
			 * 		{number} startIndex
			 * 		 起始行索引
			 * @param 
			 * 		{number} endIndex 
			 * 		结束行索引
			 * @param 
			 * 		{number} bufferName 
			 * 		缓冲区
			 * @param 
			 * 		{object} thisObject 
			 * 		回调函数里引用的this对象
			 */
			forEach: function(callback, startIndex, endIndex, bufferName, thisObject){
				var buff = this._getBuff(bufferName); 
				var _p = this._getParts(callback, startIndex, endIndex, buff.length);
				var row = new unieap.ds.Row(this);
				for(var i= _p[1],l=_p[2]; i<l; i++){
					row.data = buff[i];
					row.index = i;
					_p[0].call(thisObject, row, i ,this);
				}
			},
			
			_everyOrSome: function(every, callback, startIndex, endIndex, bufferName, thisObject){
				var buff = this._getBuff(bufferName); 
				var _p = this._getParts(callback, startIndex, endIndex, buff.length);
				var row = new unieap.ds.Row(this);
				for(var i= _p[1],l=_p[2]; i<l; i++){
					row.data = buff[i];
					row.index = i;
					var result = !!_p[0].call(thisObject, row, i , this);
					if(every ^ result){
						return result; // Boolean
					}
				}
				return every; // Boolean
			},
			
			/**
			 * @summary:
			 * 		遍历当前的RowSet对象，当遇到不满足的条件时终止遍历
			 * @description
			 * 		当且仅当每个Row对象都满足条件时返回true。
			 * 		当有一个Row对象不满足条件时返回false,并终止遍历。
			 * @example：
			 * |	var rowset = new unieap.ds.RowSet([
			 * |	               {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001",deptno:20},         
			 * |	               {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800",deptno:10}, 
		 	 * |	               {attr_empno:"1002",NAME:"张韶涵",attr_job:"歌星",attr_sal:"9500",deptno:20}           
			 * |	]);
			 * |	${1}var isSatisfied=rowset.every(function(row){
			 * |		return row.getItemValue('deptno')==20;
			 * |	})
			 * |	alert(isSatisfied);
			 * 		${1}判断RowSet的每一个Row对象的deptno值是否都为20。
			 * @param 
			 * 		{function} callback 
			 * 		回调函数
			 * @param 
			 * 		{number} startIndex
			 * 		 起始行索引
			 * @param 
			 * 		{number} endIndex
			 * 		 结束行索引
			 * @param 
			 * 		{number} bufferName
			 * 		 缓冲区
			 * @param 
			 * 		{object} thisObject 
			 * 		回调函数里引用的this对象
			 * @return 
			 * 		{boolean}
			 */
			every: function(callback, startIndex, endIndex, bufferName,thisObject){
				return this._everyOrSome(true, callback, startIndex, endIndex, bufferName, thisObject); // Boolean
			},
			
			/**
			 * @summary:
			 * 		遍历当前的RowSet
			 * @description：
			 * 		当有一个row满足条件时返回true,并终止遍历。
			 * 		否则返回false。
			 * @example：
			 * |	var rowset = new unieap.ds.RowSet([
			 * |	               {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001",deptno:20},         
			 * |	               {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800",deptno:10}, 
		 	 * |	               {attr_empno:"1002",NAME:"张韶涵",attr_job:"歌星",attr_sal:"9500",deptno:20}           
			 * |	]);
			 * |	${1}var isSatified=rowset.some(function(row){
			 * |		return row.getItemValue('deptno')==20;
			 * |	})
			 * |	alert(isSatified);
			 * ${1}判断rowset中是否存在deptno值为20的row，存在则终止遍历
			 * 		
			 * @param 
			 * 		{function} callback
			 * 		 回调函数
			 * @param 
			 * 		{number} startIndex 
			 * 		起始行索引
			 * @param
			 * 		 {number} endIndex
			 * 		 结束行索引
			 * @param
			 * 		 {number} bufferName
			 * 		 缓冲区
			 * @param 
			 * 		{object} thisObject
			 * 		 回调函数里引用的this对象
			 * @return 
			 * 		{boolean}
			 */
			some: function(callback, startIndex, endIndex, bufferName, thisObject){
				return this._everyOrSome(false, callback, startIndex, endIndex, bufferName, thisObject); // Boolean
			},
			
			/**
			 * @summary:
			 * 		遍历过滤
			 * @description：
			 * 		遍历所有的Row,返回由过滤出来的数据组成的RowSet
			 * @example：
			 * |	var rowset = new unieap.ds.RowSet([
			 * |	               {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001",deptno:20},         
			 * |	               {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800",deptno:10}, 
		 	 * |	               {attr_empno:"1002",NAME:"张韶涵",attr_job:"歌星",attr_sal:"9500",deptno:20}           
			 * |	]);
			 * |	${1}var newrs=rowset.forEachFilter(function(row){
			 * |		return row.getItemValue('deptno')==20;
			 * |	})
			 * |	unieap.debug(newrs);
			 * 		${1}从RowSet中过滤出dept为20的Row。返回一个由过滤出来的数据组成的新RowSet对象。
			 * @param 
			 * 		{function} callback
			 * 		 回调函数
			 * @param 
			 * 		{number} startIndex
			 * 		 起始行索引
			 * @param 
			 * 		{number} endIndex 
			 * 		结束行索引
			 * @param 
			 * 		{number} bufferName 
			 * 		缓冲区
			 * @param 
			 * 		{object} thisObject 
			 * 		回调函数里引用的this对象
			 * @return 
			 * 		{unieap.ds.RowSet} 
			 * 		过滤操作后的RowSet对象
			 */
			forEachFilter: function(callback, startIndex, endIndex, bufferName, thisObject){
				var buff = this._getBuff(bufferName); 
				var _p = this._getParts(callback, startIndex, endIndex, buff.length);
				var new_rs = new unieap.ds.RowSet();
				var row = new unieap.ds.Row(this), data;
				for(var i= _p[1],l=_p[2]; i<l; i++){
					data = buff[i];
					row.data = data;
					row.index = i;
					if(_p[0].call(thisObject, row, i , this)){
						new_rs.addRow(data, false, true);
					}
				}
				return new_rs;
			},
			/**
			 * @summary:
			 * 		阻止事件
			 * @description
			 * 		数据操作将不触发事件
			 * @example:
			 *  |	rowset.disabledEvent();
			 */
			disabledEvent : function(){
				this._stopEvent = true ;
			},
			/**
			 * @summary:
			 * 		开启事件
			 * @description
			 * 		默认开启事件
			 * @example:
			 *  |	rowset.enabledEvent();
			 */
			enabledEvent : function(){
				this._stopEvent = false;
			},
			
			applyEvent : function(eventName,args){
				return this._stopEvent || this[eventName].apply(this,args);
			},	
				
			/**
			 * @summary:
			 * 		当Row中字段值改变前触发事件
			 * @example
			 * |	var rowset = new unieap.ds.RowSet([
			 * |	               {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001",deptno:20},         
		 	 * |	               {attr_empno:"1002",NAME:"张韶涵",attr_job:"歌星",attr_sal:"9500",deptno:20}           
			 * |	]);
			 * |	${1}dojo.connect(rowset,'onItemChanging',
			 * |		function(row,name,value,index){
			 * |			alert(row.getItemValue("attr_empno"));	
			 * |		}
			 * |	);
			 * |	rowset.setItemValue(0,"attr_empno","1003");
			 * 		${1}绑定了rowset的onItemChanging事件,参数分别为row,字段名,字段值,索引
			 * @param 
			 * 		{unieap.ds.Row} thisRow 
			 * 		RowSet的当前操作行
			 * @param 
			 * 		{string} itemName 
			 * 		Row中某字段的名称
			 * @param 
			 * 		{object} value 
			 * 		该字段被赋的值
			 * @param 
			 * 		{number} index 
			 * 		该行所在的索引
			 * @return 
			 * 		{boolean} 
			 * 		可以根据该返回值决定下一步的操作,如果自定义的onItemChanging事件存在并且返回false，则不会给Row对象赋值,并且该setItemValue返回false，后续的onItemChanged不会被执行。
			 */
			onItemChanging: function(thisRow, itemName, value, index) {
				//
				//console.info("void onItemChanging");
			},
			
			/**
			 * @summary:
			 * 		当Row中字段值改变后触发事件
			 * @example
			 * |	var rowset = new unieap.ds.RowSet([
			 * |	               {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001",deptno:20},         
		 	 * |	               {attr_empno:"1002",NAME:"张韶涵",attr_job:"歌星",attr_sal:"9500",deptno:20}           
			 * |	]);
			 * |	${1}dojo.connect(rowset,'onItemChanged',
			 * |		function(row,name,value,index){
			 * |			alert(row.getItemValue("attr_empno"));
			 * |		}
			 * |	);
			 * |	rowset.setItemValue(0,"attr_empno","1003");
			 * 		${1}绑定了rowset的onItemChanged事件,参数分别为row,字段名,字段值,索引
			 * @param 
			 * 		{unieap.ds.Row} thisRow
			 * 		 RowSet的当前操作行
			 * @param 
			 * 		{string} itemName
			 * 		 Row中某字段的名称
			 * @param 
			 * 		{object} value
			 * 		 该字段被赋的值
			 * @param 
			 * 		{number} index
			 * 		 该行所在的索引
			 */
			onItemChanged: function (thisRow, itemName, value, index) {
				//
				//console.info("void onItemChanged");
			},	
			
			
			/**
			 * @summary:
			 * 		当RowSet中添加一行新的记录Row时的监听处理函数
			 * @example
			 * |	var rowset = new unieap.ds.RowSet([
			 * |	               {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001",deptno:20},         
		 	 * |	               {attr_empno:"1002",NAME:"张韶涵",attr_job:"歌星",attr_sal:"9500",deptno:20}           
			 * |	]);
			 * |	${1}dojo.connect(rowset,'onBeforeAddRow',
			 * |		function(row,rowset){
			 * |			alert('onBeforeAddRow');		
			 * |		}
			 * |	);
			 * |	var data = {attr_empno:"1003",NAME:"张柏芝",attr_job:"演员"};
			 * |		rowset.addRow(data);
			 * 		${1}绑定了rowset的onBeforeAddRow事件,参数分别为row,rowset
			 * @param:
			 * 		 {unieap.ds.Row} row
			 * 		 被添加的Row对象
			 * @param 
			 * 		{unieap.ds.RowSet} rowSet
			 * 		 当前RowSet对象
			 */
			onBeforeAddRow:function(row,rowSet){
				
			},
			
			/**
			 * @summary:
			 * 		当RowSet中添加一行新的记录Row后的监听处理函数
			 * @example
			 * |	var rowset = new unieap.ds.RowSet([
			 * |	               {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001",deptno:20},         
		 	 * |	               {attr_empno:"1002",NAME:"张韶涵",attr_job:"歌星",attr_sal:"9500",deptno:20}           
			 * |	]);
			 * |	${1}dojo.connect(rowset,'onAfterAddRow',
			 * |		function(row,rowset){
			 * |			alert('onAfterAddRow');		
			 * |		}
			 * |	);
			 * |	var data = {attr_empno:"1003",NAME:"张柏芝",attr_job:"演员"};
			 * |		rowset.addRow(data);
			 * 		${1}绑定了rowset的onAfterAddRow事件,参数分别为row,rowset
			 * @param:
			 * 		 {unieap.ds.Row} row
			 * 		 被添加的Row对象
			 * @param 
			 * 		{unieap.ds.RowSet} rowSet
			 * 		 当前RowSet对象
			 */
			onAfterAddRow:function(row,rowSet){
				
			},
			/**
			 * @summary:
			 * 		当RowSet中增加多行记录Row时的监听处理函数
			 * @example
			 * |	var rowset = new unieap.ds.RowSet([]);
			 * |	${1}dojo.connect(rowset,'onBeforeAddRows',
			 * |		function(rows){
			 * |			alert('onBeforeAddRows');		
			 * |		}
			 * |	);
			 * |	var datas=[]
			 * |	for(var i=0;i<10;i++){
			 * |	    datas.push({attr_empno:"100"+i,NAME:"name_"+i,attr_job:"演员_"+i});
			 * |	}
			 * |	rowset.addRows(datas);
			 * 		${1}绑定了rowset的onBeforeAddRows事件,参数为row数组
			 * @param 
			 * 		{array} rows
			 * 		 被添加的Row对象数组
			 */
			onBeforeAddRows:function(rows){
				
			},
			
			/**
			 * @summary:
			 * 		当RowSet中增加多行记录Row后的监听处理函数
			 * @example
			 * |	var rowset = new unieap.ds.RowSet([]);
			 * |	${1}dojo.connect(rowset,'onAfterAddRows',
			 * |		function(rows){
			 * |			alert('onAfterAddRows');		
			 * |		}
			 * |	);
			 * |	var datas=[]
			 * |	for(var i=0;i<10;i++){
			 * |	    datas.push({attr_empno:"100"+i,NAME:"name_"+i,attr_job:"演员_"+i});
			 * |	}
			 * |	rowset.addRows(datas);
			 * 		${1}绑定了rowset的onAfterAddRows事件,参数为row数组
			 * @param 
			 * 		{array} rows
			 * 		 被添加的Row对象数组
			 */
			onAfterAddRows:function(rows){
				
			},
			
			/**
			 * @summary：
			 * 		当RowSet中删除一行记录Row时的监听处理函数
			 * @example
			 *  |	var rowset = new unieap.ds.RowSet([
			 *  |	               {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001",deptno:20},         
		 	 *  |	               {attr_empno:"1002",NAME:"张韶涵",attr_job:"歌星",attr_sal:"9500",deptno:20}           
			 *  |	]);
			 *  |	${1}dojo.connect(rowset,'onBeforeDeleteRow',
			 *  |		function(row,rowset){
			 *  |			alert('onBeforeDeleteRow');		
			 *  |		}
			 *  |	);
			 *  |	rowset.deleteRow(0);
			 * 		${1}绑定了rowset的onBeforeDeleteRow事件,参数为row,rowset
			 * @param 
			 * 		{unieap.ds.Row} row 
			 * 		被删除的Row对象
			 * @param 
			 * 		{unieap.ds.RowSet} rowSet 
			 * 		当前RowSet对象
			 */
			onBeforeDeleteRow:function(row,rowSet){
			},
			
			/**
			 * @summary：
			 * 		当RowSet中删除一行记录Row后的监听处理函数
			 * @example
			 * |	var rowset = new unieap.ds.RowSet([
			 * |	               {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001",deptno:20},         
		 	 * |	               {attr_empno:"1002",NAME:"张韶涵",attr_job:"歌星",attr_sal:"9500",deptno:20}           
			 * |	]);
			 * |	${1}dojo.connect(rowset,'onAfterDeleteRow',
			 * |		function(row,rowset){
			 * |			alert('onAfterDeleteRow');		
			 * |		}
			 * |	);
			 * |	rowset.deleteRow(0);
			 * 		${1}绑定了rowset的onAfterDeleteRow事件,参数为row,rowset
			 * @param 
			 * 		{unieap.ds.Row} row 
			 * 		被删除的Row对象
			 * @param 
			 * 		{unieap.ds.RowSet} rowSet 
			 * 		当前RowSet对象
			 */
			onAfterDeleteRow:function(row,rowSet){			
			},
			
			/**
			 * @summary：
			 * 		当RowSet中删除多行记录Row时的监听处理函数
			 * @example
			 * |	var rowset = new unieap.ds.RowSet([
			 * |	               {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001",deptno:20},         
			 * |	               {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800",deptno:10}, 
		 	 * |	               {attr_empno:"1002",NAME:"张韶涵",attr_job:"歌星",attr_sal:"9500",deptno:20}           
			 * |	]);
			 * |	${1}dojo.connect(rowset,'onBeforeDeleteRows',
			 * |		function(data){
			 * |			alert('onBeforeDeleteRows');		
			 * |		}
			 * |	);
			 * |	rowset.deleteRows([0,1]);
			 * 		${1}绑定了rowset的onBeforeDeleteRows事件,参数为索引组成的数组
			 * @param 
			 * 		{array} data
			 * 		 行下标，形如:[1,0,5,4,3];
			 */
			onBeforeDeleteRows:function(data){
			},
			
			/**
			 * @summary：
			 * 		当RowSet中删除多行记录Row后的监听处理函数
			 * @example
			 * |	var rowset = new unieap.ds.RowSet([
			 * |	               {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001",deptno:20},         
			 * |	               {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800",deptno:10}, 
		 	 * |	               {attr_empno:"1002",NAME:"张韶涵",attr_job:"歌星",attr_sal:"9500",deptno:20}           
			 * |	]);
			 * |	${1}dojo.connect(rowset,'onAfterDeleteRows',
			 * |		function(data){
			 * |			alert('onAfterDeleteRows');		
			 * |		}
			 * |	);
			 * |	rowset.deleteRows([0,1]);
			 * 		${1}绑定了rowset的onAfterDeleteRows事件,参数为索引组成的数组
			 * @param 
			 * 		{array} data
			 * 		 行下标，形如:[1,0,5,4,3];
			 */
			onAfterDeleteRows:function(){
			},
			
			/**
			 * @summary：
			 * 		当RowSet中删除所有行的监听处理函数
			 * @example
			 * |	var rowset = new unieap.ds.RowSet([
			 * |	               {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001",deptno:20},         
			 * |	               {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800",deptno:10}, 
		 	 * |	               {attr_empno:"1002",NAME:"张韶涵",attr_job:"歌星",attr_sal:"9500",deptno:20}           
			 * |	]);
			 * |	${1}dojo.connect(rowset,'onBeforeDeleteAllRows',
			 * |		function(){
			 * |			alert('onBeforeDeleteAllRows');		
			 * |		}
			 * |	);
			 * |	rowset.deleteAllRows();
			 * 		${1}绑定了rowset的onBeforeDeleteAllRows事件
			 */
			onBeforeDeleteAllRows:function(){
			},
			
			/**
			 * @summary：
			 * 		当RowSet中删除所有行后的监听处理函数
			 * @example
			 * |	var rowset = new unieap.ds.RowSet([
			 * |	               {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001",deptno:20},         
			 * |	               {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800",deptno:10}, 
		 	 * |	               {attr_empno:"1002",NAME:"张韶涵",attr_job:"歌星",attr_sal:"9500",deptno:20}           
			 * |	]);
			 * |	${1}dojo.connect(rowset,'onAfterDeleteAllRows',
			 * |		function(){
			 * |			alert('onAfterDeleteAllRows');		
			 * |		}
			 * |	);
			 * |	rowset.deleteAllRows();
			 * 	${1}绑定了rowset的onAfterDeleteAllRows事件
			 */
			onAfterDeleteAllRows:function(){
			},
			
			
			/**
			 * @summary:
			 * 		当RowSet中删除被选中的多行记录Row时的监听处理函数
			 * @example
			 * |	var rowset = new unieap.ds.RowSet([
			 * |	              ${1} {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001",deptno:20,_s:true},         
			 * |	               {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800",deptno:10}, 
		 	 * |	               {attr_empno:"1002",NAME:"张韶涵",attr_job:"歌星",attr_sal:"9500",deptno:20}           
			 * |	]);
			 * |	${2}dojo.connect(rowset,'onBeforeDeleteSelectedRows',
			 * |		function(arr,rowset){
			 * |			alert('onBeforeDeleteSelectedRows');		
			 * |		}
			 * |	);
			 * |	rowset.deleteSelectedRows();
			 * 		${1}_s值为true表示此行被选中
			 * 		${2}绑定了rowset的onBeforeDeleteSelectedRows事件
			 * @param 
			 * 		{array} arr  
			 * 		被删除的Row对象的集合(array中对象类型为unieap.ds.Row)
			 * @param 
			 * 		{unieap.ds.RowSet} rowSet 
			 * 		当前RowSet对象
			 */
			onBeforeDeleteSelectedRows:function(arr,rowSet){
			},
			
			/**
			 * @summary:
			 * 		当RowSet中删除被选中的多行记录Row后的监听处理函数
			 * @example
			 * |	var rowset = new unieap.ds.RowSet([
			 * |	              ${1} {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001",deptno:20,_s:true},         
			 * |	               {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800",deptno:10}, 
		 	 * |	               {attr_empno:"1002",NAME:"张韶涵",attr_job:"歌星",attr_sal:"9500",deptno:20}           
			 * |	]);
			 * |	${2}dojo.connect(rowset,'onAfterDeleteSelectedRows',
			 * |		function(arr,rowset){
			 * |			alert('onAfterDeleteSelectedRows');		
			 * |		}
			 * |	);
			 * |	rowset.deleteSelectedRows();
			 * 		${1}_s值为true表示此行被选中
			 * 		${2}绑定了rowset的onAfterDeleteSelectedRows事件
			 * @param 
			 * 		{array} arr  
			 * 		被删除的Row对象的集合(array中对象类型为unieap.ds.Row)
			 * @param 
			 * 		{unieap.ds.RowSet} rowSet 
			 * 		当前RowSet对象
			 */			
			onAfterDeleteSelectedRows:function(arr,rowSet){
			},
			
			/**
			 * @summary:
			 * 		回滚RowSet中修改的数据前触发
			 * @param:
			 * 		{number} inRowIndex 要回滚的行号(如果用户直接调用discardUpdate方法不传入参数则inRowIndex不存在)
			 */
			onBeforeDiscardUpdate:function(inRowIndex){},
			
			/**
			 * @summary:
			 * 		回滚RowSet中修改的数据后触发
			 */
			onAfterDiscardUpdate:function(){},
			
			/**
			 * @summary:
			 * 		RowSet进行过滤后的监听处理函数
			 * @example:
			 * |	var rowset = new unieap.ds.RowSet([
			 * |	               {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001",deptno:20,_s:true},         
			 * |	               {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800",deptno:10}, 
		 	 * |	               {attr_empno:"1002",NAME:"张韶涵",attr_job:"歌星",attr_sal:"9500",deptno:20}           
			 * |	]);
			 * |	${1}dojo.connect(rowset,'onFilter',
			 * |		function(){
			 * |			alert('onFilter');		
			 * |		}
			 * |	);
			 * | 	rowset.doFilter('NAME','like','^黄',true);
			 * 		${1}绑定了rowset的onFilter事件
			 * @param: 
			 * 		{object} unieap.ds.RowSet
			 */
			onFilter : function(rowSet){
				
			},
			
			/**
			 * @summary:
			 * 		RowSet进行排序后的监听处理函数
			 * @example:
			 * |	var rowset = new unieap.ds.RowSet([
			 * |	               {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"9000",deptno:20,_s:true},         
			 * |	               {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800",deptno:10}, 
		 	 * |	               {attr_empno:"1002",NAME:"张韶涵",attr_job:"歌星",attr_sal:"9500",deptno:20}           
			 * |	]);
			 * |	${1}dojo.connect(rowset,'onSort',
			 * |		function(){
			 * |			alert('onSort');		
			 * |		}
			 * |	);
			 * |	rowset.sort('attr_sal',1,'number');
			 * 		${1}绑定了rowset的onSort事件
			 * @param: 
			 * 		{object} unieap.ds.RowSet
			 */
			onSort:function(rowSet){
				
			},
			
			/**
			 * @summary:
			 * 		RowSet执行resetUpdate操作后的监听处理函数
			 * @example
			 * |	var rowset = new unieap.ds.RowSet([
		 	 * |			                 {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001"},                
			 * |			                 {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800"}, 
			 * |			                 {attr_empno:"1002",NAME:"张韶涵",attr_job:"singer",attr_sal:"9500"}   
			 * |	]);
			 * |	${1}dojo.connect(rowset,'onResetUpdate',
			 * |		function(){
			 * |			alert('onResetUpdate');		
			 * |		}
			 * |	);
			 * |	rowset.setItemValue(0,"NAME","茜茜公主");
			 * |	rowset.deleteRow(2);
			 * |	rowset.resetUpdate(); 
			 * 		${1}绑定了rowset的onResetUpdate事件
			 * @param 
			 * 		{object} unieap.ds.RowSet
			 */
			onResetUpdate:function(rowset){
				
			},
			
			
			_getBuff:	function(bufferName)
			{
				return (bufferName == __buffer.DELETE ? this["delete"] : (bufferName == __buffer.FILTER?this["filter"]:this["primary"]));
			},
			
			_buildRow	: function(data, clone,keepStatus,setDefValue){
				if(data == null){
					data = {};
				}else if(clone){
					data = this._cloneRow(data,keepStatus);
				}
				if(setDefValue!=false) {
					var metaData = this.getMetaData();
					if(metaData){
						for(var i=0,l=metaData.length; i<l;i++){
							if(data[metaData[i].getName()]==null && metaData[i].getDefaultValue()!=null){
								data[metaData[i].getName()]=metaData[i].getDefaultValue();
							}
						}
					}
				}
				return data;
			},
			/*
			 * @param:
			 * 		{object} data
			 * @param:
			 * 		{object} all
			 * @example:
			 *  |	var ds = new unieap.ds.DataStore("name");
			 *  |	var data = {name:"d",b:2,_o:{b:1}};
			 * 	|	ds.getRowSet().addRow(data,true,false);
			 * 	|	unieap.debug(ds);
			 */
			_cloneRow	: function(data, all){
				all = all || false;
				 var d= dojo.fromJson( dojo.toJson(data||{}));
				if(!all){
					delete d["_t"];
					delete d["_s"];
					delete d["_o"];
				}
				return d;
			},
			
			_getParts : function(cb, s, e, l){
				return [ 
					(typeof cb == "string" ? (new Function("row", "index", "rowset", cb)) : cb),
					((s == null) || (s < 0)||(s >= l ) ? 0 : s),
					((e == null) || (e < 0)||(e >  l ) ? l : e)
				];
			},
			
			/**
			 * @summary:
			 * 		多列排序
			 * @param 
			 * 		{array|object} data 
			 * 		排序条件
			 * 		形如：[{name:"id",asc:1,dataType:"number"},{name:"dept",asc:-1}]
			 * @param
			 * 		 {string} bufferName 
			 * 		缓冲区名称
			 * @example:
			 * |	var rowset = new unieap.ds.RowSet([
			 * |	                 {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001"},                
			 * |	                 {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800"}, 
			 * |	                 {attr_empno:"1002",NAME:"张韶涵",attr_job:"singer",attr_sal:"9500"}   
			 * |	]);
			 * |	${1}rowset.sorts([{name:"attr_empno",asc:1,dataType:"number"},{name:"NAME",asc:-1}],"primary");
			 * |	unieap.debug(rowset);
			 * ${1}asc:1表示升序；-1表示降序
			 */
			sorts : function(data,bufferName){
				if(!dojo.isArray(data)){
					data = [data];
				}
				for(var i=data.length-1;i>=0;i--){
					var d = data[i];
					this.sort(d["name"],d["asc"]||1,d["dataType"],bufferName);
				}
			},
			
			/**
			 * @summary:
			 * 		对当前RowSet对象的主缓冲区内所有行进行排序
			 * @example：
			 * |	var rowset = new unieap.ds.RowSet([
			 * |	                 {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"9700"},                
			 * |	                 {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800"}, 
			 * |	                 {attr_empno:"1002",NAME:"张韶涵",attr_job:"singer",attr_sal:"9500"}   
			 * |	]);
			 * |	${1}rowset.sort('attr_sal',1,'number');
			 * |	unieap.debug(rowset);
			 * 	${1}	对rowset的attr_sal列以number类型进行升序排序
			 * @param 
			 * 		{string} name
			 * 		 待排序的字段名称
			 * @param 
			 * 		{number} asc 
			 * 		1：升序，-1：降序
			 * @param 
			 * 		{string} bufferName
			 * 		 缓冲区名称
			 * @param 
			 * 		{number|String} dataType
			 * 		 该字段的类型
			 */
			sort : function(name,asc,dataType,bufferName){	
				if(!dataType){
					var metaData =this.getMetaData(name);
					if(metaData){
						dataType = unieap.getDataType(metaData.getDataType());
					}
				}	
				var sortComp;
				if(dataType=="number"||dataType=="date"){
					sortComp=function(a,b){
						if(a[name]==null) return asc*1;
						if(b[name]==null) return asc*-1;
						a = Number(a[name]);b = Number(b[name]);	
//						if(isNaN(b=parseFloat(b[name],10)))  return asc*1;
//						if(isNaN(a=parseFloat(a[name],10)))  return asc*-1;											
						return asc*(a-b);
					}
				}else{
					sortComp=function(a,b){
						return asc*((a[name]+"").localeCompare(b[name]+""));//支持中文排序
					}
				}
				this._getBuff(bufferName).sort(sortComp);
				this.applyEvent("onSort",[this]);
			},
			
			/**
			 * @summary:
			 * 		计算某列的合计值
			 * @description:
			 * 		注意只有数字类型的字段才可以求和
			 * @param 
			 * 		{string} name
			 * 		 列名
			 * @param 
			 * 		{string} pattern 
			 * 		格式化样式
			 * @param 
			 * 		{string|null} bufferName
			 * 		 缓冲区名称，默认为primary
			 * @return 
			 * 		{number}
			 * @example:
			 * |	var rowset = new unieap.ds.RowSet([
			 * |	                 {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001"},                
			 * |	                 {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800"}, 
			 * |	                 {attr_empno:"1002",NAME:"张韶涵",attr_job:"singer",attr_sal:"9500"}   
			 * |	]);
			 * |	${1}var count=rowset.sum("attr_sal","###,###.00","primary");
			 * |	alert(count);
			 * ${1}形如“###,###.00”
			 */
			sum : function(name,pattern,bufferName){
				//U_EAP00027295
//				this._isNumberType(name);
				var count = 0;
				this.forEach(function(row){
					var value = row.data[name];
					if(value!=null){
						count+=Number(value,10); 
					}
				},null,null,bufferName);
				if(pattern!=null){
					dojo.require("dojo.number");
					dojo.require("unieap.patch.number");
					count=dojo.number.format(count,{pattern:pattern});
				}
				return count;
			},
			
			/**
			 * @summary:
			 * 		计算某列的最大值
			 * @param 
			 * 		{string} name 
			 * 		列名
			 * @param 
			 * 		{string|null} bufferName 
			 * 		缓冲区名称，默认为primary
			 * @return 
			 * 		{number}
			 * @example:
			 * |	var rowset = new unieap.ds.RowSet([
			 * |	                 {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001"},                
			 * |	                 {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800"}, 
			 * |	                 {attr_empno:"1002",NAME:"张韶涵",attr_job:"singer",attr_sal:"9500"}   
			 * |	]);
			 * |	${1}alert(rowset.max("attr_sal"));
			 * |	或
			 * |	alert(rowset.max("attr_sal","primary")); 
		 	 * ${1} 本例attr_sal列的最大值为：9500
			  */
			max : function(name,bufferName){
				return this._mm(name,"max",bufferName);
			},
			
			/**
			 * @summary:
			 * 		计算某列的最小值
			 * @param 
			 * 		{string} name 
			 * 		列名
			 * @param 
			 * 		{string|null} bufferName
			 * 		 缓冲区名称，默认为primary
			 * @return 
			 * 		{number}
			 * @example:
			 * | 	var rowset = new unieap.ds.RowSet([
			 * |	                 {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001"},                
			 * |	                 {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800"}, 
			 * |	                 {attr_empno:"1002",NAME:"张韶涵",attr_job:"singer",attr_sal:"9500"}   
			 * |	]);
			 * |	alert(rowset.min("attr_sal"));
			 * |	或
			 * |	${1}alert(rowset.min("attr_sal","primary"));                  
			 * ${1}本例attr_sal列的最小值为：1001
			 */
			min : function(name,bufferName){
				return this._mm(name,"min",bufferName);
			},
			
			_mm : function(name,operator,bufferName){
				//U_EAP00027295
//				this._isNumberType(name);
				var result = "";
				var arr = [];
				this.forEach(function(row){
					var value = row.data[name];
					if(value!=null){
						arr.push(value);
					}
				},null,null,bufferName);
				if(!unieap.isEmpty(arr)){
				   result = Math[operator].apply(Math,arr);
				   result = window.isNaN(result)?"":result;
				}
				return  result;
			},
			
			/**
			 * @summary:
			 * 		计算某列的平均值
			 * @param 
			 * 		{string} name
			 * 		 列名
			 * @param 
			 * 		{string} pattern
			 * 		 格式化样式
			 * @param 
			 * 		{string|Null} bufferName
			 * 		 缓冲区名称，默认为primary
			 * @return 
			 * 		{number}
			 * @example:
			 * |	var rowset = new unieap.ds.RowSet([
			 * |	               {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001"},
			 * |	               {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800"},
			 * |	               {attr_empno:"1002",NAME:"张韶涵",attr_job:"歌星",attr_sal:"9500"}
			 * |	]);
			 * |	rowset.avg("attr_sal","###.##","primary");
			 */
			avg : function(name,pattern,bufferName){
				if(this._getBuff(bufferName).length==0) return 0;
				var count = this.sum(name,null,bufferName);
				var result = count/this._getBuff(bufferName).length;
				if(pattern!=null){
					dojo.require("dojo.number");
					dojo.require("unieap.patch.number");
					result=dojo.number.format(result,{pattern:pattern});
				}
				return result;
			},
			
			//判断是否数字类型
			_isNumberType: function(name){
				var metaData =this.getMetaData(name);
				if(metaData){
					if(unieap.getDataType(metaData.getDataType())!="number"){
						throw new Error("Don't support to calc string");
					}
					return metaData.getDataType();
				}
			},
			
			/**
			 * @summary:
			 * 		页面过滤操作
			 * @param 
			 * 		{string} name 
			 * 		列名称，如果为null则清空过滤缓冲区
			 * @param 
			 * 		{string} relation 
			 * 		比较表达式
			 * @param 
			 * 		{string|number} 
			 * 		查询值
			 * @param 
			 * 		{boolean|string} ignoreCase|dataFormat
			 * 		字符串是否区分大小写|日期的格式内容
			 * @example:
			 * | 	var filter={}
			 * |	${1}filter.pattern="${conditionA} && (${conditionB} || ${conditionC})"
			 * |	filter.condition={
			 * |		conditionA:{name : "empname",relation : "like", value:"^杨", ignoreCase:true},
			 * |		conditionB : {name : "deptno",relation : ">=", value:id},
			 * |		conditionC : {name : "hirdate",relation : "!=", value:new Date(2007,10,10),dataFormat:"yyyy-MM-dd"}
			 * |	}
			 * |	rowset.doFilter(filter);
			 * 		${1}多个条件时
			 *  @example：
			 * | 	${2}rowset.doFilter('empname','like','^杨',true);
			 * 		${2}单个条件
			 * 
			 */
			doFilter : function(name,relation,value,ignoreCase){
				var primary = this._getBuff(__buffer.PRIMARY),
						filter = this._getBuff(__buffer.FILTER);
				if(name==null){ 
					Array.prototype.push.apply(primary,filter.splice(0,filter.length));
					this.applyEvent("onFilter",[this]);
					return;
				}
				var data = arguments[0];
				if(arguments.length>1){
					data = {
						name : name,
						relation : relation,
						value : value,
						ignoreCase : ignoreCase,
						dataFormat : ignoreCase  //对于日期要传入dataFormat日期格式
					};
				}
				var applyFilter = this._getApplyFilter(data);
				for(var i = primary.length-1;i>=0;i--){
					if(!applyFilter(primary[i])){
						filter.unshift(primary.splice(i,1)[0]);
					}
				}
				this.applyEvent("onFilter",[this]);
			},
			/**
			 * @summary:
			 * 		获取满足条件的行索引数组
			 * @description：
			 * 		参数传递用法等同于doFilter调用
			 * @param:
			 * 		{object} data
			 * @return:
			 * 		{array}
			 * @example:
			 * |	${1}var rows = rowset.getSatisfiedFilterRows({name : "NAME",relation : "like", value:'齐'});
			 * ${1}单条件
			 * @example:
			 * |	var filter={} 
			 * |	${2}filter.pattern="${conditionA} && (${conditionB} || ${conditionC})" 
			 * |	filter.condition={ 
			 * |	                   conditionA:{name : "empname",relation : "like", value:"^杨", ignoreCase:true}, 
			 * |	                   conditionB:{name : "deptno",relation : ">=", value:id}, 
			 * |	                   conditionC:{name : "hirdate",relation : "!=", value:new Date(2007,10,10),dataFormat:"yyyy-MM-dd"} 
			 * |	                 } 
			 * |	var rows = rowset.getSatisfiedFilterRows(filter);
			 * ${2}多条件
			 */
			getSatisfiedFilterRows : function(data){
				var primary = this._getBuff(__buffer.PRIMARY),
					   applyFilter = this._getApplyFilter(data), 
					   result = [];
				for(var i=0,l = primary.length;i<l;i++){
					if(applyFilter(primary[i])){
							result.push(i);
					}
				}
				return result;
			},
			/*
			 * @summary:
			 * 		用于树构造层次关系
			 * @private
			 */
			doClassifyFilter : function(data,primary,filter){
				Array.prototype.push.apply(primary,filter.splice(0,filter.length));
				var applyFilter = this._getApplyFilter(data);
				for(var i = primary.length-1;i>=0;i--){
					if(!applyFilter(primary[i])){
						filter.unshift(primary.splice(i,1)[0]);
					}
				}
			},
			_getApplyFilter : function(data){
					var rowSet=this,
					assembleCondition = function(data){
						var dataType = rowSet._getDataType(data.name,data.value);
						if(data.value!=null){							
							if(data.relation == "like"){
								data.value = new RegExp(data.value, "i");
							}
							else{
								if(data.value instanceof  Date){								
									data.value = data.value.getTime();
									dataType = "date";
								}
								if(dataType == "date"){
									data.place = unieap.getRelativeTimePlace(data.dataFormat);
									data.value = unieap.getRelativeTime(data.value,data.place);
								}
							}
						}
						data.compare = unieap.getCompare(dataType,data.relation).compare;
					} ;
					
					var pattern = data["pattern"] || "&&", //条件间逻辑关系
						   p = (pattern=="&&"||pattern=="||")?[]:null, 
						   condition = data["condition"] || 
						   (unieap.getLength(data)>1? {firstCondition:data} :data);	
					
					for(var name in condition){
						p && p.push(" ${".concat(name).concat("} "));						
						assembleCondition(condition[name]);
					}	
					p && (pattern = p.join(pattern));
					
					var scope ={
						judge: function(item,name){
							var data = condition[name];
							return data["compare"](item[data["name"]],data["value"],data["place"] || data["ignoreCase"]);
						}
					}
					for(var name in condition){
						var re = new RegExp("\\$\\{".concat(name).concat("\\}"),"g"); 
						pattern = pattern.replace(re,"this.judge(context,\""+name+"\")");
					}	
					return dojo.hitch(scope,new Function("var context=arguments[0]; return ("+pattern+")"));
			},
			
			_getDataType : function(name,value){
				var metaData = this.getMetaData(name);
				if(metaData){
						return unieap.getDataType(metaData.getDataType());
					}
				if(typeof value=="number") 
					return "number";
				else 
					return "string";
			},
			
			/**
			 * @summary
			 * 		获取指定列的MetaData对象
			 * @param 
			 * 		{string} name
			 * 		 列名称
			 * @return 
			 * 		{object} 
			 * 		MetaData对象
			 * @example:
			 *	 |	var meta=rowset.getMetaData("NAME");
			 *	 |	unieap.debug(meta);
			 */
			getMetaData : function(name){
				var metaData = this._dataStore && this._dataStore.getMetaData(name) || null;
				return metaData
			},
			
			/**
			 * @summary：
			 * 		获取rowSetName，如果是自定义SQL则返回statementName
			 * @return 
			 * 		{string}
			 * @example:
			 * |	rowset.getName();
			 */
			getName : function(){
				var store = this.getDataStore();
				if(!store){
					return "";
				}
				var name = store.getStatementName();
				if(name&&name!=""){
					return name;
				}
				return store.getRowSetName();
			},
			
			/**
			 * @summary:
			 * 		设置dataStore
			 * @param 
			 * 		{unieap.ds.DataStore} dataStore
			 * @example:
			 * 	|	rowset.setDataStore(dataStore);
			 */
			setDataStore : function(dataStore){
				this._dataStore = dataStore;
			},
			
			/**
			 * @summary:
			 * 		得到DataStore
			 * @return:
			 * 		{unieap.ds.DataStore} 
			 * @example:
			 * |	rowset.getDataStore();
			 */
			getDataStore : function(){
				return this._dataStore;
			},
			
			/**
			 * @summary:
			 * 		更新一行数据
			 * @param 
			 * 		{number} rowIndex  
			 * 		行索引
			 * @param  
			 * 		{unieap.ds.Row} row
			 * 		 行对象
			 * @example:
			 *  |	var rowset = new unieap.ds.RowSet([
			 *  |	                 {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001"},
			 *  |	                 {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800",_s:true},
			 *  |	                 {attr_empno:"1002",NAME:"张韶涵",attr_job:"singer",attr_sal:"9500"}
			 *  |	]);
			 *  |	var row = rowset.getRow(0);
			 *  |	rowset.updateRow(1,row);
			 *  |	unieap.debug(rowset);
			 */
			updateRow : function(rowIndex,row){
				var buff = this._getBuff();
				if(buff[rowIndex]){
					buff[rowIndex]=dojo.mixin(row.getData(),{_s:buff[rowIndex]._s?true:false});
					return true;
				}
				return false;
			},
			
			
			/**
			 * @summary:
			 * 		设置指定行的某列值
			 * @param 
			 * 		{number} rowIndex 
			 * 		行下标
			 * @param 
			 * 		{string} name 
			 * 		列名
			 * @param 
			 * 		{string|Number|Null} value
			 * 		 列值
			 * @param 
			 * 		{sString} bufferName 
			 * 		缓冲区名称
			 * @example:
			 * |	var rowset = new unieap.ds.RowSet([
			 * |	               {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001"},
			 * |	               {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800"},
			 * |	               {attr_empno:"1002",NAME:"张韶涵",attr_job:"歌星",attr_sal:"9500"}
			 * |	]);
			 * |	rowset.setItemValue(0,"NAME","黄日华");
			 * |	unieap.debug(rowset);
			 */
			setItemValue : function(rowIndex,name, value,bufferName){
				this.getRow(rowIndex,bufferName).setItemValue(name,value);
			},
			
			/**
			 * @summary:
			 * 		设置指定行的某列日期值
			 * @param 
			 * 		{number} rowIndex
			 * 		 行下标
			 * @param 
			 * 		{string} name
			 * 		 列名
			 * @param 
			 * 		{Date} value
			 * 		 列值
			 * @param 
			 * 		{string} bufferName
			 * 		 缓冲区名称
			 * @example:
			 * |	var rowset = new unieap.ds.RowSet([
			 * |	               {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001"}
			 * |	]);
			 * |	var date = new Date();
			 * |	${1}rowset.setDate(0,"attr_hiredate",date); 
			 * |	unieap.debug(rowset);  
			 * ${1}设置rowset中行索引为0的row的“attr_hiredate”列的值为date
			 */
			setDate : function(rowIndex,name, value,bufferName){
				if(value instanceof Date){
					value = value.getTime();
				}
				this.getRow(rowIndex,bufferName).setItemValue(name,value);
			},
			
			/**
			 * @summary:
			 * 		获得指定行的某列值
			 * @param 
			 * 		{number} rowIndex
			 * 		 行下标
			 * @param 
			 * 		{string} name
			 * 		 列名
			 * @param 
			 * 		{string} bufferName
			 * 		缓冲区名称
			 * @return 
			 * 		{object} 
			 * 		列值
			 * @example:
			 * |	var rowset = new unieap.ds.RowSet([
			 * |	               {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001"}
			 * |	]);
			 * |	alert(rowset.getItemValue(0,"NAME","primary"));
			 */
			getItemValue : function(rowIndex,name, bufferName){
				return this.getRow(rowIndex,bufferName).getItemValue(name);
			},
			
			/**
			 * @summary:
			 * 		获得指定行的某列日期值
			 * @param 
			 * 		{number} rowIndex
			 * 		 行下标
			 * @param 
			 * 		{string} name
			 * 		 列名
			 * @param 
			 * 		{string} bufferName 
			 * 		缓冲区名称
			 * @return 
			 * 		{Date|null}
			 * 		 列值
			 * @example:
			 * |	var rowset = new unieap.ds.RowSet([
			 * |	               {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001",attr_hiredate:1260855744997}
			 * |	]);
			 * |	${1}rowset.getDate(0,"attr_hiredate","primary"); 
			 * ${1}获取 主缓冲区 行索引为0的row的“attr_hiredate”字段的日期值
			 */
			getDate : function(rowIndex,name, bufferName){
				var value = this.getRow(rowIndex,bufferName).getItemValue(name);
				return value?new Date(parseInt(value,10)):null;
			},
			
			/**
			 * @summary:
			 * 		获得指定行的某列整型值
			 * @param 
			 * 		{number} rowIndex
			 * 		 行下标
			 * @param 
			 * 		{string} name 
			 * 		列名
			 * @param 
			 * 		{string} bufferName
			 * 		缓冲区名称
			 * @return 
			 * 		{int|null} 
			 * 		列值
			 * @example:
			 * |	var rowset = new unieap.ds.RowSet([
			 * |	               {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001",attr_hiredate:1260855744997}
			 * |	]);
			 * |	alert(rowset.getInt(0,"attr_sal","primary"));
			 */
			getInt : function(rowIndex,name,bufferName){
				var value = this.getRow(rowIndex,bufferName).getItemValue(name);
				return value?parseInt(value,10):null;
			},
			
			/**
			 * @summary:
			 * 		获得指定行的某列浮点值
			 * @param 
			 * 		{number} rowIndex 
			 * 		行下标
			 * @param 
			 * 		{string} name
			 * 		 列名
			 * @param 
			 * 		{string} bufferName
			 * 		 缓冲区名称
			 * @return 	
			 * 		{float|null} 
			 * 		列值
			 * @example:
			 * |	var rowset = new unieap.ds.RowSet([
			 * |	               {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001",attr_hiredate:1260855744997}
			 * |	]);
			 * |	alert(rowset.getFloat(0,"attr_sal","primary"));
			 */
			getFloat : function(rowIndex,name,bufferName){
				var value = this.getRow(rowIndex,bufferName).getItemValue(name);
				return value?parseFloat(value,10):null;
			},
			
			/**
			 *@summary:
			 *		 获得指定行的某列原始值
			 * @param 
			 * 		{number} rowIndex 
			 * 		行下标
			 * @param 
			 * 		{string} name
			 * 		 列名
			 * @param 
			 * 		{string} bufferName
			 * 		 缓冲区名称
			 * @return 	
			 * 		{object} 
			 * 		列值
			 * @example:
			 * |	var rowset = new unieap.ds.RowSet([
			 * |	                 {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001"},
			 * |	                 {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800"},
			 * |	                 {attr_empno:"1002",NAME:"张韶涵",attr_job:"singer",attr_sal:"9500"}
			 * |	]);
			 * |	rowset.setItemValue(0,"NAME","郭靖");
			 * |	alert("原始值为:"+rowset.getItemOrigValue(0,"NAME","primary")+"\n"+"当前值为："+rowset.getItemValue(0,"NAME"));
			 */
			getItemOrigValue : function(rowIndex,name,bufferName){
				return this.getRow(rowIndex,bufferName).getItemOrigValue(name);
			},
			
			/**
			 * @summary:
			 * 		获得指定行的修改状态
			 * @param 
			 * 		{number} rowIndex 
			 * 		行下标
			 * @param 
			 * 		{string} bufferName
			 * 		 缓冲区名称
			 * @return 
			 * 		{number} 
			 * 		新增、修改、未变化
			 * @example:
			 * |	var rowset = new unieap.ds.RowSet([
			 * |	                 {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"9700",_t:1},                
			 * |	                 {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800"}, 
			 * |	                 {attr_empno:"1002",NAME:"张韶涵",attr_job:"singer",attr_sal:"9500"}   
			 * |	]);
			 * | 	${1}alert(rowset.getRowStatus(0,"primary"));
			 *  ${1}获取主缓冲区中行索引为0的修改状态，返回1为新增、2为未修改、3为已修改
			 */
			getRowStatus : function (rowIndex,bufferName){
				return this.getRow(rowIndex,bufferName).getRowStatus();
			},
			
			/**
			 * @summary:
			 *		 设置指定行的修改状态
			 * @param 
			 * 		{number} rowIndex 
			 * 		行下标
			 * @param 
			 * 		{number} status
			 * 		新增、修改、未变化
			 * @param 
			 * 		{string} bufferName
			 * 		 缓冲区名称
			 * @example:
			 * |	var rowset = new unieap.ds.RowSet([
			 * |	                 {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"9700",_t:1},                
			 * |	                 {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800"}, 
			 * |	                 {attr_empno:"1002",NAME:"张韶涵",attr_job:"singer",attr_sal:"9500"}   
			 * |	]);
			 * | 	${1}rowset.setRowStatus(0,3,"primary");
			 * |	unieap.debug(rowset);
			 *  ${1}修改primary缓冲区第0行为新增状态
			 * @description：
			 * 		状态位_t=1,表示该row为新增
			 * 		状态位_t=2或没有，表示该row没有变化
			 * 		状态位_t=3,表示该row被修改过
			 */
			setRowStatus : function (rowIndex,status,bufferName){
				this.getRow(rowIndex,bufferName).setRowStatus(status);
			},
			
			/**
			 * @summary:
			 * 		指定行是否选中
			 * @param 
			 * 		{number} rowIndex 
			 * 		行下标
			 * @param 
			 * 		{string} bufferName
			 * 		 缓冲区名称
			 * @return 
			 * 		{boolean} 
			 * @example:
			 * | 	var rowset = new unieap.ds.RowSet([
			 * |	                ${1} {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001",_s:true},    
			 * |	                 {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800"}                     
			 * |	]);
			 * |	${2}alert(rowset.isRowSelected(0));
			 * |	或
			 * |	alert(rowset.isRowSelected(0,"primary"));   
			 * ${1}状态位_s=true，表示该row被选中
			 * ${2}本例返回true
			 */
			isRowSelected : function (rowIndex,bufferName){
				return this.getRow(rowIndex,bufferName).isRowSelected();
			},		
			/**
			 * @summary:
			 * 		设置指定行的选中状态
			 * @param 
			 * 		{number} rowIndex 
			 * 		行下标
			 * @param 
			 * 		{boolean} selected 
			 * 		true/false
			 * @param 
			 * 		{string} bufferName 
			 * 		缓冲区名称
			 * @example:
			 * |	var rowset = new unieap.ds.RowSet([
		 	 * |	                 {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001"},                
			 * |	                 {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800"}, 
			 * |	                 {attr_empno:"1002",NAME:"张韶涵",attr_job:"singer",attr_sal:"9500"}   
			 * |	]);
			 * |	rowset.setRowSelected(0,true);
			 * |	unieap.debug(rowset);
			 */
			setRowSelected : function (rowIndex,selected,bufferName){
				this.getRow(rowIndex,bufferName).setRowSelected(selected);
			},
			
			/**
			 * @summary:
			 * 		清空指定行的数据
			 * @param 
			 * 		{number} rowIndex
			 * 		行下标
			 * @param 
			 * 		{string} bufferName
			 * 		缓冲区名称
			 * @example:
			 * |	var rowset = new unieap.ds.RowSet([
			 * |	               {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001"},
			 * |	               {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800"},
			 * |	               {attr_empno:"1002",NAME:"张韶涵",attr_job:"歌星",attr_sal:"9500"}
			 * |	]);
			 * |	unieap.debug(rowset);
			 * |	rowset.clear(0,"primary");
			 * |	unieap.debug(rowset);
			 */
			clear : function(rowIndex,bufferName){
				this.getRow(rowIndex,bufferName).clear(rowIndex);
			},
			
			/**
			 * @summary：
			 * 		RowSet收集策略
			 * @param：
			 * 		 {string} pattern
			 * 		 收集表达式
			 * @return
			 * 		 {unieap.ds.RowSet}
			 * @example:
			 * |	var rowset = new unieap.ds.RowSet([
			 * |	               ${1}{attr_empno:"1000",NAME:"黄蓉",attr_job:"演员",attr_sal:"1001",_s:true},         
			 * |	               ${2}{attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监",attr_sal:"8800",_t:1},      
			 * |	               ${3}{attr_empno:"1002",NAME:"张韶涵",attr_job:"歌星",attr_sal:"9500",_t:3}           
			 * |	]);
		 	 * |	
			 * |	${4}var rowset1 = rowset.collect("select");              
			 * |	${5}var rowset2 = rowset.collect("insert");              
			 * |	${6}var rowset3 = rowset.collect("update");              
			 * |	${7}var rowset4 = rowset.collect("delete"); 
			 * |	${8}var rowset5 = rowset.collect("auto");              
			 * |	${9}var rowset6 = rowset.collect("none");              
			 * |	${10}var rowset7 = rowset.collect("all");              
			 * ${1}被选中的行(用_s:true来标识)
			 * ${2}新增的行(用_t:1来标识)
			 * ${3}更新的行(用_t:3来标识)
			 * ${4}收集选中行
			 * ${5}收集新增行
			 * ${6}收集更新行
			 * ${7}收集delete缓冲区的行
			 * ${8}收集收集改变数据
			 * ${9}不收集任何数据
			 * ${10}收集所有的数据
			 */
			collect : function(pattern){
				var newRowSet = new unieap.ds.RowSet();
				switch(pattern){
					case "auto" : this._collectAuto(newRowSet) ; break;
					case "none" : this._collectNone(newRowSet) ; break;
					case "all" : this._collectAll(newRowSet) ; break;
					case "update" : this._collectUpdate(newRowSet) ; break;
					case "delete" : this._collectDelete(newRowSet) ; break;
					case "insert" : this._collectInsert(newRowSet) ; break;
					case "select" : this._collectSelect(newRowSet); break;
					default : 
						if(dojo.isFunction(pattern)) 	this._collectCallback(newRowSet,pattern);  break;
				}
				newRowSet.setDataStore(this.getDataStore());
				return newRowSet;
			},
			
			//收集所有的数据
			_collectAll : function(newRowSet){
				newRowSet["primary"] = this["primary"] ;
				newRowSet["filter"] = this["filter"];
				newRowSet["delete"] = this["delete"] ;
			},
			//不收集任何数据
			_collectNone : function(newRowSet){
				newRowSet["primary"] = [] ;
				newRowSet["filter"] = [] ;
				newRowSet["delete"] = [] ;
			},
			//自动收集改变数据
			_collectAuto : function(newRowSet){
				var callback = function(row){
					if(row.getRowStatus()==__status.DATAMODIFIED||row.getRowStatus()==__status.NEWMODIFIED)
						return true;
					return false;
				};
				this._collectBuffer(newRowSet,callback,__buffer.PRIMARY);
				this._collectBuffer(newRowSet,callback,__buffer.FILTER);
				this._collectDelete(newRowSet);
			},
			//收集删除数据，排除新增的
			_collectDelete : function(newRowSet){
				this._collectBuffer(newRowSet,function(row){
					if(row.getRowStatus()!=__status.NEWMODIFIED)
						return true;				
					return false;
				},__buffer.DELETE);
			},
			//收集修改的
			_collectUpdate : function(newRowSet){
				var callback = function(row){
					if(row.getRowStatus()==__status.DATAMODIFIED)
						return true;
					return false;
				};
				this._collectBuffer(newRowSet,callback,__buffer.PRIMARY);
				this._collectBuffer(newRowSet,callback,__buffer.FILTER);
			},
			//收集新增的
			_collectInsert : function(newRowSet){
				var callback = function(row){
					if(row.getRowStatus()==__status.NEWMODIFIED)
						return true;
					return false;
				};
				this._collectBuffer(newRowSet,callback,__buffer.PRIMARY);
				this._collectBuffer(newRowSet,callback,__buffer.FILTER);
			},
			//收集选中的记录
			_collectSelect : function(newRowSet){
				var callback = function(row){
					if(row.isRowSelected())
						return true;
					return false;
				};
				this._collectBuffer(newRowSet,callback,__buffer.PRIMARY);
				this._collectBuffer(newRowSet,callback,__buffer.FILTER);
				this._collectBuffer(newRowSet,callback,__buffer.DELETE);
			},
			//自定义收集
			_collectCallback : function(newRowSet,callback){
				this._collectBuffer(newRowSet,callback,__buffer.PRIMARY);
				this._collectBuffer(newRowSet,callback,__buffer.FILTER);
				this._collectBuffer(newRowSet,callback,__buffer.DELETE);
			},		
			//收集指定缓冲区数据
			_collectBuffer : function(newRowSet, callback,bufferName){
				var buffer = newRowSet._getBuff(bufferName);
				try{
					this.forEach(function(row){
						if(callback(row,bufferName)){
							buffer.push(row.getData());
						}
					},null,null,bufferName);		
				}catch(e){
					//对于一些不需要收集的buffer，直接抛出一个Error即可跳出				
				}	
			},
			
			
			/*
			 * @summary:
			 * 		使其只有一个主键
			 * @param 
			 * 		{string} name 
			 * 		列名称，可以是联合主键
			 * @return 
			 * 		{array} 
			 * 		重复主键记录
			 */
			doPrimaryKey : function(name){
				if(arguments.length<1) return;
				var filterKeyMap = {}, 
					  arg = arguments,
					  result = new Array(),
					  buff = this._getBuff(), 
					  getKey = (arguments.length==1) && function(data){
					  		return data[name];
					  }|| function(data){
					  	  var keys = [];
					      for(var i=arg.length-1;i>=0;i--){
					      	  keys.push(data[arg[i]]);
					      }
					      return keys.join("_");
					  };
				for(var i=buff.length -1;i>=0;i--){
					var key = getKey(buff[i]);
					filterKeyMap[key] && result.push(buff.splice(i,1)[0]) || (filterKeyMap[key]  =1);
				}
				return result;
			},
			
			
			/*
			 * @summary:
			 * 		追加记录
			 * @param:
			 * 		{unieap.ds.RowSet} rowSet
			 * @param:
			 * 		{string} coverage	
			 * 		replace : 替换;
			 *      append : 追加记录，默认;
			 *      union : 取列并集;
			 * @example:
			 * |	 var rowset = new unieap.ds.RowSet([
			 * |	               {attr_empno:"1000",NAME:"黄蓉",attr_job:"演员"},
			 * |	               {attr_empno:"1001",NAME:"齐衷斯",attr_job:"技术总监"},
			 * |	               {attr_empno:"1002",NAME:"张韶涵",attr_job:"歌星"}
			 * |	]);
			 * |	var rowset1 = new unieap.ds.RowSet([
			 * |	                  {attr_empno:"1003",NAME:"Rose",attr_job:"演员"},
			 * |	                  {attr_empno:"1004",NAME:"Tony",attr_job:"技术总监"},
			 * |	                  {attr_empno:"1005",NAME:"Bill",attr_job:"软件工程师"}
			 * |	]);
			 * |	rowset.append(rowset1,"replace");   
			 * |	rowset.append(rowset1,"append");   
			 * |	rowset.append(rowset1,"union");     
			 */
			append : function(rowSet,coverage){
				if(this == rowSet) return;
				switch(coverage){
					case "replace" :
						this["primary"] = rowSet["primary"];	
						this["filter"] = rowSet["filter"];
						this["delete"] = rowSet["delete"];
						this.initialCount = this["primary"].length;
						break;
					case "append" :
						Array.prototype.push.apply(this["primary"],rowSet["primary"]);
						Array.prototype.push.apply(this["filter"],rowSet["filter"]);
						Array.prototype.push.apply(this["delete"],rowSet["delete"]);
						this.initialCount += rowSet["primary"].length;
						break;
					case "union" : 
						if(this["primary"].length == rowSet["primary"].length){
							for(var i=0,data; (data = this["primary"][i]);i++){
								dojo.mixin(data,rowSet["primary"][i]);
							}
						}
				}
			},
			
		   /**
			* @summary:
			* 		克隆RowSet
			* @description：
			* 		克隆一个新的RowSet
			* @example:
			*  |	var newRowSet = oldRowSet.clone();
			*/
			clone : function(){
				var object = dojo.fromJson(this.toJson());
				var newRowSet = new unieap.ds.RowSet(object);
				return newRowSet;
			},
			
		   /**
			* @summary:
			* 		根据RowSet对象行集记录自动生成完整的树形结构	
			* @description：
			*		遍历一遍循环生成树结构，结构形如：{data:{id:"rootId",label:"根节点"},children:[{...},{...}]}
			* @param：
			* 		{object} data
			* 		传入的构造树的必要条件，id树唯一标识字段名称、parent父节点字段名称、root树根节点标识
			* @return:
			*		返回树根节点
			* @example:
			* |	${1}var treeRowset = new unieap.ds.RowSet([
			* |	                  {nodeID:"1000",parentID:"", title:"黄蓉",isLeaf:false},
			* |	                  {nodeID:"1001",parentID:"1000", title:"齐衷斯",isLeaf:true},
			* |	                  {nodeID:"1002",parentID:"1000", title:"张韶涵",isLeaf:true}
			* |	]);
			* |	
			* |	unieap.debug(treeRowset.generateTreeSet({id:"nodeID",parent:"parentID",label:"title",leaf:"isLeaf",root:"1000"}));
			* ${1}定义一个RowSet对象
			*  @img：
		    * 		images/ds/rowSet/generateTreeSet.png
			*/
			generateTreeSet : function(data){
				var pri = this["primary"], cm = {}, row , 
					ei , ep, id = data["id"] , 
					parent=data["parent"],
					props = data["props"];
				for(var i=0;(row = pri[i]);i++){
					ei = row[id];
					ep = row[parent]==null ? null : row[parent];
					(cm[ei] || (cm[ei]={}))["data"] = row;
					for(var key in props){
						cm[ei][key] = props[key];
					}
					if(!cm[ep]){
						cm[ep]={};
					}
					if(!cm[ep]["children"]){
						cm[ep]["children"] = [];
					}
					cm[ep]["children"].push(cm[ei]);
				}
				if(!cm[data["root"]]){
					return {};
				}
				if(!("data" in cm[data["root"]])){
					(cm[data["root"]]["data"] = {})[id] = data["root"];
				}
				return cm[data["root"]];
			} 
		}); 
	})();
}	
//@ sourceURL=/tp_fp/techcomp/ria/dojo/../unieap/ds/RowSet.js