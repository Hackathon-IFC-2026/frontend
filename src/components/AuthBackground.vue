<template>
  <div class="auth-background" :class="side === 'right' ? 'is-right' : 'is-left'">
    <div class="bg" aria-hidden="true">
      <div class="bg__a"></div>
      <div class="bg__b"></div>
    </div>
    <div class="shapes" aria-hidden="true">
      <svg
        v-for="s in shapes"
        :key="s.id"
        class="triangle"
        viewBox="0 0 281 281"
        :style="{
          '--x': s.x + '%',
          '--y': s.y + '%',
          '--size': s.size,
          '--rot': s.rot + 'deg',
          '--delay': s.delay + 's',
          '--stagger': stagger(s),
          '--opacity': getOpacity(s.x)
        }"
      >
        <path
          d="M 130 31.6 Q 140 12 150 31.6 L 258 242.4 Q 268 262 246 262 L 34 262 Q 12 262 22 242.4 Z"
          fill="#D9D9D9"
          fill-opacity="0.15"
          stroke="#E4F1E4"
          stroke-opacity="0.32"
          stroke-width="3"
          stroke-linejoin="round"
          stroke-linecap="round"
        />
      </svg>
    </div>
    <div class="content">
      <slot />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  side: { type: String, default: 'left' }
})

const shapes = [
  { id: 1, x: -3, y: -4, size: 14, rot: -14, delay: 0 },
  { id: 2, x: 23, y: -9, size: 15, rot: 8, delay: -1 },
  { id: 3, x: 28, y: 17, size: 10.5, rot: -8, delay: -2 },
  { id: 4, x: 7, y: 17, size: 13.5, rot: 12, delay: -3 },
  { id: 5, x: -4.5, y: 36, size: 10.5, rot: -9, delay: -4 },
  { id: 6, x: 2, y: 59, size: 14, rot: 13, delay: -5 },
  { id: 7, x: 18.5, y: 80, size: 11.5, rot: -10, delay: -6 },
  { id: 8, x: 24, y: 51, size: 16, rot: 6, delay: -2.5 },
  { id: 9, x: 34, y: 84, size: 14, rot: -4, delay: -1.5 },
  { id: 10, x: -2, y: 86, size: 10, rot: 10, delay: -3.5 }
]

function stagger(s) {
  const t = props.side === 'right' ? (100 - s.x) / 100 : s.x / 100
  return (Math.max(0, Math.min(1, t)) * 0.45).toFixed(2) + 's'
}

function getOpacity(x) {
  const distanceToCenter = Math.abs(x - 20) / 20
  return (0.15 + distanceToCenter * 0.55).toFixed(2)
}
</script>

<style scoped>
.auth-background {
  --k: 2.8;
  --ease: cubic-bezier(0.65, 0, 0.35, 1);
  container-type: size;
  position: relative;
  isolation: isolate;
  width: 100%;
  height: 100vh;
  height: 100svh;
  overflow: hidden;
  background: #12301f;
  color: #fff9e3;
}

.bg {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 200%;
  display: flex;
  z-index: -2;
  transition: transform 1.2s var(--ease);
}
.bg > div {
  flex: 0 0 50%;
}
.is-right .bg {
  transform: translateX(-50%);
}

.bg__a {
  background:
    radial-gradient(ellipse 55% 80% at 12% 14%, #4f9d69 0%, rgba(79, 157, 105, 0) 100%),
    linear-gradient(100deg, #3a7d4f 0%, #1d472d 48%, #102d1e 100%);
}
.bg__b {
  background:
    radial-gradient(ellipse 55% 80% at 88% 14%, #4f9d69 0%, rgba(79, 157, 105, 0) 100%),
    linear-gradient(260deg, #3a7d4f 0%, #1d472d 48%, #102d1e 100%);
}

.shapes {
  --unit: min(1cqw, 1.406cqh);
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
}

.triangle {
  --w: calc(var(--size) * var(--unit) * var(--k));
  position: absolute;
  width: var(--w);
  height: auto;
  overflow: visible;
  left: var(--x);
  top: var(--y);
  rotate: var(--rot);
  opacity: var(--opacity);
  animation: drift 5s ease-in-out var(--delay) infinite alternate;
  transition:
    left 1.2s var(--ease) var(--stagger),
    rotate 1.2s var(--ease) var(--stagger);
  will-change: translate;
}

.is-right .triangle {
  left: calc(100% - var(--x) - var(--w));
  rotate: calc(var(--rot) * -1);
}

@keyframes drift {
  from {
    translate: 0 -12px;
  }
  to {
    translate: 10px 14px;
  }
}

.content {
  position: absolute;
  inset: 0;
}

@media (min-width: 768px) {
  .auth-background {
    --k: 1.8;
  }
}
@media (min-width: 1024px) {
  .auth-background {
    --k: 1.35;
  }
}
@media (prefers-reduced-motion: reduce) {
  .triangle {
    animation: none;
    transition: none;
  }
  .bg {
    transition: none;
    }
}
</style>
