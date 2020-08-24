export default "import debounce from 'debounce'\n\
\n\
const ListboxSymbol = Symbol('Listbox')\n\
\n\
let id = 0\n\
\n\
function generateId() {\n\
  return `tailwind-ui-listbox-id-${++id}`\n\
}\n\
\n\
function defaultSlot(parent, scope) {\n\
  return parent.$slots.default ? parent.$slots.default : parent.$scopedSlots.default(scope)\n\
}\n\
\n\
function isString(value) {\n\
  return typeof value === 'string' || value instanceof String\n\
}\n\
\n\
export const ListboxLabel = {\n\
  inject: {\n\
    context: ListboxSymbol,\n\
  },\n\
  data: () => ({\n\
    id: generateId(),\n\
  }),\n\
  mounted() {\n\
    this.context.labelId.value = this.id\n\
  },\n\
  render(h) {\n\
    return h(\n\
      'span',\n\
      {\n\
        attrs: {\n\
          id: this.id,\n\
        },\n\
      },\n\
      defaultSlot(this, {})\n\
    )\n\
  },\n\
}\n\
\n\
export const ListboxButton = {\n\
  inject: {\n\
    context: ListboxSymbol,\n\
  },\n\
  data: () => ({\n\
    id: generateId(),\n\
    isFocused: false,\n\
  }),\n\
  created() {\n\
    this.context.listboxButtonRef.value = () => this.$el\n\
    this.context.buttonId.value = this.id\n\
  },\n\
  render(h) {\n\
    return h(\n\
      'button',\n\
      {\n\
        attrs: {\n\
          id: this.id,\n\
          type: 'button',\n\
          'aria-haspopup': 'listbox',\n\
          'aria-labelledby': `${this.context.labelId.value} ${this.id}`,\n\
          ...(this.context.isOpen.value ? { 'aria-expanded': 'true' } : {}),\n\
        },\n\
        on: {\n\
          focus: () => {\n\
            this.isFocused = true\n\
          },\n\
          blur: () => {\n\
            this.isFocused = false\n\
          },\n\
          click: this.context.toggle,\n\
        },\n\
      },\n\
      defaultSlot(this, { isFocused: this.isFocused })\n\
    )\n\
  },\n\
}\n\
\n\
export const ListboxList = {\n\
  inject: {\n\
    context: ListboxSymbol,\n\
  },\n\
  created() {\n\
    this.context.listboxListRef.value = () => this.$refs.listboxList\n\
  },\n\
  render(h) {\n\
    const children = defaultSlot(this, {})\n\
    const values = children.map((node) => node.componentOptions.propsData.value)\n\
    this.context.values.value = values\n\
    const focusedIndex = values.indexOf(this.context.activeItem.value)\n\
\n\
    return h(\n\
      'ul',\n\
      {\n\
        ref: 'listboxList',\n\
        attrs: {\n\
          tabindex: '-1',\n\
          role: 'listbox',\n\
          'aria-activedescendant': this.context.getActiveDescendant(),\n\
          'aria-labelledby': this.context.props.labelledby,\n\
        },\n\
        on: {\n\
          focusout: (e) => {\n\
            if (e.relatedTarget === this.context.listboxButtonRef.value()) {\n\
              return\n\
            }\n\
            this.context.close()\n\
          },\n\
          mouseleave: () => {\n\
            this.context.activeItem.value = null\n\
          },\n\
          keydown: (e) => {\n\
            let indexToFocus\n\
            switch (e.key) {\n\
              case 'Esc':\n\
              case 'Escape':\n\
                e.preventDefault()\n\
                this.context.close()\n\
                break\n\
              case 'Tab':\n\
                e.preventDefault()\n\
                break\n\
              case 'Up':\n\
              case 'ArrowUp':\n\
                e.preventDefault()\n\
                indexToFocus = focusedIndex - 1 < 0 ? values.length - 1 : focusedIndex - 1\n\
                this.context.focus(values[indexToFocus])\n\
                break\n\
              case 'Down':\n\
              case 'ArrowDown':\n\
                e.preventDefault()\n\
                indexToFocus = focusedIndex + 1 > values.length - 1 ? 0 : focusedIndex + 1\n\
                this.context.focus(values[indexToFocus])\n\
                break\n\
              case 'Spacebar':\n\
              case ' ':\n\
                e.preventDefault()\n\
                if (this.context.typeahead.value !== '') {\n\
                  this.context.type(' ')\n\
                } else {\n\
                  this.context.select(this.context.activeItem.value)\n\
                }\n\
                break\n\
              case 'Enter':\n\
                e.preventDefault()\n\
                this.context.select(this.context.activeItem.value)\n\
                break\n\
              default:\n\
                if (!(isString(e.key) && e.key.length === 1)) {\n\
                  return\n\
                }\n\
\n\
                e.preventDefault()\n\
                this.context.type(e.key)\n\
                return\n\
            }\n\
          },\n\
        },\n\
      },\n\
      children\n\
    )\n\
  },\n\
}\n\
\n\
export const ListboxOption = {\n\
  inject: {\n\
    context: ListboxSymbol,\n\
  },\n\
  data: () => ({\n\
    id: generateId(),\n\
  }),\n\
  props: ['value'],\n\
  watch: {\n\
    value(newValue, oldValue) {\n\
      this.context.unregisterOptionId(oldValue)\n\
      this.context.unregisterOptionRef(this.value)\n\
      this.context.registerOptionId(newValue, this.id)\n\
      this.context.registerOptionRef(this.value, this.$el)\n\
    },\n\
  },\n\
  created() {\n\
    this.context.registerOptionId(this.value, this.id)\n\
  },\n\
  mounted() {\n\
    this.context.registerOptionRef(this.value, this.$el)\n\
  },\n\
  beforeDestroy() {\n\
    this.context.unregisterOptionId(this.value)\n\
    this.context.unregisterOptionRef(this.value)\n\
  },\n\
  render(h) {\n\
    const isActive = this.context.activeItem.value === this.value\n\
    const isSelected = this.context.props.value === this.value\n\
\n\
    return h(\n\
      'li',\n\
      {\n\
        attrs: {\n\
          id: this.id,\n\
          role: 'option',\n\
          ...(isSelected\n\
            ? {\n\
                'aria-selected': true,\n\
              }\n\
            : {}),\n\
        },\n\
        on: {\n\
          click: () => {\n\
            this.context.select(this.value)\n\
          },\n\
          mousemove: () => {\n\
            if (this.context.activeItem.value === this.value) {\n\
              return\n\
            }\n\
\n\
            this.context.activeItem.value = this.value\n\
          },\n\
        },\n\
      },\n\
      defaultSlot(this, {\n\
        isActive,\n\
        isSelected,\n\
      })\n\
    )\n\
  },\n\
}\n\
\n\
export const Listbox = {\n\
  props: ['value'],\n\
  data: (vm) => ({\n\
    typeahead: { value: '' },\n\
    listboxButtonRef: { value: null },\n\
    listboxListRef: { value: null },\n\
    isOpen: { value: false },\n\
    activeItem: { value: vm.$props.value },\n\
    values: { value: null },\n\
    labelId: { value: null },\n\
    buttonId: { value: null },\n\
    optionIds: { value: [] },\n\
    optionRefs: { value: [] },\n\
  }),\n\
  provide() {\n\
    return {\n\
      [ListboxSymbol]: {\n\
        getActiveDescendant: this.getActiveDescendant,\n\
        registerOptionId: this.registerOptionId,\n\
        unregisterOptionId: this.unregisterOptionId,\n\
        registerOptionRef: this.registerOptionRef,\n\
        unregisterOptionRef: this.unregisterOptionRef,\n\
        toggle: this.toggle,\n\
        open: this.open,\n\
        close: this.close,\n\
        select: this.select,\n\
        focus: this.focus,\n\
        clearTypeahead: this.clearTypeahead,\n\
        typeahead: this.$data.typeahead,\n\
        type: this.type,\n\
        listboxButtonRef: this.$data.listboxButtonRef,\n\
        listboxListRef: this.$data.listboxListRef,\n\
        isOpen: this.$data.isOpen,\n\
        activeItem: this.$data.activeItem,\n\
        values: this.$data.values,\n\
        labelId: this.$data.labelId,\n\
        buttonId: this.$data.buttonId,\n\
        props: this.$props,\n\
      },\n\
    }\n\
  },\n\
  methods: {\n\
    getActiveDescendant() {\n\
      const [_value, id] = this.optionIds.value.find(([value]) => {\n\
        return value === this.activeItem.value\n\
      }) || [null, null]\n\
\n\
      return id\n\
    },\n\
    registerOptionId(value, optionId) {\n\
      this.unregisterOptionId(value)\n\
      this.optionIds.value = [...this.optionIds.value, [value, optionId]]\n\
    },\n\
    unregisterOptionId(value) {\n\
      this.optionIds.value = this.optionIds.value.filter(([candidateValue]) => {\n\
        return candidateValue !== value\n\
      })\n\
    },\n\
    type(value) {\n\
      this.typeahead.value = this.typeahead.value + value\n\
\n\
      const [match] = this.optionRefs.value.find(([_value, ref]) => {\n\
        return ref.innerText.toLowerCase().startsWith(this.typeahead.value.toLowerCase())\n\
      }) || [null]\n\
\n\
      if (match !== null) {\n\
        this.focus(match)\n\
      }\n\
\n\
      this.clearTypeahead()\n\
    },\n\
    clearTypeahead: debounce(function () {\n\
      this.typeahead.value = ''\n\
    }, 500),\n\
    registerOptionRef(value, optionRef) {\n\
      this.unregisterOptionRef(value)\n\
      this.optionRefs.value = [...this.optionRefs.value, [value, optionRef]]\n\
    },\n\
    unregisterOptionRef(value) {\n\
      this.optionRefs.value = this.optionRefs.value.filter(([candidateValue]) => {\n\
        return candidateValue !== value\n\
      })\n\
    },\n\
    toggle() {\n\
      this.$data.isOpen.value ? this.close() : this.open()\n\
    },\n\
    open() {\n\
      this.$data.isOpen.value = true\n\
      this.focus(this.$props.value)\n\
      this.$nextTick(() => {\n\
        this.$data.listboxListRef.value().focus()\n\
      })\n\
    },\n\
    close() {\n\
      this.$data.isOpen.value = false\n\
      this.$data.listboxButtonRef.value().focus()\n\
    },\n\
    select(value) {\n\
      this.$emit('input', value)\n\
      this.$nextTick(() => {\n\
        this.close()\n\
      })\n\
    },\n\
    focus(value) {\n\
      this.activeItem.value = value\n\
\n\
      if (value === null) {\n\
        return\n\
      }\n\
\n\
      this.$nextTick(() => {\n\
        this.listboxListRef\n\
          .value()\n\
          .children[this.values.value.indexOf(this.activeItem.value)].scrollIntoView({\n\
            block: 'nearest',\n\
          })\n\
      })\n\
    },\n\
  },\n\
  render(h) {\n\
    return h('div', {}, defaultSlot(this, { isOpen: this.$data.isOpen.value }))\n\
  },\n\
}"
