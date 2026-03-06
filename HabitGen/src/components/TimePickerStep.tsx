import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  ViewToken,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

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

  const onHourViewable = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const middle = viewableItems[Math.floor(viewableItems.length / 2)];
      if (middle?.item) {
        onChange(`${middle.item}:${selectedMinute}`);
      }
    },
    [onChange, selectedMinute],
  );

  const onMinuteViewable = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const middle = viewableItems[Math.floor(viewableItems.length / 2)];
      if (middle?.item) {
        onChange(`${selectedHour}:${middle.item}`);
      }
    },
    [onChange, selectedHour],
  );

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
          top: ITEM_HEIGHT * 2,
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
            paddingVertical: ITEM_HEIGHT * 2,
          }}
          initialScrollIndex={hours.indexOf(selectedHour)}
          getItemLayout={(_, index) => ({
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
            index,
          })}
          onViewableItemsChanged={onHourViewable}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
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
            paddingVertical: ITEM_HEIGHT * 2,
          }}
          initialScrollIndex={Math.max(0, minutes.indexOf(selectedMinute))}
          getItemLayout={(_, index) => ({
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
            index,
          })}
          onViewableItemsChanged={onMinuteViewable}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
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
    height: ITEM_HEIGHT,
    borderRadius: 12,
    borderWidth: 1,
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
