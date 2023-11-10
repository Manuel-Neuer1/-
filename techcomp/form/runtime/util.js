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
 * 时间对象的格式化
 */
Date.prototype.format = function(format) {
	/*
	 * format="yyyy-MM-dd hh:mm:ss";
	 */
	var o = {
		"M+" : this.getMonth() + 1,
		"d+" : this.getDate(),
		"h+" : this.getHours(),
		"m+" : this.getMinutes(),
		"s+" : this.getSeconds(),
		"q+" : Math.floor((this.getMonth() + 3) / 3),
		"S" : this.getMilliseconds()
	}

	if (/(y+)/.test(format)) {
		format = format.replace(RegExp.$1, (this.getFullYear() + "")
				.substr(4 - RegExp.$1.length));
	}

	for ( var k in o) {
		if (new RegExp("(" + k + ")").test(format)) {
			format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k]
					: ("00" + o[k]).substr(("" + o[k]).length));
		}
	}
	return format;
}

// uuid
var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');	 
Math.uuid = function (len, radix) {
  var chars = CHARS, uuid = [], i;
  radix = radix || chars.length;
  if (len) {
    for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
  } else {
    var r;
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
    uuid[14] = '4';
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | Math.random()*16;
        uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
      }
    }
  }		 
  return uuid.join('');
};
Math.uuidFast = function() {
  var chars = CHARS, uuid = new Array(36), rnd=0, r;
  for (var i = 0; i < 36; i++) {
    if (i==8 || i==13 ||  i==18 || i==23) {
      uuid[i] = '-';
    } else if (i==14) {
      uuid[i] = '4';
    } else {
      if (rnd <= 0x02) rnd = 0x2000000 + (Math.random()*0x1000000)|0;
      r = rnd & 0xf;
      rnd = rnd >> 4;
      uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
    }
  }
  return uuid.join('');
};
Math.uuidCompact = function() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
};

Math.getUuid=function(prefix,len,radix){
	if(!prefix)
		return Math.uuid(len,radix);
	else
		return prefix+"_"+Math.uuid(len,radix);
}

// 如果comboBox的change点击事件
function comboBoxChangeEvent(){
  var $this=$(this);
  if($this.css('display')=='none'){
    if($this.next().data("qtip")){
      var api = $this.next().qtip('api');
      api.destroy(true);
    }
  }else{
    if($this.data("qtip")){
      var api = $this.qtip('api');
      api.destroy(true);
    }
  }
}

