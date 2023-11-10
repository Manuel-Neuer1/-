/**
 * 采用jquery渲染整个的button控件
 */
WebForm.widget("unieap.form.Button",WebForm.FormWidget,{
			btnType:'',//当前button的类型common、submit
			_create : function() {
				this._super(arguments);
				this.element.button();
				this.btnType=this.element.attr("btntype");
				if(this.btnType=='common'){
					/*this.element.on("click",function(){
						WebForm.saveForm();//封装一层，否则影响saveForm的参数
					});*/
				}
				else if(this.btnType=='submit')
					this.element.bind("click",function(){
						var result = WebForm.saveForm();
						if(result.status=="success"){
							$(this).addClass("disabled");
							// 计算分数--轻应用使用--开始--
							var needCalcScore = true;
							var formId = dataCenter.getParameter("formid");
							var assignmentId = dataCenter.getParameter("assignment_id");
							
							result.formId = formId;
							result.assignmentId = assignmentId;
							var requestURL = WEBAPP+"/rest/assignment/calculatescore";
							if(needCalcScore){
								$.ajax({
								 	type: 'get',
									url:requestURL,
									async:false,
									data:result,
									contentType:'text/plain;charset=UTF-8',
									success:function(result){
										dealWithResult(result);
										console.log("计算成功，返回结果了！");
									},
									error:function(result){
										result.status="fail";
										returnValue = result;
//									  returnValue = "fail";
									}
								});
							}
							// 计算分数--轻应用使用--结束--
//							var successInfo = '<label style="color:#23c6c8">感谢您的填写!</label>';
//							$($("input[btntype='submit']").get(0)).after(successInfo);
						}
					});
				else if(this.btnType=='print')
					this.element.bind("click",WebForm.print);
				else if(this.btnType=='startprocess'){
					this.element.bind("click",function(){
						WebForm.startProcess();
					});
				}
				else if(this.btnType=='rollback' || this.btnType=='suspend' || this.btnType=='abort') {
					this.element.bind("click",{'btnType':this.btnType},function(event){
						var btnType=event.data.btnType;
						WebForm.saveForm(btnType ,dataCenter.getParameter("workitemid"));
					});
				}
				else if (this.btnType=='export'){
					this.element.bind("click",function(){
						WebForm.exportForm();
					});
				}
			}
		
			
		});

var dealWithResult=function(result){
	var paperSetting=unieap.paperSetting?unieap.paperSetting:{};
	if(result.isTest){
		var questions=result.personList[0].itemDetail;
		$(questions).each(function(index ,question) {
			var issueName=question.questionName;
			
			var correctInfo=result.correctAnswer;
			var isTest=false;
			var id='';
			$(correctInfo).each(function(index ,info) {
				if(info.label==issueName){
					isTest=info.test;
					id=info.name;
					return false;
				}
			});	
			if(isTest&&paperSetting.isDisplayAnswer&&paperSetting.isDisplayAnswer===1){
				if(question.correct==false){
					$("#"+id).parent().append("<em style='color:#db4c4a;display: block;font-style:normal'>回答错误:正确答案为'"+question.correctAnswer+"'</em>");
				}else{
					$("#"+id).parent().append("<em style='color:green;display: block;font-style:normal'>回答正确"+"</em>");
				}
	        }
		});	
		var person=result.personList[0];
		var successInfo = '<label style="color:#23c6c8;margin-top:10px;font-size:16px">感谢您的填写!</label>';
		var score='<label style="color:#23c6c8;font-size:16px">总分:'+person.assignmentTotalScore+'分'+'&nbsp&nbsp您的成绩:'+person.totalScore+'分'+'&nbsp&nbsp答题正确率:'+person.correctRate.toFixed(4)*100+'%</label>';
		if(paperSetting.isDisplayScore&&paperSetting.isDisplayScore===1){
			$($("input[btntype='submit']").get(0)).after(score+'<br>'+successInfo);
		}else{
			$($("input[btntype='submit']").get(0)).after(successInfo);
		}
		
	}else{
		var successInfo = '<label style="color:#23c6c8">感谢您的填写!</label>';
		$($("input[btntype='submit']").get(0)).after(successInfo);
	}
	
	
	
}
