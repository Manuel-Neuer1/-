dojo.provide("unieap.tree.Tree");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dojo.fx");
dojo.declare("unieap.tree.TreeNodeUI",[dijit._Widget, dijit._Templated],{
	/**
	 * @declaredClass:
	 * 		unieap.tree.TreeNodeUI
	 * @summary:
	 * 		树节点UI部分对应的类
	 * @classDescription:
	 *     只包含模板并不包含其他的属性和方法，在树的生成过程中只实例化一次，剩下的节点通过clone得到各个节点的domNode部分
	 */
	
	templateString: "<div class=\"dijitTreeNode\"  isTreeNode = \"true\">" +
                                       "<div class=\"treeRenderNode\" dojoAttachPoint=\"contentNode,renderNode\">" +
                                            "<table cellspacing=\"0\" cellpadding=\"0\" dojoAttachPoint=\"showingNode\">" +
                                                "<tr><td width=16>" +
                                                         "<div dojoAttachPoint=\"expandoNode\" class=\"dijitTreeExpando\">&nbsp;</div>" +
                                                  "</td><td>" +
                                                         "<div dojoattachpoint=\"checkboxNode\"  class=\"dijitReset dijitInline dijitCheckBox  \"><input valuenow=\"on\" value=\"on\" pressed=\"true\" style=\"-moz-user-select: none;\" tabindex=\"0\" class=\"dijitReset dijitCheckBoxInput\" dojoattachpoint=\"inputNode\" type=\"checkbox\"></div>" +
                                                  "</td><td width=16>" +
                                                           "<div dojoAttachPoint=\"iconNode\" class=\"dijitInline dijitTreeIcon\" ></div>" +
                                                 "</td><td>" +
                                                         "<div hideFocus=\"true\" dojoAttachPoint=\"labelNode\" class=\"dijitTreeLabel \"  tabindex=\"-1\"></div>" +
                                                 "</td></tr>" +
                                             "</table>" +
                                       "</div>" +
                                       "<div dojoAttachPoint=\"containerNode\" class=\"dijitTreeContainer\"  style=\"display:none;overflow:visible\"></div>" +
                                   "</div>"
});

dojo.declare("unieap.tree.TreeNode", null, {
     /**
	 * @declaredClass:
	 * 		unieap.tree.TreeNode
	 * @summary:
	 * 		树节点对应的类，调用树的getNodeById等检索方法会生成一个该类的实例
	 * @classDescription:
	 *      支持根据本节点得到相关联节点的方法
	 *      支持设置节点对应数据的选中状态
	 *      支持得到节点相关的数据和状态
	 *      每个树节点都会对应于一个数据结构对象item，记录了该节点的数据和相关信息，不同结构的数据格式会有不同的内容。
	 *      对应于RowSet数据格式的树，item包含的主要内容为data、rs、children、loaded、domNode等分别表示该节点对应的原始数据、数据所在的RowSet、子节点的结构、该节点的子节点数据是否已经加载以及该节点对应的domNode。
	 *      对应于Json数据格式的树，item包含的主要内容为data、children、loaded、domNode等分别表示该节点对应的原始数据、子节点的结构、该节点的子节点数据是否已经加载以及该节点对应的domNode。
	 *      除此以外，还会将数据是否被选中的情况存于item中，树节点可以调用getItem方法得到其对应的item对象。
	 */
	 
	//本节点所在的树
    tree: null,
   
   //节点的数据对象
    item: null,
	
	//节点是否是只读，若是复选树则此节点不能进行复选，不能进行节点的编辑
	readOnly : false,
	
	//节点是否是不可用，此时节点屏蔽对事件的监听
	disabled : false,
	
	//节点对应的domNode
	domNode : null, 
   
   //构造函数，初始化相关参数
	constructor: function(params){
		dojo.mixin(this, params);
		if(this.domNode&&this.domNode.associatedData.readOnly==true){
			this.readOnly = true;
		}
		if(this.domNode&&this.domNode.associatedData.disabled==true){
			this.disabled = true;
		}
	},
	
	
	/**
	 * @summary:
	 * 		获得当前节点的第一个子节点，如果节点尚未展开过或者没有子节点将会返回null
	 * @return :
	 * 		{TreeNode|null}
	 * @example:
	 * |var node = unieap.byId("basicTree").getCurrentNode(); 
	 * |var firstChild = node.getFirstChild(); 
	 * |alert("第一个子节点的label为:"+firstChild.getLabel());
	 * @img:
	 *      images/tree/getFirstChild.png
	 */	
    getFirstChild : function(){
		if(this.tree.getChildrenByDom(this.domNode).length > 0){
			return this.tree._createTreeNode({
				   item:this.tree.getChildrenByDom(this.domNode)[0].associatedData.item,
				  domNode : this.tree.getChildrenByDom(this.domNode)[0],
				  tree:this.tree
			})
		}else{
			return null;
		}
    },
	
	/**
	 * @summary:
	 * 		获得当前节点的同级下一节点，若不存在同级下一节点，将会返回null
	 * @return :
	 * 		{TreeNode|null}
	 * @example:
	 * |var node = unieap.byId("basicTree").getCurrentNode(); 
	 * |var nextNode = node.getNextChild(); 
	 * |alert("下一个兄弟节点的label为："+nextNode.getLabel()); 
	 * @img:
	 *      images/tree/getNextChild.png
	 */
    getNextChild: function(){
        var node =   this.tree.getNextChildByDom(this.domNode);
		if(node){
			return this.tree._createTreeNode({
				   item:node.associatedData.item,
				  domNode : node,
				  tree:this.tree
			});
		}else{
			return null;
		}
    },
    
	/**
	 * @summary:
	 * 		获得当前节点的同级前一节点，若不存在同级前一节点，将会返回null
	 * @return :
	 * 		{TreeNode|null}
	 * @example:
	 * |var node = unieap.byId("basicTree").getCurrentNode(); 
	 * |var previousNode = node.getPreviousChild(); 
	 * |alert("前一个兄弟节点的label为："+previousNode.getLabel()); 
	 * @img:
	 *      images/tree/getPreviousChild.png
	 */
    getPreviousChild: function(){
       var node = this.tree.getPreviousChildByDom(this.domNode);
		if(node){
			return this.tree._createTreeNode({
				   item:node.associatedData.item,
				  domNode : node,
				  tree:this.tree
			});
		}else{
			return null;
		}
    },
	
	/**
	 * @summary:
	 * 		获得当前节点的父节点，若已经是根节点将会返回null
	 * @return :
	 * 		{TreeNode|null}
	 * @example:
	 * |var childNode = unieap.byId("basicTree").getCurrentNode(); 
	 * |var parentNode =childNode.getParent(); 
	 * |alert("父节点的label为："+parentNode.getLabel()); 
	 * @img:
	 *      images/tree/getParent.png
	 */
	getParent : function(){
		 var node =  this.tree.getParentByDom(this.domNode);
		 if(node){
			return this.tree._createTreeNode({
				   item:node.associatedData.item,
				  domNode : node,
				  tree:this.tree
			});
		}else{
			return null;
		}
	},
	
	/**
	 * @summary:
	 * 		获得当前节点的所有直接子节点，返回值为一个TreeNode组成的数组或null，若某节点的子节点数量比较多，并不建议使用该方法，因为此时会创建大量的unieap.tree.TreeNode，建议使用getFirstChild、getNextChild等方法遍历某节点的所有子节点。
	 * @return :
	 * 		{array|null}
	 * @example:
	 * |//getNodeById()是tree对象的方法:根据数据结构中id字段的值，得到对应的TreeNode对象.
	 * |var parentNode = unieap.byId("basicTree").getNodeById("1"); 
	 * |var childNodes = parentNode.getChildren(); 
	 * |unieap.debug(childNodes); 
	 * @img:
	 *      images/tree/getChildren.png
	 */
	getChildren : function(){
		var childrenDoms = this.tree.getChildrenByDom(this.domNode);
		 if(childrenDoms.length > 0){
		 	var nodes=[];
			for(var i=0;i<childrenDoms.length;i++){
				var node = this.tree._createTreeNode({
				   item:this.tree.getChildrenByDom(this.domNode)[i].associatedData.item,
				  domNode : this.tree.getChildrenByDom(this.domNode)[i],
				  tree:this.tree
			    });
				nodes.push(node);
			}
			return nodes;
		}else{
			return null;
		}
	},
	
	/**
	 * @summary:
	 * 		获得当前节点在父节点的位置，从0开始计数
	 * @return :
	 * 		{number}
	 * @example:
	 * |var treeNode = unieap.byId("basicTree").getCurrentNode(); 
	 * |alert(treeNode.getPosition());
	 */
    getPosition: function(){
        var parent = this.tree.getParentByDom(this.domNode);
        var position = 0;
        if (parent) {
            var childs = this.tree.getChildrenByDom(parent);
            for (var i = 0; i < childs.length; i++) {
                if (childs[i] == this.domNode) {
                    position = i;
                    break;
                }
            }
        }
        return position;
    },
    
	/**
	 * @summary:
	 * 		获得当前节点数据，即为原始的数据，为一个简单的对象
	 * @return :
	 * 		{object}
	 * @example:
	 * |var node = unieap.byId("basicTree").getCurrentNode(); 
	 * |var data = node.getData(); 
	 * |unieap.debug(data);
	 * @img:
	 *      images/tree/getData.png
	 */
    getData: function(){
        return this.item.data;
    },
    
	/**
	 * @summary:
	 * 		在树支持复选的情况下，设置当前节点的选中状态，并根据配置的复选逻辑，设置关联节点的状态
	 * @param:  
	 * 		{boolean}checked
	 * @param:
	 * 		{boolean}withLogic
	 * @example:
	 * |var treeNode = unieap.byId("basicTree").getCurrentNode(); 
	 * |if(treeNode.isChecked()){ 
	 * |	treeNode.setChecked(false); //取消选中 
	 * |}else{ 
	 * |	treeNode.setChecked(true); //选中 
	 * |} 
	 */
    setChecked: function(checked,withLogic){
	   if(this.readOnly||this.disabled)
            return;
       this.tree.setChecked(this,checked,withLogic);
    },
    
   /**
	 * @summary:
	 * 		设置节点是否为只读，只读状态下，不支持编辑和复选，但支持事件触发。
	 * @param :  
	 * 		{boolean}readOnly
	 * @example:
	 * |var treeNode = unieap.byId("basicTree").getCurrentNode(); 
	 * |if(treeNode.getLabel()=="数据结构"){ 
	 * |	treeNode.setReadOnly(true);//将显示值为“数据结构”的节点设为只读
	 * |} 
	 */
    setReadOnly: function(readOnly){
        this.readOnly = readOnly;
		this.domNode.associatedData.readOnly = readOnly;
		this.tree.getCheckboxInputNode(this.domNode).disabled = readOnly;
	    if(readOnly){
			dojo.addClass(this.tree.getLabelNode(this.domNode),'treeLabelReadOnly');
			if(this.isChecked()){
				dojo.addClass(this.tree.getCheckboxNode(this.domNode),'dijitCheckBoxCheckedDisabled');
			}else{
				dojo.addClass(this.tree.getCheckboxNode(this.domNode),'treeCheckBoxReadOnly');
			}
		}else{
			dojo.removeClass(this.tree.getLabelNode(this.domNode),'treeLabelReadOnly');
			if(this.isChecked()){
				dojo.removeClass(this.tree.getCheckboxNode(this.domNode),'dijitCheckBoxCheckedDisabled');
			}else{
				dojo.removeClass(this.tree.getCheckboxNode(this.domNode),'treeCheckBoxReadOnly');
			}
		}
    },
    
	  /**
	 * @summary:
	 * 		设置节点是否为不可用，在不可用状态下，取消对事件的监听
	 * @param :  
	 * 		{boolean}disabled
	 * @example:
	 * |var treeNode = unieap.byId("basicTree").getCurrentNode(); 
	 * |if(treeNode.getLabel()=="数据结构"){ 
	 * |	treeNode.setDisabled(true);//将显示值为“数据结构”的节点设为不可用
	 * |} 
	 */
    setDisabled: function(disabled){
       this.disabled = disabled;
	   this.domNode.associatedData.disabled = disabled;
	   this.tree.getCheckboxInputNode(this.domNode).disabled = disabled;
	   if(disabled){
			dojo.addClass(this.tree.getLabelNode(this.domNode),'treeLabelDisabled');
			if(this.isChecked()){
				dojo.addClass(this.tree.getCheckboxNode(this.domNode),'dijitCheckBoxCheckedDisabled');
			}else{
				dojo.addClass(this.tree.getCheckboxNode(this.domNode),'treeCheckBoxReadOnly');
			}
		}else{
			dojo.removeClass(this.tree.getLabelNode(this.domNode),'treeLabelDisabled');
			if(this.isChecked()){
				dojo.removeClass(this.tree.getCheckboxNode(this.domNode),'dijitCheckBoxCheckedDisabled');
			}else{
				dojo.removeClass(this.tree.getCheckboxNode(this.domNode),'treeCheckBoxReadOnly');
			}
		}
		this.tree.getBinding().setDisabled(this,disabled);
    },
	
	/**
	 * @summary:
	 * 		判断节点是否为只读状态
	 * @return :  
	 * 		{boolean}
	 * @example:
	 * |var treeNode = unieap.byId("basicTree").getCurrentNode(); 
	 * |if(treeNode.isReadOnly()){ 
	 * |	alert("该节点只读！"); 
	 * |}else{ 
	 * |	alert("该节点非只读！"); 
	 * |}
	 */
    isReadOnly : function(){
		return this.readOnly;
	},
	
	/**
	 * @summary:
	 * 		判断节点是否为不可用状态
	 * @return :  
	 * 		{boolean}
	 * @example:
	 * |var treeNode = unieap.byId("basicTree").getCurrentNode(); 
	 * |if(treeNode.isDisabled()){ 
	 * |	alert("该节点不可用！"); 
	 * |}else{ 
	 * |	alert("该节点可用！"); 
	 * |}
	 */
	isDisabled : function(){
		return this.disabled;
	},
	
     /**
	 * @summary:
	 * 		判断节点是否选中
	 * @return :  
	 * 		{boolean}
	 * @example:
	 * |var treeNode = unieap.byId("basicTree").getCurrentNode(); 
	 * |if(treeNode.isChecked()){ 
	 * |	alert("已经被选中了！"); 
	 * |}else{ 
	 * |	alert("还没有被选中！"); 
	 * |} 
	 */
	isChecked : function(){
		return this.tree.getBinding().isSelected(this.item);
	},
    
	/**
	 * @summary:
	 * 		判断节点是否是叶子节点
	 * @return :
	 * 		{boolean}
	 * @example:
	 * |var treeNode = unieap.byId("basicTree").getCurrentNode(); 
	 * |if(treeNode.isLeaf()){ 
	 * |	alert("该节点是叶子节点！"); 
	 * |}else{ 
	 * |	alert("该节点是非叶子节点！"); 
	 * |}
	 */
    isLeaf: function(){
        return this.tree.getBinding().isLeaf(this.item);
    },
    
	/**
	 * @summary:
	 * 		判断节点是否是根节点
	 * @return :
	 * 		{boolean}
	 * @example:
	 * |var treeNode = unieap.byId("basicTree").getCurrentNode(); 
	 * |if(treeNode.isRoot()){ 
	 * |	alert("该节点是根节点！"); 
	 * |}else{ 
	 * |	alert("该节点不是根节点！"); 
	 * |} 
	 */
	isRoot : function(){
		return this.domNode.associatedData.isRoot;
	},
	
	/**
	 * @summary:
	 * 		判断节点是否处于已展开状态
	 * @return :
	 * 		{boolean}
	 * @example:
	 * |var treeNode = unieap.byId("basicTree").getCurrentNode(); 
	 * |if(treeNode.isOpend()){ 
	 * |	alert("该节点已被展开！"); 
	 * |}else{ 
	 * |	alert("该节点未被展开！"); 
	 * |}
	 */
	isOpend : function(){
		return this.domNode.associatedData.isExpanded;
	},
    
     /**
	 * @summary:
	 * 		得到节点对应的数据对象，为包含原始数据、子节点数据、关联domNode等信息的对象
	 * @return :
	 * 		{object}
	 * @example:
	 * |var node = unieap.byId("basicTree").getCurrentNode(); 
	 * |unieap.debug(node.getItem()); 
	 * @img:
	 *      images/tree/getItem.png
	 */
	getItem : function(){
		return this.item;
	},

   /**
	 * @summary:
	 * 		得到节点的层级，根节点为零，随着结构深入依次增加
	 * @return :
	 * 		{number}
	 * @example:
	 * |var treeNode = unieap.byId("basicTree").getCurrentNode();
	 * |alert(treeNode.getLevel());
	 */
	getLevel : function(){
		return this.domNode.associatedData.level;
	},
	
	/**
	 * @summary:
	 * 		得到节点所在的树
	 * @return :
	 * 		{unieap.tree.Tree}
	 * @example:
	 * |var node = unieap.byId("basicTree").getCurrentNode();
	 * |alert(node.getTree().id);
	 */
	getTree : function(){
		return this.domNode.associatedData.tree;
	},
	
    /**
	 * @summary:
	 * 		得到节点的显示值
	 * @return :
	 * 		{string}
	 * @example:
	 * |var node = unieap.byId("basicTree").getCurrentNode(); 
	 * |var label = node.getLabel(); 
	 */
	getLabel : function(){
		return this.domNode.associatedData.label;
	},
	
	/**
	 * @summary:
	 * 		得到节点的对应的Dom对象
	 * @return:
	 * 		{domNode}
	 * @example:
	 * |var node = unieap.byId("basicTree").getCurrentNode(); 
	 * |var domNode = node.getDomNode(); 
	 * |alert(domNode.outerHTML); 
	 * @img:
	 *      images/tree/getDomNode.png
	 */
	getDomNode : function(){
		return this.domNode;
	},
	
	//删除当前节点及其关联节点，用于树删除节点的方法，不供用户使用
	destroyRelatedNode : function(){
		this.destroyChildren(this.domNode);
	},
	
	//递归调用函数，删除所有子节点
	destroyChildren : function(domNode){
		//若要删除的节点是当前节点，为避免错误，先将其引用置空
		if(this.tree.lastFocused == domNode)
		     this.tree.lastFocused  = null;
		var item = domNode.associatedData.item;
		var childDoms = this.tree.getChildrenByDom(domNode);
		//递归所有子节点
		if(childDoms){
			for(var i=0;i<childDoms.length;i++){
				this.destroyChildren(childDoms[i]);
			}
		}
		//为了彻底删除节点，防止内存泄露，将domNode上绑定的相关信息删除
		dojo.removeAttr(domNode, "associatedData");
		delete item.domNode;
		//在nodeMap中节点移除
		delete this.tree._nodeMap[this.tree.getBinding().getId(item)];
		//销毁domNode
		dojo.destroy(domNode);
	},
	
	/**
	 * @summary：
	 *       刷新该节点，子节点重新生成并绑定数据，若数据发生了变化，可以调用此方法刷新节点
	 * @example:
	 * |function refresh(){
	 * |	//在树绑定的RowSet中新增两条记录 
	 * |	treeStorePart.getRowSet().addRow({id:(new Date()),label:"新增节点1","parentID": "1",leaf:true}); 
	 * |	treeStorePart.getRowSet().addRow({id:(new Date()),label:"新增节点2","parentID": "1",leaf:true}); 
	 * |	//刷新节点 
	 * |	unieap.byId("basicTree").getNodeById("1").refresh(); 
	 * |}
	 *   树对应的Rowset添加两条数据，并刷新节点，将会重新构建该节点的子节点。
	 * @img:
	 *      images/tree/refreshTreeNode1.png 
	 * @img:
	 *      images/tree/refreshTreeNode2.png   
	 */
	refresh : function(){
		var childrenDomNode = this.getTree().getChildrenByDom(this.domNode);
		if(childrenDomNode&&childrenDomNode.length>0){
			for(var i=0;i<childrenDomNode.length;i++){
				this.destroyChildren(childrenDomNode[i]);
			}
		}
		
		this.domNode.associatedData.state = "UNCHECKED";
		this.domNode.associatedData.isExpanded = false;
		
//		this.getItem().loaded = false;
//		this.getItem()[this.tree.getBinding().children] = [];
		this.tree.getBinding().refresh(this.getItem());
		this.tree.expandNode(this);
	}
});

