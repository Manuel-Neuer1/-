$(document).ready(function(){
	
	//加载主题数据
	$.ajax({
	    type:"POST",  
	    url: contextpath+"/sys/theme/getThemes",  
	    dataType : "json",  
	    contentType : 'application/json;charset=utf-8',
	    success: function(sys_themes){
	    	console.log(sys_themes);
	    	$(sys_themes).each(function(i , o){
	    		var str = "<a href='javascript:;' id = '"+o.CODEVALUE+"' "
						  +"data-theme='"+css_path+"/resource/css/common/theme/"+o.CSS+".css?v="+version+"'>"
						  +"<img src='"+contextpath+"/resource/image/common/themes/"+o.IMAGE+".jpg'/></a>";
				$("#div_sys_theme_list").append(str);
	    	});
			var $theme = $("#div_sys_theme_list a[data-theme][id='"+_sys_theme_setting.THEME_ID+"']");
			$theme.addClass("active");
 
			//点击.theme-settings 下的全部input事件
		    $(".theme-settings input").on("change",function(){
		        var input   = $(this);
		        //样式选项的input
		        if(input.attr("name") != 'st_layout_boxed' && input.attr("name") != 'st_font_size'&& input.attr("name") != 'st_font_cnen'){
		            if(!input.prop("checked")){//没有被选中的
		                theme_settings[input.attr("name")] = input.val();
		            }else{  //被选中的          
		                theme_settings[input.attr("name")] = 0;
		            }
		        }else if(input.attr("name") == 'st_font_cnen' ){
		        	$.ajax({
		        	    url: contextpath+"/sys/uacm/language/resetLanguage",  
		        	    data : {
		        	    	language:input.val(),
		        		},
		        	    success: function(result){
		        	    	if(result){
		        	    		window.location.reload()
		        	    	}
		        	    }
		        	});
		        	return ;
		        }else{
		            theme_settings[input.attr("name")] = input.val();
		        }
		        
		        /* Rules 固定菜单与菜单滚动条联动*/
		        if(input.attr("name") === 'st_sb_fixed'){
		            if(theme_settings.st_sb_fixed == 1){
		                theme_settings.st_sb_scroll = 1;
		            }else{
		                theme_settings.st_sb_scroll = 0;
		            }
		        }
		        
		        //如果点击菜单滚动条
		        if(input.attr("name") === 'st_sb_scroll'){
		            if(theme_settings.st_sb_scroll == 1 && theme_settings.st_layout_boxed == 0){
		                theme_settings.st_sb_fixed = 1;
		            }else if(theme_settings.st_sb_scroll == 1 && theme_settings.st_layout_boxed == 1){
		                theme_settings.st_sb_fixed = -1;
		            }else if(theme_settings.st_sb_scroll == 0 && theme_settings.st_layout_boxed == 1){
		                theme_settings.st_sb_fixed = -1;
		            }else{
		                theme_settings.st_sb_fixed = 0;
		            }
		        }
		        //点击窗口设置
		        if(input.attr("name") === 'st_layout_boxed'){
		            if(theme_settings.st_layout_boxed == 1){                
		                theme_settings.st_head_fixed = -1;
		                theme_settings.st_sb_fixed = -1;
		                theme_settings.st_sb_scroll = 1;
		                $("#ts-wallpapers").show();
		            }else if(theme_settings.st_layout_boxed == 0){
		                theme_settings.st_head_fixed = 0;
		                theme_settings.st_sb_fixed = 1;
		                theme_settings.st_sb_scroll = 1;
		                $("#ts-wallpapers").hide();
		            }
		        }
		        /* End Rules */
		        sys_theme_isExist(theme_settings,sys_theme_m);
		        set_settings(theme_settings,input.attr("name"));
		    });
		    
		    /* Change Theme 主题设置*/
		    $(".ts-themes a[data-theme]").click(function(){
		        theme_settings.theme_id = $(this).attr("id");
		        sys_theme_isExist(theme_settings,sys_theme_m);
		    });
		    /* 切换中英文*/
			$("#change_language").unbind("click").click(function(){
				var language;
				if($("#content").text()=='English'){
					language='en';
				}else{
					language='zh_CN';
				}
				
				$.ajax({
	        	    url: contextpath+"/sys/uacm/language/resetLanguage",  
	        	    data : {
	        	    	language:language,
	        		},
	        	    success: function(result){
	        	    	if(result){
	        	    		window.location.reload()
	        	    	}
	        	    }
	        	});
			});
			/* END Change Theme */
	    }
	});
	
	//载入主题设置参数
    /* Default settings */
    var theme_settings = {
        st_head_fixed: _sys_theme_setting.HEAD_FIXED,
		st_all_scroll: _sys_theme_setting.ALL_SCROLL,
        st_sb_fixed: _sys_theme_setting.SB_FIXED,
        st_sb_scroll: _sys_theme_setting.SB_SCROLL,
        st_sb_right: _sys_theme_setting.SB_RIGHT,
        st_sb_custom: _sys_theme_setting.SB_CUSTOM,
        st_sb_toggled: _sys_theme_setting.SB_TOGGLED,
        st_layout_boxed: _sys_theme_setting.WINDOW_ID,
        st_font_size: _sys_theme_setting.FONT_ID,
        theme_id : _sys_theme_setting.THEME_ID,
        id_number: _sys_theme_setting.ID_NUMBER , 
	    belong_system: _sys_theme_setting.BELONG_SYSTEM
    };
    /* End Default settings */
    
    //设置主题配置 
    set_settings(theme_settings,false);    
    
    /* Open/Hide Settings 
     * 显示隐藏 主题设置
     */
    $(".ts-button").on("click",function(){
        $(".theme-settings").toggleClass("active");
    });
    /* End open/hide settings */
    
//	$("#change_language").unbind("click").click(function(){
//		alert(111);
////    	$.ajax({
////    	    url: contextpath+"/sys/uacm/language/resetLanguage",  
////    	    data : {
////    	    	language:input.val(),
////    		},
////    	    success: function(result){
////    	    	if(result){
////    	    		window.location.reload()
////    	    	}
////    	    }
////    	});
////    	return ;
//    
//	});
});

