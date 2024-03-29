import request from '@/utils/request';

// 查询公司信息列表
export function listCompany(query) {
  return request({
    url: '/system/company/list',
    method: 'get',
    params: query,
  });
}

// 查询公司信息详细
export function getCompany(id) {
  return request({
    url: '/system/company/' + id,
    method: 'get',
  });
}

// 新增公司信息
export function addCompany(data) {
  return request({
    url: '/system/company',
    method: 'post',
    data: data,
  });
}

// 修改公司信息
export function updateCompany(data) {
  return request({
    url: '/system/company',
    method: 'put',
    data: data,
  });
}

// 删除公司信息
export function delCompany(id) {
  return request({
    url: '/system/company/' + id,
    method: 'delete',
  });
}

// 导出公司信息
export function exportCompany(query) {
  return request({
    url: '/system/company/export',
    method: 'get',
    params: query,
  });
}

// 查询所有模板
export function listAllTemps(query) {
  return request({
    url: '/system/template/list',
    method: 'get',
    params: query,
  });
}

// 上传营业执照
export function uploadBusinessLicense(data) {
  return request({
    url: '/system/company/uploadBusinessLicense',
    method: 'post',
    data: data,
  });
}

// 营业执照审核
export function auditBusinessLicense(data) {
  return request({
    url: '/system/company/auditBusinessLicense',
    method: 'post',
    data: data,
  });
}
// 查看管理员
export function getCompanyAdmins(params) {
  return request({
    url: '/system/company/getCompanyAdmins',
    method: 'get',
    params,
  });
}
// 修改管理员
export function userAdminUpdateUser(data = {}) {
  return request({
    url: '/selfcom/user/adminUpdateUser',
    method: 'post',
    data,
  });
}
