import { useEffect, useState } from 'react';
import { DataTable } from '@/Components/DataTable';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { columnMap, searchKeys } from './columns';
import TagService from '@/Services/TagService';
import { toast } from '@/hooks/use-toast';
import EditForm from '@/Components/forms/Tag/edit';
import CreateForm from '@/Components/forms/Tag/create';
import { Tag } from 'lucide-react';
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
        TagService.destroy(id, () => {
            toast({
                title: t('pages.deleted', { name: t('pages.tag') }),
                duration: 3000
            });
            setRefreshKey(refreshKey + 1)
        })
    }

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { name: t('menu.tags'), href: route('tags.index'), current: true },
            ]}
            headerActions={[
                {
                    icon: <Tag />,
                    title: t('components.create_button', { entity: t('pages.tag') }),
                    function: () => setCreating(true)
                }
            ]}
            title={t('menu.tags')}
        >
            <DataTable
                key={refreshKey}
                searchRoute={'tags'}
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
                onEdit={handleEditAction}
                onDelete={handleDeleteAction}
            />

            <CreateForm onSubmit={() => setRefreshKey(refreshKey + 1)} open={creating} onOpenChange={setCreating} />
            <EditForm onSubmit={() => setRefreshKey(refreshKey + 1)} open={editing} onOpenChange={setEditing} editingId={editingId} />
        </AuthenticatedLayout>
    )
}
