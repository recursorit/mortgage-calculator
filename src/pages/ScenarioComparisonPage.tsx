import { HeaderBar } from '../components/HeaderBar';
import { ScenarioComparisonSection } from '../components/ScenarioComparisonSection';
import { ScenarioComparisonDetailsSection } from '../components/ScenarioComparisonDetailsSection';

export function ScenarioComparisonPage(props: { onOpenNav?: () => void }) {
  return (
    <>
      <HeaderBar onOpenNav={props.onOpenNav} />

      <main className="py-6 sm:py-10">
        <div className="grid gap-6 print:hidden">
          <ScenarioComparisonSection />
          <ScenarioComparisonDetailsSection />
        </div>
      </main>
    </>
  );
}
