<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2025-2026 lin-snow -->
<template>
  <div class="editor-actions">
    <div class="editor-actions__left">
      <BaseButton
        :icon="currentMode === Mode.ECH0 ? Advance : Back"
        @click="handleChangeMode"
        :class="['w-8 h-8 sm:w-9 sm:h-9 rounded-xs'].join(' ')"
        :tooltip="currentMode === Mode.ECH0 ? t('editor.more') : t('editor.backToEditor')"
      />
      <BaseButton
        v-if="currentMode === Mode.ECH0"
        :icon="AttachmentIcon"
        @click="handleAddMediaMode"
        class="w-8 h-8 sm:w-9 sm:h-9 rounded-xs"
        :tooltip="t('editor.addImage')"
      />
      <div v-if="currentMode === Mode.ECH0" class="editor-actions__tag">
        <Popover>
          <PopoverButton
            :aria-label="tagTriggerTooltip"
            class="cursor-pointer p-1.5 w-8 h-8 sm:w-9 sm:h-9 rounded-xs ring-inset ring-1 ring-[var(--btn-ring-color)] text-[var(--btn-text-color)] outline-none shadow-[var(--btn-shadow)] bg-[var(--btn-bg-color)] hover:bg-[var(--btn-hover-bg-color)] hover:ring-[var(--btn-hover-border-color)] focus-visible:ring-2 focus-visible:ring-[var(--btn-focus-ring-color)] transition-colors duration-200 relative inline-flex items-center justify-center"
          >
            <TagSetting class="w-full h-full" />
          </PopoverButton>

          <transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <PopoverPanel class="editor-actions__tag-panel">
              <div v-if="tagOptions.length === 0" class="editor-actions__tag-empty">
                <p class="editor-actions__tag-empty-text">{{ t('editor.tagPickerEmpty') }}</p>
                <button
                  type="button"
                  class="editor-actions__tag-empty-link"
                  @click="goToTagManager"
                >
                  {{ t('editor.tagPickerGoToManage') }} →
                </button>
              </div>
              <div v-else class="editor-actions__tag-chip-list">
                <button
                  v-for="name in tagOptions"
                  :key="name"
                  type="button"
                  class="editor-actions__tag-chip"
                  :class="{
                    'editor-actions__tag-chip--selected': tagToAdd.includes(name),
                    'editor-actions__tag-chip--disabled': isTagChipDisabled(name),
                  }"
                  @click="toggleTag(name)"
                >
                  #{{ name }}
                </button>
              </div>
            </PopoverPanel>
          </transition>
        </Popover>
      </div>



      <div v-if="currentMode === Mode.ECH0" class="editor-actions__tag">
        <Popover v-slot="{ close }">
          <PopoverButton
            :aria-label="t('editor.smile')"
            class="cursor-pointer p-1.5 w-8 h-8 sm:w-9 sm:h-9 rounded-xs ring-inset ring-1 ring-[var(--btn-ring-color)] text-[var(--btn-text-color)] outline-none shadow-[var(--btn-shadow)] bg-[var(--btn-bg-color)] hover:bg-[var(--btn-hover-bg-color)] hover:ring-[var(--btn-hover-border-color)] focus-visible:ring-2 focus-visible:ring-[var(--btn-focus-ring-color)] transition-colors duration-200 relative inline-flex items-center justify-center"
          >
            <smile class="w-full h-full" />
          </PopoverButton>

          <transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <PopoverPanel class="editor-actions__smile-panel">
              <div class="editor-actions__smile-grid">
                <button
                  v-for="item in smileList"
                  :key="item.key"
                  type="button"
                  class="editor-actions__smile-item"
                  @click="insertSmile(item, close)"
                >
                  <img :src="item.imageUrl" :alt="item.key" class="w-8 h-8 object-contain" />
                </button>
              </div>
            </PopoverPanel>
          </transition>
        </Popover>
      </div>
    </div>

    <div class="editor-actions__right">
      <div v-if="hasContent || hasFile || hasExtension" class="relative group">
        <Info class="w-6 h-6 text-[var(--color-text-muted)] hover:text-[var(--color-text-muted)]" />
        <div class="editor-actions__info-pop">
          <div v-if="infoTooltipLines.length > 0">
            <div class="mb-1 font-medium text-[var(--color-text-secondary)]">
              {{ t('editor.addedLabel') }}
            </div>
            <div
              v-for="line in infoTooltipLines"
              :key="line.label"
              class="flex items-center gap-1 text-[var(--color-text-muted)]"
            >
              <component v-if="line.icon" :is="line.icon" class="w-3.5 h-3.5" />
              <span>{{ line.label }}</span>
            </div>
          </div>
          <div v-else class="text-[var(--color-text-muted)]">{{ t('editor.noContentAdded') }}</div>
        </div>
      </div>

      <div v-if="currentMode !== Mode.Panel && isUpdateMode === true">
        <BaseButton
          :icon="ExitUpdate"
          @click="handleExitUpdateMode"
          class="w-8 h-8 sm:w-9 sm:h-9 rounded-xs editor-actions__cta"
          :tooltip="t('editor.exitUpdateMode')"
        />
      </div>
      <Popover
        v-if="currentMode !== Mode.Panel && currentMode !== Mode.TagManage"
        class="editor-actions__publish"
      >
        <PopoverButton
          :aria-label="publishTriggerTooltip"
          :disabled="isSubmitting"
          :class="[
            'cursor-pointer p-1.5 w-8 h-8 sm:w-9 sm:h-9 rounded-xs ring-inset ring-1 ring-[var(--btn-ring-color)] text-[var(--btn-text-color)] outline-none shadow-[var(--btn-shadow)] bg-[var(--btn-bg-color)] transition-colors duration-200 relative inline-flex items-center justify-center editor-actions__cta',
            isSubmitting
              ? 'cursor-not-allowed opacity-70'
              : 'hover:bg-[var(--btn-hover-bg-color)] hover:ring-[var(--btn-hover-border-color)] focus-visible:ring-2 focus-visible:ring-[var(--btn-focus-ring-color)]',
          ]"
        >
          <component :is="isUpdateMode ? Update : Publish" class="w-full h-full" />
        </PopoverButton>

        <transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 -translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-1"
        >
          <PopoverPanel v-slot="{ close }" class="editor-actions__publish-panel">
            <button
              type="button"
              class="editor-actions__publish-option"
              @click="handlePublishWithPrivacy(false, close)"
            >
              <Public class="editor-actions__publish-option-icon" />
              <span>{{ t('editor.publishEchoPublic') }}</span>
            </button>
            <button
              type="button"
              class="editor-actions__publish-option"
              @click="handlePublishWithPrivacy(true, close)"
            >
              <Private class="editor-actions__publish-option-icon" />
              <span>{{ t('editor.publishEchoPrivate') }}</span>
            </button>
          </PopoverPanel>
        </transition>
      </Popover>
    </div>
  </div>
