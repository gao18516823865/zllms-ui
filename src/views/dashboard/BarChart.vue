<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts';
require('echarts/theme/macarons'); // echarts theme
import resize from './mixins/resize';
import device from '@/mixin/device';

export default {
  mixins: [resize, device],
  props: {
    className: {
      type: String,
      default: 'chart',
    },
    width: {
      type: String,
      default: '100%',
    },
    height: {
      type: String,
      default: '350px',
    },
    monthStrList: {
      type: Array,
      require: true,
    },
    monthData: {
      type: Array,
      require: true,
    },
    chartData: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      chart: null,
    };
  },
  watch: {
    chartData: {
      deep: true,
      handler(val) {
        console.log('val ===', val);
        this.setOptions(val);
      },
    },
    isMobile: {
      deep: true,
      handler(val) {
        console.log(val, 'isMobile==isMobile', this.chart);
        this.initChart();
        this.chart.resize();
      }
    }
  },
  created() {
    console.log('chartData===chartData');
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart();
    });
  },
  beforeDestroy() {
    if (!this.chart) {
      return;
    }
    this.chart.dispose();
    this.chart = null;
  },

  methods: {
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons' );
      this.setOptions(this.chartData);
    },
    setOptions({ xAxis = [], seriesData = [], title = {}, tooltip = {}}) {
      const isMobile = this.isMobile;
      const params = {
        title,
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
          },
          formatter: function (params) {
            if (params && params.length > 0) {
              const [info = {}] = params;
              if (tooltip && tooltip.length > 0) {
                return `${tooltip[info.dataIndex]}：${info.value}`;
              }
              return `${info.name}：${info.value}`;
            }
            return params;
          },
        },
        legend: {
          data: seriesData.map(item => {
            return item.name;
          }),
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '0%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          boundaryGap: true,
          data: xAxis,
          axisLabel: {
            interval: 0, // 强制显示所有标签
            rotate: 23, // 旋转角度
            textStyle: {
              fontStyle: 'italic', // 设置字体样式为斜体
            },
            // formatter: function (value) {
            //   const maxLength = 9; // 设置每行最大字符数
            //   let result = '';
            //   for (let i = 0, len = value.length; i < len; i += maxLength) {
            //     result += value.substring(i, i + maxLength) + '\n';
            //   }
            //   return result;
            // }
          },
          splitLine: {
            show: false,
          }
        },
        yAxis: {
          type: 'value',
          // data: xAxis,
          splitLine: {
            show: true,
            lineStyle: {
              color: ['#ccc'], // 分隔线颜色。
              width: 1, // 分隔线线宽
              type: 'line', // 线的类型
              opacity: 0.4 // 图形透明度。支持从 0 到 1 的数字，为 0 时不绘制该图形。
            }
          }
        },
        series: seriesData,
      };
      // 移动端 params
      if (isMobile) {
        params.grid = {
          ...params.grid,
          right: '15%'
        };
        params.xAxis = {
          ...params.xAxis,
          type: 'value',
          show: false,
          axisLabel: {
            ...params.xAxis.axisLabel,
            fontSize: 10,
          },
          // inverse: false,
          // position: 'right', // 设置 X 轴的位置为右侧
          // axisLabel: {
          //   // formatter: function (value) {
          //   //   console.log(value, 'value==');
          //   //   return value > 0 ? String(value).split('').join('\n') : 0;
          //   // }
          // },
        };
        params.yAxis = {
          ...params.yAxis,
          data: xAxis,
          type: 'category',
          axisLabel: {
            show: false, // 隐藏分类标签
          }
          // position: 'right',
          // axisLabel: {
          //   ...params.yAxis.axisLabel,
          //   inverse: true,
          //   position: 'right',
          //   // align: 'right'
          // }
        };
      }
      this.chart.setOption(params, true);
    },
  },
};
</script>
