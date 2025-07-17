import { t } from "i18next";

const columnMap = {
    'name': {
        label: t('pages.name'),
    },
    'email': {
        label: t('pages.email'),
        type: 'string',
    },
    'phone': {
        label: t('pages.phone'),
        type: 'string',
    },
    'owner_name': {
        label: t('pages.owner'),
        type: 'string',
    },
    'created_at': {
        label: t('pages.created_at'),
        type: 'date',
        align: 'center',
    },
};

const searchKeys = [
    'name',
    'email',
    'owner_name'
];

export { columnMap, searchKeys }
