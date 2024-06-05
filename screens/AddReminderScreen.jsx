import React, {useState, useContext, useEffect} from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import {collection, addDoc, Timestamp} from 'firebase/firestore';
import {db} from '../mockData/config';
import DateTimePicker from '@react-native-community/datetimepicker';
import {UserContext} from '../UserContext';
import Voice from '@react-native-voice/voice';
import {requestMicrophonePermission} from '../helpers/AndroidPermissions';
const AddReminderScreen = ({navigation}) => {
  const [title, setTitle] = useState('');
  const [isListening, setIsListening] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const {user} = useContext(UserContext);
  const [gifUrl, setGifUrl] = useState('');

  useEffect(() => {
    requestMicrophonePermission();
    // This function will be called when speech is detected
    const onSpeechResults = e => {
      console.log('onSpeechResults: ', e);
      if (e.value && e.value.length > 0) {
        setTitle(e.value[0]); // Set the title to the first item of the speech result
      }
    };

    const onSpeechError = e => {
      console.log('ERROR: ', e);
    };

    // Setup the listener for onSpeechResults
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;

    return () => {
      // Remove the listener when the component unmounts
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startSpeechToText = async () => {
    requestMicrophonePermission();
    try {
      await Voice.start();
      setIsListening(true);
    } catch (e) {
      console.error(e);
    }
  };
  const stopSpeechToText = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDateChange = (event, selectedValue) => {
    setShowDatePicker(Platform.OS === 'ios');
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedValue) {
      setSelectedDate(selectedValue);
    }
  };

  const handleSave = async () => {
    const firestoreTimestamp = Timestamp.fromDate(selectedDate); // Convert the date to a Firestore Timestamp

    try {
      await addDoc(collection(db, 'reminders'), {
        message: title,
        date_at: firestoreTimestamp,
        user: user.id,
        gif: gifUrl,
      });
      Alert.alert('Success', 'Reminder added successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error adding reminder: ', error);
      Alert.alert('Error', 'There was a problem adding the reminder');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Reminder title"
      />
      <Button
        title={isListening ? 'Stop Speaking' : 'Start Speaking'}
        onPress={isListening ? stopSpeechToText : startSpeechToText}
      />

      <Button
        title="Set Reminder Date"
        onPress={() => setShowDatePicker(true)}
      />
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
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

      <TextInput // New TextInput for GIF URL
        style={styles.input}
        value={gifUrl}
        onChangeText={setGifUrl}
        placeholder="Enter GIF URL"
      />

      <Button title="Add Reminder" onPress={handleSave} />
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
  // Add more styles if needed
});

export default AddReminderScreen;
