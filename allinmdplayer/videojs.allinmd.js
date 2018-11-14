/**
 * 版本号：Version 1.1
 * 功能描述：AllinmdPlayer播放器插件
 * 使用方法: new AllinmdPlayer('video_id',{options},callback);
 * 注意事件：
 *          1.保证已引入jQuery
 *          2.在IE8场景下需要引入videojs-ie8.min.js文件
 * Created by Y.Q on 2017/04/13
 * Add new functions by Y.Q on 2017/04/23
 * Add new plugin,the AllinmdHotKeys by Y.Q on 2017/06/05
 * Add new plugin,the videoJsSpeedSwitcher by Y.Q on 2018/06/20
 */
;
(function () {
    'use strict';
    var videojs = null;
    if (window.videojs !== 'undefined' && window.videojs != null) {
        videojs = window.videojs;
    } else {
        return;
    }

    /**
     * 清晰度切换插件实现
     * @param window
     * @param videojs
     */
    (function (window, videojs) {
        var defaults = {},
            videoJsResolutionSwitcher,
            currentResolution = {},
            menuItemsHolder = {};

        function setSourcesSanitized(player, sources, label, customSourcePicker) {
            currentResolution = {
                label: label,
                sources: sources
            };
            if (typeof customSourcePicker === 'function') {
                return customSourcePicker(player, sources, label);
            }
            return player.src(sources.map(function (src) {
                return {
                    src: src.src,
                    type: src.type,
                    res: src.res
                }
            }));
        }

        //切换视频清晰度item
        var MenuItem = videojs.getComponent('MenuItem');
        var ResolutionMenuItem = videojs.extend(MenuItem, {
            constructor: function (player, options, onClickListener, label) {
                this.onClickListener = onClickListener;
                this.label = label;
                //设置当前的player对象，option参数，以及初始化组件
                MenuItem.call(this, player, options);
                this.src = options.src;

                this.on('click', this.onClick);
                this.on('touchstart', this.onClick);
                //设置默认清晰度
                if (options.initialySelected) {
                    this.showAsLabel();
                    this.selected(true);

                    //videojs中的被选中样式
                    this.addClass('vjs-selected');
                }
            },
            showAsLabel: function () {
                //如果label中有文字显示，则显示对应的内容
                if (this.label) {
                    this.label.innerHTML = this.options_.label;
                }
            },
            onClick: function (customSourcePicker) {
                this.onClickListener(this);
                //记录当前播放时间
                var currentTime = this.player_.currentTime();
                var isPaused = this.player_.paused();
                this.showAsLabel();

                this.addClass('vjs-selected');
                if (!isPaused) {
                    this.player_.bigPlayButton.hide();
                }
                if (typeof customSourcePicker !== 'function' &&
                    typeof this.options_.customSourcePicker === 'function') {
                    customSourcePicker = this.options_.customSourcePicker;
                }

                //通过监听player的loadeddata事件来判断是否可以直接播放，
                //同时为了防止flash不支持timeupdate事件
                var handleSeekEvent = 'loadeddata';
                if (this.player_.preload() === 'none' && this.player_.techName_ !== 'Flash') {
                    handleSeekEvent = 'timeupdate';
                }
                //this.player_.src(this.src);
                //this.player_.currentTime(currentTime);
                //if(!isPaused){
                //    this.player_.play();
                //}
                //this.player_.trigger('resolutionchange');
                setSourcesSanitized(this.player_, this.src, this.options_.label, customSourcePicker).one(handleSeekEvent, function () {
                    var _player = this.player_;
                    _player.currentTime(currentTime);
                    _player.handleTechSeeked_();
                    if (!isPaused) {
                        _player.play().handleTechSeeked_();
                        _player.play();
                        _player.trigger('play');
                    }
                    //触发resolutinchange事件，方便在外部需要监听清晰度切换事件时使用
                    _player.trigger('resolutionchange');
                });
            }
        });

        //切换视频清晰度button
        var MenuButton = videojs.getComponent('MenuButton');
        var ResolutionMenuButton = videojs.extend(MenuButton, {
            constructor: function (player, options, settings, label) {
                this.sources = options.sources;
                this.label = label;
                this.label.innerHTML = options.initialySelectedLabel;
                MenuButton.call(this, player, options, settings);
                //按钮提示语
                this.controlText('清晰度');

                if (settings.dynamicLabel) {
                    this.el().appendChild(label);
                } else {
                    //绘制按钮
                    var staticLabel = document.createElement('span');
                    videojs.addClass(staticLabel, 'vjs-resolution-button-staticlabel');
                    this.el().appendChild(staticLabel);
                }
            },
            createItems: function () {
                var menuItems = [];
                var labels = (this.sources && this.sources.label) || {};
                var onClickUnselectOthers = function (clickedItem) {
                    menuItems.map(function (item) {
                        item.selected(item === clickedItem);
                        item.removeClass('vjs-selected');
                    });
                };
                for (var key in labels) {
                    if (labels.hasOwnProperty(key)) {
                        menuItems.push(new ResolutionMenuItem(
                            this.player_,
                            {
                                label: key,
                                src: labels[key],
                                initialySelected: key === this.options_.initialySelectedLabel,
                                customSourcePicker: this.options_.customSourcePicker
                            },
                            onClickUnselectOthers,
                            this.label));
                        menuItemsHolder[key] = menuItems[menuItems.length - 1];
                    }
                }
                return menuItems;
            }
        });

        videoJsResolutionSwitcher = function (options) {
            var settings = videojs.mergeOptions(defaults, options),
                player = this,
                label = document.createElement('span'),
                groupedSrc = {},
                menuButton;
            videojs.addClass(label, 'vjs-resolution-button-label');
            /**
             * 更新视频源
             * @param src
             * @returns {*}
             */
            player.updateSrc = function (src) {
                //如果更新的视频地址为空，则返回当前播放的视频地址
                if (!src) {
                    return player.src();
                }
                //在添加新的视频源之前，删除已有的菜单
                if (player.controlBar.resolutionSwitcher) {
                    player.controlBar.resolutionSwitcher.dispose();
                    delete player.controlBar.resolutionSwitcher;
                }
                //视频源排序
                src = src.sort(compareResolutions);
                groupedSrc = bucketSources(src);
                var choosen = chooseSrc(groupedSrc, src);

                menuButton = new ResolutionMenuButton(player, {
                    sources: groupedSrc,
                    initialySelectedLabel: choosen.label,
                    initialySelectedRes: choosen.res,
                    customSourcePicker: settings.customSourcePicker
                }, settings, label);
                videojs.addClass(menuButton.el(), 'vjs-resolution-button');
                //将创建的菜单按钮插入到videojs播放器的控制栏，为了配合向右浮动样式，将菜单按钮插入到全屏按钮之前
                player.controlBar.resolutionSwitcher = player.controlBar.el_.insertBefore(menuButton.el_, player.controlBar.getChild('volumeMenuButton').el_);
                player.controlBar.resolutionSwitcher.dispose = function () {
                    this.parentNode.removeChild(this);
                };
                return setSourcesSanitized(player, choosen.sources, choosen.label);
            };

            /**
             * 获得当前切换清晰度按钮得DOM对象
             * @returns {*}
             */
            player.getResolutionMenuButton = function () {
                return menuButton.el_;
            };

            /**
             * 返回当前清晰度对象，或者根据标签设置指定的清晰度
             * @param label
             * @param customSourcePicker
             * @returns {*}
             */
            player.currentResolution = function (label, customSourcePicker) {
                if (label == null) {
                    return currentResolution;
                }
                if (menuItemsHolder[label] != null) {
                    menuItemsHolder[label].onClick(customSourcePicker);
                }
                return player;
            };

            /**
             * 返回已经归组好的视频源集合
             * @returns {{}}
             */
            player.getGroupedSrc = function () {
                return groupedSrc;
            };

            //对资源列表进行排序
            function compareResolutions(a, b) {
                if (!a.res || !b.res) {
                    return 0;
                }
                return (+b.res) - (+a.res);
            }

            /**
             * 通过资源的标签、清晰度和类型将视频源归组
             * @param src {Array} 视频资源地址数组
             * @returns {Object} 返回的数据类型{label:{key:[]},res:{key:[]},type:{key:[]}}
             */
            function bucketSources(src) {
                var resolutions = {
                    label: {},
                    res: {},
                    type: {}
                };
                src.map(function (source) {
                    //初始化键值对
                    initResolutionKey(resolutions, 'label', source);
                    initResolutionKey(resolutions, 'res', source);
                    initResolutionKey(resolutions, 'type', source);

                    //添加键值对
                    appendSourceToKey(resolutions, 'label', source);
                    appendSourceToKey(resolutions, 'res', source);
                    appendSourceToKey(resolutions, 'type', source);
                });
                return resolutions;
            }

            /**
             * 初始化key为空的视频资源集合
             * @param resolutions
             * @param key
             * @param source
             */
            function initResolutionKey(resolutions, key, source) {
                if (resolutions[key][source[key]] == null) {
                    resolutions[key][source[key]] = [];
                }
            }

            /**
             * 添加视频资源对象的键值对
             * @param resolutions
             * @param key
             * @param source
             */
            function appendSourceToKey(resolutions, key, source) {
                resolutions[key][source[key]].push(source);
            }

            /**
             * 选择默认的设置的视频源
             * @param groupedSrc
             * @param src
             * @returns {{res: *, label: string, sources: *}}
             */
            function chooseSrc(groupedSrc, src) {
                var selectedRes = settings['default'];
                var selectedLabel = '';
                if (selectedRes === 'high') {
                    selectedRes = src[0].res;
                    selectedLabel = src[0].label;
                } else if (selectedRes === 'low' || selectedRes == null || !groupedSrc.res[selectedRes]) {
                    selectedRes = src[src.length - 1].res;
                    selectedLabel = src[src.length - 1].label;
                } else if (groupedSrc.res[selectedRes]) {
                    selectedLabel = groupedSrc.res[selectedRes][0].label;
                }
                return {
                    res: selectedRes,
                    label: selectedLabel,
                    sources: groupedSrc.res[selectedRes]
                };
            }


            player.ready(function () {
                if (player.options_.sources.length > 1) {
                    player.updateSrc(player.options_.sources);
                }
            });
        };

        //注册videojs插件
        videojs.plugin('videoJsResolutionSwitcher', videoJsResolutionSwitcher);

    })(window, videojs);

    /**
     * 锚点提示插件实现
     * @param jQuery 需要引入jQuery插件
     * @param videojs 需要传入videojs对象
     */
    (function (jQuery, videojs) {
        var $, Progress, evoClass, vjsProgress;
        $ = jQuery;
        evoClass = function (className, hasDot) {
            return "" + (hasDot ? "." : "") + "vjs-" + className;
        };

        Progress = (function () {
            function Progress(player) {
                this.player = player;
                this.timepoint = {
                    initialized: false,
                    delimiter: "-vjs-timepoint-",
                    data: []
                }
            }

            Progress.prototype.timepoints = function (data) {
                var container, createTimepoint, delimiter, duration, info, inst, player, timepoints, video;
                info = this.timepoint;
                if (info.initialized || !$.isArray(data)) {
                    return false;
                }
                inst = this;
                player = this.player;
                video = $(player.el());
                duration = player.duration();
                delimiter = info.delimiter;
                timepoints = info.data;
                container = $("<div />", {
                    "class": evoClass("progress-timepoints")
                });
                /**
                 * 创建时间点的DOM元素
                 * @param sec
                 * @param text
                 * @returns {*}
                 */
                createTimepoint = function (sec, text) {
                    var pt;
                    pt = $("<div />", {
                        "id": "" + (video.attr("id")) + delimiter + (timepoints.length + 1),
                        "class": evoClass("progress-timepoint")
                    });
                    timepoints.push({
                        sec: sec,
                        text: text
                    });
                    return pt.css("left", "" + ((sec / duration) * 100) + "%");
                };
                $.each(data, function (idx, pt) {
                    var _ref = Number(pt.time);
                    if (0 <= _ref && _ref <= duration) {
                        return container.append(createTimepoint(Math.round(pt.time), pt.text));
                    }
                });
                $(player.controlBar.progressControl.el()).find('div').get(0).appendChild(container.get(0));
                $(evoClass("progress-timepoint", true)).on("click", function () {
                    var _newTime = inst.timepointData(this.id).sec;
                    //当存在AllinmdPlayer时，进行最大播放时长检测
                    if (!!player.AllinmdPlayer) {
                        player.AllinmdPlayer.CheckMaxPlayTime(_newTime);
                    }//当不存在AllinmdPlayer时，默认为原有的拖拽模式
                    else {
                        this.player_.currentTime(_newTime);
                    }
                    return false;
                });
                info.initialized = true;
                return true;

            };

            Progress.prototype.timepointData = function (id) {
                return this.timepoint.data[id.split(this.timepoint.delimiter)[1] - 1];
            };

            Progress.prototype.tooltip = function () {
                var duration, formatTime, player, progress, tip, zerofill;
                player = this.player;
                progress = player.controlBar.progressControl;
                duration = player.duration();
                tip = $("<div />", {
                    "class": evoClass("progress-tooltip"),
                    "text": "0.00"
                });
                zerofill = function (num) {
                    if (num < 10) {
                        num = "0" + num;
                    }
                    return num;
                };
                formatTime = function (time) {
                    var base = 60;
                    time = Math.round(time);
                    if (time < base) {
                        time = "00:" + (zerofill(time));
                    }
                    else {
                        time = "" + (zerofill(Math.floor(time / base))) + ":" + (zerofill(time % base));
                    }
                    return time;
                };
                progress.el().appendChild(tip.get(0));
                $(progress.el()).on({
                    "mousemove touchstart": (function (_this) {
                        return function (evt) {
                            var bar, offsetLeft, target, tipText, cssLeft;
                            bar = $(progress.el());
                            var clientX = evt.clientX
                            if(evt.type=="touchstart"){
                                clientX = evt.originalEvent.changedTouches[0].clientX;
                            }
                            offsetLeft = clientX - bar.offset().left;
                            target = evt.target;
                            tipText = formatTime(offsetLeft / bar.width() * duration);
                            if ($(target).is(evoClass("progress-timepoint", true))) {
                                tipText += "<span>" + (_this.timepointData(target.id).text) + "</span>";
                                //设置箭头位置
                                var _arrowHtml = '<div class="vjs-progress-timepoint-arrow"></div>';
                                $(target).html(_arrowHtml);
                                tip.show();
                            } else {
                                $('.vjs-progress-timepoint-arrow').remove();
                                tip.hide();
                            }
                            tip.html(tipText);
                            //提示的边界限定
                            cssLeft = offsetLeft - tip.outerWidth() / 2;
                            //如果超出了左边界
                            if(cssLeft < 0){
                                cssLeft = 0;
                            }
                            var needCssRight = false;
                            if(offsetLeft + tip.outerWidth() > bar.outerWidth() ){
                                // cssLeft = bar.outerWidth() - tip.outerWidth();
                                needCssRight = true;
                            }
                            
                            //如果是需要使用 right ，则不启用 left
                            if(needCssRight){
                                tip.css('left','');
                                return tip.css("right", 0);
                            }else{
                                tip.css('right','');
                                return tip.css("left", cssLeft);
                            }

                        }
                    })(this),
                    "mouseleave touchend": function () {
                        //隐藏掉由锚点出来的箭头
                        $('.vjs-progress-timepoint-arrow').remove();
                        return tip.hide();
                    }
                });
            };
            return Progress;
        })();

        vjsProgress = function (options) {
            var progress = new Progress(this);
            this.on("loadedmetadata", function () {
                progress.timepoints(options != null ? options : void 0);
                return progress.tooltip();
            });
        };

        //注册关键点提示插件
        videojs.plugin("progress", vjsProgress);
    }).call(window, jQuery, videojs);

    /**
     * 弹窗插件实现
     * @param jQuery
     * @param videojs
     */
    (function (jQuery, videojs) {
        var AllinmdModalDialog, $, modalDialog;
        $ = jQuery;
        AllinmdModalDialog = (function () {
            function AllinmdModalDialog(player) {
                this.player = player;
                createModalDialog(player.el_);
            }

            /**
             * 创建弹窗容器
             * @param parentDom 弹窗父容器，一般为videojs的dom元素
             */
            function createModalDialog(parentDom) {
                modalDialog = $('<div />', {
                    "class": "allinmd-modal-dialog"
                });
                $(parentDom).append(modalDialog);
                modalDialog.hide();
            }

            /**
             * 更新需要显示的DOM元素
             * @param domObj
             */
            AllinmdModalDialog.prototype.updateDomObj = function (domObj) {
                //清空当前已有的元素
                this.getElementModalDialog().empty();

                this.getElementModalDialog().append(domObj);

            };

            /**
             * 设置弹窗元素是否显示
             * @param bool
             */
            AllinmdModalDialog.prototype.showModalDialog = function (bool) {
                if (bool) {
                    this.getElementModalDialog().show();
                } else {
                    this.getElementModalDialog().hide();
                }

            };

            /**
             * 获取弹窗元素
             * @returns {*}
             */
            AllinmdModalDialog.prototype.getElementModalDialog = function () {
                return $(this.player.el_).find(".allinmd-modal-dialog");
            };
            return AllinmdModalDialog;
        })();

        var allinmdModalDialog = function () {
            return new AllinmdModalDialog(this);
        };
        //注册弹窗插件
        videojs.plugin("allinmdModalDialog", allinmdModalDialog);
    })(jQuery, videojs);

    /**
     * 热键监听插件，用于监听在使用播放器过程中部分按键的事件
     * @param videojs
     */
    (function (videojs) {
        var keyName = {
            space: 32,
            leftArrow: 37,
            rightArrow: 39,
            upArrow: 38,
            downArrow: 40
        };

        var AllinmdHotKeys = (function () {
            function AllinmdHotKeys(allinmdPlayer, options) {
                this.options = options;
                this.player = allinmdPlayer.player;
                this._keyDownHandle = keyDownHandle.bind(this);
                //监听键盘事件
                this.player.on('keydown', this._keyDownHandle);
                //监听flash发送的键盘事件（在flash自定义'flashkeydown'事件，为了统一显示，将事件处理在js中实现，flash中只是发送触发事件）
                if(this.player.tech_){
                    this.player.tech_.on('flashkeydown', this._keyDownHandle);
                }
                this._hasEventListener = true;
            }

            function keyDownHandle(evt) {
                var player = this.player,
                    options = this.options,
                    ePreventDefault = evt.preventDefault,
                    curTime;
                //当触发的是flashkeydown事件时，使用flash传过来的按键值作为判断依据，即arguments[1][0]
                var ewhich = evt.which || arguments[1][0];
                switch (ewhich) {
                    //空格键
                    case keyName.space:
                        if (player.paused()) {
                            player.play();
                        } else {
                            player.pause();
                        }
                        ePreventDefault();
                        break;
                    //方向键左，快退
                    case keyName.leftArrow:
                        var wasPlaying = !player.paused();
                        ePreventDefault();
                        if (wasPlaying) {
                            player.pause();
                        }
                        curTime = player.currentTime() - options.timeValue;
                        if (player.currentTime() <= options.timeValue) {
                            curTime = 0;
                        }
                        player.currentTime(curTime);
                        if (wasPlaying) {
                            player.play();
                            //在ie8下，需要主动触发用户活动状态为true,否则进度条会闪现
                            player.userActive(true);
                        }
                        break;
                    //方向键右，快进
                    case keyName.rightArrow:
                        var wasPlaying = !player.paused();
                        ePreventDefault();
                        if (wasPlaying) {
                            player.pause();
                        }
                        curTime = player.currentTime() + options.timeValue;
                        player.currentTime(curTime);
                        if (wasPlaying) {
                            player.play();
                            //在ie8下，需要主动触发用户活动状态为true,否则进度条会闪现
                            player.userActive(true);
                        }
                        break;
                    //方向键上，音量增大
                    case keyName.upArrow:
                        ePreventDefault();
                        player.volume(player.volume() + options.volumeValue);
                        //在ie8下，需要主动触发用户活动状态为true,否则音量条不会出现
                        player.userActive(true);
                        break;
                    //方向键下，音量减小
                    case keyName.downArrow:
                        ePreventDefault();
                        player.volume(player.volume() - options.volumeValue);
                        //在ie8下，需要主动触发用户活动状态为true,否则音量条不会出现
                        player.userActive(true);
                        break;
                    default :
                        break;
                }
            }

            /**
             * 返回当前热键插件是否已经添加监听事件
             * @returns {Function}
             */
            AllinmdHotKeys.prototype.hasEventListener = function () {
                return this._hasEventListener;
            }
            /**
             * 添加键盘监听事件
             */
            AllinmdHotKeys.prototype.addEventListener = function () {
                this.player.on('keydown', this._keyDownHandle);
                if(this.player.tech_){
                    this.player.tech_.on('flashkeydown', this._keyDownHandle);
                }
                this._hasEventListener = true;
            }
            /**
             * 移除键盘添加事件
             */
            AllinmdHotKeys.prototype.removeEventListener = function () {
                this.player.off('keydown', this._keyDownHandle);
                if(this.player.tech_){
                    this.player.tech_.off('flashkeydown', this._keyDownHandle);
                }
                this._hasEventListener = false;
            }
            return AllinmdHotKeys;
        })();
        var allinmdHotKeys = function (allinmdPlayer, options) {
            if (allinmdPlayer.getHotKeys() != null) {
                return allinmdPlayer.getHotKeys();
            }
            return new AllinmdHotKeys(allinmdPlayer, options);
        }
        videojs.plugin('allinmdHotKeys', allinmdHotKeys);
    })(videojs);


    /**
     * 倍速切换插件实现
     * @param window
     * @param videojs
     */
    (function (window, videojs) {
        var defaults = {menuLabel: '倍速'},
            menuItemsHolder = [],
            videoJsSpeedSwitcher,
            moveoutMenuBtnTimeoutIndex;

        //切换视频倍速 item
        var MenuItem = videojs.getComponent('MenuItem');
        var SpeedMenuItem = videojs.extend(MenuItem, {
            constructor: function (player, options, onClickListener, label) {
                this.onClickListener = onClickListener;
                this.label = label;
                //设置当前的player对象，option参数，以及初始化组件
                MenuItem.call(this, player, options);
                this.on('click', this.onClick);
                this.on('touchstart', this.onClick);
                this.on('mousemove',this.onMousemove);
            },
            showAsLabel: function () {
                //如果label中有文字显示，则显示对应的内容
                if (this.label) {
                    this.label.innerHTML = this.options_.label;
                    //当倍速为1.0X时，显示倍速
                    if(this.options_.label == '1.0X'){
                        this.label.innerHTML = '倍速';
                    }
                }

            },
            onClick: function () {
                this.onClickListener(this);
                //videojs中的被选中样式
                this.addClass('vjs-selected');
                this.showAsLabel();
                this.player_.playbackRate(this.options_.rate);
                //触发 speedchange 事件，方便在外部需要监听倍速切换事件时使用
                this.player_.trigger('speedchange');
            },
            onMousemove:function(){
                if(moveoutMenuBtnTimeoutIndex){
                    clearTimeout(moveoutMenuBtnTimeoutIndex);
                    moveoutMenuBtnTimeoutIndex = null;
                }
            }
        });

        //切换视频倍速button
        var MenuButton = videojs.getComponent('MenuButton');
        var SpeedMenuButton = videojs.extend(MenuButton, {
            constructor: function (player, options, settings, label) {
                this.menuItems = options.menuItems;
                this.label = label;
                this.label.innerHTML = options.initialySelectedLabel;
                MenuButton.call(this, player, options, settings);
                //按钮提示语
                this.controlText('倍速');
                this.el().appendChild(label);
                this.on('mouseout',this.onMoveout);
                this.on('click',this.onClick);
            },
            createItems: function () {
                var menuItemsList = [], menuItem;
                var menuItems = this.menuItems || {};
                var onClickUnselectOthers = function (clickedItem) {
                    menuItemsList.map(function (item) {
                        item.selected(item === clickedItem);
                        item.removeClass('vjs-selected');
                    });
                };
                for (var i = 0; i < menuItems.length; i++) {
                    menuItem = new SpeedMenuItem(this.player_, {
                            label: menuItems[i].label,
                            rate: menuItems[i].rate
                        }, onClickUnselectOthers,
                        this.label);
                    menuItem.labelName = menuItems[i].label;
                    menuItemsList.push(menuItem);
                    menuItemsHolder.push(menuItem);
                }
                return menuItemsList;
            },
            onClick:function(){
                this.addClass('vjs-lock-showing');
            },
            onMoveout:function(){
                if(!moveoutMenuBtnTimeoutIndex){
                    var _this = this;
                    moveoutMenuBtnTimeoutIndex = setTimeout(function(){
                        $('.vjs-workinghover .vjs-resolution-button .vjs-menu.vjs-lock-showing ').removeClass('vjs-lock-showing');
                        moveoutMenuBtnTimeoutIndex = null;
                        _this.buttonPressed_ = false;
                    },500)
                }
            }
        });

        videoJsSpeedSwitcher = function (options) {
            var settings = videojs.mergeOptions(defaults, options),
                player = this,
                label,
                menuButton;

            function createSpeedSwitcher(speedLabel) {
                label = document.createElement('span');
                videojs.addClass(label, 'vjs-resolution-button-label');
                if (settings.menuItems && settings.menuItems.length > 1) {
                    //在更新指定倍速时，先删除原有的倍速菜单
                    if (player.controlBar.speedSwitcher) {
                        player.controlBar.speedSwitcher.dispose();
                        delete  player.controlBar.speedSwitcher;
                    }
                    menuButton = new SpeedMenuButton(player, {
                        menuItems: settings.menuItems,
                        initialySelectedLabel: speedLabel
                    }, settings, label);
                    videojs.addClass(menuButton.el(), 'vjs-resolution-button');
                    //将创建的菜单按钮插入到videojs播放器的控制栏，为了配合向右浮动样式，将菜单按钮插入到全屏按钮之前
                    player.controlBar.speedSwitcher = player.controlBar.el_.insertBefore(menuButton.el_, player.controlBar.getChild('volumeMenuButton').el_);
                    player.controlBar.speedSwitcher.dispose = function () {
                        this.parentNode.removeChild(this);
                    }
                    //设置当前倍速被选中状态
                    var selected = false, selectIndex;
                    for (var i = 0; i < menuItemsHolder.length; i++) {
                        if (menuItemsHolder[i].labelName == speedLabel) {
                            selected = true;
                            selectIndex = i;
                            break;
                        }
                    }
                    if (selected) {
                        menuItemsHolder[selectIndex].onClick();
                    }
                }
            }

            //初始化
            player.ready(function () {
                createSpeedSwitcher(settings.menuLabel);
            });
            //复位播放倍速
            player.resetSpeed = function () {
                createSpeedSwitcher(settings.menuLabel);
                player.playbackRate(1);
            }
            //更新播放倍速
            player.updateSpeedByLabel = function (speedLabel) {
                //校验传入倍速label是否存在
                var _exist = false;
                for (var i = 0; i < settings.menuItems.length; i++) {
                    if (settings.menuItems[i].label == speedLabel) {
                        _exist = true;
                        break;
                    }
                }
                if (_exist) {
                    createSpeedSwitcher(speedLabel);
                } else {
                    throw 'setting exception, call function by updateSpeedByLabel ';
                }
            }
        };

        //注册videojs插件
        videojs.plugin('videoJsSpeedSwitcher', videoJsSpeedSwitcher);
    })(window, videojs);

    /**
     * 将每个AllinmdPlayer对象绑定到其内部的videojs对象中
     * 用作内部自定义状态的判断
     * @param videojs
     */
    (function (videojs) {
        function setAllinmdPlayer(allinmdPlayer) {
            var player = this;
            player.AllinmdPlayer = allinmdPlayer;
        }

        //注册AllinmdPlayer对象
        videojs.plugin("SetAllinmdPlayer", setAllinmdPlayer);
    })(videojs);


    /**
     * allinmdplayer 播放器
     */
    (function (window, jQuery) {
        var AllinmdPlayer, $;
        $ = jQuery;
        AllinmdPlayer = (function () {
            //播放器初始化
            function AllinmdPlayer(id, options, callback) {
                this._videojs = videojs;
                this._canPlay = true;
                this._canDragProgressBar = true;
                this._modalDialog = null;
                this._maxPlayTime = 0;
                this._allowSendMaxPlayTimeEvent = true;
                this._isH5 = false;
                //初始化播放器
                init.call(this, id, options, callback);
            }

            /**
             * AllinmdPlayer播放器初始化
             * @param id
             * @param options
             * @param callback
             */
            function init(id, options, callback) {
                if (id === 'undefined' || !id) return;
                var myOptions = formatOptions(options);
                var myPlayer = this._videojs(id, myOptions, callback);
                this.player = myPlayer;
                this._modalDialog = myPlayer.allinmdModalDialog();
                //绑定AllinmdPlayer对象至videojs对象
                myPlayer.SetAllinmdPlayer(this);
                setMaxPlayTime.call(this, myOptions);
                setLimitTime.call(this, myOptions.limitPlayTime);
                //如果是H5页面，则需要加入特定的方法
                if (myOptions.isH5) {
                    this._isH5 = myOptions.isH5;
                    // 如果是H5，则需要重置一些样式
                    resetCSSForH5.call(this);
                    //添加转屏监听事件，仅在微信、腾讯X5内核中生效
                    //addEventForX5.call(this);
                }
                //如果不是H5页面，则添加PC使用的特定方法
                if (!myOptions.isH5) {
                    this._hotKeys = myPlayer.allinmdHotKeys(this, myOptions.hotKeysOption);
                }
                //添加初始化事件
                initEvents.call(this, myOptions);
            }

            function initEvents(options) {
                //如果需要暂停显示大播放按钮，则添加相关事件
                if (options.needPausedShowBigPlayBtn) {
                    this.player.on("pause", function () {
                        var el = this.el_;
                        $(el).find('.vjs-big-play-button').show();
                    });

                    this.player.on("play", function () {
                        var el = this.el_;
                        $(el).find('.vjs-big-play-button').hide();
                    });
                }
                //如果目标浏览器是ie8，则进行active/inactive事件侦听，并对控制栏做出对应操作
                if (!options.isH5 && isIE8()) {
                    //当用户没有操作时
                    this.player.on('userinactive', function () {
                        this.controlBar.addClass('vjs-hidden-controlBar-ie8');
                    });
                    //当用户有操作时
                    this.player.on('useractive', function () {
                        this.controlBar.removeClass('vjs-hidden-controlBar-ie8');
                    });
                }

            }

            /**
             * 判断浏览器是否为IE8
             * @returns {boolean}
             */
            function isIE8() {
                var browser = navigator.appName;
                var b_version = navigator.appVersion;
                var version = b_version.split(";");
                var trim_Version = (version[1] != undefined && version[1] != "") ? version[1].replace(/[ ]/g, "") : "";
                if (browser === "Microsoft Internet Explorer" && trim_Version == "MSIE8.0") {
                    return true;
                } else {
                    return false;
                }
            }

            /**
             * 合并播放器参数
             * @param options 输入设置的播放器参数
             * @returns {{}} 返回合并后的参数
             */
            function formatOptions(options) {
                var _options;
                _options = {
                    controls: true,
                    //为了保证flash模式下正常播放，建议设置为'auto'
                    preload: 'auto',
                    //为了减少产生DOM元素，屏蔽一部分控制栏不需要的元素
                    controlBar: {
                        captionsButton: false,
                        audioTrackButton: false,
                        chaptersButton: false,
                        descriptionsButton: false,
                        customControlSpacer: false,
                        liveDisplay: false,
                        playbackRateMenuButton: false,
                        remainingTimeDisplay: false,
                        subtitlesButton: false
                    },
                    //设置是否开启权限判断，以及时间值，当allow为false时，value值无效
                    limitPlayTime: {
                        allow: false,
                        value: 2
                    },
                    setMaxPlayTime: {
                        allow: false,
                        value: 0
                    },
                    languages: getLanguage(),
                    language: "zh-CN",
                    isH5: false,
                    needPausedShowBigPlayBtn: true,
                    hotKeysOption: {
                        timeValue: 10,
                        volumeValue: 0.1
                    }
                };
                //合并自定义的控制栏设置
                $.extend(_options, options);
                return _options;
            }

            /**
             * 获得可以使用的语言对象
             * @returns {{}} 返回语言对象
             */
            function getLanguage() {
                var result;
                result = {
                    "zh-CN": {
                        "Play Video": "播放",
                        "Play": "播放",
                        "Pause": "暂停",
                        "Current Time": "当前时间",
                        "Duration Time": "时长",
                        "Remaining Time": "剩余时间",
                        "Stream Type": "媒体流类型",
                        "LIVE": "直播",
                        "Loaded": "加载完毕",
                        "Progress": "进度",
                        "Fullscreen": "全屏",
                        "Non-Fullscreen": "退出全屏",
                        "Mute": "静音",
                        "Unmute": "取消静音",
                        "Playback Rate": "播放码率",
                        "Subtitles": "字幕",
                        "subtitles off": "字幕关闭",
                        "Captions": "内嵌字幕",
                        "captions off": "内嵌字幕关闭",
                        "Chapters": "节目段落",
                        "You aborted the media playback": "视频播放被终止",
                        "A network error caused the media download to fail part-way.": "网络错误导致视频下载中途失败。",
                        "The media could not be loaded, either because the server or network failed or because the format is not supported.": "视频因格式不支持或者服务器或网络的问题无法加载。",
                        "The media playback was aborted due to a corruption problem or because the media used features your browser did not support.": "由于视频文件损坏或是该视频使用了你的浏览器不支持的功能，播放终止。",
                        "No compatible source was found for this media.": "无法找到此视频兼容的源。",
                        "The media is encrypted and we do not have the keys to decrypt it.": "视频已加密，无法解密。"
                    }
                };
                return result;
            }


            /**
             * 设置权限功能
             * 需通过call方法指定当前AllinmdPlayer对象
             * 当播放至设置时间时，暂停播放，并触发限制事件
             * @param controlTime
             */
            function setLimitTime(controlTime) {
                if (controlTime.allow) {
                    var _allinmdPlayer = this;
                    var _player, _currentTime;
                    _player = this.player;

                    var limitTimeEvent = function () {
                        _currentTime = _player.currentTime();
                        if (_currentTime >= controlTime.value) {
                            _player.pause();
                            _allinmdPlayer.setCanPlay(false);
                            _allinmdPlayer.player.off('timeupdate', limitTimeEvent);
                            //触发播放器的自定义限制事件
                            _player.trigger(_allinmdPlayer.EVENT_TYPE.LIMIT_EVENT);
                        }
                    };
                    _allinmdPlayer.player.on('timeupdate', limitTimeEvent);
                }
            }


            /**
             * 设置最大可拖拽时长，
             * 需通过call方法指定当前AllinmdPlayer对象
             * @param options
             */
            function setMaxPlayTime(options) {
                if (options.setMaxPlayTime.allow) {
                    this._maxPlayTime = options.setMaxPlayTime.value;
                } else {
                    var _this = this;
                    if (_this.player.duration() == 0) {
                        _this.player.one('loadeddata', function () {
                            _this._maxPlayTime = options.limitPlayTime.allow ? options.limitPlayTime.value : this.duration();
                        });
                    } else {
                        _this._maxPlayTime = options.limitPlayTime.allow ? options.limitPlayTime.value : _this.player.duration();
                    }

                }
            }

            /**
             * 格式化时间，将带有小数的时间去掉小数点后面的数字，但并不进行四舍五入
             * @param time
             * @returns {number}
             */
            function formatTime(time) {
                return Math.floor(time);
            }


            /**
             * AllinmdPlayer播放器弹窗层
             * @param show (boolean) 是否显示
             * @param domObj DOM元素
             * @constructor
             */
            AllinmdPlayer.prototype.ModalDialog = function (show, domObj) {
                this._modalDialog.showModalDialog(show);
                this._modalDialog.updateDomObj(domObj);
            };

            /**
             * 获取弹窗层对象，方便自定义相关动画效果
             * @returns {*} 返回的是被Jquery封装的对象
             * @constructor
             */
            AllinmdPlayer.prototype.ModalDialogObj = function () {
                return this._modalDialog.getElementModalDialog();
            };

            /**
             * 检查可播放的最大播放时长
             * @param newTime 需要检查的最新播放时长
             * @constructor
             */
            AllinmdPlayer.prototype.CheckMaxPlayTime = function (newTime) {
                var _player = this.player;
                var _allinmdPlayer = this;
                var _newTime = newTime,
                    _currentTime = _player.currentTime(),
                    _canDragProgress = _allinmdPlayer.getCanDragProgressBar();
                //如果当前状态允许拖拽，才可以进行拖拽播放
                if (_canDragProgress) {
                    var _maxPlayTime = _allinmdPlayer.getMaxPlayTime();
                    _maxPlayTime = _maxPlayTime > _currentTime ? _maxPlayTime : _currentTime;
                    if (_newTime > _maxPlayTime) {
                        //判断是否当前可以发送事件，为了防止在mouseover事件下重复发送事件
                        if (_allinmdPlayer.getAllowSendMaxPlayTimeEventState()) {
                            //发送事件，"目标拖拽播放时长已超出允许的最大播放时长"
                            _player.trigger(_player.AllinmdPlayer.EVENT_TYPE.MAX_PLAY_TIME_EVENT);
                        }
                    }
                    else {
                        _player.currentTime(_newTime);
                    }
                    //更新最大允许播放时长，为了方便拖拽已播放的进度
                    _allinmdPlayer.setMaxPlayTime(_maxPlayTime);
                }
            };


            /**
             * 隐藏/显示播放器中的控制栏
             * @param bool true时为取消隐藏，false时为隐藏
             * @constructor
             */
            AllinmdPlayer.prototype.SetControlBarShow = function (bool) {
                var _controlBar = $(this.player.controlBar.el_);
                var _hideClass = 'allinmd-controlbar-hide';
                if (bool) {
                    if (_controlBar.hasClass(_hideClass)) {
                        _controlBar.removeClass(_hideClass);
                    }
                } else {
                    if (!_controlBar.hasClass(_hideClass)) {
                        _controlBar.addClass(_hideClass);
                    }
                }
            };

            /**
             * 设置播放器至指定时间
             * @param currentTime 目标时间，单位为秒
             */
            AllinmdPlayer.prototype.currentTime = function (currentTime) {
                var _player = this.player;
                if (_player.duration() != 0) {
                    _player.currentTime(currentTime);
                } else {
                    _player.one('loadedmetadata', function () {
                        _player.currentTime(currentTime);
                    });
                }
            };

            /**
             * 隐藏播放器中的video标签
             * @constructor
             */
            AllinmdPlayer.prototype.HideVideoElement = function () {
                if(this.player.tech_){
                    this.player.tech_.hide();
                }
            };
            /**
             * 设置权限时间
             * @param limitTime
             * @constructor
             */
            AllinmdPlayer.prototype.SetLimitTime = function (limitTime) {
                var _obj = {
                    allow: true,
                    value: limitTime
                };
                setLimitTime.call(this, _obj);
            };
            /**
             * 获取当前播放时间
             * @returns {number}
             */
            AllinmdPlayer.prototype.getCurrentTime = function () {
                return formatTime(this.player.currentTime());
            };

            /**
             * 获取播放总时长
             * @returns {number}
             */
            AllinmdPlayer.prototype.getDurationTime = function () {
                return formatTime(this.player.duration());
            };

            /**
             * 设置/获取当前播放权限
             * @param value
             */
            AllinmdPlayer.prototype.setCanPlay = function (value) {
                this._canPlay = value;
                //如果不可以播放，则一定不可以拖拽
                if (!value) {
                    this._canDragProgressBar = false;
                }
            };
            /**
             * 获取当前播放权限
             * @returns {boolean|*}
             */
            AllinmdPlayer.prototype.getCanPlay = function () {
                return this._canPlay;
            };

            /**
             * 设置/获取当前播放器拖拽权限
             * @param value
             */
            AllinmdPlayer.prototype.setCanDragProgressBar = function (value) {
                this._canDragProgressBar = value;
            };
            AllinmdPlayer.prototype.getCanDragProgressBar = function () {
                return this._canDragProgressBar;
            };

            /**
             * 设置/获取最大允许播放时长
             * @returns {number|*}
             */
            AllinmdPlayer.prototype.getMaxPlayTime = function () {
                return this._maxPlayTime;
            };
            AllinmdPlayer.prototype.setMaxPlayTime = function (value) {
                this._maxPlayTime = value;
            };

            /**
             * 设置/获取检查是否播放至最大允许播放时长的状态，
             * 和CheckMaxPlayTime()方法配合使用，
             * 以防在mousemove的时候多次发送MAX_PLAY_TIME_EVENT事件
             * @param value
             */
            AllinmdPlayer.prototype.setAllowSendMaxPlayTimeEventState = function (value) {
                this._allowSendMaxPlayTimeEvent = value;
            };
            AllinmdPlayer.prototype.getAllowSendMaxPlayTimeEventState = function () {
                return this._allowSendMaxPlayTimeEvent;
            };

            /**
             * 获取当前AllinmdPlayer对象的热键监听插件
             * @returns {*}
             */
            AllinmdPlayer.prototype.getHotKeys = function () {
                return this._hotKeys;
            }

            /**
             * 移除当前热键插件的事件监听
             */
            AllinmdPlayer.prototype.turnOffAllinmdHotKeys = function () {
                this._hotKeys.removeEventListener();
            }
            /**
             * 添加当前热键插件的事件监听
             */
            AllinmdPlayer.prototype.turnOnAllinmdHotKeys = function () {
                this._hotKeys.addEventListener();
            }

            /**
             * 返回当前热键插件是否已经添加监听事件
             * @returns {Function}
             */
            AllinmdPlayer.prototype.hasTurnOnHotKeys = function () {
                return this._hotKeys.hasEventListener();
            }

            /******************************** H5页面中单独使用的方法 start *************************************/

            /**
             * 此方法是将'timeupdate'的事件直接添加到video标签上
             * 只是用作限制用户在H5全屏模式下无法正常播放的解决方案
             * @param limitTime
             * @constructor
             */
            AllinmdPlayer.prototype.TurnOnPlayToPause = function (limitTime) {
                if(this.player.tech_ && this.player.tech_.el_){
                    var _video = this.player.tech_.el_;
                    _video.addEventListener('timeupdate', function () {
                        if (_video.currentTime >= limitTime) {
                            _video.currentTime = limitTime;
                            _video.pause();
                        }
                    });
                }
            };

            /**
             * 在H5页面时，重置相应的CSS样式布局
             */
            function resetCSSForH5() {
                //将时间放置右边，为时间元素包一层级，并将该层级右浮动
                var _allinmdPlayer = this;
                var _beforeElement = $(_allinmdPlayer.player.controlBar.playToggle.el_);
                var _timeElement = $('<div />', {
                    "class": "allinmd-time-elements",
                    "style": "float:right;margin-right: 0.5rem;"
                });
                _beforeElement.after(_timeElement);
                _timeElement.append(_allinmdPlayer.player.controlBar.currentTimeDisplay.el_);
                _timeElement.append(_allinmdPlayer.player.controlBar.timeDivider.el_);
                _timeElement.append(_allinmdPlayer.player.controlBar.durationDisplay.el_);
            }


            /**
             * 可实现同层播放器效果，
             * 并为其加入转屏事件，
             * 实现全屏样式切换
             */
            function addEventForX5() {
                //当满足同层播放器技术时，添加配套的转屏监听事件
                if (checkBrowserIsX5()) {
                    var _player = $(this.player.el_);
                    var _oldPlayerWidth = _player.width() + "px";
                    var _oldPlayerHeight = _player.height() + "px";
                    window.addEventListener('resize', function () {
                        var isLandscape = window.innerHeight < window.innerWidth;
                        var _newPlayerWidth = window.innerHeight + "px";
                        var _newPlayerHeight = window.innerWidth + "px";
                        if (isLandscape) {
                            //横屏样式
                            _player.css({"width": _newPlayerHeight, "height": _newPlayerWidth});
                        } else {
                            //竖屏样式
                            _player.css({"width": _oldPlayerWidth, "height": _oldPlayerHeight});
                        }
                    });
                }
            }

            /**
             * 仅在Android中，
             * 当浏览器为X5且其内核版本号满足以下条件时，
             *      微信中 TBS>=036849
             *      手Q中  TBS>=036855
             *      Android QQ浏览器版本 >7.1
             * 表明可以使用同层播放器技术
             */
            function checkBrowserIsX5() {
                var ua = navigator.userAgent.toLocaleLowerCase();
                //必须满足是android中
                if (ua && ua.indexOf('android') > -1) {
                    //微信中
                    if (ua.indexOf('micromessenger') != -1) {
                        if (ua.indexOf('tbs') != -1) {
                            if (getValueInString('tbs', ua) >= 36849) {
                                return true;
                            }
                        }
                    }//手Q中
                    else if (ua.indexOf('tbs') != -1) {
                        if (getValueInString('tbs', ua) >= 36855) {
                            return true;
                        }
                    }//Android QQ浏览器中
                    else if (ua.indexOf('mqqbrowser') != -1) {
                        if (getValueInString('mqqbrowser', ua) > 7.1) {
                            return true;
                        }
                    }
                }

                /**
                 * 根据切割字符串，获取对应的值
                 * @param sliceStr 需要获取数值的切割字符串
                 * @param targetStr 原有字符串
                 * @returns {number}
                 */
                function getValueInString(sliceStr, targetStr) {
                    var _sliceIndex = targetStr.indexOf(sliceStr);
                    var _str = targetStr.slice(_sliceIndex);
                    _str = _str.split(' ')[0];
                    _str = _str.split('/')[1];
                    return parseFloat(_str);
                }

                return false;
            }

            /******************************** H5页面中单独使用的方法 end *************************************/
            /**
             * 获取videojs实例化后的对象
             * @returns {AllinmdPlayer.player|*}
             */
            AllinmdPlayer.prototype.getPlayer = function () {
                return this._isH5 ? this.player.tech_.el_ : this.player;
            };

            /**
             * 自定义事件名称
             * @type {{LIMIT_EVENT: string}}
             */
            AllinmdPlayer.prototype.EVENT_TYPE = {
                //自定义事件-已播放至设置的限制时长
                LIMIT_EVENT: 'limit_pause_event',
                //自定义事件-超过当前允许拖拽的播放时长
                MAX_PLAY_TIME_EVENT: 'max_play_time_event',
                //自定义事件-倍速切换事件
                SPEED_CHANGE_EVENT: 'speedchange',
                //自定义事件-清晰度切换事件
                RESOLUTION_CHANGE_EVENT: 'resolutionchange'
            };
            return AllinmdPlayer;
        })();

        window.AllinmdPlayer = AllinmdPlayer;
    })(window, jQuery);

})
();

