import baseFetch from './base/fetch'
const fetch = (url, ...arg) => baseFetch('/user/' + url, ...arg)
export default {
  login(data) {
    return fetch('login', data)
  },
  register(data) {
    return fetch('register', data)
  },
  getInfo() {
    return fetch('info', '', 'get')
  },
  getUserList(data) {
    return fetch('list', data)
  },
  updateUser(data) {
    return fetch('update', data)
  },
  deleteUser(id) {
    return fetch('delete', id)
  },
  resetPassword(data) {
    return fetch('resetPassword', data)
  },
  updateUserName(data) {
    return fetch('updateUserName', data)
  },
  getUserInfoById() {
    return fetch('getUserInfoById', '', 'get')
  },
  sendVerifyCode(data) {
    return fetch('sendVerifyCode', data)
  },
  getUserEmailByName(data) {
    return fetch('getUserEmailByName', data)
  },
  resetPasswordByCode(data) {
    return fetch('resetPasswordByCode', data)
  },
}
