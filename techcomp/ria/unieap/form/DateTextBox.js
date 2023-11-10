
if (!dojo._hasResource["unieap.form.DateTextBox"]) {
	dojo._hasResource["unieap.form.DateTextBox"] = true;
	dojo.provide("unieap.form.DateTextBox");
	dojo.require('unieap.form.TextBoxWithIcon');
	dojo.require("unieap.util.util");
	dojo.require("dojo.date");
	
	dojo.declare("unieap.form.DateTextBox", unieap.form.TextBoxWithIcon, {
		/**
		 * @declaredClass:
		 * 		unieap.form.DateTextBox
		 * @summary:
		 * 	    日期文本框,支持日期显示值格式化、日期值格式化
		 * @superClass:
		 * 		unieap.form.TextBoxWithIcon
		 * @img:
		 * 		images/form/datetextbox.png
		 * @example:
		 * |	${1}<div dojoType="unieap.form.DateTextBox" displayFormatter="{dataFormat:'yyyy年MM月dd日 HH时mm分ss秒'}"></div>
		 *	${1}点击日期框旁的按钮,日期框会显示当前时间的"年月日 时分秒",例如"2009年06月05日 16时29分30秒"
		 *	HH表示显示24进制的时间,如果想显示12进制,可以将dataFormat中的HH换为hh,此时,文本框右侧会自动出现am或者pm
		 *	使用日期框控件时,请注意如下事项:
		 *	1.当同时设置hh和HH时,HH将不被解析,只解析hh,例如'yyyy-MM-dd hhHH'将输出'2009-06-05 02HH pm';
		 *	2.控件只支持yyyy格式,yy或者YYYY等不支持
		 * @example:
		 * |	${2}<div dojoType="unieap.form.DateTextBox" value="20090605" displayFormatter="{dataFormat:'yyyy/MM/dd'}" valueFormatter="{dataFormat:'yyyyMMdd'}"></div>
		 *	${2}上述代码可以将字符串"20090605"格式化成"2009/06/05"
		 * @example:
		 * |	${3}<div dojoType="unieap.form.DateTextBox" popup="{showsTime:12}></div>
		 *	${3}运行上述代码,弹出日期框下方会显示当前的时间,例如'04:42:30 pm',showsTime可选择值为12和24
		 * 		
		 */
		
		//配置属性接口
		UserInterfaces : dojo.mixin({
			autoDate : "boolean",
			range : "object",
			elementNumber : "number",
			currentNode : "number",
			yearNumber : "number",
			dateYM:"boolean"
		},
		unieap.form.TextBoxWithIcon.prototype.UserInterfaces),
		
		/**
		 * @summary：
		 *	当输入文本框内容为空并且鼠标焦点置入时,设置文本框是否显示当前时间。
		 * @description:
		 *	可以在global.js的unieap.widget.form.autoDate中配置全局默认值。
		 * @type：
		 * 	 {boolean}
		 * @default:
		 * 		true
		 */
		autoDate: unieap.widget.form.autoDate,
		
		
		iconClass: "u-calendar-icon",
		
		
		editFormatterClass: "unieap.form.DateDisplayFormatter",
		
		displayFormatterClass: "unieap.form.DateDisplayFormatter",
		
		valueFormatterClass: "unieap.form.DateValueFormatter",
		
		validatorClass: 'unieap.form.DateValidator',
		
		popupClass: 'unieap.form.DateTextBoxPopup',
		
		/**
		 * @summary:
		 * 		设置日期的选择范围
		 * @default:
		 * 		min:1900,max:2999
		 * @type:
		 * 		{object}
		 * @example
		 * |<div dojoType="unieap.form.DateTextBox" range="{min:2000,max:2010}"></div>
		 * 只可以选择在2000年到2010年的日期
		 */
		range: {
			min: 1900,
			max: 2999
		},
		
		/**
		 * @summary:
		 * 		设置是否点击日期输入框时弹出日期框
		 * @type:
		 * 		{boolean}
		 * @default:
		 * 		false
		 */	
		isClickPopup: (typeof(unieap.widget.form.dataTextBoxIsClickPopup) == 'undefined')?false:unieap.widget.form.dataTextBoxIsClickPopup,
		
		
		/**
		 * @summary:
		 * 		设置是否引用年月日期控件。dateYM为true时引用年月日期控件
		 * @default:
		 * 		false
		 * @type:
		 * 		boolean
		 * @example
		 * |<div dojoType="unieap.form.DateTextBox" dateYM ="true"></div>
		 * 只可以选择在2000年到2010年的日期
		 */
		dateYM:false,
		
		elementNumber: 6,
		currentNode: 0,
		yearNumber: 0,
		_displayFormat: "",
		
		getEditFormatter:function(){
			return this.getDisplayFormatter();
		},
		
		postCreate: function(){
			if(this.dateYM){
			    this.editFormatterClass= "unieap.form.DateYMDisplayFormatter";
				this.displayFormatterClass= "unieap.form.DateYMDisplayFormatter";
				this.popupClass = "unieap.form.DateYMTextBoxPopup";
			}
			if(!this.displayFormatter){
				this.displayFormatter={};
			};
			this.inherited(arguments);
			dojo.removeClass(this.iconNode, ["u-textbox-icon","u-form-textbox-icon-normal"]);
			this._displayFormat = this.getDisplayFormatter().getFormat();
			this._parseFormat();
			dojo.addOnLoad(dojo.hitch(this,this._preDate));
		},
		
		setDisabled:function(bool){
			if(bool){
				this.setIconClass('u-calendar-disabled');
				this.inherited(arguments);
			}else{
				this.setIconClass('u-calendar-icon');
				this.inherited(arguments);
			}
		},
		
		getValue:function(){
			var value = this.getText();
			value = this.getDisplayFormatter().parse(value);
			//如果value的值是长整形,判断原始值和当前值格式化后是否一样,如果一样就返回原始值
			//一个long型,例如1249031006562格式化成yyyy-MM-dd后,通过yyyy-MM-dd
			//还原成long型,会出现数据丢失的情况,例如562为毫秒,这个毫秒信息可能就会丢失
			//这样,还原后的long就成了1249031006000
			if(Number(value)){ 
				var binding=this.getBinding();
			  	var origValue=binding?binding.getOrigValue():this.origValue;
				if(origValue&&this.getDisplayFormatter().format(value)==this.getDisplayFormatter().format(origValue)){
					value=origValue;
				}
			}
			value = this.getValueFormatter().parse(value);
			return value;
		},
		
		updateDisplayText:function(){
            this._clearState();
            this._parsedFormat=null;
            this._displayFormat = this.getDisplayFormatter().getFormat();
            this._parseFormat();
            var popup=this.getPopup();
            popup._isShowingNow&&popup.close();
            popup._calendar&&popup._calendar.setDateFormat(this._parsedFormat);
            this.setText(this.getDisplayFormatter().format(this.getValue()));
            
        },
		
		//重写父类的select方法，因为父类的_onFocus方法会调用select方法
		//导致出现 bug U_EAP00008824 
		select:function(){
			var caller=arguments.callee.caller;
			if(caller.nom!="_onFocus"){
				this.focusNode&&this.focusNode.select();
			}
		},

		
		_preDate:function(){
			if (this.validator && this.validator.preDate) {
				var datebox=dijit.byId((this._rootID||"")+this.validator.preDate);
				datebox&&(datebox.getValidator().nextDate=this.id);
			}
		},
		
		_initElement: function(index, content, begin, end, min, max){
			this.elementNode[index] = content;
			this.elementBegin[index] = begin;
			this.elementEnd[index] = end;
			this.elementMin[index] = min;
			this.elementMax[index] = max;
		},
		_parseFormat: function(){
			this.elementNode = [];
			this.elementBegin = [];
			this.elementEnd = [];
			this.elementMax = [];
			this.elementMin = [];
			var formatString = this._parseDateFormat(this._displayFormat);
			var index = 0;
			var number = 0;
			var begin=0;
			for (var i = 0; i < formatString.length; i++) {
				if (formatString.charAt(i) == "%") {
					switch (formatString.charAt(i + 1)) {
						case "Y":
							begin = this._displayFormat.indexOf("yyyy");
							this._initElement(index, "yyyy", begin+1, begin+4, this.range.min, this.range.max);
							index++;
							break;
						case "m":
							begin = this._displayFormat.indexOf("MM");
							this._initElement(index, "MM", begin + 1, begin + 2, 1, 12);
							index++;
							break;
						case "d":
							begin = this._displayFormat.indexOf("dd");
							this._initElement(index, "dd", begin + 1, begin + 2, 1, 31);
							index++;
							break;
						case "H":
							begin = this._displayFormat.indexOf("HH");
							this._initElement(index, "HH", begin+1, begin + 2, 0, 23);
							index++;
							break;
						case "I":
							begin = this._displayFormat.indexOf("hh");
							this._initElement(index, "hh", begin+1, begin + 2, 1, 12);
							index++;
							break;
						case "M":
							begin = this._displayFormat.indexOf("mm");
							this._initElement(index, "mm", begin + 1, begin + 2, 00, 59);
							index++;
							break;
						case "S":
							begin = this._displayFormat.indexOf("ss");
							this._initElement(index, "ss", begin + 1, begin + 2, 00, 59);
							index++;
							break;
						case "P":
							begin=this._displayFormat.indexOf("am");
							this._initElement(index, "ap", begin + 1, begin + 2, 'am', 'pm');
							break;
						default:
							break;
					}
					number++;
				}
			}
			this.elementNumber = number;
		},
		_parseDateFormat: function(dateFormat){
			
			if (!dateFormat || typeof dateFormat != "string" || dateFormat.indexOf("%") != -1) {
				return "%Y-%m-%d %H:%M:%S";
			}
			
			if(this._parsedFormat){
				return this._parsedFormat;
			}
			var df = dateFormat;
			if (df.indexOf("yyyy") != -1) {
				df = df.replace(/yyyy/g, "%Y");
			}
			if (df.indexOf("MM") != -1) {
				df = df.replace(/MM/g, "%m");
			}
			if (df.indexOf("dd") != -1) {
				df = df.replace(/dd/g, "%d");
			}
			if(df.indexOf("hh")!=-1){
				df=df.replace(/hh/g,"%I"); //12进制显示时间
			}else if (df.indexOf("HH") != -1) {
				df = df.replace(/HH/g, "%H"); //24进制显示时间
			}
			if (df.indexOf("mm") != -1) {
				df = df.replace(/mm/g, "%M");
			}
			if (df.indexOf("ss") != -1) {
				df = df.replace(/ss/g, "%S");
			}
			
			if(df.indexOf('%I')!=-1){
				df=df+" %P"; //显示am或者pm
				//修改this._displayFormat值,便于查找am/pm
				this._displayFormat=this._displayFormat+" am";
			}
			
			this._parsedFormat=df;
			return df;
		},
		_textSelect: function(start, end){
			var length = end - start + 1;
			start = start < 1 ? 1 : start;
			length = length < 0 ? 0 : length;
			if (dojo.isIE) {
				var rngDate = this.textbox.createTextRange();
				rngDate.collapse();
				rngDate.moveStart('character', start - 1);
				rngDate.moveEnd('character', length);
				rngDate.select();
			}
			else {
				this.textbox.setSelectionRange(start - 1, end);
			}
		},
		_getCursorPos: function(){
			if (typeof(this.textbox.selectionStart) == "number") {
				return this.textbox.selectionStart + 1;
			}
			else {
				var textLen = this.textbox.value.length;
				var rngPos = document.selection.createRange();
				var rngDate = this.textbox.createTextRange();
				rngDate.collapse();
				if (rngPos.inRange(rngDate)) 
					return 1;
				for (var i = 2; i <= textLen + 1; i++) {
					rngDate.move('character', 1);
					if (rngPos.inRange(rngDate)) 
						return i;
				}
			}
		},
		_getText: function(start, end){
			return this.textbox.value.substr(start - 1, end - start + 1);
		},
		_setText: function(start, end, strValue){
			this.textbox.value = this.textbox.value.substr(0, start - 1) + strValue + this.textbox.value.substr(end);
		},
		_getSelectText: function(){
			return this._getText(this.elementBegin[this.currentNode], this.elementEnd[this.currentNode]);
		},
		_setSelectText: function(newValue, isLast){
			var textValue = this._getSelectText();
			
			if (newValue.length != textValue.length) {
				newValue = '0000' + newValue;
				newValue = newValue.substr(newValue.length - textValue.length, newValue.length);
			}
			this._setText(this.elementBegin[this.currentNode], this.elementEnd[this.currentNode], newValue);
			if (isLast) {
				this._selectNext();
			}
			else {
				this._textSelect(this.elementBegin[this.currentNode], this.elementEnd[this.currentNode]);
			}
		},
		_selectNext: function(){
			this._onRightClick();
		},
		_getElementMin: function(){
			return this.elementMin[this.currentNode];
		},
		_getElementMax: function(){
			if (this.elementMax[this.currentNode] == 31) 
				return this._getDayMax();
			else 
				return this.elementMax[this.currentNode];
		},
		_getDayMax: function(){
			var yearIndex, monthIndex,iYear,iMonth;
			for (var i = 0; i < this.elementNumber; i++) {
				if (this.elementNode[i] == "yyyy") {
					yearIndex = i;
				}else if (this.elementNode[i] == "MM") {
					monthIndex = i;
				}
			}
			if (yearIndex != 'undefined') {
				iYear = parseInt(this._getText(this.elementBegin[yearIndex], this.elementEnd[yearIndex]));
			}
			iMonth = parseInt(this._getText(this.elementBegin[monthIndex], this.elementEnd[monthIndex]), 10);
			var date = new Date(iYear, iMonth - 1, 1);
			return dojo.date.getDaysInMonth(date);
			
		},
		_doElemetValidator: function(){
			if (this.textbox.value != "") {
				for (var i = 0; i < this.elementNumber; i++) {
					if (this.elementNode[i] == "yyyy" || this.elementNode[i] == "MM" || this.elementNode[i] == "dd"||this.elementNode[i]=='hh') {
						var temp = this.currentNode;
						this.currentNode = i;
						var displayValue = parseInt(this._getText(this.elementBegin[i], this.elementEnd[i]),10);
						if (displayValue > this._getElementMax() || displayValue < this._getElementMin()) {
							this._setText(this.elementBegin[i], this.elementEnd[i], this._getElementMax());
						}
						this.currentNode = temp;
					}
				}
			}
		},
		_clearState: function(){
			this.yearNumber = 0;
			for (var i = 0; i < this.elementNode.length; i++) {
				var tn = "dateTextElementNode" + this.elementNode[this.currentNode];
				this[tn] = 0;
			}
		},
		_setAutoDate: function(){
			if (this.autoDate&&!this.disabled) {
				var date = new Date();
				var displayValue = unieap.dateFormat(date.getTime(), this._displayFormat);
				this.textbox.value = displayValue;
			}
		},
		
		////////////////////////////////内部事件///////////////////////////
		
		_getKeyPress: function(evt){
			var keyCode = evt.keyCode;
			var key = '';
			if (this._getSelectText() == this.textbox.value) {
				this._textSelect(this.elementBegin[0], this.elementEnd[0]);
				this.currentNode = 0;
			}
			if ((keyCode != 9) && (keyCode != 13)) 
				dojo.stopEvent(evt);
			if (keyCode >= 37 && keyCode <= 40) {
				if (keyCode == 37) 
					key = 'Left';
				if (keyCode == 38) 
					key = 'Up';
				if (keyCode == 39) 
					key = 'Right';
				if (keyCode == 40) 
					key = 'Down';
			}
			else 
				if (keyCode >= 48 && keyCode <= 57) {
					keyCode = keyCode - 48;
					key = '' + keyCode;
				}
				else 
					if (keyCode >= 96 && keyCode <= 105) {
						keyCode = keyCode - 96;
						key = '' + keyCode;
					}
					else 
						if (keyCode == 46 || keyCode == 8) {
							key = 'Delete';
						}
			return key;
		},
		_onDeleteClick: function(){
			this.textbox.value = "";
			this._clearState();
		},
		_onKeyDown: function(evt){
			if (13 != evt.keyCode && this.readOnly || this.disabled) {
				return;
			}
			var key = this._getKeyPress(evt);
		
			if (key && "_on" + key + "Click" in this) {
				this["_on" + key + "Click"]();
			}
			else 
				if (key && !isNaN(key)) {
					this._onNumberClick(key);
				}
				else {
					this.inherited(arguments);
				}
		},
		
		//处理是am还是pm
		_processAP:function(text){
			if(text=='am'){
				this._setSelectText('pm');
			}else{
				this._setSelectText('am');
			}
			
		},
		_doAddOrPlus: function(operator){
			var text=this._getSelectText();;
			if(isNaN(text)){
				this._processAP(text);
				return;
			}
			var oldValue = parseInt(text,10);
			var newValue = operator == "add" ? oldValue + 1 : oldValue - 1;
			if (operator == "add" && newValue > this._getElementMax()) {
				newValue = this._getElementMin();
			}else if (newValue < this._getElementMin()) {
				newValue = this._getElementMax();
			}
			this._setSelectText(newValue);
		},
		_onUpClick: function(){
			this._doAddOrPlus("add");
		},
		_onDownClick: function(){
			this._doAddOrPlus("plus");
		},
		_doNavigate: function(operator){
			this._doElemetValidator();
			var index = this.currentNode;
			if (operator == "left") {
				if (this.currentNode == 0) 
					this._textSelect(this.elementBegin[0], this.elementEnd[0]);
				else {
					this._textSelect(this.elementBegin[index - 1], this.elementEnd[index - 1]);
					this.currentNode = index - 1;
				}
			}
			else {
				if (this.currentNode == (this.elementNumber - 1)) {
					this._textSelect(this.elementBegin[0], this.elementEnd[0]);
					this.currentNode = 0;
				}
				else {
					this._textSelect(this.elementBegin[index + 1], this.elementEnd[index + 1]);
					this.currentNode = index + 1;
				}
			}
			this._clearState();
			
		},
		_onLeftClick: function(){
			this._doNavigate("left");
		},
		_onRightClick: function(){
			this._doNavigate("right");
		},
		_onNumberClick: function(key){		
			if (this._getSelectText() == "") {
				var date = new Date();
				this.textbox.value = unieap.dateFormat(date.getTime(), this._displayFormat);
//				//解决autoDate=false时，键盘输入的bug
//				if(this.autoDate) {return;}
			}
			if(dojo.indexOf(['am','pm'],this._getSelectText())>-1){
				this._onRightClick();
			}
			if (this.elementNode[this.currentNode] == "yyyy" || this.elementNode[this.currentNode] == "YYYY") {
				var oldValue = this._getSelectText();
				var oldLen = oldValue.length;
				var tmpStr = '0000000000';
				var newValue = oldValue.substr(1, oldLen - 1) + key;
				if (this.yearNumber == 0) {
					this.oldYear = oldValue;
					newValue = tmpStr.substr(1, oldLen - 1) + key;
					this.yearNumber++;
					this._setSelectText(newValue);
				}
				else 
					if (this.yearNumber < 3) {
						var newValue = oldValue.substr(1, oldLen - 1) + key;
						this.yearNumber++;
						this._setSelectText(newValue);
					}
					else 
						if (this.yearNumber == 3) {
							var te = newValue;
							if (parseInt(newValue, 10) > this._getElementMax() || parseInt(newValue, 10) < this._getElementMin()) {
								newValue = this.oldYear;
							}
							else {
								newValue = oldValue.substr(1, oldLen - 1) + key;
							}
							this._setSelectText(newValue, newValue == te);
							this.yearNumber = 0;
						}
			}
			else {
				var tn = "dateTextElementNode" + this.elementNode[this.currentNode];
				var numb = this[tn];
				if (!numb) {
					numb = 0;
				}
				numb = numb == 1 ? 0 : 1;
				this[tn] = numb;
				var oldValue = this._getSelectText();
				
				var oldLen = oldValue.length;
				var tmpStr = '0000000000';
				var newValue = oldValue.substr(1, oldLen - 1) + key;
				var te = newValue;
				if (parseInt(newValue, 10) > this._getElementMax() || parseInt(newValue, 10) < this._getElementMin()) {
					newValue = tmpStr.substr(1, oldLen - 1) + key;
				}
				else {
					newValue = oldValue.substr(1, oldLen - 1) + key;
				}
				
				if (newValue == 0 && numb == 0 && (this.elementNode[this.currentNode] == "MM" || this.elementNode[this.currentNode] == "dd"||this.elementNode[this.currentNode] == "hh")) {
					this._setSelectText(newValue, false);
					return;
				}
				if (newValue != te) {
					numb == 0;
					this._setSelectText(newValue, false);
					return;
				}
				this._setSelectText(newValue, numb == 0);
			}
			
		},
		
		_onIconClick: function(evt) {
			if(!(this.readOnly&&unieap.global.datatextbox_notReadonlyPopup)&&!this.disabled&& unieap.fireEvent(this,this.onBeforeIconClick,[evt])) {
				unieap.fireEvent(this,this.onIconClick,[evt])
				var popup=this.getPopup();
				if(popup._isShowingNow){
					popup.close()
				}else{
					popup.open()
				}
			}
		},

		_onClick: function(evt){
			if (this.readOnly || this.disabled) {
				return;
			}
			if(this.isClickPopup){
				var popup=this.getPopup();
				if(popup._isShowingNow){
					popup.close()
				}else{
					popup.open()
				}
			}
			var iPos = this._getCursorPos();
			if (iPos < (this.elementBegin[0])) {
				this.currentNode = 0;
			}
			else 
				if (iPos >= (this.elementEnd[this.elementNumber - 1])) {
					this.currentNode = this.elementNumber - 1;
				}
				else {
					for (var i = 1; i <= this.elementNumber; i++) {
						if (iPos <= (this.elementEnd[i - 1]) + 1) {
							this.currentNode = i - 1;
							break;
						}
					}
				}
				
			this._textSelect(this.elementBegin[this.currentNode], this.elementEnd[this.currentNode]);
			this.inherited(arguments);

		},
		
		_onFocus: function(evt){
			
			if (!evt||typeof(evt)=="string") return;
			
			this._oText=this.getText();
			
			
			if (this.textbox.value == "" && this.readOnly != true) {
				this._setAutoDate();
			}
			this.inherited(arguments);
		},
		_onBlur: function(evt){
			if (!evt||typeof(evt)=="string") return;
			
			this._doElemetValidator();
			
			this._clearState();
			
			this.inherited(arguments);
			
		},
		_onBeforeBlur: function(){
			var text=this.getText();
			if(text!=this._oText){
				this.fireDataChange();		
				this.onChange(this.getValue());
			}
			this._oText=text;
		}
	});
}
