import React from 'react';
import {create, act} from 'react-test-renderer';
import AddTaskScreen from '../AddTaskScreen'; // Adjust the import path as necessary
import {addTask, addLocation, getTasks} from '../mockData/mockData'; // Adjust the import path as necessary
import RNPickerSelect from 'react-native-picker-select';

jest.mock('react-native-picker-select', () => 'RNPickerSelect');
jest.mock('../mockData/mockData', () => ({
  addTask: jest.fn(),
  addLocation: jest.fn(),
  getTasks: jest.fn(),
  taskTypes: [
    {name: 'Medical Checkup', taskTypeID: 1},
    {name: 'Home Visit', taskTypeID: 2},
  ],
}));

describe('AddTaskScreen Component', () => {
  // Define a mock navigation object
  const mockNavigation = {
    goBack: jest.fn(),
  };

  // Mock route parameters
  const mockRoute = {
    params: {user: {userID: 1, fullName: 'Test User'}},
  };

  it('renders correctly', () => {
    let tree;
    act(() => {
      tree = create(
        <AddTaskScreen navigation={mockNavigation} route={mockRoute} />,
      );
    });

    expect(tree.toJSON()).toMatchSnapshot();
  });

  it('should handle adding a task', () => {
    let root;
    act(() => {
      root = create(
        <AddTaskScreen navigation={mockNavigation} route={mockRoute} />,
      );
    });

    // Simulate user input
    const clientNameInput = root.root.findByProps({
      placeholder: 'Client Name',
    }).props;
    act(() => clientNameInput.onChangeText('Test Client'));

    const cityInput = root.root.findByProps({placeholder: 'City'}).props;
    act(() => cityInput.onChangeText('Test City'));

    // ... Simulate input for street, province, postalCode ...

    // Simulate pressing the Add Task button
    const button = root.root.findByType('Button').props;
    act(() => button.onPress());

    // Expect the addTask and addLocation to have been called
    expect(addTask).toHaveBeenCalledWith(expect.any(Object));
    expect(addLocation).toHaveBeenCalledWith(expect.any(Object));

    // Expect navigation.goBack to be called
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  // More tests can be added to cover different functionalities like selecting a task type, etc.
});
