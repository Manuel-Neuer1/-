if (!dojo._hasResource["unieap.form.FieldSet"]) {
	dojo._hasResource["unieap.form.FieldSet"] = true;
	dojo.provide("unieap.form.FieldSet");
	dojo.require("unieap.layout.Container");
	dojo.require("dijit._Templated");

	dojo.declare("unieap.form.FieldSet", [unieap.layout.Container,dijit._Templated], {
				
		/**
		 * @declaredClass:
		 * 		unieap.form.FieldSet
		 * @summary:
		 * 		相当于HTML中fieldset标签
		 * @classDescription:
		 * 		FieldSet控件的高度值是随着FieldSet内容的增多而增大的,所以高度不必设置。
		 * @img:
		 * 		images/form/fieldset.png
		 * @example:
		 * |<div dojoType="unieap.form.FieldSet" id="fld" title="用户信息" open="true"></div>
		 * @example:
		 * |var fieldSet=unieap.byId('fld');
		 * |fld.setTitle('我改变了Title信息');
		 * |fld.toggle();
		 */
	
		//配置属性接口
		UserInterfaces : dojo.mixin({
			showIcon : "boolean",
			title : "string",
			description : "string",
			open : "boolean",
			flexible : "boolean",
			onBeforeToggle : "function",
			showTitle: "boolean",
			onToggle : "function"
		},
		unieap.layout.Container.prototype.UserInterfaces),
	
		templateString : "<div>" +
				"<fieldset class=\"u-form-fieldset\" dojoAttachPoint=\"rootNode\"><legend class=\"u-form-fieldset-legend\" style=\"-moz-user-select: none;\"  dojoAttachPoint=\"legendNode\">"
				+ "<span class=\"u-form-fieldset-btn\" dojoAttachEvent=\"onclick:_onToggle,onmouseover:_handleFocus,onmouseout:_handleFocus\" dojoAttachPoint=\"focusNode\">"
				+ "</span>"
				+ "<span dojoAttachPoint=\"titleNode\"></span>"
				+ "<span dojoAttachPoint=\"descNode\" ></span>"
				+ "</legend>"
				+ "<div class=\"u-form-fieldset-hiddenNode\">"
				+ "<div style=\"height: auto;\" dojoAttachPoint=\"containerNode\" >"
				+ "</div></div></fieldset></div>",
		
		/**
		 * @summary:
		 * 		设置是否显示FieldSet上的三角图标
		 * @type:
		 * 		{boolean}
		 */	
		showIcon:true,		
				
		
        /**
         * @summary:
         * 		设置FieldSet控件的文字信息,相当于HTML中legend的内容
         * @type:
         * 		{string}
         * @example:
         * 		在HTML标签中,可以这样书写
         * |<fieldset>
         * |	<legend>你好</legend>
         * |</fieldset>
         * @example:
         * 		在RIA中,这样书写:
         * |<div dojoType="unieap.form.FielSet" title="你好"></div>
         * 
         */
        title:'',
        
        /**
		 * @summary:
		 * 		设置是否显示FieldSet的提示信息
		 * @type:
		 * 		{boolean}
		 * @default:
		 * 		true
		 */	
        showTitle:(typeof(unieap.widget.form.showTitle) == 'undefined')?true:unieap.widget.form.showTitle,
		
		/**
		 * @summary:
		 * 		设置Title的附加信息,只有当控件处于关闭状态时才显示
		 * @description:
		 * 		例如设置了title为学生,可以设置description的属性为"姓名、年龄"等
		 * @type:
		 * 		{string}
		 * @example:
		 * |<div dojoType="unieap.form.FieldSet" title="学生" description="年龄:22,性别:男"></div>
		 */
		description:'',
		
		/**
		 * @summary:
		 * 		设置FieldSet控件的初始状态
		 * @description:
		 * 		如果open为true,FieldSet控件内的内容可见,否则不可见
		 * @type:
		 * 		{boolean}
		 * @default:
		 * 		true
		 * @example:
		 * |<div dojoType="unieap.form.FieldSet" open="false"></div>
		 * 		FieldSet控件处于关闭状态,里面的内容不可见
		 */
		open : true,
		
		
	    /**
	     * @summary:
	     * 		是否支持展开关闭
	     * @type：
	     * 		{boolean}
	     * @default：
	     * 		true
	     * @example：
	     * |	<div dojoType="unieap.layout.FieldSet" flexible="false">
	     * |	</div>
	     * 		此时FieldSeet不可关闭		
	     */	
		flexible:true,
		
		
		
		/**
		 * @summary:
		 * 		点击FieldSet控件上的按钮前触发
		 * @description:
		 * 		当方法返回为true时,点击FieldSet控件上的按钮,控件的状态将发生变化(展开或者关闭)。
		 * 		如果方法返回为false,控件的状态将保持不变
		 * @example:
		 * |function fn(){
		 * |	return false;
		 * |}
		 * |<div dojoType="unieap.form.FieldSet" onBeforeToggle="fn"></div>
		 * 		当点击FieldSet控件上的按钮时,控件还是处于展开状态
		 */
		onBeforeToggle:function(){
			return true;
		},
		
		//按钮点击事件
		_onToggle:function(evt){
			if(unieap.fireEvent(this,this.onBeforeToggle,[])&&this.flexible){
				unieap.fireEvent(this,this.onToggle,[])
				this.open = !this.open;
				this._setCss();
				this.notifyResize();
			}
		},
		
		/**
		 * @summary:
		 * 		点击FieldSet控件上的按钮时触发
		 * @param：
		 * 		{object} evt
		 */
		onToggle:function(evt){
		},
		
		startup : function() {
			!this.showTitle && (this.domNode.title="");
			this.title&&this.setTitle(this.title);
			!this.open&&this.description&&this.setDescription(this.description);
			//是否显示控件图标
			dojo.style(this.focusNode,"display",!this.showIcon?"none":"block");
			this._setCss();
			this.inherited(arguments);
		},


        /**
         * @summary:
         * 		展开或者关闭FieldSet控件
         * @description:
         * 		当FieldSet控件处于展开状态时调用本方法会关闭FieldSet控件,反之则展开FieldSet控件。
         * 		值得说明的是,如果控件的onBeforeToggle返回的是false或者flexible为false,调用本方法将无效
         * @example:
         * |var filedSet=unieap.byId('fieldSet');
         * |fieldSet.toggle();
         */
		toggle : function() {
			if(unieap.fireEvent(this,this.onBeforeToggle,[])&&this.flexible){
				this.open = !this.open;
				this._setCss();
			}
		},

        //toggle按钮,改变fielset的状态
		_setCss : function() {
			if(this.open){
				dojo.removeClass(this.rootNode,'dijitClosed');
				dojo.addClass(this.rootNode,'dijitOpen');
				//dojo.style(this.rootNode,"borderWidth","1px 1px 1px 1px")
				this.setDescription('');
				this._setHeight(this.height);
				this.resizeContainer();
			}else{
				dojo.removeClass(this.rootNode,'dijitOpen');
				dojo.addClass(this.rootNode,'dijitClosed');
				//dojo.style(this.rootNode,"borderWidth","1px 0px 0px 0px")
				this.description&&this.setDescription(this.description);
				if(this.height!="auto"){
					//U_EAP00023102 自适应容器内放入fieldset，关闭再也展不开了
	    			var height = dojo.contentBox(this.rootNode).h;
	    			dojo.style(this.rootNode,"height", height + "px");
	    			dojo.style(this.domNode,"height","auto");
				}
			}
		},

        //鼠标移动到按钮上的效果
		_handleFocus : function(evt) {
			if(evt.type=='mouseover'){
				dojo.addClass(this.legendNode,'u-form-fieldset-mouseover');
			}else{
				dojo.removeClass(this.legendNode,'u-form-fieldset-mouseover');
			}

		},

		/**
		 * @summary:
		 * 		设置FieldSet控件的文字信息,相当于HTML中legend的内容
		 * @param:
		 * 		{string} title
		 * @example:
		 * |unieap.byId('fldSet').setTitle('我改变了');
		 */
		setTitle : function(title) {
			if(title==""||title==null||typeof(title)==undefined){
				dojo.removeClass(this.titleNode,"u-form-fieldset-label");
			}
			this.titleNode.innerHTML=title;
			this.title = title;
			dojo.attr(this.domNode,'title','');
			dojo.addClass(this.titleNode,"u-form-fieldset-label")
		},
		
		/**
		 * @summary:
		 * 		设置Title属性的附件信息
		 * @param:
		 * 		{string} desc
		 * @example:
		 * |unieap.byId("fldSet").setDescription("<b>hi</b>");
		 */
		setDescription:function(desc){
			if(desc==""||desc==null||typeof(desc)==undefined){
				dojo.removeClass(this.descNode,"u-form-fieldset-desc");
			}
			this.descNode.innerHTML=desc;
			dojo.addClass(this.descNode,"u-form-fieldset-desc")
		},
		
		/**
		 * @summary:
		 * 		设置图标是否显示
		 * @param {Object} value
		 * @example:
		 * |unieap.byId("fldSet").toggleIcon("true");
		 */
		toggleIcon:function(value){
			this.showIcon = value;
			if(!this.showIcon){
				this.focusNode.style.display = "none";
			}else{
				this.focusNode.style.display = "block";
			}
		},
		
		resizeContainer : function(){
			//隐藏的时候不显示
    		if(null==this.domNode|| 0 == this.domNode.offsetHeight) return;
    		if(this.open){
    			if(this.height!="auto"){
    				if( dojo.contentBox(this.domNode).h > 9){
    					var height = dojo.contentBox(this.domNode).h - 2-10;
    					if(dojo.isIE){
    						dojo.style(this.rootNode,"height", height + "px");
    					}
    					height = height - dojo.contentBox(this.legendNode).h-8;
    					dojo.style(this.containerNode,"height", height + "px");
    				}
    			}
    			this.resizeChildrenContainer();
    		}
		}
	});
}