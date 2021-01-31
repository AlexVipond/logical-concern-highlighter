export default `import { ref, computed, unref, watch, onBeforeUpdate, nextTick } from 'vue'
import debounce from 'debounce'
import { useBindings, useListeners, useConditionalDisplay } from '@baleada/vue-features/affordances'

export default function useListbox ({ totalOptions, initialSelected }) {
  // BOILERPLATE
  const button = useTarget('single'),
        list = useTarget('single'),
        options = useTarget('multiple'),
        label = useTarget('single')


  // SELECTED
  const selected = ref(initialSelected ?? 0),
        select = newSelected => (selected.value = newSelected)

  useListeners({
    target: options.targets,
    listeners: {
      click: { targetClosure: ({ index }) => () => select(index) }
    }
  })

  useListeners({
    target: list.target,
    listeners: {
      keydown (e) {
        switch (e.key) {
          case 'Spacebar':
          case ' ':
            e.preventDefault()

            if (typeahead.value !== '') {
              break
            }

            select(active.value)
            break
          case 'Enter':
            e.preventDefault()
            select(active.value)
            break
        }
      }
    }
  })

  useBindings({
    target: options.targets,
    bindings: {
      ariaSelected: {
        targetClosure: ({ index }) => index === selected.value,
        watchSources: selected,
      }
    }
  })


  // TYPEAHEAD
  const typeahead = ref(''),
        type = value => {
          typeahead.value = typeahead.value + value
          clearTypeahead()
        },
        clearTypeahead = debounce(() => {
          typeahead.value = ''
        }, 500)

  useListeners({
    target: list.target,
    listeners: {
      keydown: e => {
        if (!(isString(e.key) && e.key.length === 1)) {
          return
        }

        e.preventDefault()

        type(e.key)
      }
    }
  })

  // ACTIVE
  const active = ref(null),
        activate = newActive => active.value = newActive,
        ariaActivedescendant = computed(() => options.targets.value[active.value]?.id || null)

  watch(
    active,
    () => {
      if (active.value === null) {
        return
      }

      list.target.value.children[active.value]?.scrollIntoView({ block: 'nearest' })
    },
    { flush: 'post' }
  )

  watch(
    () => typeahead.value,
    () => {
      if (typeahead.value === '') {
        return
      }

      const match = options.targets.value.findIndex(target =>
        target
          .innerText
          .toLowerCase()
          .startsWith(typeahead.value.toLowerCase())
      ) ?? null
    
      activate(match)
    }
  )

  useBindings({
    target: list.target,
    bindings: { ariaActivedescendant }
  })

  useListeners({
    target: options.targets,
    listeners: {
      mouseenter: {
        targetClosure: ({ index }) => () => {
          if (active.value === index) {
            return
          }
  
          activate(index)
        }
      }
    }
  })
  
  useListeners({
    target: list.target,
    listeners: {
      mouseleave: ()  => (active.value = null),
      keydown: e => {
        switch (e.key) {
          case 'Up':
          case 'ArrowUp': {
            e.preventDefault()
            
            activate(active.value - 1 < 0 ? eachable.value.length - 1 : active.value - 1)

            break
          }
          case 'Down':
          case 'ArrowDown': {
            e.preventDefault()
            
            activate(active.value + 1 > eachable.value.length - 1 ? 0 : active.value + 1)

            break
          }
        }
      }
    }
  })
  

  // OPEN/CLOSED
  const isOpen = ref(false),
        toggle = () => isOpen.value ? close() : open(),
        open = () => (isOpen.value = true),
        close = () => (isOpen.value = false)

  watch(
    isOpen,
    () => {
      if (isOpen.value) {
        nextTick(() => list.target.value.focus())
        return
      }
          
      nextTick(() => button.target.value.focus())
    },
  )
  
  watch(selected, close, { flush: 'post' })

  useBindings({
    target: button.target,
    bindings: { ariaExpanded: isOpen }
  })

  useListeners({
    target: button.target,
    listeners: { click: toggle }
  })

  useListeners({
    target: list.target,
    listeners: {
      focusout (e) {
        if (e.relatedTarget === button.target.value) {
          return
        }

        close()
      },
      keydown (e) {
        switch (e.key) {
          case 'Esc':
          case 'Escape':
            e.preventDefault()
            close()
            break
        }
      }
    }
  })

  useConditionalDisplay({
    target: list.target,
    condition: isOpen,
  })


  // WAI ARIA BASICS
  const labelId = generateId()
  useBindings({ target: label.target, bindings: { id: labelId } })
  useBindings({
    target: computed(() => [button.target.value, list.target.value]),
    bindings: { ariaLabelledby: labelId }
  })

  useBindings({
    target: button.target,
    bindings: {
      type: 'button',
      ariaHaspopup: 'listbox',
    }
  })

  useBindings({
    target: list.target,
    bindings: { tabindex: '-1', role: 'listbox' }
  })

  useListeners({
    target: list.target,
    listeners: {
      keydown: e => {
        if (e.key === 'Tab') {
          e.preventDefault()
        }
      }
    }
  })

  const eachable = toEachable(totalOptions)
  eachable.value.forEach(index => {
    const id = generateId()
    useBindings({
      target: computed(() => options.targets.value[index]),
      bindings: {
        role: 'option',
        id,
      }
    })
  })


  // BUTTON FOCUS
  const buttonIsFocused = ref(false)

  useListeners({
    target: button.target,
    listeners: {
      focus: () => (buttonIsFocused.value = true),
      blur: () => (buttonIsFocused.value = false),
    }
  })

  button.handle.isFocused = buttonIsFocused


  // BOILERPLATE
  return {
    label: label.handle, 
    button: button.handle, 
    list: list.handle, 
    options: options.handle, 
    active,
    selected,
    isOpen,
    typeahead,
    buttonIsFocused
  }
}


// UTIL
function useTarget (type) {
  switch (type) {
    case 'single': {
      const target = ref(null),
            handle = () => t => (target.value = t)

      return { target, handle }
    }
    case 'multiple': {
      const targets = ref([]),
            handle = index => target => {
              if (target) targets.value[index] = target
            }

      onBeforeUpdate(() => (targets.value = []))

      return { targets, handle }
    }
  } 
}

function toEachable (total) {
  return computed(() => 
    (new Array(unref(total)))
      .fill()
      .map((_, index) => index)
  )
}

function isString (value) {
  return typeof value === 'string' || value instanceof String
}

let id = 0
function generateId(idPrefix = 'tailwind-ui-listbox-id-') {
  return ` + '`' + '${idPrefix}${++id}' + `
}`
