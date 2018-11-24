import Vue, { CreateElement } from 'vue';
import App from './App.vue';

const app = new Vue({
  el: '#app',
  render: function(createElement: CreateElement) {
    return createElement('app');
  },
  components: {
    App,
  },
});
