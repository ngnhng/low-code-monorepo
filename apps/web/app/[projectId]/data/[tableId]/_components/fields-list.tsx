interface FieldListProps<ColType> {
  data: ColType[];
}

export function FieldList<ColType>({ data }: FieldListProps<ColType>) {
  if (data.length === 0) {
    return <div> No data </div>;
  }

  const keys = Object.keys(data[0]!);
  return (
    <div>
      {keys.map((key) => (
        <div> {String(key)} </div>
      ))}
    </div>
  );
}
