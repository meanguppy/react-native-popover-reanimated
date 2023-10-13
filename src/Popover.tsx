import React, {
  useState,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useEffect,
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
import type {
  MeasuredOrigin,
  MeasuredSize,
  PopoverConfig,
  PopoverContextValue,
  PopoverProps,
  RenderContent,
  RenderPopover,
} from './types';
import { calculateAnchorIntersection } from './utils';

export const PopoverContext = React.createContext<PopoverContextValue>(null);
PopoverContext.displayName = 'PopoverContext';

export const usePopoverView = (
  renderContent: RenderContent,
  configOverrides?: Partial<PopoverConfig>
) => {
  const context = useContext(PopoverContext);
  const originRef = useRef<View>(null);
  const [active, setActive] = useState<boolean>(false);

  useEffect(() => {
    context?.updateIfActive(originRef, {
      renderContent,
      configOverrides,
      setActive,
    });
  }, [context, renderContent, configOverrides]);

  const openPopover = useCallback(() => {
    context?.open(originRef, { renderContent, configOverrides, setActive });
  }, [context, renderContent, configOverrides]);

  const closePopover = useCallback(() => {
    context?.close();
  }, [context]);

  return { originRef, openPopover, closePopover, active };
};

export const PopoverManager = ({
  children,
  originAnchor = 'bottom',
  contentAnchor = 'top',
  offsetX = 0,
  offsetY = 0,
  padding = 16,
}: PopoverProps) => {
  const prevPopover = useRef<null | RenderPopover>(null);
  const activeRef = useRef<null | View>(null);
  const [activePopover, setActivePopover] = useState<null | RenderPopover>(
    null
  );

  const hidden = useSharedValue(true);
  const viewSize = useSharedValue<MeasuredSize>({ w: Infinity, h: Infinity });
  const origin = useSharedValue<null | MeasuredOrigin>(null);
  const contentSize = useSharedValue<null | MeasuredSize>(null);

  const context = useMemo(
    () => ({
      updateIfActive(originRef: RefObject<View>, popover: RenderPopover) {
        if (!originRef.current || !activeRef.current) return;
        if (originRef.current !== activeRef.current) return;
        setActivePopover(() => popover);
      },
      open(originRef: RefObject<View>, popover: RenderPopover) {
        originRef.current?.measure((_x, _y, w, h, px, py) => {
          activeRef.current = originRef.current;
          hidden.value = true;
          origin.value = { x: px, y: py, w, h };
          setActivePopover(() => popover);
        });
      },
      close() {
        activeRef.current = null;
        hidden.value = true;
        setActivePopover((current) => {
          prevPopover.current = current;
          return null;
        });
      },
    }),
    [hidden, origin]
  );

  useEffect(() => {
    activePopover?.setActive?.(true);
    if (prevPopover.current) {
      prevPopover.current?.setActive?.(false);
      prevPopover.current = null;
    }
  }, [activePopover]);

  const config: PopoverConfig = useMemo(
    () => ({
      originAnchor,
      contentAnchor,
      offsetX,
      offsetY,
      padding,
    }),
    [contentAnchor, offsetX, offsetY, originAnchor, padding]
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
      viewSize.value = { w: layout.width, h: layout.height };
    },
    [viewSize]
  );

  const onLayoutContent = useCallback(
    (evt: LayoutChangeEvent) => {
      const { layout } = evt.nativeEvent;
      hidden.value = false;
      contentSize.value = { w: layout.width, h: layout.height };
    },
    [hidden, contentSize]
  );

  const transform = useAnimatedStyle(() => {
    if (!activePopover) return { opacity: 0, transform: [] };
    const { configOverrides } = activePopover;
    const { x, y } = calculateAnchorIntersection(
      origin.value,
      contentSize.value,
      viewSize.value,
      { ...config, ...configOverrides }
    );
    return {
      opacity: hidden.value ? 0 : 1,
      transform: [{ translateX: x }, { translateY: y }],
    };
  });

  return (
    <PopoverContext.Provider value={context}>
      <GestureDetector gesture={spy}>
        <View style={styles.flex} onLayout={onLayoutView}>
          {children}
        </View>
      </GestureDetector>
      {activePopover && (
        <View style={styles.overlay} pointerEvents="box-none">
          <Animated.View
            style={[styles.floating, transform]}
            onLayout={onLayoutContent}
          >
            {activePopover.renderContent(closePopover)}
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
