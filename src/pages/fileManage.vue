<template>
  <el-main style="height:calc(100vh - 60px);padding-top: 20px;" justify="center">
    <!-- 数据懒加载 -->
    <div v-loading="loading" class="wait" style="height:300px;">
      <el-form ref="searchForm" :model="searchForm" :inline="true" size="mini">
        <el-form-item prop="name" label="文件名">
          <el-input v-model="searchForm.name" placeholder="请输入文件名" />
        </el-form-item>
          <el-form-item prop="name" label="日期">
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
            @click="getFileList"
          >查询</el-button>
          <el-button type="info" @click="resetForm">清空</el-button>
        </el-form-item>
      </el-form>
       <div
      v-loading="loading"
      class="wait"
      style="height:calc(100% - 30%);"
    >
      <div class="displayContent">
        <el-table :data="fileList"style="width: 100%"  border>
          <el-table-column prop="id" label="ID" width="60" />
          <el-table-column prop="name" label="文件名" align="center" width="300" show-overflow-tooltip />
          <el-table-column prop="hash" label="Hash值" align="center" width="300" show-overflow-tooltip />
          <el-table-column prop="size" sortable label="大小" align="center" width="120">
            <template slot-scope="scope">
              <span>{{ renderSize(scope.row.size) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="user.name" label="上传用户" align="center" width="180" />
          <el-table-column prop="createdAt" sortable label="上传时间" align="center" width="180" />
          <el-table-column prop="updatedAt" label="更新时间" sortable align="center" width="180" />
          <el-table-column label="操作" align="center">
            <template slot-scope="scope">
              <el-button
                icon="el-icon-download"
                type="success"
                size="mini"
                @click="fullDownloadUrl(scope.row)"
                :loading="downLoading"
              >下载</el-button>
              <el-button
                icon="el-icon-delete"
                type="danger"
                size="mini"
                :loading="deleLoading"
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
      :total="count">
    </el-pagination>
      </div>
       </div>
    </div>

  </el-main>
</template>

<script>
import fileApi from '../api/file'
import axios from 'axios'
export default {
  name: 'Myshare',
  data() {
    return {
      downLoading:false,
      deleLoading:false,
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
      fileList: [],
      searchForm: {
        name: ''
      },
      count:0,
      current:1,
      size:10
    }
  },
  computed: {
  },
  created() {
    this.loading = true
    this.getFileList()
  },
  methods: {
      getDayStartOrEnd(time) {
      //end  返回毫秒数
      return new Date(time).setHours(23, 59, 59, 999)
    },
    //返回几天前的毫秒数
    getBeforeDate(date = new Date(), days = 7) {
      date.setTime(date.getTime() - 3600 * 1000 * 24 * days)
      return date;
    },
     handleCurrentChange(){
      this.getFileList()
    },
    renderSize(value) {
      if (value == null || value === '') {
        return '0 B'
      }
      const unitArr = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
      let index = 0
      const srcsize = parseFloat(value)
      index = Math.floor(Math.log(srcsize) / Math.log(1024))
      let size = srcsize / Math.pow(1024, index)
      size = size.toFixed(2)// 保留的小数位数
      return size + unitArr[index]
    },
    fullShortUrl(shareUrl) {
      return window.location.origin + '/#/s/' + shareUrl
    },
    getFileList() {
      let params = {
        ...this.searchForm,
        pageSize:this.size,
        pageNo:this.current,
        isDeleted: false,
        start: new Date(this.dateArr[0]).setHours(0, 0, 0, 0),
        end: new Date(this.dateArr[1]).setHours(23, 59, 59, 999)
      }
      fileApi.getAdminFileList(params).then(res => {
        this.loading = true
        this.fileList = res.list.rows
        this.count = res.list.count
      }).finally(() => {
        this.loading = false
      })
    },
    resetForm() {
      this.dateArr = [this.getBeforeDate(new Date(), 30), new Date()]
      this.searchForm = {
        name:''
      }
    },
    fullDownloadUrl(row) {
      this.downLoading = true
      axios({
        url: '/api/' + row.path,
        method: 'get',
        responseType: 'blob'
      }).then(res => {
        const url = URL.createObjectURL(res.data)
        const a = document.createElement('a')
        a.href = url
        a.download = row.name
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        this.downLoading = false
      })
      this.downLoading = false
    },
    deleteShare(row) {
      this.$confirm(`删除该文件，继续吗？`, '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleLoading = true
        fileApi.deleteFile({
          id: row.id
        }).then(res => {
          this.getFileList()
          this.$message1000('删除成功')
          this.deleLoading = false
        })
      }).catch(error => {
        console.log('取消删除', error)
      })
    }
  }
}
</script>

<style scoped>

</style>
