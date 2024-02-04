<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true">
      <el-form-item label="公司名" prop="companyName">
        <el-input v-model="queryParams.companyName" placeholder="请输入公司名" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="公司代码" prop="companyName">
        <el-input v-model="queryParams.comCode" placeholder="请输入公司代码" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <!-- <el-form-item label="有效截止时间" prop="activeTime">
        <el-date-picker v-model="queryParams.activeTime" clearable size="small" style="width: 200px" type="date" value-format="yyyy-MM-dd" placeholder="选择有效截止时间" />
      </el-form-item> -->
      <el-form-item label="是否激活" prop="activeFlag">
        <el-select v-model="queryParams.activeFlag" placeholder="请选择是否激活" clearable size="small">
          <el-option :key="0" label="否" :value="0" />
          <el-option :key="1" label="是" :value="1" />
        </el-select>
      </el-form-item>
      <el-form-item label="模板" prop="tempName">
        <el-input v-model="queryParams.tempName" placeholder="请输入模板名" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button v-hasPermi="['system:company:add']" type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['system:company:edit']" type="success" icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['system:company:remove']" type="danger" icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['system:company:export']" type="warning" icon="el-icon-download" size="mini" @click="handleExport">导出</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="companyList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="公司名" align="center" prop="companyName" min-width="150" />
      <el-table-column label="公司代码" align="center" prop="comCode" />
      <el-table-column label="电话" align="center" prop="phone" />
      <el-table-column label="注册时间" align="center" prop="createTime" min-width="120" />

      <el-table-column label="是否激活" align="center" prop="activeFlag" :formatter="activeFlagFormat" />
      <el-table-column label="权限模板" align="center" prop="tempName" />
      <el-table-column label="认证状态" align="center" prop="certificationStatus">
        <template slot-scope="scope">
          <span v-if="scope.row.certificationStatus === 0">{{ certificationStatusInfo(scope.row)}}</span>
          <span v-if="scope.row.certificationStatus != 0" class="link-type" style="text-decoration:underline;"><a v-hasPermi="['system:company:audit']" href="#" @click="auditBtn(scope.row)">{{ certificationStatusInfo(scope.row)}}</a></span>
        </template>
      </el-table-column>
      <el-table-column label="所属销售" align="center" prop="salesChannelName" />
      <el-table-column label="操作" align="center" min-width="120">
        <template slot-scope="scope">
          <el-button v-hasPermi="['system:company:edit']" size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button size="mini" type="text" @click="handleAdmin(scope.row)">查看管理员</el-button>
          <el-button size="mini" type="text" @click="handleEnterpriseChannel(scope.row)">分配通道</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改公司信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="公司名" prop="companyName">
          <el-input v-model="form.companyName" placeholder="请输入公司名" />
        </el-form-item>
        <el-form-item label="地址" prop="regionCodes">
          <RegionSelect v-model="form.regionCodes" />
        </el-form-item>
        <el-form-item label="" prop="address">
          <el-input v-model="form.address" type="textarea" placeholder="请输入详细地址" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" placeholder="默认为管理员账号的电话" />
        </el-form-item>
        <!-- <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item> -->
        <!-- <el-form-item label="有效截止时间" prop="activeTime">
          <el-date-picker v-model="form.activeTime" clearable size="small" style="width: 200px" type="date" value-format="yyyy-MM-dd" placeholder="选择有效截止时间" />
        </el-form-item> -->
        <el-form-item label="是否激活">
          <el-radio-group v-model="form.activeFlag">
            <el-radio :key="1" :label="1">激活</el-radio>
            <el-radio :key="0" :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="权限模板" prop="tempId">
          <el-select v-model="form.tempId" filterable placeholder="请选择模板">
            <el-option v-for="item in templateList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 审核对话框 -->
    <el-dialog :title="title" :visible.sync="open_audit" width="400px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules_audit" label-width="80px">
        <el-row>
          <el-form-item label="营业执照" prop="companyName">
            <img :src="form.businessLicense" width="95" @click="handlePictureCardPreview(form.businessLicense)">
            <!--            <span class="el-upload-list__item-actions">
              <span class="el-upload-list__item-preview" @click="handlePictureCardPreview(file)">
                <i class="el-icon-zoom-in"></i>
              </span>
            </span>-->
          </el-form-item>
        </el-row>
        <el-row v-if="form.certificationStatus != 5">
          <el-form-item label="拒绝原因" prop="certificationFailCause">
            <el-input v-model="form.certificationFailCause" type="textarea" placeholder="请输入拒绝原因" />
          </el-form-item>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button v-if="form.certificationStatus === 1" type="primary" @click="auditBusinessLicense(form.id, 5)">审核通过</el-button>
        <el-button v-if="form.certificationStatus === 1" style="color: #FFFFFF;background-color: #ff4949;" @click="auditBusinessLicense(form.id, 4)">审核拒绝</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt="">
    </el-dialog>
    <!-- 查看管理员 -->
    <el-dialog title="查看管理员" :visible.sync="visibleAdmin" width="500px" append-to-body>
      <el-table v-loading="adminLoading" border :data="adminList">
        <el-table-column label="联系电话" align="center" prop="userName" :show-overflow-tooltip="true" />
        <el-table-column label="姓名" align="center" prop="nickName" :show-overflow-tooltip="true" />
        <el-table-column label="创建时间" align="center" prop="createTime" width="160">
          <template slot-scope="scope">
            <span>{{scope.row.createTime}}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" min-width="120">
          <template slot-scope="scope">
            <el-button size="mini" type="text" @click="modifyAdmin(scope.row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
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
    <!-- 修改管理员 -->
    <el-dialog title="修改管理员" :visible.sync="modifyAdminBoolean" width="500px" append-to-body>
      <el-form ref="modifyAdminRef" :model="modifyAdminForm" :rules="modifyAdmin_rules" label-width="80px">
        <el-row>
          <el-form-item label="联系电话" prop="userName">
            <el-input v-model="modifyAdminForm.userName" placeholder="请输入联系电话" />
          </el-form-item>
        </el-row>
        <el-row>
          <el-form-item label="姓名" prop="nickName">
            <el-input v-model="modifyAdminForm.nickName" placeholder="请输入姓名" />
          </el-form-item>
        </el-row>
      </el-form>
      <div slot="footer">
        <el-button type="primary" @click="modifyAdminSubmit">确 定</el-button>
        <el-button @click="modifyAdminCancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listCompany,
  getCompany,
  delCompany,
  addCompany,
  updateCompany,
  exportCompany,
  listAllTemps,
  auditBusinessLicense,
  getCompanyAdmins,
  userAdminUpdateUser
} from '@/api/system/company';
import { queryCropChannelList, assignCorpChannel } from '@/api/model/model';
import RegionSelect from '../../components/RegionSelect';

