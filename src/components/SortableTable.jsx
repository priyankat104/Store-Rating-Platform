import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

const SortableTable = ({ columns, data, sortBy, order, onSort, emptyMessage = 'No data found.' }) => {
  const handleSort = (key) => {
    if (!onSort) return;
    if (sortBy === key) {
      onSort(key, order === 'ASC' ? 'DESC' : 'ASC');
    } else {
      onSort(key, 'ASC');
    }
  };

  const SortIcon = ({ col }) => {
    if (sortBy !== col) return <ChevronsUpDown size={14} className="text-slate-500" />;
    return order === 'ASC'
      ? <ChevronUp size={14} className="text-primary-400" />
      : <ChevronDown size={14} className="text-primary-400" />;
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700/50">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`table-header ${col.sortable ? 'cursor-pointer select-none hover:bg-slate-700/60 transition-colors' : ''}`}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && <SortIcon col={col.key} />}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-10 text-slate-500 text-sm">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="table-cell">
                    {col.render ? col.render(row) : row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SortableTable;