</template>

<script setup lang="ts">
import Advance from '@/components/icons/advance.vue'
import AttachmentIcon from '@/components/icons/attachment.vue'
import ImageIcon from '@/components/icons/image.vue'
import Public from '@/components/icons/public.vue'
import Private from '@/components/icons/private.vue'
import Publish from '@/components/icons/publish.vue'
import Update from '@/components/icons/update.vue'
import ExitUpdate from '@/components/icons/exitupdate.vue'
import Back from '@/components/icons/back.vue'
import Info from '@/components/icons/info.vue'
import Write from '@/components/icons/write.vue'
import Music from '@/components/icons/music.vue'
import Video from '@/components/icons/video.vue'
import GithubProj from '@/components/icons/githubproj.vue'
import Website from '@/components/icons/website.vue'
import MapPin from '@/components/icons/mappin.vue'
import XBrand from '@/components/icons/tweet.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import TagSetting from '@/components/icons/tagsetting.vue'
import smile from '@/components/icons/smile.vue'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { Mode, ExtensionType } from '@/enums/enums'
import { FILE_STORAGE_TYPE } from '@/constants/file'
import { storeToRefs } from 'pinia'
import { useEditorStore, useEchoStore } from '@/stores'
import { theToast } from '@/utils/toast'
import { localStg } from '@/utils/storage'
import { computed, onMounted, ref, type Component } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'




const editorStore = useEditorStore()
const {
  currentMode,
  isUpdateMode,
  echoToAdd,
  fileToAdd,
  tagToAdd,
  hasContent,
  hasFile,
  hasExtension,
  extensionToAdd,
  isSubmitting,
} = storeToRefs(editorStore)
const echoStore = useEchoStore()
const { tagOptions } = storeToRefs(echoStore)
const { t } = useI18n()
const router = useRouter()

