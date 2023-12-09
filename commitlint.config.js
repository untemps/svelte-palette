export default {
	extends: ['@commitlint/config-conventional'],
	rules: {
		'subject-case': [2, 'always', ['sentence-case']],
		'scope-case': [2, 'always', ['lower-case', 'upper-case']],
		'body-max-line-length': [0, 'always', 1000],
		'footer-max-line-length': [0, 'always', 1000],
	},
}
