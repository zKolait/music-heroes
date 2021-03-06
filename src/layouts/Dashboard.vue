﻿<template>
    <div>
        <div id="container" v-if="hasInstru !== false">
            <dashboard-header class="header" />
            <Sidebar class="sidebar" :user="user" :tchats="tchats" @open-tchat="openTchat"/>
            <div class="content">
                <slot />
            </div>
            <Tchat class="tchat color-clear" :user="user" :messages="messages" :roomData="roomData" @close-tchat="closeTchat"/>
        </div>
        <div id="container__instru" v-if="hasInstru === false">
            <dashboard-header class="header" />
            <instrument id="instrument" :user="user" :instruments="instruments" />
        </div>
    </div>
</template>

<script>
import instrument from '@/components/instrument'
import dashboardHeader from '@/components/header'
import Sidebar from '@/components/sidebar'
import Tchat from '@/components/tchat'
import io from 'socket.io-client'
import api from '../api/api'

export default {
    components: {
        instrument,
        dashboardHeader,
        Sidebar,
        Tchat
    },
    data () {
        return {
            user: this.$store.getters['getUser'],
            hasInstru: null,
            roomData: null,
            messages: null,
            tchats: null,
            socket: io('localhost:3000'),
            instruments: ['Guitare', 'Violon', 'Piano', 'Ukulele', 'Batterie', 'Biniou', 'Harpe', 'Contrebasse', 'Violoncelle', 'Alto', 'Clavecin', 'Synthétiseur', 'Flûte à bec', 'Hautbois', 'Saxophone', 'Trompette', 'Trombone', 'Orgue', 'Tuba', 'Cymbale', 'Maracas', 'Tambour', 'Triangle']
        }
    },    
    mounted () {
        if (this.user === null) {
            console.log('User is null wait for data')
        }


        // Check is user has instrument in database
        this.checkInstru()

        // Set all variables
        this.loadData()

        this.$store.dispatch('setSocket', this.socket)

        this.socket.on('receiveMessage', async (message) => {
            await this.loadData()

            if (this.messages && message.room === this.roomData._id) {
                this.messages.push(message)
            }
        })

        this.socket.on('updateChats', async () => {
            await this.loadData()

            this.tchats.sort((a, b) => {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            })
        })

        this.$on('create-tchat', (userId) => { 
            this.createTchat(userId)
        })
    }, 
    methods: {
        async loadData() {
            await this.$store.dispatch('setChats')
            this.tchats = await this.$store.getters['getChats']
            this.tchats.forEach(chat => {
                this.socket.emit('join', chat._id)
            });

            this.socket.emit('join', this.user._id)
        },
        async openTchat(e) {
            this.closeTchat()
            this.roomData = e,
            this.messages = await api.chat.getOne(this.roomData._id)
            this.messages = this.messages.data.messages.reverse()

            this.socket.emit('join', this.roomData._id)
        },
        closeTchat() {
            this.messages = null
            this.roomData = null
        },
        async checkInstru () {
            let response = await this.$store.getters['getUser']
            
            if (!response) {
                return false
            }

            if (response.type === 0 && response.instruments.length === 0) {
                this.hasInstru = false
            } else {
                this.hasInstru = true
            }
        },
        async createTchat (userId) {
            let newTchat = await api.chat.create({target: userId})

            if(newTchat.data.success === false){
                if(newTchat.data.chat){
                    this.openTchat(newTchat.data.chat)
                } else {
                    console.log('erreur :', newTchat.data.error)
                }
            } else {
                await this.socket.emit('createChat', userId)
                await this.loadData()
                await this.openTchat(newTchat.data.chat)
                this.createMessage(`Bonjour, j'aimerais discuter avec vous.`)
            }
        },
        async createMessage (text) {
            if (!text) {
                return
            }
            this.loading = true

            // Building message
            let date = new Date()
            const message = {
                content: text,
                date: date.toLocaleDateString("fr-FR"),
                room: this.roomData._id,
                user: this.user
            }

            // Send message
            await this.socket.emit('sendMessage', message, (response) => {
                this.loading = false
            })
            
        }
    }
}
</script>

<style scoped>

    #container__instru{
        display: grid;
        grid-template-rows: 70px;
        grid-template-columns: 70px;
        grid-template-areas: 
            "header   header  header header header header header header header header header header"
            "instrument instrument instrument instrument instrument instrument instrument instrument instrument instrument instrument instrument";
    }

    #instrument{
        grid-area: instrument;
    }

    #container{
        display: grid;
        grid-template-rows: 70px calc(50vh - 70px) 50vh;
        grid-template-columns: 470px 30px 420px 1fr;
        grid-template-areas: 
            "header   header  header  header"
            "sidebar   main    main    main"
            "sidebar   main    main    main";
    }

    .sidebar{
        grid-area: sidebar;
        margin-top: 6px;
        z-index: 4;
        overflow-x: hidden;
        overflow-y: scroll;
    }

    .tchat{
        grid-area: 3 / 3 / 4 / 4;
        background: #FCF1E8;
        z-index: 3;
    }

    .content{
        grid-area: main;
        background: white;
        margin-top: 6px;
        z-index: 1;        
        overflow-x: hidden;
        overflow-y: auto;
    }

    .header{
        grid-area: header;
        background: white;
        z-index: 2;
    }


</style>
