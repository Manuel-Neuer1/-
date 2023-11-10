if(!dojo._hasResource["unieap.progressbar.ProgressBar"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["unieap.progressbar.ProgressBar"] = true;
dojo.provide("unieap.progressbar.ProgressBar");

dojo.require("dojo.fx");
dojo.require("dojo.number");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.ProgressBar");

dojo.declare("unieap.progressbar.ProgressBar", [dijit.ProgressBar], {
	/**
	 * @declaredClass:
	 * 		unieap.progressbar.ProgressBar
	 * @summary:
	 * 		进度条控件
	 * @example:
	 * |<div dojoType="unieap.progressbar.ProgressBar"
	 * |	progress="..." maximum="...">
	 * |</div>
	 */
	 
	 /**
	  * @summary:
	  * 	进度值
	  * @type:
	  * 	{number}
	  * @default:
	  * 	0
	  */
	 progress: "0",
	 
	 /**
	  * @summary:
	  * 	最大进度值
	  * @type:
	  * 	{number}
	  * @default:
	  * 	100
	  */
	 maximum: 100,
	 
	 /**
	  * @summary:
	  * 	含混模式
	  * @type:
	  * 	{boolean}
	  * @default:
	  * 	false
	  * @description:
	  * 	此属性为true时，进度条不显示具体的进度
	  */
	 indeterminate: false,
	 
	 /**
	  * @summary:
	  * 	设置控件的高度,支持数字或者百分比
	  * @type:
	  * 	{number|string}
	  */
	 height: "",
	 
	 /**
	  * @summary:
	  * 	设置控件的高度,支持数字或者百分比
	  * @type:
	  * 	{number|string}
	  */
	 width: "",
	 
	 places: 0,
	 
	 /**
	  * @summary:
	  * 	更新进度条
	  * @type:
	  * 	{object}
	  * @example:
	  * |	var doupdate = function(complete) {
	  * |		unieap.byId("progressBar1").update({progress:complete});
	  * |		if (complete<100) {
	  * |			var i=complete+1;
	  * |			setTimeout("doupdate("+i+")", 100);
	  * |		}
	  * |	}
	  * |	doupdate(1);
	  */
	 update: function(attributes) {
	 	this.inherited(arguments);
	 },
	 
	 postCreate:function(){
		this.inherited(arguments);
		this.height&&dojo.style(this.domNode,"height",this.height);
		this.width&&dojo.style(this.domNode,"width",this.width);
	 }

});
}
