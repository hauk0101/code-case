## 图片旋转及查看大图

#### 目录说明

* `/imgShowBig/imgRotateController.js` 图片旋转控制器
    * 默认 `export class ImgRotateController `的是仅支持 vue 的图片旋转控制器
    * `export class ImgDomRotateController` 为支持原生的图片旋转控制器
    * 二者区别仅为 js 处理 css 样式时的不同
    * `Flash point` 如何处理图片旋转过程中的 css 样式问题
* `/imgShowBig/certImgShowBig.vue` 使用 `ImgRotateController` 的示例，并包括弹层查看大图功能