<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2025-2026 lin-snow -->
<template>
  <ExtensionCardShell :header-label="linkType.name">
    <template #header-icon>
      <component :is="iconComponent" />
    </template>
    <a
      :href="props.website.site"
      target="_blank"
      rel="noopener noreferrer"
      class="website-card__link website-card__body"
      @click.prevent="handleClick"
    >
      <div class="website-icon-wrap">
        <Link class="w-4 h-4" />
      </div>
      <div class="website-meta">
        <span class="website-title">{{ props.website.title }}</span>
        <span v-if="props.website.password" class="website-domain">
          提取码：{{ props.website.password }}
        </span>
        <span v-else class="website-domain">{{ displayDomain }}</span>
      </div>
    </a>
  </ExtensionCardShell>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import Link from '@/components/icons/link.vue'
import ExtensionCardShell from '../shared/ExtensionCardShell.vue'
import { detectLinkType } from '@/utils/linkType'
import { theToast } from '@/utils/toast'

const props = defineProps<{
  website: { title: string; site: string; password?: string }
}>()

const linkType = computed(() => detectLinkType(props.website.site))

const iconModules = import.meta.glob('@/components/icons/*.vue')

function resolveIcon(name: string) {
  if (!name) return Link
  const path = `/src/components/icons/${name}.vue`
  const loader = iconModules[path]
  if (!loader) return Link
  return defineAsyncComponent(loader as () => Promise<any>)
}

const iconComponent = computed(() => resolveIcon(linkType.value.icon))

const displayDomain = computed(() => {
  const site = props.website.site.trim()
  if (!site) return ''
  try {
    const parsed = new URL(site)
    return parsed.hostname.replace(/^www\./, '')
  } catch {
    return site.replace(/^https?:\/\//, '').replace(/\/$/, '')
  }
})

function handleClick() {
  const url = props.website.site
  const password = props.website.password
  if (!password) {
    window.open(url, '_blank', 'noopener,noreferrer')
    return
  }

  try {
    const textarea = document.createElement('textarea')
    textarea.value = password
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    theToast.success('提取码已复制')
  } catch {
    theToast.error('复制失败')
  }

  setTimeout(() => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }, 400)
}
</script>

<style scoped>
.website-card__link {
  display: block;
  border-radius: inherit;
}

.website-card__link:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 1px var(--color-focus-ring),
    0 0 0 4px var(--card-focus-ring-outer);
}

.website-card__body {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
}

.website-icon-wrap {
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--color-text-secondary);
  background: var(--color-bg-muted);
  border: 1px solid var(--color-border-subtle);
}

.website-meta {
  min-width: 0;
  flex: 1;
}

.website-title {
  display: block;
  color: var(--color-text-primary);
  font-size: 0.96rem;
  font-weight: 700;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.website-domain {
  margin-top: 0.15rem;
  display: block;
  color: var(--color-text-muted);
  font-size: 0.78rem;
  font-family: var(--font-family-mono);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
