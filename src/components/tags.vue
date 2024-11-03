<script setup lang="ts">
import {defineProps, ref} from 'vue';

const props = defineProps(['tags'])
const tags = ref<string[]>((props.tags || []));
tags.value.sort();

</script>
<template>
  <div class="tags">
    <div class="tag" v-for="tag in tags">
      <span>{{ tag }}</span>
    </div>
  </div>
</template>
<style scoped lang="scss">
.tags {
  margin-top: 5px;

  .tag {
    font-size: smaller;
    display: inline-block;
    margin-right: 2px;
    padding: 2px 3px;
    border-radius: 5px;
    background-color: #333333;
    color: #535353;
    margin-bottom: 3px;
  }
}
</style>