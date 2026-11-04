// SPDX-License-Identifier: GPL-3.0-or-later
// License: GNU GPLv3 or later. See the license file in the project root for more information.
// Copyright © 2021 - present Aleksey Hoffman. All rights reserved.

import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import {
  DEFAULT_PERSONAL_THEME_ID,
  ICON_COLOR_KEYS,
  PERSONAL_THEMES,
  THEME_COLOR_KEYS,
  buildPersonalThemeCss,
  findPersonalTheme,
  isHexColor,
  type IconColorKey,
  type ThemeColorKey,
} from '@/modules/themes/personal-themes';

type ColorOverrides = Partial<Record<ThemeColorKey, string>>;
type IconOverrides = Partial<Record<IconColorKey, string>>;

const STORAGE_KEY = 'sigma-personal-appearance-v2';
const LEGACY_STORAGE_KEY = 'sigma-personal-appearance';
const STYLE_ELEMENT_ID = 'sigma-personal-theme';
const FALLBACK_COLOR = '#888888';

function sanitizeColors<Key extends string>(value: unknown, keys: readonly Key[]): Partial<Record<Key, string>> {
  const result: Partial<Record<Key, string>> = {};

  if (!value || typeof value !== 'object') {
    return result;
  }

  for (const key of keys) {
    const color = (value as Record<string, unknown>)[key];

    if (isHexColor(color)) {
      result[key] = color;
    }
  }

  return result;
}

function isKnownThemeId(id: unknown): id is string {
  return id === DEFAULT_PERSONAL_THEME_ID || PERSONAL_THEMES.some(theme => theme.id === id);
}

export const usePersonalAppearanceStore = defineStore('personalAppearance', () => {
  const themeId = ref<string>(DEFAULT_PERSONAL_THEME_ID);
  const colorOverrides = ref<ColorOverrides>({});
  const iconOverrides = ref<IconOverrides>({});
  let isInitialized = false;

  const hasCustomizations = computed(() => (
    Object.keys(colorOverrides.value).length > 0 || Object.keys(iconOverrides.value).length > 0
  ));

  function load() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);

      if (raw) {
        const parsed = JSON.parse(raw) as { themeId?: unknown; colorOverrides?: unknown; iconOverrides?: unknown };
        themeId.value = isKnownThemeId(parsed.themeId) ? parsed.themeId : DEFAULT_PERSONAL_THEME_ID;
        colorOverrides.value = sanitizeColors(parsed.colorOverrides, THEME_COLOR_KEYS);
        iconOverrides.value = sanitizeColors(parsed.iconOverrides, ICON_COLOR_KEYS);
        return;
      }

      const legacyRaw = window.localStorage.getItem(LEGACY_STORAGE_KEY);

      if (legacyRaw) {
        const legacy = JSON.parse(legacyRaw) as { customAccent?: unknown };

        if (isHexColor(legacy.customAccent)) {
          colorOverrides.value = { accent: legacy.customAccent };
        }
      }
    }
    catch (error) {
      console.warn('Failed to load personal appearance:', error);
    }
  }

  function save() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        themeId: themeId.value,
        colorOverrides: colorOverrides.value,
        iconOverrides: iconOverrides.value,
      }));
    }
    catch (error) {
      console.warn('Failed to save personal appearance:', error);
    }
  }

  function apply() {
    if (typeof document === 'undefined') {
      return;
    }

    let styleElement = document.getElementById(STYLE_ELEMENT_ID) as HTMLStyleElement | null;

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = STYLE_ELEMENT_ID;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = buildPersonalThemeCss(themeId.value, colorOverrides.value, iconOverrides.value);
  }

  function init() {
    if (isInitialized) {
      return;
    }

    isInitialized = true;
    load();
    apply();

    watch([themeId, colorOverrides, iconOverrides], () => {
      save();
      apply();
    }, { deep: true });
  }

  function setTheme(id: string) {
    if (!isKnownThemeId(id)) {
      return;
    }

    themeId.value = id;
    colorOverrides.value = {};
    iconOverrides.value = {};
  }

  function setColor(key: ThemeColorKey, hex: string | null) {
    const next = Object.fromEntries(Object.entries(colorOverrides.value).filter(([existingKey]) => existingKey !== key)) as ColorOverrides;

    if (isHexColor(hex)) {
      next[key] = hex;
    }

    colorOverrides.value = next;
  }

  function setIconColor(key: IconColorKey, hex: string | null) {
    const next = Object.fromEntries(Object.entries(iconOverrides.value).filter(([existingKey]) => existingKey !== key)) as IconOverrides;

    if (isHexColor(hex)) {
      next[key] = hex;
    }

    iconOverrides.value = next;
  }

  function resetCustomizations() {
    colorOverrides.value = {};
    iconOverrides.value = {};
  }

  function getEffectiveColor(key: ThemeColorKey): string {
    return colorOverrides.value[key] ?? findPersonalTheme(themeId.value)?.colors[key] ?? FALLBACK_COLOR;
  }

  function getEffectiveIconColor(key: IconColorKey): string {
    return iconOverrides.value[key] ?? findPersonalTheme(themeId.value)?.icons[key] ?? FALLBACK_COLOR;
  }

  return {
    themeId,
    colorOverrides,
    iconOverrides,
    hasCustomizations,
    init,
    setTheme,
    setColor,
    setIconColor,
    resetCustomizations,
    getEffectiveColor,
    getEffectiveIconColor,
  };
});
