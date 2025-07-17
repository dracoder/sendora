import { Loader2 } from "lucide-react"

import { Button } from "./ui/button";

export default function LoadingButton({ loading, t, children, ...props }) {
    return loading ? (
        <Button {...props} disabled>
            <Loader2 className="animate-spin" />
            {t('components.please_wait')}
        </Button>
    ) : (
        <Button {...props}>
            {children}
        </Button>
    )
}
