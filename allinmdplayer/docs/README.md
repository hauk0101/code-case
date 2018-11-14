### AllinmdPlayer 播放器插件文档
###### 作者：姚乔 <br/> 创建时间：2017/04/20
###### 更新：添加 H5 页面使用说明 --姚乔--2017/04/27
###### 更新：添加 AllinmdHotKeys 插件，实现 PC 端键盘方向键和空格键的响应处理 --姚乔--2017/06/07
###### 更新：添加 videoJsSpeedSwitcher 插件，实现播放器倍速切换 --姚乔--2018/06/20
###### 更新：添加 videojs-contrib-hls 插件，实现播放器切片播放 --姚乔--2018/06/21

## 目录

* [简介](#简介)
* [主要功能](#主要功能)
* [使用方法](#使用方法)
	* [注意事项](#注意事项)
	* [引入文件](#引入文件)
	* [HTML编码](#HTML编码)
	* [JS调用](#JS调用)
	* [插件使用](#插件使用)
		* [倍速切换插件](#倍速切换插件)
		* [清晰度切换插件](#清晰度切换插件)
		* [锚点提示插件](#锚点提示插件)
		* [hls协议的m3u8切片播放插件](#切片播放插件)
	* [配置说明](#配置说明)
		*  [选项](#选项)
		*  [常用方法](#常用方法)
		*  [属性值](#属性值)
		*  [事件](#事件)
* [建议](#建议)
    * [PC项目](#PC项目)
    * [H5项目](#H5项目)
    * [关于源码](#关于源码)

<h2 id="简介">简介</h2>
videojs.allinmd.js是一个基于videojs的播放器插件，它能够满足播放器的常用功能，并实现了一些定制化功能，同时保证了PC场景下支持IE8+。

<h2 id="主要功能">主要功能</h2>
* 基本的播放、暂停、进度条拖拽快进、全屏、静音
* 获取当前播放时长、播放总时长
* 获取当前播放状态
* 获取当前全屏状态
* 监听全屏变化事件
* 主动进入/退出全屏（需要使用用户响应事件，如鼠标事件、键盘事件，且不可程序模拟）
* 设置可播放时长权限判断，可监听相关自定义事件
* 设置自定义弹窗层
* 设置关键进度点显示
* 设置视频清晰度切换
* 设置进度条禁止拖拽，可监听相关自定义事件
* 设置播放前海报

<h2 id="使用方法">使用方法</h2>

<h4 id="注意事项">注意事项</h4>

* 需要保证font文件在项目文件中
* 确保PC项目中html文件中<head>标签下添加，<strong>务必加载'\<meta charset="UTF-8"\>'之后</strong>

		<!--需要在使用AllinmdPlayer的页面加入此标签，防止IE8自动进入兼容模式，很多JS方法会不被支持-->
		<meta http-equiv="X-UA-Compatible" content="IE=edge">

* 确保html中已引入相关的jQuery.js文件
* 确保PC项目中兼容IE8时，<strong>需要将引入"ie8/videojs-ie8.min.js"脚本放在引入"js/common/comm.func.js"或其相关压缩文件之前</strong>，否则会导致两者在对IE8相关的JS方法扩充时发生冲突
* 确保整个项目不会出现类似以下的代码，避免AllinmdPlayer对象被覆盖
		
		 window.AllinmdPlayer = anyObject; 

<h4 id="引入文件">引入文件</h4>

* 需要确保已引入jQuery文件
* PC项目需要引入的AllinmdPlayer相关的文件

		<!--videojs相关样式-->
	    <link href="video-js.css" rel="stylesheet" type="text/css"/>
	    <!--allinmdplayer相关样式-->
	    <link href="css/videojs.allinmd.css" rel="stylesheet" type="text/css"/>
	    <!--为保证IE8下正常使用，需要引入-->
	    <script type="text/javascript" src="ie8/videojs-ie8.min.js"></script>
	    <!--修改过的videojs文件-->
	    <script type="text/javascript" src="video.js"></script>
	    <!--allinmdplayer逻辑代码-->
	    <script type="text/javascript" src="videojs.allinmd.js"></script>

* H5项目需要引入的AllinmdPlayer相关文件

		<!--videojs相关样式-->
	    <link href="video-js.css" rel="stylesheet" type="text/css"/>
	    <!--allinmdplayer相关样式-->
	    <link href="css/videojs.allinmd-h5.css" rel="stylesheet" type="text/css"/>
	    <!--修改过的videojs文件-->
	    <script type="text/javascript" src="video.js"></script>
	    <!--allinmdplayer逻辑代码-->
	    <script type="text/javascript" src="videojs.allinmd.js"></script>

<h4 id="HTML编码">HTML编码</h4>

* 务必保证class中至少存在"video-js vjs-default-skin vjs-no-flex"三个类名
* 其中"vjs-big-play-centered"是将播放按钮居中
* oncontextmenu="return true"当返回值设为false时，可以屏蔽用户对于video标签的右键菜单操作
	
		<video id="example_video_2" class="video-js vjs-default-skin vjs-no-flex vjs-big-play-centered" oncontextmenu="return true">
		</video>

<h4 id="JS调用">JS调用</h4>
在实例化AllinmdPlayer对象时，需要传入至少一个参数，即video标签中的id,其余参数都为可选参数。

	var player2 = new AllinmdPlayer('example_video_2', {
        width:640,
        height:264,
        controls:true,
		//播放之前需要放置的海报图片
        poster:"//vjs.zencdn.net/v/oceans.png", 
		//IE8下使用的swf地址
        flash: {
            swf:'allinmdplayer.swf'  			 
        }, //需要使用的插件，倍速切换（videoJsSpeedSwitcher），清晰度切换(videoJsResolutionSwitcher)，关键点显示(progress)								
        plugins: {
            videoJsSpeedSwitcher: {
                menuLabel: '倍速',
                menuItems: [{label: '1.0X', rate: 1}, {label: '1.5X', rate: 1.5},{label: '2.0X', rate: 2.0}]
            },        
            videoJsResolutionSwitcher:{"default": 'high', dynamicLabel: "true"},
            progress:[
                {
                    time: 9,
                    text:'这里输入你想要的信息'
                },
                {
                    time: 16,
                    text:'可以为锚点输入信息'
                },
                {
                    time: 23,
                    text:'如果没有，则会显示 undefined'
                },
                {
                    time: 28
                },
                {
                    time: 47,
                    text:'看到不写的下场了吗'
                }                
            ]
        },//设置播放权限时间，使用时需保证allow值为true                          
        limitPlayTime:{
            allow:true,
            value:3
        },//设置允许最大的快进时长，用于限制用户拖拽至不允许播放的时间点，使用时需保证allow值为true          
        setMaxPlayTime:{
            allow:false,
            value:0
        }       
    },function(){
        console.log("videojs对象初始化后的回调函数");
    });

    //设置清晰度切换所需要的清晰度地址
    player2.player.updateSrc([
        {
            src: 'https://vjs.zencdn.net/v/oceans.mp4?SD',
            type: 'video/mp4',
            label: '标清',
            res: 360
        },
        {
            src: 'https://vjs.zencdn.net/v/oceans.mp4?HD',
            type: 'video/mp4',
            label: '高清',
            res: 720
        }
    ]);
    //监听权限设置时长事件
    player2.player.on(player2.EVENT_TYPE.LIMIT_EVENT,function(){
        player2.ModalDialog(false,'<img src="//img00.allinmd.cn/detail/video/immediatelyLogin.png" style="width:100%;height:100%;">');
        player2.ModalDialogObj().fadeIn(1000);
    });
    //监听最大允许快进时长事件
    player2.player.on(player2.EVENT_TYPE.MAX_PLAY_TIME_EVENT,function(){
        alert('你还不可以快进至此处');
    });
    
    //监听倍速切换事件
    player2.player.on(player2.EVENT_TYPE.SPEED_CHANGE_EVENT,function(){
          console.log('当前倍速：',this.playbackRate());
    });
    

<h4 id="插件使用">插件使用</h4>
<h5 id="倍速切换插件">倍速切换插件</h5>
* 功能说明：倍速切换插件，主要提供了在播放过程中或暂停时，切换视频的播放速率
* 注意事项：
    * 调用 resetSpeed() 方法后，播放器菜单栏显示为初始化倍速插件的文本；播放速率变为 1.0
    * 调用 updateSpeedByLabel(label) 方法后，
        * label 为菜单项中的 label 值，如果不匹配，则会抛出 "setting exception, call function by updateSpeedByLabel "的异常
        * label 设置后，播放器菜单栏显示的是对应的播放速率label，播放速率变为对应的速率
* 使用方法：
    
        //在初始化视频播放器时，在 plugins 配置项中设置如下即可，如果不启用，则不设置
        var player2 = new AllinmdPlayer('example_video_2', {
                //需要使用的插件							
                plugins: {
                    videoJsSpeedSwitcher: {
                        //倍速切换的 label 值
                        menuLabel: '倍速',
                        //倍速切换菜单项，label 为菜单项的显示文本，rate 为对应的播放速率
                        menuItems: [{label: '1.0X', rate: 1}, {label: '1.5X', rate: 1.5},{label: '2.0X', rate: 2.0}]
                    },                         
                }  
            },function(){
                console.log("videojs对象初始化后的回调函数");
          });
          
          //复位播放倍速,
          //恢复菜单栏的倍速按钮为初始状态
          //恢复播放速率为1.0
          player2.player.resetSpeed();
          
          //设置对应倍速
          var label = '1.0X';
          player.player.updateSpeedByLabel(label);
          
          //可以通过监听倍速切换事件，来对每次倍速切换时，做出相应的处理
          player2.player.on(player2.EVENT_TYPE.SPEED_CHANGE_EVENT,function(){
                console.log('当前倍速：',this.playbackRate());
          });


<h5 id="清晰度切换插件">清晰度切换插件</h5>
* 功能说明: 清晰度切换插件，主要提供了根据不同视频源，播放不同清晰度的视频
* 使用方法：

        //在初始化播视频播放器是，在 plugins 配置项中设置如下即可，如果不启用，则不设置
        var player2 = new AllinmdPlayer('example_video_2', {
                //需要使用的插件								
                plugins: {               
                    videoJsResolutionSwitcher:{"default": 'high', dynamicLabel: "true"}
                }     
            },function(){
                console.log("videojs对象初始化后的回调函数");
            });
            
         //设置清晰度切换所需要的清晰度地址
         player2.player.updateSrc([
                {
                    src: 'https://vjs.zencdn.net/v/oceans.mp4?SD',
                    type: 'video/mp4',
                    label: '标清',
                    res: 360
                },
                {
                    src: 'https://vjs.zencdn.net/v/oceans.mp4?HD',
                    type: 'video/mp4',
                    label: '高清',
                    res: 720
                }
            ]);
        
        //可以通过监听视频清晰度切换时的相关事件，来做出相应处理
        player2.player.on(player2.EVENT_TYPE.RESOLUTION_CHANGE_EVENT,function(){
                       console.log('当前倍速：',this.playbackRate());
        });    
  
<h5 id="锚点提示插件">锚点提示插件</h5>         
* 功能说明：可以通过配置，在播放器进度条上特定的时间点，打出锚点，同时当鼠标移至锚点处时，可以显示出需要显示的气泡
* 注意事项：
    * 如果启用锚点提示，则需要在 text 属性中传入值，否则会显示出 "undefined"；
    * 如果启用锚点提示，但不想要对应的提示值，则可以在 text 属性中设置空字符串
    * 如果不启用锚点，则不用再 plugins 中设置
* 使用方法：

        var player2 = new AllinmdPlayer('example_video_2', {
               //需要使用的插件							
                plugins: {
                   progress:[
                        {
                            time: 9,
                            text:'这里输入你想要的信息'
                        },
                        {
                            time: 16,
                            text:'可以为锚点输入信息'
                        },
                        {
                            time: 23,
                            text:'如果没有，则会显示 undefined'
                        },
                        {
                            time: 28
                        },
                        {
                            time: 47,
                            text:'看到不写的下场了吗'
                        }                
                    ]
                }
            },function(){
                console.log("videojs对象初始化后的回调函数");
            });
   
<h5 id="切片播放插件">切片播放插件</h5>   
* 功能说明：可以播放遵循 hls 协议的 m3u8 格式的切片流视频
* 使用方法：
        
        //如果想要当前视频播放器能够支持切片流播放，则只需要引入以下 videojs-contrib-hls.min.js 脚本即可
        //如果当前视频播放器不需要支持切片流视频，则不可引用，否则会报错
        //videojs-contrib-hls.min.js 需要紧跟与 video.js 文件后
         
         <!--修改过的videojs文件-->
         <script type="text/javascript" src="video.js"></script>
         <!--videojs-contrib-hls.min.js文件必须放在video.js之后-->
         <script type="text/javascript" src="videojs-contrib-hls.min.js"></script>
         <!--allinmdplayer逻辑代码-->
         <script type="text/javascript" src="videojs.allinmd.js"></script>

<h4 id="配置说明">配置说明</h4>
<h5 id="选项">选项</h5>
此处选项主要针对于实例化AllinmdPlayer对象时需要传入的第二个参数对象

| 选项 | 类型 | 默认值 | 可选值| 说明 |
|:-----|:----|:------|:-----|:-----|
| width | 整数  | 960 | * | 视频对象的宽度 |
| height | number  | 400 | * | 视频对象的高度 |
| controls | Boolean  | true| true &#124; false | 是否显示控制栏 |
| preload | string | auto | auto &#124; meta &#124; none  | "auto"当页面加载后载入整个视频,<br/>"meta"当页面加载后只载入元数据,<br/>"none"当页面加载后不载入视频,<br/>预加载模式，在有清晰度插件使用的情况下务必保证值为"auto",否则IE8会无法正常切换视频源 |
| poster | string | 无 | url | 需要显示播放前的海报图 |
| flash | object | videojs默认swf | {swf:"url"}| **必填参数（H5页面不可使用）** ，当使用Flash模式（IE8中或不支持video标签的浏览器）播放时，需要用到的swf地址 |
| plugins | object | 无 | videoJsResolutionSwitcher &#124; progress | **H5页面不可使用** 插件选项，现有插件分别有清晰度切换，关键点显示 |
| limitPlayTime | object |{allow:false,value:0}|allow: true &#124; false <br/> value:number| 可播放时间权限，当需要设置时，需确保allow为true,同时传入有效value值 |
| setMaxPlayTime | object |{allow:false,value:0}|allow: true &#124; false <br/> value:number| **H5页面不可使用** 可拖拽快进最大时间，当需要设置时，需确保allow为true,同时传入有效value值 |
| isH5 | Boolean | false| true &#124; false |**H5页面必填参数** 是否为H5页面|
| needPausedShowBigPlayBtn | Boolean | true | true &#124; false | 设置当视频暂停时是否显示视频中间的大播放按钮 |
| hotKeysOption | object | {timeValue:10,volumeValue:0.1} | timeValue: * <br/> volumeValue:0~1| **需要修改时必须将两个参数都设置，否则会报错** 默认设置快进/退时间为10s,参考ckplayer默认时间,如果需要关闭键盘监听事件，可参考AllinmdHotKeys插件相关的方法 |

<h5 id="常用方法">常用方法</h5>
此处调用方法的对象分为两种，一种是AllinmdPlayer对象，下表中以"allinmdPlayer"表示，另一种是videojs的player对象，可通过"allinmdPlayer.player"获得，下表中也如此表示，在使用时应当注意区分

| 名称 | 所属对象 | 说明 |
|:-----|:-------|:------|
| setCanPlay(bool) | allinmdPlayer | bool为false,表示播放器当前不可以播放，为true时表示可以播放，但需要调用play()方法 |
| getCanPlay() | allinmdPlayer | 获取当前播放器是否可以播放，为true时，表示可以，为false时，表示不可以，如果需要播放，则可以调用setCanPlayer(bool)方法 |
| setCanDragProgressBar(bool) | allinmdPlayer | bool为false时，表示播放器进度条不可拖拽，bool为true时，表示播放器进度条可以拖拽 |
| getCanDragProgressBar() | allinmdPlayer | 获取当前播放器是否可以进行拖拽，true表示可以，false表示不可以 |
| ModalDialog(bool,domObj) | allinmdPlayer | bool为true时，显示弹窗层，domObj为需要显示的DOM对象 |
| ModalDialogObj() | allinmdPlayer | 返回弹窗层对象，方便对弹层进行自定义操作 |
| SetControlBarShow(bool) | allinmdPlayer | bool为true时，可以显示控制条，bool为false时，控制条将隐藏 |
| TurnOnPlayToPause(time) | allinmdPlayer | **H5页面可考虑使用** ，当无法控制H5中浏览器的video时，可以在权限设置时使用此方法，可以阻止用户正常播放 |
| getCurrentTime() | allinmdPlayer | 返回当前播放进度时间值，格式化后精确到秒 |
| currentTime(value) | allinmdPlayer | 设置当前播放进度时间值，单位为秒 |
| getDurationTime() | allinmdPlayer | 返回当前播放总时长，格式化后精确到秒 |
| updateSrc([{src:url,type:'video/mp4',label:'标清',res:360}]) | allinmdPlayer.player| **设置清晰度，必须调用此方法**|
| HideVideoElement() | allinmdPlayer | 隐藏播放器的video元素 **H5中建议使用** |
| turnOffAllinmdHotKeys | allinmdPlayer | 关闭播放器中的AllinmdHotKeys插件，默认开启 |
| turnOnAllinmdHotKeys | allinmdPlayer | 开启播放器中的AllinmdHotKeys插件，默认开启 |
| hasTurnOnHotKeys | allinmdPlayer | 判断是否已经开启播放器中的AllinmdHotKeys插件，true为开启，false为关闭 |
| on(eventType,callback) | allinmdPlayer.player | videojs对象内部的事件侦听函数，在allinmdPlayer中自定义的事件也基于此方法调用 |
| currentTime() | allinmdPlayer.player | videojs内部的当前播放时长，没有格式化，默认有小数 |
| currentTime(value) | allinmdPlayer.player | videojs内部的设置播放器播放至value时间点 |
| duration() | allinmdPlayer.player | videojs内部的播放总时长，没有格式化，默认有小数 |
| paused() | allinmdPlayer.player | 判断视频是否处于暂停状态，true为暂停，false为播放 |
| isFullscreen() | allinmdPlayer.player | 判断视频是否处于全屏状态，true为全屏状态，false为非全屏状态 |
| requestFullscreen() | allinmdPlayer.player | 请求进入全屏状态，需要配合用户真实的鼠标或键盘事件，不可程序模拟 |
| exitFullscreen() | allinmdPlayer.player | 请求退出全屏状态，可以程序直接调用 **建议IE8下在退出全屏时做一个isFullscreen()的判断，防止报错** |
| play() | allinmdPlayer.player | 播放视频 |
| pause() | allinmdPlayer.player | 暂停视频 |
| dispose() | allinmdPlayer.player | 清理videojs对象，当逻辑代码中需要将视频相关的DOM清除时，务必保证先调用此方法将videojs对象清理，否则会出现再次生成视频对象时报错，原因为videojs内部错误 |

<h5 id="属性值">属性值</h5>
处于使用方便的考虑，将AllinmdPlayer对象内部的videojs对象设置为player属性，也就是说allinmdPlayer.player即为videojs的对象。

<h5 id="事件">事件</h5>
列表中所有事件相关，均由videojs对象触发并响应，即allinmdPlayer.player作为事件的发送和接收方。

| 事件名称 | 事件类型 | 示例 | 说明 |
|:--------|:--------|:----|:-----|
| LIMIT_EVENT | 自定义 | allinmdPlayer.player.on(allinmdPlayer.EVENT_TYPE.LIMIT_EVENT,callback) |当播放至初始化时设置的限定播放时长时，触发此事件 |
| MAX_PLAY_TIME_EVENT | 自定义 | allinmdPlayer.player.on(allinmdPlayer.EVENT_TYPE.MAX_PLAY_TIME_EVENT,callback) |当需要拖拽播放的时间大于允许播放的最大时长时，触发此事件 |
| SPEED_CHANGE_EVENT | 自定义 | allinmdPlayer.player.on(allinmdPlayer.EVENT_TYPE.SPEED_CHANGE_EVENT,callback) |当播放器的倍速发生变化时，触发此事件 |
| RESOLUTION_CHANGE_EVENT | 自定义 | allinmdPlayer.player.on(allinmdPlayer.EVENT_TYPE.RESOLUTION_CHANGE_EVENT,callback) | 当视频清晰度发生变化时，触发此事件 |
| timeupdate | videojs | allinmdPlayer.player.on("timeupdate",callback) | 当视频时间发生变化时，触发此事件 |
| fullscreenchange | videojs | allinmdPlayer.player.on("fullscreenchange",callback) | 当视频屏幕大小发生变化时，触发此事件 |
| pause | videojs | allinmdPlayer.player.on("pause",callback) | 当视频暂停时，触发此事件 |
| play | videojs | allinmdPlayer.player.on("play",callback) | 当视频播放时，触发此事件 |
| ended | videojs | allinmdPlayer.player.on("ended",callback) | 当视频播放结束时，触发此事件 |

<h2 id="建议">建议</h2>

<h4 id="PC项目">PC项目</h4>
* 建议参考index.html页面中的相关调用方法
* videojs的ie8兼容文件和我们平时构建项目时使用的comm.func.js或类似兼容ie8的公共方法有冲突，可以先引入videojs-ie8.js后引入项目的相关js文件
* 为了在ie8中正常使用flash播放器，需要注意页面中引入视频源的方法
* 为了防止ie8自动进入兼容模式，需要注意页面引入时的位置，应当在设置<meta charset="utf-8">之后
* video标签的初始化写法不唯一，可以参考videojs-allinmd目录下的index.html文件中相关的使用方法
* 在video标签上加入屏蔽右键菜单功能，可以让普通用户无法通过右键直接视频另存为，初步减少视频源的被盗用
* 如果需要判断视频是否播放到某个时间点，可以结合timeupdate事件，通过获取视频当前播放时长，此时建议使用allinmdPlayer.player.currentTime()方法，获取最精确的值。因为每次的timeupdate并没有精确到秒
* 如果页面出现多个video,则可以考虑将它们置于数组，或自定义的视频对象控制器，通过allinmdPlayer.player.paused()来配合实现一些需求，如当前页面同时播放video数量不大于1
* 可以通过获取allinmdPlayer.ModalDialogObj()对象，来自定义一些弹窗层的显示效果
* 可以通过覆盖或增加自定义样式，来改变现有播放器中的一些样式效果
* 当触发了限定播放时长事件后，如果需要继续播放，请保证设置allinmdPlayer.setCanPlay(true);allinmdPlayer.setCanDragProgressBar(true);否则，拖拽进度条将无法正常使用
* 当使用AllinmdPlayer中切换视频插件时，如果需要设置默认播放时长，务必将allinmdPlayer.updateSrc(...)方法置于设置allinmdPlayer.player.currentTime(anyTime)之前，否则会出现设置播放时长无效

<h4 id="H5项目">H5项目</h4>
* 建议参考h5-videoplayer.html页面中相关调用方法
* H5页面在video标签中，应当加入"playsinline"、"x5-video-player-fullscreen='true'"、"x5-video-orientation='landscape'"、"x5-video-player-type='h5'"属性
* 由于在H5页面中大部分手机浏览器会“劫持”video标签，并对其进行直接控制，所以建议不使用任何AllinmdPlayer中提供的插件
* 目前AllinmdPlayer插件可以实现在IOS10+、TBS>=036849的苹果手机及安卓手机的播放不全屏效果，以及应用相关的H5同层播放技术
* 所以在上述版本的手机中，可以正常使用权限判断功能，并监听对应的事件，同时，如果不能正常弹层时，建议使用TurnOnPlayToPause(time)方法，限制非正常登陆/认证用户正常播放视频
* 如果在较低版本的手机中，浏览器无法正常响应AllinmdPlayer封装的方法，可以直接获取video对象，进行操作
* iPad中可以正常让其访问PC端的页面，并能正常响应相关事件

<h4 id="关于源码">关于源码</h4>
* AllinmdPlayer相关的源码在videojs.allinmd.js中
* videojs中修改的源码部分，可以通过查找以下代码注释块，进行查看所有针对videojs源码的修改部分

         //+++ note: AllinmdPlayer Change end.
         //Some code for AllinmdPlayer
         //...
         //+++ note: AllinmdPlayer Change end.