onMounted(() => {
  echoStore.ensureTagsLoaded()
})

type TooltipLine = { label: string; icon?: Component }

const infoTooltipLines = computed<TooltipLine[]>(() => {
  const extType = extensionToAdd.value.extension_type || echoToAdd.value.extension?.type
  const extMap: Record<ExtensionType, { label: string; icon: Component }> = {
    [ExtensionType.MUSIC]: { label: String(t('editor.extMusic')), icon: Music },
    [ExtensionType.VIDEO]: { label: String(t('editor.extVideo')), icon: Video },
    [ExtensionType.GITHUBPROJ]: { label: String(t('editor.extGithubProject')), icon: GithubProj },
    [ExtensionType.WEBSITE]: { label: String(t('editor.extWebsiteLink')), icon: Website },
    [ExtensionType.LOCATION]: { label: String(t('editor.extLocation')), icon: MapPin },
    [ExtensionType.TWEET]: { label: String(t('editor.extTweet')), icon: XBrand },
  }

  const parts: TooltipLine[] = []
  if (hasContent.value) parts.push({ label: String(t('editor.extText')), icon: Write })
  if (hasFile.value) parts.push({ label: String(t('editor.extImage')), icon: ImageIcon })
  if (hasExtension.value)
    parts.push({
      label:
        extType && extMap[extType as ExtensionType]?.label
          ? extMap[extType as ExtensionType].label
          : String(t('editor.extGeneric')),
      icon:
        extType && extMap[extType as ExtensionType]?.icon
          ? extMap[extType as ExtensionType].icon
          : undefined,
    })

  return parts
})

const handlePublishWithPrivacy = (isPrivate: boolean, close: () => void) => {
  if (isSubmitting.value) return
  echoToAdd.value.private = isPrivate
  close()
  editorStore.handleAddOrUpdate()
}

const publishTriggerTooltip = computed(() =>
  isUpdateMode.value ? t('editor.updateEcho') : t('editor.publishEcho'),
)

const handleChangeMode = () => {
  editorStore.toggleMode()
}

const handleAddMediaMode = () => {
  const rememberedSource = localStg.getItem<App.Api.File.StorageType>('file_storage_type')
  if (rememberedSource) {
    fileToAdd.value.storage_type = rememberedSource
  } else {
    fileToAdd.value.storage_type = FILE_STORAGE_TYPE.LOCAL
  }

  editorStore.setMode(Mode.Media)
}
const handleExitUpdateMode = () => {
  editorStore.handleExitUpdateMode()
}

const MAX_TAGS = 3

const tagTriggerTooltip = computed(() =>
  tagToAdd.value.length > 0
    ? `${t('editor.tagPickerTooltip')} · ${tagToAdd.value.length}/${MAX_TAGS}`
    : t('editor.tagPickerTooltip'),
)

const isTagChipDisabled = (name: string) =>
  tagToAdd.value.length >= MAX_TAGS && !tagToAdd.value.includes(name)

const toggleTag = (name: string) => {
  const next = [...tagToAdd.value]
  const idx = next.indexOf(name)
  if (idx >= 0) {
    next.splice(idx, 1)
  } else {
    if (next.length >= MAX_TAGS) {
      theToast.warning(String(t('editor.tagPickerLimit', { max: MAX_TAGS })))
      return
    }
    next.push(name)
  }
  tagToAdd.value = next
}

const goToTagManager = () => {
  router.push({ name: 'panel-setting', query: { tab: 'tags' } })
}



