// Small reusable fixed-height virtualization engine. Only rows currently inside the
// viewport are ever in the DOM — everything else exists purely as `count * rowHeight`
// of spacer height so native scrolling still works. Row nodes are pooled by slot
// position and reused across renders instead of rebuilt from scratch on every scroll
// event, so `renderRow` is called with the existing node (if any) to update in place.
function createVirtualList({ viewport, spacer, window, rowHeight, itemCount, renderRow }) {
  let count = itemCount;
  const pool = [];

  function setItemCount(next) {
    count = next;
    spacer.style.height = `${count * rowHeight}px`;
    render();
  }

  function render() {
    const scrollTop = viewport.scrollTop;
    const viewportHeight = viewport.clientHeight;
    const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight));
    const endIndex = Math.min(count, Math.ceil((scrollTop + viewportHeight) / rowHeight));
    const visibleCount = Math.max(0, endIndex - startIndex);

    window.style.transform = `translateY(${startIndex * rowHeight}px)`;

    for (let slot = 0; slot < visibleCount; slot++) {
      const i = startIndex + slot;
      const existing = pool[slot];
      const node = renderRow(i, existing);
      if (!existing) {
        pool[slot] = node;
        window.appendChild(node);
      }
    }
    while (pool.length > visibleCount) {
      pool.pop().remove();
    }
  }

  viewport.addEventListener('scroll', render);
  setItemCount(itemCount);

  return {
    render,
    setItemCount,
    scrollToBottom: () => { viewport.scrollTop = viewport.scrollHeight; },
  };
}
