import React, { useRef, useCallback, useEffect } from 'react';
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
  const currentIndex = useRef(Math.max(0, durations.indexOf(value)));

  useEffect(() => {
    const idx = durations.indexOf(value);
    if (idx >= 0) {
      currentIndex.current = idx;
    }
  }, [value]);

  // Use onMomentumScrollEnd for precise snap detection
  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = e.nativeEvent.contentOffset.y;
      const idx = Math.round(offsetY / ITEM_HEIGHT);
      const clampedIdx = Math.max(0, Math.min(idx, durations.length - 1));
      currentIndex.current = clampedIdx;
      onChange(durations[clampedIdx]);
    },
    [onChange],
  );

  const initialIndex = Math.max(0, durations.indexOf(value));

  const renderItem = useCallback(
    ({ item, index }: { item: number; index: number }) => {
      // We use the value prop to determine highlighted item
      const isSelected = item === value;
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
                opacity: isSelected ? 1 : 0.45,
              },
            ]}>
            {item} min
          </Text>
        </View>
      );
    },
    [theme, value],
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
        {/* Selection highlight bar */}
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
          initialScrollIndex={initialIndex}
          getItemLayout={(_, index) => ({
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
            index,
          })}
          onMomentumScrollEnd={onMomentumScrollEnd}
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
