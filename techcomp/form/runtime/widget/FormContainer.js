/**
 * 定义容器基类
 */
WebForm.FormContainer=function(){};
WebForm.FormContainer._childConstructors = [];
WebForm.FormContainer.prototype={
		_createWidget : function(options, element) {
			if (!element)
				element = options;
			else
				$.extend(this, options);

			this.element = $(element);
			$.data(element, this.widgetName, this);
			$.data(element, this.widgetFullName, this);
			this._init();
			this._create();
		},
		_init : $.noop,
		_create : $.noop,
		submitValue:$.noop,
		bindData:$.noop,
		getChildren:function(){
			var widgetArray=[];
			this.element.find("[dojotype]").each(function(){
				var widget=$(this).data("FormWidget");
				if(widget instanceof WebForm.FormWidget)
					widgetArray.push(widget);
			});
			return widgetArray;
		}
		
}