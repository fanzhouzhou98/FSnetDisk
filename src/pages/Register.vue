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
        <el-form
          ref="registerForm"
          :model="registerForm"
          status-icon
          :rules="rules"
          label-width="80px"
        >
          <el-form-item label="email" prop="email">
            <el-input
              v-model="registerForm.email"
              placeholder="请输入你的邮箱"
              style="width:80%"
            />
          </el-form-item>
          <el-form-item label="用户名" prop="name">
            <el-input
              v-model="registerForm.name"
              placeholder="请输入用户名"
              style="width:80%"
            />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码"
              autocomplete="off"
              style="width:80%"
            />
          </el-form-item>
          <el-form-item label="确认密码" prop="checkPassword">
            <el-input
              v-model="registerForm.checkPassword"
              type="password"
              placeholder="请再次输入密码"
              autocomplete="off"
              style="width:80%"
            />
          </el-form-item>
          <el-row>
            <el-form-item label="验证码" prop="identifyCode">
              <el-col :span="10">
                <el-input
                  v-model="registerForm.identifyCode"
                  type="input"
                  maxlength="4"
                  placeholder="请输入"
                  style="width:95%"
                />
              </el-col>
              <el-col :span="8">
                <el-button
                  type="info"
                  :loading="codeLoading"
                  :disabled="isDisabled"
                  @click="sendVerifyCode"
                  >{{ info }}</el-button
                >
              </el-col>
            </el-form-item>
          </el-row>
        </el-form>
        <el-row>
          <el-col style="text-align:center;height:50px">
            <el-button
              style="width:30%;"
              type="primary"
              @click="submitForm('registerForm')"
              >确认注册</el-button
            >
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script>
import SIdentify from "../component/identify.vue";
import userApi from "../api/user";
import md5 from "md5";
import { Message } from "element-ui";
export default {
  components: { SIdentify },
  name: "Register",
  data() {
    let identifyValidator = (rule, value, callback) => {
      if (value === "" || value === null) {
        callback(new Error("请输入验证码"));
      } else {
        callback();
      }
    };
    let validatePass = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入密码"));
      } else {
        if (this.registerForm.checkPassword !== "") {
          this.$refs.registerForm.validateField("checkPassword");
        }
        callback();
      }
    };
    let validatePass2 = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请再次输入密码"));
      } else if (value !== this.registerForm.password) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };
    let checkEmail = (rule, value, callback) => {
      const mailReg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
      if (!value) {
        return callback(new Error("邮箱不能为空"));
      }
      setTimeout(() => {
        if (mailReg.test(value)) {
          callback();
        } else {
          callback(new Error("请输入正确的邮箱格式"));
        }
      }, 100);
    };

    return {
      isDisabled: false,
      codeLoading: false,
      info: "发送验证码",
      registerForm: {
        email: "",
        name: "",
        password: "",
        checkPassword: "",
        identifyCode: ""
      },
      rules: {
        name: [
          { required: true, message: "用户名不能为空", trigger: "blur" },
          { min: 2, message: "用户名长度不能少于4位", trigger: "blur" }
        ],
        password: [
          { min: 6, message: "密码长度不能少于6位", trigger: "blur" },
          { required: true, validator: validatePass, trigger: "blur" }
        ],
        checkPassword: [
          { required: true, validator: validatePass2, trigger: "blur" }
        ],
        email: [{ required: true, validator: checkEmail, trigger: "blur" }],
        identifyCode: [
          { required: true, validator: identifyValidator, trigger: "blur" }
        ]
      }
    };
  },
  created() {},
  methods: {
    sendVerifyCode() {
      if (!this.registerForm.email) {
        Message({
          message: "请填写你的邮箱",
          type: "error",
          duration: 1.5 * 1000
        });
        return false;
      }
      this.registerForm.identifyCode = "";
      this.codeLoading = true;
      userApi
        .sendVerifyCode({ email: this.registerForm.email })
        .then(res => {
          this.codeLoading = false;
          this.isDisabled = true;
          this.$message1000("验证码已发送");
          let time = 60;
          let timer = setInterval(() => {
            this.info = `${time--} S`;
            if (time <= 0) {
              this.info = "发送验证码";
              this.isDisabled = false;
              clearInterval(timer);
            }
          }, 1000);
        })
        .finally(() => {
          this.codeLoading = false;
        });
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          const { name, password, email, identifyCode } = this.registerForm;
          userApi
            .register({
              name,
              password: md5(password),
              email,
              code: identifyCode
            })
            .then(res => {
              this.$message1000("注册成功");
              this.$router.push("/login");
            });
        } else {
          console.log("registerForm error submit!!");
          return false;
        }
      });
    }
  }
};
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
  width: 30rem;
  margin: 5% auto;
}
@media only screen and (max-width: 796px) {
  .box-card {
    width: 100%;
  }
}
</style>
