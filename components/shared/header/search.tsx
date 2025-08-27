import { SearchIcon } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { getAllCategories } from '@/lib/actions/product.actions'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select'
import data from '@/lib/data'

export default async function Search() {
  const {
    site: { name },
  } = data.settings[0];
  const categories = await getAllCategories()

  return (
    <form action='/search' method='GET' className='flex items-stretch h-12' dir="rtl">
      <Select name='category'>
        <SelectTrigger className='w-auto h-full bg-gray-100 text-gray-700 border-l border-gray-300 rounded-r-md rounded-l-none font-cairo'>
          <SelectValue placeholder="جميع الفئات" />
        </SelectTrigger>
        <SelectContent position='popper'>
          <SelectItem value='all'>جميع الفئات</SelectItem>
          {categories.map((category: string) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        className='flex-1 rounded-none bg-gray-100 text-gray-700 text-base h-full border-x-0 font-cairo'
        placeholder={`البحث في ${name}...`}
        name='q'
        type='search'
      />
      <button
        type='submit'
        className='bg-blue-600 hover:bg-blue-700 text-white rounded-l-md rounded-r-none h-full px-4 py-2 transition-colors duration-200'
      >
        <SearchIcon className='w-5 h-5' />
      </button>
    </form>
  )
}
