/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState, useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Trash2, Check, History } from "lucide-react";
import { Payroll } from "@/components/kit/payrollModal";

// Re-export the Checkbox component if needed elsewhere
export const Checkbox = ({
  checked,
  indeterminate,
  onCheckedChange,
  disabled,
  "aria-label": ariaLabel,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  "aria-label": string;
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      onCheckedChange(!checked);
    }
  };

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={handleClick}
      className={`
        flex h-4 w-4 items-center justify-center rounded border 
        transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${disabled
          ? 'bg-gray-100 border-gray-300 cursor-not-allowed'
          : checked || indeterminate
            ? 'bg-blue-600 border-blue-600 hover:bg-blue-700 hover:border-blue-700'
            : 'bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400'
        }
      `}
    >
      {indeterminate ? (
        <div className="h-2 w-2 bg-white" />
      ) : checked ? (
        <Check className="h-3 w-3 text-white" />
      ) : null}
    </button>
  );
};

// Helper function for nested paths
// eslint-disable-next-line react-refresh/only-export-components
export const getByPath = (obj: any, path: string): any => {
  if (!obj || typeof obj !== 'object') return undefined;
  
  try {
    return path
      .split(".")
      .reduce((acc, key) => {
        if (acc === null || acc === undefined) return undefined;
        return acc[key];
      }, obj);
  } catch (error) {
    console.warn(`Error accessing path "${path}":`, error);
    return undefined;
  }
};

// Sticky style helper
// eslint-disable-next-line react-refresh/only-export-components
export const getStickyStyle = (index: number, items: any[]) => {
  const getDef = (item: any) =>
    item?.column?.columnDef ?? item?.columnDef ?? {};
  let leftOffset = 0;
  for (let i = 0; i < index; i++) {
    const prevDef = getDef(items[i]);
    if (prevDef?.meta?.sticky) leftOffset += prevDef.meta.width || 150;
  }
  const currentDef = getDef(items[index]);
  if (currentDef?.meta?.sticky) {
    return {
      className: "sticky bg-white z-10 border-r",
      style: { left: leftOffset, minWidth: currentDef.meta.width || 150 },
    };
  }
  return {};
};

// Main Table Component
interface PayrollTableComponentProps {
  columns: ColumnDef<Payroll>[];
  data: Payroll[];
  onRowClick: (payroll: Payroll) => void;
  onDeletePayroll: (payroll: Payroll) => void;
  onViewPayroll: (payroll: Payroll) => void;
  onBulkDelete: (payrolls: Payroll[]) => void;
  hideActions?: boolean;
  totalsRow?: boolean;
}

