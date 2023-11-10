dojo.provide("unieap.form.DropDownButton");
dojo.require("unieap.form.Button");
dojo.declare("unieap.form.DropDownButton", [unieap.form.Button], {
	/**
	 * @declaredClass:
	 * 		unieap.form.DropDownButton
	 * @superClass:
	 * 		unieap.form.Button
	 * @summary:
	 * 		下拉按钮控件由两部分组成,控件左侧是一个按钮,右侧是一个下拉箭头。
	 * @classDescription:		
	 * 		点击按钮会触发按钮点击事件,点击下拉箭头会触发下拉箭头点击事件
	 * @img:
	 * 		images/form/dropDown.png
	 * @example:
	 * |<div dojoType="unieap.form.DropDownButton" onClick="alert(1)" label="点击我">
	 * |	<div dojoType="unieap.menu.Menu">
	 * |		<div dojoType="unieap.menu.MenuItem">中国</div>
	 * |		<div dojoType="unieap.menu.MenuItem">美国</div>
	 * |	</div>
	 * |</div>
	 * 		运行上述代码,点击按钮时会弹出数字1,点击下拉箭头会弹出菜单
	 */
	
	//配置属性接口
	UserInterfaces : dojo.mixin({
		onBeforeArrowClick : "function",
		onArrowClick : "function"
	},
	unieap.form.Button.prototype.UserInterfaces),
	
	templateString: "<a href='javascript:void(0);' tabIndex='-1' class='u-form-dropBtn u-form-btn-outer' style=\"text-decoration:none;\">"+
						"<button class='u-form-btn'  style='padding-left: 0px;' type='button' style=\"height:100%\" dojoAttachPoint='inputNode,btnNode' onfocus=\"unieap.fep&&unieap.fep(this)\">"+
							"<table dojoAttachPoint=\"mainTable\" style=\"display:inline-block;\">"+
								"<tr><td><div dojoAttachPoint=\"iconNode\"></div></td>" +
								"<td><div class=\"u-form-btn-txt\" dojoAttachPoint=\"labelNode\"></div></td>"+
							"</table>"+
						"</button>"+
						"<span class='u-form-dropBtn-icon u-form-dropBtn-icon-normal' dojoAttachPoint='arrowNode'></span>"+
					"</a>",
	
	
	/**
	 * @summary:
	 * 		设置下拉按钮控件要下拉的对象,一般用于编程方式来创建控件
	 * @type:
	 * 		{object}
	 * @example:
	 * |var menu=new unieap.menu.Menu();
	 * |	menu.addChild(new unieap.menu.MenuItem({label:'中国'});
	 * |	menu.addChild(new unieap.menu.MenuItem({label:'美国'});
	 * |var dropBtn=new unieap.form.DropDownButton({label:'点击我',dropDown:menu});
	 * |	dropBtn.placeAt(dojo.body());
	 * 		在body下创建一个DropDownButton,并增加两个菜单
	 */
	dropDown:null,
	
	
	//覆盖_Template.js中的_fillContent方法
	_fillContent: function(){
		if(this.srcNodeRef){
			var nodes = dojo.query("*", this.srcNodeRef);
			unieap.form.DropDownButton.superclass._fillContent.call(this, nodes[0]);
			this.dropDownContainer = this.srcNodeRef;
		}
	},
	
    postCreate:function(){
		
		this.inherited(arguments);
		
		this.conns = [];
		if(!this.disabled) {
			this.dropDownHandle = dojo.connect(this.arrowNode,'onclick',this,'_processDropDown');
			this.conns.push(this.dropDownHandle);
		}
		
		//计算按钮实际宽度
		var width = this.width || dojo.style(this.domNode,'width');
		var buttonWidth = parseInt(width,10) - (dojo.style(this.arrowNode,'width')||16);
		buttonWidth > 0 && dojo.style(this.btnNode,'width',buttonWidth+"px");
		
		//在IE8下,当width设置过小时，比如38px,显示不了图标
		if(dojo.isIE==8 || !!dojo.isWebKit){
			if(buttonWidth>0&&parseInt(buttonWidth,10)<30){
				this.mainTable.style.width=buttonWidth;
				this.btnNode.style.paddingLeft="0";
				this.btnNode.style.paddingRight="0";
				
			}
		}
	},
	
	_setWidthAndHeigth: function() {
		//处理控件的宽度和高度
		this.width && dojo.style(this.domNode, "width", isNaN(this.width)?this.width:(this.width+"px"));
		this.height && dojo.style(this.domNode, "height", isNaN(this.height)?this.height:(this.height+"px"));
	},
	
	
	startup: function() {
		if(this._started){ return; }
		if(!this.dropDown){
			var dropDownNode = dojo.query("[widgetId]", this.dropDownContainer)[0];
			dropDownNode&&(this.dropDown = dijit.byNode(dropDownNode));
			delete this.dropDownContainer;
		}
		
		//dojo1.4中将dijit.popup.prepare改为dijit.popup.moveOffScreen;
		//this.dropDown&&dijit.popup.prepare(this.dropDown.domNode);
		//兼容dojo1.3写法
		if(this.dropDown){
			dijit.popup.moveOffScreen?dijit.popup.moveOffScreen(this.dropDown.domNode):dijit.popup.prepare(this.dropDown.domNode);
		}

		this.inherited(arguments);
	},
	
	destroy:function(){
		dojo.forEach(this.conns,dojo.disconnect);
		this.dropDown&&this.dropDown.destroy();
		this.inherited(arguments);
	},
	
	setDisabled:function(disabled){
		this.inherited(arguments);
		if(disabled){
			this.dropDownHandle && dojo.disconnect(this.dropDownHandle);
			this.dropDownHandle = null;
			dojo.removeClass(this.arrowNode,'u-form-dropBtn-icon-normal');
			dojo.addClass(this.arrowNode,'u-form-dropBtn-icon-disabled');
		}else{
			if(!this.dropDownHandle) {
				this.dropDownHandle = dojo.connect(this.arrowNode,'onclick',this,'_processDropDown');
				this.conns.push(this.dropDownHandle);
			}
			dojo.removeClass(this.arrowNode,'u-form-dropBtn-icon-disabled');
			dojo.addClass(this.arrowNode,'u-form-dropBtn-icon-normal');
		}
	},
	
	//处理点击下拉箭头事件
	_processDropDown:function(evt){
		if(unieap.fireEvent(this,this.onBeforeArrowClick,[evt])&&this.dropDown){
			this._openDropDown();
			unieap.fireEvent(this,this.onArrowClick,[evt])
		}
	},
	
	//显示弹出菜单
	_openDropDown: function() {
		if(!this._opened){
			var dropDown = this.dropDown;
			var oldWidth=dropDown.domNode.style.width;
			var self = this;
			dijit.popup.open({
				parent: this,
				popup: dropDown,
				around: this.domNode,
				orient: this.isLeftToRight() ? {'BL':'TL', 'BR':'TR', 'TL':'BL', 'TR':'BR'}
					: {'BR':'TR', 'BL':'TL', 'TR':'BR', 'TL':'BL'},
				onExecute: function(){
					self._closeDropDown(true);
				},
				onCancel: function(){
					self._closeDropDown(true);
				},
				onClose: function(){
					dropDown.domNode.style.width = oldWidth;
					this._opened = false;
				}
			});
			if(this.domNode.offsetWidth > dropDown.domNode.offsetWidth){
				var adjustNode = null;
				if(!this.isLeftToRight()){
					adjustNode = dropDown.domNode.parentNode;
					var oldRight = adjustNode.offsetLeft + adjustNode.offsetWidth;
				}
				// 使得弹出菜单和按钮一样宽
				dojo.marginBox(dropDown.domNode, {w: this.domNode.offsetWidth});
				if(adjustNode){
					adjustNode.style.left = oldRight - this.domNode.offsetWidth + "px";
				}
			}
			this._opened=true;
			
		}else{
			
			this._closeDropDown();
		}

	},
	
	_closeDropDown: function() {
		if(this._opened){
			dijit.popup.close(this.dropDown);
			this._opened = false;			
		}
	},
	
	/**
	 * @summary:
	 * 		在点击控件右侧的下拉箭头之前触发
	 * @description:
	 * 		如果返回为false,下拉菜单将不会显示
	 * @param:
	 * 		{event} evt 
	 * @return:
	 * 		{boolean}
	 */
	onBeforeArrowClick:function(evt){
		return true;
	},
	
	/**
	 * @summary:
	 * 		点击控件右侧的下拉箭头时触发
	 * @param:
	 * 	{event} evt
	 */
	onArrowClick: function(evt) {
		
	},
	
	//覆盖父类的方法
	_onButtonClick: function(evt) {
		this._closeDropDown();
		this.onClick(evt); 
	},
	
	_onBlur:function(){
		this._closeDropDown();
	}
	
});
