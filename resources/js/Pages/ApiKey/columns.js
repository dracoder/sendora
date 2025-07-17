import { t } from "i18next";

const columnMap = {
    'name': {
        label: t('pages.name'),
    },
    'token': {
        label: t('pages.token'),
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
    'token',
];

export { columnMap, searchKeys }
