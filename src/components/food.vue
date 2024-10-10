<script setup lang="ts">
import {ref} from 'vue';

const items = ref(['First item'])


const count = ref(0)

const isMenuOpen = ref<boolean>(false)
const openMenu = (action: boolean) => {
  console.log("openMenu...")
  isMenuOpen.value = action;
}

const sayHello = (what: any) => {
  console.log(`Hello ${what}`);
}

const appendItem = () => {
  items.value.push(`New item ${items.value.length + 1}`);
}

const deleteItem = (index: number) => {
  items.value = items.value.filter((v, i) => i != index);
}

const food: string[] = ["Pizza", "French fries", "Spaghetti"];
</script>
<template>
  <div>
    <h3>Hello Vue</h3>

    <button @click="appendItem()">Add item</button>

    <div>
      <ul v-for="(item, index) in items">
        <li>#{{ index }} - {{ item }} - <a @click.stop="deleteItem(index)">Delete</a></li>
      </ul>
    </div>


    <!--
    <button @click="openMenu(true)" v-if="!isMenuOpen">Menu open</button>
    <button @click="openMenu(false)" v-else>Menu close</button>
    <div v-if="isMenuOpen">This is menu</div>

    <hr/>
    <ul>
      <li v-for="item in food">
        {{ item }}
      </li>
    </ul> -->
  </div>
</template>
