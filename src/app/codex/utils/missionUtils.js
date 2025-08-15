import { useState, useEffect } from 'react';

export const useMissionState = (initialObjectives) => {
  const [objectives, setObjectives] = useState(initialObjectives);

  useEffect(() => {
    setObjectives(initialObjectives);
  }, [initialObjectives]);

  const toggleObjective = (text) => {
    setObjectives((prevObjectives) =>
      prevObjectives.map((obj) =>
        obj.text === text ? { ...obj, completed: !obj.completed } : obj
      )
    );
  };

  return {
    objectives,
    toggleObjective,
  };
};
