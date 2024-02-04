<template>
  <el-container direction="vertical">
    <el-main>
      <div class="box-card">
        <div class="clearfix">
          <span>平台助手</span>
          <div v-if="superAdminFlag!==1" class="clearfixButton" @click="moreAssistant">
            <i class="el-icon-document-copy" />
            <div>更多助手</div>
          </div>
        </div>
        <el-row>
          <template v-if="assistantMap.gainList.length>0">
            <el-col v-for="(item,k) in assistantMap.gainList" :key="k" :span="6">
              <el-card shadow="hover" class="cardList-item mrb">
                <div class="cardList-item">
                  <el-avatar :src="item.avatar" class="cardList-item_avatar" />
                  <div class="cardList-item_content">
                    <div class="item_content_header">
                      <div class="assistantName">{{item.assistantName}}</div>
                      <div>
                        <el-dropdown trigger="click" @command="(key) => handleCommand(key,item)">
                          <span class="el-dropdown-link">
                            <i class="el-icon-more el-icon--right" />
                          </span>
                          <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item class="dropdownItemText error" icon="el-icon-remove-outline" command="remove">移除</el-dropdown-item>
                          </el-dropdown-menu>
                        </el-dropdown>
                      </div>
                    </div>
                    <div class="item_content_desc">{{item.description}}</div>
                  </div>
                </div>
              </el-card>
            </el-col>
          </template>
          <template v-else>
            <el-empty :description="superAdminFlag === 1 ? '暂无权限':'暂无内容'" />
          </template>
        </el-row>
      </div>
    </el-main>
    <el-main>
      <div class="box-card">
        <div class="clearfix">
          <span>企业自建</span>
          <div v-if="superAdminFlag!==1" class="clearfixButton">
            <i class="el-icon-set-up" />
            <div @click="addDialogOpen">创建助手</div>
          </div>
        </div>
        <div>
          <el-row>
            <template v-if="assistantMap.companyList.length>0">
              <el-col v-for="(item,k) in assistantMap.companyList" :key="k" :span="6">
                <el-card shadow="hover" class="cardList-item mrb">
                  <div class="cardList-item" @click="goCreateCueWord(item)">
                    <el-avatar :src="item.avatar" class="cardList-item_avatar" />
                    <div class="cardList-item_content">
                      <div class="item_content_header">
                        <div class="assistantName">{{item.assistantName}}</div>
                        <div class="publishStatus">
                          <template v-if="item.publishStatus === 1">
                            <el-tag size="mini" type="success">{{renderOpLabel(releaseStateOptions,item.publishStatus)}}</el-tag>
                          </template>
                          <template v-if="item.publishStatus === 0 || item.publishStatus === 2">
                            <el-tag size="mini" type="warning">{{renderOpLabel(releaseStateOptions,item.publishStatus)}}</el-tag>
                          </template>
                        </div>
                      </div>
                      <div class="item_content_desc">{{item.description}}</div>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </template>
            <template v-else>
              <el-empty :description="superAdminFlag === 1 ? '暂无权限':'暂无内容'" />
            </template>
          </el-row>

        </div>
      </div>
    </el-main>
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
            <el-form-item label="助手描述" prop="description">
              <el-input v-model="addDialogParams.description" placeholder="请输入助手描述" type="textarea" :rows="10" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer">
        <el-button type="primary" @click="addDialogSubmit">确定</el-button>
        <el-button @click="addDialogCancel">取消</el-button>
      </div>
    </el-dialog>
  </el-container>
</template>
<script>
import {
  assistantQueryList,
  assistantEdit,
  assistantGain
 } from '@/api/assistant/assistant';
 import { mapGetters } from 'vuex';

export default {
  name: 'AssistantManagement',
  data() {
    return {
      assistantMap: {
        companyList: [],
        platformList: [],
        gainList: []
      },
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
    };
  },
  computed: {
    ...mapGetters(['superAdminFlag'])
  },
  watch: {
    $route: {
      handler(route) {
        this.getAssistantQueryList();
      },
    },
  },
  created() {
    this.getAssistantQueryList();
  },
  methods: {
    getAssistantQueryList() {
      assistantQueryList().then(res => {
        this.assistantMap = {
          ...this.assistantMap,
          ...res.data,
        };
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
              this.getAssistantQueryList();
            } else {
              this.$message.success(msg);
            }
          });
        }
      });
    },
    // 助手-新增-弹框
    addDialogCancel() {
      this.addDialogVisible = false;
      this.addDialogParams = {};
      this.fileInfo = null;
    },
    // 助手-新增-弹框
    addDialogOpen() {
      this.addDialogTitle = '新增助手';
      this.addDialogVisible = true;
      this.addDialogParams = {
        avatar: null
      };
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
    // 创建提示词
    goCreateCueWord(item) {
      const { id } = item;
      this.$router.push({ path: '/officeAssistant/cueWordCreate', query: { id, callBack: () => {
        this.getAssistantQueryList();
      } }});
    },
    moreAssistant() {
      this.$router.push({ path: '/officeAssistant/platformAssistantMore' });
    },
    handleCommand(key, item) {
      if (key === 'remove') {
        this.getGain(item);
      }
    },
    getGain(item) {
      const { id } = item;
      assistantGain(id).then(res => {
        const { code = 0, } = res;
        if (code === 200) {
          this.getAssistantQueryList();
        }
      });
    },
    // 回显label
    renderOpLabel(op, key) {
      const { label = '' } = op.find(item => item.value === key) || '';
      console.log(label, '====');
      return label || '';
    }
  }
};
</script>
<style lang="scss" scoped>
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
.box-card{
  .clearfix{
    display: flex;
    margin-bottom: 10px;
    align-items: center;
    span{
      margin-right: 20px;
    }
    .clearfixButton{
      font-size: 12px;
      display: flex;
      color: #8c939d;
      align-items: center;
      i{
        margin-right: 5px;
      }
    }
  }
}
.dropdownItemText{
  font-size: 12px;
  &.error{
    color: red;
  }
}
.mrb{
  margin-right: 10px;
  margin-bottom: 10px;
}
.cardList{
  display: flex;
  flex-wrap: wrap;
  &-item{
    display: flex;
    overflow: hidden;

    height: 122px;
    /deep/ .el-card__body{
      width: 100%;
    }
    &_avatar{
      margin-right: 10px;
      width: 40px;
      height: 40px;
      flex-shrink: 0;
    }
    &_content{
      flex: 1;
      .item_content_header{
        display: flex;
        align-items: center;
        margin-bottom: 5px;
        justify-content: space-between;
        .assistantName{
          font-size: 14px;
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
      }
      .item_content_desc{
        font-size: 12px;
        color: #8c939d;
        line-height: 18px;
        word-break: break-all;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 4;
        -webkit-box-orient: vertical;
      }
    }
  }
}
.flex{
  display: flex;
}
.flex-column{
  flex-direction: column;
}
.justify-center{
  justify-content: center;
}
.align-center{
  align-items: center;
}
</style>
