import TestRenderer from 'react-test-renderer';
import React from 'react';

import TaskList from '../screens/TaskList';

function MyComponent() {
  return (
    <div>
      <TaskList />
    </div>
  );
}

function SubComponent() {
  return <p className="sub">Sub</p>;
}

describe('my beverage', () => {
  test('is delicious', () => {
    const testRenderer = TestRenderer.create(<MyComponent />);
  });
});