//判断数据库是否有个人设置的数据
sys_theme_isExist = function(theme_settings,sys_theme_m){
	var parm = {
			theme_id : theme_settings.theme_id+"", 
		    font_id : theme_settings.st_font_size+"" , 
		    head_fixed : theme_settings.st_head_fixed+"" , 
		    all_scroll : theme_settings.st_all_scroll+"" , 
		    sb_fixed : theme_settings.st_sb_fixed+"" , 
		    sb_scroll : theme_settings.st_sb_scroll+"" , 
		    sb_right : theme_settings.st_sb_right+"" , 
		    sb_custom : theme_settings.st_sb_custom+""  , 
		    sb_toggled : theme_settings.st_sb_toggled+"", 
		    window_id : theme_settings.st_layout_boxed+"" , 
		    belong_system : sys_theme_m+""
		};
	if(theme_settings.id_number == id_number && theme_settings.belong_system == sys_theme_m ){
		sys_theme_updateUserTheme(parm);
	}else{
		sys_theme_addUserTheme(parm);
	}
};

//添加用户主题设置
sys_theme_addUserTheme = function(parm){
	$.ajax({  
	    type:"POST",  
	    url: contextpath+"/sys/theme/save",  
	    async : true,
	    data: JSON.stringify(parm),
	    dataType : "json",  
	    contentType : 'application/json;charset=utf-8',
	    success: function(result){  
	    	location.reload();
	    }
	});
};
//修改用户主题设置
sys_theme_updateUserTheme = function(parm){
	$.ajax({  
	    type:"POST",  
	    url: contextpath+"/sys/theme/update",  
	    async : true,
	    data: JSON.stringify(parm),
	    dataType : "json",  
	    contentType : 'application/json;charset=utf-8',
	    success: function(result){  
	    	location.reload();
	    }
	});
};


