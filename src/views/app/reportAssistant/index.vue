<template>
  <div class="app-container">
    <el-form inline>
      <el-form-item label=" ">
        <el-button type="primary" size="mini" @click="goRouter('/corpApp/app/preset')">提示词设置</el-button>
      </el-form-item>
    </el-form>
    <el-card class="cardBottom">
      <div slot="header">
        题目列表
      </div>
      <IssuesList />
    </el-card>
    <el-card>
      <div slot="header">
        报告列表
      </div>
      <ReportGenerationList />
    </el-card>
  </div>
</template>
<script>
import IssuesList from '@/views/app/issuesList';
import ReportGenerationList from '@/views/app/reportGenerationList';
export default {
  name: 'ReportAssistant',
  components: {
    IssuesList,
    ReportGenerationList
  },
  methods: {
    goRouter(routerPath) {
      this.$router.push(routerPath);
    },
  }
};
</script>
<style lang="scss" scoped>
  .cardBottom{
    margin-bottom: 20px;
  }
</style>
