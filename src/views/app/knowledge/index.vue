<template>
  <div class="iframe-wrapper">
    <iframe :src="iframeUrl" />
  </div>
</template>
<script>
import { mapGetters } from 'vuex';

export default {
  name: 'Knowledge',
  components: {
    ...mapGetters(['userInfo']),
  },
  computed: {
    ...mapGetters(['userInfo']),
    iframeUrl: function() {
      const comId = this.userInfo.comId;
      console.log('====', comId);
      return `https://jw.jsunc.com/signin?comId=${comId}`;
    }
  },
  created() {
    console.log(this.userInfo, 'userinfo', this);
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

  .iframe-wrapper {
    position: relative;
    padding-bottom: 56.25%; /* 设置一个比例值，实现自适应 */
    height: 0;
    overflow: hidden;
  }

  .iframe-wrapper iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%; /* 填充整个父容器宽度 */
    height: 100%; /* 填充整个父容器高度 */
  }
</style>