export default {
  name: 'Company',
  components: { RegionSelect },
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
      // 公司信息表格数据
      companyList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 是否显示弹出层-审核
      open_audit: false,
      // 所有权限模板
      templateList: [],
      // 是否激活字典
      activeFlagOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        companyName: undefined,
        comCode: undefined,
        activeTime: undefined,
        activeFlag: undefined,
        tempName: undefined,
      },
      // 表单参数
      form: {
        activeFlag: 1,
      },
      dialogImageUrl: '',
      dialogVisible: false,
      disabled: false,
      // 表单校验
      rules: {
        phone: [
          { required: true, message: '手机号不能为空', trigger: 'blur' },
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: '请输入正确的手机号码',
            trigger: 'blur',
          },
        ],

        companyName: [{ required: true, message: '公司名不能为空', trigger: 'blur' }],
        email: [{ required: true, message: '邮箱不能为空', trigger: 'blur' }],
        tempId: [{ required: true, message: '权限模板不能为空', trigger: 'blur' }],
        activeTime: [{ required: true, message: '有效截止时间不能为空', trigger: 'blur' }],
      },
      openAdmin: false,
      visibleAdmin: false,
      adminData: {},
      adminLoading: false,
      adminList: [],
      rules_audit: [],
      visibleEnterpriseChannel: false,
      enterpriseChannelLoading: false,
      enterpriseChannelList: [],
      enterpriseChannelId: '',
      enterpriseChannelIds: [], // 选中的数组
      modifyAdminBoolean: false,
      modifyAdminForm: {},
      modifyAdmin_rules: {
        phonenumber: [{ required: true, message: '联系电话不能为空', trigger: 'blur' }],
        nickName: [{ required: true, message: '姓名不能为空', trigger: 'blur' }],
      }
    };
  },
  created() {
    this.getList();
    this.getDicts('sys_flag').then(response => {
      this.activeFlagOptions = response.data;
    });
  },
  methods: {
    /** 查询公司信息列表 */
    getList() {
      this.loading = true;
      listCompany(this.queryParams).then(response => {
        this.companyList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 是否激活字典翻译
    activeFlagFormat(row, column) {
      let show = '';
      if (row.activeFlag === 0) {
        show = '否';
      } else if (row.activeFlag === 1) {
        show = '是';
      }
      return show;
      // return this.selectDictLabel(this.activeFlagOptions, row.activeFlag);
    },
    // 认证状态：0.待提交，1.待审核，2.审核中，3.审核驳回，4.拒绝审核，5.审核通过
    certificationStatusInfo(row) {
      let show = '';
      if (row.certificationStatus === 0) {
        show = '待提交';
      } else if (row.certificationStatus === 1) {
        show = '待审核';
      } else if (row.certificationStatus === 2) {
        show = '审核中';
      } else if (row.certificationStatus === 3) {
        show = '审核驳回';
      } else if (row.certificationStatus === 4) {
        show = '拒绝审核';
      } else if (row.certificationStatus === 5) {
        show = '审核通过';
      }
      return show;
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
        companyName: undefined,
        address: undefined,
        phone: undefined,
        email: undefined,
        createTime: undefined,
        activeTime: undefined,
        activeFlag: '0',
        tempId: undefined,
      };
      this.resetForm('form');
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
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      // 新增时默认公司为激活状态
      this.form.activeFlag = 1;
      this.open = true;
      this.title = '添加公司信息';
      this.initTemplates();
    },

    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getCompany(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = '修改公司信息';
        this.initTemplates();
      });
    },

    /** 审核按钮操作 */
    auditBtn(row) {
      this.reset();
      this.title = '营业执照审核';
      this.form.id = row.id;
      this.form.businessLicense = row.businessLicense;
      // this.form.certificationFailCause = row.certificationFailCause;
      this.form.certificationStatus = row.certificationStatus;
      this.$set(this.form, 'certificationFailCause', row.certificationFailCause);
      this.open_audit = true;
    },

    initTemplates() {
      // 查询所有可选模板
      listAllTemps().then(response => {
        this.templateList = response.rows;
      });
    },

    /** 提交按钮 */
    submitForm: function () {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id !== undefined) {
            updateCompany(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('修改成功');
                this.open = false;
                this.getList();
              }
            });
          } else {
            addCompany(this.form).then(response => {
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
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm('是否确认删除公司信息编号为"' + ids + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(function () {
          return delCompany(ids);
        })
        .then(() => {
          this.getList();
          this.msgSuccess('删除成功');
        })
        .catch(function () {});
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有公司信息数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(function () {
          return exportCompany(queryParams);
        })
        .then(response => {
          this.download(response.msg);
        })
        .catch(function () {});
    },
    /** 审核营业执照 *****/
    auditBusinessLicense(id, status) {
      this.form.id = id;
      this.form.activeFlag = null;
      this.form.certificationStatus = status;
      // 3.审核驳回，4.拒绝审核，5.审核通过
      var msgInfo = status === 5 ? '审核通过' : '拒绝审核';
      if ((status === 3 || status === 4) && this.form.certificationFailCause === undefined) {
        this.$message.error('拒绝审核必须输入拒绝原因');
        return;
      }
      this.$refs['form'].validate(valid => {
        if (valid) {
          auditBusinessLicense(this.form).then(response => {
            if (response.code === 200) {
              this.msgSuccess(msgInfo + '操作已完成');
              this.open_audit = false;
              this.getList();
            } else {
              this.$message.error(response.msg);
            }
          });
        }
      });
    },
    handlePictureCardPreview(businessLicense) {
      this.dialogImageUrl = businessLicense;
      this.dialogVisible = true;
    },
    // 查看管理员
    handleAdmin(row) {
      const { id } = row;
      this.visibleAdmin = true;
      this.adminLoading = true;
      getCompanyAdmins({ comId: id }).then(res => {
        console.log(row, '===sstate', res);
        this.adminLoading = false;
        const { data = [] } = res;
        this.adminList = data;
      });
    },
    // 分配企业通道
    handleEnterpriseChannel(row) {
      this.visibleEnterpriseChannel = true;
      this.getEnterpriseChannelList(row);
    },
    // 分配企业通道List
    getEnterpriseChannelList(row) {
      const { id } = row;
      this.enterpriseChannelId = id;
      this.enterpriseChannelLoading = true;
      queryCropChannelList({
        comId: id
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

        console.log(res, '===res');
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
      assignCorpChannel({
        comId: this.enterpriseChannelId,
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
    },
    // 修改管理员
    modifyAdmin(row) {
      this.modifyAdminBoolean = true;
      this.modifyAdminForm = row;
    },
    modifyAdminCancel() {
      this.modifyAdminBoolean = false;
      this.$refs['modifyAdminRef'].resetFields();
    },
    modifyAdminSubmit() {
      this.$refs.modifyAdminRef.validate((valid) => {
        if (valid) {
          userAdminUpdateUser(this.modifyAdminForm).then(res => {
            const { code = 0, msg = '' } = res;
            if (code === 200) {
              this.$message.success(msg);
              this.modifyAdminCancel();
              this.visibleAdmin = false;
              this.handleQuery();
              return;
            }
            this.$message.error(msg);
          });
        }
    });
    }
  },
};
</script>
