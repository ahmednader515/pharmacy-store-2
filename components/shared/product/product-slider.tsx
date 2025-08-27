'use client'

import * as React from 'react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel'
import ProductCard from './product-card'
import { IProductInput } from '@/types'

export default function ProductSlider({
  title,
  products,
  hideDetails = false,
}: {
  title?: string
  products: (IProductInput & { id: string })[]
  hideDetails?: boolean
}) {
  const [api, setApi] = React.useState<CarouselApi>()
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  // Calculate if we need carousel navigation
  const itemsPerView = hideDetails ? 6 : 5 // Based on the basis classes
  const needsCarousel = products.length > itemsPerView

  React.useEffect(() => {
    if (!api) {
      return
    }

    const onSelect = () => {
      setCanScrollPrev(api.canScrollPrev())
      setCanScrollNext(api.canScrollNext())
    }

    onSelect()
    api.on("select", onSelect)
    api.on("reInit", onSelect)

    return () => {
      api.off("select", onSelect)
      api.off("reInit", onSelect)
    }
  }, [api])

  return (
    <div className='w-full bg-white font-cairo rounded-xl p-6' dir="rtl">
      <h2 className='text-2xl font-bold mb-6 text-right text-gray-800'>{title}</h2>
      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        className='w-full'
        setApi={setApi}
      >
        <CarouselContent className='-ml-4'>
          {products.map((product) => (
            <CarouselItem
              key={product.slug}
              className={
                hideDetails
                  ? 'pl-4 md:basis-1/4 lg:basis-1/5 xl:basis-1/6'
                  : 'pl-4 md:basis-1/3 lg:basis-1/4 xl:basis-1/5'
              }
            >
              <ProductCard
                hideDetails={hideDetails}
                hideAddToCart
                hideBorder
                product={product}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Only show navigation buttons if carousel is needed and can scroll */}
        {needsCarousel && (
          <>
            <CarouselPrevious 
              className='left-2 bg-white/80 hover:bg-white shadow-lg' 
              style={{ display: canScrollPrev ? 'flex' : 'none' }}
            />
            <CarouselNext 
              className='right-2 bg-white/80 hover:bg-white shadow-lg' 
              style={{ display: canScrollNext ? 'flex' : 'none' }}
            />
          </>
        )}
      </Carousel>
    </div>
  )
}
