var unieap=unieap||{};
unieap.ds=unieap.ds||{};
unieap.ds.Status = {
     NEWMODIFIED: 1,
     NOTMODIFIED: 2,
     DATAMODIFIED: 3
 };
 unieap.ds.Buffer = {
      PRIMARY: 0,
      FILTER: 1,
      DELETE: 2
 };
 $.fromJson = function(/*String*/ json){
		return eval("(" + json + ")"); // Object
};
$._escapeString = function(/*String*/str){
	return ('"' + str.replace(/(["\\])/g, '\\$1') + '"').
		replace(/[\f]/g, "\\f").replace(/[\b]/g, "\\b").replace(/[\n]/g, "\\n").
		replace(/[\t]/g, "\\t").replace(/[\r]/g, "\\r"); // string
};
unieap.ds.DataCenter=function(dataCenter){
	this.clear();
	if (!dataCenter||($.type(dataCenter)=="string"&&!typeof(dataCenter=$.fromJson(dataCenter))=="object"))  return;
	if (dataCenter.header) {
		$.extend(this.header,dataCenter.header);
	}
	if (dataCenter.body) {
		this.parameters = dataCenter.body.parameters;
	}
	var _d = dataCenter.body.dataStores;
	for (_dataStore in  _d) {
		this.dataStores[_dataStore] = new unieap.ds.DataStore(_dataStore, _d[_dataStore]);				
	};
}
unieap.ds.DataCenter.prototype={
		append : function(dc,coverage,p){
			if(dc==this) return ;
			!p && (p=[]); 
			var h = {};
			for(var i=0;p[i];i++){
				this.header[p[i]] && (h[p[i]] = this.header[p[i]]);
			}
			$.extend(this.header,dc.header || {},h);
			var _temp = dc["parameters"];
			for(var item in _temp){
				if(!(item in this["parameters"]) || coverage){
					this["parameters"][item] = dc["parameters"][item];
				}
			}
			_temp = dc["dataStores"];
			for (var item in _temp) {
				if(item in this["dataStores"]){
					this["dataStores"][item].append(dc["dataStores"][item],coverage);
					if(coverage=="replace"){
						dc["dataStores"][item] = this["dataStores"][item];
					}
				}
				else{
					this["dataStores"][item] = dc["dataStores"][item];
				}
			}
		},
		getParameter: function(name) {
			return this.parameters[name];
		}, 
		
		addParameter:function(name, value) {
			if (typeof this.parameters[name] == "array" || this.parameters[name] instanceof Array) {
				this.parameters[name].push(value);
			}
			else{
				this.parameters[name] = value;
			}
		},
		setParameter : function(name, value){
			this.parameters[name] = value;
		},
		getDataStore: function(name) {
			return this.dataStores[name];
		},
		
		getSingleDataStore:function(){
			if(this.dataStores){
				for(var name in this.dataStores){
					return this.dataStores[name];
				}
			}
			return null;
		},
		
		
		getDataStores: function () {
			return this.dataStores;
		},
		
		addDataStore: function (name, dataStore,type) {
			if(arguments[0]==null) return;
			if(typeof(arguments[0])=="object"){
				arguments.length== 2 && (type = arguments[1]);
				dataStore = arguments[0];
				name = dataStore.getName();
			} 
			dataStore.setName(name);
			type && dataStore.setType(type);
			this.dataStores[name] = dataStore;
		},

		removeDataStore: function( name) {
			delete this.dataStores[name];
		},
		
		clear: function() {
				this.header = { 
					code:0,
					message:{
						title:"",
						detail:""
					}
				};
				this.parameters = {};
				this.dataStores = {};
		},
		isEmpty : function(){
			var _empty = unieap.isEmpty;
			return (_empty(this.parameters) && _empty(this.dataStores));
		},
		toJson : function(){
				var store = [],body=[],result=[];
				result.push("{");
				result.push("header:");
				result.push($.toJSON(this.header));
				result.push(",");
				result.push("body:{");				
				for(var dataStore in this.dataStores){
					store.push(("\""+dataStore+"\"").concat(":").concat(this.dataStores[dataStore].toJson()));
				}
				body.push("dataStores:{".concat(store.join(",")).concat("}"));
				body.push("parameters:".concat($.toJSON(this.parameters)));
				result.push(body.join(","));
				result.push("}}");
				return result.join("");				
		}
	};

/*unieap.ds.DataStore*/
unieap.ds.DataStore=function(name, dataStore){
	this._initData();
	if (arguments.length == 2) {
		this.name = name;
		this._loadData(dataStore);					
	}
	else if (arguments.length == 1){
		var _temp = arguments[0];
		if(typeof _temp =="object") {						
			this._loadData(_temp);		
		}
		else{	
			this.name = _temp;	
		}
	}
	this.rowSet.setDataStore(this);
};

unieap.ds.DataStore.prototype={
		_initData : function(){
			this.name = "";
			this.pageNumber = 1;
			this.pageSize = 2147483647;
			this.recordCount = 0;
			this.rowSet=new unieap.ds.RowSet();
		},
		
		//加载数据
		_loadData : function(dataStore){
			if(dataStore instanceof Array){
				this.setRecordCount(dataStore.length);
				this.rowSet = new unieap.ds.RowSet(dataStore);
				return;
			}
			if(dataStore.rowSet){
				this.rowSet = new unieap.ds.RowSet(dataStore.rowSet);
				delete dataStore["rowSet"];
			}				
			$.extend(this,dataStore);
		},	
		
		setPageSize: function(pageSize) {
			this.pageSize =pageSize;
		},
		
		setPageNumber: function(pageNo) {
			this.pageNumber = pageNo;
		},
		
		setRowSetName:function(rowSetName){
			this.rowSetName =rowSetName;
		},
		setRecordCount : function(recordCount){
			this.recordCount = recordCount;
		},
		
		setRowSet : function(rowSet){
			this.rowSet = rowSet;
			this.rowSet.setDataStore(this);
			this.recordCount=this.rowSet.getTotalCount();
		},
		
		setType : function(type){
			this.type = type;
		},
		setName: function(name) {
			this.name = name;
		},
		getName: function() {
			return this.name;
		},
		getPageSize: function() {
			return this.pageSize;
		},
		getRecordCount: function() {
			return this.recordCount;
		},
		
		getPageNumber: function() {
			return this.pageNumber;
		},
		
		getRowSet: function() {
			return this.rowSet;
		},
		
		getRowSetName : function(){
			return this.rowSetName;
		},
		toJson : function(){
			var result = [];
			result.push("rowSet:".concat(this.rowSet.toJson()));
			result.push("name:\"".concat(this.name).concat("\""));
			result.push("pageNumber:".concat(this.pageNumber));
			result.push("pageSize:".concat(this.pageSize));
			result.push("recordCount:".concat(this.recordCount));
			this.rowSetName && result.push("rowSetName:\"".concat(this.rowSetName).concat("\""));
			this.order && result.push("order:\"".concat(this.order).concat("\""));
			this.conditionValues && result.push("conditionValues:".concat($.toJSON(this.conditionValues)));
			this.parameters && result.push("parameters:".concat($.toJSON(this.parameters)));
			this.metaData && result.push("metaData:".concat($.toJSON(this.metaData)));
			if(this.statementName&&this.statementName!=""){
				this.statementName && result.push("statementName:\"".concat(this.statementName).concat("\""));
				this.attributes && result.push("attributes:".concat($.toJSON(this.attributes)));
			}else{		
				this.condition && result.push("condition:\"".concat(this.condition).concat("\""));	
				this.group && result.push("group:\"".concat(this.group).concat("\""));	
			}		
			this.pool && result.push("pool:\"".concat(this.pool).concat("\""));		
			this.statistics && result.push("statistics:".concat($.toJSON(this.statistics)));
			this.distinct && result.push("pool:".concat(this.distinct));	
			return "{".concat(result.join(",").concat("}"));
		},
		
		clone : function(dsName){
			if(!this  instanceof unieap.ds.DataStore) return;
			var returnStore = new unieap.ds.DataStore(dsName);
			var properties = ["pageNumber","recordCount","pageSize","rowSetName","order","condition","conditionValues","parameters","metaData","statementName","attributes","group","pool","statistics","distinct"];
			for(var i = 0,name;(name=properties[i]);i++){
				returnStore[name] =this[name];
			}
			var newRowSet = this.getRowSet().clone();
			returnStore.setRowSet(newRowSet);
			return returnStore;
		},
		getParameter: function(name) {	
			if(!this.parameters){this.parameters={}}
			var value = this.parameters[name];
			if (value != "undefined" ) {
				if (typeof value == "array" || value instanceof Array){
					return value[0];
				}
				return value;
			} 
		}, 
		
		addParameter:function(name, value) {	
			if(!this.parameters){this.parameters={}}
			if (typeof this.parameters[name] == "array" || this.parameters[name] instanceof Array) {
				this.parameters[name].push(value);
			}
			else{			
				this.parameters[name] = value;
			}
		},
		setParameter : function(name, value){	
			if(!this.parameters){this.parameters={}}
			this.parameters[name] = value;
		},
		
		removeParameter: function(name){
			delete this.parameters[name];
		}
		
	};

/*unieap.ds.RowSet*/

(function(){
	var __status = unieap.ds.Status;
	var __buffer = unieap.ds.Buffer;
	unieap.ds.RowSet=function(data){
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
	};
	unieap.ds.RowSet.prototype={		
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
		toBufJson : function(name){	
			var buf = this._getBuff(name),result = [],item,value;
			for(var i=0,_o,data,key,record;(data=buf[i]);i++){
				_o=data["_o"];
				delete data["_o"];
				record = [];					
				for(key in data){
					item = [];		
					item.push("\"")	;	
					item.push(key);
					item.push("\"")	;
					item.push(":");
					value = data[key];
					if($.type(value)=="string"){
						item.push($._escapeString(value));
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
						if($.type(value)=="string"){
							item.push($._escapeString(value));
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
		getData: function(bufferName) {
			return this._getBuff(bufferName);
		},
				
		getRowCount : function(bufferName){
			var buff = this._getBuff(bufferName); 
			return buff.length;
		},
		
		getTotalCount : function()
		{
			return (this["primary"].length + this["filter"].length + this["delete"].length);
		},
		
		isEmpty: function() {
			return 0 == this.getTotalCount();
		},
		
		reset : function(){
			this["primary"] = [];
			this["filter"] = [];
			this["delete"] = [];
		},
		
		addRow : function (data, clone, keepStatus,setDefValue){	
			data = this._buildRow(data,clone,keepStatus,setDefValue);
			var newRowIndex = this["primary"].length;
			this["primary"].push(data);	
			var row = new unieap.ds.Row(this, data, newRowIndex);
			if(keepStatus != true){
				row.setRowStatus(__status.NEWMODIFIED);
			}
			return row;
		},
		
		addRows : function(data,setDefValue,isNotNewModified){
			if(!data) data = [];
			if(!(typeof data == "array" || data instanceof Array)) data = [data];
			for(var i=0;i<data.length;i++){
				data[i]=this._buildRow(data[i],null,null,setDefValue);
				var row=new unieap.ds.Row(this,data[i]);
				if(!isNotNewModified)
					row.setRowStatus(__status.NEWMODIFIED);
				this["primary"].push(data[i]);
			 }
		},
		
		insertRow : function(data, rowIndex, clone,keepStatus,setDefValue){
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
			return row;
		},
		
		
		deleteRow : function (rowIndex){
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
			return row;
		},
		
		
		deleteRows : function (data){
			data = $.clone(data).sort(function(a,b){
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
		},
		
		
		deleteAllRows : function(){
			var _p = this["primary"].concat(this["filter"]);
			
			_p=dojo.filter(_p,function(row){
				return row._t != 1;
			})
			this["delete"] = this["delete"].concat(_p);
			this["primary"] = [];
			this["filter"] = [];
		},
		
		getRow : function(rowIndex, bufferName)
		{
			var buff = this._getBuff(bufferName);
			if(!buff[rowIndex])
				return null;
			return new unieap.ds.Row(this,buff[rowIndex], rowIndex);
		},
		
		getRows : function(bufferName,beginIndex,endIndex){
			var arr = [];
			this.forEach(function(row){
				arr.push(this.getRow(row.getIndex(),bufferName));
			},beginIndex,endIndex,bufferName,this);
			return arr;	
		},
		
		getRowData : function(rowIndex, bufferName)
		{
			var buff = this._getBuff(bufferName);
			if((rowIndex == null) || (rowIndex < 0)||(rowIndex >= buff.length ))	
				return null;
			return buff[rowIndex];
		},
		
		
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
			return data;
		},
		_cloneRow	: function(data, all){
			all = all || false;
			var d = $.extend(true,{},data) || {};
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
		
		setDataStore : function(dataStore){
			this._dataStore = dataStore;
		},
		
		getDataStore : function(){
			return this._dataStore;
		},
		updateRow : function(rowIndex,row){
			var buff = this._getBuff();
			if(buff[rowIndex]){
				buff[rowIndex]=$.extend(row.getData(),{_s:buff[rowIndex]._s?true:false});
				return true;
			}
			return false;
		},
		updateRowData : function(rowIndex,data){
			var buff = this._getBuff();
			if(buff[rowIndex]){
				buff[rowIndex]=$.extend(data,{_s:buff[rowIndex]._s?true:false});
				return true;
			}
			return false;
		},
		
		setItemValue : function(rowIndex,name, value,bufferName){
			this.getRow(rowIndex,bufferName).setItemValue(name,value);
		},
		
		setDate : function(rowIndex,name, value,bufferName){
			if(value instanceof Date){
				value = value.getTime();
			}
			this.getRow(rowIndex,bufferName).setItemValue(name,value);
		},
		
		getItemValue : function(rowIndex,name, bufferName){
			return this.getRow(rowIndex,bufferName).getItemValue(name);
		},
		
		getDate : function(rowIndex,name, bufferName){
			var value = this.getRow(rowIndex,bufferName).getItemValue(name);
			return value?new Date(parseInt(value,10)):null;
		},
		
		getInt : function(rowIndex,name,bufferName){
			var value = this.getRow(rowIndex,bufferName).getItemValue(name);
			return value?parseInt(value,10):null;
		},
		
		getFloat : function(rowIndex,name,bufferName){
			var value = this.getRow(rowIndex,bufferName).getItemValue(name);
			return value?parseFloat(value,10):null;
		},
		
		getRowStatus : function (rowIndex,bufferName){
			return this.getRow(rowIndex,bufferName).getRowStatus();
		},
		
		setRowStatus : function (rowIndex,status,bufferName){
			this.getRow(rowIndex,bufferName).setRowStatus(status);
		},
		
		
		clear : function(rowIndex,bufferName){
			this.getRow(rowIndex,bufferName).clear(rowIndex);
		},
		clone : function(){
			var object = $.fromJson(this.toJson());
			var newRowSet = new unieap.ds.RowSet(object);
			return newRowSet;
		}
}; 
})();

/*unieap.ds.Row*/

(function(){
	//rowHelper对象
	var __status = unieap.ds.Status;
	var __buffer = unieap.ds.Buffer;
	var _rf = {};
	_rf._getRowStatus = function(row){
		return row._t || __status.NOTMODIFIED;
	}
	_rf._setRowStatus = function(row, status){
		row._t = status;
	}
	_rf._isRowSelected = function(row){
		return (row._s == true);
	}
	_rf._setRowSelected = function(row, selected){
		row._s = selected;
	}
	
	_rf._getItemValue = function(row, name){
		return row[name];
	}
	_rf._getItemOrigValue = function(row, name){
		if ((row._o == null) || (typeof row._o[name] == "undefined")) 
			return _rf._getItemValue(row, name);
		return row._o[name];
	}
	_rf._setItemValue = function(row, name, value, nullable){
		var old = name in row ? row[name]:null;
		//公卫：nullable为false时，value不可以为null，应该将""或者null统一改为""
		value = nullable ? value : (value === "" || value === null ? "" : value);
		if (old === value) 
			return;
		row[name] = value;
		if (!row._o) {
			(row._o = {})[name] = old;
		}
		else {
			if (!(name in row._o)) {
				row._o[name] = old;
			}
			else 
				if (value == row._o[name]) {
					delete row._o[name];
					unieap.isEmpty(row._o) && delete row._o;
				}
		}
		if (_rf._getRowStatus(row) != __status.NEWMODIFIED) {
			if (row._o) {
				_rf._setRowStatus(row, __status.DATAMODIFIED);
			}
			else {
				delete row._t;
			}
		}
		return true;
		
	}
	_rf._isItemChanged = function(row, name){
		if (!row._o || !(name in row._o)) 
			return false;
		if (row._o[name]==''&&row[name]==null&&$.type(row._o[name])=="string") return false;
		if (row._o[name]==null&&row[name]==''&&$.type(row[name])=="string") return false;
		return (row._o[name] != row[name]);
	}
	
	_rf._resetUpdate = function(row){
		delete row._t;
		delete row._o;
	}


unieap.ds.Row=function(rowset, data, index){
	(this.rowset = rowset) && (this._e = (rowset.onItemChanging || rowset.onItemChanged));
	this.data = data;
	this.index = index;
};
unieap.ds.Row.prototype={
		getRowStatus : function (){
			return _rf._getRowStatus(this.data);
		},
		setRowStatus : function (status)
		{
			_rf._setRowStatus(this.data, status);
		},
		
		getData: function() {
			return this.data;
		},
		
		getRowSet: function() {
			return this.rowset;
		},
		
		getIndex: function() {
			return this.index;
		},
		
		getItemValue : function(name)
		{
			var v = null;
			return (v=_rf._getItemValue(this.data, name)) !=null ?v:null;
		},
		
		getItemOrigValue : function(name)
		{
			return _rf._getItemOrigValue(this.data, name);
		},
		
		setItemValue : function(name, value,nullable)
		{
			var old = this.data[name];
			if(old === value) return false;
			
			//设置该字段的值
			_rf._setItemValue(this.data, name, value,nullable);
			return true;
		},
		
		isItemChanged : function(name)
		{
			return _rf._isItemChanged(this.data, name);
		},
		
		isModified : function(){
              return !unieap.isEmpty(this.data["_o"]);
         }, 
		  
		resetUpdate : function()
		{
			_rf._resetUpdate(this.data);
		},
		
		discardUpdate : function(){
			if(this.getRowStatus()==__status.DATAMODIFIED){
				delete this.data._t;
			}
			var orig = this.data._o;
			for(var p in orig){
				this.data[p] = orig[p];
			}				
			delete this.data._o;
		},
		
		clear : function(){
			var _t,_s,_o;
			(_t=this.data["_t"]) && delete this.data["_t"];
			(_s = this.data["_s"]) && delete this.data["_s"];
			( _o = (this.data["_o"] || {})) && delete this.data["_o"];
			for(var item in this.data){
				typeof(_o[item])!="undefined" || (_o[item] = this.data[item]);
				delete this.data[item] ; 
			}
			_s && (this.data["_s"] = true);
			if(_t==__status.NEWMODIFIED ){
				(this.data["_t"] = __status.NEWMODIFIED) && !unieap.isEmpty(_o) &&(this.data["_o"] = _o);
			}
			else if(!unieap.isEmpty(_o)){
				(this.data["_t"] = __status.DATAMODIFIED) && (this.data["_o"] = _o);
			}
		}
};
})();
