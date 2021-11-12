<p align="center">
<img src="assets/svelte-palette.png" alt="svelte-palette" height="200"/>
</p>
<p align="center">
    Svelte component to display a customisable color picker
</p>

---

[![npm](https://img.shields.io/npm/v/@untemps/svelte-palette?style=for-the-badge)](https://www.npmjs.com/package/@untemps/svelte-palette)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/untemps/svelte-palette/deploy?style=for-the-badge)](https://github.com/untemps/svelte-palette/actions)
[![Codecov](https://img.shields.io/codecov/c/github/untemps/svelte-palette?style=for-the-badge)](https://codecov.io/gh/untemps/svelte-palette)

## Demo

<p align="center">
    :red_circle:&nbsp;&nbsp;<big><a href="https://untemps.github.io/svelte-palette" target="_blank" rel="noopener">LIVE
    DEMO</a></big>&nbsp;:red_circle:
    <br/><br/>
    <img src="assets/example.png" alt="Example" style="max-width: 100%"/>
</p>

## Installation

```bash
yarn add @untemps/svelte-palette
```

## Usage

### Basic usage

```html
<script>
    import { Palette } from '@untemps/svelte-palette'

    const colors = [
		'#865C54',
		'#8F5447',
		'#A65846',
		'#A9715E',
		'#AD8C72',
    ]

	let bgColor = colors[0]
</script>

<main style="--bgColor:{bgColor}">
	<Palette {colors} allowDuplicates allowDeletion on:select={({ detail: { color } }) => (bgColor = color)} />
</main>

<style>
	main {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		background-color: var(--bgColor);
	}
```

### API

| Props             | Type   | Default | Description                                                              |
| ----------------- | ------ | ------- | ------------------------------------------------------------------------ |
| `colors`          | array  | []      | Array of color strings to be displayed in the palette.                   |
| `selectedColor`   | String | null    | Default selected color. The color must be included in the `colors` prop. |
| `allowDuplicates` | string | false   | Flag to allow color duplication.                                         |
| `allowDeletion`   | string | false   | Flag to allow color deletion.                                            |

### Events

| Event    | Arguments | Type   | Description                                |
| -------- | --------- | ------ | ------------------------------------------ |
| `select` |           |        | **Dispatched whenever a color is clicked** |
|          | `color`   | String | Selected color string.                     |

### Slots

| Slot     | Description                                                                           |
| -------- | ------------------------------------------------------------------------------------- |
| `header` | Allow to add a header to the palette. By default, it is empty.                        |
| `footer` | Allow to add a footer to the palette. By default, it contains an input to add colors. |
| `slot`   | Allow to replace the default color slots                                              |
| `input`  | Allow to replace the input in the footer if the default footer slot is kept as it is  |

#### Example

```html
<script>
	import { Palette } from '@untemps/svelte-palette'

	const colors = ['#865C54', '#8F5447', '#A65846', '#A9715E', '#AD8C72']
</script>
<Palette {colors}>
	<div slot="header" class="palette__header">
		<h1>Pick a color</h1>
	</div>
	<button let:color slot="slot" class="palette__slot" style="--color:{color}" />
	<div slot="footer" class="palette__footer">
		<a href="https://www.untemps.net">@untemps</a>
	</div>
</Palette>

<style>
	.palette__header {
		display: flex;
		justify-content: center;
	}

	.palette__slot {
		cursor: pointer;
		width: 2rem;
		height: 2rem;
		margin: 0;
		background-color: var(--color);
		border-radius: 20%;
		border: 1px solid rgba(0, 0, 0, 0.2);
		box-shadow: 0.1rem 0.1rem 0.3rem rgba(0, 0, 0, 0.2);
	}

	.palette__footer {
		display: flex;
		justify-content: center;
		padding: 0.5rem;
	}
</style>
```

## Development

The component can be served for development purpose on `http://localhost:5000/` running:

```
yarn dev
```

## Contributing

Contributions are warmly welcomed:

-   Fork the repository
-   Create a feature branch
-   Develop the feature AND write the tests (or write the tests AND develop the feature)
-   Commit your changes
    using [Angular Git Commit Guidelines](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#-git-commit-guidelines)
-   Submit a Pull Request
