import request from '@/utils/request';

// 登录方法
export function login(username, password, code, uuid) {
  const data = {
    username,
    password,
    code,
    uuid,
  };
  return request({
    url: '/login',
    method: 'post',
    data: data,
  });
}

// 获取用户详细信息
export function getInfo() {
  return request({
    url: '/getInfo',
    method: 'get',
  });
}

// 退出方法
export function logout() {
  return request({
    url: '/logout',
    method: 'post',
  });
}

// 获取验证码
export function getCodeImg() {
  return request({
    url: '/captchaImage',
    method: 'get',
  });
}

// 创建企业账户
export function createCorpAppUrl(params = {}) {
  return request({
    url: '/corpAccount/createCropAccount',
    method: 'post',
    data: params,
    headers: { isToken: false },
  });
}

// 兑换
export function redeemRedeemCodeUrl(params = {}) {
  return request({
    url: '/redeemCode/redeem',
    method: 'post',
    data: params,
  });
}

// 验证码
export function smsCodeUrl(params = {}) {
  return request({
    url: '/sendSms',
    method: 'post',
    data: params,
    headers: { isToken: false },
  });
}
// 兑换h5
export function redeemRedeemCodeUrlH5(params = {}) {
  return request({
    url: '/redeemCode/redeemH5',
    method: 'post',
    data: params,
    headers: { isToken: false },
  });
}

// 修改密码
export function retrievePassword(data = {}) {
  return request({
    url: '/retrievePassword',
    method: 'post',
    data,
  });
}
// 获取验证码
export function sendRetrieveCaptcha(data = {}) {
  return request({
    url: '/sendRetrieveCaptcha',
    method: 'post',
    data,
  });
}
