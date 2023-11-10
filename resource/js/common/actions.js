jQuery.namespace("common.action");

common.action.dataTable;

var page_actions = function(){
    
    /* PROGGRESS START 
    $.mpb("show",{value: [0,50],speed: 5});        
     END PROGGRESS START */
	$(".select-line-foldable .fold-btn").on("click",function(e){
        $(".select-line-foldable").toggleClass("active");
		if($(".select-line-foldable").hasClass("active")){
           $(".select-line-foldable .fold-btn").removeClass("fa fa-caret-down");
		   $(".select-line-foldable .fold-btn").addClass("fa fa-caret-up");
        }else{
            $(".select-line-foldable .fold-btn").removeClass("fa fa-caret-up");
            $(".select-line-foldable .fold-btn").addClass("fa fa-caret-down");        
        }
    });
	
    var html_click_avail = true;

    $(".x-features-nav-open").on("click",function(e){
        $(".x-hnavigation").toggleClass("active");
    });
    //新头部的action-Start-ren.jq
    var navadp = function(a){
	    var winwid = $("body").width();
	    if (winwid < 1024) {
	    	$(".adp-big-menu").removeClass("active"); 
	    	$("div[name='level1'][mobile=show]").removeAttr("style");
		}else{
			$("div[name='level1'][mobile=show]").hide() ;
		}
    };
    navadp();
    $(window).resize(function(){
		navadp();
    });
    $(".adp-big-menu > a").on("click",function(e){
        if($(this).parent(".adp-big-menu").hasClass("active")){
        	$(".adp-big-menu").removeClass("active");
        }else{
        	$(this).parent(".adp-big-menu").addClass("active"); 
        }
    });
    $(".h-navigation-header .nav-menu a.nav-a-menu").on("click",function(e){
    	return ;
        if($(this).parent("div.nav-menu").hasClass("active")){
        	$(this).parent("div.nav-menu").removeClass("active");
        	$(this).parent("div.nav-menu").removeClass("bg-act");
        }else{
        	$(".h-navigation-header .nav-menu").removeClass("active");
        	$(".h-navigation-header .nav-menu").removeClass("bg-act");
        	$(this).parent("div.nav-menu").addClass("active");  
        	$(this).parent("div.nav-menu").addClass("bg-act"); 
        }
       
    });
    $(".h-navigation-header .nav-menu a.nav-a-menu").on("click",function(e){
    	$("div.nav-menu.nav-menu-theme").removeClass("active"); 
    	$("#message-con").removeClass("active");
    	$("#new_message").parent("div.nav-menu").removeClass("active");
    	$("#new_message").parent("div.nav-menu").removeClass("bg-act");
    	$("#theme-btn").parent("div.nav-menu").removeClass("active");
    	$("#theme-btn").parent("div.nav-menu").removeClass("bg-act");
    	$("#user-btn-01").parent("div.nav-menu").removeClass("active");
    	$("#user-btn-01").parent("div.nav-menu").removeClass("bg-act");
    	$("#nav-menu-user").removeClass("active");
    	$("#nav-menu-user").removeClass("bg-act");
	});
	$(".page-sidebar a").on("click",function(e){
		$("div.nav-menu.nav-menu-theme").removeClass("active"); 
		$("#message-con").removeClass("active");
		$("#new_message").parent("div.nav-menu").removeClass("active");
		$("#new_message").parent("div.nav-menu").removeClass("bg-act");
		$("#theme-btn").parent("div.nav-menu").removeClass("active");
		$("#theme-btn").parent("div.nav-menu").removeClass("bg-act");
		$("#user-btn-01").parent("div.nav-menu").removeClass("active");
		$("#user-btn-01").parent("div.nav-menu").removeClass("bg-act");
		$("#nav-menu-user").removeClass("active");
		$("#nav-menu-user").removeClass("bg-act");
	});
    $(".h-navigation-header .userinfo-two-box > a").on("click",function(e){
        if($(this).parent(".userinfo-two-box").hasClass("active")){
        	$(this).parent(".userinfo-two-box").removeClass("active");
        	$(this).parent(".userinfo-two-box").removeClass("bg-act");
        }else{
        	$(".h-navigation-header .userinfo-two-box").removeClass("active");
        	
        	$(this).parent("div.userinfo-two-box").addClass("active");  
        	
        }
       
    });
    
    $('a[name="new_message"]').on("click",function(e){
        if($(this).parent("div.nav-menu").hasClass("active")){
        	$(this).parent("div.nav-menu").removeClass("active");
        	$(this).parent("div.nav-menu").removeClass("bg-act");
        }else{
        	$("div.nav-menu.nav-menu-theme").removeClass("active"); 
        	$(this).parent("div.nav-menu").addClass("active"); 
        }
    });
    $("#new_message").on("click",function(e){
		if(msg_count=="true"){
	    	if($("#message-con").hasClass("active")){
	    		$("#message-con").removeClass("active");
	    		$("#nav-menu-user").removeClass("active");
	    		$("#new_message").parent("div.nav-menu").removeClass("bg-act");
	    	}else{
	    		$("#theme-con").removeClass("active");
	    		$("#user-con").removeClass("active");
	    		$("#theme-btn").parent("div.nav-menu").removeClass("bg-act");
	    		$("#user-btn-01").parent("div.nav-menu").removeClass("bg-act");
	    		$("#message-con").addClass("active");
	    		$("#nav-menu-user").addClass("active");
	    		$("#new_message").parent("div.nav-menu").addClass("bg-act");
	    	}
		}
    });
    $(".new_message_close").on("click",function(e){
    	$("#message-con").removeClass("active");
		$("#nav-menu-user").removeClass("active");
		$("#new_message").parent("div.nav-menu").removeClass("bg-act");
    });
    $("#theme-btn").on("click",function(e){
    	if($("#theme-con").hasClass("active")){
    		$("#theme-con").removeClass("active");
    		$("#nav-menu-user").removeClass("active");
    		$("#theme-btn").parent("div.nav-menu").removeClass("bg-act");
    	}else{
    		$("#message-con").removeClass("active");
    		$("#user-con").removeClass("active");
    		$("#user-btn-01").parent("div.nav-menu").removeClass("bg-act");
    		$("#new_message").parent("div.nav-menu").removeClass("bg-act");
    		$("#theme-con").addClass("active");
    		$("#nav-menu-user").addClass("active");
    		$("#theme-btn").parent("div.nav-menu").addClass("bg-act");
    	}
    	
    });
    $("#user-btn-01").on("click",function(e){
    	if($(this).parent("div.nav-menu").hasClass("active")){
    		$("#user-btn-01").parent("div.nav-menu").removeClass("bg-act");
    	}else{
    		$("#message-con").removeClass("active");
    		$("#theme-btn").parent("div.nav-menu").removeClass("bg-act");
    		$("#new_message").parent("div.nav-menu").removeClass("bg-act");
    		$("#theme-con").removeClass("active");
    		$(".big-menu .nav-menu").removeClass("active");
    		$(".big-menu .nav-menu").removeClass("bg-act");
    		$("#user-btn-01").parent("div.nav-menu").addClass("bg-act");
    		
    	}
    });
    $("#nav-menu-user a").on("click",function(e){
    	if($("#nav-menu-user").hasClass("active")){
    		$("#nav-menu-user").removeClass("bg-act");
    	}else{
    		$("#nav-menu-user").addClass("bg-act");
    	}
    });
    $(".h-navigation-header .nav-menu.nav-menu-user > a").on("click",function(e){
        if($(this).parent("div.nav-menu").hasClass("active")){
        	$(this).parent("div.nav-menu").removeClass("active");
        	$(this).parent("div.nav-menu").removeClass("bg-act");
        }else{
        	$("div.nav-menu.nav-menu-theme").removeClass("active"); 
        	$("div.nav-menu.nav-menu-msn").removeClass("active");
        	
        	$(this).parent("div.nav-menu").addClass("active"); 
        }
    });
    $(".h-navigation-header .nav-menu .menu-fr > a").on("click",function(e){
        if($(this).hasClass("active")){
        	$('a[name="a_set_profile"]').removeClass("active");
        }else{
        	$(".h-navigation-header .nav-menu .menu-fr > a").removeClass("active");
        	$(this).addClass("active"); 
        	
        	$(".adp-big-menu").removeClass("active");
        	$(".h-navigation-header .nav-menu").removeClass("active");
        	$('a[name="a_set_profile"]').removeClass("active");
        }
    });
    //新头部的action-End-ren.jq
    
    $(".x-hnavigation .xn-openable > a").on("click",function(e){
        if($(this).parent("li").hasClass("active")){
           $(this).parent("li").removeClass("active");
        }else{
            $(".x-hnavigation .xn-openable").removeClass("active");
            $(this).parents("li").addClass("active");        
        }
    });
    
    $(".x-features .x-features-profile").on("click",function(e){
        e.stopPropagation();
        $(this).toggleClass("active");
    });
    
    $(".x-features .x-features-search").on("click",function(e){
        e.stopPropagation();
        $(this).addClass("active");
        $(this).find("input[type=text]").focus();
    });
    
    $(".x-navigation-horizontal .panel").on("click",function(e){
        e.stopPropagation();
    });    

    /* WIDGETS (DEMO)*/
    $(".widget-remove").on("click",function(){
        $(this).parents(".widget").fadeOut(400,function(){
            $(this).remove();
            $("body > .tooltip").remove();
        });
        return false;
    });
    /* END WIDGETS */

    /* DROPDOWN TOGGLE */
    $(".dropdown-toggle").on("click",function(){
        onresize();
    });
    /* DROPDOWN TOGGLE */

    /* MESSAGE BOX */
    $(".mb-control").on("click",function(){
        var box = $($(this).data("box"));
        if(box.length > 0){
            box.toggleClass("open");

            var sound = box.data("sound");

            if(sound === 'alert')
                playAudio('alert');

            if(sound === 'fail')
                playAudio('fail');

        }        
        return false;
    });
    $(".mb-control-close").on("click",function(){
       $(this).parents(".message-box").removeClass("open");
       return false;
    });    
    /* END MESSAGE BOX */

    /* CONTENT FRAME */
    $("body").delegate(".content-frame-left-toggle","click",function(e){
        $(".content-frame-left").is(":visible") 
        ? $(".content-frame-left").hide() 
        : $(".content-frame-left").show();
        page_content_onresize();
    });
    $("body").delegate(".content-frame-right-toggle","click",function(e){
        $(".content-frame-right").is(":visible") 
        ? $(".content-frame-right").hide() 
        : $(".content-frame-right").show();
        page_content_onresize();
    });    
    /* END CONTENT FRAME */

    /* PANELS */
    $(".panel-fullscreen").on("click",function(){
        panel_fullscreen($(this).parents(".panel"));
        return false;
    });

    $(".panel-collapse").on("click",function(){
        panel_collapse($(this).parents(".panel"));
        $(this).parents(".dropdown").removeClass("open");
        return false;
    });    
    $(".panel-remove").on("click",function(){
        panel_remove($(this).parents(".panel"));
        $(this).parents(".dropdown").removeClass("open");
        return false;
    });
    $(".panel-refresh").on("click",function(){
        var panel = $(this).parents(".panel");
        panel_refresh(panel);

        setTimeout(function(){
            panel_refresh(panel);
        },3000);

        $(this).parents(".dropdown").removeClass("open");
        return false;
    });
    /* EOF PANELS */

    /* ACCORDION */
    $(".accordion .panel-title a").on("click",function(){

        var blockOpen = $(this).attr("href");
        var accordion = $(this).parents(".accordion");        
        var noCollapse = accordion.hasClass("accordion-dc");


        if($(blockOpen).length > 0){            

            if($(blockOpen).hasClass("panel-body-open")){
                $(blockOpen).slideUp(200,function(){
                    $(this).removeClass("panel-body-open");
                });
            }else{
                $(blockOpen).slideDown(200,function(){
                    $(this).addClass("panel-body-open");
                });
            }

            if(!noCollapse){
                accordion.find(".panel-body-open").not(blockOpen).slideUp(200,function(){
                    $(this).removeClass("panel-body-open");
                });                                           
            }

            return false;
        }

    });
    /* EOF ACCORDION */

    /* DATATABLES/CONTENT HEIGHT FIX */
    $(".dataTables_length select").on("change",function(){
        onresize();
    });
    /* END DATATABLES/CONTENT HEIGHT FIX */

    /* TOGGLE FUNCTION */
    $(".toggle").on("click",function(){
        var elm = $("#"+$(this).data("toggle"));
        if(elm.is(":visible"))
            elm.addClass("hidden").removeClass("show");
        else
            elm.addClass("show").removeClass("hidden");

        return false;
    });
    /* END TOGGLE FUNCTION */

    /* SIDEBAR */
    $(".sidebar-toggle").on("click",function(){
        $("body").toggleClass("sidebar-opened");
        return false;
    });
    $(".sidebar .sidebar-tab").on("click",function(){
        $(".sidebar .sidebar-tab").removeClass("active");
        $(".sidebar .sidebar-tab-content").removeClass("active");

        $($(this).attr("href")).addClass("active");
        $(this).addClass("active");

        return false;
    });
    $(".page-container").on("click",function(){
       $("body").removeClass("sidebar-opened");
    });
    /* END SIDEBAR */

    /* PAGE TABBED */
    $(".page-tabs a").on("click",function(){
        $(".page-tabs a").removeClass("active");
        $(this).addClass("active");
        $(".page-tabs-item").removeClass("active");        
        $($(this).attr("href")).addClass("active");
        return false;
    });
    /* END PAGE TABBED */

    /* PAGE MODE TOGGLE */
    $(".page-mode-toggle").on("click",function(){
        page_mode_boxed();
        return false;
    });
    /* END PAGE MODE TOGGLE */

    x_navigation();
    
    //数据中心左侧菜单折叠展开 START
    $(document).on("click", ".close-data-sidebar", function(){
    	if($(window).width() < 1024){
    		return;
    	} else {
    		if($(this).hasClass("in_a002")){
    			$(this).removeClass("in_a002").addClass("in_a007");
    			$(".datacenter-open-content")
    				.removeClass("datacenter-open-content").addClass("datacenter-close-content");
    		} else if($(this).hasClass("in_a007")){
    			$(this).removeClass("in_a007").addClass("in_a002");
    			$(".datacenter-close-content")
					.removeClass("datacenter-close-content").addClass("datacenter-open-content");
    		}
    	}
    });
    $(window).resize(function(){
	    var winW = $("body").width();
	    if (winW < 1024) {
			$(".datacenter-close-content")
				.removeClass("datacenter-close-content").addClass("datacenter-open-content");
		};
    });
    //数据中心左侧菜单折叠展开 END
}

