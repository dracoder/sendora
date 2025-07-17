import { t } from "i18next";


const columnMap = {
    'is_active': {
        label: t('pages.is_active'),
        align: 'center',
        type: 'boolean',
    },
    'name': {
        label: t('pages.name'),
    },
    'monthly_credits': {
        label: t('pages.monthly_credits'),
        align: 'center',
        type: 'number'
    },
    'frequency': {
        label: t('pages.frequency'),
        value: (row) => row.frequency === 'monthly' ? t('pages.monthly') : t('pages.yearly'),
    },
    'price': {
        label: t('pages.price'),
        value: (row) => (!row.is_custom_price ? row.price : parseFloat(row.price_per_unit)) + ' €',
    },
    // 'is_custom_price': {
    //     label: t('pages.is_custom_price'),
    //     align: 'center',
    //     type: 'boolean',
    // },
    'description': {
        label: t('pages.description'),
    }
};

const searchKeys = [
    'name',
    'description'
];

export { columnMap, searchKeys }
