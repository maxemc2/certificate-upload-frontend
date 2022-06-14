import { createRouter, createWebHistory } from 'vue-router'
import ClaimApplyList from 'components/ClaimApplyList.vue'
import UploadFile from 'components/UploadFile.vue'
import ViewFile from 'components/ViewFile.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [    
    { 
      name:'claimList',
      path: '/',
      component: ClaimApplyList 
    },
    { 
      name: 'uploadFile',
      path: '/upload', 
      component: UploadFile 
    },
    { 
      name: 'viewFile',
      path: '/detail',
      component: ViewFile 
    },
  ],
});