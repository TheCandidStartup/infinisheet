import React, { Component, PureComponent } from 'react'

const setInitialState = (settings) => {
  const { itemHeight, amount, tolerance, minIndex, maxIndex, startIndex } = settings
  const viewportHeight = amount * itemHeight
  const totalHeight = (maxIndex - minIndex + 1) * itemHeight
  const toleranceHeight = tolerance * itemHeight
  const bufferHeight = viewportHeight + 2 * toleranceHeight
  const bufferedItems = amount + 2 * tolerance
  const itemsAbove = startIndex - tolerance - minIndex
  const topPaddingHeight = itemsAbove * itemHeight
  const bottomPaddingHeight = totalHeight - topPaddingHeight
  const initialPosition = topPaddingHeight + toleranceHeight
  return {
    settings,
    viewportHeight,
    totalHeight,
    toleranceHeight,
    bufferHeight,
    bufferedItems,
    topPaddingHeight,
    bottomPaddingHeight,
    initialPosition,
    index: startIndex - tolerance
  }
}

class Scroller extends PureComponent {
  constructor(props) {
    super(props)
    this.state = setInitialState(props.settings)
    this.viewportElement = React.createRef()
  }
  
  componentDidMount() {
    console.log(`componentDidMount ${this.state.initialPosition}`);
    this.viewportElement.current.scrollTop = this.state.initialPosition
    if (!this.state.initialPosition) {
      this.runScroller({ target: { scrollTop: 0 } })
    }
  }

  componentDidUpdate() {
    console.log(`componentDidUpdate ${this.state.topPaddingHeight}`);
  }

  runScroller = ({ target: { scrollTop } }) => {
    const { totalHeight, toleranceHeight, bufferedItems, settings: { itemHeight, minIndex }} = this.state
    const index = minIndex + Math.floor((scrollTop - toleranceHeight) / itemHeight)
    const topPaddingHeight = Math.max((index - minIndex) * itemHeight, 0)
    console.log(`runScroller ${scrollTop} ${minIndex + Math.floor(scrollTop/itemHeight)}`);
    const bottomPaddingHeight = Math.max(totalHeight - topPaddingHeight - bufferedItems * itemHeight, 0)
    window.requestAnimationFrame(() => { 
      console.log(`requestAnimationFrame ${scrollTop}`);
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = () => { console.log(`PostPaint ${scrollTop}`) };
      messageChannel.port2.postMessage(undefined);
    })
    window.requestIdleCallback(() => { console.log(`requestIdleCallback  ${scrollTop}`) });

    this.setState({
      topPaddingHeight,
      bottomPaddingHeight,
      index
    })
  }

  render() {
    const { viewportHeight, bufferedItems, topPaddingHeight, bottomPaddingHeight, index } = this.state
    const data = this.props.get(index, bufferedItems)
    console.log(`render ${topPaddingHeight} ${data.length}`);
    return (
      <div
        className="viewport"
        ref={this.viewportElement}
        onScroll={this.runScroller}
        style={{ height: viewportHeight }}
      >
        <div className="innerContainer">
        <div className="topPadding" key="topPadding" style={{ height: topPaddingHeight }}></div>
        {
          data.map(this.props.row)
        }
        <div className="bottomPadding" key="bottomPadding" style={{ height: bottomPaddingHeight }}></div>
        </div>
      </div>
    )
  }
}

export default Scroller
