<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2025-2026 lin-snow -->
<template>
  <div ref="rootRef" class="echo-markdown">
    <div v-if="!rendererReady && props.content" class="markdown-renderer-fallback">
      {{ props.content }}
    </div>
    <div v-else v-html="html"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import '../styles/markdown.scss'

type RenderMarkdown = (typeof import('../core/markdown'))['renderMarkdown']

let renderMarkdownFn: RenderMarkdown | null = null
let renderMarkdownPromise: Promise<RenderMarkdown> | null = null

const loadRenderMarkdown = async (): Promise<RenderMarkdown> => {
  if (renderMarkdownFn) return renderMarkdownFn
  if (!renderMarkdownPromise) {
    renderMarkdownPromise = import('../core/markdown').then((module) => {
      renderMarkdownFn = module.renderMarkdown
      return module.renderMarkdown
    })
  }
  return renderMarkdownPromise
}

const props = defineProps<{
  content: string
}>()

const rootRef = ref<HTMLElement | null>(null)
const { t } = useI18n()
const copyResetTimers = new WeakMap<HTMLButtonElement, ReturnType<typeof setTimeout>>()
const expandLabel = computed(() => String(t('markdown.expand')))
const collapseLabel = computed(() => String(t('markdown.collapse')))
const copyLabel = computed(() => String(t('markdown.copy')))
const copiedLabel = computed(() => String(t('markdown.copied')))
const taskCheckboxLabel = computed(() => String(t('markdown.taskCheckboxLabel')))
const html = ref('')
const rendererReady = ref(Boolean(renderMarkdownFn))
let renderSequence = 0


