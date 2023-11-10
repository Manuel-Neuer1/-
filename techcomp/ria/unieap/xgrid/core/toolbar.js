dojo.provide('unieap.xgrid.core.toolbar');
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.declare('unieap.xgrid.toolbar', [dijit._Widget, dijit._Templated], {
	/**
	 * @summary:
	 * 		Grid的工具条
	 * @declaredClass:
	 * 		unieap.xgrid.core.toolbar
	 * @classDescription：
	 * 		可进行翻页,打印,导出等操作的工具条
	 * @example:
	 * |<div dojoType="unieap.xgrid.Grid" id="grid">
	 * |	<header>
	 * |		<cell label="编号" name="attr_name"></cell>
	 * |		<cell label="职位" name="attr_job"></cell>
	 * |	</header>
	 * |	${1}<toolbar ${2} paging='{}' export='{}'>
	 * |		<button>自定义按钮</button>
	 * |	</toolbar>
	 * |</div>
	 * ${1}Grid中定义toolbar标签,通过grid.getToolBar()得到Grid的toolbar
	 * ${2}print,paging,export,individual分别传递相关信息。
	 * @img:
	 * 		images/grid/toolbar.png	
	 */

    grid: null,
    
	/**
	 * @summary：
	 * 		翻页相关信息
	 * @description:
	 * 		toolbar默认初始化翻页信息
	 * @type:
	 * 		{object}
	 * @see:
	 * 		unieap.xgrid.manager.PagingManager
	 */
    paging: null,
	
	/**
	 * @summary:
	 * 		导出相关信息
	 * @description:
	 * 		配置export属性才初始化导出相关的功能
	 * @type:
	 * 		{object}
	 * @example：
	 * |	<toolbar export='{defaultType:"client"}'>
	 * |	</toolbar>
	 * 		export的defaultType信息表示导出方式,可为client server
	 * @see:
	 * 		unieap.xgrid.manager.ExportManager
	 */		
    'export': null,
    
	_destroyWidgets: null,
	
	/**
	 * @summary:
	 * 		个性化设置
	 * @description:
	 * 		配置individual属性才初始化个性化相关的功能
	 * @type:
	 * 		{boolean}
	 * @example：
	 * |	<toolbar individual='true'>
	 * |	</toolbar>
	 * @see:
	 * 		unieap.xgrid.manager.Individual
	 */		
	individual: null,
	
    templateString:
				 "<div class='u-grid-master-toolbar'>" +
						//翻页条
					    "<div class='u-grid-page left'>" +
						    "<table cellPadding='0' cellSpacing='0'><tbody><tr>" +
								    "<td><span dojoAttachPoint='firstImageNode' class='ico u-grid-page-first'></span></td>" +
								    "<td><span dojoAttachPoint='prevImageNode' class='ico u-grid-page-prev'></span></td>" +
								    "<td><span dojoAttachPoint='pageNoStart'></span></td>" +
								    "<td><input dojoAttachPoint='pageNoNode' class='u-grid-page-pageNo'></td>" +
								    "<td><span dojoAttachPoint='totalPageNoNode'></span></td>" +
								    "<td><span dojoAttachPoint='nextImageNode' class='ico u-grid-page-next'></span></td>" +
								    "<td><span dojoAttachPoint='lastImageNode' class='ico u-grid-page-last'></span></td>" +
								    "<td><div class='sep'></div></td>" +
							"</tr></tbody></table>" +
						"</div>" +
						
						//动态改变每页显示数据条数
						"<div class='u-grid-page left' style='display:none'>"+
							"<table cellPadding='0' cellSpacing='0'><tbody><tr>"+
							"<td><span class='u-grid-cpagesize-left' dojoAttachPoint='perPageNode'></span></td>"+
							"<td dojoAttachPoint='customPageSizeNode'></td>"+
							"<td><span class='u-grid-cpagesize-right' dojoAttachPoint='rowsNode'></span></td>"+
							"<td><div class='sep'></div></td>" +
							"</tr></tbody></table>"+
						"</div>"+
						
						//导出、打印
						"<div  class='u-grid-page left' style='display:none'>" +
							"<table cellPadding='0' cellSpacing='0'><tbody><tr>" +
								"<td><span class='u-grid-export' dojoAttachPoint='exportNode'></span></td>" +
								"<td><span class='u-grid-individual' dojoAttachPoint='individualNode'></span></td>" +
								"<td><span class='u-grid-print' dojoAttachPoint='printNode'></span></td>" +
							"</tr></tbody></table>" +
						"</div>" +
						
						//用户在toolbar上自定义显示
						"<div class='u-grid-page left'>" +
							"<table cellPadding='0' cellSpacing='0'><tbody><tr><td dojoAttachPoint='containerNode' height='100%'>" +
							"</td></tr></tbody></table>" +
						"</div>" +
						
						//翻页信息显示(本页多少条记录、共多少条记录)
						"<div class='u-grid-page right'>" +
							"<table cellPadding='0' cellSpacing='0'><tbody><tr><td>" +
							    "<span dojoAttachPoint='pageInfoNode'></span>" +
						    "</td></tr></tbody></table>" +
					    "</div>" +
    				"</div>",
					
	//本页共{0}条记录  共{1}条记录				
    _pageInfoTemplate: RIA_I18N.grid.paging.template,

    postCreate: function() {
        this.grid.domNode.appendChild(this.domNode);
		//国际化翻页条信息
		dojo.attr(this.firstImageNode,'title',RIA_I18N.grid.paging.firstPage);
		dojo.attr(this.prevImageNode,'title',RIA_I18N.grid.paging.prevPage);
		dojo.attr(this.nextImageNode,'title',RIA_I18N.grid.paging.nextPage);
		dojo.attr(this.lastImageNode,'title',RIA_I18N.grid.paging.lastPage);
		dojo.attr(this.individualNode,'title',RIA_I18N.grid.toolbar.individual);
		//显示分页数据
       	this._configPaging();
		
		//导出设置
        if (this['export']) {
            this.domNode.childNodes[2].style.display = 'block';
            this.exportNode.style.display = 'block';
            this._configExport();
            var tooltipMessage = this.grid.getManager("ExportManager").tooltipMessage;
        	if(tooltipMessage!=null&&tooltipMessage!=''){
	            this.connect(this.domNode.childNodes[2],"onmouseover",this._onExportMouseOver);
	            this.connect(this.domNode.childNodes[2],"onmouseout",this._onExportMouseOut);
        	}
        }
        if (this['individual']) {
            this.domNode.childNodes[2].style.display = 'block';
            this.individualNode.style.display = 'block';
			this._configIndividual();
			this.grid.getManager("LayoutManager").setIndividualStructure();
        }
        this.update();
    },
    
    /**
     * @summary:
     * 		更新toolbar的翻页信息
     * @description:
     * 		在数据发生变化时更新翻页相关的信息
     * @example：
     * |	grid.getToolBar().update();
     * 		更新toolbar上的信息
     */
    update: function() {
		this._displayPagingBar && this._updatePagingStatus();
		var combox=this._comboBox;
		//如果下拉框只有一条数据就清空下拉框的值，否则不清空
		combox && combox.getDataProvider().getItems().length ==1 && combox.setValue('');
    },
    
	//xgrid导出显示提示信息
	 _onExportMouseOver: function(){
    	unieap.showTooltip({inner:this.grid.getManager("ExportManager").tooltipMessage},this.exportNode);
   },
   //xgrid导出隐藏提示信息
   _onExportMouseOut: function(){
   		unieap.showTooltip(this.exportNode);
   },
    
    //------------------------------------翻页-----------------------------------

	//显示toolbar上的翻页条
	_showPagingBar: function() {
		if (!this._displayPagingBar) {
			this._displayPagingBar=true;
			this._hideOrShowPagingBar("block");
			//如果没有配置过翻页相关设置
			if (!this._haveConfigedPaging) {
				this._configPaging();
				this.update();
			}
		}
	},
	
	//隐藏toolbar上翻页条
	_hidePagingBar:function(){
		if (this._displayPagingBar) {
			this._displayPagingBar = false;
			this._hideOrShowPagingBar("none");
		}
	},
	
	//	display可选值为"none"或者"block"
	_hideOrShowPagingBar: function(display) {
		var children=this.domNode.childNodes;
		dojo.style(children[0],'display',display);
		if (this._userPageSize) {
			dojo.style(children[1],'display',display);
		}
		dojo.style(children[4],'display',display);
	},
	
    //配置翻页相关
    _configPaging: function() {
    	!this._displayPagingBar && (this._displayPagingBar = this.paging && this.paging['display']);
		//默认显示翻页条,如果用户不配置就为true

		if (this._displayPagingBar==null|this._displayPagingBar==undefined) {
			this._displayPagingBar=true;
		}
		var userPageSize=this.paging && this.paging['userPageSize'];
		//用户如果设置了userPageSize属性（无论是true还是false)，就用用户的设置，否则走系统统一的属性
		this._userPageSize=this.paging && (typeof(userPageSize) !="undefined" ? userPageSize : unieap.widget.grid.userPageSize);
    	
        if (!this.grid['PagingManager']) {
        	var params = this.paging || {};
            dojo.require("unieap.xgrid.manager.PagingManager");
            this.grid['PagingManager'] = new unieap.xgrid.manager.PagingManager(dojo.mixin(params,{grid:this.grid}));
            this.grid.managers.push("PagingManager");
        }
        if (!this._displayPagingBar) {
			this._hideOrShowPagingBar("none");
			return;
		}
		
		this._configUserPageSize();
		
		//已经完成翻页的相关设置
		this._haveConfigedPaging = true;
        this.connect(this.firstImageNode, 'onclick', '_onFirstClick');
        this.connect(this.prevImageNode, 'onclick', '_onPrevClick');
        this.connect(this.nextImageNode, 'onclick', '_onNextClick');
        this.connect(this.lastImageNode, 'onclick', '_onLastClick');
        this.connect(this.pageNoNode, 'onkeyup', '_onPageNoClick');
        //以下非UI事件 需要使用dojo.connect
        this.connects = [];
        this.connects.push(dojo.connect(this.grid, 'onStoreChanged', this, 'update'));
        this.connects.push(dojo.connect(this.grid, 'onRowSetChanged', this, 'update'));
        this.connects.push(dojo.connect(this.grid, 'onItemChanged', this, 'update'));
        this._buttonList = [this.firstImageNode, this.prevImageNode, this.nextImageNode, this.lastImageNode];
    },
    
    //更新翻页状态信息
    _updatePagingStatus: function() {
    	var binding = this.grid.getBinding(),
        	manager = this.grid['PagingManager'];
        if(manager && manager.asyncPageCount && manager.asyncPageCountFinish){
        	var store = binding.store;
        	binding.store.setRecordCount(manager.totalCount);
        }
		var	info = manager.getPageInfo(),
			pageSize = info.pageSize,
	    	totalPage = pageSize==0?0:pageSize>0?Math.ceil(info.totalCount / pageSize):0;
        //更新buttons状态
        dojo.forEach(this._buttonList, function(node, index){
            var array = ['first', 'prev', 'next', 'last'];
            dojo.addClass(node, 'u-grid-page-' + array[index]);
            dojo.removeClass(node, 'u-grid-page-' + array[index] + '-disabled');
        }, this)
        if (1 == info.pageNumber) {
            dojo.removeClass(this._buttonList[0], 'u-grid-page-first');
            dojo.addClass(this._buttonList[0], 'u-grid-page-first-disabled');
            dojo.removeClass(this._buttonList[1], 'u-grid-page-prev');
            dojo.addClass(this._buttonList[1], 'u-grid-page-prev-disabled');
        }
        if (info.pageNumber >= totalPage) {
            dojo.removeClass(this._buttonList[2], 'u-grid-page-next');
            dojo.addClass(this._buttonList[2], 'u-grid-page-next-disabled');
            dojo.removeClass(this._buttonList[3], 'u-grid-page-last');
            dojo.addClass(this._buttonList[3], 'u-grid-page-last-disabled');
            totalPage = info.pageNumber;
        }
        if(!(binding._supportClientPaging() && binding.getDataStore().getName().indexOf(this._pagingStoreName)==-1)){
        info.totalCount += info.totalPageCount-info.initialPageCount;
        }
        if(info.totalCount < 0){
        	info.totalCount = 0;
        }
        //更新信息
        this.pageNoNode.value = info.pageNumber;
        var totalCount = info.totalCount?info.totalCount:info.pageCount;
        if(manager && manager.asyncPageCount && !manager.asyncPageCountFinish){
        	this.pageInfoNode.innerHTML = this._pageInfoTemplate.replace('{0}', info.pageCount).replace('{1}', "<div class='grid-pagecount-wait-img'></div>");
        	this.totalPageNoNode.innerHTML = "/" + "<div class='grid-pagecount-wait-img'></div>" + RIA_I18N.grid.paging.page;
        }
        else{	
        	this.pageInfoNode.innerHTML = this._pageInfoTemplate.replace('{0}', info.pageCount).replace('{1}', totalCount);
        	this.totalPageNoNode.innerHTML = "/" + totalPage + RIA_I18N.grid.paging.page;
        }
        //RIA_I18N.grid.paging.pagePrefix的值，中文为"第"，英文为"Page"
        this.pageNoStart.innerHTML = RIA_I18N.grid.paging.pagePrefix;
		//RIA_I18N.grid.paging.page的值，中文为"页"，英文为""
		 if(totalPage>999){
        	var totalPageNoNodeWidth = dojo.style(this.totalPageNoNode,'width');
        	if(totalPageNoNodeWidth > 10) totalPageNoNodeWidth-=10;
        	//一个字符7px，/，5px；
        	if(totalPageNoNodeWidth < 23) totalPageNoNodeWidth = (totalPage + "").length * 7 + 5;
        	dojo.style(this.pageNoNode,"width",totalPageNoNodeWidth);
        }
    },
    
    
    
    //第一页
    _onFirstClick: function() {
        if (this.grid['PagingManager'].getPageNumber() > 1) {
            this.grid['PagingManager'].firstPage();
        }
    },
    //上一页
    _onPrevClick: function(){
        if (this.grid['PagingManager'].getPageNumber() > 1) {
            this.grid['PagingManager'].prevPage();
        }
    },
    //下一页
    _onNextClick: function(){
        var manager = this.grid['PagingManager'];
        if (manager.getPageNumber() < manager.getTotalPage()) {
            manager.nextPage();
        }
    },
    
    //最后一页
    _onLastClick: function() {
        var manager = this.grid['PagingManager'];
        if (manager.getPageNumber() < manager.getTotalPage()) {
            manager.lastPage();
        }
    },
    
    _onPageNoClick: function(e) {
        var manager = this.grid['PagingManager'];
        if (e.keyCode == dojo.keys.ENTER) {
            var n = this.pageNoNode.value;
            n = n.replace(/[^0-9]/g, '');
            n = Number(n);
            if (n > manager.getTotalPage()) {
                n = manager.getTotalPage();
            } else {
            	n = Math.max(n, 1);
            }
            if (n > 0 && n <= manager.getTotalPage() && n != manager.getPageNumber()) {
                manager.setPageNumber(n);
            }
        }
    },
	
	destroy:function(){
		if(this.connects){
			while (this.connects.length) {
				dojo.disconnect(this.connects.pop());
			}
		}
		this.inherited(arguments);
		this._destroyWidgets && this._destroyWidgets.length>0 
			&& dojo.forEach(this._destroyWidgets, function(w) {
			w&&w.destroy&&w.destroy();
		});
	},
	
	getHeight: function() { 
		var height = dojo.style(this.domNode,"height");
		return height;
	},
	
	//-------------------------自定义每页显示的数据条数--------------------------------
	
	_configUserPageSize:function(){
		//只有当翻页条显示时才显示
		if(this._userPageSize&&this._displayPagingBar){
			dojo.style(this.domNode.childNodes[1],'display','block');
			this._userPageSize=dojo.isArray(this._userPageSize)?this._userPageSize:[-1,5,10,20,50,100,200];
			var defaultValue,
				size=this.grid.getManager('PagingManager').getPageInfo().pageSize;
			if(dojo.indexOf(this._userPageSize,size)>-1){
				defaultValue=size;
			}
			this._createComboBox(this._userPageSize,defaultValue);
		}
	},
	

	//构建下拉框
	_createComboBox: function(options,defaultValue) {
		if(!dojo.isArray(options)) return;
		dojo.require("unieap.form.ComboBox");
		this._comboBox&&this._comboBox.destroy();
		dojo.empty(this.customPageSizeNode);
		var html=[],_temp;
		html.push("<select width='55px' dojoType='unieap.form.ComboBox' popup='{displayStyle:\"list\"}' comboShowSelect='false' readOnly='true' dataProvider='{staticData:true}'>");
		dojo.isArray(options)&&dojo.forEach(options,function(item){
			item==-1?(_temp="---"):(_temp=item);
			html.push("<option value="+item+">"+_temp+"</option>");
		});
		html.push("</select>");
		this.customPageSizeNode.innerHTML=html.join('');
		dojo.parser.parse(this.customPageSizeNode);
		this._comboBox=dijit.byNode(this.customPageSizeNode.childNodes[0]);
		defaultValue&&this._comboBox.setValue(defaultValue);
		this.connect(this._comboBox,"onChange",function() {
			var value = this._comboBox.getValue();
			if(!value){return;}
			this._setPageSize(value);
		});
	},
	
	getComboBox: function() {
		return this._comboBox;
	},
	
	//触发onChange事件
	_setPageSize: function(pageSize) {
		this.grid.getManager('PagingManager').clearPageData();
		var store=this.grid.getBinding().getDataStore();
		store.getRowSet().reset();
		store.setPageSize(pageSize);
		this.grid.getManager('PagingManager').setPageNumber(1);
		
	},
	
	//------------------------------------个性化-----------------------------------
    
    //配置个性化相关信息
    _configIndividual: function() {
    	//toolbar上配置individual后，可以在grid上不配置menu
    	if(!this.grid.filter && !this.grid.menu && !this.grid.individual){
	    	dojo.require("unieap.xgrid.manager.MenuManager");
			this.grid['MenuManager'] = new unieap.xgrid.manager.MenuManager({grid:this.grid});
			this.grid.managers.push("MenuManager");
    	}
    	
		dojo.require("unieap.xgrid.manager.Individual");
		this.grid['IndividualManager'] = new unieap.xgrid.manager.Individual({grid:this.grid});
		this.grid.managers.push("IndividualManager");
		this._createIndividualNode();
    },
    
    _createIndividualNode: function(){
        var manager = this.grid.getManager("IndividualManager");
        if (!manager) {
            return;
        }
        dojo.require('unieap.menu.Menu');
        dojo.require('unieap.form.DropDownButton');
        var individualNode = this.individualNode, menu, button;
        menu = new unieap.menu.Menu();
		//设置
        menu.addChild(new unieap.menu.MenuItem({
            label: RIA_I18N.xgrid.individual.save,
            iconClass: "individual",
            onClick: dojo.hitch(manager, "saveIndividual")
        }));
		//重置
        menu.addChild(new unieap.menu.MenuItem({
            label: RIA_I18N.xgrid.individual.reset,
            iconClass: "individual-reset",
            onClick: dojo.hitch(manager, "resetIndividual")
        }));
		//个性化
        button = new unieap.form.DropDownButton({
            title: RIA_I18N.grid.toolbar.individual,
            dropDown: menu,
			width:'38px',
			iconClass:'default-individual',
            onClick: dojo.hitch(manager, "saveIndividual")
        }).placeAt(individualNode);
		if (!this._destroyWidgets) {
			this._destroyWidgets = [];
		}
		this._destroyWidgets.push(menu);
		this._destroyWidgets.push(button);
    },
	
    //------------------------------------导出-----------------------------------
    
    //配置导出相关信息
    _configExport: function() {
        this._createExportNode();
		if (!this.grid['ExportManager']) {
            var exportParams = this['export'] || {};
			dojo.require("unieap.xgrid.manager.ExportManager");
			this.grid['ExportManager'] = new unieap.xgrid.manager.ExportManager(dojo.mixin(exportParams,{grid:this.grid}));
			this.grid.managers.push("ExportManager");
        }
    },
    
    _createExportNode: function(){
        dojo.require('unieap.menu.Menu');
        dojo.require('unieap.form.DropDownButton');
        var exportNode = this.exportNode, menu, ddbutton,
			options = this['export']['options'] || ['server','client','checked'],
			type = this['export']['defaultType'] || 'server',
			menu = new unieap.menu.Menu();
	
		options && dojo.isArray(options) && dojo.forEach(options,function(option){
			if (option=='server') {
				menu.addChild(new unieap.menu.MenuItem({
					//服务端导出
					label: RIA_I18N.grid['export'].serverExport,
					iconClass: "export-s",
					onClick: dojo.hitch(this, this.doServerExport)
				}));
			} else if(option=='client') {
		        menu.addChild(new unieap.menu.MenuItem({
			        //客户端导出
		            label: RIA_I18N.grid['export'].clientExport,
		            iconClass: "export-c",
		            onClick: dojo.hitch(this, this.doClientExport)
		        }));
			} else if(option=='checked') {
				menu.addChild(new unieap.menu.MenuItem({
				    //导出选中记录
					label: RIA_I18N.grid['export'].selectedExport,
					iconClass: 'export-checked',
					onClick: dojo.hitch(this, this.exportSelectedData)
				}));
			}
		}, this);
        
        ddbutton = new unieap.form.DropDownButton({
        	id: this.grid.id + "_unieapGridExportButton",
            dropDown: menu,
			width:'38px'
        }).placeAt(exportNode);
        if (type == 'client') {
            ddbutton.setIconClass('default-export-c');
			this.connect(ddbutton,'onClick','doClientExport');
        } else if(type=='checked') {
			ddbutton.setIconClass('default-export-checked');
			this.connect(ddbutton,'onClick','exportSelectedData');
        }else if(type=='server') {
			ddbutton.setIconClass('default-export-s');
			this.connect(ddbutton,'onClick','doServerExport');
		}
		if(!this._destroyWidgets) {
			this._destroyWidgets = [];
		}
		this._destroyWidgets.push(menu);
		this._destroyWidgets.push(ddbutton);
    },

    doServerExport: function(){
		this.grid['ExportManager'].doServerExport();
    },

    doClientExport: function(){
		this.grid['ExportManager'].doClientExport();
    },

	exportSelectedData:function(){
		this.grid['ExportManager'].exportSelectedData();
	}
	
});