<!-- SPDX-License-Identifier: GPL-3.0-or-later
License: GNU GPLv3 or later. See the license file in the project root for more information.
Copyright © 2021 - present Aleksey Hoffman. All rights reserved.
-->

<script setup lang="ts">
import { BaseCombobox } from '@/components/base';
import { SettingsItem } from '@/modules/settings';
import {
  getAvailableThemeOptions,
  normalizeThemeSelection,
} from '@/modules/themes/registry';
import {
  DEFAULT_PERSONAL_THEME_ID,
  ICON_COLOR_KEYS,
  PERSONAL_THEMES,
  THEME_COLOR_KEYS,
  getThemePreviewSwatches,
  type IconColorKey,
  type ThemeColorKey,
} from '@/modules/themes/personal-themes';
import { useExtensionsStorageStore } from '@/stores/storage/extensions';
import { useUserSettingsStore } from '@/stores/storage/user-settings';
import { usePersonalAppearanceStore } from '@/stores/runtime/personal-appearance';
import type { Theme } from '@/types/user-settings';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import { SunMoonIcon } from '@lucide/vue';
import type { ComboboxHighlightPayload } from '@/components/base/combobox-utils';

type ThemeSelectOption = {
  name: string;
  value: Theme;
  source: 'builtin' | 'extension';
};

type ThemeSelectOptionGroup = {
  heading?: string;
  options: ThemeSelectOption[];
};

const DEFAULT_SWATCHES = ['#1f2329', '#2a2f37', '#5d7681', '#8b98a5', '#c9d1d9'];

const extensionsStorageStore = useExtensionsStorageStore();
const userSettingsStore = useUserSettingsStore();
const appearance = usePersonalAppearanceStore();
const { t } = useI18n();

appearance.init();

const availableThemeOptions = computed(() => {
  return getAvailableThemeOptions(extensionsStorageStore.extensionsData.installedExtensions);
});

const builtinThemeOptions = computed<ThemeSelectOption[]>(() => {
  return availableThemeOptions.value.flatMap((option) => {
    if (option.source === 'builtin') {
      return [{
        name: option.builtinThemeId === 'dark'
          ? t('settings.homeBannerEffects.theme.themeTypeRadio.dark')
          : option.builtinThemeId === 'light'
            ? t('settings.homeBannerEffects.theme.themeTypeRadio.light')
            : t('system'),
        value: option.id,
        source: option.source,
      }];
    }

    return [];
  });
});

const extensionThemeOptions = computed<ThemeSelectOption[]>(() => {
  return availableThemeOptions.value.flatMap((option) => {
    if (option.source === 'builtin') {
      return [];
    }

    return [{
      name: option.title,
      value: option.id,
      source: option.source,
    }];
  });
});

const themeOptions = computed<ThemeSelectOption[]>(() => [
  ...builtinThemeOptions.value,
  ...extensionThemeOptions.value,
]);

const themeOptionGroups = computed<ThemeSelectOptionGroup[]>(() => {
  const groups: ThemeSelectOptionGroup[] = [{ options: builtinThemeOptions.value }];

  if (extensionThemeOptions.value.length > 0) {
    groups.push({
      heading: t('settings.homeBannerEffects.theme.extensionThemes'),
      options: extensionThemeOptions.value,
    });
  }

  return groups;
});

const selectedThemeId = computed(() => {
  return normalizeThemeSelection(
    userSettingsStore.userSettings.theme,
    extensionsStorageStore.extensionsData.installedExtensions,
  );
});

const selectedTheme = computed({
  get: () => {
    return themeOptions.value.find(option => option.value === selectedThemeId.value)
      ?? themeOptions.value[0];
  },
  set: (option) => {
    if (option) {
      userSettingsStore.set('theme', option.value);
    }
  },
});

function setThemeTransitionOrigin(element: HTMLElement) {
  const { left, top, width, height } = element.getBoundingClientRect();

  userSettingsStore.setThemeTransitionOrigin({
    x: left + width / 2,
    y: top + height / 2,
  });
}

function onThemeComboboxKeyboardHighlight(payload: ComboboxHighlightPayload) {
  if (payload?.ref) {
    setThemeTransitionOrigin(payload.ref);
  }
}

function onThemeComboboxSelect(payload: { ref: HTMLElement }) {
  setThemeTransitionOrigin(payload.ref);
}

function readColor(event: Event): string | null {
  const target = event.target as HTMLInputElement | null;
  return target?.value ?? null;
}

function onColorInput(key: ThemeColorKey, event: Event) {
  appearance.setColor(key, readColor(event));
}

function onIconColorInput(key: IconColorKey, event: Event) {
  appearance.setIconColor(key, readColor(event));
}
</script>

