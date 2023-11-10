/**
 * 定义WebForm Widget框架
 */
$(function(){
	//将父页面的vantdate清空
	$("[name='date_vant']",window.parent.document).remove();
	//将父页面的图片容器清空
    $("[name='pictures']",window.parent.document).parent().remove();
	//页面加载完成后渲染组件
	var widgets=$("[dojotype]");
	widgets.each(function(){
		var dojotype=$(this).attr("dojotype");
		if(!dojotype)
			return;
		var widgetClass=WebForm.widgetClass[dojotype];
		if(widgetClass){
			var widget=new widgetClass(this);
			$(this).data("FormWidget",widget);
		}
	});
});

var WebForm=WebForm||{};
WebForm.widgetClass={};//保存类名与构造函数的映射

WebForm.widget = function( name, base, prototype ) {
	var fullName=name, existingConstructor, constructor, basePrototype,
		namespace1 = name.split( "." )[ 0 ];
		namespace2= name.split( "." )[ 1 ];
	var namespace=namespace1+"."+namespace2;
	name = name.split( "." )[ 2 ];
	//fullName=namespace1+"_"+namespace2+"_"+name;
	if ( !prototype ) {
		prototype = base;
		base = WebForm.FormWidget;
	}

	window[ namespace1 ] = window[ namespace1 ] || {};
	window[ namespace1][namespace2] = window[ namespace1][namespace2] || {};
	constructor = window[ namespace1][namespace2][ name ] = function( options, element ) {
			if(!options)
				return this;//多层继承情况下,new base();没有具体的元素
			this._createWidget( options, element );
	};
	$.extend( constructor, {
		version: prototype.version,
		_proto: $.extend( {}, prototype ),
		_childConstructors: []
	});

	basePrototype = new base();
	$.each( prototype, function( prop, value ) {
		if ( $.isFunction( value ) ) {
			prototype[ prop ] = (function() {
				var _super = function() {
						return base.prototype[ prop ].apply( this, arguments );
					},
					_superApply = function( args ) {
						return base.prototype[ prop ].apply( this, args );
					};
				return function() {
					var __super = this._super,
						__superApply = this._superApply,
						returnValue;

					this._super = _super;
					this._superApply = _superApply;

					returnValue = value.apply( this, arguments );

					this._super = __super;
					this._superApply = __superApply;

					return returnValue;
				};
			})();
		}
	});
	constructor.prototype = WebForm.widget.extend( basePrototype, prototype, {
		constructor: constructor,
		namespace: namespace,
		widgetName: name,
		widgetBaseClass: fullName,
		widgetFullName: fullName
	});

	if ( existingConstructor ) {
		$.each( existingConstructor._childConstructors, function( i, child ) {
			var childPrototype = child.prototype;

			WebForm.widget( childPrototype.namespace + "." + childPrototype.widgetName, constructor, child._proto );
		});
		delete existingConstructor._childConstructors;
	} else {
		base._childConstructors.push( constructor );
	}
	WebForm.widgetClass[fullName]=constructor;
	//WebForm.widget.bridge( name, constructor );//暂不纳入到jquery 组件中
};

//将多个对象的属性编制目标对象中
WebForm.widget.extend = function( target ) {
	var input = Array.prototype.slice.call( arguments, 1 ),
		inputIndex = 0,
		inputLength = input.length,
		key,
		value;
	for ( ; inputIndex < inputLength; inputIndex++ ) {
		for ( key in input[ inputIndex ] ) {
			value = input[ inputIndex ][ key ];
			if ( input[ inputIndex ].hasOwnProperty( key ) && value !== undefined ) {
				if ( $.isPlainObject( value ) ) {
					target[ key ] = $.isPlainObject( target[ key ] ) ?
							WebForm.widget.extend( {}, target[ key ], value ) :
								WebForm.widget.extend( {}, value );
				} else {
					target[ key ] = value;
				}
			}
		}
	}
	return target;
};

//将WebForm组件发布为jquery组件
WebForm.widget.bridge = function( name, object ) {
	var fullName = object.prototype.widgetFullName || name;
	$.fn[ name ] = function( options ) {
		var isMethodCall = typeof options === "string",
			args = Array.prototype.slice.call( arguments, 1 ),
			returnValue = this;

		options = !isMethodCall && args.length ?
				WebForm.widget.extend.apply( null, [ options ].concat(args) ) :
			options;

		if ( isMethodCall ) {
			this.each(function() {
				var methodValue,
					instance = $.data( this, fullName );
				if ( !instance ) {
					return $.error( "cannot call methods on " + name + " prior to initialization; " +
						"attempted to call method '" + options + "'" );
				}
				if ( !$.isFunction( instance[options] ) || options.charAt( 0 ) === "_" ) {
					return $.error( "no such method '" + options + "' for " + name + " widget instance" );
				}
				methodValue = instance[ options ].apply( instance, args );
				if ( methodValue !== instance && methodValue !== undefined ) {
					returnValue = methodValue && methodValue.jquery ?
						returnValue.pushStack( methodValue.get() ) :
						methodValue;
					return false;
				}
			});
		} else {
			this.each(function() {
				var instance = $.data( this, fullName );
				if ( instance ) {
					instance.option( options || {} )._init();
				} else {
					$.data( this, fullName, new object( options, this ) );
				}
			});
		}

		return returnValue;
	};
};
