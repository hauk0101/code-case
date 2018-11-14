<template>
  <section class="crm-cert">
    <section class="crm-cert-tip">
      <h3 class="crm-cert-title">认证证件页提示</h3>
      <div class=" crm-cert-content">
        <el-input class="crm-cert-input" placeholder="请输入认证证件页提示标题" v-model="certTipTitle"></el-input>
        <el-input class="crm-cert-input" placeholder="请输入认证证件页提示内容" v-model="certTipContent"></el-input>
        <el-button type="primary" round v-on:click="tipConfirmOnClick">确认修改</el-button>
      </div>
    </section>
    <section class="crm-cert-show">
      <h3 class="crm-cert-title">认证证件展示</h3>
      <section class="crm-cert-sort">
        <section class="crm-cert-sort-panel">
          <div class="crm-cert-sort-left sort-font">
            <h3>序号</h3>
            <ul>
              <li v-for="index in sortItemList6.length">{{index}}</li>
            </ul>
          </div>
          <div class="crm-cert-sort-right sort-font">
            <h3>证件名称</h3>
            <SortableList lockAxis="" v-model="sortItemList6" helperClass="helperClass">
              <SortableItem v-for="(item, index) in sortItemList6" :index="index" :key="index" :item="item.refValue"/>
            </SortableList>
          </div>
        </section>
        <section class="crm-cert-sort-panel">
          <div class="crm-cert-sort-left sort-font">
            <h3>序号</h3>
            <ul>
              <li v-for="index in sortItemList7.length">{{index}}</li>

            </ul>
          </div>
          <div class="crm-cert-sort-right sort-font">
            <h3>证件名称</h3>
            <SortableList lockAxis="" v-model="sortItemList7" helperClass="helperClass">
              <SortableItem v-for="(item, index) in sortItemList7" :index="index" :key="index" :item="item.refValue"/>
            </SortableList>
          </div>
        </section>
        <div>
          <el-button type="primary" round v-on:click="showSortConfirmOnClick">确认修改</el-button>
        </div>

      </section>

    </section>
  </section>
</template>

