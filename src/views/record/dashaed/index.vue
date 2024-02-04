<template>
  <div class="dashboard-editor-container">
    <el-row :gutter="12">
      <el-col :span="12" :xs="{span:24}" class="marginBottom15">
        <el-card>
          <div slot="header" class="clearfix">
            <span>已支持的大模型</span>
            <el-button style="float: right; padding: 3px 0" type="text" @click="isSeeMoreModalVisible=true">查看更多</el-button>
          </div>
          <div class="model-list-view">
            <div v-for="model in modelShowList" :key="model.modelName" class="model-item-box">
              <el-image class="modal-img" :src="model.modelLogo" fit="cover" />
              <span class="modal-name-text">{{ model.modelName }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12" :xs="{span:24}" class="marginBottom15">
        <el-card>
          <div slot="header" class="clearfix">
            <span>费用一览</span>
          </div>
          <div class="fee-info-view">
            <div class="fee-view">
              <div>
                <div class="money-title-text">当前余额</div>
                <div class="money-text">{{ balanceInfo.balance }}</div>
              </div>
              <div class="fee-button-grow">
                <div>
                  <el-button type="primary" @click="onRechargeAction">充值</el-button>
                  <el-button type="primary" @click="onRechargeDetail">明细</el-button>
                </div>
                <div class="certification-btn">
                  <a v-if="company.certificationStatus === 0 || company.certificationStatus === 3 || company.certificationStatus === 4" href="#" class="link-type" style="text-decoration:underline;" @click="onBusinessLicenseReward">获取认证奖励金</a>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="12">
      <el-col :span="12" :xs="{span:24}" class="marginBottom15">
        <el-card>
          <div slot="header" class="clearfix">
            <span>应用一览</span>
            <el-button style="float: right; padding: 3px 0" type="text" @click="onCreateNewAppAction">创建新应用</el-button>
          </div>
          <div class="card-view-container">
            <el-table :data="appList" style="width: 100%" height="400">
              <el-table-column prop="appName" label="应用名称">
                <template slot-scope="scope">
                  <span v-if="scope.row.remark === 'ZllmsHelper'">
                    <el-button class="card-view-item-a" type="text" @click="goHandleUrl">{{scope.row.appName}}</el-button>
                  </span>
                  <span v-else>
                    {{scope.row.appName}}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="appCode" label="App Code" />
              <el-table-column prop="appSecret" label="App Secret" />
              <el-table-column fixed="right" label="操作">
                <template slot-scope="scope">
                  <el-button slot="reference" size="small" type="text" @click="applactionOpen(scope.row)">查看</el-button>
                  <span v-if="scope.row.remark !== 'ZllmsHelper'">
                    <el-popconfirm title="确定删除吗？" @confirm="onAppDeleteAction(scope.row)">
                      <el-button slot="reference" size="small" type="text">删除</el-button>
                    </el-popconfirm>
                  </span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12" :xs="{span:24}" class="marginBottom15">
        <el-card>
          <div slot="header" class="clearfix">
            <span>通道一览</span>
            <el-button style="float: right; padding: 9px 0" type="text" />
          </div>
          <div class="card-view-container">
            <el-table ref="filterTable" :data="channelList" style="width: 100%" height="400">
              <el-table-column prop="channelName" label="通道名称" />
              <el-table-column prop="channelCode" label="通道ID" />
              <el-table-column prop="totalTokens">
                <template slot="header">
                  消耗量
                  <el-tooltip class="item" effect="dark" content="单位：token，1token≈1个单词，1个汉字≈2个token" placement="top">
                    <i class="el-icon-info" />
                  </el-tooltip>
                </template></el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template slot-scope="scope">
                  <el-tag v-if="(scope.row.status === 1 && scope.row.channelId !== null)" type="success" disable-transitions>已开启</el-tag>
                  <el-tag v-if="(scope.row.status === 1 && scope.row.channelId === null)" type="info" disable-transitions>未开启</el-tag>
                  <el-tag v-if="scope.row.status === 0" type="danger" disable-transitions>已停用</el-tag>
                </template>
              </el-table-column>
              <el-table-column fixed="right" label="操作">
                <template slot-scope="scope">
                  <el-button v-if="(scope.row.status === 1 && scope.row.channelId === null)" size="small" type="text" @click="openChannel(scope.row)">开启通道</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row class="marginBottom15">
      <el-col :span="24">
        <el-card>
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
            <line-chart :chart-data="chartLineData" :height="`500px`" />
          </el-col>
          <el-col :span="12" :xs="{span:24}">
            <line-chart :chart-data="chartLineTotalData" height="500px" />
          </el-col>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="12">
      <el-col :span="12" :xs="{span:24}" class="marginBottom15">
        <el-card>
          <div slot="header">
            <span>应用调用量情况</span>
          </div>
          <div class="card-view-container ">
            <BarChart :chart-data="statisticsViewAppUsageData" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="12" :xs="{span:24}" class="marginBottom15">
        <el-card>
          <div slot="header">
            <span>智友办公助手用户使用情况</span>
          </div>
          <div class="card-view-container ">
            <BarChart :chart-data="userViewUserUsageStatisticsData" />
          </div>
        </el-card>
      </el-col>
    </el-row>
    <!-- 支持的模型 -->
    <el-dialog title="已支持的大模型" :visible.sync="isSeeMoreModalVisible" :width="isMobile ? dialogMobileWidth : '70%'">
      <el-table :data="modelList" style="width: 100%;">
        <el-table-column label="大模型" :width="!isMobile && 120">
          <template slot-scope="scope">
            <el-image class="modal-img-size" :src="scope.row.modelLogo " fit="cover" />
          </template>
        </el-table-column>
        <el-table-column property="modelName" label="名称" :min-width="!isMobile && 30" />
        <el-table-column :min-width="!isMobile && 40">
          <template slot="header">
            价格
            <el-tooltip class="item" effect="dark" content="单位：1k token，1token≈1个单词，1个汉字≈2个token" placement="top">
              <i class="el-icon-info" />
            </el-tooltip>
          </template>
          <template slot-scope="scope">
            <div v-for="priceInfo in scope.row.unitPriceInfo.split('##')" :key="priceInfo">
              {{ priceInfo}}
            </div>
          </template>
        </el-table-column>
        <el-table-column property="modelDes" label="模型介绍" />
      </el-table>
    </el-dialog>
    <!-- 创建应用 -->
    <el-dialog :width="isMobile ? dialogMobileWidth : dialogDefaultWidht" title="创建新应用" :visible.sync="isCreateAppModalVisible">
      <el-form ref="appForm" :model="appForm" :rules="rules" label-position="left">
        <el-row>
          <el-col :span="dialogSpan">
            <el-form-item label="应用名称" label-width="100px" prop="appName">
              <el-input v-model="appForm.appName" autocomplete="off" />
            </el-form-item>
          </el-col>
          <el-col :span="dialogSpan">
            <p>请选择该应用可用的通道</p>
            <el-form-item label=" ">
              <el-checkbox-group v-model="enterpriseChannelIds">
                <el-checkbox v-for="item in enterpriseChannelList" :key="item.id" :label="item.id">{{item.channelName}}</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dashaed_dialog_footer">
        <el-button @click="onCloseAllModal">取 消</el-button>
        <el-button type="primary" @click="onCreateAppAction">确定</el-button>
      </div>
    </el-dialog>
    <!-- 充值 -->
    <el-dialog :width="isMobile ? dialogMobileWidth : dialogDefaultWidht" title="充值" :visible.sync="isRechargeModalVisible">
      <el-form ref="rechargeForm" :model="rechargeForm" :rules="rules" :label-position="labelPosition">
        <el-form-item label="兑换码" label-width="120px" prop="redeemCode">
          <el-input v-model="rechargeForm.redeemCode" autocomplete="off" placeholder="目前只支持兑换码和线下充值" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dashaed_dialog_footer">
        <el-button @click="isRechargeModalVisible = false">取消{{labelPosition}}</el-button>
        <el-button type="primary" @click="rechargeAction">确定{{isMobile}}</el-button>
      </div>
    </el-dialog>
    <!-- 查看 appId-->
    <el-dialog append-to-body :visible.sync="dialogVisible" :width="isMobile ? dialogMobileWidth : dialogDefaultWidht" class="app-info-dialog">
      <div>
        <div class="app-info-tips-text">请妥善保管您的App Id和App Secret，防止泄露。</div>
        <div class="app-info-text"><span class="app-info-tips-text">App Id：</span>{{ dialogAppCode }}</div>
        <div class="app-info-text"><span class="app-info-tips-text">App Secret：</span>{{ dialogAppSecret }}</div>
      </div>
      <p>该应用可用的通道</p>
      <div class="app-info-content">
        <div v-for="(item,index) in dialogAppModelChannels" :key="index">
          {{item.channelName}}
        </div>
      </div>
      <div slot="footer" class="dashaed_dialog_footer">
        <el-button type="primary" @click="applactionOk">知道了</el-button>
      </div>
    </el-dialog>
    <!-- 上传营业执照信息 -->
    <el-dialog v-loading="loading" :title="title_license" :visible.sync="open_license" :width="isMobile ? dialogMobileWidth : '500px'" append-to-body>
      <el-form ref="licenseForm" :model="licenseForm" :rules="licenseRules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <template>
              <el-form-item label="营业执照" prop="businessLicense">
                <el-upload class="avatar-uploader" :show-file-list="false" :http-request="requestUpload" :before-upload="beforeUpload" action="" accept=".png,.jpg,.jpeg,">
                  <img v-if="licenseForm.businessLicense" :src="licenseForm.businessLicense" class="avatar">
                  <i v-else class="el-icon-plus avatar-uploader-icon" />
                </el-upload>
              </el-form-item>
            </template>
          </el-col>
          <el-col class="business-desc">
            <p>1.请上传清晰、完整、无遮挡的营业执照照片。</p>
            <p>2.请求原价红章清晰，如果是复印件需要加盖红章。</p>
            <p>3.图片不能超过5M，图片格式为PNG、JPG、JPEG等</p>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dashaed_dialog_footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  modelInfoListUrl,
  modelConfigListUrl,
  appListUrl,
  createCorpAppUrl,
  updateCorpAppUrl,
  modelChannelListUrl,
  channelDateTotal,
  findCropAccountUrl,
  dateTotal,
  findcorpAppById,
  queryAppChannelList,
  assignAppChannel,
  statisticsViewAppUsage,
  userViewUserUsageStatistics,
  channelOpenCorpChannel
} from '@/api/model/model';
import { mapGetters } from 'vuex';
import { uploadBusinessLicense } from '@/api/system/company';
import { redeemRedeemCodeUrl } from '@/api/login';
import { toFixedString } from '@/utils/StringUtil';
import LineChart from '@/views/dashboard/LineChart';
import BarChart from '../../dashboard/BarChart';
import device from '@/mixin/device';

