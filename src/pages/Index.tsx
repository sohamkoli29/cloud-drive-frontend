import { DriveProvider } from '../context/DriveContext';
import Drive from './Drive';

const Index = () => {
  return (
    <DriveProvider>
      <Drive />
    </DriveProvider>
  );
};

export default Index;
