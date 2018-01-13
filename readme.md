# 天地伟业视频 SDK 接入 ArcGIS API for JS

**因天地伟业SDK限制, 只支持IE浏览器**

**`Swallow.cab` 须与 \*.html 在同一目录下**

## 原理
读取 `config.js` 中的 `videoConfigMap` 作为配置文件,  使用 `Vue` 组件创建视频窗口

这里用到天地伟业的SDK
`StartVideo()`, `closeAllObs()` 函数在 `tdvideo_oem.js`里写好的, 具体查看即可
## 用法 
- 配置 `config.js` 

依据说明配置即可
```javascript
// 默认配置的变量名为 videoConfigMap
var videoConfigMap =
[{
    // 硬盘录像机站点名
    videoStationName: 'xxx路',
    // 硬盘录像机公网ip
    videoIP: '123.4.5.6',
    // 画质: 0 为高清 1为清晰
    videoResolutionHigh: 0,
    videoResolutionLow: 1,
    // 录像机下摄像头索引
    videoIndex: [{
        id: 0,
        name: "xx路大门"
    }, {
        id: 1,
        name: 'xx路办公室'
    }]
}, {
    videoStationName: 'xxxx公司',
    videoIP: '公网ip地址',
    videoResolutionHigh: 0,
    videoResolutionLow: 1,
    videoIndex: [{
        id: 0,
        name: "xxx"
    }, {
        id: 1,
        name: 'xxxx'
    }]
}];
```


 ![image](http://p198u5nbd.bkt.clouddn.com/jpg/2018/1/12/a7681b176ebc0120e91116d274e2977a.jpg)

 ![image](http://p198u5nbd.bkt.clouddn.com/jpg/2018/1/12/627adadab0b8911c626bb090ff374bcc.jpg)
