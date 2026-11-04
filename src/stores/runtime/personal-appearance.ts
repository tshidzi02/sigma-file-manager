// SPDX-License-Identifier: GPL-3.0-or-later
// License: GNU GPLv3 or later. See the license file in the project root for more information.
// Copyright © 2021 - present Aleksey Hoffman. All rights reserved.

import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import {
  DEFAULT_PERSONAL_THEME_ID,
  PERSONAL_THEME_PRESETS,
  buildPersonalThemeCss,
  isHexColor,
} from '@/modules/themes/personal-themes';

const STORAGE_KEY = 'sigma-personal-appearance';
const STYLE_ELEMENT_ID = 'sigma-personal-theme';

export const usePersonalAppearanceStore = defineStore('personalAppearance', () => {
  const presetId = ref<string>(DEFAULT_PERSONAL_THEME_ID);
  const customAccent = ref<string | null>(null);
  let isInitialized = false;

  function load() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as { presetId?: unknown; customAccent?: unknown };
      const storedPresetId = parsed.presetId;

      if (typeof storedPresetId === 'string' && PERSONAL_THEME_PRESETS.some(preset => preset.id === storedPresetId)) {
        presetId.value = storedPresetId;
      }

      customAccent.value = isHexColor(parsed.customAccent) ? parsed.customAccent : null;
    }
    catch (error) {
      console.warn('Failed to load personal appearance:', error);
    }
  }

  function save() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        presetId: presetId.value,
        customAccent: customAccent.value,
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

    styleElement.textContent = buildPersonalThemeCss(presetId.value, customAccent.value);
  }

  function init() {
    if (isInitialized) {
      return;
    }

    isInitialized = true;
    load();
    apply();

    watch([presetId, customAccent], () => {
      save();
      apply();
    });
  }

  function setPreset(id: string) {
    presetId.value = id;
    customAccent.value = null;
  }

  function setCustomAccent(hex: string | null) {
    customAccent.value = isHexColor(hex) ? hex : null;
  }

  return {
    presetId,
    customAccent,
    init,
    setPreset,
    setCustomAccent,
  };
});
