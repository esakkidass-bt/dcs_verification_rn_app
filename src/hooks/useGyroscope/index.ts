import {useEffect, useState} from 'react';
import {gyroscope, SensorData} from 'react-native-sensors';

// Define the shape of the gyroscope data
interface GyroscopeData {
  x: number;
  y: number;
  z: number;
}

const useGyroscope = (): GyroscopeData => {
  const [data, setData] = useState<GyroscopeData>({x: 0, y: 0, z: 0});

  useEffect(() => {
    // Subscribe to gyroscope updates
    const subscription = gyroscope.subscribe(
      ({x, y, z}: SensorData) => {
        setData({x, y, z});
      },
      (error: any) => {
        console.error('Gyroscope subscription error:', error);
      },
    );

    // Cleanup subscription on component unmount
    return () => subscription.unsubscribe();
  }, []);

  return data;
};

export default useGyroscope;