$(document).ready(function(){        
    page_actions();    
});


$(function(){                
    onload();
    
    $(window).resize(function(){
        x_navigation_onresize();
        page_content_onresize();    
    });
});

function onload(){
    x_navigation_onresize();    
    page_content_onresize();    
}

function page_mode_boxed(){
    $("body").toggleClass("page-container-boxed");
    onresize(400);
}

function page_content_onresize(){
    var vpW = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
    var vpH = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    
    $(".page-content,.content-frame-body,.content-frame-right,.content-frame-left").css("width","").css("height","");
    
    $(".sidebar .sidebar-wrapper").height(vpH);
    
    var content_minus = 0;
    content_minus = ($(".page-container-boxed").length > 0) ? 40 : content_minus;
    content_minus += ($(".page-navigation-top-fixed").length > 0) ? 50 : 0;
    
    var content = $(".page-content");
    var sidebar = $(".page-sidebar");
    //内容添加最小高度
    content.css("min-height", vpH - 64);

    if($(".page-content-adaptive").length > 0)
        $(".page-content-adaptive").css("min-height",vpH-80);
    
    if(vpW > 1023){
        
        if($(".page-sidebar").hasClass("scroll")){
            if($("body").hasClass("page-container-boxed")){
                var doc_height = vpH - 40;
            }else{
                var doc_height = vpH;
            }
           $(".page-sidebar").height(doc_height);
           
       }
       
       var fbm = $("body").hasClass("page-container-boxed") ? 200 : 162;       
       
       var cfH = $(".content-frame").height();       
       if($(".content-frame-body").height() < vpH-162){           
           
           var cfM = vpH-fbm < cfH-80 ? cfH-80 : vpH-fbm;
                   
           $(".content-frame-body,.content-frame-right,.content-frame-left").height(cfM);
           
       }else{
           $(".content-frame-right,.content-frame-left").height($(".content-frame-body").height());
       }
        
        $(".content-frame-left").show();
        $(".content-frame-right").show();
    }else{
        $(".content-frame-body").height($(".content-frame").height()-80);
        
        if($(".page-sidebar").hasClass("scroll"))
           $(".page-sidebar").css("height","");
    }
    
    if(vpW < 1200){
        if($("body").hasClass("page-container-boxed")){
            $("body").removeClass("page-container-boxed").data("boxed","1");
        }
    }else{
        if($("body").data("boxed") === "1"){
            $("body").addClass("page-container-boxed").data("boxed","");
        }
    }
    //$(window).trigger("resize");
}

