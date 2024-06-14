import React, {useState} from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Platform,
  Alert,
  Text,
} from 'react-native';
import {doc, updateDoc, Timestamp} from 'firebase/firestore';
import {db} from '../mockData/config';
import DateTimePicker from '@react-native-community/datetimepicker';

const ReminderDetailsScreen = ({route, navigation}) => {
  const {reminder} = route.params;
  const [title, setTitle] = useState(reminder.message);
  const [selectedDate, setSelectedDate] = useState(
    new Date(reminder.date_at.toDate()),
  );
  const [reminderType, setReminderType] = useState(reminder.type);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleDateChange = (event, date) => {
    if (date && event.type === 'set') {
      // Check if date is set and not dismissed
      const updatedDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        date.getHours(),
        date.getMinutes(),
      );
      setSelectedDate(updatedDate);
    }
    setShowDatePicker(false);
    setShowTimePicker(false);
  };

  const handleSave = async () => {
    const reminderRef = doc(db, 'reminders', reminder.id);
    const firestoreTimestamp = Timestamp.fromDate(selectedDate); // Convert the date to a Firestore Timestamp

    if (title.length > 50) {
        Alert.alert('Invalid input', 'Reminder title is long than 50 characters.');
        return;
    }

    try {
      await updateDoc(reminderRef, {
        message: title,
        date_at: firestoreTimestamp,
      });
      Alert.alert('Success', 'Reminder updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating reminder: ', error);
      Alert.alert('Error', 'There was a problem updating the reminder');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={title}
        maxLength={50}
        onChangeText={setTitle}
        placeholder="Reminder title"
      />
      <Text style={styles.label}>Reminder Type:</Text>
      <TextInput
        style={styles.typeInput}
        value={reminderType}
        onChangeText={setReminderType}
        placeholder="Type"
        editable={false} // set to false if you don't want it to be editable
      />
      <Button
        title="Set Reminder Date"
        onPress={() => setShowDatePicker(true)}
      />
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          is24Hour={true}
          display="default"
          onChange={handleDateChange}
        />
      )}
      <Button
        title="Set Reminder Time"
        onPress={() => setShowTimePicker(true)}
      />
      {showTimePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={handleDateChange}
        />
      )}
      <Button title="Save Changes" onPress={handleSave} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
  },
  // ... add more styles if needed
});

export default ReminderDetailsScreen;
