// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2025-2026 lin-snow

export interface LinkTypeConfig {
  key: string
  name: string
  icon: string
  patterns: RegExp[]
}

export const linkTypeConfigs: LinkTypeConfig[] = [
  // ============ 网盘 ============
  { key: 'baidu',   name: '百度网盘',   icon: 'baidu',   patterns: [/pan\.baidu\.com/i, /baidu\.com\/s\//i] },
  { key: 'aliyun',  name: '阿里云盘',   icon: 'aliyun',  patterns: [/aliyundrive\.com/i, /alipan\.com/i] },
  { key: 'quark',   name: '夸克网盘',   icon: 'quark',   patterns: [/pan\.quark\.cn/i, /quark\.cn\/s\//i] },
  { key: 'uc',      name: 'UC网盘',     icon: 'uc',      patterns: [/drive\.uc\.cn/i, /uc\.cn\/s\//i] },
  { key: '115',     name: '115网盘',    icon: '115',     patterns: [/115\.com/i, /anxia\.com/i] },
  { key: '123pan',  name: '123云盘',    icon: '123pan',  patterns: [/123pan\.com/i, /123684\.com/i] },
  { key: 'lanzou',  name: '蓝奏云',     icon: 'lanzou',  patterns: [/lanzou[a-z]?\.com/i, /lanzou[a-z]?\.cn/i] },
  { key: 'xunlei',  name: '迅雷网盘',   icon: 'xunlei',  patterns: [/pan\.xunlei\.com/i, /xunlei\.com\/s\//i] },
  { key: 'weiyun',  name: '腾讯微云',   icon: 'weiyun',  patterns: [/share\.weiyun\.com/i, /weiyun\.com/i] },
  { key: 'telecom', name: '天翼云盘',   icon: 'telecom', patterns: [/cloud\.189\.cn/i, /189\.cn\/s\//i] },
  { key: 'mobile',  name: '移动云盘',   icon: 'mobile',  patterns: [/caiyun\.139\.com/i, /yun\.139\.com/i] },
  { key: 'unicom',  name: '联通云盘',   icon: 'unicom',  patterns: [/cloud\.wo\.cn/i, /wo\.cn\/s\//i] },

  // ============ 下载协议 / 链接 ============
  { key: 'magnet',  name: '磁力链接',   icon: 'magnet',  patterns: [/^magnet:/i] },
  { key: 'thunder', name: '迅雷链接',   icon: 'thunder', patterns: [/^thunder:\/\//i] },
  { key: 'ed2k',    name: '电驴链接',   icon: 'ed2k',    patterns: [/^ed2k:\/\//i] },
  { key: 'flashget',name: '快车链接',   icon: 'flashget',patterns: [/^flashget:\/\//i] },
  // { key: 'ftp',     name: 'FTP 链接',   icon: 'ftp',     patterns: [/^ftp:\/\//i, /^ftps:\/\//i] },
  { key: 'bt',      name: 'BT 种子',    icon: 'bt',      patterns: [/\.torrent$/i] },
]

export interface LinkTypeMatch {
  name: string
  icon: string
}

const fallback: LinkTypeMatch = {
  name: '网站',
  icon: 'link',
}

export function detectLinkType(url: string): LinkTypeMatch {
  const trimmed = url.trim()
  if (!trimmed) return fallback
  for (const config of linkTypeConfigs) {
    if (config.patterns.some((p) => p.test(trimmed))) {
      return { name: config.name, icon: config.icon }
    }
  }
  return fallback
}