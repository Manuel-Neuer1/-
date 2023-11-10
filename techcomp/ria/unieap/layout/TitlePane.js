dojo.provide("unieap.layout.TitlePane");
dojo.require("dijit._Templated");
dojo.require("dojo.fx");
dojo.require("unieap.layout.ContentPane");
dojo.declare("unieap.layout.TitlePane", [unieap.layout.ContentPane,dijit._Templated], {
    /**
     * @declaredClass:
     * 		unieap.layout.TitlePane
     * @summary:
     * 		TitlePane组件
     * @classDescription:
     *		可伸缩的一个容器,支持动画效果,可自定义右上角区域
     * @example:
     * |<div dojoType="unieap.layout.TitlePane"   title="hello">
     * |	<div style="height:300px">Hello TitlePane!</div>
     * |</div>
     *		标题为hello,内容为"Hello TitlePane!"的一个TitlePane
     * @example:
     * |<div dojoType="unieap.layout.TitlePane"   title="hello">
     * |	<div type="buttons">
     * |		<button>按钮1</button>
     * |		<button>按钮2</button>
     * |	</div>
     * |</div>
     * 		右上角会有两个button按钮
     * 		当配置type="buttons"时，这部分内容将会出现在TitlePane的右上角
     * 		只能设置一组type="buttons"，如果设置多组，只有第一组能够显示，其余作为titlepane内容显示
     * @superClass:
     * 		unieap.layout.ContentPane
     * @img:
     * 		images/layout/titlepane.png
     */
	
	//配置属性接口
	UserInterfaces : dojo.mixin({
		title : "string",
		href : "string",
		open : "boolean",
		duration : "number",
		animate : "boolean",
		flexible : "boolean",
		onCollapse : "function",
		onBeforeCollapse : "function",
		onBeforeExpand : "function",
		onExpand : "function",
		onShow : "function"		
	},
	unieap.layout.Container.prototype.UserInterfaces),	
	
    /**
     * @summary:
     * 		TitlePane的标题
     * @type：
     * 		{string}
     * @example：
     * |<div open="false" dojoType="unieap.layout.TitlePane"  title="hello TitlePane">
     * |</div>
     */
    title: "",
	
    /**
	 * @summary:
	 * 		设置TitlePane内容的链接地址
	 * @description：
	 * 		 当配置该属性时，TitlePane需要设置高度，并不应该在TitlePane内部添写其他元素
	 * @type：
	 * 		{string}
	 * @example:
	 * |<div dojoType="unieap.layout.TitlePane" ${1}href="form_textarea.do" id="titlepane2" ${2}height="100px" title="加载url">
	 * |	${3}
	 * |</div>		
	 * ${1}设置TitlePane内容显示区域的链接地址
	 * ${2}设置高度
	 * ${3}内部不嵌套其他元素
	 */
	href: "",
    
    /**
     * @summary:
     * 		TitlePane的open状态
     * @description：
     * 		true表示open状态，false表示关闭状态
     * @type：
     * 		{boolean}
     * @default:
     * 		true
     * @example：
     * |<div open="false" dojoType="unieap.layout.TitlePane"  title="hello">
     * |</div>
     * 		此时TitlePane初始状态为关闭着的
     */
    open: true,
    
    
    /**
     * @summary:
     * 		指定展开关闭下拉框的持续时间
     * @description：
     * 		当有动画效果时有效
     * @type：
     * 		{number}
     * @default：
     * 		300
     */
    duration: 300,
    
	/**
	 * @summary:
	 * 		是否使用动画收缩TitlePane
	 * @description：
     * 		当没有动画统一开关unieap.animate时，animate默认为true，否则animate为unieap.animate的值
	 * @type：
	 * 		{boolean}
	 * @default：
	 * 		true
	 */
	animate:(typeof(unieap.animate) == 'undefined')?true:unieap.animate,
	
    /**
     * @summary:
     * 		是否支持展开关闭
     * @type：
     * 		{boolean}
     * @default：
     * 		true
     * @example：
     * |<div dojoType="unieap.layout.TitlePane" flexible="false">
     * |</div>
     * 点击TitlePane控件，此时不可关闭
     */
    flexible: true,
    
	
    templateString: "<div class='u-titlepane-widget' >" +
					    "<div  class='u-titlepane-title' dojoAttachPoint='titleBarNode,focusNode'>" +
							"<span dojoAttachPoint='arrowNode' class='u-titlepane-arrownode'>-</span>" +
						    "<div class='u-titlepane-buttonfield' dojoAttachPoint='buttonContainerNode'></div>" +
							"<span dojoAttachPoint='titleNode' class='u-titlepane-titlenode'></span>" +
						"</div>" +
						"<div class='u-titlepane-content-outer' dojoAttachPoint='hideNode'>" +
						    "<div dojoAttachPoint='wipeNode' class='u-titlepane-content-wipe'>" +
						   		 "<div class='u-titlepane-content-inner' dojoAttachPoint='containerNode'></div>" +
						    "</div>" +
					    "</div>" +
    				"</div>",
      
    postCreate: function(){
		this.inherited(arguments);
		this.flexible?this.connect(this.titleBarNode, 'onclick', 'toggle'):(this.arrowNode.innerHTML='');
        this.createButtonContainer(this.buttonContainerNode);
        this.animate&&this._initWipe();
        if (!this.open) {
            this.hideNode.style.display  = "none";
            this.arrowNode.innerHTML = "+";
			this.domNode.style.height='24px';
        }
		this._setOpenCss();
		if(this.href){
			this.setHref(this.href);
		}
		
		this.title && this.setTitle(this.title);
    },
	
    resizeContainer: function(){
    	//隐藏的时候不显示
    	if(null==this.domNode|| 0 == this.domNode.offsetHeight) return;
    	//根据设定高度设置ContainerNode的高度
    	if(this.height!="auto"){
			dojo.style(this.domNode, "overflow", "hidden");
    		var height = dojo.contentBox(this.domNode).h || dojo.style(this.domNode,'height');
	        var nh = 0;
	        //处理title高度变化后，下边线无法显示的问题
	        var titleHeight = dojo.style(this.titleBarNode,"height")+1;
	        if (height > titleHeight) {
	            nh = (height - titleHeight);
	        }
			if(dojo.boxModel=="content-box"){
				var _h=dojo.marginBox(this.hideNode).h-dojo.contentBox(this.hideNode).h;
				if (nh > _h) {
					nh=nh-_h;
				}
			}
			if(nh<=0) return;
			dojo.style(this.containerNode, "height", nh + "px");
    	}    
        this.resizeChildrenContainer();
    },
    
	_setOpenCss:function(){
		if(this.open){
			dojo.removeClass(this.domNode,"u-titlepane-widget-close");
			dojo.addClass(this.domNode,"u-titlepane-widget-open");
		}else{
			dojo.removeClass(this.domNode,"u-titlepane-widget-open");
			dojo.addClass(this.domNode,"u-titlepane-widget-close");
		}
	},
    
    //初始化展开关闭动作
    _initWipe: function(){
        this._wipeIn = dojo.fx.wipeIn({
            node: this.wipeNode,
            duration: this.duration,
            beforeBegin: dojo.hitch(this, function(){
                this.hideNode.style.display = "";
				if(dojo.isIE==6){
					this.hideNode.style.visibility  = "hidden";
				}
            }),
            onEnd: dojo.hitch(this, function(){
				if (dojo.isIE) {
           			//解决在ie下组件隐藏后再显示消失的bug
           			this.hideNode.style.display = "none";
           			this.hideNode.style.display = "";
					if(dojo.isIE==6){
						//ie 解除了fx.jd实现的onend 须手动设置高度为"auto"
						this.wipeNode.style.height="auto";
						this.hideNode.style.visibility  = "visible";
					}
        		}
                this._onExpand();
            })
        });
		if(dojo.isIE==6){
			//ie 6下 fx.js绑定的onend事件导致展开后form组件错乱 see---U_EAP00006760
			dojo.disconnect([this._wipeIn,'onEnd',1,0]);
		}
		
        this._wipeOut = dojo.fx.wipeOut({
            node: this.wipeNode,
            duration: this.duration,
            onEnd: dojo.hitch(this, function(){
                this.hideNode.style.display = "none";
                this._onCollapse();
            })
        });
    },
    
	//	创建按钮区域，默认将渲染type='buttons'的节点
    createButtonContainer: function(buttonContainer){
        //添加扩展按钮
    	var node = this.containerNode.firstChild;
    	//遍历containerNode下面节点，查找含有type为buttons的节点，找到赋值给n
    	while(node){
    		if(node.getAttribute && "buttons" == node.getAttribute("type")){
    			dojo.place(node,buttonContainer,0);
	    		return;
    		}
    		node = node.nextSibling;
    	}
    },
	

	//销毁titlePane
	destroy:function(){
		if(this.buttonContainerNode){
			dojo.query('[widgetId]', this.buttonContainerNode).forEach(function(n){
				var w=dijit.byNode(n);
				w&&w.destroy&&w.destroy();
			});
		};
		this.inherited(arguments);
	},
	
    /**
     * @summary
     * 		打开或关闭TitlePane,改变open/close状态
     * @param
     * 		{evt} evt 鼠标点击Titlebar事件，程序调用此方法可以不传参数
     * @example:
     * |<div dojoType="unieap.layout.TitlePane" id="titlepane">
	 * |</div>
	 * |<script type="text/javascript">
     * |	unieap.byId("titlepane").toggle();
	 * |</script>
     */
    toggle: function(evt){
        //点击titleBarNode  titleNode arrowNode时触发 点击其它的不触发
        if (evt && dojo.indexOf([this.titleBarNode, this.titleNode, this.arrowNode], evt.target) == -1) {
            return;
        }
        //终止正在进行的活动
        dojo.forEach([this._wipeIn, this._wipeOut], function(animation){
            if (animation && animation.status() == "playing") {
                animation.stop();
            }
        });
		if(this.open){
			if(false===this._onBeforeCollapse()){
				return;
			}
		}else{
			if(false===this._onBeforeExpand()){
				return;
			}
		}
		
        var anim = this[this.open ? "_wipeOut" : "_wipeIn"]
        if (anim) {
            anim.play();
        }else {
            this.hideNode.style.display = this.open ? "none" : "";
			this.open?this._onCollapse():this._onExpand();
        }
        this.open = !this.open;
        //改变arrowNode的innerHTML
        this.arrowNode.innerHTML = this.open ? "-" : "+";
		this._setOpenCss();
    },
    
	/**
	 * @summary:
	 * 		合拢TitlePane的回调事件
	 * @example:
	 * |<div dojoType="unieap.layout.TitlePane" onCollapse="onCollapse">
	 * |</div>
	 * |<script>
	 * |	function onCollapse(){
	 * |		alert('onCollapse');
	 * |	}
	 * |</script>
	 * 		当TitlePane合拢时的回调方法。
	 */
	onCollapse:function(){
		
	},
	
	/**
	 * @summary:
	 * 		关闭TitlePane前的回调事件
	 * @description：
	 * 		返回false时将阻止TitlePane关闭
	 * @example:
	 * |<div dojoType="unieap.layout.TitlePane" onBeforeCollapse="onBeforeCollapse">
	 * |</div>
	 * |<script>
	 * |	function onBeforeCollapse(){
	 * |		return false;
	 * |	}
	 * |</script>
	 * 		此时TitlePane将不可关闭
	 * @return：
	 * 		{boolean}
	 */
	onBeforeCollapse:function(){
		return true;
	},
	
	/**
	 * @summary:
	 * 		打开TitlePane前的回调事件
	 * @description：
	 * 		返回false将阻止TitlePane打开
	 * @example:
	 * |<div dojoType="unieap.layout.TitlePane" onBeforeExpand="onBeforeExpand">
	 * |</div>
	 * |<script>
	 * |	function onBeforeExpand(){
	 * |		return false;
	 * |	}
	 * |</script>
	 * 		此时TitlePane将不可展开
	 * @return：
	 * 		{boolean}
	 */
	onBeforeExpand:function(){
		return true;
	},
	
	/**
	 * @summary:
	 * 		打开TitlePane的回调事件
	 * @example:
	 * |<div dojoType="unieap.layout.TitlePane" onExpand="onExpand">
	 * |</div>
	 * |<script>
	 * |	function onExpand(){
	 * |		alert('onExpand');
	 * |	}
	 * |</script>
	 * 		当TitlePane展开时的回调方法。
	 */
    onExpand:function(){
		
	},
    
    /**
     * @summary:
     * 		显示TitlePane的回调事件
     * @param: 
	 * 		{unieap.layout.TitlePane} pane 当前要展开的TitlePane
     * @example:
     * |<div dojoType="unieap.layout.TitlePane" onShow="onShow">
	 * |</div>
	 * |<script>
	 * |	function onShow(){
	 * |		alert('onShowing');
	 * |	}
	 * |</script>
     */
    onShow: function(pane){
		
    },
    
    /**
     * @summary:
     * 		设置标题
     * @param：
     * 		 {string} title
	 * @example:
	 * |<div id="titlePane" dojoType="unieap.layout.TitlePane">
	 * |</div>
	 * |<script>
	 * |	titlePane.setTitle("你好");
	 * |</script>
	 * 		设置TitlePane的标题为 '你好'	
     */
    setTitle: function(title){
		this.title=title;
		//解决bug U_EAP00021354
		dojo.attr(this.domNode,'title','');
		if(dojo.isFF) {
			 this.titleNode.textContent = title;
		}else{
			this.titleNode.innerText = title;
		}
    },
    
    /**
     * @summary:
     * 		取得TitlePane标题
     * @return：
     * 		{string} title
     * @example:
     * |var title = unieap.byId("titlePane").getTitle();
     */
    getTitle: function(){
        return this.title;
    },
	
	_onCollapse:function(){
		this.domNode.style.height="24px";
		this.notifyResize();
		unieap.fireEvent(this,this.onCollapse,[]);
	},
	
	_onExpand:function(){
		dojo.style(this.domNode,"height",this.height);
		this.notifyResize();
		unieap.fireEvent(this,this.onExpand,[]);
	},
	
	_onBeforeCollapse : function(){
		return unieap.fireEvent(this,this.onBeforeCollapse,[]);		
	},
	
	_onBeforeExpand : function(){
		return unieap.fireEvent(this,this.onBeforeExpand,[]);
	}
});