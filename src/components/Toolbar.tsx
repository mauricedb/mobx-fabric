import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';

import { CanvasContext } from '../state/canvasContext';

import classes from './Toolbar.module.css';
import { LabeledInput } from './LabeledInput';
import { ObjectStateEditor } from './ObjectStateEditor';

export const Toolbar = observer(() => {
  const canvasState = useContext(CanvasContext);
  const selected =
    canvasState.selected.length === 1 ? canvasState.selected[0] : null;
  console.log('Rendering Toolbar');

  return (
    <div className={classes.toolbar}>
      <button
        onClick={() => {
          canvasState.addCanvasObject({ klass: 'rect' });
        }}
      >
        Rectangle
      </button>
      <button
        onClick={() => {
          canvasState.addCanvasObject({
            klass: 'circle',
            fill: '#00FF00',
            left: 500,
          });
        }}
      >
        Circle
      </button>
      <button
        onClick={() => {
          canvasState.connectSelected();
        }}
        disabled={canvasState.selected.length !== 2}
      >
        Connect
      </button>
      <ObjectStateEditor object={selected} />
    </div>
  );
});
