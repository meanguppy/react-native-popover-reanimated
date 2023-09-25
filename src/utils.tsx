import type {
  AnchorPosition,
  MeasuredOrigin,
  MeasuredSize,
  PopoverConfig,
} from './types';

function anchorOffsetX(anchor: AnchorPosition, w: number) {
  'worklet';
  switch (anchor) {
    case 'top-left':
    case 'left':
    case 'bottom-left':
      return 0;
    case 'top':
    case 'center':
    case 'bottom':
      return w / 2;
    case 'top-right':
    case 'right':
    case 'bottom-right':
      return w;
  }
}

function anchorOffsetY(anchor: AnchorPosition, h: number) {
  'worklet';
  switch (anchor) {
    case 'top-left':
    case 'top':
    case 'top-right':
      return 0;
    case 'left':
    case 'center':
    case 'right':
      return h / 2;
    case 'bottom-left':
    case 'bottom':
    case 'bottom-right':
      return h;
  }
}

function clamp(value: number, min: number, max: number) {
  'worklet';
  return Math.max(min, Math.min(value, max));
}

export function calculateAnchorIntersection(
  origin: MeasuredOrigin | null,
  content: MeasuredSize | null,
  view: MeasuredSize,
  config: PopoverConfig
) {
  'worklet';
  if (!origin || !content) return { x: 0, y: 0 };
  const { x: ox, y: oy, w: ow, h: oh } = origin;
  const { w: cw, h: ch } = content;
  const { w: vw, h: vh } = view;
  const { originAnchor, contentAnchor, offsetX, offsetY, padding } = config;
  const x =
    ox +
    offsetX +
    anchorOffsetX(originAnchor, ow) -
    anchorOffsetX(contentAnchor, cw);
  const y =
    oy +
    offsetY +
    anchorOffsetY(originAnchor, oh) -
    anchorOffsetY(contentAnchor, ch);
  return {
    x: clamp(x, padding, vw - cw - padding),
    y: clamp(y, padding, vh - ch - padding),
  };
}
