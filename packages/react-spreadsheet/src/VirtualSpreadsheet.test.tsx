import { render, screen } from '../../../shared/test/wrapper'

import { VirtualSpreadsheet } from './VirtualSpreadsheet'

describe('VirtualSpreadsheet', () => {

  it('should render and scroll', () => {
    render(
      <VirtualSpreadsheet
        height={240}
        minRowCount={100}
        minColumnCount={26}
        width={600}>
      </VirtualSpreadsheet>
    )
    const cell = screen.getByText('0:0')
    expect(cell).toBeInTheDocument()
  })
})