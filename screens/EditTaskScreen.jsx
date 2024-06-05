/* eslint-disable prettier/prettier */
// EditTaskScreen.jsx
import React, {useState, useEffect} from 'react';
import {View, TextInput, StyleSheet, Button, Text, TouchableHighlight} from 'react-native';
import {editTask, taskTypes, editLocation, taskStatuses, users} from '../mockData/mockData'; // Adjust the import path as necessary
import RNPickerSelect from 'react-native-picker-select';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const EditTaskScreen = ({navigation, route}) => {
    //const [clientName, setClientName] = useState('');
    const [city, setCity] = useState('');
    const [street, setStreet] = useState('');
    const [province, setProvince] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [selectedTaskType, setSelectedTaskType] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [scheduledDateTimePicker, setScheduledDateTimePicker] = useState(new Date());
    const [isTimePickerVisible, setTimePickerVisibility] = useState(false);

    const {task} = route.params;
    console.log('editTask loaded - task:', task);
    
    const [isInitialMount, setIsInitialMount] = useState(true);
    // Set the initial state based on the loaded task
    useEffect(() => {
        console.log('EditTaskScreen useEffect - task:', task);
        if (!isInitialMount) {
            console.log('Updating state based on loaded task');
            //setClientName(task.clientName || ''); // Set other properties similarly
            setCity(task.location.city || '');
            setStreet(task.location.street || '');
            setProvince(task.location.province || '');
            setPostalCode(task.location.postalCode || '');
            //setSelectedTaskType(task.taskType || null);
            setSelectedUser(task.employee || null);
            setSelectedStatus(task.status || null);
            setScheduledDateTimePicker(new Date(task.scheduledDateTime) || null);
            console.log('Task Status: ' + task.status.name + ' /  Asssigned User: ' + task.employee.fullName);
        } else {
            console.log('Initial mount');
            setIsInitialMount(false);
        }
    }, [task, isInitialMount]);

    const handleEditTask = () => {
        // Call editTask from MockData to update the task list
        // Hardcoded values
//         const scheduledDateTime = new Date(
//             Date.now() + 2 * 24 * 60 * 60 * 1000,
//         ).toISOString(); // Current time + 2 days

        // Predefined values for status and taskType
        const location = {
            locationID: task.location.locationID,
            city: city,
            street: street,
            province: province,
            postalCode: postalCode,
        };
        console.log('editTask location: ' + task.location.city + ', ' + task.location.locationID);
        editLocation(location);

        editTask({
            taskID: task.taskID,
            clientName: task.clientName, // You can adjust this field as needed
            scheduledDateTime: new Date(scheduledDateTimePicker).toISOString(),
            status: selectedStatus,
            taskType: selectedTaskType,
            location: location,
            employee: selectedUser,
        });
        //console.log(updatedTasks); // make sure the new task is included
        console.log('editTask params: ' + task.clientName + ', ' + task.status.name + ', ' + task.taskType.name + ', ' + location.city + ', ' + selectedUser.fullName+ ', ' + new Date(scheduledDateTimePicker).toISOString());
        navigation.navigate('TaskDetails', {task: task});
    };

      const showTimePicker = () => {
        setTimePickerVisibility(true);
      };

      const hideTimePicker = () => {
        setTimePickerVisibility(false);
      };

      const handleConfirmTime = date => {
        setScheduledDateTimePicker(date);
        hideTimePicker();
      };

    return (
        <View style={styles.container}>

            <View style={styles.header}>
                <Text style={styles.headerTitle}>{task.taskType.name} for {task.clientName}</Text>
            </View>
            <View style={styles.mainUpdateSection}>
                <View style={styles.rowContainer}>
                    <View style={styles.column}>
                        <Text style={styles.smallInputTitle}>Status:</Text>
                    </View>
                    <View style={styles.column}>
                        <RNPickerSelect
                            placeholder={{
                                label: 'Select Task Status',
                                value: {selectedStatus},
                            }}
                            items={taskStatuses.map(type => ({
                                label: type.name,
                                value: type,
                            }))}
                            onValueChange={value => {setSelectedStatus(value)}}
                            value={selectedStatus}
                            style={pickerSelectStyles}
                        />
                    </View>
                </View>
                {/* Assigned to */}
                <View style={styles.rowContainer}>
                    <View style={styles.column}>
                        <Text style={[styles.smallInputTitle]}>Assigned to:</Text>
                    </View>
                    <View style={styles.column}>
                        <RNPickerSelect
                            placeholder={{
                                label: 'Select Assignee',
                                value: {selectedUser},
                            }}
                            items={users.map(type => ({
                                label: type.fullName,
                                value: type, // Keep the user object as the value
                            }))}
                            onValueChange={value => {
                                console.log('Selected User:', value);
                                setSelectedUser(value);
                            }}
                            value={selectedUser} // Display the user's name
                            style={pickerSelectStyles}
                        />
                    </View>
                </View>
            </View>
            
           {/* 
            <Text style={styles.locationTitle}>Task Type:</Text>
            <RNPickerSelect
            placeholder={{
                label: 'Select Task Type',
                value: {selectedTaskType},
            }}
            items={taskTypes.map(type => ({
                label: type.name,
                value: type,
            }))}
            onValueChange={value => setSelectedTaskType(value)}
            value={selectedTaskType}
            style={pickerSelectStyles}
            />
            */}
            <Text style={styles.inputTitle}>Location:</Text>
            <Text style={styles.locationTitle}>Street</Text>
            <TextInput
            style={styles.input}
            placeholder="Street"
            value={street}
            onChangeText={setStreet}
            />
            <Text style={styles.locationTitle}>City</Text>
            <TextInput
            style={styles.input}
            placeholder="City"
            value={city}
            onChangeText={setCity}
            />
            <View style={styles.rowContainer}>
                <View style={styles.column}>
                    <Text style={styles.locationTitle}>Province</Text>
                    <TextInput
                    style={styles.smallInput}
                    placeholder="Province"
                    value={province}
                    onChangeText={setProvince}
                    />
                </View>
                <View style={styles.column}>
                    <Text style={styles.locationTitle}>Postal Code</Text>
                    <TextInput
                    style={styles.smallInput}
                    placeholder="Postal Code"
                    value={postalCode}
                    onChangeText={setPostalCode}
                    />
                </View>
            </View>

         <TouchableHighlight
          style={styles.buttons}
          underlayColor="#HHHHHH"
          onPress={showTimePicker}>
          <Text>Select Time</Text>
        </TouchableHighlight>
        <DateTimePickerModal
            isVisible={isTimePickerVisible}
            value={scheduledDateTimePicker}
            mode="datetime"
            is24Hour={true}
            onConfirm={date => {
              handleConfirmTime(date);
            }}
            onCancel={hideTimePicker}
          />
            {/* Reminder Section */}

            <View style={{marginTop: 20}}>
                <Button title="Update Task" onPress={handleEditTask}/>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: '#fff',
  },
  mainUpdateSection: {
    backgroundColor: '#eee',
    marginHorizontal: -10,
    paddingHorizontal: 10,
    paddingBottom: 5,
    marginBottom: 20,
    borderRadius: 10,
  },
  input: {
    marginBottom: 10,
    height: 40,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    transform: [{ scaleX: 1 }, { scaleY: 1 }],

  },
  smallInput: {
    marginBottom: 10,
    height: 40,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
  },
  inputTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  smallInputTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 17,
  },
  locationTitle: {
    fontSize: 10,
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#415399',
  },

  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  column: {
    flex: 1,
    marginRight: 10, // Adjust the margin as needed
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    marginBottom: 0,
    marginTop: 0,
    marginRight: -10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    transform: [{ scaleX: 0.95 }, { scaleY: 0.95 }],
  },
  inputAndroid: {
    marginBottom: 0,
    marginTop: 0,
    marginRight: -10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    transform: [{ scaleX: 0.93 }, { scaleY: 0.92 }],
  },
});


export default EditTaskScreen;
