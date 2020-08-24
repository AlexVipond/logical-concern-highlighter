<template>
  <main class="bg-gray-80 p-10">
    <section class="relative w-auto bg-white p-10">
      <!-- <textarea
        type="text"
        class="form-input"
        @input="({ target: { value } }) => (code = value)"
        :value="code"
      /> -->
    </section>
    <section class="mt-10 relative w-auto bg-white flex flex-row">
      <pre><code>{{ lineNumbers }}</code></pre>
      <pre><code>{{ code }}</code></pre>
      <div
        class="absolute h-full w-full top-0 left-0"
        v-for="{ concern, classes, lines } in concerns"
        :key="concern"
      >
        <highlight
          v-for="line in lines"
          :key="line"
          :class="classes"
          :style="{ top: `${1.5 * (line - 1)}em` }"
        />
      </div>
    </section>
  </main>
</template>

<script>
import { ref, computed } from 'vue'
import rawCode from './code/Listbox.js'
import rawConcerns from './concerns/Listbox'
import toConcerns from './toConcerns'
import Highlight from './Highlight.vue'

export default {
  name: 'App',
  components: {
    Highlight,
  },
  setup () {
    const code = ref(rawCode),
          lines = computed(() => code.value.split('\n').length),
          lineNumbers = computed(() => {
            let lineNumbers = ''
            for (let i = 1; i <= lines.value; i++) {
              lineNumbers += `${i}\n`
            }
            return lineNumbers
          })    

    return {
      lineNumbers,
      code,
      concerns: toConcerns(rawConcerns)
    }
  }
}
</script>
