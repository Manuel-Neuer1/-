(function(){
	var prototype=unieap.xgrid.manager.SelectionManager.prototype;
	//根据selection类型返回selection宽度
	prototype.getRowBarWidth=function() {
		var inWidth=0;
		if(this.selectType&&this.selectType!="none"){
			inWidth+=36;//modify 由原来的默认rowbar的宽度为20改为32
		}
		return inWidth;
	}
})();