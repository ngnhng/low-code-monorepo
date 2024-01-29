import { Dialog, DialogContent, DialogTrigger } from '@repo/ui';

export function OptionDialog({ children, trigger }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">{children}</DialogContent>
    </Dialog>
  );
}
