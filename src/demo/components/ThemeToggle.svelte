<script lang="ts">
	import { getTheme, toggleTheme } from '../lib/theme.svelte'
	import Icon from './Icon.svelte'
</script>

<button
	type="button"
	class="iconbtn"
	onclick={toggleTheme}
	aria-label={`Switch to ${getTheme() === 'dark' ? 'light' : 'dark'} theme`}
>
	<Icon name={getTheme() === 'dark' ? 'sun' : 'moon'} />
</button>
