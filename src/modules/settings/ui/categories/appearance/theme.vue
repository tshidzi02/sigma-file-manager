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
  PERSONAL_THEME_PRESETS,
  findPersonalThemePreset,
  getPersonalThemeSwatch,
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

const extensionsStorageStore = useExtensionsStorageStore();
const userSettingsStore = useUserSettingsStore();
const personalAppearanceStore = usePersonalAppearanceStore();
const { t } = useI18n();

personalAppearanceStore.init();

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
  const groups: ThemeSelectOptionGroup[] = [
    {
      options: builtinThemeOptions.value,
    },
  ];

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

const accentPickerValue = computed(() => {
  return personalAppearanceStore.customAccent
    ?? findPersonalThemePreset(personalAppearanceStore.presetId).accentHex
    ?? '#a26bf2';
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

function onAccentInput(event: Event) {
  const target = event.target as HTMLInputElement | null;

  if (target?.value) {
    personalAppearanceStore.setCustomAccent(target.value);
  }
}

function resetAccent() {
  personalAppearanceStore.setCustomAccent(null);
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
        <div class="personal-theme__label">
          {{ t('personalTheme.presets') }}
        </div>
        <div class="personal-theme__presets">
          <button
            v-for="preset in PERSONAL_THEME_PRESETS"
            :key="preset.id"
            type="button"
            class="personal-theme__preset"
            :data-active="(personalAppearanceStore.presetId === preset.id && !personalAppearanceStore.customAccent) || undefined"
            @click="personalAppearanceStore.setPreset(preset.id)"
          >
            <span
              class="personal-theme__swatch"
              :style="{ backgroundColor: getPersonalThemeSwatch(preset) }"
            />
            <span>{{ t(preset.labelKey) }}</span>
          </button>
        </div>

        <div class="personal-theme__row">
          <span class="personal-theme__label">{{ t('personalTheme.accent') }}</span>
          <div class="personal-theme__accent-controls">
            <input
              type="color"
              class="personal-theme__color-input"
              :value="accentPickerValue"
              :aria-label="t('personalTheme.accent')"
              @input="onAccentInput"
            >
            <button
              type="button"
              class="personal-theme__reset"
              :disabled="!personalAppearanceStore.customAccent"
              @click="resetAccent"
            >
              {{ t('personalTheme.resetAccent') }}
            </button>
          </div>
        </div>
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

.personal-theme__label {
  color: hsl(var(--foreground));
  font-size: 0.875rem;
}

.personal-theme__presets {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.personal-theme__preset {
  display: flex;
  align-items: center;
  padding: 6px 10px;
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-sm);
  background-color: transparent;
  color: hsl(var(--foreground));
  cursor: pointer;
  font-size: 0.8125rem;
  gap: 8px;
  transition: background-color 0.15s, border-color 0.15s;
}

.personal-theme__preset:hover {
  background-color: hsl(var(--foreground) / 6%);
}

.personal-theme__preset[data-active] {
  border-color: hsl(var(--foreground) / 40%);
  background-color: hsl(var(--foreground) / 10%);
}

.personal-theme__swatch {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  border: 1px solid hsl(var(--foreground) / 20%);
  border-radius: 50%;
}

.personal-theme__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.personal-theme__accent-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.personal-theme__color-input {
  width: 40px;
  height: 28px;
  padding: 0;
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-sm);
  background: transparent;
  cursor: pointer;
}

.personal-theme__reset {
  padding: 4px 10px;
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-sm);
  background: transparent;
  color: hsl(var(--foreground));
  cursor: pointer;
  font-size: 0.8125rem;
}

.personal-theme__reset:disabled {
  cursor: default;
  opacity: 0.4;
}
</style>
