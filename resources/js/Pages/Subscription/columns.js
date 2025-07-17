import { t } from "i18next";


const columnMap = {
    'user.email': {
        label: t('pages.subscriber') + ' ' + t('pages.email'),
        type: 'string',
        disableSort: true,
    },
    'stripe_status': {
        label: t('pages.status'),
        type: 'string',
        value: (row) => row.stripe_status == 'pastDue' ? t('pages.past_due') : row.stripe_status == 'active' ? t('pages.active') : t('pages.cancelled'),
        align: 'center',
    },
    'subscription_plan.name': {
        label: t('pages.plan'),
        type: 'string',
        disableSort: true,
    },
    'subscription_plan.frequency': {
        label: t('pages.frequency'),
        type: 'string',
        disableSort: true,
        value: (row) => row.frequency === 'monthly' ? t('pages.monthly') : t('pages.yearly'),
    },
    'created_at': {
        label: t('pages.created_at'),
        type: 'date',
        align: 'center',
    }
};

const searchKeys = [
    'user.email',
    'subscription_plan.name',
];

export { columnMap, searchKeys }
