// SPDX-License-Identifier: GPL-3.0-or-later
// License: GNU GPLv3 or later. See the license file in the project root for more information.
// Copyright © 2021 - present Aleksey Hoffman. All rights reserved.

export type FolderColorPreset = {
  id: string;
  labelKey: string;
  color: string;
};

export const FOLDER_COLOR_PRESETS: readonly FolderColorPreset[] = [
  { id: 'purple', labelKey: 'folderColors.purple', color: 'hsl(270 90% 72%)' },
  { id: 'violet', labelKey: 'folderColors.violet', color: 'hsl(285 85% 70%)' },
  { id: 'blue', labelKey: 'folderColors.blue', color: 'hsl(217 91% 65%)' },
  { id: 'cyan', labelKey: 'folderColors.cyan', color: 'hsl(186 100% 55%)' },
  { id: 'green', labelKey: 'folderColors.green', color: 'hsl(150 90% 55%)' },
  { id: 'yellow', labelKey: 'folderColors.yellow', color: 'hsl(48 96% 60%)' },
  { id: 'orange', labelKey: 'folderColors.orange', color: 'hsl(25 95% 62%)' },
  { id: 'pink', labelKey: 'folderColors.pink', color: 'hsl(320 85% 68%)' },
  { id: 'red', labelKey: 'folderColors.red', color: 'hsl(0 85% 65%)' },
];

export const NEON_ICON_TONES = {
  folder: 'hsl(var(--primary))',
  document: 'hsl(217 91% 65%)',
  spreadsheet: 'hsl(150 90% 55%)',
  presentation: 'hsl(25 95% 62%)',
  ebook: 'hsl(285 85% 70%)',
  image: 'hsl(320 85% 68%)',
  audio: 'hsl(270 90% 72%)',
  video: 'hsl(340 90% 65%)',
  archive: 'hsl(48 96% 60%)',
  code: 'hsl(186 100% 55%)',
  application: 'hsl(240 90% 74%)',
  other: 'hsl(220 15% 72%)',
} as const;

type NeonTone = keyof typeof NEON_ICON_TONES;

const TONE_EXTENSIONS: Partial<Record<NeonTone, readonly string[]>> = {
  document: ['pdf', 'doc', 'docx', 'odt', 'rtf', 'txt', 'md', 'log'],
  spreadsheet: ['xls', 'xlsx', 'ods', 'csv'],
  presentation: ['ppt', 'pptx', 'odp'],
  ebook: ['epub', 'mobi', 'azw3', 'fb2'],
  image: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg', 'heic', 'ico', 'tif', 'tiff', 'avif'],
  audio: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma', 'opus'],
  video: ['mp4', 'mkv', 'mov', 'avi', 'webm', 'wmv', 'm4v'],
  archive: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'torrent'],
  code: [
    'js', 'ts', 'jsx', 'tsx', 'vue', 'py', 'java', 'c', 'cpp', 'h', 'cs', 'go', 'rs', 'rb', 'php',
    'html', 'css', 'scss', 'json', 'xml', 'yml', 'yaml', 'sh', 'ps1', 'bat', 'cmd', 'sql',
  ],
  application: ['exe', 'msi', 'msix', 'appimage', 'deb', 'rpm', 'apk', 'dmg'],
};

const TONE_BY_EXTENSION = new Map<string, NeonTone>(
  Object.entries(TONE_EXTENSIONS).flatMap(([tone, extensions]) =>
    (extensions ?? []).map(extension => [extension, tone as NeonTone] as const),
  ),
);

export function normalizeIconExtension(extension: string | null | undefined): string {
  return (extension ?? '').trim().replace(/^\.+/, '').toLowerCase();
}

export function getNeonIconColor(target: {
  isDirectory: boolean;
  extension?: string | null;
  folderColor?: string | null;
}): string {
  if (target.folderColor) {
    return target.folderColor;
  }

  if (target.isDirectory) {
    return NEON_ICON_TONES.folder;
  }

  const tone = TONE_BY_EXTENSION.get(normalizeIconExtension(target.extension)) ?? 'other';
  return NEON_ICON_TONES[tone];
}
