<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true">
      <el-form-item label="应用名称" prop="appName">
        <el-input
          v-model="queryParams.appName"
          placeholder="应用名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="所属公司" prop="companyName">
        <el-input
          v-model="queryParams.companyName"
          placeholder="所属公司"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="时间">
        <el-date-picker
          v-model="dateRange"
          size="small"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="list" @selection-change="handleQuery">
      <el-table-column label="应用名称" align="center" prop="appName" :show-overflow-tooltip="true" />
      <el-table-column label="应用编码（App Code）" align="center" prop="appCode" :show-overflow-tooltip="true" />
      <el-table-column label="应用秘钥（App Secret）" align="center" prop="appSecret" :show-overflow-tooltip="true" />
      <el-table-column label="归属公司" align="center" prop="companyName" :show-overflow-tooltip="true" />
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" @click="handleUpdate(scope.row)">查看</el-button>
          <el-popconfirm title="确定删除吗？" @confirm="onAppDeleteAction(scope.row)">
            <el-button slot="reference" size="small" type="text">删除</el-button>
          </el-popconfirm>
          <el-button size="mini" type="text" @click="handleEnterpriseChannel(scope.row)">分配通道</el-button>
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
    <!-- 查看 -->
    <el-dialog append-to-body :visible.sync="visible" class="app-info-dialog">
      <div>
        <div class="app-info-tips-text">请妥善保管您的App Id和App Secret，防止泄露。</div>
        <div class="app-info-text"><span class="app-info-tips-text">App Id：</span>{{ appCode }}</div>
        <div class="app-info-text"><span class="app-info-tips-text">App Secret：</span>{{ appSecret }}</div>
      </div>
      <p class="app-info-tips-text">该应用可用的通道</p>
      <div class="app-info-content">
        <div v-for="(item,index) in modelChannelsList" :key="index">
          {{item.channelName}}
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="ok">知道了</el-button>
      </div>
    </el-dialog>
    <!-- 分配通道 toggleRowExpansion-->
    <el-dialog title="分配通道" :visible.sync="visibleEnterpriseChannel" width="500px" append-to-body>
      <el-table ref="enterpriseChannel" v-loading="enterpriseChannelLoading" border :data="enterpriseChannelList" @selection-change="enterpriseChannelSelect">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="通道名称" align="center" prop="channelName" :show-overflow-tooltip="true" />
        <el-table-column label="通道code" align="center" prop="channelCode" :show-overflow-tooltip="true" />
        <el-table-column label="通道类型" align="center" prop="channelType" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span>{{ (scope.row.channelType == 0) ? '系统' : '私有' }}</span>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="enterpriseChannelUpDate">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { appListsUrl, findcorpAppById, updateCorpAppUrl, queryAppChannelList, assignAppChannel } from '@/api/model/model';

