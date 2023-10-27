import ProfileBar from "./components/ProfileBar"

export default function ProfileLayout({
  children, 
}: {
  children: React.ReactNode
}) {
  return (
    <section>
      <ProfileBar></ProfileBar>
      {children}
    </section>
  )
}