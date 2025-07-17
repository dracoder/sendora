import React, { useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHead,
    TableRow,
} from "@/Components/ui/table";
import {
    PaginationContainer,
} from "@/Components/ui/pagination";
import { Input } from "@/Components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Badge } from '@/Components/ui/badge';
import { Button } from "@/Components/ui/button";
import { cn, formatFriendlyDate, generateQueryFromObject } from "@/lib/utils";

import AlertDanger from "@/Components/AlertDanger";
import { ArrowDown, ArrowUp, Pencil, MoreHorizontal, Filter, Trash, CheckCircle, EyeIcon, Search } from 'lucide-react';
import { useForm } from "react-hook-form"
import { DropdownMenuGroup, DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton"
import { LabeledAsyncSelect, LabeledFormSelect } from "@/Components/ui/select";
import { useTranslation } from "react-i18next";
import { DateRangePicker } from "./ui/daterange-picker";

function ActionButtons({ searchRoute, item, readOnly, hideEdit = false, hideShow = false, hideDelete = false, editAction = null, showAction = null, deleteAction = null, actions = [] }) {
    const { t } = useTranslation();
    const itemId = item.id;
    const alertRef = React.useRef();

    const [onConfirm, setOnConfirm] = React.useState(null);
    const [isConfirmationOpen, setIsConfirmationOpen] = React.useState(false);

    const defaultDropdownStyle = 'text-left p-2 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 hover:cursor-pointer';

    useEffect(() => {
        if (isConfirmationOpen) {
            alertRef.current.open();
        }
    }, [isConfirmationOpen]);

    return (
        <div className="flex gap-2 justify-center">
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <MoreHorizontal className="w-4 text-gray-500 hover:text-gray-700" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuGroup>
                        {!hideShow && (
                            <DropdownMenuItem
                                disabled={readOnly}
                                className={defaultDropdownStyle}
                                onClick={showAction ? (e) => showAction(itemId, e) : () => window.location.href = `${searchRoute}/${itemId}`}
                            >
                                <div className="flex items-center">
                                    <EyeIcon className="mr-2" width={15} height={15} />
                                    {t('components.view')}
                                </div>
                            </DropdownMenuItem>
                        )}

                        {!hideEdit && (
                            <DropdownMenuItem
                                disabled={readOnly}
                                className={defaultDropdownStyle}
                                onClick={editAction ? (e) => editAction(itemId, e) : () => window.location.href = `${searchRoute}/${itemId}/edit`}
                            >
                                <div className="flex items-center">
                                    <Pencil className="mr-2" width={15} height={15} />
                                    {t('components.edit')}
                                </div>
                            </DropdownMenuItem>
                        )}


                        {!hideDelete && (
                            <DropdownMenuItem
                                disabled={readOnly}
                                className={defaultDropdownStyle}
                                onClick={() => {
                                    setOnConfirm(() => deleteAction);
                                    setIsConfirmationOpen(true);
                                }}
                            >
                                <div className="flex items-center">
                                    <Trash className="mr-2" width={15} height={15} />
                                    {t('components.delete')}
                                </div>
                            </DropdownMenuItem>
                        )}

                        {actions.map((groupAction, groupIndex) => {
                            if (item.actions?.length > 0 && !item.actions.includes(groupAction.value)) return;
                            return (
                                <DropdownMenuItem
                                    disabled={groupAction?.disabled}
                                    className={cn(defaultDropdownStyle, groupAction.icon ? '' : 'px-4')}
                                    key={groupIndex}
                                    onClick={() => {
                                        if (groupAction.requiresConfirmation) {
                                            setOnConfirm(() => groupAction.onClick);
                                            setIsConfirmationOpen(true);
                                        } else {
                                            groupAction.onClick(item);
                                        }
                                    }}
                                >
                                    <div className="flex items-center">
                                        {groupAction.icon && <span className="mr-2">{groupAction.icon}</span>}
                                        {groupAction.label}
                                    </div>
                                </DropdownMenuItem>
                            )
                        })}
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
            <AlertDanger ref={alertRef} onConfirm={() => onConfirm(item.id)} />
        </div>
    );
}

function OrderIcon({ field, columnMap, orderBy, order }) {
    if (order === "asc") {
        return <ArrowUp />;
    }
    return <ArrowDown />;
}


/**
 * DataTable component  that displays a table with pagination and search
 * @param {Object} columnMap - Object with column names as keys and column properties as values e.g. { 'name': {
            label: 'Name',
            type: 'string',
            value: (row) => `${row.first_name} ${row.last_name}`,
            sortField: 'first_name',
        },
    } (sortField and value are optional, sortField is the model field used for sorting and value is used to format the value of the cell)
 * @param {String} searchRoute - Route to fetch data from
 * @param {Boolean} readOnly - If true, disables edit and delete actions
 * @param {Object} searchKeys - Object with search keys as keys and search properties as values e.g. {'id': {
            label: 'ID',
            type: 'number',
        },
    }
 * @param {Boolean} hideEdit - If true, hides the edit button
 * @param {Boolean} hideShow - If true, hides the show button
 * @param {Boolean} hideDelete - If true, hides the delete button
 * @param {Function} onEdit - Function to call when edit button is clicked (will try to navigate to edit page if not provided)
 * @param {Function} onShow - Function to call when show button is clicked (will try to navigate to show page if not provided)
 * @param {Function} onDelete - Function to call when delete button is clicked (required unless hideDelete is true)
 * @param {Array} actions - Array of custom actions to display in the action column, e.g. [{label: 'Custom Action', icon: <CustomIcon />, onClick: (id) => console.log(id) }]
 * @param {Array} relationships - Array of relationships to include in the query e.g. ['user'] (inside model must a relationship method)
 * @param {String} orderBy - Field to order the data by
 * @param {Array} data - Array of data to display in the table (if searchRoute is not provided)
 * @param {Boolean} hideActions - If true, hides the action column
 * @param {Array} filters - Array of filters to display in the search dropdown e.g. [{ label: 'Status', type: 'select', options: [{ value: 'active', label: 'Active' }] }]
 * @param {Boolean} hideEdit - If true, hides the edit action
 * @param {Boolean} hideShow - If true, hides the show action
 * @param {Boolean} hideDelete - If true, hides the delete action
 * @param {Object} emptyDataMessage - Object with title, message and icon to display when there is no data (e.g { title: 'No data found', message: 'Try changing the search criteria', icon: <SearchIcon /> })
 * @param {Object} props - Additional props to pass to the component
    * @returns
 */
export function DataTable({
    columnMap,
    searchRoute,
    readOnly,
    searchKeys,
    onEdit,
    onShow,
    onDelete,
    actions = [],
    relationships = [],
    initialOrderBy,
    initialOrderDirection,
    data = [],
    hideActions = false,
    filters = {},
    hideEdit = false,
    hideShow = false,
    hideDelete = false,
    resource = false,
    emptyDataMessage = {},
}) {
    const { t } = useTranslation();
    const useDebounce = (value, delay = 1000) => {
        const [debouncedValue, setDebouncedValue] = React.useState(value);

        React.useEffect(() => {
            const timeout = setTimeout(() => {
                setDebouncedValue(value);
            }, delay);

            return () => clearTimeout(timeout);
        }, [value, delay]);

        return debouncedValue;
    }

    const firstColumn = ['avatar', 'image'].includes(columnMap[Object.keys(columnMap)[0]]['type']) ? Object.keys(columnMap)[1] : Object.keys(columnMap)[0];
    const [tableData, setTableData] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [pageCount, setPageCount] = React.useState(1);
    const [totalItems, setTotalItems] = React.useState(0);
    const [orderBy, setOrderBy] = React.useState(initialOrderBy ?? firstColumn);
    const [order, setOrder] = React.useState(initialOrderDirection ?? "asc");
    const [searchField, setSearchField] = React.useState(firstColumn);
    const [searchInput, setSearchInput] = React.useState("");
    const [filtersValues, setFiltersValues] = React.useState({});
    const debouncedToSearch = useDebounce(searchInput);


    const getListWithCurrentOptions = (
        page = currentPage,
        limit = 10
    ) => {
        setLoading(true);
        const requestParams = {
            page,
            limit,
            order,
            orderBy,

            relationships,
            filters: JSON.stringify(filtersValues), // dropdown custom filters
            searchKeys: searchKeys, // what the search input will filter by,
            searchInput, // the value of the search input
            resource,
        };

        if (searchRoute) {
            fetch(`${searchRoute}?${generateQueryFromObject(requestParams)}`, {
                headers: {
                    "Accept": "text/json",
                },
            })
                .then(async (data) => {
                    const { data: tableData, meta } = await data.json();
                    if (resource == true) {
                        setTableData(tableData.data);
                    } else {
                        setTableData(tableData);
                    }
                    setPageCount(meta.totalPages);
                    setTotalItems(meta.totalItems);
                })
                .catch((error) => {
                    console.error(error);
                    setTimeout(() => {
                        setLoading(false);
                    }, 750)
                });
        } else if (data) {
            setTableData(data);
            setPageCount(1);
            setTotalItems(1);
        } else {
            setTableData([]);
            setPageCount(1);
            setTotalItems(1);
        }

        setTimeout(() => {
            setLoading(false)
        }, 750)
    };

    const parseTableFieldValue = (row, cellField, value, variant = null) => {
        switch (cellField.type) {
            case 'date':
                return value ? formatFriendlyDate(value, true) : '';
            case 'boolean':
                return (
                    <div className="flex justify-center">
                        {value == '1' || value == 'on' || value == true ?
                            <CheckCircle className="text-green-500" size={20} />
                            :
                            <CheckCircle className="text-gray-300" size={20} />
                        }
                    </div>
                );
            case 'avatar':
                return <div className="flex justify-center">
                    {value === null ? (
                        <div className="w-8 h-8 rounded-full bg-border"></div>
                    ) : (
                        <img src={value} className="w-8 h-8 rounded-full" />
                    )}
                </div>;
            case 'badge':
                return value ? <Badge variant={variant ?? 'default'}>{value}</Badge> : value;

            case 'multi-badge':
                return value ? value.split(',').map((item, index) => (<Badge key={index} variant={variant ?? 'default'}>{item}</Badge>)) : value;
            case 'link':
                return <a
                    href={cellField.link(row)}
                    className="text-[#6393D2] font-bold hover:cursor-pointer">{value}
                </a>;
            default:
                return value;
        }
    }

    function handlePageChange(value) {
        if (value < 1 || value > pageCount) return;
        setCurrentPage(value);
        getListWithCurrentOptions(value);
    }

    function handleSort(field, disableSort = false) {
        if (disableSort) return;
        if (orderBy == field) {
            setOrder(order === "asc" ? "desc" : "asc");
        }
        setOrderBy(field);
    }

    const genTableRows = (
        data,
        columnMap
    ) => {
        if (typeof data === "object") {
            //convert data to array, this fixes laravel's eloquent query weird behavior when returning ordered data
            data = Object.values(data);
        }
        return data.map((row) => (
            <TableRow
                key={row.id}
                sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                }}
            >
                {Object.keys(columnMap).map((field) => {
                    if (field.includes('.')) {
                        let [relation, relationField] = field.split('.');
                        let relationValue = row[relation] ? row[relation][relationField] : '';
                        return renderTableCell(field, relationValue, row);
                    }

                    return renderTableCell(field, row[field], row);
                })}
                {!hideActions &&
                    <TableCell align="center">
                        <ActionButtons
                            item={row}
                            readOnly={readOnly}
                            searchRoute={searchRoute}
                            hideEdit={hideEdit}
                            hideShow={hideShow}
                            hideDelete={hideDelete}
                            editAction={onEdit}
                            showAction={onShow}
                            deleteAction={onDelete}
                            actions={actions}
                        />
                    </TableCell>
                }
            </TableRow>
        ));
    };

    React.useEffect(() => {
        if (data.length > 0) {
            setTableData(data);
            setLoading(false);
        } else {
            getListWithCurrentOptions();
        }
    }, [order, orderBy, filtersValues]);

    const {
        control,
        getValues,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: { ...Object.keys(filters).map(filter => ({ [filter]: filters[filter].fields ?? '' })) }
    })

    const applyFilters = () => {
        var data = {};

        // Dropdown custom filters
        Object.keys(filters).map((filter) => {
            if (getValues(filter) === undefined || getValues(filter) === '') return;
            data[filter] = {
                type: filters[filter].type,
                values: filters[filter].type == 'dateRange' ? handleDateRangeValue(getValues(filter)) : getValues(filter) === 0 ? false : getValues(filter)
            }
        })

        setFiltersValues(data);
    }

    const clearFilters = () => {
        Object.keys(filters).map((filter) => {
            setValue(filter, '');
        })

        setFiltersValues({});
        setSearchInput('');
    }

    React.useEffect(() => {
        getListWithCurrentOptions();
    }, [debouncedToSearch])

    const handleDateRangeChange = (value, field) => {
        if (value.from && value.to) {
            setValue(field, value);
        }
    }

    const handleDateRangeValue = (value) => {
        if (!value) return;
        if (value.from && value.to) {
            return `${new Date(value.from).toISOString().split('T')[0]}__${new Date(value.to).toISOString().split('T')[0]}`;
        }
    }

    const renderTableCell = (field, value, row) => {
        return (
            <TableCell
                key={field}
                className={`
                    ${columnMap[field].align ? `text-${columnMap[field].align}` : 'text-left'}
                    ${columnMap[field].type === 'avatar' ? 'w-20' : ''}
                    ${columnMap[field].color ? `font-bold ${columnMap[field].color}` : ''}
                    ${columnMap[field].hideOnSm ? 'hidden sm:table-cell' : ''}
                    ${columnMap[field].onClick ? 'cursor-pointer hover:bg-border' : ''}
                `}
                onClick={columnMap[field].onClick ? () => columnMap[field].onClick(row) : null}
            >
                {parseTableFieldValue(
                    row,
                    columnMap[field],
                    columnMap[field]['value'] ? columnMap[field]['value'](row) : value,
                    columnMap[field].type == 'badge' ? (typeof columnMap[field]['variant'] == 'function' ? columnMap[field]['variant'](row) : columnMap[field]['variant']) : 'default'
                )}
            </TableCell>
        );
    };

    const getEmptyResults = () => {
        return <div className="flex flex-col items-center justify-center h-52 my-5">
            <svg width="201" height="201" viewBox="0 0 201 201" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M201 100.5C201 156.005 156.005 201 100.5 201C44.9954 201 0 156.005 0 100.5C0 44.9954 44.9954 0 100.5 0C156.005 0 201 44.9954 201 100.5Z" />
                <path d="M71.125 158.333C62.9979 158.333 56.0703 155.49 50.3422 149.802C44.6141 144.115 41.75 137.236 41.75 129.167C41.75 121.097 44.6141 114.219 50.3422 108.531C56.0703 102.844 62.9979 100 71.125 100C79.2521 100 86.1797 102.844 91.9078 108.531C97.6359 114.219 100.5 121.097 100.5 129.167C100.5 137.236 97.6359 144.115 91.9078 149.802C86.1797 155.49 79.2521 158.333 71.125 158.333ZM151.025 152.5L113.425 115.167C112.25 113.903 111.002 112.615 109.68 111.302C108.358 109.99 107.06 108.75 105.787 107.583C109.508 105.25 112.495 102.139 114.747 98.25C116.999 94.3611 118.125 90.0833 118.125 85.4167C118.125 78.125 115.555 71.9271 110.414 66.8229C105.273 61.7188 99.0312 59.1667 91.6875 59.1667C84.3437 59.1667 78.1016 61.7188 72.9609 66.8229C67.8203 71.9271 65.25 78.125 65.25 85.4167C65.25 86 65.2745 86.559 65.3234 87.0938C65.3724 87.6285 65.4458 88.1875 65.5437 88.7708C63.7812 88.9653 61.8474 89.3542 59.7422 89.9375C57.637 90.5208 55.7521 91.2014 54.0875 91.9792C53.8917 90.9097 53.7448 89.8403 53.6469 88.7708C53.549 87.7014 53.5 86.5833 53.5 85.4167C53.5 74.8194 57.1964 65.8507 64.5891 58.5104C71.9818 51.1701 81.0146 47.5 91.6875 47.5C102.36 47.5 111.393 51.1701 118.786 58.5104C126.179 65.8507 129.875 74.8194 129.875 85.4167C129.875 89.5972 129.214 93.559 127.892 97.3021C126.57 101.045 124.734 104.472 122.384 107.583L159.25 144.333L151.025 152.5ZM60.6969 143.604L71.125 133.25L81.4062 143.604L85.6656 139.521L75.2375 129.167L85.6656 118.813L81.5531 114.729L71.125 125.083L60.6969 114.729L56.5844 118.813L67.0125 129.167L56.5844 139.521L60.6969 143.604Z" fill="#71717A" />
            </svg>
            <span className="text-gray-500 mt-4 font-semibold">{emptyDataMessage?.title ?? t('components.no_results')}</span>
            <span className="text-gray-500 mt-2 text-xs">{emptyDataMessage?.message ?? t('components.try_again_changing')}</span>
        </div>
    }

    const tableBody = () => {
        if (tableData.length > 0) {
            return <TableBody>{genTableRows(tableData, columnMap)}</TableBody>;
        }

        return <TableBody>
            <tr>
                <td colSpan={12} className="py-6">
                    <div className={'flex flex-col items-center justify-center h-52'}>
                        {getEmptyResults()}
                    </div>
                </td>
            </tr>
        </TableBody >;
    }


    const filterCount = Object.keys(filtersValues ?? {}).length;

    return (
        <div className="border rounded !max-w-[92vw] overflow-x-auto">
            {searchKeys && searchRoute && (
                <div className="flex items-center justify-end p-4">
                    {/* Input form */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                        }}
                        className="flex flex-row gap-1 items-center relative"
                    >
                        <Search className="w-5 h-5 absolute ml-2" />
                        <Input
                            type="text"
                            placeholder={t('components.search')}
                            className="border-t border-b border-l border-r rounded-t-md pl-8"
                            value={searchInput}
                            key={searchField}
                            errors={errors}
                            control={control}
                            name={searchField}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                    </form>
                    {/* Dropdown Filters */}
                    {Object.keys(filters).length > 0 && (
                        <div className="flex justify-between items-center py-2 px-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger className="relative">
                                    {filterCount > 0 && (
                                        <Badge className="absolute bottom-2.5 left-2.5 px-1.5 py-0" variant="gray">
                                            {filterCount}
                                        </Badge>
                                    )}
                                    <Filter className="w-4 text-gray-500" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="overflow-visible">
                                    <DropdownMenuLabel>{t('components.filters')}</DropdownMenuLabel>
                                    <div className="grid px-2 gap-y-4 mt-4">
                                        {Object.keys(filters).map((field, key) => {
                                            const currentFilter = filters[field];
                                            if (currentFilter.type === 'select') {
                                                return (
                                                    <LabeledFormSelect
                                                        key={key}
                                                        errors={errors}
                                                        control={control}
                                                        label={currentFilter.label}
                                                        name={field}
                                                        onChange={(e) => setValue(field, e.target.value)}
                                                        placeholder={t('components.select_one')}
                                                        options={currentFilter.options}
                                                        className='!mb-0'
                                                        {...currentFilter}
                                                    />
                                                );
                                            } else if (currentFilter.type === 'asyncSelect') {
                                                return (
                                                    <LabeledAsyncSelect
                                                        key={field}
                                                        errors={errors}
                                                        control={control}
                                                        name={field}
                                                        placeholder={t('components.select_one')}
                                                        className='!mb-0'
                                                        isMulti
                                                        {...currentFilter}
                                                    />
                                                );
                                            } else if (currentFilter.type === 'dateRange') {
                                                return (
                                                    <div key={field + 'div'}>
                                                        <label
                                                            className='block font-medium text-sm text-gray-700 dark:text-gray-300 mb-2'
                                                        >
                                                            {currentFilter.label}
                                                        </label>
                                                        <DateRangePicker
                                                            key={field}
                                                            errors={errors}
                                                            control={control}
                                                            name={field}
                                                            onChange={handleDateRangeChange}
                                                        />
                                                    </div>
                                                );
                                            }
                                        })}
                                    </div>
                                    <div className="mt-2 py-2 px-2 flex justify-between gap-2">
                                        <Button type="button" className="px-5" onClick={() => applyFilters()}>
                                            {t('components.apply_filters')}
                                        </Button>
                                        <Button type="button" variant='secondary' className="px-5" onClick={() => clearFilters()}>
                                            {t('components.clear_filters')}
                                        </Button>
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>
            )}

            {loading ? (
                <Table size="small">
                    <TableHeader>
                        <TableRow>
                            {Object.keys(columnMap).map((field) => (
                                <TableHead
                                    key={field}
                                    align={columnMap[field].align || 'left'}
                                    sx={columnMap[field].hideOnSm ? hideOnSm : undefined}
                                >
                                    <Skeleton className="w-1/3 h-4 rounded-full" />
                                </TableHead>
                            ))}

                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array(5).fill(null).map((_, index) => (
                            <TableRow key={index}>
                                {Object.keys(columnMap).map((field) => (
                                    <TableCell key={field}>
                                        <Skeleton className="w-9/12 h-5 rounded-xl" />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <React.Fragment>
                    <Table size="small">
                        <TableHeader>
                            <TableRow>
                                {Object.keys(columnMap).map((field) => (
                                    <TableHead
                                        key={field}
                                        align={columnMap[field].align || 'left'}
                                        sx={columnMap[field].hideOnSm ? hideOnSm : undefined}
                                        onClick={() =>
                                            handleSort(columnMap[field].sortField || field, columnMap[field].disableSort || false)
                                        }
                                    >
                                        <div className={`cursor-pointer flex gap-2 items-center ${columnMap[field].align ? 'justify-' + columnMap[field].align : 'justify-start'} text-center`}>
                                            <span>{columnMap[field].label}</span>
                                            {(orderBy === field || columnMap[field].sortField === orderBy) && (
                                                <span className="w-4">
                                                    <OrderIcon field={field} columnMap={columnMap} orderBy={orderBy} order={order} />
                                                </span>
                                            )}
                                        </div>
                                    </TableHead>
                                ))}
                                {!hideActions && <TableHead className="text-center">{t('components.action')}</TableHead>}
                            </TableRow>
                        </TableHeader>
                        {tableBody()}
                    </Table>

                    <div className="w-full flex justify-between items-center border-t py-2 px-4">
                        <div className="w-1/2">
                            <span>
                                {tableData.length > 0
                                    ? t('components.showing_results', { length: tableData.length, total: totalItems })
                                    : t('components.no_results')}
                            </span>
                        </div>
                        <PaginationContainer className="justify-end" count={pageCount} page={currentPage} onChange={handlePageChange} />
                    </div>
                </React.Fragment>
            )}
        </div>
    );
}
