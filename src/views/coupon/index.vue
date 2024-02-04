<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true">
      <el-form-item label="兑换码" prop="redeemCode">
        <el-input v-model="queryParams.redeemCode" placeholder="请输入兑换码" clearable size="small" style="width: 240px" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="归属渠道" prop="userId">
        <el-select v-model="queryParams.userId" placeholder="请选择归属渠道" clearable size="small" style="width: 240px">
          <el-option v-for="item in channelOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="兑换状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择归属渠道" clearable size="small" style="width: 240px">
          <el-option v-for="item in redemptionOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="批次号" prop="batchId">
        <el-input v-model="queryParams.batchId" placeholder="请输入批次号" clearable size="small" style="width: 240px" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button v-if="superAdminFlag === 1" type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">入库</el-button>
        <el-button v-if="superAdminFlag === 1" type="primary" icon="el-icon-plus" size="mini" @click="handleTransfer">划拨</el-button>
        <el-button type="warning" icon="el-icon-download" size="mini" @click="downLoadCoupon">导出</el-button>
      </el-col>
    </el-row>
    <el-table v-loading="loading" :data="roleList" @selection-change="rolelSelect">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="批次号" prop="batchId" />
      <el-table-column label="流水号" prop="serialNumber" />
      <el-table-column label="兑换码" prop="redeemCode" />
      <!-- <el-table-column label="兑换码类型" prop="redeemType">
        <template slot-scope="scope">
          <span>{{parseStatus(redeemTypeOption,scope.row.redeemType)}}</span>
        </template>
      </el-table-column> -->
      <el-table-column label="归属渠道" prop="salesChannelName" />
      <el-table-column label="兑换状态" prop="redeemStatus">
        <template slot-scope="scope">
          <span>{{parseStatus(redemptionOptions,scope.row.redeemStatus)}}</span>
        </template>
      </el-table-column>
      <el-table-column label="兑换时间" prop="redeemTime" />
      <el-table-column label="兑换公司" prop="comName" />
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />
    <!-- 优惠券新增 -->
    <el-dialog title="入库" :visible.sync="addVisible" :rules="addRules" width="500px" append-to-body :show-close="false">
      <el-form ref="dialogFormAdd" :model="dialogFormAdd" label-width="100px" :rules="addRules">
        <el-form-item label="优惠码个数" prop="codeCount">
          <el-input v-model="dialogFormAdd.codeCount" placeholder="请输入优惠码个数" />
        </el-form-item>
        <!-- <el-form-item label="兑换码类型" prop="redeemType">
          <el-select v-model="dialogFormAdd.redeemType" placeholder="请选择归属渠道" clearable size="small" style="width: 100%">
            <el-option v-for="item in redeemTypeOption" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item> -->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="addSubmitForm">确 定</el-button>
        <el-button @click="addCancel">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 优惠券划拨 -->
    <el-dialog title="划拨" :visible.sync="visible" width="500px" append-to-body :show-close="false">
      <el-form ref="dialogForm" :model="dialogForm" :rules="rules" label-width="100px">
        <template v-if="roleIds.length == 0">
          <el-form-item label="批次号" prop="batchId">
            <el-select v-model="dialogForm.batchId" placeholder="请选择归属渠道" clearable style="width: 100%;" @change="changeBatchFn">
              <el-option v-for="item in batchIdList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="batchIdSelectString" label=" ">
            <span>{{batchIdSelectString}}</span>
          </el-form-item>
          <el-form-item label="优惠码个数" prop="codeCount">
            <el-input v-model="dialogForm.codeCount" placeholder="请输入优惠码个数" />
          </el-form-item>
        </template>
        <el-form-item label="归属渠道" prop="userId">
          <el-select v-model="dialogForm.userId" placeholder="请选择归属渠道" clearable style="width: 100%;">
            <el-option v-for="item in channelOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
