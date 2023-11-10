WebForm.widget("unieap.form.DateTextBox", WebForm.FormWidget,{
	dateFormat:'',//日期格式
	widgetType:'',//标志是否为新控件
	dateVm:null,//vue对象
	_create:function(){
		var dateTimeFormat;
		this._super(arguments);
		dateTimeFormat=this.element.attr("editformatter");
		if(dateTimeFormat){//老控件
		    this.widgetType = "jqueryUI";
			this.dateFormat=dateTimeFormat.substring(0,8);
			var isDateTime=new RegExp('hh:mm:ss').test(dateTimeFormat);
			if(isDateTime){
				this.element.datetimepicker({
					timeInput: true,
					timeFormat: "HH:mm:ss",
					dateFormat: this.dateFormat,
					changeMonth: true,
					changeYear: true,
					onClose:function(dateText,inst){
						dataTextBoxOnClose(this,dateText,inst);
					}
				});
			}else{
				this.element.datepicker({
					dateFormat: this.dateFormat,
					changeMonth: true,
					changeYear: true,
					onClose:function(dateText,inst){
						dataTextBoxOnClose(this,dateText,inst);
					}
				});
			}
		}else{//新控件PC：my97 手机：vant
			dateTimeFormat=this.element.attr("editformatter_new");
			if(!dateTimeFormat){//若都没配置，默认是yyyy-mm-dd格式
				dateTimeFormat = "yyyy-MM-dd";
			}
			this.dateFormat = dateTimeFormat;
			if(Util.getClientInfo()==="PC"){
				this.widgetType = "my97";
				if(this.element.attr("notnull") && this.element.attr("notnull")=="true"){
					this.element.attr('onclick','WdatePicker({oncleared:function(){textBoxOnBlurEvent.call(this);$(this).trigger("change")},onpicked:function(){textBoxOnBlurEvent.call(this);$(this).trigger("change")},readOnly:true,dateFmt:"'+dateTimeFormat+'"})');
				}else{
					this.element.attr('onclick','WdatePicker({oncleared:function(){$(this).trigger("change")},onpicked:function(){$(this).trigger("change")},readOnly:true,dateFmt:"'+dateTimeFormat+'"})');
				}
			}else{
				this.element.attr("readOnly","true");
				this.widgetType = "vant";
				renderVantDateWidget(this);
			}


		}
		
		if(this.element.attr("notnull") && this.element.attr("notnull")=="true"){
			if(this.element.css("visibility") &&this.element.css("visibility") =="collapse"){
				return;
			}
			var label = "label[for="+"'"+this.element[0].id+"']";
			if($(label)&& $(label).length>0){
				$($(label).get(0)).after("<span style='color: #FF0000;'>*</span>");
			}else{
				this.element.addClass("date-notnull");
			}
		}
		if(this.element.attr("presetbind")&&this.element.attr("isforeignkey")=="true"){
			this.element.on('change',cascadeEvent);
		}
		
		//监听控件notnull属性的变化。如果新增了notnull属性，则.addClass("notnull")；如果删除了notnull属性，则.removeClass("notnull")；
		var targetNode = this.element[0];
		var options = { attributes: true, childList: false,subtree:false,attributeOldValue:true};
		function callback(mutationsList, observer) {
			mutationsList.forEach(function(record) {
		    	if(record.attributeName=="notnull"){
		    	// 如果发生变化的属性是notnull
		    		if($(record.target).attr("notnull") == "true" && $(record.target).attr("disabled") == undefined){
		    			//如果notnull为true了，并且当前不是“disabled”的，addClass("notnull");
		    			$(record.target).addClass("date-notnull");
		    		}else if($(record.target).attr("notnull") == undefined){
		    			//如果notnull属性不存在，removeClass("notnull");
		    			$(record.target).removeClass("date-notnull");
		    		}
		    	}
	       });
		}
		if(navigator.userAgent.toLowerCase().indexOf("msie") == -1){
			var mutationObserver = new MutationObserver(callback);
			mutationObserver.observe(targetNode, options);
		}
		//监听上传控件notnull属性的变化end
		
	},
	//根据当前currentValue值设置dom
	setDomValue:function(){
		var date;
		if(this.currentValue && $.isNumeric(this.currentValue)){
			// 需要修复的时间
			var nowDate = parseInt(this.currentValue);
			// 服务器端时区，北京东八区（-8*60）
			var timezone = -480;
			// 客户端实际时区(例如东京为东九区：-540)
			var offsetGMT = new Date(nowDate).getTimezoneOffset();
			// 计算差值
			var adjust = timezone - offsetGMT;
			nowDate = nowDate - adjust * 60 * 1000;
			date=new Date(nowDate);
		}
		switch (this.widgetType){
			case "jqueryUI":
				this.element.datetimepicker( "setDate",date?date:""); 
				break;
			case "vant":
				if(date){
					this.dateVm.$data.currentDate = date;
				}
			case "my97":
				if(date){
					this.element.val(dateFormatter(date,this.dateFormat));
				}
				break;
			default:
				break;
		}
	},
	
	submitValue:function(){
//		var date;
//		switch (this.widgetType){
//			case "jqueryUI":
//				date=this.element.datetimepicker( "getDate");
//				break;
//			case "vant":
//			case "my97":
//			    date=new Date(this.element.val().replace(/-/g, '/'));
//			default:
//				break;
//		}
//		if(!date||!date.getTime()){
//			this.currentValue=null;
//			this._super(arguments);
//			return;
//		}
//		// 服务器端时区，北京东八区（-8*60）
//		var timezone = -480;
//		// 客户端实际时区(例如东京为东九区：-540)
//		var offsetGMT = date.getTimezoneOffset();
//		// 计算差值（用户在东京时区下下单，需要补回1小时）
//		var adjust = timezone - offsetGMT;
//		// 需要修复的时间，支持字符串传参
//		var nowDate = date.getTime();
//		this.currentValue=nowDate + adjust * 60 * 1000;
//        var dateStr = this.element.val().replace(/-/g, '/');
//        if(this.element.attr("editformatter_new") == "yyyy-MM"){ //IE下 2020-07这样的字符串，不认为是个合法日期。
//            dateStr = dateStr + "/01";
//        }
//        var date = new Date(dateStr);
//        if(this.element.val()&&(!date||!date.getTime())){
//            Msg.warning(this.element.attr("name")+"日期格式不正确!");
//            this.submitFlag = false;
//            return;
//        }

        var valueStr = this.element.val();
        var patt1 = /\d{4}(\-)\d{1,2}\1\d{1,2}$/;
        var patt2 = /\d{4}(\/)\d{1,2}\1\d{1,2}$/;
        var patt3 = /\d{4}(\-)\d{1,2}$/;
        var patt4 = /\d{4}(\-)\d{1,2}\1\d{1,2}\s([0-5]\d):([0-5]\d)$/;
        var patt5 = /\d{4}(\-)\d{1,2}\1\d{1,2}\s([0-5]\d):([0-5]\d):([0-5]\d)$/;
        var patt6 = /\d{4}(\/)\d{1,2}\1\d{1,2}\s([0-5]\d):([0-5]\d):([0-5]\d)$/;
        if(valueStr.length!=0&&!(patt1.test(valueStr)||patt2.test(valueStr)||patt3.test(valueStr)||patt4.test(valueStr)||patt5.test(valueStr)||patt6.test(valueStr))){
            Msg.warning(this.element.attr("name")+"日期格式不正确!");
            this.submitFlag = false;
            return;
        }
        this.currentValue=this.element.val();
		this._super(arguments);
	}
});
dateFormatter = function(date,format){
	var o = {
	"M+" : date.getMonth()+1, //month
	"d+" : date.getDate(), //day
	"H+" : date.getHours(), //hour
	"m+" : date.getMinutes(), //minute
	"s+" : date.getSeconds(), //second
	"q+" : Math.floor((date.getMonth()+3)/3), //quarter
	"S" : date.getMilliseconds() //millisecond
	}
	if(/(y+)/.test(format)) format=format.replace(RegExp.$1,
	(date.getFullYear()+"").substr(4- RegExp.$1.length));
	for(var k in o)if(new RegExp("("+ k +")").test(format))
	format = format.replace(RegExp.$1,
	RegExp.$1.length==1? o[k] :
	("00"+ o[k]).substr((""+ o[k]).length));
	return format;
}