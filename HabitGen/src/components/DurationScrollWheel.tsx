import React, { useRef, useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const ITEM_HEIGHT = 56;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

const durations = Array.from({ length: 36 }, (_, i) => (i + 1) * 5);

interface DurationScrollWheelProps {
  value: number;
  onChange: (value: number) => void;
}

const DurationScrollWheel: React.FC<DurationScrollWheelProps> = ({
  value,
  onChange,
}) => {
  const { theme } = useTheme();
  const listRef = useRef<FlatList>(null);
  // Track the visually centered index during scroll for instant highlighting
  const [centeredIndex, setCenteredIndex] = useState(
    Math.max(0, durations.indexOf(value)),
  );

  useEffect(() => {
    const idx = durations.indexOf(value);
    if (idx >= 0) {
      setCenteredIndex(idx);
    }
  }, [value]);

  // Scroll to current value when mounted or value changes (fixes stuck wheel on Android)
  const scrollToValue = useCallback(() => {
    const idx = Math.max(0, durations.indexOf(value));
    listRef.current?.scrollToOffset({
      offset: idx * ITEM_HEIGHT,
      animated: false,
    });
    setCenteredIndex(idx);
  }, [value]);

  useEffect(() => {
    const t = setTimeout(scrollToValue, 50);
    return () => clearTimeout(t);
  }, [scrollToValue]);

  // Update highlighted item instantly during scroll
  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = e.nativeEvent.contentOffset.y;
      const idx = Math.round(offsetY / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(idx, durations.length - 1));
      if (clamped !== centeredIndex) {
        setCenteredIndex(clamped);
      }
    },
    [centeredIndex],
  );

  // Commit the final value when scroll ends
  const commitValue = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = e.nativeEvent.contentOffset.y;
      const idx = Math.round(offsetY / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(idx, durations.length - 1));
      setCenteredIndex(clamped);
      onChange(durations[clamped]);
    },
    [onChange],
  );

  const initialIndex = Math.max(0, durations.indexOf(value));

  const renderItem = useCallback(
    ({ item, index }: { item: number; index: number }) => {
      const isSelected = index === centeredIndex;
      return (
        <View style={[styles.item, { height: ITEM_HEIGHT }]}>
          <Text
            style={[
              styles.itemText,
              {
                color: isSelected
                  ? theme.colors.primary
                  : theme.colors.textMuted,
                fontSize: isSelected ? 26 : 18,
                fontWeight: isSelected ? '800' : '400',
                opacity: isSelected ? 1 : 0.4,
              },
            ]}>
            {item} min
          </Text>
        </View>
      );
    },
    [theme, centeredIndex],
  );

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
        Custom Duration
      </Text>
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}>
        {/* Selection highlight bar - positioned at center */}
        <View
          style={[
            styles.selectedOverlay,
            {
              backgroundColor: theme.colors.primary + '18',
              borderColor: theme.colors.primary + '50',
            },
          ]}
        />
        <FlatList
          ref={listRef}
          data={durations}
          keyExtractor={item => `dur_${item}`}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          style={{ height: PICKER_HEIGHT }}
          contentContainerStyle={{
            paddingVertical: ITEM_HEIGHT * 2,
          }}
          nestedScrollEnabled
          initialScrollIndex={initialIndex}
          getItemLayout={(_, index) => ({
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
            index,
          })}
          onScroll={onScroll}
          scrollEventThrottle={16}
          onMomentumScrollEnd={commitValue}
          onScrollEndDrag={commitValue}
          onLayout={scrollToValue}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 24 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    marginLeft: 4,
  },
  container: {
    height: PICKER_HEIGHT,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
  },
  selectedOverlay: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    left: 12,
    right: 12,
    height: ITEM_HEIGHT,
    borderRadius: 14,
    borderWidth: 2,
    zIndex: 1,
  },
  item: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    zIndex: 2,
  },
  itemText: {
    textAlign: 'center',
  },
});

export default DurationScrollWheel;
