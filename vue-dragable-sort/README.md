## 拖拽排序

#### 目录说明

* `/vue-dragable-sort/informationMaintenance.vue` vue 中实现元素左边为序号，右边为需要排序的元素，保证左边序号不动，只是右边元素可拖拽，并使拖拽后的结果对应左边的序号
    * 基于组件 `vue-slicksort` ,需要安装此组件
    * `Flash point` 如何保证一侧元素可拖拽，另一侧不变，其实是用两组元素，通过 css 样式组装成 table 的效果
