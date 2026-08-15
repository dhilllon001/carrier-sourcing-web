import { AutoWorkflowsPanel } from '@/components/config/AutoWorkflowsPanel'

type ConfigurationPageProps = {
  search: string
  onOpenLoad: (probill: string) => void
  /** Opens straight on Carrier prefs, Favourites, Live runs, etc. */
  initialView?: 'workflows' | 'runs' | 'carriers' | 'favorites' | 'new'
}

export function ConfigurationPage({
  search,
  onOpenLoad,
  initialView = 'workflows',
}: ConfigurationPageProps) {
  return (
    <div className="sr-page">
      <AutoWorkflowsPanel search={search} onOpenLoad={onOpenLoad} initialView={initialView} />
    </div>
  )
}
