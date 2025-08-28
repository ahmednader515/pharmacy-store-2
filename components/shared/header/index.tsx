import Image from "next/image";
import Link from "next/link";
import { getAllCategories } from "@/lib/actions/product.actions";
import { auth } from "@/auth";
import Search from "./search";
import Menu from "./menu";
import Sidebar from "./sidebar";
import data from "@/lib/data";
import { ShoppingCart, User, Package, Home, Shield } from "lucide-react";

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
      {/* Main Header - Clean Design */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            {/* Hamburger Menu */}
            <div className="block md:hidden">
              <Sidebar categories={categoryList} />
            </div>
            
            {/* Logo - Centered on mobile */}
            <div className="flex items-center justify-center flex-1 md:flex-none md:justify-start">
              <Link
                href="/"
                className="flex items-center gap-2 sm:gap-3 font-extrabold text-xl sm:text-2xl text-blue-600"
              >
                <Image
                  src={site.logo}
                  width={40}
                  height={40}
                  alt={`${site.name} logo`}
                  className="w-8 h-8 sm:w-10 sm:h-10"
                />
                <span className="block font-bold">{site.name}</span>
              </Link>
            </div>
            
            {/* Search Component - Right side on mobile, hidden on desktop */}
            <div className="block md:hidden">
              <Search />
            </div>
            
            {/* Search Component - Hidden on mobile, shown on desktop */}
            <div className="hidden md:flex items-center justify-center">
              <Search />
            </div>
            
            {/* Desktop Right Side - Cart and Sign In */}
            <div className="hidden md:flex items-center gap-4">
              <Menu />
            </div>
          </div>
          
          {/* Mobile Navigation Icons Row - Simplified */}
          <div className="flex items-center justify-center gap-6 sm:gap-8 mt-4 md:hidden">
            {/* Homepage Button */}
            <Link href="/" className="flex flex-col items-center gap-1">
              <Home className="w-6 h-6 text-gray-600" />
              <span className="text-xs text-gray-600">الرئيسية</span>
            </Link>
            
            {/* Shopping Cart */}
            <Link href="/cart" className="flex flex-col items-center gap-1">
              <div className="relative">
                <ShoppingCart className="w-6 h-6 text-gray-600" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  0
                </span>
              </div>
              <span className="text-xs text-gray-600">السلة</span>
            </Link>
            
            {/* User Actions */}
            {session ? (
              <>
                {/* Account Button */}
                <Link href="/account" className="flex flex-col items-center gap-1">
                  <User className="w-6 h-6 text-gray-600" />
                  <span className="text-xs text-gray-600">حسابي</span>
                </Link>
                
                {/* Orders Button */}
                <Link href="/account/orders" className="flex flex-col items-center gap-1">
                  <Package className="w-6 h-6 text-gray-600" />
                  <span className="text-xs text-gray-600">طلباتي</span>
                </Link>
                
                {/* Admin Button - Only show for Admin users */}
                {session.user.role === 'Admin' && (
                  <Link href="/admin/overview" className="flex flex-col items-center gap-1">
                    <Shield className="w-6 h-6 text-blue-600" />
                    <span className="text-xs text-blue-600 font-medium">الإدارة</span>
                  </Link>
                )}
              </>
            ) : (
              /* Sign In Button */
              <Link href="/sign-in" className="flex flex-col items-center gap-1">
                <User className="w-6 h-6 text-gray-600" />
                <span className="text-xs text-gray-600">تسجيل الدخول</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Categories Section - Hidden on mobile, shown on desktop */}
      <div className="hidden md:block bg-blue-600 text-white">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center">
            <div className="flex items-center justify-center flex-wrap gap-2 lg:gap-4">
              {/* Home Page Link */}
              <Link
                href="/"
                className="px-3 lg:px-4 py-2 rounded-lg bg-white hover:bg-gray-100 text-blue-600 text-sm font-medium transition-colors duration-200 whitespace-nowrap"
              >
                الصفحة الرئيسية
              </Link>
              
              {/* Category Links */}
              {categoryList.slice(0, 7).map((category) => (
                <Link
                  href={`/search?category=${category}`}
                  key={category}
                  className="px-3 lg:px-4 py-2 rounded-lg bg-white hover:bg-gray-100 text-blue-600 text-sm font-medium transition-colors duration-200 whitespace-nowrap"
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
