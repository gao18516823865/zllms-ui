<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts';
require('echarts/theme/macarons'); // echarts theme
import resize from './mixins/resize';

export default {
  mixins: [resize],
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
    autoResize: {
      type: Boolean,
      default: true,
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
        this.setOptions(val);
      },
    },
    height: {
      deep: true,
      handler(val) {
        this.height = val;
        this.chart.resize({ height: val });
      }
    }
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
      this.chart = echarts.init(this.$el, 'macarons');
      this.setOptions(this.chartData);
    },
    setOptions({ xAxis = [], seriesData = [], title = {}, grid = {}, }) {
      this.chart.setOption({
        title,
        tooltip: {
          trigger: 'axis',
        },
        legend: {
          data: seriesData.map(item => {
            return item.name;
          }),
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '10%',
          containLabel: true,
          ...grid
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: xAxis,
        },
        yAxis: {
          type: 'value',
        },
        series: seriesData,
        // series: [
        //   {
        //     name: 'Email',
        //     type: 'line',
        //     stack: 'Total',
        //     data: [120, 132, 101, 134, 90, 230, 210],
        //   },
        //   {
        //     name: 'Union Ads',
        //     type: 'line',
        //     stack: 'Total',
        //     data: [220, 182, 191, 234, 290, 330, 310],
        //   },
        //   {
        //     name: 'Video Ads',
        //     type: 'line',
        //     stack: 'Total',
        //     data: [150, 232, 201, 154, 190, 330, 410],
        //   },
        //   {
        //     name: 'Direct',
        //     type: 'line',
        //     stack: 'Total',
        //     data: [320, 332, 301, 334, 390, 330, 320],
        //   },
        //   {
        //     name: 'Search Engine',
        //     type: 'line',
        //     data: [820, 932, 901, 934, 1290, 1330, 1320],
        //   },
        // ],
      });
      // this.chart.setOption({
      //   xAxis: {
      //     data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      //     // data: this.getNear12Month(),
      //     boundaryGap: false,
      //     axisTick: {
      //       show: false,
      //     },
      //   },
      //   grid: {
      //     left: 10,
      //     right: 10,
      //     bottom: 20,
      //     top: 30,
      //     containLabel: true,
      //   },
      //   tooltip: {
      //     trigger: 'axis',
      //     axisPointer: {
      //       type: 'cross',
      //     },
      //     padding: [5, 10],
      //   },
      //   yAxis: {
      //     axisTick: {
      //       show: false,
      //     },
      //   },
      //   legend: {
      //     data: ['expected', 'actual'],
      //   },
      //   series: [
      //     {
      //       name: 'expected',
      //       itemStyle: {
      //         normal: {
      //           color: '#FF005A',
      //           lineStyle: {
      //             color: '#FF005A',
      //             width: 2,
      //           },
      //         },
      //       },
      //       smooth: true,
      //       type: 'line',
      //       data: expectedData,
      //       animationDuration: 2800,
      //       animationEasing: 'cubicInOut',
      //     },
      //     {
      //       name: 'actual',
      //       smooth: true,
      //       type: 'line',
      //       itemStyle: {
      //         normal: {
      //           color: '#3888fa',
      //           lineStyle: {
      //             color: '#3888fa',
      //             width: 2,
      //           },
      //           areaStyle: {
      //             color: '#f3f8ff',
      //           },
      //         },
      //       },
      //       // data: actualData,
      //       data: [150, 230, 224, 218, 135, 147, 260],
      //       animationDuration: 2800,
      //       animationEasing: 'quadraticOut',
      //     },
      //   ],
      // });
    },
  },
};
</script>
<!-- // type的slider和inside可以同时保留，既可以保留滚动条，也可以在内部拖动
dataZoom : [
        //1.横向使用滚动条
          {
            type: 'slider',//有单独的滑动条，用户在滑动条上进行缩放或漫游。inside是直接可以是在内部拖动显示
            show: true,//是否显示 组件。如果设置为 false，不会显示，但是数据过滤的功能还存在。
            start: 0,//数据窗口范围的起始百分比0-100
            end: 50,//数据窗口范围的结束百分比0-100
            xAxisIndex: [0],// 此处表示控制第一个xAxis，设置 dataZoom-slider 组件控制的 x轴 可是已数组[0,2]表示控制第一，三个；xAxisIndex: 2 ，表示控制第二个。yAxisIndex属性同理
            bottom:-10 //距离底部的距离
          },
      //2.在内部可以横向拖动
         {
             type: 'inside',// 内置于坐标系中
             start: 0,
             end: 30,
             xAxisIndex: [0]
          },
     //3.纵向使用滚动条
        {
            type: 'slider',
            show: true,
            yAxisIndex: [0],//设置组件控制的y轴
            left: '93%',//距离左侧的距离 可以使百分比，也可以是像素 left: '30'（30像素）
            start: 29,
            end: 36
        },
     //4.在内部可以纵向拖动
        {
            type: 'inside',
            yAxisIndex: [0],
            start: 29,
            end: 36
        }
        ] -->
