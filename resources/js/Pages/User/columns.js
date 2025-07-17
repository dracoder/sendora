import { t } from "i18next";

const columnMap = {
    'first_name': {
        label: t('pages.name'),
        value: (row) => `${row.first_name} ${row.last_name ?? ''}`,
    },
    'role': {
        label: t('pages.role'),
        type: 'badge',
        align: 'center',
        value: (row) => row.role.substring(0,1).toUpperCase() + row.role.substring(1),
    },
    'email': {
        label: t('pages.email_address'),
        type: 'string',
    },
    'is_affiliate': {
        label: t('pages.affiliate'),
        type: 'boolean',
        align: 'center',
    },
    'created_at': {
        label: t('pages.created_at'),
        type: 'date',
        align: 'center',
    },
};

const searchKeys = [
    'full_name',
    'email'
];

export { columnMap, searchKeys }
