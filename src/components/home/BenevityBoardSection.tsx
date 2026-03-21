import React from 'react'
import Image from 'next/image'

interface BoardMember {
  name: string
  role: string
  image: string
}

interface BenevityBoardSectionProps {
  // Benevity section props
  benevityTitle: string
  benevityText: string
  splatterImages: string[]
  
  // Board members section props
  boardTitle: string
  boardText: string
  boardMembers: BoardMember[]
}

const BenevityBoardSection: React.FC<BenevityBoardSectionProps> = ({
  benevityTitle,
  benevityText,
  splatterImages,
  boardTitle,
  boardText,
  boardMembers
}) => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Benevity & Goodstack Section */}
        <div className="mb-16">
          <h2 className="text-center md:text-left text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {benevityTitle}
          </h2>
          <p className="text-center md:text-left text-lg mb-8 leading-relaxed">
            {benevityText}
          </p>
          
          {/* Splatter Images Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {splatterImages.map((image: string, index: number) => (
              <div key={index} className="aspect-square relative overflow-hidden">
                <Image
                  src={image}
                  alt={`Splatter design ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Board Members Section */}
        <div>
          <h2 className="text-center md:text-left text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {boardTitle}
          </h2>
          <p className="text-center md:text-left text-lg mb-8 leading-relaxed">
            {boardText}
          </p>
          
          {/* Board Members Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {boardMembers.map((member: BoardMember, index: number) => (
              <div key={index} className="text-center">
                <div className="aspect-square relative overflow-hidden mb-4">
                  <Image
                    src={member.image}
                    alt={`${member.name} - ${member.role}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="font-bold text-gray-900 text-xl mb-1">{member.name}</h3>
                <p className="text-xl!">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default BenevityBoardSection