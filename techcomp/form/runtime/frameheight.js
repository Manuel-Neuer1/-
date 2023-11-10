
      (function($, h, c) {
        var a = $([]),
            e = $.resize = $.extend($.resize, {}),
            i,
            k = "setTimeout",
            j = "resize",
            d = j + "-special-event",
            b = "delay",
            f = "throttleWindow";
        e[b] = 250;
        e[f] = true;
        $.event.special[j] = {
          setup: function() {
            if (!e[f] && this[k]) {
              return false;
            }
            var l = $(this);
            a = a.add(l);
            $.data(this, d, {
              w: l.width(),
              h: l.height()
            });
            if (a.length === 1) {
              g();
            }
          },
          teardown: function() {
            if (!e[f] && this[k]) {
              return false;
            }
            var l = $(this);
            a = a.not(l);
            l.removeData(d);
            if (!a.length) {
              clearTimeout(i);
            }
          },
          add: function(l) {
            if (!e[f] && this[k]) {
              return false;
            }
            var n;
            function m(s, o, p) {
              var q = $(this),
                  r = $.data(this, d);
              r.w = o !== c ? o: q.width();
              r.h = p !== c ? p: q.height();
              n.apply(this, arguments);
            }
            if ($.isFunction(l)) {
              n = l;
              return m;
            } else {
              n = l.handler;
              l.handler = m;
            }
          }
        };
        function g() {
          i = h[k](function() {
            a.each(function() {
              var n = $(this),
                  m = n.width(),
                  l = n.height(),
                  o = $.data(this, d);
              if (m !== o.w || l !== o.h) {
                n.trigger(j, [o.w = m, o.h = l]);
              }
            });
            g();
          },
                   e[b]);
        }
      })(jQuery, this);
      var frameHeightLastModifyTime = new Date();
      var frameHeightXiuZhengFunc; //高度修正函数，在调整完高度之后，等500毫秒，再最后检查下最终高度。
      var frameHeight = function() {
        var main = $(window.parent.document).find("#formIframe");
        var mainheight = $("body").height() + 10;
        var frameHeightInterval = new Date() - frameHeightLastModifyTime;
        if(main.height() < mainheight || frameHeightInterval>1000){ //如果想改大高度，直接可以改；如果想改小高度，时间间隔必须大于1秒才给改
            clearTimeout(frameHeightXiuZhengFunc);
            frameHeightLastModifyTime = new Date();
            main.height(mainheight);
            frameHeightXiuZhengFunc = setTimeout(function(){ var bodyheight = $("body").height() + 20;if(bodyheight>mainheight){main.height(bodyheight);}}, 500);
        }
      };
      $(window).resize(function() {
        frameHeight();
      });
      $("body").resize(function() {
        frameHeight();
      });