dojo.provide('unieap.grid.manager.managers');

dojo.declare("unieap.grid.managers", null, {
	
	params: null,
	managers: null,
	userManagers: null,
	
	lazyManagers:{
		'PrintManager':{},
		'ExportManager':{},
		'PagingManager':{},
		'FilterManager':{},
		'SelectionManager':{selectType: "none"},
		'EditManager':{editType: "readonly"}
	},
	
	constructor: function(inGrid) {
		this.grid = inGrid;
		this.params = {};
		this.managers = {};
		this.userManagers = {};
		this.params["LayoutManager"] = inGrid.layout || {};
		this.params["ViewManager"] = inGrid.views || {};
		this.params["RowManager"] = inGrid.rows || {};
		this.params["MenuManager"] = inGrid.menu||{};
		this._updateMenuParams(this.params["MenuManager"]);
		this.params["SelectionManager"] = inGrid.selection;
		this.params["EditManager"] = inGrid.edit;
		this.params["GroupManager"] = inGrid.group;
		this.params["TreeManager"] = inGrid.tree;
		this.params["XTreeManager"] = inGrid.xtree;
		this.params["UnitedCellManager"] = inGrid.unitedCell;
		this.params["DetailManager"] = inGrid.detail;
	},
	
	//更新MenuManager中的controlsNameList变量
	_updateMenuParams:function(menuParams){
		var list={};
		this.grid.filter&&(list['unieap.grid.menu.filter']=this.grid.filter);
		dojo.mixin(menuParams,{controlsNameList:list})
	},
	
	_loadManager: function(manager) {
		if (this.userManagers[manager] || !this.get(manager)) return;
		var real = this.get(manager);
		var m = {};
		for(var member in real.ui) {
			if (dojo.isFunction(real[member])) {
				m[member] = dojo.hitch(real, real[member]);
			} else if(member=="events") {
				for (e in real.ui[member]) {
					m[e] = function() {
						//event function
					};
					dojo.connect(real, e, m, e);
				}
			} else {
				m[member] = real[member];
			}
		}
		m.funnelEvent = function(/*string*/event, /*function*/func) {
			real[event] = func;
		}
		this.userManagers[manager] = m;
	},
	
	//重新加载用户控制器，在内部控制器打补丁之后使用。
	reloadManager: function(manager) {
		if (!this.get(manager)) return;
		var real = this.get(manager);
		var m = {};
		for (member in real.ui) {
			if (dojo.isFunction(real[member])) {
				m[member] = dojo.hitch(real, real[member]);
			} else if(member=="events") {
				for (e in real.ui[member]) {
					m[e] = function() {
						//event function
					};
					dojo.connect(real, e, m, e);
				}
			} else {
				m[member] = real[member];
			}
		}
		dojo.mixin(this.userManagers[manager], m);
	},
	
	init: function() {
		for (manager in this.params) {
			if (this.params[manager]) {
				this.get(manager);
			}
		}
	},
	
	//internal function, to get grid private manager
	get: function(manager) {
		if (!this.managers[manager]) {
			var params = this.params[manager];
			if (!params) {
				if(this.lazyManagers[manager]) {
					params=this.lazyManagers[manager]||{};
				}else{
					return null;
				}
			}
			params = dojo.mixin({grid: this.grid}, params);
			
			var declaredClass = "unieap.grid.manager." + manager;
			dojo.require(declaredClass);
			var clazz = dojo.getObject(declaredClass);
			this.managers[manager] = new clazz(params);
			delete this.params[manager];
		}
		return this.managers[manager];
	},
	
	getManager: function(manager) {
		this._loadManager(manager);
		return this.userManagers[manager];
	},
	
	destroy: function(){
		var managers = this.managers;
		for (var name in managers) {
			managers[name] && managers[name].destroy && managers[name].destroy();
		}
	},
	addPlus:function(manager,key,plus){
		if(!manager.plus){
			manager.plus={}
		}
		if(!manager.plus[key]){
			manager.plus[key]=[];
		}
		manager.plus[key].push(plus);
	},
	getPlus:function(manager,key){
		if(manager&&manager.plus&&manager.plus[key]){
			return manager.plus[key];
		}
		return null
	}
});

//@ sourceURL=/tp_fp/techcomp/ria/dojo/../unieap/grid/manager/managers.js