import { t } from "i18next";

const columnMap = {
    'is_active': {
        label: t('pages.is_active'),
        type: 'boolean',
        align: 'center',
    },
    'name': {
        label: t('pages.name'),
    },
    'organization.name': {
        label: t('pages.organization'),
        type: 'string',
        disableSort: true,
    },
    'subscribers_count': {
        label: t('pages.subscribers_count'),
        type: 'number',
        align: 'center',
        color: 'text-blue-500',
        onClick: () => {},
    },
    'created_at': {
        label: t('pages.created_at'),
        type: 'date',
        align: 'center',
    },
    'start_at': {
        label: t('pages.start_at'),
        type: 'date',
        align: 'center',
    },
};

const searchKeys = [
    'name',
    'organization.name'
];

export { columnMap, searchKeys }
