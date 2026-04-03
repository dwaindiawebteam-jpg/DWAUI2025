import React from 'react'
import Image from 'next/image'

interface Program {
  id: number
  title: string
  description: string
  image: string
}

interface ProgramsGridProps {
  programs: Program[]
  title?: string
  titleClasses?: string
  containerClasses?: string
}

const ProgramsGrid: React.FC<ProgramsGridProps> = ({ 
  programs,
  title = "Our Programs",
  titleClasses = "heading-responsive font-bold text-gray-900 mb-10 text-center sm:text-left",
  containerClasses = "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
}) => {

  const isSingle = programs.length === 1
  
  return (
    <section className="py-12  bg-white">
      <div className="text-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 sm:text-left">
        <h2 className={titleClasses}>
          {title}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {programs.map((program: Program) => (
            <React.Fragment key={program.id}>
              
              {/* MOBILE CARD */}
              <div className="block sm:hidden bg-white shadow-lg overflow-hidden">
                <div className="relative w-full h-48 bg-gray-100">
                  <Image
                    src={program.image}
                    alt={program.title}
                    fill
                    className="object-contain"
                    sizes="100vw"
                  />
                </div>

                <div className="p-4">
                  <p className="text-center sm:text-left">{program.description}</p>
                </div>
              </div>

              {/* DESKTOP CARD */}
              <div className="hidden sm:flex bg-white shadow-lg overflow-hidden w-88 h-44">
                <div className="w-1/2 relative aspect-square bg-gray-100">
                  <Image
                    src={program.image}
                    alt={program.title}
                    fill
                    className="object-contain"
                    sizes="50vw"
                  />
                </div>

                <div className="flex-1 p-4">
                  <p>{program.description}</p>
                </div>
              </div>

            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProgramsGrid