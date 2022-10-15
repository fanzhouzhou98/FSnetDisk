<template>
  <el-main
    style="height:calc(100vh - 60px);padding-top: 20px;"
    justify="center"
  >
    <!-- 数据懒加载 -->
    <div v-loading="loading" class="wait" style="height:300px;">
      <el-form ref="searchForm" :model="searchForm" :inline="true" size="mini">
        <el-form-item prop="name" label="用户名">
          <el-input v-model="searchForm.name" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="getUserList"
            >查询</el-button
          >
          <el-button type="info" @click="resetForm">清空</el-button>
        </el-form-item>
      </el-form>
      <div class="displayContent">
        <el-table :data="userList" style="width: 100%" border>
          <el-table-column prop="id" label="用户ID" />
          <el-table-column
            prop="name"
            label="用户名"
            align="center"
            show-overflow-tooltip
          />
          <el-table-column prop="role" label="用户类型" align="center">
            <template slot-scope="scope">
              <span>{{
                scope.row.role == "admin" ? "管理员" : "普通用户"
              }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="fileCount" label="文件数" align="center">
            <template slot-scope="scope">
              {{ scope.row.files.length }}
            </template>
          </el-table-column>
          <el-table-column prop="email" label="Email" />
          <el-table-column
            prop="createdAt"
            sortable
            label="注册时间"
            align="center"
            width="180"
          />
          <el-table-column label="操作" align="center">
            <template slot-scope="scope">
              <el-button
                icon="el-icon-delete"
                type="danger"
                size="mini"
                @click="deleteShare(scope.row)"
                >删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          style="float:right;margin-top:20px"
          @current-change="handleCurrentChange"
          :current-page.sync="current"
          :page-size="size"
          background
          layout="total,  prev, pager, next"
          :total="count"
        >
        </el-pagination>
      </div>
    </div>
  </el-main>
</template>

<script>
import userApi from "../api/user";

export default {
  name: "UserManage",
  data() {
    return {
      loading: true,
      userList: [],
      searchForm: {
        name: ""
      },
      count: 0,
      current: 1,
      size: 10
    };
  },
  computed: {},
  created() {
    this.loading = true;
    this.getUserList();
  },
  methods: {
    handleCurrentChange() {
      this.getUserList();
    },
    getUserList() {
      let params = {
        ...this.searchForm,
        pageSize: this.size,
        pageNo: this.current
      };
      userApi
        .getUserList(params)
        .then(res => {
          this.loading = false;
          this.userList = res.list.rows;
          this.count = res.list.rows.length;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    resetForm() {
      this.$refs.searchForm.resetFields();
    },
    deleteShare(row) {
      this.$confirm(`删除该用户，继续吗？`, "确认删除", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          userApi
            .deleteUser({
              id: row.id
            })
            .then(res => {
              this.getUserList();
              this.$message1000("删除成功");
            });
        })
        .catch(error => {
          console.log("取消删除", error);
        });
    }
  }
};
</script>

<style scoped></style>
