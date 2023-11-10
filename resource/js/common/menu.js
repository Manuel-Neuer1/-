jQuery.namespace("sysmenu");

sysmenu.version = 1.0 ;//用于在cp初始化中的判断

//隐藏下面列表中的所有菜单
sysmenu.menus = ['sys/uacm/profile' , 'up/calendar' , 'sys/uacm/msgcenter' , 'up/publicity/show' , 'up/publicity','fp/serveapply', 'apps/meeting/meetingHome'] ;

sysmenu.addSecondTab = function(item_id , item_url , item_name , second_item_id , active , refresh){
	$(window).unbind("hashchange");
	//如果已经已经添加过了
	if($("#tab_dynamic_"+item_id).length>0){
		return ;
	}
	var dom = $('<li class="swiper-slide '+(active?"active":"")+'" id="tab_dynamic_'+item_id+'"> <a class="ui-link" name="a_tab_second_item">'+item_name+
			'<font style="position:absolute;top: 5px;right: 5px;font-size:12px;line-height:1;">x</font><span class="shadow"></span></a> </li>');
	//关闭当前tab事件
	dom.find("font").unbind("click").click(function(event){
		var $li = $(this).parent().parent() ;
		var $pre = $li.prevAll().find("a[name='a_tab_second_item']:visible").last() ;
		var $next = $li.nextAll().find("a[name='a_tab_second_item']:visible").first() ;
		if($li.hasClass("active") && $next.length>0){
			$next.parent().addClass("active");//高亮后一个
			$next.trigger("click");
		}else if($li.hasClass("active") && $pre.length>0){
			$pre.parent().addClass("active");//高亮前一个
			$pre.trigger("click");
		}else if($li.hasClass("active")){
			Msg.info("最后一个Tab页面不可关闭");
			return ;
		}
		 event.stopPropagation();
		 if(sessionStorage){
				var tabs = sessionStorage.getItem("secondTabMenu");
				tabs = $.parseJSON(tabs);
				tabs = $.grep(tabs, function(o) {
					return o.item_id != $li.attr("id").replace("tab_dynamic_","");
				});
				sessionStorage.setItem("secondTabMenu", JSON.stringify(tabs));
		 }
		 $li.remove();//隐藏当前菜单
	});

	//选中当前tab事件
	dom.unbind("click").click(function(event){
		sysmenu.hideMenu();
		$("a[name='a_tab_second_item']").parent().removeClass("active");
		$(this).addClass("active");
		Util.setHash("act=" + item_url);
	});
	$('a[name="a_tab_second_item"][tab_second_item_id="'+second_item_id+'"]').parent().parent().append(dom);
	
	if(sessionStorage){
		var tabs = sessionStorage.getItem("secondTabMenu");
		if(!tabs){
			tabs = [{"item_id":item_id , "item_url":item_url , "item_name":item_name , "second_item_id":second_item_id}];
		}else{
			tabs = $.parseJSON(tabs);
			var exist = $.grep(tabs, function(o) {
				return o.item_id == item_id;
			});
			//如果不存在则记录到sessionStorage
			if(exist.length==0){
				tabs.push({"item_id":item_id , "item_url":item_url , "item_name":item_name , "second_item_id":second_item_id});
			}
		}
		sessionStorage.setItem("secondTabMenu", JSON.stringify(tabs));
	}
	if(active&&refresh){
		Util.load(item_url);
	}
}


