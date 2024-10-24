import React from "react";
import { render, screen, fireEvent, act } from '../../../shared/test/wrapper'
import { throwErr, overrideProp, fireEventScrollEnd } from '../../../shared/test/utils'
import { VirtualScroll, VirtualContentRender, VirtualScrollProxy } from './VirtualScroll'
import { ScrollState } from './useVirtualScroll';

function updateLayout(innerDiv: HTMLElement, outerDiv: HTMLElement, barWidth: number, barHeight: number) {
  const scrollHeight = parseInt(innerDiv.style.height);
  overrideProp(outerDiv, "scrollHeight", scrollHeight);
  const scrollWidth = parseInt(innerDiv.style.width);
  overrideProp(outerDiv, "scrollWidth", scrollWidth);

  const clientHeight = parseInt(outerDiv.style.height);
  overrideProp(outerDiv, "clientHeight", clientHeight - barHeight);
  const clientWidth = parseInt(outerDiv.style.width);
  overrideProp(outerDiv, "clientWidth", clientWidth - barWidth);
}

interface TestProps {
  height: number,
  width: number,
  scrollHeight?: number,
  scrollWidth?: number,
  useIsScrolling?: boolean
}

interface TestState {
  verticalOffset: number,
  horizontalOffset: number, 
  verticalScrollState: ScrollState,
  horizontalScrollState: ScrollState
}

const TestRig = React.forwardRef<VirtualScrollProxy, TestProps>(function TestRig(props, ref) {
  const [ testState, setTestState ] = React.useState<TestState|null>(null);

  const contentRender: VirtualContentRender = ({isScrolling, ...rest}, ref) => (
    <div ref={ref}
      data-isscrolling={isScrolling === undefined ? 'undefined' : (isScrolling ? 'true' : 'false')}
      data-verticaloffset={testState?.verticalOffset}
      data-horizontaloffset={testState?.horizontalOffset}
      {...rest}>
        header
    </div>
  )

  return (
    <VirtualScroll
        {...props}
        ref={ref}
        onScroll={(verticalOffset, horizontalOffset, verticalScrollState, horizontalScrollState) => {
          setTestState({ verticalOffset, horizontalOffset, verticalScrollState, horizontalScrollState })
        }}
        contentRender={contentRender}/>
  )
})

describe('VirtualScroll', () => {
  it('should render and scroll vertically', () => {
    const mock = vi.fn();
    Element.prototype["scrollTo"] = mock;

    try {
      const ref = React.createRef<VirtualScrollProxy>();
      render(
        <TestRig
          ref={ref}
          height={240}
          width={600}
          scrollHeight={100000}>
        </TestRig>
      )

      const header = screen.getByText('header');
      expect(header).toBeInTheDocument()
      expect(header.dataset.isscrolling).toBe("undefined")

      const outerDiv = header.parentElement || throwErr("No outer div");
      const innerDiv = outerDiv.children[1] || throwErr("No inner div");
      expect(header).not.toEqual(innerDiv);
      updateLayout(innerDiv as HTMLDivElement, outerDiv, 15, 0);

      // Scroll down
      {act(() => {
        fireEvent.scroll(outerDiv, { target: { scrollTop: 120 }});
        fireEventScrollEnd(outerDiv);
      })}
      expect(header.dataset.isscrolling).toBe("undefined")
      expect(header.dataset.verticaloffset).toBe("120")
      expect(header.dataset.horizontaloffset).toBe("0")

      const proxy = ref.current || throwErr("null ref");
      expect(proxy.clientHeight).toBe(240);
      expect(proxy.clientWidth).lessThan(600);
      {act(() => { proxy.scrollTo(100); })}
      expect(mock).lastCalledWith({ top: 100 });

    } finally {
      Reflect.deleteProperty(Element.prototype, "scrollTo");
    }
  })

  it('should render and scroll horizontally', () => {
    const mock = vi.fn();
    Element.prototype["scrollTo"] = mock;

    try {
      const ref = React.createRef<VirtualScrollProxy>();
      render(
        <TestRig
          ref={ref}
          useIsScrolling={true}
          height={240}
          width={600}
          scrollWidth={100000}>
        </TestRig>
      )

      const header = screen.getByText('header');
      expect(header).toBeInTheDocument()
      expect(header.dataset.isscrolling).toBe("false")

      const outerDiv = header.parentElement || throwErr("No outer div");
      const innerDiv = outerDiv.children[1] || throwErr("No inner div");
      expect(header).not.toEqual(innerDiv);
      updateLayout(innerDiv as HTMLDivElement, outerDiv, 0, 15);

      // Scroll right
      {act(() => {
        fireEvent.scroll(outerDiv, { target: { scrollLeft: 250 }});
        fireEventScrollEnd(outerDiv);
      })}
      expect(header.dataset.isscrolling).toBe("false")
      expect(header.dataset.verticaloffset).toBe("0")
      expect(header.dataset.horizontaloffset).toBe("250")

      const proxy = ref.current || throwErr("null ref");
      expect(proxy.clientHeight).lessThan(240);
      expect(proxy.clientWidth).toBe(600);
      {act(() => { proxy.scrollTo(undefined, 400); })}
      expect(mock).lastCalledWith({ left: 400 });

    } finally {
      Reflect.deleteProperty(Element.prototype, "scrollTo");
    }
  })

  it('should render when empty', () => {
    render(
      <VirtualScroll
        height={240}
        width={600}/>
    )

    expect(screen.queryByText('header')).toBeNull()
  })
})