<template>
  <div class="container">
    <el-card v-loading="loading" class="box-card">
      <div slot="header" class="clearfix" style="text-align:center">
        <span>登录页面</span>
      </div>
      <div class="text item">
        <el-form
          ref="loginForm"
          :model="loginForm"
          :rules="rules"
          label-width="80px"
        >
          <el-row>
            <el-form-item label="用户名" prop="name">
              <el-input
                v-model="loginForm.name"
                placeholder="请输入用户名"
                style="width:75%"
              />
            </el-form-item>
          </el-row>
          <el-row>
            <el-form-item label="密码" prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                autocomplete="off"
                show-password
                style="width:75%"
              />
              <el-popover
                trigger="hover"
                placement="right"
                width="160"
                v-model="popoverVisible"
                v-if="loginForm.name"
              >
                <p>忘记密码？</p>
                <div style="text-align: right; margin: 0">
                  <el-button type="primary" size="mini" @click="goToResetPage"
                    >确定</el-button
                  >
                </div>
                <i
                  class="el-icon-question"
                  slot="reference"
                  style="font-size:24px;margin-left:20px"
                ></i>
              </el-popover>
            </el-form-item>
          </el-row>
          <el-row>
            <el-form-item label="验证码" prop="identifyCode">
              <el-col :span="10">
                <el-input
                  v-model="loginForm.identifyCode"
                  type="input"
                  maxlength="4"
                  placeholder="请输入"
                  style="width:95%"
                />
              </el-col>
              <el-col :span="8">
                <div
                  @click="refreshCode"
                  style="cursor: pointer;width:80px;height:40px;display:inline-block;"
                >
                  <s-identify
                    :identifyCode="identifyCode"
                    style="cursor: pointer;width:80px;height:40px;display:inline-block;"
                  ></s-identify>
                </div>
              </el-col>
            </el-form-item>
          </el-row>
        </el-form>
        <el-row>
          <el-col style="text-align:center;height:50px">
            <el-button
              type="primary"
              :loading="submitLoading"
              style="width:30%;"
              @click="submit('loginForm')"
              >登录</el-button
            >
            <el-button @click="$router.push('/register')" style="width:30%;"
              >注册</el-button
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
export default {
  components: { SIdentify },
  name: "Login",
  data() {
    let identifyValidator = (rule, value, callback) => {
      if (value === "" || value === null) {
        callback(new Error("请输入验证码"));
      } else if (value.toUpperCase() != this.identifyCode.toUpperCase()) {
        callback(new Error("验证码输入错误"));
      } else {
        callback();
      }
    };
    return {
      popoverVisible: false,
      loading: false,
      loginForm: {
        name: "",
        password: "",
        identifyCode: ""
      },
      submitLoading: false,
      rules: {
        name: [{ required: true, message: "用户名不能为空", trigger: "blur" }],
        password: [
          { required: true, message: "密码不能为空", trigger: "blur" }
        ],
        identifyCode: [
          { required: true, validator: identifyValidator, trigger: "blur" }
        ]
      },
      // 图片验证码
      identifyCode: "",
      // 验证码规则
      identifyCodes:
        "1234567890ABCDEFGHGKMNPQRSTUVWXYabcdefghijklmnopqrstuvwxyz"
    };
  },
  created() {
    this.identifyCode = "";
    this.makeCode(this.identifyCodes, 4);
  },
  methods: {
    goToResetPage() {
      this.popoverVisible = false;
      this.$router.push({
        path: "/resetPassword",
        query: {
          username: this.loginForm.name
        }
      });
    },
    // 切换验证码
    refreshCode() {
      this.identifyCode = "";
      this.makeCode(this.identifyCodes, 4);
    },
    // 生成随机验证码
    makeCode(o, l) {
      for (let i = 0; i < l; i++) {
        let randomIndex = Math.floor(Math.random() * (o.length - 0) + 0);
        this.identifyCode = this.identifyCode + this.identifyCodes[randomIndex];
      }
    },

    submit(formName) {
      this.submitLoading = true;
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.loading = true;
          const { name, password } = this.loginForm;
          userApi
            .login({
              name,
              password: md5(password)
            })
            .then(res => {
              this.$store.commit("addUserInfo", res);
              this.$store.commit("addToken", res.token);
              this.$router.push("/netdisk");
            })
            .finally(() => {
              this.loading = false;
              this.submitLoading = false;
            });
        } else {
          this.this.makeCode(this.identifyCodes, 4);
          console.log("error submit!!");
          this.submitLoading = false;
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
  max-width: 100%;
  min-width: 30rem;
  margin: 5% auto;
}
</style>
