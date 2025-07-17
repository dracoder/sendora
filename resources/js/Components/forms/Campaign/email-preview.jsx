import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useEffect, useState } from 'react';
import EmailService from '@/Services/EmailService';

export default function EmailPreview({ emailId, open, onOpenChange }) {
    const { t, i18n } = useTranslation();

    const [body, setBody] = useState(null);

    useEffect(() => {
        if (!emailId || !open) return;

        EmailService.preview(emailId, { lang: i18n.language }, (data) => {
            setBody(data.content);
        });
    }, [emailId, open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>{t('pages.preview') + ' ' + t('pages.email')}</DialogTitle>
                </DialogHeader>
                {body && <div
                    className="bg-white dark:border-0 border border-border p-2 rounded-lg text-black w-full h-[70vh] overflow-auto"
                    dangerouslySetInnerHTML={{ __html: body }}
                />}
            </DialogContent>
        </Dialog>
    )
}
