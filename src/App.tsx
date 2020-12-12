import React from 'react';

import { Fabric } from './components/Fabric';
import { Toolbar } from './components/Toolbar';

import { CanvasContext, canvasState } from './state/canvasContext';

function App() {
  return (
    <CanvasContext.Provider value={canvasState}>
      <div>
        <Toolbar />
        <Fabric />
      </div>
    </CanvasContext.Provider>
  );
}

export default App;
