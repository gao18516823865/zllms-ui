import request from '@/utils/request';

// 批量生成兑换码（系统管理员用）
export const batchCreate = (data = {}) => {
  return request({
    url: '/redeemCode/batchCreate',
    method: 'post',
    data
  });
};
// 查询兑换码列表
export const redeemCodeList = (params) => {
  return request({
    url: '/redeemCode/list',
    method: 'get',
    params
  });
};
// 渠道op
export const getUserList = (params) => {
  return request({
    url: '/redeemCode/getUserList',
    method: 'get',
    params
  });
};
// 兑换码文档
export const downLoadAppUserTemplate = (params) => {
  return request({
    url: '/redeemCode/downLoadAppUserTemplate',
    method: 'get',
    params
  });
};
// 划拨生成兑换码（系统管理员用）
export const transfer = (data = {}) => {
  return request({
    url: '/redeemCode/transfer',
    method: 'post',
    data
  });
};
// 获取所有批次id
export const getAllBatchId = (params) => {
  return request({
    url: '/redeemCode/getAllBatchId',
    method: 'get',
    params
  });
};
// 获取批次结果
export const getBatchInfo = (params = {}) => {
  return request({
    url: '/redeemCode/getBatchInfo',
    method: 'get',
    params
  });
};
// 获取兑换码类型
export const getRedeemType = (params = {}) => {
  return request({
    url: '/redeemCode/getRedeemType',
    method: 'get',
    params
  });
};
