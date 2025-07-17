import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DeleteUserForm from '@/Components/forms/Profile/delete-user';
import UpdateUserForm from '@/Components/forms/Profile/update-user';
import UpdatePasswordForm from '@/Components/forms/Profile/update-password';
import ActiveSubscriptionForm from '@/Components/forms/Profile/active-subscription';
import { useTranslation } from 'react-i18next';

export default function Edit({ }) {
    const { t } = useTranslation();
    return (
        <AuthenticatedLayout
            title={t('layout.profile')}
            breadcrumbs={[
                { name: t('layout.profile'), href: route('profile.edit'), current: true },
            ]}
        >
            <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                <Card title={t('pages.profile_information')} description={t('pages.profile_information_text')} form={<UpdateUserForm />} />
                <Card title={t('pages.active_subscription')} description={t('pages.here_manage_subscription')} form={<ActiveSubscriptionForm />} />
                <Card title={t('pages.update_password')} description={t('pages.update_password_text')} form={<UpdatePasswordForm />} />
                <Card title={t('pages.delete_account')} description={t('pages.delete_account_text')} form={<DeleteUserForm />} />
            </div>
        </AuthenticatedLayout>
    );
}

function Card({ title, description, form }) {
    return (
        <div className="card dark:border p-4 shadow sm:rounded-lg sm:p-8">
            <section className={`space-y-6 max-w-xl`}>
                <header>
                    <h2 className="text-lg font-bold">
                        {title}
                    </h2>

                    <p className="mt-1 text-sm">
                        {description}
                    </p>
                </header>

                {form}
            </section>
        </div>
    )
}
