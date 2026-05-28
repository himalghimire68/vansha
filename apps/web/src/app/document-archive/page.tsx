import DashboardLayout from '@/app/dashboard-layout'

export default function DocumentArchivePage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="font-serif text-headline-lg text-primary mb-2">Document Archive</h1>
          <p className="font-sans text-body-md text-on-surface-variant">
            Store certificates, letters, photographs, and historical documents for your family.
          </p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-12 text-center archival-shadow">
          <span className="text-5xl block mb-4">📦</span>
          <h2 className="font-serif text-headline-md text-primary mb-3">Document Vault Coming Soon</h2>
          <p className="font-sans text-body-md text-on-surface-variant max-w-md mx-auto">
            Upload and organise scanned birth certificates, marriage records, land deeds, letters,
            and photographs. Each document can be linked to one or more ancestors.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: '📄', title: 'Certificates', desc: 'Birth, marriage, death, and citizenship certificates.' },
            { icon: '🖼️', title: 'Photographs', desc: 'Historical photos with dates and tagged individuals.' },
            { icon: '📜', title: 'Land & Legal', desc: 'Deeds, wills, and ancestral property records.' },
          ].map(item => (
            <div key={item.title} className="bg-surface-container-low border border-outline-variant rounded-xl p-6">
              <span className="text-3xl block mb-3">{item.icon}</span>
              <h3 className="font-serif text-body-lg text-primary mb-1">{item.title}</h3>
              <p className="font-sans text-caption text-on-surface-variant">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
