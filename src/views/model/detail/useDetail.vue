<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true">
      <el-form-item v-if="superAdminFlag === 1" label="企业名称" prop="comId">
        <el-select v-model="queryParams.comId" placeholder="请选择企业名称" clearable size="small" style="width: 240px">
          <el-option v-for="item in companyListOptions" :key="item.id" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="通道" prop="channelName">
        <el-input
          v-model="queryParams.channelName"
          placeholder="请输入通道"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="使用人" prop="user">
        <el-input
          v-model="queryParams.user"
          placeholder="请输入使用人"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="应用名称" prop="appName">
        <el-input
          v-model="queryParams.appName"
          placeholder="请输入应用名称"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="应用编码" prop="appCode">
        <el-input
          v-model="queryParams.appCode"
          placeholder="请输入应用编码"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
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
      <el-form-item label="消费总额">
        <span>{{moneyTotal}}</span>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="list" @selection-change="handleQuery">
      <template v-if="superAdminFlag === 1">
        <el-table-column label="企业名称" align="center" prop="comName" />
      </template>
      <el-table-column label="调用通道" align="center" prop="channelName" :show-overflow-tooltip="true" />
      <el-table-column label="应用名称" align="center" prop="appName" :show-overflow-tooltip="true" />
      <el-table-column label="应用编码" align="center" prop="appCode" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span>{{ scope.row.appCode === null ? '-' : scope.row.appCode }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="modelUnitPrice">
        <template slot="header">
          单价
          <el-tooltip class="item" effect="dark" content="单位：1k token，1token≈1个单词，1个汉字≈2个token" placement="top">
            <i class="el-icon-info" />
          </el-tooltip>
        </template>
        <template slot-scope="scope">
          <span>{{ ((scope.row.modelUnitPrice === null || scope.row.modelUnitPrice === 0) && (scope.row.modelOutUnitPrice === null || scope.row.modelOutUnitPrice === 0)) ? '免费' : ((scope.row.modelOutUnitPrice === null || scope.row.modelOutUnitPrice === 0) ? '￥'+scope.row.modelUnitPrice+'元' : ('￥'+scope.row.modelUnitPrice+'/'+scope.row.modelOutUnitPrice+'元')) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="调用量" align="center" prop="totalTokens" :show-overflow-tooltip="true">
        <template slot="header">
          调用量
          <el-tooltip class="item" effect="dark" content="单位：token，1token≈1个单词，1个汉字≈2个token" placement="top">
            <i class="el-icon-info" />
          </el-tooltip>
        </template>
        <template slot-scope="scope">
          <span>{{ scope.row.totalTokens === null ? '-' : ((scope.row.modelOutUnitPrice === null || scope.row.modelOutUnitPrice === 0) ? scope.row.totalTokens : (scope.row.promptTokens+'/'+scope.row.completionTokens))}}</span>
        </template>
      </el-table-column>
      <el-table-column label="消费金额" align="center" prop="costPrice" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span>{{(scope.row.costPrice === null || scope.row.costPrice === 0) ? '免费' : '￥'+scope.row.costPrice }}</span>
        </template>
      </el-table-column>
      <el-table-column label="使用人" align="center">
        <template slot-scope="scope">
          <span>{{scope.row.appUserName ? scope.row.appUserName : scope.row.appUserPhone }}</span>
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
import { modelDetailList, useDetailStatistic } from '@/api/model/model';
import { listCompany } from '@/api/system/company';
import { mapGetters } from 'vuex';
import '@riophae/vue-treeselect/dist/vue-treeselect.css';
import { formatCurrency } from '@/utils';

export default {
  name: 'Detail',
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
      // 日期范围
      dateRange: [],
      // 表单参数
      form: {},
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        channelName: undefined,
      },
      // 表单校验
      rules: {
      },
      companyListOptions: [],
      moneyTotal: ''
    };
  },
  computed: {
    ...mapGetters(['superAdminFlag']),
  },
  created() {
    this.getList();
    if (this.superAdminFlag === 1) {
      this.getAppList();
    }
  },
  methods: {
    /** 查询用户列表 */
    getList() {
      this.loading = true;
      const params = { ...this.queryParams, ...this.dateRange };
      if (parseFloat(params.user)) {
        params.appUserPhone = params.user;
      } else if (params.user) {
        params.appUserName = params.user;
      }
      modelDetailList(this.addDateRange(params)).then(response => {
          this.list = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
      this.getMoneyTotal(params);
    },
    getMoneyTotal(params) {
      useDetailStatistic(this.addDateRange(params)).then(res => {
        this.moneyTotal = formatCurrency(res.data);
      });
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
    getAppList() {
      listCompany().then(res => {
        this.companyListOptions = res.rows.map(item => {
          return {
            label: item.companyName,
            value: item.id
          };
        });
      });
    }
  }
};
</script>
