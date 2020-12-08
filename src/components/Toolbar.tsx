import React from 'react';
import { canvasState } from '../state/canvasState';
import classes from './Toolbar.module.css';

export const Toolbar = () => {
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
          canvasState.addCanvasObject({ klass: 'circle', fill: 'green' });
        }}
      >
        Circle
      </button>
    </div>
  );
};
