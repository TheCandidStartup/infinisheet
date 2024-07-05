<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@candidstartup/react-virtual-scroll](./react-virtual-scroll.md) &gt; [VirtualListItem](./react-virtual-scroll.virtuallistitem.md)

## VirtualListItem type

Type of item in a [VirtualList](./react-virtual-scroll.virtuallist.md)

Must be passed as a child to [VirtualList](./react-virtual-scroll.virtuallist.md)<!-- -->. Accepts props defined by [VirtualListItemProps](./react-virtual-scroll.virtuallistitemprops.md)<!-- -->. Component must pass [VirtualBaseItemProps.style](./react-virtual-scroll.virtualbaseitemprops.style.md) to whatever it renders.

**Signature:**

```typescript
export type VirtualListItem = React.ComponentType<VirtualListItemProps>;
```
**References:** [VirtualListItemProps](./react-virtual-scroll.virtuallistitemprops.md)

## Example

Basic implementation

```
const Row = ({ index, style }: { index: number, style: React.CSSProperties }) => (
  <div className="row" style={style}>
    { index }
  </div>
);
```
