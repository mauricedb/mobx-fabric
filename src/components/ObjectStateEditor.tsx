import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';

import { CanvasContext } from '../state/canvasContext';

import classes from './Toolbar.module.css';
import { LabeledInput } from './LabeledInput';
import { CanvasObjectState } from '../state/canvasState';

type Props = {
  object: CanvasObjectState | null;
};
export const ObjectStateEditor = ({ object }: Props) => {
  if (!object) {
    return null;
  }

  return (
    <>
      <LabeledInput label="Fill:" type="color" object={object} name="fill" />
      <LabeledInput label="Top:" type="number" object={object} name="top" />
      <LabeledInput label="Left:" type="number" object={object} name="left" />
      <LabeledInput
        label="Height:"
        type="number"
        object={object}
        name="height"
      />
      <LabeledInput
        label="Scale-Y:"
        type="number"
        object={object}
        name="scaleY"
      />
      <LabeledInput label="Width:" type="number" object={object} name="width" />
      <LabeledInput
        label="Scale-X:"
        type="number"
        object={object}
        name="scaleX"
      />
      <LabeledInput label="Angle:" type="number" object={object} name="angle" />
    </>
  );
};
