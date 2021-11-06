import useConditional from '../useConditional'

describe('useConditional', () => {
	const target = 'foo'
	const options = 'bar'

	it('Triggers action as condition is truthy', () => {
		const action = jest.fn()
		useConditional(target, { action, options, condition: true })
		expect(action).toHaveBeenCalledWith(target, options)
	})

	it('Does not trigger action as condition is falsy', () => {
		const action = jest.fn()
		useConditional(target, { action, options, condition: false })
		expect(action).not.toHaveBeenCalled()
	})

	it('Triggers action on update as new condition is truthy', () => {
		const action = jest.fn()
		const newAction = jest.fn()
		const { update } = useConditional(target, { action, condition: true })
		update({ action: newAction, options, condition: true })
		expect(newAction).toHaveBeenCalledWith(target, options)
	})

	it('Does not triggers action on update as new condition is falsy', () => {
		const action = jest.fn()
		const newAction = jest.fn()
		const { update } = useConditional(target, { action, condition: true })
		update({ action: newAction, options, condition: false })
		expect(newAction).not.toHaveBeenCalled()
	})
})
