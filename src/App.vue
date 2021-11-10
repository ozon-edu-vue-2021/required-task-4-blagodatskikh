<template>
  <div id="app">
    <Form />
  </div>
</template>

<script>
import Form from './components/Form.vue';

export default {
  name: 'App',
  components: { Form },
};
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body {
  height: 100%;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  color: #2c3e50;
  background-color: #fafafa;
  box-sizing: border-box;

  height: 100%;
  padding-top: 50px;
  padding-bottom: 50px;
}

.form {
  margin: 0 auto;
}
</style>
