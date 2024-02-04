<template>
  <el-container>
    <el-aside class="aside" width="200px">
      <template v-if="asideMap.platformList">
        <div v-for="(item,k) in asideMap.platformList" :key="k" class="aside-item">
          <el-avatar shape="square" size="small" :src="item.avatar" />
          <div class="aside-item_name" :style="selectCurrentItemId === item.id ? 'color:#1890ff': ''" @click="selectCurrentItem(item)">{{item.assistantName}}</div>
        </div>
      </template>
      <el-button type="text" @click="addDialogOpen">新增助手</el-button>
    </el-aside>
    <el-container class="container">
      <el-header height="100px" class="container-header">
        <template v-if="mainMap.cropAssistant">
          <el-row>
            <el-col :span="24">
              <div class="header-item">
                <el-avatar :src="mainMap.cropAssistant.avatar" class="header-item_avatar" />
                <div class="header-desc">
                  <div class="header-desc_name">
                    <div>
                      {{mainMap.cropAssistant.assistantName}}
                    </div>
                    <div class="header-desc_handle">
                      <div v-if="mainMap.cropAssistant.publishStatus === 1" class="header-desc_handle_action">
                        <el-tag type="success">{{renderOpLabel(releaseStateOptions,mainMap.cropAssistant.publishStatus)}}</el-tag>
                      </div>
                      <div v-if="mainMap.cropAssistant.publishStatus === 0 || mainMap.cropAssistant.publishStatus === 2" class="header-desc_handle_action">
                        <el-tag type="primary">{{renderOpLabel(releaseStateOptions,mainMap.cropAssistant.publishStatus)}}</el-tag>
                      </div>
                      <div class="header-desc_handle_action">
                        <el-button plain size="mini" type="primary" @click="getEnterpriseList">企业列表</el-button>
                      </div>
                      <div class="header-desc_handle_action">
                        <!-- 编辑 -->
                        <el-button size="mini" plain type="primary" @click="editPlatForm(mainMap.cropAssistant)">编辑</el-button>
                      </div>
                      <div v-if="mainMap.cropAssistant.publishStatus === 1" class="header-desc_handle_action">
                        <!-- 上架 -->
                        <el-popconfirm
                          :title="`确认下架该助手‘${mainMap.cropAssistant.assistantName}’吗？`"
                          @confirm="pushAside(mainMap.cropAssistant)"
                        >
                          <el-button slot="reference" plain type="primary" size="mini">下架</el-button>
                        </el-popconfirm>
                      </div>
                      <div v-if="mainMap.cropAssistant.publishStatus === 0 || mainMap.cropAssistant.publishStatus === 2" class="header-desc_handle_action">
                        <!-- 未发布 -->
                        <el-popconfirm
                          :title="`确认上架该助手‘${mainMap.cropAssistant.assistantName}’吗？`"
                          @confirm="pushAside(mainMap.cropAssistant)"
                        >
                          <el-button slot="reference" plain size="mini" type="primary">上架</el-button>
                        </el-popconfirm>
                      </div>
                      <div class="header-desc_handle_action">
                        <el-popconfirm
                          :title="`确认删除该助手‘${mainMap.cropAssistant.assistantName}’吗？`"
                          @confirm="deleteAside(mainMap.cropAssistant)"
                        >
                          <el-button slot="reference" plain size="mini" type="danger">删除</el-button>
                        </el-popconfirm>
                      </div>
                      <div v-if="mainMap.cropAssistant.defaultFlag === 0" class="header-desc_handle_action">
                        <!-- 设置默认 -->
                        <el-popconfirm
                          :title="`确认该助手‘${mainMap.cropAssistant.assistantName}’设置为默认吗？`"
                          @confirm="settingDefault(mainMap.cropAssistant)"
                        >
                          <el-button slot="reference" plain type="primary" size="mini">默认</el-button>
                        </el-popconfirm>
                      </div>
                      <div v-if="mainMap.cropAssistant.defaultFlag === 1" class="header-desc_handle_action">
                        <!-- 取消默认 -->
                        <el-popconfirm
                          :title="`确认该助手‘${mainMap.cropAssistant.assistantName}’取消默认吗？`"
                          @confirm="settingDefault(mainMap.cropAssistant)"
                        >
                          <el-button slot="reference" plain size="mini" type="primary">取消默认</el-button>
                        </el-popconfirm>
                      </div>
                    </div>
                  </div>
                  <div class="header-desc_desc">{{mainMap.cropAssistant.description}}</div>
                  <div v-if="mainMap.cropAssistant.publishTime" class="header-desc_time">发布时间：{{mainMap.cropAssistant.publishTime}}</div>
                </div>
              </div>
            </el-col>
          </el-row>
        </template>
      </el-header>
      <el-main>
        <el-row>
          <template v-if="mainMap && mainMap.assistantPromptList.length>0">
            <el-col v-for="(item,k) in mainMap.assistantPromptList" :key="k" :span="6">
              <CardAssistant>
                <template v-slot:title>
                  <span>{{item.promptName}}</span>
                </template>
                <template v-slot:tag>
                  <div class="publishStatus">
                    <template v-if="item.publishStatus === 1">
                      <el-tag size="mini" type="success">{{renderOpLabel(releaseStateOptions,item.publishStatus)}}</el-tag>
                    </template>
                    <template v-if="item.publishStatus === 0 || item.publishStatus === 2">
                      <el-tag size="mini" type="primary">{{renderOpLabel(releaseStateOptions,item.publishStatus)}}</el-tag>
                    </template>
                  </div>
                  <div class="cardItemHeaderType">
                    <el-dropdown @command="(k) => handleAction(k,item)">
                      <el-button size="mini" type="text" plain>
                        操作
                        <i class="el-icon-arrow-down el-icon--right" />
                      </el-button>
                      <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="1" class="dropdownItemText">编辑</el-dropdown-item>
                        <template v-if="item.publishStatus === 1">
                          <el-dropdown-item command="2" class="dropdownItemText">下架</el-dropdown-item>
                        </template>
                        <template v-if="item.publishStatus === 0 || item.publishStatus === 2">
                          <el-dropdown-item command="3" class="dropdownItemText">上架</el-dropdown-item>
                        </template>
                        <el-dropdown-item command="4" class="dropdownItemText">删除</el-dropdown-item>
                      </el-dropdown-menu>
                    </el-dropdown>
                  </div>
                </template>
                <div class="cardItemDesc">{{item.description}}</div>
              </CardAssistant>
            </el-col>
          </template>
          <el-col key="add" :span="6">
            <el-card class="cardItemAdd">
              <div @click="addApplication">
                <i class="el-icon-circle-plus-outline" />
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
    <!-- 新增助手 -->
    <el-dialog :title="addDialogTitle" :visible.sync="addDialogVisible" :show-close="false" width="600px">
      <el-form ref="addDialogParams" :model="addDialogParams" label-width="100px" :rules="rules">
        <el-row>
          <el-col :span="24">
            <el-form-item label="助手名称" prop="assistantName">
              <el-input v-model="addDialogParams.assistantName" placeholder="请输入助手名称" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="助手图像" prop="avatar">
              <el-upload
                class="avatar-uploader"
                :show-file-list="false"
                :before-upload="beforeUpload"
                action=""
                accept=".jpg,.jpeg,.png,.gif"
              >
                <img v-if="addDialogParams.avatar" :src="addDialogParams.avatar" class="avatar">
                <i v-else class="el-icon-plus avatar-uploader-icon" />
              </el-upload>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="描述" prop="description">
              <el-input v-model="addDialogParams.description" placeholder="请输入描述" type="textarea" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer">
        <el-button type="primary" :loading="assistantLoading" @click="addDialogSubmit">确定</el-button>
        <el-button @click="addDialogCancel">取消</el-button>
      </div>
    </el-dialog>
    <!-- 提示词 新增  -->
    <el-dialog :title="cueWordTitle" :visible.sync="cueWordVisible" width="600px" :show-close="false" :close-on-press-escape="false">
      <el-form ref="cueWordParams" :model="cueWordParams" label-width="100px" :rules="cueWordRules">
        <el-form-item label="提示词名称" prop="promptName">
          <el-input v-model="cueWordParams.promptName" placeholder="请输入提示词名称" />
        </el-form-item>
        <el-form-item label="提示词内容" prop="description">
          <el-input v-model="cueWordParams.description" placeholder="请输入提示词内容" type="textarea" :rows="10" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button type="primary" :loading="cueWordLoading" @click="cueWordDialogSubmit">确定</el-button>
        <el-button @click="cueWordDialogCancel">取消</el-button>
      </div>
    </el-dialog>
    <el-dialog title="企业列表" :visible.sync="enterpriseVisible">
      <el-table v-loading="enterpriseLoading" :data="enterpriseList">
        <el-table-column label="企业名称" align="center" prop="companyName" />
        <el-table-column label="首次获取时间" align="center" prop="gainTime" />
      </el-table>
    </el-dialog>
  </el-container>