const PayrollTableComponent = ({
  columns,
  data,
  onRowClick,
  onDeletePayroll,
  onViewPayroll,
  onBulkDelete,
  hideActions = false,
  totalsRow = true,
}: PayrollTableComponentProps) => {
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
  });

  const leafColumns = table.getAllLeafColumns();
  const { columnTotals, columnIsNumeric } = useMemo(() => {
    const totals: Array<number | null> = [];
    const isNumeric: boolean[] = [];
    leafColumns.forEach((col) => {
      const accessorKey = (col.columnDef as any).accessorKey as
        | string
        | undefined;
      if (!accessorKey) {
        totals.push(null);
        isNumeric.push(false);
        return;
      }
      const numeric = data.some(
        (row) => typeof getByPath(row as any, accessorKey) === "number"
      );
      isNumeric.push(numeric);
      if (!numeric) {
        totals.push(null);
        return;
      }
      const sum = data.reduce((acc, row) => {
        const value = getByPath(row as any, accessorKey);
        return acc + (typeof value === "number" ? value : 0);
      }, 0);
      totals.push(sum);
    });
    return { columnTotals: totals, columnIsNumeric: isNumeric };
  }, [data, leafColumns]);

  const selectedRows = table.getSelectedRowModel().rows.map(row => row.original);
  const hasSelectedRows = selectedRows.length > 0;

  const handleAction = (payroll: Payroll, action: 'view' | 'update' | 'delete' | 'send' | 'history', e: React.MouseEvent) => {
    e.stopPropagation();

    switch (action) {
      case 'view':
        onViewPayroll(payroll);
        break;
      case 'update':
        onRowClick(payroll);
        break;
      case 'delete':
        onDeletePayroll(payroll);
        break;
      case 'send':
        { const customEvent = new CustomEvent('send-payroll', { detail: payroll, bubbles: true });
        (e.target as HTMLElement).dispatchEvent(customEvent);
        break; }
      case 'history':
        {const historyEvent = new CustomEvent('view-payslip-history', { detail: payroll, bubbles: true });
        (e.target as HTMLElement).dispatchEvent(historyEvent);
        break;}
    }
  };

  const handleBulkDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasSelectedRows) {
      onBulkDelete(selectedRows);
    }
  };

  const handleRowClick = (payroll: Payroll, e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('button') && !target.closest('[role="checkbox"]')) {
      onRowClick(payroll);
    }
  };

  return (
    <section className="w-full overflow-x-auto">
      {/* Bulk Actions Bar */}
      {hasSelectedRows && (
        <div className="bg-blue-50 border border-blue-200 rounded-t-lg p-3 flex items-center justify-between mb-0">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-blue-800">
              {selectedRows.length} payroll record(s) selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRowSelection({})}
              className="text-blue-700 border-blue-300 hover:bg-blue-100"
            >
              Clear Selection
            </Button>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Selected ({selectedRows.length})
          </Button>
        </div>
      )}

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header, i) => {
                const stickyProps = getStickyStyle(i, headerGroup.headers);
                return (
                  <TableHead
                    key={header.id}
                    className="border"
                    {...stickyProps}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                );
              })}
              {!hideActions && (
                <TableHead className="border sticky right-0 bg-white z-10">
                  Actions
                </TableHead>
              )}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            <>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={`cursor-pointer hover:bg-gray-50 transition-colors ${row.getIsSelected() ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  onClick={(e) => handleRowClick(row.original, e)}
                >
                  {row.getVisibleCells().map((cell, i) => {
                    const stickyProps = getStickyStyle(
                      i,
                      row.getVisibleCells()
                    );
                    return (
                      <TableCell
                        key={cell.id}
                        className="border"
                        {...stickyProps}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    );
                  })}
                  {!hideActions && (
                    <TableCell className="border sticky right-0 bg-white z-10">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                            }}
                            className="h-8 w-8 p-0 focus:z-50 focus:relative"
                          >
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
    <DropdownMenuContent 
      align="end"
      className="z-[100]"
    >
                          <DropdownMenuItem
                            onClick={(e) => handleAction(row.original, 'view', e)}
                            className="flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => handleAction(row.original, 'update', e)}
                            className="flex items-center gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Update
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => handleAction(row.original, 'history', e)}
                            className="flex items-center gap-2"
                          >
                            <History className="h-4 w-4" />
                            View History
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => handleAction(row.original, 'send', e)}
                            className="flex items-center gap-2"
                          >
                            <Check className="h-4 w-4" />
                            Send Payroll
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => handleAction(row.original, 'delete', e)}
                            className="flex items-center gap-2 text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {/* Totals footer per column */}
              {totalsRow && (
                <TableRow className="bg-gray-50 font-semibold">
                  {leafColumns.map((col, i) => {
                    const stickyProps = getStickyStyle(i, leafColumns as any);
                    const total = columnTotals[i];
                    const isNum = columnIsNumeric[i];
                    return (
                      <TableCell
                        key={col.id}
                        className="border"
                        {...stickyProps}
                      >
                        {i === 0
                          ? "Grand Total"
                          : isNum && typeof total === "number"
                            ? total.toFixed(2)
                            : ""}
                      </TableCell>
                    );
                  })}
                  {!hideActions && (
                    <TableCell className="border">
                      {/* Empty action cell for totals row */}
                    </TableCell>
                  )}
                </TableRow>
              )}
            </>
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length + (hideActions ? 0 : 1)} className="h-24 text-center">
                No payroll records found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </section>
  );
};

export default PayrollTableComponent;