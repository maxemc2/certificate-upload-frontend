<template>    
  <section class="claim-list">
    <div class="section-title">
      <span class="title">理賠申請清單</span>
    </div>
    <div class="claim-filter d-flex align-items-center">
      <div class="tab-btns">
        <button type="button" class="tab-btn" :class="{'active': state=='全部'}" @click="changeState('全部')">全部</button>
        <button type="button" class="tab-btn" :class="{'active': state=='未上傳'}" @click="changeState('未上傳')">未上傳</button>
        <button type="button" class="tab-btn" :class="{'active': state=='已上傳'}" @click="changeState('已上傳')">已上傳</button>
      </div>
      <div class="search-bar ms-auto">
        <div class="grouped-input d-flex align-items-center">
          <input type="text" class="text-input" id="search-condition" placeholder="搜尋理賠單號、身份證號" v-model.lazy="condition" />
          <button class="clear-btn ms-auto" @click="condition = ''"><i class="bi bi-x-circle-fill"></i></button>
        </div>
      </div>
    </div>
    <div class="claim-table">
      <table border="0">
        <tr>              
          <th>理賠單號</th>
          <th>保戶身分證號</th>
          <th>授權期間</th>
          <th>申請時間</th>
          <th>上傳時間</th>
          <th></th>
        </tr>
        <tr v-for="claim, claim_index in filteredClaimList" :key="claim_index">
          <td>{{ claim.claim }}</td>
          <td>{{ claim.id_number }}</td>
          <td>{{ claim.authorizedDate }}</td>
          <td>{{ claim.applyDate }}</td>
          <td v-if="claim.uploadDate == ''">-</td>
          <td v-else>{{ claim.uploadDate }}</td>
          <td class="btn-td" v-if="claim.uploadDate == ''">
            <button class="green-btn-bg download-btn" @click="goUploadPage(claim)"><i class="bi bi-arrow-up-circle"></i>上傳檔案</button>
          </td>
          <td class="btn-td" v-else>
            <button class="green-btn-border-text view-btn" @click="goDetailPage(claim)"><i class="bi bi-eye-fill"></i>檢視</button>
          </td>
        </tr>
      </table>
    </div>
  </section>
</template>

<script>
import { on, select } from 'assets/js/shortcut.js'
import { Modal } from 'bootstrap'
import axios from 'axios'

export default {
  name: 'ClaimApplyList',
  props: {
    msg: String
  },
  data() {
    return {
      claimList: [],
      state: '全部',
      condition: '',
      recorderInfo: '',
      reminderInfo: {
        img: '',
        topic: '',
        text: '',
        checkButton: 'green-btn-bg',
      }
    }
  },
  emits: ["updateData"],
  methods: {
    changeState(state){
      this.state = state;
    },
    sortClaimList(claimList){
      return claimList.sort(function (a, b) {
        var date1 = new Date(a.applyDate);
        var date2 = new Date(b.applyDate);
        return date2 - date1;
      })
    },
    goUploadPage(data){
      this.$router.push({
        name: 'uploadFile',
        params: {
          claim: data.claim,
          id_number: data.id_number,
          authorizedDate: data.authorizedDate,
          authorizationCertificate: data.authorizationCertificate,
          division: data.details.authorizationContent.division,
          type: data.details.authorizationContent.type
        }
      })
    },
    goDetailPage(data){
      this.$router.push({
        name: 'viewFile',
        params: {
          claim: data.claim,
          id_number: data.id_number,
          authorizedDate: data.authorizedDate,
          uploadDate: data.uploadDate,
          authorizationCertificate: data.authorizationCertificate
        }
      })
    }
  },
  computed: {
    filteredClaimList: function(){
      var claimList = this.claimList;
      var nonUploadedList, uploadedList;
      var state = this.state;
      var condition = this.condition;

      if(condition != ''){
        claimList = claimList.filter(function(claim){
          if(claim.claim.includes(condition) || claim.id_number.includes(condition)){
            return claim;
          }
        })
      }

      if(state == '未上傳'){
        nonUploadedList = claimList.filter(function(claim){
          if(claim.uploadDate == ''){
            return claim;
          }
        });
        return this.sortClaimList(nonUploadedList);
      }
      else if(state == '已上傳'){
        uploadedList = claimList.filter(function(claim){
          if(claim.uploadDate.length >= 8){
            return claim;
          }
        });
        return this.sortClaimList(uploadedList);
      }
      else{
        nonUploadedList = claimList.filter(function(claim){
          if(claim.uploadDate == ''){
            return claim;
          }
        });
        uploadedList = claimList.filter(function(claim){
          if(claim.uploadDate.length >= 8){
            return claim;
          }
        });
        return this.sortClaimList(nonUploadedList).concat(this.sortClaimList(uploadedList));
      }
    }
  },
  mounted() {
    //Tab Button
    let buttons = select('.claim-list .tab-btns .btn', true);
    on('click', '#medical-certificate .tab-btns .btn', function(e) {
      buttons.forEach(function(ele){
        ele.classList.remove('active');
      });    
      this.classList.add('active');
    }, true);
    
    var apiAddress = 'https://60.249.237.182:443';
    var headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'false'
    };
    
    axios.post(apiAddress + '/prod/get_claims',{
      'id_number': ''
    }, { headers })
    .then(response => {
      response = response.data;

      if(response && "claims" in response){
        this.claimList = response.claims;
      }
    })
    .catch(error => (console.log(error)));
  },
  beforeUpdate(){
  }
}
</script>

<style>

</style>