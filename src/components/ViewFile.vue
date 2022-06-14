<template>    
  <section>
    <div class="return-block">
      <button class="green-btn-text return-btn" @click="goBack()"><i class="bi bi-arrow-left-circle"></i>返回</button>
    </div>
    <div class="section-title title-block d-flex align-items-center">
      <div>
        <span class="title">理賠單號：{{ claimId }}</span>
      </div>
      <div class="ms-auto">
        <button class="green-btn-bg view-btn">
          <a :href="authorizationUrl" target="_blank">
            <img src="../assets/img/file-icon.svg">
            <span>檢視授權書</span>
          </a>
        </button>
      </div>
    </div>
    <div class="info-block">
      <p>上傳時間：{{ uploadDate }}</p>
      <p>保戶身分證號：{{ userId }}</p>
      <p>授權期間：{{ authorizedDate }}</p>      
    </div>
    <div class="clear-block">
      <span class="reminder-text" v-if="downloadFlag == 1">保險單位已下載理賠清單，無法清除資料</span>
      <button class="red-btn-border-text clear-btn" @click="clearCheck()" :disabled="downloadFlag == 1">
        <img src="../assets/img/delete-icon.svg">
        <span>清除資料</span>
      </button>
    </div>
    <div class="certificate-block">
      <table border="0">
        <tr>
          <th>科別</th>
          <th>證書類別</th>
          <th></th>
        </tr>
        <template v-for="department, department_key in fileInfo" :key="department_key">
          <tr v-for="type, type_key, type_index in department" :key="type_index">
            <td v-if="type_index == 0" :rowspan="Object.keys(department).length" class="department-col">{{ department_key }}</td>
            <td class="type-col">{{ type_key }}</td>
            <td class="file-col">
              <template v-if="Object.keys(type).length == 0">
                無符合的就診紀錄
              </template>
              <template v-else>
                <div v-for="file, file_index in type" :key="file.pdfUrl" :value="file_index">
                  <a class="file-link" :href="file.pdfUrl" target="_blank">{{ file.fileName }}</a>
                </div>
              </template>
            </td>
          </tr>
        </template>
      </table>
    </div>
  </section>
  <!-- Check Modal -->
  <div class="modal fade" id="checkModal" tabindex="-1" aria-labelledby="checkModal" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header" v-html="checkModal.title"></div>
        <div v-if="checkModal.btnColor == 'red'" class="modal-body" v-html="checkModal.content"></div>
        <div v-else-if="checkModal.btnColor == 'green'" class="modal-body">
          將於 <span>{{ timeVal }} 秒</span> 後自動跳轉主頁
        </div>
        <div class="modal-footer">
          <button v-if="checkModal.btnColor == 'red'" type="button" class="btn red-btn-border-text" 
          data-bs-dismiss="modal">取消</button>
          <button v-if="checkModal.btnColor == 'red'" type="button" class="btn red-btn-bg" 
          data-bs-dismiss="modal" @click="clearFile()">清除</button>
          <button v-else-if="checkModal.btnColor == 'green'" type="button" class="btn green-btn-bg" 
          data-bs-dismiss="modal" @click="goBack()">返回清單</button>
        </div>
      </div>
    </div>
  </div>
  <!-- End Check Modal -->
  <!-- Reminder Modal -->
  <div class="modal fade" id="reminderModal" tabindex="-1" aria-labelledby="reminderModal" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">{{ reminderModal.title }}</div>
        <div class="modal-body" v-html="reminderModal.content"></div>
        <div class="modal-footer">
          <button type="button" class="btn green-btn-bg" 
          data-bs-dismiss="modal">確認</button>
        </div>
      </div>
    </div>
  </div>
  <!-- End Reminder Modal -->
</template>

<script>
import { on, select } from 'assets/js/shortcut.js'
import { Modal } from 'bootstrap'
import axios from 'axios'

