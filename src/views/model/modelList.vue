<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="模型名称" prop="modelName">
        <el-input
          v-model="queryParams.modelName"
          placeholder="请输入模型名称"
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
      <el-table-column label="模型编号" align="center" prop="id" />
      <el-table-column label="模型名称" align="center" prop="modelName" :show-overflow-tooltip="true" />
      <el-table-column label="模型code" align="center" prop="modelCode" :show-overflow-tooltip="true" />
      <el-table-column align="center" prop="unitPrice">
        <template slot="header">
          单价
          <el-tooltip class="item" effect="dark" content="单位：1k token，1token≈1个单词，1个汉字≈2个token" placement="top">
            <i class="el-icon-info" />
          </el-tooltip>
        </template>
        <template slot-scope="scope">
          <span>{{ (scope.row.unitPrice === null || scope.row.unitPrice === 0) ? '免费' : ((scope.row.outUnitPrice === null || scope.row.outUnitPrice === 0) ? '￥'+scope.row.unitPrice+'元' : ('￥'+scope.row.unitPrice+'/'+scope.row.outUnitPrice+'元')) }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="promptUsdUnitPrice">
        <template slot="header">
          原价
          <el-tooltip class="item" effect="dark" content="单位：1k token，1token≈1个单词，1个汉字≈2个token" placement="top">
            <i class="el-icon-info" />
          </el-tooltip>
        </template>
        <template slot-scope="scope">
          <span>{{ (scope.row.promptUsdUnitPrice === null || scope.row.promptUsdUnitPrice === 0) ? '-' : ((scope.row.completionUsdUnitPrice === null || scope.row.completionUsdUnitPrice === 0) ? '$'+scope.row.promptUsdUnitPrice : ('$'+scope.row.promptUsdUnitPrice+'/'+scope.row.completionUsdUnitPrice)) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center">
        <template slot-scope="scope">
          <el-switch :value="scope.row.status+''" active-value="1" inactive-value="0" @change="handleStatusChange(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column label="模型描述" align="center" prop="modelDes" :show-overflow-tooltip="true" />
      <el-table-column label="日期" align="center" prop="createTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-hasPermi="['model:edit']" size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
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
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="模型名称" prop="modelName">
              <el-input v-model="form.modelName" placeholder="请输入模型名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模型code" prop="modelCode">
              <el-input v-model="form.modelCode" placeholder="请输入模型code" type="text" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="input单价" prop="unitPrice">
              <el-input v-model="form.unitPrice" placeholder="请输入问答单价" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="ouput单价" prop="outUnitPrice">
              <el-input v-model="form.outUnitPrice" placeholder="请输入回答单价" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="input原价" prop="promptUsdUnitPrice">
              <el-input v-model="form.promptUsdUnitPrice" placeholder="请输入问答美元单价" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="ouput原价" prop="completionUsdUnitPrice">
              <el-input v-model="form.completionUsdUnitPrice" placeholder="请输入回答美元单价" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="请求地址" prop="requestUrl">
              <el-input v-model="form.requestUrl" placeholder="请输入请求地址" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="模型信息" prop="modelInfoId">
              <el-select v-model="form.modelInfoId" placeholder="请选择">
                <el-option v-for="item in modelOptions" :key="item.id" :label="item.modelName" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="规格" prop="specs">
              <el-input v-model="form.specs" placeholder="请输入规格" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="描述" prop="modelDes">
              <el-input v-model="form.modelDes" type="textarea" placeholder="请输入描述" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { modelList, modelInfoListUrl, getModelConfigInfo, addModel, updateModel, modelStatus } from '@/api/model/model';
import '@riophae/vue-treeselect/dist/vue-treeselect.css';

export default {
  name: 'Model',
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
        isFilterStatus: false,
      },
      // 表单校验
      rules: {
        modelName: [{ required: true, message: '模型名称不能为空', trigger: 'blur' }],
        modelCode: [{ required: true, message: '模型code不能为空', trigger: 'blur' }],
        // requestUrl: [{ required: true, message: '请求地址不能为空', trigger: 'blur' }],
        // modelDes: [{ required: true, message: '模型描述不能为空', trigger: 'blur' }],
        modelInfoId: [{ required: true, message: '模型信息不能为空', trigger: 'blur' }],
      }
    };
  },
  created() {
    this.getList();
    // 模型配置数据
    modelInfoListUrl().then(response => {
        this.modelOptions = response.rows;
      }
    );
  },
  methods: {
    /** 查询用户列表 */
    getList() {
      this.loading = true;
      modelList(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
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
        modelName: undefined,
        modelCode: undefined,
        unitPrice: undefined,
        requestUrl: undefined,
        specs: undefined,
        modelDes: undefined,
        modelInfoId: undefined,
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
      getModelConfigInfo(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = '修改模型';
      });
    },

    // 用户状态修改
    handleStatusChange(row) {
      // console.log(row.id);
      const text = row.status === 1 ? '停用' : '启用';
      this.$confirm('确认要"' + text + '""' + row.modelName + '"吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(function () {
          return modelStatus(row.id);
        })
        .then(() => {
          this.msgSuccess(text + '成功');
          row.status = row.status === 0 ? 1 : 0;
        })
        .catch(function () {
          row.status = row.status === 0 ? 1 : 0;
        });
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id !== undefined) {
            updateModel(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('修改成功');
                this.open = false;
                this.getList();
              }
            });
          } else {
            addModel(this.form).then(response => {
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
