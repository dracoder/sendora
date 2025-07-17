import { t } from "i18next";

const columnMap = {
    'name': {
        label: t('pages.name'),
        type: 'string',
    },
    'credits': {
        label: t('pages.credits'),
        type: 'number',
    },
    'price': {
        label: t('pages.price'),
        type: 'number',
    },
    'is_active': {
        label: t('pages.status'),
        align: 'center',
        type: 'boolean',
    },
    'featured': {
        label: t('pages.featured'),
        align: 'center',
        type: 'boolean',
    },
    'created_at': {
        label: t('pages.created_at'),
        type: 'date',
        align: 'center',
    },
};

const searchKeys = [
    'name',
    'credits',
    'price'
];

export { columnMap, searchKeys }