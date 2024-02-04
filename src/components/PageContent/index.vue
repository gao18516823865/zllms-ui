<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="inline" :label-width="`${labelWidth}px`" :size="size">
      <template v-for="(item,index) in formatSearchItems">
        <el-form-item v-if="item.type === 'input'" :key="index" :label="item.label" :prop="item.key">
          <el-input v-model="queryParams[item.key]" :style="`width:${itemWidth}px`" :placeholder="'请输入'+item.label" clearable />
        </el-form-item>
        <el-form-item v-if="item.type === 'select'" :key="index" :label="item.label" :prop="item.key">
          <el-select v-model="queryParams[item.key]" :style="`width:${itemWidth}px`" :placeholder="'请选择'+item.label" clearable>
            <el-option v-for="ops in item.options" :key="ops.value" :label="ops.label" :value="ops.value" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="item.type === 'date'" :key="index" :label="item.label" :prop="item.key">
          <el-date-picker v-model="queryParams[item.key]" :style="`width:${itemWidth}px`" type="date" v-bind="item" @change="(v) => datePicker(item.key,item.type,v)" />
        </el-form-item>
        <el-form-item v-if="item.type === 'daterange'" :key="index" :label="item.label" :prop="item.key">
          <el-date-picker v-model="queryParams[item.key]" :style="`width:${itemWidth}px`" type="daterange" v-bind="item" @change="(v) => datePicker(item.key,item.type,v)" />
        </el-form-item>
        <el-form-item v-if="item.type === 'monthrange'" :key="index" :label="item.label" :prop="item.key">
          <el-date-picker v-model="queryParams[item.key]" :style="`width:${itemWidth}px`" type="monthrange" v-bind="item" @change="(v) => datePicker(item.key,item.type,v)" />
        </el-form-item>
      </template>
      <el-form-item v-if="searchItems.length>0">
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        <template v-if="customButtons.length>0">
          <el-button v-for="(item,index) in customButtons" :key="index" v-bind="item" @click="item.onClick">{{item.label}}</el-button>
        </template>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="dataList" @selection-change="selectionChange">
      <template v-if="selection">
        <el-table-column type="selection" :width="selectionWidth" :align="columnsAlign" />
      </template>
      <el-table-column v-for="(item,index) in columns_" :key="index" :label="item.label" :prop="item.prop" v-bind="item" :align="columnsAlign">
        <template slot-scope="scope">
          <template v-if="(typeof item.render === 'function')">
            {{item.render(scope)}}
          </template>
          <template v-else>
            {{renderItem(item.prop,scope.row)}}
          </template>
        </template>
      </el-table-column>
      <template v-if="handle">
        <el-table-column :label="handle.title" :align="columnsAlign">
          <template slot-scope="scope">
            <el-button v-for="(item,index) in handle.handleList" :key="index" type="text" v-bind="item" @click="item.onClick(scope)">{{item.label}}</el-button>
          </template>
        </el-table-column>
      </template>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />
  </div>
</template>
<script>
import request from '@/utils/request';
// import PageHeader from '@/components/PageHeader';
import moment from 'moment';
export default {
  name: 'PageContent',
  props: {
    searchItems: {
      type: Array,
      default: () => []
    },
    inline: {
      type: Boolean,
       default: true,
    },
    customButtons: {
      type: Array,
      default: () => []
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
    columns: {
      type: Array,
      default: () => []
    },
    fetchMethod: {
      type: String,
      default: 'get'
    },
    fetchUrl: {
      type: String,
      required: true
    },
    selection: {
      type: Boolean,
      default: false
    },
    selectionWidth: {
      type: Number,
      default: 50
    },
    selectionChange: {
      type: Function,
      default: () => {}
    },
    columnsAlign: {
      type: String,
      default: 'center'
    }
  },
  data() {
    return {
      queryParams: {
        pageNum: 1,
        pageSize: 10,
      },
      loading: true,
      total: 0,
      dataList: [],
      columns_: [],
      handle: null,
    };
  },
  computed: {
    formatSearchItems() {
      const searchs = this.searchItems;
      return searchs.map(item => {
      if (item.type === 'select') {
        const defOption = item.options.find(item => item.default);
        const obj = {
          ...item,
          options: [
            ...item.options,
          ]
        };
        if (!defOption) {
          obj.options = [
            {
              label: '全部',
              value: ''
            },
            ...obj.options,
          ];
        }
        return obj;
      } else if (item.type === 'daterange') {
        const defParams = {
          startPlaceholder: '开始日期',
          endPlaceholder: '结束日期',
          rangeSeparator: '-',
        };
        return {
          ...defParams,
          ...item,
          key: item.key.join('-'),
        };
      } else if (item.type === 'monthrange') {
        const defParams = {
          startPlaceholder: '开始日期',
          endPlaceholder: '结束日期',
          rangeSeparator: '-',
        };
        return {
          ...defParams,
          ...item,
          key: item.key.join('-'),
        };
      } else if (item.type === 'date') {
        const defParams = {
          placeholder: '请选择日期'
        };
        return {
          ...defParams,
          ...item,
        };
      } else {
        return {
          ...item,
          type: 'input'
        };
      }
    });
    }
  },
  created() {
    this.getList();
    this.columns_ = this.columns.filter(item => item.type !== 'handle');
    const handle = this.columns.find(item => item.type === 'handle');
    if (handle) {
      this.handle = handle;
    }
  },
  methods: {
    extractPxValues(css) {
      // const pattern = /(\d+(?:\.\d+)?)(px)?/g;
      // let match;
      // while ((match = pattern.exec(css))) {
      //   const value = match[1];
      //   const unit = match[2] || 'px';
      //   // if (!unit || unit !== 'px') {
      //     const newValue = value + 'px';
      //     css = css.replace(match[0], newValue);
      //   // }
      // }
      // console.log(css, 'css');
      // return css;
    },
    getList() {
      const keys = {};
      this.formatSearchItems.forEach(item => {
        if (item.type === 'daterange' || item.type === 'monthrange' || item.type === 'date') {
          keys[item.key] = item.key;
        }
      });
      let params = {};
      const cloneQueryParams = JSON.parse(JSON.stringify(this.queryParams));
      for (const key in keys) {
        delete cloneQueryParams[key];
      }
      if (this.fetchMethod === 'get') {
        params = {
          params: cloneQueryParams
        };
      }
      if (this.fetchMethod === 'post') {
        params = {
          data: cloneQueryParams
        };
      }
      this.loading = true;
      request({
        url: this.fetchUrl,
        method: this.fetchMethod,
        ...params
      }).then(response => {
        this.dataList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    resetQuery() {
      this.$refs.queryForm.resetFields();
      this.getList();
    },
    renderItem(prop, row) {
      if (prop) {
        return prop && row[prop];
      }
    },
    datePicker(key, type, v) {
      const [firstKey, lastKey] = key.split('-');
      const [firstValue, lastValue] = v;
      const cloneQueryParams = JSON.parse(JSON.stringify(this.queryParams));
      if (key === 'date') {
        cloneQueryParams[key] = moment(firstValue).format('YYYY-MM-DD');
      } else if (type === 'daterange' || type === 'monthrange') {
        cloneQueryParams[firstKey] = moment(firstValue).format('YYYY-MM-DD');
        cloneQueryParams[lastKey] = moment(lastValue).format('YYYY-MM-DD');
      }
      this.queryParams = cloneQueryParams;
    }
  }
};
</script>
<style>

</style>
