'use client'
import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import data from '@/lib/data'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function HomeCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Get carousels data
  const { carousels } = data.settings[0] || { carousels: [] };
  
  // Auto-slide every 5 seconds (only when not hovering)
  useEffect(() => {
    if (isHovering || !carousels || carousels.length === 0) return;

    intervalRef.current = setInterval(() => {
      goToNext()
    }, 5000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isHovering, carousels])

  const goToPrevious = () => {
    if (isTransitioning || !carousels || carousels.length === 0) return
    
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentSlide(prev => prev === 0 ? carousels.length - 1 : prev - 1)
      setTimeout(() => setIsTransitioning(false), 300)
    }, 300)
  }

  const goToNext = () => {
    if (isTransitioning || !carousels || carousels.length === 0) return
    
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentSlide(prev => (prev + 1) % carousels.length)
      setTimeout(() => setIsTransitioning(false), 300)
    }, 300)
  }

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentSlide || !carousels || carousels.length === 0) return
    
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentSlide(index)
      setTimeout(() => setIsTransitioning(false), 300)
    }, 300)
  }

  const handleMouseEnter = () => {
    setIsHovering(true)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
  }

  // Early return if no carousels
  if (!carousels || carousels.length === 0) {
    return null;
  }

  return (
    <div 
      className="font-cairo relative overflow-hidden" 
      dir="rtl"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative w-full h-[400px] md:h-[500px]">
        {/* Current Slide */}
        <div className="relative h-full w-full">
          <Image
            src={carousels[currentSlide].image}
            alt={carousels[currentSlide].title}
            fill
            className={`object-cover transition-all duration-300 ease-in-out ${
              isTransitioning ? 'blur-sm scale-105' : 'blur-none scale-100'
            }`}
            priority={currentSlide === 0}
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center text-white">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 font-cairo">
                {carousels[currentSlide].title}
              </h2>
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Link href={carousels[currentSlide].url}>
                  {carousels[currentSlide].buttonCaption}
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Navigation Arrows */}
        <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 flex justify-between items-center px-4 pointer-events-none z-10">
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full bg-white/20 hover:bg-white/30 text-white border-0 pointer-events-auto backdrop-blur-sm transition-all duration-200 hover:scale-110 shadow-lg"
            onClick={goToPrevious}
            aria-label="Previous slide"
            disabled={isTransitioning}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full bg-white/20 hover:bg-white/30 text-white border-0 pointer-events-auto backdrop-blur-sm transition-all duration-200 hover:scale-110 shadow-lg"
            onClick={goToNext}
            aria-label="Next slide"
            disabled={isTransitioning}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 z-10">
          {carousels.map((_, index) => (
            <button
              key={index}
              className={`w-4 h-4 rounded-full transition-all duration-300 cursor-pointer shadow-lg ${
                index === currentSlide 
                  ? 'bg-white scale-125 ring-2 ring-blue-400' 
                  : 'bg-white/50 hover:bg-white/75 hover:scale-110'
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              disabled={isTransitioning}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
