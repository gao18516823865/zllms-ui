<template>
  <div>
    <PageContent ref="pageContent" v-bind="pageOptions" />
    <el-dialog title="编辑" :visible.sync="visible" :show-close="false">
      <el-form ref="form" :model="formParams" label-width="80px" :rules="rules">
        <el-form-item label="题目" prop="question">
          <el-input v-model="formParams.question" :rows="4" type="textarea" placeholder="请输入预设词" clearable size="small" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelDialog">取消</el-button>
        <el-button type="primary" @click="editQestion">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import PageContent from '@/components/PageContent';
import { reportQuestionUpdate } from '@/api/appcenter/app';
export default {
  name: 'IssuesList',
  components: {
    PageContent
  },
  data() {
    return {
      pageOptions: {
        fetchUrl: '/report/reportQuestion/list',
        columns: [
          {
            label: '编号',
            prop: 'id',
            width: 50
          }, {
            label: '题目',
            prop: 'question'
          }, {
            type: 'handle',
            title: '操作',
            handleList: [
              {
                label: '编辑',
                onClick: (scope) => {
                  const { row } = scope;
                  this.visible = true;
                  this.formParams = JSON.parse(JSON.stringify(row));
                }
              }
            ]
          }
        ],
      },
      rules: {
        translation: [
          { required: true, message: '请输入题目', trigger: 'blur' },
        ],
      },
      visible: false,
      formParams: {},
    };
  },
  methods: {
    editQestion() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          reportQuestionUpdate(this.formParams).then(res => {
            const { code = 0, msg = '' } = res;
            if (code === 200) {
              this.cancelDialog();
              this.$refs.pageContent.getList();
              this.$message.success(msg);
            }
          });
        }
      });
    },
    cancelDialog() {
      this.visible = false;
      this.$refs['form'].resetFields();
    },
  }
};
</script>
