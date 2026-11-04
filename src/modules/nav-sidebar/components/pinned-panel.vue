<!-- SPDX-License-Identifier: GPL-3.0-or-later
License: GNU GPLv3 or later. See the license file in the project root for more information.
Copyright © 2021 - present Aleksey Hoffman. All rights reserved.
-->

<script setup lang="ts">
import { computed, type Component } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  ArrowDownToLineIcon,
  ClapperboardIcon,
  FileIcon,
  FileTextIcon,
  FolderIcon,
  HouseIcon,
  ImageIcon,
  MonitorIcon,
  MusicIcon,
  PinIcon,
} from '@lucide/vue';
import { useUserPathsStore } from '@/stores/storage/user-paths';
import { useUserStatsStore } from '@/stores/storage/user-stats';
import { useWorkspacesStore } from '@/stores/storage/workspaces';
import { openNavigatorPath, openNavigatorPathInNewTab } from '@/utils/open-navigator-directory';
import { NEON_ICON_TONES, getNeonIconColor } from '@/utils/neon-icon-tones';

type SidebarLocation = {
  id: string;
  labelKey: string;
  path: string;
  icon: Component;
  color: string;
};

type PinnedItem = {
  path: string;
  name: string;
  isLikelyFile: boolean;
  color: string;
};

const LIKELY_FILE_PATTERN = /\.[a-z0-9]{1,8}$/i;

const router = useRouter();
const { t } = useI18n();
const userPathsStore = useUserPathsStore();
const userStatsStore = useUserStatsStore();
const workspacesStore = useWorkspacesStore();

function getLastSegment(path: string): string {
  const segments = path.split(/[\\/]+/).filter(segment => segment.length > 0);
  return segments[segments.length - 1] ?? path;
}

function getParentPath(path: string): string {
  const lastSeparator = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
  return lastSeparator > 0 ? path.substring(0, lastSeparator) : path;
}

function normalizeForCompare(path: string): string {
  return path.replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase();
}

function getLocationColor(path: string, fallback: string): string {
  return userStatsStore.getFolderColor(path) ?? fallback;
}

const homeLocation = computed<SidebarLocation | null>(() => {
  const path = userPathsStore.userPaths.homeDir;

  if (!path) {
    return null;
  }

  return {
    id: 'home',
    labelKey: 'pinnedSidebar.home',
    path,
    icon: HouseIcon,
    color: getLocationColor(path, NEON_ICON_TONES.folder),
  };
});

const systemLocations = computed<SidebarLocation[]>(() => {
  const paths = userPathsStore.userPaths;
  const candidates: SidebarLocation[] = [
    {
      id: 'desktop',
      labelKey: 'pinnedSidebar.desktop',
      path: paths.desktopDir,
      icon: MonitorIcon,
      color: getLocationColor(paths.desktopDir, NEON_ICON_TONES.application),
    },
    {
      id: 'downloads',
      labelKey: 'pinnedSidebar.downloads',
      path: paths.downloadDir,
      icon: ArrowDownToLineIcon,
      color: getLocationColor(paths.downloadDir, NEON_ICON_TONES.code),
    },
    {
      id: 'documents',
      labelKey: 'pinnedSidebar.documents',
      path: paths.documentDir,
      icon: FileTextIcon,
      color: getLocationColor(paths.documentDir, NEON_ICON_TONES.document),
    },
    {
      id: 'pictures',
      labelKey: 'pinnedSidebar.pictures',
      path: paths.pictureDir,
      icon: ImageIcon,
      color: getLocationColor(paths.pictureDir, NEON_ICON_TONES.image),
    },
    {
      id: 'music',
      labelKey: 'pinnedSidebar.music',
      path: paths.audioDir,
      icon: MusicIcon,
      color: getLocationColor(paths.audioDir, NEON_ICON_TONES.audio),
    },
    {
      id: 'videos',
      labelKey: 'pinnedSidebar.videos',
      path: paths.videoDir,
      icon: ClapperboardIcon,
      color: getLocationColor(paths.videoDir, NEON_ICON_TONES.video),
    },
  ];

  return candidates.filter(location => !!location.path);
});

const pinnedItems = computed<PinnedItem[]>(() => {
  return userStatsStore.favorites.map((item) => {
    const name = getLastSegment(item.path);
    const isLikelyFile = LIKELY_FILE_PATTERN.test(name);

    return {
      path: item.path,
      name,
      isLikelyFile,
      color: getNeonIconColor({
        isDirectory: !isLikelyFile,
        extension: isLikelyFile ? name.split('.').pop() ?? null : null,
        folderColor: userStatsStore.getFolderColor(item.path),
      }),
    };
  });
});

const currentPath = computed(() => {
  if (router.currentRoute.value.name !== 'navigator') {
    return '';
  }

  return workspacesStore.currentTabGroup?.[0]?.path ?? '';
});

