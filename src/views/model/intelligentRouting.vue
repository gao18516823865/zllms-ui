<template>
  <div class="app-container">
    <el-form ref="queryForm" inline label-width="68px">
      <el-form-item label=" ">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="list">
      <el-table-column label="企业编号" align="center" prop="comId" />
      <el-table-column label="智能路由类别" align="center" prop="autoType" :formatter="autoTypeFormat" />
      <el-table-column label="模型名称" align="center" prop="modelId" :formatter="modelIdFormat" />
      <el-table-column label="生效状态" align="center" prop="status" :formatter="statusFormat" />
      <el-table-column label="创建时间" align="center" prop="updateTime" :formatter="(row) => dateFormat(row.updateTime)" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
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
    <!-- 添加 or 更新 弹窗 -->
    <el-dialog title="添加" :visible.sync="addVisible" width="500px" append-to-body>
      <el-form ref="addForm" :model="addForm" :rules="addRules" label-width="80px">
        <el-row>
          <el-col :span="18">
            <el-form-item label="路由类别" prop="autoType">
              <el-select v-model="addForm.autoType" placeholder="请选择" :disabled="addForm.id">
                <el-option v-for="item in routeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="18">
            <el-form-item label="模型ID" prop="modelId">
              <el-select v-model="addForm.modelId" placeholder="请选择">
                <el-option v-for="item in modelOptions" :key="item.id" :label="item.modelName" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="18">
            <el-form-item label="生效状态" prop="status">
              <el-select v-model="addForm.status" placeholder="请选择">
                <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
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
import { autoChannelAdd, autoChannelDetail, autoChannelList, autoChannelUpdate, modelList } from '@/api/model/model';
export default {
  data() {
    return {
      loading: false,
      addVisible: false,
      title: '',
      addForm: {},
      addRules: {
        autoType: [{ required: true, message: '路由类别不能为空', trigger: 'blur' }],
        modelId: [{ required: true, message: '模型不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '生效状态不能为空', trigger: 'blur' }],
      },
      modelOptions: [],
      statusOptions: [
        {
          label: '无效',
          value: 0
        }, {
          label: '有效',
          value: 1
        }
      ],
      routeOptions: [
        {
          label: '简单问题',
          value: 0
        }, {
          label: '复杂问题',
          value: 1
        }, {
          label: '图生文',
          value: 2
        }, {
          label: '文生图',
          value: 3
        }
      ],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
      },
      list: [],
      total: 0,
    };
  },
  created() {
    this.getModelList();
    this.handleQuery();
  },
  methods: {
    handleQuery() {
      this.queryParams.page = 1;
      this.getList();
    },
    handleAdd() {
      this.reset();
      this.addVisible = true;
      this.title = '添加';
    },
    getList() {
      this.loading = true;
      autoChannelList().then(response => {
          this.list = response.rows;
          this.total = response.total;
          this.loading = false;
        });
    },
    submitForm() {
      this.$refs['addForm'].validate(valid => {
        if (valid) {
          if (this.addForm.id !== undefined) {
            autoChannelUpdate(this.addForm).then(response => {
              if (response.code === 200) {
                this.msgSuccess('修改成功');
                this.addVisible = false;
                this.handleQuery();
              }
            });
          } else {
            autoChannelAdd(this.addForm).then(response => {
              if (response.code === 200) {
                this.msgSuccess('添加成功');
                this.addVisible = false;
                this.handleQuery();
              }
            });
          }
        }
      });
    },
    // 取消按钮
    cancel() {
      this.addVisible = false;
      this.reset();
    },
    reset() {
      this.addForm = {
        id: undefined,
        autoType: undefined,
        modelId: undefined,
        status: undefined
      };
      this.resetForm('addForm');
    },
    handleUpdate(row) {
      this.reset();
      const autoId = row.id;
      autoChannelDetail({ autoId }).then(response => {
        this.addForm = response.data;
        this.addVisible = true;
        this.title = '修改';
      });
    },
    // 模型配置数据
    getModelList() {
      modelList().then(response => {
          this.modelOptions = response.rows;
        }
      );
    },
    autoTypeFormat(row) {
      return this.getOptionsLabel(this.routeOptions, row.autoType);
    },
    statusFormat(row) {
      return this.getOptionsLabel(this.statusOptions, row.status);
    },
    modelIdFormat(row) {
      const { modelId = '' } = row || {};
      const ops = this.modelOptions.map(item => ({ label: item.modelName, value: item.id }));
      return this.getOptionsLabel(ops, modelId);
    }
  }
};
</script>