function set_settings(theme_settings,option){
    /* Start Header Fixed 固定头部导航 */
    if(theme_settings.st_head_fixed == 1){
        $(".page-scroll-container").addClass("page-navigation-top-fixed");
    }else{
    	$(".page-scroll-container").removeClass("page-navigation-top-fixed");
    }
    /* END Header Fixed */
    
    /* Start ALL Scorall */
    if(theme_settings.st_all_scroll == 1){
        $(".page-container").addClass("page-all-scroll");
    }else{
        $(".page-container").removeClass("page-all-scroll");   
    }
    /* END ALL Scorall */
    
    /* Start Sidebar Fixed */
    if(theme_settings.st_sb_fixed == 1){        
        $(".page-sidebar").addClass("page-sidebar-fixed");
    }else{
        $(".page-sidebar").removeClass("page-sidebar-fixed");
    }
    /* END Sidebar Fixed */
    
    /* Start Sidebar Scroll */
    if(theme_settings.st_sb_scroll == 1){
        $(".page-sidebar").addClass("scroll").mCustomScrollbar("update");
    }else{
    	$(".page-sidebar.scroll").mCustomScrollbar("disable",true);
    	$(".page-sidebar").mCustomScrollbar("disable",true);
        $(".page-sidebar").removeClass("scroll").css("max-height","").mCustomScrollbar("disable",true);
    	setTimeout(function(){
        	$(".page-sidebar.scroll").height('auto');  
        	$(".page-sidebar .mCustomScrollBox").css("max-height","");
        },300);
    }
    /* END Sidebar Scroll */
    
    /* Start Right Sidebar */
    if(theme_settings.st_sb_right == 1){
        $(".page-container").addClass("page-mode-rtl");
    }else{
        $(".page-container").removeClass("page-mode-rtl");
    }
    /* END Right Sidebar */
    
    /* Start Custom Sidebar */
    if(theme_settings.st_sb_custom == 1){
        $(".page-sidebar .x-navigation").addClass("x-navigation-custom");
    }else{
        $(".page-sidebar .x-navigation").removeClass("x-navigation-custom");
    }
    /* END Custom Sidebar */
    
    /* Start Custom Sidebar */
    if(option && option === 'st_sb_toggled'){
        if(theme_settings.st_sb_toggled == 1){
            $(".page-container").addClass("page-navigation-toggled");
            $(".x-navigation-minimize").trigger("click");
        }else{          
            $(".page-container").removeClass("page-navigation-toggled");
            $(".x-navigation-minimize").trigger("click");
        }
    }
    /* END Custom Sidebar */
    
    /* Start Font Size */
    if(theme_settings.st_font_size == 0){
        $("html").attr("style","font-size:10px!important;");
    }else if(theme_settings.st_font_size == 1){
        $("html").attr("style","font-size:11px!important;");
    }else if(theme_settings.st_font_size == 2){
        $("html").attr("style","font-size:12px!important;");
    }else{
        $("html").attr("style","font-size:13px!important;");
    }
    /* END Font Size */
    /* Set states for options */
    if(option === false || option === 'st_layout_boxed' || option === 'st_sb_fixed' 
    	|| option === 'st_sb_scroll' || option === 'st_font_size'){  
        for(option in theme_settings){
            set_settings_checkbox(option,theme_settings[option]);
        }
    }
    /* End states for options */
    $(window).resize();
}

