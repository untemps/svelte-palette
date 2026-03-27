import { afterEach, expect, test, vi } from 'vitest'
import { cleanup } from '@testing-library/svelte/svelte5'

import { NONE, DROP } from '../../enums/PaletteDeletionMode'
import useDeletion from '../useDeletion'

afterEach(() => cleanup())

test('Destroy does not throw when action is null (NONE mode)', () => {
	const node = document.createElement('div')
	const { destroy } = useDeletion(node, {
		deletionMode: NONE,
		onDelete: vi.fn(),
	})
	expect(() => destroy()).not.toThrow()
})

test('Update does not throw when action is null (NONE mode)', () => {
	const node = document.createElement('div')
	const { update } = useDeletion(node, {
		deletionMode: NONE,
		onDelete: vi.fn(),
	})
	expect(() => update({ deletionMode: NONE, onDelete: vi.fn() })).not.toThrow()
})

test('Creates DROP action without slot button (dragImage is undefined)', () => {
	// node has no [data-testid="__palette-slot__"] child → slotButton is null → false branch of ternary at line 37
	const node = document.createElement('div')
	document.body.appendChild(node)
	expect(() =>
		useDeletion(node, {
			deletionMode: DROP,
			onDelete: vi.fn(),
		})
	).not.toThrow()
	document.body.removeChild(node)
})
