<template>
  <section class="h-full mr-auto flex flex-col gap-2 font-mono text-primary-gray-80 text-6 leading-0 bg-primary-120 p-6">
    <section class="flex gap-2 h-full w-full">
      <section class="h-full flex flex-col justify-between">
        <div
          v-for="num in verticalNums"
          class="flex items-center justify-center w-10 "
        >{{ num }}</div>
      </section>
      <section class="relative flex h-full w-full justify-between items-end">
        <section class="absolute top-0 left-0 h-full w-full flex flex-col justify-between">
          <div
            v-for="num in verticalNums"
            class="relative w-full"
          >
            <span class="opacity-0 select-none">{{ num }}</span>
            <div class="absolute bottom-0 left-0 transform -translate-y-1/2 bg-primary-gray-110 w-full h-px-1"/>
          </div>
        </section>
        <div
          v-for="({ num, total }) in totals"
          class="relative flex w-10"
          :style="{ height: `${total / maxTotal * 100}%`, minHeight: '1px' }"
        >
          <div
            class="mx-auto w-7 rounded-4"
            :class="total === 0 ? '' : 'bg-primary-80'"
          />
        </div>
      </section>
    </section>
    <section class="flex gap-2 h-auto w-full">
      <section class="h-1 w-10"></section>
      <section class="flex gap-6 justify-between items-end">
        <div
          v-for="({ num, total }) in totals"
          class="flex items-center justify-center w-10 flex-shrink-0"
        >{{ num }}</div>
      </section>
    </section>
  </section>
</template>

<script>
import { ref } from 'vue'
export default {
  props: {
    code: {
      type: String,
      required: true,
    },
  },
  setup ({ code }) {
    const indentations = code
            .split(`\n`)
            .map(line => line.match(/^( +)/)?.[1] ?? '')
            .map(line => line.length),
          horizontalNums = (new Array(19))
            .fill()
            .map((_, index) => index)
            .filter(num => num % 2 === 0),
          totals = ref(horizontalNums.map(num => ({
            num,
            total: indentations.filter(indentation => indentation === num).length
          }))),
          maxTotal = ref(80),
          verticalNums = ref(new Array(maxTotal.value / 10 + 1).fill().map((_, index) => index * 10).reverse())
    
    console.log(totals.value)

    return {
      totals,
      maxTotal,
      verticalNums,
    }
  }
}
</script>
