dojo.provide("unieap.nls.application_zh_CN");

RIA_I18N={
	
		//-----------------------表单控件-----------------------------//
		form:{
			calendar:{
				//周日
				full_Sunday : "\u5468\u65e5",
				//周一
				full_Monday : "\u5468\u4e00",
				//周二
				full_Tuesday:"\u5468\u4e8c",
				//周三
				full_Wednesday:"\u5468\u4e09",
				//周四
				full_Thursday:"\u5468\u56db",
				//周五
				full_Firday:"\u5468\u4e94",
				//周六
				full_Saturday:"\u5468\u516d",
				//日
				short_Sunday:"\u65e5",
				//一
				short_Monday:"\u4e00",
				//二
				short_Tuesday:"\u4e8c",
				//三
				short_Wednesday:"\u4e09",
				//四
				short_Thursday:"\u56db",
				//五
				short_Firday:"\u4e94",
				//六
				short_Saturday:"\u516d",
				
				//一月
				full_January:"\u4e00\u6708",
				//二月
				full_February:"\u4e8c\u6708",
				//三月
				full_March:"\u4e09\u6708",
				//四月
				full_April:"\u56db\u6708",
				//五月
				full_May:"\u4e94\u6708",
				//六月
				full_June:"\u516d\u6708",
				//七月
				full_July:"\u4e03\u6708",
				//八月
				full_August:"\u516b\u6708",
				//九月
				full_September:"\u4e5d\u6708",
				//十月
				full_October:"\u5341\u6708",
				//十一月
				full_November:"\u5341\u4e00\u6708",
				//十二月
				full_December:"\u5341\u4e8c\u6708",
				
				//一月
				short_January:"\u4e00\u6708",
				//二月
				short_February:"\u4e8c\u6708",
				//三月
				short_March:"\u4e09\u6708",
				//四月
				short_April:"\u56db\u6708",
				//五月
				short_May:"\u4e94\u6708",
				//六月
				short_June:"\u516d\u6708",
				//七月
				short_July:"\u4e03\u6708",
				//八月
				short_August:"\u516b\u6708",
				//九月
				short_September:"\u4e5d\u6708",
				//十月
				short_October:"\u5341\u6708",
				//十一月
				short_November:"\u5341\u4e00\u6708",
				//十二月
				short_December:"\u5341\u4e8c\u6708",
				
				//关于
				about :"\u5173\u4e8e",
				//上一年
				prev_year : "\u4e0a\u4e00\u5e74",
				//上个月
				prev_month: "\u4e0a\u4e2a\u6708",
				//到今天
			    go_today :"\u5230\u4eca\u5929",
			    //下个月
			    next_month:"\u4e0b\u4e2a\u6708",
			    //下一年
			    next_year:"\u4e0b\u4e00\u5e74",
			    //选择日期
			    sel_date:"\u9009\u62e9\u65e5\u671f",
			    //拖动
				drag_to_move:"\u62d6\u52a8",
				//(今天)
				part_today :"(\u4eca\u5929)",
				
				//%s为这周的第一天
				day_first:"%s\u4e3a\u8fd9\u5468\u7684\u7b2c\u4e00\u5929",
				
				//关闭
				close:"\u5173\u95ed",
				//今天
				today:"\u4eca\u5929",
				//(按着Shift键)单击或拖动改变值
				time_part:"(\u6309\u7740Shift\u952e)\u5355\u51fb\u6216\u62d6\u52a8\u6539\u53d8\u503c",
				
				def_date_format:"%Y-%m-%d",
				
				tt_date_format:"%A, %b %e\u65e5",
				
				//周
				wk:"\u5468",
				//时间：
				time:"\u65f6\u95f4:"
			},

			combobox:{
				//位于comboboxpopup文件中
				//代码值
				codeValue:"\u4ee3\u7801\u503c",
				//代码标题
				codeName:"\u4ee3\u7801\u6807\u9898"
			},
			fileinput:{
					//浏览
					browser:"\u6d4f\u89c8",
					//取消
					cancel:"\u53d6\u6d88",
					//只允许上传文件后缀名为
					fileInvalidFormer:"\u53ea\u5141\u8bb8\u4e0a\u4f20\u6587\u4ef6\u540e\u7f00\u540d\u4e3a",
					//的文件
					fileInvalidLatter:"\u7684\u6587\u4ef6",
					
					//提示信息
					info:'\u63d0\u793a\u4fe1\u606f'
			},

			form:{
					//校验提示
					validateMsg:"\u6821\u9a8c\u63d0\u793a"
			},

			formWidgetValidator:{
					//输入不合法!
					errorMsg:"\u8f93\u5165\u4e0d\u5408\u6cd5!",
					//该输入项的值不能为空！
					nullError:"\u8be5\u8f93\u5165\u9879\u7684\u503c\u4e0d\u80fd\u4e3a\u7a7a\uff01",
					//该输入项的最大长度为
					maxLengthError:"\u8be5\u8f93\u5165\u9879\u7684\u6700\u5927\u957f\u5ea6\u4e3a",
					//该输入项的最小长度为
					minLengthError:"\u8be5\u8f93\u5165\u9879\u7684\u6700\u5c0f\u957f\u5ea6\u4e3a"
			},
			
			dateTextBox:{
				//位于文件unieap.form.DateDisplayFormatter中，用于指定日期的默认格式
				dataFormat:"yyyy-MM-dd"
			},
			
			numberTextBox:{
				//位于unieap.form.NumberTextBoxValidator中，用于提示只能输入数字
				//该输入项只能输入数字!
				errorMsg:'\u8be5\u8f93\u5165\u9879\u53ea\u80fd\u8f93\u5165\u6570\u5b57\uff01'
			}

		},
		
		//-----------------------数据表格控件-----------------------------//
		
		grid:{
			'export':{
				//服务端导出
				serverExport:'\u670d\u52a1\u7aef\u5bfc\u51fa',
				//客户端导出
				clientExport:'\u5ba2\u6237\u7aef\u5bfc\u51fa',
				//导出选中记录
				selectedExport:'\u5bfc\u51fa\u9009\u4e2d\u8bb0\u5f55',
                                //提示信息
				info:"\u63d0\u793a\u4fe1\u606f",
				//无可导出数据，请重新设置查询条件后再导出!
				noDataByQuery :"\u65e0\u53ef\u5bfc\u51fa\u6570\u636e\uff0c\u8bf7\u91cd\u65b0\u8bbe\u7f6e\u67e5\u8be2\u6761\u4ef6\u540e\u518d\u5bfc\u51fa!",
				//无可导出数据，请先选择数据再导出!
				noDataByChoices:"\u65e0\u53ef\u5bfc\u51fa\u6570\u636e\uff0c\u8bf7\u5148\u9009\u62e9\u6570\u636e\u518d\u5bfc\u51fa!"				
			},
			
			individual:{
				//设置
				settings:'\u8bbe\u7f6e',
				//重置
				reset:'\u91cd\u7f6e',
				//个性化设置
				title:'\u4e2a\u6027\u5316\u8bbe\u7f6e',
				//显示
				visible:'\u663e\u793a',
				//锁定
				lock:'\u9501\u5b9a',
				//列名
				column:'\u5217\u540d',
				//上移
				moveup:'\u4e0a\u79fb',
				//下移
				movedown:'\u4e0b\u79fb',
				//保存
				save:'\u4fdd\u5b58',
				//应用
				apply:'\u5e94\u7528'
				
			},
			
			paging:{
				//本页共{0}条记录  共{1}条记录
				template:'\u672c\u9875\u5171{0}\u6761\u8bb0\u5f55  \u5171{1}\u6761\u8bb0\u5f55',
				//第
				pagePrefix:'\u7b2c',
				//页
				page:'\u9875',
				//保存修改?
				saveModified:'\u4fdd\u5b58\u4fee\u6539?',
				//数据发生改变，是否放弃修改？
				discardModified:"\u6570\u636e\u53d1\u751f\u6539\u53d8\uff0c\u662f\u5426\u653e\u5f03\u4fee\u6539\uff1f",
				//第一页
				firstPage:'\u7b2c\u4e00\u9875',
				//上一页
				prevPage:'\u4e0a\u4e00\u9875',
				//下一页
				nextPage:'\u4e0b\u4e00\u9875',
				//最后一页
				lastPage:'\u6700\u540e\u4e00\u9875',
                                //保存修改？
				saveChanges:"\u4fdd\u5b58\u4fee\u6539\uff1f"
				
			},
			
			group:{
				//请选择进行分组的列
				tip:'\u8bf7\u9009\u62e9\u8fdb\u884c\u5206\u7ec4\u7684\u5217',
				//分组统计
				statistics:'\u5206\u7ec4\u7edf\u8ba1',
				//最大值
				max:'\u6700\u5927\u503c',
				//最小值
				min:'\u6700\u5c0f\u503c',
				//合计值
				sum:'\u5408\u8ba1\u503c',
				//平均值
				avg:'\u5e73\u5747\u503c',
				//清除统计
				clear:'\u6e05\u9664\u7edf\u8ba1',
				
				//提交分组信息
				sumbitGroup:"\u63d0\u4ea4\u5206\u7ec4\u4fe1\u606f",
				//移除分组列
				removeColumn:"\u79fb\u9664\u5206\u7ec4\u5217",
				
				//空
				noValue:"\u7a7a",
 				//计
				count:"\u8ba1",
                                //列校验信息
				columnCheckInfo:"\u5217\u6821\u9a8c\u4fe1\u606f",
                              //必须设置至少一列可见
				columnVisible :"\u5fc5\u987b\u8bbe\u7f6e\u81f3\u5c11\u4e00\u5217\u53ef\u89c1"
			},
			
			filter:{
				//过滤
				filter:'\u8fc7\u6ee4',
				//清除本列过滤
				clearColumn:'\u6e05\u9664\u672c\u5217\u8fc7\u6ee4',
				//清除表格过滤
				clearGrid:'\u6e05\u9664\u8868\u683c\u8fc7\u6ee4',
				//设置"${0}"列过滤条件
				configure:'\u8bbe\u7f6e\"${0}\"\u5217\u8fc7\u6ee4\u6761\u4ef6',
				//等于
				eq:'\u7b49\u4e8e',
				//不等于
				neq:'\u4e0d\u7b49\u4e8e',
				//大于
				gt:'\u5927\u4e8e',
				//大于等于
				gte:'\u5927\u4e8e\u7b49\u4e8e',
				//小于
				lt:'\u5c0f\u4e8e',
				//小于等于
				lte:'\u5c0f\u4e8e\u7b49\u4e8e',
				//包含
				include:'\u5305\u542b',
				//不包含:
				exclude:'\u4e0d\u5305\u542b',
				//为空
				empty:'\u4e3a\u7a7a',
				//不为空
				notempty:'\u4e0d\u4e3a\u7a7a',
				//与
				and:'\u4e0e',
				//或
				or:'\u6216',
				
				//确定
				confirm:"\u786e\u5b9a",
				//取消
				cancel:"\u53d6\u6d88"
			},
			
			toolbar:{
				//每页
				perPage:"\u6bcf\u9875",
				//条
				items:"\u6761",
				//个性化
				individual:"\u4e2a\u6027\u5316",
				//打印
				print:"\u6253\u5370",
                                //共
				total:"\u5171",
				//条记录
				records:"\u6761\u8bb0\u5f55"
			}
		},
		
		
		//-----------------------布局控件-----------------------------//
		layout:{
			contentPane:{
				//正在装入...
				loading:"\u6b63\u5728\u88c5\u5165..."
			},
			tabController:{
				//关闭
				close:"\u5173\u95ed"
			}
		},
		
		
		//-----------------------对话框控件-----------------------------//
		dialog:{
			dialog:{
				//对话框
				title : "\u5bf9\u8bdd\u6846",
				//最大化
				maximinze:"\u6700\u5927\u5316",
				//关闭
				close:"\u5173\u95ed",
				//还原
				restore:"\u8fd8\u539f",
				//载入出错
				error:"\u8f7d\u5165\u51fa\u9519"
			},
			messageBox:{
				//确定
				confirm:"\u786e\u5b9a",
				//取消
				cancel:"\u53d6\u6d88",
				//您是否确认？
				confirmText:"\u60a8\u662f\u5426\u786e\u8ba4\uff1f",
				//确认框
				confirmTitle:"\u786e\u8ba4\u6846",
				//是
				yes:"\u662f",
				//否
				no:"\u5426",
				//信息提示
				infoText:"\u4fe1\u606f\u63d0\u793a",
				//自动关闭确认框
				autoClose:"\u81ea\u52a8\u5173\u95ed\u786e\u8ba4\u6846",
				//请输入内容：
				inputContent:"\u8bf7\u8f93\u5165\u5185\u5bb9\uff1a",
				//输入提示框
				promptDialog:"\u8f93\u5165\u63d0\u793a\u6846"
				
			}
		},
		
		//-----------------------util文件夹下的文件-----------------------------//
		util:{
			debug:{
				//非json格式数据
				notJson:"\u975ejson\u683c\u5f0f\u6570\u636e",
				//Json数据结构
				jsonData:"Json\u6570\u636e\u7ed3\u6784"
			},
			
			installplugin:{
				//脚本解析引擎
				script:"\u811a\u672c\u89e3\u6790\u5f15\u64ce",
				//客户端缓存插件
				gears:"\u5ba2\u6237\u7aef\u7f13\u5b58\u63d2\u4ef6"
			},
			
			util:{
				//最大值
				max:"\u6700\u5927\u503c",
				//最小值
				min:"\u6700\u5c0f\u503c",
				//平均值
				avg:"\u5e73\u5747\u503c",
				//合计值
				sum:"\u5408\u8ba1\u503c",
				//终止事件！
				stopEvent:"\u7ec8\u6b62\u4e8b\u4ef6\uff01",
				//正在装载数据...
				loading:"\u6b63\u5728\u88c5\u8f7d\u6570\u636e...",
				//关闭
				close:"\u5173\u95ed",
				//请正确设置dojoType属性。
				dojoTypeError:"\u8bf7\u6b63\u786e\u8bbe\u7f6edojoType\u5c5e\u6027\u3002",
				
				defaultDateFormat:"yyyy-MM-dd"
			},
                        spell:{
                               //函数makePy需要字符串类型参数!
				makePy:"\u51fd\u6570makePy\u9700\u8981\u5b57\u7b26\u4e32\u7c7b\u578b\u53c2\u6570!" 
                        },
                        ie:{
                               //友情提示：您当前使用的浏览器是IE
				isIE:"\u53cb\u60c5\u63d0\u793a\uff1a\u60a8\u5f53\u524d\u4f7f\u7528\u7684\u6d4f\u89c8\u5668\u662fIE",
				//，为了加快浏览速度，建议您升级到&nbsp;&nbsp;</span><a href='#' onClick='upgrade(event)'>IE8浏览器</a>。
				toIE8:"\uff0c\u4e3a\u4e86\u52a0\u5feb\u6d4f\u89c8\u901f\u5ea6\uff0c\u5efa\u8bae\u60a8\u5347\u7ea7\u5230&nbsp;&nbsp;</span><a href='#' onClick='upgrade(event)'>IE8\u6d4f\u89c8\u5668</a>\u3002",
				//IE8升级程序
				programForIE8:"IE8\u5347\u7ea7\u7a0b\u5e8f"
			}
		},
		
	////-------------------------tooltip----------------------///////////
		tooltip:{
			//内容正在加载，请稍候…
			loading:"\u5185\u5bb9\u6b63\u5728\u52a0\u8f7d\uff0c\u8bf7\u7a0d\u5019..."
		},
		
		////-------------------------rpc----------------------///////////
		rpc:{
			//会话过期,请重新登录
			sessionOut:"\u4f1a\u8bdd\u8fc7\u671f,\u8bf7\u91cd\u65b0\u767b\u5f55",
			
			//请求数据成功！但回调方法出错；请检查自定义load回调函数。
			loadError:"\u8bf7\u6c42\u6570\u636e\u6210\u529f\uff01\u4f46\u56de\u8c03\u65b9\u6cd5\u51fa\u9519\uff1b\u8bf7\u68c0\u67e5\u81ea\u5b9a\u4e49load\u56de\u8c03\u51fd\u6570\u3002",
			
			//错误提示
			errorTip:"\u9519\u8bef\u63d0\u793a",
			
			//请求操作失败
			errorMessage:"\u8bf7\u6c42\u64cd\u4f5c\u5931\u8d25",
			
			//成功提示
			success:"\u6210\u529f\u63d0\u793a",
			
			//请求操作成功
			successMessage:"\u8bf7\u6c42\u64cd\u4f5c\u6210\u529f",
			
			//导出的布局信息为空！
			layoutInfoEmpty:"\u5bfc\u51fa\u7684\u5e03\u5c40\u4fe1\u606f\u4e3a\u7a7a\uff01",
			
			
			//确定
			confirmButton:"\u786e\u5b9a",
			//提示信息
			info:"\u63d0\u793a\u4fe1\u606f",
			//由于数据资源文件配置出错,程序不执行打印操作。
			printError:"\u7531\u4e8e\u6570\u636e\u8d44\u6e90\u6587\u4ef6\u914d\u7f6e\u51fa\u9519,\u7a0b\u5e8f\u4e0d\u6267\u884c\u6253\u5370\u64cd\u4f5c\u3002",
			
			//获取信息失败
			getInfoError:"\u83b7\u53d6\u4fe1\u606f\u5931\u8d25",
			
			//保存信息失败
			saveError:"\u4fdd\u5b58\u4fe1\u606f\u5931\u8d25",
			
			//正在装载缓存数据...
			loadingCache:"\u6b63\u5728\u88c5\u8f7d\u7f13\u5b58\u6570\u636e...",
			//装载缓存数据失败。
			loadCacheError:"\u88c5\u8f7d\u7f13\u5b58\u6570\u636e\u5931\u8d25\u3002"
				
		},
		
		////-------------------------xgrid----------------------///////////
		xgrid:{
			individual:{
				//保存
				save:'\u4fdd\u5b58',
				//重置
				reset:'\u91cd\u7f6e'
			},
			
			filter:{
				//过滤
				filter:'\u8fc7\u6ee4',
				//清除本列过滤
				clearColumn:'\u6e05\u9664\u672c\u5217\u8fc7\u6ee4',
				//清除表格过滤
				clearGrid:'\u6e05\u9664\u8868\u683c\u8fc7\u6ee4',
				//设置"${0}"列过滤条件
				configure:'\u8bbe\u7f6e\"${0}\"\u5217\u8fc7\u6ee4\u6761\u4ef6',
				//等于
				eq:'\u7b49\u4e8e',
				//不等于
				neq:'\u4e0d\u7b49\u4e8e',
				//大于
				gt:'\u5927\u4e8e',
				//大于等于
				gte:'\u5927\u4e8e\u7b49\u4e8e',
				//小于
				lt:'\u5c0f\u4e8e',
				//小于等于
				lte:'\u5c0f\u4e8e\u7b49\u4e8e',
				//包含
				include:'\u5305\u542b',
				//不包含:
				exclude:'\u4e0d\u5305\u542b',
				//为空
				empty:'\u4e3a\u7a7a',
				//不为空
				notempty:'\u4e0d\u4e3a\u7a7a',
				//与
				and:'\u4e0e',
				//或
				or:'\u6216',
				
				//确定
				confirm:"\u786e\u5b9a",
				//取消
				cancel:"\u53d6\u6d88"
			},
			
			menu:{
				//锁定
				lockColumn:"\u9501\u5b9a",
				//解锁
				unlockColumn:"\u89e3\u9501",
				//展现列
				columns:"\u5c55\u73b0\u5217"
			},
            binding:{
                //计
				count:"\u8ba1",
				//保存修改？
				saveMoidify:"\u4fdd\u5b58\u4fee\u6539\uff1f",
				//列校验信息
				columnCheckInfo:"\u5217\u6821\u9a8c\u4fe1\u606f"
             },
            'export':{
                //提示信息
				info:"\u63d0\u793a\u4fe1\u606f",
				//无可导出数据，请重新设置查询条件后再导出!
				noDataByQuery:"\u65e0\u53ef\u5bfc\u51fa\u6570\u636e\uff0c\u8bf7\u91cd\u65b0\u8bbe\u7f6e\u67e5\u8be2\u6761\u4ef6\u540e\u518d\u5bfc\u51fa!",
				//无可导出数据，请先选择数据再导出!
				noDataByChoice:"\u65e0\u53ef\u5bfc\u51fa\u6570\u636e\uff0c\u8bf7\u5148\u9009\u62e9\u6570\u636e\u518d\u5bfc\u51fa!"
			}
		},
		
		
	////-------------------------tree----------------------///////////
		tree:{
			dnd:{
				// 是否执行拖拽操作
				doDrop:"\u662f\u5426\u786e\u8ba4\u6267\u884c\u62d6\u62fd\u64cd\u4f5c\uff1f"
			}
		},
	////-------------------------patch----------------------///////////
        patch:{
            rpc:{
				//正在装载缓存数据…
				loadingCacheData :"\u6b63\u5728\u88c5\u8f7d\u7f13\u5b58\u6570\u636e\u2026",
				//装载缓存数据失败。
				loadCacheDataFailed :"\u88c5\u8f7d\u7f13\u5b58\u6570\u636e\u5931\u8d25\u3002",
                                //获取信息失败
				getInfoFailed :"\u83b7\u53d6\u4fe1\u606f\u5931\u8d25",
				//保存信息失败
				saveInfoFailed:"\u4fdd\u5b58\u4fe1\u606f\u5931\u8d25",
				//导出的布局信息为空！
				noLayoutInfo:"\u5bfc\u51fa\u7684\u5e03\u5c40\u4fe1\u606f\u4e3a\u7a7a\uff01",
				//确定
				confirm:"\u786e\u5b9a",
				//提示信息
				info:"\u63d0\u793a\u4fe1\u606f",
				//由于数据资源文件配置出错,程序不执行打印操作。
				configError:"\u7531\u4e8e\u6570\u636e\u8d44\u6e90\u6587\u4ef6\u914d\u7f6e\u51fa\u9519,\u7a0b\u5e8f\u4e0d\u6267\u884c\u6253\u5370\u64cd\u4f5c\u3002"
			}
    	},
////-------------------------global----------------------///////////
       global:{
            comboBox:{
                //<请选择>
				choices:"<\u8bf7\u9009\u62e9>"
            }
       }
};