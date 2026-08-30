import SimulatorForm from '../components/SimulatorForm';

function Simulator() {
  return (
    <div>
      <h1 className="font-titulo text-lg font-semibold text-card-foreground mb-5">
        Event Simulator
      </h1>
      <SimulatorForm />
    </div>
  );
}

export default Simulator;