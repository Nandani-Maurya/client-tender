import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'
import InputAdornment from '@mui/material/InputAdornment'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import './DetailsDataTable.css'

function DetailsDataTable({ columns, data, emptyMessage = 'No records found.' }) {
  const table = useMaterialReactTable({
    columns,
    data,
    enableColumnFilters: false,
    enableGlobalFilter: true,
    enableSorting: true,
    enableColumnActions: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableHiding: false,
    enablePagination: true,
    positionGlobalFilter: 'left',
    layoutMode: 'semantic',
    paginationDisplayMode: 'pages',
    defaultColumn: {
      minSize: 120,
      size: 150,
      maxSize: 320
    },
    initialState: {
      density: 'compact',
      showGlobalFilter: true,
      pagination: { pageIndex: 0, pageSize: 10 }
    },
    muiTableProps: {
      sx: { tableLayout: 'auto' }
    },
    muiTableHeadCellProps: {
      align: 'center',
      sx: {
        textAlign: 'center',
        height: 56
      }
    },
    muiTableBodyCellProps: {
      align: 'center',
      sx: {
        textAlign: 'center',
        height: 56
      }
    },
    muiTableHeadRowProps: {
      sx: { height: 56 }
    },
    muiTableBodyRowProps: {
      sx: { height: 56 }
    },
    muiPaginationProps: {
      rowsPerPageOptions: [10, 20, 50],
      showFirstButton: true,
      showLastButton: true
    },
    muiSearchTextFieldProps: {
      placeholder: 'Search records...',
      size: 'small',
      variant: 'outlined',
      className: 'details-table-search',
      InputProps: {
        startAdornment: (
          <InputAdornment position="start">
            <SearchRoundedIcon fontSize="small" className="details-table-search-icon" />
          </InputAdornment>
        )
      },
      sx: {
        minWidth: { xs: '100%', sm: 320 }
      }
    },
    renderEmptyRowsFallback: () => (
      <div className="empty-project-row">{emptyMessage}</div>
    )
  })

  return (
    <div className="details-mrt-wrapper">
      <MaterialReactTable table={table} />
    </div>
  )
}

export default DetailsDataTable
