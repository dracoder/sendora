import { t } from "i18next";

const columnMap = {
    'key': {
        label: t('pages.key'),
        type: 'string',
        value: (row) => t(`config.${row.key}`),
    },
    'value': {
        label: t('pages.value'),
        type: 'string',
    },
    'description': {
        label: t('pages.description'),
        type: 'string',
    },
};

const searchKeys = [
    'key',
    'description',
];

export { columnMap, searchKeys }