function isActive(path: string): boolean {
  return !!currentPath.value && normalizeForCompare(path) === normalizeForCompare(currentPath.value);
}

function getTargetPath(path: string, isLikelyFile = false): string {
  return isLikelyFile ? getParentPath(path) : path;
}

function openLocation(path: string, isLikelyFile = false) {
  void openNavigatorPath(router, getTargetPath(path, isLikelyFile));
}

function handleMouseDown(event: MouseEvent, path: string, isLikelyFile = false) {
  if (event.button !== 1) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  void openNavigatorPathInNewTab(router, getTargetPath(path, isLikelyFile));
}
</script>

<template>
  <nav class="pinned-panel">
    <div class="pinned-panel__scroll">
      <button
        v-if="homeLocation"
        type="button"
        class="pinned-panel__item"
        :data-active="isActive(homeLocation.path) || undefined"
        :title="homeLocation.path"
        @click="openLocation(homeLocation.path)"
        @mousedown="handleMouseDown($event, homeLocation.path)"
      >
        <component
          :is="homeLocation.icon"
          :size="16"
          class="pinned-panel__icon"
          :style="{ color: homeLocation.color, stroke: homeLocation.color }"
        />
        <span class="pinned-panel__label">{{ t(homeLocation.labelKey) }}</span>
      </button>

      <div class="pinned-panel__heading">
        <PinIcon
          :size="13"
          class="pinned-panel__heading-icon"
        />
        <span>{{ t('pinnedSidebar.pinned') }}</span>
      </div>

      <button
        v-for="location in systemLocations"
        :key="location.id"
        type="button"
        class="pinned-panel__item"
        :data-active="isActive(location.path) || undefined"
        :title="location.path"
        @click="openLocation(location.path)"
        @mousedown="handleMouseDown($event, location.path)"
      >
        <component
          :is="location.icon"
          :size="16"
          class="pinned-panel__icon"
          :style="{ color: location.color, stroke: location.color }"
        />
        <span class="pinned-panel__label">{{ t(location.labelKey) }}</span>
      </button>

      <div
        v-if="pinnedItems.length > 0"
        class="pinned-panel__divider"
      />

      <button
        v-for="item in pinnedItems"
        :key="item.path"
        type="button"
        class="pinned-panel__item"
        :data-active="isActive(item.path) || undefined"
        :title="item.path"
        @click="openLocation(item.path, item.isLikelyFile)"
        @mousedown="handleMouseDown($event, item.path, item.isLikelyFile)"
      >
        <FileIcon
          v-if="item.isLikelyFile"
          :size="16"
          class="pinned-panel__icon"
          :style="{ color: item.color, stroke: item.color }"
        />
        <FolderIcon
          v-else
          :size="16"
          class="pinned-panel__icon"
          :style="{ color: item.color, stroke: item.color }"
        />
        <span class="pinned-panel__label">{{ item.name }}</span>
      </button>

      <p
        v-if="pinnedItems.length === 0"
        class="pinned-panel__empty"
      >
        {{ t('pinnedSidebar.emptyHint') }}
      </p>
    </div>
  </nav>
</template>

<style scoped>
.pinned-panel {
  display: flex;
  min-width: 0;
  height: 100%;
  flex-direction: column;
}

.pinned-panel__scroll {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  padding: 0 6px 12px;
  gap: 2px;
  overflow-y: auto;
}

.pinned-panel__item {
  display: flex;
  width: 100%;
  min-height: 30px;
  align-items: center;
  padding: 0 8px;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
  color: hsl(var(--foreground) / 85%);
  cursor: pointer;
  font-size: 13px;
  gap: 10px;
  text-align: start;
  transition: background-color 0.15s, border-color 0.15s;
}

.pinned-panel__item:hover {
  background-color: hsl(var(--foreground) / 6%);
}

.pinned-panel__item[data-active] {
  border-color: hsl(var(--foreground) / 12%);
  background-color: hsl(var(--foreground) / 10%);
  color: hsl(var(--foreground));
}

.pinned-panel__item:focus-visible {
  outline: 2px solid hsl(var(--ring) / 50%);
  outline-offset: 1px;
}

.pinned-panel__icon {
  flex-shrink: 0;
  filter: drop-shadow(0 0 4px currentColor);
}

.pinned-panel__label {
  overflow: hidden;
  min-width: 0;
  flex: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pinned-panel__heading {
  display: flex;
  align-items: center;
  padding: 12px 8px 4px;
  color: hsl(var(--muted-foreground));
  font-size: 11px;
  font-weight: 600;
  gap: 6px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.pinned-panel__heading-icon {
  color: hsl(var(--muted-foreground));
}

.pinned-panel__divider {
  height: 1px;
  margin: 6px 8px;
  background-color: hsl(var(--border) / 60%);
}

.pinned-panel__empty {
  padding: 8px;
  color: hsl(var(--muted-foreground));
  font-size: 11px;
  line-height: 1.4;
}
</style>