export default {
  name: 'Index',
  components: {
    LineChart,
    BarChart,
  },
  mixins: [device],
  data() {
    return {
      loading: false,
      isSeeMoreModalVisible: false, // 查看更多大模型
      isCreateAppModalVisible: false, // 创建新应用
      isCreateAppSuccessModalVisible: false, // 创建应用是否成功
      isRechargeModalVisible: false, // 充值
      modelList: [], // 已支持的大模型list
      modelShowList: [], // 显示的列表
      modelDetailList: [], // 某一个模型的子列表
      appList: [], // 应用列表
      appForm: {
        appName: '',
      },
      title_license: '',
      open_license: false,
      licenseForm: {
        businessLicense: null,
      },
      licenseRules: {},
      fileInfo: null,
      appInfo: {},
      channelList: [], // 通道信息列表
      timeSelection: 'week',
      rules: {
        appName: [{ required: true, message: '请输入应用名称', trigger: 'blur' }],
        redeemCode: [{ required: true, message: '请输入兑换码', trigger: 'blur' }],

        // region: [{ required: true, message: '请选择活动区域', trigger: 'change' }],
      },

      chartLineData: {
        xAxis: [],
        seriesData: [],
        legend: [],
      },
      balanceInfo: {},

      rechargeForm: {
        redeemCode: '',
      },
      chartLineTotalData: {
        xAxis: [],
        seriesData: [],
        legend: [],
      },
      dialogVisible: false,
      dialogAppCode: '',
      dialogAppSecret: '',
      dialogAppModelChannels: [],
      visibleEnterpriseChannel: false,
      enterpriseChannelLoading: false,
      enterpriseChannelList: [],
      enterpriseChannelId: '',
      enterpriseChannelIds: [], // 选中的数组
      statisticsViewAppUsageData: {
        xAxis: [],
        seriesData: [],
        legend: [],
      },
      userViewUserUsageStatisticsData: {
        xAxis: [],
        seriesData: [],
        legend: [],
      },
    };
  },
  computed: {
    ...mapGetters(['company']),
  },
  watch: {
    timeSelection: function (val) {
      this.timeSelection = val;
      this.getStatisticsDate();
      this.getDateTotal();
    },
  },

  created() {
    this.getModelList();
    this.getAppListUrl();
    this.getChannelList();
    this.getStatisticsDate();
    this.getCropAccountInfo();
    this.getDateTotal();
    this.getViewAppUsage();
    this.getUserViewUserUsageStatistics();
  },
  methods: {
    // 创建新应用
    onCreateNewAppAction(e) {
      this.appForm.appName = '';
      this.isCreateAppModalVisible = true;
      this.getQueryAppChannelList();
    },
    // 充值
    onRechargeAction(e) {
      (this.rechargeForm.redeemCode = ''), (this.isRechargeModalVisible = true);
    },
    // 关闭所有modal
    onCloseAllModal() {
      this.isSeeMoreModalVisible = false;
      this.isCreateAppModalVisible = false;
      this.isRechargeModalVisible = false;
      this.isCreateAppSuccessModalVisible = false;
    },
    // 充值明细
    onRechargeDetail() {
      this.$router.push('/account/fund/list');
    },
    // 模型信息列表
    getModelList() {
      this.loading = true;
      modelInfoListUrl().then(response => {
        const { code = 0, msg = '', rows = [] } = response;
        this.loading = false;
        if (code === 200) {
          if (rows && rows.length <= 5) {
            this.modelShowList = rows;
          } else {
            this.modelShowList = rows.filter((_, index) => {
              return index <= 5;
            });
          }
          this.modelList = rows;
        } else {
          this.$message.error(msg || '系统出现错误');
        }
      });
    },
    // 模型信息列表
    getModelConfigList(record = {}) {
      this.loading = true;
      modelConfigListUrl({ modelInfoId: record.id }).then(response => {
        const { code = 0, msg = '', rows = [] } = response;
        this.loading = false;
        if (code === 200) {
          this.isSeeMoreModalVisible = true;
          this.modelDetailList = rows;
        } else {
          this.$message.error(msg || '系统出现错误');
        }
      });
    },

    // 获取应用
    getAppListUrl() {
      this.loading = true;
      appListUrl().then(response => {
        const { code = 0, msg = '', data = [] } = response;
        this.loading = false;
        if (code === 200) {
          this.appList = data;
        } else {
          this.$message.error(msg || '系统出现错误');
        }
      });
    },
    // 创建应用
    onCreateAppAction() {
      this.$refs['appForm'].validate(valid => {
        if (valid) {
          this.loading = true;
          if (this.enterpriseChannelIds.length === 0) {
            this.$message.warning('请选择通道');
            return;
          }
          createCorpAppUrl({
            ...this.appForm,
            channelIds: this.enterpriseChannelIds
          }).then(response => {
            // eslint-disable-next-line object-curly-spacing
            const { code = 0, msg = '', data = {} } = response;
            this.loading = false;
            if (code === 200) {
              this.appInfo = data || {};
              this.$message({
                message: '应用创建成功',
                type: 'success',
              });
              this.getAppListUrl();
              this.isCreateAppModalVisible = false;
              this.enterpriseChannelIds = [];
            } else {
              this.$message.error(msg || '系统出现错误');
            }
          });
        } else {
          return false;
        }
      });
    },
    // 删除应用
    onAppDeleteAction(record) {
      updateCorpAppUrl({ id: record.id, state: 0 }).then(response => {
        console.log('createCorpAppUrl response ===', response);
        const { code = 0, msg = '' } = response;
        this.loading = false;
        if (code === 200) {
          this.$message({
            message: msg,
            type: 'success',
          });
          this.getAppListUrl();
        } else {
          this.$message.error(msg || '系统出现错误');
        }
      });
    },

    // 模型信息列表
    getChannelList() {
      this.loading = true;
      modelChannelListUrl({}).then(response => {
        const { code = 0, msg = '', rows = [] } = response;
        this.loading = false;
        if (code === 200) {
          this.channelList = rows;
        } else {
          this.$message.error(msg || '系统出现错误');
        }
      });
    },
    // 查询chart图表数据
    getStatisticsDate() {
      this.loading = true;
      channelDateTotal({ totalDateFlag: this.timeSelection }).then(response => {
        console.log('channelDateTotal response ===', response);
        const { code = 0, msg = '', data = [] } = response;
        this.loading = false;
        if (code === 200) {
          console.log('rows ===', data);
          const xAxisArray = new Set();
          const seriesArray = [];
          const chartNameKeys = Object.keys(data);
          chartNameKeys.forEach(key => {
            const seriesItem = { type: 'line', animationDuration: 2800, animationEasing: 'quadraticOut' };
            const nameArray = key.split('###');
            console.log('nameArray ===', nameArray);
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
          console.log('this.chartLineData ===', this.chartLineData);
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
          console.log('rows ===', data);
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
    // 查询账户数据
    getCropAccountInfo() {
      this.loading = true;
      findCropAccountUrl().then(response => {
        console.log('getCropAccountInfo response ===', response);
        const { code = 0, msg = '', data = {}} = response;
        this.loading = false;
        if (code === 200) {
          console.log('data ===', data);
          const { balance } = data || {};
          this.balanceInfo = { ...data, balance: toFixedString(balance) };
        } else {
          this.$message.error(msg || '系统出现错误');
        }
      });
    },
    rechargeAction() {
      this.loading = true;
      this.$refs['rechargeForm'].validate(valid => {
        if (valid) {
          this.loading = true;
          redeemRedeemCodeUrl({ ...this.rechargeForm, comId: this.balanceInfo.comId })
            .then(response => {
              console.log('redeemRedeemCodeUrl response ===', response);
              const { code = 0, msg = '' } = response;
              this.loading = false;
              this.isRechargeModalVisible = false;
              if (code === 200) {
                this.$message({
                  message: msg,
                  type: 'success',
                });
                this.getCropAccountInfo();
              } else {
                this.$message.error(msg || '系统出现错误');
              }
            })
            .catch(err => {
              this.loading = false;
              console.log('catch ===', err);
            });
        }
      });
    },
    applactionOpen(row) {
      const id = row.id;
      findcorpAppById({ id }).then(response => {
        const { code = 0, msg = '', data = {}} = response;
        if (code === 200) {
          this.dialogAppCode = data.appCode;
          this.dialogAppSecret = data.appSecret;
          this.dialogVisible = true;
          this.dialogAppModelChannels = data.modelChannels;
        } else {
          this.$message.error(msg || '系统出现错误');
        }
      });
    },
    applactionOk() {
      this.dialogVisible = false;
      this.dialogAppModelChannels = [];
    },
    // 获取认证奖励
    onBusinessLicenseReward() {
      this.open_license = true;
      this.title_license = '营业执照';
    },
    /** 取消按钮 */
    cancel() {
      this.open_license = false;
      this.licenseForm.businessLicense = undefined;
      this.fileInfo = undefined;
    },
    // 覆盖默认的上传行为
    requestUpload() {},
    // 上传营业执照预处理
    beforeUpload(file) {
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        this.$message.error('上传营业执照图片大小不能超过 5MB!');
        return false;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.licenseForm.businessLicense = reader.result;
      };
      this.fileInfo = file;
      return true;
    },
    /** 提交营业执照按钮 */
    submitForm: function () {
      this.$refs['licenseForm'].validate(valid => {
        if (valid) {
          this.loading = true;
          const formData = new FormData();
          formData.append('file', this.fileInfo);
          this.licenseForm.businessLicense = null;
          uploadBusinessLicense(formData).then(response => {
            this.loading = false;
            if (response.code === 200) {
              this.msgSuccess('您已提交营业执照认证，平台审核通过后奖励将自动入账，请关注您的账户状态.');
              this.open_license = false;
              this.licenseForm.businessLicense = undefined;
              this.fileInfo = undefined;
              this.company.certificationStatus = 1;
            } else {
              this.$message.error(response.msg);
            }
          });
        }
      });
    },
    goHandleUrl() {
      window.open('https://zhiyou.farcloud.com/', '_blank');
    },
    // 分配企业通道List
    getQueryAppChannelList() {
      this.enterpriseChannelLoading = true;
      queryAppChannelList({
        comId: '',
        appId: '',
      }).then(res => {
        this.enterpriseChannelLoading = false;
        this.enterpriseChannelList = res.data;
        console.log(res, '===getQueryAppChannelList');
        this.$nextTick(() => {
          // 在下一个Tick中重新执行的代码
          // if (res.data.length > 0) {
          //   res.data.forEach(item => {
          //     if (item.assign) {
          //       this.$refs.enterpriseChannel.toggleRowSelection(item);
          //     }
          //   });
          // }
        });
      });
    },
     // 选择
     enterpriseChannelSelect(selection) {
      this.enterpriseChannelIds = selection.map(item => item.id);
      console.log(selection.map(item => item.id), 'selection.map(item => item.id)', selection);
    },
    // 更新通道
    enterpriseChannelUpDate() {
      assignAppChannel({
        appId: this.enterpriseChannelId,
        channelIds: this.enterpriseChannelIds
      }).then(res => {
        console.log(res, 'assignCorpChannel');
        const { code = 0, msg = '' } = res;
        if (code === 200) {
          this.$message.success(msg);
          return;
        }
        this.$message.error(msg);
      });
    },
    getViewAppUsage() {
      statisticsViewAppUsage().then(res => {
        const { code = 0, data = [] } = res;
        if (code === 200) {
          const xData = data.map(item => (item.appName));
          const yData = data.map(item => (item.totalTokens));
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
          this.statisticsViewAppUsageData = {
            xAxis: xData,
            seriesData: [
              { ...itemSeries }
            ],
          };
        }
      });
    },
    getUserViewUserUsageStatistics() {
      userViewUserUsageStatistics().then(res => {
        const { code = 0, data = [] } = res;
        if (code === 200) {
          const xData = data.map(item => (item.appUserName));
          const yData = data.map(item => (item.totalTokens));
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
          this.userViewUserUsageStatisticsData = {
            xAxis: xData,
            seriesData: [
              { ...itemSeries }
            ],
          };
        }
      });
    },
    // 开启通道
    openChannel(row) {
      const { id: channelId } = row;
      channelOpenCorpChannel({ channelId }).then(res => {
        const { code = 0, msg = '' } = res;
        if (code === 200) {
          this.$message.success(msg);
          this.getChannelList();
          return;
        }
        this.$message.error(msg);
      });
    }
  },
};
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 15px;
  background-color: rgb(240, 242, 245);
  position: relative;
}
/deep/ .card-view-container {
  height: 400px;
  overflow: auto;
}
.model-list-view {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  min-height: 120px;
  overflow-y: auto;
}
.fee-info-view {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  min-height: 120px;
}

.model-item-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 25px;
}
.modal-img {
  width: 80px;
  height: 80px;
  border-radius: 6px;
}
.modal-img-size {
  width: 80px;
  height: 80px;
  border-radius: 6px;
}
.modal-name-text {
  color: #333;
  font-weight: 500;
  font-size: 14px;
  padding-top: 10px;
}

.fee-view {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
.money-title-text {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}
.money-text {
  font-size: 33px;
  font-weight: 500;
}
.flex {
  display: flex;
}
/deep/ .avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
/deep/ .avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
/deep/ .avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
/deep/ .avatar {
  width: 178px;
  height: 178px;
  display: block;
}
.certification-btn {
  font-size: 12px;
  margin-top: 15px;
}
.fee-button-grow {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
}
.business-desc {
  p {
    margin: 8px;
    font-size: 16px;
    color: #8c8c97;
  }
}
.card-view-item-a {
  text-decoration: underline;
}
.app-info-dialog{
  .app-info-tips-text {
    font-size: 14px;
    color: #666;
  }
  .app-info-text {
    font-size: 18px;
    color: #333;
    padding-top: 10px;
  }
  .modelChannelsModal{
    margin-top: 10px;
  }
  p{
      font-weight: bold;
    }
  .app-info-content{
    margin-top: 10px;
    display: flex;
    flex-wrap: wrap;
    div{
      margin-right: 20px;
      line-height: 30px;
    }
  }
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
.dashaed_dialog_footer{
  display: flex;
  justify-content: flex-end;
}
</style>
