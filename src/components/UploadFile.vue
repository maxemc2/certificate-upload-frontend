<template>    
  <section>
    <div class="return-block">
      <button class="green-btn-text return-btn" @click="goBackCheck()"><i class="bi bi-arrow-left-circle"></i>返回</button>
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
      <p>保戶身分證號：{{ userId }}</p>
      <p>授權期間：{{ authorizedDate }}</p>
    </div>
    <div class="state-block">
      <div class="form-check">
        <input class="form-check-input" type="radio" name="claimState" id="claimState1" 
        value="正常" v-model="state" checked>
        <label class="form-check-label" for="claimState1">
          有此保戶及區間就診資料
        </label>
      </div>
      <div class="form-check">
        <input class="form-check-input" type="radio" name="claimState" id="claimState2" 
        value="人找不到" v-model="state">
        <label class="form-check-label" for="claimState2">
          查無此病人<span>（將不會上傳任何檔案）</span>
        </label>
      </div>
      <div class="form-check">
        <input class="form-check-input" type="radio" name="claimState" id="claimState3" 
        value="期間找不到" v-model="state">
        <label class="form-check-label" for="claimState3">
          此授權區間無就醫紀錄<span>（將不會上傳任何檔案）</span>
        </label>
      </div>
    </div>
    <div class="certificate-block" v-if="state == '正常'">
      <table border="0">
        <tr>
          <th>科別</th>
          <th>證書類別</th>
          <th></th>
        </tr>
        <tr v-for="type, type_key, type_index in fileField.type" :key="type_key">
          <td v-if="type_index == 0" :rowspan="Object.keys(fileField.type).length" class="department-col">
            <template v-for="department, department_index in fileField.division" :key="department_index">
              {{ department }}<br>
            </template>
          </td>
          <td class="type-col">{{ type_key }}</td>
          <td class="btn-col">
            <input v-for="file, file_index in type" :key="file_index" type="file" accept="application/pdf"
            class="green-btn-border-text"  @change="getFile($event,type_key)">
          </td>
        </tr>
      </table>
    </div>
    <div class="send-block">
      <button class="green-btn-bg send-btn" @click="sendCheck()">
          <img src="../assets/img/send-icon.svg">
          <span>送出</span>
      </button>
    </div>
  </section>
  <!-- Check Modal -->
  <div class="modal fade" id="checkModal" tabindex="-1" aria-labelledby="checkModal" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header" v-html="checkModal.title"></div>
        <div class="modal-body" v-html="checkModal.content"></div>
        <div class="modal-footer">
          <button type="button" class="btn" data-bs-dismiss="modal"
          :class="{'green-btn-border-text': checkModal.btnColor == 'green', 'red-btn-border-text': checkModal.btnColor == 'red'}">
          取消</button>
          <button v-if="checkModal.btnColor == 'green'" type="button" class="btn green-btn-bg" 
          data-bs-dismiss="modal" @click="sendFile()">送出</button>
          <button v-else-if="checkModal.btnColor == 'red'" type="button" class="btn red-btn-bg" 
          data-bs-dismiss="modal" @click="goBack()">離開</button>
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
        <div v-if="reminderModal.state == 'success'" class="modal-body">
          將於 <span>{{ timeVal }} 秒</span> 後自動跳轉主頁
        </div>
        <div v-else class="modal-body" v-html="reminderModal.content"></div>
        <div class="modal-footer">
          <button v-if="reminderModal.state == 'success'" type="button" class="btn green-btn-bg" 
          data-bs-dismiss="modal" @click="goBack()">返回清單</button>
          <button v-else-if="reminderModal.state == 'fail'" type="button" class="btn green-btn-bg" 
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
  name: 'UploadFile',
  data() {
    return {
      //Claim info
      claimId: '',
      userId: '',
      authorizedDate: '',
      authorizationUrl: '',
      fileField: {
        division: [],
        type: {}
      },
      state: '正常',
      //Upload file record
      fileInfo: [],
      files: [],
      //Modal content
      checkModal: {
        title: '',
        content: '',
        btnColor: ''
      },
      reminderModal: {
        title: '',
        content: '',
        state: 'success'
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
    changeState(state){
      this.state = state;
    },
    goBackCheck(){
      if(this.files.length > 0){
        this.currentModal = new Modal(select('#checkModal')); 
        this.checkModal.title = '離開頁面';
        this.checkModal.content = '尚有未儲存資料，離開後需重新上傳';
        this.checkModal.btnColor = 'red';
        this.currentModal.show();
      }
      else{
        this.$router.push({
          name: 'claimList'
        });
      }
    },
    goBack(){
      this.countStop();
      this.$router.push({
        name: 'claimList'
      });
    },
    getFile(event,type,department='不分科'){
      var file = event.target.files;
      for(var i = 0; i < file.length; i++){
        var fileName = file[i].name;
        var index = fileName.lastIndexOf(".");  
        if (index != -1){
          //Check file type
          var ext = fileName.substr(index+1).toLowerCase();
          if(ext == 'pdf'){
            this.files.push(file[i]);
            //Push file information
            if(type.includes('診斷書')){
              this.fileInfo.push({pdf_type: "diagnosis",division: department,fileName: fileName});
            }
            else if(type.includes('門診+急診收據')){
              this.fileInfo.push({pdf_type: "outpatient_receipt",division: department,fileName: fileName});
            }
            else if(type.includes('住院收據')){
              this.fileInfo.push({pdf_type: "inpatient_receipt",division: department,fileName: fileName});
            }
          }
        }
      }
      this.fileField.type[type].push('file');
    },
    sendCheck(){
      this.currentModal = new Modal(select('#checkModal'));
      //State normal
      if(this.state == '正常'){
        if(this.files.length > 0){        
          this.checkModal.title = '送出理賠證書檔案';
          this.checkModal.content = '沒有選擇檔案之項目，將紀錄此保戶無符合的就診紀錄';
        }
        else{
          this.checkModal.title = '尚未選擇任何檔案，是否送出理賠申請？';
          this.checkModal.content = '將紀錄此保戶無符合的就診紀錄';
        }
      }
      //State 查無此身份證號
      else if(this.state == '人找不到'){
        this.checkModal.title = '已勾選<span>查無此身份證號</span>，是否送出理賠申請？';
        this.checkModal.content = '將不會上傳任何檔案';
      }
      //State 查無區間就診資料
      else if(this.state == '期間找不到'){
        this.checkModal.title = '已勾選<span>查無區間就診資料</span>，是否送出理賠申請？';
        this.checkModal.content = '將不會上傳任何檔案';
      }
      this.checkModal.btnColor = 'green';
      this.currentModal.show();
    },
    sendFile(){
      var response = null;
      var apiAddress = 'https://60.249.237.182:443';
      var formData = new FormData();
      var fileInfoStr = '';
      var headers = {
        'Content-Type': 'multipart/form-data'
      };
      this.currentModal = new Modal(select('#reminderModal'));      
      
      formData.append('claim', this.claimId);
      for(var i = 0; i < this.fileInfo.length; i++){
        if(i == 0)
          fileInfoStr = fileInfoStr.concat(JSON.stringify(this.fileInfo[i]));
        else
          fileInfoStr = fileInfoStr.concat(', ', JSON.stringify(this.fileInfo[i]));
      }      
      formData.set('file_info', fileInfoStr);
      for(var i = 0; i < this.files.length; i++){
        formData.append('files', this.files[i]);
      }
      //error_code 
      // 0.尚未上傳
      // 1.期間找不到
      // 2.人找不到
      // 3.時間超過
      // 4.上傳成功
      switch(this.state){
        case '正常':
          break;
        case '人找不到':
          formData.append('error_code', 2);
          break;
        case '期間找不到':
          formData.append('error_code', 1);
          break;
        default:
          formData.append('error_code', 0);
          break;
      };
      
      axios.post(apiAddress + '/prod/upload', formData, { headers })
      .then(response => {
        response = response.data;

        if(this.state == '正常'){
          if(response && response == true){
            this.reminderModal.state = 'success';
            this.reminderModal.title = '送出成功';
            this.reminderModal.content = '將於 <span>5 秒</span> 後自動跳轉主頁';
            this.countStart();
          }
          else{
            this.reminderModal.state = 'fail';
            this.reminderModal.title = '送出失敗，請重新嘗試';
            this.reminderModal.content = '';
          }
        }
        else{
          this.reminderModal.state = 'success';
          this.reminderModal.title = '送出成功';
          this.reminderModal.content = '將於 <span>5 秒</span> 後自動跳轉主頁';
          this.countStart();
        }
        this.currentModal.show();
      })
      .catch(error => (console.log(error)));
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
    this.claimId = this.$route.params.claim;
    this.userId = this.$route.params.id_number;
    this.authorizedDate = this.$route.params.authorizedDate;
    this.authorizationUrl = this.$route.params.authorizationCertificate;
    this.$route.params.division.forEach((division) => {
      this.fileField.division.push(division);
    })
    this.$route.params.type.forEach((type) => {
      switch(type){
        case 'diagnosis':
          this.fileField.type['診斷書'] = [];
          this.fileField.type['診斷書'].push('file');
          break;        
        case 'inpatient_receipt':
          this.fileField.type['住院收據'] = [];
          this.fileField.type['住院收據'].push('file');
          break;
        case 'outpatient_receipt':
        case 'emergency_receipt':
          this.fileField.type['門診+急診收據'] = [];
          this.fileField.type['門診+急診收據'].push('file');
          break;
      }
    })
    console.log(this.$route.params, this.fileField);
  },
  beforeUpdate(){    
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
      letter-spacing: 0.01em;      
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
.state-block{
  padding: 16px 10px;
  background: #ffffff;
  border: 1px solid #E0E0E0;
  border-radius: 10px;
  label{
    font-family: 'Circular Pro';
    font-size: 14px;
    line-height: 20px;
    color: $text-main;
    span{
      color: $grey-dark;
    }
  }
  .form-check .form-check-input:checked{
    background-color: $green-default;
    border-color: $green-default;
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
        &.btn-col{
          width: 50%;
          button{
            min-width: 65px;
            height: 34px;
            font-size: 12px;
            line-height: 150%;
          }
          input[type="file"]{
            display: block;
            margin: 5px 0;
          }
        }
      }
    }
  }
}
.send-block{
  display: flex;
  justify-content: end;
  margin: 32px 0;
  .send-btn{
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: 200px;
    min-height: 48px;
    padding: 12px;
    img{
      height: 24px;
      width: 24px;
      margin-right: 8px;
    }
    span{
      font-size: 16px;
      line-height: 150%;
      text-align: center;
      letter-spacing: 0.01em;
    }
  }
}
</style>