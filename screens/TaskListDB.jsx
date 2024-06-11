import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import {db} from '../mockData/config'; // Ensure this points to your Firebase configuration file
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import {UserContext} from '../UserContext';
import AddIcon from '../assets/add-white.png'; // Make sure this path is correct
import {useFocusEffect} from '@react-navigation/native';
import {Picker} from '@react-native-picker/picker';
import {requestLocationPermission} from '../helpers/LocationPermission';

const TaskListDB = ({navigation}) => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const {user} = useContext(UserContext);

  const [allTasks, setAllTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);

  const sortOptions = {
    CLIENT_NAME: 'clientName',
    LOCATION_CITY: 'city',
    LOCATION_STREET: 'street',
    TASK_TYPE: 'typeName',
    SCHEDULED_TIME: 'scheduledDateTime',
  };

  // Add a new state for the current sort option
  const [sortOption, setSortOption] = useState(sortOptions.CLIENT_NAME);

  const [clientNameFilter, setClientNameFilter] = useState('');
  const [addressFilter, setAddressFilter] = useState('');

  const sortTasks = (a, b) => {
    let fieldA, fieldB;

    switch (sortOption) {
      case sortOptions.CLIENT_NAME:
        fieldA = a.clientName.toLowerCase();
        fieldB = b.clientName.toLowerCase();
        break;
      case sortOptions.LOCATION_CITY:
        fieldA = a.location?.city.toLowerCase();
        fieldB = b.location?.city.toLowerCase();
        break;
      case sortOptions.LOCATION_STREET:
        fieldA = a.location?.street.toLowerCase();
        fieldB = b.location?.street.toLowerCase();
        break;
      case sortOptions.TASK_TYPE:
        fieldA = a.type?.name.toLowerCase();
        fieldB = b.type?.name.toLowerCase();
        break;
      case sortOptions.SCHEDULED_TIME:
        // Compare date objects directly
        return a.scheduledDateTime - b.scheduledDateTime;
      default:
        return 0;
    }

    if (fieldA < fieldB) return -1;
    if (fieldA > fieldB) return 1;
    return 0;
  };

  const applyFilters = tasks => {
    return tasks.filter(task => {
      const matchesClientName = task.clientName
        .toLowerCase()
        .includes(clientNameFilter.toLowerCase());
      const matchesAddress =
        task.location.street
          .toLowerCase()
          .includes(addressFilter.toLowerCase()) ||
        task.location.city.toLowerCase().includes(addressFilter.toLowerCase());
      return matchesClientName && matchesAddress;
    });
  };

  const filterTasks = () => {
    let filtered = tasks;
    if (clientNameFilter) {
      filtered = filtered.filter(task =>
        task.clientName.toLowerCase().includes(clientNameFilter.toLowerCase()),
      );
    }

    if (addressFilter) {
      filtered = filtered.filter(
        task =>
          task.location.street
            .toLowerCase()
            .includes(addressFilter.toLowerCase()) ||
          task.location.city
            .toLowerCase()
            .includes(addressFilter.toLowerCase()),
      );
    }

    // Apply the sorting function
    filtered = filtered.sort(sortTasks);
    setFilteredTasks(filtered);
  };

  const fetchTasks = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await requestLocationPermission(user);
    } catch (e) {
      console.error('ERROR FETCHING LOCATION PERMISSION: ', e);
    }

    try {
      const tasksRef = collection(db, 'tasks');
      const q = query(tasksRef, where('employeeID', '==', user.id));
      const tasksQuerySnapshot = await getDocs(q);

      const tasksWithDetails = await Promise.all(
        tasksQuerySnapshot.docs.map(async taskDoc => {
          const taskData = taskDoc.data();

          // Fetch location details
          const locationDocRef = doc(
            db,
            'locations',
            taskData.locationID.toString(),
          );
          const locationDoc = await getDoc(locationDocRef);

          // Fetch task status details
          const taskStatusDocRef = doc(
            db,
            'taskStatuses',
            taskData.taskStatusID.toString(),
          );
          const taskStatusDoc = await getDoc(taskStatusDocRef);

          // Fetch task type details
          const taskTypeDocRef = doc(
            db,
            'taskTypes',
            taskData.taskTypeID.toString(),
          );
          const taskTypeDoc = await getDoc(taskTypeDocRef);

          // Convert Firestore timestamp to JavaScript Date object
          const timestamp = taskData.scheduledDateTime;
          const date = new Date(
            timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000,
          );

          // Format date and time
          const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          };
          const formattedDateTime = date.toLocaleDateString('en-US', options);

          return {
            id: taskDoc.id, // Add this line to uniquely identify each task
            ...taskData,
            scheduledDateTime: formattedDateTime,
            location: locationDoc.exists() ? locationDoc.data() : {},
            status: taskStatusDoc.exists() ? taskStatusDoc.data() : {},
            type: taskTypeDoc.exists() ? taskTypeDoc.data() : {},
          };
        }),
      );
      const filteredTasks = applyFilters(tasksWithDetails);
      const sortedTasks = filteredTasks.sort(sortTasks);
      setTasks(sortedTasks);
      // setTasks(tasksWithDetails);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    // fetchTasks();
    filterTasks();
  }, [addressFilter, clientNameFilter]);

  useFocusEffect(
    React.useCallback(() => {
      console.log('RE FETCHING TASKS');
      fetchTasks();

      return () => {
        // You can perform any cleanup tasks here if necessary
      };
    }, [user]),
  );

  const renderItem = ({item}) => (
    <TouchableOpacity
      style={styles.taskItem}
      onPress={() => navigation.navigate('TaskDetails', {task: item})}>
      <Text style={styles.taskTitle}>
        {item.type?.name} for {item.clientName}
      </Text>
      <Text style={styles.taskLocation}>
        {item.location?.street}, {item.location?.city},{' '}
        {item.location?.postalCode}
      </Text>
      <Text style={styles.taskTime}>{item.scheduledDateTime}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  return (
    <>
      <View style={styles.container}>
        <Picker
          selectedValue={sortOption}
          onValueChange={(itemValue, itemIndex) => setSortOption(itemValue)}>
          <Picker.Item label="Client Name" value={sortOptions.CLIENT_NAME} />
          <Picker.Item label="City" value={sortOptions.LOCATION_CITY} />
          <Picker.Item label="Street" value={sortOptions.LOCATION_STREET} />
          <Picker.Item label="Task Type" value={sortOptions.TASK_TYPE} />
          <Picker.Item
            label="Scheduled Time"
            value={sortOptions.SCHEDULED_TIME}
          />
        </Picker>

        <TextInput
          style={styles.filterInput}
          placeholder="Filter by client name"
          maxLength={30}
          value={clientNameFilter}
          onChangeText={setClientNameFilter}
        />
        <TextInput
          style={styles.filterInput}
          placeholder="Filter by address (city/street)"
          maxLength={100}
          value={addressFilter}
          onChangeText={setAddressFilter}
        />

        <FlatList
          data={filteredTasks.length > 0 ? filteredTasks : tasks}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddTaskScreen', {user})}>
          <Image source={AddIcon} style={styles.addIcon} />
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  filterInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    margin: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  taskItem: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  taskLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  taskTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#1e90ff',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  addIcon: {
    width: 24,
    height: 24,
  },
  loader: {
    marginTop: 50,
  },
});

export default TaskListDB;
