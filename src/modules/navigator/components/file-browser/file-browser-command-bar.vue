<!-- SPDX-License-Identifier: GPL-3.0-or-later
License: GNU GPLv3 or later. See the license file in the project root for more information.
Copyright © 2021 - present Aleksey Hoffman. All rights reserved.
-->

<script setup lang="ts">
import { computed, ref, toRef, type Component } from 'vue';
import { useI18n } from 'vue-i18n';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ContextMenuShortcut } from '@/components/ui/context-menu';
import {
  AppWindowIcon,
  ChevronDownIcon,
  ClipboardPasteIcon,
  CopyIcon,
  FilePlusIcon,
  FolderPlusIcon,
  InfoIcon,
  PencilIcon,
  PlusIcon,
  ScissorsIcon,
  Share2Icon,
  Trash2Icon,
} from '@lucide/vue';
import { useClipboardStore } from '@/stores/runtime/clipboard';
import { useShortcutsStore } from '@/stores/runtime/shortcuts';
import type { DirEntry } from '@/types/dir-entry';
import type { ContextMenuAction } from './types';
import { useContextMenuItems } from './composables/use-context-menu-items';

type ShortcutName = Parameters<ReturnType<typeof useShortcutsStore>['getShortcutLabel']>[0];
type CommandTone = 'purple' | 'blue' | 'cyan' | 'pink';

type CommandBarButton = {
  action: ContextMenuAction;
  icon: Component;
  labelKey: string;
  shortcut?: ShortcutName;
  tone: CommandTone;
};

const props = defineProps<{
  selectedEntries: DirEntry[];
  currentPath: string;
}>();

const emit = defineEmits<{
  (event: 'action', action: ContextMenuAction): void;
  (event: 'paste'): void;
  (event: 'createNewDirectory'): void;
  (event: 'createNewFile'): void;
}>();

const { t } = useI18n();
const clipboardStore = useClipboardStore();
const shortcutsStore = useShortcutsStore();

const { isActionVisible } = useContextMenuItems(
  toRef(props, 'selectedEntries'),
  { disableDestructiveActions: ref(false) },
);

const canPaste = computed(() => (
  !!props.currentPath
  && clipboardStore.hasItems
  && clipboardStore.canPasteTo(props.currentPath)
));

const clipboardButtons: CommandBarButton[] = [
  {
    action: 'cut',
    icon: ScissorsIcon,
    labelKey: 'fileBrowser.commandBar.cut',
    shortcut: 'cut' as ShortcutName,
    tone: 'purple',
  },
  {
    action: 'copy',
    icon: CopyIcon,
    labelKey: 'fileBrowser.actions.copy',
    shortcut: 'copy' as ShortcutName,
    tone: 'purple',
  },
];

const editButtons: CommandBarButton[] = [
  {
    action: 'rename',
    icon: PencilIcon,
    labelKey: 'fileBrowser.actions.rename',
    shortcut: 'rename' as ShortcutName,
    tone: 'blue',
  },
  {
    action: 'share',
    icon: Share2Icon,
    labelKey: 'fileBrowser.actions.share',
    tone: 'cyan',
  },
  {
    action: 'delete',
    icon: Trash2Icon,
    labelKey: 'fileBrowser.commandBar.delete',
    shortcut: 'delete' as ShortcutName,
    tone: 'pink',
  },
];

const openButtons: CommandBarButton[] = [
  {
    action: 'open-with',
    icon: AppWindowIcon,
    labelKey: 'fileBrowser.commandBar.openWith',
    tone: 'blue',
  },
  {
    action: 'properties',
    icon: InfoIcon,
    labelKey: 'fileBrowser.actions.properties',
    shortcut: 'properties' as ShortcutName,
    tone: 'cyan',
  },
];

function getShortcut(button: CommandBarButton): string {
  return button.shortcut ? shortcutsStore.getShortcutLabel(button.shortcut) : '';
}

function isEnabled(button: CommandBarButton): boolean {
  return props.selectedEntries.length > 0 && isActionVisible(button.action);
}

function runAction(button: CommandBarButton) {
  if (!isEnabled(button)) {
    return;
  }

  emit('action', button.action);
}
</script>

