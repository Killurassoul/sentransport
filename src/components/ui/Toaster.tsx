import { Toaster as SonnerToaster } from 'sonner';
import { useUIStore } from '@/store/ui';

export function Toaster() {
  const theme = useUIStore((s) => s.theme);
  return (
    <SonnerToaster
      position="top-right"
      theme={theme}
      closeButton
      richColors
      offset={18}
      gap={10}
      toastOptions={{
        className:
          'rounded-2xl border border-line/10 bg-shell text-ink shadow-pop font-sans text-[13px]',
        descriptionClassName: 'text-ink-soft',
      }}
    />
  );
}