/* PANEL FUNCTIONS */
function panel_fullscreen(panel){    
    
    if(panel.hasClass("panel-fullscreened")){
        panel.removeClass("panel-fullscreened").unwrap();
        panel.find(".panel-body,.chart-holder").css("height","");
        panel.find(".panel-fullscreen .fa").removeClass("fa-compress").addClass("fa-expand");        
        
        $(window).resize();
    }else{
        var head    = panel.find(".panel-heading");
        var body    = panel.find(".panel-body");
        var footer  = panel.find(".panel-footer");
        var hplus   = 30;
        
        if(body.hasClass("panel-body-table") || body.hasClass("padding-0")){
            hplus = 0;
        }
        if(head.length > 0){
            hplus += head.height()+21;
        } 
        if(footer.length > 0){
            hplus += footer.height()+21;
        } 

        panel.find(".panel-body,.chart-holder").height($(window).height() - hplus);
        
        
        panel.addClass("panel-fullscreened").wrap('<div class="panel-fullscreen-wrap"></div>');        
        panel.find(".panel-fullscreen .fa").removeClass("fa-expand").addClass("fa-compress");
        
        $(window).resize();
    }
}

function panel_collapse(panel,action,callback){

    if(panel.hasClass("panel-toggled")){        
        panel.removeClass("panel-toggled");
        
        panel.find(".panel-collapse .fa-angle-up").removeClass("fa-angle-up").addClass("fa-angle-down");

        if(action && action === "shown" && typeof callback === "function")
            callback();            

        onload();
                
    }else{
        panel.addClass("panel-toggled");
                
        panel.find(".panel-collapse .fa-angle-down").removeClass("fa-angle-down").addClass("fa-angle-up");

        if(action && action === "hidden" && typeof callback === "function")
            callback();

        onload();        
        
    }
}
function panel_refresh(panel,action,callback){        
    if(!panel.hasClass("panel-refreshing")){
        panel.append('<div class="panel-refresh-layer"><img src="img/loaders/default.gif"/></div>');
        panel.find(".panel-refresh-layer").width(panel.width()).height(panel.height());
        panel.addClass("panel-refreshing");
        
        if(action && action === "shown" && typeof callback === "function") 
            callback();
    }else{
        panel.find(".panel-refresh-layer").remove();
        panel.removeClass("panel-refreshing");
        
        if(action && action === "hidden" && typeof callback === "function") 
            callback();        
    }       
    onload();
}
function panel_remove(panel,action,callback){    
    if(action && action === "before" && typeof callback === "function") 
        callback();
    
    panel.animate({'opacity':0},200,function(){
        panel.parent(".panel-fullscreen-wrap").remove();
        $(this).remove();        
        if(action && action === "after" && typeof callback === "function") 
            callback();
        
        
        onload();
    });    
}
/* EOF PANEL FUNCTIONS */

