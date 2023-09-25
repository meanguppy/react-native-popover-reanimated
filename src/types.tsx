import type { RefObject, ReactNode } from 'react';
import type { View } from 'react-native';

export type AnchorPosition =
  | 'top-left'
  | 'top'
  | 'top-right'
  | 'left'
  | 'center'
  | 'right'
  | 'bottom-left'
  | 'bottom'
  | 'bottom-right';

export type PopoverConfig = {
  originAnchor: AnchorPosition;
  contentAnchor: AnchorPosition;
  offsetX: number;
  offsetY: number;
  padding: number;
};

export type PopoverProps = Partial<PopoverConfig> & {
  children: ReactNode;
};

export type ClosePopover = () => void;
export type RenderContent = (closePopover: ClosePopover) => ReactNode;
export type RenderPopover = {
  renderContent: RenderContent;
  configOverrides?: Partial<PopoverConfig> | undefined;
};

export type PopoverContextValue = null | {
  updateIfActive(viewRef: RefObject<View>, popover: RenderPopover): void;
  open(viewRef: RefObject<View>, popover: RenderPopover): void;
  close(): void;
};

export type MeasuredSize = {
  w: number;
  h: number;
};

export type MeasuredOrigin = MeasuredSize & {
  x: number;
  y: number;
};
