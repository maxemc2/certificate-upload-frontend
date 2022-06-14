import { createApp } from 'vue'
import { router } from './router'
import App from './App.vue'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap'
import 'jquery/src/jquery.js'
import 'assets/scss/style.scss'

const app = createApp(App);
app.use(router);
app.mount('#app');
