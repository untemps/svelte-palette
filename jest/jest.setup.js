const { toBeInTheDocument, toHaveAttribute, toHaveStyle } = require('@testing-library/jest-dom/matchers')
import '@testing-library/jest-dom/extend-expect'

expect.extend({ toBeInTheDocument, toHaveAttribute, toHaveStyle })
