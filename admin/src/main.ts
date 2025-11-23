import { createApp } from 'vue'
import './style.less'
import App from './App.vue'
import router from './router'
import "@/router/guard"
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createPinia } from 'pinia'
import "./mock"
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import permission from './directives/permission'
const app = createApp(App);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
const pinia=createPinia()
app.directive("permission",permission)
app.use(ElementPlus)
app.use(pinia)
app.use(router);
app.mount('#app')
