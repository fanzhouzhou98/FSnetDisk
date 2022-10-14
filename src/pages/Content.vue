<template>
  <el-main
    style="height:calc(100vh - 60px);padding-top: 20px;"
    justify="center"
  >
    <!-- 上传 搜索 新建文件 -->
    <el-row class="row-bg">
      <el-col :span="3"
        ><el-button
          type="primary"
          icon="el-icon-upload"
          size="mini"
          @click="openUpload"
          >上传</el-button
        >
        <el-button
          type="success"
          icon="el-icon-refresh-left"
          size="mini"
          @click="getUserFile(true)"
          >刷新</el-button
        ></el-col
      >
      <el-form ref="searchForm" :model="searchForm" :inline="true" size="mini">
        <el-col :span="4">
          <el-form-item prop="name" label="文件名">
            <el-input v-model="searchForm.name" placeholder="请输入文件名" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item prop="dateArr" label="日期">
            <el-date-picker
              v-model="dateArr"
              type="daterange"
              :default-time="defaultTime"
              range-separator="至"
              :picker-options="pickerOptions"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width:80%"
            >
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item>
            <el-button
              type="primary"
              icon="el-icon-search"
              @click="searchFileByName"
              >查询</el-button
            >
            <el-button type="info" @click="resetForm">清空</el-button>
          </el-form-item>
        </el-col>
      </el-form>
    </el-row>
    <el-dialog
      :visible.sync="visible"
      title="文件上传"
      width="645px"
      @close="close"
    >
      <!-- 文件上传框 -->
      <el-upload
        ref="upload-demo"
        class="upload-demo"
        drag
        multiple
        action="api/file/upload"
        :on-success="handleSuccess"
      >
        <i class="el-icon-upload" />
        <div class="el-upload__text">
          将文件拖到此处，或
          <em>点击上传</em>
        </div>
      </el-upload>
    </el-dialog>
    <el-dialog :visible.sync="shareVisible" title="文件分享" width="645px">
      <div v-if="!shareInfo.shareUrl" class="shareCreate">
        <el-form ref="shareform" label-width="70px">
          <el-form-item label="分享形式">
            <el-radio v-model="shareInfo.shareType" label="private"
              >加密（输入提取码才能查看，下载）</el-radio
            >
            <el-radio v-model="shareInfo.shareType" label="open"
              >公开（任何人访问链接即可查看，下载）</el-radio
            >
          </el-form-item>
          <el-form-item label>
            <el-button type="primary" @click="confirmCreateShare()"
              >创建链接</el-button
            >
          </el-form-item>
        </el-form>
      </div>
      <div v-else>
        <div ckass="shareSuccess">
          <el-form label-width="70px">
            <el-form-item label="分享链接">
              <el-tag>
                {{ shareInfo.shareUrl }}
              </el-tag>
            </el-form-item>
            <el-form-item v-if="shareInfo.shareKey" label="密码">{{
              shareInfo.shareKey
            }}</el-form-item>
            <el-form-item label="二维码">
              <div
                v-if="shareInfo.shareUrl"
                class="shareQrcode"
                style="text-align: center;"
              >
                <img :src="shareQrcodeSrc" />
              </div>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-dialog>
    <div v-loading="loading" class="wait" style="height:calc(100% - 30%);">
      <div class="displayContent">
        <el-table :data="filterUserFile" style="width: 100%" border>
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
            width="300"
            show-overflow-tooltip
          />
          <el-table-column prop="size" label="大小" align="center" width="120">
            <template slot-scope="scope">
              <span>{{ renderSize(scope.row.size) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="createdAt"
            label="上传时间"
            sortable
            align="center"
            width="240"
          />
          <el-table-column
            prop="updatedAt"
            label="更新时间"
            sortable
            align="center"
            width="240"
          />
          <el-table-column label="操作" align="center">
            <template slot-scope="scope">
              <el-button
                icon="el-icon-share"
                type="primary"
                size="mini"
                @click="fileShareButton(scope.row)"
                >分享</el-button
              >
              <el-button
                icon="el-icon-download"
                type="success"
                size="mini"
                :loading="downLoading"
                @click="fullDownloadUrl(scope.row)"
                >下载</el-button
              >
              <el-button
                icon="el-icon-delete"
                type="danger"
                size="mini"
                :loading="deleLoading"
                @click="fileDelete(scope.row)"
                >删除</el-button
              >
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
import axios from "axios";
import QRCode from "qrcode";
import { mapGetters } from "vuex";
import fileApi from "../api/file";

export default {
  name: "NetdiskContent",
  data() {
    return {
      downLoading: false,
      deleLoading: false,
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
      visible: false,
      shareVisible: false,
      openSearch: true,
      searchFileName: "",
      userFileData: [],
      shareInfo: {
        id: null,
        shareType: "private",
        shareKey: null,
        shareUrl: null,
        shareStatus: false
      },
      shareQrcodeSrc: "",
      loading: true,
      count: 0,
      current: 1,
      size: 10,
      searchForm: {
        name: ""
      }
    };
  },
  computed: {
    ...mapGetters(["userInfo"]),
    filterUserFile() {
      return this.userFileData.filter(v =>
        v.name.includes(this.searchFileName)
      );
    }
  },
  created() {
    this.loading = true;
    this.getUserFile();
  },
  mounted() {},
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
      this.getUserFile();
    },
    resetForm() {
      this.dateArr = [this.getBeforeDate(new Date(), 30), new Date()];
      this.searchForm = {
        name: ""
      };
    },
    searchFileByName(isRefresh) {
      this.current = 1;
      this.loading = true;
      fileApi
        .getFile({
          name: this.searchForm.name,
          pageSize: this.size,
          pageNo: this.current,
          start: new Date(this.dateArr[0]).setHours(0, 0, 0, 0),
          end: new Date(this.dateArr[1]).setHours(23, 59, 59, 999)
        })
        .then(res => {
          this.userFileData = res.list.rows;
          this.count = res.list.count;
          if (isRefresh) {
            this.$message1000("查询成功");
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 格式化文件大小
    renderSize(value) {
      if (value == null || value === "") {
        return "0 B";
      }
      const unitArr = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
      let index = 0;
      const srcsize = parseFloat(value);
      index = Math.floor(Math.log(srcsize) / Math.log(1024));
      let size = srcsize / Math.pow(1024, index);
      size = size.toFixed(2); // 保留的小数位数
      return size + unitArr[index];
    },
    openUpload() {
      this.visible = true;
    },
    close() {
      this.getUserFile();
    },
    handleSuccess(res, file) {
      const { success, msg, data } = res;
      if (success) {
        this.$message1000("文件上传成功", "success");
      } else {
        this.$message1000(msg, "error");
      }
    },

    fullDownloadUrl(row) {
      this.downLoading = true;
      axios({
        url: "/api/" + row.path,
        method: "get",
        responseType: "blob"
      }).then(res => {
        const url = URL.createObjectURL(res.data);
        const a = document.createElement("a");
        a.href = url;
        a.download = row.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        this.downLoading = false;
      });
      this.downLoading = false;
    },
    fileDelete(row) {
      this.$confirm(`此操作将删除【${row.name}】文件, 是否继续?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.deleLoading = true;
          fileApi.deleteFile({ id: row.id }).then(res => {
            this.getUserFile();
            this.$message1000("删除成功");
            this.deleLoading = false;
          });
          this.deleLoading = false;
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    getUserFile(isRefresh) {
      this.loading = true;
      fileApi
        .getFile({
          pageSize: this.size,
          pageNo: this.current,
          isDeleted: false,
          start: new Date(this.dateArr[0]).setHours(0, 0, 0, 0),
          end: new Date(this.dateArr[1]).setHours(23, 59, 59, 999)
        })
        .then(res => {
          this.userFileData = res.list.rows;
          this.count = res.list.count;
          if (isRefresh) {
            this.$message1000("刷新成功");
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    fileShareButton(row) {
      this.shareInfo = JSON.parse(JSON.stringify(row));
      if (row.shareUrl && !row.shareUrl.includes("share")) {
        this.shareInfo["shareUrl"] =
          window.location.origin + "/#/s/" + row.shareUrl;
        this.makeQrcode(this.shareInfo.shareUrl).then(res => {
          this.shareQrcodeSrc = res;
        });
      }
      this.shareVisible = true;
    },
    confirmCreateShare() {
      const { id, shareStatus = "0", shareType } = this.shareInfo;
      const params = {
        id,
        shareStatus,
        shareType
      };
      fileApi.createShare(params).then(res => {
        this.$message1000("生成分享链接成功");
        this.shareInfo = res;
        this.shareInfo.shareUrl =
          window.location.origin + "/#/s/" + res.shareUrl;
        this.makeQrcode(this.shareInfo.shareUrl).then(urlResult => {
          this.shareQrcodeSrc = urlResult;
        });
      });
    },
    makeQrcode(url) {
      return new Promise((resolve, reject) => {
        QRCode.toDataURL(url, { width: 250 })
          .then(res => {
            resolve(res);
          })
          .catch(err => {
            reject("生成二维码错误：", err);
          });
      });
    }
  }
};
</script>

<style>
.el-upload-dragger {
  width: 600px;
}
.row-bg {
  padding: 10px 0;
  border-bottom: 1px solid #dcdfe6;
}
.fileList {
  font-size: 14px;
}
.fileList .f_name {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.fileList .f_ico {
  font-size: 18px;
  text-align: right;
}
.fileList .el-row:hover {
  background: #f3f5f9;
  box-shadow: inset 1px 1px 0px rgba(0, 0, 0, 0.05);
}
.fileList .f_name:hover {
  cursor: pointer;
}
.shareFile .shareMethod {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #08f;
  color: #fff;
  line-height: 40px;
  font-size: 20px;
  margin: auto;
  text-align: center;
}
.shareFile .shareUrlText {
  background-color: #d0f2c3;
  border-radius: 3px;
  padding: 13px 13px;
  font-size: 14px;
  margin: 15px 0;
  word-wrap: break-word;
  word-break: normal;
  text-align: left;
}
</style>
