import { useStore } from './state/store'

export default function App() {
  const { currentStep } = useStore()
  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-blue-400">APA2118 Contract Comparison Tool</h1>
        <p className="text-gray-400 mt-2">Current step: {currentStep}</p>
        <p className="text-gray-500 mt-1 text-sm">UI coming in next build phase</p>
      </div>
    </div>
  )
}
