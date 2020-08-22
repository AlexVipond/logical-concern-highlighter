<template>
  <main class="bg-gray-80 p-10">
    <section class="relative w-auto bg-white">
      <pre><code>{{ code }}</code></pre>
      <div
        class="absolute h-full w-full top-0 left-0"
        v-for="[concern, classes, lines] in concerns"
        :key="concern"
      >
        <highlight
          v-for="line in lines"
          :key="line"
          :class="classes"
          :style="{ top: `${1.5 * line}em` }"
        />
      </div>
    </section>
  </main>
</template>

<script>
import code from './code'
import concerns from './concerns'
import Highlight from './Highlight.vue'

export default {
  name: 'App',
  components: {
    Highlight,
  },
  setup () {
    console.log(concerns)
    return { code, concerns }
  }
}
</script>
