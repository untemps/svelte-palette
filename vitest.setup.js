import '@testing-library/jest-dom/vitest'

// jsdom does not implement HTMLFormElement.prototype.requestSubmit
HTMLFormElement.prototype.requestSubmit = function () {
	this.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
}
