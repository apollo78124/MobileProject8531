import React, {useContext, useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Button,
} from 'react-native';
import {UserContext} from '../UserContext';
import {db} from '../mockData/config';
import {collection, getDocs, addDoc, Timestamp} from 'firebase/firestore';
import {Picker} from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const AddTaskScreen = ({navigation}) => {
  const {user} = useContext(UserContext);
  const [locations, setLocations] = useState([]);
  const [taskTypes, setTaskTypes] = useState([]);
  const [taskStatuses, setTaskStatuses] = useState([]);
  const [clientName, setClientName] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState(1);
  const [selectedTaskTypeId, setSelectedTaskTypeId] = useState(1);
  const [selectedStatusId, setSelectedStatusId] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // State to store the scheduled date and time
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [scheduledTime, setScheduledTime] = useState(new Date());

  // State to control the visibility of the Date and Time pickers
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      // Fetch Locations
      const locationsSnapshot = await getDocs(collection(db, 'locations'));
      const locationsData = locationsSnapshot.docs.map(doc => ({
        locationID: doc.locationID,
        ...doc.data(),
      }));
      setLocations(locationsData);

      // Fetch Task Types
      const taskTypesSnapshot = await getDocs(collection(db, 'taskTypes'));
      const taskTypesData = taskTypesSnapshot.docs.map(doc => ({
        taskTypeID: doc.taskTypeID,
        ...doc.data(),
      }));
      setTaskTypes(taskTypesData);

      // Fetch Task Statuses
      const taskStatusesSnapshot = await getDocs(
        collection(db, 'taskStatuses'),
      );
      const taskStatusesData = taskStatusesSnapshot.docs.map(doc => ({
        statusID: doc.statusID,
        ...doc.data(),
      }));
      setTaskStatuses(taskStatusesData);

      setIsLoading(false);
    };

    fetchData();
  }, []);

  const handleAddTask = async () => {
    // Combine date and time into one Date object
    const combinedDateTime = new Date(
      scheduledDate.getFullYear(),
      scheduledDate.getMonth(),
      scheduledDate.getDate(),
      scheduledTime.getHours(),
      scheduledTime.getMinutes(),
    );
    const timestamp = Timestamp.fromDate(combinedDateTime); // Convert to Firestore Timestamp
    console.log({
      clientName,
      selectedLocationId,
      selectedTaskTypeId,
      selectedStatusId,
    });
    if (
      !clientName ||
      !selectedLocationId ||
      !selectedTaskTypeId ||
      !selectedStatusId
    ) {
      Alert.alert('Error', 'Please fill all the fields.');
      return;
    }

    try {
      await addDoc(collection(db, 'tasks'), {
        clientName,
        locationID: selectedLocationId,
        taskTypeID: selectedTaskTypeId,
        taskStatusID: selectedStatusId,
        employeeID: user.id,
        scheduledDateTime: timestamp, // Use the combined date and time
      });
      Alert.alert('Success', 'Task added successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error adding task: ', error);
      Alert.alert('Error', 'There was a problem adding the task');
    }
  };

  if (isLoading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }
  console.log('locations: ', locations);
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.section}>Client Name</Text>
        <TextInput
          style={styles.input}
          value={clientName}
          onChangeText={setClientName}
          placeholder="Enter client name"
        />

        <Text style={styles.section}>Location</Text>
        <Picker
          selectedValue={selectedLocationId}
          onValueChange={itemValue => setSelectedLocationId(itemValue)}
          style={styles.picker}>
          {locations.map(location => (
            <Picker.Item
              key={location.locationID}
              label={`${location.street}, ${location.city}, ${location.province}, ${location.postalCode}`}
              value={location.locationID}
            />
          ))}
        </Picker>

        <Text style={styles.section}>Task Type</Text>
        <Picker
          selectedValue={selectedTaskTypeId}
          onValueChange={itemValue => setSelectedTaskTypeId(itemValue)}
          style={styles.picker}>
          {taskTypes.map(type => (
            <Picker.Item
              key={type.taskTypeID}
              label={type.name}
              value={type.taskTypeID}
            />
          ))}
        </Picker>

        <Text style={styles.section}>Status</Text>
        <Picker
          selectedValue={selectedStatusId}
          onValueChange={itemValue => setSelectedStatusId(itemValue)}
          style={styles.picker}>
          {taskStatuses.map(status => (
            <Picker.Item
              key={status.statusID}
              label={status.name}
              value={status.statusID}
            />
          ))}
        </Picker>

        <Button
          title="Set Scheduled Date"
          onPress={() => setShowDatePicker(true)}
        />
        {showDatePicker && (
          <DateTimePicker
            value={scheduledDate}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) {
                setScheduledDate(date);
              }
            }}
          />
        )}

        <Button
          title="Set Scheduled Time"
          onPress={() => setShowTimePicker(true)}
        />
        {showTimePicker && (
          <DateTimePicker
            value={scheduledTime}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={(event, time) => {
              setShowTimePicker(false);
              if (time) {
                setScheduledTime(time);
              }
            }}
          />
        )}

        <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
          <Text style={styles.addButtonText}>Add Task</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  content: {
    padding: 10,
  },
  section: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginTop: 5,
    borderRadius: 6,
  },
  picker: {
    height: 50,
    marginTop: 5,
  },
  addButton: {
    backgroundColor: '#4169E1',
    padding: 15,
    marginTop: 20,
    borderRadius: 6,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Add other styles as needed
});

export default AddTaskScreen;
