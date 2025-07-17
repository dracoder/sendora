import { useEffect, useState } from 'react';
import { DataTable } from '@/Components/DataTable';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { columnMap, searchKeys } from './columns';
import CreditPackageService from '@/Services/CreditPackageService';
import { toast } from '@/hooks/use-toast';
import EditForm from '@/Components/forms/CreditPackage/edit';
import CreateForm from '@/Components/forms/CreditPackage/create';
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
        CreditPackageService.destroy(id, () => {
            toast({
                title: t('pages.deleted', { name: t('pages.credit_packages') }),
                duration: 3000
            });
            setRefreshKey(refreshKey + 1)
        })
    }

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { name: t('menu.credit_packages'), href: route('credit-packages.index'), current: true },
            ]}
            headerActions={[
                {
                    icon: <CreditCard />,
                    title: t('components.create_button', { entity: t('pages.credit_packages') }),
                    function: () => setCreating(true)
                }
            ]}
            title={t('menu.credit_packages')}
        >
            <DataTable
                key={refreshKey}
                searchRoute={'credit-packages'}
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