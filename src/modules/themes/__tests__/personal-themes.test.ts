// SPDX-License-Identifier: GPL-3.0-or-later
// License: GNU GPLv3 or later. See the license file in the project root for more information.
// Copyright © 2021 - present Aleksey Hoffman. All rights reserved.

import { describe, expect, it } from 'vitest';
import {
  ICON_COLOR_KEYS,
  PERSONAL_THEMES,
  THEME_COLOR_KEYS,
  buildPersonalThemeCss,
  hexToHslTriplet,
  isHexColor,
} from '@/modules/themes/personal-themes';

describe('personal themes', () => {
  it('has at least 10 themes with unique ids and valid colours', () => {
    expect(PERSONAL_THEMES.length).toBeGreaterThanOrEqual(10);
    expect(new Set(PERSONAL_THEMES.map(theme => theme.id)).size).toBe(PERSONAL_THEMES.length);

    for (const theme of PERSONAL_THEMES) {
      THEME_COLOR_KEYS.forEach(key => expect(isHexColor(theme.colors[key])).toBe(true));
      ICON_COLOR_KEYS.forEach(key => expect(isHexColor(theme.icons[key])).toBe(true));
    }
  });

  it('converts hex to an HSL triplet', () => {
    expect(hexToHslTriplet('#ff0000')).toBe('0 100% 50%');
  });

  it('builds CSS for a theme and applies overrides', () => {
    const css = buildPersonalThemeCss('lily-pond', { accent: '#ff0000' }, {});
    expect(css).toContain('--primary: 0 100% 50% !important;');
    expect(css).toContain('--sigma-icon-folder');
    expect(css).toContain('color-scheme: dark');
  });

  it('builds nothing for the default theme without overrides', () => {
    expect(buildPersonalThemeCss('default', {}, {})).toBe('');
  });
});