// 😊 表情列表
const smileList = ref([
  { key: '微笑', imageUrl: '/smiles/weixiao.webp' },
  { key: '色', imageUrl: '/smiles/se.webp' },
  { key: '发呆', imageUrl: '/smiles/fadai.webp' },
  { key: '酷拽', imageUrl: '/smiles/kuzhuai.webp' },
  { key: '抠鼻', imageUrl: '/smiles/koubi.webp' },
  { key: '流泪', imageUrl: '/smiles/liulei.webp' },
  { key: '捂脸', imageUrl: '/smiles/wulian.webp' },
  { key: '发怒', imageUrl: '/smiles/fanu.webp' },
  { key: '呲牙', imageUrl: '/smiles/ciya.webp' },
  { key: '尬笑', imageUrl: '/smiles/gaxiao.webp' },
  { key: '害羞', imageUrl: '/smiles/haixiu.webp' },
  { key: '调皮', imageUrl: '/smiles/tiaopi.webp' },
  { key: '舔屏', imageUrl: '/smiles/tianping.webp' },
  { key: '看', imageUrl: '/smiles/kan.webp' },
  { key: '爱心', imageUrl: '/smiles/aixin.webp' },
  { key: '比心', imageUrl: '/smiles/bixin.webp' },
  { key: '赞', imageUrl: '/smiles/zan.webp' },
  { key: '鼓掌', imageUrl: '/smiles/guzhang.webp' },
  { key: '感谢', imageUrl: '/smiles/ganxie.webp' },
  { key: '抱抱你', imageUrl: '/smiles/baobaoni.webp' },
  { key: '玫瑰', imageUrl: '/smiles/meigui.webp' },
  { key: '尴尬流汗', imageUrl: '/smiles/gangaliuhan.webp' },
  { key: '戳手手', imageUrl: '/smiles/chuoshoushou.webp' },
  { key: '星星眼', imageUrl: '/smiles/xingxingyan.webp' },
  { key: '杀马特', imageUrl: '/smiles/shamate.webp' },
  { key: '黄脸干杯', imageUrl: '/smiles/huanglianganbei.webp' },
  { key: '抱紧自己', imageUrl: '/smiles/baojinziji.webp' },
  { key: '拜拜', imageUrl: '/smiles/baibai.webp' },
  { key: '热', imageUrl: '/smiles/re.webp' },
  { key: '黄脸祈祷', imageUrl: '/smiles/huanglianqidao.webp' },
  { key: '懵', imageUrl: '/smiles/meng.webp' },
  { key: '举手', imageUrl: '/smiles/jushou.webp' },
  { key: '加功德', imageUrl: '/smiles/jiagongde.png' },
  { key: '摊手', imageUrl: '/smiles/tanshou.webp' },
  { key: '无语流汗', imageUrl: '/smiles/wuyuliuhan.webp' },
  { key: '续火花吧', imageUrl: '/smiles/xuhuahuaba.webp' },
  { key: '点火', imageUrl: '/smiles/dianhuo.webp' },
  { key: '哭哭', imageUrl: '/smiles/kuku.webp' },
  { key: '吐舌小狗', imageUrl: '/smiles/tushexiaogou.webp' },
  { key: '送花', imageUrl: '/smiles/songhua.webp' },
  { key: '爱心手', imageUrl: '/smiles/aixinshou.webp' },
  { key: '贴贴', imageUrl: '/smiles/tietie.webp' },
  { key: '灵机一动', imageUrl: '/smiles/lingjiyidong.webp' },
  { key: '耶', imageUrl: '/smiles/ye.webp' },
  { key: '打脸', imageUrl: '/smiles/dalian.webp' },
  { key: '大笑', imageUrl: '/smiles/daxiao.webp' },
  { key: '机智', imageUrl: '/smiles/jizhi.webp' },
  { key: '送心', imageUrl: '/smiles/songxin.webp' },
  { key: '666', imageUrl: '/smiles/666.webp' },
  { key: '闭嘴', imageUrl: '/smiles/bizui.webp' },
  { key: '来看我', imageUrl: '/smiles/laikanwo.webp' },
  { key: '一起加油', imageUrl: '/smiles/yiqijiayou.webp' },
  { key: '哈欠', imageUrl: '/smiles/haqian.webp' },
  { key: '震惊', imageUrl: '/smiles/zhenjing.webp' },
  { key: '晕', imageUrl: '/smiles/yun.webp' },
  { key: '衰', imageUrl: '/smiles/shuai.webp' },
  { key: '困', imageUrl: '/smiles/kun.webp' },
  { key: '疑问', imageUrl: '/smiles/yiwen.webp' },
  { key: '泣不成声', imageUrl: '/smiles/qibuchengsheng.webp' },
  { key: '小鼓掌', imageUrl: '/smiles/xiaoguzhang.webp' },
  { key: '大金牙', imageUrl: '/smiles/dajinya.webp' },
  { key: '偷笑', imageUrl: '/smiles/touxiao.webp' },
  { key: '石化', imageUrl: '/smiles/shihua.webp' },
  { key: '思考', imageUrl: '/smiles/sikao.webp' },
  { key: '吐血', imageUrl: '/smiles/tuxue.webp' },
  { key: '可怜', imageUrl: '/smiles/kelian.webp' },
  { key: '嘘', imageUrl: '/smiles/xu.webp' },
  { key: '撇嘴', imageUrl: '/smiles/piezui.webp' },
  { key: '笑哭', imageUrl: '/smiles/xiaoku.webp' },
  { key: '奸笑', imageUrl: '/smiles/jianxiao.webp' },
  { key: '得意', imageUrl: '/smiles/deyi.webp' },
  { key: '憨笑', imageUrl: '/smiles/hanxiao.webp' },
  { key: '坏笑', imageUrl: '/smiles/huaixiao.webp' },
  { key: '抓狂', imageUrl: '/smiles/zhuakuang.webp' },
  { key: '泪奔', imageUrl: '/smiles/leiben.webp' },
  { key: '钱', imageUrl: '/smiles/qian.webp' },
  { key: '恐惧', imageUrl: '/smiles/kongju.webp' },
  { key: '愉快', imageUrl: '/smiles/yukuai.webp' },
  { key: '快哭了', imageUrl: '/smiles/kuaikule.webp' },
  { key: '翻白眼', imageUrl: '/smiles/fanbaiyan.webp' },
  { key: '互粉', imageUrl: '/smiles/hufen.webp' },
  { key: '我想静静', imageUrl: '/smiles/woxiangjingjing.webp' },
  { key: '委屈', imageUrl: '/smiles/weiqu.webp' },
  { key: '鄙视', imageUrl: '/smiles/bishi.webp' },
  { key: '飞吻', imageUrl: '/smiles/feiwen.webp' },
  { key: '再见', imageUrl: '/smiles/zaijian.webp' },
  { key: '紫薇别走', imageUrl: '/smiles/ziweibiezou.webp' },
  { key: '听歌', imageUrl: '/smiles/tingge.webp' },
  { key: '求抱抱', imageUrl: '/smiles/qiubaobao.webp' },
  { key: '绝望的凝视', imageUrl: '/smiles/juewangdeningshi.webp' },
  { key: '不失礼貌的微笑', imageUrl: '/smiles/bushilimaodeweixiao.webp' },
  { key: '不看', imageUrl: '/smiles/bukan.webp' },
  { key: '裂开', imageUrl: '/smiles/liekai.webp' },
  { key: '干饭人', imageUrl: '/smiles/ganfanren.webp' },
  { key: '庆祝', imageUrl: '/smiles/qingzhu.webp' },
  { key: '吐舌', imageUrl: '/smiles/tushe.webp' },
  { key: '呆无辜', imageUrl: '/smiles/daiwugu.webp' },
  { key: '白眼', imageUrl: '/smiles/baiyan.webp' },
  { key: '猪头', imageUrl: '/smiles/zhutou.webp' },
  { key: '冷漠', imageUrl: '/smiles/lengmo.webp' },
  { key: '暗中观察', imageUrl: '/smiles/anzhongguancha.webp' },
  { key: '二哈', imageUrl: '/smiles/erha.webp' },
  { key: '菜狗', imageUrl: '/smiles/caigou.webp' },
  { key: '黑脸', imageUrl: '/smiles/heilian.webp' },
  { key: '展开说说', imageUrl: '/smiles/zhankaishuoshuo.webp' },
  { key: '蜜蜂狗', imageUrl: '/smiles/mifenggou.webp' },
  { key: '柴犬', imageUrl: '/smiles/chaiquan.webp' },
  { key: '摸头', imageUrl: '/smiles/motou.webp' },
  { key: '皱眉', imageUrl: '/smiles/zhoumei.webp' },
  { key: '擦汗', imageUrl: '/smiles/cahan.webp' },
  { key: '红脸', imageUrl: '/smiles/honglian.webp' },
  { key: '做鬼脸', imageUrl: '/smiles/zuoguilian.webp' },
  { key: '强', imageUrl: '/smiles/qiang.webp' },
  { key: '如花', imageUrl: '/smiles/ruhua.webp' },
  { key: '吐', imageUrl: '/smiles/tu.webp' },
  { key: '惊喜', imageUrl: '/smiles/jingxi.webp' },
  { key: '敲打', imageUrl: '/smiles/qiaoda.webp' },
  { key: '奋斗', imageUrl: '/smiles/fendou.webp' },
  { key: '吐彩虹', imageUrl: '/smiles/tuhongcai.webp' },
  { key: '大哭', imageUrl: '/smiles/daku.webp' },
  { key: '嘿哈', imageUrl: '/smiles/heiha.webp' },
  { key: '惊恐', imageUrl: '/smiles/jingkong.webp' },
  { key: '囧', imageUrl: '/smiles/jiong.webp' },
  { key: '难过', imageUrl: '/smiles/nanguo.webp' },
  { key: '斜眼', imageUrl: '/smiles/xieyan.webp' },
  { key: '阴险', imageUrl: '/smiles/yinxian.webp' },
  { key: '悠闲', imageUrl: '/smiles/youxian.webp' },
  { key: '咒骂', imageUrl: '/smiles/zhouma.webp' },
  { key: '吃瓜群众', imageUrl: '/smiles/chiguaqunzhong.webp' },
  { key: '歪眼', imageUrl: '/smiles/waiyan.webp' },
  { key: '敢怒不敢言', imageUrl: '/smiles/gannubuganyan.webp' },
  { key: '求求了', imageUrl: '/smiles/qiuqiule.webp' },
  { key: '眼含热泪', imageUrl: '/smiles/yanhanrelei.webp' },
  { key: '叹气', imageUrl: '/smiles/tanqi.webp' },
  { key: '好开心', imageUrl: '/smiles/haokaixin.webp' },
  { key: '不是吧', imageUrl: '/smiles/bushiba.webp' },
  { key: '鞠躬', imageUrl: '/smiles/jugong.webp' },
  { key: '躺平', imageUrl: '/smiles/tangping.webp' },
  { key: '九转大肠', imageUrl: '/smiles/jiuzuandachang.webp' },
  { key: '不你不想', imageUrl: '/smiles/bunibuxiang.webp' },
  { key: '一头乱麻', imageUrl: '/smiles/yitouluanma.webp' },
  { key: 'kisskiss', imageUrl: '/smiles/kisskiss.webp' },
  { key: '你不大行', imageUrl: '/smiles/nibudaxing.webp' },
  { key: '噢买尬', imageUrl: '/smiles/omaiga.webp' },
  { key: '宕机', imageUrl: '/smiles/dangji.webp' },
  { key: '苦涩', imageUrl: '/smiles/kuse.webp' },
  { key: '逞强落泪', imageUrl: '/smiles/chengqiangluolei.webp' },
  { key: '求机位', imageUrl: '/smiles/qiujiwei.webp' },
  { key: '求机位3', imageUrl: '/smiles/qiujiwei3.webp' },
  { key: '点赞', imageUrl: '/smiles/dianzan.webp' },
  { key: '精选', imageUrl: '/smiles/jingxuan.webp' },
  { key: '强壮', imageUrl: '/smiles/qiangzhuang.webp' },
  { key: '碰拳', imageUrl: '/smiles/pengquan.webp' },
  { key: 'OK', imageUrl: '/smiles/OK.webp' },
  { key: '击掌', imageUrl: '/smiles/jizhang.webp' },
  { key: '左上', imageUrl: '/smiles/zuoshang.webp' },
  { key: '握手', imageUrl: '/smiles/woshou.webp' },
  { key: '抱拳', imageUrl: '/smiles/baoquan.webp' },
  { key: '勾引', imageUrl: '/smiles/gouyin.webp' },
  { key: '拳头', imageUrl: '/smiles/quantou.webp' },
  { key: '弱', imageUrl: '/smiles/ruo.webp' },
  { key: '胜利', imageUrl: '/smiles/shengli.webp' },
  { key: '右边', imageUrl: '/smiles/youbian.webp' },
  { key: '左边', imageUrl: '/smiles/zuobian.webp' },
  { key: '嘴唇', imageUrl: '/smiles/zuichun.webp' },
  { key: '心碎', imageUrl: '/smiles/xinsui.webp' },
  { key: '凋谢', imageUrl: '/smiles/diaoxie.webp' },
  { key: '愤怒', imageUrl: '/smiles/fennu.webp' },
  { key: '垃圾', imageUrl: '/smiles/laji.webp' },
  { key: '啤酒', imageUrl: '/smiles/pijiu.webp' },
  { key: '咖啡', imageUrl: '/smiles/kafei.webp' },
  { key: '蛋糕', imageUrl: '/smiles/dangao.webp' },
  { key: '礼物', imageUrl: '/smiles/liwu.webp' },
  { key: '撒花', imageUrl: '/smiles/sahua.webp' },
  { key: '加一', imageUrl: '/smiles/jiayi.webp' },
  { key: '减一', imageUrl: '/smiles/jianyi.webp' },
  { key: 'okk', imageUrl: '/smiles/okk.webp' },
  { key: 'V5', imageUrl: '/smiles/V5.webp' },
  { key: '绝', imageUrl: '/smiles/jue.webp' },
  { key: '给力', imageUrl: '/smiles/geili.webp' },
  { key: '红包', imageUrl: '/smiles/hongbao.webp' },
  { key: '便便', imageUrl: '/smiles/bianbian.webp' },
  { key: '发', imageUrl: '/smiles/fa.webp' },
  { key: '18禁', imageUrl: '/smiles/18jin.webp' },
  { key: '炸弹', imageUrl: '/smiles/zhadan.webp' },
  { key: '西瓜', imageUrl: '/smiles/xigua.webp' },
  { key: '加鸡腿', imageUrl: '/smiles/jiajitui.webp' },
  { key: '握爪', imageUrl: '/smiles/wozhao.webp' },
  { key: '太阳', imageUrl: '/smiles/taiyang.webp' },
  { key: '月亮', imageUrl: '/smiles/yueliang.webp' },
  { key: '给跪了', imageUrl: '/smiles/geiguile.webp' },
  { key: '蕉绿', imageUrl: '/smiles/jiaolv.webp' },
  { key: '扎心', imageUrl: '/smiles/zaxin.webp' },
  { key: '胡瓜', imageUrl: '/smiles/hugua.webp' },
  { key: '打call', imageUrl: '/smiles/dacall.webp' },
  { key: '栓Q', imageUrl: '/smiles/shuanQ.webp' },
  { key: '雪花', imageUrl: '/smiles/xuehua.webp' },
  { key: '圣诞树', imageUrl: '/smiles/shengdanshu.webp' },
  { key: '平安果', imageUrl: '/smiles/pinganguo.webp' },
  { key: '圣诞帽', imageUrl: '/smiles/shengdanmao.webp' },
  { key: '气球', imageUrl: '/smiles/qiqiu.webp' },
  { key: '烟花', imageUrl: '/smiles/yanhua.webp' },
  { key: '福', imageUrl: '/smiles/fu.webp' },
  { key: 'candy', imageUrl: '/smiles/candy.webp' },
  { key: '糖葫芦', imageUrl: '/smiles/tanghulu.webp' },
  { key: '鞭炮', imageUrl: '/smiles/bianpao.webp' },
  { key: '元宝', imageUrl: '/smiles/yuanbao.webp' },
  { key: '灯笼', imageUrl: '/smiles/denglong.webp' },
  { key: '锦鲤', imageUrl: '/smiles/jinli.webp' },
  { key: '巧克力', imageUrl: '/smiles/qiaokeli.webp' },
  { key: '戒指', imageUrl: '/smiles/jiezhi.webp' },
  { key: '棒棒糖', imageUrl: '/smiles/bangbangtang.webp' },
  { key: '纸飞机', imageUrl: '/smiles/zhifeiji.webp' },
  { key: '粽子', imageUrl: '/smiles/zongzi.webp' },
])

