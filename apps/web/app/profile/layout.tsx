import ProfileBar from './_components/profile-bar';
import { UserAuthWrapper } from 'lib/wrappers/user-auth-wrapper';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserAuthWrapper>
      <section>
        <ProfileBar></ProfileBar>
        {children}
      </section>
    </UserAuthWrapper>
  );
}
