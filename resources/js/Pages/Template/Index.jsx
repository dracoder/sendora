import { useEffect, useState } from 'react';
import { DataTable } from '@/Components/DataTable';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { columnMap, searchKeys } from './columns';
import TemplateService from '@/Services/TemplateService';
import { toast } from '@/hooks/use-toast';
import { router } from '@inertiajs/react';
import { FilePlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Index({ }) {
    const { t } = useTranslation();
    const [searchOptions, setSearchOptions] = useState({
        searchField: '',
        searchValue: '',
    });
    const [refreshKey, setRefreshKey] = useState(0);

    const handleDeleteAction = (id) => {
        TemplateService.destroy(id, () => {
            toast({
                title: t('pages.deleted', { name: t('pages.template') }),
                duration: 3000
            });
            setRefreshKey(refreshKey + 1)
        })
    }

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { name: t('menu.templates'), href: route('templates.index'), current: true },
            ]}
            headerActions={[
                {
                    icon: <FilePlus />,
                    title: t('components.create_button', { entity: t('pages.template') }),
                    href: route('templates.create')
                }
            ]}
            title={t('menu.templates')}
        >
            <DataTable
                key={refreshKey}
                searchRoute={'templates'}
                searchOptions={searchOptions}
                columnMap={columnMap}
                searchKeys={searchKeys}
                relationships={['organization']}
                filters={{
                    'organization_id': {
                        label: t('pages.organization'),
                        type: 'asyncSelect',
                        model: 'Organization',
                        labelKey: 'name',
                        orderBy: 'id',
                        searchKeys: ['name', 'email', 'owner_name'],
                        placeholder: t('components.select_one'),
                        preload: true,
                    }
                }}
                initialOrderBy="id"
                hideShow
                onEdit={(id) => router.visit(route('templates.edit', id))}
                onDelete={handleDeleteAction}
            />
        </AuthenticatedLayout>
    )
}