import { batchCreate, getUserList, redeemCodeList, downLoadAppUserTemplate, transfer, getAllBatchId, getBatchInfo, getRedeemType } from '@/api/coupon/coupon';
export default {
  name: 'Coupon',
  data() {
    return {
      // 弹框boo
      visible: false,
      // 搜索form
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        redeemCode: '',
        userId: '',
        status: '',
        batchId: ''
      },
      // 兑换op
      redemptionOptions: [
        {
          label: '已兑换',
          value: 0,
        }, {
          label: '未兑换',
          value: 1,
        }
      ],
      // 渠道op
      channelOptions: [],
      // 弹框form
      dialogForm: {
        codeCount: '',
        userId: '',
        batchId: '',
      },
      // 遮罩层
      loading: true,
      // 表格数据
      roleList: [],
      // 总条数
      total: 0,
      // 表单校验
      rules: {
        batchId: [{ required: true, message: '批次号不能为空', trigger: 'blur' }],
        codeCount: [{ required: true, message: '优惠码个数不能为空', trigger: 'blur' }],
        userId: [{ required: true, message: '归属渠道不能为空', trigger: 'blur' }],
      },
      roleIds: [],
      addVisible: false,
      dialogFormAdd: {},
      addRules: {
        codeCount: [{ required: true, message: '优惠码个数为空', trigger: 'blur' }],
      },
      batchIdList: [],
      batchIdSelectString: '',
      batchIdSelect: {},
      redeemTypeOption: [],
    };
  },
  computed: {
    ...mapGetters(['superAdminFlag']),
  },
  created() {
    this.getList();
    this.getChannel();
    this.getRedeemTypeOption();
  },
  methods: {
    getChannel() {
      getUserList().then(res => {
        const { code = 0, data = [] } = res;
        if (code === 200) {
          this.channelOptions = data.map(item => {
            return {
              ...item,
              value: item.userId,
              label: item.nickName
            };
          });
        }
      });
    },
    // 查询列表
    getList() {
      this.loading = true;
      redeemCodeList(this.queryParams).then(res => {
        this.roleList = res.rows;
        this.total = res.total;
        this.loading = false;
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm');
      this.handleQuery();
    },
    // 划拨
    handleTransfer() {
      this.visible = true;
      this.getAllBatchIdFn();
    },
    // 划拨提交
    submitForm() {
      this.$refs['dialogForm'].validate(valid => {
        if (valid) {
          const { not } = this.batchIdSelect;
          if (this.dialogForm.codeCount > not) {
            this.$message.error('划拨个数超过剩余个数');
            return;
          }
          transfer({ ...this.dialogForm, codeIds: this.roleIds }).then(res => {
            const { code, msg } = res;
            if (code === 200) {
              this.$message.success(msg);
              this.cancel();
              this.getList();
            }
          });
        }
      });
    },
    cancel() {
      this.visible = false;
      this.batchIdSelectString = '';
      this.reset();
    },
    // 重置
    reset() {
      this.dialogForm = {
        codeCount: undefined,
        userId: undefined
      };
      this.dialogFormAdd = {};
      this.resetForm('dialogForm');
    },
    // 处理兑换op Label
    parseStatus(op, state) {
      const { label } = op.find(item => item.value === state) || '';
      return label || '';
    },
    // 下载
    downLoadCoupon() {
      const { status = '' } = this.queryParams;
      downLoadAppUserTemplate({ status }).then(res => {
        const { code = 0, msg } = res;
        if (code === 200) {
          window.open(msg);
        }
      });
    },
    // 多选框
    rolelSelect(selection) {
      this.roleIds = selection.map(item => item.id);
    },
    addCancel() {
      this.addVisible = false;
      this.reset();
    },
    handleAdd() {
      this.addVisible = true;
    },
    addSubmitForm() {
      this.$refs['dialogFormAdd'].validate(valid => {
        if (valid) {
          batchCreate(this.dialogFormAdd).then(res => {
            const { code, msg } = res;
            if (code === 200) {
              this.$message.success(msg);
              this.addCancel();
              this.getList();
            }
          });
        }
      });
    },
    getAllBatchIdFn() {
      getAllBatchId().then(res => {
        this.batchIdList = res.data.map(item => {
          return {
            label: item,
            value: item,
          };
        });
      });
    },
    changeBatchFn(value) {
      if (!value) {
        this.batchIdSelectString = '';
        return;
      }
      getBatchInfo({
        batchId: value
      }).then(res => {
        let str = '兑换码 ';
        if (res.data.redeemType) {
          str += `类型:${this.parseStatus(this.redeemTypeOption, res.data.redeemType)},`;
        }
        str += `总量:${res.data.all},剩余:${res.data.not}`;
        this.batchIdSelectString = str;
        this.batchIdSelect = res.data;
      });
    },
    getRedeemTypeOption() {
      getRedeemType().then(res => {
        const { code, data } = res;
        if (code === 200) {
          const op = Object.entries(data).map(([value, label]) => ({
            label,
            value: value
          }));
          this.redeemTypeOption = op;
        }
      });
    }
  }
};
</script>

