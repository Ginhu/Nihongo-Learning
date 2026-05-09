<template>
  <div
    class="grid gap-3 w-full"
    :class="options.length === 2 ? 'grid-cols-1' : 'grid-cols-2'"
  >
    <button
      v-for="option in options"
      :key="option"
      class="py-4 px-3 rounded-xl border text-base font-semibold transition-all duration-150"
      :class="buttonClass(option)"
      @click="handleClick(option)"
    >
      {{ option }}
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  options:        { type: Array,  required: true },
  selectedAnswer: { default: null },
  correctAnswer:  { type: String, required: true },
  answered:       { type: Boolean, default: false }
})

const emit = defineEmits(['select', 'correct-tap'])

function handleClick(option) {
  if (!props.answered) {
    emit('select', option)
    return
  }
  if (option === props.correctAnswer) {
    emit('correct-tap')
  }
}

function buttonClass(option) {
  const base = 'border'

  if (!props.answered) {
    return `${base} hover:bg-primary/10 hover:border-primary/40 hover:scale-105`
  }

  const wasWrong = props.selectedAnswer !== props.correctAnswer

  if (option === props.selectedAnswer && !wasWrong) {
    return `${base} bg-green-500/20 border-green-500 text-green-600 anim-correct`
  }
  if (option === props.selectedAnswer && wasWrong) {
    return `${base} bg-red-500/20 border-red-500 text-red-600 anim-wrong`
  }
  if (wasWrong && option === props.correctAnswer) {
    return `${base} bg-green-500/20 border-green-500 text-green-600 cursor-pointer hover:bg-green-500/30`
  }
  return `${base} opacity-40`
}
</script>
