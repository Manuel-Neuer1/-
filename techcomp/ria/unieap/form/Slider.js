dojo.provide("unieap.form.Slider");
dojo.require("unieap.form.FormWidget");
dojo.declare("unieap.form.Slider",unieap.form.FormWidget,{
	/**
	 * @declaredClass:
	 * 		unieap.form.Slider
	 * @superClass：
	 * 		unieap.form.FormWidget
	 * @summary:
	 * 	可在一个有限范围内调节的滑动条
	 * @description:
	 * 	支持横向和纵向两种滑动条，支持长度设定，支持范围、步长、当前值设定，支持自定义滑块图标
	 * @example:
	 * | ${1}<div dojoType="unieap.form.Slider"></div>
	 * 	${1}横向滑动条
	 * | ${2}<div dojoType="unieap.form.Slider" axis="y"></div>
	 *	${2}纵向滑动条
	 * @example:
	 * | ${3}<div dojoType="unieap.form.Slider" length="200px"></div>
	 *  ${3}length属性设定滑动条长度
	 * @example:
	 * | ${4}<div dojoType="unieap.form.Slider" min="100", max="200", step="10", value="150"></div>
	 * ${4}最小值、最大值、步长、当前值设定，当前值的取值不一定与设定的值相等，其取值受到最小值、最大值及步长的影响。
	 * @example:
	 * | ${5}<div dojoType="unieap.form.Slider" iconClass="iconThumb"></div>
	 * ${5}iconClass指定自定义图标
	 * @example:
	 * | ${6}var slider=new unieap.form.Slider();
	 * |     dojo.body().appendChild(slider.domNode);
	 * |     slider.startup();
	 * ${6}使用编程式新建一个Slider时,要先把Slider加入到流中,然后再调用startup函数才能正确显示
	 */
	
	UserInterfaces : dojo.mixin({
		axis : "string",
		min : "number",
		max : "number",
		step : "number",
		value: "number",
		length : "string",
		iconClass: "string",
		onBeforeSlide : "function",
		onSlideStart : "function",
		onChange : "function",
		onSlideEnd : "function",
		setRange : "function",
		setStep : "function",
		getStep : "function",
		setLength : "function",
		getLength : "function"
	},unieap.form.FormWidget.prototype.UserInterfaces),
	
	templateString :
		"<span class='u-form-widget u-form-slider'>" +
			"<span dojoAttachPoint='sliderNode'>" +
				"<span dojoAttachPoint='leftCapNode' class='u-form-slider-leftcap'></span>" +
				"<span dojoAttachPoint='rightCapNode' class='u-form-slider-rightcap'></span>" +
				"<span dojoAttachPoint='railNode' class='u-form-slider-rail' >" +
					"<div dojoAttachPoint='progressNode' class='u-form-slider-progress'>" +
						"<div dojoAttachPoint='thumbNode'></div>" +
					"</div>" +
				"</span>" +
			"</span>" +
		"</span>",
	
	/**
	 * @type:
	 * 		{string}
	 * @summary:
	 * 		设置Slider的坐标轴方向，"x"为横向，"y"为纵向
	 * @default:
	 * 		"x"
	 * @enum:
	 * 		{"x"|"y"}
	 * @example:
	 * |<div dojoType="unieap.form.Slider" axis="y"></div>
	 */	
	axis: "x",
	
	/**
	 * @type:
	 * 		{number}
	 * @summary:
	 * 		设置最小值，即最左端或最下端的值
	 * @default:
	 * 		0
	 * @example:
	 * |<div dojoType="unieap.form.Slider" min=10></div>
	 */	
	min: 0,
	
	
	/**
	 * @type:
	 * 		{number}
	 * @summary:
	 * 		设置最大值，即最右端或最上端的值
	 * @default:
	 * 		100
	 * @example:
	 * |<div dojoType="unieap.form.Slider" max=200></div>
	 */	
	max: 100,
	
	/**
	 * @type:
	 * 		{number}
	 * @summary:
	 * 		设置当前值
	 * @description:
	 * 		设置当前值后，滑块会显示在相应的位置，当前值应该最小值与最大值之间，超出范围会自动调整到最接近的值，最后的值还会与步长step有关
	 * @default:
	 * 		0
	 * @example:
	 * |<div dojoType="unieap.form.Slider" value=10></div>
	 */	
	value: 0,
	
	/**
	 * @type:
	 * 		{number}
	 * @summary:
	 * 		设置步长
	 * @description:
	 * 		步长为滑块移动一格时的值，步长会影响value的取值
	 * 		步长应该为正数，当步长为非正数时，会被设为默认值1
	 * @default:
	 * 		1
	 * @example:
	 * |<div dojoType="unieap.form.Slider" min=10 max=30 step=10></div>
	 * 		上述代码中，value取值只能是10, 20, 30
	 */	
	step: 1,
	
	/**
	 * @type:
	 * 		{string}
	 * @summary:
	 * 		设置Slider的显示长度
	 * @default:
	 * 		"150px"
	 * @example:
	 * |<div dojoType="unieap.form.Slider" length="200px"></div>
	 */	
	length: "150px",
	
	/**
	 * @summary:
	 * 		通过改变css样式来设置Slider上的滑块图标
	 * @type:
	 * 		{string}
	 * @example:
	 * |<style type="text/css">
	 * |		.iconThumb{
	 * |			width:14px;
	 * |			height:15px;
	 * |			right: -7px;
	 * |			background:url("../images/thumb.png");
	 * |		}
	 * |</style>
	 * |<div dojoType="unieap.form.Slider" iconClass="iconThumb"></div>
	 */
	iconClass: 'u-form-slider-thumb',
	
	//步长的像素值
	_pixelStep: 1.5,
	
	//总段数
	_stepCount: 100,
	
	//鼠标移动事件句柄
	_handleMouseMove: null,
	
	//鼠标释放事件句柄
	_handleMouseUp: null,
	
	//以下是为了区分横纵向滑动条坐标计算设置的变量
	_PageXOrPageY: "pageX",
	_XOrY: "x",
	_WidthOrHeight: "width",
		
	postMixInProperties:function() {
		this.min = Number(this.min);
		this.max = Number(this.max);
		this.step = Number(this.step);
		this.step = (this.step <= 0) ? 1 : this.step;
		if(this.min > this.max) {
			var temp = this.min;
			this.min = this.max;
			this.max = temp;
		}
	},
			
	
	postCreate:function() {
		dojo.setSelectable(this.domNode, false);	
		dojo.style(this.thumbNode, "position", "absolute");
		dojo.addClass(this.thumbNode,this.iconClass);
		this.disabled && dojo.addClass(this.sliderNode, "u-form-slider-disabled");
		this.connect(this.thumbNode, "onmousedown", this._onThumbMouseDown);
		this.connect(this.domNode, "onmousedown", this._onRailMouseDown);
		this.inherited(arguments);
	},
	
	startup: function() {
		this._stepCount = Math.floor((this.max - this.min) / this.step);
		this._setAxis(this.axis);
		this.setLength(this.length);
		this.setValue(this.value);
	},
	//滑块上鼠标按下时事件处理
	_onThumbMouseDown: function(e) {
		if((!this.disabled) && unieap.fireEvent(this,this.onBeforeSlide,[this.value])) {
			this._onSlideStart();
		}		
		dojo.stopEvent(e);
	},
	
	//轨道上鼠标按下时事件处理
	_onRailMouseDown: function(e) {
		if((!this.disabled) && unieap.fireEvent(this,this.onBeforeSlide,[this.value])) {
			//绑定鼠标事件，并调用滑动前的回调函数
			this._onSlideStart();
			//计算鼠标位置并移动滑块
			var absPos = dojo.position(this.railNode, true);
			var offset = e[this._PageXOrPageY] - absPos[this._XOrY];
			("y" == this.axis) && (offset = absPos["h"] - offset);
			this._setPixelValue(offset);			
		}		
		dojo.stopEvent(e);
	},
	
	_onSlideStart: function() {
		// 首先释放鼠标事件，防止某些情况下出现鼠标不能释放的问题
		if(this.thumbNode.releaseCapture) {
			this.thumbNode.releaseCapture();			
		}
		dojo.disconnect(this._handleMouseMove);
		dojo.disconnect(this._handleMouseUp);
		
		if(this.thumbNode.setCapture) {
			this.thumbNode.setCapture();
			this._handleMouseMove = dojo.connect(this.railNode, "onmousemove", this,this._onMouseMove);
			this._handleMouseUp = dojo.connect(this.railNode, "onmouseup", this,this._onMouseUp);
		} else {
			this._handleMouseMove = dojo.connect(document, "onmousemove",this, this._onMouseMove);
			this._handleMouseUp = dojo.connect(document, "onmouseup",this, this._onMouseUp);
		}
		unieap.fireEvent(this,this.onSlideStart,[this.value]);
	},	
	
	//鼠标抬起事件处理
	_onMouseUp: function() {		
		if(this.thumbNode.releaseCapture) {
			this.thumbNode.releaseCapture();			
		}
		dojo.disconnect(this._handleMouseMove);
		dojo.disconnect(this._handleMouseUp);
		unieap.fireEvent(this,this.onSlideEnd,[this.value]);
	},
	
	_onMouseMove: function(e) {
		var absPos = dojo.position(this.railNode, true);
		var offset = e[this._PageXOrPageY] - absPos[this._XOrY];
		("y" == this.axis) && (offset = absPos["h"] - offset);
		this._setPixelValue(offset);
	},
	
	//根据像素值高处相应的值长滑块位置
	_setPixelValue: function(pixelValue) {
		//计算处开第段
		var count = Math.round(pixelValue / this._pixelStep);
		//越界处理
		(count < 0) && (count = 0);
		(count > this._stepCount) && (count = this._stepCount);;
		
		//计算实际值
		var value = count * this.step + this.min;
		
		//若值发生改变，修改滑块位置
		if(this.value != value) {
			pixelValue = count * this._pixelStep;
			dojo.style(this.progressNode, this._WidthOrHeight, pixelValue+'px');
			this.value = value;			
			this.fireDataChange();
			//调用值改变时的回调函数
			unieap.fireEvent(this,this.onChange,[this.value]);
		}		
	},
		
	/**
	 * @summary:
	 * 		设置取值范围
	 * @description:
	 * 		设置最小值和最大值，可根据值的大小自动判断最小值和最大值
	 * @param:
	 * 		{number} min
	 * 		{number} max
	 */
	setRange: function(min, max) {
		if(isNaN(min) || isNaN(max)) {
			return;
		}
		min = Number(min);
		max = Number(max);
		if(min > max) {
			this.min = max;
			this.max = min;
		} else {
			this.min = min;
			this.max = max;
		}
		
		this._setStep();
		//更新段数
		//this._stepCount = Math.floor((this.max - this.min) / this.step);
		//更新当前值
		this.setValue(this.value);
	},
	
	/**
	 * @summary:
	 * 		设置是否禁用控件
	 * @param:
	 * 		{boolean} disabled
	 * @example:
	 * |var slider=unieap.byId('slider');
	 * |slider.setDisabled(true);
	 */	
	setDisabled: function(disabled) {
		if(this.disabled=disabled){
			this.disabled=true;
			dojo.addClass(this.sliderNode,"u-form-slider-disabled");
		}else{
			dojo.removeClass(this.sliderNode,"u-form-slider-disabled");
		}
	},
	
	/**
	 * @summary:
	 * 		设置滑块图标样式
	 * @description：
	 * 		建议图片大小:14*15,CSS设置width为14px,height为15px,right为-7px; 
	 * @param:
	 * 		{string} className 图标的css名
	 * @example:
	 * |<style type="text/css">
	 * |		.iconThumb{
	 * |			width:14px;
	 * |			height:15px;
	 * |			right:-7px;
	 * |			background:url("../images/thumb.png");
	 * |		}
	 * |</style>
	 * |var slider=unieap.byId('slider');
	 * |slider.setIconClass('iconThumb');
	 */
	setIconClass: function(className) {
		this.iconClass && dojo.removeClass(this.thumbNode, this.iconClass);
		dojo.addClass(this.thumbNode, className);
		this.iconClass = className;
	},
	
	/**
	 * @summary:
	 * 		获取最小值
	 * @return:
	 * 		{number}
	 */
	getMin: function() {
		return this.min;
	},
	
	
	/**
	 * @summary:
	 * 		获取最大值	 
	 * @return:
	 * 		{number}
	 */
	getMax: function() {
		return this.max;
	},
	
	/**
	 * @summary:
	 * 		设置控件当前值
	 * @param:
	 * 		{number} value
	 */
	setValue: function(value) {
		if(isNaN(value)) {
			return;
		}
		value = Number(value);
		var count = Math.round((value - this.min) / this.step);
		(count < 0) && (count = 0);
		(count > this._stepCount) && (count = this._stepCount);
		value = count * this.step + this.min;
		this.value = value;
		this.fireDataChange();
		var pixelValue = count * this._pixelStep;
		dojo.style(this.progressNode, this._WidthOrHeight, pixelValue+'px');
	},
	
	/**
	 * @summary:
	 * 		获取控件当前值
	 * @return:
	 * 		{number}
	 */
	getValue: function() {
		return this.value;
	},
	
	/**
	 * @summary:
	 * 		设置步长
	 * @param:
	 * 		{number} step
	 */
	setStep: function(step) {
		if(isNaN(step)) {
			return;
		}
		step = Number(step);
		(step <= 0) && (step = 1);
		this.step = step;
		this._setStep();
		//调整当前值
		this.setValue(this.value);
	},
	
	_setStep: function() {
		//计算段数
		this._stepCount = Math.floor((this.max - this.min) / this.step);
		//计算步长像素值
		var railLength = dojo.style(this.railNode, this._WidthOrHeight);
		this._pixelStep = this.step / (this.max - this.min) * railLength;
	},
	/**
	 * @summary:
	 * 		获取步长
	 * @return:
	 * 		{number}
	 */
	getStep: function() {
		return this.step;
	},
	
	/**
	 * @summary:
	 * 		设置控件长度
	 * @param:
	 * 		{string} length
	 */
	setLength: function(length) {
		var leftCapLength, rightCapLength, railLength;
		leftCapLength = dojo.style(this.leftCapNode, this._WidthOrHeight);
		rightCapLength = dojo.style(this.rightCapNode, this._WidthOrHeight);
		length = parseInt(length, 10);
		//如果长度过小，进行调整，调整到可能的最小值
		if(length < (leftCapLength + leftCapLength +1)) {
			length = (leftCapLength + leftCapLength +1);			
		}
		this.length = length + 'px';
		//计算滑动轨道长度
		railLength = length - leftCapLength - rightCapLength;
		//调整样式表中的相应长度或高度
		dojo.style(this.domNode, this._WidthOrHeight, length+"px");
		dojo.style(this.railNode, this._WidthOrHeight, railLength + "px");
		//调整步长像素值
		this._pixelStep = this.step / (this.max - this.min) * railLength;
		//更新当前值
		this.setValue(this.value);
	},
	
	/**
	 * @summary:
	 * 		获取控件长度
	 * @return:
	 * 		{string}
	 */
	getLength: function() {
		return this.length;
	},
	
//	/**
//	 * @summary:
//	 * 		设置控件坐标方向
//	 * @param:
//	 * 		{string} axis
//	 */
//	setAxis: function(axis) {
//		this._setAxis(axis);
//		this.setValue(this.value);
//	},
	
	_setAxis: function(axis)	 {

		if("y" == axis.toLowerCase()) {
			this.axis = "y";
			this._PageXOrPageY = "pageY";
			this._XOrY = "y";
			this._WidthOrHeight = "height";
			dojo.removeClass(this.domNode, "u-form-slider-x");
			dojo.addClass(this.domNode, "u-form-slider-y");
			
			var h = dojo.style(this.thumbNode, "height");
			h = -Math.ceil(h / 2);
			dojo.style(this.thumbNode, "top", h + "px");
			dojo.style(this.thumbNode, "right", "0px");
			
			dojo.style(this.progressNode, "width", "");
			dojo.style(this.railNode, "width", "");
			dojo.style(this.domNode, "width", "");
		} else {
			this.axis = "x";
			this._PageXOrPageY = "pageX";
			this._XOrY = "x";
			this._WidthOrHeight = "width";

			dojo.removeClass(this.domNode, "u-form-slider-y");
			dojo.addClass(this.domNode, "u-form-slider-x")
			
			var w = dojo.style(this.thumbNode, "width");
			
			w = -Math.ceil(w / 2);
			dojo.style(this.thumbNode, "top", "0px");
			dojo.style(this.thumbNode, "right", w + "px");
			
			dojo.style(this.progressNode, "height", "");
			dojo.style(this.railNode, "height", "");
			dojo.style(this.domNode, "height", "");
		}  
		
	},
	
	/**
	 * @summary:
	 * 		获取控件坐标方向
	 * @return:
	 * 		{string}
	 */
	getAxis: function() {
		return this.axis;
	},

   /**
    * @summary:
    * 		滑动事件前回调事件
    * @return:
    * 		{boolean}
    */
	
	onBeforeSlide: function(value) {
		return true;
	},
	
   /**
    * @summary:
    * 		滑动事件开始回调事件
    */
	onSlideStart: function(value) {

	},
		
   /**
    * @summary:
    * 		控件值改变开始回调事件
    * @exmaple:
    * |<div dojoType="unieap.form.Slider" onChange="fn"></div>
    */
	onChange: function(value) {
				
	},
	
	/**
    * @summary:
    * 		滑动事件结束回调事件
    */
	onSlideEnd: function(value) {
		
	}
		
});