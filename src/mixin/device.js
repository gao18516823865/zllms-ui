import { mapGetters } from 'vuex';
export default {
  data() {
    return {
      windowWidth: window.innerWidth,
      isMobile: false,
      labelPosition: 'right',
      dialogMobileWidth: '80%',
      dialogDefaultWidht: '50%',
      dialogSpan: 20,
    };
  },
  watch: {
    windowWidth(newValue) {
      // 根据窗口宽度判断是否是移动设备
      this.isMobile = newValue < 768;
    }
  },
  computed: {
    ...mapGetters(['superAdminFlag']),
  },
  created () {
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
    this.isMobile = window.innerWidth < 768;
  },
  destroyed() {
    // 组件销毁时移除事件监听
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    handleResize() {
      this.windowWidth = window.innerWidth;
    }
  }
};
