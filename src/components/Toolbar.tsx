import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';

import { CanvasContext } from '../state/canvasContext';

import classes from './Toolbar.module.css';

export const Toolbar = observer(() => {
  const canvasState = useContext(CanvasContext);

  console.log('Rendering Toolbar', toJS(canvasState.selected));

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
            fill: 'green',
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
    </div>
  );
});
