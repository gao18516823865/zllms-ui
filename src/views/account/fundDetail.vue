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
      <el-form-item label="明细类型" prop="detailType">
        <el-select v-model="queryParams.detailType" placeholder="明细类型" clearable size="small" style="width: 150px">
          <el-option v-for="dict in detailTypes" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item label="资金类型" prop="fundType">
        <el-select v-model="queryParams.fundType" placeholder="资金类型" clearable size="small" style="width: 100px">
          <el-option v-for="dict in fundTypes" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item label="时间">
        <el-date-picker
          v-model="dateRange"
          size="small"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>
      <el-form-item label="金额汇总">
        <span>{{moneyTotal}}</span>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="list" @selection-change="handleQuery">
      <!--      <el-table-column label="ID" align="center" prop="id" width="100" />-->
      <el-table-column label="流水号" align="center" prop="serialNumber" min-width="100" />
      <template v-if="superAdminFlag === 1">
        <el-table-column label="企业名称" align="center" prop="companyName" />
      </template>
      <el-table-column label="金额" align="center" prop="amount">
        <template slot-scope="scope">
          <span>{{ (scope.row.amount == null) ? '-' : '￥'+scope.row.amount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="余额" align="center" prop="balance">
        <template slot-scope="scope">
          <span>{{ (scope.row.balance == null) ? '-' : '￥'+scope.row.balance }}</span>
        </template>
      </el-table-column>
      <el-table-column label="明细类型" align="center" prop="detailType">
        <template slot-scope="scope">
          <span>{{ detailTypesResult(scope.row.detailType)}}</span>
        </template>
        <!--        <el-select v-model="list.detailType" clearable size="small" style="width: 240px">-->
        <!--          <el-option v-for="dict in detailTypes" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />-->
        <!--        </el-select>-->
      </el-table-column>
      <el-table-column label="资金类型" align="center">
        <template slot-scope="scope">
          <span>{{ (scope.row.fundType == 0) ? '入账' : '出账' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="日期" align="center" prop="createTime">
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
import { fundDetailList, fundStatistic } from '@/api/account/account';
import { mapGetters } from 'vuex';
import '@riophae/vue-treeselect/dist/vue-treeselect.css';
import { formatCurrency } from '@/utils';

export default {
  name: 'FundDtail',
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
      detailTypes: [{
        dictValue: 3,
        dictLabel: '账户激活',
      }, {
        dictValue: 5,
        dictLabel: '充值卡兑换',
      }, {
        dictValue: 1,
        dictLabel: '认证奖励',
      }, {
        dictValue: 0,
        dictLabel: '现金充值',
      }, {
        dictValue: 2,
        dictLabel: '服务费',
      }, {
        dictValue: 4,
        dictLabel: '消费',
      }],
      fundTypes: [{
        dictValue: 0,
        dictLabel: '入账',
      }, {
        dictValue: 1,
        dictLabel: '出账',
      }],
      moneyTotal: ''
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
      fundDetailList(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
          this.list = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
      this.getMoneyTotal();
    },
    detailTypesResult(type) {
      let show = '';
      if (type === 0) {
        show = '现金充值';
      } else if (type === 1) {
        show = '认证奖励';
      } else if (type === 2) {
        show = '服务费';
      } else if (type === 3) {
        show = '账户激活';
      } else if (type === 4) {
        show = '消费';
      } else if (type === 5) {
        show = '充值卡兑换';
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
    getMoneyTotal() {
      fundStatistic(this.addDateRange(this.queryParams, this.dateRange)).then(res => {
        this.moneyTotal = formatCurrency(res.data);
      });
    }
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
