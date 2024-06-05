import {
  taskTypes,
  taskStatuses,
  users,
  locations,
  tasks,
  getTasks,
  addTask,
  getStatus,
  getTaskType,
  addLocation,
  editLocation,
  editTask,
} from '../mockData/mockData';

describe('Mobile Scheduling App Tests', () => {
  describe('Data Arrays', () => {
    it('should have predefined task types', () => {
      expect(taskTypes).toBeDefined();
      expect(taskTypes.length).toBeGreaterThan(0);
    });

    it('should have predefined task statuses', () => {
      expect(taskStatuses).toBeDefined();
      expect(taskStatuses.length).toBeGreaterThan(0);
    });
  });

  describe('Utility Functions', () => {
    describe('getTasks', () => {
      it('should return the current list of tasks', () => {
        const currentTasks = getTasks();
        expect(currentTasks).toEqual(tasks);
      });
    });

    describe('addTask', () => {
      it('should add a new task to the tasks array', () => {
        const newTask = {
          clientName: 'New Client',
          // other task details...
        };
        addTask(newTask);
        const currentTasks = getTasks();
        expect(currentTasks).toContainEqual(expect.objectContaining(newTask));
      });
    });

    describe('getStatus', () => {
      it('should return the correct status object for a given status name', () => {
        const status = getStatus('Pending');
        expect(status).toEqual(expect.objectContaining({name: 'Pending'}));
      });

      it('should return null for an invalid status name', () => {
        const status = getStatus('InvalidStatus');
        expect(status).toBeNull();
      });
    });

    describe('getTaskType', () => {
      it('should return the correct task type object for a given task type name', () => {
        const taskType = getTaskType('Medical Checkup');
        expect(taskType).toEqual(
          expect.objectContaining({name: 'Medical Checkup'}),
        );
      });

      it('should return null for an invalid task type name', () => {
        const taskType = getTaskType('InvalidType');
        expect(taskType).toBeNull();
      });
    });

    describe('addLocation', () => {
      it('should add a new location to the locations array', () => {
        const newLocation = {city: 'New City' /* other details */};
        addLocation(newLocation);
        expect(locations).toContainEqual(expect.objectContaining(newLocation));
      });
    });

    describe('editLocation', () => {
      it('should edit an existing location', () => {
        const updatedLocation = {
          locationID: 1,
          city: 'Updated City' /* other details */,
        };
        editLocation(updatedLocation);
        expect(locations.find(loc => loc.locationID === 1)).toEqual(
          expect.objectContaining(updatedLocation),
        );
      });
    });

    describe('editTask', () => {
      it('should edit an existing task', () => {
        const updatedTask = {
          taskID: 1,
          status: {name: 'Completed'} /* other details */,
        };
        editTask(updatedTask);
        expect(tasks.find(task => task.taskID === 1).status.name).toBe(
          'Completed',
        );
      });
    });
  });

  // Additional tests for boundary cases, error handling, and function interactions...
});
