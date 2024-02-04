<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true">
      <el-form-item label="应用名称" prop="appName">
        <el-input v-model="queryParams.appName" placeholder="应用名称" clearable size="small" style="width: 240px" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="list" @selection-change="handleQuery">
      <el-table-column label="应用编号" align="center" prop="id" />
      <el-table-column label="应用名称" align="center" prop="appName" :show-overflow-tooltip="true" />
      <el-table-column label="应用描述" align="center" prop="appDesc" :show-overflow-tooltip="true" />
      <el-table-column label="应用类型" align="center" prop="appType" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span>{{ (scope.row.appType == 1) ? '平台应用' : '三方应用' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <span>{{ (scope.row.status == null) ? '未开通' : (scope.row.status == 1) ? '已开启' : '已关闭' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="上架时间" align="center" prop="createTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-if="scope.row.status == null" v-hasPermi="['app:openApp']" size="mini" type="text" icon="el-icon-open" @click="clickOpenApp(scope.row)">开启应用</el-button>
          <el-button v-if="scope.row.status !== null && scope.row.appTag === 'ZllmsCodingHelper'" size="mini" type="text" @click="downLoadZip(scope.row)">下载插件</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />
  </div>
</template>

<script>
import { platformAppList, openApp, getCodingZipDownloadPath } from '@/api/appcenter/app';
import '@riophae/vue-treeselect/dist/vue-treeselect.css';
import { mapGetters } from 'vuex';

export default {
  name: 'PlatformAppList',
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
      // 表单参数
      form: {},
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        appName: undefined,
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
      platformAppList(this.queryParams).then(response => {
        this.list = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      (this.form = {}), this.$refs['queryForm'].resetFields();
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.$refs['queryForm'].resetFields();
      this.handleQuery();
    },
    clickOpenApp(info) {
      openApp(info.id).then(res => {
        const { msg, code } = res;
        if (code === 200) {
          this.$message.success(msg);
          this.getList();
        }
      });
    },

    // 下载插件
    downLoadZip(row) {
      const { id } = row;
      getCodingZipDownloadPath({
        appInfoId: id
      }).then(res => {
        const { code = 0, data = '' } = res;
        if (code === 200) {
          const ele = document.createElement('a');
          ele.setAttribute('href', data);
          ele.click();
        }
      });
    }
  },
};
</script>
