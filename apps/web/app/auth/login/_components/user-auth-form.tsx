'use client';

import { Button } from '@repo/ui';
import { Icons } from 'components/icons/icons';
import { useRouter } from 'next/navigation';
import { cn } from 'lib/shadcn/utils';

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const router = useRouter();
  const handleNav = () => {
    router.push(process.env.NEXT_PUBLIC_AUTH_API_URL + '/api/v1/oauth/google');
  };

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <form>
        <div className="grid gap-2">
          <Button variant="outline" type="button" onClick={handleNav} asChild>
            <div>
              <Icons.google className="mr-2 h-4 w-4" />
              Google
            </div>
          </Button>
        </div>
      </form>
    </div>
  );
}
