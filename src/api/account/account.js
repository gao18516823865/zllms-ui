import request from '@/utils/request';
import { praseStrEmpty } from '@/utils/ruoyi';
// import { objectToUrlParams } from '@/utils/StringUtil';

// 企业账户列表
export function companyAccountList(query) {
  return request({
    url: '/corpAccount/companyAccountList',
    method: 'get',
    params: query,
  });
}

// 充值
export function companyRecharge(data) {
  return request({
    url: '/recharge/offlineRecharge',
    method: 'post',
    data: data,
  });
}
// 账单列表
export function billList(query) {
  return request({
    url: '/bill/list',
    method: 'get',
    params: query,
  });
}

// 账单手动扣款
export function billDeduct(id) {
  return request({
    url: '/bill/billDeduct/' + praseStrEmpty(id),
    method: 'get',
  });
}

// 资金明细列表
export function fundDetailList(query) {
  return request({
    url: '/fund/list',
    method: 'get',
    params: query,
  });
}

// 充值列表
export function rechargeList(query) {
  return request({
    url: '/recharge/list',
    method: 'get',
    params: query,
  });
}
// 资金统计
export function fundStatistic(query) {
  return request({
    url: '/fund/statistic',
    method: 'get',
    params: query,
  });
}
