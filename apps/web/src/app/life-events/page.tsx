import DashboardLayout from '@/app/dashboard-layout'

export default function LifeEventsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="font-serif text-headline-lg text-primary mb-2">Life Events</h1>
          <p className="font-sans text-body-md text-on-surface-variant">
            Chronicle the births, marriages, migrations, and milestones that shaped your family.
          </p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-12 text-center archival-shadow">
          <span className="text-5xl block mb-4">📅</span>
          <h2 className="font-serif text-headline-md text-primary mb-3">Events Timeline Coming Soon</h2>
          <p className="font-sans text-body-md text-on-surface-variant max-w-md mx-auto">
            A chronological timeline of every significant event across your family history —
            births, marriages, migrations, and notable achievements — displayed generation by generation.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-5">
          {[
            { icon: '🌱', title: 'Births', desc: 'Record births with dates and locations.' },
            { icon: '💍', title: 'Marriages', desc: 'Log weddings, spouses, and ceremony details.' },
            { icon: '🚢', title: 'Migrations', desc: 'Track family movements across regions.' },
            { icon: '⭐', title: 'Achievements', desc: 'Honours, offices, and notable milestones.' },
          ].map(item => (
            <div key={item.title} className="bg-surface-container-low border border-outline-variant rounded-xl p-5">
              <span className="text-2xl block mb-2">{item.icon}</span>
              <h3 className="font-serif text-body-md text-primary mb-1">{item.title}</h3>
              <p className="font-sans text-caption text-on-surface-variant">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
