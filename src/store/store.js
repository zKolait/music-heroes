import Vue from 'vue'
import Vuex from 'vuex'
import authModule from '@/store/auth'
import chatModule from '@/store/chat'

Vue.use(Vuex)

export default new Vuex.Store({
    modules: {
        auth: authModule,
        chat: chatModule,
    }
})
