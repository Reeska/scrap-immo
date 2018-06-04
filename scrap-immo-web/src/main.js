import Vue from 'vue'
import Vuetify from 'vuetify'
import App from './App.vue'

Vue.config.productionTip = false

Vue.use(Vuetify)

import 'vuetify/dist/vuetify.min.css'

Vue.filter("number", value => new Intl.NumberFormat('fr-fr').format(value));

new Vue({
    render: h => h(App)
}).$mount('#app')
