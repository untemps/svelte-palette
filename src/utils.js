export const resolveClass = (arr) => {
	if (!Array.isArray(arr)) {
		throw new Error('resolveClass expects an array as input')
	}
	return Object.values(arr)
		.reduce((acc, [condition, truthyValue, falsyValue]) => {
			if (condition && !!truthyValue) {
				return [...acc, truthyValue]
			} else if (!condition && !!falsyValue) {
				return [...acc, falsyValue]
			}
			return acc
		}, [])
		.join(' ')
}
