<script>
	import 'carbon-components-svelte/css/g90.css'
	import {
		Header,
		HeaderNav,
		HeaderNavItem,
		HeaderNavMenu,
		SkipToContent,
		Content,
		Grid,
		Row,
		Column,
		SideNav,
		SideNavItems,
		SideNavLink,
	} from 'carbon-components-svelte'

	let isSideNavOpen = false
</script>

<Header company="@untemps" platformName="/svelte-palette" bind:isSideNavOpen persistentHamburgerMenu={true}>
	<HeaderNav>
		<HeaderNavItem href="/example1" text="Example 1" />
		<HeaderNavItem href="/example2" text="Example 2" />
		<HeaderNavItem href="/example3" text="Example 3" />
		<HeaderNavItem href="/example4" text="Example 4" />
	</HeaderNav>
</Header>

<SideNav bind:isOpen={isSideNavOpen}>
	<SideNavItems>
		<SideNavLink href="/example1" text="Example 1" />
		<SideNavLink href="/example2" text="Example 2" />
		<SideNavLink href="/example3" text="Example 3" />
		<SideNavLink href="/example4" text="Example 4" />
	</SideNavItems>
</SideNav>

<slot />
