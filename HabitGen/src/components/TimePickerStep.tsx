import React, { useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
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
  const isInitialMount = useRef(true);

  const clampIndex = useCallback((idx: number, len: number) => {
    return Math.max(0, Math.min(idx, Math.max(0, len - 1)));
  }, []);

  const onHourScroll = useCallback(
    (offsetY: number) => {
      // Because we use equal top/bottom padding, the item whose top offset
      // is closest to the scroll offset is centered in the selection pane.
      const rawIdx = Math.round(offsetY / ITEM_HEIGHT);
      const idx = clampIndex(rawIdx, hours.length);
      const nextHour = hours[idx];
      if (nextHour && nextHour !== selectedHour) {
        onChange(`${nextHour}:${selectedMinute}`);
      }
    },
    [clampIndex, onChange, selectedHour, selectedMinute],
  );

  const onMinuteScroll = useCallback(
    (offsetY: number) => {
      const rawIdx = Math.round(offsetY / ITEM_HEIGHT);
      const idx = clampIndex(rawIdx, minutes.length);
      const nextMinute = minutes[idx];
      if (nextMinute && nextMinute !== selectedMinute) {
        onChange(`${selectedHour}:${nextMinute}`);
      }
    },
    [clampIndex, onChange, selectedHour, selectedMinute],
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
          backgroundColor: theme.colors.primary + '18',
          borderColor: theme.colors.primary + '35',
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
          onScroll={e => onHourScroll(e.nativeEvent.contentOffset.y)}
          scrollEventThrottle={16}
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
          onScroll={e => onMinuteScroll(e.nativeEvent.contentOffset.y)}
          scrollEventThrottle={16}
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
