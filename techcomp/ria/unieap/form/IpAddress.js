dojo.provide("unieap.form.IpAddress");
dojo.require("unieap.form.FormWidget");
dojo.declare("unieap.form.IpAddress", unieap.form.FormWidget,{
	
	templateString :
		"<div class='u-form-ip-container' dojoAttachPoint='mainNode'>"+
			"<input type='text' class='u-form-ip-child u-form-ip-firstchild' dojoAttachPoint='firstNode'></input><div class='u-form-ip-dotchild'>.</div>"+
			"<input type='text' class='u-form-ip-child' dojoAttachPoint='secondNode'></input><div class='u-form-ip-dotchild'>.</div>"+
			"<input type='text' class='u-form-ip-child' dojoAttachPoint='thirdNode'></input><div class='u-form-ip-dotchild'>.</div>"+
			"<input type='text' class='u-form-ip-child u-form-ip-forthchild' dojoAttachPoint='forthNode'></input>"+
		"</div>",
	
	/**
	 * @summary:
	 * 		设置控件的宽度
	 * @description:
	 * 		为IP控件设置宽度，不小于130px。
	 * @type:
	 * 		{number|string}
	 */
	width: "130px",
	
	range: {min:0, max:255},
	
	_childwidth: "20px",
	
	//IP文本框之内不允许输入负号、数字及其点号
	inputFilter : {filterRule:/[\.\d]/},
	
	postCreate:function(){
		this.nodeList = [this.firstNode,this.secondNode,this.thirdNode,this.forthNode];
		this._initWidth();
		for(var i=0; i<4; i++){
			dojo.style(this.nodeList[i],"tabIndex", this.tabIndex+i);
			this.connect(this.nodeList[i], "onkeypress", "_onKeyPress");
			this.connect(this.nodeList[i], "onkeydown", "_onKeyDown");
			this.connect(this.nodeList[i], "onkeyup", "_onKeyUp");
			this.connect(this.nodeList[i], "onblur", "_onblur");
		}
	},
	
	/**
	 * @summary:
	 * 		获取IP控件值
	 * @description：
	 * 		如果IP控件值没有输入完整，将返回空串
	 * @example:
	 * |	<div id="ip" dojoType="unieap.form.IpAddress"></div>
	 * |	var ipAddr = unieap.byId('ip');
	 * |	ipAddr.getValue();
	 */
	getValue: function(){
		var retStr = "";
		for(var i=0; i<4; i++){
			if(this.nodeList[i].value != ""){
				retStr += this.nodeList[i].value;
				(i!=3) && (retStr+=".");
			} else {
				return "";
			}
		}
		return retStr;
	},
	
	/**
	 * @summary:
	 * 		设置IP控件值
	 * @description：
	 * 		如果value不是标准的用“.”隔开的4段数字，将不会为控件赋值，字符串中的如果有不合法的字符，将停止赋值。
	 * @param:
	 * 		{string} value
	 * @example:
	 * |	<div id="ip" dojoType="unieap.form.IpAddress"></div>
	 * |	var ipAddr = unieap.byId('ip');
	 * |	ipAddr.getValue();
	 */
	setValue: function(value){
		var strs = value.split(".");
		if(strs.length==4){
			for(var i=0; i<4; i++){
				var temp = parseInt(strs[i]);
				if(isNaN(temp)){
					return;
				}
				var max=this.range.max,
					min=this.range.min;
				if (temp > max || temp < min) {
					temp = 255;
				}
				this.nodeList[i].value=temp;
			}
		}
	},
	
	_initWidth: function(){
		this.width = parseInt(this.width, 10);
		if(this.width<130){
			this.width = 130;
		} else {
			this._childwidth = (this.width-50)/4;
		}

		dojo.style(this.mainNode,"width", this.width+"px");

		for(var i=0; i<4; i++){
			dojo.style(this.nodeList[i],"width", this._childwidth+"px");
		}
	},
	
	_onKeyPress: function(evt){
		this.currentInput = evt.target;
		if(evt.keyCode == 46){
			dojo.stopEvent(evt);
			this._onKeyDot(evt);
			return;
		}
		
		this.getInputFilter().filter(evt);
	},
	
	_movetoright: function(evt){
		if(dojo.isIE){
			var obj = evt.target.createTextRange();
			var r = document.selection.createRange();
			r.collapse(false);
			r.setEndPoint("StartToStart",obj);
			if(r.text == evt.target.value){
				var inputs = this.nodeList;
				for(var i=0; i<3; i++){
					if(evt.target == inputs[i]){
						inputs[i+1].focus();
						this.currentInput = inputs[i+1];
						break;
					}
				}
			}
		}else{
			var start = evt.target.selectionStart;
			if(start == evt.target.value.length){
				var inputs = this.nodeList;
				for(var i=0; i<3; i++){
					if(evt.target == inputs[i]){
						inputs[i+1].focus();
						this.currentInput = inputs[i+1];
						break;
					}
				}
			}
		}
	},
	
	_movetoleft: function(evt){
		if(dojo.isIE){
			var obj = evt.target.createTextRange();
			var r = document.selection.createRange();
			r.collapse(false);
			r.setEndPoint("StartToStart",obj);
			if(r.text == ""){
				var inputs = this.nodeList;
				for(var i=1; i<4; i++){
					if(evt.target == inputs[i]){
						//inputs[i-1].focus();
						var obj1 = inputs[i-1].createTextRange();
						obj1.moveEnd('character', inputs[i-1].value.length);
  						obj1.moveStart('character', inputs[i-1].value.length);
						obj1.select();
						this.currentInput = inputs[i-1];
					}
				}
			}
		}else{
			var start = evt.target.selectionStart;
			if(start == 0){
				var inputs = this.nodeList;
				for(var i=1; i<4; i++){
					if(evt.target == inputs[i]){
						var len = inputs[i-1].value.length;
						inputs[i-1].setSelectionRange(len, len);
						inputs[i-1].focus();
						this.currentInput = inputs[i-1];
					}
				}
			}
		}
	},
	
	_onKeyDown: function(evt){
		switch(evt.keyCode){
			case dojo.keys.RIGHT_ARROW:
				this._movetoright(evt);
				break;
			case dojo.keys.LEFT_ARROW:
				this._movetoleft(evt);
				break;
			default :
		}
	},
	
	_onKeyUp: function(evt){
		switch(evt.keyCode){
			case dojo.keys.RIGHT_ARROW:
			case dojo.keys.LEFT_ARROW:
			case dojo.keys.TAB:			//Tab键
			case 110:					//delete键
			case 189:					//减号
				return;
		}
		if(this._ishas3Number(evt)){
			this._onKeyDot(evt);
		}
		if(evt.target==this.forthNode){
			this._onblur(evt);
		}
	},
	
	_ishas3Number: function(evt){
		var value = parseInt(evt.target.value, 10);
		if(value>99){
			return true;
		}
		return false;
	},
	
	_onblur: function(evt){
		var value = evt.target.value;
		while(value.length>1&&value[0]=='0'){
			value = value.substring(1);
		}
		evt.target.value = value;
		this.validateRange(evt);
	},
	
	_onKeyDot: function(evt){
		var inputs = this.nodeList;
		for(var i=0; i<3; i++){
			if(evt.target == inputs[i]){
				this._onblur(evt);
				inputs[i+1].select();
				this.currentInput = inputs[i+1];
				break;
			}
		}
	},
	
	validateRange:function(evt){
		var value=parseInt(evt.target.value, 10);
			max=this.range.max,
			min=this.range.min;
		if (value > max || value < min) {
			evt.target.value = 255;
			alert(value+"不是一个有效项目，请指定一个介于0和255之间的数值");
		}
	},
	
	getInputFilter:function(){
		return unieap.getModuleInstance(this,"inputFilter","unieap.form.InputFilter");
	}
	
});