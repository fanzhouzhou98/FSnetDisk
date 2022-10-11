<template>
  <div class="container">
    <el-card v-loading="loading" class="box-card">
      <div slot="header" class="clearfix" style="text-align:center">
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
            <div class="grid-content bg-purple">重置密码页面</div>
          </el-col>
        </el-row>
      </div>
      <div class="text item">
        <el-form
          ref="resetForm"
          :model="resetForm"
          :rules="rules"
          label-width="80px"
        >
          <el-row>
            <el-form-item label="提示">
              <span>将向你的{{ pwdEmail(email) }}邮箱发送验证码</span>
            </el-form-item>
          </el-row>
          <el-row>
            <el-form-item label="密码" prop="newPassword">
              <el-input
                v-model="resetForm.newPassword"
                type="password"
                placeholder="请输入密码"
                autocomplete="off"
                show-password
                style="width:75%"
              />
            </el-form-item>
          </el-row>
          <el-row>
            <el-form-item label="确认密码" prop="rePassword">
              <el-input
                v-model="resetForm.rePassword"
                type="password"
                placeholder="请输入密码"
                autocomplete="off"
                show-password
                style="width:75%"
              />
            </el-form-item>
          </el-row>
          <el-row>
            <el-form-item label="验证码" prop="identifyCode">
              <el-col :span="10">
                <el-input
                  v-model="resetForm.identifyCode"
                  type="input"
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
              type="primary"
              :loading="submitLoading"
              @click="submit('resetForm')"
              >重置密码</el-button
            >
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script>
import userApi from "../api/user";
import md5 from "md5";
export default {
  name: "Login",
  data() {
    let identifyValidator = (rule, value, callback) => {
      if (value === "" || value === null) {
        callback(new Error("请输入验证码"));
      } else {
        callback();
      }
    };
    let rePasswordValidator = (rule, value, callback) => {
      if (value === "" || value === null) {
        callback(new Error("请再次输入密码"));
      } else if (value != this.resetForm.newPassword) {
        callback(new Error("两次输入密码不一致"));
      } else {
        callback();
      }
    };
    return {
      name: "",
      info: "发送验证码",
      isDisabled: false,
      email: "",
      popoverVisible: false,
      codeLoading: false,
      loading: false,
      resetForm: {
        rePassword: "",
        newPassword: "",
        identifyCode: ""
      },
      submitLoading: false,
      rules: {
        newPassword: [
          { required: true, message: "密码不能为空", trigger: "blur" }
        ],
        rePassword: [{ validator: rePasswordValidator, trigger: "blur" }],
        identifyCode: [{ validator: identifyValidator, trigger: "blur" }]
      }
    };
  },
  created() {
    let { username } = this.$route.query;
    this.name = username;
    this.getEmail(username);
  },
  methods: {
    async getEmail(username) {
      let data = await userApi
        .getUserEmailByName({ name: username })
        .catch(() => {});
      if (data) {
        this.email = data.email;
      }
    },
    pwdEmail(email) {
      let strArr = email.split("@");
      return `${strArr[0].slice(0, 3)}**********@${strArr[1]}`;
    },
    sendVerifyCode() {
      this.resetForm.identifyCode = "";
      this.codeLoading = true;
      userApi
        .sendVerifyCode({ email: this.email })
        .then(res => {
          this.codeLoading = false;
          this.isDisabled = true;
          let time = 60;
          let timer = setInterval(() => {
            this.info = `${time--} S`;
            if (this.info <= 0) {
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
    submit(formName) {
      this.submitLoading = true;
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.loading = true;
          const { newPassword } = this.resetForm;
          userApi
            .resetPasswordByCode({
              name: this.name,
              newPassword: md5(newPassword),
              email: this.email,
              code: this.resetForm.identifyCode
            })
            .then(res => {
              this.$message1000("密码已重置");
              this.$router.push("/login");
            })
            .finally(() => {
              this.loading = false;
              this.submitLoading = false;
            });
        } else {
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
