export default `import { ref, reactive, computed, nextTick } from 'vue'\n\
import debounce from 'debounce'\n\
import {\n\
  useBindings, // Used for binding static and reactive data to DOM references\n\
  useListeners // Used for adding event listeners, and cleaning them up when the component is unmounted\n\
} from '@baleada/vue-features/util'\n\
\n\
export default function useListbox ({ options: rawOptions, defaultOption }) {\n\
  /* \n\
   * First, we build an array of options.\n\
   * This array contains the core option objects that we'll be\n\
   * interacting with in the rest of the function.\n\
   */\n\
  const optionsEls = ref([]), // When attached to the element with v-for, this becomes an array of DOM elements\n\
        options = rawOptions.map((option, index) => {\n\
          const value = option,\n\
                isActive = computed(() => value === active.value),\n\
                isSelected = computed(() => value === selected.value),\n\
                el = computed(() => optionsEls.value[index]),\n\
                id = generateId()\n\
\n\
          useBindings({\n\
            target: el,\n\
            bindings: {\n\
              // Statically bind the role and id\n\
              role: 'option',\n\
              id,\n\
              \n\
              // Reactively bind the selected state\n\
              'aria-selected': computed(() => isSelected.value ? true : '')\n\
            },\n\
          })\n\
          \n\
          // Handle click and mousemove\n\
          useListeners({\n\
            target: el,\n\
            listeners: {\n\
              click () {\n\
                select(value)\n\
              },\n\
              mousemove () {\n\
                if (active.value === value) {\n\
                  return\n\
                }\n\
  \n\
                activate(value)\n\
              }\n\
            }\n\
          })\n\
\n\
          return {\n\
            el,\n\
            value,\n\
            isActive,\n\
            isSelected,\n\
            id,\n\
          }\n\
        })\n\
\n\
  /* Manage the value of the selected option */\n\
  const selected = ref(defaultOption || rawOptions[0]),\n\
        select = newValue => {\n\
          selected.value = newValue\n\
\n\
          /* EFFECT: Close the list */\n\
          nextTick(() => close())\n\
        }\n\
\n\
  /* Manage option active status */\n\
  const active = ref(null),\n\
        activeIndex = computed(() => options.findIndex(({ value }) => value === active.value)),\n\
        activate = newValue => {\n\
          active.value = newValue\n\
\n\
          /* EFFECT: Scroll list to the active option */\n\
          if (active.value === null) {\n\
            return\n\
          }\n\
    \n\
          nextTick(() => listEl.value.children[activeIndex.value].scrollIntoView({ block: 'nearest' }))\n\
        }\n\
\n\
  /* Manage typeahead */\n\
  const typeahead = ref(''),\n\
        type = value => {\n\
          typeahead.value = typeahead.value + value\n\
          clearTypeahead()\n\
\n\
          /* EFFECT: Focus the first option that matches the typeahead */\n\
          const match = options.find(({ el }) => {\n\
            return el.value.innerText.toLowerCase().startsWith(typeahead.value.toLowerCase())\n\
          }) || { value: null }\n\
    \n\
          activate(match.value)\n\
        },\n\
        clearTypeahead = debounce(() => {\n\
          typeahead.value = ''\n\
        }, 500)\n\
\n\
  /* Manage list open state */\n\
  const listIsOpen = ref(false),\n\
        toggle = () => {\n\
          listIsOpen.value ? close() : open()\n\
        },\n\
        open = () => {\n\
          listIsOpen.value = true\n\
          activate(selected.value)\n\
\n\
          /* EFFECT: Focus the list of options */\n\
          nextTick(() => {\n\
            listEl.value.focus()\n\
          })\n\
        },\n\
        close = () => {\n\
          listIsOpen.value = false\n\
\n\
          /* EFFECT: Focus the button */\n\
          buttonEl.value.focus()\n\
        }\n\
\n\
  /* Set up label ref */\n\
  const labelEl = ref(null),\n\
        labelId = generateId()\n\
  \n\
  // Statically bind label ID\n\
  useBindings({ target: labelEl, bindings: { id: labelId } })\n\
\n\
  /* Set up button */\n\
  const buttonEl = ref(null)\n\
  \n\
  useBindings({\n\
    target: buttonEl,\n\
    bindings: {\n\
      // Statically bind some button attrs\n\
      type: 'button',\n\
      'aria-haspopup': 'listbox',\n\
      'aria-labelledby': labelId,\n\
      \n\
      // Reactively bind list open state.\n\
      'aria-expanded': listIsOpen,\n\
    }\n\
  })\n\
\n\
  // Handle button focus, blur, and click\n\
  const buttonIsFocused = ref(false)\n\
  useListeners({\n\
    target: buttonEl,\n\
    listeners: {\n\
      focus () {\n\
        buttonIsFocused.value = true\n\
      },\n\
      blur () {\n\
        buttonIsFocused.value = false\n\
      },\n\
      click: toggle,\n\
    }\n\
  })\n\
\n\
\n\
  /* Set up list */\n\
  const listEl = ref(null)\n\
\n\
  useBindings({\n\
    target: listEl,\n\
    bindings: {\n\
      tabindex: '-1',\n\
      role: 'listbox',\n\
      'aria-activedescendant': computed(() => options.find(({ value }) => value === active.value)?.id || null),\n\
      'aria-labelledby': '',\n\
    }\n\
  })\n\
\n\
  useListeners({\n\
    target: listEl,\n\
    listeners: {\n\
      focusout (e) {\n\
        if (e.relatedTarget === buttonEl.value) {\n\
          return\n\
        }\n\
\n\
        close()\n\
      },\n\
      mouseleave () {\n\
        active.value = null\n\
      },\n\
      keydown (e) {\n\
        let indexToFocus\n\
        switch (e.key) {\n\
          case 'Esc':\n\
          case 'Escape':\n\
            e.preventDefault()\n\
            close()\n\
            break\n\
          case 'Tab':\n\
            e.preventDefault()\n\
            break\n\
          case 'Up':\n\
          case 'ArrowUp':\n\
            e.preventDefault()\n\
            indexToFocus = activeIndex.value - 1 < 0 ? options.length - 1 : activeIndex.value - 1\n\
            activate(options[indexToFocus].value)\n\
            break\n\
          case 'Down':\n\
          case 'ArrowDown':\n\
            e.preventDefault()\n\
            indexToFocus = activeIndex.value + 1 > options.length - 1 ? 0 : activeIndex.value + 1\n\
            activate(options[indexToFocus].value)\n\
            break\n\
          case 'Spacebar':\n\
          case ' ':\n\
            e.preventDefault()\n\
            if (typeahead.value !== '') {\n\
              type(' ')\n\
            } else {\n\
              select(active.value)\n\
            }\n\
            break\n\
          case 'Enter':\n\
            e.preventDefault()\n\
            select(active.value)\n\
            break\n\
          default:\n\
            if (!(isString(e.key) && e.key.length === 1)) {\n\
              return\n\
            }\n\
\n\
            e.preventDefault()\n\
            type(e.key)\n\
            return\n\
        }\n\
      }\n\
    }\n\
  })\n\
\n\
  // \`reactive\` is used on the return value so that the user can destructure\n\
  // without losing reactivity, and so that all \`ref\`s get unwrapped.\n\
  //\n\
  // https://v3.vuejs.org/guide/reactivity-fundamentals.html#access-in-reactive-objects\n\
  // https://v3.vuejs.org/guide/reactivity-fundamentals.html#destructuring-reactive-state\n\
  return reactive({\n\
    label: {\n\
      ref: el => (labelEl.value = el),\n\
    },\n\
    button: {\n\
      ref: el => (buttonEl.value = el),\n\
      isFocused: buttonIsFocused\n\
    },\n\
    list: {\n\
      ref: el => (listEl.value = el),\n\
      isOpen: listIsOpen\n\
    },\n\
    options: {\n\
      values: options,\n\
      // Since the options ref gets bound to a v-for, it's required to be a function ref\n\
      // with a little extra logic inside.\n\
      // \n\
      // https://v3.vuejs.org/guide/composition-api-template-refs.html#usage-inside-v-for\n\
      //\n\
      // To keep the developer experience consistent, all other element refs are exposed\n\
      // as functions, too. That way, developers consistently bind every element ref,\n\
      // instead of passing strings to some elements and binding refs to others.\n\
      ref: (el) => (optionsEls.value = [...optionsEls.value, el]),\n\
    },\n\
    selected,\n\
  })\n\
}\n\
\n\
function isString(value) {\n\
  return typeof value === 'string' || value instanceof String\n\
}\n\
\n\
let id = 0\n\
// If there's ever a strong use case for customizing the id prefix,\n\
// it could be exposed as an optional param for the composition function.\n\
function generateId(idPrefix = 'tailwind-ui-listbox-id-') {\n\
}\n\
\n`
