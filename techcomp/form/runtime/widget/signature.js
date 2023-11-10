WebForm.widget("unieap.form.signature",WebForm.FormWidget, {
	_create:function(){
		this._super(arguments);
		var element = this.element;
		var id = element[0].id;
		element.removeAttr("style");
		//判断一下是否为填写状态
		if(Util.getActinstName()==="填写状态"){
		    element.append('<div class="sign-drawing"><div style="height:200px;max-width:400px;border:dotted" >'+
                                    '<div class="drawing-panel" id="drawingPanel-'+id+'" style="height:200px;max-width:400px"></div>'+
                                '</div>'+
                                '<div class="push-up-20">'+
                                    '<a class="btn btn-default push-right-10 sign-revoke" id="sign-revoke-'+id+'">'+
                                        '<i class="fa fa-rotate-left"></i>'+
                                        '撤销'+
                                    '</a>'+
                                '</div></div>');

            var signObj = new EleSign({
                    ele: $(".drawing-panel",element)[0]
            });
            signObj.init();
            element.data("signObj",signObj);
            $(".drawing-panel",element).resize(function(obj,width,height) {
                signObj.resize();
            });
            //绑定撤销事件
            $(".sign-revoke",element).on("click",function(){
                signObj.undo();
            })
		}else{
				//图片区域
                element.append('<div class="sign-show"><div class="sign-show-container" style="height:200px;max-width:400px;border:dotted" >'+

                                    '</div>'+
                                    '</div>');
		}

	},
	
	//根据当前currentValue值设置dom
	setDomValue:function(){
		if(this.currentValue&&Util.getActinstName()!="填写状态"){
		    $(".sign-show-container",this.element).append('<img class="upload-pic" src="'+this.currentValue+'"/>')
		}

	},
	
	submitValue:function(){
		var value = this.element.data("signObj").toPng();
		if(!value)
			return;
		this.currentValue=value;
		this._super(arguments);
	}
});
