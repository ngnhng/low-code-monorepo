import { Dialog, DialogContent, DialogTrigger, DialogOverlay } from '@repo/ui';

export function OptionDialog({ children, trigger }) {

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      {/* <DialogOverlay className='fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 grid place-items-center overflow-y-auto;'>
      </DialogOverlay> */}
        <DialogContent className='sm:max-w-[450px] overflow-y-auto sm:max-h-[450px] xl:max-h-[600px] lg:max-h-[600px]'>{children}</DialogContent>
    </Dialog>
  );
}