function idtype_set_settings(){
	Msg.open({
	    skin: 'uam-class',
	    title:false,
	    type: 1,
	    closeBtn: 0,
	    maxWidth: 910,
	    content: $('#idtype_set_settings_popup'), //这里content是一个DOM
	    success: function(layero, index){
	    	
	    	var $userleibie = $('#idtype_set_settings_popup').find("#userleibie_setting_div");
			var $user_type = $('#idtype_set_settings_popup').find("#user_type_setting_div");
	    	
			$("#userleibie_bar").hide();
			$userleibie.html("");
			$("#user_type_bar").hide();
			$user_type.html("");
			
	    	Util.ajax({
	    		url:contextpath +"/sys/uacm/uum/getIdTypeSetting",
	    		async:false,
	    		success:function(data){
	    			if(data) {
	    				var _idTypeData = data;
	    				var id_type_arr = new Array();

                        $.each(data, function(i,o){
                            id_type_arr.push(o.ID_TYPE);
                        })

	    				var $idtype = $('#idtype_set_settings_popup').find("#id_type_setting_div");
				    	var $idtypeDiv = $("<div></div>");
				    	if(tp.dic.data["DICT_SYS_USERTYPE"]){
							$.each(tp.dic.data["DICT_SYS_USERTYPE"] , function(ii,oo){
								var is_check = $.inArray(oo.CODEVALUE,id_type_arr)==-1?"":"checked";
								$idtypeDiv.append(
									 '<div class="padding-none pull-left push-right-20">'
										  +'<label class="check">'
										  		+'<input class="icheckbox" type="checkbox" idtype_name="'+oo.CODENAME+'" name="idtype_check" value="'+oo.CODEVALUE+'" '+ is_check+'>'
										  		+ 	oo.CODENAME
                                                + '</input>'
										  +'</label>'
									 +'</div>');
							});
							$idtype.html($idtypeDiv.html());
						}

                        if(Util.isNotEmpty(data)) {

                            Util.ajax({url:contextpath +"/sys/uacm/uum/getUserLeibieList",
                                param:{//mapping:"getUserLeibieList",
                                    id_type:id_type_arr,searchType:"1"},success:function(data){
                                    var $userleibieStr = "";
                                    if(data&&data.length>0){
                                        $("#userleibie_bar").show();
                                        $.each(_idTypeData , function(i,o){
                                            $userleibieStr+=('<div class="bar border-down-dedede-das push-up-10">' +
                                                '<h6 class="text-normal">'+Util.convertSysDic("DICT_SYS_USERTYPE",o.ID_TYPE)+'</h6>' +
                                                '</div>');

                                            $userleibieStr+=('<div class="bar push-down-5 push-up-10">');
                                            $.each(data , function(ii,oo){
                                                if(oo.EXT1.indexOf(","+o.ID_TYPE+",")>-1) {

                                                    var userleibie_arr = (Util.isNotEmpty(o.USER_LEIBIE)) ? (o.USER_LEIBIE).split(",") : [];
                                                    var is_check = $.inArray(oo.CODEVALUE, userleibie_arr) == -1 ? "" : "checked";

                                                    $userleibieStr+=(
                                                        '<div class="padding-none pull-left push-right-20">'
                                                        +'<label class="check">'
                                                        +'<input class="icheckbox" id_type="'+o.ID_TYPE+'" type="checkbox" name="userleibie_check" value="'+oo.CODEVALUE+ '" ' + is_check + '>'
                                                        + 	oo.CODENAME
                                                        +'</label>'
                                                        +'</div>'
                                                    );
                                                }
                                            })
                                            $userleibieStr+=('</div>');
                                        })
                                        $userleibie.html($userleibieStr);
                                    }else{
                                        $("#userleibie_bar").hide();
                                        $userleibie.html("");
                                    }
                                }});

                            //渲染用户类型下拉列表
                            Util.ajax({url:contextpath +"/sys/uacm/uum/getUserTypeList",
                                param:{
                                    // mapping:"getUserTypeList",
                                    id_type:id_type_arr,searchType:"1"},success:function(data){
                                    var $user_typeStr = "";
                                    if(data&&data.length>0){
                                        $("#user_type_bar").show();
                                        $.each(_idTypeData , function(i,o){
                                            $user_typeStr+=('<div class="bar border-down-dedede-das push-up-10">' +
                                                '<h6 class="text-normal">'+Util.convertSysDic("DICT_SYS_USERTYPE",o.ID_TYPE)+'</h6>' +
                                                '</div>');
                                            $user_typeStr+=('<div class="bar push-down-5 push-up-10">');
                                            $.each(data , function(ii,oo){
                                                if(oo.EXT1.indexOf(","+o.ID_TYPE+",")>-1) {

                                                    var user_type_arr = (Util.isNotEmpty(o.USER_TYPE)) ? (o.USER_TYPE).split(",") : [];
                                                    var is_check = $.inArray(oo.CODEVALUE, user_type_arr) == -1 ? "" : "checked";

                                                    $user_typeStr+=(
                                                        '<div class="padding-none pull-left push-right-20">'
                                                        +'<label class="check">'
                                                        +'<input class="icheckbox" id_type="'+o.ID_TYPE+'" type="checkbox" name="user_type_check" value="'+oo.CODEVALUE+ '" ' + is_check + '>'
                                                        + 	oo.CODENAME
                                                        +'</label>'
                                                        +'</div>');
                                                }
                                            })
                                            $user_typeStr+=('</div>');
                                        })
                                        $user_type.html($user_typeStr);
                                    }else{
                                        $("#user_type_bar").hide();
                                        $user_type.html("");
                                    }
                                }});
                        }

	    			}else{
	    				var $idtype = $('#idtype_set_settings_popup').find("#id_type_setting_div");
				    	var $idtypeDiv = $("<div></div>");
				    	if(tp.dic.data["DICT_SYS_USERTYPE"]){
							$.each(tp.dic.data["DICT_SYS_USERTYPE"] , function(ii,oo){
								$idtypeDiv.append(
									 '<div class="padding-none pull-left push-right-20">'
										  +'<label class="check">'
										  		+'<input class="icheckbox" type="checkbox" idtype_name="'+oo.CODENAME+'"name="idtype_check" value="'+oo.CODEVALUE+'">'
										  		+ 	oo.CODENAME
										  +'</label>'
									 +'</div>');
							});
							$idtype.html($idtypeDiv.html());
						}
	    			}
	    		}
	    	});
	    	
			$('#idtype_set_settings_popup').find("input[name='idtype_check']").change(function() {
				var flg=false;
				
				var idtypeArr = new Array();
                var idtypeNameArr = new Array();
				$("#idtype_set_settings_popup").find("input[name='idtype_check']").each(function() {
					if ($(this).is(':checked')) {
						flg = true;
						idtypeArr.push($(this).val());
                        idtypeNameArr.push($(this).attr("idtype_name"));
					}
				});
				
				if(flg) {
					//渲染用户类别下拉列表
					Util.ajax({url:contextpath +"/sys/uacm/uum/getUserLeibieList",
                        param:{
					        // mapping:"getUserLeibieList",
                            id_type:idtypeArr,searchType:"1"},success:function(data){
						var $userleibieStr = "";
						if(data&&data.length>0){
							$("#userleibie_bar").show();
                            $.each(idtypeArr , function(i,o){
                                $userleibieStr+=('<div class="bar border-down-dedede-das push-up-10">' +
                                    '<h6 class="text-normal">'+idtypeNameArr[i]+'</h6>' +
                                    '</div>');

                                $userleibieStr+=('<div class="bar push-down-5 push-up-10">');
                                $.each(data , function(ii,oo){
                                	if(oo.EXT1.indexOf(","+o+",")>-1) {
                                        $userleibieStr+=(
                                            '<div class="padding-none pull-left push-right-20">'
                                                +'<label class="check">'
                                                    +'<input class="icheckbox" id_type="'+o+'" type="checkbox" name="userleibie_check" value="'+oo.CODEVALUE+'">'
                                                    + 	oo.CODENAME
                                                +'</label>'
                                            +'</div>'
                                            );
									}
                                })
                                $userleibieStr+=('</div>');
                            })
							$userleibie.html($userleibieStr);
						}else{
							$("#userleibie_bar").hide();
							$userleibie.html("");
						}
					}});
					
					//渲染用户类型下拉列表
					Util.ajax({url:contextpath +"/sys/uacm/uum/getUserTypeList",
                        param:{
					        // mapping:"getUserTypeList",
                            id_type:idtypeArr,searchType:"1"},success:function(data){
						var $user_typeStr = "";
						if(data&&data.length>0){
							$("#user_type_bar").show();
                            $.each(idtypeArr , function(i,o){
                                $user_typeStr+=('<div class="bar border-down-dedede-das push-up-10">' +
                                    '<h6 class="text-normal">'+idtypeNameArr[i]+'</h6>' +
                                    '</div>');
                                $user_typeStr+=('<div class="bar push-down-5 push-up-10">');
                                $.each(data , function(ii,oo){
                                    if(oo.EXT1.indexOf(","+o+",")>-1) {
                                        $user_typeStr+=(
                                             '<div class="padding-none pull-left push-right-20">'
                                                  +'<label class="check">'
                                                        +'<input class="icheckbox" id_type="'+o+'" type="checkbox" name="user_type_check" value="'+oo.CODEVALUE+'">'
                                                        + 	oo.CODENAME
                                                  +'</label>'
                                             +'</div>');
                                    }
                                })
                                $user_typeStr+=('</div>');
                            })
                            $user_type.html($user_typeStr);
						}else{
							$("#user_type_bar").hide();
							$user_type.html("");
						}
					}});
				}else{
					$("#userleibie_bar").hide();
					$userleibie.html("");
					$("#user_type_bar").hide();
					$user_type.html("");
				}
				
			});
			
	    	$("#idtype_set_settings_popup").find("#idtype_set_settings_pop_close,#idtype_set_settings_select_cancle").unbind("click").click(function(){
	    		Msg.close(index);
		    });
		    
		    $('#idtype_set_settings_popup').find("#id_type_setting_confirm").unbind("click").click(function(){
		       
		    	// 身份类型
		        var idtypeArr = new Array();
				$("#idtype_set_settings_popup").find("input[name='idtype_check']").each(function() {
					if ($(this).is(':checked')) {
						idtypeArr.push($(this).val());
					}
				});
				
				// 用户类别
				var userleibieArr = new Array();
				$("#idtype_set_settings_popup").find("input[name='userleibie_check']").each(function() {
					if ($(this).is(':checked')) {
						userleibieArr.push({id_type:$(this).attr("id_type"),userleibie:$(this).val()});
					}
				});
				
				// 用户状态
				var user_typeArr = new Array();
				$("#idtype_set_settings_popup").find("input[name='user_type_check']").each(function() {
					if ($(this).is(':checked')) {
						user_typeArr.push({id_type:$(this).attr("id_type"),user_type:$(this).val()});
					}
				});
				
				//保存
				Util.ajax({
					url:contextpath +"/sys/uacm/uum/saveIdTypeSetting",
					param:{id_type:idtypeArr.join(),
						   user_leibie:userleibieArr,
						   user_type:user_typeArr},
					async:false,
					success:function(data){
						if(data){
							//添加成功之后的返回数据列表
							Msg.success("设置成功！");
							Msg.close(index);
						}
					}
				});
		    });
	    }
	});
}

