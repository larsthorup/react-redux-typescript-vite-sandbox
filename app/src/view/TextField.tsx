import React, { useState } from 'react';

const TextField: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ label, value, onChange }) => {
  const [editedValue, setEditedValue] = useState(value); // TODO
  const changeHandler: React.ChangeEventHandler<HTMLInputElement> = (ev) => {
    setEditedValue(ev.target.value);
  };
  const saveHandler = () => {
    onChange(editedValue);
  };
  return (
    <>
      <input value={editedValue} placeholder={label} onChange={changeHandler} />
      <button onClick={saveHandler}>{`Save ${label}`}</button>
    </>
  );
};

export default TextField;
