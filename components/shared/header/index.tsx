import Image from "next/image";
import Link from "next/link";
import { getAllCategories } from "@/lib/actions/product.actions";
import { auth } from "@/auth";
import Search from "./search";
import Menu from "./menu";
import Sidebar from "./sidebar";
import data from "@/lib/data";

// Arabic translations for categories
const categoryTranslations: { [key: string]: string } = {
  'Pain Relief': 'تسكين الآلام',
  'Vitamins & Supplements': 'فيتامينات ومكملات غذائية',
  'Allergy & Sinus': 'الحساسية والجيوب الأنفية',
  'Digestive Health': 'صحة الجهاز الهضمي',
  'Cold & Flu': 'نزلات البرد والإنفلونزا',
  'Prescription Medications': 'الأدوية الموصوفة',
  'Over-the-Counter': 'الأدوية المتاحة بدون وصفة',
  'Personal Care': 'العناية الشخصية',
  'Health & Wellness': 'الصحة والعافية',
  'First Aid': 'الإسعافات الأولية',
  'Baby Care': 'العناية بالطفل',
  'Elderly Care': 'العناية بالمسنين',
  'Diabetes Care': 'العناية بمرضى السكري',
  'Heart Health': 'صحة القلب',
  'Mental Health': 'الصحة النفسية',
  'Women\'s Health': 'صحة المرأة',
  'Men\'s Health': 'صحة الرجل',
  'Skin Care': 'العناية بالبشرة',
  'Hair Care': 'العناية بالشعر',
  'Oral Care': 'العناية بالفم والأسنان'
};

export default async function Header() {
  const categories = await getAllCategories();
  const { site } = data.settings[0];
  const session = await auth();
  
  // Ensure categories is an array of strings
  const categoryList = Array.isArray(categories) ? categories : [];
  
  return (
    <header className="bg-white text-gray-800 font-cairo" dir="rtl">
      {/* Part 1: Top Bar - Greeting */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-center text-sm">
            <div className="text-gray-600">
              مرحباً بك في {site.name} - صيدليتك الموثوقة
            </div>
          </div>
        </div>
      </div>

      {/* Part 2: Main Navbar - Logo, Search, Cart, Sign In */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center">
              <Link
                href="/"
                className="flex items-center gap-3 font-extrabold text-2xl text-blue-600"
              >
                <Image
                  src={site.logo}
                  width={40}
                  height={40}
                  alt={`${site.name} logo`}
                />
                <span className="hidden sm:block">{site.name}</span>
              </Link>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-4">
              <Search />
            </div>
            
            {/* Right Side - Cart and Sign In */}
            <div className="flex items-center gap-4">
              <Menu />
            </div>
          </div>
        </div>
      </div>

      {/* Part 3: Categories Buttons - Centered with Blue Background */}
      <div className="bg-blue-600 text-white">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center">
            {/* Mobile Menu Button */}
            <div className="md:hidden mr-4">
              <Sidebar categories={categoryList} />
            </div>
            
            {/* Categories Buttons */}
            <div className="hidden md:flex items-center justify-center flex-wrap gap-4">
              {/* Home Page Link */}
              <Link
                href="/"
                className="px-4 py-2 rounded-lg bg-white hover:bg-gray-100 text-blue-600 text-sm font-medium transition-colors duration-200 whitespace-nowrap"
              >
                الصفحة الرئيسية
              </Link>
              
              {/* Category Links */}
              {categoryList.slice(0, 7).map((category) => (
                <Link
                  href={`/search?category=${category}`}
                  key={category}
                  className="px-4 py-2 rounded-lg bg-white hover:bg-gray-100 text-blue-600 text-sm font-medium transition-colors duration-200 whitespace-nowrap"
                >
                  {categoryTranslations[category] || category}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
