import request from '@/utils/request';

// 模型列表
export function platformAppList(query) {
  return request({
    url: '/ac/queryAppList',
    method: 'get',
    params: query,
  });
}
// 开启应用
export function openApp(query) {
  return request({
    url: '/ac/openApp?appInfoId=' + query,
    method: 'get',
  });
}
// 模板下载
export function downLoadAppUserTemplate() {
  return request({
    url: '/ac/downLoadAppUserTemplate',
    method: 'get',
  });
}
// 文件上传
export function importAppUser(data = {}) {
  return request({
    url: `/ac/importAppUser`,
    method: 'post',
    data,
  });
}
// 查询应用用户列表
export function queryAppUserList(params = {}) {
  return request({
    url: '/ac/queryAppUserList',
    method: 'get',
    params,
  });
}
// 查询应用用户详情
export function queryAppUserDetail(params = {}) {
  return request({
    url: '/ac/queryAppUserDetail',
    method: 'get',
    params
  });
}
// 查询报告详情
export function reportDetails(params = {}) {
  return request({
    url: '/report/reportResult/reportDetails',
    method: 'get',
    params,
  });
}
// 更新应用用户
export function updateAppUser(data = {}) {
  return request({
    url: `/ac/updateAppUser`,
    method: 'post',
    data
  });
}
// 预设提示词查询更新
export function reportTranslationUpdate(data = {}) {
  return request({
    url: `/report/reportQuestion/reportTranslationUpdate`,
    method: 'post',
    data,
  });
}
// 更新问题
export function reportQuestionUpdate(data = {}) {
  return request({
    url: `/report/reportQuestion/update`,
    method: 'post',
    data,
  });
}

// 获取代码助手zip压缩包下载路径
export function getCodingZipDownloadPath(params = {}) {
  return request({
    url: '/ac/getCodingZipDownloadPath',
    method: 'get',
    params,
  });
}
