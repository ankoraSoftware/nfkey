import React from 'react';

type TableProps<T> = {
  data: any;
  columns: {
    title: string;
    key: keyof T;
  }[];
};

export default function Table<T>({ data, columns }: TableProps<T>) {
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
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-3">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {data.map((item: any, index: number) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? undefined : 'bg-gray-50'}
                  >
                    {columns?.map((column) => (
                      <td
                        key={`${column.key as string}-${
                          item[column.key as keyof T]
                        }`}
                        className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-3"
                      >
                        {item[column.key] as string}
                      </td>
                    ))}

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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
