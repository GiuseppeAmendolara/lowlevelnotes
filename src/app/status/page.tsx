import StatusCard from '@/components/StatusCard'

export default async function StatusPage() {

  return (
    <main className="min-h-screen bg-[#171717]">
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-10">
        <StatusCard />
      </section>
    </main>
  );
}