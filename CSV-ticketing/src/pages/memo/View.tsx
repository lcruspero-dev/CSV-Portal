import { useNavigate } from 'react-router-dom'
import BackButton from '@/components/kit/BackButton'

type SelectionOption = 'memo' | 'policies'

const View: React.FC = () => {
  const navigate = useNavigate()

  const handleCardClick = (option: SelectionOption) => {
    if (option === 'memo') {
      navigate('/all-memo')
    } else if (option === 'policies') {
      navigate('/policies')
    }
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 ">

<div className='mt-2 pl-2'>
     <BackButton />
</div>

        <div className='flex flex-col items-center justify-center p-8'>
      {/* Thanksgiving Header */}
      <div className="text-center mb-12 ">
        <h1 className="text-5xl font-bold text-amber-800 mb-4">
           Give Thanks 🍂
        </h1>
        <p className="text-xl text-amber-600">
          Choose where you'd like to share your gratitude
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-12 justify-center items-center">
        {/* Memo Card - Thanksgiving Theme */}
        <div 
          className="p-12 rounded-2xl cursor-pointer transition-all duration-300 min-w-[320px] min-h-[280px] text-center shadow-2xl bg-gradient-to-br from-orange-100 to-amber-100 border-2 border-amber-200 text-amber-900 hover:bg-gradient-to-br hover:from-orange-500 hover:to-amber-500 hover:text-white hover:transform hover:scale-105 hover:shadow-2xl flex flex-col items-center justify-center group relative overflow-hidden"
          onClick={() => handleCardClick('memo')}
        >
          {/* Decorative elements */}
          <div className="absolute top-4 right-4 text-2xl">📝</div>
          <div className="absolute bottom-4 left-4 text-2xl">🍁</div>
          
          <h3 className="text-3xl font-bold mb-4 group-hover:text-white">Memo</h3>
          <p className="text-lg opacity-90 leading-relaxed">
            Share thankful thoughts and<br />
            organizational memos
          </p>
          
          {/* Hover effect decoration */}
          <div className="absolute inset-0 border-4 border-transparent group-hover:border-amber-200 rounded-2xl transition-all duration-300"></div>
        </div>

        {/* Policies Card - Thanksgiving Theme */}
        <div 
          className="p-12 rounded-2xl cursor-pointer transition-all duration-300 min-w-[320px] min-h-[280px] text-center shadow-2xl bg-gradient-to-br from-orange-100 to-amber-100 border-2 border-amber-200 text-amber-900 hover:bg-gradient-to-br hover:from-orange-500 hover:to-amber-500 hover:text-white hover:transform hover:scale-105 hover:shadow-2xl flex flex-col items-center justify-center group relative overflow-hidden"
          onClick={() => handleCardClick('policies')}
        >
          {/* Decorative elements */}
          <div className="absolute top-4 left-4 text-2xl">📋</div>
          <div className="absolute bottom-4 right-4 text-2xl">🦃</div>
          
          <h3 className="text-3xl font-bold mb-4 group-hover:text-white">Policies</h3>
          <p className="text-lg opacity-90 leading-relaxed">
            Review grateful guidelines and<br />
            thankful procedures
          </p>
          
          {/* Hover effect decoration */}
          <div className="absolute inset-0 border-4 border-transparent group-hover:border-amber-200 rounded-2xl transition-all duration-300"></div>
        </div>
      </div>

      {/* Thanksgiving Footer Message */}
      <div className="mt-16 text-center">
        <p className="text-amber-700 text-lg italic">
          "Gratitude turns what we have into enough." 🍂
        </p>
      </div>
      </div>
    </section>
  )
}

export default View