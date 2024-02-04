<template>
  <div class="overview-wrap">
    <el-row :gutter="12" class="overview-row">
      <div v-for="item in applactionList" :key="item.key" :class="isMobile ? 'overview-col-item-mobile' : 'overview-col-item'">
        <div class="applaction-item" @click="() => goRouter(item.routerName)">
          <i :class="item.icon" class="applaction-item-icon" />
          <div class="applaction-item-collect">
            <span class="applaction-item-label">{{item.lable}}</span>
            <span class="applaction-item-value">
              <span v-if="item.noLink" class="link">
                {{item.value}}{{item.unit}}
              </span>
              <span v-else>
                {{item.value}}{{item.unit}}
              </span>
            </span>
          </div>
        </div>
      </div>
    </el-row>
    <el-row class="marginBottom15">
      <el-col :span="24" :xs="{span:24}">
        <el-card>
          <div slot="header" class="clearfix">
            <span>通道调用量排名</span>
          </div>
          <div class="card-view-container">
            <bar-chart :chart-data="chartBarData1" height="500px" />
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row class="marginBottom15">
      <el-card class="overView-card">
        <div slot="header" class="overView-card-header">
          <div class="overView-card-header_left">
            <span>调用量趋势图</span>
          </div>
          <el-radio-group v-model="timeSelection" size="mini">
            <el-radio-button label="week">近一周</el-radio-button>
            <el-radio-button label="half_month">近半月</el-radio-button>
            <el-radio-button label="one_month">近一月</el-radio-button>
          </el-radio-group>
        </div>
        <el-col :span="12" :xs="{span:24}">
          <line-chart :chart-data="chartLineData" :height="isMobile ? `800x` : `500px`" />
        </el-col>
        <el-col :span="12" :xs="{span:24}">
          <line-chart :chart-data="chartLineTotalData" height="500px" />
        </el-col>
      </el-card>
    </el-row>
    <el-row :gutter="12">
      <el-col :span="12" :xs="{span:24}" class="marginBottom15">
        <el-card>
          <div slot="header" class="clearfix">
            <span>前10企业Tokens总消耗趋势</span>
          </div>
          <div class="card-view-container">
            <bar-chart :chart-data="chartBarData2" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="12" :xs="{span:24}" class="marginBottom15">
        <el-card>
          <div slot="header" class="clearfix">
            <span>前10应用Tokens总消耗趋势</span>
          </div>
          <div class="card-view-container">
            <bar-chart :chart-data="chartBarData3" />
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="12" class="marginBottom15">
      <el-col :span="24" :xs="{span:24}">
        <el-card>
          <div slot="header" class="overView-card-header">
            <div class="overView-card-header_left">
              <span>企业消费金额排行</span>
            </div>
            <el-radio-group v-model="comDateAmount" size="mini">
              <el-radio-button label="day">近一天</el-radio-button>
              <el-radio-button label="week">近一周</el-radio-button>
              <el-radio-button label="">全部</el-radio-button>
            </el-radio-group>
          </div>
          <div class="card-view-container">
            <bar-chart :chart-data="chartBarData4" height="500px" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import LineChart from '../../dashboard/LineChart';