// 插入表情
const insertSmile = (item: { key: string; imageUrl: string }, close: () => void) => {
  const text = ` [${item.key}] `

  // 找到编辑器里的 textarea
  const textarea = document.querySelector('.markdown-editor .editor-input') as HTMLTextAreaElement | null

  if (textarea) {
    const start = textarea.selectionStart || 0
    const end = textarea.selectionEnd || 0
    const before = textarea.value.substring(0, start)
    const after = textarea.value.substring(end)
    textarea.value = before + text + after
    const newPos = start + text.length
    textarea.selectionStart = newPos
    textarea.selectionEnd = newPos
    textarea.focus()
    // 触发 input 事件，让 Vue 响应式更新
    textarea.dispatchEvent(new Event('input', { bubbles: true }))
  }

  close()
}
</script>

<style scoped>
.editor-actions {
  --btn-bg-color: var(--md-editor-mini-btn-bg);
  --btn-ring-color: var(--md-editor-actions-ring-color);
  --btn-hover-bg-color: var(--md-editor-actions-hover-bg);
  --btn-hover-border-color: var(--md-editor-actions-hover-border);

  position: relative;
  z-index: 50;
  display: flex;
  justify-content: space-between;
  flex-wrap: nowrap;
  gap: 0.6rem;
  align-items: center;
  padding: 0.3rem 0.35rem 0.1rem;
}

