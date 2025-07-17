import { t } from "i18next";

const columnMap = {
    'created_at': {
        label: t('pages.date'),
        type: 'date',
        align: 'left',
    },
    'type_translated': {
        label: t('pages.credit_type'),
        type: 'custom',
        align: 'center',
    },
    // 'transaction_type_translated': {
    //     label: t('pages.transaction_type'),
    //     type: 'custom',
    //     align: 'center',
    // },
    'status_translated': {
        label: t('pages.status'),
        type: 'custom',
        align: 'center',
    },
    'amount': {
        label: t('pages.credits'),
        type: 'number',
        align: 'center',
    },
    'usage': {
        label: t('pages.usage'),
        type: 'number',
        align: 'center',
    },
};

const searchKeys = [
    'description',
    'type',
    'transaction_type'
];

export { columnMap, searchKeys }