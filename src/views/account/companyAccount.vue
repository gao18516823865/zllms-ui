<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true">
      <template v-if="superAdminFlag===1">
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
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        </el-form-item>
      </template>
    </el-form>
    <el-table v-loading="loading" :data="list" @selection-change="handleQuery">
      <template v-if="superAdminFlag===1">
        <el-table-column label="企业名称" align="center" prop="companyName" :show-overflow-tooltip="true" />
      </template>
      <el-table-column label="账户余额" align="center" prop="balance" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span>{{ (scope.row.balance == null) ? '-' : '￥'+scope.row.balance }}</span>
        </template>
      </el-table-column>
      <el-table-column label="服务费率" align="center" prop="platformFeeRatio" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span>{{ (scope.row.platformFeeRatio == null) ? '-' : scope.row.platformFeeRatio+'%' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center">
        <template slot-scope="scope">
          <span>{{ (scope.row.status == 0) ? '停用' : '启用' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="日期" align="center" prop="createTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <router-link :to="'/account/bill/' + scope.row.comId" class="link-type">
            <el-button size="mini" type="text" icon="el-icon-tickets">历史账单</el-button>
          </router-link>
          <el-button v-hasPermi="['account:recharge:edit']" size="mini" type="text" icon="el-icon-s-unfold" @click="rechargeBtn(scope.row)">充值</el-button>
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
    <!-- 充值记录对话框 -->
    <el-dialog :title="recharge_title" :visible.sync="recharge_open" width="500px" append-to-body>
      <el-form ref="rechargeForm" :model="rechargeForm" :rules="recharge_rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="企业名称" prop="companyName">
              <span>{{ rechargeForm.companyName}}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="充值金额" prop="amount">
              <el-input v-model="rechargeForm.amount" placeholder="请输入充值金额" style="width: 200px;" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitRechargeForm">确 定</el-button>
        <el-button @click="cancelRecharge">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  companyAccountList, companyRecharge
} from '@/api/account/account';
import { mapGetters } from 'vuex';
import '@riophae/vue-treeselect/dist/vue-treeselect.css';

export default {
  name: 'CompanyAccount',
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
      // 弹出层标题
      recharge_title: '',
      // 是否显示弹出层
      recharge_open: false,
      // 表单参数
      rechargeForm: {
      },
      recharge_rules: {
        amount: [{ required: true, message: '充值金额不能为空', trigger: 'blur' }],
      },
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
      companyAccountList(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
          this.list = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
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
    // 充值取消按钮
    cancelRecharge() {
      this.recharge_open = false;
      this.rechargeForm = {};
    },
    /** 充值操作 */
    rechargeBtn(obj) {
      this.recharge_open = true;
      this.recharge_title = '企业充值';
      this.rechargeForm.comId = obj.comId;
      this.rechargeForm.companyName = obj.companyName;
    },
    /** 充值提交 */
    submitRechargeForm() {
      var reg = new RegExp(/^[0.01-9]\d*(\.\d{1,2})?$/);
      this.$refs['rechargeForm'].validate(valid => {
        if (valid) {
          if (!reg.test(this.rechargeForm.amount) || parseFloat(this.rechargeForm.amount) <= 0) {
            this.$message.error('充值金额必须大于0,且小数点最多保留两位');
            return false;
          }
          companyRecharge(this.rechargeForm).then(response => {
            if (response.code === 200) {
              this.msgSuccess('充值完成');
              this.recharge_open = false;
              this.getList();
              this.rechargeForm = {};
            } else {
              this.$message.error(response.msg);
              return false;
            }
          });
        }
      });
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
