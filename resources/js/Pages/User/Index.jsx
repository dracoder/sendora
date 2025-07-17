import { useEffect, useState } from 'react';
import { DataTable } from '@/Components/DataTable';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { columnMap, searchKeys } from './columns';
import UserService from '@/Services/UserService';
import { toast } from '@/hooks/use-toast';
import EditForm from '@/Components/forms/User/edit';
import CreateForm from '@/Components/forms/User/create';
import { UserPlus } from 'lucide-react';
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
        UserService.destroy(id, () => {
            toast({
                title: t('pages.deleted', { name: t('pages.user') }),
                duration: 3000
            });
            setRefreshKey(refreshKey + 1)
        })
    }

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { name: t('menu.users'), href: route('users.index'), current: true },
            ]}
            headerActions={[
                {
                    icon: <UserPlus />,
                    title: t('components.create_button', { entity: t('pages.user') }),
                    function: () => setCreating(true)
                }
            ]}
            title={t('menu.users')}
        >
            <DataTable
                key={refreshKey}
                searchRoute={'users'}
                searchOptions={searchOptions}
                columnMap={columnMap}
                searchKeys={searchKeys}
                initialOrderBy="id"
                filters={{
                    'role': {
                        label: t('pages.role'),
                        type: 'select',
                        options: [
                            { label: 'Admin', value: 'admin' },
                            { label: t('pages.user'), value: 'user' },
                        ]
                    },
                    'is_affiliate': {
                        label: t('pages.affiliate'),
                        type: 'select',
                        options: [
                            { label: t('components.yes'), value: 1 },
                            { label: t('components.no'), value: 0 },
                        ]
                    },
                }}
                hideShow
                onEdit={handleEditAction}
                onDelete={handleDeleteAction}
            />

            <CreateForm onSubmit={() => setRefreshKey(refreshKey + 1)} open={creating} onOpenChange={setCreating} />
            <EditForm onSubmit={() => setRefreshKey(refreshKey + 1)} open={editing} onOpenChange={setEditing} editingId={editingId} />
        </AuthenticatedLayout>
    )
}
