import React, {
  useState,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useEffect,
  type ReactNode,
  type RefObject,
} from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { View, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

export type PopoverProps = {
  children: ReactNode;
};

export type PopoverContextValue = null | {
  updateIfActive(viewRef: RefObject<View>, renderContent: RenderContent): void;
  open(viewRef: RefObject<View>, renderContent: RenderContent): void;
  close(): void;
};

export type ClosePopover = () => void;

export type RenderContent = (closePopover: ClosePopover) => ReactNode;

export const PopoverContext = React.createContext<PopoverContextValue>(null);
PopoverContext.displayName = 'PopoverContext';

export const usePopoverView = (renderContent: RenderContent) => {
  const context = useContext(PopoverContext);
  const viewRef = useRef<View>(null);

  useEffect(() => {
    context?.updateIfActive(viewRef, renderContent);
  }, [context, renderContent]);

  const openPopover = useCallback(() => {
    context?.open(viewRef, renderContent);
  }, [context, renderContent]);

  const closePopover = useCallback(() => {
    context?.close();
  }, [context]);

  return { viewRef, openPopover, closePopover };
};

export const PopoverManager = ({ children }: PopoverProps) => {
  const activeRef = useRef<null | View>(null);
  const [activeRenderContent, setActiveRenderContent] =
    useState<null | RenderContent>(null);

  const hidden = useSharedValue(true);
  const viewWidth = useSharedValue(Infinity);
  const viewHeight = useSharedValue(Infinity);
  const positionX = useSharedValue(0);
  const positionY = useSharedValue(0);
  const contentWidth = useSharedValue(0);
  const contentHeight = useSharedValue(0);

  const context = useMemo(
    () => ({
      updateIfActive(
        viewRef: React.RefObject<View>,
        renderContent: RenderContent
      ) {
        if (!viewRef.current || !activeRef.current) return;
        if (viewRef.current !== activeRef.current) return;
        setActiveRenderContent(() => renderContent);
      },
      open(viewRef: React.RefObject<View>, renderContent: RenderContent) {
        viewRef.current?.measure((_x, _y, _w, _h, px, py) => {
          activeRef.current = viewRef.current;
          hidden.value = true;
          positionX.value = px;
          positionY.value = py;
          setActiveRenderContent(() => renderContent);
        });
      },
      close() {
        activeRef.current = null;
        hidden.value = true;
        setActiveRenderContent(() => null);
      },
    }),
    [hidden, positionX, positionY]
  );

  const closePopover = useCallback(() => {
    context.close();
  }, [context]);

  const spy = Gesture.Manual().onTouchesDown((_, manager) => {
    'worklet';
    manager.fail();
    runOnJS(closePopover)();
  });

  const onLayoutView = useCallback(
    (evt: LayoutChangeEvent) => {
      const { layout } = evt.nativeEvent;
      viewWidth.value = layout.width;
      viewHeight.value = layout.height;
    },
    [viewHeight, viewWidth]
  );

  const onLayoutContent = useCallback(
    (evt: LayoutChangeEvent) => {
      const { layout } = evt.nativeEvent;
      contentWidth.value = layout.width;
      contentHeight.value = layout.height;
      hidden.value = false;
    },
    [hidden, contentHeight, contentWidth]
  );

  const transform = useAnimatedStyle(() => {
    const xMax = viewWidth.value - contentWidth.value - 16;
    const yMax = viewHeight.value - contentHeight.value - 16;
    return {
      opacity: hidden.value ? 0 : 1,
      transform: [
        { translateX: clamp(positionX.value, 16, xMax) },
        { translateY: clamp(positionY.value, 16, yMax) },
      ],
    };
  });

  return (
    <PopoverContext.Provider value={context}>
      <GestureDetector gesture={spy}>
        <View style={styles.flex} onLayout={onLayoutView}>
          {children}
        </View>
      </GestureDetector>
      {activeRenderContent && (
        <View style={styles.overlay} pointerEvents="box-none">
          <Animated.View
            style={[styles.floating, transform]}
            onLayout={onLayoutContent}
          >
            {activeRenderContent(closePopover)}
          </Animated.View>
        </View>
      )}
    </PopoverContext.Provider>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1500,
  },
  floating: {
    position: 'absolute',
  },
});

function clamp(value: number, min: number, max: number) {
  'worklet';
  return Math.max(min, Math.min(value, max));
}
