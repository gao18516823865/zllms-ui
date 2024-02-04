<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true">
      <template v-if="superAdminFlag === 1">
        <el-form-item label="企业名称" prop="companyName">
          <el-input
            v-model="queryParams.companyName"
            placeholder="请输入企业名称"
            clearable
            size="small"
            style="width: 240px"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
      </template>
      <el-form-item label="支付状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="支付状态" clearable size="small" style="width: 150px">
          <el-option v-for="dict in payStatus" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="list" @selection-change="handleQuery">
      <el-table-column label="流水号" align="center" prop="serialNumber" min-width="100" />
      <template v-if="superAdminFlag === 1">
        <el-table-column label="企业名称" align="center" prop="companyName" :show-overflow-tooltip="true" />
      </template>
      <el-table-column label="金额" align="center" prop="amount" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span>{{ (scope.row.amount == null) ? '-' : '￥'+scope.row.amount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="支付状态" align="center" prop="detailType">
        <template slot-scope="scope">
          <span>{{ payStatusResult(scope.row.status)}}</span>
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center">
        <template slot-scope="scope">
          <span>{{ (scope.row.type == 0) ? '线下' : '线上' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="日期" align="center" prop="createTime" width="160">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { rechargeList } from '@/api/account/account';
import { mapGetters } from 'vuex';
import '@riophae/vue-treeselect/dist/vue-treeselect.css';

export default {
  name: 'AccountRecharge',
  components: { },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 表格数据
      list: null,
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 日期范围
      dateRange: [],
      // 模型数据
      modelOptions: [],
      // 表单参数
      form: {
      },
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        companyName: undefined,
      },
      // 表单校验
      rules: {
      },
      // 状态：0.待处理，1.支付中，1.支付成功，2.支付失败
      payStatus: [{
        dictValue: 0,
        dictLabel: '待处理',
      }, {
        dictValue: 1,
        dictLabel: '支付中',
      }, {
        dictValue: 2,
        dictLabel: '支付成功',
      }, {
        dictValue: 3,
        dictLabel: '支付失败',
      }],
    };
  },
  computed: {
    ...mapGetters(['superAdminFlag']),
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询用户列表 */
    getList() {
      this.loading = true;
      rechargeList(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
          this.list = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
    },
    // 状态：0.待处理，1.支付中，1.支付成功，2.支付失败
    payStatusResult(type) {
      let show = '';
      if (type === 0) {
        show = '待处理';
      } else if (type === 1) {
        show = '支付中';
      } else if (type === 2) {
        show = '支付成功';
      } else if (type === 3) {
        show = '支付失败';
      }
      return show;
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
      },
      this.resetForm('form');
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.page = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm('queryForm');
      this.handleQuery();
    },
  },
};
</script>
<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