</template>
<script>
import {
  assistantEdit,
  assistantQueryList,
  promptgGetPrompt,
  promptEdit,
  promptgDelete,
  promptgPublish,
  assistantPublish,
  assistantGetCompany,
  assistantDelete,
  assistantDefault,
} from '@/api/assistant/assistant';
import CardAssistant from '@/components/CardAssistant';
export default {
  name: 'PlatformAssistant',
  components: { CardAssistant },
  data() {
    return {
      addDialogTitle: '',
      addDialogVisible: false,
      addDialogParams: {
        avatar: null
      },
      fileInfo: null,
      // 表单校验
      rules: {
        assistantName: [{ required: true, message: '助手名称不能为空', trigger: 'blur' }],
        description: [{ required: true, message: '描述不能为空', trigger: 'blur' }],
      },
      asideMap: {},
      selectCurrentItemId: '',
      mainMap: {},
      cueWordTitle: '',
      cueWordVisible: false,
      cueWordParams: {},
      cueWordRules: {
        promptName: [{ required: true, message: '提示词名称不能为空', trigger: 'blur' }],
        description: [{ required: true, message: '描述不能为空', trigger: 'blur' }],
        publishStatus: [{ required: true, message: '发布状态不能为空', trigger: 'blur' }],
      },
      releaseStateOptions: [
        {
          label: '未发布',
          value: 0
        }, {
          label: '已发布',
          value: 1
        }, {
          label: '已下架',
          value: 2
        }
      ],
      enterpriseList: [], // 企业列表
      enterpriseVisible: false,
      enterpriseLoading: false,
      selectCurrentItemData: {}, // 当前助手选择的data
      assistantLoading: false,
      cueWordLoading: false,
    };
  },
  created() {
    this.getAsideList();
  },
  methods: {
    getAsideList(isFirst = true) {
      assistantQueryList().then(res => {
        this.asideMap = res.data;
        if (res.data.platformList.length > 0) {
          if (isFirst) {
            const [first] = res.data.platformList;
            this.getMainList(first.id);
            this.selectCurrentItemData = first;
            console.log('start');
          } else {
            const { id } = this.selectCurrentItemData;
            this.getMainList(id);
            console.log('end');
          }
        }
      });
    },
    // 助手-弹框-提交
    addDialogSubmit() {
      this.$refs['addDialogParams'].validate(valid => {
        if (valid) {
          this.assistantLoading = true;
          const formData = new FormData();
          formData.append('file', this.fileInfo);
          // 编辑
          if (this.addDialogParams.id) {
            delete this.addDialogParams.createTime;
            delete this.addDialogParams.updateTime;
            delete this.addDialogParams.publishTime;
            delete this.addDialogParams.lastPublishTime;
          }
          formData.append('infos', JSON.stringify(this.addDialogParams));
          assistantEdit(formData).then(res => {
            const { code = 0, msg = '' } = res;
            if (code === 200) {
              if (this.addDialogParams.id) {
                this.getAsideList(false);
              } else {
                this.getAsideList();
              }
              this.addDialogCancel();
            } else {
              this.$message.success(msg);
            }
            this.assistantLoading = false;
          });
        }
      });
    },
    // 助手-新增-弹框
    addDialogOpen() {
      this.addDialogTitle = '新增';
      this.addDialogVisible = true;
      this.addDialogParams = {
        avatar: null
      };
    },
    // 助手-新增-弹框
    addDialogCancel() {
      this.addDialogVisible = false;
      this.addDialogParams = {};
      this.fileInfo = null;
    },
    // 上传预处理
    beforeUpload(file) {
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        this.$message.error('上传模型图片大小不能超过 2MB!');
        return false;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.addDialogParams.avatar = reader.result;
      };
      this.fileInfo = file;
      return true;
    },
    // 助手-编辑
    editPlatForm(item) {
      this.addDialogTitle = '修改';
      this.addDialogVisible = true;
      this.addDialogParams = JSON.parse(JSON.stringify(item));
      console.log(this.addDialogParams, 'addDialogParams', item);
    },
    // 助手-选中
    selectCurrentItem(item) {
      const { id } = item;
      this.selectCurrentItemData = item;
      this.getMainList(id);
    },
    getMainList(id) {
      this.selectCurrentItemId = id;
      promptgGetPrompt(id).then(res => {
        const { data = {}, code = 0 } = res;
        if (code === 200) {
          this.mainMap = data;
          console.log(data, '===编辑');
        }
      });
    },
    // 助手-弹框
    addApplication() {
      this.cueWordTitle = '新增';
      this.cueWordVisible = true;
    },
    // 提示词-关闭-弹框
    cueWordDialogCancel() {
      this.cueWordVisible = false;
      this.cueWordParams = {};
    },
    // 提示词-编辑
    cueWordDialogSubmit() {
      this.$refs['cueWordParams'].validate(valid => {
        if (valid) {
          this.cueWordLoading = true;
          const params = {
            assistantId: this.selectCurrentItemId,
            promptList: [
              { ...this.cueWordParams, assistantId: this.selectCurrentItemId },
            ]
          };
          promptEdit(params).then(res => {
            const { code = 0, msg = '' } = res;
            if (code === 200) {
              this.cueWordDialogCancel();
              this.getMainList(this.selectCurrentItemId);
            } else {
              this.$message.success(msg);
            }
            this.cueWordLoading = false;
          });
        }
      });
    },
    // 提示词-编辑-弹框
    editCueWord(item) {
      this.cueWordVisible = true;
      this.cueWordParams = item;
      this.cueWordTitle = '编辑';
    },
    // 提示词-删除
    deleteCueWord(item) {
      const { id } = item;
      promptgDelete(id).then(res => {
        const { code = 0, msg = '' } = res;
        if (code === 200) {
          this.$message.success(msg);
          this.getMainList(this.selectCurrentItemId);
        }
      });
    },
    // 提示词-发布 or 下架
    pushCueWord(item) {
      const { id } = item;
      promptgPublish(id).then(res => {
        const { code = 0, msg = '' } = res;
        if (code === 200) {
          this.$message.success(msg);
          this.getMainList(this.selectCurrentItemId);
        }
      });
    },
    // 助手-发布 or 下架
    pushAside(item) {
      const { id } = item;
      assistantPublish(id).then(res => {
        const { code = 0, msg = '' } = res;
        if (code === 200) {
          this.$message.success(msg);
          this.getMainList(this.selectCurrentItemId);
        }
      });
    },
    // 企业列表
    getEnterpriseList() {
      const { id } = this.mainMap.cropAssistant;
      this.enterpriseVisible = true;
      this.enterpriseLoading = true;
      assistantGetCompany(id).then(res => {
        console.log(res, '===res');
        const { code = 0, data = [] } = res;
        if (code === 200) {
          this.enterpriseList = data;
        }
        this.enterpriseLoading = false;
      });
    },
    handleAction(key, item) {
      if (key === '1') {
        this.editCueWord(item);
      } else if (key === '2' || key === '3') {
        const str = key === '2' ? `确认下架该提示词'${item.promptName}'吗？` : `确认上架该提示词'${item.promptName}'吗？`;
        this.$confirm(str, {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.pushCueWord(item);
        });
      } else if (key === '4') {
        this.$confirm(`确认删除该提示词'${item.promptName}'吗？`, {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.deleteCueWord(item);
        });
      }
    },
    // 助手删除
    deleteAside(item) {
      const { publishStatus, id } = item;
      if (publishStatus === 1) {
        this.$message.error('该助手必须下架才能删除');
        return;
      }
      assistantDelete(id).then(res => {
        const { code = 0, msg = '' } = res;
        if (code === 200) {
          this.$message.success(msg);
          this.getAsideList();
        }
      });
    },
    // 设置默认 or 取消默认
    settingDefault(item) {
      const { id } = item;
      assistantDefault(id).then(res => {
        const { code = 0, msg = '' } = res;
        if (code === 200) {
          this.$message.success(msg);
          this.getMainList(this.selectCurrentItemId);
        }
      });
    },
    // 回显label
    renderOpLabel(op, key) {
      const { label = '' } = op.find(item => item.value === key) || '';
      return label || '';
    }
  }
};
</script>
<style lang="scss" scoped>
.aside{
  background: none;
  padding-top: 18px;
  &-item{
    display: flex;
    margin-bottom: 10px;
    align-items: center;
    cursor: pointer;
    &_name{
      font-size: 14px;
      margin-left: 10px;
    }
    &_handle{
      display: flex;
      margin-left: 10px;
    }
  }
}
/deep/ .avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
/deep/ .avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
/deep/ .avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
/deep/ .el-avatar{
  // background: none;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
.header-item{
  display: flex;
  align-items: center;
  &_avatar{
    width: 80px;
    height: 80px;
    flex-shrink: 0;
  }
}
.container{
  padding: 8px 24px;
}
.header-desc{
  margin-left: 10px;
  &_name{
    font-size: 18px;
    font-weight: 500;
    margin-bottom: 5px;
    display: flex;
    align-items: center;
  }
  &_desc{
    color: #ABAEB3;
    margin-bottom: 5px;
    font-size: 14px;
    word-break: break-all;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-height: 20px;
  }
  &_time{
    color: #ABAEB3;
    font-size: 14px;
  }
  &_handle{
    display: flex;
    align-items: center;
    margin-left: 10px;
    &_action{
      margin-right: 10px;
    }
  }
}

.container-header{
  width: 100%!important;
  padding: 10px 24px 0 20px;
  box-sizing: border-box;
}

.cardItemAdd{
  height: 122px;
  cursor: pointer;
  text-align: center;
  line-height: 100px;
  i{
    font-size: 30px;
  }
}
.cardItemHeaderType{
  display: flex;
  margin-left: 10px;
}
.dropdownItemText{
  font-size: 12px;
}

.publishStatus{
  margin-left: 5px;
}
.cardItemDesc{
  font-size: 14px;
  color: #8c939d;
  line-height: 20px;
  word-break: break-all;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
</style>
