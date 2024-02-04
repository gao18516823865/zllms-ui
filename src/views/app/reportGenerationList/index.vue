<template>
  <div>
    <PageContent v-bind="pageOptions" />
    <el-dialog title="详情" :visible.sync="visible">
      <div v-for="(item, index) in detailList" :key="index">
        <div class="question-title">问题{{index+1}}：{{item.question}}</div>
        <div class="questionAnswer-content">
          <pre>{{item.questionAnswer}}</pre>
        </div>
      </div>
    </el-dialog>
    <el-dialog title="报告详情" :visible.sync="visibleDetail">
      <div>
        <pre style="white-space: pre-wrap;word-wrap: break-word">{{createContent}}</pre>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import PageContent from '@/components/PageContent';
import moment from 'moment';
import { reportDetails } from '@/api/appcenter/app';
export default {
  name: 'ReportGenerationList',
  components: {
    PageContent
  },
  data() {
    return {
      pageOptions: {
        fetchUrl: '/report/reportResult/list',
        columns: [
          {
            label: '编号',
            prop: 'userId',
            width: 50
          }, {
            label: '手机号',
            prop: 'phone'
          }, {
            label: '用户名',
            prop: 'userName'
          }, {
            label: '公司名称',
            prop: 'companyName'
          }, {
            label: '提交时间',
            render(scope) {
              const { row } = scope;
              return row.createTime && moment(row.createTime).format('YYYY-MM-DD HH:mm:ss');
            }
          }, {
            label: '完成度',
            prop: 'status'
          }, {
            type: 'handle',
            title: '操作',
            handleList: [
              {
                label: '问答详情',
                onClick: (scope) => {
                  const { row } = scope;
                  this.visible = true;
                  this.getDetail({ ...row });
                }
              }, {
                label: '报告详情',
                onClick: (scope) => {
                  const { row } = scope;
                  this.visibleDetail = true;
                  this.getDetail({ ...row });
                }
              }
            ]
          }
        ]
      },
      visible: false,
      detailList: [],
      visibleDetail: false,
      createContent: ''
    };
  },
  methods: {
    getDetail({ userId }) {
      reportDetails({
        userId
      }).then(res => {
        const { code = 0, data = [] } = res;
        if (code === 200) {
          this.detailList = data;
          const [first] = data;
          this.createContent = first.report;
        }
      });
    }
  }
};
</script>
<style >
  pre {
    white-space: pre-wrap;
    word-wrap: break-word;
  }
  .question-title{
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 20px;
  }
  .questionAnswer-content{
    font-size: 16px;
  }
</style>
