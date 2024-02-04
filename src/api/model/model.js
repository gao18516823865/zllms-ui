import request from '@/utils/request';
import { praseStrEmpty } from '@/utils/ruoyi';
import { objectToUrlParams } from '@/utils/StringUtil';

// 模型列表
export function modelList(query) {
  return request({
    url: '/model/config/list',
    method: 'get',
    params: query,
  });
}
// 模型首页列表
export function modelInfoListUrl() {
  return request({
    url: '/model/info/list',
    method: 'get',
  });
}

// 模型信息列表
export function modelInfoList(query) {
  return request({
    url: '/model/info/list',
    method: 'get',
    params: query,
  });
}

// 模型列表
export function modelConfigListUrl(params = {}) {
  return request({
    url: '/model/config/list',
    method: 'get',
    params: params,
  });
}

// 查询模型信息
export function getModelInfo(id) {
  return request({
    url: '/model/info/' + praseStrEmpty(id),
    method: 'get',
  });
}

// 新增模型信息
export function addModelInfo(data) {
  return request({
    url: '/model/info/add',
    method: 'post',
    data: data,
  });
}

// 修改模型信息
export function updateModelInfo(data) {
  return request({
    url: '/model/info/update',
    method: 'post',
    data: data,
  });
}

// 修改模型信息状态
export function modelInfoStatus(id) {
  return request({
    url: '/model/info/modelStatus/' + praseStrEmpty(id),
    method: 'get',
  });
}

// 模型明细列表
export function modelDetailList(query) {
  return request({
    url: '/model/use/detail/list',
    method: 'get',
    params: query,
  });
}

// 使用明细统计
export function useDetailStatistic(query) {
  return request({
    url: '/model/use/detail/statistic',
    method: 'get',
    params: query,
  });
}

// 模型使用账单明细列表
export function modelSumList(query) {
  return request({
    url: '/model/use/detail/billList',
    method: 'get',
    params: query,
  });
}

// 查询模型信息
export function getModelConfigInfo(id) {
  return request({
    url: '/model/config/' + praseStrEmpty(id),
    method: 'get',
  });
}

// 新增模型
export function addModel(data) {
  return request({
    url: '/model/config/add',
    method: 'post',
    data: data,
  });
}

// 修改模型
export function updateModel(data) {
  return request({
    url: '/model/config/update',
    method: 'post',
    data: data,
  });
}

// 修改模型状态
export function modelStatus(id) {
  console.log(id);
  return request({
    url: '/model/config/modelStatus/' + praseStrEmpty(id),
    method: 'get',
  });
}

// 通道列表
export function channelList(query) {
  return request({
    url: '/model/channel/selectList',
    method: 'get',
    params: query,
  });
}
// 查询通道信息
export function getChannelInfo(id) {
  return request({
    url: '/model/channel/' + praseStrEmpty(id),
    method: 'get',
  });
}

// 新增通道
export function addChannel(data) {
  return request({
    url: '/model/channel/add',
    method: 'post',
    data: data,
  });
}

// 修改通道
export function updateChannel(data) {
  return request({
    url: '/model/channel/update',
    method: 'post',
    data: data,
  });
}

// 修改通道状态
export function channelStatus(id) {
  return request({
    url: '/model/channel/channelStatus/' + praseStrEmpty(id),
    method: 'get',
  });
}

// 应用列表
export function appListUrl() {
  return request({
    url: '/corpApp/corpAppList',
    method: 'get',
  });
}

// 应用列表新
export function appListsUrl(query) {
  return request({
    url: '/corpApp/appList',
    method: 'get',
    params: query,
  });
}

// 创建应用
export function createCorpAppUrl(params = {}) {
  return request({
    url: '/corpApp/createCorpApp',
    method: 'post',
    data: params,
  });
}

// 修改应用
export function updateCorpAppUrl(params = {}) {
  return request({
    url: '/corpApp/updateCorpApp',
    method: 'post',
    data: params,
  });
}

// 通道信息列表
export function modelChannelListUrl(params = {}) {
  return request({
    url: '/model/channel/list',
    method: 'get',
    data: params,
  });
}
// chart 图表
export function channelDateTotal(params = {}) {
  return request({
    url: '/model/use/statistics/channelDateTotal' + `?${objectToUrlParams(params)}`,
    method: 'get',
  });
}
// chart 图表
export function dateTotal(params = {}) {
  return request({
    url: '/model/use/statistics/dateTotal' + `?${objectToUrlParams(params)}`,
    method: 'get',
  });
}
// 账户信息
export function findCropAccountUrl(params = {}) {
  return request({
    url: '/corpAccount/findCropAccount',
    method: 'post',
    data: params,
  });
}

// 数量和排名统计
export function countRankTotal(params = {}) {
  return request({
    url: '/model/use/statistics/countRankTotal',
    method: 'get',
    data: params,
  });
}

// 企业详情
export function findcorpAppById(params = {}) {
  return request({
    url: '/corpApp/findCorpAppById' + `?${objectToUrlParams(params)}`,
    method: 'get',
  });
}
// 查询企业有效的通道列表
export function queryCropChannelList(params = {}) {
  return request({
    url: '/model/channel/queryCropChannelList',
    method: 'get',
    params
  });
}
// 更新通道信息
export function assignCorpChannel(data = {}) {
  return request({
    url: '/model/channel/assignCorpChannel',
    method: 'post',
    data
  });
}
// 查询应用有效的通道列表
export function queryAppChannelList(params = {}) {
  return request({
    url: '/model/channel/queryAppChannelList',
    method: 'get',
    params
  });
}
// 分配应用通道
export function assignAppChannel(data = {}) {
  return request({
    url: '/model/channel/assignAppChannel',
    method: 'post',
    data
  });
}
// 批量分配应用通道
export function batchAssignCorpChannel(params = {}) {
  return request({
    url: '/model/channel/batchAssignCorpChannel',
    method: 'get',
    params
  });
}
// 查看应用的调用量情况
export function statisticsViewAppUsage(params = {}) {
  return request({
    url: '/model/use/statistics/viewAppUsage',
    method: 'get',
    params
  });
}
// 查看用户的调用助手情况
export function userViewUserUsageStatistics(params = {}) {
  return request({
    url: '/ac/user/viewUserUsageStatistics',
    method: 'get',
    params
  });
}
// 查询企业统计金额
export function useStatisticsComDateAmount(params = {}) {
  return request({
    url: '/model/use/statistics/comDateAmount',
    method: 'get',
    params
  });
}
// 企业开启指定通道
export function channelOpenCorpChannel(params = {}) {
  return request({
    url: '/model/channel/openCorpChannel',
    method: 'get',
    params
  });
}
// 添加智能路由模型配置
export function autoChannelAdd(data = {}) {
  return request({
    url: '/autoChannel/add',
    method: 'post',
    data
  });
}
// 查询智能路由模型配置明细
export function autoChannelDetail(params = {}) {
  return request({
    url: '/autoChannel/detail',
    method: 'get',
    params
  });
}
// 智能路由模型配置列表
export function autoChannelList(params = {}) {
  return request({
    url: '/autoChannel/list',
    method: 'get',
    params
  });
}
// 更新智能路由模型配置
export function autoChannelUpdate(data = {}) {
  return request({
    url: '/autoChannel/update',
    method: 'post',
    data
  });
}
