const useConditional = (target, { action, options, condition }) => {
	if (condition) {
		action(target, options)
		return {
			update: ({ options }) => {
				action(target, options)
			}
		}
	}
	return undefined
}

export default useConditional
