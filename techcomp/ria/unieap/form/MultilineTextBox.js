if (!dojo._hasResource["unieap.form.MultilineTextBox"]) {
	dojo._hasResource["unieap.form.MultilineTextBox"] = true;
	dojo.provide("unieap.form.MultilineTextBox");
	dojo.require("unieap.form.Textarea");
	dojo.declare("unieap.form.MultilineTextBox", unieap.form.Textarea, {
		/**
		 * @summary: MultilineTextBox控件，多行文本编辑控件，显示时带下划线，可设置显示行数
		 * @declaredClass: unieap.form.MultilineTextBox
		 * @superClass: unieap.form.Textarea
		 * @example: | <div dojoType="unieap.form.MultilineTextBox" ></div>
		 */
		UserInterfaces : dojo.mixin({
					lineNumber : 'number',
					fontStyle : 'object',
					isShowLine:'boolean'
				}, unieap.form.Textarea.prototype.UserInterfaces),

		/**
		 * @type:
		 * 		{number}
		 * @summary:
		 * 		设置控件显示的行数
		 * @description:
		 * 		显示的行数是指非编辑状态下的行数，带下划线，行高会根据控件高度自动计算
		 * 		内容超出的部分将会隐藏，编辑状态下可见
		 * @default
		 * 		2
		 * @example:
		 * |<div dojoType="unieap.form.MultilineTextBox" lineNumber="6"></div>
		 */
		lineNumber : 2,
		
		/**
		 * @type:
		 * 		{object}
		 * @summary:
		 * 		设置控件字体属性
		 * @description:
		 * 		可设置控件的字体属性，包括大小、颜色、字体等
		 * 		设置属性名称要使用javascript中的属性名，如fontSize, fontFamily等
		 * @default
		 * 		与其它formWidget控件相同
		 * @example:
		 * |<div dojoType="unieap.form.MultilineTextarea" lineNumber="6"
		 * | fontStyle="{color: 'red', fontSize: '30px'}"></div>
		 */
		fontStyle : null,
		// 行高
		_lineHeight : null,
		
		// 下划线div
		_lineContainer : null,
		
		// 内容超出显示大小时的提示
		_overflowIcon : null,
		isShowLine:true,
		
		postMixInProperties : function() {
			this.inherited(arguments);
		},

		postCreate : function() {
			this.inherited(arguments);
			// 隐藏边框
			dojo.addClass(this.fieldNode, 'u-form-multiline-border-transparent');
			// 去除Textarea的滚动条，禁止调整大小
			dojo.style(this.inputNode, {
				'overflowX': 'hidden',
				'overflowY': 'hidden',
				'resize': 'none'
			});
			dojo.style(this.inputNode.parentNode, 'position', 'relative');
			if(this.fontStyle && typeof(this.fontStyle) == "object"){
				for (var i in this.fontStyle){
					dojo.style(this.inputNode, i, this.fontStyle[i]);
				}
			}
		},

		startup : function() {
			this.inherited(arguments);
			var textarea, cttPos, coords, line, fontSize, leading;
			textarea = this.inputNode;
			cttPos = dojo.contentBox(textarea);
			coords = dojo.coords(textarea);
			fontSize = parseInt(dojo.style(textarea, 'fontSize'), 10);

			// 计算并调整行高
			this._lineHeight = Math.floor(cttPos["h"] / this.lineNumber);
			dojo.style(textarea, 'lineHeight', this._lineHeight + 'px');
			
			// 生成下划线
			this._lineContainer = dojo.create('div', {
				}, textarea.parentNode);
			dojo.style(this._lineContainer, {
				'position': 'absolute',
				'top' : coords['t'] + 'px',
				'left' : coords['l'] + 'px',
				'width' : '100%',
				'height' : '100%',
				'fontSize': fontSize + 'px',
				'lineHeight': this._lineHeight + 'px'
			});
			if(!this.isShowLine){
				dojo.style(this._lineContainer, 'visibility', 'hidden');
			}
			leading = this._lineHeight - fontSize;
			// 内容超出显示提示
			this._overflowIcon = dojo.create('label', {'innerHTML': '…'}, this._lineContainer);
			dojo.style(this._overflowIcon, {
				'visibility': 'hidden',
				'position': 'absolute',
				'top': ((this.lineNumber - 1) * this._lineHeight) + 'px',
				'right': '0px',
//				'fontSize': fontSize + 'px',
//				'lineHeight': fontSize + 'px',
				'background': 'white',
				'letterSpacing': 'normal',
				'textDecoration': 'none'
			});
			line = dojo.create('div', {
				'innerHTML': new Array(this.lineNumber + 1).join('&nbsp;\n')				
			}, this._lineContainer);
			dojo.style(line, {
				'position': 'absolute',
				'width': '100%',
				'height': '100%',
				'textDecoration': 'underline',
				'letterSpacing': '9999px',
				'wordWrap': 'break-word',
				'overflow': 'hidden'
			});
			
			// 窗口大小调整时更新超出提示
			if(dojo.isIE) {
				this.connect(this.inputNode, 'onresize', '_checkOverflow');
			} else {
				// 这个不太好，但还没想到更好的办法
				this.connect(window, 'onresize', '_checkOverflow');
			}
		},
		
		// 获得焦点时显示边框，隐藏下划线
		_onFocus: function(evt) {
			dojo.style(this._lineContainer, 'visibility', 'hidden');
			dojo.style(this._overflowIcon, 'visibility', 'hidden');
			dojo.removeClass(this.fieldNode, 'u-form-multiline-border-transparent');
			dojo.style(this.inputNode, 'overflowY', 'auto');
			this.inherited(arguments);
		},
		
		// 失去焦点隋隐藏边框，显示下划线
		_onBlur: function(evt,flag) {
			// 去除边框
			dojo.addClass(this.fieldNode, 'u-form-multiline-border-transparent');
			// 隐藏Textarea的滚动条
			dojo.style(this.inputNode, 'overflowY', 'hidden');
			// 回到最顶部
			this.inputNode.scrollTop = 0;
			// 显示下划线
			if(this.isShowLine){
			dojo.style(this._lineContainer, 'visibility', 'visible');
			}
			this._checkOverflow();
			this.inherited(arguments);
		},
		
		// ESC键返回
		_onKeyDown: function(evt) {
			if(dojo.keys.ESCAPE == evt.keyCode) {
				this.focusNode.blur();
				return;
			}
			this.inherited(arguments);
		},
		
		// 检测是否有内容超出显示范围，通过scrollHeight与clientHeight比较实现
		_checkOverflow: function() {
			if((this.inputNode.scrollHeight) <= this.inputNode.clientHeight) {
				dojo.style(this._overflowIcon, 'visibility', 'hidden');
			} else {
				dojo.style(this._overflowIcon, 'visibility', 'visible');
			}
		},
		
		setValue: function(value) {
			this.inherited(arguments);
			// 设置值时进行超出检查
			this._checkOverflow();
		},
		
		setVisible: function(visible) {
			this.inherited(arguments);
			if(visible) {
				dojo.style(this._lineContainer, 'visibility', 'visible');
				this._checkOverflow();
			} else {
				dojo.style(this._lineContainer, 'visibility', 'hidden');
				dojo.style(this._overflowIcon, 'visibility', 'hidden');
			}
		},
		
		setHeight: function(height) {
			this.inherited(arguments);
			this.inputNode.scrollTop = 0;
			var h = dojo.contentBox(this.inputNode)['h'];

			// 计算并调整行高
			this._lineHeight = Math.floor(h / this.lineNumber);
			dojo.style(this.inputNode, 'lineHeight', this._lineHeight + 'px');
			dojo.style(this._lineContainer, {
				'lineHeight': this._lineHeight + 'px'
			});
			dojo.style(this._overflowIcon, 'top', ((this.lineNumber - 1) * this._lineHeight) + 'px');
		},
		
		setWidth: function(width) {
			this.inherited(arguments);
			this.inputNode.scrollTop = 0;
			this._checkOverflow();
		}
	})
}