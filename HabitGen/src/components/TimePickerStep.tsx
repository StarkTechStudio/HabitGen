import React, { useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ViewToken,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const CENTER_OFFSET = (PICKER_HEIGHT - ITEM_HEIGHT) / 2;

interface TimePickerStepProps {
  value: string;
  onChange: (value: string) => void;
}

const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

const TimePickerStep: React.FC<TimePickerStepProps> = ({ value, onChange }) => {
  const { theme } = useTheme();
  const [selectedHour, selectedMinute] = value.split(':');
  const hourRef = useRef<FlatList>(null);
  const minuteRef = useRef<FlatList>(null);
  const hasUserScrolledHour = useRef(false);
  const hasUserScrolledMinute = useRef(false);
  const isInitialMount = useRef(true);

  const onHourViewable = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (!hasUserScrolledHour.current) return;
      const middle = viewableItems[Math.floor(viewableItems.length / 2)];
      if (middle?.item) {
        onChange(`${middle.item}:${selectedMinute}`);
      }
    },
    [onChange, selectedMinute],
  );

  const onMinuteViewable = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (!hasUserScrolledMinute.current) return;
      const middle = viewableItems[Math.floor(viewableItems.length / 2)];
      if (middle?.item) {
        onChange(`${selectedHour}:${middle.item}`);
      }
    },
    [onChange, selectedHour],
  );

  // One-time initial scroll to value on mount only (no dependency on value to avoid fighting with user)
  useEffect(() => {
    if (!isInitialMount.current) return;
    isInitialMount.current = false;
    const t = setTimeout(() => {
      const hIdx = Math.max(0, Math.min(hours.indexOf(selectedHour), hours.length - 1));
      const mIdx = Math.max(0, Math.min(minutes.indexOf(selectedMinute), minutes.length - 1));
      hourRef.current?.scrollToOffset({ offset: hIdx * ITEM_HEIGHT, animated: false });
      minuteRef.current?.scrollToOffset({ offset: mIdx * ITEM_HEIGHT, animated: false });
    }, 100);
    return () => clearTimeout(t);
  }, []);

  const renderItem = useCallback(
    ({ item, isSelected }: { item: string; isSelected: boolean }) => (
      <View style={[styles.item, { height: ITEM_HEIGHT }]}>
        <Text
          style={[
            styles.itemText,
            {
              color: isSelected ? theme.colors.primary : theme.colors.textMuted,
              fontSize: isSelected ? 28 : 20,
              fontWeight: isSelected ? '700' : '400',
            },
          ]}>
          {item}
        </Text>
      </View>
    ),
    [theme],
  );

  return (
    <View style={styles.container}>
      <View style={[styles.pickerContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <View style={[styles.selectedOverlay, {
          top: CENTER_OFFSET,
          height: ITEM_HEIGHT,
          backgroundColor: theme.colors.primaryLight,
          borderColor: theme.colors.primary + '30',
        }]} />
        {/* Hour picker */}
        <FlatList
          ref={hourRef}
          data={hours}
          keyExtractor={item => `h_${item}`}
          renderItem={({ item }) =>
            renderItem({ item, isSelected: item === selectedHour })
          }
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          style={styles.picker}
          contentContainerStyle={{
            paddingVertical: CENTER_OFFSET,
          }}
          initialScrollIndex={Math.min(hours.indexOf(selectedHour), Math.max(0, hours.length - 1))}
          getItemLayout={(_, index) => ({
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
            index,
          })}
          onViewableItemsChanged={onHourViewable}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          onMomentumScrollEnd={() => { hasUserScrolledHour.current = true; }}
          onScrollEndDrag={() => { hasUserScrolledHour.current = true; }}
        />

        <Text style={[styles.separator, { color: theme.colors.primary }]}>:</Text>

        {/* Minute picker */}
        <FlatList
          ref={minuteRef}
          data={minutes}
          keyExtractor={item => `m_${item}`}
          renderItem={({ item }) =>
            renderItem({ item, isSelected: item === selectedMinute })
          }
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          style={styles.picker}
          contentContainerStyle={{
            paddingVertical: CENTER_OFFSET,
          }}
          initialScrollIndex={Math.max(0, minutes.indexOf(selectedMinute))}
          getItemLayout={(_, index) => ({
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
            index,
          })}
          onViewableItemsChanged={onMinuteViewable}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          onMomentumScrollEnd={() => { hasUserScrolledMinute.current = true; }}
          onScrollEndDrag={() => { hasUserScrolledMinute.current = true; }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 20,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: PICKER_HEIGHT,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    paddingHorizontal: 20,
  },
  picker: {
    width: 80,
    height: PICKER_HEIGHT,
  },
  selectedOverlay: {
    position: 'absolute',
    left: 10,
    right: 10,
    borderRadius: 12,
    borderWidth: 1,
    zIndex: 1,
  },
  item: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    textAlign: 'center',
  },
  separator: {
    fontSize: 32,
    fontWeight: '700',
    marginHorizontal: 8,
  },
});

export default TimePickerStep;
