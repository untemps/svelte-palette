import { render, screen } from '@testing-library/svelte/svelte5'
import userEvent from '@testing-library/user-event'

import PaletteTrashButton from '../PaletteTrashButton.svelte'

const setup = (component: Parameters<typeof render>[0], options?: Parameters<typeof render>[1]) => {
	return {
		user: userEvent.setup(),
		...render(component, options),
	}
}

test('Renders trash button', () => {
	setup(PaletteTrashButton)
	const button = screen.getByTestId('__palette-trash-button__')
	expect(button).toBeInTheDocument()
})

test('Names the button with a default accessible name', () => {
	setup(PaletteTrashButton)
	const button = screen.getByRole('button', { name: 'Delete color' })
	expect(button).toBeInTheDocument()
})

test('Names the button with a custom accessible name', () => {
	setup(PaletteTrashButton, { props: { ['aria-label']: 'Supprimer la couleur' } })
	const button = screen.getByRole('button', { name: 'Supprimer la couleur' })
	expect(button).toBeInTheDocument()
})

test('Triggers click event', async () => {
	const onClick = vi.fn(() => 0)
	const { user } = setup(PaletteTrashButton, { props: { onclick: onClick } })
	const button = screen.getByTestId('__palette-trash-button__')
	await user.click(button)
	expect(onClick).toHaveBeenCalled()
})

test('Attaches active class when isActive is true', () => {
	setup(PaletteTrashButton, { props: { isActive: true } })
	const button = screen.getByTestId('__palette-trash-button__')
	// The class must match the component's own scoped rule, not PaletteIconButton's namespace (#175).
	expect(button).toHaveClass('trash_button__button--active')
	expect(button).not.toHaveClass('icon_button__button--active')
})

test('Does not attach active class when isActive is false', () => {
	setup(PaletteTrashButton, { props: { isActive: false } })
	const button = screen.getByTestId('__palette-trash-button__')
	expect(button).not.toHaveClass('trash_button__button--active')
})
