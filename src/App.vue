<template>
  <div id="app">
    <transition name="fade" mode="out-in">
      <component :is="($route.meta.layout || 'default') + '-layout'">
        <router-view/>
      </component>
    </transition>
  </div>
</template>

<script>
export default {
}
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Lato');

html{
  overflow: hidden;
}

#app {
  font-family: 'Lato', Arial, 'Avenir', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #444;
}

img{
  border-radius: 5px;
}

::-webkit-scrollbar {
    width: 2px;
}

::-webkit-scrollbar-track {
    
    background: #ddd;
}
    
::-webkit-scrollbar-thumb {
    background: #666; 
}

.input-container {
    display: -ms-flexbox;
    display: flex;
    width: 100%;
}

.input-container .icon {
    padding: 10px 0;
    background: #fd8c30;
    color: white;
    min-width: 50px;
    text-align: center;
    cursor: pointer;
    border-radius: 32px 0 0 32px;
}

.input-field {
    width: 100%;
    padding: 10px;
    outline: none;
    border: 1px solid #fd8c30;
    border-radius: 0 32px 32px 0;
}

.btn {
    background-color: #fd8c30;
    color: white;
    padding: 15px 20px;
    border: none;
    cursor: pointer;
    width: 100%;
    transition: 0.3s;
    outline: none;
    border-radius: 5px;
    border-radius: 32px;
}

.btn:hover {
    background: #f37335;
    transition: 0.3s;
    outline: none;
}

.fade-enter-active,
.fade-leave-active {
  transition-duration: 0.05s;
  transition-property: opacity;
  transition-timing-function: ease;
}

.fade-enter,
.fade-leave-active {
  opacity: 0
}

.cs-loader-inner {
  transform: translateY(-50%);
  color: #fd8c30;
  padding: 0 100px;
  text-align: center;
}

.cs-loader-inner label {
  font-size: 20px;
  opacity: 0;
  display:inline-block;
}

@keyframes lol {
  0% {
    opacity: 0;
    transform: translateX(-300px);
  }
  33% {
    opacity: 1;
    transform: translateX(0px);
  }
  66% {
    opacity: 1;
    transform: translateX(0px);
  }
  100% {
    opacity: 0;
    transform: translateX(200px);
  }
}

@-webkit-keyframes lol {
  0% {
    opacity: 0;
    -webkit-transform: translateX(-300px);
  }
  33% {
    opacity: 1;
    -webkit-transform: translateX(0px);
  }
  66% {
    opacity: 1;
    -webkit-transform: translateX(0px);
  }
  100% {
    opacity: 0;
    -webkit-transform: translateX(300px);
  }
}

.cs-loader-inner label:nth-child(6) {
  -webkit-animation: lol 1s infinite ease-in-out;
  animation: lol 1s infinite ease-in-out;
}

.cs-loader-inner label:nth-child(5) {
  -webkit-animation: lol 1s 100ms infinite ease-in-out;
  animation: lol 1s 100ms infinite ease-in-out;
}

.cs-loader-inner label:nth-child(4) {
  -webkit-animation: lol 1s 200ms infinite ease-in-out;
  animation: lol 1s 200ms infinite ease-in-out;
}

.cs-loader-inner label:nth-child(3) {
  -webkit-animation: lol 1s 300ms infinite ease-in-out;
  animation: lol 1s 300ms infinite ease-in-out;
}

.cs-loader-inner label:nth-child(2) {
  -webkit-animation: lol 1s 400ms infinite ease-in-out;
  animation: lol 1s 400ms infinite ease-in-out;
}

.cs-loader-inner label:nth-child(1) {
  -webkit-animation: lol 1s 500ms infinite ease-in-out;
  animation: lol 1s 500ms infinite ease-in-out;
}

</style>