/* X-NAVIGATION CONTROL FUNCTIONS */
function x_navigation_onresize(){
    
    var inner_port = window.innerWidth || $(document).width();
    
    if(inner_port < 1024){               
        $(".page-sidebar .x-navigation").removeClass("x-navigation-minimized");
        $(".page-container").removeClass("page-container-wide");
        $(".page-sidebar .x-navigation li.active").removeClass("active");
        $(".x-navigation-horizontal").each(function(){            
            if(!$(this).hasClass("x-navigation-panel")){                
                $(".x-navigation-horizontal").addClass("x-navigation-h-holder").removeClass("x-navigation-horizontal");
            }
        });
        $(".close-data-sidebar").hide();
        
    }else{        
        if($(".page-navigation-toggled").length > 0){
            x_navigation_minimize("close");
        }       
        $(".x-navigation-h-holder").addClass("x-navigation-horizontal").removeClass("x-navigation-h-holder");   
        $(".close-data-sidebar").show();
    }
    
}
//ren.jq
function x_navigation_minimize(action){
    
    if(action == 'open'){
        $(".page-container").removeClass("page-container-wide");
        $(".page-sidebar .x-navigation").removeClass("x-navigation-minimized");
        $(".x-navigation-minimize").find(".head-icon").removeClass("in_a007").addClass("in_a002");
        //$(".page-sidebar.scroll").mCustomScrollbar("disable",true);
        $(".page-sidebar.scroll").mCustomScrollbar("update");
    }
    
    if(action == 'close'){
        $(".page-container").addClass("page-container-wide");
        $(".page-sidebar .x-navigation").addClass("x-navigation-minimized");
        $(".x-navigation-minimize").find(".head-icon").removeClass("in_a002").addClass("in_a007");
        //$(".page-sidebar.scroll").mCustomScrollbar("disable",true);//折叠左侧菜单后disable滚动条
		$(".page-sidebar.scroll").mCustomScrollbar("update");
    }

//    $(".x-navigation li.active").removeClass("active");
    
}

