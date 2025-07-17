import { t } from "i18next";

const columnMap = {
    // 'profile_picture': {
    //     label: t('pages.profile_picture'),
    //     type: 'avatar',
    //     align: 'center',
    //     value: (row) => row.profile_picture ? row.profile_picture : null, // This is sample data
    // },
    'tags': {
        label: t('menu.tags'),
        type: 'multi-badge',
        align: 'center',
        value: (row) => row.tags && row.tags.length > 0 ? row.tags.map(tag => tag.name).join(',') : '',
        disableSort: true,
    },
    'email': {
        label: t('pages.email'),
        type: 'string',
        align: 'center',
    },
    'organization.name': {
        label: t('pages.organization'),
        type: 'string',
        align: 'center',
        disableSort: true,
    },
    'first_name': {
        label: t('pages.name'),
        value: (row) => row.first_name || row.last_name ? `${row.first_name} ${row.last_name ?? ''}` : '',
    },
    'phone': {
        label: t('pages.phone'),
        type: 'string',
        align: 'center',
    },
    'is_subscribed': {
        label: t('pages.is_subscribed'),
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
    'organization.name',
    'email',
    'phone',
    'title',
    'company',
    'industry',
    'location',
    'linkedin_url',
    'note',
];

export { columnMap, searchKeys }
