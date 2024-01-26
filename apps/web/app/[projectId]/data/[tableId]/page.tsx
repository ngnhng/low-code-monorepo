'use client';

import { FC, useEffect, useRef, useState } from 'react';
import {
  DataSheetGrid,
  DataSheetGridRef,
  checkboxColumn,
  textColumn,
  keyColumn,
  createAddRowsComponent,
} from 'react-datasheet-grid';

// Import the style only once in your app!
import 'react-datasheet-grid/dist/style.css';
import {
  AddRowsComponentProps,
  Operation,
} from 'react-datasheet-grid/dist/types';

type DataType = {
  active: boolean;
  firstName: string;
  lastName: string;
};

const AddRows = createAddRowsComponent({
  button: 'Ajouter', // Add
  unit: 'lignes', // rows
});

const AnotherAddRows = () => {
  return <div>Another add rows: </div>;
};

const Example = () => {
  const [data, setData] = useState<DataType[]>([
    { active: true, firstName: 'Elon', lastName: 'Musk' },
    { active: false, firstName: 'Jeff', lastName: 'Bezos' },
  ]);

  const ref = useRef<DataSheetGridRef>(null);

  const handleOnChange = (
    value: Record<string, any>[],
    operations: Operation[],
  ) => {
    const newData = value.map((item: Record<string, any>) => ({
      active: item.active as boolean,
      firstName: item.firstName as string,
      lastName: item.lastName as string,
    }));
    setData(newData);
  };

  const columns = [
    { ...keyColumn('active', checkboxColumn), title: <div>Active</div> },
    { ...keyColumn('firstName', textColumn), title: 'First name' },
    { ...keyColumn('lastName', textColumn), title: 'Last name' },
  ];

  useEffect(() => {
    ref.current?.setSelection({
      min: { col: 'firstName', row: 0 },
      max: { col: 2, row: 3 },
    });
  }, []);

  return (
    <>
      <DataSheetGrid
        ref={ref}
        value={data}
        onChange={handleOnChange}
        columns={columns}
        addRowsComponent={AnotherAddRows}
      />

      <button onClick={() => ref.current?.setActiveCell({ col: 1, row: 0 })} />
    </>
  );
};

export default function Page() {
  return (
    <>
      <Example />
    </>
  );
}
