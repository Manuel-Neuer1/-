var fpUtil = {
    bindClick:function($obj,callback,args){
        if(/iphone|ipad|ipod/.test(window.navigator.userAgent.toLocaleLowerCase())){
                var timeStamp_start=0.0;//触摸开始时间戳
                var timeStamp_end=0.0;//触摸结束时间戳

                var x_start=0.0;//触摸开始x坐标
                var y_start=0.0;//触摸开始y坐标


                var x_end=0.0;//触摸结束x坐标
                var y_end=0.0;//触摸结束x坐标

                $obj.on('touchstart',function(e) {

                    var _touch = e.originalEvent.targetTouches[0];

                    timeStamp_start=e.timeStamp;
                    x_start= _touch.pageX;
                    y_start=_touch.pageY;

                })

                $obj.on('touchend',function(e) {
                    timeStamp_end=e.timeStamp;
                    var _touch = e.originalEvent.changedTouches[0];

                    e.preventDefault();
                    e.stopPropagation();

                    timeStamp_end=e.timeStamp;
                    x_end= _touch.pageX;
                    y_end=_touch.pageY;
                    //判断条件，时间差<=300 并且  在同一个位置
                    if(timeStamp_end-timeStamp_start<=300&&x_start==x_end&&y_start==y_end){
                        callback.apply(this,args);
                    }
                })
        }else{
            //打开服务
            $obj.off("click").on("click",function(){
                callback.apply(this,args);
            });
        }
    }
}