import { t } from "i18next";

const columnMap = {
    'name': {
        label: t('pages.name'),
    },
    'organization.name': {
        label: t('pages.organization'),
        type: 'string',
        disableSort: true,
    },
    'created_at': {
        label: t('pages.created_at'),
        type: 'date',
        align: 'center',
    },
};

const searchKeys = [
    'name',
    'organization.name'
];

export { columnMap, searchKeys }