dojo.declare("unieap.tree.Tree", [dijit._Widget, dijit._Templated], {
	/**
	 * @declaredClass:
	 * 		unieap.tree.Tree
	 * @summary:
	 *      树组件
	 * @classDescription:
	 *    主要功能包括：
	 * 	   1.支持根据RowSet行集结构构造树结构，同时支持原生的jsontree结构（目前只支持只读功能）。
	 *     2.可以实现复选、拖拽、编辑等功能。
	 *     3.支持懒加载数据。
	 *     4.支持对节点进行增删操作。
	 *     5.支持对节点重新设置数据源。
	 *     6.支持键盘导航功能，具体为:点击上下键将选中当前节点的上一个或下一个可见节点；点击Home键选中第一个可见节点，点击End键选中最后一个可见节点；点击右键将会展开当前节点，或者选中当前节点的第一个子节点；点击左键将会收起当前节点，或者选中当前节点的父节点。
	 *     7.支持根据路径、层级等展开节点。
	 * @example:
     * |<div dojoType="unieap.tree.Tree" id="basicTree" label="UniEAP" 
	 * |	binding = "{'store':treeStorePart,'parent':'parentID',query:{name:'parentID',relation:'=',value:''}}">
	 * |</div>
	 * @example:
	 * |var tree = new unieap.tree.Tree({
	 * |	id="basicTree"
	 * |	label:"UniEAP",
	 * |	binding:{'store':treeStore,'parent':'parentID',query:{name:'parentID',relation:'=',value:''}}
	 * |});
	 * |dojo.place(tree.domNode, dojo.byId('treeWidget'), 'first')
     * @img:
	 *      images/tree/tree.png
	 */
	
	//配置属性接口
	UserInterfaces : {
		checkLogic : "object",
		binding : "object",
		treeEditor : "object",
		treeDnd : "object",
		label : "string",
		expandRoot : "boolean",
		loader : "object",
		pathSeparator : "string",
		animate : "boolean",
		securityId : "string",
		id : "string",
		jsId : "string",
		"class" : "string",
		style : "string",
		getIconClass : "function",
		getLabelClass : "function",
		getIconStyle : "function",
		getLabelStyle : "function",
		onBeforeClick : "function",
		onClick : "function",
		onAfterClick : "function",
		onSetNodeClass : "function",
		onMouseOver : "function",
		onMouseOut : "function",
		onMouseDown : "function",
		onDblClick : "function",
		onContextMenu : "function",
		onBeforeCollapse : "function",
		onAfterCollapse : "function",
		onBeforeExpand : "function",
		onAfterExpand : "function",
		onBeforeSelectAll : "function",
		onAfterSelectAll : "function",
		onBeforeSetCurrentNode : "function",
		onAfterSetCurrentNode : "function",
		onEnterKeyPress : "function",
		onAfterNodeRender : "function",
		expandByOnClickLabel:"boolean"
	},
	
    /**
	 * @summary:
	 * 		设置树加载子节点所使用的类名，用户一般只需使用默认值就可以
	 * @type:
	 * 		{string}
	 * @default:
	 *      unieap.tree.TreeLoader
	 */
    treeLoaderClass: "unieap.tree.TreeLoader",
	
	  /**
	 * @summary:
	 * 		设置树的复选逻辑所使用的类名，用户一般只需使用默认值就可以
	 * @type:
	 * 		{string}
	 * @default:
	 *     unieap.tree.CheckLogic
	 */
	checkLogicClass : "unieap.tree.CheckLogic",
	
    /**
	 * @summary:
	 * 		设置树的拖拽所使用的类名，用户一般只需使用默认值就可以
	 * @type:
	 * 		{string}
	 * @default:
	 *     unieap.tree.DndSource
	 */
	dndSourceClass : "unieap.tree.DndSource",
	
	
    /**
	 * @summary:
	 * 		设置树的编辑所使用的类名，用户一般只需使用默认值就可以
	 * @type:
	 * 		{string}
	 * @default:
	 *      unieap.tree.TreeEditor
	 */
	treeEditorClass : "unieap.tree.TreeEditor",
	
    /**
	 * @summary:
	 * 		设置树的复选信息,有六种复选逻辑
	 * @type:
	 * 		{object}
	 * @see:
	 *      unieap.tree.CheckLogic
	 * @example:
	 *  |<div dojoType="unieap.tree.Tree"  
	 *  |	checkLogic="{model:'childCascade'}" id="childCascadeTree" 
	 *  |	label="UniEAP" 
	 *  |	binding = "{'leaf':'leaf','store':treeStorePart,'label':'label','parent':'parentID',
	 *  |		query:{name:'parentID',relation:'=',value:'1212403325756'}}">
	 *  |</div>
	 */
	checkLogic : null,
	
    /**
	 * @summary:
	 * 		设置树的数据绑定信息，支持RowSet和原生的jsontree，建议使用datastore中RowSet的绑定形式
	 * @type:
	 * 		{object}
	 * @see:
	 *      unieap.tree.RowSetTreeBinding
	 * @see:
	 *      unieap.tree.JsonTreeBinding
	 */
    binding: null,
	
	 /**
	 * @summary:
	 * 		设置树的编辑信息，若不进行设置，默认是不支持编辑
	 * @type:
	 * 		{object}
	 * @see:
	 *       unieap.tree.TreeEditor
	 * @example
	 *  |<div dojoType="unieap.tree.Tree" id="persistTree"  
	 *  |	treeEditor="{allowBlank:false}"  label="UniEAP" 
	 *  |	binding = "{id:'UP_TREE_TEST_ID','store':'treeStore','label':'UP_TREE_TEST_LABEL',
	 *  |		'parent':'UP_TREE_TEST_PARENTID',
	 *  |		query:{name:'UP_TREE_TEST_PARENTID',relation:'=',value:''}}" >
	 *	|</div>
	 */
	treeEditor : null,
	
	//自动注入dataCenter
	Autowired : "dataCenter",
	
	/**
	 * @summary:
	 * 		设置树的拖拽信息，目前树支持对非懒加载且数据格式为RowSet的树进行拖拽
	 * @type:
	 * 		{object}
	 * @see:
	 *     unieap.tree.DndSource
	 * @example:
	 * |<div dojoType="unieap.tree.Tree" 
	 * |	${1}treeDnd="{}"  label="UniEAP" 
	 * |	binding = "{'leaf':'leaf','store':treeStorePart,'label':'label',
	 * |		'parent':'parentID', query:{name:'parentID',relation:'=',value:''} }">
	 * |</div>
	 * ${1}设置树的拖拽属性
	 */
	treeDnd : null,
    
   /**
	 * @summary：
	 * 		根结点的显示值，若不配置该属性将不会显示根节点
	 * @type：
	 * 		 {string} 
	 * @default：
	 * 		""
	 * @example:
	 * |<div dojoType="unieap.tree.Tree" 
	 * |	id="basicTree" 
	 * |	animate="false"  ${1}label="UniEAP" 
	 * |	binding = "{'leaf':'leaf','store':treeStorePart,'parent':'parentID',
	 * |		query:{name:'parentID',relation:'=',value:''} }">
	 * |</div>
	 *    ${1}设置根节点的显示值为"UniEAP"
	 * @img:
	 *      images/tree/rootNode.png
	 */
    label: "",
    
	  /**
	 * @summary：
	 * 		是否展开根结点，expandRoot属性设置为false时必须设置label属性
	 * @type：
	 * 		 {boolean} 
	 * @default：
	 * 		true
	 * @example:
	 * |<div dojoType="unieap.tree.Tree" 
	 * |	id="basicTree"  label="UniEAP" 
	 * |	animate="false" ${1}expandRoot="false" 
	 * |	binding = "{'leaf':'leaf','store':treeStorePart,
	 * |		'parent':'parentID',query:{name:'parentID',relation:'=',value:''}}"> 
	 * |</div>
	 * ${1}设置树的根节点初始不展开
	 *  @img:
	 *      images/tree/expandRoot.png
	 */
    expandRoot: true,
    
	 /**
	 * @summary：
	 * 		在树的数据是懒加载的情况下，设置懒加载树的请求配置
	 * @type：
	 * 		{object}
	 * @default：
	 * 		null 
	 * @see:
	 *       unieap.tree.TreeLoader
	 * @example：
	 * |<div dojoType="unieap.tree.Tree" id="lazyTree" label="UniEAP" 
	 * |	${1}loader="{'url':'getLazyData.do?method=getData',onBeforeLoad : beforeLoad}" 
	 * |	binding = "{'leaf':'leaf','store':treeStoreForLazyLoad,
	 * |		'parent':'parentID',query:{name:'parentID',relation:'=',value:''}}">
	 * |</div>	
	 * ${1}设置树加载数据的信息
	 */
    loader: null,
	
	/**
	 * @summary：
	 * 		得到节点路径时的分隔符
	 * @type：
	 * 		 {string} 
	 * @default：
	 * 		"/"
	 */
	pathSeparator : "/",
	
	/**
	 * @summary:
	 * 		是否启用动画效果,默认配置是global中unieap.animate的值
	 * @type:
	 * 		{boolean}
	 * @default:
	 * 		读取unieap.animate的值
	 */
	animate : (typeof(unieap.animate) == 'undefined')?true:unieap.animate,
	
	/**
	 * @summary:
	 * 		是否启用单击节点展开树,默认配置是global中unieap.showByOnClick的值
	 * @type:
	 * 		{boolean}
	 * @default:
	 * 		读取unieap.showByOnClick的值
	 */
	expandByOnClickLabel : (typeof(unieap.widget.tree) != 'undefined' && typeof(unieap.widget.tree.expandByOnClickLabel) != 'undefined')?unieap.widget.tree.expandByOnClickLabel:true,
	
     /**
	  *@summary:
	  *   权限id
	  * @type:
	  *   {string}
     */
	securityId:'',
	
	//保存树的每个domNode节点的对象，键是节点的id，值是对应的domNode，所以需要保证树所有节点的id唯一
	_nodeMap : null,
	
	//标示节点是否处于编辑状态
	_editing : false,
	
	//树全局保持的一个节点对象，用户在监听事件时会得到该对象，当调用方法其他方法得到TreeNode时，会新生成对象
	globalTreeNode : null,
    
    templateString: "<div class=\"dijitTreeContainer\" dojoAttachPoint=\"treeNode\"></div>",
    

    postCreate: function(){
		this.connect(this.treeNode, "onclick", "_onClick");
		this.connect(this.treeNode, "onkeypress", "_onKeyPress");
		this.connect(this.treeNode, "ondblclick", "_onDblClick");
		this.connect(this.treeNode, "oncontextmenu", "_onContextMenu");
		this.connect(this.treeNode, "onmouseover", "_onMouseOver");
		this.connect(this.treeNode, "onmouseout", "_onMouseOut");
		this.connect(this.treeNode, "onmousedown", "_onMouseDown");
        this.showRoot = Boolean(this.label);
		this._nodeMap = {};
		this.globalTreeNode =this. _createTreeNode({tree:this});
        this._load();
        this.inherited("postCreate", arguments);
       //若允许拖拽，则初始化拖拽模块
	    this.getDndSource();
    },
	
	//生成根节点的操作
    _load: function(){
		    this.rootNodeUI = new unieap.tree.TreeNodeUI();
			dojo.removeAttr(this.rootNodeUI.domNode, "id");
			//domNode增加associatedData属性，关联该节点相关的数据
			this.rootNodeUI.domNode.associatedData = {isExpanded:false,item:this.getBinding().getRootNodeItem(),isRoot:true,tree:this,label:this.label,level:0,state:"UNCHECKED",readOnly:false,disabled:false};
			//在节点对应的数据结构中保持对domNode的引用
			this.rootNodeUI.domNode.associatedData.item.domNode = this.rootNodeUI.domNode;
			//将该节点放到map中
			this._nodeMap[this.getBinding().rootNodeId] = this.rootNodeUI.domNode;
			//判断是否显示复选框
			if(!this.getCheckLogic()||!this.getCheckLogic().isShowRootCheckbox()){
			     this.getCheckboxNode(this.rootNodeUI.domNode).style.display = "none";
			}
		    //设置显示内容和样式
            this.setLabelNode(this.rootNodeUI.domNode,this.label);
            this._setExpando(this.rootNodeUI.domNode);
            this._updateItemClasses(this.rootNodeUI.domNode);
			this.domNode.appendChild(this.rootNodeUI.domNode);
            if (!this.showRoot) {
                this.rootNodeUI.renderNode.style.display="none";
            }
            this._updateLayout(this.rootNodeUI.domNode);
			//如果要展开根结点，则将根结点展开
			if (this.expandRoot) {
				this._expandNode(this.rootNodeUI.domNode);
			}
    },
    
	//重写销毁函数
    destroy: function(){
		//将所有domNode绑定的数据解除，以确保没有内存泄露问题
		for(var item in this._nodeMap){
			dojo.removeAttr(this._nodeMap[item], "associatedData");
		}
		this._nodeMap = null;
		//销毁根结点，此时会将所有节点删除
		this.rootNodeUI.destroy();  
		//如果允许编辑将会将编辑用的文本框销毁
		if(unieap.isClassEntity(this.treeEditor))
		      this.getEditor().destroy();
	     //如果允许拖拽，则将该模块销毁，用于对事件绑定的解除
	    if(unieap.isClassEntity(this.treeDnd))
		      this.getDndSource().destroy(); 
		this.inherited(arguments);
	},
	
    //根据当前节点的domNode，得到父节点的domNode
	getParentByDom : function(domNode){
				for(var p=domNode.parentNode; p; p=p.parentNode){
					var flag = p.getAttribute && p.getAttribute("isTreeNode");
					if(flag){
						return p;
					}
				}
				return null;
	},
	
     //根据当前节点的domNode，得到下一节点的domNode
	 getNextChildByDom : function(domNode){
		var node = domNode;
				do{
					node = node["nextSibling"];
				}while(node && node.nodeType != 1);
				if(!node){ return null; } 
				return node;
	},

	//根据当前节点的domNode，得到前一兄弟节点的domNode
    getPreviousChildByDom : function(domNode){
				var node = domNode;
				do{
					node = node["previousSibling"];
				}while(node && node.nodeType != 1);
				if(!node){ return null; } 
				return node;
	},
	
	 //根据当前节点的domNode，得到直接子节点domNode的数组，若子节点的dom尚未生成，返回空数组
	getChildrenByDom : function(domNode){
		var children = [];
		for(var i=0,nodes = this.getContainerNode(domNode).childNodes;nodes[i];i++){
			children.push(nodes[i]);
		}
		return children;
	},
	
	/**
	 * @summary:
	 * 		根据当前节点的domNode，得到内容部分的domNode
	 * @return :
	 * 		{domNode}
	 * @description:
	 * 		若用户需要重定义样式，可以调用此方法，否则较少会用到
	 * @example:
	 * |var node = unieap.byId("basicTree").getCurrentNode(); 
	 * |var domNode = unieap.byId("basicTree").getContentNode(node.getDomNode()); 
	 * |alert(domNode.outerHTML); 
	 */
	getContentNode : function(domNode){
		return domNode.firstChild;
	},
	
	getShowingNode :function(domNode){
		return domNode.firstChild.firstChild;
	},
	
	/**
	 * @summary:
	 * 		根据当前节点的domNode，得到展开图标部分的domNode
	 * @return :
	 * 		{domNode}
	 * @description:
	 * 		若用户需要重定义样式，可以调用此方法，否则较少会用到
	 * @example:
	 * |var node = unieap.byId("basicTree").getCurrentNode(); 
	 * |var domNode = unieap.byId("basicTree").getExpandoNode(node.getDomNode()); 
	 * |alert(domNode.outerHTML); 
	 */
    getExpandoNode : function(domNode){
		return domNode.firstChild.firstChild.rows[0].cells[0].firstChild;
	},
	
//	  @summary:
//	  		根据当前节点的domNode，得到展开节点展现部分的domNode
//	  @return :
//	  		{domNode}
//	  @description:
//	  		若用户需要重定义样式，可以调用此方法，否则较少会用到
//	  @example:
//	  |var node = unieap.byId("basicTree").getCurrentNode(); 
//	  |var domNode = unieap.byId("basicTree").getExpandoNode(node.getDomNode()); 
//	  |alert(domNode.outerHTML); 
//	 
    _expandByOnClickLabel : function(domNode){
		return domNode.firstChild.firstChild.rows[0].cells[3].firstChild;
	},
     //	  @summary:
     //	  		根据当前节点的domNode，得到展开节点展现文件夹的domNode
     //	  @return :
     //	  		{domNode}
     //	  @description:
//	  		若用户需要重定义样式，可以调用此方法，否则较少会用到
//	  @example:
//	  |var node = unieap.byId("basicTree").getCurrentNode(); 
//	  |var domNode = unieap.byId("basicTree").getExpandoNode(node.getDomNode()); 
//	  |alert(domNode.outerHTML); 
//	 
    _getExpandLabelFileNode : function(domNode){
		return domNode.firstChild.firstChild.rows[0].cells[2].firstChild;
	},
	/*
	 * @summary:
	 * 		根据当前节点的domNode，得到复选框部分节点的domNode
	 * @return :
	 * 		{domNode}
	 * @description:
	 * 		若用户需要重定义样式，可以调用此方法，否则较少会用到
	 * @example:
	 * |var node = unieap.byId("basicTree").getCurrentNode(); 
	 * |var domNode = unieap.byId("basicTree").getCheckboxNode(node.getDomNode()); 
	 * |alert(domNode.outerHTML); 
	 */
	getCheckboxNode : function(domNode){
		return domNode.firstChild.firstChild.rows[0].cells[1].firstChild;
	},
	
	/**
	 * @summary:
	 * 		根据当前节点的domNode，得到复选框
	 * @return :
	 * 		{domNode}
	 * @description:
	 * 		若用户需要重定义样式，可以调用此方法，否则较少会用到
	 * @example:
	 * |var node = unieap.byId("basicTree").getCurrentNode(); 
	 * |var domNode = unieap.byId("basicTree").getCheckboxInputNode(node.getDomNode()); 
	 * |alert(domNode.outerHTML); 
	 */
	getCheckboxInputNode : function(domNode){
		return domNode.firstChild.firstChild.rows[0].cells[1].firstChild.firstChild;
	},
	
     /**
	 * @summary:
	 * 		根据当前节点的domNode，得到图标节点的domNode
	 * @return :
	 * 		{domNode}
	 * @description:
	 * 		若用户需要重定义样式，可以调用此方法，否则较少会用到
	 * @example:
	 * |var node = unieap.byId("basicTree").getCurrentNode(); 
	 * |var domNode = unieap.byId("basicTree").getIconNode(node.getDomNode()); 
	 * |alert(domNode.outerHTML);
	 * @img:
	 *      images/tree/getIconNode.png
	 */
	getIconNode :function(domNode){
		return domNode.firstChild.firstChild.rows[0].cells[2].firstChild;
	},
	
	/**
	 * @summary:
	 * 		根据当前节点的domNode，得到文字部分节点的domNode
	 * @return :
	 * 		{domNode}
	 * @example:
	 * |var node = unieap.byId("basicTree").getCurrentNode(); 
	 * |var domNode = unieap.byId("basicTree").getLabelNode(node.getDomNode()); 
	 * |alert(domNode.outerHTML); 
	 * @img:
	 *      images/tree/getLabelNode.png
	 */
	getLabelNode : function(domNode){
		if(domNode)
		 //return domNode.childNodes[0].childNodes[0].rows[0].cells[3].childNodes[0];
			 return domNode.firstChild.firstChild.firstChild.firstChild.childNodes[3].firstChild;
	},
	
	/**
	 * @summary:
	 * 		根据当前节点的domNode，得到所有子节点所在div的domNode
	 * @return :
	 * 		{domNode}
	 * @description:
	 * 		若用户需要重定义样式，可以调用此方法，否则较少会用到
	 * @example:
	 * |var node = unieap.byId("basicTree").getCurrentNode(); 
	 * |var domNode = unieap.byId("basicTree").getContainerNode(node.getDomNode()); 
	 * |alert(domNode.outerHTML); 
	 */
	getContainerNode : function(domNode){
		return domNode.childNodes[1];
	},
	
	/*********************************node style method*********************************/
	
	//将当前节点设置为收起状态，修改相应变量并设置样式
	setNodeCollapseStyle : function(domNode,animation){
		if (!domNode.associatedData.isExpanded) {
            return;
        }
        domNode.associatedData.isExpanded = false;
        this._setExpando(domNode);
        this._updateItemClasses(domNode);
        if (this.getContainerNode(domNode)) {
            if(animation==false||this.animate==false){
        	  this.getContainerNode(domNode).style.display = "none";
            }else{
            	 var _this = this; 
                 this._wipeOut = dojo.fx.wipeOut({
				  node: this.getContainerNode(domNode), duration: 200
			     });
			     dojo.connect(this._wipeOut, "onEnd", function(){
			      _this.getContainerNode(domNode).style.width = "";
				   _this.getContainerNode(domNode).style.height = "";
		        });
		      this._wipeOut.play(); 
        	}
        }
	},
	
	//将当前节点设置为展开状态，修改相应变量并设置样式
	setNodeExpandStyle : function(domNode,animation){
		//如果不是处于已经展开状态，则不进行任何操作
		if (domNode.associatedData.isExpanded) {
            return;
        }
		domNode.associatedData.isExpanded = true;
		this._wipeOut&&this._wipeOut.stop();
		//设置相关的样式
        this._setExpando(domNode);
        this._updateItemClasses(domNode);
        if (this.getContainerNode(domNode)){
        	if(animation==false||this.animate==false){
        		var node = this.getContainerNode(domNode);
        	 	node.style.display = "block";
			    node.style.width = "auto";
			    node.style.height = "auto"
			}else{
        	  var _this = this; 
			  this._wipeIn = dojo.fx.wipeIn({
				 node: this.getContainerNode(domNode), duration: 200
			  });
			  dojo.connect(this._wipeIn, "onEnd", function(){
			    _this.getContainerNode(domNode).style.width = "auto";
				_this.getContainerNode(domNode).style.height = "auto";
				if (dojo.isIE) {
					_this.getContainerNode(domNode).style.display = "";
					_this.getContainerNode(domNode).style.display = "block";
				}
		     });
		      this._wipeIn.play();   
        	}
        }
	},
	
	//设置树节点文本区域的显示值
    setLabelNode: function(treeDomNode,label){
		//如果为null或者undefined，则将其设置为null字符串	
		if(!label){
			label = "";
		}
		else{
			label = String(label).replace(/&/g,"&amp;").
							 	  replace(/</g,"&lt;").
							      replace(/>/g,"&gt;").
							 	  replace(/\s/g,"&nbsp;");
		}  
        this.getLabelNode(treeDomNode).innerHTML = label;
    },
	
	//设置节点上标示节点状态的图标样式，如是否在加载，是否是叶子节点，是否展开
    _setExpando: function(treeDomNode,processing){
        var styles = ["dijitTreeExpandoLoading", "dijitTreeExpandoOpened", "dijitTreeExpandoClosed", "dijitTreeExpandoLeaf"];
        var idx = processing ? 0 : (!this.isLeafByData(treeDomNode.associatedData.item) ? (treeDomNode.associatedData.isExpanded ? 1 : 2) : 3);
		this.getExpandoNode(treeDomNode).className = styles[idx];
    },
	
	//根据domNode，更新节点图标和字体的样式
    _updateItemClasses: function(treeDomNode,tmpElementParentNode){
    	var parentNode = tmpElementParentNode || treeDomNode.firstChild.firstChild.rows[0];
		var iconNode = parentNode.cells[2].firstChild;
		//得到图标和文字区域的domNode，以改变样式
		//var iconNode = this.getIconNode(treeDomNode);
		//得到图标区域的样式，Tree本身提供默认实现，用户也可自定义getIconClass方法
        var iconClass = this.getIconClass(treeDomNode.associatedData.item, treeDomNode.associatedData.isExpanded, !this.isLeafByData(treeDomNode.associatedData.item));
        //清除已有的样式
		//this.clearIconClass(iconNode);
		//重新设置样式
		iconNode.className = "dijitInline dijitTreeIcon " +iconClass;
		//得到用户自定义的样式，此时得到的是一个对象
		if(this.getIconStyle(treeDomNode.associatedData.item, treeDomNode.associatedData.isExpanded, !this.isLeafByData(treeDomNode.associatedData.item))){
		     dojo.style(iconNode, this.getIconStyle(treeDomNode.associatedData.item, treeDomNode.associatedData.isExpanded, !this.isLeafByData(treeDomNode.associatedData.item)));
		}
       //设置label的样式
	    var labelClass  = this.getLabelClass(treeDomNode.associatedData.item, treeDomNode.associatedData.isExpanded, !this.isLeafByData(treeDomNode.associatedData.item));
        if(labelClass){
			//var labelNode =  this.getLabelNode(treeDomNode);
			var labelNode = parentNode.cells[3].firstChild;
        	 labelNode.className = labelClass;
        }
		if(this.getLabelStyle(treeDomNode.associatedData.item, treeDomNode.associatedData.isExpanded, !this.isLeafByData(treeDomNode.associatedData.item)))
		    dojo.style(this.getLabelNode(treeDomNode), this.getLabelStyle(treeDomNode.associatedData.item, treeDomNode.associatedData.isExpanded, !this.isLeafByData(treeDomNode.associatedData.item)) );
		//将当前节点设为全局节点，并触发事件
		this._setGlobalTreeNode(treeDomNode,treeDomNode.associatedData.item);
		unieap.fireEvent(this,this.onSetNodeClass,[this.globalTreeNode]);
    },
	
	//清除图标的已有样式
    clearIconClass: function(treeDomNode){
        this.getIconNode(treeDomNode).className = "";
    },
    
	//更新节点的布局样式，根据判断是否根结点，是否为最后一个节点，赋予不同的样式
    _updateLayout: function(treeDomNode){
        var parent = this.getParentByDom(treeDomNode);
        if (!parent || this.getContentNode(parent).style.display == "none") {
            dojo.addClass(treeDomNode, "dijitTreeIsRoot");
        }
        else {
            dojo.toggleClass(treeDomNode, "dijitTreeIsLast", !this.getNextChildByDom(treeDomNode));
        }
    },
	
	//标记节点处于加载子节点状态，并更新相关样式
    markProcessing: function(treeDomNode){
        this.state = "LOADING";
        this._setExpando(treeDomNode,true);
    },
    
    //标记节点结束加载子节点状态，并更新相关样式
    unmarkProcessing: function(treeDomNode){
        this._setExpando(treeDomNode,false);
    },
	 /*********************************style method **************************************/
	
	/**
	 * @summary:
	 *     得到节点图标的样式
	 * @description:
	 * 		此时的返回值应该为一个级联样式表的类名
	 * @param
	 *		{object} item 节点的数据对象
	 * @param:
	 *		{boolean}  opened 节点是否已经展开
	 * @param  
	 *		{boolean} isExpandable 节点是否可以展开
	 * @return
	 *		{string}
	 * @example: 
	 * |<style> 
	 * |	.unieap .iconFemale{ 
	 * |		background-image: url('user_female.png'); 
	 * |		width : 16px; 
	 * |	} 
	 * |</style> 
	 * |function customIconClass(item,opened,isExpandable){ 
	 * |	return "iconFemale"; 
	 * |} 
	 * |<div dojoType="unieap.tree.Tree" 
	 * |	id="basicTree"  label="UniEAP" 
	 * |	animate="false" getIconClass="customIconClass" 
	 * |	binding = "{'leaf':'leaf','store':treeStorePart,
	 * |		'parent':'parentID',query:{name:'parentID',relation:'=',value:''}}"> 
	 * |</div>
	 *      自定义图标的样式，以获得特定的样式。
	 *  @img:
	 *      images/tree/getIconClass.png      
	 */
	  getIconClass: function(item,opened, isExpandable){
        if (item) {
            var iconClass = this.getBinding().getIconClass(item);
            if (iconClass) {
                return iconClass;
            }
        }
        var clsName = (!item || isExpandable) ? (opened ? "dijitFolderOpened" : "dijitFolderClosed") : "dijitLeaf";
        return clsName
    },
	
    /**
	 * @summary:
	 *		得到节点文字区域即label的样式
	 * @description:
	 *		此时的返回值应该为一个级联样式表的类名
	 * @param  
	 *    {object} item  节点的数据对象
	 * @param  
	 *    {boolean}  opened 节点是否已经展开
	 * @param  
	 *    {boolean} isExpandable  节点是否可以展开
	 * @return 
	 *          {string} 
	 * @example:
	 * |<style> 
	 * |	.unieap .fontLabel{ 
	 * |		font-style:italic; 
	 * |		font-weight:bolder; 
	 * |		font-size:14px; 
	 * |		font-family: Arial; 
	 * |		background-color:yellow; 
	 * |	} 
	 * |</style> 
	 * |function customLabelClass(item,opened,isExpandable){ 
	 * |	return "fontLabel"; 
	 * |} 
	 * |<div dojoType="unieap.tree.Tree" 
	 * |	id="basicTree"  label="UniEAP" 
	 * |	animate="false" getLabelClass="customLabelClass" 
	 * |	binding = "{'leaf':'leaf', 'store':treeStorePart,
	 * |		'parent':'parentID', query:{name:'parentID',relation:'=',value:''} }"> 
	 * |</div>      
	 *   自定义文字显示区域的样式，实现特定的效果。
	 * @img:
	 *      images/tree/getLabelClass.png  
	 */
	getLabelClass : function(item,opened, isExpandable){
		   if (item) {
            var labelClass = this.getBinding().getLabelClass(item);
            if (labelClass) {
                return labelClass;
            }
        }
	},
	
	/**
	 * @summary:
	 *     得到节点图标的样式
	 * @description:
	 * 		此时的返回值应该为一个标示样式的对象，如{backgroundImage: "url('images/user.png')"}
	 * @param:
	 *      {object} item 节点的数据对象
	 * @param:
	 *      {boolean} opened 节点是否已经展开
	 * @param: 
	 * 		{boolean} isExpandable 节点是否可以展开
	 * @return
	 *		{string}
	 * @example
	 * |function customIconStyle(item,opened,isExpandable){ 
	 * |	return {backgroundImage: "url('user.png')"}; 
	 * |} 
	 * |<div dojoType="unieap.tree.Tree" 
	 * |	id="basicTree"  label="UniEAP" 
	 * |	animate="false" getIconStyle="customIconStyle" 
	 * |	binding = "{'leaf':'leaf', 'store':treeStorePart,
	 * |		'parent':'parentID', query:{name:'parentID',relation:'=',value:''}}"> 
	 * |</div>
	 *     自定义图标的样式，以获得特定的样式。
	 * @img:
	 *      images/tree/getIconStyle.png
	 */
	getIconStyle : function(item,opened, isExpandable){
		
	},
	
	/**
	 * @summary:
	 *     得到节点文字区域即label的样式
	 * @description:
	 * 		此时的返回值应该为一个标示样式的对象
	 * @param  
	 *      {object} item 节点的数据对象
	 * @param  
	 *       {boolean} opened 节点是否已经展开
	 * @param  
	 *      {boolean} isExpandable 节点是否可以展开
	 * @return 
	 *          {string}
	 * @example
	 * |function customLabelStyle(item,opened,isExpandable){ 
	 * |	return {fontStyle:"italic",color:"blue"}; 
	 * |} 
	 * |<div dojoType="unieap.tree.Tree" 
	 * |	id="basicTree"  label="UniEAP" 
	 * |	animate="false" getLabelStyle="customLabelStyle" 
	 * |	binding = "{'leaf':'leaf', 'store':treeStorePart,
	 * |		'parent':'parentID', query:{name:'parentID',relation:'=',value:''}}"> 
	 * |</div>
	 * @img:
	 *      images/tree/getIconStyle.png
	 */
	getLabelStyle : function(item,opened, isExpandable){
		
	},
	
	 /**
	 * @summary:
	 *    	新建一个节点
	 * @param 
	 *      {object}  data 
	 *      要生成的节点对应的数据
	 * @param  
	 * 		{unieap.tree.TreeNode}  parentNode 
	 *      父节点对应的TreeNode对象   
	 * @param
	 *     {number}  index
	 *     要将节点添加的位置，从0开始计数
	 * @example:
	 * |var parentNode = unieap.byId("basicTree").getCurrentNode(); //获取当前节点 
	 * |if(!parentNode){ 
	 * |	alert("请选择一个树节点！"); 
	 * |	return; 
	 * |}else{ 
	 * |	var parentNodeID = parentNode.getData()["id"]; //获取当前节点的ID 
	 * |	var data={id:'8',label:"newTreeNode",parentID:parentNodeID,leaf:true}; //构造新节点的数据 
	 * |	unieap.byId("basicTree").createNode(data,parentNode); //给当前节点添加一个孩子节点 
	 * |} 
	 *    给当前节点添加一个子节点
	 */
	createNode : function(data,parentNode,index){
		if(!parentNode){
			return;
		}
		var domNode = parentNode.domNode;
	    var complete =  dojo.hitch(this,function(){
			//先添加数据
			var item = this.getBinding().addItem(data, parentNode.getItem());
			//后改变domNode
			this._addChildren(item,domNode,index);
		});
		//如果父节点的数据尚未加载进来，需要先加载数据，然后添加节点
		if(!parentNode.getItem().loaded){
			this.loadNodeData(parentNode.getItem(),dojo.hitch(this,complete));
		}else{
			complete();
		}
	},
	
     /**
	 * @summary:
	 *     	删除一个节点及其关联子节点，根节点除外
	 * @param  
	 *      {unieap.tree.TreeNode}  node 
	 *      要删除节点对应的TreeNode对象
	 * @param
	 *      {boolean}  isDeleteItem
	 *      是否要删除节点对应的数据，默认会删除，但是在同棵树的拖拽中，需要删除dom，但是不需要删除数据
	 * @example:
	 * |var delete_node = unieap.byId("basicTree").getNodeById("1"); //获取ID为“1”的树节点 
	 * |if(!delete_node){ 
	 * |	alert("没有该节点！"); 
	 * |}else{ 
	 * |	unieap.byId("basicTree").deleteNode(delete_node,true); //删除树节点 
	 * |}
	 * 根据id得到一个节点，并将其删除
	 */
	deleteNode : function(node,isDeleteItem){
		if(!node || node.isRoot()) return;
		var item  =  node.getItem();
		var parentNode = node.getParent();//父节点的TreeNode对象
		var parentItem = null;
		if(parentNode)
		   parentItem = parentNode.getItem();
		 delete item.domNode;
		 if(isDeleteItem!=false){
		 	this.getBinding().deleteItem(item,parentItem);
		 }
		node.destroyRelatedNode();
		if(parentNode){
		     this._updateItemClasses(parentNode.domNode);
			 this._setExpando(parentNode.domNode,false);
			 var _this = this;
			 if(parentNode.getChildren()){
		      dojo.forEach(parentNode.getChildren(), function(child){
				   _this._updateLayout(child.domNode);
			  });
			}else{
			  parentNode.domNode.associatedData.isExpanded = false;
			  this.getContainerNode(parentNode.domNode).style.display ="none";
			}
			
		}
	},
	
	 /**
	 * @summary:
	 *     	按照指定的层级展开节点
	 * @description:
	 * 		根结点的level为0，其余节点依次递增
	 * @param  
	 *      {number}  level 
	 *      要展开节点的层级
	 * @example:
	 *  |unieapTree.expandNodeByLevel(2); //展开第二层树节点
	 */
	expandNodeByLevel : function(level){
		//先将所有节点收起
	    this.collapseAllNodes();
		//因为树可能是懒加载的，为了避免混乱，因此将需要展开的节点放到一个数组中，依次发送ajax请求
		//等加载数据成功后，将数组中该节点删除
		this.toExpandNodeByLevel = [];
		//先将根结点放到数组中
		this.toExpandNodeByLevel.push(this.rootNodeUI.domNode);
		this._expandNodeByLevelHelper(this.rootNodeUI.domNode,level);
	},
	
	//按照层级展开节点的辅助方法，会被递归调用
	_expandNodeByLevelHelper : function(domNode,level){
	   //定义一个回调函数，用于在请求结束后，将toExpandNodeByLevel对应的节点删除，并将其展开
		var onComplete = dojo.hitch(this,function(items){
			//将当前的这个节点从数组中删除，并将这个节点展开
			this.toExpandNodeByLevel.shift();
			this._expandNode(domNode,false);
			domNode.associatedData.isExpanded = true;
			//如果当前节点的level仍小于要展开的level，要将其子节点放进数组
			if(domNode.associatedData.level<level){
				var children = this.getChildrenByDom(domNode);
				if(children&&children.length>0){
					for(var i=0,l=children.length;i<l;i++){
						this.toExpandNodeByLevel.push(children[i]);
					}
				}
			}
			//如果toExpandNodeByLevel的长度大于零，说明还有节点需要展开，否则说明已到达指定层级，返回
		   if(this.toExpandNodeByLevel.length>0){
				 this._expandNodeByLevelHelper(this.toExpandNodeByLevel[0],level);
	       }else{
		   	  return;
		   }
		})
		//如果该节点的子节点相关数据已经加载完成，则直接调用onComplete，如果子节点相关数据还没有展开，则需要先加载数据 ，将onComplete作为回调函数
		if(domNode.associatedData.item.loaded){
                onComplete();
		}else{
			this.getBinding().getChildren(domNode.associatedData.item,dojo.hitch(this,onComplete));
		}
	},
	
	/**
	 * @summary:
	 *    	展开树的所有节点
	 * @description:
	 * 		若节点比较多且数据是懒加载的情况下，出于性能考虑，不建议使用该方法
	 * @example:
	 * |unieap.byId("basicTree").expandAllNodes();  //其中“basicTree”为树的id值
	 */
	expandAllNodes : function(){
		//因为树可能是懒加载的，为了避免混乱，因此将需要展开的节点放到一个数组中，依次发送ajax请求
		//等加载数据成功后，将数组中该节点删除
		this.toExpandNodeAll = [];
		//将根结点放进数组
		this.toExpandNodeAll.push(this.rootNodeUI.domNode);
		this._expandNodeAllHelper(this.rootNodeUI.domNode);
	},
	
	//展开所有节点的辅助方法，会被递归调用
	_expandNodeAllHelper : function(domNode){
		var onComplete = dojo.hitch(this,function(items){
			var domNode = this.toExpandNodeAll.shift();
			this._expandNode(domNode,false);
			domNode.associatedData.isExpanded = true;
			var children = this.getChildrenByDom(domNode);
			if(children && children.length>0){
					for(var i=0,child; (child = children[i]);i++){
						if(!this.isLeafByData(child.associatedData.item)){
							this.toExpandNodeAll.push(children[i]);
						}
					}
			}
		   if(this.toExpandNodeAll.length){
				this._expandNodeAllHelper(this.toExpandNodeAll[0]);
	       }
		})
		if(domNode.associatedData.item.loaded){
                onComplete();
		}else{
			this.getBinding().getChildren(domNode.associatedData.item,onComplete);
		}
	},
	
	/**
	 * @summary:
	 *    收起树的所有节点，此时所有的节点都被收起，只显示根结点，若根结点不显示则会显示第一层节点
	 * @example:
	 * |unieap.byId("basicTree").collapseAllNodes(); 
	 *    将会把树上的节点收起。
	 */
	collapseAllNodes : function(){
		//根据topLevel进行节点收起操作
		var topLevel = 0;
		if(!this.showRoot){
			topLevel = 1;
		}
		for(var node in this._nodeMap){
			if(this._nodeMap[node].associatedData.level>=topLevel&&this._nodeMap[node].associatedData.isExpanded){
				this._collapseNode(this._nodeMap[node],false)
			}
		}
	},
	
	/**
	 * @summary:
	 *   	将指定节点设置为当前节点，并更改样式
	 * @param: 
	 *      {unieap.tree.TreeNode}
	 * @example:
	 * |var treeNode = unieapTree.getNodeById("1"); 
	 * |unieap.byId("basicTree").setCurrentNode(treeNode);
	 */
	setCurrentNode : function(node){
		if(node.isDisabled())
		   return;
	    var flag = unieap.fireEvent(this,this.onBeforeSetCurrentNode,[node]);
        if (flag === false) {
            return;
        }
		this._onTreeFocus(node.domNode);
		this.focusNode(node.getDomNode());
		unieap.fireEvent(this,this.onAfterSetCurrentNode,[node]);
	},
	
    /**
	 * @summary:
	 *    获得当前的节点，若不存在将会返回null
	 *  @return: 
	 *      {unieap.tree.TreeNode|null}
	 *  @example:
	 *  |var parentNode = unieap.byId("basicTree").getCurrentNode(); 
	 */
	getCurrentNode : function(){
		if(this.lastFocused){
			return this._createTreeNode({
				  item:this.lastFocused.associatedData.item,
				  domNode : this.lastFocused,
				  tree:this
			});
		}else{
			return null;
		}
	},
	
    /**
	 * @summary:
	 *   选中或非选中所有节点
	 * @param:
	 *    {boolean}  checked 
	 * @description:
	 *	 调用此方法，将会把树上所有的节点选中或者非选中，在支持复选的树上生效，并且应该保证树上没有节点处于readonly和disabled状态
	 * @example:
	 * |unieap.byId("basicTree").selectAll(true);
	 */
	selectAll : function(checked){
		if (this.getCheckLogic()) {
		    var flag = unieap.fireEvent(this,this.onBeforeSelectAll,[]);
		    if(flag==false)
		       return;
			this.getCheckLogic().selectAll(checked);
			unieap.fireEvent(this,this.onAfterSelectAll,[]);
		}else{
			return;
		}
	},
	
	 /**
	 * @summary:
	 *    	获得选中的节点数组，
	 * @description:
	 *		包括选中的和半选的，若不存在将会返回空数组
	 *		此时若节点没有生成，在返回的数组中不会包含
	 * @return: 
	 *      {array}
	 * @example:
	 * |var selectedNodes = unieap.byId('basicTree').getSelectedNodes(); 
	 * |unieap.debug(selectedNodes);  
	 *  @img:
	 *      images/tree/getSelectedNodes.png
	 */
	getSelectedNodes : function(){
		var selectedNode = [];
		for (var node in this._nodeMap) {
			if (this._nodeMap[node].associatedData.isChecked&&!this._nodeMap[node].associatedData.isRoot) {
				selectedNode.push(this._createTreeNode({item:this._nodeMap[node].associatedData.item,domNode : this._nodeMap[node],tree:this}))
			}
		}
		return selectedNode;
	},
	
	 /**
	 * @summary:
	 *     	按照路径展开指定节点
	 * @param  
	 *      {string}  path 
	 *      要展开节点的路径
	 * @param  
	 *      {function}  callback 
	 *      回调方法
	 * @example:
	 * |unieapTree.expandNodeByPath("/5/6");    //其中5、6为节点的id值
	 *    
	 */
	expandNodeByPath : function(path,callback){
		//数组记录将要展开的节点
		var callbackPath = callback || function(){};
		this.pathToExpand = path.split(this.pathSeparator);
        if(this.pathToExpand&&this.pathToExpand.length>0&&this.pathToExpand[0]==""){
			this.pathToExpand.splice(0,1)
		}
		this._expandNodeByPathHelper(this.rootNodeUI.domNode,callbackPath);
	},
	
	//按照路径展开节点的辅助方法，会被递归调用
	_expandNodeByPathHelper : function(domNode,callbackPath){
		var preId;
		if (this.getBinding().getId(domNode.associatedData.item) == this.pathToExpand[0]) {
			preId = this.pathToExpand.shift();
		}
		var onComplete = dojo.hitch(this,function(items){
			this._expandNode(domNode,false);
			domNode.associatedData.isExpanded = true;
		   if(this.pathToExpand.length>0&&this._nodeMap[this.pathToExpand[0]]){
				 this._expandNodeByPathHelper(this._nodeMap[this.pathToExpand[0]],callbackPath);
	       }else if(this.pathToExpand.length==0&&this._nodeMap[preId]){
	    	   var lastNode = this.getNodeByDom(this._nodeMap[preId]);
	    	   callbackPath(lastNode);
	       }else{
		   	  return;
		   }
		})
		//如果该节点的子节点数据已经加载进来，直接将当前节点展开即可，如果数据尚未加载，则需要先加载数据，在回调函数中执行展开及相关的操作
		if(domNode.associatedData.item.loaded){
                onComplete();
		}else{
			this.getBinding().getChildren(domNode.associatedData.item,dojo.hitch(this,onComplete));
		}
	},
	
	//新增节点的UI操作函数，在增加数据完成后执行，需要增加对应的domNode。
	//若节点尚未展开过，则直接展开即可，因为数据已经增加，再展开的过程中新增的节点和其他节点将会同时生成
	//若已经展开过，则需要增加一个节点
	_addChildren : function(item,domNode,index){
		//如果节点从未展开过，则将该节点展开即可
		if (domNode.associatedData.state=="UNCHECKED" && domNode.associatedData.isExpanded!=true) 
			this._expandNode(domNode,false);
		else{
			//比照当前节点生成新节点的domNode，重新设置内容和样式
			var tempNode = domNode.cloneNode(true);
			tempNode.className = "dijitTreeNode";
			this.getContentNode(tempNode).className = "treeRenderNode";
			//this.getShowingNode(tempNode).className = "";
			this.getLabelNode(tempNode).className = "dijitTreeLabel";
			this.getContainerNode(tempNode).innerHTML = "";
			dojo.removeClass(this.getContentNode(tempNode));
			this.getContainerNode(tempNode).style.display ="none";
			this._createChildrenDom(domNode, tempNode, item)
			//将节点放置于合适的位置
			var childrenDom = this.getChildrenByDom(domNode);
			if(childrenDom&&childrenDom.length>0&&index!='undefined'&&index<=childrenDom.length&&index>=0){
				if(index<childrenDom.length)
				     dojo.place(tempNode,childrenDom[index],"before");
			    else{
					 dojo.place(tempNode,childrenDom[index-1],"after");
				}
			}else{
				this.getContainerNode(domNode).appendChild(tempNode);
			}
			var node = this._createTreeNode({
				  item:item,
				  domNode : tempNode,
				  tree:this
			    });
			unieap.fireEvent(this,this.onAfterNodeRender,[node]);
			//设置样式
			this._setExpando(domNode);
			this._updateItemClasses(domNode);
			 var _this = this;
			 var childrenDoms = this.getChildrenByDom(domNode);
		      dojo.forEach(childrenDoms, function(child){
				    _this._updateLayout(child);
			});
			this._expandNode(domNode);
		}
	},
	
	//增加节点时，对新生成的domNode进行数据和样式的设置
	_createChildrenDom:function(parentDom,child,item){
		    
	        child.style.display="block";
			//关联数据的绑定
			item["domNode"] = child;
			
			var checked = this.getBinding().isSelected(item);
			var disabled = this.getBinding().isDisabledByData(item);
			
			child.associatedData = {readOnly:false,disabled:disabled,isChecked:checked,domNode:child,isExpanded:false,item:item,isRoot:false,tree:this,label: this.getBinding().getLabel(item),level:parentDom.associatedData.level + 1,state:"UNCHECKED"};
			if (!this.getCheckLogic()) 
				this.getCheckboxNode(child).style.display = "none";
			else {
				this.getCheckboxNode(child).style.display = "block";
				this.getCheckboxNode(child).className = "dijitCheckBox";
				this.getCheckboxInputNode(child).disabled = disabled;
			}
			//如果父节点被选中的话，要根据复选逻辑确定新增节点的复选状态
			var node = this._createTreeNode({
				  item:item,
				  domNode : child,
				  tree:this
			});
			this.tmpElementParentNode = child.firstChild.firstChild.rows[0];;
			if(this.getCheckLogic()&&(this.getNodeByDom(parentDom).isChecked()||checked)){
				this.getCheckLogic().setCheckedForNewNode(node);
			}
			//样式调整
			if(!this._nodeMap) return;//懒加载的下拉树在grid编辑时，有可能nodeMap为空
			this.getContentNode(child).style.display = "block";
			this._nodeMap[this.getBinding().getId(item)] = child;
			
			//this.setLabelNode(child,this.getBinding().getLabel(item));
			var label = this.getBinding().getLabel(item);
			this.tmpElementParentNode.cells[3].firstChild.innerHTML = label || "";
			//this._setExpando(child);
			var styles = ["dijitTreeExpandoLoading", "dijitTreeExpandoOpened", "dijitTreeExpandoClosed", "dijitTreeExpandoLeaf"];
		    var idx =  (!this.isLeafByData(child.associatedData.item) ? (child.associatedData.isExpanded ? 1 : 2) : 3);
			this.tmpElementParentNode.cells[0].firstChild.className= styles[idx];
            this._updateItemClasses(child,this.tmpElementParentNode);
			if(disabled){
				node.setDisabled(true);
			}
	},
	
	//根据得到的子节点的items，增加子节点
    setChildItems: function(domNode,items){
        domNode.associatedData.state = "LOADED";
		var tempNode = domNode.cloneNode(true);
		tempNode.className = "dijitTreeNode";
		 this.getContentNode(tempNode).className = "treeRenderNode";
		 this.getLabelNode(tempNode).className = "dijitTreeLabel";
		 dojo.removeClass(this.getContentNode(tempNode));
		 this.getContentNode(tempNode).style.display="block";
		 //增加子节点，并设置样式
        if (items && items.length > 0) {
            var oFrag = document.createDocumentFragment();
            for (var i = 0; i < items.length; i++) {
                if (!items[i]) {
                    continue;
                }
                var child = tempNode.cloneNode(true);
				this._createChildrenDom(domNode,child,items[i])
                oFrag.appendChild(child);
			    var node = this._createTreeNode({
				  item:items[i],
				  domNode : child,
				  tree:this
			    });
			   this.onAfterNodeRender(node);
            }
            this.getContainerNode(domNode).appendChild(oFrag);
            var clds = this.getChildrenByDom(domNode);
            for (var k = 0; k < clds.length; k++) {
                this._updateLayout(clds[k]);
            }
        }else {
			this._updateItemClasses(domNode);
        }
        if (this._setExpando) {
            this._setExpando(domNode,false);
        }
    },
	
    /**
	 * @summary:
	 * 	     根据数据对象，判断节点是否是叶子节点
	 * @return :
	 * 		{boolean}
	 * @example:
	 * |var node = unieap.byId("basicTree").getCurrentNode(); 
	 * |alert(unieap.byId("basicTree").isLeafByData(node.getItem()));  
	 */
    isLeafByData: function(item){
        return this.getBinding().isLeaf(item);
    },
  /*********************************inner method **************************************/
   //创建树节点
    _createTreeNode: function(args){
        return new unieap.tree.TreeNode(args);
    },
	
	//节点获得焦点
    focusNode : function(node){
		//dijit.focus(this.getLabelNode(node));
    },
	
	//展开指定节点
	 _expandNode: function(domNode,animation){
	 	//如果节点已经展开了，则不作其他操作
	 	if(domNode.associatedData.isExpanded){
			return;
		}
	 	this._setGlobalTreeNode(domNode,domNode.associatedData.item);
		//触发onBeforeExpand事件
	 	var flag = unieap.fireEvent(this,this.onBeforeExpand,[this.globalTreeNode]);
		if(flag==false)
		     return;
	   //根据数据判断是否为叶子节点，如果是叶子节点的话，直接返回
        if (this.isLeafByData(domNode.associatedData.item)) { 
        	if(this.loader!=null){
        		this.setChildItems(domNode,[]);
                this.setNodeExpandStyle(domNode,animation);
        	}
            return;
        }
		//根据节点的状态，判断要执行的操作
        switch (domNode.associatedData.state) {
            case "LOADING":
                return;
			case "UNCHECKED":
                this.markProcessing(domNode);
                var _this = this;
                this.getBinding().getChildren(domNode.associatedData.item, function(items){
                    _this.unmarkProcessing(domNode);
                    _this.setChildItems(domNode,items);
                    _this.setNodeExpandStyle(domNode,animation);
				    //触发onAfterExpand事件
                    unieap.fireEvent(_this,_this.onAfterExpand,[_this.globalTreeNode]);
                }, function(err){
                    console.error(_this, ": error loading children: ", err);
                });
                break;
            default:
                this.setNodeExpandStyle(domNode,animation);
				//触发onAfterExpand事件
            	unieap.fireEvent(this,this.onAfterExpand,[this.globalTreeNode]);
        }
    },
	
	//收起指定节点
    _collapseNode: function(domNode,animation){
		this._setGlobalTreeNode(domNode,domNode.associatedData.item);
		//触发onBeforeCollapse事件
		var flag = unieap.fireEvent(this,this.onBeforeCollapse,[this.globalTreeNode]);
		if(flag==false) 
		        return;
        if (!this.isLeafByData(domNode.associatedData.item)) {
            if (domNode.associatedData.state == "LOADING") {
                return;
            }
		   //设置收起的样式
		   this.setNodeCollapseStyle(domNode,animation);
		   //触发onAfterCollapse事件
		   unieap.fireEvent(this,this.onAfterCollapse,[this.globalTreeNode]);
        }
    },
	
	//使上一次获得焦点的节点失去焦点，并设置样式
	blurNode: function(){
        var node = this.lastFocused;
        if (!node) {
            return;
        }
        var labelNode = this.getLabelNode(node);
        var contentNode = this.getContentNode(node);
        dojo.removeClass(contentNode, "dijitTreeLabelFocused");
        dojo.removeClass(labelNode, "dijitTreeLabelFocused");
        dojo.addClass(labelNode, "dijitTreeLabel");
        labelNode.setAttribute("tabIndex", "-1");
        this.lastFocused = null;
    },
	
	//根据模块名和声明类，生成对象的实例
    getModuleInstance: function(moduleName, declaredClass){
        dojo.require("unieap.util.util");
        var module = this[moduleName];
        if (!unieap.isClassEntity(module)) {
            module = dojo.mixin({
                widget: this
            }, module);
            declaredClass = module.declaredClass || declaredClass;
            dojo.require(declaredClass);
            var clazz = dojo.getObject(declaredClass);
            module = new clazz(module);
            var name = (function(func){
                for (var name in this) {
                    if (this[name] == func) {
                        return name;
                    }
                }
                return "";
            }).call(this, arguments.callee.caller);
            this[name] = function(){
                return module;
            }
            this[moduleName] = module;
        }
        return module;
    },
	/****************************api*************************************/
	
	/**
	 * @summary：
	 * 		得到根结点
	 * @return
	 * 	{unieap.tree.TreeNode} 
	 * @example:
	 *  |var rootNode = unieap.byId("basicTree").getRootNode(); 
	 */
	getRootNode : function(){
		return this._createTreeNode({
			item:this.getBinding().getRootNodeItem(),
			domNode : this.rootNodeUI.domNode,
			tree:this
		});
	},
	
	/**
	 * @summary：
	 * 		返回树绑定相关的类实例
	 * @return
	 * 		{object} 
	 * @example:
	 * |unieap.byId("basicTree").getBinding().setLabel(node,"newLabel");//调用树的binding来设置节点的显示值
	 */
	getBinding: function(){
		if(this.binding){
			if(!this.binding.bindingClass)
			    this.binding.bindingClass = "unieap.tree.RowSetTreeBinding";
		}else{
			this.binding = {};
			this.binding.bindingClass = "unieap.tree.RowSetTreeBinding";
		}

        return this.getModuleInstance("binding", this.binding.bindingClass);
    },
	
     /**
	 * @summary：
	 * 		返回树复选控制相关的类
	 * @return
	 * 		{object} 
	 * @example:
	 * |unieap.byId("basicTree").getCheckLogic().getSelectedItems(function(items){unieap.debug(item);})
	 */
	getCheckLogic : function(){
		if(this.checkLogic){
			return this.getModuleInstance("checkLogic", this.checkLogicClass);
		}
		else
		    return null;
	},
	
	 /**
	 * @summary：
	 * 		返回树编辑的类，较少用到
	 * @return
	 * 		{object} 
	 * @example:
	 * |var editor = unieap.byId("basicTree").getEditor();
	 */
	getEditor : function(){
		if(this.treeEditor){
			return this.getModuleInstance("treeEditor", this.treeEditorClass);
		}
		else
		     return null;
	},
    
	/**
	 * @summary：
	 * 		返回树加载相关的类
	 * @return
	 * 		{object} 
	 * @example:
	 * |unieap.byId("basicTree").getLoader().setUrl("/getTreeNode.do?method=getData")
	 *  重新设置树加载数据所请求的地址
	 */
    getLoader: function(){
        return this.getModuleInstance("loader", this.treeLoaderClass);
    },
	
	/**
	 * @summary：
	 * 		返回树拖拽相关的类，一般较少用到
	 * @return
	 * 		{object} 
	 * @example:
	 * |var source =  unieap.byId("basicTree").getDndSource();
	 */
	getDndSource : function(){
		if(this.treeDnd){
			return this.getModuleInstance("treeDnd", this.dndSourceClass);
		}else
		     return null;
	},
	
   /**
	 * @summary：
	 * 		返回根结点的显示值
	 * @return
	 * 		{string} 
	 * @example:
	 * |unieap.byId("basicTree").getText();
	 */
	getText : function(){
		 return this.label;
	},
	
	/**
	 * @summary：
	 * 		展开指定节点，如果指定节点为叶子节点或者该节点已经展开则不做其他操作
	 * @param node
	 * 		{unieap.tree.TreeNode} 
	 * @example:
	 * |var treeNode = unieapTree.getNodeById("1"); //获得id为“1”的树节点 
	 * |unieapTree.expandNode(treeNode); //展开该节点     
	 */
	expandNode:function(node){
		if(!node)
		    return ;
		this._expandNode(node.domNode);
	},
	
	/**
	 * @summary：
	 * 		收起指定节点的子节点
	 * @param 
	 * 		{unieap.tree.TreeNode} node
	 * @example:
	 * |var treeNode = unieapTree.getNodeById("1"); //获得id为“1”的树节点 
	 * |unieapTree.collapseNode(treeNode); //收拢该节点
	 */
	collapseNode: function(node,animation){
		if(!node)
		     return;
        this._collapseNode(node.domNode,animation);
    },
	
	/**
	 * @summary：
	 * 		加载当前节点的子节点数据，并执行指定回调函数
	 * @param:
	 * 		{object} item  树节点对应的数据对象
	 * @param:
	 *     {function}callback
	 * @example:
	 * |var node = unieap.byId("basicTree").getCurrentNode();
	 * |unieap.byId("basicTree").loadNodeData(node.getItem(),function(items){unieap.debug(items)});
	 */
	loadNodeData : function(item,callback){
		this.getBinding().getChildren(item,callback);
	},
	
	/**
	 * @summary：
	 * 		得到当前节点的路径，不包含根节点
	 * @param:
	 * 		{unieap.tree.TreeNode} node
	 *  @return 
	 *     {string}
	 * @example:
	 * |var node = unieap.byId("basicTree").getCurrentNode(); 
	 * |alert(unieap.byId("basicTree").getPath(node)); 
	 * @img:
	 *      images/tree/getPath.png
	 */
	getPath : function(node){
		if(!node)
		    return null;
	    if(node.isRoot()){
			return this.pathSeparator;
		}
		var b = [this.getBinding().getId(node.getItem())];
        var p = this.getParentByDom(node.domNode);
        while(p){
			if(p==this.rootNodeUI.domNode)
			       break;
            b.unshift(this.getBinding().getId(p.associatedData.item));
            p = this.getParentByDom(p);
        }
        var sep = this.pathSeparator;
        return sep + b.join(sep);
	},
	
    //根据节点的domNode，返回对应的unieap.tree.TreeNode对象
	getNodeByDom : function(domNode){
		return this._createTreeNode({
			item:domNode.associatedData.item,
			domNode : domNode,
			tree:this
		});
	},
	
	 /**
	 * @summary：
	 * 		得到当前节点的数据对象
	 * @description:
	 * 		返回对应的unieap.tree.TreeNode对象
	 * @param 
	 * 		{object} item
	 * @return 
	 *     	{unieap.tree.TreeNode}
	 * @example:
	 * |var node = unieap.byId("basicTree").getNodeByItem(item);
	 */
	getNodeByItem : function(item){
		if (item.domNode) {
			return this._createTreeNode({
				item: item,
				domNode: item.domNode,
				tree: this
			});
		}
		else 
			return null;
	},

	/**
	 * @summary:
	 *		根据数据结构中id字段的值，得到对应的TreeNode对象
	 * @description:
	 * 		若对应domNode尚未生成或者该id对应节点不存在，返回null
	 * @param:   
	 *      {string}id
	 * @return 
	 *     	{unieap.tree.TreeNode}
	 * @example:
	 * |unieap.byId("basicTree").getNodeById("1"); //获取id值为“1”的TreeNode对象
	 *  
	 */
    getNodeById : function(id){
		if(this._nodeMap[id])
		  return this._createTreeNode({
					item: this._nodeMap[id].associatedData.item,
					domNode: this._nodeMap[id],
					tree: this
				});
		else  
		    return null;
	},
	
	/**
	 * @summary:
	 *		在支持复选的情况下，将指定节点设置为选中或非选中状态。
	 * @description:
	 *		会按照树指定的复选逻辑关联相关节点
	 * @param   
	 *      {unieap.tree.TreeNode}node
	 * @param    
	 *      {boolean}checked
	 * @param:
	 * 		{boolean}withLogic
	 * @example:
	 * |var node = unieap.byId("basicTree").getNodeById("7"); 
	 * |unieap.byId('basicTree').setChecked(node,true); 
	 */
	setChecked : function(node,checked,withLogic,evt){
		if(!node||node.isReadOnly()||node.isDisabled()||!this.getCheckLogic())
		     return;
		if (withLogic!=null&&withLogic!="undefined"&&withLogic==false)
			this.getCheckLogic().setChecked(node,checked,"Multiple",evt);
		else
			this.getCheckLogic().setChecked(node,checked,null,evt);
	},
	
	/**
	 * @summary:
	 *		按照节点的id展开并显示节点
	 * @description:
	 *		若此时节点尚未生成，将会构造树的数据，若最终能够找到该id，则按照层级展开节点.
	 *		若找不到则只是将树的数据构造完整，如果数据量比较大或者懒加载数据，建议慎用此方法
	 * @param   
	 *      {string||array} inData 想要展开节点
	 * @param   
	 *      {function} callback 得到节点后要执行的回调函数
	 * @example 
	 * |inData="workflow,form,report"
	 * |inData=["workflow","form","report"]
	 * @example:
	 * |unieap.byId('basicTree').showNodesById('3,7'); //参数为一个字符串，即由树节点的id组成，用逗号分割。 
	 * @example:
	 * |var array = ['3','7']; 
	 * |unieap.byId('basicTree').showNodesById(array); 
	 */
	showNodesById : function(inData,callback){
		this.callback = callback || function(){};
		var pathArr = (dojo.isString(inData) ? inData.split(",") : inData) , 
			    pathMap = {};		
		for(var i = pathArr.length-1;i>=0;i--){
			var id = pathArr[i];
			if(id in this._nodeMap){
				var node = this.getNodeByDom(this._nodeMap[id]);
				var parentNode  = node.getParent();
				if(parentNode){
					var path = this.getPath(parentNode);
					this.expandNodeByPath(path);					
				}
				this.setCurrentNode(node);
				this.callback(node);				
				continue;
			}
			pathMap[id] = 1;
		}
		if (unieap.isEmpty(pathMap)) {
			this.callback = null;
			return;
		}
		this.stack = [];
	    this.dataStack = [];
	    this.pathMap = pathMap;
	    var root = this.getBinding().getRootNodeItem();
	    this.searchNode(root);		
	} ,
	
	//	showNodeById的辅助方法
	searchNode : function(iniItitem){
		if(iniItitem==null) return;
	    this.stack.push(iniItitem);
	    var onComplete=dojo.hitch(this,function(items){
	        items = items || [];
	        var tmpItems = [];
			var childrenItems = []
			for(var i=0,item;(item = items[i]);i++){
				if (item.loaded)
					childrenItems.unshift(item);
				else
					childrenItems.push(item);
			}
			
			iniItitem.last = childrenItems[childrenItems.length - 1];
			
	        for(var i=0,item;(item = childrenItems[i]);i++){
	        	var id = String(this.getBinding().getId(item));
	        	if(id in this.pathMap){
					 var path = [];
					 for(var k=1,ll = this.stack.length; k<ll;k++){
					 	path[k] = this.getBinding().getId(this.stack[k]);
					 }
					 path = path.join(this.pathSeparator);			 
		             this.expandNodeByPath(path);
					 var targetNode = this.getNodeById(id);
					 this.setCurrentNode(targetNode);
					 this.callback(targetNode)
					 delete this.pathMap[id];
					 continue;
		       } 
		       if(!this.getBinding().isLeaf(item)){
		       		tmpItems.push(item);
		       }
	        }
	        if(unieap.isEmpty(this.pathMap)) {
			    this.callback = null;
			    return;
		     }
	        Array.prototype.unshift.apply(this.dataStack,tmpItems);
	        if(tmpItems.length==0){
	            var child,parent;
	            do{
	                 child = this.stack.pop();
	                 delete child.last;
	                 parent = this.stack[this.stack.length-1];
	              }while(parent&&iniItitem.last==child); //最后一个节点都pop出去
	        }
			if(arguments[1]!=false){ //同步请求
				throw new Error("break onComplete");
			}else{ //异步请求
				this.searchNode(this.dataStack.shift());
			}
	    });
	    try{
	   	 	this.loadNodeData(iniItitem,onComplete);
	    }catch(e){
	    	this.searchNode(this.dataStack.shift());
	    }
	},

	
	/****************************innernal event*************************************/
	//设置全局树节点的dom和item引用
	_setGlobalTreeNode : function(domNode,item){
		this.globalTreeNode.domNode = domNode;
	    this.globalTreeNode.item = item;
		this.globalTreeNode.tree = this;
		this.globalTreeNode.readOnly = domNode.associatedData.readOnly;
		this.globalTreeNode.disabled = domNode.associatedData.disabled;
	},
	
	//对点击事件的监听
    _onClick: function(evt){
		if(this._editing){
			return;
		}
        var domElement = evt.target;
		var treeDomNode = this._getTreeDomNodeByEvent(evt);  
		if(!treeDomNode){
			return;
		}
		dojo.stopEvent(evt);
		this.focusNode(treeDomNode);
	   //this._setGlobalTreeNode(treeDomNode,treeDomNode.associatedData.item);
	    var node = this.getNodeByDom(treeDomNode);
		if(domElement == this.getCheckboxNode(treeDomNode)||domElement == this.getCheckboxInputNode(treeDomNode)){
			this._handleCheckboxClick(node,evt);
		}
        else if (domElement == this.getExpandoNode(treeDomNode)) {
            if (!this.isLeafByData(node.getItem())) { 
                this._onExpandoClick(node);
            }
        }
        else {
        	if(this.expandByOnClickLabel && (domElement == this._expandByOnClickLabel(treeDomNode) || domElement == this._getExpandLabelFileNode(treeDomNode))){
        			this._onExpandoClick(node);
        	}
            this._selectedNode = treeDomNode;
            this._handleClick(node);
        }
    },
	//点击到复选文本框的时候，会触发的事件
    _handleCheckboxClick : function(node,evt){
		//如果节点是只读或者不可用状态，则不允许进行复选
		if(node.isReadOnly()||node.isDisabled()){
			return;
		}
		var checked;
		if(node.domNode.associatedData.isRoot)
			checked = !node.domNode.associatedData.isChecked;
		else
			checked = !node.isChecked();
		if(this.getCheckLogic()){
			this.setChecked(node,checked,null,evt);
		}else{
			return;
		}
	},
	//标示展开节点的dom被点击后触发的事件
    _onExpandoClick: function(node){
        if (node.isOpend()) {
            this._collapseNode(node.domNode);
        }
        else {
            this._expandNode(node.domNode);
        }
    },
    
    //
    _onKeyPress: function(e){
      //如果节点正在编辑，则不处理导航和监听事件
      if(this.getEditor()&&this._editing == true)
	      return;
	  if(e.altKey){ return; }
	  //节点的导航是以当前节点为起始位置的
	  var node = this.getCurrentNode();
	  if(node&&node.isDisabled())
		   return;
	  if(!node){ return; } 
	  var dk = dojo.keys;
	  var key = e.charOrCode;
	  if(typeof key == "string"){  //如果输入了字符键，无视
		 dojo.stopEvent(e);
		 return ;
	  }else{  // 如果不是字符键，需要进行导航的处理
		var map = this._keyHandlerMap;
			if(!map){
				//定义对不同键盘事件的监听函数
				map = {};
				map[dk.ENTER]="_onEnterKey";
				map[dk.UP_ARROW]="_onUpArrow";
				map[dk.DOWN_ARROW]="_onDownArrow";
				map[dk.LEFT_ARROW]="_onLeftArrow";
				map[dk.RIGHT_ARROW]="_onRightArrow";
				map[dk.HOME]="_onHomeKey";
				map[dk.END]="_onEndKey";
				this._keyHandlerMap = map;
			}
			if(this._keyHandlerMap[key]){
				this[this._keyHandlerMap[key]](node);
				dojo.stopEvent(e);
			}
		}	  
    },
    
	//左键点击事件
	//对于已经展开的非叶子节点将其收起
	//对于叶子节点或者已经收起的非叶子节点，将当前节点的父节点设为当前节点
	_onLeftArrow : function(node){
		if(!node.isLeaf()&&node.isOpend()){
			this.collapseNode(node);
		}else{
			var parentNode = node.getParent();
			if(parentNode&&!parentNode.isRoot()){
				this.setCurrentNode(parentNode);
			}else if(parentNode&&parentNode.isRoot()&&this.showRoot){
				this.setCurrentNode(parentNode);
			}else{
				return;
			}
		}
	},
	
	//右键点击事件
	//对于叶子节点，不进行任何操作
	//对于非叶子节点，若节点没有处于展开状态，则将其展开，若已经展开，则将当前节点移向其第一个子节点
	_onRightArrow : function(node){
		if(!node.isLeaf()&&!node.isOpend()){
			this.expandNode(node);
		}else if(!node.isLeaf()){
			var firstChildNode = node.getFirstChild();
			if(firstChildNode){
			    this.setCurrentNode(firstChildNode);
			}
		}
	},
	//点击up键，将会导航至上一可见节点
	_onUpArrow : function(node){
		//试图将焦点置于当前节点上，如果失败的话，意味着当前节点不可见，则不进行后续的操作了
		try{
			this.focusNode(node.getDomNode());
		}catch(e){
			return;
		}
	    var previousSibling = node.getPreviousChild();
		if(previousSibling){
			node = previousSibling;
			while(!node.isLeaf()&& node.isOpend()&&node.getChildren()){
				var children = node.getChildren();
				node = children[children.length-1];
			}
		}else{
			var parent = node.getParent();
			if(!(!this.showRoot && parent.isRoot())){
				node = parent;
			}
		}
		if(node){
			this.setCurrentNode(node);
		}
	},
	
	//点击down键，将会导航至下一可见节点
	_onDownArrow : function(node){
		//试图将焦点置于当前节点上，如果失败的话，意味着当前节点不可见，则不进行后续的操作了
		try{
			this.focusNode(node.getDomNode());
		}catch(e){
			return;
		}
		var nextNode = this._getNextNode(node);
		if(nextNode){
				this.setCurrentNode(nextNode);
		}
	},
	
	//得到下一节点的内部方法
	_getNextNode : function(node){
		var children=node.getChildren();
		//如果node下面有子节点
		if(!node.isLeaf()&& node.isOpend()&&children){
			// if this is an expanded node, get the first child
			return children[0];		// _TreeNode	
		}else{
			// find a parent node with a sibling
			while(node){
				var returnNode = node.getNextChild();
				if(returnNode){
					return returnNode;		// _TreeNode
				}
				node = node.getParent();
			}
			return null;
		}
	},
	//点击回车键，将会触发用户自定义的逻辑
	_onEnterKey : function(node){
		unieap.fireEvent(this,this.onEnterKeyPress,[node]);
	},
	
	//点击home键，将会移至根节点或者第一个节点
	_onHomeKey : function(node){
		var node = this._getRootOrFirstNode();
		if(node){
		    this.setCurrentNode(node);
		}
	},
	
	//得到根节点或第一个节点的内部方法
	_getRootOrFirstNode: function(){
		return this.showRoot ? this.getRootNode() : this.getRootNode().getChildren()[0];
	},
	
	//点击end键，将会移至最后一个可见节点
	_onEndKey : function(node){
		var node = this.getRootNode();
		while(node.isOpend()){
			var c = node.getChildren();
			node = c[c.length - 1];
		}
		if(node){
			this.setCurrentNode(node);
		}
	},
	
	//右键事件的监听
    _onContextMenu: function(evt){
		var treeDomNode = this._getTreeDomNodeByEvent(evt); 
		dojo.stopEvent(evt);
		if (!treeDomNode||treeDomNode.associatedData.disabled) {
            return;
        }
        this._setGlobalTreeNode(treeDomNode,treeDomNode.associatedData.item);
        var currentTreeNode = this.getNodeByDom(treeDomNode);
        unieap.fireEvent(this,this.onContextMenu,[currentTreeNode]);
    },
    
   //双击事件的监听
    _onDblClick: function(evt){
		var domElement = evt.target;
		 var treeDomNode = this._getTreeDomNodeByEvent(evt);  
        if (!treeDomNode||treeDomNode.associatedData.disabled) {
            return;
        }
        this.focusNode(treeDomNode);
		if(domElement == this.getExpandoNode(treeDomNode)||domElement == this.getCheckboxNode(treeDomNode)){
			 return ;
		}
        else {
			this._setGlobalTreeNode(treeDomNode,treeDomNode.associatedData.item);
			unieap.fireEvent(this,this.onDblClick,[this.globalTreeNode]);
        }
    },
    
	//点击在节点的文字部分会触发的事件
    _handleClick: function(node){
		if(node.isDisabled())
		   return;
        var flag = unieap.fireEvent(this,this.onBeforeClick,[node]);
        if (flag === false) {
            return;
        }
		if(this.getEditor()&&this.lastFocused == node.domNode&&!node.isReadOnly()&&!node.isDisabled()){
			this._editing = true;
			var nodeForEdit = this.getNodeByDom(node.domNode);
			this.getEditor().editNode(nodeForEdit);
		}else {
			this.setCurrentNode(node);
		}
        flag = unieap.fireEvent(this,this.onClick,[node]);
        if (flag === false) {
            return;
        }
        unieap.fireEvent(this,this.onAfterClick,[node]);
    },
	
	//设置节点为当前节点，并增加聚焦的样式
    _onTreeFocus: function(domNode){
        if (domNode != this.lastFocused) {
            this.blurNode();
        }
        var labelNode = this.getLabelNode(domNode);
        var contentNode = this.getContentNode(domNode);
        labelNode.setAttribute("tabIndex", "0");
        dojo.removeClass(contentNode, "unieapTreeMouseOver");
        dojo.addClass(contentNode, "dijitTreeLabelFocused");
        dojo.removeClass(labelNode, "dijitTreeLabel");
        dojo.addClass(labelNode, "dijitTreeLabelFocused");
        this.lastFocused = domNode;
    },
	
	//鼠标移出的事件
	_onMouseOut : function(evt){
	    var treeDomNode = this._getTreeDomNodeByEvent(evt);  
        if (!treeDomNode||treeDomNode.associatedData.disabled) {
            return;
        }
		dojo.removeClass(this.getContentNode(treeDomNode), "unieapTreeMouseOver");
		this._setGlobalTreeNode(treeDomNode,treeDomNode.associatedData.item);
		unieap.fireEvent(this,this.onMouseOut,[this.globalTreeNode,evt]);
	},
	
	//鼠标移入的事件
	_onMouseOver : function(evt){
       var treeDomNode = this._getTreeDomNodeByEvent(evt);  
        if (!treeDomNode||treeDomNode.associatedData.disabled) {
            return;
        }
        if (treeDomNode != this.lastFocused) {
            dojo.addClass(this.getContentNode(treeDomNode), "unieapTreeMouseOver");
        }
		this._setGlobalTreeNode(treeDomNode,treeDomNode.associatedData.item);
		unieap.fireEvent(this,this.onMouseOver,[this.globalTreeNode,evt]);
	},
	
	//鼠标点击的事件
	_onMouseDown : function(evt){
		var treeDomNode = this._getTreeDomNodeByEvent(evt);  
        if (!treeDomNode||treeDomNode.associatedData.disabled) {
            return;
        }
		this._setGlobalTreeNode(treeDomNode,treeDomNode.associatedData.item);
		unieap.fireEvent(this,this.onMouseDown,[this.globalTreeNode,evt]);
	},
	
	//由event得到相关的节点
	_getTreeDomNodeByEvent : function(evt){
		var domElement = evt.target;
		if(dojo.hasClass(domElement,"dijitTreeContainer"))
		    return null;
		var treeDomNode = null;
		for(var p=domElement; p; p=p.parentNode){
			var flag = p.getAttribute && p.getAttribute("isTreeNode");
			if(flag){
				 treeDomNode =  p;
				 break;
			}
		}
		return treeDomNode;
	},
	
	/***************************event for user********************************************/
	
	/**
	 * @summary:
	 *       对节点的点击事件进行监听，当点击到某个节点的label或icon区域时触发该事件，若返回false将会阻止默认的操作
	 * @param  
	 *        {unieap.tree.TreeNode}node
	 * @example:
	 * |<div dojoType="unieap.tree.Tree" id="basicTree"  animate="false" 
	 * |	label="UniEAP" onBeforeClick="beforeClick" 
	 * |	binding = "{'leaf':'leaf', 'store':treeStorePart,
	 * |		'parent':'parentID', query:{name:'parentID',relation:'=',value:''} }"> 
	 * |</div>
	 * |function beforeClick(node){ 
	 * |	if(node.getLabel()=="UniEAP"){ 
	 * |		alert("不允许点击该节点！") 
	 * |		return false; 
	 * |	}else{ 
	 * |		return true; 
	 * |	}
	 * |} 
	 */
	onBeforeClick: function(node){
    },
	
	/**
	 * @summary:
	 *       对节点的点击事件进行监听，当点击到某个节点的label或icon区域时触发该事件
	 * @param  
	 *       {unieap.tree.TreeNode}node
	 * @example:
	 * |<div dojoType="unieap.tree.Tree" id="basicTree"  
	 * |	animate="false" label="UniEAP" onClick="nodeClick" 
	 * |	binding = "{'leaf':'leaf', 'store':treeStorePart,
	 * |		'parent':'parentID', query:{name:'parentID',relation:'=',value:''} }"> 
	 * |</div>
	 * |function nodeClick(node){ 
	 * |	alert("您点击了"+node.getLabel()); 
	 * |} 
	 */
    onClick: function(node){
    },
	
	/**
	 * @summary:
	 *       对节点的点击事件进行监听，会在onClick事件后执行
	 * @param  
	 *        {unieap.tree.TreeNode}node
	 * @example:
	 * |<style> 
	 * |	.unieap .fontLabel{ 
	 * |		font-style:italic; 
	 * |		font-weight:bolder; 
	 * |		font-size:14px; 
	 * |		font-family: Arial; 
	 * |		background-color:yellow; 
	 * |	} 
	 * |</style> 
	 * |function afterNodeClick(node){ 
	 * |	//获取label部分的domNode 
	 * |	var labelDom = unieap.byId("basicTree").getLabelNode(node.getDomNode()); 
	 * |	//点击树节点以后，设置该节点label的样式。 
	 * |	labelDom.className="fontLabel"; 
	 * |}
	 * |<div dojoType="unieap.tree.Tree" id="basicTree"  animate="false" label="UniEAP" 
	 * |	onAfterClick="afterNodeClick" 
	 * |	binding = "{'leaf':'leaf', 'store':treeStorePart,
	 * |		'parent':'parentID', query:{name:'parentID',relation:'=',value:''} }">
	 * |</div>
	 * 点击树节点以后，设置该节点label的样式。 
	 */
    onAfterClick: function(node){
    },
	
	/**
	 * @summary:
	 *       对节点的样式进行更新后触发该事件，若自定义节点样式的话，可以监听本事件
	 * @param  
	 *       {unieap.tree.TreeNode}node
	 * @example:
	 * |<style> 
	 * |	.unieap .fontLabel{ 
	 * |		font-style:italic; 
	 * |		font-weight:bolder; 
	 * |		font-size:14px; 
	 * |		font-family: Arial; 
	 * |		background-color:yellow; 
	 * |	} 
	 * |</style> 
	 * |function afterNodeSetClass(node){ 
	 * |    if(node.isLeaf()){
	 * |		//获取label部分的domNode 
	 * |		var labelDom = unieap.byId("basicTree").getLabelNode(node.getDomNode()); 
	 * |		//对叶子节点使用自定义的样式。
	 * |		labelDom.className="fontLabel";  
	 * |	}
	 * |}
	 * |<div dojoType="unieap.tree.Tree" id="basicTree"  label="UniEAP" 
	 * |	onSetNodeClass="afterNodeSetClass" 
	 * |	binding = "{'leaf':'leaf', 'store':treeStorePart,
	 * |		'parent':'parentID', query:{name:'parentID',relation:'=',value:''}}">
	 * |</div>
	 */
	onSetNodeClass : function(node){
	},
	
	/**
	 * @summary:
	 *       鼠标移到节点上触发该事件
	 * @param  
	 *       {unieap.tree.TreeNode}node
	 * @example:
	 * |<style> 
	 * |	.unieap .fontLabel{ 
	 * |		font-style:italic; 
	 * |	} 
	 * |</style> 
	 * |function nodeMouseOver(node){ 
	 * |	//获取label部分的domNode 
	 * |	var labelDom = unieap.byId("basicTree").getLabelNode(node.getDomNode()); 
	 * |	//当鼠标移到树节点上，设置该节点label的样式。 
	 * |	labelDom.className="fontLabel"; 
	 * |}  
	 * |<div dojoType="unieap.tree.Tree" id="basicTree"  animate="false" label="UniEAP" 
	 * |	onMouseOver="nodeMouseOver" 
	 * |	binding = "{'leaf':'leaf', 'store':treeStorePart,
	 * |		'parent':'parentID', query:{name:'parentID',relation:'=',value:''}}">
	 * |</div>   
	 *  当鼠标移到树节点上，设置该节点label的样式。  
	 */
	onMouseOver : function(node){
	},
	
	/**
	 * @summary:
	 *       鼠标移出节点时触发该事件
	 * @param  
	 *       {unieap.tree.TreeNode}node
	 * @example:
	 * |function nodeMouseOut(node){ 
	 * |	//获取label部分的domNode 
	 * |	var labelDom = unieap.byId("basicTree").getLabelNode(node.getDomNode()); 
	 * |	//当鼠标移出树节点上，设置该节点label的样式。“dijitTreeLabel”为UniEAP树默认的label样式 
	 * |	labelDom.className="dijitTreeLabel"; 
	 * |} 
	 * |<div dojoType="unieap.tree.Tree" id="basicTree"  animate="false" label="UniEAP" 
	 * |	onMouseOut="nodeMouseOut" 
	 * |	binding = "{'leaf':'leaf', 'store':treeStorePart,
	 * |		'parent':'parentID', query:{name:'parentID',relation:'=',value:''} }">
	 * |</div>
	 */
	onMouseOut : function(node){
	},
	
	/**
	 * @summary:
	 *       鼠标在节点上点击触发该事件
	 * @param  
	 *       {unieap.tree.TreeNode}node
	 * @example:
	 * |function nodeMouseDown(node){ 
	 * |	alert(node.getLabel()); 
	 * |} 
	 * |<div dojoType="unieap.tree.Tree" id="basicTree"  animate="false" 
	 * |	label="UniEAP" onMouseDown="nodeMouseDown" 
	 * |	binding = "{'leaf':'leaf','store':treeStorePart,
	 * |		'parent':'parentID', query:{name:'parentID',relation:'=',value:''} }">
	 * |</div>
	 */
	onMouseDown: function(node){
	 	
    },
	
	/**
	 * @summary:
	 *       鼠标在节点上双击触发该事件
	 * @param  
	 *       {unieap.tree.TreeNode}node
	 * @example:
	 * |function nodeDbClick(node){ 
	 * |	alert("您双击了节点："+node.getLabel()); 
	 * |} 
	 * |<div dojoType="unieap.tree.Tree" id="basicTree" 
	 * |	animate="false" label="UniEAP" onDblClick="nodeDbClick" 
	 * |	binding = "{'leaf':'leaf', 'store':treeStorePart,
	 * |		'parent':'parentID', query:{name:'parentID',relation:'=',value:''}}">
	 * |</div>
	 */
	onDblClick : function(node){
	},
	
	/**
	 * @summary:
	 *       鼠标在节点点击右键触发
	 * @param  
	 *        {unieap.tree.TreeNode}node
	 * @example:
	 * |function nodeContextMenu(node){ 
	 * |	alert("您右键点击了节点："+node.getLabel()); 
	 * |} 
	 * |<div dojoType="unieap.tree.Tree" id="basicTree"  animate="false" 
	 * |	label="UniEAP" onContextMenu="nodeContextMenu" 
	 * |	binding = "{'leaf':'leaf', 'store':treeStorePart,
	 * |		'parent':'parentID', query:{name:'parentID',relation:'=',value:''} }">
	 * |</div>
	 */
	onContextMenu : function(node){
	},
	
	/**
	 * @summary:
	 *       节点在收起前触发的事件
	 * @param  
	 *       {unieap.tree.TreeNode}node
	 * @example:
	 * |function beforeCollapse(node){ 
	 * |	return confirm("确定要收拢树节点么？"); 
	 * |} 
	 * |<div dojoType="unieap.tree.Tree" id="basicTree" 
	 * |	animate="false" label="UniEAP" 
	 * |	onBeforeCollapse="beforeCollapse" 
	 * |	binding = "{'leaf':'leaf', 'store':treeStorePart,
	 * |		'parent':'parentID', query:{name:'parentID',relation:'=',value:''} }">
	 * |</div>
	 */
	onBeforeCollapse: function(node){
	},
	
	/**
	 * @summary:
	 *       节点在收起后触发的事件
	 * @param  
	 *       {unieap.tree.TreeNode}node
	 * @example:
	 * |function afterCollapse(node){ 
	 * |	alert("节点"+node.getLabel()+"已经收拢！"); 
	 * |} 
	 * |<div dojoType="unieap.tree.Tree" id="basicTree"  animate="false" label="UniEAP" 
	 * |	onAfterCollapse="afterCollapse" 
	 * |	binding = "{'leaf':'leaf', 'store':treeStorePart,
	 * |		'parent':'parentID', query:{name:'parentID',relation:'=',value:''} }">
	 * |</div>
	 */
	onAfterCollapse: function(node){
		
	},
	
	/**
	 * @summary:
	 *       节点在展开前触发的事件
	 * @param  
	 *       {unieap.tree.TreeNode}node
	 * @example:
	 *  |function beforeExpand(node){ 
	 *  |	return confirm("确定要展开树节点么？"); 
	 *  |} 
	 *  |<div dojoType="unieap.tree.Tree" id="basicTree"  animate="false" label="UniEAP" 
	 *  |	onBeforeExpand="beforeExpand" 
	 *  |	binding = "{'leaf':'leaf', 'store':treeStorePart,
	 *  |		'parent':'parentID', query:{name:'parentID',relation:'=',value:''} }">
	 *  |</div>
	 */
	onBeforeExpand: function(node){

	},
	
	/**
	 * @summary:
	 *       节点在展开后触发的事件
	 * @param  node
	 *       {unieap.tree.TreeNode}
	 * @example:
	 * |function afterExpand(node){ 
	 * |	alert("节点"+node.getLabel()+"已经展开！"); 
	 * |} 
	 * |<div dojoType="unieap.tree.Tree" id="basicTree"  animate="false" 
	 * |	label="UniEAP" onAfterExpand="afterExpand" 
	 * |	binding = "{'leaf':'leaf', 'store':treeStorePart,
	 * |		'parent':'parentID', query:{name:'parentID',relation:'=',value:''} }">
	 * |</div> 
	 */
	onAfterExpand: function(node){
		
	},
	
   	/**
	 * @summary:
	 *     在选中所有节点前触发的事件，若返回值为false，将会阻止真正的全选
	 * @example:
	 * |function beforeSelectAll(){ 
	 * |	//自定义逻辑 
	 * |} 
	 * |<div dojoType="unieap.tree.Tree" id="basicTree"  
	 * |	label="UniEAP" onBeforeSelectAll="beforeSelectAll"  checkLogic="{}"
	 * |	binding = "{'leaf':'leaf', 'store':treeStorePart,
	 * |		'parent':'parentID', query:{name:'parentID',relation:'=',value:''} }">
	 * |</div>          
	 */
	onBeforeSelectAll: function(){
		
	},
	
	/**
	 * @summary:
	 *      在选中所有节点后触发的事件
	 * @example:
	 * |function afterSelectAll(){ 
	 * |	alert("节点已经全选"); 
	 * |} 
	 * |<div dojoType="unieap.tree.Tree" id="basicTree"  
	 * |	label="UniEAP" onAfterSelectAll="afterSelectAll"  checkLogic="{}"
	 * |	binding = "{'leaf':'leaf', 'store':treeStorePart,
	 * |		'parent':'parentID', query:{name:'parentID',relation:'=',value:''} }">
	 * |</div> 
	 */
	onAfterSelectAll: function(){
		
	},
	
    /**
	 * @summary:
	 *        在将一个节点设置为当前节点前触发的事件
	 * @param  
	 *        {unieap.tree.TreeNode}node
	 * @return 
	 *    boolean
	 * @example:
	 * |function beforeSetCurrentNode(node){ 
	 * |	return confirm("确定要设置该节点为当前节点么？"); 
	 * |} 
	 * |<div dojoType="unieap.tree.Tree" id="basicTree"  animate="false" 
	 * |	label="UniEAP" onBeforeSetCurrentNode="beforeSetCurrentNode" 
	 * |	binding = "{'leaf':'leaf', 'store':treeStorePart,
	 * |		'parent':'parentID', query:{name:'parentID',relation:'=',value:''} }">
	 * |</div> 
	 */
	onBeforeSetCurrentNode : function(node){
		return true;
    },
	
    /**
	 * @summary:
	 *       在将一个节点设置为当前节点后触发的事件
	 * @param  
	 *       {unieap.tree.TreeNode}node
	 * @example:
	 * |function afterSetCurrentNode(node){ 
	 * |	alert("当前节点为："+node.getLabel()); 
	 * |}
	 * |<div dojoType="unieap.tree.Tree" id="basicTree"  animate="false" label="UniEAP" 
	 * |	onAfterSetCurrentNode="afterSetCurrentNode" 
	 * |	binding = "{'leaf':'leaf', 'store':treeStorePart,
	 * |		'parent':'parentID', query:{name:'parentID',relation:'=',value:''} }">
	 * |</div> 
	 */
	onAfterSetCurrentNode : function(node){
		
	},
	
	 /**
	 * @summary:
	 *       在树上点击回车键会触发的事件，参数为当前节点
	 * @param  
	 *       {unieap.tree.TreeNode}node  当前节点
	 * @example:
     * |function onEnterKeyPress(node){ 
     * |	//节点若不是叶子节点，点击回车键的时候，将其展开
     * |	if(!node.isLeaf())
	 * |		unieap.byId("basicTree").expandNode(node); 
	 * |}
	 * |<div dojoType="unieap.tree.Tree" id="basicTree"  animate="false" label="UniEAP" 
	 * |	onEnterKeyPress="onEnterKeyPress" 
	 * |	binding = "{'leaf':'leaf', 'store':treeStorePart,
	 * |		'parent':'parentID', query:{name:'parentID',relation:'=',value:''} }">
	 * |</div> 
	 */
	onEnterKeyPress : function(node){},
	
	/**
	 * @summary:
	 *		刷新指定树节点的显示文本
	 * @param 
	 *    	{unieap.tree.TreeNode} node
	 * @example:
	 * |var node = unieap.byId("basicTree").getCurrentNode();
	 * |var row = unieap.byId("basicTree").getBinding().getRow(node);
	 * |row.setItemValue("label","新数据");
	 * |unieap.byId("basicTree").freshNodeLabel(node);
	 */
	freshNodeLabel : function(node){
		if(node&&this.getLabelNode(node.domNode)){
			var label = this.getBinding().getLabel(node.getItem());
			var oldLabel = this.getLabelNode(node.domNode).innerHTML;
			if(label!=oldLabel){
				if (!label){
					label = '';
				}
				else{
					label = String(label).replace(/&/g,"&amp;").
							 replace(/</g,"&lt;").
							 replace(/>/g,"&gt;").
							 replace(/\s/g,"&nbsp;");
				}		
				this.getLabelNode(node.domNode).innerHTML = label;
			}
		}
	},
	fireDataChange : function(node){
		this.freshNodeLabel(node);
	},
	
	/**
	 * @summary:
	 *       树节点生成时的事件
	 * @param  
	 *       {unieap.tree.TreeNode} node 当前节点
	 * @example:
	 * |function beforeNodeRender(node){ 
	 * |	alert(node.getLabel()); 
	 * |} 
	 * |<div dojoType="unieap.tree.Tree" id="basicTree"
	 * |	label="UniEAP" onAfterNodeRender="beforeNodeRender" 
	 * |	binding = "{'leaf':'leaf', 'store':treeStorePart,
	 * |		'parent':'parentID', query:{name:'parentID',relation:'=',value:''} }">
	 * |</div>        
	 */
	onAfterNodeRender : function(node){}
	
});