import request from '@/utils/request';

// 新增 or 编辑
export function assistantEdit(data = {}) {
  return request({
    url: `/assistant/edit`,
    method: 'post',
    data,
  });
}
// 岗位助手列表和平台助手列表
export function assistantQueryList(params = {}) {
  return request({
    url: `/assistant/queryList`,
    method: 'get',
    params,
  });
}
// 助手-发布状态接口-发布
export function assistantPublish(id) {
  return request({
    url: `/assistant/publish/${id}`,
    method: 'get',
  });
}
// 获取提示词接口
export function promptgGetPrompt(id) {
  return request({
    url: `/assistant/prompt/getPrompt/${id}`,
    method: 'get',
  });
}
// 编辑信息接口：添加或编辑 新增 or 编辑
export function promptEdit(data = {}) {
  return request({
    url: `/assistant/prompt/edit`,
    method: 'post',
    data,
  });
}
// 删除状态接口
export function promptgDelete(id) {
  return request({
    url: `/assistant/prompt/delete/${id}`,
    method: 'get',
  });
}
// 提示词-发布状态接口-发布
export function promptgPublish(id) {
  return request({
    url: `/assistant/prompt/publish/${id}`,
    method: 'get',
  });
}
// 获取平台助手相关企业
export function assistantGetCompany(id) {
  return request({
    url: `/assistant/getCompany/${id}`,
    method: 'get',
  });
}
// 获取状态接口-获取/取消
export function assistantGain(id) {
  return request({
    url: `/assistant/gain/${id}`,
    method: 'get',
  });
}
// 删除助手
export function assistantDelete(id) {
  return request({
    url: `/assistant/delete/${id}`,
    method: 'get',
  });
}
// 助手-设置默认和取消默认
export function assistantDefault(id) {
  return request({
    url: `/assistant/settingDefault/${id}`,
    method: 'get',
  });
}
