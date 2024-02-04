<template>
  <el-container>
    <el-aside class="aside" width="200px">
      <template v-if="asideMap.platformList">
        <div v-for="(item,k) in asideMap.platformList" :key="k" class="aside-item">
          <el-avatar shape="square" size="small" :src="item.avatar" />
          <div class="aside-item_name" :style="selectCurrentItemId === item.id ? 'color:#1890ff': ''" @click="selectCurrentItem(item)">{{item.assistantName}}</div>
        </div>
      </template>
    </el-aside>
    <el-container class="platformContainer">
      <el-header height="100px" class="platform_container-header">
        <template v-if="mainMap.cropAssistant">
          <el-row>
            <el-col :span="24">
              <div class="platform_header-item">
                <el-avatar :src="mainMap.cropAssistant.avatar" class="platform_header-item_avatar" />
                <div class="platform_header-desc">
                  <div class="platform_header-desc_name">
                    <div>{{mainMap.cropAssistant.assistantName}}</div>
                    <div class="platform_header-desc_handle">
                      <div class="platform_header-desc_handle_action">
                        <el-button v-if="!isGainFlag" :loading="isGainLoading" type="primary" size="mini" @click="getGain">获取</el-button>
                        <el-button v-else :key="Date.now" type="success" disabled size="mini">已安装</el-button>
                      </div>
                    </div>
                  </div>
                  <div class="platform_header-desc_desc">{{mainMap.cropAssistant.description}}</div>
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
              <el-card class="cardList_card">
                <div class="cardList-item">
                  <div class="cardList-item_content">
                    <div class="cardItemHeader">
                      <div class="assistantName">{{item.promptName}}</div>
                    </div>
                    <div class="cardItemDesc">{{item.description}}</div>
                  </div>
                </div>
              </el-card>
            </el-col>
          </template>
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
                <img v-if="addDialogParams.avatar" :src="addDialogParams.avatar" class="avatar-uploader_avatar">
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
        <el-button type="primary" @click="addDialogSubmit">确定</el-button>
        <el-button @click="addDialogCancel">取消</el-button>
      </div>
    </el-dialog>
    <!-- 提示词 新增  -->
    <el-dialog :title="cueWordTitle" :visible.sync="cueWordVisible" width="600px" :show-close="false">
      <el-form ref="cueWordParams" :model="cueWordParams" label-width="100px" :rules="cueWordRules">
        <el-form-item label="提示词名称" prop="promptName">
          <el-input v-model="cueWordParams.promptName" placeholder="请输入提示词名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="cueWordParams.description" placeholder="请输入描述" type="textarea" :rows="10" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button type="primary" @click="cueWordDialogSubmit">确定</el-button>
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
  assistantGain,
 } from '@/api/assistant/assistant';
export default {
  name: 'PlatformAssistant',
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
      isGainFlag: false,
      isGainLoading: false,
    };
  },
  created() {
    this.getAsideList();
  },
  methods: {
    getAsideList() {
      assistantQueryList().then(res => {
        this.asideMap = res.data;
        if (res.data.platformList.length > 0) {
          const [first] = res.data.platformList;
          this.getMainList(first.id);
        }
      });
    },
    // 助手-弹框-提交
    addDialogSubmit() {
      this.$refs['addDialogParams'].validate(valid => {
        if (valid) {
          const formData = new FormData();
          formData.append('file', this.fileInfo);
          formData.append('infos', JSON.stringify(this.addDialogParams));
          // 编辑
          if (this.addDialogParams.id) {
            delete this.addDialogParams.createTime;
          }
          assistantEdit(formData).then(res => {
            const { code = 0, msg = '' } = res;
            if (code === 200) {
              this.addDialogCancel();
              this.getAsideList();
            } else {
              this.$message.success(msg);
            }
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
    },
    deletePlatForm(item) {
    },
    // 助手-选中
    selectCurrentItem(item) {
      const { id } = item;
      this.getMainList(id);
    },
    getMainList(id) {
      this.selectCurrentItemId = id;
      promptgGetPrompt(id).then(res => {
        const { data = {}, code = 0 } = res;
        if (code === 200) {
          this.mainMap = data;
          this.isGainFlag = data.cropAssistant.isGainFlag;
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
        const { code = 0, data = [] } = res;
        if (code === 200) {
          this.enterpriseList = data;
        }
        this.enterpriseLoading = false;
      });
    },
    getGain() {
      this.isGainLoading = true;
      assistantGain(this.selectCurrentItemId).then(res => {
        const { code = 0, } = res;
        if (code === 200) {
          this.isGainLoading = false;
          this.isGainFlag = !this.isGainFlag;
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
  width: 178px;
  height: 178px;
}
/deep/ .avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
/deep/ .avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  line-height: 178px;
  text-align: center;
}
/deep/ .el-avatar{
  // background: none;
}
/deep/ .avatar-uploader {
  &_avatar{
    width: 178px;
    height: 178px;
    object-fit: fill;
  }
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
.platform_header-item{
  display: flex;
  align-items: center;
  &_avatar{
    width: 80px;
    height: 80px;
    flex-shrink: 0;
  }
}
.platformContainer{
  padding: 8px 24px;
}
.platform_header-desc{
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

.cardList{
  display: flex;
  flex-wrap: wrap;
  &_card{
    margin-right: 10px;
    margin-bottom: 10px;
  }
  &-item{
    display: flex;
    //width: 250px;
    height: 80px;
    overflow: hidden;
    &_avatar{
      margin-right: 10px;
      width: 60px;
      height: 60px;
      flex-shrink: 0;
    }
    &_content{
      width: inherit;
      .item_content_header{
        display: flex;
        align-items: center;
        margin-bottom: 5px;
        justify-content: space-between;
        .assistantName{
          font-size: 16px;
          font-weight: 500;
          text-overflow: ellipsis;
          overflow: hidden;
          word-break: break-all;
          white-space: nowrap;
          width: 100px;
        }
        .publishStatus{
          margin-left: 5px;
        }
        &_right{
          display: flex;
        }
      }
      .item_content_desc{
        font-size: 14px;
        color: #8c939d;
        line-height: 18px;
        word-break: break-all;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
      }
    }
  }
}
.platform_container-header{
  padding: 10px 24px 0 20px;
  box-sizing: border-box;
}
.cardItemDesc{
  font-size: 12px;
  color: #8c939d;
  line-height: 20px;
  word-break: break-all;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
.assistantName{
  font-size: 14px;
  font-weight: 500;
  text-overflow: ellipsis;
  overflow: hidden;
  word-break: break-all;
  white-space: nowrap;
  width: 120px;
  margin-bottom: 5px;
}
</style>
