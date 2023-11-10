dojo.provide("unieap.Tooltip");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.declare("unieap._MasterTooltip",[dijit._Widget, dijit._Templated],{
      //内部类，是tooltip的真正实现类
  
        //渐入渐出的时间
		duration: 100,
		
		/**
		 * @summary:
		 * 		是否启用动画效果
		 * @type:
		 * 		{boolean}
		 * @default:
		 * 		读取unieap.animate的值
		*/
		animate : !!unieap.animate,
		
		//在自动关闭的情况下，保持对onmousedown事件的引用
		handle:null,
		
		//当取后台数据时，tooltip显示的值
		//内容正在加载，请稍候…
		loadingText:RIA_I18N.tooltip.loading,
		
		parenetNode:null,
		
		isDomNode:false,
		
		//tooltip的内部显示值，可以为字符串也可以为一个domNode
		inner:null,
		
		isAroundnode:true,
		
		isLoadData : false,
		
		eventPosition: null,

		templateString: "<div class=\"dijitTooltip dijitTooltipLeft\" id=\"dojoTooltip\">"+
	                         "<div class=\"dijitTooltipContainer dijitTooltipContents\" dojoAttachPoint=\"containerNode\"></div>"+
	                         "<div class=\"dijitTooltipConnector\" dojoAttachPoint=\"ConnectorNode\"></div>"+
                        "</div>",
									   
		postCreate: function(){
			dojo.body().appendChild(this.domNode);
			this.bgIframe = new dijit.BackgroundIframe(this.domNode);
			if(this.animate){
				this.fadeIn = dojo.fadeIn({ node: this.domNode, duration: this.duration, onEnd: dojo.hitch(this, "_onShow") });
				this.fadeOut = dojo.fadeOut({ node: this.domNode, duration: this.duration, onEnd: dojo.hitch(this, "_onHide") });
			}
		},
		
		//得到加载后台数据时的tooltip显示内容
        getLoadingContent:function(){
           return "<div class=\"dijitTooltipContainerLoadingContainer\"><div class=\"dijitTooltipContainerLoadingImage\"></div><div class=\"dijitTooltipContainerLoadingText\">"+this.loadingText+"</div></div>";
        },
        
		//tooltip显示
		show: function(/*String|object*/ config, /*DomNode*/ aroundNode, /*String[]?*/ position){
		   if(this.isLoadData){
              return;
            }
			if(this.aroundNode && this.aroundNode === aroundNode){
				return;
			}
			if(this.isShowingNow){
			   this.hide();
			}
			if(this.animate && this.fadeOut.status() == "playing"){
				if(!aroundNode.tagName){
				  var position = {x:aroundNode.clientX,y:aroundNode.clientY,width:1,height:1,preEventForTooltip:true};
				  arguments[1] = position;
				 }
				this._onDeck=arguments;
				return;
			}
			//支持通过domNode和事件两种方式确定tooltip显示位置
			if(aroundNode){
				if(aroundNode.tagName){
					this.aroundNode = aroundNode;
					this.isAroundnode = true;
				}else if(aroundNode.preEventForTooltip){
				   delete aroundNode.preEventForTooltip
				   this.isAroundnode = false;
				   this.aroundNode = null;
				   this.eventPosition = aroundNode;
				}else{
				  var e = dojo.fixEvent(aroundNode);
				  this.isAroundnode = false;
				  this.aroundNode = null;
				  this.eventPosition = {x:aroundNode.clientX,y:aroundNode.clientY,width:1,height:1};
				}
			}
			else{
			  return;
			}
			var inner=null;
			var url = null;
			if(typeof config  =="string"){
			   inner = config;
			   this.setAutoClose(false);
			}else{
			   var autoClose = config["autoClose"];
			   this.setAutoClose(autoClose);
			   inner = config["inner"];
			   url = config["url"];
			}
			if(inner){
			  if (typeof(inner) == "object") {
			  	 this.isDomNode = true;
                 this.inner = inner;
                 this.parenetNode = inner.parentNode;
                 this.containerNode.innerHTML="";
			  	 this.containerNode.appendChild(inner);
			  } else {
			    this.containerNode.innerHTML=inner;
		      }
                this._show(position);
			}else if(url){
            	var me = this;
            	this.containerNode.innerHTML = this.getLoadingContent();
            	this.isLoadData = true;
                this._show(position);
            	dojo.rawXhrPost({
                  url: url,
                  sync: false,
                  timeout: 120*1000,
                  headers : {ajaxRequest:true},
                  load: function(text, args){	
                  	me.isLoadData = false;
                  	me.domNode.style.cssText=""
                	me.containerNode.innerHTML = text;
			        me._show(position)
                  },
				  error: function(text, args) {
				  	me.isLoadData = false;
				  	alert(text);
				  }
                });
            }
		},

		orient: function(/* DomNode */ node, /* String */ aroundCorner, /* String */ tooltipCorner){
			node.className = "dijitTooltip " +
				{
					"BL-TL": "dijitTooltipBelow dijitTooltipABLeft",
					"TL-BL": "dijitTooltipAbove dijitTooltipABLeft",
					"BR-TR": "dijitTooltipBelow dijitTooltipABRight",
					"TR-BR": "dijitTooltipAbove dijitTooltipABRight",
					"BR-BL": "dijitTooltipRight",
					"BL-BR": "dijitTooltipLeft"
				}[aroundCorner + "-" + tooltipCorner];
		},

         _show : function(position){
			this.domNode.style.top = (this.domNode.offsetTop + 1) + "px";
			var align = {};
			var ltr = this.isLeftToRight();
			dojo.forEach( (position && position.length) ? position : unieap.Tooltip.defaultPosition, function(pos){
				switch(pos){
					case "after":				
						align[ltr ? "BR" : "BL"] = ltr ? "BL" : "BR";
						break;
					case "before":
						align[ltr ? "BL" : "BR"] = ltr ? "BR" : "BL";
						break;
					case "below":
						// first try to align left borders, next try to align right borders (or reverse for RTL mode)
						align[ltr ? "BL" : "BR"] = ltr ? "TL" : "TR";
						align[ltr ? "BR" : "BL"] = ltr ? "TR" : "TL";
						break;
					case "above":
					default:
						// first try to align left borders, next try to align right borders (or reverse for RTL mode)
						align[ltr ? "TL" : "TR"] = ltr ? "BL" : "BR";
						align[ltr ? "TR" : "TL"] = ltr ? "BR" : "BL";
						break;
				}
			});
			if (this.isAroundnode) {
				//通过节点确定tooltip的位置
				//var pos = dijit.placeOnScreenAroundElement(this.domNode, this.aroundNode, align, dojo.hitch(this, "orient"));
				var width = dojo.coords(this.containerNode).w;
//				if(width>100)
//				    this.containerNode.style.width = width+"px";
				var aroundNodeW = this.aroundNode.offsetWidth; 
	            var aroundNodeH = this.aroundNode.offsetHeight; 
	            var aroundNodePos = dojo.coords(this.aroundNode, true);
                var pos =  dijit._placeOnScreenAroundRect(this.domNode, 
		                    aroundNodePos.x, aroundNodePos.y, aroundNodeW, aroundNodeH,	// rectangle
		                    align, dojo.hitch(this, "orient"));
				
				//当提示信息在aroundNode右下方时，需要动态调整下,这样更美观点
				if(pos.corner=='TR'&&pos.aroundCorner=='BR'){
		       	  var left=dojo.style(this.domNode,'left'),
		       	  	  top=dojo.style(this.domNode,'top');
				  dojo.style(this.domNode,{
				  	'left':(left-3)+"px",
				  	'top':(top-5)+"px"
				  });
		       }
			}else{
				//通过事件确定tooltip的位置
				var pos = dijit.placeOnScreenAroundElement(this.domNode,  this.eventPosition, align, dojo.hitch(this, "orient"));
			}
			var bodyWidth = dojo.style(dojo.body(),"width"),
				posLeft = dojo.style(this.domNode,"left"),
				toolTipRealWidth = dojo.style(this.domNode,"width");
				toolTipWidth = bodyWidth - posLeft - 50;
			if(toolTipRealWidth > toolTipWidth){
				dojo.style(this.domNode,'width',toolTipWidth+"px");
			}
			dojo.style(this.domNode, "opacity", 0);
//			if((pos.corner=='BL'&&pos.aroundCorner=='BR')||(pos.corner=='BR'&&pos.aroundCorner=='BL')){
////				var connectorTop = (aroundNodePos.y - pos.y) + "px";
////				dojo.style(this.ConnectorNode, "top", connectorTop);
//			}
			if(this.animate){
				this.fadeIn.play();
			}else{
				dojo.style(this.domNode, "opacity", 1);
				dojo.style(this.domNode,"display","block");
				this._onShow();
			}
			this.isShowingNow = true;
		 },

		_onShow: function(){
			if(dojo.isIE){
				this.domNode.style.filter="";
			}
		},

		hide: function(aroundNode){
			if (this.isShowingNow == false){
				return;
			} 
			if(this._onDeck && this._onDeck[1] == aroundNode){
				this._onDeck=null;
			}
			this.isShowingNow = false;
			this.aroundNode = null;
			if(this.animate){
				this.fadeIn.stop();
				this.fadeOut.play();
			}else{
				dojo.style(this.domNode,"display","none");
				this._onHide();
			}
		},

		_onHide: function(){
			this.domNode.style.cssText="";	// to position offscreen again
			if(this.isDomNode&&this.parenetNode){
				this.parenetNode.appendChild(this.inner);
			}
			this.containerNode.style.cssText="";
			this.containerNode.innerHTML = "";
			if(this._onDeck){
				this.show.apply(this, this._onDeck);
				this._onDeck=null;
			}
		},
		
		//是否自动关闭，默认为false，若设为true，则在点击页面其他地方的时候，提示框会消失
		setAutoClose : function(autoClose){
		  if(autoClose&&!this.handle){
		  	this.handle = dojo.connect(dojo.body(),"onmousedown",this,this._hide);
		  }
		  else if(!autoClose&&this.handle){
		     dojo.disconnect(this.handle);
		     this.handle=null;
		  }
		},
		_hide : function(ev){
		  	var el = ev.target;
	        for (; el != null && el != this.domNode; el = el.parentNode);
	        if (el == null&&!this.isLoadData&&this.isShowingNow) {
		        this.hide(this.aroundNode);
	        }
		},
		destroy: function(){
			if(this.bgIframe){
				this.bgIframe.destroy();
			}
			this.inherited(arguments);
		}

	}
);
dojo.declare("unieap.Tooltip",dijit._Widget,{
     	/**
	 * @declaredClass:
	 * 		unieap.Tooltip
	 * @summary:
	 * 		ToolTip的实现类
	 * @classDescription：
	 *		除了直接调用unieap.showTooltip生成Tooltip外，也可以通过标签定义Tooltip示例
	 *     支持给定一系列domNode对象的id组成的数组，在鼠标移上时，弹出tooltip，并在鼠标移出时Tooltip消失
	 *     显示内容在Tooltip定义的时候，需要指定，不支持加载后台内容
	 *     支持上、下、前、后四种显示位置，并自动选择较为美观的样式
	 */

      /**
	 * @type
	 * 		{string}
	 * @summary:
	 * 		指定Tooltip显示的内容
	 */
		label: "",

       /**
	 * @type
	 * 		{number}
	 * @summary:
	 * 		指定从鼠标移上到目标节点到tooltip显示出来所经历的间隔
	 */
		showDelay: 400,

       /**
	 * @type
	 * 		{array}
	 * @summary:
	 * 		该Tooltip所关联domNode的id所组成的数组
	 */
		connectId: [],

       /**
	 * @type
	 * 		{array}
	 * @summary:
	 * 		该Tooltip可以显示的位置组成的数组，可选值为above、below、after、before，程序会自动寻找合适的显示位置
	 *     若不进行设置，会按照unieap.Tooltip.defaultPosition的值进行显示
	 * @example :
	 *    ["above","below"]
	 */
		position: [],

		_setConnectIdAttr: function(ids){
			this._connectNodes = [];
			this.connectId = dojo.isArrayLike(ids) ? ids : [ids];
			dojo.forEach(this.connectId, function(id) {
				var node = dojo.byId(id);
				if (node) {
					this._connectNodes.push(node);
					dojo.forEach(["onMouseEnter", "onMouseLeave", "onFocus", "onBlur"], function(event){
						this.connect(node, event.toLowerCase(), "_"+event);
					}, this);
					if(dojo.isIE){
						node.style.zoom = 1;
					}
				}
			}, this);
		},

		postCreate: function(){	
			dojo.addClass(this.domNode,"dijitTooltipData");
		},

		_onMouseEnter: function(/*Event*/ e){
			this._onHover(e);
		},

		_onMouseLeave: function(/*Event*/ e){
			this._onUnHover(e);
		},

		_onFocus: function(/*Event*/ e){
			this._focus = true;
			this._onHover(e);
			this.inherited(arguments);
		},
		
		_onBlur: function(/*Event*/ e){
			this._focus = false;
			this._onUnHover(e);
			this.inherited(arguments);
		},

		_onHover: function(/*Event*/ e){
			if(!this._showTimer){
				var target = e.target;
				this._showTimer = setTimeout(dojo.hitch(this, function(){this.open(target)}), this.showDelay);
			}
		},

		_onUnHover: function(/*Event*/ e){
			if(this._focus){ return; }
			if(this._showTimer){
				clearTimeout(this._showTimer);
				delete this._showTimer;
			}
			this.close();
		},

		open: function(target){
			target = target || this._connectNodes[0];
			if(!target){ return; }
			if(this._showTimer){
				clearTimeout(this._showTimer);
				delete this._showTimer;
			}
			unieap.showTooltip(this.label || this.domNode.innerHTML, target, this.position);
			this._connectNode = target;
		},

		close: function(){
			if(this._connectNode){
				unieap.hideTooltip(this._connectNode);
				delete this._connectNode;
			}
			if(this._showTimer){
				clearTimeout(this._showTimer);
				delete this._showTimer;
			}
		},

		uninitialize: function(){
			this.close();
		}
	}
);

    /**
	 * @type
	 * 		{array}
	 * @summary:
	 * 		Tooltip的默认显示位置，在不指定position的情况下会在该数组指定的位置中寻找较优的显示位置
	 * @default :
	 *    ["above","below"]
	 */
unieap.Tooltip.defaultPosition = ["after", "before"];