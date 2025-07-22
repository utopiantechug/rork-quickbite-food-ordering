import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View, Platform } from 'react-native';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react-native';

interface DatePickerProps {
  value: string;
  onDateChange: (date: string) => void;
  placeholder?: string;
  minDate?: Date;
}

export function DatePicker({ value, onDateChange, placeholder, minDate }: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : new Date());

  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    onDateChange(formatDateForInput(date));
    setShowPicker(false);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
  };

  const isDateDisabled = (date: Date) => {
    if (!minDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const displayValue = value ? formatDateForDisplay(new Date(value)) : placeholder;

  // For web, use native HTML5 date input
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <input
          type="date"
          value={value}
          onChange={(e) => onDateChange(e.target.value)}
          min={minDate ? formatDateForInput(minDate) : undefined}
          style={{
            width: '100%',
            padding: 12,
            fontSize: 16,
            border: '1px solid #E8E8E8',
            borderRadius: 12,
            backgroundColor: '#fff',
            color: '#2D1810',
          }}
        />
      </View>
    );
  }

  return (
    <>
      <Pressable style={styles.dateButton} onPress={() => setShowPicker(true)}>
        <Text style={[styles.dateText, !value && styles.placeholderText]}>
          {displayValue}
        </Text>
        <Calendar size={20} color="#D4A574" />
      </Pressable>

      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <Pressable onPress={() => setShowPicker(false)}>
                <X size={24} color="#2D1810" />
              </Pressable>
            </View>

            <View style={styles.monthNavigation}>
              <Pressable style={styles.navButton} onPress={() => navigateMonth('prev')}>
                <ChevronLeft size={24} color="#D4A574" />
              </Pressable>
              <Text style={styles.monthYear}>
                {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
              <Pressable style={styles.navButton} onPress={() => navigateMonth('next')}>
                <ChevronRight size={24} color="#D4A574" />
              </Pressable>
            </View>

            <View style={styles.weekDays}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <Text key={day} style={styles.weekDay}>{day}</Text>
              ))}
            </View>

            <View style={styles.calendar}>
              {getDaysInMonth(selectedDate).map((date, index) => (
                <Pressable
                  key={index}
                  style={[
                    styles.dayButton,
                    date && isDateDisabled(date) && styles.disabledDay,
                    date && value && formatDateForInput(date) === value && styles.selectedDay,
                  ]}
                  onPress={() => date && !isDateDisabled(date) && handleDateSelect(date)}
                  disabled={!date || isDateDisabled(date)}
                >
                  <Text style={[
                    styles.dayText,
                    date && isDateDisabled(date) && styles.disabledDayText,
                    date && value && formatDateForInput(date) === value && styles.selectedDayText,
                  ]}>
                    {date ? date.getDate() : ''}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.modalActions}>
              <Pressable style={styles.todayButton} onPress={() => handleDateSelect(new Date())}>
                <Text style={styles.todayButtonText}>Today</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    width: '100%',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  dateText: {
    fontSize: 16,
    color: '#2D1810',
  },
  placeholderText: {
    color: '#6B5B73',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 350,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D1810',
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    padding: 8,
  },
  monthYear: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D1810',
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#6B5B73',
    paddingVertical: 8,
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  dayButton: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  selectedDay: {
    backgroundColor: '#D4A574',
  },
  disabledDay: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 16,
    color: '#2D1810',
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: '600',
  },
  disabledDayText: {
    color: '#6B5B73',
  },
  modalActions: {
    alignItems: 'center',
  },
  todayButton: {
    backgroundColor: '#F5F1EB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D4A574',
  },
  todayButtonText: {
    color: '#D4A574',
    fontSize: 14,
    fontWeight: '600',
  },
});