<script>
  import apiConfig from '@/api/apiUrlConfig';
  import axios from 'axios';
  import {ContainerMixin, ElementMixin} from 'vue-slicksort';

  const SortableList = {
    mixins: [ContainerMixin],
    template: `<ul><slot></slot></ul>`
  };
  const SortableItem = {
    mixins: [ElementMixin],
    props: ['item'],
    template: `<li class="">{{item}}</li>`
  }

  //认证相关信息维护
  export default {
    name: "informationMaintenance",
    data() {
      return {
        certTipTitle: '',
        certTipContent: '',
        sortItemList6: [],
        sortItemList7: [],
      }
    },
    methods: {
      tipConfirmOnClick() {
        const _this = this;
        const data = {
          scene: 2,
          promptCondition: 0,
          visitSiteId: 25,
          promptMessage: this.certTipTitle + "@=@" + this.certTipContent
        };
        axios({
          method: apiConfig.updateCertTipInfo.type,
          url: apiConfig.updateCertTipInfo.url,
          data: data
        }).then(function (res) {
          if (res && res.data.responseObject && res.data.responseObject.responseCode == "success") {
            _this.$message.info('修改认证证件页提示成功！');
          } else {
            _this.$message.error('修改认证证件页提示失败！');
          }
        }).catch(() => {
          _this.$message.error('修改认证证件页提示失败！');
        });
      },
      showSortConfirmOnClick() {
        let sortItemList6 = this.sortItemList6;
        let sortItemList7 = this.sortItemList7;
        let data_list = [];
        let dataObj = {};
        //更新6的排序
        for (let i = 0; i < sortItemList6.length; i++) {
          dataObj = {};
          dataObj.roleId = sortItemList6[i].roleId;
          dataObj.sortId = i + 1;
          dataObj.refId = sortItemList6[i].refId;
          dataObj.isValid = sortItemList6[i].isValid;
          data_list.push(dataObj);
        }
        //更新7的排序
        for (let i = 0; i < sortItemList7.length; i++) {
          dataObj = {};
          dataObj.roleId = sortItemList7[i].roleId;
          dataObj.sortId = i + 1;
          dataObj.refId = sortItemList7[i].refId;
          dataObj.isValid = sortItemList7[i].isValid;
          data_list.push(dataObj);
        }

        const data = {
          visitSiteId:25,
          data_list:data_list
        };
        const _this = this;
        axios({
          method: apiConfig.updateCertSortInfo.type,
          url: apiConfig.updateCertSortInfo.url,
          data: data
        }).then(function (res) {
          if (res && res.data.responseObject && res.data.responseObject.responseMessage == "update success") {
            _this.$message.info('修改认证证件展示成功！');
          } else {
            _this.$message.error('修改认证证件展示失败！');
          }
        }).catch(() => {
          _this.$message.error('修改认证证件展示失败！');
        });

      },
      getDefaultData() {
        const _this = this;
        //获取提示数据
        axios({
          method: apiConfig.getCertTipInfo.type,
          url: apiConfig.getCertTipInfo.url,
          params: {
            scene: 2,
            promptCondition: 0,
          }
        }).then(function (res) {
          if (res && res.data.responseObject && res.data.responseObject.responseData) {
            const data = res.data.responseObject.responseData;
            if (data && data.promptMessage) {
              const list = data.promptMessage.split('@=@');
              _this.certTipTitle = list[0];
              _this.certTipContent = list[1];
            }
          }
        }).catch((e) => {
          console.log('获取认证证件页提示异常', e);
        });
        //获取排序列表数据
        axios({
          method: apiConfig.getCertSortInfo.type,
          url: apiConfig.getCertSortInfo.url,
          params: {
            isValid: 2,
            visitSiteId: 25,
            roleIdList:"6,7"
          }
        }).then(function (res) {
          if (res && res.data.responseObject && res.data.responseObject.responseData) {
            const data = res.data.responseObject.responseData;
            if (data && data.data_list) {
              const list = data.data_list;
              for (let i = 0; i < list.length; i++) {
                //如果为6，表示为左侧数据
                if (list[i][6]) {
                  _this.sortItemList6 = list[i][6];
                  continue;
                }
                //如果为7，表示为右侧数据
                if (list[i][7]) {
                  _this.sortItemList7 = list[i][7];
                  continue;
                }
              }
            }
          }
        }).catch((e) => {
          console.log('获取认证证件页提示异常', e);
        });
      }
    },
    mounted: function () {
      //获取认证证件页提示数据
      this.getDefaultData();
    },
    created: function () {

    },
    components: {
      SortableList,
      SortableItem
    }
  }
</script>

<style lang="scss" scoped>
  .crm-cert {
    width: 1200px;
    margin: 0 auto;
    .crm-cert-title {
      margin: 32px 0 25px 0;
      font-family: PingFangSC-Semibold;
      font-size: 20px;
      color: #2C343A;
      letter-spacing: 0;
      line-height: 24px;
      font-weight: bolder;
    }
    .crm-cert-content {
      background: #FFFFFF;
      box-shadow: 0 4px 10px 0 rgba(42, 53, 102, 0.04);
      border-radius: 4px;
    }
    .crm-cert-input {
      padding: 20px 20px 0 20px;
      width: 1160px;
    }
    .el-button {
      margin: 36px 20px;
      padding: 10px 50px;
      background: #4B67D6;
      border-radius: 100px;
      font-family: PingFangSC-Regular;
      font-size: 15px;
      color: #FFFFFF;
      letter-spacing: 0;
      line-height: 15px;
    }

  }

  .crm-cert-sort {
    display: block;
    width: 1200px;
    height: auto;
    background: #FFFFFF;
    box-shadow: 0 4px 10px 0 rgba(42, 53, 102, 0.04);
    border-radius: 4px;
    .crm-cert-sort-panel {
      display: inline-block;
      padding: 20px;
      font-size: 0;
      vertical-align: top;
      .sort-font {
        font-family: PingFangSC-Medium;
        font-size: 14px;
        color: #111111;
        letter-spacing: 0;
        line-height: 14px;
      }

      h3 {
        padding: 13px 30px;
        border: 1px solid #E6E6E8;
        margin: 0;
      }
      ul {

        li {
          padding: 13px 30px;
          border: 1px solid #E6E6E8;
          cursor: pointer;
          user-select: none;
        }
      }

      .crm-cert-sort-left {
        display: inline-block;

      }
      .crm-cert-sort-right {
        display: inline-block;
      }
    }

  }

  .helperClass {
    opacity: 0.3;
    background: #A8BAFF;
    text-align: center;
    line-height: 42px;
  }

</style>
