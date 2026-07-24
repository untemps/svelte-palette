# [6.0.0-beta.6](https://github.com/untemps/svelte-palette/compare/v6.0.0-beta.5...v6.0.0-beta.6) (2026-07-24)


### Bug Fixes

* Scope drop deletion area to the owning palette ([#227](https://github.com/untemps/svelte-palette/issues/227)) ([b1d03b4](https://github.com/untemps/svelte-palette/commit/b1d03b4d841615d91615ec2e0feed7f85bd860fd))

# [6.0.0-beta.5](https://github.com/untemps/svelte-palette/compare/v6.0.0-beta.4...v6.0.0-beta.5) (2026-07-24)


### Bug Fixes

* Crash when showInput is used with color groups ([#226](https://github.com/untemps/svelte-palette/issues/226)) ([5cd0273](https://github.com/untemps/svelte-palette/commit/5cd0273fc93c8cdedfd06f14ed6955a277ef09ce))

# [6.0.0-beta.4](https://github.com/untemps/svelte-palette/compare/v6.0.0-beta.3...v6.0.0-beta.4) (2026-07-23)


### Bug Fixes

* Make the compact toggle and resolver inputs fully reactive ([#225](https://github.com/untemps/svelte-palette/issues/225)) ([ae05b27](https://github.com/untemps/svelte-palette/commit/ae05b27c8ee059aa817346e9c056ede26750c01b))

# [6.0.0-beta.3](https://github.com/untemps/svelte-palette/compare/v6.0.0-beta.2...v6.0.0-beta.3) (2026-07-22)


### Features

* Emit add/delete callbacks and bindable colors ([#220](https://github.com/untemps/svelte-palette/issues/220)) ([5da4405](https://github.com/untemps/svelte-palette/commit/5da4405e01c71e41f6126c1b9699bbd84f26f915))


### BREAKING CHANGES

* AddEventArgs renamed to InputAddEventArgs; AddEventArgs now names the palette-level onadd argument

# [6.0.0-beta.2](https://github.com/untemps/svelte-palette/compare/v6.0.0-beta.1...v6.0.0-beta.2) (2026-07-21)


### Features

* Announce the keyboard deletion shortcut via aria-keyshortcuts ([#222](https://github.com/untemps/svelte-palette/issues/222)) ([1124b33](https://github.com/untemps/svelte-palette/commit/1124b335973886bfa03e925c6eeb08c0a3fd7a16))

# [6.0.0-beta.1](https://github.com/untemps/svelte-palette/compare/v5.4.1...v6.0.0-beta.1) (2026-07-21)


### Features

* Add listbox semantics and keyboard navigation to the slot grid ([#219](https://github.com/untemps/svelte-palette/issues/219)) ([ef997c5](https://github.com/untemps/svelte-palette/commit/ef997c56f4be1ee1c91b06a8fbd4211d1f0f48d0))


### BREAKING CHANGES

* The slot grid is now an ARIA listbox with a roving tabindex, which changes the palette's DOM structure, roles and tab behaviour.
Migrate as follows:
- Root landmark removed. The palette root no longer carries `role="main"`. Style overrides written against `.palette[role="main"]` must migrate to `.palette[data-palette]`, and code selecting the root by its `main` role must use the `data-palette` / `__palette__` hook instead.
- Grid layout moved. The flat-mode swatch grid (columns and gaps) is now laid  out on `.palette__listbox` instead of `.palette__cells`, which becomes a flex  wrapper. Style overrides targeting the grid via `.palette__cells` must move to  `.palette__cells > .palette__listbox`.
- Single tab stop. The grid now exposes a single tab stop (roving tabindex) instead of one per slot. `Tab` moves onto the selected slot (or the first one) and then out of the grid; arrow keys move within it.
- Slot snippet contract. Consumers rendering custom `slot` / `transparentSlot` snippets must forward the provided `tabindex` (and, for screen-reader parity, `role="option"` and `aria-selected={selected}`) onto their own focusable element to join the arrow-key navigation. `beforeSlot` / `afterSlot` snippets now render outside the listbox and must be a plain element (e.g. a `<div>`, not an `<li>`).

## [5.4.1](https://github.com/untemps/svelte-palette/compare/v5.4.0...v5.4.1) (2026-07-18)


### Bug Fixes

* Prevent form submit buttons from reloading the page ([#216](https://github.com/untemps/svelte-palette/issues/216)) ([7ac3d93](https://github.com/untemps/svelte-palette/commit/7ac3d9351ec1f480a448b06cd67aeb988ff5605c))

# [5.4.0](https://github.com/untemps/svelte-palette/compare/v5.3.0...v5.4.0) (2026-07-18)


### Features

* Complete the TypeScript migration ([#214](https://github.com/untemps/svelte-palette/issues/214)) ([ce0dc78](https://github.com/untemps/svelte-palette/commit/ce0dc78d9aae2f5ff3e3f74c25a7c5e15b8f6bf4))

# [5.3.0](https://github.com/untemps/svelte-palette/compare/v5.2.1...v5.3.0) (2026-07-18)


### Features

* Add TypeScript support ([#212](https://github.com/untemps/svelte-palette/issues/212)) ([f3a3d30](https://github.com/untemps/svelte-palette/commit/f3a3d307cc2d10706413d5b27c32ea0725eab5a7))

## [5.2.1](https://github.com/untemps/svelte-palette/compare/v5.2.0...v5.2.1) (2026-07-15)


### Bug Fixes

* Restore npm publishing and modernize the build & dev toolchain ([#163](https://github.com/untemps/svelte-palette/issues/163)) ([543d9aa](https://github.com/untemps/svelte-palette/commit/543d9aa215c06deb675d8aa59d7a2a17212bd661))

# [5.2.0](https://github.com/untemps/svelte-palette/compare/v5.1.1...v5.2.0) (2026-03-26)

### Features

- Add color groups support ([#144](https://github.com/untemps/svelte-palette/issues/144)) ([6bb199d](https://github.com/untemps/svelte-palette/commit/6bb199dfd76eb3986fd77ed7bed14d8c4c0b6d2f))

## [5.1.1](https://github.com/untemps/svelte-palette/compare/v5.1.0...v5.1.1) (2026-03-26)

### Bug Fixes

- Restore drag placeholder visibility in drop deletion mode ([#145](https://github.com/untemps/svelte-palette/issues/145)) ([93fc18c](https://github.com/untemps/svelte-palette/commit/93fc18c86d98fedd294a975f3076e1759c57c119))

# [5.1.0](https://github.com/untemps/svelte-palette/compare/v5.0.1...v5.1.0) (2026-03-26)

### Features

- Add maxColumns prop to limit columns in auto-expanding mode ([#142](https://github.com/untemps/svelte-palette/issues/142)) ([efa4c1f](https://github.com/untemps/svelte-palette/commit/efa4c1fb933df4424afd10a59e097039bfc3a678))

## [5.0.1](https://github.com/untemps/svelte-palette/compare/v5.0.0...v5.0.1) (2026-03-26)

### Bug Fixes

- Normalize rgb/rgba output from EyeDropper API ([#141](https://github.com/untemps/svelte-palette/issues/141)) ([509bc38](https://github.com/untemps/svelte-palette/commit/509bc38655e141a9369593479b4112b2f1c05239))

# [5.0.0](https://github.com/untemps/svelte-palette/compare/v4.1.0...v5.0.0) (2026-03-16)

- feat!: Migrate to Svelte 5 ([e9551d6](https://github.com/untemps/svelte-palette/commit/e9551d60ad7d717be8dac94d4719adbe0914672c))

### Bug Fixes

- Remove registry-url from setup-node to allow npm OIDC auth ([9e3bcf0](https://github.com/untemps/svelte-palette/commit/9e3bcf0a25c54019985d3098095ddec9b9bf8960))

### Features

- Migrate to Svelte 5 ([#137](https://github.com/untemps/svelte-palette/issues/137)) ([a7fa0d6](https://github.com/untemps/svelte-palette/commit/a7fa0d62acec29f077b4e9102edc290f4bea354e))
- Migrate to Svelte 5 ([#140](https://github.com/untemps/svelte-palette/issues/140)) ([5496322](https://github.com/untemps/svelte-palette/commit/5496322934fb39f6f5ce113d04766bd6195d74f5))

### BREAKING CHANGES

- Custom events replaced by callback props (onselect, onadd,
  onerror, onclick). Named slots replaced by snippet props. PaletteEvent enum
  removed. peerDependencies updated to svelte ^5.0.0.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>

# [5.0.0-beta.1](https://github.com/untemps/svelte-palette/compare/v4.1.0...v5.0.0-beta.1) (2026-03-16)

- feat!: Migrate to Svelte 5 ([e9551d6](https://github.com/untemps/svelte-palette/commit/e9551d60ad7d717be8dac94d4719adbe0914672c))

### Bug Fixes

- Remove registry-url from setup-node to allow npm OIDC auth ([9e3bcf0](https://github.com/untemps/svelte-palette/commit/9e3bcf0a25c54019985d3098095ddec9b9bf8960))

### Features

- Migrate to Svelte 5 ([#137](https://github.com/untemps/svelte-palette/issues/137)) ([a7fa0d6](https://github.com/untemps/svelte-palette/commit/a7fa0d62acec29f077b4e9102edc290f4bea354e))

### BREAKING CHANGES

- Custom events replaced by callback props (onselect, onadd,
  onerror, onclick). Named slots replaced by snippet props. PaletteEvent enum
  removed. peerDependencies updated to svelte ^5.0.0.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>

# [4.1.0](https://github.com/untemps/svelte-palette/compare/v4.0.0...v4.1.0) (2024-02-29)

### Features

- Allow to name colors ([#95](https://github.com/untemps/svelte-palette/issues/95)) ([f707306](https://github.com/untemps/svelte-palette/commit/f7073066eeef159714cee86e5f4bbad301590d0f))

# [4.0.0](https://github.com/untemps/svelte-palette/compare/v3.0.1...v4.0.0) (2023-12-09)

### Features

- Refactor codebase and add cool new features ([9c40860](https://github.com/untemps/svelte-palette/commit/9c40860de2457d61bc58a135a3524e0c4734eb37))

### BREAKING CHANGES

-   - Change default layout
- Rename transparent slot
- Remove allowDeletion prop

# [4.0.0-beta.2](https://github.com/untemps/svelte-palette/compare/v4.0.0-beta.1...v4.0.0-beta.2) (2023-12-05)

### Bug Fixes

- Fix colors calculation with non-array input ([#83](https://github.com/untemps/svelte-palette/issues/83)) ([ed24a36](https://github.com/untemps/svelte-palette/commit/ed24a36f8e5c26088cdecc2b957dab168111d0db))

# [4.0.0-beta.1](https://github.com/untemps/svelte-palette/compare/v3.0.1...v4.0.0-beta.1) (2023-12-03)

### Features

- Refactor codebase and add cool new features ([#83](https://github.com/untemps/svelte-palette/issues/83)) ([2d9dcdc](https://github.com/untemps/svelte-palette/commit/2d9dcdc6ea815a487f816e5fd824bfd2313ac0bb))

### BREAKING CHANGES

-   - Chang default layout
- Rename transparent slot
- Remove allowDeletion prop

## [3.0.1](https://github.com/untemps/svelte-palette/compare/v3.0.0...v3.0.1) (2023-09-29)

# [3.0.0](https://github.com/untemps/svelte-palette/compare/v2.4.1...v3.0.0) (2023-09-27)

### chore

- Upgrade to Svelte 4 ([#75](https://github.com/untemps/svelte-palette/issues/75)) ([4fab7aa](https://github.com/untemps/svelte-palette/commit/4fab7aa5eec09ce1b7a783bcdc7759c4bd802c98))

### BREAKING CHANGES

- No more cjs build and Node 18+ upgrade

## [2.4.1](https://github.com/untemps/svelte-palette/compare/v2.4.0...v2.4.1) (2023-04-26)

### Bug Fixes

- Remove useless z-index ([#68](https://github.com/untemps/svelte-palette/issues/68)) ([4516172](https://github.com/untemps/svelte-palette/commit/451617225f239138eebe4acb242cf578effca961))

# [2.4.0](https://github.com/untemps/svelte-palette/compare/v2.3.1...v2.4.0) (2023-04-18)

### Features

- Add support for async colors prop ([#67](https://github.com/untemps/svelte-palette/issues/67)) ([6415080](https://github.com/untemps/svelte-palette/commit/64150800dadac4d251b8afa269d752ec22b3c24c))

## [2.3.1](https://github.com/untemps/svelte-palette/compare/v2.3.0...v2.3.1) (2023-03-19)

### Bug Fixes

- Fix SvelteKit support ([#65](https://github.com/untemps/svelte-palette/issues/65)) ([5c25993](https://github.com/untemps/svelte-palette/commit/5c259932f9c293a32a6ee2856b4da1e649aa4ee9))

# [2.3.0](https://github.com/untemps/svelte-palette/compare/v2.2.0...v2.3.0) (2023-03-17)

### Features

- Drill component values into slots ([#64](https://github.com/untemps/svelte-palette/issues/64)) ([de41cc6](https://github.com/untemps/svelte-palette/commit/de41cc6ce4d63c32ef58978c98a79b95fd0253dd))

# [2.2.0](https://github.com/untemps/svelte-palette/compare/v2.1.0...v2.2.0) (2023-03-13)

### Features

- Add transition prop ([#61](https://github.com/untemps/svelte-palette/issues/61)) ([345fdcc](https://github.com/untemps/svelte-palette/commit/345fdcce1486200cc5b3f550da47cb2b64738c11))

# [2.1.0](https://github.com/untemps/svelte-palette/compare/v2.0.0...v2.1.0) (2023-03-11)

### Features

- Add numColumns prop ([#60](https://github.com/untemps/svelte-palette/issues/60)) ([b2f6dd9](https://github.com/untemps/svelte-palette/commit/b2f6dd99c7bcf2af358a89dc76a2e2af9391aed4))

# [2.0.0](https://github.com/untemps/svelte-palette/compare/v1.9.2...v2.0.0) (2023-02-27)

### Features

- Add compact mode ([#59](https://github.com/untemps/svelte-palette/issues/59)) ([966c540](https://github.com/untemps/svelte-palette/commit/966c54026c109bdbf5f9a546425597231b9510f5))

### BREAKING CHANGES

- Some imports have been renamed

## [1.9.2](https://github.com/untemps/svelte-palette/compare/v1.9.1...v1.9.2) (2022-10-07)

## [1.9.1](https://github.com/untemps/svelte-palette/compare/v1.9.0...v1.9.1) (2022-10-05)

### Bug Fixes

- Fix distribution config and deletionMode update ([#47](https://github.com/untemps/svelte-palette/issues/47)) ([091f437](https://github.com/untemps/svelte-palette/commit/091f4376dd32d651b9e06f59261f3e41f8e63a6a))

## [1.9.1-beta.3](https://github.com/untemps/svelte-palette/compare/v1.9.1-beta.2...v1.9.1-beta.3) (2022-10-04)

### Bug Fixes

- Fix deletion mode update ([842c1b6](https://github.com/untemps/svelte-palette/commit/842c1b66f6bcc85c5732ae7aae4642b1fdaf3689))

## [1.9.1-beta.2](https://github.com/untemps/svelte-palette/compare/v1.9.1-beta.1...v1.9.1-beta.2) (2022-10-04)

## [1.9.1-beta.1](https://github.com/untemps/svelte-palette/compare/v1.9.0...v1.9.1-beta.1) (2022-10-04)

# [1.9.0](https://github.com/untemps/svelte-palette/compare/v1.8.2...v1.9.0) (2022-09-29)

### Features

- Add new deletionMode prop ([#46](https://github.com/untemps/svelte-palette/issues/46)) ([2bc0e3f](https://github.com/untemps/svelte-palette/commit/2bc0e3f263905766a550a5fd596e182023de8c7f))

## [1.8.2](https://github.com/untemps/svelte-palette/compare/v1.8.1...v1.8.2) (2022-06-06)

### Bug Fixes

- Prevent from multiple enter event subscriptions on slots ([#31](https://github.com/untemps/svelte-palette/issues/31)) ([429d7ad](https://github.com/untemps/svelte-palette/commit/429d7add9f9b52fa1c401a061a01a93aad0393ab))

## [1.8.1](https://github.com/untemps/svelte-palette/compare/v1.8.0...v1.8.1) (2022-06-05)

### Bug Fixes

- Remove duplicates on allowDuplicates update ([#29](https://github.com/untemps/svelte-palette/issues/29)) ([3fdad78](https://github.com/untemps/svelte-palette/commit/3fdad78e21da70cd92b97f1215ea97415bf532b1))

# [1.8.0](https://github.com/untemps/svelte-palette/compare/v1.7.0...v1.8.0) (2022-06-03)

### Features

- Add inputType prop ([#26](https://github.com/untemps/svelte-palette/issues/26)) ([d9d8179](https://github.com/untemps/svelte-palette/commit/d9d81790f4e131afc5886370268b2aa5790fe6a5))

# [1.7.0](https://github.com/untemps/svelte-palette/compare/v1.6.2...v1.7.0) (2022-05-28)

### Features

- Implement EyeDropper API ([#24](https://github.com/untemps/svelte-palette/issues/24)) ([34b4751](https://github.com/untemps/svelte-palette/commit/34b47518c779f28949d70d15ca473e4a2e9a7ce3))

## [1.6.2](https://github.com/untemps/svelte-palette/compare/v1.6.1...v1.6.2) (2022-02-11)

## [1.6.1](https://github.com/untemps/svelte-palette/compare/v1.6.0...v1.6.1) (2022-01-11)

### Bug Fixes

- Wait for tooltip content to exist or be added ([#19](https://github.com/untemps/svelte-palette/issues/19)) ([a56714a](https://github.com/untemps/svelte-palette/commit/a56714a3516d34688b4b2cc4a55116885f4b46b7))

# [1.6.0](https://github.com/untemps/svelte-palette/compare/v1.5.1...v1.6.0) (2022-01-04)

### Features

- Close tooltip after clicking content ([ec11fc0](https://github.com/untemps/svelte-palette/commit/ec11fc0d36b535f03ab98646aaeb903d782722f8))

## [1.5.1](https://github.com/untemps/svelte-palette/compare/v1.5.0...v1.5.1) (2021-12-19)

### Bug Fixes

- Fix color addition when maxColors is updated ([9bd324e](https://github.com/untemps/svelte-palette/commit/9bd324e8382c981c46f616e7042897ef91f5a9ab))

# [1.5.0](https://github.com/untemps/svelte-palette/compare/v1.4.3...v1.5.0) (2021-12-18)

### Bug Fixes

- Fix palette css ([b377ab4](https://github.com/untemps/svelte-palette/commit/b377ab4caaeaaf80f77f6b4ca5e4ad8333c46d37))

### Features

- Allow to pass custom element as deletion tooltip content ([f72cd49](https://github.com/untemps/svelte-palette/commit/f72cd490852440c4f56b2269e1d1045c8d5ad1ac))
- Allow to set a custom class to deletion tooltip root element ([04a21a2](https://github.com/untemps/svelte-palette/commit/04a21a2dc5bfbcf40f397a1aa13aa77afff2ffa7))
- Allow to trigger callbacks with custom params from deletion tooltip content elements ([a91b534](https://github.com/untemps/svelte-palette/commit/a91b53404e9a10b4a65cca8f1414109071e8bed5))

## [1.4.3](https://github.com/untemps/svelte-palette/compare/v1.4.2...v1.4.3) (2021-12-12)

### Bug Fixes

- Fix first-run tooltip display ([efb115e](https://github.com/untemps/svelte-palette/commit/efb115e1daa2bb10bf2e42145e990df849c3875d))

## [1.4.3](https://github.com/untemps/svelte-palette/compare/v1.4.2...v1.4.3) (2021-12-12)

### Bug Fixes

- Fix first-run tooltip display ([efb115e](https://github.com/untemps/svelte-palette/commit/efb115e1daa2bb10bf2e42145e990df849c3875d))

## [1.4.2](https://github.com/untemps/svelte-palette/compare/v1.4.1...v1.4.2) (2021-12-07)

## [1.4.1](https://github.com/untemps/svelte-palette/compare/v1.4.0...v1.4.1) (2021-12-06)

### Bug Fixes

- Remove tooltip template earlier to prevent it from flashing ([#12](https://github.com/untemps/svelte-palette/issues/12)) ([dff176a](https://github.com/untemps/svelte-palette/commit/dff176a0edd54b4cc91b1a6175b81cbd330b5e59))

# [1.4.0](https://github.com/untemps/svelte-palette/compare/v1.3.0...v1.4.0) (2021-12-06)

### Features

- Add slots for header and footer dividers ([#9](https://github.com/untemps/svelte-palette/issues/9)) ([04caea5](https://github.com/untemps/svelte-palette/commit/04caea57ff85ad6c806ece30382b04779be61f91))

# [1.3.0](https://github.com/untemps/svelte-palette/compare/v1.2.1...v1.3.0) (2021-12-06)

### Features

- Pass class down to root tag ([#10](https://github.com/untemps/svelte-palette/issues/10)) ([210ded2](https://github.com/untemps/svelte-palette/commit/210ded27e4e3724317753e746ac028eecc305544))

## [1.2.1](https://github.com/untemps/svelte-palette/compare/v1.2.0...v1.2.1) (2021-12-03)

### Bug Fixes

- Fix selected color management to preserve selection outside of slot focus ([#7](https://github.com/untemps/svelte-palette/issues/7)) ([68df37a](https://github.com/untemps/svelte-palette/commit/68df37af345d94f3a0e499da3ec6ae0aae681ed7))

# [1.2.0](https://github.com/untemps/svelte-palette/compare/v1.1.0...v1.2.0) (2021-12-03)

### Features

- Add a maxColors prop to limit the number of slots in the palette ([#6](https://github.com/untemps/svelte-palette/issues/6)) ([48671f8](https://github.com/untemps/svelte-palette/commit/48671f8e6e09c1d165964cfd09fe1ff374fa588b))

# [1.1.0](https://github.com/untemps/svelte-palette/compare/v1.0.1...v1.1.0) (2021-12-03)

### Features

- Allow to display a transparent slot at the end of the list ([#5](https://github.com/untemps/svelte-palette/issues/5)) ([90f3233](https://github.com/untemps/svelte-palette/commit/90f32336b828f0dd2933c2901ea4da3c7feb0698))

## [1.0.1](https://github.com/untemps/svelte-palette/compare/v1.0.0...v1.0.1) (2021-11-13)

### Bug Fixes

- Delete slots by index instead of color ([#2](https://github.com/untemps/svelte-palette/issues/2)) ([b03c263](https://github.com/untemps/svelte-palette/commit/b03c26374e32710c2df54376584915a16018fe29))

# 1.0.0 (2021-11-07)

### Features

- Add flag to allow deletion ([4c46206](https://github.com/untemps/svelte-palette/commit/4c46206b6a989fca59476ab6f056b55b50068aef))
- Add flag to allow duplicates ([47418dc](https://github.com/untemps/svelte-palette/commit/47418dc7feab30ad9cfd7df34dca7c87b99f1ceb))
- Add transition on slot appearance ([8beab34](https://github.com/untemps/svelte-palette/commit/8beab34ba5beea2b48d4bc1072e34eecfeb98cbc))
- Allow color deletion via a tooltip ([62e95dc](https://github.com/untemps/svelte-palette/commit/62e95dc84096fa1acbb009191e95591992be4af2))
- Change palette slot root component into button ([8d1dbb8](https://github.com/untemps/svelte-palette/commit/8d1dbb8ac621248c9162429a87ce236c725f0870))
- Expose Palette parts as slots ([5b32c5f](https://github.com/untemps/svelte-palette/commit/5b32c5fd384c05c45c81338b4bd4f3c92600ccac))
- Expose Palette selection event ([1a72764](https://github.com/untemps/svelte-palette/commit/1a727641389e6974146d8cf795cb0f26cdf32775))
- Improve palette input ([6d391f3](https://github.com/untemps/svelte-palette/commit/6d391f344e2f5bc5d58841142e6c6a1c9f0c0da6))
- Initial commit ([ab80562](https://github.com/untemps/svelte-palette/commit/ab80562e9e0170964490d2cee7fe459b83dacd3b))