<template>
  <SettingsItem
    :title="t('settings.homeBannerEffects.theme.title')"
    :icon="SunMoonIcon"
  >
    <BaseCombobox
      v-model="selectedTheme"
      :options="themeOptions"
      :option-groups="themeOptionGroups"
      by="value"
      :search-placeholder="t('search')"
      :empty-text="t('noData')"
      :select-on-highlight="true"
      :close-on-select="false"
      @keyboard-highlight="onThemeComboboxKeyboardHighlight"
      @select="onThemeComboboxSelect"
    />
    <template #nested>
      <div class="personal-theme">
        <div class="personal-theme__heading">
          {{ t('personalTheme.presets') }}
        </div>
        <div class="personal-theme__grid">
          <button
            type="button"
            class="personal-theme__card"
            :data-active="appearance.themeId === DEFAULT_PERSONAL_THEME_ID || undefined"
            @click="appearance.setTheme(DEFAULT_PERSONAL_THEME_ID)"
          >
            <span class="personal-theme__strip">
              <span
                v-for="swatch in DEFAULT_SWATCHES"
                :key="swatch"
                :style="{ backgroundColor: swatch }"
              />
            </span>
            <span class="personal-theme__name">{{ t('personalTheme.default') }}</span>
            <span class="personal-theme__mood">{{ t('personalTheme.defaultMood') }}</span>
          </button>
          <button
            v-for="theme in PERSONAL_THEMES"
            :key="theme.id"
            type="button"
            class="personal-theme__card"
            :data-active="appearance.themeId === theme.id || undefined"
            @click="appearance.setTheme(theme.id)"
          >
            <span class="personal-theme__strip">
              <span
                v-for="(swatch, index) in getThemePreviewSwatches(theme)"
                :key="index"
                :style="{ backgroundColor: swatch }"
              />
            </span>
            <span class="personal-theme__name">
              {{ theme.name }}
              <span class="personal-theme__mode">{{ t(`personalTheme.${theme.mode}`) }}</span>
            </span>
            <span class="personal-theme__mood">{{ theme.mood }}</span>
          </button>
        </div>

        <div class="personal-theme__heading">
          {{ t('personalTheme.customize') }}
        </div>
        <div class="personal-theme__pickers">
          <label
            v-for="key in THEME_COLOR_KEYS"
            :key="key"
            class="personal-theme__picker"
          >
            <input
              type="color"
              :value="appearance.getEffectiveColor(key)"
              @input="onColorInput(key, $event)"
            >
            <span>{{ t(`personalTheme.colors.${key}`) }}</span>
            <button
              v-if="appearance.colorOverrides[key]"
              type="button"
              class="personal-theme__reset"
              @click.prevent="appearance.setColor(key, null)"
            >
              {{ t('personalTheme.reset') }}
            </button>
          </label>
        </div>

        <div class="personal-theme__heading">
          {{ t('personalTheme.iconColors') }}
        </div>
        <div class="personal-theme__pickers">
          <label
            v-for="key in ICON_COLOR_KEYS"
            :key="key"
            class="personal-theme__picker"
          >
            <input
              type="color"
              :value="appearance.getEffectiveIconColor(key)"
              @input="onIconColorInput(key, $event)"
            >
            <span>{{ t(`personalTheme.icons.${key}`) }}</span>
            <button
              v-if="appearance.iconOverrides[key]"
              type="button"
              class="personal-theme__reset"
              @click.prevent="appearance.setIconColor(key, null)"
            >
              {{ t('personalTheme.reset') }}
            </button>
          </label>
        </div>

        <button
          type="button"
          class="personal-theme__reset-all"
          :disabled="!appearance.hasCustomizations"
          @click="appearance.resetCustomizations()"
        >
          {{ t('personalTheme.resetAll') }}
        </button>
      </div>
    </template>
  </SettingsItem>
</template>

<style scoped>
.personal-theme {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 10px;
}

.personal-theme__heading {
  margin-top: 6px;
  color: hsl(var(--foreground));
  font-size: 0.875rem;
  font-weight: 600;
}

.personal-theme__grid {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
}

.personal-theme__card {
  display: flex;
  flex-direction: column;
  padding: 8px;
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-sm);
  background-color: transparent;
  color: hsl(var(--foreground));
  cursor: pointer;
  gap: 6px;
  text-align: start;
  transition: background-color 0.15s, border-color 0.15s;
}

.personal-theme__card:hover {
  background-color: hsl(var(--foreground) / 5%);
}

.personal-theme__card[data-active] {
  border-color: hsl(var(--foreground) / 55%);
  background-color: hsl(var(--foreground) / 8%);
}

.personal-theme__strip {
  display: flex;
  overflow: hidden;
  height: 22px;
  border: 1px solid hsl(var(--foreground) / 12%);
  border-radius: 4px;
}

.personal-theme__strip > span {
  flex: 1;
}

.personal-theme__name {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.8125rem;
  font-weight: 600;
  gap: 6px;
}

.personal-theme__mode {
  padding: 1px 6px;
  border-radius: 999px;
  background-color: hsl(var(--foreground) / 10%);
  color: hsl(var(--muted-foreground));
  font-size: 0.6875rem;
  font-weight: 500;
}

.personal-theme__mood {
  color: hsl(var(--muted-foreground));
  font-size: 0.75rem;
  line-height: 1.3;
}

.personal-theme__pickers {
  display: grid;
  gap: 6px;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
}

.personal-theme__picker {
  display: flex;
  align-items: center;
  padding: 4px 6px;
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-sm);
  color: hsl(var(--foreground));
  font-size: 0.8125rem;
  gap: 8px;
}

.personal-theme__picker input {
  width: 32px;
  height: 24px;
  flex-shrink: 0;
  padding: 0;
  border: 1px solid hsl(var(--border));
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
}

.personal-theme__picker > span {
  min-width: 0;
  flex: 1;
}

.personal-theme__reset,
.personal-theme__reset-all {
  padding: 2px 8px;
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-sm);
  background: transparent;
  color: hsl(var(--foreground));
  cursor: pointer;
  font-size: 0.75rem;
}

.personal-theme__reset-all {
  align-self: flex-start;
  padding: 6px 12px;
  font-size: 0.8125rem;
}

.personal-theme__reset-all:disabled {
  cursor: default;
  opacity: 0.4;
}
</style>