.editor-actions__left {
  min-width: 0;
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: nowrap;
  overflow: visible;
}

.editor-actions__tag {
  position: relative;
  flex: 0 0 auto;
  isolation: isolate;
}

.editor-actions__tag-panel {
  position: absolute;
  z-index: 100;
  top: calc(100% + 0.4rem);
  left: 0;
  width: 16rem;
  max-height: 16rem;
  overflow-y: auto;
  padding: 0.55rem;
  border-radius: var(--radius-xs);
  border: 1px solid var(--color-border-subtle);
  background: var(--md-editor-mini-bg);
  box-shadow: var(--md-editor-mini-shell-shadow);
}

.editor-actions__tag-empty {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.5rem;
  text-align: center;
}

.editor-actions__tag-empty-text {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin: 0;
}

.editor-actions__tag-empty-link {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-accent);
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
}

.editor-actions__tag-empty-link:hover {
  text-decoration: underline;
}

.editor-actions__tag-chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.editor-actions__tag-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.18rem 0.55rem;
  border-radius: var(--radius-sm);
  border: 1px dashed var(--color-border-subtle);
  background: transparent;
  color: var(--color-text-muted);
  font-size: 0.75rem;
  line-height: 1.3;
  cursor: pointer;
  transition:
    color 0.15s ease,
    border-color 0.15s ease,
    background-color 0.15s ease;
}

