import { useState } from 'react';
import { DataTable } from '@/Components/DataTable';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { columnMap, searchKeys } from './columns';
import { useTranslation } from 'react-i18next';

export default function Index({ }) {
    const { t } = useTranslation();
    const [searchOptions, setSearchOptions] = useState({
        searchField: '',
        searchValue: '',
    });

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { name: t('menu.subscriptions'), href: route('subscriptions.index'), current: true },
            ]}
            title={t('menu.subscriptions')}
        >
            <DataTable
                searchRoute={'subscriptions'}
                searchOptions={searchOptions}
                columnMap={columnMap}
                searchKeys={searchKeys}
                relationships={['user', 'subscription_plan']}
                filters={{
                    'created_at': {
                        label: t('pages.created_at'),
                        type: 'dateRange',
                        fields: {
                            from: '',
                            to: ''
                        }
                    }
                }}
                initialOrderBy="id"
                hideActions
                hideShow
                hideEdit
                hideDelete
            />
        </AuthenticatedLayout>
    )
}
