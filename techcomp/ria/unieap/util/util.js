if(!dojo._hasResource["unieap.util.util"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["unieap.util.util"] = true;
dojo.require("unieap.global");
dojo.provide("unieap.util.util");
	/**
	 * @declaredClass:
	 * 		unieap.util.util
	 * @summary:
	 * 		公共静态方法，直接调用无需实例化
	 */
	
(function(){

	String.prototype.startWith = function(string){
		return this.indexOf(string)==0;
	};
	
	String.prototype.endWith = function(string) {
		return this.lastIndexOf(string)==this.length - string.length;
	};
	
	String.prototype.getName = function(){
		return this;
	};
	
	/*
	 * 左补齐字符串
	 * @param nSize
	 * 		要补齐的长度
	 * @param ch
	 * 		要补充的字符
	 * @return
	 */
	String.prototype.padLeft = function(nSize, ch) {
		var len = 0;
		var s = this? this:"";
		ch = ch? ch:"0";//默认补0
		len = s.length;
		while (len<nSize) {
			s = ch + s;
			len++;
		}
		return s;
	}
	
	/*
	 * 右补齐字符串
	 * @param nSize
	 * 		要补齐的长度
	 * @param ch
	 * 		要补齐的字符
	 * @return
	 */
	String.prototype.padRight = function(nSize, ch) {
		var len = 0;
		var s = this? this:"";
		ch = ch? ch:"0";//默认补0
		len = s.length;
		while(len<nSize) {
			s = s+ch;
			len++;
		}
		return s;
	}
	
	/*
	 * 左移小数点位置，用于数学计算，相当于除以Math.pow(10,scale)
	 * @param scale
	 * 		要移位的刻度
	 * @return
	 */
	String.prototype.movePointLeft = function(scale) {
		var s, s1, s2, ch, ps, sign;
		ch = ".";
		sign = "";
		s = this? this:"";
		
		if (scale <= 0) return s;
		ps = s.split(".");
		s1 = ps[0]? ps[0]:"";
		s2 = ps[1]? ps[1]:"";
		if (s1.slice(0,1) == "-") {
			s1 = s1.slice(1);
			sign = "-";
		}
		if (s1.length <= scale) {
			ch = "0.";
			s1 = s1.padLeft(scale);
		}
		return sign+s1.slice(0,-scale)+ch+s1.slice(-scale)+s2;
	}
	
	/*
	 * 右移小数点位置，用于数学计算，相当于乘以Math.pow(10,scale)
	 * @param scale
	 * 		要移位的刻度
	 * @return
	 */
	String.prototype.movePointRight = function(scale) {
		var s, s1, s2, ch, ps;
		ch = ".";
		s = this? this:"";
		if (scale <= 0) return s;
		ps = s.split(".");
		s1 = ps[0]? ps[0]:"";
		s2 = ps[1]? ps[1]:"";
		if (s2.length <= scale) {
			ch = "";
			s2 = s2.padRight(scale);
		}
		return s1+s2.slice(0, scale)+ch+s2.slice(scale, s2.length);
	}
	
	String.prototype.movePoint = function(scale) {
		if (scale >= 0)
			return this.movePointRight(scale);
		else
			return this.movePointLeft(-scale);
	}
	
	unieap.version=(function() {
		var v = {
			major: 3, minor: 5, patch: 1, flag: "M20120405",
			toString: function() {
				return this.major+"."+this.minor+"."+this.patch+this.flag;
			}
		};
		return v;
	})();
	
	/**
	 * @summary:
	 * 		去除数组中重复的元素
	 * @example:
	 * |<script>
	 * | var data = [1,2,1,6,6,6,8,2];
	 * | ${1}unieap.array_unique(data);
	 * | unieap.debug(data);
	 * |</script>
	 *  ${1}过滤后的数组为：[1,2,6,8];
	 */
	unieap.array_unique=function(inArray){
		if(!dojo.isArray(inArray)) return;
    	var obj={};
		var res=[];
		for(var i=0,l=inArray.length;i<l;i++){
			obj[inArray[i]]=1;
		}
		for(var value in obj){
			res.push(value);
		}
		return res;
	};
	
	
	/**
	 * @summary:
	 * 		取得翻译值
	 * @param:
	 * 	 {string} key：max\min\avg\sum
	 * @example:
	 * |<script>
	 * | alert(unieap.translate("max"));
	 * |</script>
	 */
	unieap.translate=function(key){
		return {
			//最大值
			"max":RIA_I18N.util.util.max,
			//最小值
			"min":RIA_I18N.util.util.min,
			//平均值
			"avg":RIA_I18N.util.util.avg,
			//合计值
			"sum":RIA_I18N.util.util.sum
		}[key]
	};
	
	function _getItemValueIgnoreCase(item,name){
		var itemValue = item[name];
		if(itemValue)
			return itemValue;
		var nameLowerCase = name.toLowerCase();
		var itemLowerCaseValue = item[nameLowerCase];
		if(itemLowerCaseValue)
			return itemLowerCaseValue;
		var nameUpperCase = name.toUpperCase();
		var itemUpperCaseValue = item[nameUpperCase];
		if(itemUpperCaseValue)
			return itemUpperCaseValue;
		for(key in item){
			if(key.toLowerCase() == name.toLowerCase()){
				return item[key];
			}
		}
		return null;
	};
	
	//添加转义库
	function addtranscode(data,dc){
		var topWin = unieap.getTopWin(),
			transcodeBase = topWin.transcodeBase || (topWin.transcodeBase = {}),
			key = [data.store.getName(),data.valueAttr,data.displayAttr].join("_"),
			store = unieap.getDataStore(data.store,dc,true);	
		if(store){
			var _map =transcodeBase[key] ||(transcodeBase[key]={});
			store.getRowSet().forEach(function(row){
//				_map[row.getItemValue(data.valueAttr)] = row.getItemValue(data.displayAttr);
				_map[_getItemValueIgnoreCase(row.getData(),data.valueAttr)] = _getItemValueIgnoreCase(row.getData(),data.displayAttr);
			});
			return _map;
		}
		return null;
	};
		
	/**
	 * @summary:
	 * 		字符转义，用于codelist和Tree等组件值转义
	 * @param：
	 * 		{string} inValue 
	 * 		用于转义的输入值
 	 * @param：
 	 * 		{object|string} 
 	 * 		data 传递数据对象，以下是内部数据定义 
	 * 		{object} store codelist对象
	 * 		{string} codevalue 对应值列名称,默认为CODEVALUE;
	 * 		{string} codename 对应显示值列名称,默认为CODENAME;
	 * @return：
	 * 		{string} 转义后的值或传入值
	 * @example：
	 * |<script>
	 * | var text = unieap.transcode("25",${1}"nation");
	 * | alert(text);
	 * |</script>
	 * ${1}直接指定转义store的名称
	 * @example:
	 * |<script>
	 * | var data = {store:"dept",${1}valueAttr:"deptno",${2}displayAttr:"deptname"};
	 * | var text = unieap.transcode("20",data);
	 * | alert(text);
	 * |</script>
	 * ${1}指定转义值对应的列名
	 * ${2}指定转义显示文本的列名
	 */
	unieap.transcode = function(inValue,data,dc){  
		var topWin = unieap.getTopWin(),
			transcodeBase = topWin.transcodeBase || (topWin.transcodeBase = {});
		data = dojo.isString(data) && {store:data} || data;
		data = dojo.mixin({valueAttr :"CODEVALUE" ,displayAttr :"CODENAME"},data);
		var key = [data.store.getName(),data.valueAttr,data.displayAttr].join("_"),
			base = transcodeBase[key];
		if(null == base){ 
			addtranscode(data,dc);
		}			
		if(null == (base = transcodeBase[key])) {
			return inValue;
		} else {
			var values = String(inValue).split(',');
			for(var i=0; i<values.length; i++) {
				values[i] = base[values[i]];
			}
			return values.join(',');
		}
	};
	//删除逻辑转义的store
	unieap.transcode.clear = function(name){
		var topWin = unieap.getTopWin(),
			transcodeBase = topWin.transcodeBase || (topWin.transcodeBase = {});
		if(name==null){
			topWin.transcodeBase = {};
			return;
		}
		for(var key in transcodeBase){
			if(key.indexOf(name+"_")>=0){
				delete transcodeBase[key];
			}
		}
	};
	
	
	/**
	 * @summary:
	 * 		获取指定转义代码字典表
	 * @param :
	 * 	 {String} name 
	 *    代码类别
	 * @param :
	 * 	 {String} codevalue 
	 *     代码值列名
	 * @param :
	 * 	  {String} codename
	 *     代码名列名
	 * @example:
	 * |<script>
	 * | var data = unieap.transcode.get("dept");
	 * | unieap.debug(data);
	 * |</script>
	 * @return：
	 * 	  {object}
	 */
	unieap.transcode.get = function(data){
		var topWin = unieap.getTopWin(),
			transcodeBase = topWin.transcodeBase || (topWin.transcodeBase = {});
		data = dojo.isString(data) && {store:data} || data;
		data = dojo.mixin({valueAttr :"CODEVALUE" ,displayAttr :"CODENAME"},data);
		var key = [data.store.getName(),data.valueAttr,data.displayAttr].join("_");
		return transcodeBase[key] || (function(){
			return addtranscode(data);
		})();
	};
	
	/**
	 * @summary:
	 * 		取得codelist代码表
	 * @param:
	 * 		{string|object} store 
	 * 		dataStore名称
	 * @param:
	 * 		{string|object|null} dc
	 * 		 dataCenter对象
	 * @param:
	 * 		{boolean} isUseCache
	 * 		是否使用从客户端缓存中查找数据
	 * @return：
	 * 		{object|null} 返回一个dataStore对象
	 * @example:
	 * |	var ds=unieap.getDataStore('demo',dataCenter,true); 
	 * 		上述代码会首先从dataCenter中查找名为demo的dataStore,如果查找不到,再从客户端缓存中查找
	 */
	unieap.getDataStore = function(store,dc,isUseCache){
		if(store&&dojo.isObject(store)) return store;
		var ds;
		//(!dc || !dojo.isObject(dc) && !(dc = dojo.getObject(dc))) && (dc = dataCenter);
		(!dc || !dojo.isObject(dc) && !(dc = dojo.getObject(dc)));
		if(dc){
			ds = dc.getDataStore(store);
		}else{
			dc = dataCenter;
		}
		
		if(!ds){
			ds = dataCenter.getDataStore(store);
		}
		if(!ds){
			if(isUseCache){
				dojo.require("unieap.cache");
				var cachedData = unieap.cache.get(store); 
				if(cachedData){
					ds = new unieap.ds.DataStore(store,cachedData);
					ds.setType("static");
					globalDataCenter.addDataStore(ds);
				}
			}
			else{
				var topWin = unieap.getTopWin(),
					database = topWin.database || (topWin.database={});
				if(database[store]){
					ds = new unieap.ds.DataStore(store,dojo.fromJson(database[store]));
					ds.setType("static");
					dc.addDataStore(ds);
				}
			}
		}
		return ds;
	};
	
	
	/**
	 * @summary:
	 * 		存放DataStore对象到数据中心和客户端缓存
	 * @param:
	 * 		{object} store 
	 * 		DataStore对象
	 * @param:
	 * 		{object|string} dc 
	 * 		DataCenter对象
	 * @param :
	 * 		 {boolean} isUseCache 
	 * 		是否缓存到客户端缓存中
	 * @param :
	 * 		{number} timeStamp 
	 * 		时间戳
	 * @example:
	 * |	var ds=new unieap.ds.DataStore('demo',[{name:'jack',age:20}]);
	 * |	unieap.setDataStore(ds,dataCenter,true);
	 */
	unieap.setDataStore = function(store,dc,isUseCache,timeStamp){
		if(!store) return;
		(!dc || !dojo.isObject(dc) && !(dc = dojo.getObject(dc))) && (dc = dataCenter);
		dc.addDataStore(store,"static"); //静态只读数据
		if(isUseCache){
			dojo.require("unieap.cache");
			unieap.cache.put(store.getName(),store.getRowSet().toBufJson("primary"),timeStamp);
		}else{
			var topWin = unieap.getTopWin(),
					database = topWin.database || (topWin.database={}),
					dsName = store.getName();
			if(!database[dsName]){
				database[dsName] = dojo.toJson(store.getRowSet().getData());
			} 
		}
	};
	
	var _dataTypeMap ={
		"0" : "null", //NULL
		"1" : "string", //CHAR
		"2": "number", //NUMERIC
		"3":  "number",  //BIGDECIMAL
		"4" : "number", //INTEGER
		"6" : "number", //FLOAT
		"8" : "number", //DOUBLE
		"12" : "string", //STRING
		"16" : "boolean", //BOOLEAN
		"91" : "date", //DATE
		"93" : "date", //TIMESTAMP
		"-5" : "number" //LONG
	};		
	/**
	 * @summary:
	 * 		根据sql中的dataType转换成相应的脚本数据类型
	 * @param : 
	 * 		{number|string} dataType 
	 * 		数据类型 string、number or boolean
	 * @return:
	 * 	 {string} 脚本数据类型
	 * @example：
	 * |<script>
	 * | alert(unieap.getDataType(12))
	 * |</script>
	 */
	unieap.getDataType = function(dataType){
		return _dataTypeMap[dataType]|| dataType;
	}
	/*
	 * @summary:
	 * 		取得值比较器
	 * @param :
	 * 		{number|string} 
	 * 		dataType 数据类型 string、number or boolean
	 * @param :
	 * 		{string} relation
	 * 		 比较符号，如"="、"!="
	 * @return :
	 *  {boolean} 是否满足条件
	 */
	unieap.getCompare = function(dataType,relation){
		var _compare = {
    	"string" : {
    		"=" : {
    			compare : function(columnValue,value,ignoreCase){
    				if(ignoreCase && columnValue && value){
    					return columnValue.toUpperCase() == value.toUpperCase();
    				}
    				return columnValue == value;
    			}		    		
    		},
    		"!=" : {
    			compare : function(columnValue,value){  
    				return columnValue != value ;
    			}
    		},
    		"like" : {
    			compare : function(columnValue,value){  
    				if (value != null){
    					return columnValue && columnValue.match(value)!= null;
    				}
				   return columnValue == null || columnValue == ""; 
    			}
    		},
    		"not like" : {
    			compare : function(columnValue,value){  
    				if (value != null){
    					return columnValue==null || columnValue.match(value)== null;
    				}
				   return columnValue != null && columnValue != ""; 
    			}
    		}
    	},
    	
    	"number" : {
    		"=" :{
    			compare : function(columnValue,value){
    				return columnValue == value;
    			}
    		},
    		"!=":{
    			compare : function(columnValue,value){
    				return columnValue != value;
    			}
    		},
    		">":{
    			compare : function(columnValue,value){
    				return columnValue > value;
    			}
    		},
    		">=":{
    			compare : function(columnValue,value){
    				return columnValue >= value;
    			}
    		},
    		"<":{
    			compare : function(columnValue,value){
    				return columnValue < value;
    			}
    		},
    		"<=":{
    			compare : function(columnValue,value){
    				return columnValue <= value;
    			}
    		}
    	},
    	"date" : {
    		"=" :{
    			compare : function(columnValue,value,pattern){
    				columnValue = unieap.getRelativeTime(columnValue,pattern);
    				return columnValue == value;
    			}
    		},
    		"!=":{
    			compare : function(columnValue,value,pattern){
    				columnValue = unieap.getRelativeTime(columnValue,pattern);
    				return columnValue != value;
    			}
    		},
    		">":{
    			compare : function(columnValue,value,pattern){
    				columnValue = unieap.getRelativeTime(columnValue,pattern);
    				return columnValue > value;
    			}
    		},
    		">=":{
    			compare : function(columnValue,value,pattern){
    				columnValue = unieap.getRelativeTime(columnValue,pattern);
    				return columnValue >= value;
    			}
    		},
    		"<":{
    			compare : function(columnValue,value,pattern){
    				columnValue = unieap.getRelativeTime(columnValue,pattern);
    				return columnValue < value;
    			}
    		},
    		"<=":{
    			compare : function(columnValue,value,pattern){
    				columnValue = unieap.getRelativeTime(columnValue,pattern);
    				return columnValue <= value;
    			}
    		}
    	},
    	"boolean" :{
    		"=" :{
    			compare : function(columnValue,value){
    				return columnValue == value;
    			}
    		},
    		"!=":{
    			compare : function(columnValue,value){
    				return columnValue != value;
    			}
    		}
    	},
		"null" : {
    		"is null" : {
    			compare : function(columnValue){
    				return columnValue ==null;
    			}
    		},
    		"is not null" :{
    			compare : function(columnValue){
    				return columnValue !=null;
    			}
    		}
    	}
     }
     return(
     	unieap.getCompare= function(dataType,relation){
			if(relation=="is null" || relation=="is not null"){
     			return _compare["null"][relation];
     		}
     		var type = unieap.getDataType(dataType);     		
     		var type = _compare[type];     	
     		return type && type[relation]?type[relation] : {compare : function(columnValue,value){
     			return eval("("+columnValue + relation + value+")");
     		}};
     }
     )(dataType,relation);
	};
	//内部方法
	unieap.getRelativeTimePlace = function(dataFormat){
		//yyyy-MM-dd
		dataFormat = dataFormat || RIA_I18N.util.util.defaultDateFormat;
		var place = [];
		//yyyy-MM-dd HH:mm:ss;
		dataFormat.indexOf("yyyy")!=-1 && place.push(0);
		dataFormat.indexOf("MM")!=-1 && place.push(1);
		dataFormat.indexOf("dd")!=-1 && place.push(2);
		(dataFormat.indexOf("HH")!=-1 || dataFormat.indexOf("hh")!=-1) && place.push(3);
		dataFormat.indexOf("mm")!=-1 && place.push(4);
		dataFormat.indexOf("ss")!=-1 && place.push(5);
		return place;
	}
	//内部方法
	unieap.getRelativeTime = function(value,place){
		if(value==null) return null;
		var time = new Date(Number(value));
		var relativeDate = new Date(2000,0,1,0,0,0);
		var opers = ["Year","Month","Date","Hours","Minutes","Seconds"];
		for(var i=0,l=place.length;i<l;i++){
			var sMethod = "set".concat(opers[place[i]]),
					gMethod = "get".concat(opers[place[i]]);
			relativeDate[sMethod](time[gMethod]());
		}
		return relativeDate.getTime();
	}
	/**
	 * @summary:
	 * 		把字符串或字符数组转换成Map对象，方便查询遍历 
	 * @param:
	 * 	 {string|array} value 
	 * 		值
	 * @return:
	 * 	 {object} 转换成 {v1:1,v2:1,...} 形式
	 * @example:
	 * |<script>
	 * | var ${1}data = ["a","b","c","c","d","a"];
	 * | var mp = ${2}unieap.convertArrayToMap(data);
	 * | var result = [];
	 * | for(var d in mp){
	 * | 	result.push(d);
	 * | }
	 * | unieap.debug(${3}d);
	 * ${1}构造有重复数据的数组
	 * ${2}通过构造Map的形式去掉重复数据
	 * ${3}得到不含重复数据的数组
	 */
	unieap.convertArrayToMap = function(value,mapvalue){ 
			var _map ={};
			if(!(value instanceof Array)){ 
				value = [value];
			}
			for(var i=0;i<value.length;i++){
				_map[value[i]] = mapvalue||1;
			}
			return _map;
	};
	/**
	 * @summary:
	 * 	判断对象是否为空 
	 * @param: 
	 * 		{array|object} data 
	 * @return :
	 * 		{boolean} true/false 
	 * @example:
	 * |<script>
	 * | var data = [];
	 * | alert(unieap.isEmpty(data));
	 * |</script>
	 * 判断数组是否为空
	 * @example:
	 * |<script>
	 * | var data = {};
	 * | alert(unieap.isEmpty(data));
	 * |</script>
	 * 判断对象是否为空
	 */
	unieap.isEmpty = function(data){
		if(!data) return true;
		if(data instanceof Array){
			return data.length==0;
		}
		if(typeof(data) =="object"){
			for(var _t in data){
				return false;
			}
			return true;
		}
		return false;
	};
	/**
	 * @summary:
	 *		获取对象的长度 
	 * @param:
	 * 		{array|object} data 
	 * @return:
	 * 	  	{number} 长度 
	 * @example:
	 * |<script>
	 * | var data = {a:1,b:2,c:function(){}};
	 * | alert(unieap.getLength(data));
	 * |</script>
	 * 获取对象元素的个数
	 */
	unieap.getLength = function(data){
		if(data instanceof Array){
			return data.length;
		}
		if(typeof(data) =="object"){
			var len=0;
			for(var _t in data){
				len++;
			}
			return len;
		}
		return 0;
	}
	
	
	/**
	 * @summary:
	 * 		调试json字符串，查看json对象树
	 * @description:
	 * 		可以查看任意的javascript对象
	 * 		通过它可以直接查看dataCenter中的数据对象，并且可以动态执行脚本
	 * @example:
	 * |<script>
	 * | var data = "只是一段文字";
	 * | unieap.debug(data);
	 * |</script>
	 * 	  查看字符串或数字
	 * @example:
	 * |<script>
	 * | var data = [1,2,3,4,5,6,7];
	 * | unieap.debug(data);
	 * |</script>
	 * 	  查看数组内容
	 * @example:
	 * |<script>
	 * | var object = {a:1,b:2,c:function(){}};
	 * | unieap.debug(object);
	 * |</script>
	 * 	  查看对象内容
	 * @example:
	 * |<script>
	 * | unieap.debug(unieap.byId("grid").getBinding());
	 * |</script>
	 * 	  查看grid对象的数据绑定
	 */
	unieap.debug = function(json){ 
		json = dojo.isString(json) && dojo.fromJson(json) || json;
		var dataCenters = [];
		if(('undefined'!=typeof(viewContextHolder)) && viewContextHolder){
			for(var key in viewContextHolder){
				var dc = [];
				dc.push(viewContextHolder[key].context);
				var jsonData = viewContextHolder[key].dataCenter;
				jsonData = dojo.isString(jsonData) && dojo.fromJson(jsonData) || jsonData;
				dc.push(jsonData);
				dataCenters.push(dc);
			}
		}
		window["unieapDebugArguments1"] = json;
		window["unieapDebugArguments2"] = dataCenters;
		var url = dojo.moduleUrl("")+"unieap/util/debug.html";
		var feature = "dialogHeight=500px;dialogWidth=500px;resizable=yes;status=yes;titlebar=yes";
		if(dojo.isIE){
			window.showModalDialog(url,window,feature);
		}else{
			feature = "height=500,width=500,resizable=yes,status=yes,titlebar=yes";
			unieap.debug.opener=open(url,"debug",feature);
			if(!unieap.debug.unload){
				dojo.addOnUnload(function(){
					unieap.debug.opener.close();
				});
				unieap.debug.unload=1;
			}
		}
	}
	dojo.connect(document,"onkeydown",function(evt){
    	if(unieap.isDebug && 
    		evt.altKey &&
    		evt.keyCode==88){
    			if('undefined'==typeof(globalDataCenter)){
					unieap.debug(dataCenter);
				} else {
					unieap.debug(globalDataCenter);
				}
    	}
    });
	
	//录制脚本快捷键：ALT+k
	dojo.connect(document, "onkeydown", function(evt) {
		
		if(unieap.recordScript){
			if (evt.altKey && evt.keyCode == 75) {
				unieap.publish("unitTestRecordScript",null);
			}
		}
	});
	
	unieap.stopEvent = function(){
		//终止事件！
		throw new Error(RIA_I18N.util.util.stopEvent);
	}
	
	var loadingMask = null;
	/**
	 * @summary:
	 * 		显示或关闭进度条
	 * @param： 
	 * 		{boolean|null} isShow 
	 * 		当等于true|null为显示进度条，否则为关闭
	 * @example:
	 * |<script>
	 * | unieap.showLoading(true);
	 * |</script>
	 */
	unieap.showLoading = function(isShow){
		if(null == loadingMask){
			var html = ["<div class='loading-alpha'></div>"];
			html.push("<div class='loading-p'>");
			html.push("<div class='loading-content'>");

			html.push("<div class='loading-text'>");
			html.push(RIA_I18N.util.util.loading);
			html.push("</div>");
			html.push("<div class='loading-img'></div>");
			html.push("<div class='loading-cancel'></div>");
			html.push("</div>");
			html.push("</div>");
			loadingMask = dojo.create("div");
			loadingMask.className = "loading";
			loadingMask.innerHTML = html.join("");
			var cancel = dojo.query(".loading-cancel",loadingMask)[0];
			dojo.connect(cancel,"onclick",function(){
				dojo.style(loadingMask,"display","none");
			});
			document.body &&	document.body.appendChild(loadingMask);
		}
		dojo.style(loadingMask,"display",isShow==false ? "none" : "block");
	};
	
	
	var tabNodeList=[];	
	var tabNodeId;
	var tabPane;
	var framePageContainer;
	unieap.openTabLoading = function(nodeId){	
		if(!(nodeId in tabNodeList)){
			framePageContainer = unieap.byId("framePageContainer");
			var tabPane = unieap.byId(nodeId);
			var tabNodeId = nodeId;
			if(tabPane.declaredClass!="unieap.layout.ContentPane"){
				tabPane = unieap.byId(nodeId).getParentContainer().getParentContainer();
				tabNodeId = tabPane.id
			}
			var domNodeChild = framePageContainer.tablist.pane2button[tabPane].closeNode;
			tabNodeList[nodeId] = {nodeId:tabNodeId,node :domNodeChild,count:0};					                   
		}	
		else if(tabNodeList[nodeId].node==null){
			tabNodeList[nodeId].node = framePageContainer.tablist.pane2button[unieap.byId(tabNodeList[nodeId].nodeId)].closeNode;
		}
		
		var n  = tabNodeList[nodeId].node;
		if(tabNodeList[nodeId].count==0){
	    	dojo.removeClass(n,"closeImage");
			dojo.addClass(n,"loadingtab-img");	
	    }		
		tabNodeList[nodeId].count++;					
		var result = {
			shutDown : function(){								
				tabNodeList[nodeId].count--;
				if(tabNodeList[nodeId].count==0){
					dojo.removeClass(n,"loadingtab-img");
					dojo.addClass(n,"closeImage");		
					tabNodeList[nodeId].node=null;
				}															
		    }			
		};		
		return result;						
	};

	
	
	
	var loadingXhrMask = null;
	//正在进行的请求（需要进度条的）的总数，以确认最后完成的请求
	var loadingCount = 0; 
	
	/**
	 * @summary:
	 * 		显示或关闭进度条，在xhr加载时，选用此loading样式
	 * @param： 
	 * 		{boolean|null} isShow 
	 * 		当等于true|null为显示进度条，否则为关闭
	 * @example:
	 * |<script>
	 * | unieap.showLoading(true);
	 * |</script>
	 */
	unieap.showXhrLoading = function(isShow){
		//更新正在进行的请求总数
		isShow?loadingCount++:loadingCount--;
		if(null == loadingXhrMask){
			var html = ["<div class='loadingxhr-alpha'></div>"];
			html.push("<div class='loadingxhr-p'>");
			html.push("<div class='loadingxhr-content'>");
			html.push("<div class='loadingxhr-img'></div>");
			html.push("<div class='loadingxhr-text'>");
			html.push(RIA_I18N.util.util.loading);
			html.push("</div>");
			html.push("<div class='loadingxhr-cancel'></div>");
			html.push("</div>");
			html.push("</div>");
			loadingXhrMask = dojo.create("div");
			loadingXhrMask.className = "loadingxhr";
			loadingXhrMask.innerHTML = html.join("");
			var cancel = dojo.query(".loadingxhr-cancel",loadingXhrMask)[0];
			dojo.connect(cancel,"onclick",function(){
				dojo.style(loadingXhrMask,"display","none");
			});
			document.body && document.body.appendChild(loadingXhrMask);
			//阻止同时打开两个单帧菜单，必须第一个页面加载完之后，才能打开第2个菜单
			dojo.connect(loadingXhrMask,"onclick",function(e){
				dojo.stopEvent(e);
			});
		}
		//当所有请求都完成后再关闭进度条
		dojo.style(loadingXhrMask,"display",(isShow==false && loadingCount <= 0 )? "none" : "block");
		( loadingCount < 0 ) && ( loadingCount = 0 );
	};
	
 	/**
	 * @summary:
	 * 		日期转换，将日期对象转换为一定格式的字符串
	 * @param ：
	 * 		{date} date 
	 * 		要转换的日期对象
	 * @param ：
	 * 		{string} retV
	 * 		要转换成的格式
	 * @return： 
	 * 		{string} 转换后的日期格式  
	 * @example:
	 * |<script>
	 * | var date = new Date(2008,8,8,12,12,30);
	 * | var retV = "yyyy-MM-dd"
	 * | alert(unieap.dateFormatToString(date,retV));
	 * |</script>
	 */
	unieap.dateFormatToString=function(date,retV){
		//当按住delte键盘删除日期框中的日期时,retV中会有am字段,需要清除
        retV=retV.replace(/ am/g,""); 
		//parse year
		if(retV.indexOf("yyyy")!=-1){
		    retV = retV.replace(/yyyy/gi,date.getFullYear());
		}
		
		//parse month
		if(retV.indexOf("MM")!=-1){
			var m = date.getMonth()+1;
			m = m<10?"0"+m:m;
		    retV = retV.replace(/MM/g,m);
		}
		
		//parse day
		if(retV.indexOf("dd")!=-1){
			var d = date.getDate();
			d = d<10?"0"+d:d;
		    retV = retV.replace(/dd/g,d);
		}
		
		//parse hour 
		if(retV.indexOf('hh')!=-1){
			var h = date.getHours();
			if(h>=12){
				retV=retV+" pm"
				h=(h==12)?12:h-12; //如果当前时间是12:12,转换成12进制为12:12 pm
			}else{
				retV=retV+" am"
				h=(h==0)?12:h; //如果当前时间是00:12,转换成12进制为12:12 am
			}
			h=h<10?"0"+h:h;
			retV=retV.replace(/hh/g,h);
		}else if(retV.indexOf('HH')!=-1){
			var h = date.getHours();
			h = h<10?"0"+h:h;
		    retV = retV.replace(/HH/g,h);
		}
		
		//parse minute
		if(retV.indexOf("mm")!=-1){
			var mm = date.getMinutes();
			mm = mm<10?"0"+mm:mm;
		    retV = retV.replace(/mm/g,mm);
		}
		//parse second
		if(retV.indexOf("ss")!=-1){
			var s = date.getSeconds();
			s = s<10?"0"+s:s;
		    retV = retV.replace(/ss/g,s);
		}
		//week	
		if(retV.indexOf("w")!=-1){
		    retV = retV.replace(/w/g,"0");
		}	
		//if(retV.indexOf("p")!=-1){
		    //retV = retV.replace(/p/g,"%P");
		//}													
		return retV;	
	};
	 /**
	 * @summary:
	 * 		日期转换函数
	 * @param ：
	 * 		{string|number} inValue
	 * 	 	输入值
	 * @param：
	 * 	 	{string} datePattern
	 * 		日期格式，默认为"yyyy-MM-dd"
	 * @param:
	 * 		{object|null} data 
	 * 		里面包含{dataType:"text",valueFormat:"yyyy-MM-dd"}
	 * @return:
	 * 		{string} 转换后的日期格式  
	 * @example:
	 * |<script>
	 * | var value = "19810615";
	 * | var datePattern = "yyyy-MM-dd"
	 * | alert(unieap.dateFormat(value,datePattern,{dataType:"string",valueFormat:'yyyyMMdd'}));
	 * |</script>
	 */
	unieap.dateFormat = function(inValue,datePattern,data){
		if(!inValue||inValue=="") return "";
		var date,  retV = datePattern || RIA_I18N.util.util.defaultDateFormat;
		!data && ( data = {dataType:"date"});
		
		if(data["dataType"]=="string"||data["dataType"]=="text"){
			var valueFormat= data["valueFormat"] || retV;
			var date=unieap.dateParser(inValue,valueFormat);
		}
		else{
			var date = new Date(Number(inValue));
		}	
		return 	unieap.dateFormatToString(date,retV);
	}
 	/**
	 *@summary:
	 *  	日期转换，将一定格式的字符串转换为日期对象
	 * @param: 
	 * 		{string} str 
	 * 		要转换的日期字符串
	 * @param: 
	 * 		{string} format
	 * 		字符串符合的格式
	 * @return :
	 * 		{date} 转换后的日期对象 
	 * @example:
	 * |<script>
	 * | var value = "19810615";
	 * | var datePattern = "yyyyMMdd"
	 * | alert(unieap.dateParser(value,datePattern));
	 * |</script>
	 */
	unieap.dateParser=function (str,format){
		str = str + "";
		var now=new Date();
		if(str.lastIndexOf('am')>-1){
			format=format+' am'
		}
		
		if(str.lastIndexOf('pm')>-1){
			format=format+' pm';
		}
		
	    if(str.length!==format.length){
		 	return now;
		}
	    var sub = function(s,f1){
	          var rtv = -1;
	          var index = format.indexOf(f1);
	          if(index!=-1){
	              rtv = parseInt(s.substr(index,f1.length),10);
	          }
	          return rtv;
	     }
	     var year = sub(str,"yyyy");
		 (year==-1)&&(year=now.getFullYear());
	     var month = sub(str,"MM") ;
		 (month==-1)&&(month=now.getMonth()+1);
	     var date = sub(str,"dd");
	     (date==-1)&&(date=1);//如果没有dd，则日期选中的每月1号
		 
		  //处理12小时和24小时制度
	     var hour=-1;
		 if(sub(str,'hh')!=-1) { //如果是12进制
			hour = sub(str, 'hh');
			if (str.indexOf('pm')!=-1) {
				//12进制12:12 pm转换为24进制应该还是12:12
				//1:12pm 应该是13:12
				hour = (hour==12)?12:hour+12; 
				
			}else if(str.indexOf('am')){
				//12进制12:12am转换为24进制应该是00:12
				hour=(hour==12)?0:hour;
			}
		 }else if(sub(str,'HH')!=-1){
			hour=sub(str,'HH');
		 }
		 (hour==-1)&&(hour=0);
	     var minute = sub(str,"mm");
		 (minute==-1)&&(minute=0);
	     var second = sub(str,"ss");
		 (second==-1)&&(second=0);
	     var d = new Date(year,month-1,date,hour,minute,second);
	     if(d=="NaN"){
		 	return now;
		 }
	      return d;
	   }
	/**
	 * @summary:
	 * 		取得一个字符串占有的字节数 其中汉字占据的字节数在系统变量global.js中定义
	 * @param :
	 * 		{string} inValue 
	 * 		要计算长度的字符串
	 * @return :
	 * 		{number} 字符串的长度
	 * @example:
	 * |<script>
	 * | var value = "你好2008";
	 * | alert(unieap.bitLength(value));
	 * |</script>
	 */
	unieap.bitLength=function(inValue){
		if(inValue==null || inValue == "") return 0;
		inValue=inValue.toString();
	    var len = 0;
	    for(var i=0,l=inValue.length;i < l; i++){
			if(inValue.charCodeAt(i) < 128){
				len++;
			 	continue;
			}
			len+=unieap.global.bitsOfOneChinese;
		}
		return len;
	}
	/*
	 * @summary:
	 * 		复制从对话框返回的store对象，不建议使用
	 */
	unieap.revDS =function(store){
	  	var data = store.toData(),
	  		  fn= function(obj,name){
	  			obj[name] && (obj[name] = Array.apply(Array,obj[name]));
	  		  };
	  	fn(data,"parameters");
	  	fn(data,"attributes");
	  	fn(data.rowSet,"primary");
	  	fn(data.rowSet,"filter");
	  	fn(data.rowSet,"delete");
	  	return new unieap.ds.DataStore(data);
	}
	
	/**
	 * @summary:
	 * 		获取当前的Dialog对象
	 * @return:
	 * 		{object} unieap.dialog.Dialog
	 * @example:
	 * |<script>
	 * | var dialog = unieap.getDialog()
	 * | dialog.close();
	 * |</script>
	 */
	 unieap.getDialog = function(hnd){
		var dialog=null;
		if(window.DialogUtil && DialogUtil.getDialog && (dialog=DialogUtil.getDialog(hnd))!=null){
			return dialog;
		}
		//跨域访问会出现问题，所以要进行检测
		try{
			var pWin = window;
			while(pWin != pWin.parent){
				pWin = pWin.parent;
				if(pWin.DialogUtil && pWin.DialogUtil.getDialog && (dialog=pWin.DialogUtil.getDialog(hnd))){
					return dialog;
				}
			}
		}catch(e){
			var topWin = unieap.getTopWin();
			topWin.DialogUtil && (dialog=topWin.DialogUtil.getDialog(hnd));
		}
		return dialog;
	}
	
	/**
	 * @summary:
	 * 		获取当前的xDialog对象
	 * @return:
	 * 		{object} unieap.xdialog.xDialog
	 * @example:
	 * |<script>
	 * | var dialog = unieap.getXDialog()
	 * | dialog.close();
	 * |</script>
	 */
	unieap.getXDialog = function(hnd){
		var dialog=null;
		if(window.XDialogUtil && XDialogUtil.getDialog && (dialog=XDialogUtil.getDialog(hnd))!=null){
			return dialog;
		}
		//跨域访问会出现问题，所以要进行检测
		try{
			var pWin = window;
			while(pWin != pWin.parent){
				pWin = pWin.parent;
				if(pWin.XDialogUtil && pWin.XDialogUtil.getDialog && (dialog=pWin.XDialogUtil.getDialog(hnd))){
					return dialog;
				}
			}
		}catch(e){
			var topWin = unieap.getTopWin();
			topWin.XDialogUtil && (dialog=topWin.XDialogUtil.getDialog(hnd));
		}
		return dialog;
	}
	
  /**
   * @summary:
   * 	设置页面权限
   * @param：
   * 	{string|null} scene 
   * 	场景定义，默认为空
   * @example:
   * |window['unieap.pageAuthList']={'a':{
   * |		'txt':'hidden',
   * |		'box':'disabled'
   * |},'b':{
   * |		'box:'writely'
   * |}};
   * @example:
   * |unieap.setPageAuthority('a');
   * |securityId为txt的控件被隐藏,同时securityId为box的控件被禁用
   * @example:
   * |unieap.setPageAuthority('b');
   * |securityId为box的控件可以编辑了
   */
  unieap.setPageAuthority = function(scene){
  	 var authList = "unieap.pageAuthList",  
  	      setting = "unieap.pageAuth.defaultSetting", //widget的初始状态
  		  pageAuthList = window[authList] , 
  		  permission = scene && (pageAuthList || 0)[scene] || pageAuthList;
  	  if(!permission) return ;
	  
  	  var cache = function(widget,type){
	  		var data=window[setting]; 
	  		if(widget.declaredClass=='unieap.grid.Grid'){
	  			var d ={},id,cells,layoutManager; 
	  			layoutManager=widget.getManager("LayoutManager");		
	 			cells=layoutManager.getOriginCells();
	 			for(var i=0,cell,l=cells.length;i<l;i++){
	 				cell=cells[i];
	  				if(id=cell.securityId){
	  					switch(permission[id]){
	  						case "hidden" :
	  							//判断grid初始状态是否显示
	  							if(!layoutManager.isHidden(cell.name)){
	  								d[id] = "visible"
	  							}
	  							layoutManager.hideCell([id]);
	  							break;
							case 'writely': 
								//判断grid初始状态是否禁用
								cell=layoutManager.getCell(cell.name);
								if(!cell.enable){
									d[id]="disabled";
								}
								cell.enable=true;
								break;
							case 'disabled':
								//判断grid初始状态是否可以编辑
								cell=layoutManager.getCell(cell.name);
								if(cell.enable){
									d[id]="writely";
								}
								cell.enable=false;
								break;
	  					}	  		
	  				}
	  			}
				data[widget.id] = d;
			}else{
	  			switch(type){
		  			case "hidden" :
		  				if(dojo.style(widget.domNode,"display")!="none"){
		  					data[widget.id]  = "visible";
		  				}
		  				dojo.style(widget.domNode,"display","none");
		  				break;  	
									
		  			case "writely" :
		  				if(widget.disabled===true){
		  					data[widget.id]  = "disabled";
		  				}
		  				(widget.setDisabled || Boolean).call(widget,false);
		  				break;
		  			case "disabled" :
		  				if(widget.disabled===false){
		  					data[widget.id]  = "writely";
		  				}
		  				(widget.setDisabled || Boolean).call(widget,true);
		  				break;
		  		}				
			}	
  	  },
	  resume = function(id){
	  	 var widget = dijit.byId(id);
		 if(widget.declaredClass=='unieap.grid.Grid'){
 			var d = window[setting][id],cells,cell,data;
 			var layoutManager=widget.getManager("LayoutManager");
			cells=layoutManager.getOriginCells();
			for(var i=0,l=cells.length;i<l;i++){
				cell=cells[i];
				data=cell.securityId&&d[cell.securityId];
 				switch(data){
					case "visible" :
						layoutManager.showCell([cell.securityId]);						
						break;
					case "writely":
						cell=layoutManager.getCell(cell.name)
						cell.enable=true;
						break;
					case "disabled":
						cell=layoutManager.getCell(cell.name)
						cell.enable=false;
						break;
				}	
			}
		 }else{
		  	 switch(window[setting][id]){
		  	 	case "visible" : 
		  	 		dojo.style(widget.domNode,"display","block");
		  	 		break;
		  	 	case "writely" :
		  	 		(widget.setDisabled || Boolean).call(widget,false); 
		  	 		break;
		  	 	case "disabled" : 
		  	 		(widget.setDisabled || Boolean).call(widget,true); 
		  	 		break;
		  	 }
		 }
	  };
  	//恢复组件默认设置
  	for(var name in window[setting]){
  		resume(name);
  	}
  	window[setting] = {};
  	//设置页面权限
  	dijit.registry.forEach(function(widget){
		var securityId;
		if(widget.declaredClass=='unieap.grid.Grid'){
			cache(widget,null);
		}else{
			securityId = widget.securityId;
			securityId&&permission[securityId]&&cache(widget,permission[securityId]);
		}
  	});
  }
    //是不是实体
    unieap.isClassEntity = function(inData){
    	if(inData && inData.declaredClass){
    		var clazz = dojo.getObject(inData.declaredClass) ;
    		return clazz && clazz.prototype.constructor == inData.constructor;
    	}
    	return false;
    }
    //获取模块实例
    unieap.getModuleInstance = function(context,moduleName,declaredClass){
    	var module = context[moduleName];
		if(!unieap.isClassEntity(module)){
			module = dojo.mixin({widget: context},module) ;
			declaredClass = module.declaredClass || module.cls || declaredClass;
			dojo.require(declaredClass);
			var clazz = dojo.getObject(declaredClass);
			module = new clazz(module);
			var getter = "get"+ moduleName.replace(/(.)/,function(s){return s.toUpperCase();});
			if(!(getter in context)){
				getter = (function(func){
				for(var name in context){
					if(this[name]==func){
						return name;
					}
				}
				return null;
				}).call(context,arguments.callee.caller);
			}
			if(getter==null){
				return module;
			}
			context[getter] = function(){
				return module;
			}
			context[moduleName] = module;
		}
		return module;
    }
	/**
	 * @summary：
	 * 		产生唯一码
	 * @return：
	 * 		{string} 页面唯一字符串
	 * @example:
	 * |<script>
	 * | alert(unieap.getUnique());
	 * | alert(unieap.getUnique());
	 * |</script>
	 */
	unieap.getUnique = function(){
		window["unieap_unique"] = window["unieap_unique"] || 1;
		return  "unieap_unique" + (window["unieap_unique"]++);		
	}
	/*
	 * @summary：
	 * 		设置静态文本的格式化信息
	 * @description:
	 * 		仅供InlineEditBox和Grid使用，【初始化设置参数用】
	 */
	unieap.setLabelFormatProps = function(widget){
		if(!widget.editor) return ;
		var editorClass = widget.editor.editorClass;
		var editorProps = widget.editor.editorProps || (widget.editor.editorProps={});
		switch(editorClass){
			case "unieap.form.ComboBox" :
			case "unieap.form.CheckBoxGroup"	 :
			case "unieap.form.RadioButtonGroup" :
				if(!widget["decoder"]&&editorProps.dataProvider&&editorProps.dataProvider.store){
					var store = editorProps.dataProvider.store;
					widget["decoder"] = dojo.mixin({store:store},{displayAttr:'CODENAME',valueAttr:'CODEVALUE'},editorProps["decoder"]);
				}
				break;
			case "unieap.form.ComboBoxTree" : 
				if(!widget["decoder"]){
					var store = editorProps.treeJson.binding.store;
					widget["decoder"] = dojo.mixin({store:store},{displayAttr:'CODENAME',valueAttr:'CODEVALUE'},editorProps["decoder"]);
				}
				break;
			case "unieap.form.CheckBox" :
				if(widget.declaredClass =="unieap.grid.Cell" || widget.declaredClass =="unieap.xgrid.Cell" ) {
						
						var checkProps = {checkedValue : "1" ,uncheckedValue :"0" };
						widget["checkProps"] = dojo.mixin(checkProps,editorProps);
						if(widget.declaredClass =="unieap.grid.Cell"){
							editorProps["disabled"] = true;
						}
						widget["serial"] = "cell_"+unieap.getUnique();
						window[widget["serial"]] = widget;
						if (!widget["checkLogic"]) {
							widget["checkLogic"] = function(evt,inRowIndex){
								evt = dojo.fixEvent(evt);
								var checkValue = this["checkProps"]["checkedValue"],
									uncheckedValue = this["checkProps"]["uncheckedValue"],		
									value = evt.target.checked ? checkValue : uncheckedValue;
								var rs = this.grid.getBinding().getRowSet();
								widget["name"]&&rs.setItemValue(inRowIndex,this.name,value);
	
								//捕获用户自定义的onClick、onChange事件
								this["checkProps"]["onClick"]&&this["checkProps"]["onClick"](inRowIndex,value);
								this["checkProps"]["onChange"]&&this["checkProps"]["onChange"](inRowIndex,value);
							};
						}
						if (!widget["formatter"]) {
							widget["formatter"] = function(value,inRowIndex){
								if(this.enable==false) return value;
								var checked = (String(value)==String(widget["checkProps"]["checkedValue"]))? " checked " : " ";
								var result = ["<input tabindex=\"-1\" type=\"checkbox\" "];
								if(widget.declaredClass =="unieap.grid.Cell"){
									var	marginTop=Math.floor((widget.grid.managers.get("RowManager").defaultRowHeight-14)/2)+"px";
								}else{
									var	marginTop=Math.floor((widget.grid.getRowManager().defaultRowHeight-14)/2)+"px";
								}
								result.push("name=\"checkbox_");
								result.push(widget.serial);
								result.push("\"");
								//ie8和firefox复选框不居中显示
								if(dojo.isIE>7||dojo.isFF){
									result.push(" style=\"margin-top:")
									result.push(marginTop+"\"");
								}
								result.push(checked);
								result.push("onclick=\"")
								result.push("window['")
								result.push(widget.serial)
								result.push("'].checkLogic(event,")
								result.push(inRowIndex)
								result.push(")\"");
								result.push(">");
					
								return result.join("");
							}
						}		
						
				}
				break; 
			case "unieap.form.RadioButton" :
				if((widget.declaredClass =="unieap.grid.Cell" || widget.declaredClass =="unieap.xgrid.Cell" ) && 
					!widget["formatter"]){
						var radioProps = {checkedValue : "1" ,uncheckedValue :"0" };
						widget["radioProps"] = dojo.mixin(radioProps,editorProps);
						if(widget.declaredClass =="unieap.grid.Cell"){
							editorProps["disabled"] = true;
						}
						widget["serial"] = "cell_"+unieap.getUnique();
						window[widget["serial"]] = widget;
						widget["checkLogic"] = function(evt,inRowIndex){
							if( widget["name"] && widget.checkedRowIndex != inRowIndex){
								evt = dojo.fixEvent(evt);
								var checkValue = widget["radioProps"]["checkedValue"],
										uncheckedValue = widget["radioProps"]["uncheckedValue"];							
								var rs = widget.grid.getBinding().getRowSet();
								if(widget.checkedRowIndex!=null){
									rs.setItemValue(widget.checkedRowIndex,widget.name,uncheckedValue);
								}							
								rs.setItemValue(inRowIndex,widget.name,checkValue);
								widget.checkedRowIndex = inRowIndex;
								//捕获用户自定义的onClick、onChange事件
								widget["radioProps"]["onClick"]&&widget["radioProps"]["onClick"](inRowIndex,checkValue);
								widget["radioProps"]["onChange"]&&widget["radioProps"]["onChange"](inRowIndex,checkValue);
							}

						};	
						widget["formatter"] = function(value,inRowIndex){
							if(widget.enable==false) return value;
							var checked = " ";
							if(String(value)==String(widget["radioProps"]["checkedValue"])){
								checked = " checked ";
								widget.checkedRowIndex = inRowIndex;
							}
							var result = ["<input tabindex=\"-1\" type=\"radio\" "];
							if(widget.declaredClass =="unieap.grid.Cell"){
								var	marginTop=Math.floor((widget.grid.managers.get("RowManager").defaultRowHeight-14)/2)+"px";
							}else{
								var	marginTop=Math.floor((widget.grid.getRowManager().defaultRowHeight-14)/2)+"px";
							}
							result.push("name=\"radio_");
							result.push(widget.serial);
							result.push("\"");
							//ie8和firefox单选框不居中显示
							if(dojo.isIE>7||dojo.isFF){
								result.push(" style=\"margin-top:")
								result.push(marginTop+"\"");
							}
							result.push(checked);
							result.push("onclick=\"")
							result.push("window['")
							result.push(widget.serial)
							result.push("'].checkLogic(event,")
							result.push(inRowIndex)
							result.push(")\"");
							result.push(">");
							return result.join("");
						}
				}
				break; 
			default :
				if("unieap.form.DateTextBox" == editorClass){
					var vft =  {declaredClass:"unieap.form.DateValueFormatter",dataFormat : ""};
					editorProps["valueFormatter"] = dojo.mixin(vft,editorProps["valueFormatter"]);
					var dft = {declaredClass:"unieap.form.DateDisplayFormatter",dataFormat : RIA_I18N.util.util.defaultDateFormat};
					editorProps["displayFormatter"] = dojo.mixin(dft,editorProps["displayFormatter"]);
				}
				else if("unieap.form.NumberTextBox"  == editorClass){
					var dft = {declaredClass:"unieap.form.NumberDisplayFormatter"}; 
					editorProps["displayFormatter"] = dojo.mixin(dft,editorProps["displayFormatter"]);
				}
				if(!widget["valueFormatter"] && editorProps["valueFormatter"]){
					widget["valueFormatter"] = dojo.clone(editorProps["valueFormatter"]);
				}	
				if(!widget["displayFormatter"] && editorProps["displayFormatter"]){
					widget["displayFormatter"] = dojo.clone(editorProps["displayFormatter"]);
				}
		}
	}
	
	/**
	 * @summary：
	 * 		显示组件
	 * @param：
	 * 		{object} widget
	 * 		可以是Widget对象或domNode
	 * @example:
	 * |<script>
	 * | var obj = dojo.byId("divNode");
	 * | unieap.showWidget(obj);
	 * |</script>
	 * @example:
	 * |<script>
	 * | var obj = unieap.byId("grid");
	 * | unieap.showWidget(obj);
	 * |</script>
	 */
	unieap.showWidget = function(widget){
		var node = widget && (widget.domNode || widget);
		if(widget.show){
			widget.show();
		}
		else{
			node && dojo.style(node,"display","block"); 
		}
	}
	/**
	 * @summary：
	 * 		隐藏组件
	 * @param：
	 * 		{object} widget
	 * 		可以是Widget对象或domNode
	 * @example:
	 * |<script>
	 * | var obj = dojo.byId("divNode");
	 * | unieap.hideWidget(obj);
	 * |</script>
	 * @example:
	 * |<script>
	 * | var obj = unieap.byId("grid");
	 * | unieap.hideWidget(obj);
	 * |</script>
	 */
	unieap.hideWidget = function(widget){
		var node = widget && (widget.domNode || widget);
		if(widget.hide){
			widget.hide();
		}
		else{
			node && dojo.style(node,"display","none"); 
		}
	}
	/**
	* @summary：
	*	通知某组件调用指定方法，第三个参数起为执行方法入参
	* @param：widget
	*	{object} 组件对象
	* @param：methodName
	*	{string} 方法名称
	* @example:
	* | unieap.notify(grid,"setDataStore",store);
	*/
	unieap.notify = function(widget,methodName){
		if(!widget) return ;
		if(widget[methodName]){
			var args = Array.prototype.slice.call(arguments,2);
			widget[methodName].apply(widget,args);
		} 
	}
	/**
	 * @summary：
	 * 		得到某节点下的子容器
	 * @param :
	 * 		{object} domNode
	 * 		页面元素的domNode
	 * @return:
	 * 		{array} 子容器对象数组
	 * @example:
	 * |<script>
	 * | var children = unieap.getChildrenContainer(dojo.byId("container"));
	 * | for(var i=0;children[i];i++){
	 * |	children[i].resizeContainer();
	 * | |
	 * |</script>
	 */
	unieap.getChildrenContainer = function(domNode){
		dojo.require("unieap.layout.Container");
		var result = [],left=[domNode],nodes;
		while(left.length){
			nodes = left.shift().childNodes;
			for(var i=0,node,widget;(node=nodes[i]);i++){
				if(node.getAttribute && (widget=dijit.byNode(node))){
					if(dojo.hasClass(node,"unieap-container")){
						result.push(widget);
						continue;
					}
				}
				left.push(node);
			}
		}
		return result;
	}
	/**
	 * @summary：
	 *		执行某元素节点下容器的resizeContainer方法
	 * @param：
	 * 	 	{object|null} domNode
	 * 		当为空时执行触发body下容器的resizeContainer方法
	 * @example:
	 * |<script>
	 * | unieap.fireContainerResize(dojo.byId("container"));
	 * |</script>
	 */
	unieap.fireContainerResize = function(domNode){
        var children = unieap.getChildrenContainer(domNode || document.body);
		for(var i=0,child;(child=children[i]);i++){
			child.resizeContainer();
		}
	},
	/**
	 * @summary：
	 * 		让组件失去焦点，聚焦在全局A标签上
	 * @example:
	 * | <div dojoType="unieap.form.TextBox" onBlur="blur">
	 * |<script>
	 * | function blur(){
	 * | 	alert("触发焦点");
	 * | }
	 * | unieap.blurWidget();
	 * |</script>
	 */
	unieap.blurWidget = function(){
		try{
			(dojo.byId('unieap_for_focus')|| dojo.body()).focus();
		}catch(e){}
	}
	
	dojo.addOnLoad(function(){
		//使用一个a标签，解决组件转移焦点问题
		dojo.create('a',{
			'href':'javascript:void(0);',
			'id':'unieap_for_focus',
			'class':'u-common-focus',
			'tabIndex':-1
		},dojo.body(),"first");
		dojo.connect(window,"onscroll",function(evt){
			dojo.style(dojo.byId("unieap_for_focus"),"top",document.documentElement.scrollTop+"px");
		});
	});
	/**
	 * @summary：
	 * 		显示Tooltip提示信息
	 * @param：
	 * 	 	{object} innerHTML 
	 * 		提示信息显示内容
	 * @param：
	 * 		{object} aroundNode 
	 * 		提示信息显示位置
	 * @param：
	 * 		{object} position 
	 * 		提示信息显示在aroundNode的方位
	 * @example:
	 * |<script>
	 * | var obj = dojo.byId("tipNode");
	 * | unieap.showTooltip(obj,dojo.byId("btn"));
	 * |</script>
	 */
	unieap.showTooltip = function( innerHTML, aroundNode,position){
		dojo.require("unieap.Tooltip");
		if(!unieap._masterTT){ 
		   unieap._masterTT = new unieap._MasterTooltip(); 
		}
		return unieap._masterTT.show(innerHTML, aroundNode, position);
	};
	
	/**
	 * @summary：
	 * 		隐藏提示信息
	 * @param：
	 * 		{object} aroundNode 
	 * 		隐藏位置
	 * @example:
	 * |<script>
	 * | unieap.hideTooltip(dojo.byId("btn"));
	 * |</script>
	 */
	unieap.hideTooltip = function(aroundNode){
		dojo.require("unieap.Tooltip");
		if(!unieap._masterTT){ unieap._masterTT = new unieap._MasterTooltip(); }
		return unieap._masterTT.hide(aroundNode);
	};
	/**
	 * @summary：
	 * 		获取MessageBox对象
	 * @example:
	 * |<script>
	 * | var messageBox = unieap.getMessageBox();
	 * | var config = {title:"提示信息."};
	 * | messageBox.alert(config);
	 * |</script>
	 */
	unieap.getMessageBox = function(){
		dojo.require("unieap.dialog.MessageBox");
		return MessageBox;
	}
	/**
	 * @summary：
	 * 		获取框架的最外层窗口对象，替代直接使用window.top对象
	 * @description:
	 * 		如果集成在其他系统中时，直接调用top对象时会出现跨域访问的错误(不包括showModal窗口)
	 * @example:
	 * |<script>
	 * | var top = unieap.getTopWin();
	 * | alert(top);
	 * |</script>
	 */
	unieap.getTopWin = function(){
		var win = window.opener || window;
		try{
			//防止打开窗口的父窗口被关闭，处于不可用状态
			win.navigator;
			if(dojo.isWebKit && !win.top.unieap){//webkit下用window.open打开的页面找不到unieap对象
				win = window;
			}
		}catch(e){
			win = window;
		}
		try{
			win.top.navigator;
			return win.top;
		}catch(e){
			try{
				do{
					var pwin = win.parent;
					pwin.navigator;
					win = pwin;
				}while(win);
			}catch(e1){
				return win;
			}
		}
	}
	
	/**
	 * @summary:
	 * 		聚焦某个在tab页中的控件
	 * @example：
	 *  |	unieap.focusTabWidget("tab1","combobox1")
	 *	聚焦在tab1中的 id 为 combobox1 的控件
	 */
	unieap.focusTabWidget = function(tabId,widgetId){
		var tabWidget = unieap.byId(tabId);
		if(tabWidget){
			var parentWidget = tabWidget.getParentContainer();
			parentWidget.selectChild(tabWidget);//选择 tab页
			var context	= tabWidget.getContentWindow();
			if(context&&context.unieap){
				var widget = context.unieap.byId(widgetId);
				if(widget){
					//聚焦
					if(widget.focus){
						widget.focus();
					}else if(widget.focusNode){
						widget.focusNode.focus&&widget.focusNode.focus();
					}
				}
			}
		}	
	};

	/**
	 *@summary:
	 *		订阅某个主题
	 *@description:
	 *		订阅某个主题，当主题被发布时，能够监听到主题内容。
	 *@param:
	 *		{string} topic  主题、发布方与订阅方通过主题联系在一起。
	 *@param:
	 *		{function} fun  接收订阅的方法，fun中有一个参数，由发布方提供。
	 *@example:
	 * | // 订阅"grid change"主题，当publish时，触发自定义方法，接收参数row
	 * | unieap.subscribe("grid change", function(row){ 
	 * |		alert(row);
	 * | });
	 * |
	 * | //发布"grid change"主题，并传递对象row
	 * | unieap.publish("grid change", row);		
	*/
	unieap.subscribe = function(topic,fun){
		if (!topic || fun==null) return null;
		var disp = dojo._topics[topic];
		if (disp && disp._listeners) {
			var ls = [].concat(disp._listeners);
			while (ls.length) {
				if (fun == ls.pop()) {
					return null;
				}
			}
		}
		return [topic, dojo._listener.add(dojo._topics, topic, fun)];
	};



	/**
	 *@summary:
	 *		发布某个主题内容
	 *@description:
	 *		发布某个主题内容，当主题发布后、订阅方能够得到相应的信息。
	 *@param:
	 *		{string} topic 主题
	 *@param:
	 *		{object} obj  需要发布出去的对象
	 */
	unieap.publish = function(topic,obj){
		var f = dojo._topics[topic];
		if(f){
			f.apply(this, obj?[obj]:[]);
		}
	};


	/**
	 * @summary:
	 * 		取消订阅
	 * @description:
	 * 		取消对某个主题的订阅
	 * @param:
	 * 		{object} handle	由unieap.subscribe订阅后返回的对象
	 */
	unieap.unsubscribe = function(handle){
		if(handle){
			dojo._listener.remove(dojo._topics, handle[0], handle[1]);
		}
	};
	
	
	/**
	 * @summary:
	 * 		聚焦某个在tab页中的控件
	 * @description:
	 * 		当前tab页跳到另一个tab页时，且当前tab页是在Iframe时，使用这个API
	 */
	unieap.focusBrotherTabWidget = function(tabId,widgetId){
		var parent = window.parent;
		parent.unieap.focusTabWidget(tabId,widgetId);
	};
	
	/**
	 * @summary:
	 * 		从资源文件(application_zh_CN.js等)中获得国际化信息
	 * @param:
	 * 		{string} key 国际化信息的键值
	 * @param:
	 * 		{array} map 国际化信息中要替换的变量信息
	 * @param:
	 * 		{object} scope 从哪个全局变量中读取国际化信息，默认为RIA_I18N
	 * @param:
	 * 		{string|number|boolean} defaultValue 当获得不到国际化信息时返回的默认值。默认为空字符串
	 * @example:
	 * |<script>
	 * |	var RIA_I18N={
	 * |		welcome:"Welcome You!",
	 * |		info:"My name is ${0},age is ${1}"
	 * |	}
	 * |	var CUSTOM_RIA_I18N={welcome:"Hi,kids!"}
	 * |	//返回值"Welcome You!"
	 * |	var welcome=unieap.getText("welcome");
	 * |	//返回值"My Name is unieap,age is 10"
	 * |	var info=unieap.getText("info",["unieap",10]);
	 * |	//从RIA_I18N中获得不到值时返回0
	 * |	var defaultValue=unieap.getText("undefinedKey",null,null,0);
	 * |	//从变量CUSTOM_RIA_I18N中获得校验信息,返回"Hi,kids"
	 * |	var cWelcome=unieap.getText("welcome",null,CUSTOM_RIA_I18N);
	 * |</script>
	 * |<script>
	 * |	//设置"${0}"列过滤条件(国际化文件中的信息)：configure:'\u8bbe\u7f6e\"${0}\"\u5217\u8fc7\u6ee4\u6761\u4ef6',
	 * |	//获取cell上label的值替换${0}
	 * |	title = unieap.getText("xgrid.filter.configure",[cell.label]);
	 * |</script>
	 */
	unieap.getText=function(key,map,scope,defaultValue){
		if(!key||typeof(key)!="string") return;
		var scopeType=typeof(scope),
			 defaultValueType=typeof(defaultValue);
		map=(dojo.isArray(map)&&map)||null;
		scope=scopeType!="undefined"?(scopeType=="string"?eval(scope):(scope!=null)?scope:RIA_I18N):RIA_I18N;
		defaultValue=defaultValueType!="undefined"?defaultValue:"";
		var result;
		try{
			result=scope&&eval("scope."+key);
			typeof(result)!="undefined"&&map!=null&&(result=dojo.string.substitute(result,map));
		}catch(e){
			!result&&(result=defaultValue);
		}
		return result;
	};

	/**
	 * @summary:
	 * 		将一个JavaScript对象转换成JSON字符串，并添加unieap特定的类型信息，以供unieap.formJson时使用，主要用于通过对话框传递对象参数时，进行类型转换
	 * @param:
	 * 		{string|object|array|unieap.ds.DataStore|unieap.ds.DataCenter} 
	 *  @return：
	 * 		{string} json
	 */
	unieap.toJson=function(value){
		if(typeof(value) == "undefined"){
			return ;
		}
		if(value == null){
			return "{data:"+dojo.toJson(value)+",__originalType:Object}";
		}
		if(dojo.isString(value)){
			return "{data:"+value+",__originalType:String}";
		}else if(value instanceof unieap.ds.DataStore
				|| (value.declaredClass && value.declaredClass == "unieap.ds.DataStore")){
			return "{data:"+value.toJson()+",__originalType:DataStore}";
		}else if(value instanceof unieap.ds.DataCenter
				|| (value.declaredClass && value.declaredClass == "unieap.ds.DataCenter")){
			return "{data:"+value.toJson()+",__originalType:DataCenter}";
		}else{
			return "{data:"+dojo.toJson(value)+",__originalType:Object}";
		}
	};
	
	/**
	 * @summary:
	 * 		将通过对话框传递的数据转换成对象，与unieap.toJson方法对应使用，参数需要用unieap.toJson转换过。
	 * 		如果是普通的JSON字符串（不是用unieap.toJson转换的),可以调用dojo.fromJson()
	 * @param:
	 * 		{string}  json 要进行转换的值
	 * @return:
	 * 		{string|object|array|unieap.ds.DataStore|unieap.ds.DataCenter}  转换后的结果
	 */
	unieap.fromJson = function(json){
		if(!json){
			return ;
		}
		var index = json.lastIndexOf(",__originalType");
		var value = json.substring(6,index);
		var type = json.substring(index+16,json.length-1);
		if(type=="String"){
			return value;
		}else if(type=="DataStore"){
			var temjson = dojo.fromJson(value);
			var name=temjson.name?temjson.name:"tempStore";
			return new unieap.ds.DataStore(temjson.name,value);
		}else if(type=="DataCenter"){
			return new unieap.ds.DataCenter(value);
		}else{
			return dojo.fromJson(value);
		}
	};
	
	unieap.fireEvent= function(widget,method,args){
		var context = widget;
		if(unieap.isXHR){
			context = widget._viewContext = unieap.Action.getViewContext(widget);
		}
		return method.apply(context,args);
	};
	
	//兼容单帧和非单帧事件，this为点击的控件或者为js闭包的空间（数据表格和Tree部分代码使用）
	unieap.fireEvent4Widget= function(self,widget,method,args){
		if(unieap.isXHR){
			var context = widget._viewContext || (widget._viewContext=(unieap.Action.getViewContext(widget) || window));
			return method.apply(context,args);
		}else{
			return method.apply(self,args);
		}
	};
	
	/****************************Tree 常用功能简单接口方法*************************************/
	unieap.tree = {
		/**
		 * @summary:
		 *		给指定节点设置store，将原来的所有子节点删除，节点由id指定，如果节点参数为node调用unieap.byId("basicTree").getBinding().setDataStore(node,store,arg); 
		 * @description:
		 *		给定store中的列字段与tree标签配置的列字段要一致；可以为树设置store，也可以为树的子节点设置store
		 * @param:
		 *		{string} treeId  树的id
		 * @param:
		 *		{unieap.ds.DataStore} store
		 * @param:
		 * 		{object} args   
		 * 		设置当前参数中的store的第一层节点的父节点如：
		 * 		var arg={query:{name:'parentID',relation:'=',value:'999'}};
		 * @param:
		 * 		{string} id   节点的id
		 * 		如果设置子节点的store需要传入此参数，此时如果没有args可以设为null。 
		 * 		unieap.tree.setDataStore("basicTree2",neusoftStore,null,'1231035443386');
		 * @example:
		 * |<script>
		 * | //如果不用单帧框架id可以直接传入，不需要写getRealId。
		 * | var store = dataCenter.getDataStore("menuTreePart1");
		 * | unieap.tree.setDataStore(getRealId("basicTree"),store);
		 * |</script>
		 * |<div dojoType="unieap.tree.Tree" 
		 * |		id="basicTree"
		 * |		label="UniEAP" 
		 * |		binding = "{'leaf':'leaf','store':treeStorePart,'label':'label','parent':'parentID',query:{name:'parentID',relation:'=',value:'1212403325756'}}">
		 * |	 </div>
		 * |</div>
		 */
		setDataStore: function(treeId,store,arg,id){
			var tree = dijit.byId(treeId);
			if(!tree) return null;
			if(tree && !id){
				var node = tree.getRootNode();
			}else{
				var node = tree.getNodeById(id); 
			}
			if(!node || !store) return null;
			tree.getBinding().setDataStore(node,store,arg);
		},
		
		/**
		 * @summary:
		 *		刷新指定节点，子节点重新生成并绑定数据，若数据发生了变化，可以调用此方法刷新节点
		 * @description:
		 *		参数为id，如果不用加参数的参见TreeNode中refresh
		 * @see：
	 	 * 		unieap.tree.TreeNode
		 * @param:
		 *		{string} treeId  树的id
		 * @param:
		 * 		{string} id   节点的id，不设置此参数刷新整棵树
		 * @example:
		 * |function refresh(){
		 * |	//在树绑定的RowSet中新增两条记录 
		 * |	treeStorePart.getRowSet().addRow({id:(new Date()),label:"新增节点1","parentID": "1",leaf:true}); 
		 * |	treeStorePart.getRowSet().addRow({id:(new Date()),label:"新增节点2","parentID": "1",leaf:true}); 
		 * |	//刷新节点 ,如果不用单帧框架id可以直接传入，不需要写getRealId。
		 * |	unieap.tree.refresh(getRealId("refreshNode"),"123");
		 * |}
		 *   树对应的Rowset添加两条数据，并刷新节点，将会重新构建该节点的子节点。
		 * @img:
		 *      images/tree/refreshTreeNode1.png 
		 * @img:
		 *      images/tree/refreshTreeNode2.png   
		 */
		refresh: function(treeId,id){
			var tree = dijit.byId(treeId);
			if(!tree) return null;
			if(!id){
				var node = tree.getRootNode();
			}else{
				var node = tree.getNodeById(id);
			}
			if(!node) return null;
			node.refresh();
		},
		
		/**
		 * @summary:
		 *		当树和form关联时，把指定节点的数据绑定到form中
		 * @description:
		 *		如：在树种配置onClick属性，在onClick的实现方法中调用此方法（onClick方法入参为node），当点击树中节点时，把点击节点的数据绑定到form上
		 * @param:
		 *		{unieap.tree.TreeNode} node
		 * @param:
		 * 		{string} formId   form的id
		 * @example:
		 * | //在树中配置onClick = "bindData"
		 * | //如果不用单帧框架id可以直接传入，不需要写getRealId。
		 * |function bindData(node){
	   	 * |	unieap.tree.bandData4Form(node,getRealId("treeNodeForm"));
		 * |}
		 */
		bandData4Form: function(node,formId){
			var row = node.getTree().getBinding().getRow(node);
			dijit.byId(formId).getBinding().bind(row);
		},
		
		/**
		 * @summary:
		 *		设置指定节点的显示值
		 * @param:
		 *		{unieap.tree.TreeNode} node
		 * @param:
		 * 		{string} treelabel  树的显示字段，在binding中配置的'label':'treelabel'
		 * @param:
		 * 		{string} text   设置的显示值
		 * @example:
		 * |	<div dojoType="unieap.tree.Tree" id="lazyTree"    label="UniEAP" ,
		 * |		binding = "{'leaf':'leaf','store':treeStoreForLazyLoad,'label':'treelabel',
		 * |		'parent':'parentID',query:{name:'parentID',relation:'=',value:''}}">
		 * |	</div>
		 * |
		 * |unieap.tree.setText(node,'treelabel',"abc");
		 */
		setText: function(node ,treelabel,text){
			var tree = node.getTree();
			var row = tree.getBinding().getRow(node);
				row.setItemValue(treelabel,text);
				tree.freshNodeLabel(node);
		}		
	};
	
	/****************************Form 常用功能简单接口方法*************************************/
	unieap.form = {
		/**
		 *@summary:
		 *		给指定Form设置DataStore
		 *@description:
		 *		根据传入的表单ID、DataStore对象和行索引给表单绑定DataStore
		 *@param:
		 *		{string} formId  
		 * 		注意如果使用单帧框架此处一定要使用getRealId()方法来传formId，即unieap.form.setDataStore(getRealId("form"),"attr_empno");
		 *@param:
		 *		{unieap.ds.DataStore} store
		 * 		表单要绑定的DataStore对象
		 *@param:
		 * 		{string} bindIndex   默认值为0
		 * 		DataStore中指定的行索引，如果不传入该参数则默认给表单绑定DataStore的第一条数据
		 * @example:
		 * |<script>
		 * | var store = dataCenter.getDataStore("emp");
		 * | unieap.from.setDataStore(getRealId("form"),store);
		 * |</script>
		 * |<div dojoType="unieap.form.Form" id="form"></div>
		 */
		setDataStore: function(formId,store,bindIndex){
			var form = dijit.byId(formId);
			if(!form){
				return;
			}
			var binding = form.getBinding();
			bindIndex = bindIndex || 0;
			binding.setDataStore(store,bindIndex);
		},
		/**
		 *@summary:
		 *		获得Form绑定的DataStore中指定字段的值
		 *@param:
		 *		{string} formId  
		 * 	    注意如果使用单帧框架此处一定要使用getRealId()方法来传formId，即unieap.form.getPropertyValue(getRealId("form"),"attr_empno");
		 *@param:
		 *		{string} propertyName
		 * 		DataStore中指定的字段名字
		 * @example:
		 * |<script>
		 * | var ds=new unieap.ds.DataStore("emp",[
	     * |          	{attr_empno:"1000",NAME:"Rose",attr_job:"演员"},
         * |            {attr_empno:"1076",NAME:"齐衷斯",attr_job:"技术总监"}]);
		 * | unieap.from.setDataStore("form",store);
		 * | var propertyValue = unieap.form.getPropertyValue(getRealId("form"),"attr_empno");
		 * | alert(propertyValue);
		 * |</script>
		 * |<div dojoType="unieap.form.Form" id="form"></div>
		 */
		getPropertyValue: function(formId,propertyName){
			var form = dijit.byId(formId);
			if(!form){
				return;
			}
			var row = form.getBinding().getRow(),
				propertyValue = row.getItemValue(propertyName);
			return propertyValue;
		}
	};
	
	/****************************Grid 常用功能简单接口方法*************************************/
	unieap.grid = {
		/**
		 * @summary:
		 * 		为表格设置数据源
		 * @param:
		 * 		{string} id 表格的id
		 * @param:
		 * 		{unieap.ds.DataStore} store 为表格设置的数据源
		 * @description：
		 * 		根据给定的表格id和store，为制定表格设置数据源，如果没有指定store，则为其绑定一个空的DataStore
		 * @example:
		 * |unieap.grid.setDataStore(getRealId("grid"), store);
		 * 在单帧框架下和多帧框架下都可以使用getRealId()方法获得控件正确的id，如果没有使用单帧，可以直接写控件id
		 * |unieap.grid.setDataStore("grid", store);
		 */
		setDataStore: function(id,store){
			var grid = unieap.byId(id);
			if(null == grid){
				return;
			}
			
			var gridBinding = grid.getBinding();
				
			if (store == null) {
				var store = new unieap.ds.DataStore(gridStore.getName());
				gridBinding.setDataStore(store);
				return;
			}
							
			gridBinding.setDataStore(store);
		},
		
		/**
		 * @summary:
		 * 		获取表格的数据源
		 * @param:
		 * 		{string} id 表格的id
		 * @return:
		 * 		{unieap.ds.DataStore} store 表格的数据源
		 * @example:
		 * |var store = unieap.grid.getDataStore("grid");
		 */
		getDataStore: function(id) {
			var grid = unieap.byId(id);
			if(!grid){
				return null;
			}
			return grid.getBinding().getDataStore();
		},
		
		/**
		 * @summary:
		 * 		向grid中插入一个dataStore中的所有数据
		 * @description:
		 * 		往grid中插入数据后，Grid会自动刷新并且显示该数据
		 * 		如果不传入index参数,将在控件的最前面增加记录。
		 * @param:
		 * 		{string} id 表格的id
		 * @param:
		 * 		{unieap.ds.DataStore} store 要插入的数据对象
		 * @param:
		 * 		{number} index 设置在哪个位置插入数据
		 * @return:
		 * 		{boolean} 插入成功返回true，失败返回false
		 * @example:
		 * |unieap.grid.insertRows(getRealId("grid"), store, 4); //在第4行插入store中所有记录
		 */
		insertRows: function(id, store, index){
			var grid = unieap.byId(id);
			if (!grid || !store) {
				return false;
			}
			var dataStore = grid.getBinding().getDataStore();
			if (!dataStore) {
				return false;
			}
			var rowSet = dataStore.getRowSet();
			var storeRowSet = store.getRowSet();
			var insertNum =  storeRowSet && storeRowSet.getRowCount()
			if (storeRowSet && insertNum > 0) {
				for (var i = 0; i < insertNum; i++) {
					var row = storeRowSet.getRow(i).getData();
					if(index != null) {
						rowSet.insertRow(row, index + i,true);
					} else {
						rowSet.insertRow(row,null,true);
					}
				}
				
				rowSet.resetUpdate();
			} else {
				return false;
			}
			return true;
		},
		
		/**
		 * @summary:
		 * 		删除grid中所有选中的记录
		 * @description:
		 * 		只有当表格配置selection时，方法才可用
		 * @param:
		 * 		{string} id 表格的id
		 * @example:
		 * |unieap.grid.deleteSelectedRow(getRealId("grid"));
		 */
		deleteSelectedRow: function(id){
			var grid = unieap.byId(id);
			if (!grid || grid.getBinding()) {
				return;
			}
			var dataStore = grid.getBinding().getDataStore();
			if (!dataStore) {
				return;
			}
			var rowSet = dataStore.getRowSet();
			rowSet.deleteSelectedRows();
			rowSet.resetUpdate();	
		},
		
		/**
		 * @summary:
		 * 		删除grid中指定的一行
		 * @description:
		 * 		如果index为空，且配置了选择功能，则删除选中的第一条记录，否则将不会删除任何数据
		 * 		如果index不为空，则删除index指定的数据。如果index小于0或大于dataStore中数据个数，则不删除任何数据
		 * @param:
		 * 		{string} id 表格的id
		 * @param:
		 * 		{number} index 要删除行的索引
		 * @return:
		 * 		{unieap.ds.Row || null} 返回删除的row对象
		 * @example:
		 * |unieap.grid.deleteRow(getRealId("grid"), 4);
		 */
		deleteRow: function(id,index){
			var grid = unieap.byId(id);
			if (!grid) {
				return false;
			}
			var dataStore = grid.getBinding().getDataStore();
			if (!dataStore) {
				return false;
			}
			var rowSet = dataStore.getRowSet();
			var row;
			if (index != null) {
					row = rowSet.deleteRow(index);
			} else {
				var sm = grid.getManager('SelectionManager');
				var indexs;
				sm && (indexs = sm.getSelectedRowIndexs());
				if (indexs && indexs.length > 0) {
					var delIndex = indexs[0];
					row = rowSet.deleteRow(delIndex);
				}
			}
			if(row){
				rowSet.resetUpdate();
				return row;
			}
			return null;
		},
		
		/**
		 * @summary:
		 * 		删除grid中指定的多行数据
		 * @description:
		 * 		如果indexs为空，且配置了选择功能，则删除选中的所有记录，否则将不会删除任何数据
		 * 		如果indexs不为空，则删除indexs指定的数据。如果数组中的index小于0或大于dataStore中数据个数，则不删除其指定的行
		 * @param:
		 * 		{string} id 表格的id
		 * @param:
		 * 		{array} indexs 要删除行的索引数组
		 * @example:
		 * |unieap.grid.deleteRows(getRealId("grid"), [2,4,6]);
		 */
		deleteRows: function(id, indexs) {
			var grid = unieap.byId(id);
			if (!grid) {
				return;
			}
			var dataStore = grid.getBinding().getDataStore();
			if (!dataStore) {
				return;
			}
			var rowSet = dataStore.getRowSet();
			if (indexs && indexs.length > 0) {
				rowSet.deleteRows(indexs);
			} else {
				rowSet.deleteSelectedRows();
			}
			
			rowSet.resetUpdate();
		},
		
		/**
		 * @summary:
		 * 		根据给定store中一条数据，更新表格指定index行的所有行数据
		 * @description:
		 * 		如果index为空，且配置了选择功能，则更新选中的第一条记录，否则将不会更新任何数据
		 * 		如果index不为空，则更新index指定的行数据。如果index小于0或大于dataStore中数据个数，则不更新其指定的行
		 * @param:
		 * 		{string} id 表格的id
		 * @param:
		 * 		{unieap.ds.DataStore} store 要更新的源数据对象
		 * @param:
		 * 		{number} index 要更新行的索引
		 * @param:
		 * 		{number} storeIndex store中一条数据的索引，默认为第一条数据
		 * @return:
		 * 		{boolean}  更新成功返回true，失败返回false
		 * @example:
		 * |unieap.grid.updateRow(getRealId("grid"), store, 2);
		 */
		updateRow: function(id, store,  index, storeIndex){
			var grid = unieap.byId(id);
			if (!grid || !store) {
				return false;
			}
			var gridStore = grid.getBinding().getDataStore();
			if (!gridStore) {
				return false;
			}
			storeIndex = storeIndex || 0;
			var row = store.getRowSet().getRow(storeindex)
			if(!row) return false;
			var rowData = row.getData();
			var selectedRow = null;
			if (index) {
				selectedRow = gridStore.getRowSet().getRow(index);
			} else {
				var sm = grid.getManager('SelectionManager'), selIndexs;
				sm && ( selIndexs= sm.getSelectedRowIndexs());
				if (selIndexs && selIndexs.length > 0) {
					var rowIndex = selIndexs[0];
					selectedRow = gridStore.getRowSet().getRow(rowIndex);
				} else {
					return false;
				}
			}
			if(selectedRow == null){
				return false;
			}
			for (var key in rowData) {
				if (rowData[key] != null)
					selectedRow.setItemValue(key, rowData[key]);
			}
			gridStore.getRowSet().resetUpdate();
			return true;
		},
		
		/**
		 * @summary:
		 * 		根据给定store中一条数据，更新表格选中行的所有行数据
		 * @description:
		 * 		只有表格配置选择功能，才可用此方法
		 * @param:
		 * 		{string} id 表格的id
		 * @param:
		 * 		{unieap.ds.DataStore} store 要更新的源数据对象
		 * @param:
		 * 		{number} index store中一条数据的索引，默认为第一条数据
		 * @return:
		 * 		{boolean} 更新成功返回true，失败返回false
		 * @example:
		 * |unieap.grid.updateSelectedRow(getRealId("grid"), store);
		 */
		updateSelectedRow: function(id,store,index){
			var grid = unieap.byId(id);
			if (!grid || !store) {
				return false;
			}
			index = index || 0;
			var row = store.getRowSet().getRow(index)
			if(!row) return false;
			var rowData = row.getData();
			var gridStore = grid.getBinding().getDataStore();
			var sm = grid.getManager('SelectionManager'), indexs;
			sm && (indexs = sm.getSelectedRowIndexs());
			if(!indexs){
				return false;
			}
			var rowIndex = indexs[0];
			var selectedRow = gridStore.getRowSet().getRow(rowIndex);
			for(var key in rowData){
				selectedRow.setItemValue(key,rowData[key]);
			}
			gridStore.getRowSet().resetUpdate();
			return true;
		},
		
		/**
		 * @summary:
		 * 		获得指定一行的数据，返回一个DataStore
		 * @description:
		 * 		如果index为空，且配置了选择功能，则获取到选中的第一条记录，否则返回null
		 * 		如果index不为空，则返回index指定的行数据。如果index小于0或大于dataStore中数据个数，则返回null
		 * @param:
		 * 		{string} id 表格的id
		 * @param:
		 * 		{boolean} clone 是否克隆原数据
		 * @param:
		 * 		{number} index 要获得行的索引
		 * @example:
		 * |unieap.grid.getRow(getRealId("grid"), true, 2);
		 */
		getRow: function(id, clone, index){
			var grid = unieap.byId(id);
			if (!grid) {
				return null;
			}
			var store = grid.getBinding().getDataStore();
			if (!store) {
				return null;
			}
			var rowData = null;
			if(index != null){
				var row = store.getRowSet().getRow(index);
				if (!row) {
					return null;
				}
				rowData = row.getData();
			} else {
				var sm = grid.getManager("SelectionManager"), rowIndexs;
				sm && (rowIndexs = sm.getSelectedRowIndexs());
				if(rowIndexs != null && rowIndexs.length > 0){
					var index = rowIndexs[0];
					var row = store.getRowSet().getRow(index);
					if (!row) {
						return null;
					}
					rowData = row.getData();
				}else{
					return null;
				}
			}
			var ds = new unieap.ds.DataStore();
			ds.setName(store.getName());
			ds.setRowSetName(store.getRowSetName());
			ds.getRowSet().addRow(rowData,clone);
			
			return ds;
		},
		
		/**
		 * @summary:
		 * 		获得指定的一组数据，返回一个DataStore
		 * @description:
		 * 		如果indexs为空，且配置了选择功能，则获取到选中的所有记录，否则返回null
		 * 		如果indexs不为空，则返回indexs指定的所有行数据。
		 * @param:
		 * 		{string} id 表格的id
		 * @param:
		 * 		{boolean} clone 是否克隆原数据
		 * @param:
		 * 		{array} indexs 要获得行的索引数组
		 * @example:
		 * |unieap.grid.getRows(getRealId("grid"), true, [2,3,5]);
		 */
		getRows: function(id, clone, indexs){
			var grid = unieap.byId(id);
			if (!grid) {
				return null;
			}
			var store = grid.getBinding().getDataStore();
			if (!store) {
				return null;
			}
			var rowData = null;
			var ds = new unieap.ds.DataStore();
			ds.setName(store.getName());
			ds.setRowSetName(store.getRowSetName());
			if(indexs && indexs.length > 0){
				for (var i = 0; i < indexs.length; i ++) {
					var row = store.getRowSet().getRow(indexs[i]);
					if (!row) {
						continue;
					}
					rowData = row.getData();
					ds.getRowSet().addRow(rowData,clone);
				}
				
			} else {
				var sm = grid.getManager("SelectionManager"), rowIndexs;
				sm && (rowIndexs = sm.getSelectedRowIndexs());
				if(rowIndexs != null && rowIndexs.length > 0){
					for (var i = 0; i < rowIndexs.length; i ++) {
						var row = store.getRowSet().getRow(rowIndexs[i]);
						if (!row) {
							continue;
						}
						rowData = row.getData();
						ds.getRowSet().addRow(rowData,clone);
					}
				}else{
					return null;
				}
			}
			
			return ds;
		},

		/**
		 * @summary:
		 * 		交换指定的两行数据
		 * @description:
		 * 		如果index1或index2为空或不是合法的索引，则不交换数据
		 * @param:
		 * 		{string} id 表格的id
		 * @param:
		 * 		{number} index1
		 * @param:
		 * 		{number} index2
		 * @return:
		 * 		{boolean} 交换成功，返回true，失败则返回false
		 * @example:
		 * |unieap.grid.exchangeRow(getRealId("grid"), 1, 2);
		 * 交换第2行和第三行的数据
		 */
		exchangeRow: function(id,index1,index2){
			var grid = unieap.byId(id);
			if (!grid) {
				return false;
			}
			var store = grid.getBinding().getDataStore();
			if (!store) {
				return false;
			}
			var rowSet = store.getRowSet();
			if(typeof(index1)!='number' || typeof(index2)!='number'){
				return false;
			}
			var row1 = rowSet.getRow(index1);
			var row2 = rowSet.getRow(index2);
			if(row1 && row2){
				rowSet.updateRow(index1,row2);
				rowSet.updateRow(index2,row1);
				rowSet.resetUpdate();
				return true;
			}
			return false;
		},
		
		/**
		 * @summary:
		 * 		设置grid单元格内容
		 * @param:
		 * 		{string} id 表格的id
		 * @param:
		 * 		{string} cell 单元格(即jsp中cell)的name或序号（注序号从0开始）
		 * @param:
		 * 		{number} rowIndex 行索引
		 * param:
		 * 		{number} value 赋给单元格的值
		 * @example:
		 * |unieap.grid.setPropertyValue(getRealId("grid"), 1, 2, "张三");
		 * 将第3行第2个单元格的内容设置为"张三"
		 */
		setPropertyValue: function(id,cell,rowIndex,value){
			var grid = dijit.byId(id);
			if(!grid){
				return;
			}
			var viewManager = grid.getViewManager();
			viewManager.setItemText(cell,rowIndex,value);
		},
		
		/**
		 * @summary:
		 * 		获得grid单元格内容
		 * @param:
		 * 		{string} id 表格的id
		 * @param:
		 * 		{string} cell 单元格(即jsp中cell)的name或序号（注序号从0开始）
		 * @param:
		 * 		{number} rowIndex 行索引
		 * param:
		 * 		{boolean} isOrigin 是否获得格式化前的值,如果值不为true则获的是格式化之后的值
		 * @return:
		 * 		{string} 指定单元格的内容
		 * @example:
		 * |var data = unieap.grid.getPropertyValue(getRealId("grid"), 1, 2, true);
		 * 获取第3行第2个单元格的格式化前的内容
		 */
		getPropertyValue: function(id, cell, rowIndex, isOrigin){
			var grid = dijit.byId(id);
			if(!grid){
				return;
			}
			var viewManager = grid.getViewManager();
			return viewManager.getItemText(cell,rowIndex,isOrigin);
		},
		
		/**
		 * @summary:
		 * 		获得Cell上配置的编辑器
		 * @param:
		 * 		{string} id 表格的id
		 * @param:
		 * 		{number|string} cell 单元格(即jsp中cell)的name或序号（注序号从0开始）
		 * @return:
		 * 		{unieap.form.FormWidget || null}
		 * @example:
		 * |<cell editor="{editorClass:'unieap.form.TextBox'}" name="attr_sal"></cell>
		 * |var editor=unieap.grid.getCellEditor(getRealId("grid"),"attr_sal");
		 * |alert(editor.declaredClass); //弹出unieap.form.TextBox
		 */
		getCellEditor: function(id, cell){
			var grid = dijit.byId(id), cell;
			if(!grid || (cell = grid.getCell(cell))){
				return null;
			}
			return cell.getEditor();
		},
		
		/**
		 * @summary:
		 * 		设置Cell上的编辑器
		 * @param:
		 * 		{string} id 表格的id
		 * @param:
		 * 		{number|string} cell 单元格(即jsp中cell)的name或序号（注序号从0开始）
		 * @param:
		 * 		{string}editorClass
		 * @param:
		 * 		{object} editorProps
		 * @example:
		 * |<cell editor="{editorClass:'unieap.form.TextBox'}" label="姓名" name="attr_sal"></cell>
		 * |//将姓名列的编辑器改为NumberTextBox,并设置编辑器能输入的最大长度为10
		 * |var cell=unieap.grid.setCellEditor("grid","attr_sal","unieap.form.NumberTextBox",{maxLength:10});
		 */
		setCellEditor: function(id, cell, editorClass, editorProps){
			var grid = dijit.byId(id), cell;
			if(!grid || (cell = grid.getCell(cell))){
				return null;
			}
			cell.setEditor(editorClass, editorProps);
		},
		
		/**
		 * @summary:
		 * 		设置表格结构
		 * @param:
		 * 		{string} id 表格的id
		 * @param：
		 * 		{array} inStructure
		 * @example:
		 *  |	layout = unieap.grid.setStructure("grid", s);
		 * 	|	grid.getManager("ViewManager").refresh();
		 */
		setStructure: function(id, inStructure) {
			var grid = dijit.byId(id);
			if(!grid || !grid.getManager("LayoutManager")){
				return;
			}
			grid.getManager("LayoutManager").setStructure(inStructure);
		},
		
		/**
		 * @summary:
		 * 		获得表格结构
		 * @param:
		 * 		{string} id 表格的id
		 * @return：
		 * 		{array} inStructure
		 * @example:
		 *  |	layout = unieap.grid.getStructure("grid", s);
		 */
		getStructure: function(id) {
			var grid = dijit.byId(id);
			if(!grid || !grid.getManager("LayoutManager")){
				return null;
			}
			return grid.getManager("LayoutManager").getStructure();
		},
		
		/**
		  * @summary:
		  * 	列隐藏
		  * @param:
		  * 	{string} id 表格的id
		  * @param:
		  * 	{array} cols
		  * @description:
		  * 	参数cols代表被隐藏列的数组,
		  * 	形如:[2,4](数字为列的原始序号,第2列和4列将被隐藏),["col1", "col3", "col2"](字符串为列的id或者securityId)
		  * @example:
		  * |	unieap.grid.hideCell("grid", ["col1", "col3", "col2"]);
		  */
		hideCell: function(id, cols) {
			var grid = dijit.byId(id);
			if(!grid || !grid.getManager("LayoutManager")){
				return null;
			}
			grid.getManager("LayoutManager").hideCell(cols);
		},
		
		/**
		  * @summary:
		  * 	列显示
		  * @param:
		  * 	{string} id 表格的id
		  * @param:
		  * 	{array} cols
		  * @description:
		  * 	参数cols代表被显示列的数组,
		  * 	形如:[2,4](数字为列的原始序号,第2列和4列将被显示),["col1", "col3", "col2"](字符串为列的id或者securityId)
		  * @example:
		  * |	unieap.grid.showCell("grid", ["col1", "col3", "col2"]);
		  */
		showCell: function(id, cols) {
			var grid = dijit.byId(id);
			if(!grid || !grid.getManager("LayoutManager")){
				return null;
			}
			grid.getManager("LayoutManager").showCell(cols);
		 },
		 
		 /**
		  * @summary:
		  * 	调整Grid各列的次序
		  * @param:
		  * 	{string} id 表格的id
		  * @param:
		  * 	{array} sequence 
		  * @param:
		  * 	{number} fixedNum
		  * @description:
		  * 	参数sequence为列顺序数组, 
		  * 	形如:[4,2,3,1,0](数字为列的原始序号),["col1", "col3", "col2"](字符串为列的id)
		  * 	参数fixedNum为锁定列数
		  * 	如：sortCell([4,2,1,0,3],2)
		  * @example:
		  * |	unieap.grid.sortCell("grid", ["col1", "col3", "col2"], ${1}2);
		  * ${1}表示锁定前两列
		  */
		 sortCell: function(id, sequence, fixedNum) {
		 	var grid = dijit.byId(id);
			if(!grid || !grid.getManager("LayoutManager")){
				return null;
			}
			grid.getManager("LayoutManager").sortCell(sequence, fixedNum);
		 },
		 
		 /**
		  * @summary:
		  * 	列锁定/解锁
		  * @param:
		  * 	{string} id 表格的id
		  * @param:
		  * 	{array} cols
		  * @param:
		  * 	{boolean} isLock
		  * @description:
		  * 	参数cols代表被锁定列的数组,
		  * 	形如:[4,2](数字为列的原始序号,第2列和4列将被锁定),["col1", "col3", "col2"](字符串为列的id或者securityId)
		  * 	参数isLock设置操作类型为锁定还是解锁,可不写,默认为锁定。
		  * @example:
		  * |	unieap.grid.sortCell("grid", ["col1", "col3", "col2"], true);
		  */
		lockCell: function(id, cols, isLock) {
			var grid = dijit.byId(id);
			if(!grid || !grid.getManager("LayoutManager")){
				return null;
			}
			grid.getManager("LayoutManager").lockCell(cols, isLock);
		 },
		 
		 /**
	     * @summary:
	     * 		取得某个单元格的Dom结点
	     * @param:
		 * 	{string} id 表格的id
	     * @param:
	     * 		{string|number} inCell 列绑定名称或者列索引号
	     * @param:
	     * 		{number} inRowIndex 单元格所在的行索引
	     * @return:
	     * 		{domNode}
	     * @example:
	     * |//获得Grid中第一行列绑定名为attr_sal的单元格所在的domNode
	     * |var cellNode=unieap.grid.getCellNode("grid","attr_sal",0); 
	     */
	    getCellNode: function(id, inCell, inRowIndex) {
	    	var grid = dijit.byId(id);
			if(!grid || !grid.getManager("ViewManager")){
				return null;
			}
			return grid.getManager("ViewManager").getCellNode(inCell, inRowIndex);
	    },
	    
	    /**
		 * @summary:
		 * 		获得指定单元格的内容
		 * @param:
		 * 		{string} id 表格的id
		 * @param:
		 * 		{string|number} inCell 列绑定名称或者列索引号
		 * @param:
		 * 		{number} inRowIndex 单元格所在的行索引
		 * @param：
		 * 		{boolean} isOrigin 是否获得格式化前的值
		 * @example:
		 * |//获得第一行、第一列单元格中的数据
		 * |var text=unieap.grid.getItemText("grid",0,0);
		 * |//获得第一行行中列绑定名为attr_sal的单元格的值
		 * |var text1=grid.getManager('ViewManager').getItemText("attr_sal",0);
		 * @example:
		 * |var txt=unieap.grid.getItemText("grid","attr_sal",0);
		 * |var txt1=unieap.grid.getItemText("grid","attr_sal",0,true);
		 * |比如单元格的显示值格式化成'5,000.00',txt的值就为'5,000.00',而txt1为'5000'.
		 */
	    getItemText: function(id, inCell, inRowIndex,isOrigin) {
			var grid = dijit.byId(id);
			if(!grid || !grid.getManager("ViewManager")){
				return null;
			}
			return grid.getManager("ViewManager").getItemText(inCell, inRowIndex,isOrigin);
	    },
	    
	    /**
		 * @summary:
		 * 		设置指定单元格样式(合并单元格暂不支持该方法设置样式)
		 * @param:
		 * 		{string} id 表格的id
		 * @param:
		 * 		{number} inRowIndex  单元格所在的行索引 
		 * @param:
		 * 		{string|number} cell 列绑定名称或者列索引号
		 * @param:
		 * 		{object} styles 样式对象
		 * @example:
		 * |//设置Grid中第一行中列绑定名为attr_sal的单元格的样式
		 * |unieap.grid.setCellStyles("grid", 0,"attr_sal",{"color":"red","textAlign":"left"});
		 */
		setCellStyles: function(id, inRowIndex, inCell, styles) {
			var grid = dijit.byId(id);
			if(!grid || !grid.getManager("ViewManager")){
				return null;
			}
			grid.getManager("ViewManager").setCellStyles(inRowIndex, inCell, styles);
		},
		
		/**
		 * @summary:
		 * 		设置指定行样式(合并单元格暂不支持该方法设置样式)
		 * @param:
		 * 		{string} id 表格的id
		 * @param：
		 * 		{number} inRowIndex 行索引号
		 * @param:
		 * 		{object} styles 样式对象
		 * @example:
		 * |//设置Grid中第一行的样式
		 * |unieap.grid.setRowStyles(getRealId("grid"),0,{"color":"red","textAlign":"left"});
		 */
		setRowStyles: function(id, inRowIndex, styles) {
			var grid = dijit.byId(id);
			if(!grid || !grid.getManager("ViewManager")){
				return null;
			}
			grid.getManager("ViewManager").setRowStyles(inRowIndex, styles);
		},
		
		/**
		 * @summary:
		 * 		取得grid当前行号
		 * @param:
		 * 		{string} id 表格的id
		 * @return:
		 * 		{number}
		 * @example:
		 *|	unieap.grid.getCurrentRowIndex(getRealId("grid")); 
		 */
		getCurrentRowIndex: function(id) {
			var grid = dijit.byId(id);
			if(!grid || !grid.getManager("RowManager")){
				return null;
			}
			return grid.getManager("RowManager").getCurrentRowIndex();
		},
		
		/**
		 * @summary:
		 * 		取得表格总行数
		 * @param:
		 * 		{string} id 表格的id
		 * @return:
		 * 		{number}
		 * @example:
		 *|	unieap.grid.getRowCount(getRealId("grid")); 
		 */
		getRowCount: function(id) {
			var grid = dijit.byId(id);
			if(!grid || !grid.getManager("RowManager")){
				return null;
			}
			return grid.getManager("RowManager").getRowCount();
		},
		
		/**
		 * @summary:
		 * 		设置当前行
		 * @param:
		 * 		{string} id 表格的id
		 * @param：
		 * 	{number} inRowIndex行号
		 * @example:
		 *|	unieap.grid.setCurrentRow(getRealId("grid"), 5);
		 * 设置第6行为当前行 
		 */
		setCurrentRow: function(id, inRowIndex) {
			var grid = dijit.byId(id);
			if(!grid || !grid.getManager("RowManager")){
				return null;
			}
			return grid.getManager("RowManager").setCurrentRow(inRowIndex);
		}
	};
   })();
}


//@ sourceURL=/tp_fp/techcomp/ria/dojo/../unieap/util/util.js