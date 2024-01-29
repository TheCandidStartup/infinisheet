import { useState } from "react";

export default function useVirtualScroll() {
    const [scrollOffset, setScrollOffset] = useState(0);

    return [scrollOffset, setScrollOffset] as const;
}
