import { useEffect, useState } from 'react';
import { DataTable } from '@/Components/DataTable';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { columnMap, searchKeys } from './columns';
import ConfigService from '@/Services/ConfigService';
import { toast } from '@/hooks/use-toast';
import EditForm from '@/Components/forms/Config/edit';
import CreateForm from '@/Components/forms/Config/create';
import { Building } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Index({ }) {
    const { t } = useTranslation();
    const [searchOptions, setSearchOptions] = useState({
        searchField: '',
        searchValue: '',
    });
    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleEditAction = (id) => {
        setEditing(true);
        setEditingId(id);
    }

    useEffect(() => {
        if (editing == false) {
            setEditingId(null);
        }
    }, [editing]);

    const handleDeleteAction = (id) => {
        ConfigService.destroy(id, () => {
            toast({
                title: t('pages.deleted', { name: t('pages.config') }),
                duration: 3000
            });
            setRefreshKey(refreshKey + 1)
        })
    }

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { name: t('menu.configs'), href: route('configs.index'), current: true },
            ]}
            headerActions={[
                // {
                //     icon: <Building />,
                //     title: t('components.create_button', { entity: t('pages.config') }),
                //     function: () => setCreating(true)
                // }
            ]}
            title={t('menu.configs')}
        >
            <DataTable
                key={refreshKey}
                searchRoute={'configs'}
                searchOptions={searchOptions}
                columnMap={columnMap}
                searchKeys={searchKeys}
                initialOrderBy="id"
                hideShow
                onEdit={handleEditAction}
                hideDelete
            />

            <CreateForm onSubmit={() => setRefreshKey(refreshKey + 1)} open={creating} onOpenChange={setCreating} />
            <EditForm onSubmit={() => setRefreshKey(refreshKey + 1)} open={editing} onOpenChange={setEditing} editingId={editingId} />
        </AuthenticatedLayout>
    )
}
