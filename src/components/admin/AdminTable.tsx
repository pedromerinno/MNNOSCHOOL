
import React, { useMemo, ReactNode } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { LucideIcon, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";

export type SortField = string;
export type SortDirection = 'asc' | 'desc';

export interface AdminTableColumn<T = any> {
  id: string;
  header: string | ReactNode;
  accessor?: keyof T | ((row: T) => ReactNode);
  cell?: (row: T) => ReactNode;
  sortable?: boolean;
  sortField?: SortField;
  className?: string;
  headerClassName?: string;
  align?: 'left' | 'center' | 'right';
  responsive?: {
    hideBelow?: 'sm' | 'md' | 'lg' | 'xl';
  };
}

export interface AdminTableProps<T = any> {
  data: T[];
  columns: AdminTableColumn<T>[];
  loading?: boolean;
  loadingRows?: number;
  emptyState?: {
    icon?: LucideIcon;
    icons?: LucideIcon[];
    title?: string;
    description?: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  onRowClick?: (row: T) => void;
  getRowKey: (row: T) => string;
  className?: string;
  rowClassName?: string | ((row: T) => string);
  sortField?: SortField;
  sortDirection?: SortDirection;
  onSort?: (field: SortField, direction: SortDirection) => void;
  cellPadding?: string;
}

const SortIcon: React.FC<{ 
  field: SortField; 
  currentField?: SortField; 
  direction?: SortDirection 
}> = ({ field, currentField, direction }) => {
  if (currentField !== field) {
    return <ArrowUpDown className="h-3.5 w-3.5 ml-1 opacity-50" />;
  }
  return direction === 'asc' 
    ? <ArrowUp className="h-3.5 w-3.5 ml-1" />
    : <ArrowDown className="h-3.5 w-3.5 ml-1" />;
};

export function AdminTable<T = any>({
  data,
  columns,
  loading = false,
  loadingRows = 5,
  emptyState,
  onRowClick,
  getRowKey,
  className,
  rowClassName,
  sortField,
  sortDirection,
  onSort,
  cellPadding = 'p-4',
}: AdminTableProps<T>) {
  const handleSort = (column: AdminTableColumn<T>) => {
    if (!column.sortable || !onSort || !column.sortField) return;
    
    const field = column.sortField;
    const newDirection: SortDirection = 
      sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    
    onSort(field, newDirection);
  };

  const renderCell = (row: T, column: AdminTableColumn<T>): ReactNode => {
    if (column.cell) {
      return column.cell(row);
    }
    
    if (column.accessor) {
      if (typeof column.accessor === 'function') {
        return column.accessor(row);
      }
      
      const value = row[column.accessor];
      return value !== undefined && value !== null ? String(value) : '-';
    }
    
    return '-';
  };

  const getResponsiveClass = (column: AdminTableColumn<T>): string => {
    if (!column.responsive?.hideBelow) return '';
    
    const breakpoints = {
      sm: 'hidden sm:table-cell',
      md: 'hidden md:table-cell',
      lg: 'hidden lg:table-cell',
      xl: 'hidden xl:table-cell',
    };
    
    return breakpoints[column.responsive.hideBelow] || '';
  };

  const getAlignClass = (align?: 'left' | 'center' | 'right'): string => {
    if (!align) return '';
    return align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
  };

  if (loading) {
    return (
      <div className={cn(
        "rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden",
        "bg-white dark:bg-gray-800 shadow-sm",
        className
      )}>
        <Table>
          <TableHeader className="bg-gray-50/50 dark:bg-gray-900/50">
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  className={cn(
                    "font-semibold text-gray-700 dark:text-gray-300",
                    cellPadding,
                    getAlignClass(column.align),
                    getResponsiveClass(column),
                    column.headerClassName
                  )}
                >
                  {typeof column.header === 'string' ? column.header : column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(loadingRows)].map((_, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    className={cn(
                      cellPadding,
                      getAlignClass(column.align),
                      getResponsiveClass(column),
                      column.className
                    )}
                  >
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (data.length === 0) {
    // Prepare icons array - support both single icon and multiple icons
    const icons: LucideIcon[] = [];
    if (emptyState?.icons && emptyState.icons.length > 0) {
      icons.push(...emptyState.icons);
    } else if (emptyState?.icon) {
      icons.push(emptyState.icon);
    }
    
    return (
      <div className={cn(
        "rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden",
        "bg-white dark:bg-gray-800 shadow-sm",
        className
      )}>
        <Table>
          <TableHeader className="bg-gray-50/50 dark:bg-gray-900/50">
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  className={cn(
                    "font-semibold text-gray-700 dark:text-gray-300",
                    cellPadding,
                    getAlignClass(column.align),
                    getResponsiveClass(column),
                    column.headerClassName
                  )}
                >
                  {typeof column.header === 'string' ? column.header : column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-16">
                <div className="flex justify-center">
                  <EmptyState
                    title={emptyState?.title || "Nenhum item encontrado"}
                    description={emptyState?.description || "Não há dados para exibir no momento"}
                    icons={icons.length > 0 ? icons : undefined}
                    action={emptyState?.action}
                  />
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden",
      "bg-white dark:bg-gray-800 shadow-sm",
      className
    )}>
      <Table>
        <TableHeader className="bg-gray-50/50 dark:bg-gray-900/50">
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.id}
                className={cn(
                  "font-semibold text-gray-700 dark:text-gray-300",
                  getAlignClass(column.align),
                  getResponsiveClass(column),
                  column.headerClassName,
                  column.sortable && "cursor-pointer hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                )}
                onClick={() => column.sortable && handleSort(column)}
              >
                {typeof column.header === 'string' ? (
                  <div className={cn("flex items-center", getAlignClass(column.align))}>
                    {column.header}
                    {column.sortable && (
                      <SortIcon
                        field={column.sortField || column.id}
                        currentField={sortField}
                        direction={sortDirection}
                      />
                    )}
                  </div>
                ) : (
                  column.header
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => {
            const rowKey = getRowKey(row);
            const computedRowClassName = typeof rowClassName === 'function' 
              ? rowClassName(row) 
              : rowClassName;

            return (
              <TableRow
                key={rowKey}
                className={cn(
                  "hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors group",
                  onRowClick && "cursor-pointer",
                  computedRowClassName
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    className={cn(
                      cellPadding,
                      getAlignClass(column.align),
                      getResponsiveClass(column),
                      column.className
                    )}
                  >
                    {renderCell(row, column)}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