import BarChart from '../../dashboard/BarChart';
import { countRankTotal, channelDateTotal, dateTotal, useStatisticsComDateAmount } from '@/api/model/model';
import device from '@/mixin/device';
import { formatCurrency, formatCurrencyToken } from '@/utils';
export default {
  name: 'Overview',
  components: {
    LineChart,
    BarChart,
  },
  mixins: [device],
  data() {
    // 企业数量：companyCount，应用数量：appCount，
    // 通道数量：channelCount，模型数量：modelCount，
    // 总数量：usrStatisticsCount，通道排名：channelRankingTotal，
    // 企业排名：companyRankingTotal，应用排名：appRankingTotal
    return {
      applactionList: [
        {
          lable: '企业数量',
          value: '',
          key: 'companyCount',
          icon: 'el-icon-user-solid',
          unit: '个',
          routerName: '/agent/company',
          noLink: true,
        },
        {
          lable: '应用数量',
          value: '',
          key: 'appCount',
          icon: 'el-icon-s-goods',
          unit: '个',
          routerName: '/corpApp/app',
          noLink: true,
        },
        {
          lable: '助手用户数量',
          value: '',
          key: 'appUserCount',
          icon: 'el-icon-user-solid',
          unit: '个',
          routerName: '/corpApp/appusers',
          noLink: true,
        },
        {
          lable: '通道数量',
          value: '',
          key: 'channelCount',
          icon: 'el-icon-s-claim',
          unit: '个',
          routerName: '/model/channel',
          noLink: true,
        },
        {
          lable: '模型数量',
          value: '',
          key: 'modelCount',
          icon: 'el-icon-s-order',
          unit: '个',
          routerName: '/model/config',
          noLink: true,
        },
        {
          lable: '总金额',
          value: '',
          key: 'totalCost',
          icon: 'el-icon-s-finance',
          unit: '',
          routerName: '/account/fund/list',
          noLink: true,
        },
        {
          lable: '总Tokens',
          value: '',
          key: 'usrStatisticsCount',
          icon: 'el-icon-s-data',
          unit: '',
          noLink: false,
        },
      ],
      chartBarData1: {
        xAxis: [],
        seriesData: [],
        legend: [],
      },
      chartBarData2: {
        xAxis: [],
        seriesData: [],
        legend: [],
      },
      chartBarData3: {
        xAxis: [],
        seriesData: [],
        legend: [],
      },
      chartLineData: {
        xAxis: [],
        seriesData: [],
        legend: [],
      },
      chartLineTotalData: {
        xAxis: [],
        seriesData: [],
        legend: [],
      },
      timeSelection: 'week',
      comDateAmount: 'day',
      chartBarData4: {
        xAxis: [],
        seriesData: [],
        legend: [],
      },
    };
  },
  watch: {
    timeSelection: function (val) {
      this.timeSelection = val;
      this.getStatisticsDate();
      this.getDateTotal();
    },
    comDateAmount: function (val) {
      this.comDateAmount = val;
      this.getComDateAmount();
    },
  },
  created() {
    this.getDataMap();
    this.getStatisticsDate();
    this.getDateTotal();
    this.getComDateAmount();
  },
  methods: {
    getDataMap() {
      countRankTotal().then(res => {
        const { code = 0, msg } = res;
        if (code === 200) {
          const array = this.applactionList.map(item => {
            if (item.key === 'totalCost') {
              return {
                ...item,
                value: formatCurrency(res[item.key])
              };
            }
            if (item.key === 'usrStatisticsCount') {
              return {
                ...item,
                value: formatCurrencyToken(res[item.key])
              };
            }
            return {
              ...item,
              value: res[item.key],
            };
          });
          this.applactionList = array;
          console.log(res, 'res');
          // 通道调用量排名
          const channelRankingTotal = res.channelRankingTotal || [];
          const xData1 = channelRankingTotal.reduce((pre, cur) => {
            pre.push(cur.rankingName);
            return pre;
          }, []);
          const total_tokens1 = channelRankingTotal.reduce((pre, cur) => {
            pre.push(cur.totalTokens);
            return pre;
          }, []);
          const itemSeries = {
            type: 'bar',
            animationDuration: 2800,
            animationEasing: 'quadraticOut',
            itemStyle: { color: 'rgb(93,171,237)' },
          };
          if (!this.isMobile) {
            itemSeries.barWidth = 30;
            itemSeries.data = total_tokens1;
          } else {
            itemSeries.label = {
              show: true, // 显示标签
              position: 'right', // 标签位置在柱子上方
              formatter: '{b}' // 标签内容格式为分类名称和数值
            };
            itemSeries.data = total_tokens1;
          }
          this.chartBarData1 = {
            xAxis: xData1,
            seriesData: [
              { ...itemSeries }
            ],
          };
          // 企业Tokens消耗
          const companyRankingTotal = res.companyRankingTotal || [];

          const xData2 = companyRankingTotal.reduce((pre, cur) => {
            pre.push(cur.rankingName);
            return pre;
          }, []);
          const total_tokens2 = companyRankingTotal.reduce((pre, cur) => {
            pre.push(cur.totalTokens);
            return pre;
          }, []);
          if (!this.isMobile) {
            itemSeries.barWidth = 30;
            itemSeries.data = total_tokens2;
          } else {
            itemSeries.label = {
              show: true, // 显示标签
              position: 'right', // 标签位置在柱子上方
              formatter: '{b}' // 标签内容格式为分类名称和数值
            };
            itemSeries.data = total_tokens2;
          }
          this.chartBarData2 = {
            xAxis: xData2,
            seriesData: [
              { ...itemSeries }
            ],
          };
          // 应用Tokens消耗
          const appRankingTotal = res.appRankingTotal || [];

          const tooltip3 = appRankingTotal.reduce((pre, cur) => {
            pre.push(cur.companyName);
            return pre;
          }, []);
          const xData3 = appRankingTotal.reduce((pre, cur) => {
            pre.push(cur.rankingName);
            return pre;
          }, []);
          const total_tokens3 = appRankingTotal.reduce((pre, cur) => {
            pre.push(cur.totalTokens);
            return pre;
          }, []);
          if (!this.isMobile) {
            itemSeries.barWidth = 30;
            itemSeries.data = total_tokens3;
          } else {
            itemSeries.label = {
              show: true, // 显示标签
              position: 'right', // 标签位置在柱子上方
              formatter: '{b}' // 标签内容格式为分类名称和数值
            };
            itemSeries.data = total_tokens3;
          }
          this.chartBarData3 = {
            xAxis: xData3,
            seriesData: [
              { ...itemSeries }
            ],
            title: {},
            tooltip: tooltip3,
          };
        } else {
          this.$message.error(msg || '系统出现错误');
        }
      });
    },
    // 查询chart图表数据
    getStatisticsDate() {
      this.loading = true;
      channelDateTotal({ totalDateFlag: this.timeSelection }).then(response => {
        const { code = 0, msg = '', data = [] } = response;
        this.loading = false;
        if (code === 200) {
          const xAxisArray = new Set();
          const seriesArray = [];
          const chartNameKeys = Object.keys(data);
          chartNameKeys.forEach(key => {
            const seriesItem = { type: 'line', animationDuration: 2800, animationEasing: 'quadraticOut' };
            const nameArray = key.split('###');
            if (nameArray.length >= 2) {
              const name = nameArray[0];
              seriesItem['name'] = name;
            }
            const dataArray = data[key].map(item => {
              xAxisArray.add(item.statisticalDate);
              return item.totalTokens;
            });
            seriesItem['data'] = dataArray;
            seriesArray.push(seriesItem);
          });
          this.chartLineData = {
            xAxis: Array.from(xAxisArray),
            seriesData: seriesArray,
            grid: {
              top: '25%',
            },
          };
        } else {
          this.$message.error(msg || '系统出现错误');
        }
      });
    },
    getDateTotal() {
      this.loading = true;
      dateTotal({ totalDateFlag: this.timeSelection }).then(res => {
        const { code = 0, msg = '', data = [] } = res;
        this.loading = false;
        if (code === 200) {
          // 提取所有的seriesData对象
          const seriesData = Object.values(data);
          // 根据日期进行排序
          seriesData.sort((a, b) => {
            const dateA = a[0].statisticalDate;
            const dateB = b[0].statisticalDate;
            return new Date(dateA) - new Date(dateB);
          });
          const sortedKeys = Object.keys(res.data).sort((a, b) => new Date(a) - new Date(b));
          const total_tokens_0 = Object.values(seriesData).map(items => items[0].totalTokens);
          const total_tokens_1 = Object.values(seriesData).map(items => items[1].totalTokens);
          const sortedKeyArray = sortedKeys.map(key => key);
          this.chartLineTotalData = {
            xAxis: sortedKeyArray,
            seriesData: [
              {
                type: 'line',
                animationDuration: 2800,
                animationEasing: 'quadraticOut',
                data: total_tokens_0,
                name: '当日调用量',
              },
              {
                type: 'line',
                animationDuration: 2800,
                animationEasing: 'quadraticOut',
                data: total_tokens_1,
                name: '总调用量',
              },
            ],
          };
        } else {
          this.$message.error(msg || '系统出现错误');
        }
      });
    },
    goRouter(routerPath) {
      this.$router.push(routerPath);
    },
    getComDateAmount() {
      useStatisticsComDateAmount({ totalDateFlag: this.comDateAmount }).then(res => {
        const { code = 0, msg, data = [] } = res;
        if (code === 200) {
          const xData = data.reduce((pre, cur) => {
            pre.push(cur.companyName);
            return pre;
          }, []);
          const yData = data.reduce((pre, cur) => {
            pre.push(cur.balance);
            return pre;
          }, []);
          const itemSeries = {
            type: 'bar',
            animationDuration: 2800,
            animationEasing: 'quadraticOut',
            itemStyle: { color: 'rgb(93,171,237)' },
          };
          if (!this.isMobile) {
            itemSeries.barWidth = 30;
            itemSeries.data = yData;
          } else {
            itemSeries.label = {
              show: true, // 显示标签
              position: 'right', // 标签位置在柱子上方
              formatter: '{b}' // 标签内容格式为分类名称和数值
            };
            itemSeries.data = yData;
          }
          this.chartBarData4 = {
            xAxis: xData,
            seriesData: [
              { ...itemSeries }
            ],
          };
        } else {
          this.$message.error(msg || '系统出现错误');
        }
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.overview-wrap {
  padding: 15px;
  background-color: rgb(240, 242, 245);
  position: relative;
}

.applaction-list {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-gap: 20px;
  margin-bottom: 15px;
  margin-left: 10px;
  margin-right: 10px;
}
.applaction-item {
  background: #fff;
  border-radius: 6px;
  padding: 25px 10px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  box-sizing: border-box;
  cursor: pointer;
  margin-bottom: 12px;
}
.card-view-container {
  // height: 400px;
  overflow: auto;
}
.flex {
  display: flex;
}
.applaction-item-icon {
  font-size: 50px;
}
.applaction-item-label {
  font-size: 14px;
}
.applaction-item-value {
  font-size: 16px;
  margin-top: 10px;
}
.applaction-item-collect {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.link {
  text-decoration: underline;
}
.overView-card{
  &-header{
    display: flex;
    align-items: center;
    &_left{
      flex: 1;
    }
  }
}
.marginBottom15{
  margin-bottom: 15px;
}
.overview-row{
  display: flex;
  flex-wrap: wrap;
}
.overview-col-item{
  flex: 1;
  margin: 0 5px;
}
.overview-col-item-mobile{
  width: 46%;
  margin: 0 5px;
}
</style>