//ren.jq
function x_navigation(){
    $(".x-navigation-control").click(function(){
        $(this).parents(".x-navigation").toggleClass("x-navigation-open");
        
        onresize();        
        return false;
    });
    $("body").delegate(".x-navigation-control","click",function(e){
        $(this).parents(".x-navigation").toggleClass("x-navigation-open");
        
        onresize();        
        return false;
    });
    if($(".page-navigation-toggled").length > 0){
        x_navigation_minimize("close");
    }    
    
    if($(".page-navigation-toggled-hover").length > 0){
        $(".page-sidebar").hover(function(){
            $(".x-navigation-minimize").trigger("click");
        },function(){
            $(".x-navigation-minimize").trigger("click");
        });        
    }
    
    $(".x-navigation-minimize").click(function(){
    	if(common.action.dataTable != null) {
			common.action.dataTable.ajax.reload(null, false);
		}
        if($(".page-sidebar .x-navigation").hasClass("x-navigation-minimized")){
            $(".page-container").removeClass("page-navigation-toggled");
            x_navigation_minimize("open");
//点击按钮后需要重新调用一下瀑布流插件            
//            $('#brand-waterfall').cascade();
        }else{            
            $(".page-container").addClass("page-navigation-toggled");
            x_navigation_minimize("close");  
//点击按钮后需要重新调用一下瀑布流插件
//            $('#brand-waterfall').cascade();
        }
        
        onresize();
        
        return false;        
    });
	//全屏实验03-小二级菜单折叠-START
    $(".close-sidebar").click(function(){
    	if(common.action.dataTable != null) {
			common.action.dataTable.ajax.reload(null, false);
		}
        if($(".page-sidebar .x-navigation").hasClass("x-navigation-minimized")){
            $(".page-container").removeClass("page-navigation-toggled");
            $(".close-sidebar").removeClass("in_a007");
            $(".close-sidebar").addClass("in_a002");
            x_navigation_minimize("open");
//点击按钮后需要重新调用一下瀑布流插件            
//            $('#brand-waterfall').cascade();
        }else{            
            $(".page-container").addClass("page-navigation-toggled");
            $(".close-sidebar").removeClass("in_a002");
            $(".close-sidebar").addClass("in_a007");
            x_navigation_minimize("close");  
//点击按钮后需要重新调用一下瀑布流插件
//            $('#brand-waterfall').cascade();
        }
        
        onresize();
        
        return false;        
    });
    //全屏实验03-小二级菜单折叠-END
    $(".x-navigation  li > a").click(function(){
        
        var li = $(this).parent('li');        
        var ul = li.parent("ul");
        
        ul.find(" > li").not(li).removeClass("active");    
    });
	$(".x-navigation > li > ul > li").click(function(){
                
        if($(this).parents(".page-container").hasClass("menu-mini-open")){
			
        }else{            
            $(".page-container").addClass("menu-mini-open");   
        }
        
        $(".x-navigation > li > ul > li").not(this).removeClass("active");  
    }); 
//menu-mini-ren.jq
	$(".menu-mini-btn").click(function(){
        $(this).parents(".page-container").toggleClass("menu-mini-open");
        
        onresize();        
       return false;
   });
	

	$(".menu-mini-btn-01").click(function(){
        $(this).parents(".menu-mini-01").toggleClass("active");
        
        onresize();        
        return false;
    });
//选中模拟	
	$(".menu-mini-btn-02").click(function(){
        $(this).toggleClass("chosed");
        
        onresize();        
        return false;
    });
	$(".x-navigation li.xn-title").click(function(event){
        event.stopPropagation();
        
        var li = $(this);
                
        if(li.children("ul").length > 0 || li.children(".panel").length > 0 || $(this).hasClass("xn-profile") > 0){
            if(li.hasClass("active")){
                li.removeClass("active");
                li.find("li.active").removeClass("active");
            }else
                li.removeClass("active");

            onresize();

            if($(this).hasClass("xn-profile") > 0)
                return true;
            else
                return false;
        }                                     
    });
//ren.jq    
    /* XN-SEARCH */
    $(".xn-search").on("click",function(){
        $(this).find("input").focus();
    })
    /* END XN-SEARCH */
    
}
/* EOF X-NAVIGATION CONTROL FUNCTIONS */

