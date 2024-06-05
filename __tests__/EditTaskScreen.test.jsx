import React from 'react';
import {create, act} from 'react-test-renderer';
import EditTaskScreen from '../EditTaskScreen'; // Adjust the import path as necessary
import {editTask, editLocation} from '../mockData/mockData'; // Adjust the import path as necessary

jest.mock('react-native-picker-select', () => 'RNPickerSelect');
jest.mock('../mockData/mockData', () => ({
  editTask: jest.fn(),
  editLocation: jest.fn(),
  taskStatuses: [
    {name: 'Pending', statusID: 1},
    {name: 'Completed', statusID: 2},
  ],
  users: [
    {fullName: 'User One', userID: 1},
    {fullName: 'User Two', userID: 2},
  ],
  taskTypes: [
    {name: 'Medical Checkup', taskTypeID: 1},
    {name: 'Home Visit', taskTypeID: 2},
  ],
}));

describe('EditTaskScreen Component', () => {
  // Mock route and navigation
  const mockRoute = {
    params: {
      task: {
        taskID: 1,
        clientName: 'John Doe',
        location: {
          locationID: 1,
          city: 'Sample City',
          street: '123 Sample Street',
          province: 'Sample Province',
          postalCode: '12345',
        },
        taskType: {name: 'Medical Checkup', taskTypeID: 1},
        employee: {fullName: 'User One', userID: 1},
        status: {name: 'Pending', statusID: 1},
      },
    },
  };

  const mockNavigation = {
    goBack: jest.fn(),
  };

  it('renders correctly', () => {
    let tree;
    act(() => {
      tree = create(
        <EditTaskScreen route={mockRoute} navigation={mockNavigation} />,
      );
    });

    expect(tree.toJSON()).toMatchSnapshot();
  });

  it('should handle editing a task', () => {
    let root;
    act(() => {
      root = create(
        <EditTaskScreen route={mockRoute} navigation={mockNavigation} />,
      );
    });

    // Simulate user input
    const cityInput = root.root.findByProps({placeholder: 'City'}).props;
    act(() => cityInput.onChangeText('New City'));

    const streetInput = root.root.findByProps({placeholder: 'Street'}).props;
    act(() => streetInput.onChangeText('New Street'));

    // ... Simulate input for province, postalCode ...

    // Simulate pressing the Update Task button
    const button = root.root.findByType('Button').props;
    act(() => button.onPress());

    // Expect the editTask and editLocation to have been called
    expect(editTask).toHaveBeenCalledWith(expect.any(Object));
    expect(editLocation).toHaveBeenCalledWith(expect.any(Object));

    // Expect navigation.goBack to be called
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  // More tests can be added to cover different functionalities like selecting a task type, status, etc.
});
