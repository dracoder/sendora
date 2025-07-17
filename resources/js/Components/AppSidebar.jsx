import * as React from "react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail,
} from "@/Components/ui/sidebar"
import logoImage from '/resources/images/logo.png'

import { Building, Cog, FileEdit, CreditCard, Home, Mail, Tags, Users, IdCard, Star, Key, WalletIcon, Package2Icon } from "lucide-react"
import { useTranslation } from 'react-i18next'
import { Link } from '@inertiajs/react'
import { Button } from "./ui/button"

const data = [
    {
        title: "dashboard",
        url: 'dashboard',
        icon: <Home />,
    },
    {
        title: 'organizations',
        url: 'organizations.index',
        icon: <Building />,
    },
    {
        title: "users",
        url: 'users.index',
        icon: <IdCard />,
        onlyAdmin: true
    },
    {
        title: "subscribers",
        url: 'subscribers.index',
        icon: <Users />
    },
    
    {
        title: "tags",
        url: 'tags.index',
        icon: <Tags />,
    },
    {
        title: "campaigns",
        url: 'campaigns.index',
        icon: <Mail />,
    },
    {
        title: "templates",
        url: 'templates.index',
        icon: <FileEdit />,
    },
    {
        title: "credit_transactions",
        url: 'credit-transactions.index',
        icon: <WalletIcon />,
        onlyAdmin: false
    },
    {
        title: "subscriptions",
        url: 'subscriptions.index',
        icon: <FileEdit />,
        onlyAdmin: true
    },
    {
        title: "settings",
        icon: <Cog />,
        onlyAdmin: true,
        items: [
            {
                title: "subscription_plans",
                url: 'plans.index',
                icon: <CreditCard />,
                onlyAdmin: true
            },
            {
                title: "credit_packages",
                url: 'credit-packages.index',
                icon: <Package2Icon />,
                onlyAdmin: true
            },
            {
                title: "api-keys",
                url: 'api-keys.index',
                icon: <Key />,
                onlyAdmin: true
            },
            {
                title: "configs",
                url: 'configs.index',
                icon: <Cog />,
                onlyAdmin: true
            },
        ],
    },
];

export function AppSidebar({
    user,
    active_subscription,
    ...props
}) {
    const { t } = useTranslation()

    return (
        (<Sidebar {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a href={route('dashboard')}>
                                <img
                                    src={logoImage}
                                    alt="Logo"
                                    className="size-10"
                                />
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-semibold">Sendora</span>
                                    <span className="">Saas</span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu>
                        {data.map((item) => (
                            item.onlyAdmin && user.role !== 'admin' ? (
                                null
                            ) : (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        {item.url ? (
                                            <Link href={route(item.url)} as="a" className="font-medium">
                                                {item.icon}
                                                {t('menu.' + item.title)}
                                            </Link>
                                        ) : (
                                            <a href="#" className="font-medium">
                                                {item.icon}
                                                {t('menu.' + item.title)}
                                            </a>
                                        )}
                                    </SidebarMenuButton>
                                    {item.items?.length ? (
                                        <SidebarMenuSub>
                                            {item.items.map((item) => (
                                                item.onlyAdmin && user.role !== 'admin' ? (
                                                    null
                                                ) : (
                                                    <SidebarMenuSubItem key={item.title}>
                                                        <SidebarMenuSubButton asChild isActive={item.isActive}>
                                                            <Link href={route(item.url)} as="a">
                                                                {item.icon}
                                                                {t('menu.' + item.title)}
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                )
                                            ))}
                                        </SidebarMenuSub>
                                    ) : null}
                                </SidebarMenuItem>
                            )
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            {user.role !== 'admin' && (!active_subscription || (active_subscription && active_subscription.subscription_plan.is_upgradable)) && (
                <SidebarFooter>
                    <Link href={route('subscribe')}>
                        {!active_subscription ? (
                            <Button variant="yellow" className="w-full"><Star /> {t('menu.subscribe')}</Button>
                        ) : (
                            <Button variant="yellow" className="w-full"><Star /> {t('menu.upgrade')}</Button>
                        )}
                    </Link>
                </SidebarFooter>
            )}
            <SidebarRail />
        </Sidebar >)
    );
}