// 😊 表情映射表
const smileMap: Record<string, string> = {
  '微笑': '/smiles/weixiao.webp',
  '色': '/smiles/se.webp',
  '发呆': '/smiles/fadai.webp',
  '酷拽': '/smiles/kuzhuai.webp',
  '抠鼻': '/smiles/koubi.webp',
  '流泪': '/smiles/liulei.webp',
  '捂脸': '/smiles/wulian.webp',
  '发怒': '/smiles/fanu.webp',
  '呲牙': '/smiles/ciya.webp',
  '尬笑': '/smiles/gaxiao.webp',
  '害羞': '/smiles/haixiu.webp',
  '调皮': '/smiles/tiaopi.webp',
  '舔屏': '/smiles/tianping.webp',
  '看': '/smiles/kan.webp',
  '爱心': '/smiles/aixin.webp',
  '比心': '/smiles/bixin.webp',
  '赞': '/smiles/zan.webp',
  '鼓掌': '/smiles/guzhang.webp',
  '感谢': '/smiles/ganxie.webp',
  '抱抱你': '/smiles/baobaoni.webp',
  '玫瑰': '/smiles/meigui.webp',
  '尴尬流汗': '/smiles/gangaliuhan.webp',
  '戳手手': '/smiles/chuoshoushou.webp',
  '星星眼': '/smiles/xingxingyan.webp',
  '杀马特': '/smiles/shamate.webp',
  '黄脸干杯': '/smiles/huanglianganbei.webp',
  '抱紧自己': '/smiles/baojinziji.webp',
  '拜拜': '/smiles/baibai.webp',
  '热化了': '/smiles/rehualiao.webp',
  '黄脸祈祷': '/smiles/huanglianqidao.webp',
  '懵': '/smiles/meng.webp',
  '举手': '/smiles/jushou.webp',
  '加功德': '/smiles/jiagongde.webp',
  '摊手': '/smiles/tanshou.webp',
  '无语流汗': '/smiles/wuyuliuhan.webp',
  '续火花吧': '/smiles/xuhuahuaba.webp',
  '点火': '/smiles/dianhuo.webp',
  '哭哭': '/smiles/kuku.webp',
  '吐舌小狗': '/smiles/tushexiaogou.webp',
  '送花': '/smiles/songhua.webp',
  '爱心手': '/smiles/aixinshou.webp',
  '贴贴': '/smiles/tietie.webp',
  '灵机一动': '/smiles/lingjiyidong.webp',
  '耶': '/smiles/ye.webp',
  '打脸': '/smiles/dalian.webp',
  '大笑': '/smiles/daxiao.webp',
  '机智': '/smiles/jizhi.webp',
  '送心': '/smiles/songxin.webp',
  '666': '/smiles/666.webp',
  '闭嘴': '/smiles/bizui.webp',
  '来看我': '/smiles/laikanwo.webp',
  '一起加油': '/smiles/yiqijiayou.webp',
  '哈欠': '/smiles/haqian.webp',
  '震惊': '/smiles/zhenjing.webp',
  '晕': '/smiles/yun.webp',
  '衰': '/smiles/shuai.webp',
  '困': '/smiles/kun.webp',
  '疑问': '/smiles/yiwen.webp',
  '泣不成声': '/smiles/qibuchengsheng.webp',
  '小鼓掌': '/smiles/xiaoguzhang.webp',
  '大金牙': '/smiles/dajinya.webp',
  '偷笑': '/smiles/touxiao.webp',
  '石化': '/smiles/shihua.webp',
  '思考': '/smiles/sikao.webp',
  '吐血': '/smiles/tuxue.webp',
  '可怜': '/smiles/kelian.webp',
  '嘘': '/smiles/xu.webp',
  '撇嘴': '/smiles/piezui.webp',
  '笑哭': '/smiles/xiaoku.webp',
  '奸笑': '/smiles/jianxiao.webp',
  '得意': '/smiles/deyi.webp',
  '憨笑': '/smiles/hanxiao.webp',
  '坏笑': '/smiles/huaixiao.webp',
  '抓狂': '/smiles/zhuakuang.webp',
  '泪奔': '/smiles/leiben.webp',
  '钱': '/smiles/qian.webp',
  '恐惧': '/smiles/kongju.webp',
  '愉快': '/smiles/yukuai.webp',
  '快哭了': '/smiles/kuaikule.webp',
  '翻白眼': '/smiles/fanbaiyan.webp',
  '互粉': '/smiles/hufen.webp',
  '我想静静': '/smiles/woxiangjingjing.webp',
  '委屈': '/smiles/weiqu.webp',
  '鄙视': '/smiles/bishi.webp',
  '飞吻': '/smiles/feiwen.webp',
  '再见': '/smiles/zaijian.webp',
  '紫薇别走': '/smiles/ziweibiezou.webp',
  '听歌': '/smiles/tingge.webp',
  '求抱抱': '/smiles/qiubaobao.webp',
  '绝望的凝视': '/smiles/juewangdeningshi.webp',
  '不失礼貌的微笑': '/smiles/bushilimaodeweixiao.webp',
  '不看': '/smiles/bukan.webp',
  '裂开': '/smiles/liekai.webp',
  '干饭人': '/smiles/ganfanren.webp',
  '庆祝': '/smiles/qingzhu.webp',
  '吐舌': '/smiles/tushe.webp',
  '呆无辜': '/smiles/daiwugu.webp',
  '白眼': '/smiles/baiyan.webp',
  '猪头': '/smiles/zhutou.webp',
  '冷漠': '/smiles/lengmo.webp',
  '暗中观察': '/smiles/anzhongguancha.webp',
  '二哈': '/smiles/erha.webp',
  '菜狗': '/smiles/caigou.webp',
  '黑脸': '/smiles/heilian.webp',
  '展开说说': '/smiles/zhankaishuoshuo.webp',
  '蜜蜂狗': '/smiles/mifenggou.webp',
  '柴犬': '/smiles/chaiquan.webp',
  '摸头': '/smiles/motou.webp',
  '皱眉': '/smiles/zhoumei.webp',
  '擦汗': '/smiles/cahan.webp',
  '红脸': '/smiles/honglian.webp',
  '做鬼脸': '/smiles/zuoguilian.webp',
  '强': '/smiles/qiang.webp',
  '如花': '/smiles/ruhua.webp',
  '吐': '/smiles/tu.webp',
  '惊喜': '/smiles/jingxi.webp',
  '敲打': '/smiles/qiaoda.webp',
  '奋斗': '/smiles/fendou.webp',
  '吐彩虹': '/smiles/tuhongcai.webp',
  '大哭': '/smiles/daku.webp',
  '嘿哈': '/smiles/heiha.webp',
  '惊恐': '/smiles/jingkong.webp',
  '囧': '/smiles/jiong.webp',
  '难过': '/smiles/nanguo.webp',
  '斜眼': '/smiles/xieyan.webp',
  '阴险': '/smiles/yinxian.webp',
  '悠闲': '/smiles/youxian.webp',
  '咒骂': '/smiles/zhouma.webp',
  '吃瓜群众': '/smiles/chiguaqunzhong.webp',
  '歪眼': '/smiles/waiyan.webp',
  '敢怒不敢言': '/smiles/gannubuganyan.webp',
  '求求了': '/smiles/qiuqiule.webp',
  '眼含热泪': '/smiles/yanhanrelei.webp',
  '叹气': '/smiles/tanqi.webp',
  '好开心': '/smiles/haokaixin.webp',
  '不是吧': '/smiles/bushiba.webp',
  '鞠躬': '/smiles/jugong.webp',
  '躺平': '/smiles/tangping.webp',
  '九转大肠': '/smiles/jiuzuandachang.webp',
  '不你不想': '/smiles/bunibuxiang.webp',
  '一头乱麻': '/smiles/yitouluanma.webp',
  'kisskiss': '/smiles/kisskiss.webp',
  '你不大行': '/smiles/nibudaxing.webp',
  '噢买尬': '/smiles/omaiga.webp',
  '宕机': '/smiles/dangji.webp',
  '苦涩': '/smiles/kuse.webp',
  '逞强落泪': '/smiles/chengqiangluolei.webp',
  '求机位': '/smiles/qiujiwei.webp',
  '求机位3': '/smiles/qiujiwei3.webp',
  '点赞': '/smiles/dianzan.webp',
  '精选': '/smiles/jingxuan.webp',
  '强壮': '/smiles/qiangzhuang.webp',
  '碰拳': '/smiles/pengquan.webp',
  'OK': '/smiles/OK.webp',
  '击掌': '/smiles/jizhang.webp',
  '左上': '/smiles/zuoshang.webp',
  '握手': '/smiles/woshou.webp',
  '抱拳': '/smiles/baoquan.webp',
  '勾引': '/smiles/gouyin.webp',
  '拳头': '/smiles/quantou.webp',
  '弱': '/smiles/ruo.webp',
  '胜利': '/smiles/shengli.webp',
  '右边': '/smiles/youbian.webp',
  '左边': '/smiles/zuobian.webp',
  '嘴唇': '/smiles/zuichun.webp',
  '心碎': '/smiles/xinsui.webp',
  '凋谢': '/smiles/diaoxie.webp',
  '愤怒': '/smiles/fennu.webp',
  '垃圾': '/smiles/laji.webp',
  '啤酒': '/smiles/pijiu.webp',
  '咖啡': '/smiles/kafei.webp',
  '蛋糕': '/smiles/dangao.webp',
  '礼物': '/smiles/liwu.webp',
  '撒花': '/smiles/sahua.webp',
  '加一': '/smiles/jiayi.webp',
  '减一': '/smiles/jianyi.webp',
  'okk': '/smiles/okk.webp',
  'V5': '/smiles/V5.webp',
  '绝': '/smiles/jue.webp',
  '给力': '/smiles/geili.webp',
  '红包': '/smiles/hongbao.webp',
  '便便': '/smiles/bianbian.webp',
  '发': '/smiles/fa.webp',
  '18禁': '/smiles/18jin.webp',
  '炸弹': '/smiles/zhadan.webp',
  '西瓜': '/smiles/xigua.webp',
  '加鸡腿': '/smiles/jiajitui.webp',
  '握爪': '/smiles/wozhao.webp',
  '太阳': '/smiles/taiyang.webp',
  '月亮': '/smiles/yueliang.webp',
  '给跪了': '/smiles/geiguile.webp',
  '蕉绿': '/smiles/jiaolv.webp',
  '扎心': '/smiles/zaxin.webp',
  '胡瓜': '/smiles/hugua.webp',
  '打call': '/smiles/dacall.webp',
  '栓Q': '/smiles/shuanQ.webp',
  '雪花': '/smiles/xuehua.webp',
  '圣诞树': '/smiles/shengdanshu.webp',
  '平安果': '/smiles/pinganguo.webp',
  '圣诞帽': '/smiles/shengdanmao.webp',
  '气球': '/smiles/qiqiu.webp',
  '烟花': '/smiles/yanhua.webp',
  '福': '/smiles/fu.webp',
  'candy': '/smiles/candy.webp',
  '糖葫芦': '/smiles/tanghulu.webp',
  '鞭炮': '/smiles/bianpao.webp',
  '元宝': '/smiles/yuanbao.webp',
  '灯笼': '/smiles/denglong.webp',
  '锦鲤': '/smiles/jinli.webp',
  '巧克力': '/smiles/qiaokeli.webp',
  '戒指': '/smiles/jiezhi.webp',
  '棒棒糖': '/smiles/bangbangtang.webp',
  '纸飞机': '/smiles/zhifeiji.webp',
  '粽子': '/smiles/zongzi.webp',
}

