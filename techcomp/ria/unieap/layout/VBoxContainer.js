dojo.provide("unieap.layout.VBoxContainer");
dojo.require("unieap.layout.Container");
dojo.require("dijit._Templated");
dojo.declare("unieap.layout.VBoxContainer",[unieap.layout.Container,dijit._Templated],{
	/**
	 * @declaredClass:
	 * 		unieap.layout.VBoxContainer
	 * @superClass:
	 * 		unieap.layout.Container
	 * @summary:
	 * 		垂直容器，在容器中的组件会显示在一列中
	 * @example:
	 * |<div dojoType="unieap.layout.VBoxContainer" margins="5" paddings="5" width="20%" height="90%">
	 * |	<div dojoType="unieap.form.Button" label="绝对"></div>
	 * |	<div dojoType="unieap.form.TextBox"></div>
	 * |	<div dojoType="unieap.form.TextBox"></div>
	 * |	<span>文本显示</span>
	 * |</div>
	 */
	 
	//配置属性接口
	UserInterfaces : dojo.mixin({
		align : "string",
		pack : "string",
		margins : "string",
		paddings : "string"
	},
	unieap.layout.Container.prototype.UserInterfaces), 
	 
	templateString:'<div class="vbox-outer"><div class="vbox-inner" dojoAttachPoint="containerNode"></div></div>',

	/**
	 * @summary:
	 * 		设置VBoxContainer容器所嵌套的组件在其水平方向的布局
	 * @description:
	 * 		"left"表示子容器居左显示
	 * 		"middle"表示子容器居中显示
	 * 		"right"表示子容器居右显示
	 * @type:
	 * 		{string}
	 * @enum:
	 * 		{"left"|"middle"|"right"}
	 * @default:
	 * 		"middle"
	 * @example:
	 * |<!-- 内容居左显示,与父容器上方有5px的间距 -->
	 * |<div dojoType="unieap.layout.VBoxContainer" align="left" width="20%" paddings="5 0 0 0" height="90%">
	 * |	<div dojoType="unieap.form.Button" label="绝对"></div>
	 * |	<div dojoType="unieap.form.Button" label="百分比"></div>
	 * |	<div dojoType="unieap.form.Button" label="百分比"></div>
	 * |</div>
	 * @example:
	 * |<!-- 内容居右显示,与父容器上方有5px的间距 -->
	 * |<div dojoType="unieap.layout.VBoxContainer" align="right" width="20%" paddings="5 0 0 0" height="90%">
	 * |	<div dojoType="unieap.form.Button" label="绝对"></div>
	 * |	<div dojoType="unieap.form.Button" label="百分比"></div>
	 * |	<div dojoType="unieap.form.Button" label="百分比"></div>
	 * |</div>
	 */
	align:'left',


	postMixInProperties:function(){
		//在ie6、7xia，dojo无法获得align属性,总是返回默认值middle
		dojo.isIE<8&&(this.align=this.srcNodeRef.getAttribute('align')||this.align);
		this.inherited(arguments);
	},


	/**
	 * @summary:
	 * 		设置VBoxContainer容器所嵌套的组件在其垂直方向上的布局
	 * @description:
	 * 		"start"表示从父容器内顶端开始定位
	 * 		"center"表示从父容器内中间开始定位
	 * 		"end"表示从父容器内底部开始定位
	 * @type:
	 * 		{string}
	 * @default:
	 * 		"start"
	 * @enum:
	 * 		{"start"|"center"|"end"}
	 *
	 */
	pack:'center',


	/**
	 * @summary:
	 * 		设置VBoxContainer容器所嵌套的各个组件之间的间距
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
	 * |<div dojoType="unieap.layout.VBoxContainer" margins="5 0 0 0" width="20%" align="left" height="90%">
	 * |	<div dojoType="unieap.form.Button" label="绝对"></div>
	 * |	<div dojoType="unieap.form.Button" label="百分比"></div>
	 * |	<div dojoType="unieap.form.Button" label="百分比"></div>
	 * |</div>
	 */
	margins:'0',


	/**
	 * @summary:
	 * 		将VBoxContainer容器所嵌套的组件当成一个整体,设置其与VBoxContainer之间的间隔
	 * @description:
	 * 		可以参考margins属性进行设置
	 * @type:
	 * 		{string}
	 * @default:
	 * 		"0"
	 * @example:
	 * |<div dojoType="unieap.layout.VBoxContainer" padding="5 0 0 5" height="90%" width="20%">
	 * |	<div dojoType="unieap.form.Button" label="绝对"></div>
	 * |	<div dojoType="unieap.form.Button" label="百分比1"></div>
	 * |	<div dojoType="unieap.form.Button" label="百分比2"></div>
	 * |</div>
	 */
	paddings:'0',


	/**
	 * @summary：
	 * 		设置容器的高度
	 * @type：
	 * 		{string}
	 * @default：
	 * 		'100%'
	 */
	height:'100%',

	/**
	 * @summary：
	 * 		设置容器的宽度
	 * @type：
	 * 		{string}
	 * @default：
	 * 		'auto'
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
	},

	//覆盖父类方法,该方法用来调整其嵌套的组件大小
	resizeContainer:function(){
		if(null == this.domNode) return;
		this.doLayout();
	},


	//开始布局
	doLayout:function(){
		var nodes=this.containerNode.childNodes,
			fixed=[],//设置绝对高度的节点
			noFixed=[],//设置百分比高度的节点
			percent=0,//总百分比
			availableHeight=dojo.contentBox(this.containerNode).h; //设置百分比高度的节点可用的总高度
		this.pureHeight=0;//VBox嵌套的子节点的实际高度(offsetHeight)

		//遍历容器下嵌套的所有DomNode节点
		for(var l=nodes.length,i=l-1,node;i>=0;i--){
			node=nodes[i];
			//清除可能嵌套的文本,不允许直接嵌套文本
			if(node.nodeType==3){
				this.containerNode.removeChild(node);
				continue;
			}
			var widget=dijit.byNode(node),
				height=(widget||0).height||node.style.height;
			if(node.offsetHeight==0&&height!="auto") continue;

			//将所有节点宽度为auto转换为100%
			var width=(widget||0).width||node.style.width;
			if(width=='auto'){node.style.width='100%';}

			var obj=this._getHeight(node);
			if(obj['isPercent']){
				percent+=obj['height'];
				noFixed.unshift(node);
			}else{
				fixed.unshift(node);
			}
		}
		//可用的高度为容器的实际高度-paddings.top-paddings.bottom-嵌套的组件个数*(this.margins.top+this.margins.bottom)
		availableHeight=availableHeight-this.paddings.top-this.paddings.bottom-(this.margins.top+this.margins.bottom)*(nodes.length);

		//处理非百分比的DomNode节点
		for (var i = 0, l = fixed.length, node; i < l; i++) {
			node = fixed[i];
			var height=this._getHeight(node)['height'];
			this.pureHeight +=height;
			availableHeight -=height;
		}

		//处理百分比的DomNode节点
		for(var i=0,l=noFixed.length,node;i<l;i++){
			node=noFixed[i];
			var height=0;
			//检查剩余的长度是否大于0
			if(availableHeight>0){
				height=Math.floor((availableHeight+0.0)*this._getHeight(node)['height']/percent);
				//检查node是否存在borderLeft和borderRight,因为在w3c标准下border是占高度的
				var offset=dojo.marginBox(node).h-dojo.contentBox(node).h;
				(dijit.byNode(node||0)||0).setHeight?dijit.byNode(node).setHeight((height-offset)+"px"):dojo.style(node,'height',(height-offset)+"px");
			}else{
				height=node.offsetHeight;
			}
			this.pureHeight+=height;
		}

		//对控件进行绝对定位
		for (var i = 0, l = nodes.length; i < l; i++) {
			node = nodes[i];
			if (i == 0) {
				node.style.position = "absolute";
				//处理pack属性
				node.style.top = this._getPack() + "px";
			}
			else {
				var prevNode = nodes[i - 1];
				node.style.position = "absolute";
				//前一个节点的top+前一个节点的height+this.margins.bottom+this.margins.top
				node.style.top =(dojo.style(prevNode, 'top') + dojo.marginBox(prevNode).h+ this.margins.bottom + this.margins.top) + "px";
			}
			//处理align处理
			this._doVeticalLayout(node);
		}

		unieap.fireContainerResize(this.domNode);

	},

	//获得DomNode的高度
	_getHeight:function(node){
		var widget=dijit.byNode(node),
			height=(widget||0).height||node.style.height;
		if(height&&this.isPercent(height)){
			return {
				height: parseInt(height,10)||100,
				isPercent: true
			}
		}

		return {height:dojo.marginBox(node).h};
	},

	//处理align属性
	_doVeticalLayout:function(node){
		switch(this.align){
			case 'middle':
				var distance=(this.containerNode.offsetWidth-node.offsetWidth)/2.0;
				if(distance<=0){
					node.style.left=this.paddings.left+"px";
					return;
				}
				distance>=this.paddings.left?(distance=distance):(distance=this.paddings.left);
				distance+=this.margins.left;
				node.style.left=distance+"px";
				break;

			//居右显示
			case "right":
				var distance=this.containerNode.offsetWidth-dojo.marginBox(node).w-this.margins.right-this.paddings.right;
				if(distance<=0) {
					node.style.left=this.paddings.left+"px";
					return;
				}

				node.style.left=distance+"px";
				break;

			//默认align为居左显示
			default:
				//left值为this.padding.left+this.margins.left
				var distance=this.paddings.left+this.margins.left;
				node.style.left=distance+"px";
				break;
		}
	},

	//处理pack属性
	_getPack:function(){
		switch(this.pack){
			case 'start':
				return this.paddings.top+this.margins.top;
			case 'end':
				var height=dojo.contentBox(this.containerNode).h,
					pureHeight=this.pureHeight;
				if(pureHeight>height) return this.paddings.top;
				pureHeight+=(this.margins.top+this.margins.bottom)*this.containerNode.childNodes.length;
				var distance=height-pureHeight-this.paddings.bottom;

				distance>this.paddings.top?(distance=distance):(distance=this.paddings.top);
				return distance;
			// 默认pack为center
			default:
				var height=dojo.contentBox(this.containerNode).h,
				pureHeight=this.pureHeight;
				if(pureHeight>height) return this.paddings.top;
				pureHeight+=(this.margins.top+this.margins.bottom)*this.containerNode.childNodes.length;
				var distance=(height-pureHeight)/2.0;
				distance>this.paddings.top?(distance=distance):(distance=this.paddings.top);
				return distance;
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
