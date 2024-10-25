import { render, screen } from '../../../shared/test/wrapper'
import { stubProperty, unstubAllProperties } from '../../../shared/test/utils'
import { AutoSizer } from './AutoSizer'

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
    const header = screen.getByText('header');
    expect(header).toBeInTheDocument()

    expect(header.dataset.width).toBe("100")
    expect(header.dataset.height).toBe("300")
  })
})
