;
(function(factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module. 
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS 
        factory(require('jquery'));
    } else {
        // Browser globals 
        factory(window.jQuery || window.Zepto);
    }
}(function($) {

    var ImgPreview = function(el, opts) {
        this.el = el;
        this.defaults = {};
        this.options = $.extend({}, this.defaults, opts);
    }


    ImgPreview.prototype = {
        init: function() {
            var me = this,
                el = me.el;


            me.bindEvents();

            el.attr('data-initialized', 'true');

            return me;
        },

        /**
         * 事件绑定
         * @return {[type]} [description]
         */
        bindEvents: function() {
            var me = this,
                el = me.el;


            el.on('change', 'input[type="file"]', function(e) {
                e.preventDefault();


                var elCurrentTarger = $(e.currentTarget),
                    elFile = el.find('input[type="file"]'),
                    elPic = el.find('.preview img'),
                    file = elFile.val(),
                    ext = file.substring(file.lastIndexOf(".") + 1).toLowerCase(),
                    path;

                // gif在IE浏览器暂时无法显示
                if (ext != 'png' && ext != 'jpg' && ext != 'jpeg') {
                    return false;
                }

                isIE6 = (navigator.userAgent.match(/MSIE 6.0/) != null);

                if (window.VBArray) {
                    me._previewFallback(elPic, elFile);
                } else {
                    me._preview(elPic, elFile);
                }
            })
        },


        /**
         * 预览图片，IE10以上的浏览器
         * @param  {[type]} elPic [description]
         * @param  {[type]} file  [description]
         * @return {[type]}       [description]
         */
        _preview: function(elPic, elFile) {
            var me = this,
                el = me.el,
                file = elFile[0].files[0],
                reader = new FileReader();

            reader.readAsDataURL(file);
            reader.onload = function(e) {
                elPic.attr('src', this.result);
            }
        },

        /**
         * 降级预览，IE9以下的浏览器
         * @param  {[type]} elPic  [description]
         * @param  {[type]} elFile [description]
         * @return {[type]}        [description]
         */
        _previewFallback: function(elPic, elFile) {
            var me = this,
                el = me.el;

            elFile[0].select();
            elFile[0].blur();

            path = document.selection.createRange().text;
            if (isIE6) {
                elPic.attr('src', path);
            } else {
                // 非IE6版本的IE由于安全问题直接设置img的src无法显示本地图片，但是可以通过滤镜来实现
                elPic.css({
                    'filter': "progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod='image',src=\"" + path + "\")"
                });

                me._scalePic(elPic);
                elPic.css({
                    'filter': "progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod='scale',src=\"" + path + "\")"
                });

                // 设置img的src为base64编码的透明图片 取消显示浏览器默认图片
                pic.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
            }
        },

        /**
         * 根据图片与容器的宽高，智能缩放图片
         * @param  {[type]} elPic     [description]
         * @param  {[type]} elWrapper [description]
         * @return {[type]}           [description]
         */
        _scalePic: function(elPic, elWrapper) {
            var me = this,
                el = me.el,
                width = elPic.width(),
                height = elPic.height(),
                ratio = width / height,
                elWrapper = elWrapper || elPic.parent(),
                wrapperWidth, wrapperHeight, wrapperRatio;

            wrapperWidth = elWrapper.width();
            wrapperHeight = elWrapper.height();
            wrapperRatio = wrapperWidth / wrapperHeight;

            if (width < wrapperWidth && height < wrapperHeight) {
                // 居中显示
            } else {
                if (ratio >= wrapperRatio) {
                    // 已宽度为基准
                    height = wrapperWidth / width * height;
                    width = wrapperWidth;
                } else {
                    // 以高度为基准
                    width = wrapperHeight / height * width;
                    height = wrapperHeight;
                }
            }

            elPic.width(width);
            elPic.height(height);
        }
    }

    $.fn.ImgPreview = function(opts) {
        var com;

        return this.each(function() {
            var elNode = $(this);

            if (elNode.attr('data-initialized') == 'true') {
                return;
            }

            com = new ImgPreview(elNode, opts);
            com.init();
        });
    }
}));
