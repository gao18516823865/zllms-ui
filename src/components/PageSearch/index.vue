<template>
  <el-form ref="queryForm" :model="queryParams" :inline="inline" :label-width="`${labelWidth}px`" :size="size">
    <template v-for="(item,index) in searchItems">
      <el-form-item v-if="item.type === 'input'" :key="index" :label="item.label" :prop="item.key">
        <el-input v-model="queryParams[item.key]" :style="`width:${itemWidth}px`" :placeholder="'请输入'+item.label" clearable />
      </el-form-item>
      <el-form-item v-if="item.type === 'select'" :key="index" :label="item.label" :prop="item.key">
        <el-select v-model="queryParams[item.key]" :style="`width:${itemWidth}px`" :placeholder="'请选择'+item.label" clearable>
          <el-option v-for="ops in item.options" :key="ops.value" :label="ops.label" :value="ops.value" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="item.type === 'date'" :key="index" :label="item.label" :prop="item.key">
        <el-date-picker v-model="queryParams[item.key]" :style="`width:${itemWidth}px`" type="date" v-bind="item" />
      </el-form-item>
      <el-form-item v-if="item.type === 'daterange'" :key="index" :label="item.label" :prop="item.key">
        <el-date-picker v-model="queryParams[item.key]" :style="`width:${itemWidth}px`" type="daterange" v-bind="item" />
      </el-form-item>
      <el-form-item v-if="item.type === 'monthrange'" :key="index" :label="item.label" :prop="item.key">
        <el-date-picker v-model="queryParams[item.key]" :style="`width:${itemWidth}px`" type="monthrange" v-bind="item" />
      </el-form-item>
    </template>
    <el-form-item>
      <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
      <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      <template v-if="customButtons.length>0">
        <el-button v-for="(item,index) in customButtons" :key="index" v-bind="item" @click="item.onClick">{{item.label}}</el-button>
      </template>
    </el-form-item>
  </el-form>
</template>
<script>
export default {
  name: 'PageSearch',
  props: {
    searchItems: {
      type: Array,
    },
    inline: {
      type: Boolean,
    },
    customButtons: {
      type: Array,
    },
    labelWidth: {
      type: Number,
      default: 100
    },
    itemWidth: {
      type: Number,
      default: 240,
    },
    size: {
      type: String,
      default: 'small'
    },
  },
  data() {
    return {
      queryParams: {
        pageNum: 1,
        pageSize: 10,
      },
    };
  },
  methods: {
    handleSearch() {
      this.queryParams.pageNum = 1;
      this.$emit('search', this.queryParams);
    },
    resetQuery() {
      this.$refs.queryForm.resetFields();
    },
  }
};
</script>
