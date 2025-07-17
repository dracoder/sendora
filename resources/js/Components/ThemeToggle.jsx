import { Moon, Sun } from "lucide-react"

import { Button } from "@/Components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"
import { useTheme } from "@/Components/ThemeProvider"
import { useTranslation } from "react-i18next"

export function ThemeToggle() {
    const { setTheme } = useTheme()
    const { t } = useTranslation()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">{t('components.theme_toggle')}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem className="cursor-pointer" onClick={() => setTheme("light")}>
                    {t('components.themes.light')}
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => setTheme("dark")}>
                    {t('components.themes.dark')}
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => setTheme("system")}>
                    {t('components.themes.system')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