function set_settings_checkbox(name,value){
    if(name == 'st_layout_boxed'){    
        $(".theme-settings").find("input[name="+name+"]").prop("checked",false).parent("div").removeClass("checked");
        var input = $(".theme-settings").find("input[name="+name+"][value="+value+"]");
        input.prop("checked",true);
        input.parent("div").addClass("checked");        
    }else if(name == 'st_font_size'){
        $(".theme-settings").find("input[name="+name+"]").prop("checked",false).parent("div").removeClass("checked");
                var input = $(".theme-settings").find("input[name="+name+"][value="+value+"]");
                input.prop("checked",true);
                input.parent("div").addClass("checked"); 
    }else{
        var input = $(".theme-settings").find("input[name="+name+"]");
        input.prop("disabled",false);            
        input.parent("div").removeClass("disabled").parent(".check").removeClass("disabled");        
        if(value == 1){
            input.prop("checked",true);
            input.parent("div").addClass("checked");
        }
        if(value == 0){
            input.prop("checked",false);            
            input.parent("div").removeClass("checked");            
        }
        if(value == -1){
            input.prop("checked",false);            
            input.parent("div").removeClass("checked");
            input.prop("disabled",true);            
            input.parent("div").addClass("disabled").parent(".check").addClass("disabled");
        }        
    }
}
