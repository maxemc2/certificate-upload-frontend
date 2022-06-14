<template>
   <!-- Header -->
  <header id="header" class="fixed-top">
    <div class="container-xl d-flex align-items-center">
      <div class="logo">
        <a href="#"><img src="./assets/img/logo.svg">奇美醫院醫療數位證明人工上傳系統</a>
      </div>
      <div class="user-name ms-auto">王小明</div>      
    </div>
  </header>
  <!-- End Header -->
  <main id="main" class="container">
    <router-view></router-view>
  </main>
  <!-- End #main -->
  <!-- Footer -->
  <footer id="footer">
    <div class="container d-flex justify-content-end">
      <div class="copyright">
        奇美醫院醫療數位證明服務  聯庭智能公司版權所有
      </div>
    </div>
  </footer>
  <!-- End Footer -->
  <div id="preloader"></div>
  <a href="#" class="back-to-top d-flex align-items-center justify-content-center"><i class="bi bi-arrow-up-short"></i></a>
</template>

<script>
import { on, select, onscroll } from 'assets/js/shortcut.js'
import axios from 'axios'
import ClaimApplyList from 'components/ClaimApplyList.vue'

export default {
  name: 'App',
  data(){
    return{
    }
  },
  components: {
    ClaimApplyList
  },  
  methods: {
  },
  computed: {
  },
  mounted() {
    //Preloader
    let preloader = select('#preloader');
    if (preloader) {
      window.addEventListener('load', () => {
        preloader.style.display = "none";
      });
    }       
    //Back to top button
    let backtotop = select('.back-to-top')
    if (backtotop) {
      const toggleBacktotop = () => {
        if (window.scrollY > 100) {
          backtotop.classList.add('active')
        } else {
          backtotop.classList.remove('active')
        }
      }
      window.addEventListener('load', toggleBacktotop)
      onscroll(document, toggleBacktotop)
    }
  },
}
</script>

<style>

</style>
