import {db} from './config.jsx';
import {doc, addDoc, setDoc, collection} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const backupData = require('./backup.json');

/* eslint-disable prettier/prettier */
export const taskTypes = [
  {
    taskTypeID: 1,
    name: 'Medical Checkup',
    description: 'Routine medical examination',
  },
  {
    taskTypeID: 2,
    name: 'Medication Administration',
    description: 'Administering prescribed medications',
  },
  {
    taskTypeID: 3,
    name: 'Physical Therapy',
    description: 'Physical rehabilitation exercises',
  },
  {
    taskTypeID: 4,
    name: 'Home Visit',
    description: "Visit to the patient's home",
  },
];

export const taskStatuses = [
  {
    statusID: 1,
    name: 'Pending',
    description: 'Task has not started',
  },
  {
    statusID: 2,
    name: 'In Progress',
    description: 'Task is currently in progress',
  },
  {
    statusID: 3,
    name: 'Completed',
    description: 'Task has been completed',
  },
];

export const users = [
  {
    userID: 1,
    userName: 'nurse1',
    password: 'password1',
    role: 'Nurse',
    fullName: 'Nurse One',
  },
  {
    userID: 2,
    userName: 'nurse2',
    password: 'password2',
    role: 'Nurse',
    fullName: 'Nurse Two',
  },
];
export const locations = [
  {
    locationID: 1,
    city: 'Cityville',
    street: '123 Main Street',
    province: 'Stateville',
    postalCode: '12345',
  },
  {
    locationID: 2,
    city: 'Townsville',
    street: '456 Oak Avenue',
    province: 'Stateville',
    postalCode: '56789',
  },
];

export const tasks = [
  {
    taskID: 1,
    clientName: 'John Doe',
    employee: users[0],
    location: locations[0],
    status: taskStatuses[2], // Completed
    taskType: taskTypes[0], // Medical Checkup
    scheduledDateTime: '2023-11-09T10:00:00Z',
    createdDateTime: '2023-11-01T08:30:00Z',
  },
  {
    taskID: 2,
    clientName: 'Jane Smith',
    employee: users[0],
    location: locations[1],
    status: taskStatuses[1], // In Progress
    taskType: taskTypes[1], // Medication Administration
    scheduledDateTime: '2023-11-10T14:30:00Z',
    createdDateTime: '2023-11-02T11:45:00Z',
  },
  {
    taskID: 3,
    clientName: 'Bob Johnson',
    employee: users[0],
    location: locations[0],
    status: taskStatuses[0], // Pending
    taskType: taskTypes[2], // Physical Therapy
    scheduledDateTime: '2023-11-11T09:15:00Z',
    createdDateTime: '2023-11-03T10:20:00Z',
  },
  {
    taskID: 4,
    clientName: 'Bob Johnson',
    employee: users[1],
    location: locations[1],
    status: taskStatuses[0], // Pending
    taskType: taskTypes[1], // Medication Administration
    scheduledDateTime: '2023-11-12T09:15:00Z',
    createdDateTime: '2023-11-04T10:20:00Z',
  },
];

export const reminders = [];

export const getTasks = () => tasks;

export const addTask = task => {
  tasks.push({...task, taskID: tasks.length + 1});
};

export const addReminder = reminder => {
  const currentUserID = 'BG9YLQD3lyomtoPfa817'; // Replace with the actual user ID

  // Incremental ID for the new reminder
  const newReminderID = backupData.users[0].reminders.length + 1;

  backupData.users[0].reminders.push({...reminder, id: String(newReminderID)});

  // Assuming users have a unique document ID within the "users" collection
  const userDocRef = doc(db, 'users', currentUserID);

  // Add the reminder to a subcollection named "reminders" under the user document
  addDoc(collection(userDocRef, 'reminders'), {
    reminder: reminder,
    id: String(newReminderID),
  })
    .then(() => {
      console.log('Reminder data submitted successfully');
    })
    .catch(error => {
      console.error('Error submitting reminder data:', error);
    });
};

export const getStatuses = () => backupData.taskStatuses;

export const getTaskTypes = () => backupData.taskTypes;

export const getStatus = statusName => {
  const foundStatus = backupData.taskStatuses.find(
    status => status.name === statusName,
  );
  return foundStatus ?? null;
};

export const getTaskType = taskTypeName => {
  const foundType = backupData.taskTypes.find(
    taskType => taskType.name === taskTypeName,
  );
  return foundType ?? null;
};

export const addLocation = newLocation => {
  // Generate a unique locationID for the new location
  const newLocationID = backupData.locations.length + 1;

  // Add the new location to the locations array
  backupData.locations.push({locationID: newLocationID, ...newLocation});

  // Assuming each location has a unique document ID within the "locations" collection
  const locationDocRef = doc(db, 'locations', newLocationID.toString());

  // Add the new location to Firestore
  setDoc(locationDocRef, {
    ...newLocation,
    locationID: newLocationID.toString(),
  })
    .then(() => {
      console.log('Location data submitted successfully');
    })
    .catch(error => {
      console.error('Error submitting location data:', error);
    });
};

export const editLocation = newLocation => {
  // Edit the existing location with the updated values
  var foundLocation = locations.find(
    location => location.locationID === newLocation.locationID,
  );

  if (foundLocation)
    console.log(
      'foundLocation: ' + foundLocation.city + ', ' + foundLocation.locationID,
    );
  else
    console.log(
      'no location record found with the ID ' + newLocation.locationID,
    );

  foundLocation.city = newLocation.city;
  foundLocation.postalCode = newLocation.postalCode;
  foundLocation.province = newLocation.province;
  foundLocation.street = newLocation.street;
  return foundLocation;
};

export const editTask = newTask => {
  // Edit the existing task with new values
  var foundTask = tasks.find(task => task.taskID === newTask.taskID);
  if (foundTask)
    console.log(
      'foundTask: ' +
        foundTask.status.name +
        ', ' +
        newTask.status.name +
        ', ' +
        newTask.employee.fullName,
    );

  foundTask.status = newTask.status; //getStatus(newTask.status.name);
  foundTask.location = newTask.location;
  foundTask.employee = newTask.employee;
  foundTask.scheduledDateTime = newTask.scheduledDateTime;
};

export const performWithRetry = async (asyncFunc, maxRetries = 5, delay = 1000) => {
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      return await asyncFunc();
    } catch (error) {
      attempts++;
      if (attempts >= maxRetries) {
        throw error;
      }

      console.log(`Retrying operation... attempt ${attempts}`);

      // Exponential backoff delay
      await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, attempts)));
    }
  }
};