$(function(){
	
//	Util.ajax({
//		url : contextpath + '/fm' ,
//	})
	
	if($("div[name='level1']").length==0){
		//没有一级菜单，直接显示403
		Util.load(contextpath+"/403");
		return ;
	}
	//二级tab滑动
	Util.swiperTab();
	
	//仅仅是监听act 的 hashchange事件
	back_act_listener = Util.getHash(location.hash , 'act');
    window.addEventListener('hashchange', function() {
    	var current_act = Util.getHash(location.hash , 'act') ;
    	//回退的时候如果act的值不一样才重新加载页面
    	if(current_act!=back_act_listener){
    		// 离开apply页面或从其他页面进入apply页面清空sessionStorage
    		if ("ep/basicda/apply" == back_act_listener || "ep/basicda/apply" == current_act) {
    			if (window.sessionStorage) {
    	    		sessionStorage.clear();
    	    	}
    		}
    		//如果页面还停留在用户自定义组件的页面，则进行刷新
    		if("portal/tpl/urc" == back_act_listener){
    			location.reload();
    			return ;
        	}
    		var locationhash = location.hash ;
    		back_act_listener = current_act ;
    		var cpparams = Util.getHash(location.hash, "cpparams", "");
    		var targettype = "";
    		var parenthash = "";
    		var targetact = "";
    		if(cpparams!="cpparams"&&cpparams!=""){
    			cpparams = template.BASE64.decode(cpparams);
    			cpparams = JSON.parse(cpparams);
    			targettype = cpparams.targettype;
    			parenthash = cpparams.parenthash;
    			targetact = cpparams.targetact;
    			if(Util.isNotEmpty(targetact)){
    				current_act = targetact;
    			}
    		}
    		else{
    			//地址栏上的act值不是通过点击菜单切换，而是通过手动触发的时候触发act改变
    			sysmenu.renderMenuByAct(current_act);
    		}
    		//如果是直接显示静态平铺菜单
    		if(current_act.indexOf("static_show_")!=-1){
    			return ;
    		}
    		
			Util.load(current_act , function(){
				//在切换菜单时，配置模块hash增加cpparams参数，用于判断是否重新加载页面
				if(current_act.indexOf("cp/templateList/p")>-1){
					//当菜单为配置模块时，清理缓存。
					if(window.localStorage){
						localStorage.clear();
					}
					if(cpparams==""){
						Util.setHash("cpparams=cpparams");
					}
				}else{
					Util.setHash(locationhash);
				}
        	});
    	}
    	//隐藏菜单
    	if($.inArray(current_act , sysmenu.menus)!=-1){
    		sysmenu.hideMenu();
    	}
    }, false);

	//显示左侧菜单
    sysmenu.showMenu = function(dom){
		sysmenu.hideMenu();
    	if(hidemenu==true || hidemenu=='true'){
    		return ;
    	}
    	//避免需要隐藏的菜单闪一下
    	if($.inArray(Util.getHash(location.hash , 'act') , sysmenu.menus)!=-1){
    		sysmenu.hideMenu();
    		return ;
    	}
		$("#"+dom).show();
		if(dom=='div_menu_mini_01'){
			//1隐藏所有二级tab菜单
			$("div[name='div_tab_second_menu']").hide();
		}
		$(".page-content").removeAttr("style");
	};

	//地址栏上的act值不是通过点击菜单切换，而是通过手动触发的时候触发act改变
	sysmenu.renderMenuByAct = function(current_act){
		//如果是一级普通菜单
		if($("div[name='level1']").find("a[name='first_item_1'][perm_item_url='"+current_act+"']").length>0){
			//清空所有一级菜单的选中样式
			$("div[name='level1']").removeClass("active bg-act");
			//添加选中样式
			$("div[name='level1']").find("a[perm_item_url='"+current_act+"']").parent().addClass("active bg-act");
			sysmenu.hideMenu();
			// 隐藏所有二级菜单
			$("div[name='div_tab_second_menu']").hide();
		}
		//如果是二级普通菜单
		else if($("li[name='level2']").find("a[name='second_item_1'][perm_item_url='"+current_act+"']").length>0){
			var item = $("li[name='level2']").find("a[perm_item_url='"+current_act+"']") ;
			//找到他的父id
			var second_item_fid = $(item).parent().attr("second_item_fid");
			//清空所有一级菜单的选中样式
			$("div[name='level1']").removeClass("active bg-act");
			//选中其一级节点菜单
			$("a[first_item_id='"+second_item_fid+"']").parent().addClass("active bg-act");
			//隐藏所有的二级菜单
			$('li[name="level2"]').hide();
			//然后显示这个一级菜单关联的所有二级菜单
			$("li[second_item_fid='"+second_item_fid+"']").show();
			//清空所有二级菜单的选中样式
			$('li[name="level2"]').removeClass("active");
			//添加当前点击菜单的选中样式
			$(item).parent().addClass("active");
			sysmenu.showMenu("div_menu_mini_01");
		}
		//如果是二级TAB形式菜单
		else if($("div[name='div_tab_second_menu']").find("a[name='a_tab_second_item'][tab_perm_url='"+current_act+"']").length>0){
			// 清空所有一级菜单的选中样式
			$("div[name='level1']").removeClass("active bg-act");
			// 隐藏所有左侧二级菜单
			sysmenu.hideMenu();
			//隐藏二级tab
			$("div[name='div_tab_second_menu']").hide();
			// 找到当前选中的菜单 
			var item = $("div[name='div_tab_second_menu']").find("a[name='a_tab_second_item'][tab_perm_url='"+current_act+"']") ;
			// 得到他的父级导航菜单的itemid
			var item_fid = $(item).attr("tab_first_item_id");
			// 把当前选中菜单的所有兄弟节点都取消选中
			$(item).parent().siblings().removeClass("active");
			// 把当前选中菜单增加选中效果
			$(item).parent().addClass("active");
			// 让导航选中
			$("a[name='first_item_2'][perm_item_id='" + item_fid + "']").parent().addClass("active bg-act");
			// 显示tab那一条白色条
			$("#div_tab_second_menu_" + item_fid).show();
			
			//移动端点击普通权限项的时候隐藏菜单
			$("#mobile_header_container").removeClass("active");
		}
		//如果是三级普通菜单
		else if($("li[name='level3']").find("a[name='third_item_1'][perm_item_url='"+current_act+"']").length>0){
			//如果菜单配置的是带有&参数的路径
			var perm_item_url = location.hash.substring(location.hash.indexOf("act=")+4);
			var item = $("li[name='level3']").find("a[name='third_item_1'][perm_item_url='"+perm_item_url+"']") ;
			if(item.length==0){
				item = $("li[name='level3']").find("a[name='third_item_1'][perm_item_url='"+current_act+"']") ;
			}
			//找到其二级菜单
			var third_item_fid = $(item).parent().attr("third_item_fid");
			//清空所有二级菜单的选中样式
			$('li[name="level2"]').removeClass("active");
			//全部设置为向下关闭的按钮
			$('span[name="level2_icon"]').removeClass("fa-angle-up").addClass("fa-angle-down");
			//将二级样式选中
			$("a[second_item_id='"+third_item_fid+"']").parent().addClass("active");
			//将二级菜单的箭头向上
			$("a[second_item_id='"+third_item_fid+"']").find('span[name="level2_icon"]').removeClass("fa-angle-down").addClass("fa-angle-up");
			
			//找到其一级菜单
			var second_item_fid = $("a[second_item_id='"+third_item_fid+"']").parent().attr("second_item_fid");
			//隐藏所有的二级菜单
			$('li[name="level2"]').hide();
			//显示所有其相关的二级菜单
			$("li[second_item_fid='"+second_item_fid+"']").show();
			//清空所有一级菜单的选中样式
			$("div[name='level1']").removeClass("active bg-act");
			//选中其一级节点菜单
			$("a[first_item_id='"+second_item_fid+"']").parent().addClass("active bg-act");
			//清空所有leve3的选中样式
			$("li[name='level3']").removeClass("active");
			//选中当前的菜单
			$(item).parent().addClass("active");
			sysmenu.showMenu("div_menu_mini_01");
		}
	}
    
  //从移动小窗口切换到大窗口保持左侧菜单的选中状态
//    sysmenu.winWidth = $("body").width() ;
//    $(window).resize(function () {
//    	//当宽度变化超过20，触发下面
//    	if(Math.abs(sysmenu.winWidth - $("body").width())>20){
//    		sysmenu.winWidth = $("body").width() ;
//    		var locationhash = location.hash ;
//    		sysmenu.initMenu(back_act_listener);
//    		Util.setHash(locationhash);
//    	}
//    });
	
    //隐藏左侧菜单
    sysmenu.hideMenu = function(){
		$(".page-sidebar").hide();
		$(".page-content").css("margin-left" , 0);
		$(".page-sidebar").mCustomScrollbar("disable",true);
		$(".page-sidebar .mCustomScrollBox").css("max-height","");
	};
	
	
	//如果点击的是一级菜单（普通权限项）
	$("a[name='first_item_1']").click(function(){
		//清空所有一级菜单的选中样式
		$("div[name='level1']").removeClass("active bg-act");
		
		//添加选中样式
		$(this).parent().addClass("active bg-act");
		var url = $(this).attr("perm_item_url");//获取其跳转的URL
		if(index_act){
			//如果是刷新进来的
			location.hash=locationhash ;
		}else{
			//切换菜单必须要清空其他hash值
			Util.setHash("act=" + url);
		}
		//一级菜单为普通权限项，隐藏左侧菜单
		sysmenu.hideMenu();
		//移动端点击普通权限项的时候隐藏菜单
		$("#mobile_header_container").removeClass("active");
		$("div[name='div_tab_second_menu']").hide();
	});

	//点击左侧的二级菜单（普通权限项）
	$("a[name='second_item_1']").click(function(){
		//找到他的父id
		var second_item_fid = $(this).parent().attr("second_item_fid");
		//清空所有一级菜单的选中样式
		$("div[name='level1']").removeClass("active bg-act");
		//选中其一级节点菜单
		$("a[first_item_id='"+second_item_fid+"']").parent().addClass("active bg-act");
		//隐藏所有的二级菜单
		$('li[name="level2"]').hide();
		//然后显示这个一级菜单关联的所有二级菜单
		$("li[second_item_fid='"+second_item_fid+"']").show();
		//清空所有二级菜单的选中样式
		$('li[name="level2"]').removeClass("active");
		//添加当前点击菜单的选中样式
		$(this).parent().addClass("active");
		var url = $(this).attr("perm_item_url");
		if(url){
			if(index_act){
				//如果是刷新进来的
				location.hash=locationhash ;
			}else{
				//获取二级菜单上是否有hash值属性
				var hasHash = $(this).attr("hash");
				//切换菜单必须要清空其他hash值
				Util.setHash("act=" + url + (hasHash?"&"+hasHash:''));
			}
			sysmenu.showMenu("div_menu_mini_01");
		}
	});
	
	//二级菜单分组权限项
	$("a[name='second_item_2']").click(function(){
		//全部设置为向下关闭的按钮
		$('span[name="level2_icon"]').removeClass("fa-angle-up").addClass("fa-angle-down");
		
		//如果是展开，则收起
		if($(this).parent().hasClass("active")){
			$(this).parent().removeClass("active") ;
			return ;
		}
		$(this).find('span[name="level2_icon"]').removeClass("fa-angle-down").addClass("fa-angle-up");
		//去掉所有三级菜单的选中样式
		$("a[name='third_item_2']").parent().removeClass("active");
		//触发其第一个三级菜单的点击事件
		var third_item_fid = $(this).attr("second_item_id");
		var third_item_a = $("li[third_item_fid='"+third_item_fid+"'] a").first() ;
		//如果三级菜单的第一个是外链
		if(third_item_a.attr("href") &&
				third_item_a.attr("href").toLowerCase()!="javascript:;"){
			//显示三级菜单
			third_item_a.parent().parent().parent().addClass("active");
			third_item_a.parent().addClass("active");
			//全部设置为向下关闭的按钮
			$('span[name="level3_icon"]').removeClass("fa-angle-up").addClass("fa-angle-down");
			third_item_a.find("span").trigger("click");
			third_item_a.unbind("click");
		}else{
			third_item_a.trigger("click");
		}
	});
	
	//点击左侧三级菜单（普通权限项）
	$("a[name='third_item_1']").click(function(){
		//找到其二级菜单
		var third_item_fid = $(this).parent().attr("third_item_fid");
		//清空所有二级菜单的选中样式
		$('li[name="level2"]').removeClass("active");
		//全部设置为向下关闭的按钮
		$('span[name="level2_icon"]').removeClass("fa-angle-up").addClass("fa-angle-down");
		//将二级样式选中
		$("a[second_item_id='"+third_item_fid+"']").parent().addClass("active");
		//将二级菜单的箭头向上
		$("a[second_item_id='"+third_item_fid+"']").find('span[name="level2_icon"]').removeClass("fa-angle-down").addClass("fa-angle-up");
		
		//找到其一级菜单
		var second_item_fid = $("a[second_item_id='"+third_item_fid+"']").parent().attr("second_item_fid");
		//隐藏所有的二级菜单
		$('li[name="level2"]').hide();
		//显示所有其相关的二级菜单
		$("li[second_item_fid='"+second_item_fid+"']").show();
		//清空所有一级菜单的选中样式
		$("div[name='level1']").removeClass("active bg-act");
		//选中其一级节点菜单
		$("a[first_item_id='"+second_item_fid+"']").parent().addClass("active bg-act");
		//清空所有leve3的选中样式
		$("li[name='level3']").removeClass("active");
		//选中当前的菜单
		$(this).parent().addClass("active");
		var url = $(this).attr("perm_item_url");
		if(url){
			if(index_act){
				//如果是刷新进来的
				location.hash=locationhash ;
			}else{
				//切换菜单必须要清空其他hash值
				Util.setHash("act=" + url);
			}
			sysmenu.showMenu("div_menu_mini_01");
		}
	});
	
	//三级菜单分组权限项
	$("a[name='third_item_2']").click(function(){
		
		//全部设置为向下关闭的按钮
		$('span[name="level3_icon"]').removeClass("fa-angle-up").addClass("fa-angle-down");
		//如果是展开，则收起
		if($(this).parent().hasClass("active")){
			$(this).parent().removeClass("active") ;
			return ;
		}
		//找到其二级菜单
		var third_item_fid = $(this).parent().attr("third_item_fid");
		//清空所有二级菜单的选中样式
		$('li[name="level2"]').removeClass("active");
		//全部设置为向下关闭的按钮
		$('span[name="level2_icon"]').removeClass("fa-angle-up").addClass("fa-angle-down");
		//将二级样式选中
		$("a[second_item_id='"+third_item_fid+"']").parent().addClass("active");
		//将二级菜单的箭头向上
		$("a[second_item_id='"+third_item_fid+"']").find('span[name="level2_icon"]').removeClass("fa-angle-down").addClass("fa-angle-up");
		//找到其一级菜单
		var second_item_fid = $("a[second_item_id='"+third_item_fid+"']").parent().attr("second_item_fid");
		//隐藏所有的二级菜单
		$('li[name="level2"]').hide();
		//显示所有其相关的二级菜单
		$("li[second_item_fid='"+second_item_fid+"']").show();
		//清空所有一级菜单的选中样式
		$("div[name='level1']").removeClass("active bg-act");
		//选中其一级节点菜单
		$("a[first_item_id='"+second_item_fid+"']").parent().addClass("active bg-act");
		//清空所有leve3的选中样式
		$("li[name='level3']").removeClass("active");

		//全部设置为向下关闭的按钮
		$('span[name="level3_icon"]').removeClass("fa-angle-up").addClass("fa-angle-down");

		//显示三级菜单
		$("li[name='level3']").show();
		//选中当前三级菜单
		$(this).parent().addClass("active") ;
		$(this).find('span[name="level3_icon"]').removeClass("fa-angle-down").addClass("fa-angle-up");
		//触发其第一四级菜单的点击事件
		var fourth_item_fid = $(this).attr("third_item_id");
		var fourth_item_a = $("li[fourth_item_fid='"+fourth_item_fid+"'] a").first() ;
		//如果四级菜单的第一个是外链
		if(fourth_item_a.attr("href") &&
				fourth_item_a.attr("href").toLowerCase()!="javascript:;"){
			fourth_item_a.find("span").trigger("click");
			fourth_item_a.unbind("click");
			//显示四级菜单
			fourth_item_a.parent().parent().show();
			fourth_item_a.parent().addClass("active");
		}else{
			fourth_item_a.trigger("click");
		}
	});
	
	//点击左侧四级菜单（普通权限项）
	$("a[name='fourth_item_1']").click(function(){
		//显示四级菜单
		$(this).parent().parent().show();
		$(this).parent().addClass("active");
		//选中三级菜单
		$(this).parent().parent().parent().show().addClass("active");
		$(this).parent().parent().parent().find('span[name="level3_icon"]').removeClass("fa-angle-down").addClass("fa-angle-up");
		//显示全部三级菜单
		var third_item_fid = $(this).parent().parent().parent().attr("third_item_fid") ; 
		$("li[name='level3'][third_item_fid='"+third_item_fid+"']").show();

		//选中二级菜单
		$(this).parent().parent().parent().parent().parent().show().addClass("active");
		$(this).parent().parent().parent().parent().parent().find('span[name="level2_icon"]').removeClass("fa-angle-down").addClass("fa-angle-up");
		//显示全部的二级菜单
		var second_item_fid = $(this).parent().parent().parent().parent().parent().attr("second_item_fid") ;
		$("li[name='level2'][second_item_fid='"+second_item_fid+"']").show();
		
		//清空所有一级菜单的选中样式
		$("div[name='level1']").removeClass("active bg-act");
		//选中其一级节点菜单
		$("a[first_item_id='"+second_item_fid+"']").parent().addClass("active bg-act");
		
		$(this).parent().parent().show();
		$(this).parent().addClass("active") ;
		var url = $(this).attr("perm_item_url");
		if(url){
			if(index_act){
				//如果是刷新进来的
				location.hash=locationhash ;
			}else{
				//切换菜单必须要清空其他hash值
				Util.setHash("act=" + url);
			}
			sysmenu.showMenu("div_menu_mini_01");
		}
	});
	
	//如果点击的是一级菜单（分组权限项）
	$("a[name='first_item_2']").click(function(){
		var first_item_id = $(this).attr('first_item_id');
		//先隐藏全部的二级菜单
		$("li[name='level2']").hide();
		//然后显示这个一级菜单关联的所有二级菜单
		$("li[second_item_fid='"+first_item_id+"']").show();
		//清空二级菜单的所有选中状态
		$("a[name='second_item_2']").parent().removeClass("active");
		//默认触发其关联的二级菜单中第一个菜单的点击事件
		$("li[second_item_fid='"+first_item_id+"']").first().find("a:first").trigger("click");
		//只是将菜单展开页面不跳转
		//$(this).parent().addClass("active bg-act");
		
		//========================二级菜单为tab相关start======================
		//1隐藏所有二级tab菜单
		$("div[name='div_tab_second_menu']").hide();
		//清空tab二级菜单的所有选中状态
		$("a[name='a_tab_second_item']").parent().removeClass("active");
		//2显示一级菜单对应的二级tab菜单，如果有tab，再显示
		if($("#div_tab_second_menu_"+first_item_id).find('a[name="a_tab_second_item"]').length>0){
			$("#div_tab_second_menu_"+first_item_id).show();
			$("#div_tab_second_menu_"+first_item_id + " li").show();
			
			//设置第一个Tab为选中状态
			$("#div_tab_second_menu_"+first_item_id).find("li").removeClass("active");
			$("#div_tab_second_menu_"+first_item_id).find("li:first").addClass("active");
			var tab_second_item_id = $("#div_tab_second_menu_"+first_item_id).find("a:first").attr("tab_second_item_id");
			//显示该二级菜单关联下的所有三级菜单
			$("li[tab_perm_item_fid='" + tab_second_item_id + "']").show();
			//将三级菜单选中状态去掉
			$('li[name="li_tab_third_item"]').removeClass("active");
			//清空所有一级菜单的选中样式
			$("div[name='level1']").removeClass("active bg-act");
			//获取一级菜单的ID
			var tab_first_item_id = $("a[tab_second_item_id='" + tab_second_item_id + "'][name='a_tab_second_item']").attr("tab_first_item_id");
			//选中其一级节点菜单
			$('[first_item_id="'+tab_first_item_id+'"][name="first_item_2"]').parent().addClass("active bg-act");
			//隐藏普通二级菜单
			$("#div_menu_mini_01").hide();
			//显示tab形式的二级菜单
			$("#div_menu_tab").show();//如果tab二级菜单为普通权限项
//			var tab_perm_url = $("#div_tab_second_menu_"+first_item_id).find('a[name="a_tab_second_item"][tab_first_item_id="'+first_item_id+'"]').first().attr("tab_perm_url");
//			if(tab_perm_url){
				$("#div_tab_second_menu_"+first_item_id).find('a[name="a_tab_second_item"][tab_first_item_id="'+first_item_id+'"]').first().trigger("click");
//			}
		}else{
			//显示普通二级菜单
			sysmenu.showMenu("div_menu_mini_01");
		}
		//========================二级菜单为tab相关end======================
	});
	
	//如果是点击移动端的二级菜单（普通权限项）
	$("a[name='second_mobile_1']").click(function(){
		//清空所有的选中样式
		$("a[name='second_mobile_1']").removeClass("active bg-act");
		$("a[name='second_mobile_2']").parent().removeClass("active");
		//清空所有的三级菜单的选中样式
		$("a[name='third_mobile_1']").removeClass("active");
		//设置自己的选中状态
		$(this).addClass("active bg-act");
		var url = $(this).attr("perm_item_url");
		if(url){
			if(index_act){
				//如果是刷新进来的
				location.hash=locationhash ;
			}else{
				//切换菜单必须要清空其他hash值
				Util.setHash("act=" + url);
			}
			//移动端点击普通权限项的时候隐藏菜单
			$("#mobile_header_container").removeClass("active");
			sysmenu.showMenu("div_menu_mini_01");
		}
	});
	
	//如果是点击移动端二级菜单（分组权限项）
	$('a[name="second_mobile_2"]').click(function(){
		//如果是展开，则收起
		if($(this).parent().hasClass("active")){
			$(this).parent().removeClass("active") ;
			return ;
		}
		//去掉所有移动端二级菜单的选中样式
		$('a[name="second_mobile_2"]').parent().removeClass("active");
		$('a[name="second_mobile_1"]').removeClass("active");
		//将当前的菜单选中
		$(this).parent().addClass("active");
		//获取当前菜单的id
		var second_mobile_id = $(this).attr("second_mobile_id");
		//默认触发其关联的二级菜单中第一个菜单的点击事件
		$("a[third_mobile_fid='"+second_mobile_id+"']").first().trigger("click");
		//只是将菜单展开页面不跳转
		//$(this).parent().addClass("active bg-act");
	});
	
	//如果是点击移动端三级菜单普通权限项
	$("a[name='third_mobile_1']").click(function(){
		//清空所有的三级菜单的选中样式
		$("a[name='third_mobile_1']").removeClass("active");
		//清空所有的二级菜单的选中样式
		$("a[name='second_mobile_1']").removeClass("active");
		//将当前项选中
		$(this).addClass("active");
		var url = $(this).attr("perm_item_url");
		if(url){
			if(index_act){
				//如果是刷新进来的
				location.hash=locationhash ;
			}else{
				//切换菜单必须要清空其他hash值
				Util.setHash("act=" + url);
			}
			//移动端点击普通权限项的时候隐藏菜单
			$("#mobile_header_container").removeClass("active");
		}
	});
	
	sysmenu.initMenu = function(index_act){
		//如果有访问的URL路径
		if(index_act){
			var perm_item_url = locationhash.substring(locationhash.indexOf("act=")+4);
			if($("a[perm_item_url='"+perm_item_url+"']").length>0){
				//触发非Tab菜单的click事件
				$("a[perm_item_url='"+perm_item_url+"']").trigger("click");
			}else if($("a[perm_item_url='"+index_act+"']").length>0){
				//触发非Tab菜单的click事件
				$("a[perm_item_url='"+index_act+"']").trigger("click");
			}else if($("a[name='a_tab_second_item'][tab_perm_url='"+index_act+"']").length>0){
				//触发Tab二级菜单
				$("a[name='a_tab_second_item'][tab_perm_url='"+index_act+"']").trigger("click");
			}else if($("a[tab_perm_url='"+index_act+"']").parent().length>0){
				//触发Tab非二级菜单
				$("a[tab_perm_url='"+index_act+"']").parent().trigger("click");
			}
		}else{
			//如果没有访问的路径，则默认加载第一个菜单
			$.each($("div[name='level1']") , function(i , o){
				//如果不是隐藏的，则作为默认的进行触发
				//if(!$(o).is(":hidden")){
				if($(o).attr("is_show")!="no"){
					var first_item_a = $(o).find("a").first() ;
					//如果一级菜单的第一个菜单是个外链，则寻找下一个非外链的菜单进行触发
					if(first_item_a.attr("href") && first_item_a.attr("href").indexOf("http://")==-1 &&
							first_item_a.attr("href").indexOf("https://")==-1){
						$(o).find("a").first().find("span:first").trigger("click");
						return false ;
					}
				}
			});
		}

		$(sysmenu.menus).each(function(i , o){
			if(o==index_act){
				sysmenu.hideMenu();
				return false ;
			}
		});
		
	};
	
	
	//如果是点击tab二级菜单
	$("a[name='a_tab_second_item']").click(function(){
		//获取二级菜单的ID
		var tab_second_item_id = $(this).attr("tab_second_item_id");
		//获取一级菜单的ID
		var tab_first_item_id = $("a[tab_second_item_id='" + tab_second_item_id + "'][name='a_tab_second_item']").attr("tab_first_item_id");
		//清空所有一级菜单的选中样式
		$("div[name='level1']").removeClass("active bg-act");
		//选中一级菜单
		$('[first_item_id="'+tab_first_item_id+'"][name="first_item_2"]').parent().addClass("active bg-act");
		//显示二级菜单
		$("a[tab_second_item_id='" + tab_second_item_id + "'][name='a_tab_second_item']").parent().parent().parent().parent().parent().show();
		//清空二级菜单的所有选中状态
		$("a[name='a_tab_second_item']").parent().removeClass("active");
		//设置二级菜单的选中状态
		$("a[tab_second_item_id='" + tab_second_item_id + "'][name='a_tab_second_item']").parent().addClass("active");
		//将所有的tab均置为非active
		$(this).parent().siblings().removeClass("active");
		$(this).parent().addClass("active");
		//隐藏所有的三级菜单
		$('li[name="li_tab_third_item"]').hide();
		//显示二级菜单对应的三级菜单
		$("li[tab_perm_item_fid='" + tab_second_item_id + "']").show();
		
		//将tab创建到二级菜单上
		if(sessionStorage){
			var tabs = sessionStorage.getItem("secondTabMenu");
			if(tabs){
				tabs = $.parseJSON(tabs);
				$(tabs).each(function(i , o){
					sysmenu.addSecondTab(o.item_id , o.item_url , o.item_name , o.second_item_id);
				});
			}
		}
		
		var item_html = $("div[name='tab_panel_"+tab_second_item_id+"']").html().trim();//二级平铺的菜单
		//如果存在二级平铺的菜单
		if(item_html && item_html.trim().length>0){
			Util.setHash("act=static_show_" + tab_second_item_id);
			sysmenu.hideMenu();//隐藏左侧菜单
			//拼接平铺菜单
			$("#page-content").html('<div class="data-center-home"><div id="dc_container" class="data-center-tabpage push-up-10">'+item_html+'</div></div>');
			//菜单的点击事件
			$("#dc_container a").unbind("click").click(function(){
				//清空二级菜单的所有选中状态
				var item_id = $(this).attr("item_id");
				if(!item_id){
					return ;
				}
				var item_url = $(this).attr("item_url");
				$("a[name='a_tab_second_item']").parent().removeClass("active");
				//如果已经已经添加过了
				if($("#tab_dynamic_"+item_id).length>0){
					$("#tab_dynamic_"+item_id).addClass("active");
					Util.setHash("act=" + item_url);
					return ;
				}
				
				sysmenu.addSecondTab($(this).attr("item_id") , $(this).attr("item_url") , $(this).attr("item_name") , $(this).attr("second_item_id") , true , false);
				
				Util.setHash("act=" + item_url);
			});
			return ;
		}
		
		//如果二级Tab存在URL，则默认为非分组权限项
		var tab_perm_url = $(this).attr("tab_perm_url");
		if(tab_perm_url){
			sysmenu.hideMenu();
			Util.setHash("act=" + tab_perm_url);
		}else{
			//分组权限项没有配置URL，并且其下面没有对应的菜单
			if($("li[tab_perm_item_fid='" + tab_second_item_id + "']:first").length==0){
				Util.setHash("act=static_show_" + tab_second_item_id);
				//清空主面板区域
				$("#page-content").empty();
				//隐藏左侧菜单
				sysmenu.hideMenu();
			}else{
				//三级菜单去掉active
				$('li[name="li_tab_third_item"]').removeClass("active");
				$('li[name="li_tab_third_item"]').find('span[name="level3_icon"]').removeClass("fa-angle-up").addClass("fa-angle-down");
				//二级菜单为分组权限，则默认触发其第一个三级菜单
				$("li[tab_perm_item_fid='" + tab_second_item_id + "']:first").trigger("click");
			}
		}
	});

	//点击Tab三级菜单
	$('li[name="li_tab_third_item"]').click(function(){
		//如果是展开，则收起
		if($(this).hasClass("active") && $(this).find('span[name="level3_icon"]').length>0){
			$(this).removeClass("active") ;
			$(this).find('span[name="level3_icon"]').removeClass("fa-angle-up").addClass("fa-angle-down");
			return ;
		}
		//三级菜单去掉active
		$('li[name="li_tab_third_item"]').removeClass("active");
		//四级菜单去掉active
		$('li[name="li_tab_four_item"]').removeClass("active");
		//五级菜单去掉active
		$('li[name="li_tab_five_item"]').removeClass("active");
		$(this).find('span[name="level3_icon"]').removeClass("fa-angle-down").addClass("fa-angle-up");
		//选中当前菜单
		$(this).addClass("active");
		var url = $(this).find("a").attr("tab_perm_url");
		//获取二级菜单的ID
		var tab_second_item_id = $(this).attr("tab_perm_item_fid");
		//获取一级菜单的ID
		var tab_first_item_id = $("a[tab_second_item_id='" + tab_second_item_id + "'][name='a_tab_second_item']").attr("tab_first_item_id");
		//选中一级菜单
		$('[first_item_id="'+tab_first_item_id+'"][name="first_item_2"]').parent().addClass("active bg-act");
		//显示二级菜单
		$("a[tab_second_item_id='" + tab_second_item_id + "'][name='a_tab_second_item']").parent().parent().parent().parent().parent().show();
		//清空二级菜单的所有选中状态
		$("a[name='a_tab_second_item']").parent().removeClass("active");
		//设置二级菜单的选中状态
		$("a[tab_second_item_id='" + tab_second_item_id + "'][name='a_tab_second_item']").parent().addClass("active");
		//显示三级菜单
		$('li[tab_perm_item_fid="' + tab_second_item_id + '"][name="li_tab_third_item"]').show();
		//选中三级菜单菜单
		$(this).addClass("active");
		if(url){
			if(index_act){
				//如果是刷新进来的
				location.hash=locationhash ;
			}else{
				//切换菜单必须要清空其他hash值
				Util.setHash("act=" + url);
			}
			sysmenu.showMenu('div_menu_tab');
		}else{
			//三级菜单为分组权限，则默认触发其第一个四级菜单
			var four_item = $(this).find("li:first") ;
			//如果四级菜单是外链类型
			if(four_item.find("a:first").attr("href") &&
			four_item.find("a:first").attr("href").toLowerCase()!="javascript:;"){
				//显示左侧菜单
				sysmenu.showMenu('div_menu_tab');
				//选中当前菜单
				$(four_item).addClass("active");
				//阻止事件冒泡
				four_item.find("a:first").click(function(event){
					event.stopPropagation();
				});
				//清空主面板
				$("#page-content").empty();
				four_item.find("span").trigger("click");
			}else{
				four_item.trigger("click");
			}
		}
	});

	//点击Tab四级菜单
	$('li[name="li_tab_four_item"]').click(function(event){
		event.stopPropagation();
		//如果是展开，则收起
		if($(this).hasClass("active") && $(this).find('span[name="level4_icon"]').length>0){
			$(this).removeClass("active") ;
			$(this).find('span[name="level4_icon"]').removeClass("fa-angle-down").addClass("fa-angle-up");
			return ;
		}else{
			$(this).addClass("active") ;
			$(this).find('span[name="level4_icon"]').removeClass("fa-angle-up").addClass("fa-angle-down");
		}
		$(this).find("ul").show();
		//获取二级菜单的ID
		var tab_second_item_id = $(this).parent().parent().attr("tab_perm_item_fid");
		//获取一级菜单的ID
		var tab_first_item_id = $("a[tab_second_item_id='" + tab_second_item_id + "'][name='a_tab_second_item']").attr("tab_first_item_id");
		//选中一级菜单
		$('[first_item_id="'+tab_first_item_id+'"][name="first_item_2"]').parent().addClass("active bg-act");
		//显示二级菜单
		$("a[tab_second_item_id='" + tab_second_item_id + "'][name='a_tab_second_item']").parent().parent().parent().parent().parent().show();
		//清空二级菜单的所有选中状态
		$("a[name='a_tab_second_item']").parent().removeClass("active");
		//设置二级菜单的选中状态
		$("a[tab_second_item_id='" + tab_second_item_id + "'][name='a_tab_second_item']").parent().addClass("active");
		//显示三级菜单
		$('li[tab_perm_item_fid="' + tab_second_item_id + '"][name="li_tab_third_item"]').show();
		//选中三级菜单菜单
		$(this).parent().parent().addClass("active");
		//显示四级菜单
		$(this).siblings().show();
		
		//四级菜单去掉active
		$('li[name="li_tab_four_item"]').removeClass("active");
		//五级菜单去掉active
		$('li[name="li_tab_five_item"]').removeClass("active");
		//选中当前菜单
		$(this).show().addClass("active");
		var url = $(this).find("a").attr("tab_perm_url");
		if(url){
			if(index_act){
				//如果是刷新进来的
				location.hash=locationhash ;
			}else{
				//切换菜单必须要清空其他hash值
				Util.setHash("act=" + url);
			}
			sysmenu.showMenu('div_menu_tab');
		}else{
			//四级菜单为分组权限，则默认触发其第一个五级菜单
			var five_item = $(this).find("li:first") ;
			//如果五级菜单是外链类型
			if(five_item.find("a:first").attr("href") &&
				five_item.find("a:first").attr("href").toLowerCase()!="javascript:;"){
				//显示左侧菜单
				sysmenu.showMenu('div_menu_tab');
				//选中当前菜单
				$(five_item).addClass("active");
				//阻止事件冒泡
				five_item.find("a:first").click(function(event){
					event.stopPropagation();
				});
				//清空主面板
				$("#page-content").empty();
				five_item.find("span").trigger("click");
			}else{
				five_item.trigger("click");
			}
		}
	});


	//点击Tab五级菜单
	$('li[name="li_tab_five_item"]').click(function(event){
		event.stopPropagation();
		var tab_second_item_id = $(this).attr("tab_second_item_id");
		//获取一级菜单的ID
		var tab_first_item_id = $("a[tab_second_item_id='" + tab_second_item_id + "'][name='a_tab_second_item']").attr("tab_first_item_id");
		//选中一级菜单
		$('[first_item_id="'+tab_first_item_id+'"][name="first_item_2"]').parent().addClass("active bg-act");
		
		//显示二级菜单
		$("a[tab_second_item_id='" + tab_second_item_id + "'][name='a_tab_second_item']").parent().parent().parent().parent().parent().show();
		//清空二级菜单的所有选中状态
		$("a[name='a_tab_second_item']").parent().removeClass("active");
		//设置二级菜单的选中状态
		$("a[tab_second_item_id='" + tab_second_item_id + "'][name='a_tab_second_item']").parent().addClass("active");
		//显示关联的三级菜单
		var tab_perm_item_fid = $(this).parent().parent().parent().parent().attr("tab_perm_item_fid");
		$("li[name='li_tab_third_item'][tab_perm_item_fid='"+tab_perm_item_fid+"']").show();
		
		//四级菜单
		$(this).parent().show();
		$(this).parent().parent().show().addClass("active");
		$(this).parent().parent().siblings().show();
		//三级菜单
		$(this).parent().parent().parent().parent().show().addClass("active");
		//如果是展开，则收起
		if($(this).hasClass("active") && $(this).find('span[name="level5_icon"]').length>0){
			$(this).removeClass("active") ;
			$(this).find('span[name="level5_icon"]').removeClass("fa-angle-down").addClass("fa-angle-up");
			return ;
		}else{
			$(this).addClass("active") ;
			$(this).find('span[name="level5_icon"]').removeClass("fa-angle-up").addClass("fa-angle-down");
		}
		$(this).show();
		$(this).find("ul").show();
		//显示五级菜单
		$(this).siblings().show();
		//选中当前菜单
		$(this).show().addClass("active");
		var url = $(this).find("a").attr("tab_perm_url");
		if(url){
			if(index_act){
				//如果是刷新进来的
				location.hash=locationhash ;
			}else{
				//切换菜单必须要清空其他hash值
				Util.setHash("act=" + url);
			}
			sysmenu.showMenu('div_menu_tab');
		}else{
			//四级菜单为分组权限，则默认触发其第一个五级菜单
			var six_item = $(this).find("li:first") ;
			//如果五级菜单是外链类型
			if(six_item.find("a:first").attr("href") &&
					six_item.find("a:first").attr("href").toLowerCase()!="javascript:;"){
				//显示左侧菜单
				sysmenu.showMenu('div_menu_tab');
				//选中当前菜单
				$(six_item).addClass("active");
				//阻止事件冒泡
				six_item.find("a:first").click(function(event){
					event.stopPropagation();
				});
				//清空主面板
				$("#page-content").empty();
				six_item.find("span").trigger("click");
			}else{
				six_item.trigger("click");
			}
		}
	});

	//点击Tab六级菜单
	$('li[name="li_tab_six_item"]').click(function(event){
		event.stopPropagation();
		var tab_second_item_id = $(this).attr("tab_second_item_id");
		//获取一级菜单的ID
		var tab_first_item_id = $("a[tab_second_item_id='" + tab_second_item_id + "'][name='a_tab_second_item']").attr("tab_first_item_id");
		//选中一级菜单
		$('[first_item_id="'+tab_first_item_id+'"][name="first_item_2"]').parent().addClass("active bg-act");
		
		//显示二级菜单
		$("a[tab_second_item_id='" + tab_second_item_id + "'][name='a_tab_second_item']").parent().parent().parent().parent().parent().show();
		//清空二级菜单的所有选中状态
		$("a[name='a_tab_second_item']").parent().removeClass("active");
		//设置二级菜单的选中状态
		$("a[tab_second_item_id='" + tab_second_item_id + "'][name='a_tab_second_item']").parent().addClass("active");
		
		//显示六级菜单
		$(this).parent().show();
		//五级菜单
		$(this).parent().parent().show().addClass("active");
		$(this).parent().parent().siblings().show();
		//四级菜单
		$(this).parent().parent().parent().show();
		$(this).parent().parent().parent().parent().show().addClass("active");
		$(this).parent().parent().parent().parent().siblings().show();
		//三级菜单
		$(this).parent().parent().parent().parent().parent().parent().show().addClass("active");
		//显示关联的三级菜单
		var tab_perm_item_fid = $(this).parent().parent().parent().parent().parent().parent().attr("tab_perm_item_fid");
		$("li[name='li_tab_third_item'][tab_perm_item_fid='"+tab_perm_item_fid+"']").show();
		//二级菜单
		$(this).parent().parent().parent().parent().parent().parent().parent().parent().show().addClass("active");
		
		$(this).show();
		//显示五级菜单
		$(this).siblings().show();
		//选中当前菜单
		$(this).show().addClass("active");
		var url = $(this).find("a").attr("tab_perm_url");
		if(url){
			if(index_act){
				//如果是刷新进来的
				location.hash=locationhash ;
			}else{
				//切换菜单必须要清空其他hash值
				Util.setHash("act=" + url);
			}
			sysmenu.showMenu('div_menu_tab');
		}
	});
	

	//第一次加载页面
	var locationhash = location.hash ;
	var index_act = Util.getHash(location.hash , 'act');
	//取得配置页面是否弹出标志targettype
	var cpparams = Util.getHash(location.hash, "cpparams", "");
	// 增加外部嵌入
	if(index_act.indexOf('http://')!=-1){
		index_act = encodeURIComponent(index_act);
	}
	//如果是直接显示静态平铺菜单
	if(index_act.indexOf("static_show_")!=-1){
		var hash = index_act.substring(12);
		$('a[name="a_tab_second_item"][tab_second_item_id="'+hash+'"]').trigger("click");
		return ;
	}
	
	//如果是平铺菜单的URL
	if($("a[tab_panel_item=true][item_url='"+index_act+"']").length>0){
		var $item_id = $("a[tab_panel_item=true][item_url='"+index_act+"']");
		//清空tab二级菜单的所有选中状态
		$("a[name='a_tab_second_item']").parent().removeClass("active");
		//将tab创建到二级菜单上
		if(sessionStorage){
			var tabs = sessionStorage.getItem("secondTabMenu");
			if(tabs){
				tabs = $.parseJSON(tabs);
				$(tabs).each(function(i , o){
					sysmenu.addSecondTab(o.item_id , o.item_url , o.item_name , o.second_item_id , o.item_id == $item_id.attr("item_id") , true);
				});
			}
		}
		//显示二级菜单
		var second_item_id = $item_id.attr("second_item_id");
		$("a[tab_second_item_id='"+second_item_id+"']").parent().parent().parent().parent().parent().show();
		//选中一级菜单
		var tab_first_item_id = $('a[name="a_tab_second_item"][tab_second_item_id="'+second_item_id+'"]').attr("tab_first_item_id");
		$('a[name="first_item_2"][first_item_id="'+tab_first_item_id+'"]').parent().addClass("active bg-act");
		return ;
	}
	
	var targettype = "";
	var parenthash = "";
	var targetact = "";
	if(cpparams!="cpparams"&&cpparams!=""){
		cpparams = template.BASE64.decode(cpparams);
		cpparams = JSON.parse(cpparams);
		targettype = cpparams.targettype;
		parenthash = cpparams.parenthash;
		targetact = cpparams.targetact;
		sysmenu.initMenu(index_act);
		if(Util.isNotEmpty(targetact)){
			index_act = targetact;
		}
	}else{
		sysmenu.initMenu(index_act);
	}
	if(index_act){
		setTimeout(function(){
			Util.load(index_act , function(){
				index_act = null ;//刷新进来之后将标志位清空
				//在子列表页面点击刷新，跳回父列表页面，去除子列表的hash参数
				//当不包含cpparams参数时才带上hash，或者包含cpparams并且targettype等于open时才带上hash
				if(locationhash.indexOf("cpparams")<0||cpparams=="cpparams"){
					Util.setHash(locationhash);
				}else if(targettype=="open"){
					Util.setHash(locationhash);
				}
				if(Util.isNotEmpty(targetact)){
					Util.setHash(locationhash);
				}
			},function(){
				index_act = null ;//刷新进来之后将标志位清空
			});
			index_act = null ;//刷新进来之后将标志位清空
		} , 500);
	}
	
});