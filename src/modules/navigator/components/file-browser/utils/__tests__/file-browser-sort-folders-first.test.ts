// SPDX-License-Identifier: GPL-3.0-or-later
// License: GNU GPLv3 or later. See the license file in the project root for more information.
// Copyright © 2021 - present Aleksey Hoffman. All rights reserved.

import { describe, expect, it } from 'vitest';
import type { DirEntry } from '@/types/dir-entry';
import { sortFileBrowserEntries } from '@/modules/navigator/components/file-browser/utils/file-browser-sort';

function createEntry(name: string, isDir: boolean, modifiedTime: number): DirEntry {
  return {
    name,
    path: `C:/test/${name}`,
    is_dir: isDir,
    is_file: !isDir,
    modified_time: modifiedTime,
    created_time: modifiedTime,
  } as unknown as DirEntry;
}

const oldFolder = createEntry('Old folder', true, 1000);
const newFile = createEntry('new-download.pdf', false, 3000);
const midFile = createEntry('older-download.pdf', false, 2000);

describe('sortFileBrowserEntries folders-first option', () => {
  it('keeps folders first by default', () => {
    const sorted = sortFileBrowserEntries([newFile, midFile, oldFolder], 'modified', 'desc');

    expect(sorted.map(entry => entry.name)).toEqual([
      'Old folder',
      'new-download.pdf',
      'older-download.pdf',
    ]);
  });

  it('sorts folders and files together when foldersFirst is false', () => {
    const sorted = sortFileBrowserEntries(
      [oldFolder, midFile, newFile],
      'modified',
      'desc',
      undefined,
      { foldersFirst: false },
    );

    expect(sorted.map(entry => entry.name)).toEqual([
      'new-download.pdf',
      'older-download.pdf',
      'Old folder',
    ]);
  });

  it('mixes folders and files alphabetically when sorting by name', () => {
    const sorted = sortFileBrowserEntries(
      [newFile, oldFolder, midFile],
      'name',
      'asc',
      undefined,
      { foldersFirst: false },
    );

    expect(sorted.map(entry => entry.name)).toEqual([
      'new-download.pdf',
      'Old folder',
      'older-download.pdf',
    ]);
  });
});