/* PAGE ON RESIZE WITH TIMEOUT */
function onresize(timeout){    
    timeout = timeout ? timeout : 200;
    
    setTimeout(function(){
        page_content_onresize();                
    },timeout);
}
/* EOF PAGE ON RESIZE WITH TIMEOUT */

/* PLAY SOUND FUNCTION */
function playAudio(file){
    if(file === 'alert')
        document.getElementById('audio-alert').play();

    if(file === 'fail')
        document.getElementById('audio-fail').play();    
}
/* END PLAY SOUND FUNCTION */

/* PAGE LOADING FRAME */
function pageLoadingFrame(action,ver){    
    
    ver = ver ? ver : 'v2';
    
    var pl_frame = $("<div></div>").addClass("page-loading-frame");
    
    if(ver === 'v2')
        pl_frame.addClass("v2");
    
    var loader = new Array();
    loader['v1'] = '<div class="page-loading-loader"><img src="img/loaders/page-loader.gif"/></div>';
    loader['v2'] = '<div class="page-loading-loader"><div class="dot1"></div><div class="dot2"></div></div>';
    
    if(action == "show" || !action){
        $("body").append(pl_frame.html(loader[ver]));
    }
    
    if(action == "hide"){
        
        if($(".page-loading-frame").length > 0){
            $(".page-loading-frame").addClass("removed");

            setTimeout(function(){
                $(".page-loading-frame").remove();
            },800);        
        }
        
    }
}
/* END PAGE LOADING FRAME */

/* NEW OBJECT(GET SIZE OF ARRAY) */
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};
/* EOF NEW OBJECT(GET SIZE OF ARRAY) */


/* MATERIAL CHECKBOX */
var wskCheckbox = function() {
  var wskCheckboxes = [];
  var SPACE_KEY = 32;

  function addEventHandler(elem, eventType, handler) {
    if (elem.addEventListener) {
      elem.addEventListener (eventType, handler, false);
    }
    else if (elem.attachEvent) {
      elem.attachEvent ('on' + eventType, handler);
    }
  }

  function clickHandler(e) {
    e.stopPropagation();
    if (this.className.indexOf('checked') < 0) {
      this.className += ' checked';
    } else {
      this.className = 'chk-span';
    }
  }

  function keyHandler(e) {
    e.stopPropagation();
    if (e.keyCode === SPACE_KEY) {
      clickHandler.call(this, e);
      // Also update the checkbox state.

      var cbox = document.getElementById(this.parentNode.getAttribute('for'));
      cbox.checked = !cbox.checked;
    }
  }

  function clickHandlerLabel(e) {
    var id = this.getAttribute('for');
    var i = wskCheckboxes.length;
    while (i--) {
      if (wskCheckboxes[i].id === id) {
        if (wskCheckboxes[i].checkbox.className.indexOf('checked') < 0) {
          wskCheckboxes[i].checkbox.className += ' checked';
        } else {
          wskCheckboxes[i].checkbox.className = 'chk-span';
        }
        break;
      }
    }
  }

  function findCheckBoxes() {
    var labels =  document.getElementsByTagName('label');
    var i = labels.length;
    while (i--) {
      var posCheckbox = document.getElementById(labels[i].getAttribute('for'));
      if (posCheckbox !== null && posCheckbox.type === 'checkbox') {
        var text = labels[i].innerText;
        var span = document.createElement('span');
        span.className = 'chk-span';
        span.tabIndex = i;
        labels[i].insertBefore(span, labels[i].firstChild);
        addEventHandler(span, 'click', clickHandler);
        addEventHandler(span, 'keyup', keyHandler);
        addEventHandler(labels[i], 'click', clickHandlerLabel);
        wskCheckboxes.push({'checkbox': span,
            'id': labels[i].getAttribute('for')});
      }
    }
  }

  return {
    init: findCheckBoxes
  };
}();
wskCheckbox.init();
/* ./MATERIAL CHECKBOX */
//二手市场-评论折叠功能-START
$(".purchase-con .open-comments-btn").on("click",function(){
      $(".purchase-comment-con").addClass("active");
	  $(".close-comments-btn").addClass("active");
    });
$(".purchase-con .close-comments-btn").on("click",function(){
      $(".purchase-comment-con").removeClass("active");
	  $(".close-comments-btn").removeClass("active");
    });
