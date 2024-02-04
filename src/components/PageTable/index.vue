<template>
  <div>
    <el-table v-loading="loading" :data="dataList" @selection-change="selectionChange">
      <template v-if="selection">
        <el-table-column type="selection" :width="selectionWidth" />
      </template>
      <el-table-column v-for="(item,index) in columns" :key="index" :label="item.label" :prop="item.prop" v-bind="item">
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
        <el-table-column :label="handle.title">
          <el-button v-for="(item,index) in handle.handleList" :key="index" type="text" v-bind="item">{{item.label}}</el-button>
        </el-table-column>
      </template>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />
  </div>
</template>
<script>
export default {
  name: 'PageTable',
  props: {
    handle: {
      type: Array,
      default: null
    },
    columns: {
      type: Array,
    },
    selection: {
      type: Boolean,
      default: false
    },
    selectionWidth: {
      type: Number,
      default: 50
    },
  },
  methods: {
    getList() {

    },
    renderItem(prop, row) {
      if (prop) {
        return prop && row[prop];
      }
    }
  }
};
</script>
