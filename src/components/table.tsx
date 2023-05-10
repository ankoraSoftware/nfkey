import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import React, { useState } from "react";
import Image from "next/image";

type TableRowProps<T> = {
  item: T;
  columns: {
    title: string;
    key: keyof T;
  }[];
  expanded: boolean;
  onRowClick: () => void;
};

function TableRow<T>({
  item,
  columns,
  expanded,
  onRowClick,
}: TableRowProps<T>) {
  return (
    <>
      <tr className={expanded ? "bg-gray-100" : ""}>
        {columns.map((column) => (
          <td
            key={`${column.key as string}-${item[column.key as keyof T]}`}
            className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-3"
          >
            {item[column.key] as string}
          </td>
        ))}
        {expanded !== undefined && (
          <td className="flex items-center justify-center py-4 cursor-pointer">
            {expanded ? (
              <MinusIcon className="w-5 h-5" onClick={onRowClick} />
            ) : (
              <PlusIcon className="w-5 h-5" onClick={onRowClick} />
            )}
          </td>
        )}
        {item.actions?.map((i: any, index: string) => {
          return (
            <td key={i.name + index} className="text-end w-10 pr-2">
              <a
                onClick={i.action}
                className="text-indigo-600 text-end cursor-pointer hover:text-indigo-900"
              >
                {i.icon}
              </a>
            </td>
          );
        })}
      </tr>
      {expanded && (
        <tr>
          <td colSpan={columns.length + 1}>
            <div className="flex gap-x-2 p-4">
              <Image src={item.image} alt="cover" width={200} height={200} className="rounded" />
              <div className="flex flex-col">
                <p className="text-sm font-medium text-orange-500">
                  Detailed description:{" "}
                </p>
                <p className="text-sm text-gray-600 min-w-[150px] flex items-center">
                  {item.description}
                </p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

type TableProps<T> = {
  data: T[];
  columns: {
    title: string;
    key: keyof T;
  }[];
};

export default function Table<T>({ data, columns }: TableProps<T>) {
  const [expandedRows, setExpandedRows] = useState<number[]>([]);

  const handleRowClick = (index: number) => {
    if (expandedRows.includes(index)) {
      setExpandedRows(expandedRows.filter((rowIndex) => rowIndex !== index));
    } else {
      setExpandedRows([...expandedRows, index]);
    }
  };

  if (!data.length) {
    return (
      <p className="pt-10 w-full text-center">
        No items found. Please add a new item.
      </p>
    );
  }

  return (
    <div>
      <div className="mt-8 flow-root border border-gray-100 rounded-xl overflow-hidden">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key.toString()}
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3"
                    >
                      {column.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {data.map((item: T, index: number) => (
                  <TableRow
                    key={index}
                    item={item}
                    columns={columns}
                    expanded={expandedRows.includes(index)}
                    onRowClick={() => handleRowClick(index)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
