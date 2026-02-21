import React from 'react'

const goals: string[] = [
  "End poverty & discrimination 🚫",
  "Equal learning for every child 👧👦",
  "Economic independence for families 💰",
  "Strong, healthy communities 🌱",
  "Self-reliant rural villages 🌾",
  "Inclusive growth & participation 🌍",
  "Respect and empowerment for Dalits 🌟"
]

const objectives: string[] = [
  "Promote equality & justice ⚖️",
  "Quality education for children 📚",
  "Women's empowerment & livelihoods 👩‍👩‍👧",
  "Better health & nutrition 🏥",
  "Sustainable livelihoods & skills 🛠️",
  "Community leadership 🤝",
  "Rights & dignity advocacy ✊"
]

interface GoalsObjectivesProps {
  // Add any props here if needed in the future
  // For example:
  // className?: string
  // title?: string
}

const GoalsObjectives: React.FC<GoalsObjectivesProps> = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Goals Column - Teal Background */}
          <div className="bg-teal-600 p-8 lg:p-12">
            <h3 className="text-2xl font-bold text-white mb-6">Goals</h3>
            <ul className="space-y-3">
              {goals.map((goal: string, index: number) => (
                <li key={index} className="text-white flex items-start">
                  <span className="text-yellow-300 mr-3 mt-1"></span>
                  <span className="leading-relaxed">{goal}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Objectives Column - Blue Background */}
          <div className="bg-blue-600 p-8 lg:p-12">
            <h3 className="text-2xl font-bold text-white mb-6">Objectives</h3>
            <ul className="space-y-3">
              {objectives.map((objective: string, index: number) => (
                <li key={index} className="text-white flex items-start">
                  <span className="text-yellow-300 mr-3 mt-1"></span>
                  <span className="leading-relaxed">{objective}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

export default GoalsObjectives