// SPDX-License-Identifier: GPL-3.0-or-later
// License: GNU GPLv3 or later. See the license file in the project root for more information.
// Copyright © 2021 - present Aleksey Hoffman. All rights reserved.

import { describe, expect, it } from 'vitest';
import type { DirEntry } from '@/types/dir-entry';
import {
  getDirEntryKindDescriptor,
  getDirEntryKindLabel,
  getDirEntryKindSortKeyFromFields,
  getFileExtension,
} from '@/utils/dir-entry-link-metadata';

function createEntry(name: string, isDir = false, linkType: string | null = null): DirEntry {
  return {
    name,
    path: `C:/test/${name}`,
    is_dir: isDir,
    is_file: !isDir,
    link_type: linkType,
  } as unknown as DirEntry;
}

describe('getFileExtension', () => {
  it('returns the lowercase extension', () => {
    expect(getFileExtension('Report.PDF')).toBe('pdf');
    expect(getFileExtension('archive.tar.gz')).toBe('gz');
  });

  it('returns an empty string when there is no extension', () => {
    expect(getFileExtension('README')).toBe('');
    expect(getFileExtension('.gitignore')).toBe('');
    expect(getFileExtension('trailing.')).toBe('');
  });
});

describe('getDirEntryKindDescriptor', () => {
  it('names known document types', () => {
    expect(getDirEntryKindDescriptor(createEntry('East_of_Eden.pdf')).key).toBe('fileBrowser.kinds.pdfDocument');
    expect(getDirEntryKindDescriptor(createEntry('cv.docx')).key).toBe('fileBrowser.kinds.wordDocument');
  });

  it('includes the extension for media types', () => {
    expect(getDirEntryKindDescriptor(createEntry('book.mp3'))).toEqual({
      key: 'fileBrowser.kinds.audio',
      params: { extension: 'MP3' },
    });
  });

  it('falls back to "<EXT> File" for unknown extensions', () => {
    expect(getDirEntryKindDescriptor(createEntry('book.torrent'))).toEqual({
      key: 'fileBrowser.kinds.extensionFile',
      params: { extension: 'TORRENT' },
    });
  });

  it('keeps plain "File" when there is no extension', () => {
    expect(getDirEntryKindDescriptor(createEntry('LICENSE')).key).toBe('fileBrowser.kinds.file');
  });

  it('does not treat folders or links as file types', () => {
    expect(getDirEntryKindDescriptor(createEntry('photos.png', true)).key).toBe('fileBrowser.kinds.folder');
    expect(getDirEntryKindDescriptor(createEntry('app.lnk', false, 'shortcut')).key).toBe('fileBrowser.kinds.shortcut');
  });
});

describe('getDirEntryKindLabel', () => {
  it('passes the key and extension to the translate function', () => {
    const translate = (key: string, named: Record<string, string>) => `${key}|${named.extension ?? ''}`;

    expect(getDirEntryKindLabel(createEntry('song.flac'), translate)).toBe('fileBrowser.kinds.audio|FLAC');
  });
});

describe('getDirEntryKindSortKeyFromFields', () => {
  it('groups files of the same type together', () => {
    const pdfA = getDirEntryKindSortKeyFromFields(false, null, 'a.pdf');
    const pdfB = getDirEntryKindSortKeyFromFields(false, null, 'b.pdf');
    const mp3 = getDirEntryKindSortKeyFromFields(false, null, 'c.mp3');

    expect(pdfA).toBe(pdfB);
    expect(pdfA).not.toBe(mp3);
  });
});
