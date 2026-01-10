import { useEffect } from 'react';
import { NeuralScene } from './components/Scene/NeuralScene';
import { SidePanel } from './components/UI/SidePanel';
import { CreateNodeButton } from './components/UI/CreateNodeButton';
import { useGraphStore } from './store/graphStore';
import { useUIStore } from './store/uiStore';
import { loadFromLocalStorage } from './utils/storage';
import { sampleNeurons, sampleConnections } from './utils/sampleData';
import './App.css';

function App() {
  const loadData = useGraphStore((state) => state.loadData);
  const isPanelOpen = useUIStore((state) => state.isPanelOpen);

  // Load data from localStorage or use sample data
  useEffect(() => {
    const savedData = loadFromLocalStorage();

    if (savedData && savedData.neurons.length > 0) {
      // Load saved data
      loadData(savedData.neurons, savedData.connections);
    } else {
      // Initialize with sample data
      loadData(sampleNeurons, sampleConnections);
    }
  }, [loadData]);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <NeuralScene />
      <CreateNodeButton />
      {isPanelOpen && <SidePanel />}
    </div>
  );
}

export default App;
