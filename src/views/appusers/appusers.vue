<template>
  <div class="app-container">
    <el-form ref="showAppQueryForm" :model="showAppQueryParams" :inline="true" label-width="100px">
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="showAppQueryParams.email" placeholder="邮箱" clearable size="small" style="width: 240px" @keyup.enter.native="showAppHandleQuery" />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="showAppQueryParams.phone" placeholder="手机号" clearable size="small" style="width: 240px" @keyup.enter.native="showAppHandleQuery" />
      </el-form-item>
      <el-form-item label="用户名" prop="userName">
        <el-input v-model="showAppQueryParams.userName" placeholder="用户名" clearable size="small" style="width: 240px" @keyup.enter.native="showAppHandleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="showAppQueryParams.status" placeholder="请选择用户状态" clearable size="small" style="width: 240px">
          <el-option v-for="item in redemptionOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="superAdminFlag === 1" label="归属企业" prop="companyName">
        <el-select v-model="showAppQueryParams.comId" placeholder="请选择归属企业" clearable size="small" style="width: 240px">
          <el-option v-for="item in companyListOptions" :key="item.id" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="showAppHandleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="showAppResetQuery">重置</el-button>
        <el-button type="primary" icon="el-icon-upload" size="mini" @click="clickOpenImport()">导入用户</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="showAppLoading" :data="showAppList">
      <el-table-column label="用户名" align="center" prop="userName" />
      <el-table-column label="手机号" align="center" prop="phone" />
      <el-table-column label="邮箱" align="center" prop="email" />
      <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <span>{{ parseStatus(scope.row.status) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" min-width="100" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" @click="editShowApp(scope.row)">编辑</el-button>
          <el-popconfirm
            :title="`确定${scope.row.status === 0 ? '启用' : scope.row.status === 1 ? '停用' : null}吗`"
            @confirm="disibledShowApp(scope.row)"
          >
            <el-button slot="reference" size="mini" type="text">{{ scope.row.status === 0 ? '启用' : scope.row.status === 1 ? '停用' : null }}</el-button>
          </el-popconfirm>
          <el-popconfirm title="确定删除吗？" @confirm="delShowApp(scope.row)">
            <el-button slot="reference" size="mini" type="text">删除</el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="showAppTotal>0" :total="showAppTotal" :page.sync="showAppQueryParams.pageNum" :limit.sync="showAppQueryParams.pageSize" @pagination="getShowAppList" />
    <!-- 编辑应用-列表 -->
    <el-dialog title="编辑用户列表" :visible.sync="showAppEditVisible" append-to-body width="600px">
      <el-form ref="showAppEdit" :model="showAppEditParams" label-width="100px">
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="showAppEditParams.userName" placeholder="用户名" clearable size="small" style="width: 240px" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="showAppEditParams.phone" placeholder="手机号" clearable size="small" style="width: 240px" maxlength="11" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="showAppEditParams.email" placeholder="邮箱" clearable size="small" style="width: 240px" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="showAppEditParams.status" placeholder="请选择用户状态" clearable size="small" style="width: 240px">
            <el-option v-for="item in redemptionOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showAppEditCancel">取消</el-button>
        <el-button type="primary" @click="showAppEditConform">确认</el-button>
      </div>
    </el-dialog>
    <!-- 导入应用用户或下载导入模板对话框 -->
    <el-dialog title="导入用户" :visible.sync="showImport" width="600px" append-to-body>
      <el-form ref="form" :model="form" label-width="80px">
        <el-row>
          <el-col :span="12">
            <template>
              <el-form-item label=" ">
                <el-upload drag multiple accept=".xls,.xlsx" :http-request="httpRequest" action="">
                  <i class="el-icon-upload" />
                  <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                  <div slot="tip" class="el-upload__tip">只能上传xls,xlsx文件</div>
                </el-upload>
              </el-form-item>
            </template>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="waring" @click="downLoadAppUserTemplateHandle">下载模板</el-button>
        <el-button @click="cancleImport">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { listCompany } from '@/api/system/company';
import { queryAppUserDetail, updateAppUser, queryAppUserList, importAppUser } from '@/api/appcenter/app';
import device from '@/mixin/device';
import axios from 'axios';
export default {
  name: 'Appusers',
  mixins: [device],
  data() {
    return {
      // 查询参数
      showAppQueryParams: {
        pageNum: 1,
        pageSize: 10,
      },
      companyListOptions: [],
      // 用户列表编辑
      showAppEditVisible: false,
      showAppEditParams: {},
      showAppTotal: 0,
      showAppList: [],
      redemptionOptions: [
        {
          label: '停用',
          value: 0,
        },
        {
          label: '启用',
          value: 1,
        },
      ],
      showImport: false,
      form: {},
    };
  },
  created() {
    this.getShowAppList();
  },
  methods: {
    // 用户列表
    getShowAppList() {
      this.showAppLoading = true;
      queryAppUserList(this.showAppQueryParams).then(response => {
        this.showAppLoading = false;
        this.showAppList = response.rows;
        this.showAppTotal = response.total;
      });
      if (this.superAdminFlag !== 1) return;
      // 归属企业
      listCompany().then(res => {
        this.companyListOptions = res.rows.map(item => {
          return {
            label: item.companyName,
            value: item.id
          };
        });
      });
    },
    // 查询
    showAppHandleQuery() {
      this.showAppQueryParams.pageNum = 1;
      this.getShowAppList();
    },
    // 清空条件
    showAppResetQuery() {
      this.$refs['showAppQueryForm'].resetFields();
      this.showAppQueryParams = {
        pageNum: 1,
        pageSize: 10,
      };
      this.getShowAppList();
    },
    parseStatus(state) {
      console.log(state, 'state');
      const { label = '' } = this.redemptionOptions.find(item => item.value === state) || {};
      return label;
    },
    editShowApp(item) {
      const { id } = item;
      this.showAppEditVisible = true;
      queryAppUserDetail({
        appUserId: id,
      }).then(res => {
        console.log(res, '===res');
        this.showAppEditParams = res.data;
      });
    },
    showAppEditCancel() {
      this.showAppEditVisible = false;
      this.$refs['showAppEdit'].resetFields();
    },
    showAppEditConform() {
      updateAppUser(this.showAppEditParams).then(res => {
        const { code = 0, msg = '' } = res;
        if (code === 200) {
          this.$message.success(msg);
          this.showAppEditCancel();
          this.getShowAppList();
        }
      });
    },
    showAppCancel(done) {
      this.showAppQueryParams = {};
      done();
    },
    /** 取消应用用户导入 */
    cancleImport() {
      this.showImport = false;
      this.$refs.form.resetFields();
    },
    httpRequest(info) {
      const formData = new FormData();
      formData.append(info.filename, info.file);
      importAppUser(formData).then(res => {
        const { msg, code } = res;
        if (code === 200) {
          this.$message.success(msg);
          this.showImport = false;
        }
      });
    },
    /** 下载应用用户导入模板 */
    downLoadAppUserTemplateHandle() {
      axios.get(process.env.VUE_APP_BASE_API + '/ac/downLoadAppUserTemplate', { responseType: 'blob' }).then(response => {
        const filename = decodeURIComponent(response.headers['content-disposition'].split('filename=')[1]);
        const blobs = new Blob([response.data], {
          type: 'application/vnd.ms-excel',
        });
        const objectUrl = URL.createObjectURL(blobs);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.setAttribute('download', filename);
        link.click();
        URL.revokeObjectURL(objectUrl);
      });
    },
    /** 点击开启导入弹框 */
    clickOpenImport(info) {
      this.showImport = true;
    },
    // 启用 or 停用
    disibledShowApp(row) {
      const { status, id } = row;
      const resetStatus = status === 0 ? 1 : status === 1 ? 0 : '';
      updateAppUser({ status: resetStatus, id }).then(res => {
        const { code = 0, msg = '' } = res;
        if (code === 200) {
          this.$message.success(msg);
          this.getShowAppList();
          return;
        }
        this.$message.error(msg);
      });
    },
    // 删除
    delShowApp(row) {
       const { id } = row;
       updateAppUser({
        status: 2,
        id
       }).then(res => {
        const { code = 0, msg = '' } = res;
        if (code === 200) {
          this.$message.success(msg);
          this.getShowAppList();
          return;
        }
        this.$message.error(msg);
       });
    }
  }
};
</script>
