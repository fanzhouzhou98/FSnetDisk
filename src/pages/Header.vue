<template>
  <div class="netdiskHeader">
    <el-container>
      <el-header style="height:60px;">
        <el-row type="flex" class="row-bg" justify="center">
          <el-col :span="16" style="font-size: 0;">
            <el-menu
              :default-active="activeIndex"
              router
              class="el-menu-demo"
              mode="horizontal"
              @select="handleSelect"
            >
              <el-menu-item index="index"><i class="el-icon-folder-opened"></i>我的文件</el-menu-item>
              <el-menu-item index="myshare"><i class="el-icon-share"></i>我的分享</el-menu-item>
              <el-menu-item v-if="isAdmin" index="user"><i class="el-icon-user-solid"></i>用户管理</el-menu-item>
              <el-menu-item v-if="isAdmin" index="files"><i class="el-icon-folder-checked"></i>文件管理</el-menu-item>
              <el-menu-item index="recycle"><i class="el-icon-refresh"></i>回收站</el-menu-item>
            </el-menu>
          </el-col>
          <el-col :span="8" style="text-align:right;">
            <div style="display: flex; justify-content: right">
              <!-- <el-link type="info" href="https://aliyunvi.com/filehash" target="_blank">第三方文件hash值查询</el-link> -->
              <el-button
                type="info"
                size="small"
                style="margin-right: 20px"
                icon="el-icon-setting"
                @click="updateClick"
                >修改密码</el-button
              >
              <el-tag style="margin-right: 20px"
                ><i class="el-icon-user" style="margin-right: 5px"></i
                >{{ userInfo.name }}
              </el-tag>
              <el-button
                type="danger"
                size="small"
                icon="el-icon-close"
                @click="quitUser"
                >退出</el-button
              >
            </div>
          </el-col>
        </el-row>
      </el-header>
      <router-view />
      <el-dialog
        :visible.sync="visible"
        center
        title="修改密码"
        width="645px"
        @close="close"
      >
        <el-form
          ref="resetPasswordFrom"
          :model="resetPasswordFrom"
          :rules="rules"
          label-width="100px"
          size="mini"
        >
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="resetPasswordFrom.password"
              type="password"
              style="width:70%;"
              placeholder="请输入密码"
              autocomplete="off"
              show-password
            />
          </el-form-item>
          <el-form-item label="新密码" prop="newPassword">
            <el-input
              v-model="resetPasswordFrom.newPassword"
              type="password"
              style="width:70%;"
              placeholder="请输入新密码"
              autocomplete="off"
              show-password
            />
          </el-form-item>
          <el-form-item label="确认密码" prop="rePassword">
            <el-input
              v-model="resetPasswordFrom.rePassword"
              type="password"
              style="width:70%;"
              placeholder="请输再次入新密码"
              autocomplete="off"
              show-password
            />
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" size="mini" :loading="isLoading" @click="resetPassword"
            >确认</el-button
          >
          <el-button size="mini" @click="visible = false">取 消</el-button>
        </span>
      </el-dialog>
    </el-container>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import userApi from "../api/user";
import md5 from "md5";
export default {
  data() {
    let rePasswordValidator = (rule, value, callback) => {
      if (value === "" || value === null) {
        callback(new Error("请再次输入新密码"));
      } else if (value != this.resetPasswordFrom.newPassword) {
        callback(new Error("两次输入新密码不一致"));
      } else {
        callback();
      }
    };
    return {
      isLoading:false,
      activeIndex: "index",
      visible: false,
      loginForm: {},
      resetPasswordFrom: {
        password: "",
        newPassword: "",
        rePassword: ""
      },
      rules: {
        password: [
          { required: true, message: "密码不能为空", trigger: "blur" }
        ],
        newPassword: [
          { required: true, message: "请输入新密码", trigger: "blur" }
        ],
        rePassword: [{ validator: rePasswordValidator, trigger: "blur" }]
      }
    };
  },
  computed: {
    ...mapGetters(["userInfo"]),
    isAdmin() {
      return this.userInfo.role === "admin";
    }
  },
  mounted() {
    const route = this.$route.path.split("/")[2];
    this.handleSelect(route);
    console.log(this.userInfo.role);
  },
  methods: {
    resetPassword() {
      this.$refs["resetPasswordFrom"].validate(async valid => {
        if (valid) {
          //  this.loading = true
          let { password, newPassword } = this.resetPasswordFrom;
          let params = {
            password: md5(password),
            newPassword: md5(newPassword),
            ...this.userInfo
          };
          this.isLoading = true
          userApi
            .resetPassword(params)
            .then(res => {
              console.log(res);
              if (res) {
                this.$message1000("密码已修改");
                this.$store.commit("quitUserInfo");
                this.$router.push("/login");
              }
              this.isLoading = false
            })
            .finally(() => {
              this.visible = false;
              this.resetPasswordFrom = {
                password: "",
                newPassword: "",
                rePassword: ""
              };
              this.isLoading = false
              this.$refs["resetPasswordFrom"].clearValidate();
            });
        }
      });
    },
    close() {
      this.visible = false;
      this.resetPasswordFrom = {
        password: "",
        newPassword: "",
        rePassword: ""
      };
      this.$refs["resetPasswordFrom"].clearValidate();
    },
    updateClick() {
      this.visible = true;
    },
    quitUser() {
      this.$confirm("确认退出系统，是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$message({
            type: "success",
            message: "退出系统成功！!"
          });
          this.$router.replace("/login");
          this.$store.commit("quitUserInfo");
        })
        .catch(e => {
          console.log("取消退出系统：", e);
        });
    },
    handleSelect(key, keyPath) {
      this.activeIndex = key;
    }
  }
};
</script>

<style>
.el-menu--horizontal > .el-menu-item {
  height: 40px;
  line-height: 40px;
}
.el-menu.el-menu--horizontal {
  border-bottom: none;
}
.netdiskHeader {
  max-width: 100%;
  width: 100vw;
  height: 100vh;
  margin: 0 auto;
  background: #fff;
}
.row-bg {
  padding: 10px 0;
  border-bottom: 1px solid #dcdfe6;
}
.el-button--warning:focus,
.el-button--warning:hover {
  color: black;
  font-weight: bold;
}
.active {
  color: black;
  font-weight: bold;
}
</style>
