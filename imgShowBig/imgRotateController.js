/**
 * 功能描述：图片旋转控制器
 * 使用方法：1.引入import ImgRotateController from './imgRotateController';
 *           2.初始化：1）data() 中，需要设置 imgRotateController:{} //此处不可设置为null
 *                     2) 实例化控制器 this.imgRotateController = new ImgRotateController(this.imgElement, 758, 572);
 *                     3）需要旋转的图片元素 <img :style="imgRotateController.imgStyle" ref="imgElement" :src="src" />
 *                     4）旋转按钮对应的点击事件  <div class="rotate-left" @click="imgRotateController.rotateImgOnClick(90)"></div>
 *           3.可单独使用，可参考 certImgShowBig.vue 组件的使用方式
 * 注意事项：
 * 引入来源：
 * 作用：适用于旋转图片的相关功能，仅负责旋转逻辑处理,对应样式需在实际使用中调整
 * Create by hauk0101 on 2018/9/15
 */

'use strict';

export default class ImgRotateController {
  /**
   * 构造函数
   * @param imgElement <img /> 对应的 dom 元素，通过this.$refs.xxx 获取即可
   * @param parentWidth 显示图片容器的宽度 （单位：px）
   * @param parentHeight 显示图片容器的高度 （单位：px）
   */
  constructor(imgElement, parentWidth, parentHeight) {
    if (!!imgElement) {
      this.setImgElement(imgElement, parentWidth, parentHeight);
    }
  }

  init() {
    //初始化图片显示
    let style = {};
    //如果宽大于等于高，则宽等于容器宽度，高度自适应
    if (this.imgElement.width >= this.imgElement.height) {
      this.isWidthMoreHeight = true;
      style.width = this.parentWidth + 'px';
      style.height = 'auto';
      style['max-height'] = this.parentHeight + 'px';
    }//如果高大于宽，则高等于容器高度，宽度自适应
    else {
      this.isWidthMoreHeight = false;
      style.height = this.parentHeight + 'px';
      style.width = 'auto';
      style['max-height'] = this.parentWidth + 'px';
    }
    this.imgStyle = style;
  }

  /**
   * 图片旋转处理
   * @param radius 旋转角度，目前仅支持 +/- 90°
   */
  rotateImgHandle(radius) {
    this.rotateRadius += radius;
    if (Math.abs(this.rotateRadius) == 360 || Math.abs(this.rotateRadius) == 0) {
      this.rotateRadius = 0;
    }
    //如果是水平旋转，则正常宽高
    let _style = {}, _offsetTop;
    _style.transform = 'rotate(' + this.rotateRadius + 'deg)';
    if (Math.abs(this.rotateRadius) == 0 || Math.abs(this.rotateRadius) == 180) {
      if (this.isWidthMoreHeight) {
        _style.width = this.parentWidth + 'px';
        _style.height = 'auto';
        _style['max-height'] = this.parentHeight + 'px';
      } else {
        _style.height = this.parentHeight + 'px';
        _style.width = 'auto';
        _style['max-width'] = this.parentWidth + 'px';
      }
    }//如果是垂直旋转，则宽高值颠倒
    else {
      if (this.isWidthMoreHeight) {
        _style.width = this.parentHeight + 'px';
        _style.height = 'auto';
        _style['max-height'] = this.parentWidth + 'px';
      } else {
        _style.height = this.parentWidth + 'px';
        _style.width = 'auto';
        _style['max-width'] = this.parentHeight + 'px';
      }
    }
    //设置旋转后的位移
    if (this.isWidthMoreHeight) {
      // _offsetTop = (this.parentHeight - this.imgElement.width) / 2;
    } else {
      _offsetTop = (this.parentWidth - this.imgElement.height) / 2;
      _style['margin-top'] = -_offsetTop + 'px';
    }
    this.imgStyle = _style;
  }

  /**
   * 设置当前图片元素,说明参考构造函数
   * @param imgElement
   * @param parentWidth
   * @param parentHeight
   */
  setImgElement(imgElement, parentWidth, parentHeight) {
    this.imgElement = imgElement;
    this.parentWidth = parentWidth;
    this.parentHeight = parentHeight;
    this.rotateRadius = 0;          //每次旋转的角度，目前仅支持 +/- 90°
    this.imgStyle = {};             //图片样式
    this.isWidthMoreHeight = true;  //默认为宽比高长
    this.init();
  }
}

export class ImgDomRotateController {
  constructor() {
    this._imgElement = null;
    this._rotateRadius = null;
    this._imgStyle = {};
    this.isWidthMoreHeight = true;
    this.parentWidth = 0;
    this.parentHeight = 0;
  }

  init(imgElement, parentWidth, parentHeight) {
    this.imgElement = imgElement;
    this.parentWidth = parentWidth;
    this.parentHeight = parentHeight;
    this.rotateRadius = 0;

    //初始化图片显示
    let style = '';
    //如果宽大于等于高，则宽等于容器宽度，高度自适应
    if (this.imgElement.width >= this.imgElement.height) {
      this.isWidthMoreHeight = true;
      style += "width:" + this.parentWidth + 'px;';
      style += "height:auto;";
    }//如果高大于宽，则高等于容器高度，宽度自适应
    else {
      this.isWidthMoreHeight = false;
      style += "height:" + this.parentHeight + 'px;';
      style += "width:auto;";
    }
    this.imgStyle = style;
  }

  reset() {
    this.imgElement = null;
  }

  rotate(radius) {
    this.rotateRadius += radius;
    if (Math.abs(this.rotateRadius) == 360 || Math.abs(this.rotateRadius) == 0) {
      this.rotateRadius = 0;
    }
    //如果是水平旋转，则正常宽高
    let _style = '', _offsetTop;
    _style += 'transform:' + 'rotate(' + this.rotateRadius + 'deg);';
    if (Math.abs(this.rotateRadius) == 0 || Math.abs(this.rotateRadius) == 180) {
      if (this.isWidthMoreHeight) {
        _style += 'width:' + this.parentWidth + 'px;';
        _style += 'height:' + 'auto;';
      } else {
        _style += 'height:' + this.parentHeight + 'px;';
        _style += 'width:' + 'auto;';
      }
    }//如果是垂直旋转，则宽高值颠倒
    else {
      if (this.isWidthMoreHeight) {
        _style += 'width:' + this.parentHeight + 'px;';
        _style += 'height:' + 'auto;';
      } else {
        _style += 'height:' + this.parentWidth + 'px;';
        _style += 'width:' + 'auto;';
      }
    }
    //设置旋转后的位移
    if (this.isWidthMoreHeight) {
      _offsetTop = (this.parentHeight - this.imgElement.width) / 2;
      _style += 'margin-left:' + -_offsetTop + 'px;';
    } else {
      _offsetTop = (this.parentWidth - this.imgElement.height) / 2;
      _style += 'margin-top:' + -_offsetTop + 'px;';
    }
    this.imgStyle = _style;
  }

  set imgElement(element) {
    this._imgElement = element;
  }

  get imgElement() {
    return this._imgElement;
  }

  set imgStyle(style) {
    this._imgStyle = style;
    if (this.imgElement) {
      this.imgElement.style.cssText = style;
    }
  }

}



