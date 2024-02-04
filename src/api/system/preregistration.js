import request from '@/utils/request';

// 预注册列表
export function preregistrationList(params = {}) {
  return request({
    url: '/preregistration/list',
    method: 'get',
    params
  });
}
// 补偿注册
export function compensate(params = {}) {
  return request({
    url: '/preregistration/compensate',
    method: 'get',
    params
  });
}
