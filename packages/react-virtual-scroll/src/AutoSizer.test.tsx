import { render, screen, act } from '../../../shared/test/wrapper'
import { stubProperty, unstubAllProperties, throwErr } from '../../../shared/test/utils'
import { mockResizeObserver } from 'jsdom-testing-mocks';
import { AutoSizer } from './AutoSizer'

const resizeObserver = mockResizeObserver();

describe('AutoSizer', () => {
  afterEach(() => {
    unstubAllProperties();
  })

  it('should render and compute size', () => {
    stubProperty(HTMLElement.prototype, "clientWidth", 100);
    stubProperty(HTMLElement.prototype, "clientHeight", 300);

    render(
      <AutoSizer>
        {({width, height}) => (
          <div data-width={width} data-height={height}>
            header
          </div>
        )}
      </AutoSizer>
    )
    let header = screen.getByText('header');
    expect(header).toBeInTheDocument()

    expect(header.dataset.width).toBe("100")
    expect(header.dataset.height).toBe("300")

    const inner = header.parentElement || throwErr("No inner");
    const outer = inner.parentElement || throwErr("No outer");

    resizeObserver.mockElementSize(outer, { contentBoxSize: { inlineSize: 200, blockSize: 500 }});
    act(() => {
      resizeObserver.resize(outer);
    })

    header = screen.getByText('header');
    expect(header).toBeInTheDocument()

    expect(header.dataset.width).toBe("200")
    expect(header.dataset.height).toBe("500")
  })
})