// 如果groupbox的radio和checkbox点击事件
function groupboxClickEvent(){
  var groupbox=$(this).parents('[dojotype="unieap.form.GroupBox"]');
  var flag=false;
  groupbox.find('input').each(function(){
    if($(this).is(":checked")){
      flag=true
    }
  });
  if(flag==false){
    if(groupbox.data("qtip")){
      var api = groupbox.qtip("api");
      api.set("content.text",WebForm_I18N.validate.notnull);
      api.toggle(true);
    }else{
      groupbox.formTooltip({
        content:WebForm_I18N.validate.notnull,
        my:"left top",
        at:"right bottom"
      });
    }
    return;
  }else{
    if(groupbox.data("qtip")){
      var api = groupbox.qtip('api');
      api.destroy(true);
    }
  }
}
//控件联动出发事件
function cascadeEvent(e){
	var currElementId=e.currentTarget.id;
	var value=this.value;
	value=value.replace(/\%/g,"%25"); //转义！！！！！！！
	value=value.replace(/\#/g,"%23"); 
	value=value.replace(/\&/g,"%26"); 
	value=value.replace(/\+/g,"%2B"); 
	value=value.replace(/\ /g,"%20"); 
	var presetbind = $(this).attr('presetbind');
	if(presetbind){
		var jsonData = dataCenter && dataCenter.toJson?dataCenter.toJson():String(dataCenter || "");
		var bindName = presetbind.split(".")[1];
		var entityName = presetbind.split(".")[0];
		var url = WEBAPP + '/formParser?status=preset' + '&presetbind='
				+ entityName + '&' + bindName + '=' + value;
		var renderData = function(results) {
			var data = results;
			$('[presetbind*="'+entityName+'"][presettype="presetconst"]').each(function() {
				if(this.id!=currElementId){
					var bindData=eval("("+JSON.stringify(data[0])+")");
					var widget = $(this).data("FormWidget");
					var dojotype = $(this).attr('dojotype');
					if(bindData){
						var presetbind = $(this).attr('presetbind')
						var entityId = presetbind.split(".")[0]
						var name = presetbind.split(".")[1]
						if (entityId == entityName) {
							if(dojotype=="unieap.form.DateTextBox"){
                                if(results.length<=1){
                                        widget.currentValue = bindData[name];
								        widget.setDomValue();
                                }else{
                                        $(this).val("");
                                }
							}else if(dojotype=="unieap.form.ComboBox"){
                                if(results.length<=1){
                                        if($(this).attr("multiple")){//多选下拉赋值
                                            var invalueArr = bindData[name].split(";");
                                            $(this).selectpicker("val",invalueArr);
                                        }else{
                                            $(this).selectpicker("val",bindData[name]);
                                        }
                                }else{
                                        $(this).selectpicker("val",null);
                                }
							}else{
                                if(results.length<=1){
                                        $(this).val(bindData[name]);
                                }else{
                                        $(this).val("");
                                }
							}
						}
					}else{
						//this.value="";
						if(dojotype=="unieap.form.ComboBox"){
							$(this).selectpicker("val",null);
						}else{
							$(this).val("");
						}
					}
				}
			});
		};
		$.ajax({
			url : url,
			async : false,
			type : 'post',
			data : jsonData,
			dataType : 'json',
			contentType:'text/plain;charset=UTF-8',
			success : renderData
		});
	}
}
/* 对于textbox控件，当光标离开时判断内容是否合法 */
function textBoxOnBlurEvent(){
	var value = this.value;
	var reg = this.attributes.reg;
	var notnull = this.attributes.notnull;
	var textType = this.attributes.texttype;
	var regValue="";
	var textTypeValue="";
	if(reg){
		regValue = reg.value;
	}
	var notnullValue;
	if(notnull){
		notnullValue=notnull.value;
	}
	if(textType){
		textTypeValue=textType.value;
	}
	
	var element = $(document.getElementById(this.id));
	var width = $(window).width()-element[0].offsetWidth-element[0].offsetLeft-58;
	if(notnullValue && notnullValue=="true"){
		if(value.length==0){
			if(element.data("qtip")){
				var api = element.qtip("api");
				api.set("content.text",WebForm_I18N.validate.notnull);
				api.toggle(true);
			}else{
				element.formTooltip({
					content:WebForm_I18N.validate.notnull
				});
			}
			if(textTypeValue=="money"){
				var $wrapper = element.parents('[spanwrapper="spanWrapper"]');
                if($wrapper.length>0){
                	$wrapper.nextAll("span[name='upper']").remove();
                }else{
                	element.next("span[name='upper']").remove();
                }
			}
			return;
		}else{
			if(textTypeValue=="text"||textTypeValue==""){
				if(element.data("qtip")){
					var api = element.qtip('api');
					api.destroy(true);
				}
			}
		}
	}
	if(textTypeValue.length>0 && value.length>0){
		if(textTypeValue=="identityCard"){
			if(!unieap.isIdentityCard(value)){
				if(element.data("qtip")){
					var api = element.qtip("api");
					api.set("content.text",WebForm_I18N.validate.invalidIdentityCard);
					api.toggle(true);
				}else{
					element.formTooltip({
						content:WebForm_I18N.validate.invalidIdentityCard
					});
				}
			}else{
				if(element.data("qtip")){
					var api = element.qtip('api');
					api.destroy(true);
				}
			}
			return
		}else if(textTypeValue=="email"){
			if(!unieap.isEmail(value)){
				if(element.data("qtip")){
					var api = element.qtip("api");
					api.set("content.text",WebForm_I18N.validate.invalidEmail);
					api.toggle(true);
				}else{
					element.formTooltip({
						content:WebForm_I18N.validate.invalidEmail
					});
				}
			}else{
				if(element.data("qtip")){
					var api = element.qtip('api');
					api.destroy(true);
				}
			}
			return;
		}else if(textTypeValue=="postalCode"){
			if(!unieap.isPostalCode(value)){
				if(element.data("qtip")){
					var api = element.qtip("api");
					api.set("content.text",WebForm_I18N.validate.invalidPostalCode);
					api.toggle(true);
				}else{
					element.formTooltip({
						content:WebForm_I18N.validate.invalidPostalCode
					});
				}
			}else{
				if(element.data("qtip")){
					var api = element.qtip('api');
					api.destroy(true);
				}
			}
			return;
		}else if(textTypeValue=="mobilePhone"){
			if(!unieap.isMobilePhone(value)){
				if(element.data("qtip")){
					var api = element.qtip("api");
					api.set("content.text",WebForm_I18N.validate.invalidMobilePhone);
					api.toggle(true);
				}else{
					element.formTooltip({
						content:WebForm_I18N.validate.invalidMobilePhone
					});
				}
			}else{
				if(element.data("qtip")){
					var api = element.qtip("api");
					api.destroy(true);
				}
			}
			return;
		}else if(textTypeValue=="money"){
			if(!unieap.isMoney(value)){
				if(element.data("qtip")){
					var api = element.qtip("api");
					api.set("content.text","无效金额");
					api.toggle(true);
				}else{
					element.formTooltip({
						content:"无效金额"
					});
				}
				element.next("span[name='upper']").remove();
			}else{
				var $span = $("<span name ='upper' class='bar push-up-5 push-down-5'></span>");
				$span.text(unieap.digitUppercase(value));
				var $wrapper = element.parents('[spanwrapper="spanWrapper"]');
				if($wrapper.length>0){
					$wrapper.nextAll("span[name='upper']").remove();
					$wrapper.next().after($span);
				}else{
					element.next("span[name='upper']").remove();
					element.after($span);
				}
				if(element.data("qtip")){
					var api = element.qtip("api");
					api.destroy(true);
				}
			}
			return;
		}else if(textTypeValue=="customReg"){
			if(regValue && regValue.length>0){
				var r = value.match(eval(regValue));
				if(r==null){
					if(element.data("qtip")){
						var api = element.qtip('api');
						api.set("content.text",WebForm_I18N.validate.invalid);
						api.toggle(true);
					}else{
						element.formTooltip({
							content:WebForm_I18N.validate.invalid
						});
					}
				}else{
					if(element.data("qtip")){
						var api = element.qtip('api');
						api.destroy(true);
					}
				}
				return;
			}
		}else if(textTypeValue=="number"){
			if(!unieap.isNumber(value)){
				if(element.data("qtip")){
					var api = element.qtip('api');
					api.set("content.text",WebForm_I18N.validate.invalidNumber);
					api.toggle(true);
				}else{
					element.formTooltip({
						content:WebForm_I18N.validate.invalidNumber
					});
				}
			}else{
				if(element.data("qtip")){
					var api = element.qtip('api');
					api.destroy(true);
				}
			}
			return;
		}
	}else if(textTypeValue=="money"){
		element.next("span[name='upper']").remove();
	}
}
// 日期型控件关闭日期面板调用函数
function dataTextBoxOnClose(date,dateText,inst){
	var value = dateText;
	var notnull = date.attributes.notnull;
	var notnullValue;
	if(notnull){
		notnullValue=notnull.value;
	}
	var element = $(document.getElementById(date.id));
	if(notnullValue){
		if(value.length==0){
			if(element.data("qtip")){
				var api = element.qtip("api");
				api.set("content.text",WebForm_I18N.validate.notnull);
				api.toggle(true);
			}else{
				element.formTooltip({
					content:WebForm_I18N.validate.notnull
				});
			}
			return;
		}else{
			if(element.data("qtip")){
				var api = element.qtip('api');
				api.destroy(true);
			}
		}
	}
}

unieap.isEmail=function(value){
    var emailReg = /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/;
    return emailReg.test(value);
}

unieap.isPostalCode=function(value){
	var postalCodeReg = /^[1-9][0-9]{5}$/;
	return postalCodeReg.test(value);
}

unieap.isIdentityCard=function(value){
	var identityCardReg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
	return identityCardReg.test(value);
}

unieap.isMobilePhone=function(value){
	var mobilePhoneReg = /^1\d{10}$/;
	return mobilePhoneReg.test(value);
}

unieap.isNumber=function(value){
	var numberReg = /^[0-9]*$/;
	if(numberReg.test(value)){
		if(parseInt(value)>-2147483648 && parseInt(value)<2147483648){
			return true;
		}else{
			return false;
		}
	}else{
		return false;
	}
}
unieap.isMoney=function(value){
	var moneyReg = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;
	if(moneyReg.test(value)){
		if(parseInt(value)<=999999999999){
			return true;
		}else{
			return false;
		}
	}else{
		return false;
	}
}
unieap.digitUppercase = function(n) {
    var fraction = ['角', '分'];
    var digit = [
        '零', '壹', '贰', '叁', '肆',
        '伍', '陆', '柒', '捌', '玖'
    ];
    var unit = [
        ['元', '万', '亿'],
        ['', '拾', '佰', '仟']
    ];
    var head = n < 0 ? '欠' : '';
    n = Math.abs(n);
    var s = '';
    for (var i = 0; i < fraction.length; i++) {
        s += (digit[(i==1?Math.round(n * 10 * Math.pow(10, i)):Math.floor(n * 10 * Math.pow(10, i))) % 10] + fraction[i]).replace(/零./, '');
    }
    s = s || '整';
    n = Math.floor(n);
    for (var i = 0; i < unit[0].length && n > 0; i++) {
        var p = '';
        for (var j = 0; j < unit[1].length && n > 0; j++) {
            p = digit[n % 10] + unit[1][j] + p;
            n = Math.floor(n / 10);
        }
        s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s;
    }
    return head + s.replace(/(零.)*零元/, '元')
        .replace(/(零.)+/g, '零')
        .replace(/^整$/, '零元整');
}