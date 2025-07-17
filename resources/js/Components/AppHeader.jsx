import * as React from "react"
import { Head } from '@inertiajs/react';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/Components/ui/breadcrumb"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuGroup, DropdownMenuItem } from "@/Components/ui/dropdown-menu"
import { Separator } from "@/Components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar"
import {
    SidebarTrigger,
} from "@/Components/ui/sidebar"
import { Link } from '@inertiajs/react';
import { ThemeToggle } from "./ThemeToggle"
import LangSwitcher from "./LangSwitcher"
import { useTranslation } from 'react-i18next'
import { Badge } from "./ui/badge";
import { TicketSlash } from "lucide-react"


export function AppHeader({ breadcrumbs, user, active_subscription }) {
    const { t } = useTranslation()
    const currentBreadcrumb = breadcrumbs.find(breadcrumb => breadcrumb.current);

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b">
            <div className="flex items-center gap-2 px-3">
                <SidebarTrigger />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Head title={currentBreadcrumb ? currentBreadcrumb.name : ''} />
                <Breadcrumb>
                    <BreadcrumbList>
                        {breadcrumbs.map((breadcrumb, index) => (
                            <React.Fragment key={index}>
                                <BreadcrumbItem>
                                    {breadcrumb.current ? (
                                        <BreadcrumbPage>{breadcrumb.name}</BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink href={breadcrumb.href}>
                                            {breadcrumb.name}
                                        </BreadcrumbLink>
                                    )}
                                </BreadcrumbItem>
                                {index < (breadcrumbs.length - 1) && <BreadcrumbSeparator className="hidden md:block" />}
                            </React.Fragment>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            <div className="flex items-center gap-6 px-3">
                {user.role !== 'admin' && !active_subscription && user.total_credits > 0 && (
                    <Badge variant={Number((user.used_credits * 100) / user.total_credits) >= 75 ? 'destructive' : 'default'} className="md:px-3.5 md:py-1 gap-2 select-none">
                        <span>{user.used_credits} / {user.total_credits}</span>
                        <TicketSlash />
                    </Badge>
                )}

                < LangSwitcher />

                <ThemeToggle />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Avatar>
                            <AvatarFallback className={'uppercase cursor-pointer'}>{user.first_name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px]">
                        <DropdownMenuLabel className="font-semibold">{user.first_name} {user.last_name ?? ''}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <Link href={route("profile.edit")}>
                                <DropdownMenuItem className="cursor-pointer">
                                    {t('layout.profile')}
                                </DropdownMenuItem>
                            </Link>
                            <Link href={route('logout')} method="post">
                                <DropdownMenuItem className="cursor-pointer">
                                    {t('layout.logout')}
                                </DropdownMenuItem>
                            </Link>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
