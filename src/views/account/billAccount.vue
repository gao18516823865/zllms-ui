<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true">
      <template v-if="superAdminFlag===1">
        <el-form-item v-if="notAdminDisplay" label="企业名称" prop="companyName">
          <el-input v-model="queryParams.companyName" placeholder="请输入企业名称" disabled />
        </el-form-item>
        <el-form-item v-if="adminDisplay" label="企业名称" prop="companyName">
          <el-input v-model="queryParams.companyName" placeholder="请输入企业名称" />
        </el-form-item>
        <el-form-item v-if="adminDisplay">
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        </el-form-item>
      </template>
    </el-form>
    <el-table v-loading="loading" :data="list" @selection-change="handleQuery">
      <!--      <el-table-column label="ID" align="center" prop="id" width="100" />-->
      <template v-if="superAdminFlag===1">
        <el-table-column v-if="adminDisplay" label="企业名称" align="center" prop="companyName" min-width="150" />
      </template>
      <el-table-column label="日期" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.startTime+'至'+scope.row.endTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="消费金额" align="center" prop="useAmount" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span>{{ (scope.row.useAmount == null) ? '-' : '￥'+scope.row.useAmount+"元"}}</span>
        </template>
      </el-table-column>
      <el-table-column label="服务费率" align="center" prop="feeRatio" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span>{{ (scope.row.feeRatio == null) ? '-' : scope.row.feeRatio+"%" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="账单金额" align="center" prop="billAmount" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span>{{ (scope.row.billAmount == null) ? '-' : '￥'+scope.row.billAmount }}</span>
        </template>
      </el-table-column>
      <!--      <el-table-column label="状态" align="center" width="150">-->
      <!--        <template slot-scope="scope">-->
      <!--          <span>{{ (scope.row.deductStatus == 0) ? '未扣除' : '已扣除' }}</span>-->
      <!--        </template>-->
      <!--      </el-table-column>-->
      <el-table-column label="操作" align="center" width="150">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-tickets" @click="clickOpenShow(scope.row)">查看详情</el-button>
          <el-button v-if="scope.row.deductStatus == 0" size="mini" type="text" icon="el-icon-s-operation" @click="accountBillDeduct(scope.row)">扣款</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <el-dialog title="账单明细" :visible.sync="showVisible" width="900px" append-to-body>
      <el-form ref="showQueryForm" :model="showQueryForm" :inline="true" label-width="100px">
        <el-form-item label="企业名称" prop="companyName">
          <span>{{showQueryForm.companyName}}</span>
        </el-form-item>
        <el-form-item label="账单日期" prop="dateTime">
          <span>{{showQueryForm.dateTime}}</span>
        </el-form-item><br>
        <el-form-item label="消费金额" prop="useAmount">
          <span>{{'￥'+showQueryForm.useAmount + ((showQueryForm.usdCostPrice != null && showQueryForm.usdCostPrice > 0) ? ' / $'+showQueryForm.usdCostPrice :'')}}</span>
        </el-form-item>
        <el-form-item label="服务费率" prop="feeRatio">
          <span>{{showQueryForm.feeRatio+'%'}}</span>
        </el-form-item>
        <el-form-item label="总计" prop="billAmount">
          <span>{{'￥'+showQueryForm.billAmount}}</span>
        </el-form-item>
      </el-form>
      <el-table v-loading="showLoading" :data="showList">
        <el-table-column label="通道名称" align="center" prop="channelName" />
        <el-table-column align="center" prop="modelUnitPrice">
          <template slot="header">
            单价(元)
            <el-tooltip class="item" effect="dark" content="单位：1k token，1token≈1个单词，1个汉字≈2个token" placement="top">
              <i class="el-icon-info" />
            </el-tooltip>
          </template>
          <template slot-scope="scope">
            <span>{{ ((scope.row.promptUnitPrice === null || scope.row.promptUnitPrice === 0) && (scope.row.completionUnitPrice === null || scope.row.completionUnitPrice === 0)) ? '免费' : ((scope.row.completionUnitPrice === null || scope.row.completionUnitPrice === 0) ? '￥'+scope.row.promptUnitPrice+'元' : ('￥'+scope.row.promptUnitPrice+'/'+scope.row.completionUnitPrice+'元')) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="modelUnitPrice">
          <template slot="header">
            单价(美元)
            <el-tooltip class="item" effect="dark" content="单位：1k token，1token≈1个单词，1个汉字≈2个token" placement="top">
              <i class="el-icon-info" />
            </el-tooltip>
          </template>
          <template slot-scope="scope">
            <span>{{ ((scope.row.promptUsdUnitPrice === null || scope.row.promptUsdUnitPrice === 0) && (scope.row.completionUsdUnitPrice === null || scope.row.completionUsdUnitPrice === 0)) ? '-' : ((scope.row.completionUsdUnitPrice === null || scope.row.completionUsdUnitPrice === 0) ? '$'+scope.row.promptUsdUnitPrice : ('$'+scope.row.promptUsdUnitPrice+'/'+scope.row.completionUsdUnitPrice)) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="totalTokens">
          <template slot="header">
            消费量
            <el-tooltip class="item" effect="dark" content="单位：token，1token≈1个单词，1个汉字≈2个token" placement="top">
              <i class="el-icon-info" />
            </el-tooltip>
          </template>
          <template slot-scope="scope">
            <span>{{ scope.row.totalTokens === null ? '-' : ((scope.row.completionUnitPrice === null || scope.row.completionUnitPrice === 0) ? scope.row.totalTokens : (scope.row.promptTokens+'/'+scope.row.completionTokens))}}</span>
          </template>
        </el-table-column>
        <el-table-column label="金额(元)" align="center" prop="costPrice">
          <template slot-scope="scope">
            <span>{{ ((scope.row.costPrice === null || scope.row.costPrice === 0)) ? '免费' : '￥'+scope.row.costPrice }}</span>
          </template>
        </el-table-column>
        <el-table-column label="金额(美元)" align="center" prop="costPrice">
          <template slot-scope="scope">
            <span>{{ ((scope.row.usdCostPrice === null || scope.row.usdCostPrice === 0)) ? '-' : '$'+scope.row.usdCostPrice }}</span>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="showTotal > 0" :total="showTotal" :page.sync="showQueryForm.pageNum" :limit.sync="showQueryForm.pageSize" @pagination="getModelDetailList" />
    </el-dialog>
  </div>
</template>

<script>
import { billDeduct, billList } from '@/api/account/account';
import { getCompany } from '@/api/system/company';
import { modelSumList } from '@/api/model/model';
import moment from 'moment';
import { mapGetters } from 'vuex';
import '@riophae/vue-treeselect/dist/vue-treeselect.css';

export default {
  name: 'BillAccount',
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
      adminDisplay: false,
      notAdminDisplay: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        companyName: undefined,
      },
      // 表单校验
      rules: {
      },
      showVisible: false,
      showList: [],
      showLoading: true,
      // 查询参数
      showQueryForm: {
        companyName: '',
        useAmount: '',
        feeRatio: '',
        billAmount: '',
        dateTime: '',
        pageNum: 1,
        pageSize: 10,
      },
      showTotal: 0,
    };
  },
  computed: {
    ...mapGetters(['superAdminFlag']),
  },
  created() {
    const comId = this.$route.params && this.$route.params.comId;
    if (this.superAdminFlag === 1 && comId === undefined) {
      this.adminDisplay = true;
    }
    if (comId !== undefined) {
      this.queryParams.comId = comId;
      this.notAdminDisplay = true;
      this.getCompanyInfo(this.queryParams.comId);
    }
    this.getList();
  },
  methods: {
    getCompanyInfo(comId) {
      getCompany(comId).then(response => {
        this.queryParams.companyName = response.data.companyName;
      });
    },
    /** 查询用户列表 */
    getList() {
      this.loading = true;
      if (this.queryParams.startTime != null && this.queryParams.startTime !== undefined) {
        this.queryParams.startTime = moment(this.queryParams.startTime).format('YYYY-MM');
      }
      billList(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
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
    // 账单扣款
    accountBillDeduct(row) {
      this.$confirm('确认要扣款吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(function () {
        billDeduct(row.id).then(response => {
          if (response.code === 200) {
            this.msgSuccess('扣款成功');
            this.getList();
          } else {
            this.msgError(response.msg);
          }
        });
     });
    },
    // 查看使用明细
    clickOpenShow(row) {
      this.showVisible = true;
      this.showQueryForm = row;
      this.showQueryForm.companyName = this.queryParams.companyName === undefined ? row.companyName : this.queryParams.companyName;
      this.showQueryForm.feeRatio = row.feeRatio == null ? '-' : row.feeRatio;
      this.showQueryForm.dateTime = row.startTime + '至' + row.endTime;
      this.getModelDetailList();
    },
    getModelDetailList() {
      this.showLoading = true;
      this.dateRange = this.showQueryForm;
      this.dateRange.beginTime = moment(this.dateRange.startTime).format('YYYY-MM-DD 00:00:00');
      this.dateRange.endTime = moment(this.dateRange.endTime).format('YYYY-MM-DD 23:59:59');
      console.log(this.dateRange);
      modelSumList(this.dateRange).then(response => {
          this.showList = response.rows;
          this.showTotal = response.total;
          this.showLoading = false;
        }
      );
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
