// SPDX-License-Identifier: GPL-3.0-or-later
// License: GNU GPLv3 or later. See the license file in the project root for more information.
// Copyright © 2021 - present Aleksey Hoffman. All rights reserved.

import type { DirEntry, DirEntryLinkStatus, DirEntryLinkType } from '@/types/dir-entry';

export type DirEntryKindDescriptor = {
  key: string;
  params: Record<string, string>;
};

export type DirEntryKindTranslate = (key: string, named: Record<string, string>) => string;

type FileKindGroup = {
  key: string;
  extensions: readonly string[];
};

const FILE_KIND_GROUPS: readonly FileKindGroup[] = [
  { key: 'fileBrowser.kinds.pdfDocument', extensions: ['pdf'] },
  { key: 'fileBrowser.kinds.wordDocument', extensions: ['doc', 'docx', 'odt', 'rtf'] },
  { key: 'fileBrowser.kinds.spreadsheet', extensions: ['xls', 'xlsx', 'ods', 'csv'] },
  { key: 'fileBrowser.kinds.presentation', extensions: ['ppt', 'pptx', 'odp'] },
  { key: 'fileBrowser.kinds.textDocument', extensions: ['txt', 'md', 'log'] },
  { key: 'fileBrowser.kinds.ebook', extensions: ['epub', 'mobi', 'azw3', 'fb2'] },
  { key: 'fileBrowser.kinds.image', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg', 'heic', 'ico', 'tif', 'tiff', 'avif'] },
  { key: 'fileBrowser.kinds.audio', extensions: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma', 'opus'] },
  { key: 'fileBrowser.kinds.video', extensions: ['mp4', 'mkv', 'mov', 'avi', 'webm', 'wmv', 'm4v'] },
  { key: 'fileBrowser.kinds.archive', extensions: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'] },
  { key: 'fileBrowser.kinds.application', extensions: ['exe', 'appimage'] },
  { key: 'fileBrowser.kinds.installer', extensions: ['msi', 'msix', 'deb', 'rpm', 'flatpak'] },
  { key: 'fileBrowser.kinds.script', extensions: ['ps1', 'bat', 'cmd', 'sh', 'py', 'js', 'ts'] },
  { key: 'fileBrowser.kinds.partialDownload', extensions: ['crdownload', 'part', 'partial', 'download'] },
];

const FILE_KIND_KEY_BY_EXTENSION = new Map<string, string>(
  FILE_KIND_GROUPS.flatMap(group => group.extensions.map(extension => [extension, group.key] as const)),
);

export function getFileExtension(name: string): string {
  const lastDotIndex = name.lastIndexOf('.');

  if (lastDotIndex <= 0 || lastDotIndex === name.length - 1) {
    return '';
  }

  return name.slice(lastDotIndex + 1).toLowerCase();
}

export function getDirEntryKindKeyFromFields(
  isDirectory: boolean,
  linkType: DirEntryLinkType | null | undefined,
): string {
  if (linkType === 'symlink') {
    return 'fileBrowser.kinds.symlink';
  }

  if (linkType === 'shortcut') {
    return 'fileBrowser.kinds.shortcut';
  }

  if (linkType === 'junction') {
    return 'fileBrowser.kinds.junction';
  }

  if (linkType === 'hardlink') {
    return 'fileBrowser.kinds.hardlinkedFile';
  }

  if (isDirectory) {
    return 'fileBrowser.kinds.folder';
  }

  return 'fileBrowser.kinds.file';
}

export function getDirEntryKindDescriptorFromFields(
  isDirectory: boolean,
  linkType: DirEntryLinkType | null | undefined,
  name: string | null | undefined,
): DirEntryKindDescriptor {
  const baseKey = getDirEntryKindKeyFromFields(isDirectory, linkType);

  if (baseKey !== 'fileBrowser.kinds.file') {
    return { key: baseKey, params: {} };
  }

  const extension = getFileExtension(name ?? '');

  if (!extension) {
    return { key: baseKey, params: {} };
  }

  const extensionLabel = extension.toUpperCase();
  const knownKindKey = FILE_KIND_KEY_BY_EXTENSION.get(extension);

  return {
    key: knownKindKey ?? 'fileBrowser.kinds.extensionFile',
    params: { extension: extensionLabel },
  };
}

export function getDirEntryKindDescriptor(entry: DirEntry): DirEntryKindDescriptor {
  return getDirEntryKindDescriptorFromFields(entry.is_dir, entry.link_type, entry.name);
}

export function getDirEntryKindLabel(entry: DirEntry, translate: DirEntryKindTranslate): string {
  const descriptor = getDirEntryKindDescriptor(entry);
  return translate(descriptor.key, descriptor.params);
}

export function getDirEntryKindSortKeyFromFields(
  isDirectory: boolean,
  linkType: DirEntryLinkType | null | undefined,
  name: string | null | undefined,
): string {
  const descriptor = getDirEntryKindDescriptorFromFields(isDirectory, linkType, name);
  const extension = descriptor.params.extension;

  return extension ? `${descriptor.key}:${extension}` : descriptor.key;
}

export function getDirEntryKindKey(entry: DirEntry): string {
  return getDirEntryKindKeyFromFields(entry.is_dir, entry.link_type);
}

export function getDirEntryKindSortValue(entry: DirEntry): string {
  return getDirEntryKindSortKeyFromFields(entry.is_dir, entry.link_type, entry.name);
}

export function getDirEntryLinksDisplayFromFields(
  isFile: boolean,
  hardLinkCount: number | null | undefined,
): string {
  if (
    isFile
    && typeof hardLinkCount === 'number'
    && hardLinkCount > 1
  ) {
    return String(hardLinkCount);
  }

  return '—';
}

export function getDirEntryLinksDisplay(entry: DirEntry): string {
  return getDirEntryLinksDisplayFromFields(entry.is_file, entry.hard_link_count);
}

export function getDirEntryLinksSortValueFromFields(
  isFile: boolean,
  hardLinkCount: number | null | undefined,
): number {
  if (
    isFile
    && typeof hardLinkCount === 'number'
    && hardLinkCount > 1
  ) {
    return hardLinkCount;
  }

  return -1;
}

export function getDirEntryLinksSortValue(entry: DirEntry): number {
  return getDirEntryLinksSortValueFromFields(entry.is_file, entry.hard_link_count);
}

export function getDirEntryLinkStatusKeyFromFields(
  linkType: DirEntryLinkType | null | undefined,
  linkStatus: DirEntryLinkStatus | null | undefined,
): string | null {
  if (!linkType || !linkStatus) {
    return null;
  }

  return linkStatusKey(linkStatus);
}

export function getDirEntryLinkStatusKey(entry: DirEntry): string | null {
  return getDirEntryLinkStatusKeyFromFields(entry.link_type, entry.link_status);
}

export function getDirEntryLinkStatusSortValue(entry: DirEntry): string {
  return getDirEntryLinkStatusKey(entry) ?? '';
}

function linkStatusKey(status: DirEntryLinkStatus): string {
  if (status === 'valid') {
    return 'fileBrowser.linkStatuses.valid';
  }

  if (status === 'broken') {
    return 'fileBrowser.linkStatuses.broken';
  }

  if (status === 'unsupported') {
    return 'fileBrowser.linkStatuses.unsupported';
  }

  return 'fileBrowser.linkStatuses.unknown';
}
