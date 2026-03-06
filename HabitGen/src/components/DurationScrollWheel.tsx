import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ViewToken,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const ITEM_HEIGHT = 56;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

// Generate durations from 5 to 180 minutes in 5-min increments
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

  const onViewable = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const middle = viewableItems[Math.floor(viewableItems.length / 2)];
      if (middle?.item !== undefined) {
        onChange(middle.item as number);
      }
    },
    [onChange],
  );

  const initialIndex = Math.max(0, durations.indexOf(value));

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
        {/* Selection highlight */}
        <View
          style={[
            styles.selectedOverlay,
            {
              backgroundColor: theme.colors.primaryLight,
              borderColor: theme.colors.primary + '30',
            },
          ]}
        />
        <FlatList
          ref={listRef}
          data={durations}
          keyExtractor={item => `dur_${item}`}
          renderItem={({ item }) => {
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
                      fontWeight: isSelected ? '700' : '400',
                    },
                  ]}>
                  {item} min
                </Text>
              </View>
            );
          }}
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
          onViewableItemsChanged={onViewable}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
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
    left: 16,
    right: 16,
    height: ITEM_HEIGHT,
    borderRadius: 14,
    borderWidth: 1,
    zIndex: -1,
  },
  item: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  itemText: {
    textAlign: 'center',
  },
});

export default DurationScrollWheel;
