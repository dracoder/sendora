import { Copy } from "lucide-react"
import { copyToClipboard } from "@/lib/utils"
import { useTranslation } from "react-i18next";

function Variable(item) {
    return (
        <div className="flex flex-row gap-2 items-center">
            <Copy className="size-5 cursor-pointer" onClick={() => copyToClipboard('{{' + item.name + '}}')} />
            <span><strong>{item.name}</strong>: {item.description}</span>
        </div>
    )
}

function Condition(item) {
    return (
        <div className="flex flex-row gap-2 items-center">
            <div className="w-5">
                <Copy className="size-5 cursor-pointer" onClick={() => copyToClipboard(item.name)} />
            </div>
            <div className="flex flex-row gap-2">
                <div className="break-words">
                    <strong>{item.name}</strong>
                </div>
                <span>{item.description}</span>
            </div>
        </div>
    )
}

export default function VariablesAndConditions({ isTemplate = false }) {
    const { t } = useTranslation();
    const variables = [
        { name: "full_name", description: t('variables_conditions.subscriber_full_name') },
        { name: "first_name", description: t('variables_conditions.subscriber_first_name') },
        { name: "last_name", description: t('variables_conditions.subscriber_last_name') },
        { name: "email", description: t('variables_conditions.subscriber_email') },
        { name: "phone", description: t('variables_conditions.subscriber_phone') },
        { name: "email_status", description: t('variables_conditions.subscriber_email_status') },
        { name: "company", description: t('variables_conditions.subscriber_company') },
        { name: "industry", description: t('variables_conditions.subscriber_industry') },
        { name: "location", description: t('variables_conditions.subscriber_location') },

        { name: "linkedin_url", description: t('variables_conditions.subscriber_linkedin_url') },
        { name: "note", description: t('variables_conditions.subscriber_note') },
        { name: "unsubscribe_link", description: t('variables_conditions.unsubscribe_link') },
    ];

    if (isTemplate) {
        variables.unshift({ name: "content", description: t('variables_conditions.campaign_content') });
    }

    const conditions = [
        { name: `@if(${t('variables_conditions.variable')})\n@endif`, description: t('variables_conditions.if_variable') },
        { name: `@if(${t('variables_conditions.variable')})\n@else\n@endif`, description: t('variables_conditions.if_else_variable') },
    ];

    return (
        <div className="flex flex-row justify-between items-start">
            <div className="flex flex-col gap-4 w-1/2">
                <h2 className="text-lg font-semibold">{t('variables_conditions.available_variables')}</h2>
                <div className="flex flex-col gap-2">
                    {variables.map((item, index) => (
                        <Variable key={index} {...item} />
                    ))}
                </div>
            </div>
            <div className="flex flex-col gap-4 w-1/2">
                <h2 className="text-lg font-semibold">{t('variables_conditions.conditions')}</h2>
                <div className="flex flex-col gap-2">
                    {conditions.map((item, index) => (
                        <Condition key={index} {...item} />
                    ))}
                </div>
            </div>
        </div>
    )
}
