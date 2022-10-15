<template>
  <el-main
    style="height:calc(100vh - 60px);padding-top: 20px;"
    justify="center"
  >
    <!-- 数据懒加载 -->
    <div v-loading="loading" class="wait" style="height:300px;">
      <el-form ref="searchForm" :model="searchForm" :inline="true" size="mini">
        <el-form-item prop="name" label="文件名">
          <el-input v-model="searchForm.name" placeholder="请输入文件名" />
        </el-form-item>
        <el-form-item prop="dateArr" label="分享日期">
          <el-date-picker
            v-model="dateArr"
            type="daterange"
            :default-time="defaultTime"
            range-separator="至"
            :picker-options="pickerOptions"
            style="width:80%"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            @click="getUserShareList"
            >查询</el-button
          >
          <el-button type="info" @click="resetForm">清空</el-button>
        </el-form-item>
      </el-form>
      <div class="displayContent">
        <el-table :data="userShareList" style="width: 100%" border>
          <el-table-column prop="id" label="ID" width="60" />
          <el-table-column
            prop="name"
            label="文件名"
            align="center"
            width="300"
            show-overflow-tooltip
          />
          <el-table-column
            prop="hash"
            label="Hash值"
            align="center"
            show-overflow-tooltip
          />
          <el-table-column
            prop="shareType"
            label="分享类型"
            align="center"
            width="120"
          >
            <template slot-scope="scope">
              <el-tag
                :type="scope.row.shareType === 'open' ? 'primary' : 'warning'"
              >
                {{
                  scope.row.shareType === "open" ? "公开分享" : "私密分享"
                }}</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column
            prop="shareKey"
            label="密码"
            align="center"
            width="120"
          />
          <el-table-column prop="path" label="分享地址" align="center">
            <template slot-scope="scope">
              <el-link
                type="primary"
                target="_blank"
                :href="fullShortUrl(scope.row.shareUrl)"
                >{{ fullShortUrl(scope.row.shareUrl) }}</el-link
              >
            </template>
          </el-table-column>
          <el-table-column
            prop="updatedAt"
            label="链接创建时间"
            sortable
            align="center"
            width="180"
          />
          <el-table-column label="操作" align="center" width="180">
            <template slot-scope="scope">
              <el-button
                icon="el-icon-delete"
                type="danger"
                size="mini"
                @click="deleteShare(scope.row)"
                >取消分享
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
import fileApi from "../api/file";
import store from "../vuex/store";
export default {
  name: "Myshare",
  data() {
    return {
      pickerOptions: {
        //配置项
        // 设置禁用状态  time是日历上的每一个时间
        disabledDate: time => {
          // 如果没有选择日期，就要限制不能选择今天及以后
          return time.getTime() >= this.getDayStartOrEnd(new Date());
        }
      },
      dateArr: [this.getBeforeDate(new Date(), 30), new Date()],
      defaultTime: ["00:00:00", "23:59:59"], //选择日期后的默认时间
      loading: true,
      userShareList: null,
      count: 0,
      current: 1,
      size: 10,
      searchForm: {
        name: ""
      },
      userInfo: {}
    };
  },
  computed: {},
  created() {
    this.loading = true;
    this.getUserShareList();
  },
  methods: {
    getDayStartOrEnd(time) {
      //end  返回毫秒数
      return new Date(time).setHours(23, 59, 59, 999);
    },
    //返回几天前的毫秒数
    getBeforeDate(date = new Date(), days = 7) {
      date.setTime(date.getTime() - 3600 * 1000 * 24 * days);
      return date;
    },
    handleCurrentChange() {
      this.getUserShareList();
    },
    fullShortUrl(shareUrl) {
      return window.location.origin + "/#/s/" + shareUrl;
    },
    getUserShareList() {
      fileApi
        .getShareFile({
          ...this.searchForm,
          pageSize: this.size,
          pageNo: this.current,
          start: new Date(this.dateArr[0]).setHours(0, 0, 0, 0),
          end: new Date(this.dateArr[1]).setHours(23, 59, 59, 999)
        })
        .then(res => {
          this.loading = false;
          this.userShareList = res.list.rows;
          this.count = res.list.count;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    resetForm() {
      this.$refs.searchForm.resetFields();
    },
    deleteShare(row) {
      this.$confirm(
        `取消分享后，该条分享记录将被删除，好友将无法再访问此分享链接，继续吗？`,
        "确认取消分享",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      )
        .then(() => {
          fileApi
            .updateFile({
              id: row.id,
              userId: store.getters.userInfo.id,
              shareKey: null,
              shareStatus: null,
              shareUrl: null,
              shareType: null
            })
            .then(res => {
              this.getUserShareList();
              this.$message1000("取消分享成功");
            });
        })
        .catch(error => {
          console.log("取消分享", error);
        });
    }
  }
};
</script>

<style scoped></style>
