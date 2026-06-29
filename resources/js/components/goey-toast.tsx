import { usePage } from '@inertiajs/react';
import { goeyToast, GoeyToaster } from 'goey-toast';
import 'goey-toast/styles.css';
import { useEffect } from 'react';

export function FlashToast() {
    const { props } = usePage<{ flash?: { success?: string; error?: string; info?: string; warning?: string } }>();
    const flash = props.flash;

    useEffect(() => {
        if (!flash) return;

        if (flash.success) {
            goeyToast.success(flash.success);
        }
        if (flash.error) {
            goeyToast.error(flash.error);
        }
        if (flash.warning) {
            goeyToast.warning(flash.warning);
        }
        if (flash.info) {
            goeyToast.info(flash.info);
        }
    }, [flash]);

    return <GoeyToaster position="top-right" theme="light" richColors showProgress />;
}