// 把表情占位符替换成 <img> 标签
const replaceSmiles = (text: string): string => {
  if (!text) return text
  let result = text
  for (const [key, url] of Object.entries(smileMap)) {
    const regex = new RegExp(`\\[${key}\\]`, 'g')
    result = result.replaceAll(
      regex,
      `<img src="${url}" alt="${key}" class="echo-smile" />`
    )
  }
  return result
}

// 修改 renderContent 函数
const renderContent = async () => {
  const currentSequence = ++renderSequence
  let content = props.content

  if (!content) {
    html.value = ''
    return
  }

  const render = await loadRenderMarkdown()
  if (currentSequence !== renderSequence) return

  let rendered = await render(content, {
    expandLabel: expandLabel.value,
    collapseLabel: collapseLabel.value,
    copyLabel: copyLabel.value,
    copiedLabel: copiedLabel.value,
    taskCheckboxLabel: taskCheckboxLabel.value,
  })
  if (currentSequence !== renderSequence) return

  // ✅ 渲染完成后替换表情
  rendered = replaceSmiles(rendered)

  rendererReady.value = true
  html.value = rendered
}

function onRootClick(event: Event) {
  if (!rendererReady.value) return
  const target = event.target
  if (!(target instanceof HTMLElement)) return

  const toggleButton = target.closest<HTMLButtonElement>('.code-block-toggle')
  if (toggleButton && rootRef.value?.contains(toggleButton)) {
    const block = toggleButton.closest<HTMLElement>('.code-block--collapsible')
    if (!block) return

    const isCollapsed = block.classList.toggle('code-block--collapsed')
    const expandLabel = toggleButton.dataset.expandLabel ?? String(t('markdown.expand'))
    const collapseLabel = toggleButton.dataset.collapseLabel ?? String(t('markdown.collapse'))

    toggleButton.setAttribute('aria-expanded', String(!isCollapsed))
    toggleButton.textContent = isCollapsed ? expandLabel : collapseLabel
    return
  }

  const copyButton = target.closest<HTMLButtonElement>('.code-block-copy')
  if (copyButton && rootRef.value?.contains(copyButton)) {
    const block = copyButton.closest<HTMLElement>('.code-block')
    const codeEl = block?.querySelector<HTMLElement>('pre code')
    if (!codeEl) return

    const text = codeEl.textContent ?? ''
    const copyLabel = copyButton.dataset.copyLabel ?? String(t('markdown.copy'))
    const copiedLabel = copyButton.dataset.copiedLabel ?? String(t('markdown.copied'))

    const markCopied = () => {
      copyButton.classList.add('is-copied')
      copyButton.textContent = copiedLabel
      const prev = copyResetTimers.get(copyButton)
      if (prev) clearTimeout(prev)
      copyResetTimers.set(
        copyButton,
        setTimeout(() => {
          copyButton.classList.remove('is-copied')
          copyButton.textContent = copyLabel
          copyResetTimers.delete(copyButton)
        }, 1800),
      )
    }

    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(markCopied)
        .catch(() => {})
    }
  }
}

onMounted(() => {
  rootRef.value?.addEventListener('click', onRootClick)
})

onBeforeUnmount(() => {
  rootRef.value?.removeEventListener('click', onRootClick)
})

watch(
  [() => props.content, expandLabel, collapseLabel, taskCheckboxLabel],
  () => {
    void renderContent()
  },
  { immediate: true },
)
</script>

<style scoped>
.markdown-renderer-fallback {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font: inherit;
  color: inherit;
}
</style>