.editor-actions__tag-chip:hover {
  color: var(--color-text-primary);
  border-color: var(--color-text-secondary);
}

.editor-actions__tag-chip--selected {
  color: var(--color-bg-canvas);
  background: var(--color-text-primary);
  border-style: solid;
  border-color: var(--color-text-primary);
}

.editor-actions__tag-chip--selected:hover {
  color: var(--color-bg-canvas);
}

.editor-actions__tag-chip--disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.editor-actions__tag-chip--disabled:hover {
  color: var(--color-text-muted);
  border-color: var(--color-border-subtle);
  background: transparent;
}

.editor-actions__right {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  white-space: nowrap;
}

.editor-actions__info-pop {
  position: absolute;
  right: 0;
  top: 100%;
  z-index: 10;
  margin-top: 0.5rem;
  white-space: nowrap;
  border-radius: var(--radius-xs);
  border: 1px dashed var(--md-editor-mini-btn-border);
  background: var(--md-editor-mini-bg);
  padding: 0.4rem 0.55rem;
  font-size: 0.75rem;
  box-shadow: var(--md-editor-mini-shell-shadow);
  opacity: 0;
  transform: translateY(0.25rem) scale(0.96);
  pointer-events: none;
  transition: all 0.2s ease-out;
}

.group:hover .editor-actions__info-pop {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

.editor-actions__cta {
  box-shadow: var(--md-editor-mini-shell-shadow);
}

.editor-actions__publish {
  position: relative;
  flex: 0 0 auto;
  isolation: isolate;
}

.editor-actions__publish-panel {
  position: absolute;
  z-index: 100;
  top: calc(100% + 0.4rem);
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 11rem;
  padding: 0.4rem;
  border-radius: var(--radius-xs);
  border: 1px solid var(--color-border-subtle);
  background: var(--md-editor-mini-bg);
  box-shadow: var(--md-editor-mini-shell-shadow);
}

.editor-actions__publish-option {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.6rem;
  border-radius: var(--radius-xs);
  border: none;
  background: transparent;
  color: var(--color-text-primary);
  font-size: 0.8rem;
  line-height: 1.3;
  text-align: left;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.editor-actions__publish-option:hover {
  background: var(--md-editor-actions-hover-bg);
  color: var(--color-text-primary);
}

.editor-actions__publish-option-icon {
  width: 1rem;
  height: 1rem;
  flex: 0 0 auto;
}

@media (width <= 639.98px) {
  .editor-actions {
    gap: 0.45rem;
  }

  .editor-actions__tag {
    position: static;
  }

  .editor-actions__tag-panel {
    left: 0.35rem;
    right: 0.35rem;
    width: auto;
    max-width: none;
    scrollbar-width: none;
  }

  .editor-actions__tag-panel::-webkit-scrollbar {
    display: none;
  }

  .editor-actions__publish-panel {
    right: 0.35rem;
  }
}
</style>
