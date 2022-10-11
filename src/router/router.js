import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '../vuex/store'

const login = () => import('../pages/Login.vue')
const register = () => import('../pages/Register.vue')
const resetPassword = () => import('../pages/ResetPassword.vue')
const header = () => import('../pages/Header.vue')
const content = () => import('../pages/Content.vue')
const myshare = () => import('../pages/Myshare.vue')
const fileManage = () => import('../pages/fileManage.vue')
const userManage = () => import('../pages/userManage.vue')
const shareview = () => import('../pages/Shareview.vue')
const recycleCenter = () => import('../pages/RecycleCenter.vue')
const notFound = () => import('../pages/404.vue')
Vue.use(VueRouter)
const router = new VueRouter({
  mode: 'hash',
  routes: [
    {
      path: '/', redirect: '/login', meta: { title: 'FSnetDisk-登录页面' }
    },
    {
      path: '/login', component: login, meta: { title: 'FSnetDisk-登录页面' }
    },
    {
      path: '/register', component: register, meta: { title: 'FSnetDisk-注册页面' }
    },
    {
      path: '/resetPassword', component: resetPassword, meta: { title: 'FSnetDisk-重置密码' }
    },
    {
      path: '/netdisk',
      component: header,
      redirect: '/index',
      meta: { title: 'FSnetDisk-网盘' },
      children: [
        {
          path: '/index',
          component: content,
          meta: { title: 'FSnetDisk-全部文件' }
        },
        {
          path: '/myshare',
          component: myshare,
          meta: { title: 'FSnetDisk-我的分享' }
        },
        {
          path: '/user',
          component: userManage,
          meta: { title: 'FSnetDisk-用户管理' }
        },
        {
          path: '/files',
          component: fileManage,
          meta: { title: 'FSnetDisk-文件管理' }
        },
        {
          path: '/recycle',
          component: recycleCenter,
          meta: { title: 'FSnetDisk-回收站' }
        }
      ]
    },
    {
      path: '/s/:shareUrl', component: shareview, meta: { title: 'FSnetDisk-查看分享' }
    },
    {
      path: '*', component: notFound, meta: { title: 'FSnetDisk-404 Not Found' }
    }
  ]
})
export default router
