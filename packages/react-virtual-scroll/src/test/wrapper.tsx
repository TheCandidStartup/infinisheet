// Copied from https://github.com/vitest-dev/vitest/blob/main/examples/react-testing-lib/src/utils/test-utils.tsx
// Implements render wrapper pattern and sets up auto-cleanup after each test as described in
// https://github.com/vitest-dev/vitest/blob/main/examples/react-testing-lib/src/utils/test-utils.tsx
import { cleanup, render } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})

function customRender(ui: React.ReactElement, options = {}) {
  return render(ui, {
    // wrap provider(s) here if needed
    wrapper: ({ children }) => children,
    ...options,
  })
}

export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
// override render export
export { customRender as render }
