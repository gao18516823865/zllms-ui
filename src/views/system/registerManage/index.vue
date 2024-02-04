<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true">
      <el-form-item label="公司名称" prop="companyName">
        <el-input v-model="queryParams.companyName" placeholder="请输入公司名称" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="用户名称" prop="userName">
        <el-input v-model="queryParams.userName" placeholder="请输入用户名称" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="queryParams.phone" placeholder="请输入手机号" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择是否激活" clearable size="small">
          <el-option v-for="item in statusList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="dataList">
      <el-table-column label="公司名称" align="center" prop="companyName" show-overflow-tooltip />
      <el-table-column label="用户名称" align="center" prop="userName" />
      <el-table-column label="手机号" align="center" prop="phone" />
      <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <span>{{statusMap[scope.row.status]}}</span>
        </template>
      </el-table-column>
      <el-table-column label="失败原因" align="center" prop="failCause" show-overflow-tooltip />
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button v-if="scope.row.status === 2" size="mini" type="text" @click="handleCompensate(scope.row)">补偿</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />
  </div>
</template>
<script>
import { preregistrationList, compensate } from '@/api/system/preregistration';
export default {
  name: 'RegisterManage',
  data() {
    return {
      queryParams: {
        pageNum: 1,
        pageSize: 10,
      },
      loading: true,
      total: 0,
      dataList: [],
      statusMap: {
        0: '未处理',
        1: '处理成功',
        2: '处理失败'
      },
      // statusList: [
      //   {
      //     label: '未处理',
      //     value: 0,
      //   }, {
      //     label: '处理成功',
      //     value: 1,
      //   }, {
      //     label: '处理失败',
      //     value: 2,
      //   },
      // ],
    };
  },
  computed: {
    statusList() {
      return Object.entries(this.statusMap).map(([value, label]) => ({
        label,
        value: parseInt(value)
      }));
    }
  },
  created() {
    this.getList();
  },
  methods: {
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    // 重置
    resetQuery() {
      this.$refs.queryForm.resetFields();
      this.handleQuery();
    },
    getList() {
      this.loading = true;
      preregistrationList(this.queryParams).then(response => {
        this.dataList = response.rows;
        this.total = response.total;
        this.loading = false;
        console.log(response, 'response');
      });
    },
    handleCompensate(item) {
      const { id } = item;
      compensate({ id }).then(res => {
        const { code = 0, msg = '' } = res;
        if (code === 200) {
          this.$message.success(msg);
          return;
        }
        this.$message.error(msg || '系统出现错误');
      });
    }
  },
};
</script>
