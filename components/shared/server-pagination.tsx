import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface ServerPaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
  searchParams?: Record<string, string>
  className?: string
}

export default function ServerPagination({
  currentPage,
  totalPages,
  baseUrl,
  searchParams = {},
  className = '',
}: ServerPaginationProps) {
  if (totalPages <= 1) return null

  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', page.toString())
    return `${baseUrl}?${params.toString()}`
  }

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`} dir="rtl">
      <Button
        variant='outline'
        size='sm'
        asChild
        disabled={currentPage === 1}
      >
        <Link href={createPageUrl(1)}>
          <ChevronsRight className='h-4 w-4' />
          <span className='sr-only'>First page</span>
        </Link>
      </Button>

      <Button
        variant='outline'
        size='sm'
        asChild
        disabled={currentPage === 1}
      >
        <Link href={createPageUrl(currentPage - 1)}>
          <ChevronRight className='h-4 w-4' />
          <span className='sr-only'>Previous page</span>
        </Link>
      </Button>

      {getVisiblePages().map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span className='px-3 py-2 text-sm text-muted-foreground'>...</span>
          ) : (
            <Button
              variant={currentPage === page ? 'default' : 'outline'}
              size='sm'
              asChild
            >
              <Link href={createPageUrl(page as number)}>
                {page}
              </Link>
            </Button>
          )}
        </React.Fragment>
      ))}

      <Button
        variant='outline'
        size='sm'
        asChild
        disabled={currentPage === totalPages}
      >
        <Link href={createPageUrl(currentPage + 1)}>
          <ChevronLeft className='h-4 w-4' />
          <span className='sr-only'>Next page</span>
        </Link>
      </Button>

      <Button
        variant='outline'
        size='sm'
        asChild
        disabled={currentPage === totalPages}
      >
        <Link href={createPageUrl(totalPages)}>
          <ChevronsLeft className='h-4 w-4' />
          <span className='sr-only'>Last page</span>
        </Link>
      </Button>
    </div>
  )
}
