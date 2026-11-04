// SPDX-License-Identifier: GPL-3.0-or-later
// License: GNU GPLv3 or later. See the license file in the project root for more information.
// Copyright © 2021 - present Aleksey Hoffman. All rights reserved.

export type ThemeMode = 'light' | 'dark';
export type ThemeColorKey = 'accent' | 'background' | 'surface' | 'raised' | 'text' | 'mutedText' | 'border';
export type IconColorKey = 'folder' | 'document' | 'image' | 'audio' | 'video' | 'archive' | 'code' | 'app';

export type PersonalTheme = {
  id: string;
  name: string;
  mood: string;
  mode: ThemeMode;
  colors: Record<ThemeColorKey, string>;
  icons: Record<IconColorKey, string>;
};

export const DEFAULT_PERSONAL_THEME_ID = 'default';
export const THEME_COLOR_KEYS: readonly ThemeColorKey[] = ['accent', 'background', 'surface', 'raised', 'text', 'mutedText', 'border'];
export const ICON_COLOR_KEYS: readonly IconColorKey[] = ['folder', 'document', 'image', 'audio', 'video', 'archive', 'code', 'app'];

export const PERSONAL_THEMES: readonly PersonalTheme[] = [
  {
    id: 'cherry-blossom', name: 'Cherry Blossom Picnic', mood: 'Pink blossoms, picnic blankets, spring meadows', mode: 'light',
    colors: { accent: '#d24f86', background: '#fdebe7', surface: '#f8dcd6', raised: '#f1cdc6', text: '#45262d', mutedText: '#87646b', border: '#e7bdb4' },
    icons: { folder: '#6f9f5c', document: '#d77aa3', image: '#e0609a', audio: '#5f8f4e', video: '#c2477d', archive: '#9fb46f', code: '#6e9e5b', app: '#b46a93' },
  },
  {
    id: 'lily-pond', name: 'Lily Pond', mood: 'Dark green water, beige light, rosy lotus', mode: 'dark',
    colors: { accent: '#d3968c', background: '#061d15', surface: '#0a3323', raised: '#114330', text: '#f7f4d5', mutedText: '#b3c29d', border: '#1d5a43' },
    icons: { folder: '#a3b86f', document: '#f7f4d5', image: '#e3a79d', audio: '#d3968c', video: '#e8b4aa', archive: '#839958', code: '#6fb3a8', app: '#c9d6a0' },
  },
  {
    id: 'midnight-lotus', name: 'Midnight Lotus', mood: 'Deep teal night with warm petals', mode: 'dark',
    colors: { accent: '#e3a093', background: '#051d24', surface: '#0a3038', raised: '#105666', text: '#f4efd9', mutedText: '#a6c4c4', border: '#1a6878' },
    icons: { folder: '#e3a093', document: '#f4efd9', image: '#f0b9ae', audio: '#a9bf7c', video: '#e3a093', archive: '#839958', code: '#7fd0d9', app: '#c6d9a8' },
  },
  {
    id: 'clinic-pop', name: 'Clinic Pop', mood: 'Cream dashboard with candy pink and sunny yellow', mode: 'light',
    colors: { accent: '#e27fb8', background: '#faf4e6', surface: '#f2e9d3', raised: '#eadfc3', text: '#161616', mutedText: '#6b6457', border: '#ddd0b0' },
    icons: { folder: '#e0b324', document: '#d76aa6', image: '#7f91d6', audio: '#7d9450', video: '#d76aa6', archive: '#e0b324', code: '#7f91d6', app: '#7d9450' },
  },
  {
    id: 'pastel-organizer', name: 'Pastel Organizer', mood: 'Peach desk with lavender, rose and mint folders', mode: 'light',
    colors: { accent: '#9d74c9', background: '#fce6db', surface: '#f6d6c8', raised: '#efc8b7', text: '#2b2233', mutedText: '#6f5f6f', border: '#e5b9a7' },
    icons: { folder: '#e87a9a', document: '#7c9bd0', image: '#e8a94a', audio: '#9d74c9', video: '#e87a9a', archive: '#7fb48e', code: '#7c9bd0', app: '#e0705e' },
  },
  {
    id: 'sticker-riot', name: 'Sticker Riot', mood: 'Neo-brutal stickers, loud and playful', mode: 'dark',
    colors: { accent: '#ff4fa3', background: '#12111c', surface: '#1c1a2b', raised: '#26233d', text: '#fff6e8', mutedText: '#b9b2cc', border: '#3a3560' },
    icons: { folder: '#ffd23f', document: '#3ec1f3', image: '#ff4fa3', audio: '#a07cff', video: '#ff6b35', archive: '#2ec4b6', code: '#3ec1f3', app: '#ffd23f' },
  },
  {
    id: 'sage-planner', name: 'Sage Planner', mood: 'Calm sage, linen and dusty rose', mode: 'light',
    colors: { accent: '#5f7d50', background: '#f4f1e7', surface: '#eae6d7', raised: '#dfdac7', text: '#2e382b', mutedText: '#6c7462', border: '#d1cbb3' },
    icons: { folder: '#8f9e72', document: '#c06f74', image: '#cf918a', audio: '#5f7d50', video: '#a8707f', archive: '#b89d6c', code: '#6f8f80', app: '#4c6a47' },
  },
  {
    id: 'dragonfly-wing', name: 'Dragonfly Wing', mood: 'Iridescent lavender fading into fresh green', mode: 'dark',
    colors: { accent: '#9693d6', background: '#17141f', surface: '#211c2e', raised: '#2c263f', text: '#eeeaf7', mutedText: '#b3aecb', border: '#3d3657' },
    icons: { folder: '#9693d6', document: '#a3b8d8', image: '#b49bd0', audio: '#8f89cf', video: '#c3a4e0', archive: '#b5d4c1', code: '#aec891', app: '#a3b8d8' },
  },
  {
    id: 'pixel-meadow', name: 'Pixel Meadow', mood: 'Retro 16-bit sky, grass and a ginger cat', mode: 'light',
    colors: { accent: '#e5761a', background: '#e8f4fc', surface: '#d6ebf8', raised: '#c4e1f3', text: '#1c2a38', mutedText: '#4d6375', border: '#a6cbe4' },
    icons: { folder: '#e0a91e', document: '#3f8fd6', image: '#4fa046', audio: '#d94a66', video: '#e5761a', archive: '#9a643c', code: '#3f8fd6', app: '#4fa046' },
  },
  {
    id: 'gothic-garden', name: 'Gothic Garden', mood: 'Black lace, oxblood, olive and old gold', mode: 'dark',
    colors: { accent: '#c9a25a', background: '#0d0c0b', surface: '#161412', raised: '#201d19', text: '#e8e0cf', mutedText: '#a59c89', border: '#34302a' },
    icons: { folder: '#b5503f', document: '#c9a25a', image: '#8e9b62', audio: '#b5503f', video: '#a3425a', archive: '#c9a25a', code: '#8e9b62', app: '#d8c9a8' },
  },
  {
    id: 'neutral-linen', name: 'Neutral Linen', mood: 'Warm greige, terracotta rose and clay', mode: 'light',
    colors: { accent: '#a86b5f', background: '#f3efeb', surface: '#e9e3dc', raised: '#dfd7ce', text: '#3a322c', mutedText: '#776c63', border: '#d1c6bb' },
    icons: { folder: '#b98f7f', document: '#8a9784', image: '#c98f87', audio: '#8c7b6b', video: '#a86b5f', archive: '#b5a283', code: '#7f8d9a', app: '#6b675b' },
  },
  {
    id: 'fern-night', name: 'Fern Night', mood: 'Leafy dark dashboard with lime highlights', mode: 'dark',
    colors: { accent: '#9bcb6a', background: '#0e1811', surface: '#152419', raised: '#1d3123', text: '#eaf3e6', mutedText: '#a8bea7', border: '#2c4731' },
    icons: { folder: '#9bcb6a', document: '#d6e8c9', image: '#6fbf9a', audio: '#c8d77a', video: '#e0a96b', archive: '#8fae6c', code: '#6fbf9a', app: '#c8d77a' },
  },
];

