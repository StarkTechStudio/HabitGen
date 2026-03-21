import React, { useRef, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

// Duration values in 15-minute increments: 15, 30, 45, 60, 75, ... up to 24 hours
const DURATIONS = Array.from({ length: 96 }, (_, i) => (i + 1) * 15);

// Frequency: simple numbers 1–24
const FREQUENCIES = Array.from({ length: 24 }, (_, i) => i + 1);

// ---- Format helpers ----

function formatDurationLabel(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatIntervalLabel(totalMins: number): string {
  if (totalMins < 1) {
    const secs = Math.round(totalMins * 60);
    return `${secs}s`;
  }
  const wholeMin = Math.floor(totalMins);
  const remainSec = Math.round((totalMins - wholeMin) * 60);
  if (remainSec > 0) return `${wholeMin}m ${remainSec}s`;
  if (wholeMin >= 60) {
    const h = Math.floor(wholeMin / 60);
    const m = wholeMin % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${wholeMin}m`;
}

// ---- Memoized row item ----

const WheelItem = React.memo(
  ({ label, isCenter, primaryColor, mutedColor }: {
    label: string;
    isCenter: boolean;
    primaryColor: string;
    mutedColor: string;
  }) => (
    <View style={[itemStyles.row, { height: ITEM_HEIGHT }]}>
      <Text
        style={[
          itemStyles.text,
          isCenter
            ? { color: primaryColor, fontSize: 22, fontWeight: '700', opacity: 1 }
            : { color: mutedColor, fontSize: 16, fontWeight: '400', opacity: 0.45 },
        ]}>
        {label}
      </Text>
    </View>
  ),
);

const itemStyles = StyleSheet.create({
  row: { justifyContent: 'center', alignItems: 'center', width: '100%' },
  text: { textAlign: 'center' },
});

// ---- Scroll Wheel ----

interface ScrollWheelProps {
  data: number[];
  value: number;
  onChange: (val: number) => void;
  formatFn: (val: number) => string;
  label: string;
}

const ScrollWheel: React.FC<ScrollWheelProps> = React.memo(({
  data,
  value,
  onChange,
  formatFn,
  label,
}) => {
  const { theme } = useTheme();
  const listRef = useRef<FlatList>(null);
  // Track selected index as ref to avoid re-renders during scroll
  const selectedRef = useRef(Math.max(0, data.indexOf(value)));
  // Only this state drives the visual; updated on scroll-end only
  const [selectedIdx, setSelectedIdx] = React.useState(
    Math.max(0, data.indexOf(value)),
  );

  // Scroll to value on mount
  useEffect(() => {
    const idx = Math.max(0, data.indexOf(value));
    selectedRef.current = idx;
    setSelectedIdx(idx);
    const t = setTimeout(() => {
      listRef.current?.scrollToOffset({ offset: idx * ITEM_HEIGHT, animated: false });
    }, 60);
    return () => clearTimeout(t);
  }, [value, data]);

  const commitScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      const idx = Math.round(y / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(idx, data.length - 1));
      selectedRef.current = clamped;
      setSelectedIdx(clamped);
      onChange(data[clamped]);
    },
    [onChange, data],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: number; index: number }) => (
      <WheelItem
        label={formatFn(item)}
        isCenter={index === selectedIdx}
        primaryColor={theme.colors.primary}
        mutedColor={theme.colors.textMuted}
      />
    ),
    [formatFn, selectedIdx, theme.colors.primary, theme.colors.textMuted],
  );

  const keyExtractor = useCallback((item: number) => `w_${item}`, []);
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

  return (
    <View style={styles.wheelCol}>
      <Text style={[styles.wheelLabel, { color: theme.colors.textSecondary }]}>
        {label}
      </Text>
      <View
        style={[
          styles.wheelContainer,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        ]}>
        {/* Highlight bar */}
        <View
          style={[
            styles.highlightBar,
            {
              backgroundColor: theme.colors.primary + '15',
              borderColor: theme.colors.primary + '45',
            },
          ]}
        />
        <FlatList
          ref={listRef}
          data={data}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          bounces={false}
          overScrollMode="never"
          style={{ height: PICKER_HEIGHT }}
          contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
          nestedScrollEnabled
          initialScrollIndex={Math.max(0, data.indexOf(value))}
          getItemLayout={getItemLayout}
          onMomentumScrollEnd={commitScroll}
          onScrollEndDrag={commitScroll}
          removeClippedSubviews
          maxToRenderPerBatch={10}
          windowSize={7}
          initialNumToRender={9}
          updateCellsBatchingPeriod={50}
        />
      </View>
    </View>
  );
});

// -------- Main Component --------

interface NotifyDurationFrequencyPickerProps {
  durationMinutes: number;
  frequencyCount: number;
  onDurationChange: (mins: number) => void;
  onFrequencyChange: (count: number) => void;
}

const NotifyDurationFrequencyPicker: React.FC<NotifyDurationFrequencyPickerProps> = ({
  durationMinutes,
  frequencyCount,
  onDurationChange,
  onFrequencyChange,
}) => {
  const { theme } = useTheme();

  const snappedDuration = useMemo(
    () =>
      DURATIONS.reduce((prev, curr) =>
        Math.abs(curr - durationMinutes) < Math.abs(prev - durationMinutes)
          ? curr
          : prev,
      ),
    [durationMinutes],
  );

  const clampedFrequency = Math.max(1, Math.min(24, frequencyCount));
  const intervalMinutes =
    clampedFrequency > 0 ? snappedDuration / clampedFrequency : 0;

  const durationFormat = useCallback(
    (v: number) => formatDurationLabel(v),
    [],
  );
  const frequencyFormat = useCallback((v: number) => String(v), []);

  return (
    <View style={styles.wrapper}>
      {/* Side-by-side pickers */}
      <View style={styles.pickersRow}>
        <ScrollWheel
          data={DURATIONS}
          value={snappedDuration}
          onChange={onDurationChange}
          formatFn={durationFormat}
          label={'\u{23F1}\u{FE0F} Duration'}
        />
        <ScrollWheel
          data={FREQUENCIES}
          value={clampedFrequency}
          onChange={onFrequencyChange}
          formatFn={frequencyFormat}
          label={'\u{1F514} Frequency'}
        />
      </View>

      {/* Summary card */}
      <View
        style={[
          styles.summaryCard,
          {
            backgroundColor: theme.colors.surfaceVariant,
            borderColor: theme.colors.border,
          },
        ]}>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
            Duration
          </Text>
          <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
            {formatDurationLabel(snappedDuration)}
          </Text>
        </View>
        <View
          style={[styles.summaryDivider, { backgroundColor: theme.colors.border }]}
        />
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
            Notifications
          </Text>
          <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>
            {clampedFrequency}
          </Text>
        </View>
        <View
          style={[styles.summaryDivider, { backgroundColor: theme.colors.border }]}
        />
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
            Notify every
          </Text>
          <Text style={[styles.summaryValue, { color: theme.colors.accent }]}>
            {formatIntervalLabel(intervalMinutes)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 20 },
  pickersRow: {
    flexDirection: 'row',
    gap: 12,
  },
  wheelCol: {
    flex: 1,
  },
  wheelLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  wheelContainer: {
    height: PICKER_HEIGHT,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
  },
  highlightBar: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    left: 6,
    right: 6,
    height: ITEM_HEIGHT,
    borderRadius: 10,
    borderWidth: 1.5,
    zIndex: 1,
  },
  summaryCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginTop: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  summaryDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 2,
  },
});

export default NotifyDurationFrequencyPicker;
