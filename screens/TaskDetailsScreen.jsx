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
  ScrollView,
} from 'react-native';
import {UserContext} from '../UserContext';
import {db} from '../mockData/config'; // Make sure this points to your Firebase configuration file
import {performWithRetry} from '../mockData/mockData';
import {
  doc,
  collection,
  getDocs,
  updateDoc,
  Timestamp,
  addDoc,
  getDoc,
} from 'firebase/firestore';
import {Picker} from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {getDistance} from 'geolib';

const taskStatuses = [
  {statusID: 1, name: 'Pending', description: 'Task has not started'},
  {
    statusID: 2,
    name: 'In Progress',
    description: 'Task is currently in progress',
  },
  {statusID: 3, name: 'Completed', description: 'Task has been completed'},
];

const TaskDetailsScreen = ({route, navigation}) => {
  const {task} = route.params;
  const {user} = useContext(UserContext);
  const [locations, setLocations] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState(
    task.locationID.toString(),
  );
  const currentTask = taskStatuses.find(
    element => element.statusID === task.status.statusID,
  );
  const [clientName, setClientName] = useState(task.clientName);
  const [taskTypes, setTaskTypes] = useState([]);
  const [selectedTaskType, setSelectedTaskType] = useState(task.taskTypeID);
  const [selectedStatus, setSelectedStatus] = useState(currentTask.statusID);
  const [isLocationsLoading, setIsLocationsLoading] = useState(true); // State to manage loading status
  const [isTypesLoading, setIsTypesLoading] = useState(true); // State to manage loading status

  const [eligibleUsers, setEligibleUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');

  // State to store the scheduled date and time
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [scheduledTime, setScheduledTime] = useState(new Date()); // Make sure to convert Firestore Timestamp to Date
  // State to control the visibility of the Date and Time pickers
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || scheduledDateTime;
    setShowDatePicker(Platform.OS === 'ios');
    setScheduledDateTime(currentDate);
  };

  useEffect(() => {
    const fetchEligibleUsers = async () => {
      try {
        // Get the current user's location
        const currentUserLocationDoc = doc(db, 'userLocation', user.id);

        const currentUserLocationSnapshot = await getDoc(
          currentUserLocationDoc,
        );

        const currentUserLocationData = currentUserLocationSnapshot.data();

        // Fetch all user locations
        const userLocationsSnapshot = await getDocs(
          collection(db, 'userLocation'),
        );

        const allUserLocations = userLocationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Filter out users within 50km
        const usersWithin50km = allUserLocations.filter(otherUserLocation => {
          if (otherUserLocation.id === user.id) {
            // Skip the current user
            return false;
          }
          const distance = getDistance(
            {
              latitude: currentUserLocationData.location[0],
              longitude: currentUserLocationData.location[1],
            },
            {
              latitude: otherUserLocation.location[0],
              longitude: otherUserLocation.location[1],
            },
          );
          return distance <= 50000; // Distance in meters (50km)
        });

        setEligibleUsers(usersWithin50km);
      } catch (error) {
        console.error('Error fetching user locations:', error);
        Alert.alert('Error', 'Could not fetch user locations.');
      }
    };

    fetchEligibleUsers();
  }, [user]);

  const handleTaskHandover = async () => {
    try {
      // Update the task's employeeID to the selected user's ID
     const taskRef = await performWithRetry(() => doc(db, 'tasks', task.id));
      await performWithRetry(() => updateDoc(taskRef, {
       employeeID: selectedUser,
     }));
      Alert.alert('Success', 'Task handed over successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error handing over task: ', error);
      Alert.alert('Error', 'There was a problem handing over the task.');
    }
  };

  useEffect(() => {
    const fetchLocations = async () => {
      setIsLocationsLoading(true); // Start loading

      try {
        const locationsRef = collection(db, 'locations');
        const querySnapshot = await getDocs(locationsRef);
        const locationsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLocations(locationsData);
        // Set the default location based on the task's current locationID
        const currentLocation = locationsData.find(
          loc => loc.locationID === task.locationID,
        );
        setSelectedLocationId(currentLocation ? currentLocation.id : null);
        setIsLocationsLoading(false);
      } catch (error) {
        console.error('Error signing in: ', error);
      }
    };
    const fetchTaskTypes = async () => {
      setIsTypesLoading(true);
      try {
        const taskTypesRef = collection(db, 'taskTypes');
        const querySnapshot = await getDocs(taskTypesRef);
        const taskTypesData = querySnapshot.docs.map(doc => ({
          id: doc.id, // The document ID
          ...doc.data(),
        }));
        setTaskTypes(taskTypesData);
        // Find the current task's type and set it as selected
        const currentTaskType = taskTypesData.find(
          type => type.taskTypeID === task.taskTypeID,
        );
        setSelectedTaskType(currentTaskType ? currentTaskType.id : null);
      } catch (error) {
        console.error('Error fetching task types:', error);
        Alert.alert('Error', 'Could not load task types.');
      } finally {
        setIsTypesLoading(false);
      }
    };

    fetchTaskTypes();

    fetchLocations();
  }, [task.locationID, task.taskTypeID]);

  const addReminderForTask = async () => {
    try {
      const currentTaskType = taskTypes.find(
        type => type.taskTypeID === task.taskTypeID,
      );

      const reminderMessage = `${
        selectedTaskType.name || currentTaskType.description
      } for ${clientName}`;

      const newReminder = {
        message: reminderMessage,
        date_at: Timestamp.now(), // Set this to the desired time
        user: user.id, // Replace with correct user ID if necessary
        type: 'task',
      };

      await addDoc(collection(db, 'reminders'), newReminder);
      Alert.alert('Success', 'Reminder added successfully');
    } catch (error) {
      console.error('Error adding reminder: ', error);
      Alert.alert('Error', 'There was a problem adding the reminder');
    }
  };

  const handleSave = async () => {
    const taskRef = doc(db, 'tasks', task.id);
    const combinedDateTime = new Date(
      scheduledDate.getFullYear(),
      scheduledDate.getMonth(),
      scheduledDate.getDate(),
      scheduledTime.getHours(),
      scheduledTime.getMinutes(),
    );
    const timestamp = Timestamp.fromDate(combinedDateTime); // Convert to Firestore Timestamp

    if (clientName.length > 30) {
        Alert.alert('Invalid input', 'Client name is long than 30 characters.');
        return;
    }

    try {
      await updateDoc(taskRef, {
        taskStatusID: selectedStatus,
        clientName: clientName,
        locationID: parseInt(selectedLocationId),
        taskTypeID: Number(selectedTaskType),
        scheduledDateTime: timestamp || Timestamp.fromDate(scheduledDateTime),
      });
      Alert.alert('Success', 'Task updated successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'There was a problem updating the task');
      console.error('Error updating task: ', error);
    }
  };

  if (isLocationsLoading || isTypesLoading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Task Details</Text>
      </View>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={styles.section}>Status</Text>
          <Picker
            selectedValue={selectedStatus}
            onValueChange={(itemValue, itemIndex) =>
              setSelectedStatus(itemValue)
            }
            style={styles.picker}>
            {taskStatuses.map(status => (
              <Picker.Item
                key={status.statusID}
                label={status.name}
                value={status.statusID}
              />
            ))}
          </Picker>

          <Text style={styles.section}>Client</Text>
          <TextInput
            style={styles.input}
            value={clientName}
            maxLength={30}
            onChangeText={setClientName}
          />

          <Text style={styles.section}>Location</Text>
          <Picker
            selectedValue={selectedLocationId}
            onValueChange={(itemValue, itemIndex) =>
              setSelectedLocationId(itemValue)
            }
            style={styles.picker}>
            {locations.map(location => (
              <Picker.Item
                key={location.locationID}
                label={`${location.street}, ${location.city}`}
                value={location.locationID.toString()}
              />
            ))}
          </Picker>

          <Text style={styles.section}>Task Type</Text>
          <Picker
            selectedValue={selectedTaskType}
            onValueChange={(itemValue, itemIndex) =>
              setSelectedTaskType(itemValue)
            }
            style={styles.picker}>
            {taskTypes.map(type => (
              <Picker.Item
                key={type.taskTypeID}
                label={type.name}
                value={type.taskTypeID.toString()}
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

          <Text>Select a user within 50km to handover the task to:</Text>
          <Picker
            selectedValue={selectedUser}
            onValueChange={(itemValue, itemIndex) =>
              setSelectedUser(itemValue)
            }>
            {eligibleUsers.map(user => (
              <Picker.Item key={user.id} label={user.name} value={user.id} />
            ))}
          </Picker>
          <Button title="Handover Task" onPress={handleTaskHandover} />

          <TouchableOpacity
            style={styles.saveButton}
            onPress={addReminderForTask}>
            <Text style={styles.saveButtonText}>Add Reminder for Task</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  saveButton: {
    backgroundColor: '#4169E1',
    padding: 15,
    marginTop: 20,
    borderRadius: 5,
  },
  saveButtonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  scrollContainer: {
    flex: 1, // You may not need this line, try with and without it
  },
  section: {
    fontSize: 15,
    marginTop: 10,
    fontWeight: 'bold',
    color: '#415399',
  },
  details: {
    fontSize: 14,
    color: '#000',
  },
  image: {
    width: '100%',
    height: 100,
    backgroundColor: '#eee',
    marginVertical: 8,
  },
  reminderButton: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    marginTop: 20,
  },
  reminderText: {
    fontSize: 18,
  },
  picker: {
    height: 50,
    width: '100%',
  },
});

export default TaskDetailsScreen;