const COLOR_VARIABLES: Record<ThemeColorKey, readonly string[]> = {
  accent: ['--primary', '--ring'],
  background: ['--background'],
  surface: ['--background-2', '--card', '--muted'],
  raised: ['--background-3', '--popover', '--secondary', '--accent'],
  text: ['--foreground', '--card-foreground', '--popover-foreground', '--secondary-foreground', '--accent-foreground'],
  mutedText: ['--muted-foreground', '--icon', '--sigma-icon-other'],
  border: ['--border', '--input'],
};

const ICON_VARIABLES: Record<IconColorKey, readonly string[]> = {
  folder: ['--sigma-icon-folder'],
  document: ['--sigma-icon-document', '--sigma-icon-ebook'],
  image: ['--sigma-icon-image'],
  audio: ['--sigma-icon-audio'],
  video: ['--sigma-icon-video', '--sigma-icon-presentation'],
  archive: ['--sigma-icon-archive'],
  code: ['--sigma-icon-code', '--sigma-icon-spreadsheet'],
  app: ['--sigma-icon-application'],
};

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

export function findPersonalTheme(id: string): PersonalTheme | null {
  return PERSONAL_THEMES.find(theme => theme.id === id) ?? null;
}

export function getThemePreviewSwatches(theme: PersonalTheme): string[] {
  return [theme.colors.background, theme.colors.surface, theme.colors.accent, theme.icons.folder, theme.icons.image];
}

function pickHexColors<Key extends string>(values: Partial<Record<Key, string>>): Partial<Record<Key, string>> {
  return Object.fromEntries(
    Object.entries(values).filter(([, color]) => isHexColor(color)),
  ) as Partial<Record<Key, string>>;
}

export function buildPersonalThemeCss(
  themeId: string,
  colorOverrides: Partial<Record<ThemeColorKey, string>>,
  iconOverrides: Partial<Record<IconColorKey, string>>,
): string {
  const theme = findPersonalTheme(themeId);
  const colors: Partial<Record<ThemeColorKey, string>> = { ...(theme?.colors ?? {}), ...pickHexColors(colorOverrides) };
  const icons: Partial<Record<IconColorKey, string>> = { ...(theme?.icons ?? {}), ...pickHexColors(iconOverrides) };
  const declarations: string[] = [];

  for (const key of THEME_COLOR_KEYS) {
    const hex = colors[key];

    if (isHexColor(hex)) {
      const hsl = hexToHslTriplet(hex);
      COLOR_VARIABLES[key].forEach(variable => declarations.push(`${variable}: ${hsl} !important;`));
    }
  }

  if (isHexColor(colors.accent)) {
    declarations.push(`--primary-foreground: ${getReadableForeground(colors.accent)} !important;`);
  }

  for (const key of ICON_COLOR_KEYS) {
    const hex = icons[key];

    if (isHexColor(hex)) {
      const hsl = hexToHslTriplet(hex);
      ICON_VARIABLES[key].forEach(variable => declarations.push(`${variable}: ${hsl} !important;`));
    }
  }

  if (theme) {
    declarations.push(`color-scheme: ${theme.mode} !important;`);
  }

  return declarations.length > 0 ? `:root {\n  ${declarations.join('\n  ')}\n}` : '';
}
