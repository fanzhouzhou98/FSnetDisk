<template>
  <div class="container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <el-row type="flex" class="row-bg">
          <el-col :span="5">
            <div class="grid-content bg-purple">
              <el-link @click="$router.push('/login')">
                <i class="el-icon-back">返回</i>
              </el-link>
            </div>
          </el-col>
          <el-col :span="5">
            <div class="grid-content bg-purple-light" />
          </el-col>
          <el-col :span="6">
            <div class="grid-content bg-purple">注册页面</div>
          </el-col>
        </el-row>
      </div>
      <div class="text item">
        <el-form ref="registerForm" :model="registerForm" status-icon :rules="rules">
          <el-form-item label="用户名" prop="name">
            <el-input v-model="registerForm.name" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码"
              autocomplete="off"
            />
          </el-form-item>
          <el-form-item label="确认密码" prop="checkPassword">
            <el-input
              v-model="registerForm.checkPassword"
              type="password"
              placeholder="请再次输入密码"
              autocomplete="off"
            />
          </el-form-item>
 <el-row>
          
<el-form-item label="验证码" prop="identifyCode">
    <el-col :span="10">
            <el-input
              v-model="registerForm.identifyCode"
              type="input"
              placeholder="请输入"
              style="width:95%"
            />
             </el-col>
              <el-col :span="8">
<div @click="refreshCode" style="cursor: pointer;width:80px;height:40px;display:inline-block;">
            <s-identify :identifyCode="identifyCode" style="cursor: pointer;width:80px;height:40px;display:inline-block;"></s-identify>
            </div>
            </el-col>
             </el-form-item>
          </el-row>
          <el-form-item>
            <el-button style="width:100%" type="primary" @click="submitForm('registerForm')">注册</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script>
import SIdentify from '../component/identify.vue'
import userApi from '../api/user'
import md5 from 'md5'
export default {
  components: { SIdentify },
  name: 'Register',
  data() {
      let identifyValidator = (rule, value, callback) => {
      if (value === "" || value === null) {
        callback(new Error("请输入验证码"));
      } else if (value != this.identifyCode) {
        callback(new Error("验证码输入错误"));
      } else {
        callback();
      }
    };
    var validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        if (this.registerForm.checkPassword !== '') {
          this.$refs.registerForm.validateField('checkPassword')
        }
        callback()
      }
    }
    var validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.registerForm.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      registerForm: {
        name: '',
        password: '',
        checkPassword: '',
         identifyCode: '',
      },
         // 图片验证码
   identifyCode: '',
   // 验证码规则
   identifyCodes: '3456789ABCDEFGHGKMNPQRSTUVWXY',
      rules: {
        name: [
          { required: true, message: '用户名不能为空', trigger: 'blur' },
          { min: 4, message: '用户名长度不能少于4位', trigger: 'blur' }
        ],
        password: [
          { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
          { required: true, validator: validatePass, trigger: 'blur' }
        ],
        checkPassword: [
          { required: true, validator: validatePass2, trigger: 'blur' }
        ],
         identifyCode:[
          { validator: identifyValidator, trigger: "blur"}
        ]
      }
    }
  },
  created() {
   this.identifyCode = ''
   this.makeCode(this.identifyCodes, 4)
  },
  methods: {
    // 切换验证码
     refreshCode() {
   this.identifyCode = ''
   this.makeCode(this.identifyCodes, 4)
   console.log(1,this.identifyCode)
     },
  // 生成随机验证码
  makeCode(o, l) {
    for (let i = 0; i<l; i++) {
      let randomIndex = Math.floor(Math.random() * (o.length - 0) + 0)
      console.log(randomIndex)
      this.identifyCode = this.identifyCode+this.identifyCodes[randomIndex]
    }
  },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          const { name, password } = this.registerForm
          userApi.register({
            name,
            password: md5(password)
          }).then(res => {
            this.$message1000('注册成功')
            this.$router.push('/login')
          })
        } else {
          console.log('registerForm error submit!!')
          return false
        }
      })
    }
  }
}
</script>

<style scoped>
html,
body {
  height: 100%;
  padding: 0;
  margin: 0;
  background-color: #f5f5f5;
}
.container {
  display: flex;
  justify-content: center;
}
.box-card {
  width: 23rem;
  margin: 5% auto;
}
@media only screen and (max-width: 796px) {
  .box-card {
    width: 100%;
  }
}
</style>
