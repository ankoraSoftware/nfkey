interface TableProps {
  columns: any;
  rowData: any;
  mapRowsUI: any;
}

const Table = ({ columns, rowData, mapRowsUI }: TableProps) => {
  return (
    <div className="flex flex-col mt-10">
      <div className="flex border-b border-b-orange-500">
        {columns.map((col: { id: string; title: string }) => (
          <div
            className="block mb-2 text-sm font-medium text-orange-500 dark:text-white min-w-[200px]"
            key={col.id}
          >
            {col.title}
          </div>
        ))}
      </div>
      {mapRowsUI(rowData)}
    </div>
  );
};

export default Table;
