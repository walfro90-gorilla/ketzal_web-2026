'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/navigation';
import { ChangeEvent, useTransition } from 'react';

export default function LanguageSelector() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    function onSelectChange(event: ChangeEvent<HTMLSelectElement>) {
        const nextLocale = event.target.value;
        startTransition(() => {
            router.replace(pathname, { locale: nextLocale });
        });
    }

    return (
        <select
            defaultValue={locale}
            onChange={onSelectChange}
            disabled={isPending}
            className="bg-transparent border border-gray-600 text-white rounded px-2 py-1 text-sm focus:outline-none focus:border-primary"
        >
            <option value="es" className="bg-black">ES</option>
            <option value="en" className="bg-black">EN</option>
            <option value="zh" className="bg-black">中文</option>
        </select>
    );
}