<template>
  <div class="file-browser-command-bar">
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button
          variant="ghost"
          size="sm"
          class="file-browser-command-bar__new-button file-browser-command-bar__button--purple"
        >
          <PlusIcon :size="16" />
          <span>{{ t('fileBrowser.commandBar.new') }}</span>
          <ChevronDownIcon
            :size="12"
            class="file-browser-command-bar__chevron"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="bottom"
        class="file-browser-command-bar__dropdown"
      >
        <DropdownMenuItem
          class="file-browser-command-bar__menu-item"
          @click="emit('createNewDirectory')"
        >
          <FolderPlusIcon :size="14" />
          <span>{{ t('navigator.newDirectory') }}</span>
          <ContextMenuShortcut>
            {{ shortcutsStore.getShortcutLabel('createNewDirectory') }}
          </ContextMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem
          class="file-browser-command-bar__menu-item"
          @click="emit('createNewFile')"
        >
          <FilePlusIcon :size="14" />
          <span>{{ t('navigator.newFile') }}</span>
          <ContextMenuShortcut>
            {{ shortcutsStore.getShortcutLabel('createNewFile') }}
          </ContextMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <div class="file-browser-command-bar__separator" />

    <Tooltip
      v-for="button in clipboardButtons"
      :key="button.action"
    >
      <TooltipTrigger as-child>
        <Button
          variant="ghost"
          size="icon"
          class="file-browser-command-bar__button"
          :class="`file-browser-command-bar__button--${button.tone}`"
          :disabled="!isEnabled(button)"
          :aria-label="t(button.labelKey)"
          @click="runAction(button)"
        >
          <component
            :is="button.icon"
            :size="16"
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <div class="file-browser-command-bar__tooltip-row">
          {{ t(button.labelKey) }}
          <ContextMenuShortcut v-if="getShortcut(button)">
            {{ getShortcut(button) }}
          </ContextMenuShortcut>
        </div>
      </TooltipContent>
    </Tooltip>

    <Tooltip>
      <TooltipTrigger as-child>
        <Button
          variant="ghost"
          size="icon"
          class="file-browser-command-bar__button file-browser-command-bar__button--purple"
          :disabled="!canPaste"
          :aria-label="t('fileBrowser.commandBar.paste')"
          @click="emit('paste')"
        >
          <ClipboardPasteIcon :size="16" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <div class="file-browser-command-bar__tooltip-row">
          {{ t('fileBrowser.commandBar.paste') }}
          <ContextMenuShortcut v-if="shortcutsStore.getShortcutLabel('paste')">
            {{ shortcutsStore.getShortcutLabel('paste') }}
          </ContextMenuShortcut>
        </div>
      </TooltipContent>
    </Tooltip>

    <div class="file-browser-command-bar__separator" />

    <Tooltip
      v-for="button in editButtons"
      :key="button.action"
    >
      <TooltipTrigger as-child>
        <Button
          variant="ghost"
          size="icon"
          class="file-browser-command-bar__button"
          :class="`file-browser-command-bar__button--${button.tone}`"
          :disabled="!isEnabled(button)"
          :aria-label="t(button.labelKey)"
          @click="runAction(button)"
        >
          <component
            :is="button.icon"
            :size="16"
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <div class="file-browser-command-bar__tooltip-row">
          {{ t(button.labelKey) }}
          <ContextMenuShortcut v-if="getShortcut(button)">
            {{ getShortcut(button) }}
          </ContextMenuShortcut>
        </div>
      </TooltipContent>
    </Tooltip>

    <div class="file-browser-command-bar__separator" />

    <Tooltip
      v-for="button in openButtons"
      :key="button.action"
    >
      <TooltipTrigger as-child>
        <Button
          variant="ghost"
          size="icon"
          class="file-browser-command-bar__button"
          :class="`file-browser-command-bar__button--${button.tone}`"
          :disabled="!isEnabled(button)"
          :aria-label="t(button.labelKey)"
          @click="runAction(button)"
        >
          <component
            :is="button.icon"
            :size="16"
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <div class="file-browser-command-bar__tooltip-row">
          {{ t(button.labelKey) }}
          <ContextMenuShortcut v-if="getShortcut(button)">
            {{ getShortcut(button) }}
          </ContextMenuShortcut>
        </div>
      </TooltipContent>
    </Tooltip>
  </div>
</template>

<style scoped>
.file-browser-command-bar {
  display: flex;
  height: 40px;
  flex-shrink: 0;
  align-items: center;
  padding: 0 8px;
  border-bottom: 1px solid hsl(var(--border));
  gap: 2px;
  overflow-x: auto;
}

.file-browser-command-bar__separator {
  width: 1px;
  height: 20px;
  flex-shrink: 0;
  margin: 0 6px;
  background-color: hsl(var(--border));
}

.file-browser-command-bar__button,
.file-browser-command-bar__new-button {
  --command-tone: var(--primary);

  flex-shrink: 0;
  color: hsl(var(--command-tone));
  transition: background-color 0.15s, color 0.15s, opacity 0.15s;
}

.file-browser-command-bar__button {
  width: 32px;
  height: 32px;
}

.file-browser-command-bar__new-button {
  height: 32px;
  padding: 0 10px;
  gap: 6px;
  color: hsl(var(--foreground));
}

.file-browser-command-bar__new-button :deep(svg:first-child) {
  color: hsl(var(--command-tone));
}

.file-browser-command-bar__chevron {
  opacity: 0.6;
}

.file-browser-command-bar__button--purple {
  --command-tone: var(--primary);
}

.file-browser-command-bar__button--blue {
  --command-tone: 217 91% 65%;
}

.file-browser-command-bar__button--cyan {
  --command-tone: 186 100% 55%;
}

.file-browser-command-bar__button--pink {
  --command-tone: 320 85% 68%;
}

.file-browser-command-bar__button:hover:not(:disabled),
.file-browser-command-bar__new-button:hover {
  background-color: hsl(var(--command-tone) / 15%);
}

.file-browser-command-bar__button:disabled {
  opacity: 0.3;
}

.file-browser-command-bar__dropdown {
  min-width: 200px;
}

.file-browser-command-bar__menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-browser-command-bar__tooltip-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
</style>