//二手市场-评论折叠功能-END
//折叠展开树组件-Ren.jq-START
$(".foldtree-title-box a").on("click",function(){
        var fa = $(this).parent(".fold-action");
        if(fa.hasClass("unfold-tree-box")){
            $(this).parents(".fold-action").removeClass("unfold-tree-box").addClass("foldable-tree-box");
        }else{            
            $(this).parents(".fold-action").addClass("unfold-tree-box").removeClass("foldable-tree-box");
        }
    });
$(".fold-tree-btn").on("click",function(){
        var fa = $(this).parent(".fold-action");
        if(fa.hasClass("foldable-tree-box")){
            $(this).parents(".fold-action").removeClass("foldable-tree-box").addClass("unfold-tree-box");
        }else{            
            $(this).parents(".fold-action").addClass("foldable-tree-box").removeClass("unfold-tree-box");
        }
    });
//折叠展开树组件-Ren.jq-END
$("body").delegate(".close-drag-btn","click",function(e){
        var cd = $(this).parent(".close-drag-box");
        if(cd.hasClass("open-drag")){
            $(this).parents(".close-drag-box").toggleClass("open-drag");
        }else{            
            $(this).parents(".close-drag-box").toggleClass("open-drag");
        }
    });
//折叠展开树组件-Ren.jq-START
$("body").delegate(".foldtree-title-box a","click",function(e){
	if(common.action.dataTable != null) {
		common.action.dataTable.ajax.reload(null, false);
	}
        var fa = $(this).parent(".fold-action");
        if(fa.hasClass("unfold-tree-box")){
            $(this).parents(".fold-action").removeClass("unfold-tree-box").addClass("foldable-tree-box");
        }else{            
            $(this).parents(".fold-action").addClass("unfold-tree-box").removeClass("foldable-tree-box");
        }
    });
$("body").delegate(".fold-tree-btn","click",function(e){
	if(common.action.dataTable != null) {
		common.action.dataTable.ajax.reload(null, false);
	}
        var fa = $(this).parent(".fold-action");
        if(fa.hasClass("foldable-tree-box")){
            $(this).parents(".fold-action").removeClass("foldable-tree-box").addClass("unfold-tree-box");
        }else{            
            $(this).parents(".fold-action").addClass("foldable-tree-box").removeClass("unfold-tree-box");
        }
    });
$("body").delegate(".fold-btn-01","click",function(e){
		if(common.action.dataTable != null) {
			common.action.dataTable.ajax.reload(null, false);
		}
		var fc = $(this).parent(".multi-fold");
		if(fc.hasClass("active-01")){
			$(this).parents(".multi-fold").removeClass("active-01");
		}else{            
            $(this).parents(".multi-fold").addClass("active-01");
        }
    });
$("body").delegate(".unfold-btn-01","click",function(e){
		if(common.action.dataTable != null) {
			common.action.dataTable.ajax.reload(null, false);
		}
		$(this).parents(".multi-fold").removeClass("active-01");
    });
$("body").delegate(".fold-btn-02","click",function(e){
		if(common.action.dataTable != null) {
			common.action.dataTable.ajax.reload(null, false);
		}
		var fc = $(this).parent(".multi-fold");
		if(fc.hasClass("active-02")){
			$(this).parents(".multi-fold").removeClass("active-02");
		}else{            
            $(this).parents(".multi-fold").addClass("active-02");
        }
    });
$("body").delegate(".unfold-btn-03","click",function(e){
		if(common.action.dataTable != null) {
			common.action.dataTable.ajax.reload(null, false);
		}
		$(this).parents(".multi-fold").removeClass("active-03");
    });
$("body").delegate(".fold-btn-03","click",function(e){
		if(common.action.dataTable != null) {
			common.action.dataTable.ajax.reload(null, false);
		}
		var fc = $(this).parent(".multi-fold");
		if(fc.hasClass("active-03")){
			$(this).parents(".multi-fold").removeClass("active-03");
		}else{            
            $(this).parents(".multi-fold").addClass("active-03");
        }
    });
$("body").delegate(".unfold-btn-02","click",function(e){
		if(common.action.dataTable != null) {
			common.action.dataTable.ajax.reload(null, false);
		}
		$(this).parents(".multi-fold").removeClass("active-02");
    });
//折叠展开树组件-Ren.jq-END
//日程应用左侧-START
$(".sch-container .sch-manage-btn").on("click",function(e){
        	$("div.sch-container").addClass("active");
    });
$(".sch-container .sch-cancel-btn").on("click",function(e){
			$("div.sch-container").removeClass("active");
    });
$(".sch-container .sch-addcal-btn").on("click",function(e){
			$("div.sch-container").addClass("add-newcal");
    });
$(".sch-container .cancel-save-btn").on("click",function(e){
			$("div.sch-container").removeClass("add-newcal");
    });
