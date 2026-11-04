// SPDX-License-Identifier: GPL-3.0-or-later
// License: GNU GPLv3 or later. See the license file in the project root for more information.
// Copyright © 2021 - present Aleksey Hoffman. All rights reserved.

export type PersonalThemeBackgrounds = {
  background: string;
  background2: string;
  background3: string;
  border: string;
};

export type PersonalThemePreset = {
  id: string;
  labelKey: string;
  accentHex: string | null;
  backgrounds: PersonalThemeBackgrounds | null;
};

export const DEFAULT_PERSONAL_THEME_ID = 'default';

const DEFAULT_PERSONAL_THEME: PersonalThemePreset = {
  id: DEFAULT_PERSONAL_THEME_ID,
  labelKey: 'personalTheme.default',
  accentHex: null,
  backgrounds: null,
};

export const PERSONAL_THEME_PRESETS: readonly PersonalThemePreset[] = [
  DEFAULT_PERSONAL_THEME,
  {
    id: 'amethyst',
    labelKey: 'personalTheme.amethyst',
    accentHex: '#a26bf2',
    backgrounds: { background: '265 30% 5%', background2: '265 26% 8%', background3: '265 22% 12%', border: '265 18% 20%' },
  },
  {
    id: 'ocean',
    labelKey: 'personalTheme.ocean',
    accentHex: '#2bb3f0',
    backgrounds: { background: '215 45% 5%', background2: '215 40% 8%', background3: '215 34% 12%', border: '215 28% 20%' },
  },
  {
    id: 'sunflower',
    labelKey: 'personalTheme.sunflower',
    accentHex: '#f7c531',
    backgrounds: { background: '35 18% 5%', background2: '35 16% 8%', background3: '35 14% 12%', border: '35 12% 20%' },
  },
  {
    id: 'forest',
    labelKey: 'personalTheme.forest',
    accentHex: '#2ab673',
    backgrounds: { background: '160 30% 4%', background2: '160 26% 7%', background3: '160 22% 11%', border: '160 18% 19%' },
  },
  {
    id: 'rose',
    labelKey: 'personalTheme.rose',
    accentHex: '#ef5b8f',
    backgrounds: { background: '340 22% 5%', background2: '340 20% 8%', background3: '340 18% 12%', border: '340 15% 20%' },
  },
  {
    id: 'graphite',
    labelKey: 'personalTheme.graphite',
    accentHex: '#c7c7c7',
    backgrounds: { background: '0 0% 5%', background2: '0 0% 8%', background3: '0 0% 12%', border: '0 0% 20%' },
  },
];

const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

export function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && HEX_COLOR_PATTERN.test(value);
}

function hexToRgb(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

export function hexToHslTriplet(hex: string): string {
  const [red, green, blue] = hexToRgb(hex).map(channel => channel / 255) as [number, number, number];
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  let hue = 0;
  let saturation = 0;

  if (max !== min) {
    const delta = max - min;
    saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    if (max === red) {
      hue = (green - blue) / delta + (green < blue ? 6 : 0);
    }
    else if (max === green) {
      hue = (blue - red) / delta + 2;
    }
    else {
      hue = (red - green) / delta + 4;
    }

    hue *= 60;
  }

  return `${Math.round(hue)} ${Math.round(saturation * 100)}% ${Math.round(lightness * 100)}%`;
}

export function getReadableForeground(hex: string): string {
  const [red, green, blue] = hexToRgb(hex);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
  return luminance > 0.6 ? '240 10% 6%' : '0 0% 100%';
}

export function findPersonalThemePreset(id: string): PersonalThemePreset {
  return PERSONAL_THEME_PRESETS.find(preset => preset.id === id) ?? DEFAULT_PERSONAL_THEME;
}

export function getPersonalThemeSwatch(preset: PersonalThemePreset): string {
  return preset.accentHex ?? 'hsl(var(--primary))';
}

export function buildPersonalThemeCss(presetId: string, customAccentHex: string | null): string {
  const preset = findPersonalThemePreset(presetId);
  const accentHex = isHexColor(customAccentHex) ? customAccentHex : preset.accentHex;
  const rules: string[] = [];

  if (accentHex) {
    const accent = hexToHslTriplet(accentHex);
    rules.push(
      `:root { --primary: ${accent} !important; --ring: ${accent} !important; `
      + `--primary-foreground: ${getReadableForeground(accentHex)} !important; }`,
    );
  }

  if (preset.backgrounds) {
    const backgrounds = preset.backgrounds;
    rules.push(
      `:root.dark { --background: ${backgrounds.background} !important; `
      + `--background-2: ${backgrounds.background2} !important; `
      + `--background-3: ${backgrounds.background3} !important; `
      + `--border: ${backgrounds.border} !important; }`,
    );
  }

  return rules.join('\n');
}