export default {
  name: 'Model',
  components: {
   },
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
      // 状态数据字典
      statusOptions: [],
      // 通道类型
      channelTypes: [],
      // 是否默认
      isDefaults: [],
      // 模型数据
      modelOptions: [],
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
        modelName: undefined,
      },
      // 表单校验
      rules: {
        // channelName: [{ required: true, message: '模型名称不能为空', trigger: 'blur' }],
        // modelIds: [{ required: true, message: '模型不能为空', trigger: 'blur' }],
      },
      visible: false,
      appCode: '',
      appSecret: '',
      visibleEnterpriseChannel: false,
      enterpriseChannelLoading: false,
      enterpriseChannelList: [],
      enterpriseChannelId: '',
      enterpriseChannelIds: [], // 选中的数组
      modelChannelsLoading: false,
      modelChannelsList: [],
    };
  },
  created() {
    this.getList();
    // 状态
    this.getDicts('sys_normal_disable').then(response => {
      this.statusOptions = response.data;
    });
    // 类型值
    this.channelTypes = [{
      dictValue: 0,
      dictLabel: '系统',
    }, {
      dictValue: 1,
      dictLabel: '私有',
    }];
    // 默认值
    this.isDefaults = [{
      dictValue: 0,
      dictLabel: '否',
    }, {
      dictValue: 1,
      dictLabel: '是',
    }];
    // 模型配置数据
    // modelList().then(response => {
    //     this.modelOptions = response.rows;
    //   }
    // );
  },
  methods: {
    /** 查询用户列表 */
    getList() {
      this.loading = true;
      appListsUrl(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
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
    /** 新增按钮操作 */
    // handleAdd() {
    //   this.reset();
    //   this.open = true;
    //   this.title = '新增模型';
    // },
    /** 查看按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id;
      this.modelChannelsLoading = true;
      findcorpAppById({ id }).then(response => {
        console.log(response, '===');
        const { code = 0, msg = '', data = {}} = response;
        if (code === 200) {
          this.appCode = data.appCode,
          this.appSecret = data.appSecret;
          console.log(data.appCode, 'data.appCode');
          this.visible = true;
          this.modelChannelsList = data.modelChannels;
          this.modelChannelsLoading = false;
        } else {
          this.$message.error(msg || '系统出现错误');
        }
      });
    },
    ok() {
      this.visible = false;
    },
    // 删除应用
    onAppDeleteAction(record) {
      updateCorpAppUrl({ id: record.id, state: 0 }).then(response => {
        console.log('createCorpAppUrl response ===', response);
        const { code = 0, msg = '' } = response;
        this.loading = false;
        if (code === 200) {
          this.$message({
            message: msg,
            type: 'success',
          });
          this.getList();
        } else {
          this.$message.error(msg || '系统出现错误');
        }
      });
    },
    // 用户状态修改
    // handleStatusChange(row) {
    //   const text = row.status === 1 ? '停用' : '启用';
    //   this.$confirm('确认要"' + text + '""' + row.channelName + '"吗?', '警告', {
    //     confirmButtonText: '确定',
    //     cancelButtonText: '取消',
    //     type: 'warning',
    //   }).then(function () {
    //       return channelStatus(row.id);
    //     }).then(() => {
    //       this.msgSuccess(text + '成功');
    //       row.status = row.status === 0 ? 1 : 0;
    //     }).catch(function () {
    //       row.status = row.status === 0 ? 1 : 0;
    //     });
    // },
    /** 提交按钮 */
    // submitForm: function () {
    //   this.$refs['form'].validate(valid => {
    //     if (valid) {
    //       if (this.form.id !== undefined) {
    //         updateChannel(this.form).then(response => {
    //           if (response.code === 200) {
    //             this.msgSuccess('修改成功');
    //             this.open = false;
    //             this.getList();
    //           }
    //         });
    //       } else {
    //         addChannel(this.form).then(response => {
    //           if (response.code === 200) {
    //             this.msgSuccess('新增成功');
    //             this.open = false;
    //             this.getList();
    //           }
    //         });
    //       }
    //     }
    //   });
    // },
    // 分配企业通道
    handleEnterpriseChannel(row) {
      this.visibleEnterpriseChannel = true;
      this.getQueryAppChannelList(row);
    },
    // 分配企业通道List
    getQueryAppChannelList(row) {
      const { comId, id } = row;
      this.enterpriseChannelId = id;
      this.enterpriseChannelLoading = true;
      queryAppChannelList({
        comId,
        appId: id,
      }).then(res => {
        this.enterpriseChannelLoading = false;
        this.enterpriseChannelList = res.data;
        this.$nextTick(() => {
          // 在下一个Tick中重新执行的代码
          if (res.data.length > 0) {
            res.data.forEach(item => {
              if (item.assign) {
                this.$refs.enterpriseChannel.toggleRowSelection(item);
              }
            });
          }
        });
      });
    },
     // 选择
     enterpriseChannelSelect(selection) {
      this.enterpriseChannelIds = selection.map(item => item.id);
      console.log(selection.map(item => item.id), 'selection.map(item => item.id)', selection);
    },
    // 更新通道
    enterpriseChannelUpDate() {
      if (this.enterpriseChannelIds.length === 0) {
        this.$message.warning('请选择通道');
        return;
      }
      assignAppChannel({
        appId: this.enterpriseChannelId,
        channelIds: this.enterpriseChannelIds
      }).then(res => {
        console.log(res, 'assignCorpChannel');
        const { code = 0, msg = '' } = res;
        if (code === 200) {
          this.$message.success(msg);
          this.visibleEnterpriseChannel = false;
          return;
        }
        this.$message.error(msg);
      });
    }
  },
};
</script>
<style lang="scss">

.app-info-dialog{
  .app-info-tips-text {
    font-size: 14px;
    color: #666;
  }
  .app-info-text {
    font-size: 18px;
    color: #333;
    padding-top: 10px;
  }
  .modelChannelsModal{
    margin-top: 10px;
  }
  .app-info-content{
    margin-top: 10px;
    display: flex;
    flex-wrap: wrap;
    p{
      font-weight: bold;
    }
    div{
      margin-right: 20px;
      line-height: 30px;
    }
  }
}
</style>
