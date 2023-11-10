dojo.provide("unieap.form.RadioButtonGroup");
dojo.require("unieap.form.CheckGroup");

dojo.declare("unieap.form.RadioButtonGroup", unieap.form.CheckGroup,{
	
	/**
	 * @declaredClass:
	 * 		unieap.form.RadioButtonGroup
	 * @summary:
	 * 		单选按钮组
	 * @superClass:
	 * 		unieap.form.CheckBoxGroup
	 * @example:
	 * |<script type="text/javascript">
	 * |	var city = new unieap.ds.DataStore('city_store', [
	 * |		{CODEVALUE: 1,CODENAME: '浙江'}, 
	 * |		{CODEVALUE: 2,CODENAME: '辽宁'}, 
	 * |		{CODEVALUE: 3,CODENAME: '福建'},
	 * |		{CODEVALUE: 4,CODENAME: '沈阳'}, 
	 * |		{CODEVALUE: 5,CODENAME: '北京'},
	 * |		{CODEVALUE: 6,CODENAME: '宁海'}, 
	 * |		{CODEVALUE: 7,CODENAME: '宁波'}, 
	 * |		{CODEVALUE: 8,CODENAME: '水车'},
	 * |		{CODEVALUE: 15,CODENAME: '上园'}, 
	 * |		{CODEVALUE: 16,CODENAME: '下园'}
	 * |	]);
	 * |	dataCenter.addDataStore(city);
	 * |</script>
	 * |<div id="RadioGroup" 
	 * |	cols="4" 
	 * |	labelAlign="left" 
	 * |	dojoType="unieap.form.RadioButtonGroup" 
	 * |	dataProvider="{'store':'city_store'}">
	 * |</div>
	 * @img:
	 * 		images/form/radioboxgroup.png
	 */
	
	
	getCheckBox: function(inRowIndex) {
		if(this.checkboxMap[inRowIndex]){
			return this.checkboxMap[inRowIndex];
		}			
		var checkbox = {};
		var checkboxNode = document.createElement('div');
		checkboxNode.name = this.name || this.id;
		checkboxNode.className="u-form-rdoBtn";
		var modifiedNode = document.createElement('div');
		modifiedNode.className="u-form-modified";
		var inputNode = document.createElement('input');
		inputNode.className="u-form-chkInput";
	 	inputNode.type="radio";
		checkboxNode.appendChild(modifiedNode);
		checkboxNode.appendChild(inputNode);
		checkbox.getValue = dojo.hitch(this,function(){
			return this.getValue();
		});
		this.connect(inputNode,"onmousedown",function(evt){
			if(inputNode.checked) return;
			inputNode.checked = true;
			if(!unieap.fireEvent(this,this.onBeforeChange,[])){
				dojo.stopEvent(evt);
				return;
			
			}
			if (checkbox) {
				this._onChange(checkbox);
			}
		});
	 	dojo.style(modifiedNode,"display","none");
		checkbox.checkboxNode = checkboxNode;
		checkbox.modifiedNode = modifiedNode;
		checkbox.inputNode = inputNode;
		this.checkboxMap[inRowIndex] = checkbox;
		return checkbox;
	},
	
	/**
	 * @summary:
	 * 		设置单选按钮组的值
	 * @param:
	 * 		{string} value
	 */
	setValue: function(value) {
//		value = value!=null ? String(value) : "";
		var checkboxMap = this.checkboxMap;		
		var valueAttr = this.decoder?this.decoder.getValueAttr():this.getDecoder().getValueAttr();
		for (var i=0, l = checkboxMap.length;i<l; i++) {
			if(this.dataProvider.getItemValue(valueAttr, i)==value){
				checkboxMap[i].inputNode.checked=true;
			}else{
				checkboxMap[i].inputNode.checked=false;
			}
		}
		this.fireDataChange();
	},
	
	/**
	 * @summary:
	 * 		取得单选按钮组的值
	 * @return:
	 * 		string
	 */
	getValue: function() {
		var checkboxMap = this.checkboxMap;
		for (var i=0; i<checkboxMap.length; i++) {
			if (checkboxMap[i].inputNode.checked) {
				var valueAttr = this.decoder?this.decoder.getValueAttr():this.getDecoder().getValueAttr();
        		return this.dataProvider.getItemValue(valueAttr, i);
			}
		}
		return  "";
	},
	
	/**
	 * @summary:
	 * 		取得选中按钮的标签
	 * @return:
	 * 		string
	 */
	getText: function(){
		var checkboxMap = this.checkboxMap;
		for (var i=0; i<checkboxMap.length; i++) {
			if (checkboxMap[i].inputNode.checked) {
				return this.getLabel(i);
			}
		}
		return  "";
	},
	
	_onChange: function(checkbox) {
		var checkboxMap = this.checkboxMap;
		for (var i=0; i<checkboxMap.length; i++) {
			if (checkboxMap[i] == checkbox) continue;
			checkboxMap[i].inputNode.checked = false;
		}
		this.getValidator().validate();
		this.fireDataChange();
		this.onChange(checkbox);
	},
	
	
	
	/**
	 * @summary:
	 * 		设置选中RadioButton的状态
	 * @param:
	 * 		{boolean} bool
	 * @param:
	 * 		{number} item
	 * 		RadioButton序号
	 */
	setChecked: function(bool, item) {
		var checkbox = this.checkboxMap[item];
		checkbox.inputNode.checked=bool;	
		this.fireDataChange();
	}
});
