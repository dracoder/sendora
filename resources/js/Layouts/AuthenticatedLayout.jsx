import { usePage } from '@inertiajs/react';
import { AppHeader } from "@/Components/AppHeader"
import { AppSidebar } from "@/Components/AppSidebar"
import { Button } from "@/Components/ui/button";
import {
    SidebarInset,
    SidebarProvider
} from "@/Components/ui/sidebar"

const HeaderButton = ({ action, index }) => {
    return (
        <Button
            key={action.title + index}
            onClick={action.function}
            className={`
                px-4 py-2 rounded-md
                text-white bg-black hover:bg-gray-800
                dark:text-black dark:bg-white dark:hover:bg-gray-200
            `}
        >
            {action.icon ?? null} {action.title}
        </Button>
    )
}

export default function AuthenticatedLayout({ breadcrumbs = [], title = '', headerActions = [], children }) {
    const { user, active_subscription } = usePage().props;

    return (
        <SidebarProvider>
            <AppSidebar user={user} active_subscription={active_subscription} />

            <SidebarInset>
                <AppHeader breadcrumbs={breadcrumbs} user={user} active_subscription={active_subscription} />
                <div className="flex flex-1 flex-col gap-4 p-4">
                    {(title || headerActions.length > 0) && (
                        <div className="flex justify-between items-center pt-4 pb-12">
                            <h1 className="text-4xl font-semibold">{title}</h1>
                            {headerActions.length > 0 && (
                                <div className="flex flex-row gap-x-4" key="headeractions">
                                    {headerActions.map((action, index) => (
                                        action.function ? (
                                            <HeaderButton key={action.title + index} action={action} index={index} />
                                        ) : (
                                            action.childrenActions && action.childrenActions.length > 0 ? (
                                                <DropdownMenu modal={false} key={action.title + index}>
                                                    <DropdownMenuTrigger>
                                                        <HeaderButton action={action} index={index} />
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className={`overflow-scroll overflow-y-auto overflow-x-hidden`}>
                                                        {action.childrenActions.map((childAction, index) => (
                                                            childAction.function ?
                                                                <DropdownMenuItem key={index}
                                                                    onClick={childAction.function}>
                                                                    <span className="font-medium">{childAction.title}</span>
                                                                </DropdownMenuItem>
                                                                :
                                                                <Link className="flex text-gray-900 w-full" href={childAction.href}>
                                                                    <DropdownMenuItem key={index}>
                                                                        <span className="font-medium w-full">{childAction.title}</span>
                                                                    </DropdownMenuItem>
                                                                </Link>
                                                        ))}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            ) : (
                                                <a
                                                    href={action.href} key={action.title + index}>
                                                    <HeaderButton action={action} index={index} />
                                                </a>
                                            )
                                        )
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
