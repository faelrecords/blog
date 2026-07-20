type SidebarShiftInput = {
  scrollY: number;
  layoutTop: number;
  layoutHeight: number;
  viewportHeight: number;
  contentHeight: number;
  topOffset?: number;
  bottomGap?: number;
};

export function calculateArticleSidebarShift({
  scrollY,
  layoutTop,
  layoutHeight,
  viewportHeight,
  contentHeight,
  topOffset = 96,
  bottomGap = 16,
}: SidebarShiftInput) {
  const availableHeight = Math.max(0, viewportHeight - topOffset - bottomGap);
  const overflow = Math.max(0, contentHeight - availableHeight);
  if (!overflow) return 0;

  const start = layoutTop - topOffset;
  const end = Math.max(start + 1, layoutTop + layoutHeight - viewportHeight);
  const pageProgress = Math.min(
    1,
    Math.max(0, (scrollY - start) / (end - start)),
  );
  const shiftProgress = Math.min(1, Math.max(0, (pageProgress - 0.45) / 0.45));
  if (!shiftProgress) return 0;
  const easedProgress = shiftProgress * shiftProgress * (3 - 2 * shiftProgress);

  return -overflow * easedProgress;
}
