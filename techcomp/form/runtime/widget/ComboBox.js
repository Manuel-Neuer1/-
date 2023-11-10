WebForm.widget("unieap.form.ComboBox",WebForm.FormWidget, {
  providerBindName:'',//数据来源实体名称
  height:'',//存储原标签的高度
  dataProviderType:'',
  dataProviderText:'',
  cascadeWidgetId:'',
  url:'' ,
  isCascadeQuery:false,
  az:false,
  mobile:false,
  _create:function(){
    this._super(arguments);
    this.height =this.element.height();
  },
  
  //查询可选项
  queryOptionData:function() {
    if(!this.providerBindName || this.providerBindName == '')
        return;
    var valueArray = [];
    if (this.dataProviderType == 'codeList') {
      if(this.cascadeWidgetId && this.cascadeWidgetId.length>0){
        return;
      }
      var dataParam = {
        codelist_type : this.providerBindName
      };
      valueArray = this.queryCodes(dataParam);
    } else if(this.dataProviderType == 'preset'){//预置资产数据
      valueArray = this.queryPreSet();
    } else {
      var dataStore;
      for(var name in dataCenter.dataStores){
        var ds=dataCenter.getDataStore(name);
        if(ds.getRowSetName()==this.providerBindName)
          dataStore =ds; 
      }
      
      if(!dataStore)
        return;
      dataCenter.removeDataStore(this.providerBindName);//删除codelist数据源信息，防止保存更新时提交到后台
      var rowSet = dataStore.getRowSet();
      for (var i = 0; i < rowSet.getRowCount(); i++){
        valueArray.push(rowSet.getRowData(i));
      }
    }
    return valueArray;
  },
  
  //建立级联关联事件
  buildcascade:function() {
    var id =this.element.attr("id");
    var cascadeWidgets=$("select[cascadewidgetid='"+id+"']:not([repeatWidget='repeatWidget'])");
    if(cascadeWidgets.length==0) 
      return;
    this.element.change(function(){
      var parentVal = this.value;
      if($(this).children("option:not([is_cover='true'])").length<1){
    	  parentVal = "";
      }
      for(var i=cascadeWidgets.length-1,comboBox;comboBox=cascadeWidgets[i];i--){
        comboBox=$(comboBox).data("FormWidget");
        comboBox.cascadeQueryData(this.getAttribute("dataprovider") ,parentVal);
      };
    });
  },
  //级联查询codeList
  cascadeQueryData:function(parentType ,parentValue){
//    if (!parentType||!parentValue) 
//       return;
	if(parentType==null){
		parentType = "";
	}
    var type = this.element.attr("dataprovider");
    var oriType = type.substring(0, type.lastIndexOf("_"));
    var oriParentType = parentType.substring(0, parentType.lastIndexOf("_"));
    if(oriType!=oriParentType){//若绑定的不是一个codetype则取子下拉的
       parentType = oriType+'_'+(Number(type.substring(oriType.length+1, type.length))-1);
    }
    var params = {
      codelist_parentType : parentType ,
      codelist_parentValue: parentValue
    };
    var dataItemArray = this.queryCodes(params);
    if(this.isPreOption!="1"){
             //在选项没有的情况下也得考虑
             var textCur = this.bindRow.getItemValue(this.bindName+"_TEXT");
             var valueCur = "";//this.currentValue;
             if(this.isRecord){
             	valueCur = this.currentValue;
             }else{
             	valueCur = this.presetValue == null ?  this.currentValue : this.presetValue;
             }
             var valueArr,textArr;
             var isMulti = false;
             if(this.element.attr("multiple")==="multiple"){
                  isMulti = true;
                  if(""==valueCur||null==valueCur){
                     valueArr = new Array();
                     textArr = new Array();
                  }else{
                     valueArr = valueCur.split(";");
                     textArr = textCur==null?"":textCur.split(";");
                   }
             }
             var valueOptionArray = new Array();
             $(dataItemArray).each(function(i,o){
                 valueOptionArray.push(o.VALUE);
             })
             if(isMulti){//多选循环一下
                 $(valueArr).each(function(i,o){
                     if($.inArray(o,valueOptionArray)<0){
                                       dataItemArray.push({VALUE:o,NAME:textArr[i]});
                     }
                 })
             }else{
                      if(""!=valueCur&&null!=valueCur&&$.inArray(valueCur,valueOptionArray)<0){
                           dataItemArray.push({VALUE:valueCur,NAME:textCur});
                      }
             }
             this.isPreOption = "1";
    }
    var height =this.element.height();
    this.initMenu(dataItemArray);
//    this.bindData();//级联查询后重新绑定数据
    this.element.selectpicker('refresh');
    //赋值问题
    if(dataItemArray.length>0){
         this.element.selectpicker('val',this.notFirst?null:(isMulti?valueArr:valueCur));
         
         this.element.data("FormWidget").notFirst = true;
    }
    //级联查询重新绑定数据后,触发change事件，为绑定了联动查询的控件赋值
    var currentElement = this.element;
    setTimeout(function(){
        currentElement.trigger('change');
     },100);
  },
  
  queryPreSet:function(){
    var url = this.url;
    var valueArray = [];
    var queryMenuDataSuccess = function(results) {
      if (results) {
        valueArray = results;
      }
    };
    var params={};
  //添加表单id,流程实例id,工作项id等信息。
    params.formid = dataCenter.getParameter("formid");
    params.procinstid = dataCenter.getParameter("SYS_FK");
    params.workitemid = dataCenter.getParameter("workitemid");
    params.presetbind = this.providerBindName;
    params.presetbindtext = this.dataProviderText;
    $.ajax({
      url : url,
      async: false,
      type : 'post',
      data : params,
      dataType : 'json',
      success : queryMenuDataSuccess
    });
    return valueArray;
  },
  
  queryCodes:function(params) {
    var url = this.url;
    var valueArray = [];
    var queryMenuDataSuccess = function(results) {
      if (results) {
        valueArray = results;
      }
    };
    //添加表单id,流程实例id,工作项id等信息。
    var formid = dataCenter.getParameter("formid");
    var procinstid = dataCenter.getParameter("SYS_FK");
    var workitemid = dataCenter.getParameter("workitemid");
    params.formid =formid;
    params.procinstid = procinstid;
    params.workitemid = workitemid;
    $.ajax({
      url : url,
      async: false,
      type : 'post',
      data : params,
      dataType : 'json',
      success : queryMenuDataSuccess
    });
    return valueArray;
  },
  
  render:function(){
    if(Util.getClientInfo()!="PC"){
      this.mobile=true;
      if(this.element.attr("az")==='true'){
           this.az=true;
      }
    }
	if(this.element.css("visibility")==="collapse"){
		this.element.wrap("<div style='display:none'></div>");
	}
    var height = this.element.height();
    this.renderOptionAndFunction();
    this.element.parent().find('a').height(height);
    //$(this.domNode).parent().find('a').width("99%");
    if(height - 23 < 0)
      this.element.parent().find('.ui-selectmenu-status').css('padding-top','0px');
    else
      this.element.parent().find('.ui-selectmenu-status').css('padding-top',(height-14)/2+'px');
    if(!this.element.hasClass("select")){
      this.element.addClass("select");
      if(!this.element.hasClass("select-dropdown-fixed")){
    	  this.element.addClass("select-dropdown-fixed");
      }
      if(!this.element.hasClass("push-up-5")){
          this.element.addClass("push-up-5");
      }
      if(!this.element.hasClass("push-down-5")){
          this.element.addClass("push-down-5");
      }
    }
    if(this.element.attr("disabled") != undefined){
    	if(!this.element.hasClass("disabled")){
    		this.element.addClass("disabled");
    	}
    }
    if(this.element.attr("notnull")=="true"){
    	if(!this.element.hasClass("notnull")){
      	  this.element.addClass("notnull");
        }
    }
    this.element.selectpicker("refresh");
    if(this.mobile){
        this.element.renderMobileSelect(this.az);
    }
    this.element.removeClass("form-control");
    
  //监听控件notnull属性的变化。如果新增了notnull属性，则.addClass("notnull")；如果删除了notnull属性，则.removeClass("notnull")；
	var targetNode = this.element[0];
	var options = { attributes: true, childList: false,subtree:false,attributeOldValue:true};
	function callback(mutationsList, observer) {
		mutationsList.forEach(function(record) {
	    	if(record.attributeName=="notnull"){
	    	// 如果发生变化的属性是notnull
	    		if($(record.target).attr("notnull") == "true" && $(record.target).attr("disabled") == undefined){
	    			//如果notnull为true了，并且当前不是“disabled”的，addClass("notnull");
	    			$(record.target).next().addClass("notnull");
	    		}else if($(record.target).attr("notnull") == undefined){
	    			//如果notnull属性不存在，removeClass("notnull");
	    			$(record.target).next().removeClass("notnull");
	    		}
	    	}
       });
	}
	if(navigator.userAgent.toLowerCase().indexOf("msie") == -1){
		var mutationObserver = new MutationObserver(callback);
		mutationObserver.observe(targetNode, options);
	}
	//监听上传控件notnull属性的变化end
  },
  
  renderOptionAndFunction:function() {
    var optionArray = this.makeQueryOption();
    if(!optionArray){
      optionArray = new Array();
    }
    this.element.children().each(function(i,o){
        optionArray.push({NAME:$(o).text(),VALUE:$(o).attr("value")});
    })
    //在选项没有的情况下也得考虑
    var textCur = this.dataStore.getRowSet().getRow(0).getItemValue(this.bindName+"_TEXT");
    var valueCur = this.dataStore.getRowSet().getRow(0).getItemValue(this.bindName);
    var valueArr,textArr;
    var isMulti = false;
    if(this.element.attr("multiple")==="multiple"){
         isMulti = true;
         if(""==valueCur||null==valueCur){
            valueArr = new Array();
            textArr = new Array();
         }else{
            valueArr = valueCur.split(";");
            textArr = textCur.split(";");
         }
    }
    var valueOptionArray = new Array();
    $(optionArray).each(function(i,o){
        valueOptionArray.push(o.VALUE);
    })
    if(isMulti){//多选循环一下
        $(valueArr).each(function(i,o){
            if($.inArray(o,valueOptionArray)<0){
                              optionArray.push({VALUE:o,NAME:textArr[i]});
            }
        })
    }else{
             if(""!=valueCur&&null!=valueCur&&$.inArray(valueCur,valueOptionArray)<0){
                  optionArray.push({VALUE:valueCur,NAME:textCur});
             }
    }
    this.initMenu(optionArray);
    this.buildcascade();
    var currentElement = this.element;
    if(this.element.attr("presetbind")&&this.element.attr("isforeignkey")=="true"){
    	this.element.on('change',cascadeEvent);
    }
  },
  
  makeQueryOption:function(){
    this.providerBindName=this.element.attr("dataprovider");
    this.dataProviderType =this.element.attr("dataprovidertype");
    this.dataProviderText =this.element.attr("dataprovidertext"); 
    this.cascadeWidgetId =this.element.attr("cascadewidgetid");
    if(this.dataProviderType=="preset"){
      this.url=WEBAPP + '/formParser?status=preset';
    }else if(this.dataProviderType=="codeList"){
      this.url=WEBAPP + '/formParser?status=codeList';
    }
    if(this.mobile&&this.az){
      this.url=this.url+'&az=true';
    }
    var optionArray = this.queryOptionData();
    return optionArray;
  },
  
  //根据当前currentValue值设置dom		xdw
  setDomValue:function(){
    if(!this.currentValue)
      this.currentValue="";
    var hasValueItem = false;
    var valueCur = "";
    if(this.isRecord){
    	valueCur = this.currentValue;
    }else{
    	valueCur = this.presetValue == null ?  this.currentValue : this.presetValue;
    }
    
    var valueArr;
    if(this.element.attr("multiple")==="multiple"){
        valueArr = valueCur.split(";");
    }else{
    	valueArr = [valueCur];
    }
    if(this.element.find('option').length==0&&valueCur!=""){
      var valueArray = [];
      var value={};
      var text = this.bindRow.getItemValue(this.bindName+"_TEXT");
      if(text){
          value.VALUE=valueCur;
          value.NAME=text;
          valueArray.push(value);
          this.initMenu(valueArray,true);
      }
    }
    this.element.find('option').each(function(){
      for(var i=0;i<valueArr.length;i++){
    	  if ($(this).val() == valueArr[i]) {
    	        hasValueItem = true;
    	      }
      }
    });
    try{
	    if (hasValueItem&&valueCur!="") {
	      this.element.selectpicker("val",valueArr);
	    } else if(valueCur==""&&this.element.attr("defaultvalue")){
	    	this.element.selectpicker("val",this.element.attr("defaultvalue").split(";"));
	    } else{
	    	this.element.selectpicker("val",null);
	    }
	}catch(err){
	  	console.error(err);
	}
    if(this.element.css("visibility")&&this.element.css("visibility")=="collapse"){
      this.element.hide();
    }
  },
  initMenu:function(valueArray,isCover){//根据dc中的数据，添加option
    var string = '';
    if(!valueArray){
      return;
    }
    this.element.empty();
    if(this.element.attr("multiple") == "multiple"){
	    string = '';
    }else{
        string = '<option value = "" initial="-">请选择</option>';
    }
    for(var i = 0; i < valueArray.length; i++){
    	if(valueArray[i].VALUE!=null){
	    	string += '<option '+(isCover?' is_cover="true"':'')+ (valueArray[i].FINAL_INITIAL_LETTER?('initial="'+valueArray[i].FINAL_INITIAL_LETTER+'"'):'') + ' value =';
	        string += "'"+valueArray[i].VALUE + "'>";
	        string += valueArray[i].NAME + '</option>';
      }
    }
    this.element.html(string);
  },
    
  collectValue:function(){
//    this.currentValue=this.element.val();

    //this.currentValue = this.element.find("option:selected").val();
    //this.currentValue = this.element.val();
	//xdw
	var selectVal = this.element.val();
	var text = "";
	if(selectVal!=null){
		if( Array.isArray(selectVal)){
			this.currentValue = selectVal.join(";");
			this.element.find("option:selected").each(function(i,o){
				if(i==0){
					text = $(o).text();
				}else{
					text =text + ";" + $(o).text();
				}
			})
		}
		else{
			this.currentValue = selectVal;
			text = this.element.find("option:selected").text();
		}
	}else{
		this.currentValue = null;
	}
	if (this.bindRow){
		this.bindRow.setItemValue(this.bindName+"_TEXT",text);
	}
    return this.currentValue;
  }
  
});
