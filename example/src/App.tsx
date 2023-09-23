import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Button } from 'react-native';
import {
  ClosePopover,
  PopoverManager,
  usePopoverView,
} from 'react-native-popover-reanimated';

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    padding: 24,
    borderRadius: 8,
    backgroundColor: '#ccc',
  },
  btn: {
    width: 100,
    height: 50,
    backgroundColor: 'green',
  },
});

function MyComponent() {
  const [counter, setCounter] = useState(0);

  const renderContent = useCallback(
    (closePopover: ClosePopover) => {
      return (
        <View style={styles.box}>
          <Button title="Increment" onPress={() => setCounter((v) => v + 1)} />
          <Text>{counter}</Text>
          <Button title="Close" onPress={closePopover} />
        </View>
      );
    },
    [counter]
  );

  const { viewRef, openPopover } = usePopoverView(renderContent);

  return (
    <View style={styles.container}>
      <View ref={viewRef} collapsable={false}>
        <Button onPress={openPopover} title="Open popover" />
      </View>
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <PopoverManager>
        <MyComponent />
        <MyComponent />
        <MyComponent />
      </PopoverManager>
    </GestureHandlerRootView>
  );
}