export default {
  name: 'ViewFile',
  data() {
    return {
      //Claim inof
      claimId: '',
      userId: '',
      authorizedDate: '',
      uploadDate: '',
      authorizationUrl: '',
      fileInfo: {},
      downloadFlag: 0,
      //Modal content
      checkModal: {
        title: '',
        content: '',
        btnColor: ''
      },
      reminderModal: {
        title: '',
        content: ''
      },
      currentModal: null,
      //Count
      timeVal: 5,
      timeInterval: null,
      isStart: false
    }
  },
  props: ['id', 'records'],
  emits: ["updateData"],
  methods: {
    goBack(){
      this.countStop();
      this.$router.push({
        name: 'claimList'
      });
    },
    reload(){
      this.countStop();
      this.fileInfo = {};
      this.$router.push({
        name: 'viewFile',
        params: {
          claim: this.claimId,
          id_number: this.userId,
          authorizedDate: this.authorizedDate,
          uploadDate: this.uploadDate,
          authorizationCertificate: this.authorizationUrl
        }
      });
    },
    clearCheck(){
      this.currentModal = new Modal(select('#checkModal')); 
      this.checkModal.title = '清除所有已上傳資料';
      this.checkModal.content = '理賠申請將變更為「未上傳」狀態，您可以重新上傳資料';
      this.checkModal.btnColor = 'red';
      this.currentModal.show();
    },
    clearFile(){
      var apiAddress = 'https://60.249.237.182:443';

      axios.delete(apiAddress + '/prod/del_claim', {data: {
        'claim_number': this.claimId
      }})
      .then(response => {
        response = response.data;

        if(response && response == true){
          this.currentModal = new Modal(select('#checkModal'));   
          this.checkModal.title = '清除資料成功';
          this.checkModal.content = '將於 <span>5 秒</span> 後自動跳轉主頁';
          this.checkModal.btnColor = 'green';
          this.countStart();
          this.currentModal.show();
        }
        else{
          this.currentModal = new Modal(select('#reminderModal'));
          this.reminderModal.title = '清除資料失敗，請重新嘗試';
          this.reminderModal.content = '';
          this.currentModal.show();
        }
      })
      .catch(error => (console.log('error',error)));
    },
    countStart() {
      this.timeVal = 5;
      this.timeInterval = setInterval(this.countDown, 1000);
      this.isStart = true;
    },
    countDown() {
      this.timeVal = this.timeVal - 1;
      if (this.timeVal === 0) {
        this.countFinish();
      }
    },
    countFinish() {
      this.countStop();
      this.currentModal.hide();
      this.$router.push({
        name: 'claimList'
      });
    },        
    countStop() {
      clearInterval(this.timeInterval);
      this.isStart = false;
    }
  },
  computed: {
  },
  mounted() {
    var apiAddress = 'https://60.249.237.182:443';
    this.claimId = this.$route.params.claim;
    this.userId = this.$route.params.id_number;
    this.authorizedDate = this.$route.params.authorizedDate;
    this.uploadDate = this.$route.params.uploadDate;
    this.authorizationUrl = this.$route.params.authorizationCertificate;

    axios.post(apiAddress + '/prod/get_url',{
      'claim_number': this.claimId
    })
    .then(response => {
      response = response.data;
      
      if(!(response.download_flag === undefined))
        this.downloadFlag = response.download_flag;
      if(response && response.claims.length > 0){
        for(var i = 0; i < response.claims.length; i++){
          var claim = response.claims[i];
          var fileName = claim.file_name.length > 30 ? claim.file_name.substring(0, 30) + '~.pdf' : claim.file_name;
          //If no specific division, add new one
          if(claim.pdf_type.includes('diagnosis')){
            if(!(claim.division in this.fileInfo))
              this.fileInfo[claim.division] = {};
            if(!('診斷書' in this.fileInfo[claim.division]))
              this.fileInfo[claim.division]['診斷書'] = [];            
            this.fileInfo[claim.division]['診斷書'].push({fileName: fileName,pdfUrl: claim.pdfUrl});
          }
          else if(claim.pdf_type.includes('receipt')){
            if(!(claim.division in this.fileInfo))
              this.fileInfo[claim.division] = {};
            if(!('收據' in this.fileInfo[claim.division]))
              this.fileInfo[claim.division]['收據'] = [];
            this.fileInfo[claim.division]['收據'].push({fileName: fileName,pdfUrl: claim.pdfUrl});
          }          
        }
      };
    })
    .catch(error => (console.log(error)));    
  }
}
</script>

<style lang="scss">
@import "assets/scss/variables";

.return-block{
  margin-bottom: 28px;
  .return-btn{
    height: 40px;
    min-width: 93px;
    padding: 8px 16px 8px 12px;
    font-size: 16px;
    line-height: 150%;
    text-align: center;
    letter-spacing: 0.01em;
    i{
      margin-right: 8px;
    }
  }
}
.title-block{
  margin: 28px 0;
  .view-btn{
    display: flex;
    align-items: center;
    min-width: 131px;
    min-height: 40px;
    padding: 8px 16px 8px 12px;
    a{
      color: #ffffff;
      text-decoration: none;
    }
    img{
      height: 24px;
      width: 24px;
      margin-right: 8px;
    }
    span{
      font-size: 14px;
      line-height: 150%;
      text-align: center;
    }
  }
}
.info-block{
  margin: 24px 0;
  p{
    margin: 0;
    font-size: 16px;
    line-height: 150%;
    letter-spacing: 0.01em;
    color: $text-main;
  }
}
.clear-block{
  display: flex;
  justify-content: end;
  align-items: center;
  .reminder-text{
    margin: 0 12px;
    font-weight: 600;
    font-size: 16px;
    line-height: 120%;
  }
  .clear-btn{
    display: flex;
    align-items: center;
    min-height: 40px;
    min-width: 93px;
    padding: 8px 16px 8px 12px;    
    img{
      height: 24px;
      width: 24px;
      margin-right: 8px;
    }
    span{
      font-size: 14px;
      line-height: 150%;
      text-align: center;
    }
  }
}
.certificate-block{
  margin: 32px 0;
  table{
    width: 100%;
    font-family: OpenSans;
    font-style: normal;
    font-stretch: normal;
    align-items: center;
    letter-spacing: 0.01em;
    color: $text-main;
    tr{      
      th{
        min-height: 38px;
        padding: 9px 0;
        font-weight: 600;
        font-size: 16px;
        line-height: 120%;
        border-bottom: 1px #A8B8C2 solid;
      }
      td{
        min-height: 99px;
        padding: 16px 0 16px 12px;
        background: #fff;
        border-bottom: 1px $background-color solid;
        text-align: start;
        vertical-align: text-top;
        &.department-col{
          width: 25%;
          border-right: 1px $background-color solid;
          font-weight: 600;
          font-size: 16px;
          line-height: 120%;
        }
        &.type-col{
          width: 25%;                
          font-size: 16px;
          line-height: 150%;
        }
        &.file-col{
          width: 50%;
          font-size: 16px;
          line-height: 150%;
          color: $grey-dark;
          button{
            min-width: 65px;
            height: 34px;
            font-size: 12px;
            line-height: 150%;
          }
        }
        .file-link{
          display: inline-block;
          width: auto;
          font-size: 16px;
          line-height: 150%;
          text-decoration-line: underline;
          color: $green-default;
          cursor: pointer;
        }
      }
    }
  }
}
</style>