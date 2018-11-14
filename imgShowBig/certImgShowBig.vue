<script src="imgRotateController.js"></script>
<template>
  <section class="show-big-img" v-show="visible">
    <figure class="show-panel">
      <div class="show-header">
        <i class="show-header-edit"></i><label>证件编号：</label><input v-model="showTitle" class="edit-input"
                                                                   v-bind:readonly="isReadOnly"/><i
        class="show-header-close"
        @click="closeOnClick"></i>
      </div>
      <div class="show-img">
        <div>
          <img :style="imgRotateController.imgStyle" ref="imgElement" :src="src" />
        </div>
      </div>
      <div class="rotate-control-box">
        <div class="rotate-left" @click="imgRotateController.rotateImgHandle(90)"></div>
        <div class="rotate-right" @click="imgRotateController.rotateImgHandle(-90)"></div>
      </div>
    </figure>
  </section>
</template>

<script>
  import ImgRotateController from './imgRotateController';

  /**
   * 作用：查看大图弹层
   * 使用方法：<showBig :src="showBigData.url" :isReadOnly="showBigData.idReadOnly" @closeShowBig="closeShowBigHandle" :title="'showBigData.title'" :visible="showBigData.visible"></showBig>
   * 注意事项：需要引入 imgRotateController.js 作为图片旋转控制器
   */
  export default {
    name: "certImgShowBig",
    props: ['src', 'isReadOnly', 'title', 'visible'],
    data() {
      return {
        imgElement: null,
        imgRotateController: {},
        showTitle:this.title,
      }
    },
    methods: {
      closeOnClick() {
        this.$emit('closeShowBig', this.showTitle);
      },
      initImg(){
        this.imgElement = this.$refs.imgElement;
        if (!this.imgElement || this.imgElement.width <= 0) {
          //加载图片
          let img = new Image();
          img.src = this.src;
          img.onload = () => {
            //初始化旋转控制器
            this.imgRotateController = new ImgRotateController(this.imgElement, 758, 572);
          }
        }
        else {
          //初始化旋转控制器
          this.imgRotateController = new ImgRotateController(this.imgElement, 758, 572);
        }
      }
    },
    watch:{
      visible(){
        this.initImg();
      },
      title(){
        this.showTitle = this.title;
      }
    }
  }
</script>

<style lang="scss" scoped>
  .show-big-img {
    position: fixed;
    width: 100%;
    height: 100%;
    z-index: 1999;
    top: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.7);

    .show-panel {
      display: block;
      width: 758px;
      height: 572px;
      margin: 168px auto;
      background: #000;
      font-size: 0;
    }
    .show-header {
      position: relative;
      background: rgba(0, 0, 0, 0.5);
      color: #ffffff;
      text-align: center;
      padding: 5px 0;
      z-index: 2;
      .show-header-edit {
        display: inline-block;
        margin-right: 10px;
        background: url("/static/images/icons/icon-edit.png") center center no-repeat;
        width: 15px;
        height: 15px;
      }
      label {
        font-family: PingFangSC-Regular;
        font-size: 15px;
        color: #FFFFFF;
        letter-spacing: 0;
        line-height: 15px;
      }
      .edit-input {
        border: none;
        background: none;
        font-family: PingFangSC-Regular;
        font-size: 15px;
        color: #FFFFFF;
        letter-spacing: 0;
        line-height: 15px;
      }
      .show-header-close {
        display: inline-block;
        position: absolute;
        right: 10px;
        background: url("/static/images/icons/icon-close-white.png") center center no-repeat;
        width: 15px;
        height: 15px;
      }
    }
    .show-img {
      width: 100%;
      height: 100%;
      margin-top: -30px;
      text-align: center;
      display: table;
      div {
        display: table-cell;
        vertical-align: middle;
        img {
          z-index: 1;

        }
      }
    }
    .rotate-control-box {
      width: 96px;
      height: 40px;
      display: flex;
      justify-content: space-between;
      z-index: 99;
      position: absolute;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      div {
        cursor: pointer;
        width: 44px;
        height: 44px;
        border-radius: 22px;
      }
      .rotate-left {
        background: #ffffff url(/static/images/icons/icon-turn-left-black.png) center no-repeat;
        &:active {
          background: #4B67D6 url(/static/images/icons/icon-turn-left-white.png) center no-repeat;
        }
      }
      .rotate-right {
        background: #ffffff url(/static/images/icons/icon-turn-right-black.png) center no-repeat;
        &:active {
          background: #4B67D6 url(/static/images/icons/icon-turn-right-white.png) center no-repeat;
        }
      }
    }
  }


</style>
