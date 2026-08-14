import { AutoWorkflowsPanel } from '@/components/config/AutoWorkflowsPanel'

type ConfigurationPageProps = {
  search: string
  onOpenLoad: (probill: string) => void
}

export function ConfigurationPage({ search, onOpenLoad }: ConfigurationPageProps) {
  return (
    <div className="sr-page">
      <AutoWorkflowsPanel search={search} onOpenLoad={onOpenLoad} />
    </div>
  )
}
