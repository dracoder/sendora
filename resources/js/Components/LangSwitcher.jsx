import { useState } from "react"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuGroup, DropdownMenuItem } from "@/Components/ui/dropdown-menu"
import { Button } from "@/Components/ui/button"
import { useTranslation } from "react-i18next"
import axios from "axios"

export default function LangSwitcher() {
    const { t, i18n } = useTranslation()
    const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

    async function switchLocale(locale) {
        setSelectedLanguage(locale);
        i18n.changeLanguage(locale);

        await axios.post(route('locale', { locale: locale }))
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center rounded-full">
                    {selectedLanguage == 'en' ? '🇬🇧' : '🇮🇹'}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>{t('layout.select_language')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem className="cursor-pointer" onClick={() => switchLocale("en")}>
                        <div className="flex items-center gap-2">
                            🇬🇧
                            <span>English</span>
                        </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" onClick={() => switchLocale("it")}>
                        <div className="flex items-center gap-2">
                            🇮🇹
                            <span>Italian</span>
                        </div>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
