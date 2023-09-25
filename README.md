# react-native-popover-reanimated

Popover view for React Native via react-native-reanimated

## Installation

```sh
npm install react-native-popover-reanimated
```

## Setup

```js
import { PopoverManager } from 'react-native-popover-reanimated';
```

Wrap your application render with the `PopoverManager` component. Ensure `react-native-gesture-handler` has already been set up with the `GestureHandlerRootView` as well.

```js
  return (
    <GestureHandlerRootView style={styles.flex}>
      <PopoverManager>
        {/* ... application ... */}
      </PopoverManager>
    </GestureHandlerRootView>
  );
```

### Optional props

Additional props can be passed to the `PopoverManager` to customize the positioning behavior of the popover view. The default values can be seen here:
```js
  <PopoverManager
    originAnchor="bottom"
    contentAnchor="top"
    offsetX={0}
    offsetY={0}
    padding={16}>
```

* The anchors determine where the popover view will be presented
  * `originAnchor` refers to the view marked as the origin (`originRef`)
  * `contentAnchor` refers to the content rendered inside the popover view
  * The two views will line up on their respective anchors. With the default configuration above, the center-top of the content view will sit on the center-bottom of the origin view.
  * Possible values are: `'top-left' | 'top' | 'top-right' | 'left' | 'center' | 'right' | 'bottom-left' | 'bottom' | 'bottom-right'`
* `offsetX`/`offsetY`: amount in pixels to offset the content view on the respective axis
* `padding`: amount in pixels that the content view will be clamped to/spaced from the edge of the screen

## Usage

```js
import { usePopoverView } from 'react-native-popover-reanimated';
```

1. Define a render function that returns the contents you wish to place inside the popover view. To avoid unnecessary rerenders, this method should be defined with the `useCallback` hook.

```js
  const renderContent = useCallback(() => (
    <View>
      <Text>Hello world</Text>
    </View>
  ), []);
```

2. Call the `usePopoverView` hook, passing the render function as the first argument, in order to access the popover handlers.

```js
  const { originRef, openPopover, closePopover } = usePopoverView(renderContent);
```

3. Assign the `originRef` as the `ref` prop of a native view, such as a `View`. This component determines the visual origin at which the popover will appear when the `openPopover` method is invoked. The component _must_ be backed by a native view in order to make use of the `measure` function. **React Native will attempt to optimize the native view hierarchy by not rendering a View it deems unnecessary. Add the `collapsable={false}` prop to prevent this from happening.**

```js
  return (
    <View ref={originRef} collapsable={false}>
      <Button onPress={openPopover} title="Open popover" />
    </View>
  );
```

4. Call the `openPopover` function from any source in order to present the popover view. Any touch down outside of the popover content bounds will instantly close the view.

---

The `renderContent` callback also provides a `closePopover` method as a parameter that can be used to trigger a close from within the popover content itself:

```js
  const renderContent = useCallback((closePopover) => (
    <View>
      <Text>Hello world</Text>
      <Button title="Close" onPress={closePopover} />
    </View>
  ), []);
```

To override the configuration props set on the `PopoverManager` for a particular popover view, pass a partial configuration object as the second parameter of `usePopoverView`:

```js
  const { originRef, openPopover } = usePopoverView(renderContent, {
    originAnchor: 'bottom-right',
    padding: 8,
  });
```

## TODO

* Popover styling, padding, animation configuration
* Accessibility setup

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
