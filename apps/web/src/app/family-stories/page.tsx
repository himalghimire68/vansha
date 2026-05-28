import DashboardLayout from '@/app/dashboard-layout'

export default function FamilyStoriesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="font-serif text-headline-lg text-primary mb-2">Family Stories</h1>
          <p className="font-sans text-body-md text-on-surface-variant">
            Preserve the stories, memories, and oral histories of your lineage.
          </p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-12 text-center archival-shadow">
          <span className="text-5xl block mb-4">📖</span>
          <h2 className="font-serif text-headline-md text-primary mb-3">Stories Archive Coming Soon</h2>
          <p className="font-sans text-body-md text-on-surface-variant max-w-md mx-auto">
            This section will allow you to record family stories, oral histories, and personal narratives
            tied to individual ancestors in your tree.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: '✍️', title: 'Write Stories', desc: 'Record narratives in text, attach them to ancestors.' },
            { icon: '🎙️', title: 'Audio Memories', desc: 'Upload voice recordings of elders sharing their memories.' },
            { icon: '🔗', title: 'Link to People', desc: 'Connect each story directly to the people involved.' },
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
