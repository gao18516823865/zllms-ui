<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="通道名称" prop="channelName">
        <el-input
          v-model="queryParams.channelName"
          placeholder="通道名称"
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
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button v-hasPermi="['model:add']" type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button>
      </el-col>
    </el-row>
    <el-table v-loading="loading" :data="list" @selection-change="handleQuery">
      <el-table-column label="通道编号" align="center" prop="id" />
      <el-table-column label="通道名称" align="center" prop="channelName" :show-overflow-tooltip="true" />
      <el-table-column label="通道code" align="center" prop="channelCode" :show-overflow-tooltip="true" />
      <el-table-column label="通道类型" align="center" prop="channelType" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span>{{ (scope.row.channelType == 0) ? '系统' : '私有' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="是否默认" align="center" prop="isDefault" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span>{{ (scope.row.isDefault == 0) ? '否' : '是' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center">
        <template slot-scope="scope">
          <el-switch :value="scope.row.status+''" active-value="1" inactive-value="0" @change="handleStatusChange(scope.row)" />
        </template>
        <!--        <template slot-scope="scope">
          <span>{{ (scope.row.status == 0) ? '停用' : '启用' }}</span>
        </template>-->
      </el-table-column>
      <el-table-column label="日期" align="center" prop="createTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-hasPermi="['channel:edit']" size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
        </template>
        <template slot-scope="scope">
          <el-button v-if="scope.row.status === 1" v-hasPermi="['channel:assign']" size="mini" type="text" icon="el-icon-edit" @click="handleAssign(scope.row)">批量分配</el-button>
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
    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="18">
            <el-form-item label="通道名称" prop="channelName">
              <el-input v-model="form.channelName" placeholder="请输入通道名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="18">
            <el-form-item label="通道code" prop="channelCode">
              <el-input v-model="form.channelCode" placeholder="请输入通道code" type="text" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-form-item label="模型" prop="modelIds">
            <el-select v-model="form.modelIds" multiple placeholder="请选择">
              <el-option v-for="item in modelOptions" :key="item.id" :label="item.modelName" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="是否私有">
              <el-radio-group v-model="form.channelType">
                <el-radio v-for="dict in channelTypes" :key="dict.dictValue" :label="dict.dictValue">{{ dict.dictLabel }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="是否默认">
              <el-radio-group v-model="form.isDefault">
                <el-radio v-for="dict in isDefaults" :key="dict.dictValue" :label="dict.dictValue" disabled>{{ dict.dictLabel }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <!--        <el-row>-->
        <!--          <el-col :span="12">-->
        <!--            <el-form-item label="状态">-->
        <!--              <el-radio-group v-model="form.status">-->
        <!--                <el-radio v-for="dict in statusOptions" :key="dict.dictValue" :label="dict.dictValue">{{ dict.dictLabel }}</el-radio>-->
        <!--              </el-radio-group>-->
        <!--            </el-form-item>-->
        <!--          </el-col>-->
        <!--        </el-row>-->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { channelList, modelList, getChannelInfo, addChannel, updateChannel, channelStatus, batchAssignCorpChannel } from '@/api/model/model';
import '@riophae/vue-treeselect/dist/vue-treeselect.css';

export default {
  name: 'Model',
  components: {},
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
        channelName: [{ required: true, message: '模型名称不能为空', trigger: 'blur' }],
        modelIds: [{ required: true, message: '模型不能为空', trigger: 'blur' }],
      }
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
    modelList().then(response => {
        this.modelOptions = response.rows;
      }
    );
  },
  methods: {
    /** 查询用户列表 */
    getList() {
      this.loading = true;
      channelList(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
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
        id: undefined,
        channelName: undefined,
        channelCode: undefined,
        channelType: 0,
        isDefault: 0,
        status: 1,
        modelIds: undefined,
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
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = '新增模型';
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getChannelInfo(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = '修改模型';
      });
    },
    /** 分配按钮操作 */
    handleAssign(row) {
      this.$confirm('确认要将"' + row.channelName + '"分配给所有企业吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(function () {
        return batchAssignCorpChannel({ channelId: row.id, });
      }).then(() => {
        this.msgSuccess('分配成功');
      });
    },
    /** 用户状态修改 */
    handleStatusChange(row) {
      const text = row.status === 1 ? '停用' : '启用';
      this.$confirm('确认要"' + text + '""' + row.channelName + '"吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(function () {
        return channelStatus(row.id);
      }).then(() => {
        this.msgSuccess(text + '成功');
        row.status = row.status === 0 ? 1 : 0;
      }).catch(function () {
        row.status = row.status === 0 ? 1 : 0;
      });
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id !== undefined) {
            updateChannel(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('修改成功');
                this.open = false;
                this.getList();
              }
            });
          } else {
            addChannel(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('新增成功');
                this.open = false;
                this.getList();
              }
            });
          }
        }
      });
    },
  },
};
</script>
