<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true">
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
      <el-table-column label="模型编号" align="center" prop="id" width="100" />
      <el-table-column label="模型名称" align="center" prop="modelName" :show-overflow-tooltip="true" />
      <el-table-column label="模型描述" align="center" prop="modelDes" :show-overflow-tooltip="true" />
      <el-table-column label="模型logo" align="center" prop="modelLogo" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <img :src="scope.row.modelLogo" width="45">
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
      <el-table-column label="操作" align="center">
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
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="20">
            <el-form-item label="模型名称" prop="modelName">
              <el-input v-model="form.modelName" placeholder="请输入模型名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="20">
            <el-form-item label="模型公司" prop="modelCompany">
              <el-input v-model="form.modelCompany" placeholder="请输入模型所属公司" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="20">
            <el-form-item label="模型标签" prop="modelTag">
              <el-input v-model="form.modelTag" placeholder="请输入模型标签,多个以','分隔" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="20">
            <template>
              <el-form-item label="模型logo" prop="modelLogo">
                <el-upload
                  class="avatar-uploader"
                  :show-file-list="false"
                  :http-request="requestUpload"
                  :before-upload="beforeUpload"
                  action=""
                  accept=".jpg,.jpeg,.png,.gif"
                >
                  <img v-if="form.modelLogo" :src="form.modelLogo" class="avatar">
                  <i v-else class="el-icon-plus avatar-uploader-icon" />
                </el-upload>
              </el-form-item>
            </template>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="20">
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
import {
  getModelInfo,
  addModelInfo,
  updateModelInfo,
  modelInfoStatus,
  modelInfoList
} from '@/api/model/model';
import '@riophae/vue-treeselect/dist/vue-treeselect.css';

export default {
  name: 'ModelInfo',
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
      fileInfo: null,
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
        modelName: undefined,
        isFilterStatus: false,
      },
      // 表单校验
      rules: {
        modelName: [{ required: true, message: '模型名称不能为空', trigger: 'blur' }],
        modelDes: [{ required: true, message: '模型描述不能为空', trigger: 'blur' }],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询用户列表 */
    getList() {
      this.loading = true;
      modelInfoList(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
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
        id: null,
        modelName: null,
        modelCode: null,
        modelLogo: null,
        modelDes: null,
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
      getModelInfo(id).then(response => {
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
          return modelInfoStatus(row.id);
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
          const formData = new FormData();
          formData.append('file', this.fileInfo);
          this.form.modelLogo = null;
          this.form.createTime = null;
          this.form.updateTime = null;
          formData.append('modelInfo', JSON.stringify(this.form));
          if (this.form.id !== null) {
            updateModelInfo(formData).then(response => {
              if (response.code === 200) {
                this.msgSuccess('修改成功');
                this.open = false;
                this.getList();
                this.fileInfo = null;
              }
            });
          } else {
            addModelInfo(formData).then(response => {
              if (response.code === 200) {
                this.msgSuccess('新增成功');
                this.open = false;
                this.getList();
                this.fileInfo = null;
              }
            });
          }
        }
      });
    },

    // 覆盖默认的上传行为
    requestUpload() {},
    // 上传预处理
    beforeUpload(file) {
      console.log('beforeAvatarUpload');
      // const isJPG = file.type === 'image/jpeg';
      const isLt2M = file.size / 1024 / 1024 < 2;

      // if (!isJPG) {
      //   this.$message.error('上传头像图片只能是 JPG 格式!');
      // }
      if (!isLt2M) {
        this.$message.error('上传模型图片大小不能超过 2MB!');
        return false;
      }
      // return isJPG && isLt2M;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.form.modelLogo = reader.result;
      };
      this.fileInfo = file;
      return true;
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
