import { useEffect, useState } from 'react';
import { DataTable } from '@/Components/DataTable';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { columnMap, searchKeys } from './columns';
import PlanService from '@/Services/PlanService';
import { toast } from '@/hooks/use-toast';
import EditForm from '@/Components/forms/Plan/edit';
import CreateForm from '@/Components/forms/Plan/create';
import { CreditCard } from 'lucide-react';
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
        PlanService.destroy(id, 
            () => {
                toast({
                    title: t('pages.deleted', { name: t('pages.plan') }),
                    duration: 3000
                });
                setRefreshKey(prevKey => prevKey + 1);
            },
            (error) => {
                toast({
                    title: t('components.error'),
                    description: error.message || t('pages.delete_failed'),
                    variant: 'destructive',
                    duration: 3000
                });
            }
        );
    }

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { name: t('menu.subscription_plans'), href: route('plans.index'), current: true },
            ]}
            headerActions={[
                {
                    icon: <CreditCard />,
                    title: t('components.create_button', { entity: t('pages.plan') }),
                    function: () => setCreating(true)
                }
            ]}
            title={t('menu.subscription_plans')}
        >
            <DataTable
                key={refreshKey}
                searchRoute={'plans'}
                searchOptions={searchOptions}
                columnMap={columnMap}
                searchKeys={searchKeys}
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