$(".page-container .calendar-full-screen").on("click",function(e){
			if($(this).hasClass("fa-expand")){
				$(".calendar-full-screen").removeClass("fa-expand");
				$(".calendar-full-screen").addClass("fa-compress");
				
				$(".sch-container").addClass("active-display");
				$(".content-frame-body").addClass("push-left-0");
			}else{
				$(".calendar-full-screen").addClass("fa-expand");
				$(".calendar-full-screen").removeClass("fa-compress");
				
				$(".sch-container").removeClass("active-display");
				
				$(".content-frame-body").removeClass("push-left-0");
				
			};
			//$(this).toggleClass("active");
			//$(this).toggleClass("active");
		});	

//日程应用左侧-END
$("body").delegate(".swiper-note .close","click",function(e){
	$(".swiper-note").removeClass("active");
 });    
//日程-日期选择--Ren.jq-START
$(".calendar-fullsize div p a").on("click",function(e){
		if($(this).hasClass("click-day")){
           
        }else{
            $(".calendar-fullsize div p a").removeClass("click-day");
            $(this).addClass("click-day");        
        }
    });

/*scroll-x start*/
(function($){
	$(window).load(function(){
		
		$(".scroll-x").mCustomScrollbar({
			axis:"x",
			scrollButtons:{enable:true},
			theme:"light",
			scrollbarPosition:"inside"
		});
		
	});
})(jQuery);
/*scroll-x end*/

/* RIPPLE-BTN maqt START */

$(".ripple-btn").click(function(e) {

    $(".ripple").remove();

    var posX = $(this).offset().left,
        posY = $(this).offset().top,
        buttonWidth = $(this).width(),
        buttonHeight = $(this).height();
    $(this).append("<span class='ripple'></span>");

    if (buttonWidth >= buttonHeight) {
        buttonHeight = buttonWidth;
    } else {
        buttonWidth = buttonHeight;
    }

    var x = e.pageX - posX - buttonWidth / 2;
    var y = e.pageY - posY - buttonHeight / 2;

    $(".ripple").css({
        width: buttonWidth,
        height: buttonHeight,
        top: y + 'px',
        left: x + 'px'
    }).addClass("rippleEffect");

});

/* RIPPLE-BTN maqt END */
//select下拉方式修改
var drop_pos = function(selectDp){
	var optmun = $(selectDp).parent().find("li").length;
	var selectW = $(selectDp).parent().width();
	var dropdownH = optmun*37+3;
	if($(selectDp).parent().parent().find("select").attr("data-live-search") == "true"){
		dropdownH = dropdownH + 38;
	}
	var top = $(selectDp).offset().top;
	var left = $(selectDp).offset().left;
	var bodyH = $('body').height();
	var tH = top-20;
	var bH = bodyH-top-50;
	if(dropdownH < bH){
		$(".select-dropdown-fixed .dropdown-menu.open").css("height",dropdownH);
		$(".select-dropdown-fixed .dropdown-menu.open").css("max-height",bH);
		$(".select-dropdown-fixed .dropdown-menu.open").css("top",top + 25);
		$(".select-dropdown-fixed .dropdown-menu.open").css("left",left);
		$(".select-dropdown-fixed .dropdown-menu.open").css("position","fixed");
	}else{
		if(dropdownH < tH){
			$(".select-dropdown-fixed .dropdown-menu.open").css("height",dropdownH);
			$(".select-dropdown-fixed .dropdown-menu.open").css("max-height",tH);
			$(".select-dropdown-fixed .dropdown-menu.open").css("top",top - dropdownH -10);
			$(".select-dropdown-fixed .dropdown-menu.open").css("left",left);
			$(".select-dropdown-fixed .dropdown-menu.open").css("position","fixed");
		}else{
			if(bH>300){
				$(".select-dropdown-fixed .dropdown-menu.open").css("max-height",bH);
				$(".select-dropdown-fixed .dropdown-menu.open").css("height",dropdownH);
				$(".select-dropdown-fixed .dropdown-menu.open").css("top",top + 25);
				$(".select-dropdown-fixed .dropdown-menu.open").css("left",left);
				$(".select-dropdown-fixed .dropdown-menu.open").css("position","fixed");
			}else{
				$(".select-dropdown-fixed .dropdown-menu.open").css("height",dropdownH);
				$(".select-dropdown-fixed .dropdown-menu.open").css("max-height",tH);
				$(".select-dropdown-fixed .dropdown-menu.open").css("top",top - tH -10);
				$(".select-dropdown-fixed .dropdown-menu.open").css("left",left);
				$(".select-dropdown-fixed .dropdown-menu.open").css("position","fixed");
			}
			
		}
	}
	$(".select-dropdown-fixed .dropdown-menu.open").css("width",selectW);
	$(".select-dropdown-fixed .dropdown-menu.open").css("min-width",selectW);
	$(".select-dropdown-fixed .dropdown-menu.open").css("overflow","auto");
	$(".select-dropdown-fixed .dropdown-menu.inner").css("overflow","initial");
};
$("body").delegate(".select-dropdown-fixed button","click",function(e){
	drop_pos(this);	  
});

$("#page-scroll-container").scroll(function() {
	$('.select-dropdown-fixed').removeClass('open');  
	$(".layui-laydate").css("display","none");
	$('.drop-semester').removeClass("open");
	$(".cp_WdatePicker").parent().css("display","none");
});
