dojo.provide("unieap.layout.HBoxContainer");
dojo.require("unieap.layout.Container");
dojo.require("dijit._Templated");
dojo.declare("unieap.layout.HBoxContainer",[unieap.layout.Container,dijit._Templated],{
	/**
	 * @declaredClass:
	 * 		unieap.layout.HBoxContainer
	 * @superClass:
	 * 		unieap.layout.Container
	 * @summary:
	 * 		水平容器，在容器中的组件会显示在一行中，如果长度超出，不会出现滚动条
	 * @example:
	 * |<div dojoType="unieap.layout.HBoxContainer" margins="5" paddings="5" width="80%"  height="40px">
	 * |	<div dojoType="unieap.form.Button" label="绝对" width="200px"></div>
	 * |	<div dojoType="unieap.form.TextBox" width="50%"></div>
	 * |	<div dojoType="unieap.form.TextBox" width="50%"></div>
	 * |	<span>文本显示</span>
	 * |</div>
	 */
	 
	//配置属性接口
	UserInterfaces : dojo.mixin({
		align : "string",
		pack : "string",
		margins : "string"
	},
	unieap.layout.Container.prototype.UserInterfaces),
	 
	templateString:'<div class="hbox-outer"><div class="hbox-inner" dojoAttachPoint="containerNode"></div></div>',
	
	/**
	 * @summary:
	 * 		设置HBoxContainer容器所嵌套的组件在其垂直方向的布局
	 * @description:
	 * 		"top"表示子容器居上显示
	 * 		"middle"表示子容器居中显示
	 * 		"bottom"表示子容器居下显示
	 * @type:
	 * 		{string}
	 * @enum:
	 * 		{"top"|"middle"|"bottom"}
	 * @default:
	 * 		"middle"
	 * @example:
	 * |<!-- 内容居上显示,与父容器上方有5px的间距 -->
	 * |<div dojoType="unieap.layout.HBoxContainer" align="top" width="80%" paddings="5 0 0 0" height="40px">
	 * |	<div dojoType="unieap.form.Button" label="绝对" width="200px"></div>
	 * |	<div dojoType="unieap.form.Button" label="百分比" width="50%"></div>
	 * |	<div dojoType="unieap.form.Button" label="百分比" width="50%"></div>
	 * |</div>
	 * @example:
	 * |<!-- 内容居下显示,与父容器下方有5px的间距 -->
	 * |<div dojoType="unieap.layout.HBoxContainer" align="bottom" width="80%" paddings="0 0 5 0" height="40px">
	 * |	<div dojoType="unieap.form.Button" label="绝对" width="200px"></div>
	 * |	<div dojoType="unieap.form.Button" label="百分比" width="50%"></div>
	 * |	<div dojoType="unieap.form.Button" label="百分比" width="50%"></div>
	 * |</div>
	 */
	align:'middle',
	
	
	postMixInProperties:function(){
		//在ie6、7xia，dojo无法获得align属性,总是返回默认值middle
		dojo.isIE<8&&(this.align=this.srcNodeRef.getAttribute('align')||this.align);
		this.inherited(arguments);
	},
	
	
	/**
	 * @summary:
	 * 		设置HBoxContainer容器所嵌套的组件在其水平方向上的布局
	 * @description:
	 * 		"start"表示从父容器内左侧开始定位
	 * 		"center"表示从父容器内中间开始定位
	 * 		"end"表示从父容器内右侧开始定位
	 * @type:
	 * 		{string}
	 * @default:
	 * 		"start"
	 * @enum:
	 * 		{"start"|"center"|"end"}
	 * 		
	 */
	pack:'start',
	
	
	/**
	 * @summary:
	 * 		设置HBoxContainer容器所嵌套的各个组件之间的间距
	 * @description:
	 * 		默认为"0 0 0 0",即{top:0, right:0, bottom:0, left:0}
	 * 		margins会按照如下策略(即浏览器解析css策略)进行解析:
	 *      (1)如果margins中只有一个数字,则top、right、bottom、left均为此值;
	 *      (2)如果margins中只有二个数字,则top、bottom为第一个数字,right和left为第二个数字;
	 *      (3)如果margins中只有三个数字，则top为第一个数字,left和right为第二个数字,bottom为第三个数字
	 *      (4)如果margins中有四个数字,按照top、right、bottom、left的方式分配数字
	 * @type:
	 * 		{string}
	 * @default:
	 * 		"0"
	 * @example:
	 * |<div dojoType="unieap.layout.HBoxContainer" margins="0 5 0 0" width="80%" align="bottom" height="40px">
	 * |	<div dojoType="unieap.form.Button" label="绝对" width="200px"></div>
	 * |	<div dojoType="unieap.form.Button" label="百分比" width="50%"></div>
	 * |	<div dojoType="unieap.form.Button" label="百分比" width="50%"></div>
	 * |</div>
	 */
	margins:'0',
	
	
	/**
	 * @summary:
	 * 		将HBoxContainer容器所嵌套的组件当成一个整体,设置其与HBoxContainer之间的间隔
	 * @description:
	 * 		可以参考margins属性进行设置
	 * @type:
	 * 		{string}
	 * @default:
	 * 		"0"
	 * @example:
	 * |<div dojoType="unieap.layout.HBoxContainer" padding="5 0 0 5" height="40px" width="80%">
	 * |	<div dojoType="unieap.form.Button" label="绝对宽度" width="150px"></div>
	 * |	<div dojoType="unieap.form.Button" label="百分比1" width="30%"></div>
	 * |	<div dojoType="unieap.form.Button" label="百分比2" width="70%"></div>
	 * |</div>
	 */
	paddings:'0',
	
	
	/**
	 * @summary：
	 * 		设置容器的高度
	 * @type：
	 * 		{string}
	 * @default：
	 * 		"100%"
	 */
	height:'100%',
	
	/**
	 * @summary：
	 * 		设置容器的宽度
	 * @type：
	 * 		{string}
	 * @default：
	 * 		"auto"
	 */
	width:'auto',
	
	
	postCreate:function(){
		this.margins=this.margins||{top:0,right:0,bottom:0,left:0};
		this.paddings=this.paddings||{top:0,right:0,bottom:0,left:0};
		dojo.isString(this.margins)&&(this.margins=this.parseMargins(this.margins));
		dojo.isString(this.paddings)&&(this.paddings=this.parseMargins(this.paddings));
		//调用父类的initContainer方法,监听控件大小的变化
		this.initContainer();
		
	},
	
	
	//等待容器嵌套的组件渲染完毕后执行
	startup:function(){
		this.doLayout();
		this.inherited(arguments);
	},
	
	//覆盖父类方法,该方法用来调整其嵌套的组件大小
	resizeContainer:function(){
		if(null == this.domNode) return;
		this.doLayout();
	},
	
	//开始布局
	doLayout:function(){
		var nodes=this.containerNode.childNodes,
			fixed=[],//设置绝对宽度的节点
			noFixed=[],//设置百分比宽度的节点
			percent=0,//总百分比
			availableWidth=dojo.contentBox(this.containerNode).w; //设置百分比宽度的节点可用的总宽度
		this.pureWidth=0;//HBox嵌套的子节点的实际宽度(offsetWidth)

		//遍历容器下嵌套的所有DomNode节点
		for(var l=nodes.length,i=l-1,node;i>=0;i--){
			node=nodes[i];
			//清除可能嵌套的文本,不允许直接嵌套文本
			if(node.nodeType==3){
				this.containerNode.removeChild(node);
				continue;
			}
			if(node.offsetHeight==0) continue;
			var obj=this._getWidth(node);
			if(obj['isPercent']){
				percent+=obj['width'];
				noFixed.unshift(node);
			}else{
				fixed.unshift(node);
			}
		}
		
		//可用的宽度为容器的实际宽度-paddings.left-嵌套的组件个数*(this.margins.left+this.margins.right)
		availableWidth=availableWidth-this.paddings.left-(this.margins.left+this.margins.right)*(nodes.length)-this.paddings.right;
		
		//处理非百分比的DomNode节点
		for (var i = 0, l = fixed.length, node; i < l; i++) {
			node = fixed[i];
			var width=this._getWidth(node)['width'];
			this.pureWidth+=width;
			availableWidth -= width;
		}
		
		//处理百分比的DomNode节点
		for(var i=0,l=noFixed.length,node;i<l;i++){
			node=noFixed[i];
			var width=0;
			//检查剩余的长度是否大于0
			if(availableWidth>0){
				width=Math.floor((availableWidth+0.0)*this._getWidth(node)['width']/percent);
				//检查node是否存在borderLeft和borderRight,因为在w3c标准下border是占宽度的
				var offset=dojo.marginBox(node).w-dojo.contentBox(node).w;
				dojo.style(node,'width',(width-offset)+"px");
			}else{
				width=node.offsetWidth;
			}
			this.pureWidth+=width;
		}
		
		//对控件进行绝对定位
		for (var i = 0, l = nodes.length; i < l; i++) {
			node = nodes[i];
			if (i == 0) {
				node.style.position = "absolute";
				//处理pack属性
				node.style.left = this._getPackLeft() + "px";
			}
			else {
				var prevNode = nodes[i - 1];
				node.style.position = "absolute";
				//前一个节点的left+前一个节点的width+this.margins.right+this.margins.left
				node.style.left =(dojo.style(prevNode, 'left') + dojo.marginBox(prevNode).w+ this.margins.right + this.margins.left) + "px";
			}
			//处理align处理
			this._doVeticalLayout(node);
		}
		
		//定位好子容器后，调整子容器的大小
		unieap.fireContainerResize(this.containerNode);
	},
	
	//获得DomNode的宽度
	_getWidth:function(node){
		var widget=dijit.byNode(node),
			width=(widget||0).width||node.style.width;
		if(width&&this.isPercent(width)){
			return {
				width: parseInt(width,10)||100,
				isPercent: true
			}
		}
		
		return {width:dojo.marginBox(node).w};
	},
	
	//处理align属性
	_doVeticalLayout:function(node){
		switch(this.align){
			case 'top':
				//默认居上显示时,top值为this.padding.top+this.margins.top
				var distance=this.paddings.top+this.margins.top;
				node.style.top=distance+"px";
				break;
				
			//居下显示
			case "bottom":
				var distance=this.containerNode.offsetHeight-dojo.marginBox(node).h-this.margins.bottom-this.paddings.bottom;
				if(distance<=0) {
					node.style.top=this.paddings.top+"px";
					return;
				}
				node.style.top=distance+"px";
				break;

			//默认居中显示
			default:
				var distance=(this.containerNode.offsetHeight-dojo.marginBox(node).h)/2.0;
				if(distance<=0){
					node.style.top=this.paddings.top+"px";
					return;
				}
				distance>=this.paddings.top?(distance=distance):(distance=this.paddings.top);
				distance+=this.margins.top;
				node.style.top=distance+"px";
				break;
		}
	},
	
	//处理pack属性
	_getPackLeft:function(){
		switch(this.pack){
			case 'center':
				var width=dojo.contentBox(this.containerNode).w,
					pureWidth=this.pureWidth;
				if(pureWidth>width) return this.paddings.left;
				pureWidth+=(this.margins.left+this.margins.right)*this.containerNode.childNodes.length;
				var distance=(width-pureWidth)/2.0;
				distance>this.paddings.left?(distance=distance):(distance=this.paddings.left);
				return distance;
			case 'end':
				var width=dojo.contentBox(this.containerNode).w,
					pureWidth=this.pureWidth;
				if(pureWidth>width) return this.paddings.left;
				pureWidth+=(this.margins.left+this.margins.right)*this.containerNode.childNodes.length;
				var distance=width-pureWidth-this.paddings.right;
				distance>this.paddings.left?(distance=distance):(distance=this.paddings.left);
				return distance;
			//默认pack为start
			default:
				return this.paddings.left+this.margins.left;
		}
	},
	
	//判断字符串str是否比百分比结尾
	isPercent:function(str){
		str=String(str);
		return (str.indexOf("%")==str.length-1)||(str=='auto');
	},

	//解析margins或者paddings属性
    parseMargins : function(margins){
		margins=dojo.trim(String(margins));
        var ms = margins.split(/\s+/),
			len = ms.length;
        if(len == 1){
            ms[1] = ms[2] = ms[3] = ms[0];
        } else if(len == 2){
            ms[2] = ms[0];
            ms[3] = ms[1];
        } else if(len == 3){
            ms[3] = ms[1];
        }
        return {
            top:parseInt(ms[0], 10) || 0,
            right:parseInt(ms[1], 10) || 0,
            bottom:parseInt(ms[2], 10) || 0,
            left:parseInt(ms[3], 10) || 0
        };
    }
	
})
